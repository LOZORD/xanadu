/*
Keeps track of game management information on the duel such as rolling and player choices.
*/

export default class DuelManager {
  constructor(character1, character2, roomGrid) {
    this.character1 = character1;
    this.character2 = character2;
    this.roomGrid = roomGrid;

    this.character1.duelReset();
    this.character2.duelReset();
  }

  duelRollInitiative() {
  }

  duelMakeChoice() {
  }

  duelUseItem() {
  }

  duelChangeItem() {
  }

  duelTaunt() {
  }

  duelEvade() {
  }

  duelMove() {
  }

  duelYield() {
  }

  duelSaveCharacterState() {
  }

  duelExit() {
  }
}
