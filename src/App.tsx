import { AnimatePresence, motion } from 'framer-motion'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import HomePage from './pages/HomePage'
import ConversationPage from './pages/ConversationPage'
import TimelinePage from './pages/TimelinePage'
import LogoMark from './components/LogoMark'

const ease = [0.22, 1, 0.36, 1] as const
const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, '')

function getAppPath(pathname: string) {
  if (!appBasePath) return pathname || '/'
  if (pathname === appBasePath) return '/'
  if (pathname.startsWith(`${appBasePath}/`)) {
    return pathname.slice(appBasePath.length) || '/'
  }
  return pathname || '/'
}

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="返回首页">
          <LogoMark />
        </Link>
      </div>
    </header>
  )
}

function PageFrame({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const appPath = getAppPath(location.pathname)
  const isLandingPage = appPath === '/' || appPath === '/search'
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
        <Route path="/search" element={<HomePage />} />
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
