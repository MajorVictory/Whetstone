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
		default: WhetstoneCoreConfig.getDefaults.addMenuButton,
		type: Boolean,
		onChange: (enabled) => {
			WhetstoneThemes.toggleConfigButton(enabled);
		}
	});
});

Hooks.once('ready', () => {

	const settings = game.settings.get('Whetstone', 'settings');

	// create game.Whetstone.settings and game.Whetstone.themes
	game.Whetstone = {
		themes: new WhetstoneThemes(),
		settings: new WhetstoneThemeSettings([settings])
	};

	// register setting for add/remove menu button
	game.Whetstone.settings.register('Whetstone', 'presets', {
		name: 'Custom Presets List',
		scope: 'client',
		config: false,
		default: WhetstoneCoreConfig.getDefaults.presets,
		type: Object
	});

	Hooks.callAll('WhetstoneReady');

	game.Whetstone.themes.entries.forEach((v, k) => {
		v.loadColorThemePresets();
	});

	WhetstoneCoreConfig.apply(game.settings.get('Whetstone', 'settings'));
});

Hooks.once('WhetstoneReady', () => {
	console.log('Whetstone | Ready');

	let fontList = [
		'serif',
		'sans-serif',
		'monospace',
		'cursive',
		'fantasy',
		'system-ui',
		'ui-serif',
		'ui-sans-serif',
		'ui-monospace',
		'ui-rounded',
		'emoji',
		'math',
		'fangsong',
		'inherit',
		'initial',
		'unset'
	].concat(CONFIG.fontFamilies);

	let fontChoices = {};
	fontList.map(f => fontChoices[f] = f);


	// register example theme: OceanBlues
	game.Whetstone.themes.register('Whetstone', {
		id: 'Whetstone',
		name: 'Whetstone',
		title: 'Whetstone Global Variables',
		description: 'Globally defined colors any theme can use.',
		img: 'modules/Whetstone/images/Whetstone-thumb.png',
		version: '1.0.0',
		authors: [],
		priority: Number.MIN_SAFE_INTEGER,
		active: true,
		variables: [
			{
				name: '--Whetstone-font-family-header',
				hint: 'Font used for Headers and Labels.',
				default: 'Modesto Condensed',
				presets: 'fontChoices'
			},
			{
				name: '--Whetstone-font-family-body',
				hint: 'Font used for regular text bodies.',
				default: 'Signika',
				presets: 'fontChoices'
			},
			{
				name: '--Whetstone-font-family-mono',
				hint: 'Font used for monospaced text like numbers or code.<hr>',
				default: 'monospace',
				presets: 'fontChoices'
			},
			{
				name: '--Whetstone-bg-app',
				hint: 'Background color for dialogues and windows.',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-toolbar',
				hint: 'Background color for toolbars and popouts.<hr>',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-primary',
				hint: 'Primary background color for content.',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-fg-primary',
				hint: 'Main foreground color for text and elements. (Should contrast with bg-primary)<hr>',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-secondary',
				hint: 'Secondary background color for content on top of primary background.',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-fg-secondary',
				hint: 'Secondary foreground color for text and elements. (Should contrast with bg-secondary)<hr>',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-tertiary',
				hint: 'Third background color for content on top of primary background.',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-fg-tertiary',
				hint: 'Third foreground color for text and elements. (Should contrast with bg-tertiary)<hr>',
				default: '#000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-highlight',
				hint: 'Color to indicate selected elements.',
				default: '#ff0000',
				type: 'shades'
			},
			{
				name: '--Whetstone-accent-primary',
				hint: 'Color to add visual notice or to draw attention.',
				default: '#782e22',
				type: 'shades'
			},
			{
				name: '--Whetstone-accent-secondary',
				hint: 'A second color to add visual notice or to draw attention.',
				default: '#ff6400',
				type: 'shades'
			},
			{
				name: '--Whetstone-border-primary',
				hint: 'Border color for elements, buttons, and inputs.',
				default: '#f0f0e0',
				type: 'shades'
			},
			{
				name: '--Whetstone-border-secondary',
				hint: 'Borders color for spacing elements and dividers.',
				default: '#f0f0e0',
				type: 'shades'
			}
		],
		presets: {
			fontChoices: fontChoices
		}
	});

	game.Whetstone.settings.registerMenu('Whetstone', 'Whetstone', {
		name: game.i18n.localize('WHETSTONE.Config'),
		label: game.i18n.localize('WHETSTONE.ConfigTitle'),
		hint: game.i18n.localize('WHETSTONE.ConfigHint'),
		icon: 'fas fa-paint-brush',
		restricted: false
	});

	// register example theme: OceanBlues
	game.Whetstone.themes.register('Whetstone', {
		id: 'OceanBlues',
		name: 'OceanBlues',
		title: 'Ocean Blues',
		description: 'An example Style for Whetstone with variable colors',
		version: '1.0.0',
		authors: [{
			name: 'MajorVictory',
			contact: 'Github',
			url: 'https://github.com/MajorVictory'
		}],
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
				styles: ['modules/Whetstone/styles/OceanBlues-SceneButtons.css']
			},
			'OceanBlues-Chat': {
				name: 'OceanBlues-Chat',
				title: 'OCEANBLUES.SubstyleChat',
				hint: 'OCEANBLUES.SubstyleChatHint',
				active: true,
				styles: ['modules/Whetstone/styles/OceanBlues-Chat.css']
			},
			'OceanBlues-CompactSidebar': {
				name: 'OceanBlues-CompactSidebar',
				title: 'OCEANBLUES.SubstyleCompactSidebar',
				hint: 'OCEANBLUES.SubstyleCompactSidebarHint',
				active: false,
				styles: ['modules/Whetstone/styles/OceanBlues-CompactSidebar.css']
			},
			'OceanBlues-SceneButtonsSmaller': {
				name: 'OceanBlues-SceneButtonsSmaller',
				title: 'OCEANBLUES.SubstyleSceneButtonsSmaller',
				hint: 'OCEANBLUES.SubstyleSceneButtonsSmallerHint',
				active: false,
				styles: ['modules/Whetstone/styles/OceanBlues-SceneButtonsSmaller.css']
			},
			'OceanBlues-PF2e-CRBStyle': {
				name: 'OceanBlues-PF2e-CRBStyle',
				title: 'OCEANBLUES.SubstylePF2eCRBStyle',
				hint: 'OCEANBLUES.SubstylePF2eCRBStyleHint',
				system: 'pf2e',
				active: true,
				styles: ['modules/Whetstone/styles/OceanBlues-PF2e-CRBStyle.css']
			},
			'OceanBlues-PF2e-SheetColors': {
				name: 'OceanBlues-PF2e-SheetColors',
				title: 'OCEANBLUES.SubstylePF2eSheetColors',
				hint: 'OCEANBLUES.SubstylePF2eSheetColorsHint',
				system: 'pf2e',
				active: true,
				styles: ['modules/Whetstone/styles/OceanBlues-PF2e-SheetColors.css']
			}
		},
		variables: [
			{
				name: '--OceanBlues-bg-color',
				title: 'Background Color',
				hint: 'Used in sheet headers, tinges the background.',
				default: '#3d5a80',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-bg-window-blendmode',
				title: 'Window Background Blend Mode',
				hint: 'Color blend for window titles and sidebar',
				default: 'luminosity',
				type: String,
				presets: 'blendmodes'
			},
			{
				name: '--OceanBlues-bg-sheet-blendmode',
				title: 'Sheet Background Blend Mode',
				hint: 'Color blend for sheet backgrounds.',
				default: 'luminosity',
				type: String,
				presets: 'blendmodes'
			},
			{
				name: '--OceanBlues-text-light-color',
				title: 'Text Color - Light',
				hint: 'Used for text on dark background.',
				default: '#98c1d9',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-text-dark-color',
				title: 'Text Color - Dark',
				hint: 'Used for text on light backgrounds.',
				default: '#102632',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-text-highlight-color',
				title: 'Text Highlight Color',
				hint: '',
				default: '#72b9d5',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-text-selection-color',
				title: 'Text Selection Color',
				hint: '',
				default: '#b0c2bd',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-fg-color',
				title: 'Foreground Color',
				hint: 'Used for textboxes and input fields',
				default: '#e0fbfc',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-highlight-color',
				title: 'Highlight Color',
				hint: 'Used for highlighter color when hovering over hyperlinks or interface elements.',
				default: '#ee6c4d',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-border-color',
				title: 'Border Color',
				hint: '',
				default: '#293241',
				type: 'color',
				presets: 'oceanblues'
			}
		],

		presets: {
			oceanblues: {
				'#3d5a80': 'Bdazzled Blue',
				'#98c1d9': 'Pale Cerulean',
				'#102632': 'Charcoal',
				'#72b9d5': 'Dark Sky Blue',
				'#b0c2bd': 'Opal',
				'#e0fbfc': 'Light Cyan',
				'#ee6c4d': 'Burnt Sienna',
				'#293241': 'Gunmetal'
			},
			earthygreen: {
				'#163216': 'Phthalo Green',
				'#91c589': 'Dark Sea Green',
				'#3e5a30': 'Hunter Green',
				'#e9eed2': 'Beige',
				'#d6b087': 'Tan',
				'#defeb4': 'Tea Green',
				'#00aa2b': 'Green Pantone',
				'#804000': 'Chocolate Traditional'
			},
			hackerspace: {
				'#001500': 'Dark Jungle Green',
				'#69e973': 'Light Green',
				'#363636': 'Jet',
				'#00ff00': 'Electric Green',
				'#47ff47': 'Erin',
				'#c8feb8': 'Tea Green',
				'#00aa2b': 'Green Pantone',
				'#00ff00': 'Electric Green'
			},
			blendmodes: {
				'normal': 'Normal',
				'multiply': 'Multiply',
				'screen': 'Screen',
				'overlay': 'Overlay',
				'darken': 'Darken',
				'lighten': 'Lighten',
				'color-dodge': 'Color Dodge',
				'color-burn': 'Color Burn',
				'hard-light': 'Hard Light',
				'soft-light': 'Soft Light',
				'difference': 'Difference',
				'exclusion': 'Exclusion',
				'hue': 'Hue',
				'saturation': 'Saturation',
				'color': 'Color',
				'luminosity': 'Luminosity',
				'initial': 'Initial',
				'inherit': 'Inherit',
				'unset': 'Unset'
			}
		},
		colorTheme: 'oceanblues',
		colorThemes: [
			{
				id: 'oceanblues',
				name: 'OCEANBLUES.ColorThemeDefault',
				presets: 'oceanblues',
				values: {
					'--OceanBlues-bg-color': '#3d5a80',
					'--OceanBlues-bg-window-blendmode': 'luminosity',
					'--OceanBlues-bg-sheet-blendmode': 'luminosity',
					'--OceanBlues-text-light-color': '#98c1d9',
					'--OceanBlues-text-dark-color': '#102632',
					'--OceanBlues-text-highlight-color': '#72b9d5',
					'--OceanBlues-text-selection-color': '#b0c2bd',
					'--OceanBlues-fg-color': '#e0fbfc',
					'--OceanBlues-highlight-color': '#ee6c4d',
					'--OceanBlues-border-color': '#293241'
				}
			},
			{
				id: 'earthygreen',
				name: 'OCEANBLUES.ColorThemeGreen',
				presets: 'earthygreen',
				values: {
					'--OceanBlues-bg-color': '#648859',
					'--OceanBlues-bg-window-blendmode': 'lighten',
					'--OceanBlues-bg-sheet-blendmode': 'luminosity',
					'--OceanBlues-text-light-color': '#54392e',
					'--OceanBlues-text-dark-color': '#25361d',
					'--OceanBlues-text-highlight-color': '#e9eed2',
					'--OceanBlues-text-selection-color': '#a26f35',
					'--OceanBlues-fg-color': '#b7a077',
					'--OceanBlues-highlight-color': '#4a3713',
					'--OceanBlues-border-color': '#804000'
				}
			},
			{
				id: 'hackerspace',
				name: 'OCEANBLUES.ColorThemeHacker',
				presets: 'hackerspace',
				values: {
					'--OceanBlues-bg-color': '#001500',
					'--OceanBlues-bg-window-blendmode': 'color',
					'--OceanBlues-bg-sheet-blendmode': 'color-dodge',
					'--OceanBlues-text-light-color': '#1caa29',
					'--OceanBlues-text-dark-color': '#060606',
					'--OceanBlues-text-highlight-color': '#2dff2d',
					'--OceanBlues-text-selection-color': '#47ff47',
					'--OceanBlues-fg-color': '#c8feb8',
					'--OceanBlues-highlight-color': '#00ca33',
					'--OceanBlues-border-color': '#62ff62'
				}
			}
		],
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
		JSON.parse(game.settings.get('Whetstone', 'addMenuButton'))
	);
});