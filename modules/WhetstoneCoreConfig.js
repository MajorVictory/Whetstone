import {WhetstoneThemes} from './WhetstoneThemes.js';

/**
 * An interface for storing and retrieving settings for Whetstone core
 */
export class WhetstoneCoreConfig {
	/**
	 * get the default values of any registered settings
	 * @return {Object} key:value pairs denoting the default values
	 */
	static get getDefaults() {
		return {
			addMenuButton: true
		};
	}

	/**
	 * get the current values of any registered settings
	 * filling in unspecified values with defaults
	 * @return {Object} key:value pairs denoting current values
	 */
	static get getOptions() {
		return mergeObject(
			WhetstoneCoreConfig.getDefaults,
			game.settings.get('Whetstone', 'settings')
		);
	}

	/**
	 * applies current settings to world
	 * @param  {Object} options key:value pairs of settings
	 */
	static apply(options) {
		WhetstoneThemes.toggleConfigButton(options.addMenuButton);
		game.settings.set('Whetstone', 'addMenuButton', options.addMenuButton);

		const activate = [];
		const deactivate = [];

		// loop options and grab the ones that are theme ids
		for (const k in options) {
			if (!game.Whetstone.themes.get(k)) continue;

			if (options[k]) {
				activate.push({name: k, priority: options[`${k}_priority`] || 1});
			}
			deactivate.push(k);
		}
		
		// deactivate all themes
		for (let i = 0, len = deactivate.length; i < len; ++i) {
			game.Whetstone.themes.deactivate(deactivate[i]);
		}

		// sort by priority first, then name in alphabetical
		activate.sort((a, b) => (a.priority > b.priority ? 1 : (a.priority === b.priority ? (a.name > b.name ? 1 : -1) : -1)));

		// activate all active themes
		for (let i = 0, len = activate.length; i < len; ++i) {
			game.Whetstone.themes.activate(activate[i].name);
		}
	}
}