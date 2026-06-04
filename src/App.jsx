import { useState } from "react";
import { names, adjectives, nouns } from "./words";
import "./App.css";

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Each pattern returns a username string. One is chosen at random per press,
// so the result varies in shape — sometimes two words, sometimes just one.
// e.g. "Captain Pickle", "Hot Stuff", "Wet Toilet", or just "Toilet".
const patterns = [
  () => `${pickRandom(names)} ${pickRandom(nouns)}`, // Name + Noun
  () => `${pickRandom(adjectives)} ${pickRandom(nouns)}`, // Adjective + Noun
  () => pickRandom(nouns), // single noun
  () => pickRandom(adjectives), // single adjective
];

// Total distinct usernames across all patterns (for the footer).
const totalCombos =
  names.length * nouns.length +
  adjectives.length * nouns.length +
  nouns.length +
  adjectives.length;

function App() {
  const [username, setUsername] = useState(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    setUsername(pickRandom(patterns)());
    setCopied(false);
  }

  function copy() {
    if (!username) return;
    navigator.clipboard?.writeText(username);
    setCopied(true);
  }

  return (
    <main className="app">
      <h1>🎲 Funny Username Generator</h1>
      <p className="tagline">Names, adjectives & nouns, mixed at random — sometimes just one word. Press the button.</p>

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
        {nouns.length} nouns → {totalCombos.toLocaleString()} possible usernames
      </footer>
    </main>
  );
}

export default App;
