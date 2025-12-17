import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import SearchPage from './pages/SearchPage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
            <Route path="/busca" element={<SearchPage />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
