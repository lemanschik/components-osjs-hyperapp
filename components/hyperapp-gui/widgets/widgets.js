import merge from 'deepmerge';


const en_EN = {
  LBL_ADD: 'Add Widget',
  LBL_REMOVE: 'Remove Widget',
  WIDGET_DIGITALCLOCK: 'Digital Clock'
};

const nb_NO = {
  LBL_ADD: 'Legg til Widget',
  LBL_REMOVE: 'Fjern Widget',
  WIDGET_DIGITALCLOCK: 'Digitalklokke'
};

const fa_FA = {
  LBL_ADD: 'افزودن ابزارک',
  LBL_REMOVE: 'حذف ابزارک',
  WIDGET_DIGITALCLOCK: 'ساعت دیجیتال'
};

let translations = /* #__PURE__*/Object.freeze({
  __proto__: null,
  en_EN: en_EN,
  nb_NO: nb_NO,
  fa_FA: fa_FA
});


const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const DEFAULT_MARGIN = 15;
const EMIT_TIMEOUT = 44;
const isNull = val => typeof val === 'undefined' || val === null;

const getPosition = (core, position, nullValue = null) => {
  const rect = core.destroyed
    ? {}
    : core.make('osjs/desktop').getRect();

  let {top, left, right, bottom} = position;

  if (isNull(left) && isNull(right)) {
    left = rect.left + DEFAULT_MARGIN;
  } else if (!isNull(left)) {
    right = nullValue;
  } else {
    left = nullValue;
  }

  if (isNull(top) && isNull(bottom)) {
    top = rect.top + DEFAULT_MARGIN;
  } else if (!isNull(top)) {
    bottom = nullValue;
  } else {
    top = nullValue;
  }

  return {top, left, right, bottom};
};

const animator = (fps, stopFn) => {
  const interval = 1000 / fps;
  let last = performance.now();

  const animate = (cb) => {
    const now = performance.now();
    const elapsed = now - last;

    if (elapsed > interval) {
      last = now - (elapsed % interval);

      cb();
    }

    if (!stopFn()) {
      requestAnimationFrame(() => animate(cb));
    }
  };

  return animate;
};

const onmousedown = (ev, $root, widget) => {
  let debounce;
  const startX = ev.clientX;
  const startY = ev.clientY;
  const startPosition = {
    left: widget.$element.offsetLeft,
    top: widget.$element.offsetTop
  };
  const startDimension = {...widget.options.dimension};
  const resize = ev.target.classList.contains('osjs-widget-resize');
  const {minDimension, maxDimension} = widget.attributes;

  const mousemove = ev => {
    const diffX = ev.clientX - startX;
    const diffY = ev.clientY - startY;

    // TODO: Aspect Ratio

    clearTimeout(debounce);

    if (resize) {
      let newWidth = startDimension.width + diffX;
      let newHeight = startDimension.height + diffY;
      newWidth = Math.min(maxDimension.width, Math.max(minDimension.width, newWidth));
      newHeight = Math.min(maxDimension.height, Math.max(minDimension.height, newHeight));

      widget.options.dimension.width = newWidth;
      widget.options.dimension.height = newHeight;
      widget.updateDimension();
      debounce = setTimeout(() => widget.onResize(), EMIT_TIMEOUT);
    } else {
      widget.options.position.top = startPosition.top + diffY;
      widget.options.position.left = startPosition.left + diffX;
      widget.updatePosition();
      debounce = setTimeout(() => widget.onMove(), EMIT_TIMEOUT);
    }
  };

  const mouseup = ev => {
    window.removeEventListener('mousemove', mousemove);
    window.removeEventListener('mouseup', mouseup);

    widget.$element.classList.remove('active');
    $root.setAttribute('data-window-action', String(false));

    widget.saveSettings();
  };

  window.addEventListener('mousemove', mousemove);
  window.addEventListener('mouseup', mouseup);

  widget.$element.classList.add('active');
  $root.setAttribute('data-window-action', String(true));
};

const clampPosition = (rect, {dimension, position}) => {
  const maxLeft = rect.width - dimension.width;
  const maxTop = rect.height - dimension.height;

  return {
    left: Math.max(0, Math.min(maxLeft, position.left)),
    top: Math.max(0, Math.max(rect.top, Math.min(maxTop, position.top)))
  };
};

class Widget {

  /**
   * @param {Object} options The options from the provider create function (usually settings storage result)
   * @param {Object} [attrs] Widget attributes
   * @param {Object} [settings] A set of defaults for the settings storage
   */
  constructor(core, options, attrs = {}, settings = {}) {
    this.core = core;
    this.dialog = null;
    this.$element = document.createElement('div');
    this.$canvas = document.createElement('canvas');
    this.context = this.$canvas.getContext('2d');
    this.destroyed = false;
    this.saveDebounce = null;
    this.attributes = {
      aspect: false,
      canvas: true,
      fps: 1,
      position: {
        top: null,
        left: null,
        right: null,
        bottom: null,
      },
      dimension: {
        width: MIN_WIDTH,
        height: MIN_HEIGHT,
      },
      minDimension: null,
      maxDimension: {
        width: MAX_WIDTH,
        height: MAX_HEIGHT
      }, ...attrs};

    if (this.attributes.minDimension === null) {
      this.attributes.minDimension = {
        width: MIN_WIDTH,
        height: MIN_HEIGHT,
        ...this.attributes.dimension
      };
    }

    if (this.attributes.aspect === true) {
      const {width, height} = this.attributes.dimension;
      const {maxDimension} = this.attributes;
      const aspect = width / height;

      this.attributes.aspect = aspect;
      this.attributes.minDimension.height = width / aspect;
      this.attributes.maxDimension.height = maxDimension.width * aspect;
    }

    this.options = {
      position: {...this.attributes.position},
      dimension: {...this.attributes.dimension},
      ...settings,
      ...options
    };
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.onDestroy();

    this.saveDebounce = clearTimeout(this.saveDebounce);

    if (this.dialog) {
      this.dialog.destroy();
    }

    if (this.$element) {
      if (this.$element.parentNode) {
        this.$element.remove();
      }
    }

    this.$canvas = null;
    this.$element = null;
    this.context = null;
    this.dialog = null;
    this.options = {};
    this.attributes = {};
  }

  /**
   * @param {Object} options
   * @param {number} options.width
   * @param {number} options.height
   * @param {HTMLCanvasElement} options.canvas
   * @param {CanvasRenderingContext2D} options.context
   */
  render(viewport) {
  }

  start() {
    const render = () => this.render({
      width: this.options.dimension.width,
      height: this.options.dimension.height,
      canvas: this.$canvas,
      context: this.context
    });

    this.updateDimension();
    this.updatePosition();
    this.onResize();
    this.onMove();

    render();

    if (this.attributes.canvas) {
      animator(this.attributes.fps, () => this.destroyed)(() => render());
    }

    setTimeout(() => this.clampToViewport(), 100);
  }

  init() {
    const $root = this.core.$contents;
    const resizer = document.createElement('div');
    resizer.classList.add('osjs-widget-resize');

    this.$element.appendChild(resizer);
    this.$element.addEventListener('mousedown', ev => onmousedown(ev, $root, this));
    this.$element.addEventListener('contextmenu', ev => this.onContextMenu(ev));
    this.$element.classList.add('osjs-widget');
    $root.appendChild(this.$element);

    if (this.attributes.canvas) {
      this.$element.appendChild(this.$canvas);
    }

    this.start();
  }

  updateDimension() {
    if (this.destroyed) {
      return;
    }

    const {width, height} = this.options.dimension;
    this.$element.style.width = String(width) + 'px';
    this.$element.style.height = String(height) + 'px';
    this.$canvas.width = width;
    this.$canvas.height = height;
  }

  updatePosition() {
    if (this.destroyed) {
      return;
    }

    const {left, right, top, bottom} = getPosition(this.core, this.options.position, 'auto');
    const getValue = val => typeof val === 'string' ? val : `${val}px`;

    this.$element.style.left = getValue(left);
    this.$element.style.right = getValue(right);
    this.$element.style.top = getValue(top);
    this.$element.style.bottom = getValue(bottom);
  }

  saveSettings() {
    this.saveDebounce = clearTimeout(this.saveDebounce);
    this.saveDebounce = setTimeout(() => this.core.make('osjs/widgets').save(), 100);
  }

  getContextMenu() {
    return [];
  }

  onDestroy() {
  }

  onResize() {
  }

  onMove() {
  }

  onContextMenu(ev) {
    const __ = this.core
      .make('osjs/locale')
      .translatable(translations);

    const menu = [
      ...this.getContextMenu(),
      {
        label: __('LBL_REMOVE'),
        onclick: () => {
          this.core.make('osjs/widgets')
            .remove(this);

          this.core.make('osjs/widgets')
            .save();
        }
      }
    ];

    this.core.make('osjs/contextmenu').show({
      position: ev,
      menu
    });
  }

  _createDialog(options, callbackRender, callbackValue) {
    if (this.dialog) {
      return false;
    }

    const callbackButton = (btn, options) => {
      if (btn === 'ok') {
        this.options = merge(this.options, options);
        this.saveSettings();
      }
    };

    const dialogOptions = {
      buttons: ['ok', 'cancel'],
      window: options || {}
    };

    this.dialog = this.core.make('osjs/dialogs')
      .create(dialogOptions, callbackValue, callbackButton)
      .render(callbackRender);

    this.dialog.win.on('destroy', () => (this.dialog = null));

    return this.dialog;
  }

  clampToViewport() {
    const {top, left} = this.options.position;
    const rect = this.core.make('osjs/desktop').getRect();
    const pos = clampPosition(rect, this.options);

    if (pos.left !== left || pos.top !== top) {
      this.options.position = {...pos};
      this.updatePosition();
    }
  }

  static metadata() {
    return {
      title: undefined
    };
  }
}


const getFont = (fontFamily, size) => String(size) + 'px ' + fontFamily;

const getTime = now => [
  now.getHours(),
  now.getMinutes(),
  now.getSeconds()
]
  .map(int => String(int).padStart(2, '0'))
  .join(':');

const getFontSize = (fontFamily, initialSize, maxWidth, context) => {
  const txt = '99:99:99';

  let size = initialSize;
  while (size > 0) {
    context.font = getFont(fontFamily, size);

    const measuredWidth = context.measureText(txt).width;
    if (measuredWidth < maxWidth) {
      break;
    }

    size--;
  }

  return size;
};

class DigitalClockWidget extends Widget {

  constructor(core, options) {
    super(core, options, {
      dimension: {
        width: 300,
        height: 50
      }
    }, {
      fontFamily: 'Monospace',
      fontColor: '#ffffff'
    });

    this.$tmpCanvas = document.createElement('canvas');
    this.tmpContext = this.$tmpCanvas.getContext('2d');
  }

  compute() {
    const {fontFamily, fontColor} = this.options;
    const {width, height} = this.$canvas;
    const {$tmpCanvas, tmpContext} = this;
    const size = getFontSize(fontFamily, height, width, tmpContext);

    $tmpCanvas.width = width;
    $tmpCanvas.height = size;

    tmpContext.font = getFont(fontFamily, size);
    tmpContext.fillStyle = fontColor;
    tmpContext.textAlign = 'center';
    tmpContext.textBaseline = 'middle';
  }

  onResize() {
    this.compute();
  }

  render({context, width, height}) {
    const {$tmpCanvas, tmpContext} = this;
    const tmpWidth = $tmpCanvas.width;
    const tmpHeight = $tmpCanvas.height;
    const x = (width / 2) - (tmpWidth / 2);
    const y = (height / 2) - (tmpHeight / 2);
    const text = getTime(new Date());

    tmpContext.clearRect(0, 0, tmpWidth, tmpHeight);
    tmpContext.fillText(text, tmpWidth / 2, tmpHeight / 2);
    context.clearRect(0, 0, width, height);
    context.drawImage($tmpCanvas, x, y, tmpWidth, tmpHeight);
  }

  getContextMenu() {
    return [{
      label: 'Set Color',
      onclick: () => this.createColorDialog()
    }, {
      label: 'Set Font',
      onclick: () => this.createFontDialog()
    }];
  }

  createFontDialog() {
    this.core.make('osjs/dialog', 'font', {
      name: this.options.fontFamily,
      controls: ['name']
    }, (btn, value) => {
      if (btn === 'ok') {
        this.options.fontFamily = value.name;
        this.compute();
        this.saveSettings();
      }
    });
  }

  createColorDialog() {
    this.core.make('osjs/dialog', 'color', {
      color: this.options.fontColor
    }, (btn, value) => {
      if (btn === 'ok') {
        this.options.fontColor = value.hex;
        this.compute();
        this.saveSettings();
      }
    });
  }

  static metadata() {
    return {
      ...super.metadata(),
      title: 'WIDGET_DIGITALCLOCK'
    };
  }
}


/**
 * Widget Service Provider
 *
 * @desc Provides methods to handle widgets on a desktop in OS.js
 */
class WidgetServiceProvider {

  constructor(core, args = {}) {
    this.core = core;
    this.widgets = [];
    this.inited = false;
    this.registry = {digitalclock: DigitalClockWidget, ...args.registry || {}};
  }

  destroy() {
    this.widgets.forEach(({widget}) => widget.destroy());
    this.widgets = [];
  }

  async init() {
    const iface = {
      register: (name, classRef) => {
        if (this.registry[name]) {
          console.warn('Overwriting previously registered widget item', name);
        }

        this.registry[name] = classRef;
      },

      removeAll: () => {
        this.widgets.forEach(({widget}) => widget.destroy());
        this.widgets = [];
      },

      remove: (widget) => {
        const index = typeof widget === 'number'
          ? widget
          : this.widgets.findIndex(w => w.widget === widget);

        if (index >= 0) {
          this.widgets[index].widget.destroy();
          this.widgets.splice(index, 1);
        }
      },

      create: (item) => {
        const ClassRef = this.registry[item.name];
        const widget = new ClassRef(this.core, item.options);
        this.widgets.push({name: item.name, widget});

        if (this.inited) {
          widget.init();
        }

        return widget;
      },

      get: (name) => this.registry[name],

      list: () => Object.keys(this.registry),

      save: () => {
        const settings = this.core.make('osjs/settings');
        const widgets = this.widgets.map(({name, widget}) => ({
          name,
          options: widget.options
        }));

        return Promise.resolve(settings.set('osjs/desktop', 'widgets', widgets))
          .then(() => settings.save());
      }
    };

    this.core.singleton('osjs/widgets', () => iface);

    this.core.on('osjs/desktop:transform', () => {
      this.widgets.forEach(({widget}) => widget.updatePosition(true));
    });
  }

  start() {
    this.inited = true;
    this.widgets.forEach(({widget}) => widget.init());

    const desktop = this.core.make('osjs/desktop');
    const __ = this.core
      .make('osjs/locale')
      .translatable(translations);

    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => this._clampWidgets(), 200);
    });

    if (typeof desktop.addContextMenuEntries === 'function') {
      desktop.addContextMenuEntries(() => {
        const widgets = this.core.make('osjs/widgets');

        return [{
          label: __('LBL_ADD'),
          items: widgets.list().map(t => {
            const classRef = this.registry[t];
            const metadata = classRef.metadata(this.core);

            return {
              label: metadata.title ? __(metadata.title) : t,
              onclick: () => {
                widgets.create({name: t});
                widgets.save();
              }
            };
          })
        }];
      });
    }

    this._clampWidgets();
  }

  _clampWidgets(resize) {
    if (resize && !this.core.config('windows.clampToViewport')) {
      return;
    }

    this.widgets.forEach(w => w.widget.clampToViewport());
  }
}

export {DigitalClockWidget, Widget, WidgetServiceProvider};
