/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

/**
 * TODO:
 * Update learning spells function into BFS somehow?
 */

const MAX_INGREDIENTS = 10;

class PathFinding {
  static positionToInteger(position, state) {
    // Using the power of math to find ensure we never return two nodes with the same ID
    const ingredient = position[0] +  (MAX_INGREDIENTS + 1) * (position[1] + (MAX_INGREDIENTS + 1) * (position[2] + (MAX_INGREDIENTS + 1) * position[3]))
    const castableState = parseInt(Object.values(state).join``,2) * Math.pow(MAX_INGREDIENTS + 1, 5);
    return ingredient * castableState
  }

}
// Just learning first spells
function chooseSpell (actions, turn) {
  if(turn < 6) {
    return actions.find(action => action.type === 'LEARN')
  }

  return null
}

function canBuy(spell, inventory) {
  for(let i=0; i<spell.length; i++) {
    if (spell[i] + inventory[i] < 0) return false;
  }
  return true
}

function sumArray (a, b) {
  return a.map((val, index) => val + b[index])
}

function BFS (map, getNeighbors, from, to, actions) {
  const startTime = +new Date(); // keep note of how long we've been here
  const discovered = new Set();
  const queue = [];
  queue.push({node: from, state: map, step: 0});
  discovered.add(PathFinding.positionToInteger(from, map))

  while (queue.length > 0) {
    const current = queue.shift();
    visited++

    // Can't take too long
    // console.error(`Time ${+new Date() - startTime}`)
    if (+new Date() - startTime > 30) return null;

    if (current.node.every((val, index) => val >= to[index])) {
      return current
    }

    // There's a gif at https://en.wikipedia.org/wiki/Breadth-first_search that helped me understand what this is doing
    getNeighbors(current.state, current.node, actions).forEach(node => {
      const neightborID = PathFinding.positionToInteger(node.node, node.state)
      if (!discovered.has(neightborID)) {
        discovered.add(neightborID)
        if (current.step + 1 <= 10) {
          queue.push({
            ...current,
            node: node.node,
            action: node.action,
            state: node.state,
            parent: current,
            step: current.step++
          })
        }
      }
    })
  }
}
function getNeighbors (state, ingredients, actions) {
  const a = +new Date(); // for debugging time
  const neighbors = [];

  const canRest = Object.values(state).some(castable => !castable)
  // console.error({canRest, state}, Object.values(state))

  if(canRest) {
    const newState = {};
    for(let key in state) {
      newState[key] = 1
    }
    neighbors.push({
      node: ingredients,
      action: {type: 'REST'},
      state: newState
    })
  }

  for(let action of actions) {
    if (state[action.id]) {
      const isPossible = canBuy(action.delta, ingredients)
      if (isPossible) {
        const sum = sumArray(action.delta, ingredients)
        if (sum.reduce((a, b) => a+b, 0) <= 10) {
          neighbors.push({
            node: sum,
            action,
            state: {
              ...state,
              [action.id]: 0
            }
          })
        }
      }
    }
  }

  if (neighbors.length === 0) {
    // console.error({state, ingredients, actions})
  }

  return neighbors;
}

function findPossibleAction(ingredients, actions) {
  for (let action of actions) {
    if ((action.castable || action.type !== 'CAST')
      && ingredients.every((val, index) => val >= -action.delta[index])
      && sumArray(ingredients, action.delta).reduce((a, b) => a+b) <= 10)
    {
      return action
    }
  }
  return null
}

let visited = 0 // global to keep track also I'm lazy

function nextAction (goal, inventory, actions, goalId) {
  const a = +new Date() // for debugging time
  visited = 0
  const state = {};
  for(let action of actions) {
    if (action.type === 'CAST') {
      state[action.id] = action.castable ? 1 : 0
    }
  }

  // Used a few different sources to make this. research Breadth First Search to understand the strategy here
  let path = BFS(
    state,
    getNeighbors,
    inventory,
    goal.map(x => -x),
    actions.filter(action => action.type ==='CAST'),
  )

  console.error('bfs time', +new Date() - a, {visited});
  if(path) {
    // iterate to the top of the path
    while(path.parent && path.parent.action) {
      path = path.parent
    }
    if(path && path.action) {
      // return the first action in the path
      return path.action
    }
  }
  // Most likely timed out
  console.error('NO PATH')
  return null
}

let turn = -1

// game loop
while (true) {
  turn++;
  const actionCount = parseInt(readline()); // the number of spells and recipes in play
  let actions = []
  let brewActions = []
  let castActions = []
  let learningActions = []
  let theirCastActions = []
  for (let i = 0; i < actionCount; i++) {
    var inputs = readline().split(' ');
    const id = parseInt(inputs[0]); // the unique ID of this spell or recipe
    const type = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
    const delta0 = parseInt(inputs[2]); // tier-0 ingredient change
    const delta1 = parseInt(inputs[3]); // tier-1 ingredient change
    const delta2 = parseInt(inputs[4]); // tier-2 ingredient change
    const delta3 = parseInt(inputs[5]); // tier-3 ingredient change
    const price = parseInt(inputs[6]); // the price in rupees if this is a potion
    const tomeIndex = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax
    const taxCount = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell
    const castable = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
    const repeatable = inputs[10] !== '0'; // for the first two leagues: always 0; later: 1 if this is a repeatable player spell
    const action = {id, type, delta: [delta0, delta1, delta2, delta3], price, castable, repeatable, taxCount, tomeIndex}
    switch(type) {
      case 'BREW':
        action.cost = (delta0 + delta1 * 2 + delta2 * 3 + delta3 * 4)
        brewActions.push(action)
        actions.push(action)
        break
      case 'CAST':
        action.value = (delta0 + delta1 * 2 + delta2 * 3 + delta3 * 4)
        castActions.push(action)
        actions.push(action)
        break
      case 'OPPONENT_CAST':
        theirCastActions.push(action)
        break
      case 'LEARN':
        learningActions.push(action)
        actions.push(action)
        break
    }
    // console.error(action)
  }
  let myInv = []
  let theirInv = []
  let myScore = 0
  let theirScore = 0
  for (let i = 0; i < 2; i++) {
    var inputs = readline().split(' ');
    const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
    const inv1 = parseInt(inputs[1]);
    const inv2 = parseInt(inputs[2]);
    const inv3 = parseInt(inputs[3]);
    const score = parseInt(inputs[4]); // amount of rupees
    if (i==0) {
      myInv = [inv0, inv1, inv2, inv3]
      myScore = score
    } else {
      theirInv = [inv0, inv1, inv2, inv3]
      theirScore = score
    }
  }
  /**
   * LEARNING SPELL HERE INSTEAD?
   */
  const spell = chooseSpell(actions, turn)
  if (spell) {
    console.log(`${spell.type} ${spell.id}`)
    continue
  }

  // highest price first
  brewActions.sort((a,b) => b.price - a.price)
  const goal = brewActions[0];

  if (canBuy(goal.delta, myInv)) {
    console.log(`${goal.type} ${goal.id}`)
  } else {
    const action = nextAction(goal.delta, myInv, actions, brewActions)
    // nextAction will return null if the BFS took too long to find a possible route to the potion
    if (!action) {
      // So we just find a quick and easy spell to cast
      const action = findPossibleAction(myInv, castActions)
      // If there are no quick and easy spells, then rest
      if (!action) {
        console.log('REST')
      } else {
        console.log(`${action.type} ${action.id}`)
      }
    }
    else {
      console.log(`${action.type} ${action.id}`)
    }
  }
}
