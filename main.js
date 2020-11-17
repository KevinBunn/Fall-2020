/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

/**
 * TODO:
 * 1. Get a strategy to learn spells
 * 2. Update nextAction logic based on learned spells
 */

function calcMissingScore(recipe, inventory) {
  let missingScore = 0;
  // console.error(recipe, inventory)
  for (let i = 0; i < 4; i++) {
    missingScore += (i + 1) * Math.min(0, recipe[i] + inventory[wi])
  }
  return missingScore
}

function getBestSpellForTier (castActions, tier, inventory) {

  let bestSpells = castActions.reduce((max, a) => max.delta[tier] > a.delta[tier] ? max: a)
  if (bestSpells.length > 1) {
    bestSpells.forEach(s => {
      console.error(s)
    })
    let result = bestSpells.reduce((max, s) => max.value > s.value || !s.castable && inventoryIsNotTooFull(s, inventory) ? max : s)
    console.error(result)
    return result
  } else {
    console.error(`Best Spells ${bestSpells.id}`)
    return bestSpells
  }
}

function findFreeSpell(learningActions) {
  return learningActions.find(a => {
    return Math.min(...a.delta) >= 0
  })
}

function haveEnoughToCast(spell, inventory) {
  return calcMissingScore(spell.delta, inventory) === 0;
}

function inventoryIsNotTooFull(spell, inventory) {
  let spacesRequiredForSpell = 0
  let itemsInInv = 0
  for (let i = 0; i < 4; i++) {
    spacesRequiredForSpell += spell[i]
    itemsInInv += inventory[i]
  }
  return spacesRequiredForSpell + itemsInInv <= 10
}

function nextAction (goal, inventory, actions, goalId, learningActions, castActions) {
  // priority 1
  let freeSpell = findFreeSpell(learningActions)
  if (freeSpell){
    // if we have enough to learn it
    if ((freeSpell.tomeIndex + freeSpell.taxCount) < inventory[0]) {
      return freeSpell
    } else {
      // return the action with the max blue
      return castActions.reduce((max, a) => max.delta[0] > a.delta[0] ? max : a)
    }
  }

  for (let i=3; i>=0; i--) {
    console.error(goal, inventory, i)
    if (inventory[i] < -goal[i]) {
      let bestSpell = getBestSpellForTier(castActions, i, inventory)
      if (haveEnoughToCast(bestSpell, inventory)) {
        console.error(`Casting Spell ${bestSpell.id}`)
        return actions.find(action => action.id === bestSpell.id)
      } else {
        console.error(`Finding new target ${bestSpell.delta}`)
        return nextAction(bestSpell.delta, inventory, actions, bestSpell.id, learningActions, castActions)
      }

    }
  }
  return actions.find(action => action.id === goalId)
}

// game loop
while (true) {
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
        // console.error(action.delta)
        // console.error(cost)
        break
      case 'CAST':
        action.value = (delta0 + delta1 * 2 + delta2 * 3 + delta3 * 4)
        // console.error(`${action.id} Spell Value: ${action.value}`)
        castActions.push(action)
        actions.push(action)
        // console.error(action.castable)
        break
      case 'OPPONENT_CAST':
        theirCastActions.push(action)
        break
      case 'LEARN':
        learningActions.push(action)
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
  brewActions.sort((a,b) => a.price - b.price)
  const goal = brewActions[0];
  const action = nextAction(goal.delta, myInv, actions, goal.id, learningActions, castActions)
  console.error(action)
  //
  if(action.type === 'CAST' && !action.castable) {
    console.log('REST')
  } else {
    console.log(`${action.type} ${action.id}`)
  }

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');


  // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
  // console.log(`BREW ${brewActions[0].id}`);
}
