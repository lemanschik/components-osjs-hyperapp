import { h, nestable, app } from './hyperapp.js';

/**
 * Elemet Box definition
 * @property {string} [class] Container class name
 * @property {number} [grow] Flexbox grow value
 * @property {number} [shrink] Flexbox shrink value
 * @property {number|string} [basis] Flexbox basis value
 * @property {string} [align] Flexbox alignItems value
 * @property {string} [justify] Flexbox justifyContent value
 * @property {number|string} [padding] Margin
 * @property {number|string} [margin] Margin
 * @property {string} [key] Hyperapp element key
 * @property {Function} [oncreate] Hyperapp oncreate function
 * @property {Function} [onupdate] Hyperapp onupdate function
 * @property {Function} [ondestroy] Hyperapp ondestroy function
 * @typedef BoxProperties
 */

const unitValue = (value, unset) => typeof value === 'number'
  ? `${value}px`
  : (value === false ? unset : value);

const boxPropNames = {
  grow: value => ({flexGrow: value}),
  shrink: value => ({flexShrink: value}),
  basis: value => ({flexBasis: unitValue(value, 'auto')}),
  align: value => ({alignItems: value}),
  justify: value => ({justifyContent: value}),
  padding: value => ({margin: unitValue(value, '0')}),
  margin: value => ({margin: unitValue(value, '0')})
};

/**
 * A generic OS.js GUI container
 * @param {Object} props Properties
 * @param {h[]} children Children
 */
const Element$1 = (props, children = []) => {
  const givenClassNames = props.class instanceof Array
    ? props.class
    : [props.class];

  const classNames = [
    'osjs-gui',
    ...givenClassNames
  ];

  if (props.orientation) {
    classNames.push('osjs-gui-' + props.orientation);
  }

  const defaultStyle = typeof props.style === 'string'
    ? {}
    : Object.assign({}, props.style || {});

  const style = Object.keys(props).reduce((result, prop) => {
    const value = boxPropNames[prop]
      ? boxPropNames[prop](props[prop])
      : undefined;

    return Object.assign({}, result, value);
  }, defaultStyle);

  return h('div', {
    oncreate: props.oncreate,
    ondestroy: props.ondestroy,
    class: classNames.filter(s => !!s).join(' '),
    style
  }, children);
};



/**
 * A flexbox
 * @param {BoxProperties} props Properties
 * @param {string} [props.orientation='horizontal'] Box orientation
 * @param {h[]} children Children
 */
const Box = (props, children) =>
  h(Element$1, {orientation: 'horizontal', ...props, class: ['osjs-gui-box', props.class]}, children);



/**
 * A flexbox container
 * @param {BoxProperties} props Properties
 * @param {string} [props.orientation='vertical'] Box orientation
 * @param {h[]} children Children
 */
const BoxContainer = (props, children) =>
  h(Element$1, Object.assign({}, props, {
    class: ['osjs-gui-box-container', props.class]
  }), children);



/**
 * A styled flexbox container
 * @param {BoxProperties} props Properties
 * @param {h[]} children Children
 */
const BoxStyled = (props, children) =>
  h(Element$1, {...props, class: ['osjs-gui-box-styled', props.class]}, children);



/**
 * An icon
 * @param {Object} props Properties
 * @param {string} props.src Icon src
 * @param {string} [props.name] Icon name
 * @param {h[]} children Children
 */
const Icon = (props, children) => {
  const i = props && typeof props === 'object'
    ? props.src
    : props;

  const n = props && typeof props === 'object'
    ? props.name
    : undefined;

  return h('i', {
    'data-icon': n,
    class: 'osjs-icon',
    style: {
      backgroundImage: typeof props === 'string' ? `url(${i})` : undefined
    }
  });
};



/**
 * Filter an object based on keys
 * @param {Object} props Props
 * @param {String[]} filterKeys List of keys to filter
 * @return {Object}
 */
const filteredProps = (props, filterKeys) => {
  const keys = Object.keys(props);
  const filter = k => filterKeys.indexOf(k) === -1;

  return keys
    .filter(filter)
    .reduce((result, k) => ({[k]: props[k], ...result}), {});
};

/**
 * Creates a double-tap event handler
 * @param {number} [timeout=250] Timeout
 * @return {Function} Handler with => (ev, cb)
 */
const doubleTap = (timeout = 250) => {
  let tapped = false;
  let timer;

  return (ev, cb) => {
    timer = clearTimeout(timer);
    timer = setTimeout(() => (tapped = false), timeout);

    if (tapped) {
      ev.preventDefault();
      return cb(ev);
    }

    tapped = true;

    return false;
  };
};



/**
 * Creates a new field Element wrapper
 * @param {String} name Field name
 * @param {Object} props Field props
 * @param {Function} cb Callback to create inner element => (props)
 * @param {Function} cb Callback to get value => (event)
 */
const createField = (name, props, defaultProps, cb, cbInput) => {
  const oninput = props.oninput || function() {};
  const onchange = props.onchange || function() {};
  const onkeydown = props.onkeydown || function() {};

  const getValue = cbInput || (ev => [ev.target.value]);
  const fieldProps = {
    oninput: ev => oninput(ev, ...getValue(ev)),
    onchange: ev => onchange(ev, ...getValue(ev)),
    onkeydown: ev => {
      if (ev.keyCode === 13 && props.onenter) {
        props.onenter(ev, ...getValue(ev));
      }
      onkeydown(ev);
    },
    ...defaultProps,
    ...filteredProps(props, ['choices', 'label', 'box', 'oninput', 'onchange'])
  };

  return h(Element$1, {...props.box || {}, class: 'osjs-gui-field osjs-gui-' + name}, cb(fieldProps));
};



/**
 * A button
 * @param {Object} props Properties
 * @param {string} [props.icon] Icon source
 * @param {string} [props.label] Use this as label instead of children
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const Button = (props = {}, children = []) =>
  createField('button', props, {
  }, (fieldProps) => {
    const inner = [];
    if (props.icon) {
      inner.push(h(Icon, props.icon));
    }

    if (typeof props.label === 'string') {
      inner.push(h('span', {class: 'osjs-label'}, props.label));
    }

    return h('button', fieldProps, [
      ...inner,
      ...children
    ]);
  });



/**
 * A progress bar
 * @param {Object} props Properties
 * @param {number} [props.value] The value (percentage)
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const Progressbar = (props, children = []) => {
  let value = typeof props.value === 'number'
    ? Math.min(100, Math.max(0, Math.abs(props.value)))
    : 0;

  const c = h('div', {class: 'osjs-gui-progressbar-wrapper'}, [
    h('div', {
      className: 'osjs-gui-progressbar-value',
      style: {
        width: String(value) + '%'
      }
    }),
    h('div', {
      className: 'osjs-gui-progressbar-label',
    }, [
      h('span', {}, [
        String(value) + '%'
      ])
    ])
  ]);

  return h(Element$1, Object.assign({}, props.box || {}, {
    class: ['osjs-gui-progressbar', props.class]
  }), [
    c,
    ...children
  ]);
};



const ul = (props, children = [], level = 0) => {

  const label = child => {
    const children = [];

    if (child.type === 'checkbox' || typeof child.checked === 'boolean') {
      children.push(h('span', {
        class: 'osjs-gui-menu-checkbox ' + (child.checked ? 'active' : '')
      }));
    } else if (child.icon) {
      children.push(h(Icon, child.icon));
    }

    children.push(h('span', {}, child.label));

    return children;
  };

  const inner = (props, child) => {
    if (typeof child.element === 'function') {
      return child.element();
    }

    const className = child.type === 'separator'
      ? 'osjs-gui-menu-separator'
      : 'osjs-gui-menu-label ' + (child.disabled ? 'osjs__disabled' : '');

    const children = [
      h('span', {class: className}, label(child))
    ];

    if (child.items) {
      children.push(ul(props, child.items, level + 1));
    }

    return children;
  };

  return h('ul', {
    class: ''
  }, children.map(
    child => h('li', {
      class: 'osjs-gui-menu-entry'
    }, [
      h('div', {
        class: 'osjs-gui-menu-container',
        'data-has-image': child.icon ? true : undefined,
        'data-has-children': child.items ? true : undefined,
        onmouseover: child.items ? props.onshow : undefined,
        ontouchend: child.items ? props.onshow : undefined,
        onclick: (ev) => {
          if (child.items) {
            return;
          }

          if (child.onclick) {
            child.onclick(child, ev);
          }

          if (props.onclick) {
            props.onclick(child, ev, child);
          }
        }
      }, inner(props, child))
    ])
  ));
};

/**
 * Menu tree
 * @property {String} label Label
 * @property {String} [icon] Icon source
 * @property {Boolean} [disabled] Disabled state
 * @property {Boolean} [closeable] Disable close on click
 * @property {Function} [element] A callback that returns a virtual DOM element (ex. Hyperapp)
 * @property {Function} onclick Click callback
 * @property {MenuItems} [items] Child items
 * @typedef MenuItems
 */

/**
 * A menu
 * @param {Object} props Properties
 * @param {Boolean} [props.visible=true] Visible property
 * @param {Object} [posprops.ition] Position
 * @param {MenuItems} [props.menu] Menu items
 */
const Menu = (props) => h('div', {
  id: 'osjs-context-menu',
  className: 'osjs-gui osjs-gui-menu',
  oncreate: props.oncreate,
  onupdate: props.onupdate,
  style: {
    display: props.visible !== false ? 'block' : 'none',
    top: props.position ? String(props.position.top) + 'px' : 0,
    left: props.position ? String(props.position.left) + 'px' : 0
  }
}, ul(props, props.menu));



/**
 * A toolbar
 * @desc Contains entries with spacing
 * @param {BoxProperties} props Properties
 * @param {string} [props.orientation='vertical'] Box orientation
 * @param {h[]} children Children
 */
const Toolbar = (props, children) =>
  h(Element$1, Object.assign({
    orientation: 'vertical'
  }, props, {
    class: ['osjs-gui-toolbar', props.class]
  }), children);



/**
 * A status bar
 * @param {Object} props Properties
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const Statusbar = (props, children) =>
  h(Element$1, Object.assign({}, props.box || {}, {
    class: ['osjs-gui-statusbar', props.class]
  }), children);



/**
 * A menubar item
 * @param {Object} props Properties
 * @param {h[]} children Children
 */
const MenubarItem = (props, children = []) => {
  const {onclick, data} = props;

  return h('div', {
    onclick: (ev) => {
      if (typeof onclick === 'function') {
        const parentNode = ev.target.parentNode;
        const index = Array.prototype.indexOf.call(parentNode.children, ev.target);

        onclick(ev, data || {}, index);
      }
    }
  }, h('span', {}, children));
};

/**
 * A menubar container
 * @param {BoxProperties} [props] Box Properties
 * @param {MenubarItem[]} [props.items] Array of object
 * @param {h[]} children Children
 */
const Menubar = (props, children = []) =>
  h(Element$1, Object.assign({}, props, {
    class: ['osjs-gui-menubar', props.class]
  }), [
    ...(props.items || []).map(item => h(MenubarItem, {
      data: item.data,
      onclick: (item.onclick || props.onclick)
    }, item.label)),
    ...children
  ]);



const onmousedown = (ev, actions, orientation) => {
  const {target, clientX, clientY} = ev;
  const pane = target.previousSibling;
  const {offsetWidth, offsetHeight} = pane;
  const index = Array.from(target.parentNode.children).indexOf(pane);
  const maxWidth = pane.parentNode.offsetWidth * 0.8;
  const maxHeight = pane.parentNode.offsetHeight * 0.8;

  if (index < 0) {
    return;
  }

  const mousemove = ev => {
    ev.preventDefault();

    let size = orientation === 'vertical' ? offsetWidth : offsetHeight;

    if (orientation === 'vertical') {
      const diffX = ev.clientX - clientX;
      size = Math.min(maxWidth, size + diffX);
    } else {
      const diffY = ev.clientY - clientY;
      size = Math.min(maxHeight, size + diffY);
    }

    actions.setSize({index, size});
  };

  const mouseup = ev => {
    ev.preventDefault();
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  };

  ev.preventDefault();
  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
};

const panes$1 = (state, actions, children, orientation) => {
  const spacers = Array(Math.ceil(children.length / 2))
    .fill(null)
    .map(() => h('div', {
      class: 'osjs-gui-panes-spacer',
      onmousedown: ev => onmousedown(ev, actions, orientation)
    }));

  const child = (c, i) => {
    const w = state.sizes[i] ? String(state.sizes[i]) + 'px' : undefined;

    return h('div', {
      class: 'osjs-gui-panes-pane',
      style: {
        flex: w ? `0 0 ${w}` : w
      }
    }, c);
  };

  return children
    .map(child)
    .map((v, i) => [v, spacers[i]])
    .reduce((a, b) => a.concat(b))
    .filter(v => typeof v !== 'undefined');
};

const view$3 = (state, actions) => (props, children) => {
  const orientation = props.orientation || 'vertical';

  return h(Element$1, {
    orientation,
    class: 'osjs-gui-panes-inner'
  }, panes$1(state, actions, children, orientation));
};

const inner$1 = nestable({
  sizes: []
}, {
  init: props => ({sizes: props.sizes || [150]}),
  setSize: ({index, size}) => state => {
    const sizes = [].concat(state.sizes);
    sizes[index] = size;
    return {sizes};
  }
}, view$3, 'div');

/**
 * Resizable panes
 * @param {Object} props Properties
 * @param {string} [props.orientation='vertical'] Pane orientation
 * @param {number[]} [props.sizes] Pane sizes
 * @param {h[]} children Children
 */
const Panes = (props, children) => h(inner$1, {
  class: 'osjs-gui-panes'
}, children);



const tapper$1 = doubleTap();

const createView = props => {
  let debounceScroll;

  const cols = (paneIndex) => (row, rowIndex) => {
    const col = row.columns[paneIndex] || {};
    const colIcon = col.icon ? h(Icon, col.icon) : null;
    const children = [h('span', {}, [typeof col === 'object' ? col.label : col])];
    const selected = props.multiselect
      ? props.selectedIndex.indexOf(rowIndex) !== -1
      : props.selectedIndex === rowIndex;

    if (colIcon) {
      children.unshift(colIcon);
    }

    return h('div', {
      key: row.key,
      'data-has-icon': col.icon ? true : undefined,
      class: 'osjs-gui-list-view-cell' + (selected ? ' osjs__active' : ''),
      ontouchstart: (ev) => tapper$1(ev, () => props.onactivate({index: rowIndex, ev})),
      ondblclick: (ev) => props.onactivate({index: rowIndex, ev}),
      onclick: (ev) => props.onselect({index: rowIndex, ev}),
      oncontextmenu: (ev) => props.oncontextmenu({index: rowIndex, ev}),
      oncreate: (el) => props.oncreate({index: rowIndex, el})
    }, children);
  };

  const pane = (index, col) => h('div', {
    class: 'osjs-gui-list-view-pane',
    style: col.style || {}
  }, [
    h('div', {
      class: 'osjs-gui-list-view-header',
      style: {
        display: props.hideColumns ? 'none' : undefined
      }
    }, h('span', {}, typeof col === 'object' ? col.label : col)),
    h('div', {
      class: 'rows',
      'data-zebra': String(props.zebra)
    }, props.rows.map(cols(index)))
  ]);

  return h('div', {
    class: 'osjs-gui-list-view-wrapper',
    onscroll: ev => {
      debounceScroll = clearTimeout(debounceScroll);
      debounceScroll = setTimeout(() => {
        props.onscroll(ev);
      }, 100);
    },
    oncreate: el => (el.scrollTop = props.scrollTop),
    onupdate: el => {
      const notSelected = props.multiselect
        ? props.selectedIndex.length === 0
        : props.selectedIndex < 0;

      if (notSelected) {
        el.scrollTop = props.scrollTop;
      }
    }
  }, props.columns.map((c, i) => pane(i, c)));
};

const ListView = props => h(Element$1, Object.assign({
  class: 'osjs-gui-list-view'
}, props.box || {}), createView(filteredProps(props, ['box'])));

const listView = ({
  component: (state, actions) => {
    const createSelection = index => {
      if (state.multiselect) {
        const foundIndex = state.selectedIndex.indexOf(index);
        const newSelection = [...state.selectedIndex];
        if (foundIndex === -1) {
          newSelection.push(index);
        } else {
          newSelection.splice(foundIndex, 1);
        }

        return newSelection;
      }

      return state.selectedIndex;
    };

    /**
     * Creates a range of indexes from start to end
     * @param {Number} start
     * @param {Number} end
     * @return {Array}
     */
    const createSelectionRange = (start, end) => {
      // Swaps start and end if start is greater than end
      if (start > end) {
        [start, end] = [end, start];
      }

      const indices = [
        ...state.selectedIndex,
        // Generates a range of indexes from start to end
        ...Array.from({length: end - start + 1}, (_, i) => i + start)
      ];

      // Remove duplicates from the array
      return [...new Set(indices)];
    };

    const getSelection = (index, ev) => {
      const selected = state.multiselect
        ? (ev.shiftKey
          ? createSelectionRange(state.previousSelectedIndex, index)
          : ev.ctrlKey
            ? createSelection(index)
            : [index])
        : index;

      const data = state.multiselect
        ? selected.map((item) => state.rows[item].data)
        : state.rows[selected].data;

      // Store the previous index in the state to use for calculating the
      // range if the shift key is pressed
      if (state.multiselect) {
        actions.setPreviousSelectedIndex(index);
      }

      return {selected, data};
    };

    const clearCurrentSelection = (index) => {
      const selected = state.multiselect ? [] : -1;

      const data = state.multiselect
        ? state.selectedIndex.map((item) => state.rows[item].data)
        : state.rows[index].data;

      return {selected, data};
    };

    const newProps = Object.assign({
      multiselect: false,
      zebra: true,
      columns: [],
      rows: [],
      onselect: ({index, ev}) => {
        const {selected, data} = getSelection(index, ev);
        actions.select({data, index, ev, selected});
        actions.setSelectedIndex(selected);
      },
      onactivate: ({index, ev}) => {
        const {selected, data} = clearCurrentSelection(index);
        actions.activate({data, index, ev, selected});
        actions.setSelectedIndex(selected);
      },
      oncontextmenu: ({index, ev}) => {
        const {selected, data} = getSelection(index, ev);

        actions.select({data, index, ev});
        actions.contextmenu({data, index, ev, selected});
        actions.setSelectedIndex(selected);
      },
      oncreate: ({index, el}) => {
        const data = state.rows[index].data;
        actions.created({index, el, data});
      },
      onscroll: (ev) => {
        actions.scroll(ev);
      }
    }, state);

    return (props = {}) => ListView(Object.assign(newProps, props));
  },

  state: state => Object.assign({
    selectedIndex: state.multiselect ? [] : -1,
    scrollTop: 0
  }, state),

  actions: actions => Object.assign({
    select: () => () => ({}),
    activate: () => () => ({}),
    contextmenu: () => () => ({}),
    created: () => () => ({}),
    scroll: () => state => state,
    setRows: rows => ({rows}),
    setColumns: columns => ({columns}),
    setScrollTop: scrollTop => state => ({scrollTop}),
    setSelectedIndex: selectedIndex => ({selectedIndex}),
    setPreviousSelectedIndex: previousSelectedIndex => ({previousSelectedIndex}),
  }, actions || {})
});



const tapper = doubleTap();

const IconViewEntry = (entry, index, props) => () => {
  const icon = entry.icon || {name: 'application-x-executable'};
  const selected = props.selectedIndex === index;

  return h('div', {
    class: 'osjs-gui-icon-view-entry' + (selected ? ' osjs__active' : ''),
    ontouchstart: (ev) => tapper(ev, () => props.onactivate({data: entry.data, index, ev})),
    ondblclick: (ev) => props.onactivate({data: entry.data, index, ev}),
    onclick: (ev) => props.onselect({data: entry.data, index, ev}),
    oncontextmenu: (ev) => props.oncontextmenu({data: entry.data, index, ev}),
    oncreate: (el) => props.oncreate({data: entry.data, index, el})
  }, [
    h('div', {class: 'osjs__container'}, [
      h('div', {class: 'osjs__image'}, [
        h(Icon, icon)
      ]),
      h('div', {class: 'osjs__label'}, [
        h('span', {}, entry.label)
      ])
    ])
  ]);
};

const IconView = (props) => {
  const inner = h('div', {
    class: 'osjs-gui-icon-view-wrapper',
    oncreate: el => (el.scrollTop = props.scrollTop),
    onupdate: el => {
      if (props.selectedIndex < 0) {
        el.scrollTop = props.scrollTop;
      }
    }
  }, props.entries.map((entry, index) => {
    return h(IconViewEntry(entry, index, props));
  }));

  return h(Element$1, Object.assign({
    class: 'osjs-gui-icon-view'
  }, props.box || {}), inner);
};

const iconView = ({
  component: (state, actions) => {
    const newProps = Object.assign({
      entries: [],
      onselect: ({data, index, ev}) => {
        actions.select({data, index, ev});
        actions.setSelectedIndex(index);
      },
      onactivate: ({data, index, ev}) => {
        actions.activate({data, index, ev});
        actions.setSelectedIndex(-1);
      },
      oncontextmenu: ({data, index, ev}) => {
        actions.select({data, index, ev});
        actions.contextmenu({data, index, ev});
        actions.setSelectedIndex(index);
      },
      oncreate: (args) => {
        actions.created(args);
      }
    }, state);

    return (props = {}) => IconView(Object.assign(newProps, props));
  },

  state: state => Object.assign({
    selectedIndex: -1,
    scrollTop: 0
  }, state),

  actions: actions => Object.assign({
    select: () => () => ({}),
    activate: () => () => ({}),
    contextmenu: () => () => ({}),
    created: () => () => ({}),
    setEntries: entries => () => ({entries}),
    setScrollTop: scrollTop => state => ({scrollTop}),
    setSelectedIndex: selectedIndex => state => ({selectedIndex}),
  }, actions || {})
});



/**
 * A image
 * @param {Object} props Properties
 * @param {String} props.src The image source
 * @param {String} [props.alt] The image alternate text
 * @param {number} [props.width] Image width
 * @param {number} [props.height] Image height
 * @param {Function} [props.onload] On loaded data event
 * @param {Function} [props.oncreate] Hyperapp oncreate function
 * @param {Function} [props.onupdate] Hyperapp onupdate function
 * @param {Function} [props.ondestroy] Hyperapp ondestroy function
 */
const Image = (props, children) =>
  h('div', {
    class: 'osjs-gui osjs-gui-image',
    style: {
      width: props.width ? String(props.width) + 'px' : undefined,
      height: props.height ? String(props.height) + 'px' : undefined
    }
  }, h('img', props));



const sources = list => list.map(item => h('source', item));

const isTrue = v => typeof v === 'undefined' || v === true;

/**
 * A video
 * @param {Object} props Properties
 * @param {String} [props.class] Append this className
 * @param {Object} [props.style] CSS Style object
 * @param {String} props.src The video source
 * @param {number} [props.width] Video width
 * @param {number} [props.height] Video height
 * @param {String} [props.poster] Poster image source
 * @param {Boolean} [props.loop] Loop video
 * @param {Boolean} [props.autoplay] Autoplay video
 * @param {Boolean} [props.controls] Show controls
 * @param {Function} [props.onloadeddata] On loaded data event
 */
const Video = (props, children) =>
  h('div', {
    class: 'osjs-gui osjs-gui-video',
    style: {
      width: props.width ? String(props.width) + 'px' : undefined,
      height: props.height ? String(props.height) + 'px' : undefined
    }
  }, [
    h('video', {
      src: props.src,
      width: props.width,
      height: props.height,
      poster: props.poster,
      loop: props.loop ? 'loop' : undefined,
      muted: props.muted ? 'muted' : undefined,
      controls: isTrue(props.controls) ? 'controls' : undefined,
      autoplay: isTrue(props.autoplay) ? 'autoplay' : undefined,
      onloadeddata: props.onload,
      oncreate: props.oncreate,
      onupdate: props.onupdate,
      ondestroy: props.ondestroy
    }, sources(props.sources || []))
  ]);




const headers = ({labels, onchange, oncontextmenu}, state, actions) => (labels || [])
  .map((label, index) => h('div', {
    class: state.selectedIndex === index ? 'osjs__active' : '',
    oncontextmenu: ev => {
      (oncontextmenu || function() {})(ev, index, label);
    },
    onclick: ev => {
      actions.setSelectedIndex(index);
      (onchange || function() {})(ev, index, label);
    }
  }, h('span', {}, label)));

const panes = (state, children) => children
  .map((child, index) => h('div', {
    class: state.selectedIndex === index ? 'osjs__active' : ''
  }, child));

const view$2 = nestable({
  selectedIndex: 0
}, {
  init: props => ({
    selectedIndex: props.selectedIndex || 0
  }),
  setSelectedIndex: selectedIndex => state => ({selectedIndex})
}, (state, actions) => (props, children) => h('div', {
  class: 'osjs-gui-tabs-wrapper'
}, [
  h('div', {class: 'osjs-gui-tabs-header'}, headers(props, state, actions)),
  h('div', {class: 'osjs-gui-tabs-panes'}, panes(state, children))
]), 'div');

/**
 * A tab container
 * @param {Object} props Properties
 * @param {String[]} props.labels Labels
 * @param {h[]} children Tabs
 */
const Tabs = (props, children) => h(view$2, Object.assign({
  class: 'osjs-gui osjs-gui-tabs ' + (props.class || '')
}, props), children);



/**
 * A iframe
 * @param {Object} props Properties
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const Iframe = (props, children = []) =>
  h(Element$1, {...props.box || {}, class: ['osjs-gui-iframe', props.class]}, [
    h('iframe', {frameborder: 0, ...filteredProps(props, ['box'])}),
    ...children
  ]);



/**
 * A text field
 * @param {Object} props Properties
 * @param {string} [props.value] Value
 * @param {string} [props.type=text] Type
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const TextField = (props = {}, children = []) =>
  createField('text-field', props, {
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    type: 'text'
  }, (fieldProps) => h('input', fieldProps));



/**
 * A text field
 * @param {Object} props Properties
 * @param {string} [props.value] Value
 * @param {number} [props.rows=4] Number of rows
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const TextareaField = (props = {}, children = []) =>
  createField('textarea-field', props, {
    rows: 4
  }, (fieldProps) => h('textarea', fieldProps, children));



/**
 * A text field
 * @param {Object} props Properties
 * @param {string} [props.value] Value
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const SelectField = (props = {}, children = []) => {

  const getChoices = choices => choices instanceof Array
    ? choices.map(value => typeof value === 'object' ? value : {value, label: value})
    : Object.keys(props.choices || {})
      .map(value => ({value, label: props.choices[value]}));

  const choices = getChoices(props.choices)
    .map(({value, label}) => {
      return h('option', {
        value,
        selected: props.value === value
      }, label);
    });

  const getValue = ev => [ev.target.value, ev.target.textContent];
  const createSelect = fieldProps => h('div', {}, h('select', fieldProps, [
    ...choices,
    ...children
  ]));

  return createField('select-field', props, {
    selectedIndex: undefined
  }, createSelect, getValue);
};



/*
 * Parses option value
 */
const parseValue = value => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

/**
 * A text field
 * @param {Object} props Properties
 * @param {string} [props.checked] Value
 * @param {string} [props.type=checkbox] Type
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const ToggleField = (props = {}, children = []) =>
  createField('toggle-field', props, {
    type: 'checkbox',
    checked: false
  }, (fieldProps) => h('label', {

  }, [
    h('input', fieldProps),
    h('span', {
      class: 'osjs-toggle-input'
    }),
    h('span', {
      class: 'osjs-toggle-label'
    }, [
      props.label || '',
      ...children
    ])
  ]), ev => [props.type === 'radio'
    ? parseValue(ev.target.value)
    : !!ev.target.checked]);



/**
 * A range field
 * @param {Object} props Properties
 * @param {string} [props.min] Minimum value
 * @param {string} [props.max] Maximum value
 * @param {string} [props.value] Value
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const RangeField = (props = {}, children = []) =>
  createField('range-field', props, {
    type: 'range'
  }, (fieldProps) => h('input', fieldProps));




const view$1 = (state, actions) => (props, children) => {
  return h(Element$1, {...props.box || {}, class: ['osjs-gui-expander-wrapper']}, [
    h('div', {
      class: 'osjs-gui-expander-header',
      onclick: ev => actions.ontoggle({
        ev,
        active: !state.active,
        ontoggle: props.ontoggle
      })
    }, [
      h('div', {
        class: 'osjs-gui-expander-header-icon',
        'data-active': String(state.active)
      }),
      h('div', {
        class: 'osjs-gui-expander-header-label'
      }, props.label)
    ]),
    h('div', {
      class: 'osjs-gui-expander-content',
      style: {
        display: state.active === false ? 'none' : undefined
      }
    }, children)
  ]);
};

const inner = nestable({
  active: true
}, {
  init: props => ({
    ative: props.active !== false
  }),
  ontoggle: ({ev, active, ontoggle}) => {
    const cb = ontoggle || function() {};
    cb(ev, active);
    return {active};
  }
}, view$1, 'div');

/**
 * A status bar
 * @param {Object} props Properties
 * @param {boolean} [props.active] Active state
 * @param {Function} [props.ontoggle] Toggle callback => (ev, active)
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const Expander = (props, children) =>
  h(inner, {...props, class: 'osjs-gui osjs-gui-expander'}, children);



/**
 * A label element
 * @param {Object} props Properties
 * @param {string} [props.text] Label Text
 * @param {string} [props.placement] Placement
 * @param {string} [props.for] The "for" attribute
 * @param {BoxProperties} [props.box] Box Properties
 * @param {h[]} children Children
 */
const Label = (props = {}, children = []) => {
  const placement = props.placement || 'top';
  const text = props.text || '';

  const elementProps = Object.assign({
    class: ['osjs-gui-field-label', 'osjs-gui-field-label-on-' + placement]
  }, props.box || {});

  return h(Element$1, elementProps, [
    h('label', {for: props.for}, text),
    children
  ]);
};



/*
 * Makes sure sub-menus stays within viewport
 */
const clampSubMenu = (root, ev) => {
  let ul = ev.target.querySelector('ul');
  if (!ul) {
    return;
  }

  // FIXME: Safari reports wrong item
  if (ul.classList.contains('osjs-gui-menu-container')) {
    ul = ul.parentNode.parentNode;
  }

  if (!ul || !ul.offsetParent) {
    return;
  }

  ul.classList.remove('clamp-right');

  const rect = ul.getBoundingClientRect();
  if (rect.right > root.offsetWidth) {
    ul.classList.add('clamp-right');
  }
};

/*
 * Makes sure menu stays within viewport
 */
const clampMenu = (root, el, currentPosition) => {
  const result = {};
  const bottom = currentPosition.top + el.offsetHeight;
  const right = currentPosition.left + el.offsetWidth;
  const offY = root.offsetHeight - currentPosition.top;
  const offX = root.offsetWidth - currentPosition.left;
  const overflowRight = right > root.offsetWidth;
  const overflowBottom = bottom > root.offsetHeight;

  if (overflowBottom) {
    if (root.offsetHeight > el.offsetHeight) {
      result.top = root.offsetHeight - el.offsetHeight - offY;
    }
  }

  if (overflowRight) {
    result.left = root.offsetWidth - el.offsetWidth - offX;
  }

  return (overflowBottom || overflowRight) ? result : null;
};

/*
 * Context Menu view
 */
const view = callback => (props, actions) => h(Menu, {
  position: props.position,
  visible: props.visible,
  menu: props.menu,
  onclick: callback,
  onshow: actions.onshow
});

const timeout = fn => {
  fn();
  return setTimeout(fn, 100);
};

/**
 * ContextMenu Class
 *
 * @desc Handles a Menu/ContextMenu globally for OS.js
 */
class ContextMenu {

  constructor(core) {
    this.core = core;
    this.callback = () => {};
    this.actions = null;
    this.$element = document.createElement('div');
  }

  destroy() {
    this.callback = null;
    this.actions = null;
  }

  /**
   * Initializes the Menu Hyperapp
   */
  init() {
    let clampTimeout;

    this.$element.className = 'osjs-system-context-menu';
    this.core.$root.appendChild(this.$element);

    let isActive = false;

    this.actions = app({
      visible: false,
      menu: [],
      position: {
        top: 0,
        left: 0
      }
    }, {
      clamp: (el) => props => {
        el = el || document.querySelector('#osjs-context-menu');
        clearTimeout(clampTimeout);

        if (el) {
          const root = this.core.$root;
          const newPosition = clampMenu(root, el, props.position);
          if (newPosition) {
            return {position: newPosition};
          }
        }

        return {};
      },
      onshow: (ev) => props => {
        clampTimeout = timeout(() => clampSubMenu(this.core.$root, ev));
      },
      show: (options) => (props, actions) => {
        let {menu, position, toggle} = options;
        if (toggle && isActive) {
          return actions.hide();
        } else if (position instanceof Event) {
          position = {left: position.clientX, top: position.clientY};
        } else if (position instanceof Element) {
          const box = position.getBoundingClientRect();
          position = {
            left: box.left,
            top: box.top + box.height
          };
        }

        this.callback = (child, ev, iter) => {
          if (options.callback) {
            options.callback(child, ev);
          }

          if (iter.closeable !== false) {
            actions.hide();
          }
        };

        isActive = true;
        this.onclose = options.onclose;

        timeout(() => actions.clamp());

        return {
          visible: true,
          menu: menu || [],
          position: position || {top: 0, left: 0}
        };
      },
      hide: () => props => {
        if (isActive) {
          setTimeout(() => (isActive = false), 0);
        }
        if (this.onclose) {
          this.onclose();
        }
        this.onclose = null;
        this.callback = null;

        return {visible: false};
      }
    }, view((...args) => {
      if (!this.core.destroyed) {
        if (this.callback) {
          this.callback(...args);
        }
      }
    }), this.$element);
  }

  /**
   * Show the menu
   */
  show(...args) {
    return this.actions ? this.actions.show(...args) : null;
  }

  /**
   * Hide the menu
   */
  hide(...args) {
    return this.actions ? this.actions.hide(...args) : null;
  }
}



/*
 * Check if a target allows for context menu
 */
const validContextMenuTarget = ev => {
  const target = ev.target;
  let isValid = target.tagName === 'TEXTAREA';
  if (!isValid && target.tagName === 'INPUT') {
    isValid = ['text', 'password', 'number', 'email'].indexOf(target.type) !== -1;
  }

  return isValid;
};

/**
 * OS.js GUI Service Provider
 *
 * @desc Provides wrapper services around GUI features
 */
class GUIServiceProvider {

  constructor(core) {
    this.core = core;
    this.contextmenu = new ContextMenu(core);
  }

  destroy() {
    const menu = document.getElementById('osjs-context-menu');
    if (menu) {
      menu.remove();
    }

    this.contextmenu.destroy();
  }

  async init() {
    const contextmenuApi = {
      show: (...args) => this.contextmenu.show(...args),
      hide: (...args) => this.contextmenu.hide(...args)
    };

    this.core.instance('osjs/contextmenu', (...args) => {
      if (args.length) {
        return contextmenuApi.show(...args);
      }

      return contextmenuApi;
    });

    this.core.$root.addEventListener('contextmenu', (ev) => {
      if (validContextMenuTarget(ev)) {
        return;
      }

      ev.stopPropagation();
      ev.preventDefault();
    });
  }

  start() {
    const callback = ev => {
      const menu = document.getElementById('osjs-context-menu');
      const hit = menu && menu.contains(ev.target);

      if (!hit && this.contextmenu) {
        this.contextmenu.hide();
      }
    };

    this.core.$root.addEventListener('click', callback, true);
    this.core.once('destroy', () => {
      this.core.$root.removeEventListener('click', callback, true);
    });

    this.contextmenu.init();
  }
}

export { Box, BoxContainer, BoxStyled, Button, Element$1 as Element, Expander, GUIServiceProvider, Icon, IconView, IconViewEntry, Iframe, Image, Label, ListView, Menu, Menubar, MenubarItem, Panes, Progressbar, RangeField, SelectField, Statusbar, Tabs, TextField, TextareaField, ToggleField, Toolbar, Video, iconView, listView };
//# sourceMappingURL=gui.js.map
