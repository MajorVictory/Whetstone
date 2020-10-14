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
		v.loadColorThemes();
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
	fontList.map(f => fontChoices[`'${f}'`] = f);


	// register example theme: OceanBlues
	game.Whetstone.themes.register('Whetstone', {
		id: 'Whetstone',
		name: 'Whetstone',
		title: 'Whetstone Global Variables',
		description: 'Globally defined colors any theme can use.',
		img: 'modules/Whetstone/images/Whetstone-thumb.png',
		version: '1.1.0',
		authors: [],
		priority: Number.MIN_SAFE_INTEGER,
		active: true,
		styles: ['modules/Whetstone/styles/Whetstone-Global-Colors.css'],
		variables: [
			{
				name: '--Whetstone-font-family-header',
				hint: 'Font used for Headers and Labels.',
				default: '\'Modesto Condensed\'',
				presets: 'fontChoices'
			},
			{
				name: '--Whetstone-font-family-body',
				hint: 'Font used for regular text bodies.',
				default: '\'Signika\'',
				presets: 'fontChoices'
			},
			{
				name: '--Whetstone-font-family-mono',
				hint: 'Font used for monospaced text like numbers or code.',
				default: '\'monospace\'',
				presets: 'fontChoices'
			},
			{
				name: '--Whetstone-bg-app',
				hint: 'Background color for dialogues and windows.',
				default: '#00000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-toolbar',
				hint: 'Background color for toolbars and popouts.',
				default: '#00000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-primary',
				hint: 'Primary background color for content.',
				default: '#00000000',
				type: 'shades'
			},
			{
				name: '--Whetstone-fg-primary',
				hint: 'Main foreground color for headers and category elements. (Should contrast with bg-primary)',
				default: '#191813',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-secondary',
				hint: 'Secondary background color for content on top of primary background.',
				default: '#0000000d',
				type: 'shades'
			},
			{
				name: '--Whetstone-fg-secondary',
				hint: 'Secondary foreground color for text and list elements. (Should contrast with bg-secondary)',
				default: '#4b4a44',
				type: 'shades'
			},
			{
				name: '--Whetstone-bg-tertiary',
				hint: 'Third background color for content on top of primary background.',
				default: '#0000001a',
				type: 'shades'
			},
			{
				name: '--Whetstone-fg-tertiary',
				hint: 'Alternate foreground color for text and list elements. (Should contrast with bg-tertiary)',
				default: '#7a7971',
				type: 'shades'
			},
			{
				name: '--Whetstone-text-highlight',
				hint: 'Color to indicate active and selected elements.',
				default: '#c53131',
				type: 'shades'
			},
			{
				name: '--Whetstone-accent-primary',
				hint: 'Color to add visual notice or to draw attention.',
				default: '#ff0000',
				type: 'shades'
			},
			{
				name: '--Whetstone-accent-secondary',
				hint: 'A second color to add visual notice or to draw attention.',
				default: '#c53131',
				type: 'shades'
			},
			{
				name: '--Whetstone-border-primary',
				hint: 'Border color for elements, buttons, and inputs.',
				default: '#eeede0',
				type: 'shades'
			},
			{
				name: '--Whetstone-border-secondary',
				hint: 'Border color for spacing elements and dividers.',
				default: '#c9c7b8',
				type: 'shades'
			},
			{
				name: '--Whetstone-border-active',
				hint: 'Border color active and selected form elements.',
				default: '#c53131',
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
		version: '1.1.0',
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
				title: 'OCEANBLUES.OceanBlues-bg-color',
				hint: 'OCEANBLUES.OceanBlues-bg-colorHint',
				default: '#3e5c86e6',
				type: 'shades',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-bg-image-window',
				title: 'OCEANBLUES.OceanBlues-bg-image-window',
				hint: 'OCEANBLUES.OceanBlues-bg-image-windowHint',
				default: 'ui/denim075.png',
				type: 'image'
			},
			{
				name: '--OceanBlues-bg-window-blendmode',
				title: 'OCEANBLUES.OceanBlues-bg-window-blendmode',
				hint: 'OCEANBLUES.OceanBlues-bg-window-blendmodeHint',
				default: 'luminosity',
				type: String,
				presets: 'blendmodes'
			},
			{
				name: '--OceanBlues-bg-image-sheet',
				title: 'OCEANBLUES.OceanBlues-bg-image-sheet',
				hint: 'OCEANBLUES.OceanBlues-bg-image-sheetHint',
				default: 'ui/parchment.jpg',
				type: 'image'
			},
			{
				name: '--OceanBlues-bg-sheet-blendmode',
				title: 'OCEANBLUES.OceanBlues-bg-sheet-blendmode',
				hint: 'OCEANBLUES.OceanBlues-bg-sheet-blendmodeHint',
				default: 'color-burn',
				type: String,
				presets: 'blendmodes'
			},
			{
				name: '--OceanBlues-text-light-color',
				title: 'OCEANBLUES.OceanBlues-text-light-color',
				hint: 'OCEANBLUES.OceanBlues-text-light-colorHint',
				default: '#c6dceaff',
				type: 'shades',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-text-dark-color',
				title: 'OCEANBLUES.OceanBlues-text-dark-color',
				hint: 'OCEANBLUES.OceanBlues-text-dark-colorHint',
				default: '#8dbbdcff',
				type: 'shades',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-text-highlight-color',
				title: 'OCEANBLUES.OceanBlues-text-highlight-color',
				hint: 'OCEANBLUES.OceanBlues-text-highlight-colorHint',
				default: '#72b9d5ff',
				type: 'shades',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-text-selection-color',
				title: 'OCEANBLUES.OceanBlues-text-selection-color',
				hint: 'OCEANBLUES.OceanBlues-text-selection-colorHint',
				default: '#9eb4d3ff',
				type: 'color',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-fg-color',
				title: 'OCEANBLUES.OceanBlues-fg-color',
				hint: 'OCEANBLUES.OceanBlues-fg-colorHint',
				default: '#0c5f76ff',
				type: 'shades',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-highlight-color',
				title: 'OCEANBLUES.OceanBlues-highlight-color',
				hint: 'OCEANBLUES.OceanBlues-highlight-colorHint',
				default: '#ee6c4dff',
				type: 'shades',
				presets: 'oceanblues'
			},
			{
				name: '--OceanBlues-border-color',
				title: 'OCEANBLUES.OceanBlues-border-color',
				hint: 'OCEANBLUES.OceanBlues-border-colorHint',
				default: '#293241ff',
				type: 'color',
				presets: 'oceanblues'
			}
		],

		presets: {
			oceanblues: {
				'#3e5c86e6': 'East Bay',
				'#c6dceaff': 'Periwinkle Gray',
				'#8dbbdcff': 'Morning Glory',
				'#72b9d5ff': 'Downy',
				'#9eb4d3ff': 'Rock Blue',
				'#0c5f76ff': 'Atoll',
				'#ee6c4dff': 'Burnt Sienna',
				'#293241ff': 'Ebony Clay'
			},
			icewindblues: {
				'#3d5a80ff': 'Bdazzled Blue',
				'#a0c6dcff': 'Aqua Island',
				'#102632ff': 'Charcoal',
				'#20566aff': 'Cello',
				'#b0c2bdff': 'Opal',
				'#e0fbfcff': 'Light Cyan',
				'#ee6c4dff': 'Burnt Sienna',
				'#293241ff': 'Gunmetal'
			},
			earthygreen: {
				'#55744bd2': 'Dingley',
				'#ecf0bdff': 'Mint Julep',
				'#d5bb99ff': 'Cameo',
				'#9ed286ff': 'Feijoa',
				'#a26f35ff': 'Copper',
				'#2f271aff': 'Zeus',
				'#6b501dff': 'West Coast',
				'#512800ff': 'Indian Tan'
			},
			hackerspace: {
				'#032202ff': 'English Holly',
				'#1caa29ff': 'Forest Green',
				'#00b700ff': 'Green',
				'#2dff2dff': 'Harlequin',
				'#1d2bcfff': 'Persian Blue',
				'#0f3d01ff': 'Deep Fir',
				'#008020ff': 'Fun Green',
				'#62ff62ff': 'Electric Green'
			},
			lavender_fields: {
				'#412e5280': 'Martinique',
				'#f5e0e6ff': 'Vanilla Ice',
				'#60006aff': 'Ripe Plum',
				'#fbc4dbff': 'Cupid',
				'#fef2ffff': 'White Pointer',
				'#b39dd0ff': 'East Side',
				'#8338d6ff': 'Purple Heart',
				'#4d114dff': 'Loulou'
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
					'--OceanBlues-bg-color': '#3e5c86e6',
					'--OceanBlues-bg-image-window': 'ui/denim075.png',
					'--OceanBlues-bg-window-blendmode': 'luminosity',
					'--OceanBlues-bg-image-sheet': 'ui/parchment.jpg',
					'--OceanBlues-bg-sheet-blendmode': 'color-burn',
					'--OceanBlues-text-light-color': '#c6dceaff',
					'--OceanBlues-text-dark-color': '#8dbbdcff',
					'--OceanBlues-text-highlight-color': '#72b9d5ff',
					'--OceanBlues-text-selection-color': '#9eb4d3ff',
					'--OceanBlues-fg-color': '#0c5f76ff',
					'--OceanBlues-highlight-color': '#ee6c4dff',
					'--OceanBlues-border-color': '#293241ff'
				}
			},
			{
				id: 'icewindblues',
				name: 'OCEANBLUES.ColorThemeIcewind',
				presets: 'icewindblues',
				values: {
					'--OceanBlues-bg-color': '#3d5a80ff',
					'--OceanBlues-bg-image-window': 'ui/denim075.png',
					'--OceanBlues-bg-window-blendmode': 'luminosity',
					'--OceanBlues-bg-image-sheet': 'ui/parchment.jpg',
					'--OceanBlues-bg-sheet-blendmode': 'luminosity',
					'--OceanBlues-text-light-color': '#a0c6dcff',
					'--OceanBlues-text-dark-color': '#102632ff',
					'--OceanBlues-text-highlight-color': '#20566aff',
					'--OceanBlues-text-selection-color': '#b0c2bdff',
					'--OceanBlues-fg-color': '#e0fbfcff',
					'--OceanBlues-highlight-color': '#ee6c4dff',
					'--OceanBlues-border-color': '#293241ff'
				}
			},
			{
				id: 'earthygreen',
				name: 'OCEANBLUES.ColorThemeGreen',
				presets: 'earthygreen',
				values: {
					'--OceanBlues-bg-color': '#55744bd2',
					'--OceanBlues-bg-image-window': 'ui/denim-dark-090.png',
					'--OceanBlues-bg-window-blendmode': 'luminosity',
					'--OceanBlues-bg-image-sheet': 'ui/denim075.png',
					'--OceanBlues-bg-sheet-blendmode': 'color-burn',
					'--OceanBlues-text-light-color': '#ecf0bdff',
					'--OceanBlues-text-dark-color': '#d5bb99ff',
					'--OceanBlues-text-highlight-color': '#9ed286ff',
					'--OceanBlues-text-selection-color': '#a26f35ff',
					'--OceanBlues-fg-color': '#2f271aff',
					'--OceanBlues-highlight-color': '#6b501dff',
					'--OceanBlues-border-color': '#512800ff'
				}
			},
			{
				id: 'hackerspace',
				name: 'OCEANBLUES.ColorThemeHacker',
				presets: 'hackerspace',
				values: {
					'--OceanBlues-bg-color': '#032202ff',
					'--OceanBlues-bg-image-window': 'ui/denim075.png',
					'--OceanBlues-bg-window-blendmode': 'darken',
					'--OceanBlues-bg-image-sheet': 'ui/parchment.jpg',
					'--OceanBlues-bg-sheet-blendmode': 'multiply',
					'--OceanBlues-text-light-color': '#1caa29ff',
					'--OceanBlues-text-dark-color': '#00b700ff',
					'--OceanBlues-text-highlight-color': '#2dff2dff',
					'--OceanBlues-text-selection-color': '#1d2bcfff',
					'--OceanBlues-fg-color': '#0f3d01ff',
					'--OceanBlues-highlight-color': '#008020ff',
					'--OceanBlues-border-color': '#62ff62ff'
				}
			},
			{
				id: 'lavender_fields',
				name: 'OCEANBLUES.ColorThemePurple',
				presets: 'lavender_fields',
				values: {
					'--OceanBlues-bg-color': '#412e5280',
					'--OceanBlues-bg-image-window': 'ui/denim075.png',
					'--OceanBlues-bg-window-blendmode': 'luminosity',
					'--OceanBlues-bg-image-sheet': 'ui/parchment.jpg',
					'--OceanBlues-bg-sheet-blendmode': 'color-burn',
					'--OceanBlues-text-light-color': '#f5e0e6ff',
					'--OceanBlues-text-dark-color': '#60006aff',
					'--OceanBlues-text-highlight-color': '#fbc4dbff',
					'--OceanBlues-text-selection-color': '#fef2ffff',
					'--OceanBlues-fg-color': '#b39dd0ff',
					'--OceanBlues-highlight-color': '#8338d6ff',
					'--OceanBlues-border-color': '#4d114dff'
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

// this implementation is for v1.1.2 only
// this process will be streamlined in future versions
Hooks.on('onThemeActivated', (themeData) => {
	if(themeData.id !== 'OceanBlues') return;

	let windowImage = game.Whetstone.settings.get('OceanBlues', 'variables.--OceanBlues-bg-image-window');
	let sheetImage = game.Whetstone.settings.get('OceanBlues', 'variables.--OceanBlues-bg-image-sheet');

	let customStyle = $('#OceanBluesCustomStyle');
	if (!customStyle.length) {
		$('head').append('<style id="OceanBluesCustomStyle"></style>');
		customStyle = $('#OceanBluesCustomStyle');
	}

	customStyle.html(`
.app {
	color: var(--OceanBlues-text-light-color);
	background: url('/${windowImage}') repeat;
	background-color: var(--OceanBlues-bg-color);
	background-blend-mode: var(--OceanBlues-bg-window-blendmode);
}
.window-app .window-content, .dnd5e.sheet .window-content {
	color: var(--OceanBlues-text-dark-color);
	background: url('/${sheetImage}') repeat;
	background-color: var(--OceanBlues-bg-color);
	background-blend-mode: var(--OceanBlues-bg-sheet-blendmode);
}

.tidy5e.sheet.actor.npc .spellcasting-ability {
	background: url('/${sheetImage}') repeat;
	background-color: var(--OceanBlues-bg-color);
	background-blend-mode: var(--OceanBlues-bg-sheet-blendmode);
}`);

Hooks.on('onThemeDeactivated', (themeData) => {
	if(themeData.id !== 'OceanBlues') return;

	let customStyle = $('#OceanBluesCustomStyle');
	if (customStyle.length) customStyle.remove();
});

});