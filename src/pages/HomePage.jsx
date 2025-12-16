import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLayout, getItems } from '../services/api'
import { getBannerUrl, getProductImageUrl } from '../utils/imageUrl'

function HomePage() {
  const [layout, setLayout] = useState(null)
  const [categoryTotals, setCategoryTotals] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const layoutData = await getLayout()
        setLayout(layoutData)
        
        // Buscar quantidade total de produtos por categoria usando category_id
        const categories = layoutData.collection_items || []
        const totals = {}
        
        await Promise.all(
          categories.map(async (category) => {
            try {
              const data = await getItems(1, 1, { categoryId: category.id })
              totals[category.slug] = data.total || category.items?.length || 0
            } catch {
              totals[category.slug] = category.items?.length || 0
            }
          })
        )
        
        setCategoryTotals(totals)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const desktopBanners = layout?.banners?.filter(b => b.is_desktop) || []
  const mobileBanners = layout?.banners?.filter(b => b.is_mobile) || []
  const miniBanners = layout?.banners?.filter(b => b.is_mini) || []
  
  // Se não tiver banners mobile suficientes, usa os desktop
  const activeMobileBanners = mobileBanners.length > 1 ? mobileBanners : desktopBanners

  useEffect(() => {
    if (desktopBanners.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % desktopBanners.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [desktopBanners.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
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

  const promoProducts = layout?.promo || []
  const collections = layout?.collection_items || []

  const categoryIcons = {
    'Açougue / Aves / Peixaria': { icon: 'fa-drumstick-bite', color: 'bg-red-100 text-red-500' },
    'Frios e Laticínios': { icon: 'fa-cheese', color: 'bg-yellow-100 text-yellow-600' },
    'Bebidas Alcoólicas': { icon: 'fa-wine-bottle', color: 'bg-purple-100 text-purple-500' },
    'Bebidas Não Alcoólicas': { icon: 'fa-bottle-water', color: 'bg-blue-100 text-blue-500' },
    'Alimentos Básicos': { icon: 'fa-wheat-awn', color: 'bg-amber-100 text-amber-600' },
    'Mercearia': { icon: 'fa-basket-shopping', color: 'bg-orange-100 text-orange-500' },
    'Frutas, Legumes e Verduras': { icon: 'fa-carrot', color: 'bg-green-100 text-green-500' },
    'Biscoitos e Aperitivos': { icon: 'fa-cookie', color: 'bg-yellow-100 text-yellow-700' },
    'Condimentos e Molhos': { icon: 'fa-pepper-hot', color: 'bg-red-100 text-red-400' },
    'Doces': { icon: 'fa-candy-cane', color: 'bg-pink-100 text-pink-500' },
    'Congelados': { icon: 'fa-snowflake', color: 'bg-cyan-100 text-cyan-500' },
    'Higiene e Perfumaria': { icon: 'fa-pump-soap', color: 'bg-violet-100 text-violet-500' },
    'Limpeza': { icon: 'fa-spray-can-sparkles', color: 'bg-sky-100 text-sky-500' },
    'Padaria': { icon: 'fa-bread-slice', color: 'bg-amber-100 text-amber-700' },
    'Outros': { icon: 'fa-box', color: 'bg-gray-100 text-gray-500' },
    'Bebês': { icon: 'fa-baby', color: 'bg-pink-100 text-pink-400' },
    'Artigos para o Lar': { icon: 'fa-house', color: 'bg-teal-100 text-teal-500' }
  }

  const getCategoryIcon = (title) => {
    return categoryIcons[title] || { icon: 'fa-tag', color: 'bg-gray-100 text-gray-500' }
  }

  const formatUnit = (unitType) => {
    const units = {
      'KG': '/kg',
      'UNI': '/un'
    }
    return units[unitType] || ''
  }

  const renderProductCard = (product) => {
    const photo = product.images?.[0] || ''
    const originalPrice = product.prices?.[0]?.price || 0
    const promoPrice = product.prices?.[0]?.promo_price
    const finalPrice = product.min_price_valid || originalPrice
    const hasDiscount = promoPrice && promoPrice < originalPrice
    const discountPercent = hasDiscount ? Math.round((1 - promoPrice / originalPrice) * 100) : 0
    const unit = formatUnit(product.unit_type)
    
    return (
      <article
        key={product.id}
        className="group bg-white rounded-2xl p-3 sm:p-4 flex-shrink-0 w-[160px] sm:w-44 md:w-48 h-[280px] sm:h-[300px] md:h-[320px] relative border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex flex-col"
        role="listitem"
      >
        {hasDiscount && (
          <span 
            className="absolute top-3 left-3 z-10 bg-primary-500 text-white text-[10px] font-semibold px-2 py-1 rounded-lg"
            aria-label={`Desconto de ${discountPercent}%`}
          >
            -{discountPercent}%
          </span>
        )}
        
        <Link 
          to={`/produto/${product.slug}`}
          className="flex flex-col flex-grow focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          aria-label={`Ver detalhes de ${product.name}, R$ ${(hasDiscount ? promoPrice : finalPrice).toFixed(2)}`}
        >
          <div className="relative mb-3 flex-shrink-0">
            <picture>
              <source media="(min-width: 768px)" srcSet={getProductImageUrl(photo, 'medium')} />
              <img
                src={getProductImageUrl(photo, 'small')}
                alt=""
                className="w-full h-24 sm:h-28 md:h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </picture>
          </div>
          
          <h3 className="font-medium text-[11px] sm:text-xs md:text-sm text-gray-700 line-clamp-2 mb-2 flex-grow">
            {product.name}
          </h3>
          
          <div className="mt-auto">
            {hasDiscount && (
              <p className="text-gray-400 text-[10px] sm:text-xs line-through" aria-label={`Preço original: R$ ${originalPrice.toFixed(2)}`}>
                R$ {originalPrice.toFixed(2)}
              </p>
            )}
            <p className="text-gray-900 font-bold text-sm sm:text-base md:text-lg">
              <span className="sr-only">Preço: </span>
              R$ {(hasDiscount ? promoPrice : finalPrice).toFixed(2)}
              <span className="text-gray-400 font-normal text-[10px] sm:text-xs ml-0.5">{unit || '/un'}</span>
            </p>
          </div>
        </Link>
        
        <button 
          className="absolute bottom-3 right-3 w-8 h-8 sm:w-9 sm:h-9 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-label={`Adicionar ${product.name} ao carrinho`}
        >
          <i className="fa-solid fa-plus text-sm" aria-hidden="true"></i>
        </button>
      </article>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {(desktopBanners.length > 0 || mobileBanners.length > 0) && (
        <section className="relative">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
            {/* Mobile/Tablet Banners - Swipe to navigate */}
            <div className="block md:hidden">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory rounded-xl">
                {activeMobileBanners.map((banner) => (
                  <img
                    key={banner.id}
                    src={getBannerUrl(banner.image)}
                    alt={banner.title || 'Banner'}
                    className="w-full h-auto object-contain flex-shrink-0 snap-center"
                  />
                ))}
              </div>
            </div>

            {/* Desktop Banners */}
            <div className="hidden md:block">
              <div className="relative overflow-hidden rounded-2xl group">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                >
                  {desktopBanners.map((banner) => (
                    <img
                      key={banner.id}
                      src={getBannerUrl(banner.image)}
                      alt={banner.title || 'Banner'}
                      className="w-full h-auto object-contain flex-shrink-0"
                    />
                  ))}
                </div>
                
                {desktopBanners.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentBanner((prev) => (prev - 1 + desktopBanners.length) % desktopBanners.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <i className="fa-solid fa-chevron-left text-gray-700 text-sm"></i>
                    </button>
                    <button
                      onClick={() => setCurrentBanner((prev) => (prev + 1) % desktopBanners.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <i className="fa-solid fa-chevron-right text-gray-700 text-sm"></i>
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {desktopBanners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBanner(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentBanner ? 'bg-white w-6' : 'bg-white/50 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {miniBanners.length > 0 && (
        <section className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 pb-6">
            <div className="grid grid-cols-3 gap-4">
              {miniBanners.map((banner) => (
                <img
                  key={banner.id}
                  src={getBannerUrl(banner.image)}
                  alt={banner.title || 'Mini Banner'}
                  className="w-full h-auto rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section className="pb-6">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const container = document.getElementById('categories-scroll')
                  container.scrollBy({ left: -200, behavior: 'smooth' })
                }}
                className="hidden md:flex flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <i className="fa-solid fa-chevron-left text-gray-400 text-xs"></i>
              </button>
              
              <div 
                id="categories-scroll"
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
              >
                {promoProducts.length > 0 && (
                  <a
                    href="#ofertas"
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-tags text-primary-500 text-lg sm:text-xl"></i>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-600 text-center whitespace-nowrap">
                      Ofertas
                    </span>
                  </a>
                )}
                {collections.map((category) => {
                  const { icon, color } = getCategoryIcon(category.title)
                  return (
                    <Link
                      key={category.id}
                      to={`/categoria/${category.slug}?id=${category.id}`}
                      className="flex flex-col items-center gap-2 flex-shrink-0 group"
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <i className={`fa-solid ${icon} text-lg sm:text-xl`}></i>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-600 text-center whitespace-nowrap max-w-[60px] sm:max-w-[70px] truncate">
                        {category.title.split('/')[0].trim()}
                      </span>
                    </Link>
                  )
                })}
              </div>
              
              <button
                onClick={() => {
                  const container = document.getElementById('categories-scroll')
                  container.scrollBy({ left: 200, behavior: 'smooth' })
                }}
                className="hidden md:flex flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
              </button>
            </div>
          </div>
        </section>
      )}

      {promoProducts.length > 0 && (
        <section id="ofertas" className="pb-8 sm:pb-10" aria-labelledby="heading-ofertas">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center" aria-hidden="true">
                  <i className="fa-solid fa-tags text-primary-500 text-sm sm:text-base"></i>
                </div>
                <h2 id="heading-ofertas" className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Ofertas do dia</h2>
                <span className="text-gray-400 text-xs sm:text-sm" aria-label={`${promoProducts.length} produtos em oferta`}>
                  ({promoProducts.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const container = document.getElementById('scroll-ofertas')
                    container.scrollBy({ left: -300, behavior: 'smooth' })
                  }}
                  className="hidden md:flex w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Rolar ofertas para a esquerda"
                >
                  <i className="fa-solid fa-chevron-left text-gray-400 text-xs" aria-hidden="true"></i>
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('scroll-ofertas')
                    container.scrollBy({ left: 300, behavior: 'smooth' })
                  }}
                  className="hidden md:flex w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Rolar ofertas para a direita"
                >
                  <i className="fa-solid fa-chevron-right text-gray-400 text-xs" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div 
              id="scroll-ofertas" 
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
              role="list"
              aria-label="Produtos em oferta"
            >
              {promoProducts.map(renderProductCard)}
            </div>
          </div>
        </section>
      )}

      {collections.map((collection) => {
        const { icon, color } = getCategoryIcon(collection.title)
        const products = collection.items || []
        const displayProducts = products.slice(0, 10)
        const totalProducts = categoryTotals[collection.slug] || products.length
        
        if (displayProducts.length === 0) return null
        
        const scrollId = `scroll-${collection.slug}`
        
        return (
          <section 
            key={collection.id} 
            id={collection.slug} 
            className="pb-8 sm:pb-10"
            aria-labelledby={`heading-${collection.slug}`}
          >
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${color.split(' ')[0]} flex items-center justify-center`}
                    aria-hidden="true"
                  >
                    <i className={`fa-solid ${icon} ${color.split(' ')[1]} text-sm sm:text-base`}></i>
                  </div>
                  <h2 
                    id={`heading-${collection.slug}`}
                    className="text-base sm:text-lg md:text-xl font-bold text-gray-800"
                  >
                    {collection.title}
                  </h2>
                  <span className="text-gray-400 text-xs sm:text-sm" aria-label={`${totalProducts} produtos disponíveis`}>
                    ({totalProducts})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const container = document.getElementById(scrollId)
                      container.scrollBy({ left: -300, behavior: 'smooth' })
                    }}
                    className="hidden md:flex w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={`Rolar ${collection.title} para a esquerda`}
                  >
                    <i className="fa-solid fa-chevron-left text-gray-400 text-xs" aria-hidden="true"></i>
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById(scrollId)
                      container.scrollBy({ left: 300, behavior: 'smooth' })
                    }}
                    className="hidden md:flex w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={`Rolar ${collection.title} para a direita`}
                  >
                    <i className="fa-solid fa-chevron-right text-gray-400 text-xs" aria-hidden="true"></i>
                  </button>
                  <Link 
                    to={`/categoria/${collection.slug}?id=${collection.id}`}
                    className="text-primary-600 text-xs sm:text-sm font-medium hover:underline ml-1 sm:ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    aria-label={`Ver todos os ${totalProducts} produtos de ${collection.title}`}
                  >
                    Ver todos →
                  </Link>
                </div>
              </div>
              <div 
                id={scrollId} 
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                role="list"
                aria-label={`Produtos de ${collection.title}`}
              >
                {displayProducts.map(renderProductCard)}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default HomePage
