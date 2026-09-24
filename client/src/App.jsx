import { useEffect, useState } from "react";

const MOVES = [
  { id: "rock", icon: "✊", label: "Rock" },
  { id: "paper", icon: "✋", label: "Paper" },
  { id: "scissors", icon: "✌️", label: "Scissors" },
];
const icon = (id) => MOVES.find((m) => m.id === id).icon;
const MESSAGES = { win: "You win this round", loss: "Computer wins this round", draw: "It's a draw" };
const SERVER_ERR = "Can't reach the server. Check that npm run dev is running and MongoDB is connected.";

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem("rps-name") || "");
  const [draft, setDraft] = useState("");
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState([]);
  const [round, setRound] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadBoard = () =>
    fetch("/api/leaderboard").then((r) => r.json()).then(setBoard).catch(() => {});

  useEffect(() => {
    if (!name) return;
    fetch(`/api/players/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError(SERVER_ERR));
    loadBoard();
  }, [name]);

  function join(e) {
    e.preventDefault();
    const n = draft.trim();
    if (!/^[a-z0-9 _-]{1,20}$/i.test(n)) {
      setError("Name must be 1-20 letters, numbers, spaces, - or _");
      return;
    }
    setError("");
    localStorage.setItem("rps-name", n);
    setName(n);
  }

  function switchPlayer() {
    localStorage.removeItem("rps-name");
    setName(""); setStats(null); setRound(null); setDraft("");
  }

  async function play(choice) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, choice }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRound(data);
      setStats(data.stats);
      loadBoard();
    } catch {
      setError(SERVER_ERR);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    const res = await fetch(`/api/players/${encodeURIComponent(name)}/reset`, { method: "POST" });
    setStats(await res.json());
    setRound(null);
    loadBoard();
  }

  if (!name) {
    return (
      <main className="app">
        <h1>Rock Paper Scissors</h1>
        <p className="sub">Enter a player name. Your stats are saved under it.</p>
        <form className="join" onSubmit={join}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Player name" maxLength={20} autoFocus />
          <button type="submit">Start playing</button>
        </form>
        {error && <p className="error">{error}</p>}
      </main>
    );
  }

  const winRate = stats && stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <main className="app">
      <h1>Rock Paper Scissors</h1>
      <p className="sub">
        Playing as <strong>{name}</strong>. <button className="link" onClick={switchPlayer}>Switch player</button>
      </p>

      <section className="arena" aria-live="polite">
        {round ? (
          <>
            <div className="side"><span className="big">{icon(round.player)}</span><small>You</small></div>
            <div className={`verdict ${round.result}`}>{MESSAGES[round.result]}</div>
            <div className="side"><span className="big">{icon(round.computer)}</span><small>Computer</small></div>
          </>
        ) : (
          <p className="empty">Choose a move to start the first round.</p>
        )}
      </section>

      <section className="moves">
        {MOVES.map((m) => (
          <button key={m.id} onClick={() => play(m.id)} disabled={busy}>
            <span className="big">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </section>

      {error && <p className="error">{error}</p>}

      {stats && (
        <section className="stats">
          <h2>Your stats</h2>
          <dl>
            <div><dt>Played</dt><dd>{stats.played}</dd></div>
            <div><dt>Wins</dt><dd>{stats.wins}</dd></div>
            <div><dt>Losses</dt><dd>{stats.losses}</dd></div>
            <div><dt>Draws</dt><dd>{stats.draws}</dd></div>
            <div><dt>Win rate</dt><dd>{winRate}%</dd></div>
            <div><dt>Best streak</dt><dd>{stats.bestStreak}</dd></div>
          </dl>

          {stats.history.length > 0 && (
            <>
              <h2>Last {stats.history.length} rounds</h2>
              <ul className="history">
                {stats.history.map((h) => (
                  <li key={h._id || h.at} className={h.result}>
                    {icon(h.player)} vs {icon(h.computer)} <span>{h.result}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button className="reset" onClick={reset}>Reset my stats</button>
        </section>
      )}

      {board.length > 0 && (
        <section className="stats">
          <h2>Leaderboard</h2>
          <ol className="board">
            {board.map((b) => (
              <li key={b.displayName}>
                <span>{b.displayName}</span>
                <span>{b.wins} wins from {b.played} games</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
