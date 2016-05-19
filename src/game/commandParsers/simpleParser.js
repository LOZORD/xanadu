// Simple parser for movement
export default (game, player, command) => {
  let resultMessage;
  //const map = game.map;

  switch (command) {
    case 'go north': {
      //if (map.hasCell(
      break;
    }
    case 'go south': {
      break;
    }
    case 'go west': {
      break;
    }
    case 'go east': {
      break;
    }
    default: {
      resultMessage = `Unknown command "${ command }".`
      break;
    }
  }

  return resultMessage;
};
