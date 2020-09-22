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
		const colorThemeID = this._colorTheme || game.Whetstone.settings.get(`${theme.name}.settings`, 'colorTheme') || theme.data.colorTheme;
		const settings = {
			variables: [],
			settings: [],
			substyles: []
		};
		const currentData = [];
		const defaultData = [];
		currentData['colorTheme'] = colorThemeID;
		defaultData['colorTheme'] = theme.data.colorTheme;
		const variableValues = theme.getVariableValues(colorThemeID);
		const colorTheme = Object.values(theme.data.colorThemes).filter(t => t.id === colorThemeID)[0];

		// Classify all settings
		for (const setting of game.Whetstone.settings.settings.values()) {
			// Exclude settings the user cannot change
			if (!setting.config || setting.scope !== 'client') continue;
			if (setting.theme !== theme.name) continue;

			// Update setting data
			const s = duplicate(setting);
			const currentValue = game.Whetstone.settings.get(`${s.theme}.${s.tab}`, s.key);
			const currentColorValue = variableValues[s.key] || currentValue;
			s.isColor = ['color', 'shades'].includes(s.color);
			s.value = this.reset ? s.default : currentColorValue;
			s.value = s.isColor ? WhetstoneThemes.colorData(s.value).color : s.value;
			s.alpha = s.isColor ? WhetstoneThemes.colorData(s.value).alpha : 0;
			s.type = setting.type instanceof Function ? setting.type.name : 'String';
			s.isCheckbox = setting.type === Boolean;
			s.isRange = setting.type === Number && s.range;
			s.isSelect = s.choices !== undefined;
			s.name = s.title || s.name;

			const presetsKey = (colorTheme && s.isColor) ? colorTheme.presets : s.presets;
			s.choices = theme.data.presets[presetsKey] || s.choices;

			if (s.color === 'shades') {
				let colorShades = WhetstoneThemes.getShades();

				s.shades = [`<span class="ws-shade-item" style="background-color: var(${s.key});" title="${s.key}">&nbsp;</span>`];
				Object.keys(colorShades).forEach((k) => {
					s.shades.push(`<span class="ws-shade-item" style="background-color: var(${s.key}-${k});" title="${s.key}-${k}">&nbsp;</span>`);
				});
				s.shades = s.shades.join('');
			}

			if (settings[s.tab]) {
				settings[s.tab].push(s);
			} else {
				settings[s.tab] = [s];
			}

			currentData[`${s.tab}/${s.key}`] = s.value;
			defaultData[`${s.tab}/${s.key}`] = s.default;
		}

		const returndata = this.reset ? defaultData : mergeObject(defaultData, currentData);
		returndata.theme = theme;
		returndata.settings = settings;
		returndata.colorTheme = this.reset ? theme.data.colorTheme : colorThemeID;
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
		// Reset Default Values
		html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));

		// fix for typed colors not always triggering validation on dialog open
		$('[name^="variables"]').change(this._updateVariable.bind(this));

		// theme import/export
		html.find('button.theme-export').click(this._themeExport.bind(this));
		html.find('button.theme-import').click(this._themeImport.bind(this));


		$('[name^="variables"]').change();

		this.reset = false;
	}

	_themeExport(event) {
		const exportData = {
			id: 'custom',
			name: 'WHETSTONE.ColorThemeCustom',
			custom: true,
			values: {}
		}

		$('#WhetstoneThemeConfigDialog [name^="variables"]').each((k,v) => {
			const control = $(v);
			const keyName = control.attr('name').split('/')[1];
			exportData.values[keyName] = control.val();
		});			

		let d = new Dialog({
			title: 'Export Preset',
			content: `<form class="flexcol">
				<div class="form-group">
					<label for="presetName">Enter Preset Name</label>
					<input type="text" name="presetName" placeholder="Enter Preset Name" value="${game.i18n.localize(exportData.name)}">
				</div>
			</form>`,
			buttons: {
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: 'Cancel'
				},
				export: {
					icon: '<i class="fas fa-file-export"></i>',
					label: 'Export',
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
		this.render();
	}



	/**
	 * Writes css vriables to the document when changed
	 * @param  {Event} event JQuery onchange event
	 */
	_updateVariable(event) {
		const control = $(event.target);
		const variableKey = control.attr('name');
		if (!variableKey) return;
		WhetstoneThemes.writeVariable(`${variableKey.split('/')[1]}`, control.val(), true);

		if (control.data('shades') === 'shades') {
			let colorShades = WhetstoneThemes.getShades(control.val());

			Object.keys(colorShades).forEach((k) => {
				WhetstoneThemes.writeVariable(`${variableKey.split('/')[1]}-${k}`, colorShades[k]);
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
		let colorData = WhetstoneThemes.colorData(control.val());
		let currentValue = control.val();

		if (control.attr('type') === 'range') {
			colorData = WhetstoneThemes.colorData(parentGroup.find('input[type="text"]').val(), (control.val()/255));
			currentValue = colorData.full;
		}
				
		// loop through 'brother' elements and attempt to set their value
		// invalid values either become 'custom' or '#000000'
		for (let el = colorGroup.length - 1; el >= 0; el--) {
			const brother = $(colorGroup[el]);

			// skip if setting myself
			if (brother.prop('type') === control.prop('type')) continue;

			if (brother.prop('tagName') === 'SELECT') {
				brother.val(currentValue);
				// no color matches a preset, set to custom
				if (brother.val() == null) {
					brother.val('custom');
				}
			} else if (brother.prop('type') === 'text') {
				// if custom, set to black at first
				if (currentValue === 'custom') {
					brother.val('#000000');
				} else {
					brother.val(currentValue);
				}
				brother.change();
			} else if (brother.prop('type') === 'range') {
				brother.val(colorData.alpha);
			} else {
				// color picker only accepts '#rrggbb' values
				brother.val(colorData.color);
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

		game.Whetstone.settings.set(`${theme.name}.settings`,'colorTheme', formData.colorTheme);

		const globalSettings = game.settings.get('Whetstone', 'settings');
		globalSettings[`${theme.name}.colorTheme`] = formData.colorTheme;
		game.settings.set('Whetstone', 'settings', globalSettings);

		for (const [k, newValue] of Object.entries(formData)) {
			const settingData = game.Whetstone.settings.settings.get(
				`${this._theme}.${k.split('/').join('.')}`
			);
			if (!settingData) continue;

			const themeKey = `${settingData.theme}.${settingData.tab}`;
			const current = game.Whetstone.settings.get(themeKey, settingData.key);
			if (newValue !== current) {
				game.Whetstone.settings.set(themeKey, settingData.key, newValue);

				if (settingData.tab === 'variables') {
					WhetstoneThemes.writeVariable(`${themeKey}.${settingData.key}`, newValue);
				}
				Hooks.callAll(`update${settingData.theme}`, settingData, newValue, current);
			}
		}
	}
}