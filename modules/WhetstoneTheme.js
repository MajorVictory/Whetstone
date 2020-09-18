/**
 * The EntityCollection of Whetstone theme entities.
 * @extends {EntityCollection}
 * 
 * @example <caption>Retrieve an existing theme by its id</caption>
 * let theme = game.Whetstone.themes.get(themeid);
 */
export class WhetstoneTheme extends Entity {
	/**
	 * Configure the attributes of the WhetstoneTheme Entity
	 *
	 * @returns {Entity} baseEntity       The parent class which directly inherits from the Entity interface.
	 * @returns {EntityCollection} collection   The EntityCollection class to which Entities of this type belong.
	 * @returns {Array} embeddedEntities  The names of any Embedded Entities within the Entity data structure.
	 */
	static get config() {
		return {
			baseEntity: WhetstoneTheme,
			collection: game.Whetstone.themes,
			embeddedEntities: {},
			label: "WHETSTONE.ThemeEntry"
		};
	}

	/** @override */
	async delete(options) {
		if (this.active) {
			game.Whetstone.themes.deactivate(this.name);
		}
		return super.delete(options);
	}
}