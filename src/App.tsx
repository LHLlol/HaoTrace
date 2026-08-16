import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { LockKeyhole, Search, Sparkles } from 'lucide-react'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ConversationPage from './pages/ConversationPage'
import TimelinePage from './pages/TimelinePage'

const ease = [0.22, 1, 0.36, 1] as const

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <span className="logo-mark-dot" />
      <span className="logo-mark-line logo-mark-line-a" />
      <span className="logo-mark-line logo-mark-line-b" />
    </span>
  )
}

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="浩迹 HaoTrace 首页">
          <LogoMark />
          <span className="brand-copy">
            <strong>浩迹</strong>
            <span>HaoTrace</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="主导航">
          <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Search size={15} strokeWidth={1.8} aria-hidden="true" />
            Search
          </NavLink>
          <NavLink to="/timeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Timeline
          </NavLink>
          <a href="#about" className="nav-link nav-about">About</a>
        </nav>

        <div className="private-badge">
          <LockKeyhole size={13} strokeWidth={1.7} aria-hidden="true" />
          <span>Private space</span>
        </div>
      </div>
    </header>
  )
}

function PageFrame({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  return (
    <div className={`app-shell${isLandingPage ? ' landing-shell' : ''}`}>
      {!isLandingPage && <Header />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname + location.search}
          className="page-shell"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.42, ease }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!isLandingPage && <div className="grain" aria-hidden="true" />}
    </div>
  )
}

export default function App() {
  return (
    <PageFrame>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/conversation/:conversationId" element={<ConversationPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </PageFrame>
  )
}

export function TinyLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="tiny-label">
      <Sparkles size={12} strokeWidth={1.8} aria-hidden="true" />
      {children}
    </span>
  )
}
