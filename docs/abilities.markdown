# Abilities

## `can_translate_modern`
`True | False`
Whether or not this player can communicate (chat) with players with a different
Allegiance.

## `can_translate_ancient`
`True | False`
Whether or not this player can read the Ancient language.

## `can_identify_poison`
`True | False`
Whether or not this player can identify poisonous and non-poisonous plants. Once
the poison has been cooked into a food or is somehow "hidden," it can no longer
be distinguished by anyone, even the poisoner.

## `is_hunter`
`True | False`
Whether or not this player is especially effective against attacking animals and beasts (does not include humans).

## `repair_amount`
`0.00 - 1.00`
A percentage of how much this player can repair `Repairable` items. `1.00` means
a player can repair an item to it's original quality. Any player, given a
non-zero `repair_amount`, can repair any `Repairable` item.

## `heal_amount`
`0.00 - 1.00`
A percentage of how much this player can heal other players using healing items.
`1.00` means a player can heal another player to full health.

## `craftables`
`[Equippable items]`
A list of items that this player can craft. When an item is crafted, it is
spawned at full quality.

## `can_fillet`
`True | False`
Whether or not this player can fillet corpses, beast or human. Whereas a corpse
can be identified, a filleted corpse cannot be identified. It also provides raw
meat.

## `can_setup_camp`
`True | False`
Whether or not this player can setup camp. Setting up camp is a
non-instantaneous operation. A set-up camp includes:
* tents for sleeping
* crafting and smelting table
* cooking cauldron
* [anything else?]

## `movement_speed`
`1.00-3.00`
The speed at which this player can move across terrain.

## `can_update_maps`
`True | False`
Whether or not this player can update other players' maps.

## `line_of_sight_diff`
`0.50 - 2.00`
Active line of sight for this player. Normal line of sight is `1.00`.

## `can_smelt`
`True | False`
Whether or not this player can smelt gold (or other) ores into ingot.
