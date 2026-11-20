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

function HeroVideo({ onFail }) {
  return (
    <video className="hero-video" autoPlay muted loop playsInline preload="auto"
           aria-hidden="true" onError={onFail}>
      <source src={HERO_VIDEO} type="video/mp4" onError={onFail} />
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
        <div className="suv" role="img" aria-label="Majestor SUV" />
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
  const [videoOk, setVideoOk] = useState(true);
  return (
    <>
      <section className="hero" id="top">
        <div className="cliff" /><div className="city" /><div className="dunes" />
        {videoOk && <HeroVideo onFail={() => setVideoOk(false)} />}
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
