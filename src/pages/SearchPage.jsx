import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchProducts } from '../services/api'
import { getProductImageUrl } from '../utils/imageUrl'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const limit = 25

  useEffect(() => {
    async function fetchProducts() {
      if (!query) {
        setProducts([])
        setTotal(0)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await searchProducts(query, page, limit)
        setProducts(data.products || [])
        setTotal(data.total || 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query, page])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Buscando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">
          {products.length > 0 
            ? `Resultados para "${query}" (${total} produtos)`
            : `Nenhum resultado para "${query}"`
          }
        </h1>

        {products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => {
                const photo = product.images?.[0] || ''
                const price = product.min_price_valid || product.prices?.[0]?.price || 0

                return (
                  <Link
                    key={product.id}
                    to={`/produto/${product.slug}`}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={getProductImageUrl(photo, 'medium')}
                      alt={product.name}
                      className="w-full h-32 object-contain mb-3"
                    />
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-primary-600 font-bold">
                      R$ {price.toFixed(2)}
                    </p>
                  </Link>
                )
              })}
            </div>

            {total > limit && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <i className="fa-solid fa-chevron-left mr-2"></i>
                  Anterior
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Página {page} de {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próxima
                  <i className="fa-solid fa-chevron-right ml-2"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
