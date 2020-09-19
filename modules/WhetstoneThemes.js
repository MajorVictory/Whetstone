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

		const moduledata = game.modules.get(module);

		const themedata = mergeObject({
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
			for (const substylename in themedata.substyles) {
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
		const varData = {
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

		const presets = themedata.presets[data.presets];
		if (presets) varData.choices = presets;

		game.Whetstone.settings.register(
			`${themedata.name}.variables`,
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
		const settingData = mergeObject({
			theme: themedata.name,
			tab: 'settings'
		}, data);

		game.Whetstone.settings.register(
			`${themedata.name}.settings`,
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
			`${themedata.name}.substyles`,
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
		const themedata = this.get(themeid);
		if (!themedata) { throw new Error(`Whetstone | Cannot activate theme: ${themeid}`); }

		const allowed = Hooks.call('onThemeActivate', themedata);
		if (allowed === false) return;

		themedata.data.active = true;

		// write css vars first
		for (const setting of game.Whetstone.settings.settings.values()) {
			if (setting.theme !== themedata.name) continue;

			const current = game.Whetstone.settings.get(`${themedata.name}.${setting.tab}`, setting.key);

			if (setting.tab === 'variables') {
				WhetstoneThemes.writeVariable(setting, current);
			}
		}

		const corestyles = this.getCoreStyles(themeid);
		const systemstyles = this.getSubStyles(themeid, game.system.id, game.system.data.version);
		const allstyles = corestyles.concat(systemstyles);

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
		const themedata = this.get(themeid);
		if (!themedata) { throw new Error(`Whetstone | Cannot deactivate theme: ${themeid}`); }

		const allowed = Hooks.call('onThemeDeactivate', themedata);
		if (allowed === false) return;

		themedata.data.active = false;

		// remove theme specific css vars
		for (const setting of game.Whetstone.settings.settings.values()) {
			if (setting.theme !== themedata.name) continue;

			if (setting.tab === 'variables') {
				WhetstoneThemes.writeVariable(setting, '');
			}
		}

		const corestyles = this.getCoreStyles(themeid);
		const systemstyles = this.getSubStyles(themeid, 'all', 'all', false);
		const allstyles = corestyles.concat(systemstyles);

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
		const moduledata = this.get(themeid);
		if (!moduledata) { throw new Error(`Whetstone | Cannot find theme: ${themeid}`); }
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
		const themedata = this.get(themeid);
		if (!themedata) { throw new Error(`Whetstone | Cannot find theme: ${themeid}`); }

		let styles = [];
		for (const substylename in themedata.data.substyles) {
			const substyle = themedata.data.substyles[substylename];

			const enabled = checkEnabled ? game.Whetstone.settings.get(`${themedata.name}.substyles`, substylename) : true;

			if ((substyle.system === system || system === 'all')
				&& (substyle.version === version || isNewerVersion(version, substyle.version) || version === 'all')
				&& enabled) {
				styles = styles.concat(substyle.styles);
			} else if (substyle.system === system && !substyle.version && enabled) {
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
		value = (settingData.default === value) ? '' : value;

		if (settingData.color === 'shades') {
			WhetstoneThemes.writeShades(settingData, value);
		} else {
			if (value != null && value !== '') {
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
			const [r, g, b] = hexToRGB(colorStringToHex(value));
			let [h, s, v] = rgbToHsv(r, g, b);

			h = Math.round(h * 360);
			s = Math.round(s * 100);
			v = Math.round(v * 100);

			colors = {
				value: `hsla(${h},${s}%,${v}%,1)`,
				quarter: `hsla(${h},${s}%,${v}%,0.25)`,
				half: `hsla(${h},${s}%,${v}%,0.5)`,
				threequarter: `hsla(${h},${s}%,${v}%,0.75)`,
				shadow: `hsla(${h},${s}%,25%,1)`,
				dark: `hsla(${h},${s}%,25%,0.5)`,
				light: `hsla(${h},100%,50%,1)`,
				darker: `hsla(${h},${s}%,${Math.max(0, v - 10)}%,1)`,
				lighter: `hsla(${h},${s}%,${Math.min(100, v + 10)}%,1)`
			};
		}

		for (const colortype in colors) {
			const currentValue = colors[colortype];
			const propname = settingData.name + (colortype !== 'value' ? `-${colortype}` : '');

			if (currentValue != null && currentValue !== '') {
				document.documentElement.style.setProperty(propname, currentValue);
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
		const button = $('#WhetstoneOptionsButton');
		if (button) button.remove();

		if (shown) {
			const title = game.i18n.localize('WHETSTONE.Config');

			$(`<button id="WhetstoneOptionsButton" data-action="whetstone-config" title="${title}">
				<i class="fas fa-paint-brush"></i> ${title}
			</button>`)
				.insertAfter('button[data-action="configure"]')
				.on('click', (event) => {
					const menu = game.settings.menus.get('Whetstone.Whetstone');
					if (!menu) return ui.notifications.error('No submenu found for the provided key');
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
		const element = $(`head link[href="${path}"]`);
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
		$(`<link href="${path}" rel="stylesheet" type="text/css" media="all">`).appendTo($('head'));
	}
}