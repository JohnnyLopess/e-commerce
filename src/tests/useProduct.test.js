import { describe, it, expect } from 'vitest'
import { useProduct } from '../hooks/useProduct'

describe('useProduct hook', () => {
  describe('Badges', () => {
    it('deve retornar badgeType null quando produto não tem desconto e não é da seção de ofertas', () => {
      const product = {
        prices: [{ price: 10, promo_price: null }],
        unit_type: 'UN',
      }
      
      const result = useProduct(product, { isFromOfferSection: false })
      
      expect(result.badgeType).toBeNull()
      expect(result.badgeText).toBeNull()
    })

    it('deve retornar badge de desconto quando tem promo_price menor que price', () => {
      const product = {
        prices: [{ price: 10, promo_price: 8 }],
        unit_type: 'UN',
      }
      
      const result = useProduct(product, { isFromOfferSection: false })
      
      expect(result.badgeType).toBe('discount')
      expect(result.badgeText).toBe('-20%')
      expect(result.badgeColor).toBe('bg-primary-500')
      expect(result.hasDiscount).toBe(true)
      expect(result.discountPercent).toBe(20)
    })

    it('deve retornar badge de oferta quando isFromOfferSection=true e não tem desconto', () => {
      const product = {
        prices: [{ price: 10, promo_price: null }],
        unit_type: 'UN',
      }
      
      const result = useProduct(product, { isFromOfferSection: true })
      
      expect(result.badgeType).toBe('offer')
      expect(result.badgeText).toBe('Oferta')
      expect(result.badgeColor).toBe('bg-orange-500')
    })

    it('deve retornar badge de oferta quando isFromOfferSection=true e promo_price igual ao price', () => {
      const product = {
        prices: [{ price: 10, promo_price: 10 }],
        unit_type: 'UN',
      }
      
      // Só mostra oferta quando isFromOfferSection=true
      const result = useProduct(product, { isFromOfferSection: true })
      
      expect(result.badgeType).toBe('offer')
      expect(result.badgeText).toBe('Oferta')
    })

    it('NÃO deve retornar badge de oferta quando isFromOfferSection=false mesmo com promo_price', () => {
      const product = {
        prices: [{ price: 2.29, promo_price: 2.29 }],
        unit_type: 'UN',
      }
      
      const result = useProduct(product, { isFromOfferSection: false })
      
      // Sem isFromOfferSection, não mostra badge de oferta
      expect(result.badgeType).toBeNull()
      expect(result.hasDiscount).toBe(false)
    })

    it('deve retornar badge de desconto mesmo quando isFromOfferSection=true se tem desconto real', () => {
      const product = {
        prices: [{ price: 10, promo_price: 8 }],
        unit_type: 'UN',
      }
      
      const result = useProduct(product, { isFromOfferSection: true })
      
      expect(result.badgeType).toBe('discount')
      expect(result.badgeText).toBe('-20%')
    })

    it('deve retornar badge indisponível quando block_sale=true', () => {
      const product = {
        prices: [{ price: 10, promo_price: 8 }],
        unit_type: 'UN',
        block_sale: true,
      }
      
      const result = useProduct(product, { isFromOfferSection: true })
      
      expect(result.badgeType).toBe('unavailable')
      expect(result.badgeText).toBe('Indisponível')
      expect(result.badgeColor).toBe('bg-gray-500')
      expect(result.isUnavailable).toBe(true)
    })

    it('deve retornar badge indisponível quando estoque é zero', () => {
      const product = {
        prices: [{ price: 10, promo_price: 8, qtd_stock: 0 }],
        unit_type: 'UN',
      }
      
      const result = useProduct(product, { isFromOfferSection: false })
      
      expect(result.badgeType).toBe('unavailable')
      expect(result.isUnavailable).toBe(true)
    })
  })

  describe('Preços', () => {
    it('deve calcular preços corretamente', () => {
      const product = {
        prices: [{ price: 100, promo_price: 80 }],
        min_price_valid: 75,
      }
      
      const result = useProduct(product)
      
      expect(result.originalPrice).toBe(100)
      expect(result.promoPrice).toBe(80)
      expect(result.finalPrice).toBe(75)
      expect(result.hasDiscount).toBe(true)
      expect(result.discountPercent).toBe(20)
    })

    it('deve usar price como finalPrice quando min_price_valid não existe', () => {
      const product = {
        prices: [{ price: 50 }],
      }
      
      const result = useProduct(product)
      
      expect(result.finalPrice).toBe(50)
    })
  })

  describe('Unidades', () => {
    it('deve retornar /kg para unit_type KG', () => {
      const product = { prices: [{ price: 10 }], unit_type: 'KG' }
      const result = useProduct(product)
      
      expect(result.unit).toBe('/kg')
      expect(result.isWeightBased).toBe(true)
    })

    it('deve retornar /kg para unit_type O', () => {
      const product = { prices: [{ price: 10 }], unit_type: 'O' }
      const result = useProduct(product)
      
      expect(result.unit).toBe('/kg')
      expect(result.isWeightBased).toBe(true)
    })

    it('deve retornar /un para unit_type UN', () => {
      const product = { prices: [{ price: 10 }], unit_type: 'UN' }
      const result = useProduct(product)
      
      expect(result.unit).toBe('/un')
      expect(result.isWeightBased).toBe(false)
    })

    it('deve retornar /un como padrão quando unit_type não existe', () => {
      const product = { prices: [{ price: 10 }] }
      const result = useProduct(product)
      
      expect(result.unit).toBe('/un')
    })
  })

  describe('Produto null', () => {
    it('deve retornar valores padrão quando produto é null', () => {
      const result = useProduct(null)
      
      expect(result.originalPrice).toBe(0)
      expect(result.finalPrice).toBe(0)
      expect(result.hasDiscount).toBe(false)
      expect(result.badgeType).toBeNull()
      expect(result.isUnavailable).toBe(false)
      expect(result.unit).toBe('/un')
    })
  })
})
