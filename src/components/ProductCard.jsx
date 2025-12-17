import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getProductImageUrl } from '../utils/imageUrl'
import { useProduct } from '../hooks/useProduct'

function ProductCard({ product, isFromOfferSection = false }) {
  const [showQuantitySelector, setShowQuantitySelector] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState(0.5)

  const photo = product.images?.[0] || ''
  
  // Usar hook centralizado para lógica de produto
  const {
    originalPrice,
    promoPrice,
    finalPrice,
    hasDiscount,
    unit,
    isWeightBased,
    isUnavailable,
    badgeType,
    badgeText,
    badgeColor,
  } = useProduct(product, { isFromOfferSection })

  const handleDecrease = () => {
    if (isWeightBased) {
      if (weight > 0.25) setWeight(w => Math.round((w - 0.25) * 100) / 100)
    } else {
      if (quantity > 1) setQuantity(q => q - 1)
    }
  }

  const handleIncrease = () => {
    if (isWeightBased) {
      setWeight(w => Math.round((w + 0.25) * 100) / 100)
    } else {
      setQuantity(q => q + 1)
    }
  }

  const getDisplayQuantity = () => {
    if (isWeightBased) {
      return `${weight.toFixed(2).replace('.', ',')} kg`
    }
    return quantity
  }

  const handleAddToCart = () => {
    // TODO: Implementar lógica do carrinho
    console.log('Adicionado ao carrinho:', {
      product: product.name,
      quantity: isWeightBased ? weight : quantity,
      unit: isWeightBased ? 'kg' : 'un'
    })
    setShowQuantitySelector(false)
    // Reset para próxima vez
    setQuantity(1)
    setWeight(0.5)
  }

  return (
    <article
      className={`group bg-white rounded-2xl p-3 sm:p-4 flex-shrink-0 w-[calc(50%-6px)] sm:w-44 md:w-48 h-[260px] sm:h-[300px] md:h-[320px] relative border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex flex-col ${isUnavailable ? 'opacity-75' : ''}`}
      role="listitem"
    >
      {/* Badge única usando hook */}
      {badgeType && (
        <span 
          className={`absolute top-3 left-3 z-10 ${badgeColor} text-white text-[10px] font-semibold px-2 py-1 rounded-lg`}
          aria-label={badgeText}
        >
          {badgeText}
        </span>
      )}
      
      <Link 
        to={`/produto/${product.slug}${isFromOfferSection ? '?offer=true' : ''}`}
        className="flex flex-col flex-grow focus:outline-none rounded-lg"
        aria-label={`Ver detalhes de ${product.name}, R$ ${(hasDiscount ? promoPrice : finalPrice).toFixed(2)}`}
      >
        <div className="relative mb-3 flex-shrink-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={getProductImageUrl(photo, 'medium')} />
            <img
              src={getProductImageUrl(photo, 'small')}
              alt=""
              className={`w-full h-24 sm:h-28 md:h-32 object-contain transition-transform duration-300 ${isUnavailable ? 'grayscale' : 'group-hover:scale-105'}`}
              loading="lazy"
            />
          </picture>
        </div>
        
        {product.brand && (
          <p className="text-primary-600 text-[10px] sm:text-xs font-medium mb-0.5 truncate">{product.brand}</p>
        )}
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
            <span className="text-gray-400 font-normal text-[10px] sm:text-xs ml-0.5">{unit}</span>
          </p>
        </div>
      </Link>
      
      {/* Botão de adicionar ao carrinho */}
      {!showQuantitySelector ? (
        isUnavailable ? (
          <div
            className="absolute bottom-3 right-3 w-8 h-8 sm:w-9 sm:h-9 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center cursor-not-allowed"
            aria-label="Produto indisponível"
            title="Produto indisponível"
          >
            <i className="fa-solid fa-ban text-sm" aria-hidden="true"></i>
          </div>
        ) : (
          <button
            className="absolute bottom-3 right-3 w-8 h-8 sm:w-9 sm:h-9 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowQuantitySelector(true)
            }}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <i className="fa-solid fa-cart-plus text-xs" aria-hidden="true"></i>
          </button>
        )
      ) : (
        /* Mini seletor de quantidade */
        <div 
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-b-2xl p-2 shadow-lg z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={isWeightBased ? weight <= 0.25 : quantity <= 1}
              className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Diminuir"
            >
              <i className="fa-solid fa-minus text-xs"></i>
            </button>
            
            <span className="text-xs font-semibold whitespace-nowrap">
              {getDisplayQuantity()}
            </span>
            
            <button
              onClick={handleIncrease}
              className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Aumentar"
            >
              <i className="fa-solid fa-plus text-xs"></i>
            </button>
            
            <button
              onClick={handleAddToCart}
              className="w-7 h-7 flex-shrink-0 rounded-full bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
              aria-label="Confirmar"
            >
              <i className="fa-solid fa-check text-xs"></i>
            </button>
            
            <button
              onClick={() => {
                setShowQuantitySelector(false)
                setQuantity(1)
                setWeight(0.5)
              }}
              className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Cancelar"
            >
              <i className="fa-solid fa-times text-xs"></i>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export default ProductCard
