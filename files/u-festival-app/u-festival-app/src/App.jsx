import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Info from './pages/Info.jsx'
import Schedule from './pages/Schedule.jsx'
import Map from './pages/Map.jsx'
import './styles/global.css'

const LANGUAGES = [
  { code: 'nl', label: 'NL', flag: '🇳🇱' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
]

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'nl'
  })
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Sluit menu bij klik buiten
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          {/* Header heeft altijd zwarte achtergrond, dus altijd wit logo */}
          <img src="/logo_ufestival.svg" alt="❤️U Festival" className="logo" />
          <span className="header-title">FESTIVAL</span>
        </div>
        <div className="header-controls">
          {/* Taal dropdown */}
          <div className="lang-dropdown" ref={menuRef}>
            <button
              className="lang-switch-btn"
              onClick={() => setLangMenuOpen(o => !o)}
              title="Switch language"
            >
              <span className="lang-label">{currentLang.label}</span>
              <span className="material-icons lang-arrow">expand_more</span>
            </button>
            {langMenuOpen && (
              <div className="lang-menu">
                {LANGUAGES.filter(l => l.code !== language).map(l => (
                  <button
                    key={l.code}
                    className="lang-option"
                    onClick={() => { setLanguage(l.code); setLangMenuOpen(false) }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            className="icon-btn"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home language={language} />} />
          <Route path="/info" element={<Info language={language} />} />
          <Route path="/schedule" element={<Schedule language={language} />} />
          <Route path="/map" element={<Map language={language} />} />
        </Routes>
      </main>

      <Navbar language={language} />
    </div>
  )
}

export default App
