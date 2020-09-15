
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

		this.settings = game.settings.get("Whetstone", 'settings');
	}

	register(module, data) {

		if ( !module ) throw new Error("Whetstone | You must specify module");

		let moduledata = game.modules.get(module);

		// apply defaults
		data = mergeObject(data, {
			name: (data.name || moduledata.data.name),
			id: (data.name || moduledata.data.name),
			_id: (data.name || moduledata.data.name)
		}, {overwrite:false});


		let data_data = mergeObject(data, {
			name: (data.name || moduledata.data.name),
			title: (data.title || data.name || moduledata.data.title),
			description: moduledata.data.description,
			img: 'modules/Whetstone/images/Whetstone-thumb.png',
			preview: (data.img || 'modules/Whetstone/images/Whetstone-thumb.png'),
			version: moduledata.data.version,
			author: moduledata.data.author,
			authors: moduledata.data.authors,
			dialog: '', config: '',
			hint: '', system: '', version: '', priority: 1,
			author: '', authors: [], styles: [], substyles: [],
			variables: [], presets: [],
			img: '', preview: '', dependencies: {}, systems: {},
			compatible: {}, conflicts: {}, active: false
		}, {overwrite:false});

		console.log('Whetstone | module: ', module, ' - data: ', data);


		if (data_data.variables) {
			for (let i=0, len=data_data.variables.length; i < len; ++i) {
				let cssVar = data_data.variables[i];				

				game.Whetstone.settings.register(data.name, 'variable.'+cssVar.name, {
					name: game.i18n.localize(cssVar.title || cssVar.name),
					hint: game.i18n.localize(cssVar.hint),
					theme: data.name,
					scope: 'client',
					tab: 'colors',
					default: cssVar.value,
					color: cssVar.type,
					type: String,
					choices: data.presets[cssVar.presets] || null,
					config: true
				});
			}
		}

		if (data_data.substyles) {
			for (let i=0, len=data_data.substyles.length; i < len; ++i) {
				let substyle = data_data.substyles[i];				

				game.Whetstone.settings.register(data.name, 'substyle.'+substyle.name, {
					name: game.i18n.localize(substyle.title || substyle.name),
					hint: game.i18n.localize(substyle.hint),
					theme: data.name,
					scope: 'client',
					tab: 'substyle',
					default: substyle.active,
					type: Boolean,
					config: true
				});
			}
		}

		this.insert(new WhetstoneTheme(data, data_data));
	}

	/**
	 * Filter the results in the Compendium pack to only show ones which match a provided search string
	 * @param {string} themeid    The theme's id
	 */
	activate(themeid) {

		let moduledata = this.get(themeid);
		if(!moduledata) throw new Error("Whetstone | Cannot activate theme: "+themeid);

		moduledata.update({active: true});

		let corestyles = this.getCoreStyles(themeid);
		let systemstyles = this.getSubStyles(themeid, game.system.id, game.system.data.version);
		let allstyles = corestyles.concat(systemstyles);

		for (let i=0, len=allstyles.length; i < len; ++i) {
			game.Whetstone.themes.addStyle(allstyles[i]);
		}
	}

	deactivate(themeid) {

		let moduledata = this.get(themeid);
		if(!moduledata) throw new Error("Whetstone | Cannot deactivate theme: "+themeid);

		moduledata.update({active: false});

		let corestyles = this.getCoreStyles(themeid);
		let systemstyles = this.getSubStyles(themeid, game.system.id, game.system.data.version);
		let allstyles = corestyles.concat(systemstyles);

		for (let i=0, len=allstyles.length; i < len; ++i) {
			game.Whetstone.themes.removeStyle(allstyles[i]);
		}
	}

	getCoreStyles(themeid) {
		let moduledata = this.get(themeid);
		if(!moduledata) throw new Error("Whetstone | Cannot find theme: "+themeid);
		return moduledata.data.styles;
	}

	/**
	* Get an array of stylesheets to load
	* @param {string} themeid  theme id
	* @param {string} system    system id
	* @param {string} version   (optional) specific version
	* @return {Array.<String>} a list of stylesheet paths
	**/
	getSubStyles(themeid, system = '', version = '') {

		let moduledata = this.get(themeid);
		if(!moduledata) throw new Error("Whetstone | Cannot find theme: "+themeid);

		let styles = [];
		let matches = [];

		if (system && version) {
			console.log('Whetstone | system && version', system, version);
			matches = moduledata.data.substyles.filter(
				substyle => substyle.system == system && (substyle.version == version || isNewerVersion(version, substyle.version))
			);
			console.log('Whetstone | filter', matches);

			matches = matches ? matches.filter(substyle => substyle.activate == 'auto' || substyle.active) : [];


		} else if (system && !version) {
			console.log('Whetstone | system && !version', system, version);
			matches = moduledata.data.substyles.filter(substyle => substyle.system == system && !substyle.version);

			console.log('Whetstone | filter', matches);
			matches = matches ? matches.filter(substyle => substyle.activate == 'auto' || substyle.active) : [];


		} else {
			console.log('Whetstone | !system && !version', system, version);
			matches = moduledata.data.substyles.filter(substyle => !substyle.system && !substyle.version);

			console.log('Whetstone | filter', matches);
			matches = matches ? matches.filter(substyle => substyle.activate == 'manual' && substyle.active) : [];

		}

		console.log('Whetstone | getSubStyles', matches);

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

	async writeVariables(themeid) {

		let gs = game.Whetstone.settings;
		let theme = game.Whetstone.themes.get(themeid);
		if(!theme) return;

		for ( let setting of gs.settings.values() ) {
		  if (setting.theme !== theme.name) continue;

		  console.log('Whetstone | writeVariables:', setting);

		}
	}

	/**
	* Handle changes to a Setting document to apply them to the world setting storage
	*/
	static socketListeners(socket) {
		socket.on('modifyDocument', response => {
			const { request, path } = response;
			if (request.type !== "WhetstoneThemes") return;
			
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
			label: "WHETSTONE.ThemeEntry",
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
	  ["client", window.localStorage],
	  ["world", new WorldSettingsStorage([])]
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
	if ( !module || !key ) throw new Error("You must specify both module and key portions of the setting");
	data["key"] = key;
	data["module"] = module;
	data["scope"] = ["client", "world"].includes(data.scope) ? data.scope : "client";
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
	if ( !module || !key ) throw new Error("You must specify both module and key portions of the menu");
	data.key = `${module}.${key}`;
	data.module = module;
	if ( !data.type || !(data.type.prototype instanceof FormApplication) ) {
	  throw new Error("You must provide a menu type that is FormApplication instance or subclass");
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
	if ( !module || !key ) throw new Error("You must specify both module and key portions of the setting");
	key = `${module}.${key}`;
	if ( !this.settings.has(key) ) throw new Error("This is not a registered game setting");

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
	if ( !module || !key ) throw new Error("You must specify both module and key portions of the setting");
	key = `${module}.${key}`;
	if ( !this.settings.has(key) ) throw new Error("This is not a registered game setting");

	// Obtain the setting data and serialize the value
	const setting = this.settings.get(key);
	const json = JSON.stringify(value);

	// Broadcast the setting change to others
	if ( setting.scope === "world" ) {
	  await SocketInterface.dispatch("modifyDocument", {
		type: "Setting",
		action: "update",
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
	  if (request.type !== "Setting") return;
	  const {key, value} = result;
	  const setting = game.settings.settings.get(key);
	  switch ( request.action ) {
		case "create":
		case "update":
		  game.settings._update(setting, key, value);
		  break;
		case "delete":
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
});

//Hooks.once('setup', () => {
//});

Hooks.once('ready', () => {
	game.Whetstone = {
		themes: new WhetstoneThemes(),
		settings: new WhetstoneThemeSettings(game.settings.get('Whetstone', 'settings') || [])
	};

	WhetstoneThemes.socketListeners(game.socket);

	WhetstoneCoreConfig.apply(game.settings.get('Whetstone', 'settings'));

	Hooks.callAll('WhetstoneReady');
});

Hooks.once('WhetstoneReady', () => {
	console.log('Whetstone | Ready');

	 game.Whetstone.themes.register('Whetstone', {
		id: 'OceanBlues',
		name: 'OceanBlues',
		title: 'Ocean Blues',
		description: 'An example Style for Whetstone with static colors',
		version: '1.0.0',
		authors: [{ name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }],
		styles: ['modules/Whetstone/styles/OceanBlues.css'],
		variables: [
			{name: '--OceanBlues-bg-color', value: '#3d5a80', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-text-light-color', value: '#98c1d9', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-text-dark-color', value: '#102632', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-text-highlight-color', value: '#72b9d5', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-text-selection-color', value: '#b0c2bd', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-fg-color', value: '#e0fbfc', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-highlight-color', value: '#ee6c4d', type: 'color', presets: 'palette'},
			{name: '--OceanBlues-border-color', value: '#293241', type: 'color', presets: 'palette'}
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
	game.Whetstone.settings.registerMenu('Whetstone', 'OceanBlues', {
		name: game.i18n.localize('WHETSTONE.Config'),
		label: game.i18n.localize('WHETSTONE.ConfigTitle'),
		hint: game.i18n.localize('WHETSTONE.ConfigHint'),
		icon: 'fas fa-paint-brush',
		type: WhetstoneThemeConfigDialog,
		restricted: false
	});

	// Register that this theme's config storage value
	// WhetstoneThemeConfig is provided by Whetstone core
	game.Whetstone.settings.register('Whetstone', 'OceanBlues', {
		name: game.i18n.localize('WHETSTONE.Config'),
		scope: 'client',
		default: WhetstoneThemeConfig.getDefaults,
		type: Object,
		config: false,
		onChange: settings => {
			WhetstoneThemeConfig.apply(settings);
		}
	});
});

Hooks.once('renderSettings', () => {
    $(`<button id="WhetstoneOptionsButton" data-action="whetstone-config" title="${game.i18n.localize("WHETSTONE.Config")}">
    	<i class="fas fa-paint-brush"></i> ${game.i18n.localize("WHETSTONE.Config")}
    </button>`).insertAfter('button[data-action="configure"]').on("click", event => {
    	const menu = game.settings.menus.get('Whetstone.Whetstone');
        if ( !menu ) return ui.notifications.error('No submenu found for the provided key');
        const app = new menu.type();
        return app.render(true);
    });
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
		let settings = this.reset ? defaultOptions : mergeObject(defaultOptions, storedOptions);

		const counts = {all: game.Whetstone.themes.length, active: 0, inactive: 0};

		// Prepare themes
		const themes = game.Whetstone.themes.reduce((arr, m) => {
			const isActive = settings[m.name] === true;
			if ( isActive ) counts.active++;
			else counts.inactive++;

			const theme = duplicate(m.data);
			theme.active = isActive;
			theme.systems = theme.systems || null;
			theme.conflicts = theme.conflicts || null;
			theme.compatible = theme.compatible || null;
			theme.dependencies = theme.dependencies || null;
			return arr.concat([theme]);
		}, []);

		settings.counts = counts;
		settings.themes = themes;
		settings.expanded = this._expanded;
		return settings;
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
		let theme = game.Whetstone.themes.get(moduleid);
		let menuname = theme.data.dialog || 'Whetstone.'+theme.name;

		const menu = game.Whetstone.settings.menus.get(menuname);
		if ( !menu ) return ui.notifications.error('No submenu found for the provided key');
		const app = new menu.type({theme: theme.name});
		return app.render(true);
	}

	async _updateObject(event, formData) {
		await game.settings.set('Whetstone', 'settings', formData);
		ui.notifications.info(game.i18n.localize("WHETSTONE.SaveMessage"));
	}
}


class WhetstoneCoreConfig {

	static get getDefaults() {
		return {

		};
	}

	static get getOptions() {
		return mergeObject(WhetstoneCoreConfig.getDefaults, game.settings.get("Whetstone", "settings"));
	}

	static apply(options) {

		console.log('Whetstone | WhetstoneCoreConfig.apply()', options);

		let activate = [];
		let deactivate = [];

		for (let k in options) {
			let v = options[k];

			let theme = game.Whetstone.themes.get(k);

			if (!theme) continue;

			if (v) {
				activate.push({name: k, priority: options[k+'_priority']});
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
			title: game.i18n.localize("WHETSTONE.ConfigTitle"),
			id: "whetstone-theme-settings",
			template: "modules/Whetstone/templates/theme-settings.html",
			width: 600,
			height: "auto",
			tabs: [
				{navSelector: ".tabs", contentSelector: ".content", initial: "themecolors"}
			]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const gs = game.Whetstone.settings;
		const theme = game.Whetstone.themes.get(this._theme);
		let settings = {
			colors: [],
			settings: [],
			substyles: []
		};

		// Classify all settings
		for ( let setting of gs.settings.values() ) {

		  // Exclude settings the user cannot change
		  if (!setting.config || setting.scope !== "client") continue;
		  if (setting.theme !== theme.name) continue;

		  // Update setting data
		  const s = duplicate(setting);
		  s.value = game.Whetstone.settings.get(s.module, s.key);
		  s.isColor = (['color', 'shades'].includes(s.color));
		  s.type = setting.type instanceof Function ? setting.type.name : "String";
		  s.isCheckbox = setting.type === Boolean;
		  s.isSelect = s.choices !== undefined;
		  s.isRange = (setting.type === Number) && s.range;

		  switch (s.tab) {
		  	case 'colors': settings.colors.push(s); break;
		  	case 'substyles': settings.substyles.push(s); break;
		  	case 'settings': default: settings.settings.push(s); break;
		  }
		}

		// Return data
		return {
		  theme: theme,
		  settings: settings
		};
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
        $('input[type="text"].mv-color-value').change();
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
            if (brother.name == control.prop('name')) continue;

            // no color matches a preset, set to custom
            if (brother.prop('tagName') == 'SELECT') {
                brother.val(control.val());
                if (brother.val() == null) {
                    brother.val('custom');
                }
            } else if (brother.prop('tagName') == 'INPUT' && brother.prop('type') == 'text') {
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
  _onClickSubmenu(event) {
	event.preventDefault();
	const menu = game.settings.menus.get(event.currentTarget.dataset.key);
	if ( !menu ) return ui.notifications.error("No submenu found for the provided key");
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
	event.preventDefault();
	const button = event.target;
	const form = button.form;
	for ( let [k, v] of game.Whetstone.settings.settings.entries() ) {
	  if ( v.config ) {
		let input = form[k];
		if (!input) continue;
		if (input.type === "checkbox") input.checked = v.default;
		else if (input) input.value = v.default;
	  }
	}
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
	for ( let [k, v] of Object.entries(formData) ) {
	  let s = game.Whetstone.settings.settings.get(this._theme + k);
	  if (!s) continue;
	  let current = game.Whetstone.settings.get(s.module, s.key);
	  if ( v !== current ) {
		await game.Whetstone.settings.set(s.module, s.key, v);
	  }
	}
  }
}


class WhetstoneThemeConfig {

	static get getDefaults() {
		return {

		};
	}

	static get getOptions() {
		return mergeObject(WhetstoneCoreConfig.getDefaults, game.settings.get("Whetstone", "settings"));
	}

	static apply(options) {

		console.log('Whetstone | WhetstoneCoreConfig.apply()', options);

		let activate = [];
		let deactivate = [];

		for (let k in options) {
			let v = options[k];

			let theme = game.Whetstone.themes.get(k);

			if (!theme) continue;

			if (v) {
				activate.push({name: k, priority: options[k+'_priority']});
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