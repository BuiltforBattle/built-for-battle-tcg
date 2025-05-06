function performAttack(i) {
  if (matchOver) return;
  const input = document.getElementById(`attackInput${i}`);
  const damage = parseInt(input.value);
  if (!isNaN(damage) && damage > 0) {
  stats[currentTurn].attacks++; // <-- MOVE THIS HERE
  attackOpponent(damage);
  input.value = '';
  } else {
  showMessage("Enter a valid attack amount!");
  }
}

function quickAttack(index, amount) {
  if (matchOver) return;
  const input = document.getElementById(`attackInput${index}`);
  if (input) {
    input.value = amount;
  }
}
  
function attackOpponent(damageAmount) {
  if (matchOver) return;
  const opponent = currentTurn === 1 ? 2 : 1;
  const activeCard = teamData[opponent].find(card => card.active);
  if (activeCard) {
	let effectiveDamage = damageAmount;

  if (activeCard.defense > 0) {
    effectiveDamage = Math.max(0, damageAmount - activeCard.defense);
  	activeCard.defense = 0; // Defense is used up after blocking
	}

	activeCard.hp = Math.max(0, activeCard.hp - effectiveDamage);
    stats[currentTurn].totalDamage += effectiveDamage;
    syncMatchToSupabase();
    
  if (effectiveDamage > 0) {
      showMessage(`💥 Attack successful! Dealt ${effectiveDamage} damage to ${activeCard.name}.`);
    } else {
      showMessage(`🛡️ Attack blocked! ${activeCard.name} took no damage.`);
    }

  if (activeCard.hp === 0) {
    activeCard.active = false; // Auto remove active status if defeated
    showMessage(`${activeCard.name} has been defeated!`);
  }
  const allDefeated = teamData[opponent].every(card => card.hp <= 0);

  if (allDefeated) {
  showMessage(`${currentTurn === 1 ? player1 : player2} wins the round by defeating all opponent cards!`);
  
  // Auto-select Win
  document.querySelector('input[name="roundResult"][value="win"]').checked = true;
  endRound();
  }
    updateGameplayView();
  }
}

function activateDefense() {
  if (matchOver) return;
  const activeCard = teamData[currentTurn].find(card => card.active);
  if (activeCard) {
	activeCard.defense += 10; // You can stack the amount
	showMessage(`${activeCard.name} is now defending (+10)!`);
	stats[currentTurn].defenses++;
    syncMatchToSupabase();
    updateGameplayView();
  }
}

function defenseBreak() {
  if (matchOver) return;
 
  const opponent = currentTurn === 1 ? 2 : 1;
  const activeCard = teamData[opponent].find(card => card.active);
 
  if (activeCard) {
	if (activeCard.defense > 0) {
  	activeCard.defense = Math.max(0, activeCard.defense - 10); // Lower defense by 10
  	showMessage(`Defense Break successful! ${activeCard.name}'s defense was reduced by 10.`);
	} else {
  	showMessage(`No active defense to break on ${activeCard.name}.`);
	}
    syncMatchToSupabase();
	updateGameplayView();
  }
}

function activateAbility() {
  if (matchOver) return;
  const activeCard = teamData[currentTurn].find(card => card.active);

  if (activeCard && !activeCard.abilityUsed) {
    activeCard.abilityUsed = true;
    showMessage(`${activeCard.name} activated their Ability!`);

    // Find and animate the Ability button
    const abilityBtn = document.getElementById('abilityButton');
    if (abilityBtn) {
      abilityBtn.classList.add('flash-green');
      setTimeout(() => {
        abilityBtn.classList.remove('flash-green');
      }, 1000); // Remove after animation
    }
    stats[currentTurn].abilities++;
    syncMatchToSupabase();
    updateGameplayView();
  } else {
    showMessage("Ability already used this round.");
  }
}
  
function applyDiceOutcome() {
  if (matchOver) return;

  const selected = document.getElementById('diceOutcomeSelect').value;
  if (!selected) {
	showMessage("Please select a Dice Roll outcome first!");
	return;
  }

  const roll = parseInt(selected);
  const player = currentTurn;
  const opponent = currentTurn === 1 ? 2 : 1;

  switch (roll) {
	case 1: // Health Gain
  	teamData[player].forEach(card => {
    	card.hp += 10;
  	});
  	showMessage("All your cards gained +10 HP!");
  	break;

	case 2: // Health Lost
  	teamData[opponent].forEach(card => {
    	card.hp = Math.max(0, card.hp - 10);
  	});
  	showMessage("Opponent’s team lost -10 HP!");
  	break;

	case 3: // Defense Break
  	const oppActive = teamData[opponent].find(card => card.active);
  	if (oppActive) {
    	if (oppActive.defense > 0) {
      	oppActive.defense = Math.max(0, oppActive.defense - 10);
      	showMessage("Defense Break! Opponent's Active Player defense reduced by 10.");
    	} else {
      	showMessage("No defense to break! You may add +10 bonus to your next attack.");
      	// Optional: Set a bonus attack flag here if you want later
    	}
  	}
  	break;

	case 4: // Defense Gain
  	const myActive = teamData[player].find(card => card.active);
  	if (myActive) {
    	myActive.defense += 10;
    	showMessage("Defense Gain! Your Active Player gained +10 defense.");
  	}
  	break;

	case 5: // Attack Swap
  	showMessage("Attack Swap! Use opponent's Active Player Basic Attack for your next attack.");
  	// Optional: Implement Attack Swap logic later
  	break;

	case 6: // Power Attack
  	showMessage("Power Boost! You may use Special Attack without action cards.");
  	// Optional: Flag Special Attack available next turn
  	break;
  }
    stats[currentTurn].diceRolls++;
  syncMatchToSupabase();
  updateGameplayView();
}   
