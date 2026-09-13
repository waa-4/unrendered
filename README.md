# Unrendered

A tiny dependency-free tower defence game made for GitHub Pages.

## Run locally
Open `index.html`, or use a simple local server if your browser blocks local assets.

## GitHub Pages
Upload the contents of this folder to a repository, then enable GitHub Pages from the repository root / main branch.

## Adding levels
Edit `levels.js`. Each object controls its own name, path, starting cash, base HP, and waves. Path points use normalized coordinates (`0` to `1`) so they automatically resize with the canvas.

## Files
- `index.html` — menus and game layout
- `style.css` — UI styling
- `levels.js` — level definitions only
- `main.js` — gameplay engine
- `assets/unit.png` and `assets/enemy.png` — transparent versions of the supplied drawings
- `assets/*-original.png` — original supplied files
