import './App.css'
import { Routes, Route } from 'react-router-dom'
import { routes } from './app/routes'
import { AppProviders } from './app/providers'
import { Header } from './shared/components/Header'

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
    </AppProviders>
  )
}

export default App
