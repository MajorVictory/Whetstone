import {WhetstoneThemes} from './WhetstoneThemes.js';

/**
 * The default whetstone theme settigns configuration application
 * This form renders the settings defined via the game.Whetstone.settings.register API which have config = true
 *
 * @extends {FormApplication}
 */
export class WhetstoneThemeConfigDialog extends FormApplication {
	constructor(...args) {
		super(...args);
		this._theme = args[0].theme;
	}

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: game.i18n.localize("WHETSTONE.ConfigTitle"),
			id: "WhetstoneThemeConfigDialog",
			template: "modules/Whetstone/templates/theme-settings.html",
			width: 530,
			height: "auto",
			tabs: [
				{
					navSelector: ".tabs",
					contentSelector: ".content",
					initial: "themecolors",
				},
			],
		});
	}

	/** @override */
	getData(options) {
		const theme = game.Whetstone.themes.get(this._theme);
		let settings = {
			variables: [],
			settings: [],
			substyles: [],
		};
		let currentdata = [];
		let defaultdata = [];

		// Classify all settings
		for (let setting of game.Whetstone.settings.settings.values()) {
			// Exclude settings the user cannot change
			if (!setting.config || setting.scope !== "client") continue;
			if (setting.theme !== theme.name) continue;

			// Update setting data
			const s = duplicate(setting);
			s.value = this.reset ? s.default : game.Whetstone.settings.get(s.theme + "." + s.tab, s.key);
			s.isColor = ["color", "shades"].includes(s.color);
			s.type = setting.type instanceof Function ? setting.type.name : "String";
			s.isCheckbox = setting.type === Boolean;
			s.isSelect = s.choices !== undefined;
			s.isRange = setting.type === Number && s.range;
			s.name = s.title || s.name;

			if (settings[s.tab]) {
				settings[s.tab].push(s);
			} else {
				settings[s.tab] = [s];
			}

			currentdata[s.tab + "/" + s.key] = s.value;
			defaultdata[s.tab + "/" + s.key] = s.default;
		}

		let returndata = this.reset
			? defaultdata
			: mergeObject(defaultdata, currentdata);

		returndata.theme = theme;
		returndata.settings = settings;

		return returndata;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Open submenu
		html.find(".submenu button").click(this._onClickSubmenu.bind(this));
		// connect color-pickers to validator
		html.find(".ws-color-value").change(this._updateColor.bind(this));
		// Reset Default Values
		html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
		// fix for typed colors not always triggering validation on dialog open
		$('input[type="text"].ws-color-value').change();

		this.reset = false;
	}

	/**
	 * Updates 'brother' controls of the ws-color-picker control to share values
	 * @param  {Event} event JQuery click event
	 */
	_updateColor(event) {
		let control = $(event.target);

		// validate manual color
		if (control.attr("type") == "text") {
			let colortest = /^#[0-9A-F]{6}$/i.test(control.val());

			if (!colortest) {
				ui.notifications.warn(
					game.i18n.localize("WHETSTONE.InvalidColorFormat")
				);
				control.val("#000000");
			}
		}

		let parentGroup = $(control.parents(".ws-color-input")[0]);
		let colorgroup = parentGroup.find(".ws-color-value");

		// loop through 'brother' elements and attempt to set their value
		// invalid values either become 'custom' or '#000000'
		for (var el = colorgroup.length - 1; el >= 0; el--) {
			let brother = $(colorgroup[el]);

			//skip if setting myself
			if (brother.prop("tagName") == control.prop("tagName")) continue;

			if (brother.prop("tagName") == "SELECT") {
				brother.val(control.val());
				// no color matches a preset, set to custom
				if (brother.val() == null) {
					brother.val("custom");
				}
			} else if (brother.prop("type") == "text") {
				// if custom, set to black at first
				if (control.val() == "custom") {
					brother.val("#000000");
				} else {
					brother.val(control.val());
				}
			} else {
				brother.val(control.val());
			}
		}
	}

	/**
	 * handle button with an attached menu
	 * @param  {Event} event JQuery onclick event
	 * @return {[type]}       [description]
	 */
	_onClickSubmenu(event) {
		event.preventDefault();
		const menu = game.settings.menus.get(event.currentTarget.dataset.key);
		if (!menu) return ui.notifications.error("No submenu found for the provided key");
		const app = new menu.type();
		return app.render(true);
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

	/** @override */
	async _updateObject(event, formData) {
		for (let [k, newValue] of Object.entries(formData)) {


			let settingData = game.Whetstone.settings.settings.get( 
				this._theme + "." + k.split("/").join(".")
			);
			if (!settingData) continue;

			let themekey = settingData.theme + "." + settingData.tab
			let current = game.Whetstone.settings.get(themekey, settingData.key);
			if (newValue !== current) {
				await game.Whetstone.settings.set(themekey, settingData.key, newValue);

				if (settingData.tab === "variables") {
					WhetstoneThemes.writeVariable(settingData, newValue);
				}
				Hooks.callAll(`update${settingData.theme}`, settingData, newValue, current);
			}
		}
	}
}