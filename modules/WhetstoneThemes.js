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

		const moduleData = game.modules.get(module);

		const themeData = mergeObject({
			name: moduleData.data.name,
			id: data.name || moduleData.data.name,
			_id: data.name || moduleData.data.name,
			title: moduleData.data.title || data.name,
			description: moduleData.data.description,
			img: 'modules/Whetstone/images/Whetstone-thumb.png',
			preview: data.img || 'modules/Whetstone/images/Whetstone-thumb.png',
			version: moduleData.data.version,
			author: moduleData.data.author,
			authors: moduleData.data.authors,
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

		themeData.variables.forEach((variable, index) => {
			this._registerVariable(themeData, variable);
		});

		themeData.settings.forEach((variable, index) => {
			this._registerSetting(themeData, variable);
		});

		Object.keys(themeData.substyles).forEach((substyleKey, index) => {
			this._registerSubstyle(themeData, themeData.substyles[substyleKey]);
		});

		this.insert(new WhetstoneTheme(themeData, themeData));
	}

	/**
	 * register theme veriable via theme id
	 * @param  {String} themeID theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerVariable(themeID, data) {
		this._registerVariable(game.Whetstone.get(themeID), data);
	}

	/**
	 * register theme veriable via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themeData theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerVariable(themeData, data) {
		const varData = {
			name: data.name,
			title: game.i18n.localize(data.title || data.name),
			hint: game.i18n.localize(data.hint),
			theme: themeData.name,
			tab: 'variables',
			scope: 'client',
			default: data.default || data.value,
			color: data.type,
			type: String,
			config: true
		};

		const presets = themeData.presets[data.presets];
		if (presets) varData.choices = presets;

		game.Whetstone.settings.register(
			`${themeData.name}.variables`,
			data.name,
			varData
		);
	}

	/**
	 * register theme setting via theme id
	 * @param  {String} themeID theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerSetting(themeID, data) {
		this._registerSetting(game.Whetstone.get(themeID), data);
	}

	/**
	 * register theme setting via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themeData theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerSetting(themeData, data) {
		const settingData = mergeObject({
			theme: themeData.name,
			tab: 'settings'
		}, data);

		game.Whetstone.settings.register(
			`${themeData.name}.settings`,
			settingData.name,
			settingData
		);
	}

	/**
	 * register theme substyle via theme id
	 * @param  {String} themeID theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerSubstyle(themeID, data) {
		this._registerSubstyle(game.Whetstone.get(themeID), data);
	}

	/**
	 * register theme substyle via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themeData theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerSubstyle(themeData, data) {
		game.Whetstone.settings.register(`${themeData.name}.substyles`, data.name, {
			name: data.name,
			title: game.i18n.localize(data.title || data.name),
			hint: game.i18n.localize(data.hint),
			theme: themeData.name,
			tab: 'substyles',
			scope: 'client',
			default: data.active,
			type: Boolean,
			config: true
		});
	}

	/**
	 * Enables a given theme by themeID
	 * @param {String} themeID    The theme's id
	 */
	activate(themeID) {
		const themeData = this.get(themeID);
		if (!themeData) { throw new Error(`Whetstone | Cannot activate theme: ${themeID}`); }

		const allowed = Hooks.call('onThemeActivate', themeData);
		if (allowed === false) return;

		themeData.data.active = true;

		// write css vars first
		for (const setting of game.Whetstone.settings.settings.values()) {
			if (setting.theme !== themeData.name) continue;

			const current = game.Whetstone.settings.get(`${themeData.name}.${setting.tab}`, setting.key);

			if (setting.tab === 'variables') {
				WhetstoneThemes.writeVariable(setting, current);
			}
		}

		const coreStyles = this.getCoreStyles(themeID);
		const systemStyles = this.getSubStyles(themeID, game.system.id, game.system.data.version);
		const allStyles = coreStyles.concat(systemStyles);

		// add stylesheet
		for (let i = 0, len = allStyles.length; i < len; ++i) {
			game.Whetstone.themes.addStyle(allStyles[i]);
		}
	}

	/**
	 * Disables a given theme by themeID
	 * @param {String} themeID    The theme's id
	 */
	deactivate(themeID) {
		const themeData = this.get(themeID);
		if (!themeData) { throw new Error(`Whetstone | Cannot deactivate theme: ${themeID}`); }

		const allowed = Hooks.call('onThemeDeactivate', themeData);
		if (allowed === false) return;

		themeData.data.active = false;

		// remove theme specific css vars
		for (const setting of game.Whetstone.settings.settings.values()) {
			if (setting.theme !== themeData.name) continue;

			if (setting.tab === 'variables') {
				WhetstoneThemes.writeVariable(setting, '');
			}
		}

		const coreStyles = this.getCoreStyles(themeID);
		const systemStyles = this.getSubStyles(themeID, 'all', 'all', false);
		const allStyles = coreStyles.concat(systemStyles);

		// remove stylsheets
		for (let i = 0, len = allStyles.length; i < len; ++i) {
			game.Whetstone.themes.removeStyle(allStyles[i]);
		}
	}

	/**
	 * Get an array of core styleshet filenames for a given theme
	 * @param  {String} themeID The theme's id
	 * @return {Array.String}         An array of stylsheet filenames
	 */
	getCoreStyles(themeID) {
		const moduleData = this.get(themeID);
		if (!moduleData) { throw new Error(`Whetstone | Cannot find theme: ${themeID}`); }
		return moduleData.data.styles;
	}

	/**
	 * Get an array of stylesheets to load
	 * @param {String} themeID  theme id
	 * @param {String} system    (optional) system id, can be 'all'
	 * @param {String} version   (optional) specific version, can be 'all'
	 * @param {Boolean} checkEnabled true: only return enabled styles, false: return all matching styles
	 * @return {Array.<String>} a list of stylesheet paths
	 **/
	getSubStyles(themeID, system = '', version = '', checkEnabled = true) {
		const themeData = this.get(themeID);
		if (!themeData) { throw new Error(`Whetstone | Cannot find theme: ${themeID}`); }

		let styles = [];
		for (const substyleName in themeData.data.substyles) {
			const substyle = themeData.data.substyles[substyleName];

			const enabled = checkEnabled ? game.Whetstone.settings.get(`${themeData.name}.substyles`, substyleName) : true;

			if ((substyle.system === system || system === 'all')
				&& (substyle.version === String(version) || isNewerVersion(version, substyle.version) || version === 'all')
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
	 * The currently active WhetstoneTheme instances
	 * @return {WhetstoneTheme}
	 */
	get active() {
		return this.filter((t) => t.data.active);
	}

	/**
	* Return a referrence to the active instance of this theme manager
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
	static writeVariable(settingData, value, force = false) {
		if (Array.isArray(settingData)) {
			for (let i = 0; i < settingData.length; i++) {
				if (Array.isArray(value)) {
					WhetstoneThemes.writeVariable(settingData[i], value[i], force);
				} else {
					WhetstoneThemes.writeVariable(settingData[i], value, force);
				}
			}
			return;
		}

		// this will remove custom definitions
		value = (settingData.default === value && !force) ? '' : value;

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