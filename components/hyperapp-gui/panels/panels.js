import {app, h} from '../hyperapp.js';
import {EventEmitter} from '../osjs-eventemitter.js';
import { defaultIcon } from '../theme.js';

/**
 * OS.js Panel Item
 * @see {Panel}
 */
class PanelItem extends EventEmitter {

  /**
   * Create panel item
   *
   * @param {Core} core Core reference
   * @param {Panel} panel Panel reference
   * @param {Object} options Options
   */
  constructor(core, panel, options = {}) {
    super('Panel');

    this.core = core;
    this.panel = panel;
    this.options = options;
    this.state = {};
    this.actions = {};
    this.inited = false;
  }

  /**
   * Destroy panel item
   */
  destroy() {
    this.emit('destroy', this);
  }

  /**
   * Initializes panel item
   * @param {Object} state State
   * @param {Object} actions Actions
   * @return {Object} Bound actions
   */
  init(state = {}, actions = {}) {
    if (this.inited) {
      return false;
    }

    this.inited = true;
    this.emit('init', this);

    return app(state, actions, (state, actions) => {
      return this.render(state, actions);
    }, this.panel.$element);
  }

  /**
   * Renders the panel item
   * @param {String} name The panel item virtual name
   * @param {Object[]} children The panel item children
   * @return {Node} A *virtual* node
   */
  render(name, children = []) {
    return h('div', {
      className: 'osjs-panel-item',
      'data-name': name
    }, children);
  }

}

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 *          Nguyễn Anh Khoa <khoaakt@gmail.com>
            Julien Gomes Dias <abld@abld.info>
            Filip Š <projects@filips.si>
            Matheus Felipe <matheusfelipeog@gmail.com>
 * @licence Simplified BSD License
 */


const de_DE = {
  LBL_PANEL_ALL: 'Panel hinzufügen',
  LBL_PANEL_REMOVE: 'Panel entfernen',
  LBL_PANELITEM_ADD: 'Panelelemente hinzufügen',
  LBL_PANELITEM_REMOVE: 'Panelelemente entfernen',
  LBL_PANEL_POSITION: 'Panel-Position',
  LBL_SAVE_AND_LOG_OUT: 'Session speichern & Abmelden',
  LBL_LOG_OUT: 'Abmelden'
};

const en_EN = {
  LBL_PANEL_ALL: 'Add panel',
  LBL_PANEL_REMOVE: 'Remove panel',
  LBL_PANELITEM_ADD: 'Add panelitem',
  LBL_PANELITEM_REMOVE: 'Remove panelitem',
  LBL_PANEL_POSITION: 'Panel Position',
  LBL_SAVE_AND_LOG_OUT: 'Save Session & Log Out',
  LBL_LOG_OUT: 'Log Out',
  LBL_LAUNCHING: 'Launching \'{0}\''
};

const sv_SE = {
  LBL_PANEL_ALL: 'Lägg till panel',
  LBL_PANEL_REMOVE: 'Ta bort panel',
  LBL_PANELITEM_ADD: 'Lägg till panelobjekt',
  LBL_PANELITEM_REMOVE: 'Ta bort panelobjekt',
  LBL_PANEL_POSITION: 'Panelposition',
  LBL_SAVE_AND_LOG_OUT: 'Spara session och logga ut',
  LBL_LOG_OUT: 'logga ut',
  LBL_LAUNCHING: 'Startar \'{0}\''
};

const fr_FR = {
  LBL_PANEL_ALL: 'Ajouter le panneau',
  LBL_PANEL_REMOVE: 'Supprimer le panneau',
  LBL_PANELITEM_ADD: 'Ajouter des éléments au panneau',
  LBL_PANELITEM_REMOVE: 'Supprimer des éléments au panneau',
  LBL_PANEL_POSITION: 'La position du panneau',
  LBL_SAVE_AND_LOG_OUT: 'Sauvegarder la session et se déconnecter',
  LBL_LOG_OUT: 'Se déconnecter'
};

const nb_NO = {
  LBL_PANEL_ALL: 'Legg til panel',
  LBL_PANEL_REMOVE: 'Fjern panel',
  LBL_PANELITEM_ADD: 'Legg til panelobjekt',
  LBL_PANELITEM_REMOVE: 'Fjern panelobjekt',
  LBL_PANEL_POSITION: 'Panelposisjon',
  LBL_SAVE_AND_LOG_OUT: 'Lagre Sessjon & Logg Ut',
  LBL_LOG_OUT: 'Logg Ut',
  LBL_LAUNCHING: 'Laster \'{0}\''
};

const sl_SI = {
  LBL_PANEL_ALL: 'Dodaj ploščo',
  LBL_PANEL_REMOVE: 'Odstrani ploščo',
  LBL_PANELITEM_ADD: 'Dodaj element plošče',
  LBL_PANELITEM_REMOVE: 'Odstrani element plošče',
  LBL_PANEL_POSITION: 'Položaj plošče',
  LBL_SAVE_AND_LOG_OUT: 'Shranitev seje & Odjava',
  LBL_LOG_OUT: 'Odjava'
};

const vi_VN = {
  LBL_PANEL_ALL: 'Thêm panel',
  LBL_PANEL_REMOVE: 'Xóa panel',
  LBL_PANELITEM_ADD: 'Thêm mục panel',
  LBL_PANELITEM_REMOVE: 'Xóa mục panel',
  LBL_PANEL_POSITION: 'Vị trí panel',
  LBL_SAVE_AND_LOG_OUT: 'Lưu phiên & Đăng xuất',
  LBL_LOG_OUT: 'Đăng xuất',
  LBL_LAUNCHING: 'Đang khởi động \'{0}\''
};

const pt_BR = {
  LBL_PANEL_ALL: 'Adicionar painel',
  LBL_PANEL_REMOVE: 'Remover painel',
  LBL_PANELITEM_ADD: 'Adicionar item ao painel',
  LBL_PANELITEM_REMOVE: 'Remover item do painel',
  LBL_PANEL_POSITION: 'Posição do painel',
  LBL_SAVE_AND_LOG_OUT: 'Salvar sessão & Sair',
  LBL_LOG_OUT: 'Sair',
  LBL_LAUNCHING: 'Lançamento \'{0}\''
};

const tr_TR = {
  LBL_PANEL_ALL: 'Panel ekle',
  LBL_PANEL_REMOVE: 'Paneli sil',
  LBL_PANELITEM_ADD: 'Panel nesnesi ekle',
  LBL_PANELITEM_REMOVE: 'Panel nesnesini sil',
  LBL_PANEL_POSITION: 'Panel Konumu',
  LBL_SAVE_AND_LOG_OUT: 'Oturumu Kaydet & Çıkış Yap',
  LBL_LOG_OUT: 'Çıkış Yap',
  LBL_LAUNCHING: 'Başlatılıyor \'{0}\''
};

let languages = /* #__PURE__*/Object.freeze({
  __proto__: null,
  de_DE: de_DE,
  en_EN: en_EN,
  sv_SE: sv_SE,
  fr_FR: fr_FR,
  nb_NO: nb_NO,
  sl_SI: sl_SI,
  vi_VN: vi_VN,
  pt_BR: pt_BR,
  tr_TR: tr_TR
});


/**
 * Panel
 *
 * @desc Base Panel Class
 */
class Panel extends EventEmitter {

  /**
   * Create panel
   *
   * @param {Core} core Core reference
   * @param {Object} options Options
   */
  constructor(core, options = {}) {
    super('Panel');

    this.core = core;
    this.options = {ontop: true,
      position: 'top',
      contextmenu: true,
      items: [], ...options};

    this.items = [];
    this.inited = false;
    this.destroyed = false;
    this.$element = null;

    this.options.items
      .forEach(({name, options}) => {
        const c = core.make('osjs/panels').get(name);
        this.addItem(new c(this.core, this, options || {}));
      });
  }

  /**
   * Destroys the panel
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.items = this.items.filter(item => {
      try {
        item.destroy();
      } catch (e) {
        console.warn(e);
      }
      return false;
    });

    this.destroyed = true;
    this.inited = false;
    this.emit('destroy');
    this.core.emit('osjs/panel:destroy', this);

    this.$element.remove();
    this.$element = null;
  }

  /**
   * Initializes the panel
   */
  init() {
    if (this.inited) {
      return;
    }
    this.destroyed = false;
    this.inited = true;

    const _ = this.core.make('osjs/locale').translate;
    const __ = this.core.make('osjs/locale').translatable(languages);

    this.$element = document.createElement('div');
    this.$element.classList.add('osjs-panel');
    this.$element.classList.add('osjs__contextmenu');
    this.$element.addEventListener('contextmenu', ev => {
      ev.preventDefault();

      const disabled = this.core.config('desktop.lock') ||
        this.core.config('desktop.disablePanelContextMenu');

      if (disabled) {
        return;
      }

      this.core.make('osjs/contextmenu').show({
        position: ev,
        menu: [{
          label: __('LBL_PANEL_POSITION'),
          items: [{
            label: _('LBL_TOP'),
            onclick: () => this.setPosition('top')
          }, {
            label: _('LBL_BOTTOM'),
            onclick: () => this.setPosition('bottom')
          }]
        }]
      });
    });
    this.$element.setAttribute('data-position', this.options.position);
    this.$element.setAttribute('data-ontop', String(this.options.ontop));

    this.core.$root.appendChild(this.$element);

    this.items.forEach(item => item.init());

    this.emit('create');
  }

  /**
   * Add an item to the panel
   * @param {PanelItem} item The panel item instance
   */
  addItem(item) {
    if (!(item instanceof PanelItem)) {
      throw new TypeError('Invalid panel item specified');
    }

    this.items.push(item);

    if (this.inited) {
      item.init();
    }
  }

  setPosition(position) {
    this.options.position = position;

    return this.core.make('osjs/panels').save()
      .then(() => {
        const desktop = this.core.make('osjs/desktop');
        return desktop.applySettings();
      });
  }
}


const mapWindow = win => {
  return {
    wid: win.wid,
    icon: win.state.icon,
    title: win.state.title,
    focused: win.state.focused,
    attributes: {...win.attributes},
    state: {...win.state},
    raise: () => {
      win.raise();
      win.focus();
    },
    restore: () => win.restore(),
    maximize: () => win.maximize(),
    minimize: () => win.minimize(),
    close: () => win.close()
  };
};

/**
 * Window List
 *
 * @desc Window List Panel Item. Also displays launching applications.
 */
class WindowsPanelItem extends PanelItem {

  init() {
    if (this.inited) {
      return;
    }

    const filterVisibility = win => typeof win.attributes.visibility === 'undefined' ||
      win.attributes.visibility === 'global';

    const actions = super.init({
      launchers: [],
      windows: this.core.make('osjs/windows').list()
        .filter(win => win.inited || win.rendered)
        .filter(filterVisibility)
        .map(mapWindow)
    }, {
      add: win => state => {
        const found = state.windows.find(w => w.wid === win.wid);
        if (found) {
          return state;
        }

        const windows = state.windows
          .concat([win])
          .filter(win => !win.inited || !win.rendered)
          .filter(filterVisibility);

        return {windows};
      },

      remove: win => ({windows}) => {
        const foundIndex = windows.findIndex(w => w.wid === win.wid);
        if (foundIndex !== -1) {
          windows.splice(foundIndex, 1);

          return {windows};
        }

        return {};
      },

      change: win => state => {
        const windows = state.windows;
        const foundIndex = state.windows.findIndex(w => w.wid === win.wid);
        if (foundIndex !== -1) {
          windows[foundIndex] = win;
        }

        return {windows};
      },

      addLauncher: name => state => ({launchers: [...state.launchers, name]}),

      removeLauncher: name => state => {
        const foundIndex = state.launchers.findIndex(n => n === name);
        const launchers = [...state.launchers];
        if (foundIndex !== -1) {
          launchers.splice(foundIndex, 1);
        }

        return {launchers};
      }
    });

    const onlaunch = (name) => actions.addLauncher(name);
    const onlaunched = (name) => actions.removeLauncher(name);
    const ondestroy = (win) => actions.remove(mapWindow(win));
    const oncreate = (win) => actions.add(mapWindow(win));
    const onchange = (win) => actions.change(mapWindow(win));

    this.core.on('osjs/application:launch', onlaunch);
    this.core.on('osjs/application:launched', onlaunched);
    this.core.on('osjs/window:destroy', ondestroy);
    this.core.on('osjs/window:render', oncreate);
    this.core.on('osjs/window:change', onchange);

    this.on('destroy', () => {
      this.core.off('osjs/application:launch', onlaunch);
      this.core.off('osjs/application:launched', onlaunched);
      this.core.off('osjs/window:destroy', ondestroy);
      this.core.off('osjs/window:render', oncreate);
      this.core.off('osjs/window:change', onchange);
    });
  }

  render(state, actions) {
    const __ = this.core.has('osjs/locale')
      ? this.core.make('osjs/locale').translatable(languages)
      : s => s;

    const windows = state.windows.map(w => h('div', {
      'data-has-image': w.icon ? true : undefined,
      'data-focused': w.focused ? 'true' : 'false',
      'data-minimized': w.state.minimized ? 'true' : 'false',
      onclick: () => w.raise(),
      oncontextmenu: ev => {
        const _ = this.core.make('osjs/locale').translate;

        ev.stopPropagation();
        ev.preventDefault();
        this.core.make('osjs/contextmenu').show({
          position: ev.target,
          menu: [
            {
              label: w.state.maximized ? _('LBL_RESTORE') : _('LBL_MAXIMIZE'),
              onclick: () => w.attributes.maximizable ? (w.state.maximized ? w.restore() : w.maximize()) : null,
              disabled: !w.attributes.maximizable
            },
            {
              label: w.state.minimized ? _('LBL_RAISE') : _('LBL_MINIMIZE'),
              onclick: () => w.attributes.minimizable ? (w.state.minimized ? w.raise() : w.minimize()) : null,
              disabled: !w.attributes.minimizable
            },
            {type: 'separator'},
            {
              label: _('LBL_CLOSE'),
              onclick: () => w.attributes.closeable ? w.close() : null,
              disabled: !w.attributes.closeable
            }
          ]
        });
      },
      className: 'osjs-panel-item--clickable osjs-panel-item--icon'
    }, [
      h('img', {
        src: w.icon,
        alt: w.title || '(window)',
      }),
      h('span', {}, w.title || '(window)'),
    ]));

    const special = state.launchers.map(name => h('div', {
    }, h('span', {}, __('LBL_LAUNCHING', name))));

    const children = [...windows, ...special];

    return super.render('windows', children);
  }

}


/**
 * Tray
 *
 * @desc Tray Panel Item
 */
class TrayPanelItem extends PanelItem {

  init() {
    if (this.inited) {
      return;
    }

    const actions = super.init({
      tray: this.core.make('osjs/tray').list()
    }, {
      setTray: tray => state => ({tray})
    });

    this.core.on('osjs/tray:update', list => actions.setTray(list));
  }

  render(state, actions) {
    const child = entry => h('div', {
      onclick: ev => entry.onclick(ev, entry),
      oncontextmenu: ev => entry.oncontextmenu(ev, entry),
      className: 'osjs-panel-item--clickable osjs-panel-item--icon'
    }, h('img', {
      src: entry.icon,
      title: entry.title
    }));

    return super.render('tray', state.tray.map(child));
  }

}


/**
 * Clock
 *
 * @desc Clock Panel Item
 */
class ClockPanelItem extends PanelItem {

  init() {
    const {format} = this.core.make('osjs/locale');
    const date = () => format(new Date(), 'longTime');

    if (this.inited) {
      return;
    }

    const actions = super.init({
      time: date()
    }, {
      increment: () => state => {
        return {time: date()};
      }
    });

    this.interval = setInterval(() => {
      actions.increment();
    }, 1000);
  }

  destroy() {
    this.interval = clearInterval(this.interval);
    super.destroy();
  }

  render(state, actions) {
    return super.render('clock', [
      h('span', {}, state.time)
    ]);
  }

}




const sortBy = fn => (a, b) => -(fn(a) < fn(b)) || +(fn(a) > fn(b));
const sortByLabel = iter => String(iter.label).toLowerCase();

const makeTree = (core, icon, __) => {
  const configuredCategories = core.config('application.categories');
  const locale = core.make('osjs/locale');

  const getIcon = (m, fallbackIcon) => m.icon
    ? (m.icon.match(/^(https?:)\//)
      ? m.icon
      : core.url(m.icon, {}, m))
    : fallbackIcon;

  const getTitle = (item) => locale
    .translatableFlat(item.title, item.name);

  const getCategory = (cat) => locale
    .translate(cat);

  const createCategory = c => ({
    icon: c.icon ? {name: c.icon} : icon,
    label: getCategory(c.label),
    items: []
  });

  const createItem = m => ({
    icon: getIcon(m, icon),
    label: getTitle(m),
    data: {
      name: m.name
    }
  });

  const createCategoryTree = (metadata) => {
    const categories = {};

    metadata
      .filter(m => m.hidden !== true)
      .forEach((m) => {
        const cat = Object.keys(configuredCategories).find(c => c === m.category) || 'other';
        const found = configuredCategories[cat];

        if (!categories[cat]) {
          categories[cat] = createCategory(found);
        }

        categories[cat].items.push(createItem(m));
      });

    Object.keys(categories).forEach(k => {
      categories[k].items.sort(sortBy(sortByLabel));
    });

    const result = Object.values(categories);
    result.sort(sortBy(sortByLabel));

    return result;
  };

  const createFlatMenu = (metadata) => {
    const pinned = [
      ...core.config('application.pinned', [])
      // TODO: User configurable pinned items
    ];

    const items = metadata
      .filter(m => pinned.indexOf(m.name) !== -1)
      .map(createItem);

    if (items.length) {
      items.sort(sortBy(sortByLabel));
      return [
        {type: 'separator'},
        ...items
      ];
    }

    return [];
  };

  const createSystemMenu = () => ([{
    type: 'separator'
  }, {
    icon,
    label: __('LBL_SAVE_AND_LOG_OUT'),
    data: {
      action: 'saveAndLogOut'
    }
  }, {
    icon,
    label: __('LBL_LOG_OUT'),
    data: {
      action: 'logOut'
    }
  }]);

  return (metadata) => {
    const categories = createCategoryTree(metadata);
    const flat = createFlatMenu(metadata);
    const system = createSystemMenu();

    return [
      ...categories,
      ...flat,
      ...system
    ];
  };
};

/**
 * Menu
 *
 * @desc Menu Panel Item
 */
class MenuPanelItem extends PanelItem {

  render(state, actions) {
    const _ = this.core.make('osjs/locale').translate;
    const __ = this.core.make('osjs/locale').translatable(languages);
    const icon = this.options.icon || defaultIcon;

    const logout = async (save) => {
      if (save) {
        await this.core.make('osjs/session').save();
      }

      this.core.make('osjs/auth').logout();
    };

    const makeMenu = makeTree(this.core, icon, __);

    const onclick = (ev) => {
      const packages = this.core.make('osjs/packages')
        .getPackages(m => (!m.type || m.type === 'application'));

      this.core.make('osjs/contextmenu').show({
        menu: makeMenu([].concat(packages)),
        position: ev.target,
        callback: (item) => {
          const {name, action} = item.data || {};

          if (name) {
            this.core.run(name);
          } else if (action === 'saveAndLogOut') {
            logout(true);
          } else if (action === 'logOut') {
            logout(false);
          }
        },
        toggle: true
      });
    };

    const onmenuopen = () => {
      const els = Array.from(this.panel.$element.querySelectorAll('.osjs-panel-item[data-name="menu"]'));
      els.forEach(el => el.querySelector('.osjs-panel-item--icon').click());
    };

    this.core.on('osjs/desktop:keybinding:open-application-menu', onmenuopen);
    this.on('destroy', () => this.core.off('osjs/desktop:keybinding:open-application-menu', onmenuopen));

    return super.render('menu', [
      h('div', {
        onclick,
        className: 'osjs-panel-item--clickable osjs-panel-item--icon'
      }, [
        h('img', {
          src: icon,
          alt: _('LBL_MENU')
        }),
        h('span', {}, _('LBL_MENU'))
      ])
    ]);
  }

}


/**
 * Panel Service Provider
 *
 * @desc Provides methods to handle panels on a desktop in OS.js
 */
class PanelServiceProvider {

  constructor(core, args = {}) {
    this.core = core;
    this.panels = [];
    this.inited = false;
    this.registry = {menu: MenuPanelItem,
      windows: WindowsPanelItem,
      tray: TrayPanelItem,
      clock: ClockPanelItem, ...args.registry || {}};
  }

  destroy() {
    this.inited = false;
    this.panels.forEach(panel => panel.destroy());
    this.panels = [];
  }

  async init() {
    this.core.singleton('osjs/panels', () => ({
      register: (name, classRef) => {
        if (this.registry[name]) {
          console.warn('Overwriting previously registered panel item', name);
        }

        this.registry[name] = classRef;
      },

      removeAll: () => {
        this.panels.forEach(p => p.destroy());
        this.panels = [];
      },

      remove: (panel) => {
        const index = typeof panel === 'number'
          ? panel
          : this.panels.findIndex(p => p === panel);

        if (index >= 0) {
          this.panels[index].destroy();
          this.panels.splice(index, 1);
        }
      },

      create: (options) => {
        const panel = new Panel(this.core, options);

        this.panels.push(panel);

        panel.on('destroy', () => this.core.emit('osjs/panel:destroy', panel, this.panels));
        panel.on('create', () => setTimeout(() => {
          this.core.emit('osjs/panel:create', panel, this.panels);
        }, 1));

        if (this.inited) {
          panel.init();
        }
      },

      save: () => {
        const settings = this.core.make('osjs/settings');
        const panels = this.panels.map(panel => panel.options);

        return Promise.resolve(settings.set('osjs/desktop', 'panels', panels))
          .then(() => settings.save());
      },

      get: (name) => this.registry[name]
    }));
  }

  start() {
    this.inited = true;
    this.panels.forEach(p => p.init());
  }

}

export {ClockPanelItem, MenuPanelItem, Panel, PanelItem, PanelServiceProvider, TrayPanelItem, WindowsPanelItem};
