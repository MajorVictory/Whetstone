import {WhetstoneThemeConfigDialog} from './WhetstoneThemeConfigDialog.js';
import {WhetstoneCoreConfigDialog} from './WhetstoneCoreConfigDialog.js';

/**
 * An abstract interface for managing defined theme settings or settings menus.
 * Each setting is a string key/value pair belonging to a certain package and a certain store scope.
 *
 * When Foundry Virtual Tabletop is initialized, a singleton instance of this class is constructed within the global
 * Game object as game.Whetstone.settings
 *
 * Use is mirrored with the game.settings api
 */
export class WhetstoneThemeSettings {
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
			["world", new WorldSettingsStorage(worldSettings || [])],
		]);
	}

	/* -------------------------------------------- */

	/**
	 * Return a singleton instance of the Whetstone Settings Configuration app
	 * @return {WhetstoneCoreConfigDialog}
	 */
	get sheet() {
		if (!this._sheet) this._sheet = new WhetstoneCoreConfigDialog();
		return this._sheet;
	}

	/* -------------------------------------------- */

	/**
	 * Register a new theme setting under this setting scope
	 *
	 * @param {string} themeid   The theme under which the setting is registered
	 * @param {string} key      The key name for the setting
	 * @param {Object} data     Configuration for setting data
	 */
	register(themeid, key, data) {
		if (!themeid || !key)
			throw new Error("You must specify both themeid and key portions of the setting");

		data.key = `Whetstone.themes.${themeid}.${key}`;
		data.id = key;
		data.themeid = themeid;
		data.scope = ["client", "world"].includes(data.scope) ? data.scope : "client";
		this.settings.set(data.key, data);
	}

	/* -------------------------------------------- */

	/**
	 * Register a new sub-settings menu
	 *
	 * @param {string} themeid   The namespace under which the menu is registered
	 * @param {string} key      The key name for the setting
	 * @param {Object} data     Configuration for setting data
	 */
	registerMenu(themeid, key, data) {
		if (!themeid || !key)
			throw new Error("You must specify both themeid and key portions of the menu");

		data.key = `Whetstone.menus.${themeid}.${key}`;
		data.id = key;
		data.themeid = themeid;
		if (!data.type) data.type = WhetstoneThemeConfigDialog;
		if (!data.type || !(data.type.prototype instanceof FormApplication)) {
			throw new Error("You must provide a menu type that is FormApplication instance or subclass");
		}
		this.menus.set(data.key, data);
	}

	/* -------------------------------------------- */

	/**
	 * Get the value of a theme setting for a certain theme and setting key
	 *
	 * @param themeid {String}   The theme namespace under which the setting is registered
	 * @param key {String}      The setting key to retrieve
	 *
	 * @example
	 * // Retrieve the current setting value
	 * game.Whetstone.settings.get("myTheme", "myClientSetting");
	 */
	get(themeid, key) {
		if (!themeid || !key)
			throw new Error("You must specify both themeid and key portions of the setting");

		key = `Whetstone.themes.${themeid}.${key}`;
		if (!this.settings.has(key))
			throw new Error("This is not a registered game setting");

		// Get the setting and the correct storage interface
		const setting = this.settings.get(key);
		const storage = this.storage.get(setting.scope);

		// Get the setting value
		let value = storage.getItem(key);
		value = value !== null ? JSON.parse(value) : setting.default;

		let valueType = setting.type;
		if (['color', 'shades', 'image'].includes(setting.type)) {
			valueType = String;
		}

		// Cast the value to a requested type
		return valueType ? valueType(value) : value;
	}

	/* -------------------------------------------- */

	/**
	 * Set the value of a theme setting for a certain theme and setting key
	 *
	 * @param themeid {String}   The theme namespace under which the setting is registered
	 * @param key {String}      The setting key to retrieve
	 * @param value             The data to assign to the setting key
	 *
	 * @example
	 * // Update the current value of a setting
	 * game.Whetstone.settings.set("myTheme", "myClientSetting", "b");
	 */
	async set(themeid, key, value) {
		if (!themeid || !key)
			throw new Error("You must specify both themeid and key portions of the setting");
		
		key = `Whetstone.themes.${themeid}.${key}`;
		if (!this.settings.has(key))
			throw new Error("This is not a registered game setting");

		// Obtain the setting data and serialize the value
		const setting = this.settings.get(key);
		const json = JSON.stringify(value);

		// Broadcast the setting change to others
		if (setting.scope === "world") {
			await game.socket.emit("module.Whetstone", {
				type: "Setting",
				action: "update",
				data: { key, value: json },
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
		if (setting.onChange instanceof Function) setting.onChange(value);
		return value;
	}
}