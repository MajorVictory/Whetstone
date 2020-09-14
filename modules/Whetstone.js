
class WhetstoneThemes extends EntityCollection {
    constructor(...args) {

        if (!args[0]) args[0] = [];

        super(...args);


        console.log(`+=====================================================+
| __        ___          _       _                    |
| \\ \\      / / |__   ___| |_ ___| |_ ___  _ __   ___  |
|  \\ \\ /\\ / /| '_ \\ / _ \\ __/ __| __/ _ \\| '_ \\ / _ \\ |
|   \\ V  V / | | | |  __/ |_\\__ \\ || (_) | | | |  __/ |
|    \\_/\\_/  |_| |_|\\___|\\__|___/\\__\\___/|_| |_|\\___| |
|                                                     |
+=====================================================+`);

        /**
         * A reference to the theme configuration settings
         * @type {Object}
         */
        this.settings = game.settings.get("Whetstone", 'settings');
    }

    /*
game.themes.register('RetroUI-P5e', {

    // the following keys will be pulled from the module.json
    // name, title, description, version, author/authors, url

    // author/authors will be formattd to fit this format
    author: [
        { name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }
    ],

    // will be merged with 'styles' entry in module.json
    // these sheets are considered to be the 'core' styles for this theme
    // these files are always loaded first when the theme is enabed
    // no system specific themes should be defined here
    'styles': [
        'styles/fonts/loadfonts.css'
    ],

    // FormApplication extended class that creates the options dialog
    dialog: RetroUIP5eStylesConfigDialog,

    // RetroUICoreConfig extended class that handles theme settings
    config: RetroUIP5eStylesConfig,

    // (optional) Thumbnail image
    img: 'modules/RetroUI-P5e/thumb.png',

    // (optional) Large preview image
    preview: 'modules/RetroUI-P5e/preview.png',

    // (optional) priority, higher priorities load last (numeric > 0)
    priority: 1,

    // (optional) Ensure the specified module is loaded before registering theme 
    dependencies: {
        'RetroUI-Core': ''
    },

    // (optional) known compatible systems/versions
    // if specified, sheets are attempted to be loaded in the following order
    // 1. /modules/<Module_Name>/styles/systems/<SystemID>.css
    // 2. /modules/<Module_Name>/styles/systems/<SystemID>-<Version>.css
    // 
    // <SystemID> : will be the current active system id
    // <Version> : will be the current active system's version
    // 
    // specified versions are used to indicate to the user if a theme may have issues with their world
    // These are NOT ENFORCED
    systems: {
        'core': '0.6.6',
        'dnd5e': '0.96',
        'worldbuilding': '0.36',
        'pf2e': '1.10.10.1973'
    },

    // (optional) known compatibilities
    compatible: {
        'alt5e': '1.3.4',
        'tidy5e-sheet': '0.2.21',
        'furnace':'',
        'dice-calculator': ''
    },

    // (optional) known conflicts
    conflicts: {
        'darksheet': '',
        'dnd-ui': ''
    },
});
    */
    register(module, data) {

        if ( !module ) throw new Error("Whetstone | You must specify module");

        let moduledata = game.modules.get(module);

        // apply defaults
        data = mergeObject(data, {
            name: (data.name || moduledata.data.name),
            id: (data.name || moduledata.data.name),
            _id: (data.name || moduledata.data.name)
        }, {overwrite:false});


        let data_data = mergeObject(data, {
            name: (data.name || moduledata.data.name),
            title: moduledata.data.title,
            description: moduledata.data.description,
            img: 'modules/Whetstone/images/Whetstone-thumb.png',
            preview: (data.img || 'modules/Whetstone/images/Whetstone-thumb.png'),
            version: moduledata.data.version,
            author: moduledata.data.author,
            authors: moduledata.data.authors,

            hint: '', system: '', version: '', priority: 1,
            author: '', authors: [], styles: [], substyles: [],
            variables: [], colorsets: [], dialog: '', config: '',
            img: '', preview: '', dependencies: {}, systems: {},
            compatible: {}, conflicts: {}, active: false
        }, {overwrite:false});

        console.log('Whetstone | module: ', module, ' - data: ', data);

        this.insert(new WhetstoneTheme(data, data_data));
    }

    registerColor(moduleid, data) {

        let moduledata = this.get(moduleid);
        if(!moduledata) throw new Error("Whetstone | Cannot find theme: "+moduleid);



    }

    /**
     * Filter the results in the Compendium pack to only show ones which match a provided search string
     * @param {string} moduleid    The theme's module id
     */
    activate(moduleid) {

        let moduledata = this.get(moduleid);
        if(!moduledata) throw new Error("Whetstone | Cannot activate theme: "+moduleid);

        moduledata.update({active: true});

        let corestyles = this.getCoreStyles(moduleid);
        let systemstyles = this.getSubStyles(moduleid, game.system.id, game.system.data.version);
        let allstyles = corestyles.concat(systemstyles);

        for (let i=0, len=allstyles.length; i < len; ++i) {
            WhetstoneThemes.addStyle(allstyles[i]);
        }
    }

    deactivate(moduleid) {

        let moduledata = this.get(moduleid);
        if(!moduledata) throw new Error("Whetstone | Cannot deactivate theme: "+moduleid);

        moduledata.update({active: false});

        let corestyles = this.getCoreStyles(moduleid);
        let systemstyles = this.getSubStyles(moduleid, game.system.id, game.system.data.version);
        let allstyles = corestyles.concat(systemstyles);

        for (let i=0, len=allstyles.length; i < len; ++i) {
            WhetstoneThemes.removeStyle(allstyles[i]);
        }
    }

    getCoreStyles(moduleid) {
        let moduledata = this.get(moduleid);
        if(!moduledata) throw new Error("Whetstone | Cannot find theme: "+moduleid);
        return moduledata.data.styles;
    }

    /**
    * Get an array of stylesheets to load
    * @param {string} moduleid  module id
    * @param {string} system    system id
    * @param {string} version   (optional) specific version
    * @return {Array.<String>} a list of stylesheet paths
    **/
    getSubStyles(moduleid, system = '', version = '') {

        let moduledata = this.get(moduleid);
        if(!moduledata) throw new Error("Whetstone | Cannot find theme: "+moduleid);

        let styles = [];
        let matches = [];

        if (system && version) {
            console.log('Whetstone | system && version', system, version);
            matches = moduledata.data.substyles.filter(
                substyle => substyle.system == system && (substyle.version == version || isNewerVersion(version, substyle.version))
            );
            console.log('Whetstone | filter', matches);

            matches = matches ? matches.filter(substyle => substyle.activate == 'auto' || substyle.active) : [];


        } else if (system && !version) {
            console.log('Whetstone | system && !version', system, version);
            matches = moduledata.data.substyles.filter(substyle => substyle.system == system && !substyle.version);

            console.log('Whetstone | filter', matches);
            matches = matches ? matches.filter(substyle => substyle.activate == 'auto' || substyle.active) : [];


        } else {
            console.log('Whetstone | !system && !version', system, version);
            matches = moduledata.data.substyles.filter(substyle => !substyle.system && !substyle.version);

            console.log('Whetstone | filter', matches);
            matches = matches ? matches.filter(substyle => substyle.activate == 'manual' && substyle.active) : [];

        }

        console.log('Whetstone | getSubStyles', matches);

        if (matches) {
            for (let i=0, len=matches.length; i < len; ++i) {
                styles = styles.concat(matches[i].styles);
                
            }
            return styles;
        }
        return [];
    }
    /**
    * Return the Entity class which is featured as a member of this collection
    * @private
    */
    get object() {
        return WhetstoneTheme;
    }

    /**
    * The currently active WetstoneTheme instances
    * @return {WetstoneTheme}
    */
    get active() {
        return this.find(t => t.data.active);
    }

    static get instance() {
        return game.themes;
    }

    static removeStyle(path) {
        let element = $('head link[href="'+path+'"]');
        if (element) element.remove();
    }

    static addStyle(path) {
        WhetstoneThemes.removeStyle(path);
        $('<link href="'+path+'" rel="stylesheet" type="text/css" media="all">').appendTo($('head'));
    }

    /**
    * Test whether a file source exists by performing a HEAD request against it
    * @param {string} src    The source URL or path to test
    * @return {boolean}      Does the file exist at the provided url?
    */
    static async srcExists(src) {
        return fetch(src, { method: 'HEAD' }).then(resp => {
            return resp.status < 400;
        }).catch((error) => {
            return false;
        });
    }
}

class WhetstoneTheme extends Entity {
    /**
    * Configure the attributes of the JournalEntry Entity
    *
    * @returns {Entity} baseEntity       The parent class which directly inherits from the Entity interface.
    * @returns {EntityCollection} collection   The EntityCollection class to which Entities of this type belong.
    * @returns {Array} embeddedEntities  The names of any Embedded Entities within the Entity data structure.
    */
    static get config() {
        return {
            baseEntity: WhetstoneTheme,
            collection: game.themes,
            embeddedEntities: {},
            label: "WHETSTONE.ThemeEntry",
            permissions: {}
        };
    }

    /** @override */
    async delete(options) {
        if ( this.active ) {
            game.themes.deactivate(this.name);
        }
        return super.delete(options);
    }
}

Hooks.once('init', () => {

    CONFIG.WhetstoneThemes = {
        entityClass: WhetstoneTheme,
        collection: WhetstoneThemes
    };

    game.settings.registerMenu('Whetstone', 'Whetstone', {
        name: game.i18n.localize('WHETSTONE.Config'),
        label: game.i18n.localize('WHETSTONE.ConfigTitle'),
        hint: game.i18n.localize('WHETSTONE.ConfigHint'),
        icon: 'fas fa-paint-brush',
        type: WhetstoneConfigDialog,
        restricted: false
    });

    game.settings.register('Whetstone', 'settings', {
        name: game.i18n.localize('WHETSTONE.Config'),
        scope: 'client',
        default: WhetstoneConfig.getDefaults,
        type: Object,
        config: false,
        onChange: settings => {
            WhetstoneConfig.apply(settings);
        }
    });
});

//Hooks.once('setup', () => {
//});

Hooks.once('ready', () => {
    game.themes = new WhetstoneThemes();
    Hooks.callAll('WhetstoneReady');

    WhetstoneConfig.apply(game.settings.get('Whetstone', 'settings'));
});

Hooks.once('WhetstoneReady', () => {
    console.log('Whetstone | Ready');

     game.themes.register('Whetstone', {
        id: 'OceanBlues',
        name: 'OceanBlues',
        title: 'Ocean Blues',
        description: 'An example Style for Whetstone with static colors',
        version: '1.0.0',
        authors: [{ name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }],
        styles: ['modules/Whetstone/styles/OceanBlues.css'],
        variables: [
            {name: '--OceanBlues-bg-color', value: '#3D5A80', type: 'color', presets: ''},
            {name: '--OceanBlues-text-light-color', value: '#98C1D9', type: 'color', presets: ''},
            {name: '--OceanBlues-text-dark-color', value: '#102632', type: 'color', presets: ''},
            {name: '--OceanBlues-text-highlight-color', value: '#72B9D5', type: 'color', presets: ''},
            {name: '--OceanBlues-text-selection-color', value: '#B0C2BD', type: 'color', presets: ''},
            {name: '--OceanBlues-fg-color', value: '#E0FBFC', type: 'color', presets: ''},
            {name: '--OceanBlues-highlight-color', value: '#EE6C4D', type: 'color', presets: ''},
            {name: '--OceanBlues-border-color', value: '#293241', type: 'color', presets: ''}
        ],
        dialog: '',
        config: '',
        img: 'modules/Whetstone/images/Whetstone-thumb.png',
        preview: 'modules/Whetstone/images/OceanBlues-preview.png',
        dependencies: {},
        systems: { 'core': '0.6.6' },
        compatible: {},
        conflicts: {}
    });
});

class WhetstoneConfigDialog extends FormApplication {
    constructor(...args) {
        super(...args);
        this._expanded = false;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize('WHETSTONE.Config'),
            id: 'WhetstoneConfig',
            template: 'modules/Whetstone/templates/settings.html',
            width: 680,
            height: 'auto',
            closeOnSubmit: true,
            scrollY: [".theme-list"],
            tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "themeselect"}]
        });
    }

    getData(options) {
        let storedOptions = game.settings.get('Whetstone', 'settings');
        let defaultOptions = WhetstoneConfig.getDefaults;
        let settings = this.reset ? defaultOptions : mergeObject(defaultOptions, storedOptions);

        const counts = {all: game.themes.length, active: 0, inactive: 0};

        // Prepare themes
        const themes = game.themes.reduce((arr, m) => {
            const isActive = settings[m.name] === true;
            if ( isActive ) counts.active++;
            else counts.inactive++;

            const theme = duplicate(m.data);
            theme.active = isActive;
            theme.systems = theme.systems || null;
            theme.conflicts = theme.conflicts || null;
            theme.compatible = theme.compatible || null;
            theme.dependencies = theme.dependencies || null;
            return arr.concat([theme]);
        }, []);

        settings.counts = counts;
        settings.themes = themes;
        settings.expanded = this._expanded;
        return settings;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('input, select').change(this.onApply.bind(this));
        html.find('button[name="reset"]').click(this.onReset.bind(this));
        html.find('button.expand').click(this._onExpandCollapse.bind(this));
        html.find('button.theme-configure').click(this._onOpenConfig.bind(this));

        this.reset = false;
    }

    onApply(event) {
        event.preventDefault();
    }

    onReset() {
        this.reset = true;
        this.render();
    }

    _onExpandCollapse(event) {
        event.preventDefault();
        this._expanded = !this._expanded;
        this.render();
    }

    _onOpenConfig(event) {
        event.preventDefault();

        let moduleid = $(event.target).val();
        let theme = game.themes.get(moduleid);
        let menuname = theme.data.dialog;

        const menu = game.settings.menus.get(moduleid + '.' + menuname);
        if ( !menu ) return ui.notifications.error('No submenu found for the provided key');
        const app = new menu.type();
        return app.render(true);
    }

    async _updateObject(event, formData) {
        await game.settings.set('Whetstone', 'settings', formData);
        ui.notifications.info(game.i18n.localize("WHETSTONE.SaveMessage"));
    }
}


class WhetstoneConfig {

    static get getDefaults() {
        return {

        };
    }

    static get getOptions() {
        return mergeObject(WhetstoneConfig.getDefaults, game.settings.get("Whetstone", "settings"));
    }

    static apply(options) {

        console.log('Whetstone | WhetstoneConfig.apply()', options);

        let activate = [];
        let deactivate = [];

        for (let k in options) {
            let v = options[k];

            let theme = game.themes.get(k);

            if (!theme) continue;

            if (v) {
                activate.push({name: k, priority: options[k+'_priority']});
            } else {
                deactivate.push(k);
            }
        }

        // sort by priority first, then name in alphabetical
        if (activate.length > 0) {
            activate.sort((a, b) => (a.priority > b.priority) ? 1 : (a.priority === b.priority) ? ((a.name > b.name) ? 1 : -1) : -1);
        }

        console.log('Whetstone | activate', activate);
        console.log('Whetstone | deactivate', deactivate);

        if (deactivate.length > 0) {
            for (let i=0, len=deactivate.length; i < len; ++i) {
                game.themes.deactivate(deactivate[i]);
            }
        }

        if (activate.length > 0) {
            for (let i=0, len=activate.length; i < len; ++i) {
                game.themes.activate(activate[i].name);
            }
        }
    }


}