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
    n3: "Meer acts worden binnenkort bekendgemaakt. Houd de app in de gaten!"
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
    n3: "More acts will be announced soon. Keep an eye on the app!"
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
        <span className="news-date">20 mei 2026</span>
      </div>
      <div className="card news-card">
        <h3 className="news-title">{lang.n2title}</h3>
        <p className="news-text">{lang.n2}</p>
        <span className="news-date">18 mei 2026</span>
      </div>
      <div className="card news-card">
        <h3 className="news-title">{lang.n3title}</h3>
        <p className="news-text">{lang.n3}</p>
        <span className="news-date">15 mei 2026</span>
      </div>
    </div>
  )
}
