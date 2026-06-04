import { useState } from "react";
import { names, adjectives, verbs, nouns } from "./words";
import "./App.css";

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Each pattern returns a username string. One is chosen at random per press,
// so the result varies in shape and word order — sometimes just one word.
const patterns = [
  () => `${pickRandom(adjectives)} ${pickRandom(nouns)}`, // Warm Bag
  () => `${pickRandom(names)} ${pickRandom(nouns)}`, // Jerry Potassium
  () => `${pickRandom(names)} ${pickRandom(adjectives)} ${pickRandom(nouns)}`, // Jason Flat Top
  () => `The ${pickRandom(nouns)}`, // The Stain
  () => `${pickRandom(verbs)} ${pickRandom(names)}`, // Packing Evan (order swapped)
  () => `${pickRandom(names)} ${pickRandom(verbs)}`, // Tommy Overload
  () => `${pickRandom(adjectives)} ${pickRandom(names)}`, // adjective + name
  () => pickRandom(verbs), // Skip (single word)
  () => pickRandom(nouns), // single noun
];

// A random run of 1–4 digits (may include leading zeros, e.g. "7", "42", "0099").
function randomDigits() {
  const len = 1 + Math.floor(Math.random() * 4); // 1–4
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// Gamertag-style decorations, applied to some results at random. Spaces are
// stripped first so they read like real tags (e.g. "xXWarmBagXx", "WarmBagr42").
const decorations = [
  (b) => `xX${b}Xx`,
  (b) => `${b}_RL`,
  (b) => `${b}r${randomDigits()}`,
  (b) => `${b}FN`,
];

// Roughly how many base usernames are possible (before styling); for the footer.
const totalCombos =
  adjectives.length * nouns.length +
  names.length * nouns.length +
  names.length * adjectives.length * nouns.length +
  nouns.length +
  verbs.length * names.length +
  names.length * verbs.length +
  adjectives.length * names.length +
  verbs.length +
  nouns.length;

function App() {
  const [username, setUsername] = useState(null);
  const [copied, setCopied] = useState(false);

  // Suggestion form state
  const [suggestion, setSuggestion] = useState("");
  const [status, setStatus] = useState(null); // "sending" | "ok" | "error"

  function generate() {
    let result = pickRandom(patterns)();
    // ~30% of the time, apply a gamertag-style decoration.
    if (Math.random() < 0.3) {
      const base = result.replace(/\s+/g, "");
      result = pickRandom(decorations)(base);
    }
    setUsername(result);
    setCopied(false);
  }

  function copy() {
    if (!username) return;
    navigator.clipboard?.writeText(username);
    setCopied(true);
  }

  async function submitSuggestion(e) {
    e.preventDefault();
    const text = suggestion.trim();
    if (!text || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion: text }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      setSuggestion("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="app">
      <h1>🎲 Funny Username Generator</h1>
      <p className="tagline">Names, adjectives, verbs & nouns — mixed and reordered at random, sometimes with gamertag flair. Press the button.</p>

      <div className="result" aria-live="polite">
        {username ? (
          <span className="username">{username}</span>
        ) : (
          <span className="placeholder">Your username appears here…</span>
        )}
      </div>

      <div className="buttons">
        <button className="generate" onClick={generate}>
          Generate
        </button>
        <button className="copy" onClick={copy} disabled={!username}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <footer>
        {names.length} names · {adjectives.length} adjectives ·{" "}
        {verbs.length} verbs · {nouns.length} nouns →{" "}
        {totalCombos.toLocaleString()}+ base combos
      </footer>

      <section className="suggest">
        <h2>Suggest a word or username</h2>
        <p className="suggest-sub">
          Got a funnier idea? Send it in — good ones get added to the generator.
        </p>
        <form className="suggest-form" onSubmit={submitSuggestion}>
          <input
            type="text"
            value={suggestion}
            maxLength={200}
            placeholder="e.g. Soggy Walrus, or just 'Toilet'"
            onChange={(e) => {
              setSuggestion(e.target.value);
              if (status) setStatus(null);
            }}
          />
          <button type="submit" disabled={!suggestion.trim() || status === "sending"}>
            {status === "sending" ? "Sending…" : "Submit"}
          </button>
        </form>
        {status === "ok" && (
          <p className="suggest-msg ok">Thanks! Your suggestion was sent. 🎉</p>
        )}
        {status === "error" && (
          <p className="suggest-msg error">
            Couldn’t send that — please try again in a moment.
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
