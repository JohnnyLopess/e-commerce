import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import SearchPage from './pages/SearchPage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produto/:slug" element={<ProductPage />} />
          <Route path="/busca" element={<SearchPage />} />
          <Route path="/categoria/:slug" element={<CategoryPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
