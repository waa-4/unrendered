# Unrendered v0.0.10

GitHub Pages-ready tower defence game. Upload the contents of this folder to a repository and enable GitHub Pages.

## This build
- World 1: 10 levels, one route/base.
- World 2: 10 wider levels, two routes and two bases.
- Easy, Normal, Hard, Insane, Ultra, Nightmare, and Fun Mode.
- Fun Mode: no selling, double enemy count, slower pacing/enemies, very high enemy HP, high armor/multi-bar chances.
- Endless duplicate-price scaling and reduced late-run income.
- Random armor and multi-health-bar enemy variants.
- Points earned from level clears and Endless milestones.
- Permanent upgrade menu: base HP (20 to 9999), damage, range, fire rate, sell refund.
- In-run unit upgrades using cash.
- Pause and 1x / 1.5x / 2x / 3x speed controls.
- Settings for shake, flashes, sound, damage numbers, health bars, sell confirmation, and particles.
- 19 total units: the original 9 plus Brick, Needle, Splashbox, Relay, Ticker, Orbit, Crumbler, Snare, Burstglass, and Longhand.
- 17 enemy types: the original 7 plus Paperclip, Clot, Zipper, Mirror, Healer, Splitter, Ghost, Leech, Brickhead, and Phase.
- Improved responsive/mobile layout.

Level data remains in `levels.js` for editing, but that developer note is no longer shown in the game UI.


## 0.0.10 hotfix
- Fixed portrait result screens clipping inside the battlefield.
- Portrait mode now uses the full screen width for the battlefield and scrolls cleanly instead of shrinking everything until controls disappear.
- Unit buttons reflow into a 2-column mobile layout so tower choices stay reachable.
- Fixed Splitter descendants recursively splitting forever, a likely cause of late Endless freezes.
- Added conservative caps for temporary particles, damage text, shockwaves, and railgun beams during very long runs.
- Re-fits the arena after phone orientation changes.
