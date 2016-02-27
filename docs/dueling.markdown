# Players can challenge each other to duels.

## Gameplay Mechanics
There are three abilities which effect dueling.
1. Strength
  * Affects the effect of melee weapons.
  * Affects the carry weight of items.
2. Reflexes
  * Affects the effect of ranged weapons.
  * Affects initiative, which player has the first turn.
3. Health
  * Affects total health cap.
4. Endurance
  * Affects rate of health loss.
5. Accuracy
  * Attack chance

Within each turn, the player has 4 options:
1. USE ITEM
2. CHANGE ITEM
3. TAUNT
4. EVADE
5. MOVE
6. YIELD

### USE ITEM
USE ITEM is the generic option used for weapons, foods, medical items, etc.

Revolver
 * You shoot 1-3 bullet per turn. Reload every 6 shots.
 * Optimized for mid-range combat.

Rifle
 * You shoot 1 bullet per turn. Reload every 10 bullets.
 * Optimized for long-range combat.

Pickaxe
 * You swipe 1 time per turn.
 * Optimized for short-range combat.

Knife
 * You swipe 2-4 times per turn.
 * Optimized for short-range combat.

Dynamite
 * Severely damages all characters within short range and mid range.
 * Slightly harms accuracy for all characters in long range. 
 * Destroys items.

Raw Meat
 * Minimum recovery

Cooked meat
 * Medium recovery

Stew
 * Maximum recovery

### CHANGE ITEM
CHANGE ITEM is used to change out your current item. It uses 1 turn.

### TAUNT
TAUNT is used to reduce the accuracy of the other character.
There can be different flavor text (insulting, throwing sand, shooting bullet in air.)

### MOVE
MOVE IN -- Moves 1 range inward.
MOVE OUT -- Moves 1 range outward.

### YIELD
Offer consolidation, can be rejected or accepted. Consumes 1 turn.

## DUEL PREPARATION
Take opium -- increased endurance, reduced reflexes
Meditate/Prayer -- unaffected by taunting
Boose -- decreases reflexes, increases strength

## DUEL END STATES
You can die. (Take all items.)
You can yield. (Take some items.)
Potentially, we can have bets.

# IMPLEMENTATION
PLAYER CLASS
DUEL_PLAYER CLASS EXTENDS PLAYER (turn, gridPosition)
ROOM GRID CLASS (room boundaries -- 1D array)
GAME MANAGER CLASS (whetherPlaying, P1, P2, roomGrid) 
 * roll(duelPlayer p1, duelPlayer p2);
 * choice()
 * move()
 * useItem()
 * changeItem()
 * yield()
 * taunt()
 * evade()
