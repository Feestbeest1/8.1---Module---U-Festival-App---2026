import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Info from './pages/Info.jsx'
import Schedule from './pages/Schedule.jsx'
import Map from './pages/Map.jsx'
import './styles/global.css'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'nl'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <img src="/logoWhite.png" alt="❤️U Festival" className="logo" />
          <span className="header-title">FESTIVAL</span>
        </div>
        <div className="header-controls">
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
            <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="lang-btn" onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}>
            {language === 'nl' ? '🇳🇱' : '🇬🇧'}
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
