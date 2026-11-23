import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import "./Visualize.css";
import PARTS, { partFromHit } from "./parts.js";
import Presenter, { AviraDock } from "./Presenter.jsx";

const CAR_NAME = "Majestor";

// What Avira says for a part. tour = { pos, total } during the guided tour, otherwise null.
function scriptFor(part, tour) {
  const points = part.points.map((p, i) => {
    const lower = /^[A-Z][a-z]/.test(p) ? p[0].toLowerCase() + p.slice(1) : p;
    if (i === 0) return `First, ${lower}.`;
    if (i === part.points.length - 1) return `And finally, ${lower}.`;
    return `${p}.`;
  });
  const outro = `Want to feel it in person? Book a test drive!`;
  if (!tour) return [`Hi, I'm Avira. Let me show you the ${part.name}.`, part.text, ...points, outro];

  const last = tour.pos === tour.total - 1;
  const intro = tour.pos === 0
    ? `Hi, I'm Avira! Let me walk you around the ${CAR_NAME}, one part at a time. We'll start with the ${part.name}.`
    : last ? `And last, the ${part.name}.` : `Next up, the ${part.name}.`;
  return [
    intro, part.text, ...points,
    ...(last ? [`That's the end of the tour. Click any part if you'd like to hear about it again.`, outro] : []),
  ];
}

// 3D model lives in frontend/public/mg_hector/ (served as-is)
const MODEL_SRC = "/mg_hector/scene.gltf";
const HOME_ORBIT = "30deg 75deg 8m";

// How close / how wide the camera may go. Inside the cabin it sits right at the viewer's head.
const LIMITS = {
  outside: { min: "auto 0deg 1.3m", max: "auto 90deg 10m", fov: "30deg" },
  inside: { min: "auto 25deg 0.05m", max: "auto 130deg 10m", fov: "75deg" },
};

// Where you sit when you step inside (model coordinates: front = -X, driver = -Z)
const SEATS = [
  { id: "armrest", name: "Hand rest", target: "0m 1.15m 0m" }, // just above the centre hand rest
  { id: "driver", name: "Driver", target: "0.02m 1.28m -0.36m" },
  { id: "passenger", name: "Passenger", target: "0.02m 1.28m 0.36m" },
  { id: "rear", name: "Back seat", target: "0.85m 1.32m 0m" },
];
const ENTRY = "-0.6m 1.36m 0m"; // just behind the windscreen, where the seats first come into view
const CABIN_FOV = "65deg";

function PartPanel({ part, tour, onClose, onStep, onStopTour }) {
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current?.focus(); }, [part.id]);

  return (
    <aside className="viz-panel" aria-live="polite" aria-label={part.name}
           onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <button ref={closeRef} className="viz-panel-x" onClick={onClose} aria-label="Close">✕</button>
      {tour && (
        <div className="viz-tour">
          <span>Guided tour · {tour.pos + 1} of {tour.total}</span>
          <button onClick={onStopTour}>Stop tour</button>
        </div>
      )}
      <p className="viz-panel-kicker">{part.tagline}</p>
      <h2>{part.name}</h2>
      <p className="viz-panel-text">{part.text}</p>
      <ul>{part.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <div className="viz-panel-nav">
        <button onClick={() => onStep(-1)}>← Previous</button>
        <button onClick={() => onStep(1)}>Next →</button>
      </div>
    </aside>
  );
}

function CarViewer() {
  const ref = useRef(null);
  const down = useRef(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [spin, setSpin] = useState(true);
  const [active, setActive] = useState(null);
  const [tour, setTour] = useState(null); // { order: [part ids], pos } while the guided tour runs

  const [talk, setTalk] = useState(null); // what Avira is saying: { key, lines }
  const [avira, setAvira] = useState(false); // Avira stays at the side until she is selected
  const [seat, setSeat] = useState(null); // seat id while inside the car

  const part = PARTS.find((p) => p.id === active);
  const tourTimer = useRef(null);
  const moveTimer = useRef(null);
  const stopTour = () => { clearTimeout(tourTimer.current); setTour(null); };
  const tourInfo = tour ? { pos: tour.pos, total: tour.order.length } : null;

  const dockAvira = () => { stopTour(); setAvira(false); };
  const openAvira = () => {
    if (!part) {
      const lines = seat
        ? ["Hi, I'm Avira. You're inside the cabin now. Drag to look around, or choose another seat below."]
        : ["Hi, I'm Avira. Select any part of the car and I'll explain it, or start the guided tour."];
      setTalk((t) => ({ key: (t?.key ?? 0) + 1, lines }));
    }
    setAvira(true);
  };

  const inCabin = !!seat || !!part?.cabin;
  const mode = useRef("outside");
  const setLimits = (next) => {
    const el = ref.current;
    mode.current = next;
    el.minCameraOrbit = LIMITS[next].min;
    el.maxCameraOrbit = LIMITS[next].max;
    el.maxFieldOfView = LIMITS[next].fov;
  };

  // Camera angles are relative to the car, so add however far auto-rotate has turned it
  const orbitFor = (orbit) => {
    const [theta, ...rest] = orbit.split(" ");
    const turned = (ref.current.turntableRotation * 180) / Math.PI;
    return [`${parseFloat(theta) + turned}deg`, ...rest].join(" ");
  };

  const moveTo = (target, orbit, fov) => {
    const el = ref.current;
    el.cameraTarget = target;
    el.cameraOrbit = orbitFor(orbit);
    el.fieldOfView = fov;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.jumpCameraToGoal();
  };

  // Run camera moves one after another: [[delayMs, fn], ...]
  const sequence = ([step, ...rest]) => {
    clearTimeout(moveTimer.current);
    if (!step) return;
    moveTimer.current = setTimeout(() => { step[1](); sequence(rest); }, step[0]);
  };

  // Change camera limits first if needed (that takes a moment to apply), then move
  const moveIn = (next, go) => {
    clearTimeout(moveTimer.current);
    if (mode.current === next) { go(); return; }
    setLimits(next);
    sequence([[60, go]]);
  };

  const focusPart = (p, tourPos) => {
    if (!ref.current || !p) return;
    setSpin(false);
    setActive(p.id);
    setTalk((t) => ({ key: (t?.key ?? 0) + 1, lines: scriptFor(p, tourPos) }));
    setSeat(null);
    if (p.cabin) {
      moveIn("inside", () => moveTo(p.cabin.target, p.cabin.orbit, p.cabin.fov));
    } else {
      const target = p.position.split(" ").map((v) => `${v}m`).join(" ");
      moveIn("outside", () => moveTo(target, p.orbit, "28deg"));
    }
  };

  // Step inside: glide to the front, in through the windscreen facing the seats, then turn to the dashboard
  const stepInside = () => {
    if (!ref.current) return;
    dockAvira();
    setActive(null);
    setTalk(null);
    setSpin(false);
    const s = SEATS[0];
    setSeat(s.id);
    moveTo(ENTRY, "-90deg 76deg 5m", "30deg");
    sequence([
      [1500, () => setLimits("inside")],
      [60, () => moveTo(ENTRY, "-90deg 80deg 0.05m", CABIN_FOV)],
      [2200, () => moveTo(s.target, "90deg 82deg 0.05m", CABIN_FOV)],
    ]);
  };

  const sitIn = (s) => {
    setSeat(s.id);
    moveIn("inside", () => moveTo(s.target, "90deg 82deg 0.05m", CABIN_FOV));
  };

  // Guided tour: starts at the clicked part and visits every part once
  const startTour = (from) => {
    const i = Math.max(0, PARTS.findIndex((p) => p.id === from?.id));
    const order = [...PARTS.slice(i), ...PARTS.slice(0, i)].map((p) => p.id);
    clearTimeout(tourTimer.current);
    setAvira(true); // starting the tour selects Avira
    setTour({ order, pos: 0 });
    focusPart(PARTS[i], { pos: 0, total: order.length });
  };
  const openPart = (p) => { stopTour(); focusPart(p); }; // a single part, no tour

  // clicking a part opens it; if Avira has been selected, clicking the car starts her tour from there
  const onCarClick = (p) => {
    if (inCabin) return;
    if (avira) startTour(p);
    else if (p) openPart(p);
  };
  const onCarClickRef = useRef(onCarClick);
  useEffect(() => { onCarClickRef.current = onCarClick; });
  useEffect(() => () => { clearTimeout(tourTimer.current); clearTimeout(moveTimer.current); }, []);

  const goToTourStep = (pos) => {
    clearTimeout(tourTimer.current);
    setTour((t) => (t ? { ...t, pos } : t));
    focusPart(PARTS.find((p) => p.id === tour.order[pos]), { pos, total: tour.order.length });
  };

  // Avira finished talking: move on to the next part of the tour
  const onSpoken = () => {
    if (!tour) return;
    if (tour.pos + 1 >= tour.order.length) { stopTour(); return; }
    tourTimer.current = setTimeout(() => goToTourStep(tour.pos + 1), 700);
  };

  const resetView = () => {
    const el = ref.current;
    dockAvira();
    setActive(null);
    setTalk(null);
    if (!el) return;
    setSeat(null);
    moveIn("outside", () => moveTo("auto auto auto", HOME_ORBIT, "30deg"));
  };

  const step = (dir) => {
    if (tour) {
      const n = tour.order.length;
      goToTourStep((tour.pos + dir + n) % n);
      return;
    }
    const i = PARTS.findIndex((p) => p.id === active);
    focusPart(PARTS[(i + dir + PARTS.length) % PARTS.length]);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onProgress = (e) => setProgress(e.detail.totalProgress);
    const onLoad = () => setLoaded(true);
    const onError = () => setFailed(true);
    const onDown = (e) => { down.current = { x: e.clientX, y: e.clientY }; };
    // a click (not a drag) on the car
    const onClick = (e) => {
      const d = down.current;
      if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return; // was a drag, not a click
      if (e.target.closest?.(".viz-hotspot")) return;
      const mat = el.materialFromPoint(e.clientX, e.clientY);
      if (!mat) return; // clicked the background, not the car
      const hit = el.positionAndNormalFromPoint(e.clientX, e.clientY);
      onCarClickRef.current(partFromHit(mat.name, hit?.position?.x ?? 0));
    };
    el.addEventListener("progress", onProgress);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("click", onClick);
    };
  }, []);

  if (failed) {
    return (
      <div className="viz-empty">
        <p className="viz-empty-title">Couldn't load the 3D model</p>
        <p>Check that <code>frontend/public/mg_hector/scene.gltf</code> exists and refresh.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`viz-stage ${part ? "has-panel" : ""} ${inCabin ? "inside" : ""} ${avira && talk ? "has-avira" : ""}`}>
        <model-viewer
          ref={ref}
          src={MODEL_SRC}
          alt="3D model of an MG SUV. Drag to rotate, scroll or pinch to zoom, click a part to learn about it."
          camera-controls=""
          touch-action="pan-y"
          {...(spin ? { "auto-rotate": "" } : {})}
          auto-rotate-delay="0"
          rotation-per-second="20deg"
          camera-orbit={HOME_ORBIT}
          field-of-view="30deg"
          max-field-of-view={LIMITS.outside.fov}
          min-camera-orbit={LIMITS.outside.min}
          max-camera-orbit={LIMITS.outside.max}
          {...(inCabin ? { "disable-zoom": "" } : {})}
          interpolation-decay="120"
          shadow-intensity="1.2"
          shadow-softness="0.8"
          exposure="1"
          environment-image="neutral"
          interaction-prompt="none"
        >
          {loaded && PARTS.map((p) => (
            <button key={p.id} slot={`hotspot-${p.id}`}
                    className={`viz-hotspot ${active === p.id ? "on" : ""}`}
                    data-position={p.position} data-normal={p.normal}
                    data-visibility-attribute="visible"
                    aria-label={`About the ${p.name}`}
                    onClick={() => openPart(p)}>
              <span className="viz-hotspot-label">{p.name}</span>
            </button>
          ))}
          <div slot="progress-bar" />
        </model-viewer>

        {!loaded && (
          <div className="viz-loading" role="status">
            <div className="viz-bar"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            Loading 3D model… {Math.round(progress * 100)}%
          </div>
        )}

        {part && <PartPanel part={part} tour={tourInfo} onClose={resetView} onStep={step}
                            onStopTour={stopTour} />}
        {avira && talk
          ? <Presenter key={talk.key} lines={talk.lines} onDone={onSpoken} onClose={dockAvira} />
          : loaded && <AviraDock onOpen={openAvira} />}

        {seat && (
          <div className="viz-seats" role="group" aria-label="Choose a seat">
            {SEATS.map((x) => (
              <button key={x.id} className={seat === x.id ? "on" : ""} aria-pressed={seat === x.id}
                      onClick={() => sitIn(x)}>{x.name}</button>
            ))}
            <button className="out" onClick={resetView}>Step outside</button>
          </div>
        )}
      </div>

      <div className="viz-parts" role="list" aria-label="Car parts">
        {PARTS.map((p) => (
          <button key={p.id} role="listitem" className={active === p.id ? "on" : ""}
                  onClick={() => openPart(p)}>{p.name}</button>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-play viz-tour-btn" onClick={() => startTour(PARTS[0])}>▶ Guided tour with Avira</button>
        <button className="viz-play" onClick={seat ? resetView : stepInside}>{seat ? "Step outside" : "Step inside"}</button>
        <button className="viz-play" disabled={inCabin} onClick={() => setSpin(!spin)}>{spin ? "Pause rotation" : "Auto-rotate"}</button>
        <button className="viz-play" onClick={resetView}>Reset view</button>
      </div>
      {seat ? <p className="viz-hint">⟷ Drag to look around the cabin</p> :
      <p className="viz-hint">⟷ Drag to rotate · Scroll or pinch to zoom · Click a <span className="viz-dot" /> or a part to learn more · Select Avira to hear about it</p>}
    </>
  );
}

export default function Visualize() {
  useEffect(() => { window.scrollTo(0, 0); document.title = "Visualize Majestor"; }, []);

  return (
    <div className="viz">
      <header className="viz-top">
        <a className="viz-back" href="#top">← Back</a>
        <div className="viz-logo" aria-label="MG">MG</div>
        <a className="btn btn-red" href="#test-drive">Book Test Drive</a>
      </header>

      <main className="viz-main">
        <h1 className="viz-title">VISUALIZE <span>MAJESTOR</span></h1>
        <p className="viz-sub">Explore every angle</p>
        <CarViewer />
        <p className="viz-credit">
          3D model: <a href="https://sketchfab.com/3d-models/mg-hector-7e2c58a323824944883010cf228efd0b" target="_blank" rel="noreferrer">"MG Hector"</a> by{" "}
          <a href="https://sketchfab.com/raobott" target="_blank" rel="noreferrer">raobott</a>, licensed under{" "}
          <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC-BY-4.0</a>
        </p>
      </main>
    </div>
  );
}
