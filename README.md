# Taiwan ID Validator

A localhost web app for validating and generating:

- **Taiwan National ID** (中華民國國民身分證)
- **New UI Number** (新式統一證號 — for foreign nationals)
- **Unified Business Number** (統一編號)

All checksum logic runs entirely in the browser — no data is sent to any server.

---

## Requirements

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | v16 or higher | Only needed to run the local server |

> **How to check if Node.js is installed:**
> Open a terminal and run:
> ```
> node --version
> ```
> If you see a version number (e.g. `v20.11.0`), you're ready. If you get `command not found`, install Node.js first.

> **Install Node.js:** Download the LTS version from https://nodejs.org

No `npm install` is required. The app is a single self-contained HTML file (`app.html`) served by a minimal Node.js HTTP server (`server.cjs`). There are no external build steps.

---

## How to Run

### Step 1 — Open a terminal

On macOS: press `Cmd + Space`, type **Terminal**, press Enter.  
On Windows: press `Win + R`, type `cmd`, press Enter.

### Step 2 — Navigate to this folder

```bash
cd "path/to/id-validator-app"
```

Replace `path/to/id-validator-app` with the actual path where you unzipped this folder. For example:

```bash
cd "/Users/yourname/Downloads/id-validator-app"
```

### Step 3 — Start the server

```bash
node server.cjs
```

You should see:

```
  Taiwan ID Validator running at:

  http://localhost:3001
```

### Step 4 — Open in browser

Open your browser and go to:

```
http://localhost:3001
```

The app will load immediately. No internet connection is required after the page loads (fonts load from Google Fonts CDN on first visit, but the app works without them).

### Step 5 — Stop the server

Press `Ctrl + C` in the terminal to stop the server.

---

## Features

### National ID / New UI Number

- **Validate:** Enter any 10-character ID. The app checks the modulo-10 checksum and shows the full step-by-step calculation (letter code conversion, weight multiplications, total S, and `S % 10` result).
- **Generate:** Choose National ID or New UI Number type, click Generate to produce a cryptographically-compliant random ID. Click **Verify this ID** to confirm it passes validation.

**ID format:** 1 letter (A–Z) + 9 digits  
**D1 values:** `1` or `2` = National ID (male/female); `8` or `9` = New UI Number (male/female)

### Unified Business Number

- **Validate:** Enter any 8-digit number. The app applies the weighted digit-sum algorithm and shows the modulo-5 check. When the 7th digit is 7, both sum paths (D7 contributing 1 or 0) are displayed and tested.
- **Generate:** Click Generate to produce a valid 8-digit business number. The D7=7 special case is handled automatically.

**Number format:** 8 digits  
**Weights:** `[1, 2, 1, 2, 1, 2, 4, 1]`

---

## Validation Algorithms

### National ID / New UI Number — Modulo 10

**Letter code table:**

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 34 | 18 | 19 | 20 | 21 |

| N | O | P | Q | R | S | T | U | V | W | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 22 | 35 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 32 | 30 | 31 | 33 |

**Formula:**  
`S = (X1×1) + (X2×9) + (D1×8) + (D2×7) + (D3×6) + (D4×5) + (D5×4) + (D6×3) + (D7×2) + (D8×1) + (D9×1)`

Where X1, X2 are the two digits of the letter's code, and D1–D9 are the 9 numeric digits of the ID.

**Valid if:** `S % 10 === 0`

### Unified Business Number — Modulo 5

**Weights:** `[1, 2, 1, 2, 1, 2, 4, 1]` for positions D1–D8.

1. Multiply each digit by its weight.
2. If the result is ≥ 10, split and sum the digits (e.g. `18 → 1+8 = 9`).
3. **D7 = 7 exception:** `7 × 4 = 28 → 2+8 = 10`. This result counts as either **1** (1+0) or **0**, generating two sums to test.
4. **Valid if:** `S % 5 === 0` (standard), or either `S1 % 5 === 0` or `S2 % 5 === 0` (when D7 = 7).

---

## File Structure

```
id-validator-app/
├── app.html       ← The entire app (HTML + CSS + JavaScript)
├── server.cjs     ← Minimal Node.js HTTP server (serves app.html)
├── package.json   ← Project metadata
├── README.md      ← This file
└── src/           ← TypeScript source (for future development)
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── lib/
    │   ├── nationalId.ts
    │   ├── businessNumber.ts
    │   └── index.ts
    └── components/
        ├── NationalIdPanel.tsx
        └── BusinessNumberPanel.tsx
```

The app runs entirely from `app.html` + `server.cjs`. The `src/` folder contains the TypeScript source for future Vite-based development.

---

## Troubleshooting

**`command not found: node`**  
Node.js is not installed. Download it from https://nodejs.org and install the LTS version.

**`Error: listen EADDRINUSE: address already in use :::3001`**  
Port 3001 is already in use. Either close the other app using that port, or edit `server.cjs` line 3 to use a different port (e.g. `const PORT = 3002;`), then open `http://localhost:3002` instead.

**Page loads but fonts look different**  
The app uses Google Fonts (Inter, Manrope) which require an internet connection on first load. Functionality is unaffected without them.
