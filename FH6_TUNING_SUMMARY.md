# FH6 Tuning – Projekt Összefoglaló

## Mi ez a projekt?

**FH6 Tuning** egy közösségi tuning-asszisztens webalkalmazás **Forza Horizon 6** játékosoknak. Segít optimalizálni az autó-buildeket, diagnosztizálni kezelési problémákat, és megalapozott döntéseket hozni a felfüggesztés, aero és hajtáslánc beállításainál.

**Élő app:** [https://shanpapa.github.io/fh6-tuning/](https://shanpapa.github.io/fh6-tuning/)

---

## Tech Stack

| Réteg | Technológia |
|-------|-------------|
| Frontend | React 18.3.1 |
| Build tool | Vite 5.4.0 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Stílus | Inline CSS-in-JS, saját theme rendszer |
| Betűtípusok | Barlow Condensed (heading), Space Mono (body) |
| Deploy | GitHub Pages (GitHub Actions CI/CD) |

**Nincs** CSS framework, state management lib, linting vagy tesztelési konfig.

---

## Könyvtárstruktúra

```
fh6-tuning/
├── src/
│   ├── main.jsx                    # React belépési pont
│   ├── App.jsx                     # Főshell: auth, tab-navigáció, modal kezelés
│   ├── components/
│   │   ├── Auth/
│   │   │   └── Login.jsx           # Regisztráció / bejelentkezés UI
│   │   ├── Garage/
│   │   │   └── index.jsx           # Felhasználó autógyűjteménye
│   │   ├── BuildEditor/
│   │   │   ├── index.jsx           # Build választó és szerkesztő router
│   │   │   ├── UpgradesTab.jsx     # Alkatrészek telepítése
│   │   │   ├── TuneTab.jsx         # Felfüggesztés / aero beállítások
│   │   │   └── NotesTab.jsx        # Build jegyzetek
│   │   ├── Advisor/
│   │   │   └── index.jsx           # Build optimalizáló & elemző (4-lépéses flow)
│   │   ├── Diagnostic/
│   │   │   └── index.jsx           # Interaktív tuning diagnózis eszköz
│   │   ├── Profile/
│   │   │   └── index.jsx           # Felhasználói profil & fiókbeállítások
│   │   └── UI/
│   │       ├── index.jsx           # Megosztott UI komponensek
│   │       └── StatRadar.jsx       # Radar chart a build statisztikákhoz
│   └── lib/
│       ├── supabase.js             # Supabase kliens inicializáció
│       ├── constants.js            # FH6 osztályok, hajtásláncok, célok, gumik
│       ├── theme.js                # Szín / tipográfia téma (dark mode)
│       ├── tuning.js               # Felfüggesztés & áttétel számítások
│       ├── optimizer.js            # Knapsack optimalizáló az alkatrészekhez
│       ├── diagnostics.js          # Tuning diagnózis tudásbázis (~880 sor)
│       ├── useGoalWeights.js       # Hook: cél-specifikus pontozási súlyok
│       ├── useDescriptions.js      # Hook: alkatrész leírások cache-elése
│       └── useIsMobile.js          # Hook: reszponzív breakpoint
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages CI/CD (Node 24)
├── public/
│   └── favicon.svg
├── index.html                      # HTML sablon (Google Fonts linkekkel)
├── index.css                       # Alap stílusok, scrollbar testreszabás
├── vite.config.js                  # Vite konfig (base: /fh6-tuning/)
└── package.json                    # Függőségek & scriptek
```

---

## Főbb Funkciók

### 1. Garázs (Garage)
- Felhasználó autókatalógusa
- Autók hozzáadása/eltávolítása, becenév szerkesztése
- Buildek kezelése autónként

### 2. Build Szerkesztő (Build Editor)
**Upgrades Tab** – Alkatrészek böngészése és telepítése
- Alkategória szerinti szűrés
- Aktuális PI nyomon követése, delta megjelenítés

**Tune Tab** – Felfüggesztés és beállítások
- Rugók, lengéscsillapítók, iránytartás, aero, áttételek, differenciál
- Valós idejű csúszkák visszajelzéssel
- Alapértelmezett baseline tune generálás (physics-alapú számítással)

**Notes Tab** – Szabad szöveges jegyzetek buildenként

### 3. Advisor (Tanácsadó)
Két mód:

**Új Build optimalizálás (4 lépés):**
1. Autó kiválasztása a teljes katalógusból
2. Cél meghatározása (race_circuit, race_sprint, drift, drag, rally, offroad)
3. PI korlát beállítása (vagy X osztály 999+ esetén)
4. Optimalizáló futtatása → ajánlott alkatrészlista + stat radar

**Meglévő Build elemzése:**
1. Felhasználó egyik buildjének kiválasztása
2. Cél és PI korlát megerősítése
3. Felhasználói alkatrészek vs. optimális összehasonlítása (alkategória-szinten)
4. Lehetőség: meglévő build felülírása vagy mentés újként

### 4. Diagnózis (Diagnostic)
- 11 problémakategória (alulkormányzás, túlkormányzás, tapadásvesztés, stb.)
- Többszintű kérdés-felelet fa (mikor, hol, súlyosság, típus...)
- 6 prioritás szerinti javaslatot ad vissza (TUNE | UPGRADE | CHECK)

---

## Algoritmusok & Logika

### Optimalizáló (`optimizer.js`)
- **Modell:** `Score = Σ(alkatrész_hatások × cél_súlyok)`
- **Korlát:** Egy alkatrész alkategóriánként, összesített PI ≤ korlát
- **Algoritmus:** Multiple-choice knapsack dinamikus programozással
- **Kezeli:** Negatív PI változásokat (súlycsökkentés)

### Diagnózis (`diagnostics.js`)
- **Struktúra:** 11 kategória, mindegyikben 2–3 többválasztásos kérdés
- **Javaslatok:** 6 db per diagnózis, prioritás szerint rendezve (0=sürgős)
- **Típusok:** TUNE (beállítás), UPGRADE (csere), CHECK (ellenőrzés)

### Tuning Számítás (`tuning.js`)
- **Rugóerők:** Természetes frekvencia módszer (gumikompound alapján)
- **Lengéscsillapítás:** Visszapattanás = 1,5 × rugózás (FH6 megerősített arány)
- **Végáttétel:** Nyomaték-alapú képlet hajtáslánc-csere korrekciókkal
- **Baseline tune:** Teljes felfüggesztés + aero + diff értékek generálása

---

## Adatbázis Séma (Supabase / PostgreSQL)

| Tábla | Főbb mezők | Cél |
|-------|-----------|-----|
| `cars` | id, make, model, year, stock_class, stock_pi, stock_drivetrain, verified, base_stats | Autókatalógus |
| `car_parts` | id, car_id, name, category, subcategory, pi_change, effects | Alkatrész-lista autónként |
| `user_cars` | id, user_id, car_id, nickname, created_at | Felhasználó garázsa |
| `builds` | id, user_car_id, name, goal, target_class, target_pi, current_pi, installed_parts[], notes | Build konfigurációk |
| `profiles` | id, username, bio | Felhasználói profil |
| `auth.users` | (Supabase kezeli) | Email + jelszó auth |

---

## Konfiguráció & Deploy

### Környezeti változók
```
VITE_SUPABASE_URL   # Supabase projekt URL
VITE_SUPABASE_KEY   # Anonim kulcs (kliens oldali)
```

### Deploy folyamat
```
git push origin main
  → GitHub Actions (.github/workflows/deploy.yml)
  → npm install + npm run build
  → GitHub Pages (Node 24)
  → https://shanpapa.github.io/fh6-tuning/
```

### npm scriptek
```bash
npm run dev       # Vite dev szerver (localhost:5173)
npm run build     # Production build → /dist/
npm run preview   # Production build helyi előnézete
```

---

## Téma & Design

- **Háttér:** `#0a0a0c` (mélyfekete)
- **Akcentus:** `#f97316` (narancs)
- **15 szín token** központilag a `theme.js`-ben
- **Osztály színek** (`CLASS_COLORS`): D/C/B/A/S1/S2/X osztályonként eltérő
- **Hajtáslánc színek** (`DT_COLORS`): FWD/RWD/AWD
- **Nincs CSS framework** – minden inline CSS-in-JS

---

## Git Ágak

| Ág | Cél |
|----|-----|
| `main` | Produkciós ág, ide deploy-ol a CI/CD |
| `claude/repo-markdown-summary-BVeIH` | Aktív fejlesztési ág |

### Legutóbbi commitok
```
5f25da0  Sync data entry changes: front_weight_pct delta in spring calc, stat display
6f36a93  Fix favicon: move to public/
6c93743  Show fallback note when front_weight_pct missing
5d40567  Fixes: profile crash, baseline warning, slider fill, word-wrap, favicon
b589ebd  QOL fixes: gear count preserve, notes badge, cache clear on logout
537c268  Stat changes: radar top, stats below, bigger fonts
65ad68f  Radar + PI ratings side by side
3c69e3b  StatRadar: radar chart overlay, 3 locations
a144ac1  Fix: toe_r 0.0, goal normalise, Advisor errors, BuildPickStep query...
2867592  Advisor: overwrite or save as new build from analysis result
```

---

## Függőségek

### Production
```json
"react": "18.3.1"
"react-dom": "18.3.1"
"@supabase/supabase-js": "2.49.0"
```

### Dev
```json
"vite": "5.4.0"
"@vitejs/plugin-react": "4.3.1"
```

---

## Megjegyzések

- Nincs linting / tesztelési konfig (eslint, jest, vitest)
- Állapotkezelés: React `useState` + lokális komponens state (nincs Redux/Context)
- Hibakezelés: alapszintű try-catch async operációkban
- Kód mérete: ~1500 sor library logika, tömör és fókuszált kódbázis
