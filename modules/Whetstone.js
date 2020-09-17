
class WhetstoneThemes extends EntityCollection {
	constructor(...args) {

		if (!args[0]) args[0] = [];

		super(...args);


		console.log(`+=====================================================+
| __        ___          _       _                    |
| \\ \\      / / |__   ___| |_ ___| |_ ___  _ __   ___  |
|  \\ \\ /\\ / /| '_ \\ / _ \\ __/ __| __/ _ \\| '_ \\ / _ \\ |
|   \\ V  V / | | | |  __/ |_\\__ \\ || (_) | | | |  __/ |
|    \\_/\\_/  |_| |_|\\___|\\__|___/\\__\\___/|_| |_|\\___| |
|                                                     |
+=====================================================+`);

		this.settings = game.settings.get('Whetstone', 'settings');
	}

	register(module, data) {

		if ( !module ) throw new Error('Whetstone | You must specify module');

		let moduledata = game.modules.get(module);

		let themedata = mergeObject({
			name: moduledata.data.name,
			id: (data.name || moduledata.data.name),
			_id: (data.name || moduledata.data.name),
			title: (moduledata.data.title || data.name),
			description: moduledata.data.description,
			img: 'modules/Whetstone/images/Whetstone-thumb.png',
			preview: (data.img || 'modules/Whetstone/images/Whetstone-thumb.png'),
			version: moduledata.data.version,
			author: moduledata.data.author,
			authors: moduledata.data.authors,
			active: false, priority: 1,
			dialog: '',
			styles: [], presets: [],
			variables: [], settings: [], substyles: {},
			systems: {}, dependencies: {},
			compatible: {}, conflicts: {}
		}, data);

		if (themedata.variables) {
			for (let i=0, len=themedata.variables.length; i < len; ++i) {
				this._registerVariable(themedata, themedata.variables[i]);
			}
		}

		if (themedata.settings) {
			for (let i=0, len=themedata.settings.length; i < len; ++i) {
				this._registerSetting(themedata, themedata.settings[i]);
			}
		}

		if (themedata.substyles) {
			for (let substylename in themedata.substyles) {
				this._registerSubstyle(themedata, themedata.substyles[substylename]);
			}
		}

		this.insert(new WhetstoneTheme(themedata, themedata));
	}

	registerVariable(themeid, data) {
		this._registerVariable(game.Whetstone.get(themeid), data);
	}

	_registerVariable(themedata, data) {
		let varData = {
			name: data.name,
			title: game.i18n.localize(data.title || data.name),
			hint: game.i18n.localize(data.hint),
			theme: themedata.name,
			tab: 'variables',
			scope: 'client',
			default: data.value,
			color: data.type,
			type: String,
			config: true
		}

		let presets = themedata.presets[data.presets];
		if (presets) varData.choices = presets;

		game.Whetstone.settings.register(themedata.name+'.variables', data.name, varData);
	}

	registerSetting(themeid, data) {
		this._registerSetting(game.Whetstone.get(themeid), data);
	}

	_registerSetting(themedata, data) {

		let settingData = mergeObject({
			theme: themedata.name,
			tab: 'settings',
		}, data);

		game.Whetstone.settings.register(themedata.name+'.settings', settingData.name, settingData);
	}

	registerSubstyle(themeid, data) {
		this._registerSubstyle(game.Whetstone.get(themeid), data);
	}

	_registerSubstyle(themedata, data) {
		game.Whetstone.settings.register(themedata.name+'.substyles', data.name, {
			name: data.name,
			title: game.i18n.localize(data.title || data.name),
			hint: game.i18n.localize(data.hint),
			theme: themedata.name,
			tab: 'substyles',
			scope: 'client',
			default: data.active,
			type: Boolean,
			config: true
		});
	}

	/**
	 * Filter the results in the Compendium pack to only show ones which match a provided search string
	 * @param {string} themeid    The theme's id
	 */
	activate(themeid) {

		let themedata = this.get(themeid);
		if(!themedata) throw new Error('Whetstone | Cannot activate theme: '+themeid);

		themedata.update({active: true});

		let corestyles = this.getCoreStyles(themeid);
		let systemstyles = this.getSubStyles(themeid, game.system.id, game.system.data.version);
		let allstyles = corestyles.concat(systemstyles);

		// write css vars first
		for ( let setting of game.Whetstone.settings.settings.values() ) {

			if (setting.theme != themedata.name) continue;

			let current = game.Whetstone.settings.get(themedata.name+'.'+setting.tab, setting.key);

			if (setting.tab == 'variables') {
				if (setting.default == current) {
					//erase custom entry is value == default
					WhetstoneThemes.writeColor(setting, '');
				} else {
					WhetstoneThemes.writeColor(setting, current);
				}
			}
		}

		// add stylesheet
		for (let i=0, len=allstyles.length; i < len; ++i) {
			game.Whetstone.themes.addStyle(allstyles[i]);
		}
	}

	deactivate(themeid) {

		let themedata = this.get(themeid);
		if(!themedata) throw new Error('Whetstone | Cannot deactivate theme: '+themeid);

		themedata.update({active: false});

		let corestyles = this.getCoreStyles(themeid);
		let systemstyles = this.getSubStyles(themeid);
		let allstyles = corestyles.concat(systemstyles);

		// remove theme specific css vars
		for ( let setting of game.Whetstone.settings.settings.values() ) {

			if (setting.theme != themedata.name) continue;

			if (setting.tab == 'variables') {
				WhetstoneThemes.writeColor(setting, '');
			}
		}

		// remove stylsheets
		for (let i=0, len=allstyles.length; i < len; ++i) {
			game.Whetstone.themes.removeStyle(allstyles[i]);
		}

		// remove substyles
	}

	getCoreStyles(themeid) {
		let moduledata = this.get(themeid);
		if(!moduledata) throw new Error('Whetstone | Cannot find theme: '+themeid);
		return moduledata.data.styles;
	}

	/**
	* Get an array of stylesheets to load
	* @param {string} themeid  theme id
	* @param {string} system    (optional) system id
	* @param {string} version   (optional) specific version
	* @return {Array.<String>} a list of stylesheet paths
	* If neither system nor version are specified, all substyles are returned
	**/
	getSubStyles(themeid, system = '', version = '') {

		let themedata = this.get(themeid);
		if(!themedata) throw new Error('Whetstone | Cannot find theme: '+themeid);

		let matches = [];
		for (let substylename in themedata.data.substyles) {
			let substyle = themedata.data.substyles[substylename];

			let enabled = game.Whetstone.settings.get(themedata.name+'.substyles', substylename);

			if (!system && !version) {
				matches.push(substyle);

			} else if (substyle.system == system && (substyle.version == version || isNewerVersion(version, substyle.version)) && enabled) {
				console.log('Whetstone | '+substylename+' | system && version: ', system, version);
				matches.push(substyle);

			} else if (substyle.system == system && !substyle.version && enabled) {
				console.log('Whetstone | '+substylename+' | system only: ', system, version);
				matches.push(substyle);

			} else if (!substyle.system && !substyle.version && enabled) {
				console.log('Whetstone | '+substylename+': ', system, version);
				matches.push(substyle);
			}
		}

		let styles = [];
		if (matches) {
			for (let i=0, len=matches.length; i < len; ++i) {
				styles = styles.concat(matches[i].styles);
				
			}
			return styles;
		}
		return [];
	}
	/**
	* Return the Entity class which is featured as a member of this collection
	* @private
	*/
	get object() {
		return WhetstoneTheme;
	}

	/**
	* The currently active WetstoneTheme instances
	* @return {WetstoneTheme}
	*/
	get active() {
		return this.find(t => t.data.active);
	}

	static get instance() {
		return game.Whetstone.themes;
	}

	async removeStyle(path) {
		/*await SocketInterface.dispatch("modifyDocument", {
			type: "WhetstoneThemes",
			action: "remove",
			data: {path}
		});*/
		this._removeStyle(path);
	}

	async _removeStyle(path) {
		let element = $('head link[href="'+path+'"]');
		if (element) element.remove();
	}

	async addStyle(path) {
		/*await SocketInterface.dispatch("modifyDocument", {
			type: "WhetstoneThemes",
			action: "add",
			data: {path}
		});*/
		this._addStyle(path);
	}

	async _addStyle(path) {
		game.Whetstone.themes.removeStyle(path);
		$('<link href="'+path+'" rel="stylesheet" type="text/css" media="all">').appendTo($('head'));
	}

	static writeColor(settingData, value) {

        if (Array.isArray(settingData)) {
            for (let i = 0; i < settingData.length; i++) {
                if (Array.isArray(value)) {
                    WhetstoneThemes.writeColor(settingData[i], value[i]);
                } else {
                    WhetstoneThemes.writeColor(settingData[i], value);
                }
            }
            return;
        }

        // this will remove custom definitions
        if (settingData.default == value) {
        	value = '';
        }

        if (settingData.color == 'shades') {
			WhetstoneThemes.writeShades(settingData, value);
        }

        if (settingData.color == 'color') {
	        if (value != null && value != '') {
	        	document.documentElement.style.setProperty(settingData.name, value);
	        } else {
	            document.documentElement.style.removeProperty(settingData.name);
	        }
	    }
    }

    static writeShades(settingData, value) {

    	let colors = {
            value: '',
            quarter: '',
            half: '',
            threequarter: '',
            shadow: '',
            dark: '',
            light: '',
            darker: '',
            lighter: ''
        };

        if (value) {
			let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);

	        let r = parseInt(result[1], 16);
	        let g = parseInt(result[2], 16);
	        let b = parseInt(result[3], 16);

	        r /= 255, g /= 255, b /= 255;
	        let max = Math.max(r, g, b), min = Math.min(r, g, b);
	        let h, s, l = (max + min) / 2;

	        if(max == min){
	            h = s = 0; // achromatic
	        } else {
	            let d = max - min;
	            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	            switch(max) {
	                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	                case g: h = (b - r) / d + 2; break;
	                case b: h = (r - g) / d + 4; break;
	            }
	            h /= 6;
	        }
	        s = Math.round(s * 100);
	        l = Math.round(l * 100);
	        h = Math.round(h * 360);
	        let a = 1;

	        colors = {
	            value: 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')',
	            quarter: 'hsla(' + h + ', ' + s + '%, ' + l + '%, 0.25)',
	            half: 'hsla(' + h + ', ' + s + '%, ' + l + '%, 0.5)',
	            threequarter: 'hsla(' + h + ', ' + s + '%, ' + l + '%, 0.75)',
	            shadow: 'hsla(' + h + ', ' + s + '%, 25%, ' + a + ')',
	            dark: 'hsla(' + h + ', ' + s + '%, 25%, 0.5)',
	            light: 'hsla(' + h + ', 100%, 50%, ' + a + ')',
	            darker: 'hsla(' + h + ', ' + s + '%, ' + Math.max(0, (l - 10)) + '%, ' + a + ')',
	            lighter: 'hsla(' + h + ', ' + s + '%, ' + Math.min(100, (l + 10)) + '%, ' + a + ')'
	        }
	    }

        for (let colortype in colors) {
            let value = colors[colortype];
            let propname = settingData.name+(colortype != 'value' ? '-'+colortype : '');

            if (value != null && value != '') {
	            document.documentElement.style.setProperty(propname, value);
	        } else {
	            document.documentElement.style.removeProperty(propname);
	        }
        }
    }

	static toggleConfigButton(shown) {

		let button = $('#WhetstoneOptionsButton');
		if (button) button.remove();

		if (shown) {
			$(`<button id="WhetstoneOptionsButton" data-action="whetstone-config" title="${game.i18n.localize("WHETSTONE.Config")}">
				<i class="fas fa-paint-brush"></i> ${game.i18n.localize("WHETSTONE.Config")}
			</button>`).insertAfter('button[data-action="configure"]').on("click", event => {
				const menu = game.settings.menus.get('Whetstone.Whetstone');
				if ( !menu ) return ui.notifications.error('No submenu found for the provided key');
				const app = new menu.type();
				return app.render(true);
			});
		}
	}

	/**
	* Handle changes to a Setting document to apply them to the world setting storage
	*/
	static socketListeners(socket) {
		socket.on('modifyDocument', response => {
			const { request, path } = response;
			if (request.type !== 'WhetstoneThemes') return;
			
			switch ( request.action ) {
				case "add":
					game.Whetstone.themes._addStyle(path);
					break;
				case "remove":
					game.Whetstone.themes._removeStyle(path);
				break;
			}
		});
	}
}

class WhetstoneTheme extends Entity {
	/**
	* Configure the attributes of the JournalEntry Entity
	*
	* @returns {Entity} baseEntity       The parent class which directly inherits from the Entity interface.
	* @returns {EntityCollection} collection   The EntityCollection class to which Entities of this type belong.
	* @returns {Array} embeddedEntities  The names of any Embedded Entities within the Entity data structure.
	*/
	static get config() {
		return {
			baseEntity: WhetstoneTheme,
			collection: game.Whetstone.themes,
			embeddedEntities: {},
			label: 'WHETSTONE.ThemeEntry',
			permissions: {}
		};
	}

	/** @override */
	async delete(options) {
		if ( this.active ) {
			game.Whetstone.themes.deactivate(this.name);
		}
		return super.delete(options);
	}
}


/**
 * An abstract interface for managing defined game settings or settings menus for different packages.
 * Each setting is a string key/value pair belonging to a certain package and a certain store scope.
 *
 * When Foundry Virtual Tabletop is initialized, a singleton instance of this class is constructed within the global
 * Game object as as game.settings.
 *
 * @see {@link Game#settings}
 * @see {@link Settings}
 * @see {@link SettingsConfig}
 */
 
class WhetstoneThemeSettings {
  constructor(worldSettings) {

	/**
	 * A object of registered game settings for this scope
	 * @type {Map}
	 */
	this.settings = new Map();

	/**
	 * Registered settings menus which trigger secondary applications
	 * @type {Map}
	 */
	this.menus = new Map();

	/**
	 * The storage interfaces used for persisting settings
	 * Each storage interface shares the same API as window.localStorage
	 */
	this.storage = new Map([
	  ['client', window.localStorage],
	  ['world', new WorldSettingsStorage([])]
	]);
  }

  /* -------------------------------------------- */

  /**
   * Return a singleton instance of the Game Settings Configuration app
   * @return {SettingsConfig}
   */
  get sheet() {
	if ( !this._sheet ) this._sheet = new SettingsConfig();
	return this._sheet;
  }

  /* -------------------------------------------- */

  /**
   * Register a new game setting under this setting scope
   *
   * @param {string} module   The namespace under which the setting is registered
   * @param {string} key      The key name for the setting under the namespace module
   * @param {Object} data     Configuration for setting data
   *
   * @example
   * // Register a client setting
   * game.settings.register("myModule", "myClientSetting", {
   *   name: "Register a Module Setting with Choices",
   *   hint: "A description of the registered setting and its behavior.",
   *   scope: "client",     // This specifies a client-stored setting
   *   config: true,        // This specifies that the setting appears in the configuration view
   *   type: String,
   *   choices: {           // If choices are defined, the resulting setting will be a select menu
   *     "a": "Option A",
   *     "b": "Option B"
   *   },
   *   default: "a",        // The default value for the setting
   *   onChange: value => { // A callback function which triggers when the setting is changed
   *     console.log(value)
   *   }
   * });
   *
   * @example
   * // Register a world setting
   * game.settings.register("myModule", "myWorldSetting", {
   *   name: "Register a Module Setting with a Range slider",
   *   hint: "A description of the registered setting and its behavior.",
   *   scope: "world",      // This specifies a world-level setting
   *   config: true,        // This specifies that the setting appears in the configuration view
   *   type: Number,
   *   range: {             // If range is specified, the resulting setting will be a range slider
   *     min: 0,
   *     max: 100,
   *     step: 10
   *   }
   *   default: 50,         // The default value for the setting
   *   onChange: value => { // A callback function which triggers when the setting is changed
   *     console.log(value)
   *   }
   * });
   */
  register(module, key, data) {
	if ( !module || !key ) throw new Error('You must specify both module and key portions of the setting');
	data['key'] = key;
	data['module'] = module;
	data['scope'] = ['client', 'world'].includes(data.scope) ? data.scope : 'client';
	this.settings.set(`${module}.${key}`, data);
  }

  /* -------------------------------------------- */

  /**
   * Register a new sub-settings menu
   *
   * @param {string} module   The namespace under which the menu is registered
   * @param {string} key      The key name for the setting under the namespace module
   * @param {Object} data     Configuration for setting data
   *
   * @example
   * // Define a settings submenu which handles advanced configuration needs
   * game.settings.registerMenu("myModule", "mySettingsMenu", {
   *   name: "My Settings Submenu",
   *   label: "Settings Menu Label",      // The text label used in the button
   *   hint: "A description of what will occur in the submenu dialog.",
   *   icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
   *   type: MySubmenuApplicationClass,   // A FormApplication subclass which should be created
   *   restricted: true                   // Restrict this submenu to gamemaster only?
   * });
   */
  registerMenu(module, key, data) {
	if ( !module || !key ) throw new Error('You must specify both module and key portions of the menu');
	data.key = `${module}.${key}`;
	data.module = module;
	if (!data.type) data.type = WhetstoneThemeConfigDialog;
	if (!data.type || !(data.type.prototype instanceof FormApplication) ) {
	  throw new Error('You must provide a menu type that is FormApplication instance or subclass');
	}
	this.menus.set(data.key, data);
  }

  /* -------------------------------------------- */

  /**
   * Get the value of a game setting for a certain module and setting key
   *
   * @param module {String}   The module namespace under which the setting is registered
   * @param key {String}      The setting key to retrieve
   *
   * @example
   * // Retrieve the current setting value
   * game.settings.get("myModule", "myClientSetting");
   */
  get(module, key) {
	if ( !module || !key ) throw new Error('You must specify both module and key portions of the setting');
	key = `${module}.${key}`;
	if ( !this.settings.has(key) ) throw new Error('This is not a registered game setting');

	// Get the setting and the correct storage interface
	const setting = this.settings.get(key);
	const storage = this.storage.get(setting.scope);

	// Get the setting value
	let value = storage.getItem(key);
	value = value !== null ? JSON.parse(value) : setting.default;

	// Cast the value to a requested type
	return setting.type ? setting.type(value) : value;
  }

  /* -------------------------------------------- */

  /**
   * Set the value of a game setting for a certain module and setting key
   *
   * @param module {String}   The module namespace under which the setting is registered
   * @param key {String}      The setting key to retrieve
   * @param value             The data to assign to the setting key
   *
   * @example
   * // Update the current value of a setting
   * game.settings.set("myModule", "myClientSetting", "b");
   */
  async set(module, key, value) {
	if ( !module || !key ) throw new Error('You must specify both module and key portions of the setting');
	key = `${module}.${key}`;
	if ( !this.settings.has(key) ) throw new Error('This is not a registered game setting');

	// Obtain the setting data and serialize the value
	const setting = this.settings.get(key);
	const json = JSON.stringify(value);

	// Broadcast the setting change to others
	if ( setting.scope === 'world' ) {
	  await SocketInterface.dispatch('modifyDocument', {
		type: 'Setting',
		action: 'update',
		data: {key, value: json}
	  });
	}
	this._update(setting, key, json);

	// Return the updated value
	return value;
  }

  /* -------------------------------------------- */

  /**
   * Locally update a setting given a provided key and value
   * @param {Object} setting
   * @param {string} key
   * @param {*} value
   */
  _update(setting, key, value) {
	const storage = this.storage.get(setting.scope);
	storage.setItem(key, value);
	value = JSON.parse(value);
	if ( setting.onChange instanceof Function ) setting.onChange(value);
	return value;
  }

  /* -------------------------------------------- */

  /**
   * Handle changes to a Setting document to apply them to the world setting storage
   */
  static socketListeners(socket) {
	socket.on('modifyDocument', response => {
	  const { request, result } = response;
	  if (request.type !== 'Setting') return;
	  const {key, value} = result;
	  const setting = game.settings.settings.get(key);
	  switch ( request.action ) {
		case 'create':
		case 'update':
		  game.settings._update(setting, key, value);
		  break;
		case 'delete':
		  const storage = game.settings.storage.get(setting.scope);
		  delete storage.data[key];
		  break;
	  }
	});
  }
}

Hooks.once('init', () => {

	CONFIG.WhetstoneThemes = {
		entityClass: WhetstoneTheme,
		collection: WhetstoneThemes
	};

	game.settings.registerMenu('Whetstone', 'Whetstone', {
		name: game.i18n.localize('WHETSTONE.Config'),
		label: game.i18n.localize('WHETSTONE.ConfigTitle'),
		hint: game.i18n.localize('WHETSTONE.ConfigHint'),
		icon: 'fas fa-paint-brush',
		type: WhetstoneCoreConfigDialog,
		restricted: false
	});

	game.settings.register('Whetstone', 'settings', {
		name: game.i18n.localize('WHETSTONE.Config'),
		scope: 'client',
		default: WhetstoneCoreConfig.getDefaults,
		type: Object,
		config: false,
		onChange: settings => {
			WhetstoneCoreConfig.apply(settings);
		}
	});

	// add menu button
    game.settings.register('Whetstone', 'addMenuButton', {
		name: 'WHETSTONE.AddMenuButton',
		hint: 'WHETSTONE.AddMenuButtonHint',
		scope: 'world',
		config: true,
		default: true,
		type: Boolean,
		onChange: enabled => {
			WhetstoneThemes.toggleConfigButton(enabled);
		}
    });
});

//Hooks.once('setup', () => {
//});

Hooks.once('ready', () => {
	game.Whetstone = {
		themes: new WhetstoneThemes(),
		settings: new WhetstoneThemeSettings(game.settings.get('Whetstone', 'settings') || [])
	};

	WhetstoneThemes.socketListeners(game.socket);
	Hooks.callAll('WhetstoneReady');
	WhetstoneCoreConfig.apply(game.settings.get('Whetstone', 'settings'));
});

Hooks.once('WhetstoneReady', () => {
	console.log('Whetstone | Ready');

	 game.Whetstone.themes.register('Whetstone', {
		id: 'OceanBlues',
		name: 'OceanBlues',
		title: 'Ocean Blues',
		description: 'An example Style for Whetstone with variable colors',
		version: '1.0.0',
		authors: [{ name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }],
		styles: ['modules/Whetstone/styles/OceanBlues.css'],
		substyles: {
			'OceanBlues-Hotbar': {
                name: 'OceanBlues-Hotbar',
                title: 'OCEANBLUES.SubstyleHotbar',
                hint: 'OCEANBLUES.SubstyleHotbarHint',
                active: true,
                styles: [
                    'modules/Whetstone/styles/OceanBlues-Hotbar.css'
                ]
            },
            'OceanBlues-Toolbar': {
                name: 'OceanBlues-Toolbar',
                title: 'OCEANBLUES.SubstyleToolbar',
                hint: 'OCEANBLUES.SubstyleToolbarHint',
                active: true,
                styles: [
                    'modules/Whetstone/styles/OceanBlues-Toolbar.css'
                ]
            },
            'OceanBlues-SceneButtons': {
                name: 'OceanBlues-SceneButtons',
                title: 'OCEANBLUES.SubstyleSceneButtons',
                hint: 'OCEANBLUES.SubstyleSceneButtonsHint',
                active: true,
                styles: [
                    'modules/Whetstone/styles/OceanBlues-SceneButtons.css'
                ]
            },
            'OceanBlues-SceneButtonsSmaller': {
                name: 'OceanBlues-SceneButtonsSmaller',
                title: 'OCEANBLUES.SubstyleSceneButtonsSmaller',
                hint: 'OCEANBLUES.SubstyleSceneButtonsSmallerHint',
                active: false,
                styles: [
                    'modules/Whetstone/styles/OceanBlues-SceneButtonsSmaller.css'
                ]
            }
        },
		variables: [
			{
				name: '--OceanBlues-bg-color',
				title: 'Background Color',
				hint: 'Used in sheet headers, tinges the background.',
				value: '#3d5a80', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-text-light-color',
				title: 'Text Color - Light',
				hint: 'Used for text on dark background.',
				value: '#98c1d9', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-text-dark-color',
				title: 'Text Color - Dark',
				hint: 'Used for text on light backgrounds.',
				value: '#102632', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-text-highlight-color',
				title: 'Text Highlight Color',
				hint: '',
				value: '#72b9d5', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-text-selection-color',
				title: 'Text Selection Color',
				hint: '',
				value: '#b0c2bd', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-fg-color',
				title: 'Foreground Color',
				hint: 'Used for textboxes and input fields',
				value: '#e0fbfc', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-highlight-color',
				title: 'Highlight Color',
				hint: 'Used for highlighter colro when hovering over hyperlinks or interface elements.',
				value: '#ee6c4d', type: 'color', presets: 'palette'
			}, {
				name: '--OceanBlues-border-color',
				title: 'Border Color',
				hint: '',
				value: '#293241', type: 'color', presets: 'palette'
			}
		],
 
		presets: {
			palette: {
				'#3d5a80': 'Bdazzled Blue',
				'#98c1d9': 'Pale Cerulean',
				'#102632': 'Charcoal',
				'#72b9d5': 'Dark Sky Blue',
				'#b0c2bd': 'Opal',
				'#e0fbfc': 'Light Cyan',
				'#ee6c4d': 'Burnt Sienna',
				'#293241': 'Gunmetal'
			},
            sheetColorPresets: {
                "#fffbce": "Standard Tan",
                "#ff9d9d": "Trainer Red",
                "#e4a089": "Rocky Brown",
                "#f4ce88": "Mousy Yellow",
                "#68c098": "Misty Green",
                "#b5dc92": "Buggy Green",
                "#58d0d0": "Trainer Blue",
                "#c0a5da": "Trainer Purple",
                "#eee6dd": "Eggy Shell White",
                "#f0ace6": "Balloon Pink",
                "#c0c0c0": "Steely Grey",
                "#525252": "Edgy Black"
            }
		},
		dialog: '',
		config: '',
		img: 'modules/Whetstone/images/Whetstone-thumb.png',
		preview: 'modules/Whetstone/images/OceanBlues-preview.png',
		dependencies: {},
		systems: { 'core': '0.6.6' },
		compatible: {},
		conflicts: {}
	});

	// Register that this theme has a menu
	// WhetstoneThemeConfigDialog is provided by Whetstone core
	game.Whetstone.settings.registerMenu('OceanBlues', 'OceanBlues', {
		name: game.i18n.localize('WHETSTONE.Config'),
		label: game.i18n.localize('WHETSTONE.ConfigTitle'),
		hint: game.i18n.localize('WHETSTONE.ConfigHint'),
		icon: 'fas fa-paint-brush',
		type: WhetstoneThemeConfigDialog,
		restricted: false
	});
});

Hooks.once('renderSettings', () => {
	WhetstoneThemes.toggleConfigButton(game.settings.get('Whetstone', 'addMenuButton'));
});

class WhetstoneCoreConfigDialog extends FormApplication {
	constructor(...args) {
		super(...args);
		this._expanded = false;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: game.i18n.localize('WHETSTONE.Config'),
			id: 'WhetstoneCoreConfig',
			template: 'modules/Whetstone/templates/settings.html',
			width: 680,
			height: 'auto',
			closeOnSubmit: true,
			scrollY: [".theme-list"],
			tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "themeselect"}]
		});
	}

	getData(options) {
		let storedOptions = game.settings.get('Whetstone', 'settings');
		let defaultOptions = WhetstoneCoreConfig.getDefaults;
    	const canConfigure =  game.user.can('SETTINGS_MODIFY');

		const counts = {all: game.Whetstone.themes.length, active: 0, inactive: 0};

		// Prepare themes
		const themes = game.Whetstone.themes.reduce((arr, m) => {
			const isActive = storedOptions[m.name] === true;
			if ( isActive ) counts.active++;
			else counts.inactive++;

			const theme = duplicate(m.options);
			theme.active = isActive;
			return arr.concat([theme]);
		}, []);

		storedOptions.counts = counts;
		storedOptions.themes = themes;
		storedOptions.expanded = this._expanded;

		// prepare core settings
		storedOptions.globaloptions = [];

		// load up all Whetstone core settings
		for ( let setting of game.settings.settings.values() ) {

		  // Exclude settings the user cannot change
		  if (!setting.config || (!canConfigure && (setting.scope !== 'client'))) continue;
		  if (setting.module !== 'Whetstone') continue;

		  // Update setting data
		  const s = duplicate(setting);
		  s.value = this.reset ? s.default : game.settings.get('Whetstone', s.key);
		  s.isColor = (['color', 'shades'].includes(s.color));
		  s.type = setting.type instanceof Function ? setting.type.name : 'String';
		  s.isCheckbox = setting.type === Boolean;
		  s.isSelect = s.choices !== undefined;
		  s.isRange = (setting.type === Number) && s.range;
		  s.name = s.title || s.name;

		  switch (s.tab) {
		  	case 'globaloptions': default: storedOptions.globaloptions.push(s); break;
		  }
		}

		return this.reset ? defaultOptions : mergeObject(defaultOptions, storedOptions);
	}

	activateListeners(html) {
		super.activateListeners(html);

		html.find('input, select').change(this.onApply.bind(this));
		html.find('button[name="reset"]').click(this.onReset.bind(this));
		html.find('button.expand').click(this._onExpandCollapse.bind(this));
		html.find('button.theme-configure').click(this._onOpenConfig.bind(this));

		this.reset = false;
	}

	onApply(event) {
		event.preventDefault();
	}

	onReset() {
		this.reset = true;
		this.render();
	}

	_onExpandCollapse(event) {
		event.preventDefault();
		this._expanded = !this._expanded;
		this.render();
	}

	_onOpenConfig(event) {
		event.preventDefault();

		let moduleid = $(event.target).val();
		if (!moduleid) moduleid = $(event.target).parent().val();
		let theme = game.Whetstone.themes.get(moduleid);
		let menuname = theme.data.dialog || moduleid+'.'+theme.name;

		const menu = game.Whetstone.settings.menus.get(menuname);
		if ( !menu ) return ui.notifications.error('No submenu found for the provided key');
		const app = new menu.type({theme: theme.name});
		return app.render(true);
	}

	async _updateObject(event, formData) {
		await game.settings.set('Whetstone', 'settings', formData);
		ui.notifications.info(game.i18n.localize('WHETSTONE.SaveMessage'));
	}
}


class WhetstoneCoreConfig {

	static get getDefaults() {
		return {
			addMenuButton: true
		};
	}

	static get getOptions() {
		return mergeObject(WhetstoneCoreConfig.getDefaults, game.settings.get('Whetstone', 'settings'));
	}

	static apply(options) {

		console.log('Whetstone | WhetstoneCoreConfig.apply()', options);

		WhetstoneThemes.toggleConfigButton(options.addMenuButton);
		game.settings.set('Whetstone', 'addMenuButton', options.addMenuButton);

		let activate = [];
		let deactivate = [];

		for (let k in options) {
			let v = options[k];

			let theme = game.Whetstone.themes.get(k);

			if (!theme) continue;

			if (v) {
				activate.push({name: k, priority: options[k+'_priority']});
				deactivate.push(k);
			} else {
				deactivate.push(k);
			}
		}

		// sort by priority first, then name in alphabetical
		if (activate.length > 0) {
			activate.sort((a, b) => (a.priority > b.priority) ? 1 : (a.priority === b.priority) ? ((a.name > b.name) ? 1 : -1) : -1);
		}

		console.log('Whetstone | activate', activate);
		console.log('Whetstone | deactivate', deactivate);

		if (deactivate.length > 0) {
			for (let i=0, len=deactivate.length; i < len; ++i) {
				game.Whetstone.themes.deactivate(deactivate[i]);
			}
		}

		if (activate.length > 0) {
			for (let i=0, len=activate.length; i < len; ++i) {
				game.Whetstone.themes.activate(activate[i].name);
			}
		}
	}
}

/**
 * A game settings configuration application
 * This form renders the settings defined via the game.settings.register API which have config = true
 *
 * @extends {FormApplication}
 */
class WhetstoneThemeConfigDialog extends FormApplication {
	constructor(...args) {
		super(...args);
		this._theme = args[0].theme;
	}


	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: game.i18n.localize('WHETSTONE.ConfigTitle'),
			id: 'WhetstoneThemeConfigDialog',
			template: 'modules/Whetstone/templates/theme-settings.html',
			width: 530,
			height: 'auto',
			tabs: [
				{navSelector: '.tabs', contentSelector: '.content', initial: 'themecolors'}
			]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const gs = game.Whetstone.settings;
		const theme = game.Whetstone.themes.get(this._theme);
		let settings = {
			variables: [],
			settings: [],
			substyles: []
		};
		let currentdata = [];
		let defaultdata = [];

		// Classify all settings
		for ( let setting of gs.settings.values() ) {

			// Exclude settings the user cannot change
			if (!setting.config || setting.scope !== 'client') continue;
			if (setting.theme !== theme.name) continue;

			// Update setting data
			const s = duplicate(setting);
			s.value = this.reset ? s.default : game.Whetstone.settings.get(s.theme+'.'+s.tab, s.key);
			s.isColor = (['color', 'shades'].includes(s.color));
			s.type = setting.type instanceof Function ? setting.type.name : 'String';
			s.isCheckbox = setting.type === Boolean;
			s.isSelect = s.choices !== undefined;
			s.isRange = (setting.type === Number) && s.range;
			s.name = s.title || s.name;

			if (settings[s.tab]) {
				settings[s.tab].push(s);
			} else {
				settings[s.tab] = [s];
			}

			currentdata[s.tab+'/'+s.key] = s.value;
			defaultdata[s.tab+'/'+s.key] = s.default;
		}

		let returndata = this.reset ? defaultdata : mergeObject(defaultdata, currentdata);

		returndata.theme = theme;
		returndata.settings = settings;

		return returndata;
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Open submenu
		html.find('.submenu button').click(this._onClickSubmenu.bind(this));
		// connect color-pickers to validator
        html.find('.ws-color-value').change(this._updateColor.bind(this));
		// Reset Default Values
		html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
		// fix for typed colors not always triggering validation on dialog open
        $('input[type="text"].ws-color-value').change();

        this.reset = false;
	}

	// updates 'brother' controls of the color-picker to all reflect the same values
    _updateColor(event) {
        let control = $(event.target);
        let parentGroup = $(control.parents('.ws-color-input')[0]);

        // validate manual color
        if (control.attr('type') == 'text') {

            let colortest = /^#[0-9A-F]{6}$/i.test(control.val());

            if(!colortest) {
                ui.notifications.warn(game.i18n.localize('WHETSTONE.InvalidColorFormat'));
                control.val('#000000');
            }
        }

        let colorgroup = parentGroup.find('.ws-color-value');

        for (var el = colorgroup.length - 1; el >= 0; el--) {
            let brother = $(colorgroup[el]);

            //skip if setting myself
            if (brother.prop('tagName') == control.prop('tagName')) continue;

            // no color matches a preset, set to custom
            if (brother.prop('tagName') == 'SELECT') {
                brother.val(control.val());
                if (brother.val() == null) {
                    brother.val('custom');
                }
            } else if (brother.prop('type') == 'text') {
                // if custom, set to black at first
                if (control.val() == 'custom') {
                    brother.val('#000000');
                } else {
                    brother.val(control.val());
                }
            } else {
                brother.val(control.val());
            }
        }
    }

  /* -------------------------------------------- */

  /**
   * Handle activating the button to configure User Role permissions
   * @param event {Event}   The initial button click event
   * @private
   */
  async _onClickSubmenu(event) {
	event.preventDefault();
	const menu = await game.settings.menus.get(event.currentTarget.dataset.key);
	if ( !menu ) return ui.notifications.error('No submenu found for the provided key');
	const app = new menu.type();
	return app.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle button click to reset default settings
   * @param event {Event}   The initial button click event
   * @private
   */
  _onResetDefaults(event) {
    this.reset = true;
    this.render();
  }

  /* -------------------------------------------- */

  /** @override */
	async _updateObject(event, formData) {
		for ( let [k, v] of Object.entries(formData) ) {

			let s = game.Whetstone.settings.settings.get(this._theme+'.'+k.split('/').join('.'));
			if (!s) continue;

			let current = game.Whetstone.settings.get(s.theme+'.'+s.tab, s.key);
			if ( v !== current ) {
				await game.Whetstone.settings.set(s.theme+'.'+s.tab, s.key, v);

				if (s.tab == 'variables') {
					WhetstoneThemes.writeColor(s, v);
				}
			}
		}
	}
}