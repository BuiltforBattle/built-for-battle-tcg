let player1 = "";
	let player2 = "";
	let startingPlayer = 1;
	let teamData = { 1: [], 2: [] };
	let currentSetupPlayer = 1;
    let roundWinners = ["Pending", "Pending", "Pending"];
    let stats = {
      1: { attacks: 0, totalDamage: 0, defenses: 0, abilities: 0, diceRolls: 0 },
      2: { attacks: 0, totalDamage: 0, defenses: 0, abilities: 0, diceRolls: 0 }
    };

teamData[1] = [
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false }
    ];
    teamData[2] = [
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
      { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false }
    ];
    
      
    document.querySelectorAll('input[name="matchMode"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const mode = document.querySelector('input[name="matchMode"]:checked').value;
        document.getElementById('matchIdInput').style.display = (mode === 'join') ? 'block' : 'none';
      });
    });
       
    const availableCards = [
      { name: "Bearded_Tattooed_Guy_In_GA", hp: 120, img: "https://static.wixstatic.com/media/7f810a_47547269f9a442c1be542386b9a95dbc~mv2.jpg" },
      { name: "IGHatesChazzy", hp: 130, img: "https://static.wixstatic.com/media/7f810a_75fb02ccb3ee4229b445beafbfdba4b6~mv2.jpg" },
      { name: "J9lives", hp: 120, img: "https://static.wixstatic.com/media/7f810a_954adcda70fe42259852a029221f0451~mv2.jpg" },
      { name: "KiraKreates", hp: 100, img: "https://static.wixstatic.com/media/7f810a_f63e3610f25d44709d0e1817c2a87b68~mv2.jpg" },
      { name: "KosplayKreationz", hp: 150, img: "https://static.wixstatic.com/media/7f810a_8bfa55f15aca4cfea19228a985d7108f~mv2.jpg" },
      { name: "Num1xmncosplay", hp: 100, img: "https://static.wixstatic.com/media/7f810a_8c2b3ee0b445415da52259e9dccb8fcb~mv2.jpg" },
      { name: "Paper.Moon.Cosplay", hp: 120, img: "https://static.wixstatic.com/media/7f810a_db8d11a28246466e91097443dbeafa18~mv2.jpg" },
      { name: "ParadoxxCosplay", hp: 185, img: "https://static.wixstatic.com/media/7f810a_18bae39081b948f4aa2405dd42878bc9~mv2.jpg" },
      { name: "The_Googinator", hp: 100, img: "https://static.wixstatic.com/media/7f810a_a78a4a761d38467cb4166dad685918d5~mv2.jpg" },
      { name: "TStunningTyler", hp: 130, img: "https://static.wixstatic.com/media/7f810a_5c32325c34be479f97213b31611224d5~mv2.jpg" }
      // 🔥 Add more here easily anytime!
    ];

function setActiveCard(index) {
  if (matchOver) return;
  
  teamData[currentTurn].forEach((card, i) => {
    card.active = i === index;
    if (card.active) card.played = true;
  });
  syncMatchToSupabase();
  
  if (!bothPlayersHaveActive()) {
    // If the other player hasn't chosen their Active Player yet
    endTurn(); // Immediately pass the turn
  } else {
    // Both players now have Active Cards — force currentTurn to startingPlayer
    currentTurn = startingPlayer;
    updateGameplayView();
  }
}

function endTurn() {
  if (matchOver) return;
  currentTurn = currentTurn === 1 ? 2 : 1;
  const hasActive = teamData[currentTurn].some(card => card.active && card.hp > 0);

  if (!hasActive) {
  showMessage("No Active Card! Please select a new Active Player.");
  }
  syncMatchToSupabase();
  updateGameplayView();
}
      
function endRound() {
  let selectedResult = document.querySelector('input[name="roundResult"]:checked');
  if (selectedResult) {
    roundResults[currentRound - 1] = selectedResult.value === "win" ? "Win" : "Loss";
    
    if (selectedResult.value === "win") {
      roundWinners[currentRound - 1] = currentTurn === 1 ? player1 : player2;
    } else if (selectedResult.value === "lose") {
      roundWinners[currentRound - 1] = currentTurn === 1 ? player2 : player1;
    }
    // 🔥 Set who goes first in the next round
    if (selectedResult.value === "win") {
      startingPlayer = currentTurn; // Winner goes first next round
    } else {
      startingPlayer = currentTurn === 1 ? 2 : 1; // If lost, opponent goes first
    }
  }

  // 🛡️ New code: Check wins immediately
  let player1Wins = 0;
  let player2Wins = 0;
  for (let i = 0; i < 3; i++) {
    if (roundWinners[i] === player1) player1Wins++;
    if (roundWinners[i] === player2) player2Wins++;
  }

  if (player1Wins === 2 || player2Wins === 2 || currentRound === 3) {
    declareWinner();
    return; // 🔥 Stop here, no more rounds
  }

  // If not ended, continue normally
  currentRound++;
teamData[1] = [
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false }
];
teamData[2] = [
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false },
  { name: "", hp: 100, color: "", active: false, played: false, defense: 0, abilityUsed: false }
];

document.getElementById('gameplayScreen').style.display = 'block';
syncMatchToSupabase();
updateGameplayView();
}

function declareWinner() {
  let player1Wins = 0;
  let player2Wins = 0;

  for (let i = 0; i < 3; i++) {
    if (roundWinners[i] === player1) player1Wins++;
    if (roundWinners[i] === player2) player2Wins++;
  }

  let winnerName = "";
  if (player1Wins > player2Wins) {
    winnerName = player1;
  } else if (player2Wins > player1Wins) {
    winnerName = player2;
  } else {
    winnerName = "It's a Tie!";
  }

  // Hide gameplay, show winner screen
  document.getElementById('gameplayScreen').style.display = 'none';
  document.getElementById('winnerScreen').style.display = 'block';

  // Update final winner name
  document.getElementById('finalWinnerName').innerText = `Winner: ${winnerName}`;
  document.getElementById('finalWinnerName').classList.add('flash-gold');

  // Build round results nicely
  let resultsHTML = "<h3>Round Results:</h3><ul>";
  for (let i = 0; i < 3; i++) {
    resultsHTML += `<li>Round ${i + 1}: ${roundWinners[i]}</li>`;
  }
  resultsHTML += "</ul>";
  document.getElementById('finalRoundResults').innerHTML = resultsHTML;

  matchOver = true;
}

function endMatch() {
  location.reload();
}



