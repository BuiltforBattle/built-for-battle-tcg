async function startMatch() {
  console.log("✅ startMatch() triggered");
  const p1 = document.getElementById('player1Name').value.trim();
  const p2 = document.getElementById('player2Name').value.trim();
  const first = document.querySelector('input[name="firstTurn"]:checked');
  const matchMode = document.querySelector('input[name="matchMode"]:checked').value;

  if (!p1 || !p2 || !first) {
    showMessage("Please enter both player names and select who goes first.");
    return;
  }

  player1 = p1;
  player2 = p2;
  startingPlayer = parseInt(first.value);

  if (matchMode === "join") {
    const matchId = document.getElementById('matchIdInput').value.trim();
    if (!matchId) {
      showMessage("Please enter a Match ID to join.");
      return;
    }

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (error || !data) {
      showMessage("Match not found. Please check the ID.");
      return;
    }

    window.matchId = matchId;
    teamData = data.team_data;
    stats = data.stats;
    roundWinners = data.round_winners;
    currentTurn = data.current_turn;
    currentRound = data.current_round;
    matchOver = data.match_over;

    subscribeToMatchUpdates(matchId);
  } else {
    const { data, error } = await supabase
      .from("matches")
      .insert([{
        team_data: teamData,
        stats: stats,
        round_winners: roundWinners,
        current_turn: startingPlayer,
        current_round: 1,
        match_over: false
      }])
      .select()
      .single();

    if (error) {
      showMessage("Failed to create match.");
      return;
    }

    window.matchId = data.id;
    document.getElementById('matchCodeDisplay').innerText = `Match ID: ${data.id}`;
    subscribeToMatchUpdates(data.id);
  }

  document.getElementById('setupScreen').style.display = 'none';
  document.body.classList.remove('setup-only');
  document.body.classList.add('normal-scroll');
  showGameplayScreen();
}

async function syncMatchToSupabase() {
  if (!window.matchId) return;

  const { error } = await supabase
    .from("matches")
    .update({
      team_data: teamData,
      stats: stats,
      round_winners: roundWinners,
      current_turn: currentTurn,
      current_round: currentRound,
      match_over: matchOver
    })
    .eq("id", window.matchId);

  if (error) console.error("Sync failed:", error);
}

function subscribeToMatchUpdates(matchId) {
  supabase
    .channel("match-updates")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "matches",
      filter: `id=eq.${matchId}`
    }, payload => {
      const match = payload.new;
      if (match) {
        teamData = match.team_data;
        stats = match.stats;
        roundWinners = match.round_winners;
        currentTurn = match.current_turn;
        currentRound = match.current_round;
        matchOver = match.match_over;
        updateGameplayView();
      }
    })
    .subscribe();
}

function copyMatchId() {
  const text = document.getElementById('matchCodeDisplay').innerText.replace('Match ID: ', '').trim();
  if (!text) {
    showMessage("No Match ID to copy yet.");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showMessage("Match ID copied to clipboard!");
  }).catch(() => {
    showMessage("Failed to copy Match ID.");
  });
}
