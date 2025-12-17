/**
 * Hook para centralizar lógica de produto: preços, badges, estoque, unidades
 * @param {Object} product - Objeto do produto da API
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.isFromOfferSection - Se o produto vem da seção de ofertas
 * @returns {Object} Dados processados do produto
 */
export function useProduct(product, options = {}) {
  const { isFromOfferSection = false } = options

  if (!product) {
    return {
      // Preços
      originalPrice: 0,
      promoPrice: null,
      finalPrice: 0,
      hasDiscount: false,
      discountPercent: 0,
      
      // Unidade
      unit: '/un',
      isWeightBased: false,
      
      // Estoque
      stockBalance: null,
      isBlocked: false,
      isOutOfStock: false,
      isUnavailable: false,
      
      // Badges
      showDiscountBadge: false,
      showOfferBadge: false,
      showUnavailableBadge: false,
      badgeType: null, // 'discount' | 'offer' | 'unavailable' | null
      badgeText: null,
      badgeColor: null,
    }
  }

  // Preços
  const originalPrice = product.prices?.[0]?.price || 0
  const promoPrice = product.prices?.[0]?.promo_price
  const finalPrice = product.min_price_valid || originalPrice
  const hasDiscount = promoPrice && promoPrice < originalPrice
  const discountPercent = hasDiscount ? Math.round((1 - promoPrice / originalPrice) * 100) : 0

  // Unidade
  const formatUnit = (unitType) => {
    const type = unitType?.toUpperCase()
    const units = {
      'O': '/kg',
      'K': '/kg',
      'KG': '/kg',
      'U': '/un',
      'UN': '/un',
      'L': '/L',
      'M': '/m'
    }
    return units[type] || '/un'
  }
  
  const unit = formatUnit(product.unit_type)
  const isWeightBased = ['O', 'K', 'KG'].includes(product.unit_type?.toUpperCase())

  // Estoque
  const stockBalance = product.stock_infos?.stock_balance ?? product.prices?.[0]?.qtd_stock ?? null
  const isBlocked = product.block_sale === true
  const isOutOfStock = stockBalance !== null && stockBalance <= 0
  const isUnavailable = isBlocked || isOutOfStock

  // Badges - lógica centralizada
  const showUnavailableBadge = isUnavailable
  const showDiscountBadge = hasDiscount && !isUnavailable
  // Mostrar badge "Oferta" APENAS quando isFromOfferSection=true (produto vem da seção de ofertas)
  // E não tem desconto calculável E não está indisponível
  const showOfferBadge = isFromOfferSection && !hasDiscount && !isUnavailable

  // Determinar qual badge mostrar (prioridade: indisponível > desconto > oferta)
  let badgeType = null
  let badgeText = null
  let badgeColor = null

  if (showUnavailableBadge) {
    badgeType = 'unavailable'
    badgeText = 'Indisponível'
    badgeColor = 'bg-gray-500'
  } else if (showDiscountBadge) {
    badgeType = 'discount'
    badgeText = `-${discountPercent}%`
    badgeColor = 'bg-primary-500'
  } else if (showOfferBadge) {
    badgeType = 'offer'
    badgeText = 'Oferta'
    badgeColor = 'bg-orange-500'
  }

  return {
    // Preços
    originalPrice,
    promoPrice,
    finalPrice,
    hasDiscount,
    discountPercent,
    
    // Unidade
    unit,
    isWeightBased,
    
    // Estoque
    stockBalance,
    isBlocked,
    isOutOfStock,
    isUnavailable,
    
    // Badges
    showDiscountBadge,
    showOfferBadge,
    showUnavailableBadge,
    badgeType,
    badgeText,
    badgeColor,
  }
}

export default useProduct
