import './App.css'
import { Routes, Route } from 'react-router-dom'
import { routes } from './app/routes'
import { AppProviders } from './app/providers'
import { Header } from './shared/components/Header'
import { Footer } from './shared/components/Footer'

function App() {
  return (
    <AppProviders>
      <div className="app-container">
        <Header />
        <main className="app-main" role="main">
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </main>
        <Footer />
      </div>
    </AppProviders>
  )
}

export default App
