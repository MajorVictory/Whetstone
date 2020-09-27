import {WhetstoneCoreConfig} from './WhetstoneCoreConfig.js';

/**
 * Whetstone core config dialog
 * @type {FormApplication}
 */
export class WhetstoneCoreConfigDialog extends FormApplication {
	constructor(...args) {
		super(...args);
		this._expanded = false;
	}

	/** @overrride */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: game.i18n.localize('WHETSTONE.Config'),
			id: 'WhetstoneCoreConfig',
			template: 'modules/Whetstone/templates/settings.html',
			width: 680,
			height: 'auto',
			closeOnSubmit: true,
			scrollY: ['.theme-list'],
			tabs: [{
				navSelector: '.tabs',
				contentSelector: 'form',
				initial: 'themeselect'
			}]
		});
	}

	/** @override */
	getData() {
		const storedOptions = game.settings.get('Whetstone', 'settings');
		const defaultOptions = WhetstoneCoreConfig.getDefaults;
		const canConfigure = game.user.can('SETTINGS_MODIFY');

		const counts = {
			all: game.Whetstone.themes.length,
			active: 0,
			inactive: 0
		};

		// Prepare themes
		const themes = game.Whetstone.themes.reduce((arr, m) => {
			const isActive = (this.reset ? defaultOptions[m.name] : storedOptions[m.name]) === true;
			if (isActive) counts.active += 1;
			else counts.inactive += 1;

			const theme = duplicate(m.options);
			theme.active = isActive;
			theme.dependencies = Object.entries(theme.dependencies).length ? theme.dependencies : '';
			theme.systems = Object.entries(theme.systems).length ? theme.systems : '';
			theme.compatible = Object.entries(theme.compatible).length ? theme.compatible : '';
			theme.conflicts = Object.entries(theme.conflicts).length ? theme.conflicts : '';
			return arr.concat([theme]);
		}, []);

		// sort by priority first, then name in alphabetical
		themes.sort((a, b) => (a.priority > b.priority ? 1 : (a.priority === b.priority ? (a.name > b.name ? 1 : -1) : -1)));

		storedOptions.counts = counts;
		storedOptions.themes = themes;
		storedOptions.expanded = this._expanded;

		// prepare core settings
		storedOptions.globalOptions = [];

		// load up all Whetstone core settings
		for (const setting of game.settings.settings.values()) {
			// Exclude settings the user cannot change
			if (!setting.config || (!canConfigure && setting.scope !== 'client')) continue;
			if (setting.module !== 'Whetstone') continue;

			// Update setting data
			const s = duplicate(setting);
			s.value = this.reset ? s.default : JSON.parse(game.settings.get('Whetstone', s.key));
			s.isColor = ['color', 'shades'].includes(s.color);
			s.type = setting.type instanceof Function ? setting.type.name : 'String';
			s.isCheckbox = setting.type === Boolean;
			s.isSelect = s.choices !== undefined;
			s.isRange = setting.type === Number && s.range;
			s.name = s.title || s.name;

			switch (s.tab) {
				case 'globaloptions':
				default: storedOptions.globalOptions.push(s); break;
			}
		}

		return mergeObject(defaultOptions, storedOptions);
	}

	/**
	* Activate event listeners for the config sheet
	* @param html {jQuery|HTMLElement}   The rendered HTML for the app
	*/
	activateListeners(html) {
		super.activateListeners(html);
		html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
		html.find('button.expand').click(this._onExpandCollapse.bind(this));
		html.find('button.theme-configure').click(this._onOpenConfig.bind(this));
		this.reset = false;
	}

	/**
	 * Flags the form for a data reset and triggers a redraw
	 * @param  {Event} event JQuery click event
	 * @private
	 */
	_onResetDefaults() {
		this.reset = true;
		this.render();
	}

	/**
	 * JQuery handler for collapse button
	 * @param  {Event} event JQuery click event
	 * @private
	 */
	_onExpandCollapse(event) {
		event.preventDefault();
		this._expanded = !this._expanded;
		this.render();
	}

	/**
	 * JQuery handler for dialog buttons
	 * @param  {Event} event JQuery click event
	 * @private
	 */
	_onOpenConfig(event) {
		event.preventDefault();

		let moduleid = $(event.target).val();

		// this happens if the icon was clicked and sent the event
		if (!moduleid) moduleid = $(event.target).parent().val();

		const theme = game.Whetstone.themes.get(moduleid);
		const menuname = theme.data.dialog || `${moduleid}.${theme.name}`;

		const menu = game.Whetstone.settings.menus.get(`Whetstone.menus.${menuname}`);
		if (!menu) return ui.notifications.error('No submenu found for the provided key');
		const app = new menu.type({theme: theme.name, colorTheme: ''});
		return app.render(true);
	}

	/** @override */
	async _updateObject(event, formData) {
		await game.settings.set('Whetstone', 'settings', formData);
		ui.notifications.info(game.i18n.localize('WHETSTONE.SaveMessage'));
	}
}