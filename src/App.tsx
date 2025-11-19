import './App.css'
import { Routes, Route } from 'react-router-dom'
import { routes } from './app/routes'
import { AppProviders } from './app/providers'
import { Header } from './shared/components/Header'
import { Footer } from './shared/components/Footer'

function App() {
  return (
    <AppProviders>
      <Header />
      <main>
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </main>
      <Footer />
    </AppProviders>
  )
}

export default App
