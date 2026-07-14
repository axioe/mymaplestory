import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './ThemeContext.jsx'
import { ApiKeyProvider } from './ApiKeyContext.jsx'
import MenuButton from './components/MenuButton.jsx'
import Home from './pages/Home.jsx'
import CharacterCard from './pages/CharacterCard.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <ApiKeyProvider>
        <MenuButton />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/characters/:name" element={<CharacterCard />} />
          </Routes>
        </main>
      </ApiKeyProvider>
    </ThemeProvider>
  )
}
