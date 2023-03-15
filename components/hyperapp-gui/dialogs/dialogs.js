/**
 *     "@osjs/gui": "file:../osjs-gui",
    "deepmerge": "^2.2.1",
    "hyperapp": "^1.2.10",
    "is-plain-object": "^2.0.4"
 */
import {h, app} from '../hyperapp.js';
import merge from 'deepmerge';
import plain from 'is-plain-object';
import {Box, Toolbar, Button, TextareaField, TextField, Progressbar, BoxContainer, RangeField, SelectField, listView, ToggleField} from '../gui.js';


let dialogCount = 0;

/*
 * Default button attributes
 */
const defaultButtons = (_) => ({
  ok: {label: _('LBL_OK'), positive: true},
  close: {label: _('LBL_CLOSE')},
  cancel: {label: _('LBL_CANCEL')},
  yes: {label: _('LBL_YES'), positive: true},
  no: {label: _('LBL_NO')}
});

/*
 * Creates a button from name
 */
const defaultButton = (n, _) => {
  const defs = defaultButtons(_);
  if (defs[n]) {
    return {name: n, ...defs[n]};
  }

  return {label: n, name: n};
};

/*
 * Creates options
 */
const createOptions = (options, args) =>
  merge({
    id: null,
    className: 'unknown',
    defaultValue: null,
    buttons: [],
    sound: null,
    window: {
      id: options.id || 'Dialog_' + String(dialogCount),
      title: 'Dialog',
      attributes: {
        gravity: 'center',
        resizable: false,
        maximizable: false,
        minimizable: false,
        sessionable: false,
        classNames: [
          'osjs-dialog',
          `osjs-${options.className || 'unknown'}-dialog`
        ],
        minDimension: {
          width: 300,
          height: 100
        },
      }
    }
  }, options, {
    isMergeableObject: plain
  });

/**
 * OS.js default Dialog implementation
 *
 * Creates a Window with predefined content and actions(s)
 */
class Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {Object} options Dialog options (including Window)
   * @param {Object} [options.defaultValue] Default callback value
   * @param {Function} callback The callback function
   */
  constructor(core, args, options, callback) {
    this.core = core;
    this.args = args;
    this.callback = callback || function() {};
    this.options = createOptions(options);
    this.win = null;
    this.value = undefined;
    this.calledBack = false;

    const _ = core.make('osjs/locale').translate;

    this.buttons = this.options.buttons.map(n =>
      typeof n === 'string'
        ? defaultButton(n, _)
        : {
          label: n.label || 'button',
          name: n.name || 'unknown'
        });

    dialogCount++;
  }

  /**
   * Destroys the dialog
   */
  destroy() {
    if (this.win) {
      this.win.destroy();
    }

    this.win = null;
    this.callback = null;
  }

  /**
   * Renders the dialog
   * @param {Function} cb Callback from window
   */
  render(options, cb) {
    const opts = merge(this.options.window || {}, options, {
      isMergeableObject: plain
    });

    this.win = this.core.make('osjs/window', opts);

    this.win.on('keydown', (ev, win) => {
      if (ev.keyCode === 27) {
        this.emitCallback(this.getNegativeButton(), null, true);
      }
    });

    this.win.on('dialog:button', (name, ev) => {
      this.emitCallback(name, ev, true);
    });

    this.win.on('destroy', () => {
      this.emitCallback('destroy');
    });

    this.win.on('close', () => {
      this.emitCallback('cancel', undefined, true);
    });

    this.win.on('render', () => {
      // this.win.resizeFit();
      this.win.focus();

      const focusButton = this.getNegativeButton();
      const btn = focusButton ? this.win.$content.querySelector(`button[name=${focusButton}]`) : null;
      if (btn) {
        btn.focus();
      }

      this.playSound();
    });

    this.win.init();
    this.win.render(cb);
    this.win.focus();

    return this;
  }

  /**
   * Creates the default view
   * @param {Object[]} children Child nodes
   * @param {Object} [state] Pass on application state (mainly used for buttons)
   * @return {Object} Virtual dom node
   */
  createView(children, state = {}) {
    return h(Box, {grow: 1, shrink: 1}, [
      ...children,
      h(Toolbar, {class: 'osjs-dialog-buttons'}, [
        ...this.createButtons(state.buttons || {})
      ])
    ]);
  }

  /**
   * Gets the button (virtual) DOM elements
   * @param {Object} [states] Button states
   * @return {Object[]} Virtual dom node children list
   */
  createButtons(states = {}) {
    const onclick = (n, ev) => {
      this.win.emit('dialog:button', n, ev);
    };

    return this.buttons.map(b => h(Button, {disabled: states[b.name] === false,
      onclick: ev => onclick(b.name, ev), ...b}));
  }

  /**
   * Emits the callback
   * @param {String} name Button or action name
   * @param {Event} [ev] Browser event reference
   * @param {Boolean} [close=false] Close dialog
   */
  emitCallback(name, ev, close = false) {
    if (this.calledBack) {
      return;
    }
    this.calledBack = true;

    console.debug('Callback in dialog', name, ev, close);

    this.callback(name, this.getValue(), ev);

    if (close) {
      this.destroy();
    }
  }

  /**
   */
  playSound() {
    if (this.core.has('osjs/sounds')) {
      const snd = this.options.sound;
      if (snd) {
        this.core.make('osjs/sounds').play(snd);

        return true;
      }
    }

    return false;
  }

  /**
   * Gets the first positive button
   * @return {String|undefined}
   */
  getPositiveButton() {
    const found = this.buttons.find(b => b.positive === true);
    return found ? found.name : null;
  }

  /**
   * Gets the first negative button
   * @return {String|undefined}
   */
  getNegativeButton() {
    const found = this.buttons.find(b => !b.positive);
    return found ? found.name : null;
  }

  /**
   * Gets the dialog result value
   * @return {*}
   */
  getValue() {
    return typeof this.value === 'undefined'
      ? this.options.defaultValue
      : this.value;
  }

}


/**
 * Default OS.js Alert Dialog
 */
class AlertDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title='Alert'] Dialog title
   * @param {String} [args.message=''] Dialog message
   * @param {String} [args.type='info'] Alert type (info/warning/error)
   * @param {String} [args.sound='bell'] Sound
   * @param {Error|*} [args.error] When 'alert' type is set this error stack or message will appear in a textbox
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    args = {title: 'Alert',
      type: 'info',
      message: '', ...args};

    if (typeof args.sound === 'undefined') {
      args.sound = args.type === 'error' ? 'bell' : 'message';
    }

    super(core, args, {
      className: 'alert',
      sound: args.sound,
      window: {
        title: args.title,
        attributes: {
          ontop: args.type === 'error',
          minDimension: {
            width: 400,
            height: 220
          }
        }
      },
      buttons: ['close']
    }, callback);
  }

  render(options) {
    super.render(options, ($content) => {
      const children = [
        h('div', {class: 'osjs-dialog-message'}, String(this.args.message))
      ];

      if (this.args.type === 'error') {
        const {error} = this.args;
        const msg = error instanceof Error
          ? (error.stack ? error.stack : error)
          : String(error);

        children.push(h(TextareaField, {value: msg, readonly: true, placeholder: this.args.message}));
      }

      app({}, {}, (state, actions) => this.createView([
        h(Box, {grow: 1}, children)
      ]), $content);
    });
  }

}


/**
 * Default OS.js Confirm Dialog
 */
class ConfirmDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {String} [args.message] Dialog message
   * @param {Boolean} [args.yesno=true] Yes/No or Ok/Cancel
   * @param {String[]} [args.buttons] Custom buttons
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    const yesno = typeof args.yesno === 'undefined' || args.yesno === true;

    const buttons = args.buttons instanceof Array
      ? args.buttons
      : yesno ? ['yes', 'no'] : ['ok', 'cancel'];

    super(core, args, {
      className: 'confirm',
      window: {
        title: args.title || 'Confirm',
        attributes: {
          minDimension: {
            height: 140
          }
        }
      },
      buttons
    }, callback);
  }

  render(options) {
    super.render(options, ($content) => {
      app({}, {}, (state, actions) => this.createView([
        h(Box, {grow: 1}, [
          h('div', {class: 'osjs-dialog-message'}, String(this.args.message))
        ])
      ]), $content);
    });
  }

}


/**
 * Default OS.js Prompt Dialog
 */
class PromptDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {String} [args.message] Dialog message
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    super(core, {value: '',
      placeholder: '', ...args}, {
      className: 'prompt',
      buttons: ['ok', 'cancel'],
      window: {
        title: args.title || 'Prompt',
        attributes: {
          minDimension: {
            width: 500,
            height: 200
          }
        }
      }
    }, callback);

    this.value = this.args.value;
  }

  render(options) {
    super.render(options, ($content) => {
      app({
        value: this.args.value
      }, {
        setValue: value => state => {
          this.value = value;
          return {value};
        }
      }, (state, actions) => this.createView([
        h(Box, {grow: 1, padding: false}, [
          h(Box, {class: 'osjs-dialog-message'}, String(this.args.message)),
          h(TextField, {
            value: state.value,
            placeholder: this.args.placeholder,
            onenter: (ev, value) => {
              actions.setValue(value);

              this.emitCallback(this.getPositiveButton(), ev, true);
            },
            oninput: (ev, value) => actions.setValue(value)
          })
        ])
      ]), $content);
    });
  }

}


/**
 * Default OS.js Progress Dialog
 */
class ProgressDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {String} [args.message] Dialog message
   * @param {String} [args.status] Dialog status message
   * @param {String} [args.progress] Initial progress value
   * @param {String[]} [args.buttons] Override dialog buttons
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    super(core, args, {
      className: 'progress',
      buttons: args.buttons || ['cancel'],
      window: {
        title: args.title || 'Progress',
        attributes: {
          minDimension: {
            width: 500,
            height: 200
          }
        }
      }
    }, callback);

    this.value = this.args.progress || 0;
    this.status = this.args.status || '';
    this.app = null;
  }

  render(options) {
    super.render(options, ($content) => {
      this.app = app({
        progress: this.value,
        status: this.status
      }, {
        setProgress: progress => state => ({progress}),
        setStatus: status => state => ({status})
      }, (state, actions) => this.createView([
        h(Box, {grow: 1, shrink: 1}, [
          h('div', {class: 'osjs-dialog-message'}, String(this.args.message)),
          h('div', {class: 'osjs-dialog-status'}, String(state.status)),
          h(Progressbar, {value: state.progress})
        ])
      ]), $content);
    });
  }

  /**
   * Set the progress value
   * @param {Number} value A value between 0 and 100
   */
  setProgress(value) {
    this.app.setProgress(value);
  }

  /**
   * Set the status text
   * @param {String} status Status text
   */
  setStatus(status) {
    this.app.setStatus(status);
  }

}


/*
 * Creates a palette canvas
 */
const createPalette = (width, height) => {
  let gradient;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  gradient.addColorStop(0,    'rgb(255,   0,   0)');
  gradient.addColorStop(0.15, 'rgb(255,   0, 255)');
  gradient.addColorStop(0.33, 'rgb(0,     0, 255)');
  gradient.addColorStop(0.49, 'rgb(0,   255, 255)');
  gradient.addColorStop(0.67, 'rgb(0,   255,   0)');
  gradient.addColorStop(0.84, 'rgb(255, 255,   0)');
  gradient.addColorStop(1,    'rgb(255,   0,   0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0,   'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, 'rgba(0,     0,   0, 0)');
  gradient.addColorStop(1,   'rgba(0,     0,   0, 1)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  return canvas;
};

/*
 * Converts hex to its component values
 */
const hexToComponent = hex => {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const val = {};
  val.r = (rgb & (255 << 16)) >> 16;
  val.g = (rgb & (255 << 8)) >> 8;
  val.b = (rgb & 255);
  return val;
};

/*
 * Convert component values into hex
 */
const componentToHex = ({r, g, b}) => {
  const hex = [
    parseInt(r, 10).toString(16),
    parseInt(g, 10).toString(16),
    parseInt(b, 10).toString(16)
  ].map(i => String(i).length === 1 ? '0' + String(i) : i);

  return '#' + hex.join('').toUpperCase();
};

/*
 * Gets the color of a clicked palette area
 */
const colorFromClick = (ev, canvas) => {
  const {clientX, clientY} = ev;
  const box = canvas.getBoundingClientRect();
  const cx = clientX - box.x;
  const cy = clientY - box.y;
  const ctx = canvas.getContext('2d');
  const {data} = ctx.getImageData(cx, cy, 1, 1);
  const [r, g, b] = data;
  const hex = componentToHex({r, g, b});
  return {r, g, b, hex};
};

/**
 * Default OS.js Color Dialog
 */
class ColorDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    super(core, args, {
      className: 'color',
      buttons: ['ok', 'cancel'],
      window: {
        title: args.title || 'Select Color',
        attributes: {
          minDimension: {
            width: 500,
            height: 260
          }
        }
      }
    }, callback);

    this.value = {r: 0, g: 0, b: 0, hex: '#000000'};

    let color = args.color;
    if (color) {
      if (typeof color === 'string') {
        if (color.charAt(0) !== '#') {
          color = '#' + color;
        }

        this.value = {...this.value, ...hexToComponent(args.color)};
        this.value.hex = args.color;
      } else {
        this.value = {...this.value, ...args.color};
        this.value.hex = componentToHex(this.value);
      }
    }
  }

  render(options) {
    super.render(options, ($content) => {
      const canvas = createPalette(98, 98);
      const initialState = {...this.value};
      const initialActions = {
        setColor: color => state => color,
        setComponent: ({color, value}) => state => {
          this.value[color] = value;
          return {[color]: value};
        },
        updateHex: () => state => {
          const hex = componentToHex(state);
          this.value.hex = hex;
          return {hex};
        }
      };

      const rangeContainer = (c, v, actions) =>
        h(Box, {orientation: 'vertical', align: 'center', padding: false}, [
          h(Box, {shrink: 1}, h('div', {}, c.toUpperCase())),
          h(RangeField, {
            box: {grow: 1},
            min: 0,
            max: 255,
            value: v,
            oncreate: el => (el.value = v),
            oninput: (ev, value) => {
              actions.setComponent({color: c, value});
              actions.updateHex();
            }
          }),
          h(TextField, {
            box: {shrink: 1, basis: '5em'},
            value: String(v),
            oninput: (ev, value) => {
              actions.setComponent({color: c, value});
              actions.updateHex();
            }
          })
        ]);

      const a = app(initialState, initialActions, (state, actions) => this.createView([
        h(Box, {orientation: 'vertical', grow: 1, shrink: 1}, [
          h(BoxContainer, {orientation: 'horizontal'}, [
            h('div', {
              class: 'osjs-gui-border',
              style: {display: 'inline-block'},
              oncreate: el => el.appendChild(canvas)
            }),
            h(TextField, {
              value: state.hex,
              style: {width: '100px', color: state.hex}
            })
          ]),
          h(Box, {padding: false, grow: 1, shrink: 1}, [
            rangeContainer('r', state.r, actions),
            rangeContainer('g', state.g, actions),
            rangeContainer('b', state.b, actions)
          ])
        ])
      ]), $content);

      canvas.addEventListener('click', ev => {
        const color = colorFromClick(ev, canvas);
        if (color) {
          a.setColor(color);
          a.updateHex();
        }
      });
    });
  }

}


/**
 * Default OS.js Font Dialog
 */
class FontDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {number} [args.minSize=6] Minimum size
   * @param {number} [args.maxSize] Maximum size
   * @param {string} [args.unit=px] Unit
   * @param {string} [args.name] Initial font name
   * @param {number} [args.size] Initial font size
   * @param {string} [args.text] What text to preview
   * @param {string[]} [args.controls] What controls to show
   * @param {string[]} [args.fonts] List of fonts
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    args = {title: 'Choose Font',
      minSize: 6,
      maxSize: 48,
      unit: 'px',
      name: 'Roboto',
      size: 10,
      style: 'regular',
      text: 'The quick brown fox jumps over the lazy dog',
      controls: ['size', 'name', 'style'],
      fonts: [
        'Roboto',
        'arial',
        'sans-serif',
        'monospace'
      ], ...args};

    super(core, args, {
      className: 'info',
      window: {
        title: args.title,
        attributes: {
          minDimension: {
            width: 400,
            height: 200
          }
        }
      },
      buttons: ['ok', 'cancel']
    }, callback);

    this.value = {
      name: this.args.name,
      size: this.args.size,
      style: this.args.style
    };
  }

  render(options) {
    const fontSizes = Array(this.args.maxSize - this.args.minSize)
      .fill(0)
      .map((v, i) => this.args.minSize + i)
      .reduce((o, i) => Object.assign(o, {[i]: i}), {});

    const fontNames = this.args.fonts
      .reduce((o, i) => {
        const k = i.toLowerCase();
        return Object.assign(o, {[k]: i});
      }, {});

    const fontStyles = {
      'regular': 'Regular',
      'bold': 'Bold',
      'italic': 'Italic'
    };

    const initialState = {...this.value};
    const initialActions = {
      setSize: size => state => {
        this.value.size = size;
        return {size};
      },
      setFont: name => state => {
        this.value.name = name;
        return {name};
      },
      setStyle: style => state => {
        this.value.style = style;
        return {style};
      }
    };

    super.render(options, ($content) => {
      app(initialState, initialActions, (state, actions) => this.createView([
        h(Toolbar, {}, [
          h(SelectField, {
            box: {grow: 1, style: {display: this.args.controls.indexOf('size') !== -1 ? 'flex' : 'none'}},
            value: state.size,
            choices: fontSizes,
            onchange: (ev, v) => actions.setSize(v)
          }),
          h(SelectField, {
            box: {grow: 1, style: {display: this.args.controls.indexOf('name') !== -1 ? 'flex' : 'none'}},
            value: state.name.toLowerCase(),
            choices: fontNames,
            onchange: (ev, v) => actions.setFont(v)
          }),
          h(SelectField, {
            box: {grow: 1, style: {display: this.args.controls.indexOf('style') !== -1 ? 'flex' : 'none'}},
            value: state.size,
            choices: fontStyles,
            onchange: (ev, v) => actions.setStyle(v)
          })
        ]),
        h(TextareaField, {
          box: {grow: 1},
          value: this.args.text,
          style: {
            fontFamily: state.name,
            fontSize: `${state.size}${this.args.unit}`,
            fontWeight: state.style === 'bold' ? 'bold' : 'normal',
            fontStyle: state.style !== 'bold' ? state.style : 'normal',
            height: '4rem',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }
        })
      ]), $content);
    });
  }

}


const getMountpoint = str => str
  .split(':')[0] + ':/';

const getMountpoints = core => core.make('osjs/fs')
  .mountpoints(true)
  .filter(mount => {
    return !(mount.attributes.readOnly && mount.attributes.visibility === 'restricted');
  })
  .reduce((mounts, iter) => Object.assign(mounts, {
    [iter.root]: iter.label
  }), {});

/**
 * Default OS.js File Dialog
 */
class FileDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {String} [args.type='open'] Dialog type (open/save)
   * @param {String} [args.path] Current path
   * @param {String} [args.filetype='file'] Dialog filetype (file/directory)
   * @param {String} [args.filename] Current filename
   * @param {String[]} [args.mime] Mime filter
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    args = {title: null,
      type: 'open',
      filetype: 'file',
      path: core.config('vfs.defaultPath'),
      filename: null,
      mime: [], ...args};

    if (typeof args.path === 'string') {
      args.path = {path: args.path};
    }

    try {
      args.path = {isDirectory: true,
        filename: args.path.path.split(':/')[1].split('/').pop() || '', ...args.path};
    } catch (e) {
      console.warn(e);
    }

    const _ = core.make('osjs/locale').translate;
    const title = args.title
      ? args.title
      : (args.type === 'open' ? _('LBL_OPEN') : _('LBL_SAVE'));

    super(core, args, {
      className: 'file',
      window: {
        title,
        attributes: {
          resizable: true
        },
        dimension: {
          width: 400,
          height: 400
        }
      },
      buttons: ['ok', 'cancel']
    }, callback);
  }

  render(options) {
    const getFileIcon = file => this.core.make('osjs/fs').icon(file);
    const startingLocation = this.args.path;

    super.render(options, ($content) => {
      const a = app({
        mount: startingLocation ? getMountpoint(startingLocation.path) : null,
        filename: this.args.filename,
        listview: listView.state({
          columns: [{
            label: 'Name'
          }, {
            label: 'Type'
          }, {
            label: 'Size'
          }]
        }),
        buttons: {
          ok: this.args.type === 'open' && this.args.filetype === 'directory'
            ? true
            : !!this.args.filename
        }
      }, {
        _readdir: ({path, files}) => (state, actions) => {
          const listview = state.listview;
          listview.selectedIndex = -1;
          listview.rows = files.map(file => ({
            columns: [{
              label: file.filename,
              icon: getFileIcon(file)
            }, file.mime, file.humanSize],
            data: file
          }));

          return {path, listview};
        },

        setButtonState: btn => state => ({
          buttons: {...state.buttons, ...btn}
        }),

        setMountpoint: mount => (state, actions) => {
          actions.setPath({path: mount});

          return {mount};
        },

        setPath: file => async (state, actions) => {
          const files = await this.core.make('osjs/vfs')
            .readdir(file, {
              filter: (item) => {
                if (this.args.filetype === 'directory') {
                  return item.isDirectory === true;
                } else if (this.args.mime.length) {
                  return item.mime
                    ? this.args.mime.some(test => (new RegExp(test)).test(item.mime))
                    : true;
                }

                return true;
              }
            });

          this.args.path = file;

          actions._readdir({path: file.path, files});

          if (this.args.filetype === 'file') {
            actions.setButtonState({ok: this.args.type === 'save' ? !!this.args.filename : false});
          }
        },

        setFilename: filename => state => ({filename}),

        listview: listView.actions({
          select: ({data}) => {
            if (data.isFile) {
              a.setFilename(data.filename);
            }
            this.value = data.isFile ? data : null;

            if (this.args.filetype === 'file' && data.isFile) {
              a.setButtonState({ok: true});
            }
          },
          activate: ({data, ev}) => {
            if (data.isDirectory) {
              a.setPath(data);
            } else {
              this.value = data.isFile ? data : null;
              this.emitCallback(this.getPositiveButton(), ev, true);
            }
          },
        })
      }, (state, actions) => this.createView([
        h(SelectField, {
          choices: getMountpoints(this.core),
          onchange: (ev, val) => a.setMountpoint(val),
          value: state.mount
        }),
        h(listView.component({box: {grow: 1, shrink: 1}, ...state.listview}, actions.listview)),
        h(TextField, {
          placeholder: this.args.filetype === 'directory' ? 'Directory Name' : 'File Name',
          value: state.filename,
          onenter: (ev, value) => this.emitCallback(this.getPositiveButton(), ev, true),
          oninput: (ev) => {
            const filename = ev.target.value;
            actions.setButtonState({ok: !!filename});
            actions.setFilename(filename);
          },
          box: {
            style: {display: this.args.type === 'save' ? null : 'none'}
          }
        })
      ], state), $content);

      a.setPath(startingLocation);
    });
  }

  emitCallback(name, ev, close = false) {
    if (this.calledBack) {
      return;
    }

    const file = this.getValue();
    const next = () => super.emitCallback(name, ev, close);
    const isSave = this.args.type === 'save';
    const buttonCancel = name === 'cancel';
    const hasVfs = this.core.has('osjs/vfs');

    const confirm = callback => this.core.make('osjs/dialog', 'confirm', {
      message: `Do you want to overwrite ${file.path}?`
    }, {
      parent: this.win,
      attributes: {modal: true}
    }, (btn) => {
      if (btn === 'yes') {
        callback();
      }
    });

    if (file && isSave && hasVfs && !buttonCancel) {
      this.core
        .make('osjs/vfs')
        .exists(file)
        .then(exists => {
          if (exists) {
            confirm(() => next());
          } else {
            next();
          }
        })
        .catch(error => {
          console.error(error);
          next();
        });
    } else {
      next();
    }
  }

  getValue() {
    if (this.args.type === 'save') {
      const {path} = this.args.path;
      const filename = this.win.$content.querySelector('input[type=text]')
        .value;

      return filename
        ? ({...this.args.path, filename,
          path: path.replace(/\/?$/, '/') + filename})
        : undefined;
    } else {
      if (this.args.filetype === 'directory') {
        return this.args.path;
      }
    }

    return super.getValue();
  }

}


/**
 * Default OS.js Choice Dialog
 */
class ChoiceDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {String} [args.message] Dialog message
   * @param {String} [args.value] Set default selected value
   * @param {Map<String,*>} [args.choices] Choice map
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    args = {title: 'Choice',
      message: '',
      value: undefined,
      choices: {}, ...args};

    super(core, args, {
      className: 'alert',
      window: {
        title: args.title,
        attributes: {
          ontop: args.type === 'error'
        },
        dimension: {
          width: 400,
          height: 200
        }
      },
      buttons: ['ok', 'close']
    }, callback);

    this.value = typeof args.value !== 'undefined'
      ? this.args.value
      : Object.keys(this.args.choices)[0];
  }

  render(options) {
    super.render(options, ($content) => {
      app({
        current: this.value
      }, {
        setCurrent: current => state => {
          this.value = current;

          return {current};
        }
      }, (state, actions) => this.createView([
        h(Box, {grow: 1}, [
          h('div', {class: 'osjs-dialog-message'}, String(this.args.message)),
          h(SelectField, {
            choices: this.args.choices,
            value: state.current,
            onchange: (ev, val) => actions.setCurrent(val)
          })
        ])
      ]), $content);
    });
  }

}


/**
 * Default OS.js DefaultApplication Dialog
 */
class DefaultApplicationDialog extends Dialog {

  /**
   * Constructor
   * @param {Core} core OS.js Core reference
   * @param {Object} args Arguments given from service creation
   * @param {String} [args.title] Dialog title
   * @param {String} [args.message] Dialog message
   * @param {*} [args.checked] Default checked state
   * @param {*} [args.value] Default value
   * @param {Map<String,*>} [args.choices] DefaultApplication map
   * @param {Function} callback The callback function
   */
  constructor(core, args, callback) {
    args = {title: 'DefaultApplication',
      message: '',
      choices: {}, ...args};

    super(core, args, {
      className: 'alert',
      window: {
        title: args.title,
        dimension: {
          width: 400,
          height: 200
        }
      },
      buttons: ['ok', 'close']
    }, callback);

    this.value = {
      value: args.value || Object.keys(this.args.choices)[0],
      checked: args.checked === true
    };

  }

  render(options) {
    const setLocalState = (oldState, newState) => {
      const state = {...oldState, ...newState};
      this.value = state;
      return state;
    };

    super.render(options, ($content) => {
      app(this.value, {
        setValue: value => state => setLocalState(state, {value}),
        setChecked: checked => state => setLocalState(state, {checked})
      }, (state, actions) => this.createView([
        h(Box, {grow: 1}, [
          h('div', {class: 'osjs-dialog-message'}, String(this.args.message)),
          h(SelectField, {
            choices: this.args.choices,
            value: state.value,
            onchange: (ev, val) => actions.setValue(val)
          }),
          h(ToggleField, {
            label: this.args.label || 'Use as default',
            checked: state.checked,
            onchange: (ev, val) => actions.setChecked(val)
          })
        ])
      ]), $content);
    });
  }

}


/**
 * Custom OS.js Dialog
 */
class CustomDialog extends Dialog {

  constructor(core, options, valueCallback, callback) {
    super(core, {}, options, callback);

    this.valueCallback = valueCallback;
  }

  render(render) {
    return super.render({}, ($content, win) => render($content, win, this));
  }

  renderCustom(render, styles = {}) {
    return this.render(($content, dialogWindow, dialog) => {
      app({}, {}, () => {
        return this.createView([
          h('div', {
            style: {
              'flex-grow': 1,
              'flex-shrink': 1,
              position: 'relative',
              ...styles
            },
            oncreate: $el => render($el, dialogWindow, dialog)
          })
        ]);
      }, $content);
    });
  }

  getValue() {
    return this.valueCallback(this);
  }

}


class DialogServiceProvider {

  constructor(core, args = {}) {
    this.core = core;
    this.registry = {alert: AlertDialog,
      confirm: ConfirmDialog,
      prompt: PromptDialog,
      progress: ProgressDialog,
      color: ColorDialog,
      font: FontDialog,
      file: FileDialog,
      choice: ChoiceDialog,
      defaultApplication: DefaultApplicationDialog, ...args.registry || {}};
  }

  destroy() {
  }

  async init() {
    this.core.instance('osjs/dialog', (name, args = {}, ...eargs) => {
      const options = eargs.length > 1 ? eargs[0] : {};
      const callback = eargs[eargs.length > 1 ? 1 : 0];

      if (!this.registry[name]) {
        throw new Error(`Dialog '${name}' does not exist`);
      }

      if (typeof callback !== 'function') {
        throw new Error('Dialog requires a callback');
      }

      const instance = new this.registry[name](this.core, args, callback);
      instance.render(options);
      return instance;
    });

    this.core.singleton('osjs/dialogs', () => ({
      create: (options, valueCallback, callback) => {
        return new CustomDialog(this.core, options, valueCallback, callback);
      },

      register: (name, classRef) => {
        if (this.registry[name]) {
          console.warn('Overwriting previously registered dialog', name);
        }

        this.registry[name] = classRef;
      }
    }));
  }

  start() {
  }

}

export {AlertDialog, ChoiceDialog, ColorDialog, ConfirmDialog, Dialog, DialogServiceProvider, FileDialog, ProgressDialog, PromptDialog};
