import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getProduct } from '../services/api'
import { getProductImageUrl } from '../utils/imageUrl'
import { useProduct } from '../hooks/useProduct'

function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isFromOffer = searchParams.get('offer') === 'true'
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState(0.5)

  // Hook deve ser chamado antes de qualquer early return
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
  } = useProduct(product, { isFromOfferSection: isFromOffer })

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(slug)
        setProduct(data)
        setSelectedImage(0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
          <p className="text-lg text-red-500">{error}</p>
          <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Voltar para a Home
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-box-open text-4xl text-gray-400 mb-4"></i>
          <p className="text-lg text-gray-600">Produto não encontrado</p>
          <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Voltar para a Home
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images || []
  const currentImage = images[selectedImage] || ''

  const decreaseQuantity = () => {
    if (isWeightBased) {
      if (weight > 0.25) setWeight(w => Math.round((w - 0.25) * 100) / 100)
    } else {
      if (quantity > 1) setQuantity(q => q - 1)
    }
  }

  const increaseQuantity = () => {
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

  const getTotalPrice = () => {
    const unitPrice = hasDiscount ? promoPrice : finalPrice
    if (isWeightBased) {
      return unitPrice * weight
    }
    return unitPrice * quantity
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-3 text-sm">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1"
              aria-label="Voltar"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <span className="text-gray-300">|</span>
            <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors">
              <i className="fa-solid fa-home"></i>
            </Link>
            <i className="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
            <span className="text-gray-800 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Galeria de Imagens */}
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 relative">
              {/* Badge única usando hook */}
              {badgeType && (
                <span className={`absolute top-6 left-6 sm:top-8 sm:left-8 z-20 ${badgeColor} text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg`}>
                  {badgeText}
                </span>
              )}
              {/* Imagem Principal */}
              <div className={`relative aspect-square bg-white rounded-xl overflow-hidden mb-4 flex items-center justify-center ${isUnavailable ? 'opacity-60' : ''}`}>
                <img
                  src={getProductImageUrl(currentImage, 'large')}
                  alt={product.name}
                  className={`max-w-full max-h-full object-contain p-4 ${isUnavailable ? 'grayscale' : ''}`}
                />
              </div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === index 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getProductImageUrl(img, 'small')}
                        alt={`${product.name} - imagem ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
              {/* Marca */}
              {product.brand && (
                <p className="text-primary-600 font-medium text-sm mb-2">{product.brand}</p>
              )}

              {/* Nome */}
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 break-words">
                {product.name}
              </h1>

              {/* Preço */}
              <div className="mb-6">
                {hasDiscount && (
                  <p className="text-gray-400 line-through text-lg mb-1">
                    R$ {originalPrice.toFixed(2)}
                  </p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    R$ {(hasDiscount ? promoPrice : finalPrice).toFixed(2)}
                  </span>
                  <span className="text-gray-500 text-lg">{unit}</span>
                </div>
                {hasDiscount && (
                  <p className="text-primary-600 font-medium mt-1">
                    Você economiza R$ {(originalPrice - promoPrice).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Quantidade */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isWeightBased ? 'Peso aproximado' : 'Quantidade'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseQuantity}
                    disabled={isWeightBased ? weight <= 0.25 : quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={isWeightBased ? "Diminuir peso" : "Diminuir quantidade"}
                  >
                    <i className="fa-solid fa-minus text-sm"></i>
                  </button>
                  <span className="min-w-[80px] text-center text-lg font-semibold">{getDisplayQuantity()}</span>
                  <button
                    onClick={increaseQuantity}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label={isWeightBased ? "Aumentar peso" : "Aumentar quantidade"}
                  >
                    <i className="fa-solid fa-plus text-sm"></i>
                  </button>
                </div>
                {isWeightBased && (
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    O peso final pode variar. Você será cobrado pelo peso real.
                  </p>
                )}
              </div>

              {/* Botão Adicionar */}
              {isUnavailable ? (
                <button 
                  disabled
                  className="w-full bg-gray-400 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
                >
                  <i className="fa-solid fa-ban"></i>
                  <span>Produto indisponível</span>
                </button>
              ) : (
                <button className="w-full bg-primary-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-primary-500/20">
                  <i className="fa-solid fa-cart-plus"></i>
                  <span>Adicionar ao carrinho</span>
                </button>
              )}

              {/* Total */}
              <p className="text-center text-gray-500 mt-3">
                Total: <span className="font-semibold text-gray-800">R$ {getTotalPrice().toFixed(2)}</span>
              </p>

              {/* Descrição */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-info-circle text-primary-500"></i>
                  Descrição
                </h2>
                {product.description ? (
                  <div 
                    className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-gray-400 text-sm italic">Nenhuma descrição disponível para este produto.</p>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="fa-solid fa-truck text-green-600"></i>
                  </div>
                  <span>Entrega rápida</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fa-solid fa-lock text-blue-600"></i>
                  </div>
                  <span>Compra segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
