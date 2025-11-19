import './App.css'
import { Routes, Route } from 'react-router-dom'
import { routes } from './app/routes'
import { AppProviders } from './app/providers'
import { APP_NAME } from './app/config/constants'

function App() {
  return (
    <AppProviders>
      <header>
        <h1>{APP_NAME}</h1>
      </header>
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
