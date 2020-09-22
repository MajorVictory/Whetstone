import {WhetstoneThemes} from './WhetstoneThemes.js';
/**
 * The EntityCollection of Whetstone theme entities.
 * @extends {EntityCollection}
 *
 * @example <caption>Retrieve an existing theme by its id</caption>
 * let theme = game.Whetstone.themes.get(themeid);
 */
export class WhetstoneTheme extends Entity {
	constructor(...args) {
		super(...args);
		this.dialog;
	}

	/**
	 * Configure the attributes of the WhetstoneTheme Entity
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
			label: 'WHETSTONE.ThemeEntry'
		};
	}

	/**
	 * Enable the theme by writing variables and inserting stylesheets
	 * @param {Object} values An object with key:value pairs of variables to override when activating
	 */
	activate() {
		const allowed = Hooks.call('onThemeActivate', this);
		if (allowed === false) return;

		this.data.active = true;

		const systemStyles = this.getSubStyles(game.system.id, game.system.data.version);
		const allStyles = this.getCoreStyles().concat(systemStyles);
		const themeVariables = this.getVariableValues();

		// gather and write any overriden css variables
		Object.keys(themeVariables).forEach((k) => {
			WhetstoneThemes.writeVariable(k, themeVariables[k]);
		});

		// add stylesheets
		for (let i = 0, len = allStyles.length; i < len; ++i) {
			WhetstoneThemes.addStyle(allStyles[i]);
		}
	}

	/**
	 * Disable the theme removing variables and stylesheets
	 */
	deactivate() {
		const allowed = Hooks.call('onThemeDeactivate', this);
		if (allowed === false) return;

		this.data.active = false;
		this.data.variables.forEach((cssVar) => {

			const themeSetting = game.Whetstone.settings.settings.get(`${this.name}.variables.${cssVar.name}`);

			WhetstoneThemes.writeVariable(cssVar.name, '');

			if(themeSetting.color === 'shades') {
				Object.keys(WhetstoneThemes.getShades()).forEach((v, k) => {
					WhetstoneThemes.writeVariable(k, '');
				});
			}
		});

		const systemStyles = this.getSubStyles(game.system.id, game.system.data.version, false);
		const allStyles = this.getCoreStyles().concat(systemStyles);

		// remove stylesheets
		for (let i = 0, len = allStyles.length; i < len; ++i) {
			WhetstoneThemes.removeStyle(allStyles[i]);
		}
	}

	/**
	 * Get an array of core styleshet filenames for a given theme
	 * @return {Array.String}         An array of stylsheet filenames
	 */
	getCoreStyles() {
		return this.data.styles;
	}

	/**
	 * Get an array of stylesheets to load
	 * @param {String} system    (optional) system id, can be 'all'
	 * @param {String} version   (optional) specific version, can be 'all'
	 * @param {Boolean} checkEnabled true: only return enabled styles, false: return all matching styles
	 * @return {Array.<String>} a list of stylesheet paths
	 **/
	getSubStyles(system = '', version = '', checkEnabled = true) {
		let styles = [];
		for (const substyleName in this.data.substyles) {
			const substyle = this.data.substyles[substyleName];

			const enabled = checkEnabled ? game.Whetstone.settings.get(`${this.name}.substyles`, substyleName) : true;

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

	getVariableValues(colorTheme = '', values = {}) {
		colorTheme = colorTheme || game.Whetstone.settings.get(`${this.name}.settings`, 'colorTheme') || '';
		const currentColorTheme = this.data.colorThemes.filter(t => t.id === (colorTheme || this.data.colorTheme))[0];
		const colorThemeValues = currentColorTheme ? currentColorTheme.values : {};
		let returnValues = {};

		this.data.variables.forEach((cssVar) => {

			// get current value from storage
			let currentValue = game.Whetstone.settings.get(this.name, `variables.${cssVar.name}`);
			const themeSetting = game.Whetstone.settings.settings.get(`${this.name}.variables.${cssVar.name}`);

			// check colortheme for newer value
			const colorThemeValue = Object.keys(colorThemeValues).filter(k => k.includes(cssVar.name))[0];
			if (colorThemeValue) currentValue = colorThemeValues[colorThemeValue];

			// check `values` from argumetns for further overrides
			const overrideKey = Object.keys(values).filter(k => k.includes(cssVar.name))[0];
			if (overrideKey) currentValue = values[overrideKey];

			// make sure there is at least a value: specified -> default -> nothing
			const writeValue = currentValue || themeSetting.default || '';

			returnValues[cssVar.name] = writeValue;

			if(themeSetting.color === 'shades') {

				const shades = WhetstoneThemes.getShades(writeValue);

				Object.keys(shades).forEach((k) => {
					returnValues[k] = shades[k];
				});
			}
		});
		return returnValues
	}

	storeColorThemePreset(colorThemeData) {

		let settings = game.Whetstone.settings.get('Whetstone', 'presets');
		// triggers if loading an old config <= v1.0.2
		if (!settings) settings = {};

		settings[`${this.name}.presets.${colorThemeData.id}`] = colorThemeData;

		game.Whetstone.settings.set('Whetstone', 'presets', settings);
	}

	loadColorThemePresets() {

		let settings = game.Whetstone.settings.get('Whetstone', 'presets');
		// triggers if loading an old config <= v1.0.2
		if (!settings) settings = {};

		Object.keys(settings).forEach((k) => {
			if (k.includes(`${this.name}.presets.`)) {
				this.data.colorThemes.push(settings[k]);
			}
		});
	}

	/**
	* Import data and update this entity
	* @param {String} json         JSON data string
	* @return {Promise.<Entity>}   The updated Entity
	*/
	importFromJSON(json) {
		const data = JSON.parse(json);
		delete data._id;
		const newID = data.id;
		this.data.colorThemes.push(data);
		this.storeColorThemePreset(data);

		if (this.dialog) {
			this.dialog._colorTheme = newID;
			this.dialog.render();
			this.dialog = null;
		}
		return this;
	}

	/** @override */
	async delete(options) {
		if (this.data.active) {
			this.deactivate();
		}
		return super.delete(options);
	}
}