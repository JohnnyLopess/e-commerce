import { Link } from 'react-router-dom'
import { getProductImageUrl } from '../utils/imageUrl'
import { useProduct } from '../hooks/useProduct'

function CategoryProductCard({ product, viewMode = 'grid' }) {
  const photo = product.images?.[0] || ''
  
  const {
    originalPrice,
    promoPrice,
    finalPrice,
    hasDiscount,
    unit,
    isUnavailable,
    badgeType,
    badgeText,
    badgeColor,
  } = useProduct(product, { isFromOfferSection: false })

  if (viewMode === 'grid') {
    return (
      <Link
        to={`/produto/${product.slug}`}
        className={`group bg-white rounded-2xl p-4 relative border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex flex-col ${isUnavailable ? 'opacity-75' : ''}`}
      >
        {/* Badge única */}
        {badgeType && (
          <span className={`absolute top-3 left-3 z-10 ${badgeColor} text-white text-[10px] font-semibold px-2 py-1 rounded-lg`}>
            {badgeText}
          </span>
        )}
        
        <div className="relative mb-3">
          <img
            src={getProductImageUrl(photo, 'medium')}
            alt={product.name}
            className={`w-full h-32 sm:h-40 object-contain transition-transform duration-300 ${isUnavailable ? 'grayscale' : 'group-hover:scale-105'}`}
            loading="lazy"
          />
          
          {!isUnavailable ? (
            <button 
              className="absolute bottom-0 right-0 w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={(e) => {
                e.preventDefault()
              }}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <i className="fa-solid fa-cart-plus text-sm" aria-hidden="true"></i>
            </button>
          ) : (
            <div 
              className="absolute bottom-0 right-0 w-9 h-9 bg-gray-400 text-white rounded-full flex items-center justify-center cursor-not-allowed"
              aria-label="Produto indisponível"
            >
              <i className="fa-solid fa-ban text-sm" aria-hidden="true"></i>
            </div>
          )}
        </div>
        
        {product.brand && (
          <p className="text-primary-600 text-[10px] font-medium mb-0.5 truncate">{product.brand}</p>
        )}
        
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
  }

  // Visualização em Lista
  return (
    <Link
      to={`/produto/${product.slug}`}
      className={`group bg-white rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 ${isUnavailable ? 'opacity-75' : ''}`}
    >
      <div className="relative flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28">
        {/* Badge */}
        {badgeType && (
          <span className={`absolute -top-1 -left-1 z-10 ${badgeColor} text-white text-[8px] font-semibold px-1.5 py-0.5 rounded`}>
            {badgeText}
          </span>
        )}
        <img
          src={getProductImageUrl(photo, 'small')}
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-300 ${isUnavailable ? 'grayscale' : 'group-hover:scale-105'}`}
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
        </div>
        
        <div className="flex items-center justify-between gap-2">
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
          
          {!isUnavailable ? (
            <button 
              className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={(e) => {
                e.preventDefault()
              }}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <i className="fa-solid fa-cart-plus" aria-hidden="true"></i>
            </button>
          ) : (
            <div 
              className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center cursor-not-allowed"
              aria-label="Produto indisponível"
            >
              <i className="fa-solid fa-ban" aria-hidden="true"></i>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CategoryProductCard
