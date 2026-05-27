import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Info from './pages/Info.jsx'
import Schedule from './pages/Schedule.jsx'
import Map from './pages/Map.jsx'
import './styles/global.css'

// Admin + Firebase worden pas geladen als /admin bezocht wordt (code-splitting)
const Admin = lazy(() => import('./pages/Admin.jsx'))

const LANGUAGES = [
  { code: 'nl', label: 'NL', flag: '/flags/nl.svg' },
  { code: 'en', label: 'EN', flag: '/flags/en.svg' },
  { code: 'fr', label: 'FR', flag: '/flags/fr.svg' },
  { code: 'de', label: 'DE', flag: '/flags/de.svg' },
]

// ── Admin-scherm (eigen layout, geen header/navbar) ───────────────────────
function AdminPage() {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F03228' }}>Laden…</div>}>
      <Admin />
    </Suspense>
  )
}

// ── Hoofd-app layout ──────────────────────────────────────────────────────
function AppLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'nl'
  })
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstall, setShowInstall]     = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setShowInstall(false))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') { setShowInstall(false); setInstallPrompt(null) }
  }, [installPrompt])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Sluit taalmenu bij klik buiten
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
          <img src="/logo_ufestival.svg" alt="❤️U Festival" className="logo" />
          <span className="header-title">FESTIVAL</span>
        </div>
        <div className="header-controls">
          {/* Taalknop — vlaggetje altijd zichtbaar */}
          <div className="lang-dropdown" ref={menuRef}>
            <button
              className="lang-switch-btn"
              onClick={() => setLangMenuOpen(o => !o)}
              title={currentLang.label}
            >
              <img src={currentLang.flag} alt={currentLang.label} className="lang-flag" />
              <span className="material-icons lang-arrow">expand_more</span>
            </button>
            {langMenuOpen && (
              <div className="lang-menu">
                {LANGUAGES.filter(l => l.code !== language).map(l => (
                  <button
                    key={l.code}
                    className="lang-option"
                    onClick={() => { setLanguage(l.code); setLangMenuOpen(false) }}
                    title={l.label}
                  >
                    <img src={l.flag} alt={l.label} className="lang-option-flag" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PWA install-knop (toont als browser installatie ondersteunt) */}
          {showInstall && (
            <button
              className="icon-btn install-btn"
              onClick={handleInstall}
              title="Installeer app op dit apparaat"
            >
              <span className="material-icons">install_mobile</span>
            </button>
          )}

          {/* Light / dark mode */}
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
          <Route path="/"         element={<Home     language={language} />} />
          <Route path="/info"     element={<Info     language={language} />} />
          <Route path="/schedule" element={<Schedule language={language} />} />
          <Route path="/map"      element={<Map      language={language} />} />
        </Routes>
      </main>

      <Navbar language={language} />
    </div>
  )
}

// ── Hoofd router ──────────────────────────────────────────────────────────
function App() {
  const location = useLocation()
  const isAdmin  = location.pathname.startsWith('/admin')

  return isAdmin ? <AdminPage /> : <AppLayout />
}

export default App
