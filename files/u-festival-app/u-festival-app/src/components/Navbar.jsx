import { NavLink } from 'react-router-dom'
import './Navbar.css'

const t = {
  nl: { home: 'Home', info: 'Info', lineup: 'Lineup', map: 'Kaart' },
  en: { home: 'Home', info: 'Info', lineup: 'Lineup', map: 'Map' },
  fr: { home: 'Accueil', info: 'Info', lineup: 'Programme', map: 'Carte' },
  de: { home: 'Start', info: 'Info', lineup: 'Line-up', map: 'Karte' },
}

export default function Navbar({ language }) {
  const lang = t[language] || t.nl
  return (
    <nav className="navbar">
      <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="material-icons">home</span>
        <span>{lang.home}</span>
      </NavLink>
      <NavLink to="/info" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="material-icons">info</span>
        <span>{lang.info}</span>
      </NavLink>
      <NavLink to="/schedule" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="material-icons">music_note</span>
        <span>{lang.lineup}</span>
      </NavLink>
      <NavLink to="/map" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="material-icons">location_on</span>
        <span>{lang.map}</span>
      </NavLink>
    </nav>
  )
}
