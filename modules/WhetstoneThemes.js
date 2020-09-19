import {WhetstoneTheme} from './WhetstoneTheme.js';

export class WhetstoneThemes extends EntityCollection {
	constructor(...args) {
		if (!args[0]) args[0] = [];
		super(...args);
		this.settings = game.settings.get('Whetstone', 'settings');

		console.log(`+=====================================================+
| __        ___          _       _                    |
| \\ \\      / / |__   ___| |_ ___| |_ ___  _ __   ___  |
|  \\ \\ /\\ / /| '_ \\ / _ \\ __/ __| __/ _ \\| '_ \\ / _ \\ |
|   \\ V  V / | | | |  __/ |_\\__ \\ || (_) | | | |  __/ |
|    \\_/\\_/  |_| |_|\\___|\\__|___/\\__\\___/|_| |_|\\___| |
|                                                     |
+=====================================================+`);
	}

	/**
	 * register a new theme with Whetstone
	 * @param  {String} module module id to associate with them and to pull some information from
	 * @param  {Object} data   properties and settings for new theme
	 * @return {WhetstoneThemes}        global object used for managing WhetstoneWhemes
	 */
	register(module, data) {
		if (!module) throw new Error('Whetstone | You must specify module');

		let moduledata = game.modules.get(module);

		let themedata = mergeObject({
			name: moduledata.data.name,
			id: data.name || moduledata.data.name,
			_id: data.name || moduledata.data.name,
			title: moduledata.data.title || data.name,
			description: moduledata.data.description,
			img: 'modules/Whetstone/images/Whetstone-thumb.png',
			preview: data.img || 'modules/Whetstone/images/Whetstone-thumb.png',
			version: moduledata.data.version,
			author: moduledata.data.author,
			authors: moduledata.data.authors,
			active: false,
			priority: 1,
			dialog: '',
			styles: [],
			presets: [],
			variables: [],
			settings: [],
			substyles: {},
			systems: {},
			dependencies: {},
			compatible: {},
			conflicts: {}
		}, data);

		if (themedata.variables) {
			for (let i = 0, len = themedata.variables.length; i < len; ++i) {
				this._registerVariable(themedata, themedata.variables[i]);
			}
		}

		if (themedata.settings) {
			for (let i = 0, len = themedata.settings.length; i < len; ++i) {
				this._registerSetting(themedata, themedata.settings[i]);
			}
		}

		if (themedata.substyles) {
			for (let substylename in themedata.substyles) {
				this._registerSubstyle(
					themedata,
					themedata.substyles[substylename]
				);
			}
		}

		this.insert(new WhetstoneTheme(themedata, themedata));
	}

	/**
	 * register theme veriable via theme id
	 * @param  {String} themeid theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerVariable(themeid, data) {
		this._registerVariable(game.Whetstone.get(themeid), data);
	}

	/**
	 * register theme veriable via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themedata theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerVariable(themedata, data) {
		let varData = {
			name: data.name,
			title: game.i18n.localize(data.title || data.name),
			hint: game.i18n.localize(data.hint),
			theme: themedata.name,
			tab: 'variables',
			scope: 'client',
			default: data.default || data.value,
			color: data.type,
			type: String,
			config: true
		};

		let presets = themedata.presets[data.presets];
		if (presets) varData.choices = presets;

		game.Whetstone.settings.register(
			themedata.name + '.variables',
			data.name,
			varData
		);
	}

	/**
	 * register theme setting via theme id
	 * @param  {String} themeid theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerSetting(themeid, data) {
		this._registerSetting(game.Whetstone.get(themeid), data);
	}

	/**
	 * register theme setting via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themedata theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerSetting(themedata, data) {
		let settingData = mergeObject({
			theme: themedata.name,
			tab: 'settings'
		}, data);

		game.Whetstone.settings.register(
			themedata.name + '.settings',
			settingData.name,
			settingData
		);
	}

	/**
	 * register theme substyle via theme id
	 * @param  {String} themeid theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerSubstyle(themeid, data) {
		this._registerSubstyle(game.Whetstone.get(themeid), data);
	}

	/**
	 * register theme substyle via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themedata theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerSubstyle(themedata, data) {
		game.Whetstone.settings.register(
			themedata.name + '.substyles',
			data.name,
			{
				name: data.name,
				title: game.i18n.localize(data.title || data.name),
				hint: game.i18n.localize(data.hint),
				theme: themedata.name,
				tab: 'substyles',
				scope: 'client',
				default: data.active,
				type: Boolean,
				config: true
			}
		);
	}

	/**
	 * Enables a given theme by themeid
	 * @param {String} themeid    The theme's id
	 */
	activate(themeid) {
		let themedata = this.get(themeid);
		if (!themedata)
			throw new Error('Whetstone | Cannot activate theme: ' + themeid);

		const allowed = Hooks.call('onThemeActivate', themedata);
		if (allowed === false) return;

		themedata.data.active = true;

		// write css vars first
		for (let setting of game.Whetstone.settings.settings.values()) {
			if (setting.theme != themedata.name) continue;

			let current = game.Whetstone.settings.get(themedata.name + '.' + setting.tab, setting.key);

			if (setting.tab == 'variables') {
				WhetstoneThemes.writeVariable(setting, current);
			}
		}

		let corestyles = this.getCoreStyles(themeid);
		let systemstyles = this.getSubStyles(themeid, game.system.id, game.system.data.version);
		let allstyles = corestyles.concat(systemstyles);

		// add stylesheet
		for (let i = 0, len = allstyles.length; i < len; ++i) {
			game.Whetstone.themes.addStyle(allstyles[i]);
		}
	}

	/**
	 * Disables a given theme by themeid
	 * @param {String} themeid    The theme's id
	 */
	deactivate(themeid) {
		let themedata = this.get(themeid);
		if (!themedata)
			throw new Error('Whetstone | Cannot deactivate theme: ' + themeid);

		const allowed = Hooks.call('onThemeDeactivate', themedata);
		if (allowed === false) return;

		themedata.data.active = false;

		// remove theme specific css vars
		for (let setting of game.Whetstone.settings.settings.values()) {
			if (setting.theme != themedata.name) continue;

			if (setting.tab == 'variables') {
				WhetstoneThemes.writeVariable(setting, '');
			}
		}

		let corestyles = this.getCoreStyles(themeid);
		let systemstyles = this.getSubStyles(themeid, 'all', 'all', false);
		let allstyles = corestyles.concat(systemstyles);

		// remove stylsheets
		for (let i = 0, len = allstyles.length; i < len; ++i) {
			game.Whetstone.themes.removeStyle(allstyles[i]);
		}
	}

	/**
	 * Get an array of core styleshet filenames for a given theme
	 * @param  {String} themeid The theme's id
	 * @return {Array.String}         An array of stylsheet filenames
	 */
	getCoreStyles(themeid) {
		let moduledata = this.get(themeid);
		if (!moduledata)
			throw new Error('Whetstone | Cannot find theme: ' + themeid);
		return moduledata.data.styles;
	}

	/**
	 * Get an array of stylesheets to load
	 * @param {String} themeid  theme id
	 * @param {String} system    (optional) system id
	 * @param {String} version   (optional) specific version
	 * @param {Boolean} checkEnabled true: only return enabled styles, false: return all matching styles
	 * @return {Array.<String>} a list of stylesheet paths
	 * If neither system nor version are specified, all substyles are returned
	 **/
	getSubStyles(themeid, system = '', version = '', checkEnabled = true) {
		let themedata = this.get(themeid);
		if (!themedata)
			throw new Error('Whetstone | Cannot find theme: ' + themeid);

		let styles = [];
		for (let substylename in themedata.data.substyles) {
			let substyle = themedata.data.substyles[substylename];

			let enabled = checkEnabled ? game.Whetstone.settings.get(themedata.name + '.substyles', substylename) : true;

			if ( (substyle.system === system || system === 'all')
				&& (substyle.version === version || isNewerVersion(version, substyle.version) || version === 'all')
				&& enabled) {
				styles = styles.concat(substyle.styles);

			} else if (substyle.system == system && !substyle.version && enabled) {
				styles = styles.concat(substyle.styles);

			} else if (!substyle.system && !substyle.version && enabled) {
				styles = styles.concat(substyle.styles);
			}
		}

		return styles;
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
		return this.filter((t) => t.data.active);
	}

	/**
	* Return a reference to the active instance of this theme manager
	* @static
	* @type {WhetstoneThemes}
	*/
	static get instance() {
		return game.Whetstone.themes;
	}

	/**
	 * Writes or erases a css variable to the main body element
	 * @param  {Object} settingData Settings data
	 * @param  {String} value       the value to write, use '' to erase instead
	 * @return none
	 */
	static writeVariable(settingData, value) {
		if (Array.isArray(settingData)) {
			for (let i = 0; i < settingData.length; i++) {
				if (Array.isArray(value)) {
					WhetstoneThemes.writeVariable(settingData[i], value[i]);
				} else {
					WhetstoneThemes.writeVariable(settingData[i], value);
				}
			}
			return;
		}

		// this will remove custom definitions
		value = (settingData.default == value) ? value : '';

		if (settingData.color == 'shades') {
			WhetstoneThemes.writeShades(settingData, value);
		} else {
			if (value != null && value != '') {
				document.documentElement.style.setProperty(settingData.name, value);
			} else {
				document.documentElement.style.removeProperty(settingData.name);
			}
		}
	}

	/**
	 * Generates shades of a given color value and writes
	 * or erases a css variable of each to the main body element
	 * @param  {Object} settingData Settings data
	 * @param  {String} value       the value to write, use '' to erase instead
	 * @return none
	 */
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

			(r /= 255), (g /= 255), (b /= 255);
			let max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			let h, s, l = (max + min) / 2;

			if (max == min) {
				h = s = 0; // achromatic
			} else {
				let d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
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
				darker: 'hsla(' + h + ', ' + s + '%, ' + Math.max(0, l - 10) + '%, ' + a + ')',
				lighter: 'hsla(' + h + ', ' + s + '%, ' + Math.min(100, l + 10) + '%, ' + a + ')'
			};
		}

		for (let colortype in colors) {
			let value = colors[colortype];
			let propname = settingData.name + (colortype != 'value' ? '-' + colortype : '');

			if (value != null && value != '') {
				document.documentElement.style.setProperty(propname, value);
			} else {
				document.documentElement.style.removeProperty(propname);
			}
		}
	}

	/**
	 * Creates or removes the quick access config button
	 * @param  {Boolean} shown true to add, false to remove
	 */
	static toggleConfigButton(shown) {
		let button = $('#WhetstoneOptionsButton');
		if (button) button.remove();

		if (shown) {

			let title = game.i18n.localize('WHETSTONE.Config');

			$(`<button id="WhetstoneOptionsButton" data-action="whetstone-config" title="${title}">
				<i class="fas fa-paint-brush"></i> ${title}
			</button>`)
				.insertAfter('button[data-action="configure"]')
				.on('click', (event) => {
					const menu = game.settings.menus.get('Whetstone.Whetstone');
					if (!menu) 
						return ui.notifications.error('No submenu found for the provided key');
					const app = new menu.type();
					return app.render(true);
				});
		}
	}

	/**
	 * removes a style element from the header with a given path
	 * @param  {String} path the full stylesheet path to look for
	 */
	removeStyle(path) {
		let element = $('head link[href="' + path + '"]');
		if (element) element.remove();
	}

	/**
	 * Readds a style element to the header with a given path
	 * This method ensures the new element is the last one in
	 * the header when called.
	 * @param  {String} path the full stylesheet path to add
	 */
	addStyle(path) {
		game.Whetstone.themes.removeStyle(path);
		$('<link href="' + path + '" rel="stylesheet" type="text/css" media="all">').appendTo($('head'));
	}
}