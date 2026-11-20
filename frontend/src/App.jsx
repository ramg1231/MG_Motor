import { useState } from "react";
import "./App.css";
import heroVideo from "./assets/Mgv.mp4";

const CAR = {
  name: "MAJESTOR",
  price: "₹43.49 LAKH",
  token: "₹41,000",
  specs: "810 MM WATER WADING · 5,046 MM LONG · 215 PS TWIN-TURBO DIESEL",
};

const NAV = ["MG Cars", "Service & Support", "Ownership", "Discover MG", "Tools"];

const QUICK = [
  { label: "Book a test drive", href: "#test-drive", icon: "↗", primary: true },
  { label: "Book now", href: "#book", icon: "↗" },
  { label: "Visualize Majestor", href: "#visualize", icon: "↗" },
  { label: "Download brochure", href: "#brochure", icon: "⤓" },
  { label: "Owner's manual", href: "#manual", icon: "↗", manual: true },
];

// sample data - replace with real variants
const FEATURES = [
  { id: "4wd", label: "4-wheel drive", variant: "Savvy 4WD",
    svg: <><rect x="4" y="4" width="8" height="12" rx="3" /><rect x="36" y="4" width="8" height="12" rx="3" /><rect x="4" y="32" width="8" height="12" rx="3" /><rect x="36" y="32" width="8" height="12" rx="3" /><path d="M12 10h24M12 38h24M24 10v28" /></> },
  { id: "adas", label: "ADAS Level 2", variant: "Sharp and above",
    svg: <><path d="M10 38v-9l4-9h20l4 9v9zM10 29h28" /><path d="M16 11c5-5 11-5 16 0M19 15c3-3 7-3 10 0" /></> },
  { id: "cam", label: "360° camera", variant: "Sharp and above",
    svg: <><rect x="10" y="16" width="28" height="20" rx="5" /><circle cx="24" cy="26" r="6" /><path d="M18 16l3-5h6l3 5" /></> },
  { id: "sunroof", label: "Sunroof", variant: "Select and above",
    svg: <><path d="M8 36v-7l4-8h24l4 8v7zM8 29h32" /><path d="M24 6v6M14 9l3 4M34 9l-3 4" /></> },
  { id: "vent", label: "Ventilated seats", variant: "Savvy",
    svg: <><circle cx="12" cy="8" r="3" /><path d="M12 12v14h8M20 20h14M20 14h14M20 26h14M14 26v14M30 26v14" /></> },
];

const slug = (s) => s.toLowerCase().replace(" & ", "-").replace(/ /g, "-");

function Navbar() {
  return (
    <header className="nav">
      <div className="logo" aria-label="MG">MG</div>
      <ul className="menu">
        {NAV.map((n) => (
          <li key={n}><a href={`#${slug(n)}`}>{n}</a></li>
        ))}
      </ul>
      <button className="search" aria-label="Search">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      <a className="btn btn-outline" href="#test-drive">Book Test Drive</a>
      <a className="btn btn-red" href="#book">Book Now</a>
    </header>
  );
}

function QuickPanel() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <aside className={`quick ${open ? "" : "closed"}`} aria-label="Quick actions">
        {QUICK.map((q) => (
          <a key={q.label} href={q.href}
             className={`${q.primary ? "primary" : ""} ${q.manual ? "manual" : ""}`}>
            {q.label} <span>{q.icon}</span>
          </a>
        ))}
      </aside>
      <button className={`quick-toggle ${open ? "" : "closed"}`} aria-expanded={open}
              aria-label="Toggle quick actions" onClick={() => setOpen(!open)}>❯</button>
    </>
  );
}

const HERO_VIDEO = heroVideo;

function HeroVideo() {
  return (
    <video className="hero-video" autoPlay muted loop playsInline preload="auto"
           aria-hidden="true">
      <source src={HERO_VIDEO} type="video/mp4" />
    </video>
  );
}

function Hero() {
  return (
    <main className="content">
      <div className="brand"><span className="logo">MG</span>{CAR.name}</div>
      <p className="tag1">NEVER GO</p>
      <h1 className="tag2">UNNOTICED</h1>
      <p className="price">FROM {CAR.price}</p>
      <p className="specs">{CAR.specs}</p>
      <a className="book" href="#book">BOOK NOW <small>{CAR.token} refundable</small> <span>↗</span></a>
      <p className="below">| DESIGN, INTERIORS, SPECS BELOW</p>
    </main>
  );
}

function SuvIcon() {
  return (
    <svg className="suv" viewBox="0 0 160 64" role="img" aria-label="MG Majestor SUV">
      <ellipse cx="81" cy="60" rx="76" ry="3" fill="rgba(0,0,0,.12)" />
      <path d="M52 8h58" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <path fill="#1d1d1f" d="M6 46l2-12q2-4 10-5l16-2 12-15q2-2 6-2h60q5 0 7 3l11 14 18 3q6 1 7 6l1 10q0 3-4 3H6z" />
      <path fill="#7d8b99" d="M50 14h24v13H40zM79 14h25v13H79zM108 14h6q2 0 3 2l9 11h-18z" />
      <path d="M77 29v16" stroke="#3a3a3a" />
      <path d="M86 33h6" stroke="#666" strokeWidth="1.5" />
      <rect x="150" y="33" width="5" height="3" rx="1" fill="#ffd76a" />
      <rect x="6" y="33" width="4" height="4" rx="1" fill="#d6202f" />
      <circle cx="38" cy="49" r="12.5" fill="#fff" /><circle cx="124" cy="49" r="12.5" fill="#fff" />
      <circle cx="38" cy="49" r="10" fill="#111" /><circle cx="124" cy="49" r="10" fill="#111" />
      <circle cx="38" cy="49" r="5" fill="#a9b0b8" /><circle cx="124" cy="49" r="5" fill="#a9b0b8" />
    </svg>
  );
}

function Avira() {
  const [open, setOpen] = useState(true);
  const [msg, setMsg] = useState("");

  if (!open) {
    return <button className="chat-tab" aria-label="Open Avira" onClick={() => setOpen(true)}><i /></button>;
  }
  return (
    <aside className="avira" aria-label="Avira assistant">
      <div className="av-head">
        <span className="av-pic" /><span className="av-name">AVIRA</span>
        <button className="av-open">Open ↗</button>
        <button className="av-x" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
      </div>
      <h2 className="av-title">Pay for what matters.</h2>
      <div className="av-sub">
        <div><b>{CAR.name}</b><p>Your must-have <span>tap one to find my variant</span></p></div>
        <SuvIcon />
      </div>
      <div className="grid">
        {FEATURES.map((f) => (
          <button key={f.id} className="tile"
                  onClick={() => setMsg(`${f.label} is available on: ${f.variant}`)}>
            <svg viewBox="0 0 48 48">{f.svg}</svg>{f.label}
          </button>
        ))}
        <button className="tile more">
          <svg viewBox="0 0 48 48"><rect x="6" y="6" width="12" height="12" rx="3" /><rect x="30" y="6" width="12" height="12" rx="3" /><rect x="6" y="30" width="12" height="12" rx="3" /><path stroke="#d6202f" d="M36 28v16M28 36h16" /></svg>More
        </button>
      </div>
      {msg && <p className="av-foot"><b>{msg}</b></p>}
      <div className="av-foot">or <a href="#test-drive">book a test drive</a></div>
    </aside>
  );
}

function CookieBar() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="cookie" role="dialog" aria-label="Cookie notice">
      <div>
        <b>MG Motor India Website</b> utilizes cookies to optimize your browsing experience.<br />
        By continuing to explore the site, you consent to the use of cookies and agree to our <a href="#privacy">Privacy Policy</a>.
      </div>
      <div className="acts">
        <button className="accept" onClick={() => setShow(false)}>Accept</button>
        <button onClick={() => setShow(false)}>Decline</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <section className="hero" id="top">
        <HeroVideo />
        <div className="hero-shade" />
        <Navbar />
        <QuickPanel />
        <Hero />
      </section>
      <Avira />
      <CookieBar />
    </>
  );
}

export default App;
