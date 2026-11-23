import { useEffect, useRef, useState } from "react";

// Animated presenter "Avira" who reads a script aloud (browser speech) with live captions.
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

// Known female English voices (macOS/iOS, Chrome, Edge/Windows, Android), best first.
// Indian-English female voices come first.
const FEMALE_VOICES = [
  "neerja", "veena", "heera", "isha", "raveena", "aditi",
  "google uk english female", "google us english", "samantha", "ava", "allison", "susan", "victoria", "karen",
  "moira", "tessa", "fiona", "serena", "kate", "zira", "aria", "jenny", "sonia", "libby", "natasha", "emma",
  "female", "lekha", "kajal", "swara",
];
// Known male voices - never picked
const MALE = /\b(rishi|prabhat|ravi|hemant|madhur|daniel|alex|fred|tom|aaron|arthur|oliver|gordon|rocko|ralph|reed|eddy|grandpa|david|mark|guy|ryan|george|james|male)\b/i;

function pickVoice() {
  const voices = (synth?.getVoices() || []).filter((v) => /^en|^hi/i.test(v.lang) && !MALE.test(v.name));
  for (const name of FEMALE_VOICES) {
    const v = voices.find((x) => x.name.toLowerCase().includes(name) && /^en/i.test(x.lang)) ||
              voices.find((x) => x.name.toLowerCase().includes(name));
    if (v) return v;
  }
  return null; // no known female voice: use default voice with a higher pitch
}

function Avatar({ talking }) {
  return (
    <svg className={`pr-avatar ${talking ? "talking" : ""}`} viewBox="0 0 120 140" aria-hidden="true">
      <defs>
        <clipPath id="pr-clip"><circle cx="60" cy="70" r="60" /></clipPath>
      </defs>
      <g clipPath="url(#pr-clip)">
        <rect width="120" height="140" fill="#f3e6dc" />
        {/* hair back */}
        <path d="M24 70c-4-34 14-52 36-52s40 18 36 52c-2 18 4 30 8 40H16c4-10 10-22 8-40z" fill="#2b1d16" />
        {/* body: red blazer + white shirt */}
        <path d="M14 140c2-22 18-34 46-34s44 12 46 34z" fill="#c41e2a" />
        <path d="M48 106l12 20 12-20z" fill="#fff" />
        <path d="M52 92h16v16H52z" fill="#d9a07c" />
        {/* face */}
        <ellipse cx="60" cy="64" rx="24" ry="29" fill="#e4b18e" />
        {/* hair fringe */}
        <path d="M35 58c2-20 14-28 27-28 14 0 24 9 24 26-10-2-22-9-28-18-4 10-12 17-23 20z" fill="#2b1d16" />
        {/* eyes */}
        <g className="pr-eyes" fill="#2b1d16">
          <ellipse cx="50" cy="65" rx="3" ry="3.4" />
          <ellipse cx="70" cy="65" rx="3" ry="3.4" />
        </g>
        <path d="M45 58q5-3 10 0M65 58q5-3 10 0" stroke="#2b1d16" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M60 68v8l-3 2" stroke="#c48a68" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* mouth */}
        <ellipse className="pr-mouth" cx="60" cy="84" rx="7" ry="3" fill="#9e3a3a" />
        {/* earrings */}
        <circle cx="36" cy="74" r="2" fill="#e8c35a" /><circle cx="84" cy="74" r="2" fill="#e8c35a" />
        {/* MG badge */}
        <circle cx="86" cy="122" r="5" fill="#fff" />
      </g>
    </svg>
  );
}

// Small tab at the side; Avira only opens when this is selected
export function AviraDock({ onOpen }) {
  return (
    <button className="av-dock" onClick={onOpen} aria-label="Open Avira, your product guide">
      <Avatar talking={false} /><span>AVIRA</span>
    </button>
  );
}

export default function Presenter({ lines, onDone, onClose }) {
  const [index, setIndex] = useState(0);
  const [talking, setTalking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [run, setRun] = useState(0); // bump to replay
  const timer = useRef(null);
  const at = useRef(0); // current line, so muting carries on from the same place
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }); // always call the latest callback

  useEffect(() => {
    let cancelled = false;
    let start = null;
    synth?.cancel();
    clearTimeout(timer.current);

    const say = (i) => {
      if (cancelled) return;
      if (i >= lines.length) { setTalking(false); onDoneRef.current?.(); return; }
      at.current = i;
      setIndex(i);
      if (!synth || muted) {
        // no voice: show captions at reading speed instead
        setTalking(false);
        timer.current = setTimeout(() => say(i + 1), Math.max(2200, lines[i].length * 55));
        return;
      }
      const u = new SpeechSynthesisUtterance(lines[i]);
      const v = pickVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "en-IN"; }
      u.rate = 1;
      u.pitch = v ? 1.05 : 1.4; // no known female voice found: raise the pitch of the default one
      u.onstart = () => !cancelled && setTalking(true);
      u.onend = () => !cancelled && say(i + 1);
      u.onerror = () => !cancelled && say(i + 1);
      synth.speak(u);
    };

    // voices load asynchronously in some browsers
    if (synth && !synth.getVoices().length) {
      start = () => {
        synth.removeEventListener("voiceschanged", start);
        clearTimeout(timer.current);
        say(at.current);
      };
      synth.addEventListener("voiceschanged", start);
      timer.current = setTimeout(start, 600);
    } else {
      say(at.current);
    }

    return () => {
      cancelled = true;
      if (start) synth.removeEventListener("voiceschanged", start);
      clearTimeout(timer.current);
      synth?.cancel();
      setTalking(false);
    };
  }, [lines, muted, run]);

  return (
    <div className="pr" role="region" aria-label="Avira, your product guide">
      <Avatar talking={talking} />
      <div className="pr-bubble">
        <div className="pr-head">
          <b>AVIRA</b><span>Your MG guide</span>
          <div className="pr-acts">
            <button onClick={() => setMuted(!muted)} aria-label={muted ? "Turn voice on" : "Mute voice"}>
              {muted ? "🔇" : "🔊"}
            </button>
            <button onClick={() => { at.current = 0; setRun((r) => r + 1); }} aria-label="Replay">↻</button>
            <button onClick={onClose} aria-label="Move Avira to the side">✕</button>
          </div>
        </div>
        <p className="pr-caption" aria-live="polite">{lines[index]}</p>
        <div className="pr-steps" aria-hidden="true">
          {lines.map((_, i) => <span key={i} className={i <= index ? "on" : ""} />)}
        </div>
      </div>
    </div>
  );
}
