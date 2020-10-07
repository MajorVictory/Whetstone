# Changelog

## Version 1.1.2

 * Bug Fix: All theme variables and shades are now written properly on activation. (Fixes #9)
 * New Feature: Two new hooks available: 'onThemeActivated' and 'onThemeDeactivated' (Fixes #12)
 * New Feature: You can now specify a 'template' entry for variables to format the value just before being written to page.
 * New Feature: New variable type 'image' lets you use the filepicker to select an image url.
 * New Feature: The 'shades' color type includes a 'full' variant with no transparency.
 * OceanBlues: You can now change the background images of window headers and sheet backgrounds.

## Version 1.1.1

 * OceanBlues: Added 'classic' colors from version 1.0.0
 * OceanBlues: Fixed some color assignments for sidebar text and window text.
 * OceanBlues: Added some text shadows to be covered by the Highlight Color value.

## Version 1.1

 * **Breaking Changes**: registered settings, menus, and themes have moved in local storage. All values should be under `Whetstone.` namespace. This breaks exising configurations.
 * New Feature: Default Global Variables. A new default style has been included with a list of global variables available to ALL styles. See the wiki for more details. (fixes #1)
 * New Feature: Themes now support Color Theme Presets, preset values for any theme that can imported or exported.
 * OceanBlues: Colors have been updated and color theme presets have been added as examples.
 * Lots of background bug fixes, settings are more reliably applied

## Version 1.0.2

 * OceanBlues: Inline rolls background color adjusted (Fixes #4)
 * OceanBlues: Colors for sidebar popouts adjusted (Fixes #5)
 * OceanBlues: added support for Pathfinder 2e. CRB style character sheets and standard sheets.
 * OceanBlues: added support for chat cards
 * OceanBlues: optional substyle to compact sidebar and compendium entries 

## Version 1.0.1

 * Updated color picker for 'shades' to display the colors that are generated.
 * removed outdated SoundBoard module example in favor of module author's implementation
 * changed colors now update immediately and only stay changed if saved.

## Version 1.0.0

 * Initial Release