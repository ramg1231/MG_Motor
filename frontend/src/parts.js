// Clickable parts on the 3D model.
// position / normal: model coordinates of the hotspot (front of car = -X, driver side = -Z, up = +Y)
// orbit: camera angle used when the part is opened ("theta phi radius")
// cabin: for parts inside the car, the camera used instead (inside view)
// match: words in the model's material names - clicking that surface opens this part
// NOTE: descriptions are sample copy - replace with the official specs.
const PARTS = [
  {
    id: "steering", name: "Steering Wheel", tagline: "Command every journey",
    position: "-0.61 1.14 -0.35", normal: "0 0 -1", orbit: "210deg 72deg 1.5m",
    cabin: { target: "-0.61m 1.14m -0.35m", orbit: "90deg 70deg 0.65m", fov: "55deg" },
    match: ["STEER"],
    text: "A thick-rimmed, perforated leather steering wheel that feels premium in the hand and stays comfortable on long drives.",
    points: [
      "Perforated leather wrap with contrast stitching",
      "Mounted controls for audio, calls and cruise control",
      "Tilt adjustment to find the ideal driving position",
      "Electric power steering: light in the city, firm at speed",
    ],
  },
  {
    id: "screen", name: "Infotainment Screen", tagline: "Your connected cockpit",
    position: "-0.84 1.08 -0.17", normal: "0 1 0", orbit: "35deg 70deg 1.7m",
    cabin: { target: "-0.84m 1.08m -0.1m", orbit: "90deg 76deg 0.75m", fov: "50deg" },
    match: ["SCREEN"],
    text: "A large high-resolution touchscreen sits at the centre of the dashboard, putting navigation, music and car settings within easy reach.",
    points: [
      "Wireless Android Auto and Apple CarPlay",
      "Voice commands for AC, sunroof and navigation",
      "Connected-car app: remote lock, AC and location",
      "Feed from the 360° camera when parking",
    ],
  },
  {
    id: "seats", name: "Seats", tagline: "First-class comfort",
    position: "0.0 1.1 0.35", normal: "0 1 0", orbit: "10deg 68deg 1.9m",
    cabin: { target: "-0.05m 1.12m 0m", orbit: "-90deg 74deg 0.6m", fov: "65deg" },
    match: ["SEAT"],
    text: "Dotted leather seats with generous bolstering keep everyone comfortable, whether it's a city commute or a weekend road trip.",
    points: [
      "Premium dotted-leather upholstery",
      "Ventilated front seats for hot Indian summers",
      "Powered driver seat with lumbar support",
      "Reclining rear seats with plenty of legroom",
    ],
  },
  {
    id: "sunroof", name: "Panoramic Sunroof", tagline: "Bring the sky inside",
    position: "0.35 1.71 0", normal: "0 1 0", orbit: "90deg 32deg 4m",
    match: ["SUNROOF"],
    text: "One of the largest sunroofs in its class floods the cabin with light and gives rear passengers an open-air view.",
    points: [
      "Panoramic glass across both rows",
      "One-touch open and close, also by voice",
      "Powered sunshade for hot afternoons",
    ],
  },
  {
    id: "tyres", name: "Tyres", tagline: "Grip on any surface",
    position: "1.32 0.61 0.88", normal: "0 0 1", orbit: "20deg 82deg 2.4m",
    match: ["TYRE"],
    text: "Wide, high-profile tyres soak up potholes and rough roads while keeping strong grip in the wet.",
    points: [
      "Wide footprint for stability at highway speeds",
      "Deep tread pattern for wet-road grip",
      "Tall sidewalls absorb bumps and broken roads",
      "Tyre Pressure Monitoring System (TPMS)",
    ],
  },
  {
    id: "wheels", name: "Alloy Wheels & Brakes", tagline: "Style that stops",
    position: "-1.45 0.34 0.88", normal: "0 0 1", orbit: "-20deg 82deg 2.4m",
    match: ["WHEEL_METAL", "WHEEL_DISK", "WHEEL_BRAKE", "WHEEL_PLASTIC"],
    text: "Large machined alloy wheels give a bold stance, with disc brakes behind them for confident stopping.",
    points: [
      "Dual-tone machined alloy design",
      "Disc brakes with ABS and EBD",
      "Electronic stability program and hill-hold assist",
    ],
  },
  {
    id: "headlights", name: "LED Headlamps", tagline: "See and be seen",
    position: "-2.25 0.77 -0.72", normal: "-1 0 0", orbit: "-115deg 80deg 2.4m",
    match: [],
    text: "Split LED headlamps with signature daytime running lights give the SUV its unmistakable face, day or night.",
    points: [
      "Full-LED projector headlamps",
      "Sleek LED daytime running lights",
      "Automatic headlamps that switch on at dusk",
    ],
  },
  {
    id: "grille", name: "Front Grille & ADAS", tagline: "Bold face, smart safety",
    position: "-2.4 0.75 0", normal: "-1 0 0", orbit: "-90deg 82deg 2.8m",
    match: ["CHROME_TEXT"],
    text: "The large chrome grille houses the radar for Level 2 ADAS, a set of driver-assist features that help avoid accidents.",
    points: [
      "Adaptive cruise control",
      "Lane keep assist and lane departure warning",
      "Autonomous emergency braking",
      "Forward collision warning",
    ],
  },
  {
    id: "mirrors", name: "Smart Mirrors", tagline: "Eyes on every side",
    position: "-0.8 1.25 -1.06", normal: "0 0 -1", orbit: "-150deg 80deg 1.6m",
    match: ["ORVM"],
    text: "Power-folding outside mirrors with built-in indicators, and cameras that build a 360° view around the car.",
    points: [
      "Power-adjust and auto-fold on lock",
      "Integrated LED turn indicators",
      "Cameras for the 360° surround view",
    ],
  },
  {
    id: "taillights", name: "Connected Tail Lamps", tagline: "A signature from behind",
    position: "2.15 1.07 0.6", normal: "1 0 0", orbit: "65deg 80deg 2.6m",
    match: ["TAILLIGHT", "RED_GLASS", "RED_DETAILS", "BOOT_DOOR_LIGHTS"],
    text: "LED tail lamps connected by a light bar across the tailgate make the SUV instantly recognisable at night.",
    points: [
      "Full-LED tail lamps",
      "Connected light bar across the tailgate",
      "Sequential indicators",
    ],
  },
];

export default PARTS;

// Work out which part was clicked from the material name (and hit position for shared materials)
export function partFromHit(materialName, hitX) {
  if (!materialName) return null;
  if (materialName.includes("HEAD_GLASS") || materialName.includes("LIGHTS_WHITE")) {
    return PARTS.find((p) => p.id === (hitX < 0 ? "headlights" : "taillights"));
  }
  return PARTS.find((p) => p.match.some((m) => materialName.includes(m))) || null;
}
