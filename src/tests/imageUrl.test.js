import { describe, it, expect } from 'vitest'
import { getBannerUrl, getProductImageUrl } from '../utils/imageUrl'

describe('Image URL Utils', () => {
  describe('getBannerUrl', () => {
    it('deve retornar URL correta do banner', () => {
      const result = getBannerUrl('test-image.jpg')
      
      expect(result).toBe('https://ibassets.com.br/ib.store.banner/bnr-test-image.jpg')
    })
  })

  describe('getProductImageUrl', () => {
    it('deve retornar URL com tamanho medium por padrão', () => {
      const result = getProductImageUrl('product.jpg')
      
      expect(result).toBe('https://ibassets.com.br/ib.item.image.medium/m-product.jpg')
    })

    it('deve retornar URL com tamanho small', () => {
      const result = getProductImageUrl('product.jpg', 'small')
      
      expect(result).toBe('https://ibassets.com.br/ib.item.image.small/s-product.jpg')
    })

    it('deve retornar URL com tamanho big', () => {
      const result = getProductImageUrl('product.jpg', 'big')
      
      expect(result).toBe('https://ibassets.com.br/ib.item.image.big/b-product.jpg')
    })

    it('deve retornar URL com tamanho large', () => {
      const result = getProductImageUrl('product.jpg', 'large')
      
      expect(result).toBe('https://ibassets.com.br/ib.item.image.large/l-product.jpg')
    })
  })
})
