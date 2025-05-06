 function showMessage(text) {
      const messageDiv = document.getElementById('gameMessage');
      if (messageDiv) {
        messageDiv.innerText = text;

        setTimeout(() => {
          messageDiv.innerText = '';
        }, 4000);
      } else {
        alert(text); // 🔥 Fallback if gameMessage div is not present yet
      }
    }

function showGameplayScreen() {
  currentTurn = startingPlayer;
  document.getElementById('gameplayScreen').style.display = 'block';
  updateGameplayView();
}

function updateGameplayView() {
  hasSwappedThisTurn = false;
  const player = currentTurn;
  const playerName = player === 1 ? player1 : player2;
  // Update Round Tracker
let trackerHTML = "<h3>Round Results:</h3><p>";
for (let i = 0; i < 3; i++) {
  if (roundWinners[i] === "Pending") {
    trackerHTML += `Round ${i + 1}: Pending ⏳`;
  } else {
    trackerHTML += `Round ${i + 1}: ${roundWinners[i]} (Win)`;
  }
  if (i < 2) trackerHTML += " | ";
}
trackerHTML += "</p>";
document.getElementById('roundTracker').innerHTML = trackerHTML;
  document.getElementById('turnTitle').innerText = `Round ${currentRound} - ${playerName}'s Turn`;
  const cardArea = document.getElementById('playerCards');
  cardArea.innerHTML = '';

  const activeCard = teamData[player].find(card => card.active);
  const benchedCards = teamData[player].map((card, i) => ({ ...card, originalIndex: i })).filter(card => !card.active);
  const screen = document.querySelector('.screen');
	screen.style.boxShadow = player === 1
  	? '0 0 20px rgba(230, 36, 41, 0.7)'  // Red for Player 1
  	: '0 0 20px rgba(0, 123, 255, 0.7)'; // Blue for Player 2

 
  if (activeCard) {
  const i = teamData[player].indexOf(activeCard);
  cardArea.innerHTML += `
	<h3 style='margin-bottom: 10px; border-bottom: 1px solid #e62429; padding-bottom: 5px;'>Active Player Area</h3>
  <div class="active-card-container" style="border: 2px solid ${player === 1 ? '#e62429' : '#007bff'}; box-shadow: 0 0 15px ${player === 1 ? '#e62429' : '#007bff'};">
    <div class="active-card-image">
      ${activeCard.img ? `<img src="${activeCard.img}" alt="${activeCard.name}" onclick="enlargeImage('${activeCard.img}')" class="${player === 1 ? 'red-pulse' : 'blue-pulse'}">` : ''}
    </div>
    <div class="active-card-info">
      <h4>${activeCard.name} (Slot ${i + 1})</h4>
      <p>HP: <span id="hpDisplay${i}">${activeCard.hp}</span></p>
      ${activeCard.defense > 0 ? `<p>Defense: ${activeCard.defense} 🛡️</p>` : ''}
 	 
    <div class="button-group">
     	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="adjustHP(${player}, ${i}, 10)">+10</button>
     	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="adjustHP(${player}, ${i}, 5)">+5</button>
     	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="adjustHP(${player}, ${i}, -5)">-5</button>
     	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="adjustHP(${player}, ${i}, -10)">-10</button>
  	</div>

  	<div class="button-group">
    	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="activateDefense()">Defend</button>
    	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="defenseBreak()">Defense Break</button>
  	</div>

  	<div class="button-group">
        <input type="number" id="attackInput${i}" placeholder="Attack Amount" style="width: 100px;">
        <button class="${player === 1 ? 'player1' : 'player2'}" onclick="quickAttack(${i}, 25)">+25</button>
        <button class="${player === 1 ? 'player1' : 'player2'}" onclick="performAttack(${i})">Attack</button>
    </div>


  	<div class="button-group">
    	<select id="diceOutcomeSelect" style="padding: 8px; width: 200px;">
      	<option value="">Dice Roll Outcome</option>
      	<option value="1">1 - Health Gain (+10 HP All Cards)</option>
      	<option value="2">2 - Health Lost (-10 HP Opponent Cards)</option>
      	<option value="3">3 - Defense Break (-10 Opponent Defense)</option>
      	<option value="4">4 - Defense Gain (+10 Defense Active)</option>
      	<option value="5">5 - Attack Swap (Use Opponent Basic Attack)</option>
      	<option value="6">6 - Power Attack (Use Special Attack Free)</option>
  	</select>
    	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="applyDiceOutcome()">Apply Dice Outcome</button>
  	</div>

    <div class="button-group">
      <button id="abilityButton" class="${player === 1 ? 'player1' : 'player2'}" onclick="activateAbility()" ${activeCard.abilityUsed ? 'disabled' : ''}>
        Activate Ability
      </button>
    </div>

  	<div class="button-group">
    	<button class="${player === 1 ? 'player1' : 'player2'}" onclick="endTurn()">End Turn</button>
  	</div>

  	<p>Color: ${activeCard.color || 'None'} ${activeCard.played ? '<span style="color: orange; font-weight: bold;">(Played)</span>' : ''}</p>
	</div>
	<hr style='border: 1px solid white; width: 90%; margin: 40px auto;'>
    </div>
</div>
  `;
    
}

  cardArea.innerHTML += `<h3 style='margin: 40px 0 10px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;'>Benched Player Area</h3>`;
  benchedCards.forEach(card => {
  const i = card.originalIndex;
  cardArea.innerHTML += `
    <div class="card-entry ${card.hp <= 0 ? 'defeated-card' : ''}" id="card${i}" style="border: 2px solid ${card.color || '#cccccc'}; box-shadow: 0 0 10px ${card.color || '#cccccc'}; background: ${!card.played ? 'rgba(100,100,100,0.5)' : 'rgba(60,60,60,0.9)'};">
      ${card.hp <= 0 ? '<div class="defeated-stamp">DEFEATED</div>' : ''}
      
      <div class="active-card-container">
        <div class="active-card-image">
          ${
            !card.played
              ? `<img src="https://static.wixstatic.com/media/7f810a_18401a2529594f189b64c4680a19c0a4~mv2.png" alt="Card Back" style="max-width:80%; border-radius:10px;">`
              : `${card.img ? `<img src="${card.img}" alt="${card.name}" style="max-width:80%; border-radius:10px;">` : ''}`
          }
        </div>

        <div class="active-card-info">
          <h4>Benched Player (Slot ${i + 1}) ${!card.played ? '<span style="font-size: 0.8em; color: #ccc;">(Face Down)</span>' : ''}</h4>

          ${!card.played ? `
            <select onchange="selectCard(${player}, ${i}, this.value)">
              <option value="">Select Character</option>
              ${availableCards.map(c => `<option value="${c.name}">${c.name} (HP: ${c.hp})</option>`).join('')}
            </select>
            <input type="text" id="nameInput${player}_${i}" value="${card.name}" onchange="updateCardName(${player}, ${i}, this.value)">
            <input type="number" id="hpInput${player}_${i}" value="${card.hp}" onchange="updateCardHP(${player}, ${i}, this.value)">
            <select id="colorInput${player}_${i}" onchange="updateCardColor(${player}, ${i}, this.value)">
              <option value="">⚪ No Color</option>
              <option value="red">🔴 Red</option>
              <option value="blue">🔵 Blue</option>
              <option value="green">🟢 Green</option>
              <option value="yellow">🟡 Yellow</option>
            </select>
          ` : `
            <h4>${card.name}</h4>
            <p>HP: <span id="hpDisplay${i}">${card.hp}</span></p>
          `}
          
          <p>Color: ${card.color || 'None'} ${card.played ? '<span style="color: orange; font-weight: bold;">(Played)</span>' : ''}</p>

          ${!activeCard ? `
            ${card.hp > 0 ? `<button onclick="setActiveCard(${i})">Set Active</button>` : ''}
          ` : `
            <button onclick="swapCard(${i})">Swap</button>
            ${!card.played ? `<button onclick="replaceWithNewCard(${i})">Swap with New Card</button>` : ''}
          `}
        </div>
      </div>
    </div>
  `;
});
}

function showMatchSummary() {
  document.getElementById('winnerScreen').style.display = 'none';
  document.getElementById('matchSummaryScreen').style.display = 'block';

  let summaryHTML = `
    <h2>${player1} vs ${player2}</h2>
    <h3>Final Winner: ${document.getElementById('finalWinnerName').innerText.replace('Winner: ', '')}</h3>
    <h3>Round Results:</h3>
    <ul>
      <li>Round 1: ${roundWinners[0]}</li>
      <li>Round 2: ${roundWinners[1]}</li>
      <li>Round 3: ${roundWinners[2]}</li>
    </ul>
    <h3>Battle Stats:</h3>
    <div style="text-align:left;">
      <h4>${player1}:</h4>
      <ul>
        <li>⚔️ Attacks Used: ${stats[1].attacks}</li>
        <li>💥 Total Damage Dealt: ${stats[1].totalDamage}</li>
        <li>🛡️ Defenses Used: ${stats[1].defenses}</li>
        <li>✨ Abilities Activated: ${stats[1].abilities}</li>
        <li>🎲 Dice Rolls Used: ${stats[1].diceRolls}</li>
      </ul>
      <h4>${player2}:</h4>
      <ul>
        <li>⚔️ Attacks Used: ${stats[2].attacks}</li>
        <li>💥 Total Damage Dealt: ${stats[2].totalDamage}</li>
        <li>🛡️ Defenses Used: ${stats[2].defenses}</li>
        <li>✨ Abilities Activated: ${stats[2].abilities}</li>
        <li>🎲 Dice Rolls Used: ${stats[2].diceRolls}</li>
      </ul>
    </div>
  `;

  document.getElementById('matchSummaryContent').innerHTML = summaryHTML;
}


function enlargeImage(src) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modalImg.src = src;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

}

function closeModal() {
  document.getElementById('imageModal').style.display = 'none';
  document.body.style.overflow = '';
}
