import { useState } from "react";
import { names, nouns } from "./words";
import "./App.css";

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Total distinct usernames (for the footer).
const totalCombos = names.length * nouns.length;

function App() {
  const [username, setUsername] = useState(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    setUsername(`${pickRandom(names)} ${pickRandom(nouns)}`);
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
      <p className="tagline">One random name + one random noun. Press the button.</p>

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
        {names.length} names × {nouns.length} nouns →{" "}
        {totalCombos.toLocaleString()} possible usernames
      </footer>
    </main>
  );
}

export default App;
