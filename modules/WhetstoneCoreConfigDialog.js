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
			title: game.i18n.localize("WHETSTONE.Config"),
			id: "WhetstoneCoreConfig",
			template: "modules/Whetstone/templates/settings.html",
			width: 680,
			height: "auto",
			closeOnSubmit: true,
			scrollY: [".theme-list"],
			tabs: [
				{
					navSelector: ".tabs",
					contentSelector: "form",
					initial: "themeselect",
				},
			],
		});
	}

	/** @override */
	getData(options) {
		let storedOptions = game.settings.get("Whetstone", "settings");
		let defaultOptions = WhetstoneCoreConfig.getDefaults;
		const canConfigure = game.user.can("SETTINGS_MODIFY");

		const counts = {
			all: game.Whetstone.themes.length,
			active: 0,
			inactive: 0,
		};

		// Prepare themes
		const themes = game.Whetstone.themes.reduce((arr, m) => {
			const isActive = storedOptions[m.name] === true;
			if (isActive) counts.active++;
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
		for (let setting of game.settings.settings.values()) {
			// Exclude settings the user cannot change
			if (
				!setting.config ||
				(!canConfigure && setting.scope !== "client")
			)
				continue;
			if (setting.module !== "Whetstone") continue;

			// Update setting data
			const s = duplicate(setting);
			s.value = this.reset
				? s.default
				: game.settings.get("Whetstone", s.key);
			s.isColor = ["color", "shades"].includes(s.color);
			s.type =
				setting.type instanceof Function ? setting.type.name : "String";
			s.isCheckbox = setting.type === Boolean;
			s.isSelect = s.choices !== undefined;
			s.isRange = setting.type === Number && s.range;
			s.name = s.title || s.name;

			switch (s.tab) {
				case "globaloptions":
				default:
					storedOptions.globaloptions.push(s);
					break;
			}
		}

		return this.reset
			? defaultOptions
			: mergeObject(defaultOptions, storedOptions);
	}

	/**
	* Activate event listeners for the config sheet
	* @param html {jQuery|HTMLElement}   The rendered HTML for the app
	*/
	activateListeners(html) {
		super.activateListeners(html);

		html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
		html.find("button.expand").click(this._onExpandCollapse.bind(this));
		html.find("button.theme-configure").click(this._onOpenConfig.bind(this));

		this.reset = false;
	}

	/**
	 * Flags the form for a data reset and triggers a redraw
	 * @param  {Event} event JQuery click event
	 * @private
	 */
	_onResetDefaults(event) {
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

		let theme = game.Whetstone.themes.get(moduleid);
		let menuname = theme.data.dialog || moduleid + "." + theme.name;

		const menu = game.Whetstone.settings.menus.get(menuname);
		if (!menu) return ui.notifications.error("No submenu found for the provided key");
		const app = new menu.type({ theme: theme.name });
		return app.render(true);
	}

	/** @override */
	async _updateObject(event, formData) {
		await game.settings.set("Whetstone", "settings", formData);
		ui.notifications.info(game.i18n.localize("WHETSTONE.SaveMessage"));
	}
}