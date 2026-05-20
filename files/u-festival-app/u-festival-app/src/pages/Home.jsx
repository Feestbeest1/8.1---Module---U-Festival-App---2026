import './Home.css'

const t = {
  nl: {
    welcome: "WELKOM BIJ HET",
    festival: "❤️U FESTIVAL",
    date: "15 & 16 augustus 2026",
    location: "Strijkviertel, Utrecht",
    news: "Nieuws & Meldingen",
    n1title: "App gelanceerd! 🎉",
    n1: "De officiële ❤️U Festival app is nu beschikbaar. Download hem via de QR-code op je ticket.",
    n2title: "Shuttlebus info",
    n2: "De gratis shuttlebus vertrekt vanaf Utrecht Centraal (Mineurslaan) tussen 12:00 en 19:00.",
    n3title: "Line-up update",
    n3: "Meer acts worden binnenkort bekendgemaakt. Houd de app in de gaten!",
    d1: "20 mei 2026", d2: "18 mei 2026", d3: "15 mei 2026"
  },
  en: {
    welcome: "WELCOME TO THE",
    festival: "❤️U FESTIVAL",
    date: "August 15 & 16, 2026",
    location: "Strijkviertel, Utrecht",
    news: "News & Announcements",
    n1title: "App launched! 🎉",
    n1: "The official ❤️U Festival app is now available. Download it via the QR code on your ticket.",
    n2title: "Shuttle bus info",
    n2: "The free shuttle bus departs from Utrecht Central Station (Mineurslaan) between 12:00 and 19:00.",
    n3title: "Line-up update",
    n3: "More acts will be announced soon. Keep an eye on the app!",
    d1: "20 May 2026", d2: "18 May 2026", d3: "15 May 2026"
  },
  fr: {
    welcome: "BIENVENUE AU",
    festival: "❤️U FESTIVAL",
    date: "15 & 16 août 2026",
    location: "Strijkviertel, Utrecht",
    news: "Actualités & Annonces",
    n1title: "Application lancée ! 🎉",
    n1: "L'application officielle ❤️U Festival est maintenant disponible. Téléchargez-la via le QR code sur votre billet.",
    n2title: "Info navette",
    n2: "La navette gratuite part de la gare d'Utrecht Central (Mineurslaan) entre 12h00 et 19h00.",
    n3title: "Mise à jour du programme",
    n3: "D'autres artistes seront annoncés prochainement. Restez à l'écoute !",
    d1: "20 mai 2026", d2: "18 mai 2026", d3: "15 mai 2026"
  },
  de: {
    welcome: "WILLKOMMEN BEIM",
    festival: "❤️U FESTIVAL",
    date: "15. & 16. August 2026",
    location: "Strijkviertel, Utrecht",
    news: "Neuigkeiten & Ankündigungen",
    n1title: "App gestartet! 🎉",
    n1: "Die offizielle ❤️U Festival App ist jetzt verfügbar. Downloade sie über den QR-Code auf deinem Ticket.",
    n2title: "Shuttlebus-Info",
    n2: "Der kostenlose Shuttlebus fährt vom Hauptbahnhof Utrecht (Mineurslaan) zwischen 12:00 und 19:00 Uhr.",
    n3title: "Line-up Update",
    n3: "Weitere Acts werden bald bekannt gegeben. Bleib dran!",
    d1: "20. Mai 2026", d2: "18. Mai 2026", d3: "15. Mai 2026"
  }
}

export default function Home({ language }) {
  const lang = t[language] || t.nl
  return (
    <div className="page">
      <div className="home-hero">
        <p className="home-welcome">{lang.welcome}</p>
        <h1 className="home-title">{lang.festival}</h1>
        <div className="home-meta">
          <span className="material-icons">calendar_today</span>
          <span>{lang.date}</span>
        </div>
        <div className="home-meta">
          <span className="material-icons">location_on</span>
          <span>{lang.location}</span>
        </div>
      </div>

      <h2 className="section-heading">{lang.news}</h2>

      <div className="card news-card">
        <h3 className="news-title">{lang.n1title}</h3>
        <p className="news-text">{lang.n1}</p>
        <span className="news-date">{lang.d1}</span>
      </div>
      <div className="card news-card">
        <h3 className="news-title">{lang.n2title}</h3>
        <p className="news-text">{lang.n2}</p>
        <span className="news-date">{lang.d2}</span>
      </div>
      <div className="card news-card">
        <h3 className="news-title">{lang.n3title}</h3>
        <p className="news-text">{lang.n3}</p>
        <span className="news-date">{lang.d3}</span>
      </div>
    </div>
  )
}
