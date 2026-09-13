// UNRENDERED LEVEL DATA
// Add/edit levels here. main.js reads this array automatically.
// Path coordinates are normalized from 0..1 so they work at any canvas size.

window.UNRENDERED_LEVELS = [
  {
    id: 1,
    name: "Square One",
    description: "A polite rectangle. It will stop being polite shortly.",
    tint: "#0aa1e8",
    startCash: 250,
    baseHP: 20,
    rewardScale: 1,
    path: [
      [-0.06, 0.28], [0.18, 0.28], [0.18, 0.68], [0.48, 0.68], [0.48, 0.24], [0.76, 0.24], [0.76, 0.72], [1.06, 0.72]
    ],
    waves: [
      { count: 8,  hp: 42, speed: 0.070, gap: 0.72, reward: 12 },
      { count: 12, hp: 58, speed: 0.080, gap: 0.55, reward: 13 },
      { count: 16, hp: 78, speed: 0.090, gap: 0.43, reward: 14 },
      { count: 10, hp: 135, speed: 0.072, gap: 0.52, reward: 18 },
      { count: 1,  hp: 900, speed: 0.050, gap: 0.8, reward: 120, scale: 1.65, boss: true }
    ]
  },
  {
    id: 2,
    name: "Bad Geometry",
    description: "The path gave up halfway through being a path.",
    tint: "#f0222b",
    startCash: 285,
    baseHP: 18,
    rewardScale: 1.08,
    path: [
      [-0.05,0.82], [0.18,0.82], [0.18,0.20], [0.52,0.20], [0.41,0.44], [0.62,0.36], [0.55,0.66], [0.86,0.54], [1.05,0.56]
    ],
    waves: [
      { count: 11, hp: 60, speed: 0.082, gap: 0.52, reward: 13 },
      { count: 15, hp: 72, speed: 0.105, gap: 0.40, reward: 14 },
      { count: 7, hp: 190, speed: 0.068, gap: 0.64, reward: 23, scale: 1.18 },
      { count: 20, hp: 92, speed: 0.115, gap: 0.34, reward: 15 },
      { count: 2, hp: 720, speed: 0.058, gap: 2.2, reward: 90, scale: 1.5, boss: true }
    ]
  },
  {
    id: 3,
    name: "Memory Leak",
    description: "Fast things. Too many things. The level selector warned you.",
    tint: "#bb67ff",
    startCash: 340,
    baseHP: 16,
    rewardScale: 1.15,
    path: [
      [-0.06,0.50], [0.13,0.50], [0.13,0.18], [0.36,0.18], [0.36,0.80], [0.58,0.80], [0.58,0.30], [0.79,0.30], [0.79,0.70], [1.06,0.70]
    ],
    waves: [
      { count: 14, hp: 70, speed: 0.105, gap: 0.39, reward: 14 },
      { count: 24, hp: 68, speed: 0.135, gap: 0.27, reward: 12 },
      { count: 13, hp: 170, speed: 0.086, gap: 0.45, reward: 21 },
      { count: 30, hp: 105, speed: 0.140, gap: 0.22, reward: 14 },
      { count: 1, hp: 1450, speed: 0.063, gap: 1, reward: 180, scale: 1.85, boss: true }
    ]
  }
];
