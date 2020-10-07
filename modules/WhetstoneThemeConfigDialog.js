import {WhetstoneThemes} from './WhetstoneThemes.js';
import {WhetstoneCoreConfig} from './WhetstoneCoreConfig.js';

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
		this._userValues = [];
		this._colorTheme = args[0].colorTheme || '';
	}

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: game.i18n.localize('WHETSTONE.ConfigTitle'),
			id: 'WhetstoneThemeConfigDialog',
			template: 'modules/Whetstone/templates/theme-settings.html',
			width: 530,
			height: 'auto',
			tabs: [{
				navSelector: '.tabs',
				contentSelector: '.content',
				initial: 'themecolors'
			}]
		});
	}

	/** @override */
	getData() {
		const theme = game.Whetstone.themes.get(this._theme);
		const colorThemeID = this._colorTheme || '';
		const variableValues = theme.getVariableValues(colorThemeID);

		const settings = {
			variables: [],
			settings: [],
			substyles: []
		};
		let currentData = [];
		currentData['colorTheme'] = variableValues['colorThemeID'];
		let defaultData = [];
		defaultData['colorTheme'] = theme.data.colorTheme;
		const colorTheme = variableValues['colorThemeData'];

		// Classify all settings
		for (const setting of game.Whetstone.settings.settings.values()) {
			// Exclude settings the user cannot change
			if (!setting.config || setting.scope !== 'client') continue;
			if (setting.theme !== theme.name) continue;

			// Update setting data
			const s = duplicate(setting);
			let currentValue = this._userValues[s.id] || variableValues[s.id] || game.Whetstone.settings.get(`${s.theme}.${s.tab}`, s.id);
			if (currentValue === null || currentValue === '') currentValue = s.default;

			s.value = this.reset ? s.default : currentValue;
			s.isColor = ['color', 'shades'].includes(s.color);
			s.colorData = s.isColor ? WhetstoneThemes.colorData(s.value) : null;
			s.isImage = s.type === 'image';
			s.type = setting.type instanceof Function ? setting.type.name : 'String';
			s.isCheckbox = setting.type === Boolean;
			s.isRange = setting.type === Number && s.range;
			s.isSelect = s.choices !== undefined;
			s.name = s.title || s.name;

			const presetsKey = (colorTheme && s.isColor) ? colorTheme.presets : s.presets;
			s.choices = theme.data.presets[presetsKey] || s.choices;

			if (s.color === 'shades') {
				let colorShades = WhetstoneThemes.getShades();

				s.shades = [`<span class="ws-shade-item" style="background-color: var(${s.id});color: var(${s.id}-contrast);border-color: var(${s.id}-contrast);" title="${s.id}">&nbsp;</span>`];
				Object.keys(colorShades).forEach((k) => {
					if (k !== 'contrast') {
						s.shades.push(`<span class="ws-shade-item" style="background-color: var(${s.id}-${k});color: var(${s.id}-contrast);border-color: var(${s.id}-contrast);" title="${s.id}-${k}">${k}</span>`);
					}
				});
				s.shades = s.shades.join('');
			}

			if (settings[s.tab]) {
				settings[s.tab].push(s);
			} else {
				settings[s.tab] = [s];
			}

			currentData[s.id] = s.value;
			defaultData[s.id] = s.default;
		}

		const returndata = this.reset ? defaultData : mergeObject(defaultData, currentData);
		returndata.theme = theme;
		returndata.settings = settings;
		returndata.colorTheme = this.reset ? theme.data.colorTheme : returndata.colorTheme;
		returndata.colorThemeEdit = colorTheme && colorTheme.custom;
		return returndata;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Open submenu
		html.find('.submenu button').click(this._onClickSubmenu.bind(this));
		html.find('select[name="colorTheme"]').change(this._updateThemePresets.bind(this));
		// connect color-pickers to validator
		html.find('.ws-color-value').change(this._updateColor.bind(this));

		// fix for typed colors not always triggering validation on dialog open
		$('[data-tab="variables"]').change(this._updateVariable.bind(this));
		$('[data-tab="variables"]').change();

		// theme delete/import/export
		html.find('button.theme-delete').click(this._themeDelete.bind(this));
		html.find('button.theme-export').click(this._themeExport.bind(this));
		html.find('button.theme-import').click(this._themeImport.bind(this));

		// Reset Default Values
		html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
		this.reset = false;
	}

	_themeDelete(event) {
		new Dialog({
			title: game.i18n.localize('WHETSTONE.ColorThemeDeleteTitle'),
			content: `<p>${game.i18n.localize('WHETSTONE.ColorThemeDeleteMessage')}</p>`,
			buttons: {
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize('WHETSTONE.Cancel')
				},
				yes: {
					icon: '<i class="fas fa-trash"></i>',
					label: game.i18n.localize('WHETSTONE.Delete'),
					callback: (html) => {
						let themeData = game.Whetstone.themes.get(this._theme);
						themeData.removeColorTheme($('[name="colorTheme"]').val());
						this._colorTheme = '';
						this._userValues = [];
						this.render();
					}
				},
			},
			default: 'yes'
		}).render(true);
	}

	_themeExport(event) {
		const exportData = {
			id: 'custom',
			name: 'WHETSTONE.ColorThemeCustom',
			custom: true,
			values: {}
		}

		$('#WhetstoneThemeConfigDialog [data-tab="variables"]').each((k,v) => {
			const control = $(v);
			exportData.values[control.attr('name')] = control.val();
		});			

		new Dialog({
			title: game.i18n.localize('WHETSTONE.ExportPresetTitle'),
			content: `<form class="flexcol">
				<div class="form-group">
					<label for="presetName">${game.i18n.localize('WHETSTONE.ExportPresetLabel')}</label>
					<input type="text" name="presetName" placeholder="${game.i18n.localize('WHETSTONE.ExportPresetLabel')}" value="${game.i18n.localize(exportData.name)}">
				</div>
			</form>`,
			buttons: {
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize('WHETSTONE.Cancel')
				},
				export: {
					icon: '<i class="fas fa-file-export"></i>',
					label: game.i18n.localize('WHETSTONE.Export'),
					callback: (html) => {
						let presetName = html.find('input[name="presetName"]').val();

						exportData.id = presetName.toLowerCase().replace(/\s/g, "_");
						exportData.name = presetName;

						const filename = `fvtt-Whetstone-${this._theme}-${presetName}-preset.json`;
						saveDataToFile(JSON.stringify(exportData, null, 2), "text/json", filename);
					}
				},
			},
			default: 'export',
		}).render(true);
	}

	async _themeImport(event) {
		const theme = game.Whetstone.themes.get(this._theme);
		theme.dialog = this;
		theme.importFromJSONDialog();
	}

	/**
	 * Updates all settings based on current theme presets
	 * @param  {Event} event JQuery change event
	 */
	_updateThemePresets(event) {
		this._colorTheme = $(event.target).val();
		this._userValues = [];
		this.render();
	}



	/**
	 * Writes css vriables to the document when changed
	 * @param  {Event} event JQuery onchange event
	 */
	_updateVariable(event) {
		const control = $(event.target);
		const tab = control.data('tab');
		const variableKey = control.attr('name');
		if (!variableKey) return;

		const settingData = game.Whetstone.settings.settings.get(
			`Whetstone.themes.${this._theme}.${tab}.${variableKey}`
		);
		if (!settingData) return;

		this._userValues[variableKey] = control.val();
		let writeValue = control.val();

		if (settingData.template && typeof settingData.template === 'function') {
			writeValue = settingData.template(settingData, variableKey, writeValue);
		}

		WhetstoneThemes.writeVariable(variableKey, writeValue, true);

		if (control.data('shades') === 'shades') {
			let colorShades = WhetstoneThemes.getShades(control.val());

			Object.keys(colorShades).forEach((k) => {
				writeValue = colorShades[k];
				if (settingData.template && typeof settingData.template === 'function') {
					writeValue = settingData.template(settingData, `${variableKey}-${k}`, writeValue);
				}
				WhetstoneThemes.writeVariable(`${variableKey}-${k}`, writeValue);
			});
		}
	}


	/**
	 * Updates 'brother' controls of the ws-color-picker control to share values
	 * @param  {Event} event JQuery click event
	 */
	_updateColor(event) {
		const control = $(event.target);

		// validate manual color
		if (control.attr('type') === 'text') {
			const colorTest = /^#(?:[0-9A-F]{6}|[0-9A-F]{8})$/i.test(control.val());

			if (!colorTest) {
				ui.notifications.warn(
					game.i18n.localize('WHETSTONE.InvalidColorFormat')
				);
				control.val('#000000');
			}
		}

		const parentGroup = $(control.parents('.ws-color-input')[0]);
		const colorGroup = parentGroup.find('.ws-color-value');
		let colorData;

		if (control.prop('type') === 'range') {
			colorData = WhetstoneThemes.colorData(parentGroup.find('input[type="text"]').val(), control.val());
		} else {
			colorData = WhetstoneThemes.colorData(control.val(), parentGroup.find('input[type="range"]').val());
		}

		let currentValue = control.val();
				
		// loop through 'brother' elements and attempt to set their value
		// invalid values either become 'custom' or '#000000'
		for (let el = colorGroup.length - 1; el >= 0; el--) {
			const brother = $(colorGroup[el]);

			// skip if setting myself
			if (brother.prop('type') === control.prop('type')) continue;

			if (brother.prop('tagName') === 'SELECT') {
				brother.val(colorData.full);
				// try to match full color in select choices
				if (brother.val() == null) {
					//try again without alpha
					brother.val(colorData.full);
					if (brother.val() == null) {
						brother.val('custom');
					}
				}
			} else if (brother.prop('type') === 'text') {
				// if custom, set to black at first
				if (currentValue === 'custom') {
					brother.val('#000000');
				} else {
					brother.val(colorData.full);
				}
				brother.change();
			} else if (brother.prop('type') === 'range') {
				brother.val(colorData.alpha);
			} else if (brother.prop('type') === 'color') {
				brother.val(colorData.color);
			} else {
				brother.val(colorData.full);
			}
		}
		
	}

	/**
	 * handle button with an attached menu
	 * @param  {Event} event JQuery onclick event
	 */
	_onClickSubmenu(event) {
		event.preventDefault();
		const menu = game.settings.menus.get(event.currentTarget.dataset.key);
		if (!menu) return ui.notifications.error('No submenu found for the provided key');
		const app = new menu.type();
		return app.render(true);
	}

	/**
	 * Flags the form for a data reset and triggers a redraw
	 * @private
	 */
	_onResetDefaults() {
		this.reset = true;
		this.render();
	}

	/** @override */
	async _updateObject(event, formData) {
		const theme = game.Whetstone.themes.get($(event.target).data('theme'));

		for (const [k, newValue] of Object.entries(formData)) {

			const tab = $(`[name="${k}"]`).data('tab');

			const settingData = game.Whetstone.settings.settings.get(
				`Whetstone.themes.${this._theme}.${tab}.${k}`
			);
			if (!settingData) continue;

			const themeKey = `${settingData.theme}.${settingData.tab}`;
			const current = game.Whetstone.settings.get(themeKey, settingData.id);
			if (newValue !== current) {
				game.Whetstone.settings.set(themeKey, settingData.id, newValue);

				if (settingData.tab === 'variables') {
					this._updateVariable({target:`[name="${k}"]`});

					//WhetstoneThemes.writeVariable(`${settingData.id}`, newValue);
				}
				Hooks.callAll(`update${settingData.theme}`, settingData, newValue, current);
			}
		}

		if (theme.data.active) {
			theme.activate();
		}
	}

	/** @override */
	async close(options={}) {

		let activeThemes = game.Whetstone.themes.active;

		// activate all active themes
		for (let i = 0, len = activeThemes.length; i < len; ++i) {
			activeThemes[i].activate();
		}

		return super.close(options);
	}
}