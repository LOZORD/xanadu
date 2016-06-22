// Simple parser for movement
export default (game, player, command) => {
  let resultMessage;

  switch (command) {
    case 'go north': {
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
      resultMessage = `Unknown command "${ command }".`;
      break;
    }
  }

  return resultMessage;
};
