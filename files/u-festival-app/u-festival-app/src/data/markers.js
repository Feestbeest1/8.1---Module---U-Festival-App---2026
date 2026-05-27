/**
 * markers.js — Kaartmarkers voor het festivalterrein
 * Posities zijn fracties van de SVG-viewBox (2330.58 × 1353.19)
 * x = 0.0 (links) tot 1.0 (rechts)
 * y = 0.0 (boven) tot 1.0 (onder)
 *
 * Om toe te voegen of aan te passen: zie ook het CMS via /admin
 */
export const markers = [
  {
    id: 'entrance', x: 0.690, y: 0.849,
    icon: 'login', color: '#4CAF50',
    label: { nl: 'Ingang / Uitgang', en: 'Entrance / Exit', fr: 'Entrée / Sortie', de: 'Eingang / Ausgang' },
    info:  { nl: 'Hoofdingang & uitgang van het festivalterrein', en: 'Main entrance & exit of the festival grounds', fr: 'Entrée et sortie principale', de: 'Haupteingang und Ausgang' },
  },
  {
    id: 'ponton', x: 0.213, y: 0.627,
    icon: 'music_note', color: '#F03228',
    label: { nl: 'Ponton', en: 'Ponton', fr: 'Ponton', de: 'Ponton' },
    info:  { nl: 'Main stage – Hoofdacts & headliners', en: 'Main stage – Headliners', fr: 'Scène principale – Têtes d\'affiche', de: 'Hauptbühne – Headliner' },
  },
  {
    id: 'lake', x: 0.539, y: 0.455,
    icon: 'water', color: '#247BA0',
    label: { nl: 'The Lake', en: 'The Lake', fr: 'Le Lac', de: 'Der See' },
    info:  { nl: 'Onbekend & opkomend talent', en: 'Unknown & upcoming talent', fr: 'Talent inconnu & émergent', de: 'Unbekannte & aufstrebende Talente' },
  },
  {
    id: 'club', x: 0.693, y: 0.391,
    icon: 'theater_comedy', color: '#E3B505',
    label: { nl: 'The Club', en: 'The Club', fr: 'Le Club', de: 'Der Club' },
    info:  { nl: 'Theater & Stand-up comedy', en: 'Theater & Stand-up comedy', fr: 'Théâtre & Stand-up', de: 'Theater & Comedy' },
  },
  {
    id: 'hangar', x: 0.902, y: 0.171,
    icon: 'nightlife', color: '#555555',
    label: { nl: 'Hangar', en: 'Hangar', fr: 'Hangar', de: 'Hangar' },
    info:  { nl: 'Non-stop house / techno / dance', en: 'Non-stop house / techno / dance', fr: 'House / Techno non-stop', de: 'Non-Stop House / Techno' },
  },
  {
    id: 'food1', x: 0.121, y: 0.628,
    icon: 'restaurant', color: '#FF8C00',
    label: { nl: 'Food & Drank', en: 'Food & Drinks', fr: 'Nourriture & Boissons', de: 'Essen & Trinken' },
    info:  { nl: 'Food- en drankstand', en: 'Food and drink stand', fr: 'Stand nourriture et boissons', de: 'Essen- und Getränkestand' },
  },
  {
    id: 'food2', x: 0.352, y: 0.440,
    icon: 'restaurant', color: '#FF8C00',
    label: { nl: 'Food & Drank', en: 'Food & Drinks', fr: 'Nourriture & Boissons', de: 'Essen & Trinken' },
    info:  { nl: 'Food- en drankstand', en: 'Food and drink stand', fr: 'Stand nourriture et boissons', de: 'Essen- und Getränkestand' },
  },
  {
    id: 'lockers', x: 0.272, y: 0.823,
    icon: 'lock', color: '#9C27B0',
    label: { nl: 'Kluisjes', en: 'Lockers', fr: 'Casiers', de: 'Schließfächer' },
    info:  { nl: 'Kluisjes te huur – medium & groot', en: 'Lockers for rent – medium & large', fr: 'Casiers à louer – moyen & grand', de: 'Schließfächer zu mieten – mittel & groß' },
  },
  {
    id: 'ehbo', x: 0.182, y: 0.306,
    icon: 'local_hospital', color: '#4CAF50',
    label: { nl: 'EHBO', en: 'First Aid', fr: 'Premiers Secours', de: 'Erste Hilfe' },
    info:  { nl: 'Eerste hulp post', en: 'First aid station', fr: 'Poste de premiers secours', de: 'Erste-Hilfe-Station' },
  },
  {
    id: 'toilet', x: 0.078, y: 0.786,
    icon: 'wc', color: '#607D8B',
    label: { nl: 'Toilet', en: 'Toilet', fr: 'Toilettes', de: 'Toilette' },
    info:  { nl: 'Toiletten', en: 'Toilets', fr: 'Toilettes', de: 'Toiletten' },
  },
]
