import { useEffect, useState } from "react";

const MOVES = [
  { id: "rock", icon: "✊", label: "Rock" },
  { id: "paper", icon: "✋", label: "Paper" },
  { id: "scissors", icon: "✌️", label: "Scissors" },
];
const icon = (id) => MOVES.find((m) => m.id === id).icon;
const MESSAGES = {
  win: "You win this round",
  loss: "Computer wins this round",
  draw: "It's a draw",
};
const SERVER_ERR =
  "Can't reach the server. Check that npm run dev is running and MongoDB is connected.";
const API_BASE = import.meta.env.VITE_API_URL || "";
const api = (path) => `${API_BASE}${path}`;

export default function App() {
  const [name, setName] = useState(
    () => localStorage.getItem("rps-name") || "",
  );
  const [draft, setDraft] = useState("");
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState([]);
  const [round, setRound] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadBoard = () =>
    fetch(api("/api/leaderboard"))
      .then((r) => r.json())
      .then(setBoard)
      .catch(() => {});

  useEffect(() => {
    if (!name) return;
    fetch(api(`/api/players/${encodeURIComponent(name)}`))
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
    setName("");
    setStats(null);
    setRound(null);
    setDraft("");
  }

  async function play(choice) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(api("/api/play"), {
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
    const res = await fetch(
      api(`/api/players/${encodeURIComponent(name)}/reset`),
      {
        method: "POST",
      },
    );
    setStats(await res.json());
    setRound(null);
    loadBoard();
  }

  const winRate =
    stats && stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  if (!name) {
    return (
      <main className="min-h-screen px-4 py-8 text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl md:text-[8rem] md:leading-[0.8]">
            Rock Paper
            <span className="block">Scissors</span>
          </h1>
          <p className="mt-5 text-base text-slate-200 md:text-xl">
            Enter a player name. Your stats are saved under it.
          </p>
          <form
            className="mt-6 flex w-full max-w-2xl items-center gap-3 rounded-2xl border-2 border-yellow-400/80 bg-slate-900/60 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm"
            onSubmit={join}
          >
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-4 text-base text-white placeholder:text-slate-300 focus:border-yellow-400 focus:outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Player name"
              maxLength={20}
              autoFocus
            />
            <button
              type="submit"
              className="rounded-xl bg-yellow-400 px-5 py-4 text-sm font-bold text-slate-950 transition hover:brightness-110"
            >
              Start playing
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-slate-50 md:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
        <section className="w-full text-center">
          <h1 className="text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl md:text-[7rem] md:leading-[0.8]">
            Rock Paper
            <span className="block">Scissors</span>
          </h1>
          <p className="mt-2 text-base text-slate-200 md:text-xl">
            Playing as{" "}
            <span className="font-semibold text-yellow-300">{name}</span>.{" "}
            <button
              className="text-yellow-300 underline underline-offset-4"
              onClick={switchPlayer}
            >
              Switch player
            </button>
          </p>
        </section>

        <section
          className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm"
          aria-live="polite"
        >
          {round ? (
            <div className="flex items-center justify-between gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">{icon(round.player)}</span>
                <small className="text-sm text-slate-300">You</small>
              </div>

              <div
                className={`text-lg font-extrabold ${
                  round.result === "win"
                    ? "text-emerald-400"
                    : round.result === "loss"
                      ? "text-red-400"
                      : "text-slate-300"
                }`}
              >
                {MESSAGES[round.result]}
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">{icon(round.computer)}</span>
                <small className="text-sm text-slate-300">Computer</small>
              </div>
            </div>
          ) : (
            <p className="text-center text-base text-slate-300">
              Choose a move to start the first round.
            </p>
          )}
        </section>

        <section className="grid w-full max-w-xl grid-cols-3 gap-3">
          {MOVES.map((m) => (
            <button
              key={m.id}
              onClick={() => play(m.id)}
              disabled={busy}
              className="rounded-2xl bg-yellow-400 px-3 py-5 text-base font-semibold text-slate-950 shadow-[0_8px_20px_rgba(250,204,21,0.35)] transition hover:-translate-y-1 disabled:cursor-wait disabled:opacity-70"
            >
              <span className="mb-2 block text-4xl">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <aside className="w-full max-w-3xl space-y-5">
          {stats && (
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.25)] backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white">Your stats</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["Played", stats.played],
                  ["Wins", stats.wins],
                  ["Losses", stats.losses],
                  ["Draws", stats.draws],
                  ["Win rate", `${winRate}%`],
                  ["Best streak", stats.bestStreak],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-800/90 p-3 text-center"
                  >
                    <div className="text-xs uppercase tracking-wide text-slate-300">
                      {label}
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {stats.history.length > 0 && (
                <>
                  <h2 className="mt-5 text-xl font-bold text-white">
                    Last {stats.history.length} rounds
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {stats.history.map((h) => (
                      <li
                        key={h._id || h.at}
                        className="flex items-center justify-between rounded-xl bg-slate-800/90 px-3 py-2 text-sm"
                      >
                        <span>
                          {icon(h.player)} vs {icon(h.computer)}
                        </span>
                        <span
                          className={
                            h.result === "win"
                              ? "text-emerald-400"
                              : h.result === "loss"
                                ? "text-red-400"
                                : "text-slate-300"
                          }
                        >
                          {h.result}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                className="mt-5 w-full rounded-xl border border-slate-400/60 bg-transparent px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white hover:text-white"
                onClick={reset}
              >
                Reset my stats
              </button>
            </section>
          )}

          {board.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.25)] backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              <ol className="mt-4 space-y-2">
                {board.map((b) => (
                  <li
                    key={b.displayName}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/90 px-3 py-2 text-sm text-slate-200"
                  >
                    <span>{b.displayName}</span>
                    <span className="text-slate-300">
                      {b.wins} wins from {b.played} games
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
