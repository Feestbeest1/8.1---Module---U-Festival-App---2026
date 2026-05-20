# ❤️U Festival App

Een mobile PWA voor bezoekers van het ❤️U Festival (15 & 16 augustus 2026, Strijkviertel Utrecht).

## Tech Stack
- **React 18** + **Vite 5**
- **React Router DOM** – client-side routing
- **vite-plugin-pwa** – PWA / service worker / manifest
- **CSS Custom Properties** – theming (light/dark mode)
- **Google Fonts: Sansation** – festival huisstijl lettertype
- **Material Icons** – iconen
- **MySQL** (backend, nog te koppelen)

## Functionaliteiten
- ✅ 4 pagina's: Home, Info, Schedule, Map
- ✅ Tweetalig (NL / EN)
- ✅ Light / Dark mode
- ✅ PWA installeerbaar
- ✅ Responsive (mobile-first)
- ✅ Accordion op info-pagina
- ✅ Interactief blokschema (schedule) per dag
- ✅ Interactieve kaart met markers + GPS locatie
- ✅ Pinch-to-zoom & drag op kaart
- ⬜ MySQL backend koppeling
- ⬜ Push notificaties

## Project starten

```bash
npm install
npm run dev
```

## Structuur

```
src/
├── components/
│   ├── Navbar.jsx
│   └── Navbar.css
├── data/
│   └── festival.js       ← festival data (later uit MySQL)
├── pages/
│   ├── Home.jsx / .css
│   ├── Info.jsx / .css
│   ├── Schedule.jsx / .css
│   └── Map.jsx / .css
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

## Kleurenpallet
| Naam | Hex |
|------|-----|
| Accent (rood) | `#F03228` |
| Secondary (blauw) | `#247BA0` |
| Info (geel) | `#E3B505` |
| Base (wit) | `#FFFFFF` |
| Primary (zwart) | `#000000` |

## AI Logboek
Zie [AI_LOGBOEK.md](./AI_LOGBOEK.md)
