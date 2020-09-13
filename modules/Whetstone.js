
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

        data.name = data.name || moduledata.data.name;
        data._id = data.name;
        data.title = data.title || moduledata.data.title;
        data.description = data.description || moduledata.data.description;
        data.version = data.version || moduledata.data.version;
        data.author = data.author || moduledata.data.author;
        data.authors = data.authors || moduledata.data.authors;
        data.priority = data.priority || 1;

        console.log('Whetstone | module: ', module, ' - data: ', data);

        this.insert(new WhetstoneTheme(data, data));
    }

    /**
     * Filter the results in the Compendium pack to only show ones which match a provided search string
     * @param {string} moduleid    The theme's module id
     */
    async activate(moduleid) {

        let moduledata = this.filter(t => t.data.name == moduleid)[0];
        if(!moduledata) throw new Error("Whetstone | Cannot activate theme: "+moduleid);

        moduledata.update({active: true});

        let corestyles = await this.getCoreStyles(moduleid);
        let systemstyles = await this.getSystemStyles(moduleid, game.system.id, game.system.data.version);
        let allstyles = corestyles.concat(systemstyles);

        for (var i = allstyles.length - 1; i >= 0; i--) {
            WhetstoneThemes.addStyle(allstyles[i]);
        }
    }

    async deactivate(moduleid) {

        let moduledata = this.filter(t => t.data.name == moduleid)[0];
        if(!moduledata) throw new Error("Whetstone | Cannot deactivate theme: "+moduleid);

        moduledata.update({active: false});

        let corestyles = await this.getCoreStyles(moduleid);
        let systemstyles = await this.getSystemStyles(moduleid, game.system.id, game.system.data.version);
        let allstyles = corestyles.concat(systemstyles);

        for (var i = allstyles.length - 1; i >= 0; i--) {
            WhetstoneThemes.removeStyle(allstyles[i]);
        }
    }

    async getCoreStyles(moduleid) {

        let path = 'modules/';
        let validpaths = [];

        let moduledata = this.filter(t => t.data.name == moduleid)[0];
        if(!moduledata || !moduledata.data.styles) return paths;

        path += moduledata.data.name+'/';

        for (var i = 0; i < moduledata.data.styles.length; i++) {
            if(await WhetstoneThemes.srcExists(path + moduledata.data.styles[i])) {
                validpaths.push(path + moduledata.data.styles[i]);
            }
        }

        return validpaths;
    }

    /**
    * Get an array of stylesheets to load
    * @param {string} moduleid  module id
    * @param {string} system    system id
    * @param {string} version   (optional) specific version
    * @return {Array.<String>} a list of stylesheet paths
    **/
    async getSystemStyles(moduleid, system, version = null) {

        let path = 'modules/';
        let validpaths = [];

        let moduledata = this.filter(t => t.data.name == moduleid)[0];
        if(!moduledata || !system) return validpaths;

        path += moduledata.name+'/styles/';

        //try just <system>.css
        if(await WhetstoneThemes.srcExists(path + system + '.css')) {
            validpaths.push(path + system + '.css');
        }

        //look for <system>-<version>.css
        if(version && await WhetstoneThemes.srcExists(path + system + '-' + version + '.css')) {
            validpaths.push(path + system + '-' + version + '.css');
        }

        return validpaths;
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
            WhetstoneThemes.deactivate(this.name);
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
});

Hooks.once('WhetstoneReady', () => {
    console.log('Whetstone | Ready');

     game.themes.register('Whetstone', {

        // the following keys will be pulled from the module.json
        // name, title, description, version, author/authors, url

        // author/authors will be formattd to fit this format
        authors: [
            { name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }
        ],

        // will be merged with 'styles' entry in module.json
        // these sheets are considered to be the 'core' styles for this theme
        // these files are always loaded first when the theme is enabed
        // no system specific themes should be defined here
        styles: [],

        // FormApplication extended class that creates the options dialog
        dialog: RetroUIP5eStylesConfigDialog,

        // RetroUICoreConfig extended class that handles theme settings
        config: RetroUIP5eStylesConfig,

        // (optional) Thumbnail image
        img: 'modules/Whetstone/images/Whetstone-thumb.png',

        // (optional) Large preview image
        preview: 'modules/Whetstone/preview.png',

        // (optional) Ensure the specified module is loaded before registering theme 
        dependencies: {},

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
            'core': '0.6.6'
        },

        // (optional) known compatibilities
        compatible: {},

        // (optional) known conflicts
        conflicts: {},
    });

    game.themes.register('RetroUI-P5e', {

        // the following keys will be pulled from the module.json
        // name, title, description, version, author/authors, url

        // author/authors will be formattd to fit this format
        authors: [
            { name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }
        ],

        // will be merged with 'styles' entry in module.json
        // these sheets are considered to be the 'core' styles for this theme
        // these files are always loaded first when the theme is enabed
        // no system specific themes should be defined here
        styles: [
            'styles/fonts/loadfonts.css',
            'styles/RetroUI-P5e-1.4.0.css'
        ],

        // FormApplication extended class that creates the options dialog
        dialog: RetroUIP5eStylesConfigDialog,

        // RetroUICoreConfig extended class that handles theme settings
        config: RetroUIP5eStylesConfig,

        // (optional) Thumbnail image
        img: 'modules/Whetstone/images/p5e-thumb.png',

        // (optional) Large preview image
        preview: 'modules/Whetstone/preview.png',

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

    game.themes.register('RetroUI-P5e', {

        // the following keys will be pulled from the module.json
        // name, title, description, version, author/authors, url

        name: 'A-Third-Style',
        title: 'A Third Style',
        description: 'A third style to fill in the menu for now.',
        version: '1.4.3',

        // author/authors will be formattd to fit this format
        authors: [
            { name: 'MajorVictory', contact: 'https://github.com/MajorVictory', url: 'https://github.com/MajorVictory' }
        ],

        // will be merged with 'styles' entry in module.json
        // these sheets are considered to be the 'core' styles for this theme
        // these files are always loaded first when the theme is enabed
        // no system specific themes should be defined here
        styles: [],

        // FormApplication extended class that creates the options dialog
        dialog: RetroUIP5eStylesConfigDialog,

        // RetroUICoreConfig extended class that handles theme settings
        config: RetroUIP5eStylesConfig,

        // (optional) Thumbnail image
        img: 'modules/Whetstone/images/MajorVictory_64.png',

        // (optional) Large preview image
        preview: 'modules/Whetstone/preview.png',

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
            'dnd5e': '0.96'
        },

        // (optional) known compatibilities
        compatible: {},

        // (optional) known conflicts
        conflicts: {
            'darksheet': ''
        },
    });
});


class RetroUIP5eStylesConfigDialog extends FormApplication {}
class RetroUIP5eStylesConfig {}



class WhetstoneConfigDialog extends FormApplication {

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
        return settings;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('input, select').change(this.onApply.bind(this));
        html.find('button[name="reset"]').click(this.onReset.bind(this));

        this.reset = false;
    }

    onApply(event) {
        event.preventDefault();
    }

    onReset() {
        this.reset = true;
        this.render();
    }

    async _updateObject(event, formData) {
        await game.settings.set('Whetstone', 'settings', formData);
        ui.notifications.info(game.i18n.localize("WHETSTONE.SaveMessage"));
    }
}


class WhetstoneConfig {

    static get getDefaults() {
        return {
            activatedThemes: []
        };
    }

    static get getOptions() {
        return mergeObject(WhetstoneConfig.getDefaults, game.settings.get("Whetstone", "settings"));
    }

    static apply(options) {

        console.log('Whetstone | WhetstoneConfig.apply()', options);

    }


}