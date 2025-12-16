import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getItems, getLayout, getMenu, getSubcategoryName, getAllItemsByCategory } from '../services/api'
import { getProductImageUrl } from '../utils/imageUrl'

function getDescriptionPreview(html, maxLength = 120) {
  if (!html) return ''
  const firstPart = html.split(/<br\s*\/?>/i)[0]
  const text = firstPart
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Pegar o ID da categoria da URL
  const categoryId = searchParams.get('id')
  
  const [allProducts, setAllProducts] = useState([])
  const [allProductsForSubcats, setAllProductsForSubcats] = useState([]) // Todos os produtos para extrair subcategorias
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryTitle, setCategoryTitle] = useState('')
  const [page, setPage] = useState(1)
  const [totalFromApi, setTotalFromApi] = useState(0)
  const [subcategoryNames, setSubcategoryNames] = useState({})
  
  // Filtros
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recents')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcat') || '')
  
  // Filtro de preço - valores do input (não aplicados ainda)
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('min') || '')
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('max') || '')
  
  // Filtro de preço - valores aplicados
  const [appliedMinPrice, setAppliedMinPrice] = useState(searchParams.get('min') || '')
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(searchParams.get('max') || '')
  
  const limit = 30
  
  // Extrair subcategorias únicas dos produtos
  const [subcategories, setSubcategories] = useState([])
  
  useEffect(() => {
    async function fetchSubcategoryNames() {
      // Criar mapa de subcategory_id -> produto com esse subcategory
      const subcatToProduct = {}
      allProductsForSubcats.forEach(product => {
        const subcatId = product.main_subcategory
        let id
        
        if (subcatId && typeof subcatId === 'object' && subcatId.id) {
          id = subcatId.id
        } else if (subcatId && typeof subcatId === 'string') {
          id = subcatId
        }
        
        if (id && !subcatToProduct[id]) {
          subcatToProduct[id] = product.slug
        }
      })
      
      const uniqueSubcatIds = Object.keys(subcatToProduct)
      
      // Buscar nomes das subcategorias
      const subcatsWithNames = await Promise.all(
        uniqueSubcatIds.map(async (id) => {
          // Primeiro tentar do mapa de nomes
          if (subcategoryNames[id]) {
            return { id, title: subcategoryNames[id] }
          }
          // Se não encontrar, buscar da API usando o slug do produto
          const productSlug = subcatToProduct[id]
          const name = await getSubcategoryName(id, productSlug)
          return { id, title: name || id }
        })
      )
      
      setSubcategories(subcatsWithNames.sort((a, b) => a.title.localeCompare(b.title)))
    }
    
    if (allProductsForSubcats.length > 0) {
      fetchSubcategoryNames()
    }
  }, [allProductsForSubcats, subcategoryNames])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        // Buscar título da categoria do layout e nomes das subcategorias do menu
        const [layout, menu] = await Promise.all([getLayout(), getMenu()])
        
        // Criar mapa de IDs para nomes de subcategorias
        const namesMap = {}
        menu.forEach(cat => {
          namesMap[cat.id] = cat.title
          if (cat.subcategories) {
            cat.subcategories.forEach(sub => {
              namesMap[sub.id] = sub.title
            })
          }
        })
        setSubcategoryNames(namesMap)
        
        const collections = layout.collection_items || []
        const collection = collections.find(c => c.slug === slug)
        
        if (collection) {
          setCategoryTitle(collection.title)
        } else {
          setCategoryTitle(slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Categoria')
        }
        
        // Buscar produtos da API com category_id
        if (categoryId) {
          const options = { categoryId }
          if (sortBy && sortBy !== 'recents') {
            options.sort = sortBy
          }
          
          // Sempre buscar todos os produtos para extrair subcategorias (apenas uma vez)
          if (allProductsForSubcats.length === 0) {
            const allData = await getAllItemsByCategory(categoryId, 500)
            setAllProductsForSubcats(allData.products || [])
          }
          
          // Se há filtros locais ativos, buscar TODOS os produtos para filtrar localmente
          const hasFilters = appliedMinPrice || appliedMaxPrice || selectedSubcategory
          
          if (hasFilters) {
            // Buscar todos os produtos da categoria para filtrar localmente
            const data = await getAllItemsByCategory(categoryId, 500)
            setAllProducts(data.products || [])
            setTotalFromApi(data.total || 0)
          } else {
            // Sem filtros: usar paginação da API
            const data = await getItems(page, limit, options)
            setAllProducts(data.products || [])
            setTotalFromApi(data.total || 0)
          }
        } else {
          // Fallback para items do layout se não tiver ID
          setAllProducts(collection?.items || [])
          setAllProductsForSubcats(collection?.items || [])
          setTotalFromApi(collection?.items?.length || 0)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [slug, categoryId, page, sortBy, appliedMinPrice, appliedMaxPrice, selectedSubcategory])

  // Ordenar produtos
  const sortProducts = (products) => {
    const sorted = [...products]
    switch (sortBy) {
      case 'nameaz':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      case 'nameza':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      case 'pricemin':
        return sorted.sort((a, b) => {
          const priceA = a.min_price_valid || a.prices?.[0]?.promo_price || a.prices?.[0]?.price || 0
          const priceB = b.min_price_valid || b.prices?.[0]?.promo_price || b.prices?.[0]?.price || 0
          return priceA - priceB
        })
      case 'pricemax':
        return sorted.sort((a, b) => {
          const priceA = a.min_price_valid || a.prices?.[0]?.promo_price || a.prices?.[0]?.price || 0
          const priceB = b.min_price_valid || b.prices?.[0]?.promo_price || b.prices?.[0]?.price || 0
          return priceB - priceA
        })
      default:
        return sorted
    }
  }

  // Filtrar por preço e subcategoria localmente
  const filteredProducts = sortProducts(allProducts.filter(product => {
    const price = product.min_price_valid || product.prices?.[0]?.price || 0
    if (appliedMinPrice && price < parseFloat(appliedMinPrice)) return false
    if (appliedMaxPrice && price > parseFloat(appliedMaxPrice)) return false
    
    // Filtro por subcategoria
    if (selectedSubcategory) {
      const productSubcat = product.main_subcategory
      const subcatId = typeof productSubcat === 'object' ? productSubcat?.id : productSubcat
      if (subcatId !== selectedSubcategory) return false
    }
    
    return true
  }))
  
  // Verificar se há filtros locais ativos
  const hasLocalFilters = appliedMinPrice || appliedMaxPrice || selectedSubcategory
  
  // Total de produtos na categoria
  const totalInCategory = totalFromApi || allProducts.length
  
  // Total de produtos após filtros locais
  const totalFiltered = filteredProducts.length
  
  // Quando há filtros locais: paginar localmente sobre os produtos filtrados
  // Quando não há filtros: a API já retorna paginado
  const displayTotal = hasLocalFilters ? totalFiltered : totalInCategory
  const totalPages = Math.ceil(displayTotal / limit)
  
  // Produtos da página atual
  const startIndex = (page - 1) * limit
  const paginatedProducts = hasLocalFilters 
    ? filteredProducts.slice(startIndex, startIndex + limit)
    : allProducts // Quando sem filtros, allProducts já vem paginado da API

  const handleSortChange = (value) => {
    setSortBy(value)
    setPage(1)
    setSearchParams(prev => {
      prev.set('sort', value)
      return prev
    })
  }

  const handlePriceFilter = () => {
    // Aplicar os valores do input
    setAppliedMinPrice(minPriceInput)
    setAppliedMaxPrice(maxPriceInput)
    setSearchParams(prev => {
      if (minPriceInput) prev.set('min', minPriceInput)
      else prev.delete('min')
      if (maxPriceInput) prev.set('max', maxPriceInput)
      else prev.delete('max')
      return prev
    })
  }

  const clearFilters = () => {
    setMinPriceInput('')
    setMaxPriceInput('')
    setAppliedMinPrice('')
    setAppliedMaxPrice('')
    setSortBy('recents')
    setViewMode('grid')
    setSelectedSubcategory('')
    const id = searchParams.get('id')
    if (id) {
      setSearchParams({ id })
    } else {
      setSearchParams({})
    }
  }
  
  const handleSubcategoryChange = (subcatId) => {
    setSelectedSubcategory(subcatId)
    setPage(1)
    setSearchParams(prev => {
      if (subcatId) {
        prev.set('subcat', subcatId)
      } else {
        prev.delete('subcat')
      }
      return prev
    })
  }

  const formatUnit = (unitType) => {
    const units = { 'KG': '/kg', 'UNI': '/un' }
    return units[unitType] || '/un'
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da categoria */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs"></i>
            <span className="text-gray-800">{categoryTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{categoryTitle}</h1>
          <p className="text-gray-500 mt-1">
            {hasLocalFilters ? (
              <>{displayTotal} produtos encontrados <span className="text-gray-400">(de {totalInCategory} no total)</span></>
            ) : (
              <>{displayTotal} produtos encontrados</>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Filtros</h3>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Limpar
                </button>
              </div>

              {/* Subcategorias */}
              {subcategories.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategoria
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => handleSubcategoryChange('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedSubcategory 
                          ? 'bg-primary-100 text-primary-700 font-medium' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      Todas
                    </button>
                    {subcategories.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleSubcategoryChange(subcat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedSubcategory === subcat.id 
                            ? 'bg-primary-100 text-primary-700 font-medium' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {subcat.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ordenação */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recents">Mais recentes</option>
                  <option value="nameaz">Nome (A-Z)</option>
                  <option value="nameza">Nome (Z-A)</option>
                  <option value="pricemin">Menor preço</option>
                  <option value="pricemax">Maior preço</option>
                  <option value="top_sellers">Mais vendidos</option>
                </select>
              </div>

              {/* Filtro de preço */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de preço
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceFilter()}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Preço mínimo"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceFilter()}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Preço máximo"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="w-full bg-primary-500 text-white text-sm py-2 rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Aplicar
                </button>
                {(appliedMinPrice || appliedMaxPrice) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Filtro ativo: {appliedMinPrice && `R$ ${appliedMinPrice}`} {appliedMinPrice && appliedMaxPrice && '-'} {appliedMaxPrice && `R$ ${appliedMaxPrice}`}
                  </p>
                )}
              </div>

              {/* Visualização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visualização
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-pressed={viewMode === 'grid'}
                    aria-label="Visualização em grade"
                  >
                    <i className="fa-solid fa-grid-2 mr-1" aria-hidden="true"></i> Grade
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      viewMode === 'list' 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-pressed={viewMode === 'list'}
                    aria-label="Visualização em lista"
                  >
                    <i className="fa-solid fa-list mr-1" aria-hidden="true"></i> Lista
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de produtos */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <i className="fa-solid fa-spinner fa-spin text-3xl text-primary-500 mb-4"></i>
                  <p className="text-gray-500">Carregando produtos...</p>
                </div>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <i className="fa-solid fa-box-open text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">Nenhum produto encontrado</p>
                  <button 
                    onClick={clearFilters}
                    className="mt-4 text-primary-600 hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Visualização em Grade */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedProducts.map((product) => {
                      const photo = product.images?.[0] || ''
                      const originalPrice = product.prices?.[0]?.price || 0
                      const promoPrice = product.prices?.[0]?.promo_price
                      const finalPrice = product.min_price_valid || originalPrice
                      const hasDiscount = promoPrice && promoPrice < originalPrice
                      const discountPercent = hasDiscount ? Math.round((1 - promoPrice / originalPrice) * 100) : 0
                      const unit = formatUnit(product.unit_type)

                      return (
                        <Link
                          key={product.id}
                          to={`/produto/${product.slug}`}
                          className="group bg-white rounded-2xl p-4 relative border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                          {hasDiscount && (
                            <span className="absolute top-3 left-3 z-10 bg-primary-500 text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
                              -{discountPercent}%
                            </span>
                          )}
                          
                          <div className="relative mb-3">
                            <img
                              src={getProductImageUrl(photo, 'medium')}
                              alt={product.name}
                              className="w-full h-32 sm:h-40 object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            
                            <button 
                              className="absolute bottom-0 right-0 w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onClick={(e) => {
                                e.preventDefault()
                              }}
                              aria-label={`Adicionar ${product.name} ao carrinho`}
                            >
                              <i className="fa-solid fa-plus text-sm" aria-hidden="true"></i>
                            </button>
                          </div>
                          
                          <h3 className="font-medium text-sm text-gray-700 line-clamp-2 mb-2 flex-grow">
                            {product.name}
                          </h3>
                          
                          <div className="mt-auto">
                            {hasDiscount && (
                              <p className="text-gray-400 text-xs line-through">
                                R$ {originalPrice.toFixed(2)}
                              </p>
                            )}
                            <p className="text-gray-900 font-bold text-lg">
                              R$ {(hasDiscount ? promoPrice : finalPrice).toFixed(2)}
                              <span className="text-gray-400 font-normal text-xs ml-0.5">{unit}</span>
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Visualização em Lista */}
                {viewMode === 'list' && (
                  <div className="flex flex-col gap-3">
                    {paginatedProducts.map((product) => {
                      const photo = product.images?.[0] || ''
                      const originalPrice = product.prices?.[0]?.price || 0
                      const promoPrice = product.prices?.[0]?.promo_price
                      const finalPrice = product.min_price_valid || originalPrice
                      const hasDiscount = promoPrice && promoPrice < originalPrice
                      const discountPercent = hasDiscount ? Math.round((1 - promoPrice / originalPrice) * 100) : 0
                      const unit = formatUnit(product.unit_type)

                      return (
                        <Link
                          key={product.id}
                          to={`/produto/${product.slug}`}
                          className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex gap-4 h-36 sm:h-40"
                        >
                          <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32">
                            {hasDiscount && (
                              <span className="absolute top-1 left-1 z-10 bg-primary-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                                -{discountPercent}%
                              </span>
                            )}
                            <img
                              src={getProductImageUrl(photo, 'small')}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <h3 className="font-medium text-base sm:text-lg text-gray-800 line-clamp-2 mb-1">
                                {product.name}
                              </h3>
                              {product.brand && (
                                <p className="text-sm text-primary-600 font-medium mb-1">{product.brand}</p>
                              )}
                              {product.description && (
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                                  {getDescriptionPreview(product.description, 100)}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-end justify-between mt-2 sm:mt-3">
                              <div>
                                {hasDiscount && (
                                  <p className="text-gray-400 text-xs line-through">
                                    R$ {originalPrice.toFixed(2)}
                                  </p>
                                )}
                                <p className="text-gray-900 font-bold text-lg sm:text-xl">
                                  R$ {(hasDiscount ? promoPrice : finalPrice).toFixed(2)}
                                  <span className="text-gray-400 font-normal text-xs ml-0.5">{unit}</span>
                                </p>
                              </div>
                              
                              <button 
                                className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onClick={(e) => {
                                  e.preventDefault()
                                }}
                                aria-label={`Adicionar ${product.name} ao carrinho`}
                              >
                                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                              </button>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      aria-label="Página anterior"
                    >
                      <i className="fa-solid fa-chevron-left mr-2" aria-hidden="true"></i>
                      Anterior
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              page === pageNum 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                            aria-label={`Página ${pageNum}`}
                            aria-current={page === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      aria-label="Próxima página"
                    >
                      Próxima
                      <i className="fa-solid fa-chevron-right ml-2" aria-hidden="true"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
