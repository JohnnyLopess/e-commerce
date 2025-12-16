import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchProducts } from '../services/api'
import { getProductImageUrl } from '../utils/imageUrl'

function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setLoading(true)
        try {
          const data = await searchProducts(searchQuery, 1, 6)
          setResults(data.products || [])
          setShowResults(true)
        } catch {
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowResults(false)
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleProductClick = (slug) => {
    setShowResults(false)
    setSearchQuery('')
    navigate(`/produto/${slug}`)
  }

  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-6 md:gap-12">
          <Link to="/" className="flex-shrink-0">
            <span className="text-base sm:text-xl font-bold text-gray-800">fresh<span className="text-primary-600">market</span>.</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                placeholder="Buscar..."
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Buscando...</div>
                  ) : results.length > 0 ? (
                    <>
                      {results.map((product) => {
                        const photo = product.images?.[0] || ''
                        const price = product.min_price_valid || product.prices?.[0]?.price || 0
                        
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <img
                              src={getProductImageUrl(photo, 'small')}
                              alt={product.name}
                              className="w-12 h-12 object-contain flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">{product.name}</p>
                              <p className="text-sm font-semibold text-primary-600">R$ {price.toFixed(2)}</p>
                            </div>
                          </button>
                        )
                      })}
                      <button
                        type="submit"
                        className="w-full p-3 text-sm text-primary-600 font-medium hover:bg-gray-50 border-t border-gray-100"
                      >
                        Ver todos os resultados
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum produto encontrado</div>
                  )}
                </div>
              )}
            </div>
          </form>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="text-gray-500 hover:text-primary-600 transition-colors">
              <i className="fa-regular fa-user text-lg sm:text-[22px]"></i>
            </button>

            <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
              <i className="fa-solid fa-cart-shopping text-lg sm:text-[22px]"></i>
              <span className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-primary-600 text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-semibold">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
