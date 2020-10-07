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
			preview: '',
			version: moduleData.data.version,
			author: moduleData.data.author,
			authors: moduleData.data.authors,
			active: false,
			priority: 1,
			styles: [],
			substyles: {},
			variables: [],
			settings: [],
			presets: {},
			colorTheme: '',
			colorThemes: [],
			dialog: '',
			template: '',
			systems: {},
			dependencies: {},
			compatible: {},
			conflicts: {},
			flags: {}
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

		this._registerSetting(themeData, {
			id: 'colorTheme',
			name: 'colorTheme',
			scope: 'client',
			config: false,
			default: themeData.colorTheme,
			type: String,
			onChange: (newColorTheme) => {
				const theme = game.Whetstone.themes.get(themeData.name);
				if (!theme) return;
				theme.data.colorTheme = newColorTheme;
				if(theme.data.active) theme.activate();
			}
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
			template: data.template,
			type: (['color', 'shades'].includes(data.type)) ? String : data.type,
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
		this._registerSetting(game.Whetstone.themes.get(themeID), data);
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
		this._registerSubstyle(game.Whetstone.themes.get(themeID), data);
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
	 * register color theme preset via theme id
	 * @param  {String} themeID theme id, acts as a key
	 * @param  {Object} data    data for setting
	 */
	registerPreset(themeID, data) {
		this._registerPreset(game.Whetstone.themes.get(themeID), data);
	}

	/**
	 * register color theme preset via WhetstoneTheme object
	 * @param  {WhetstoneTheme} themeData theme data to update
	 * @param  {Object} data    data for setting
	 */
	_registerPreset(themeData, data) {
		game.Whetstone.settings.register(`${themeData.name}.presets`, data.id, {
			name: game.i18n.localize(data.name) || game.i18n.localize(data.id),
			title: game.i18n.localize(data.title || data.name),
			hint: game.i18n.localize(data.hint),
			theme: themeData.name,
			tab: 'presets',
			scope: 'client',
			default: data,
			type: Object,
			config: false
		});
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
		let themes = this.filter((t) => t.data.active);
		return themes.sort((a, b) => (a.priority > b.priority ? 1 : (a.priority === b.priority ? (a.name > b.name ? 1 : -1) : -1)));
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
	static writeVariable(key, value, force = false) {
		if (value != null && value !== '') {
			document.documentElement.style.setProperty(key, value);
		} else {
			document.documentElement.style.removeProperty(key);
		}
	}

	/**
	 * Generates shades of a given color value
	 * @param  {String} value       the base color to generate from in '#rrggbb' or '#rrggbbaa' format
	 * @return {Array.Object}	an array containing key:value pairs
	 */
	static getShades(value = '') {
		let shades = {
			contrast: '',
			//quarter: '',
			half: '',
			full: '',
			//threequarter: '',
			//shadow: '',
			//dark: '',
			//light: '',
			darker: '',
			lighter: ''
		};

		// 6 digit hex to 8 digit hex
		if (value.length === 7) value = `${value}ff`;

		if (value) {
			const [r, g, b, a] = WhetstoneThemes.hexToRGBA(colorStringToHex(value));
			let [h, s, l] = WhetstoneThemes.rgbToHsl(r, g, b);

			h = Math.round(h * 360);
			s = Math.round(s * 100);
			l = Math.round(l * 100);

			shades = {
				contrast: WhetstoneThemes.getContrastYIQ((r*255), (g*255), (b*255)),
				//quarter: `hsla(${h},${s}%,${l}%,0.25)`,
				half: `hsla(${h},${s}%,${l}%,${a/2})`,
				full: `hsla(${h},${s}%,${l}%,1)`,
				//threequarter: `hsla(${h},${s}%,${l}%,0.75)`,
				//shadow: `hsla(${h},${s}%,25%,1)`,
				//dark: `hsla(${h},${s}%,25%,0.5)`,
				//light: `hsla(${h},100%,50%,1)`,
				darker: `hsla(${h},${s}%,${Math.max(0, l - 10)}%,${a})`,
				lighter: `hsla(${h},${s}%,${Math.min(100, l + 10)}%,${a})`
			};
		}

		return shades;
	}

	static getContrastYIQ(r,g,b){
		var yiq = ((r*299)+(g*587)+(b*114))/1000;
		return (yiq >= 128) ? 'black' : 'white';
	}

	static colorData(value, alpha) {

		let newAlpha = (alpha !== undefined) ? parseInt(alpha).toString(16) : 'ff';
		newAlpha = newAlpha.length === 1 ? `0${newAlpha}` : newAlpha;

		// 8 digit hex and new alpha set, replace
		if (value.length === 9 && alpha) {
			value = `${value.slice(0,-2)}${newAlpha}`;
		}

		// 6 digit hex convert to 8 digit hex
		if (value.length === 7) {
			value = `${value}${newAlpha}`;
		}
		let [r, g, b, a] = WhetstoneThemes.hexToRGBA(colorStringToHex(value));

		return {
			color: WhetstoneThemes.rgbaToColorString([r, g, b]),
			full: WhetstoneThemes.rgbaToColorString([r, g, b, a]),
			alpha: Math.floor(a * 255)
		}

	}

	static rgbaToColorString(rgba) {
		let c = rgba.map(function(v) {
			let hex = Math.floor(v*255).toString(16);
			return hex.length === 1 ? `0${hex}` : hex;
		});
		return `#${c.join('')}`;
	}

	static hexToRGBA(hex) {
		return [
			((hex >> 24) & 0xFF) / 255,
			((hex >> 16) & 0xFF) / 255,
			((hex >> 8) & 0xFF) / 255,
			(hex & 0xFF) / 255
		];
	}

	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 1] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSL representation
	 */
	static rgbToHsl(r, g, b) {
		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [ h, s, l ];
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
	static removeStyle(path) {
		const element = $(`head link[href="${path}"]`);
		if (element) element.remove();
	}

	/**
	 * Readds a style element to the header with a given path
	 * This method ensures the new element is the last one in
	 * the header when called.
	 * @param  {String} path the full stylesheet path to add
	 */
	static addStyle(path) {
		WhetstoneThemes.removeStyle(path);
		$(`<link href="${path}" rel="stylesheet" type="text/css" media="all">`).appendTo($('head'));
	}
}