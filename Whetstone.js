import {WhetstoneTheme} from './modules/WhetstoneTheme.js';
import {WhetstoneThemes} from './modules/WhetstoneThemes.js';
import {WhetstoneCoreConfig} from './modules/WhetstoneCoreConfig.js';
import {WhetstoneThemeSettings} from './modules/WhetstoneThemeSettings.js';
import {WhetstoneCoreConfigDialog} from './modules/WhetstoneCoreConfigDialog.js';

Hooks.once('init', () => {
	// inform foundry of our collection type
	CONFIG.WhetstoneThemes = {
		entityClass: WhetstoneTheme,
		collection: WhetstoneThemes
	};

	// register core config dialog
	game.settings.registerMenu('Whetstone', 'Whetstone', {
		name: game.i18n.localize('WHETSTONE.Config'),
		label: game.i18n.localize('WHETSTONE.ConfigTitle'),
		hint: game.i18n.localize('WHETSTONE.ConfigHint'),
		icon: 'fas fa-paint-brush',
		type: WhetstoneCoreConfigDialog,
		restricted: false
	});

	// register core settings key
	game.settings.register('Whetstone', 'settings', {
		name: game.i18n.localize('WHETSTONE.Config'),
		scope: 'client',
		default: WhetstoneCoreConfig.getDefaults,
		type: Object,
		config: false,
		onChange: (settings) => {
			WhetstoneCoreConfig.apply(settings);
		}
	});

	// register setting for add/remove menu button
	game.settings.register('Whetstone', 'addMenuButton', {
		name: 'WHETSTONE.AddMenuButton',
		hint: 'WHETSTONE.AddMenuButtonHint',
		scope: 'world',
		config: true,
		default: true,
		type: Boolean,
		onChange: (enabled) => {
			WhetstoneThemes.toggleConfigButton(enabled);
		}
	});
});

Hooks.once('ready', () => {
	// create game.Whetstone.settings and game.Whetstone.themes
	game.Whetstone = {
		themes: new WhetstoneThemes(),
		settings: new WhetstoneThemeSettings(
			game.settings.get('Whetstone', 'settings') || []
		)
	};

	Hooks.callAll('WhetstoneReady');
	WhetstoneCoreConfig.apply(game.settings.get('Whetstone', 'settings'));
});

Hooks.once('WhetstoneReady', () => {
	console.log('Whetstone | Ready');

	// register example theme: OceanBlues
	game.Whetstone.themes.register('Whetstone', {
		id: 'OceanBlues',
		name: 'OceanBlues',
		title: 'Ocean Blues',
		description: 'An example Style for Whetstone with variable colors',
		version: '1.0.0',
		authors: [
			{
				name: 'MajorVictory',
				contact: 'Github',
				url: 'https://github.com/MajorVictory'
			}
		],
		styles: ['modules/Whetstone/styles/OceanBlues.css'],
		substyles: {
			'OceanBlues-Hotbar': {
				name: 'OceanBlues-Hotbar',
				title: 'OCEANBLUES.SubstyleHotbar',
				hint: 'OCEANBLUES.SubstyleHotbarHint',
				active: true,
				styles: ['modules/Whetstone/styles/OceanBlues-Hotbar.css']
			},
			'OceanBlues-Toolbar': {
				name: 'OceanBlues-Toolbar',
				title: 'OCEANBLUES.SubstyleToolbar',
				hint: 'OCEANBLUES.SubstyleToolbarHint',
				active: true,
				styles: ['modules/Whetstone/styles/OceanBlues-Toolbar.css']
			},
			'OceanBlues-SceneButtons': {
				name: 'OceanBlues-SceneButtons',
				title: 'OCEANBLUES.SubstyleSceneButtons',
				hint: 'OCEANBLUES.SubstyleSceneButtonsHint',
				active: true,
				styles: [
					'modules/Whetstone/styles/OceanBlues-SceneButtons.css'
				]
			},
			'OceanBlues-SceneButtonsSmaller': {
				name: 'OceanBlues-SceneButtonsSmaller',
				title: 'OCEANBLUES.SubstyleSceneButtonsSmaller',
				hint: 'OCEANBLUES.SubstyleSceneButtonsSmallerHint',
				active: false,
				styles: [
					'modules/Whetstone/styles/OceanBlues-SceneButtonsSmaller.css'
				]
			}
		},
		variables: [
			{
				name: '--OceanBlues-bg-color',
				title: 'Background Color',
				hint: 'Used in sheet headers, tinges the background.',
				default: '#3d5a80',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-text-light-color',
				title: 'Text Color - Light',
				hint: 'Used for text on dark background.',
				default: '#98c1d9',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-text-dark-color',
				title: 'Text Color - Dark',
				hint: 'Used for text on light backgrounds.',
				default: '#102632',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-text-highlight-color',
				title: 'Text Highlight Color',
				hint: '',
				default: '#72b9d5',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-text-selection-color',
				title: 'Text Selection Color',
				hint: '',
				default: '#b0c2bd',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-fg-color',
				title: 'Foreground Color',
				hint: 'Used for textboxes and input fields',
				default: '#e0fbfc',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-highlight-color',
				title: 'Highlight Color',
				hint: 'Used for highlighter color when hovering over hyperlinks or interface elements.',
				default: '#ee6c4d',
				type: 'color',
				presets: 'palette'
			},
			{
				name: '--OceanBlues-border-color',
				title: 'Border Color',
				hint: '',
				default: '#293241',
				type: 'color',
				presets: 'palette'
			}
		],

		presets: {
			palette: {
				'#3d5a80': 'Bdazzled Blue',
				'#98c1d9': 'Pale Cerulean',
				'#102632': 'Charcoal',
				'#72b9d5': 'Dark Sky Blue',
				'#b0c2bd': 'Opal',
				'#e0fbfc': 'Light Cyan',
				'#ee6c4d': 'Burnt Sienna',
				'#293241': 'Gunmetal'
			},
			sheetColorPresets: {
				'#fffbce': 'Standard Tan',
				'#ff9d9d': 'Trainer Red',
				'#e4a089': 'Rocky Brown',
				'#f4ce88': 'Mousy Yellow',
				'#68c098': 'Misty Green',
				'#b5dc92': 'Buggy Green',
				'#58d0d0': 'Trainer Blue',
				'#c0a5da': 'Trainer Purple',
				'#eee6dd': 'Eggy Shell White',
				'#f0ace6': 'Balloon Pink',
				'#c0c0c0': 'Steely Grey',
				'#525252': 'Edgy Black'
			}
		},
		dialog: '',
		config: '',
		img: 'modules/Whetstone/images/Whetstone-thumb.png',
		preview: 'modules/Whetstone/images/OceanBlues-preview.jpg',
		dependencies: {},
		systems: {core: '0.6.6'},
		compatible: {},
		conflicts: {}
	});

	// Register that this theme has a menu.
	// 'type' is left intentionally empty since
	// WhetstoneThemeConfigDialog will be provided by Whetstone core
	game.Whetstone.settings.registerMenu('OceanBlues', 'OceanBlues', {
		name: game.i18n.localize('WHETSTONE.Config'),
		label: game.i18n.localize('WHETSTONE.ConfigTitle'),
		hint: game.i18n.localize('WHETSTONE.ConfigHint'),
		icon: 'fas fa-paint-brush',
		restricted: false
	});
});

// create/remove the quick access config button
Hooks.once('renderSettings', () => {
	WhetstoneThemes.toggleConfigButton(
		game.settings.get('Whetstone', 'addMenuButton')
	);
});