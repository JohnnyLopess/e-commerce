import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLayout, getProduct } from '../services/api'

describe('API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getLayout', () => {
    it('deve retornar dados do layout com banners, promo e collections', async () => {
      const mockData = {
        data: {
          banners: [{ id: '1', image: 'test.jpg' }],
          promo: [{ id: '2', name: 'Produto Promo' }],
          collection_items: [{ id: '3', title: 'Categoria', items: [] }]
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      )

      const result = await getLayout()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.instabuy.com.br/apiv3/layout?subdomain=supermercado'
      )
      expect(result).toEqual(mockData.data)
      expect(result.banners).toHaveLength(1)
      expect(result.promo).toHaveLength(1)
      expect(result.collection_items).toHaveLength(1)
    })

    it('deve lançar erro quando API retorna status error', async () => {
      const mockError = {
        status: 'error',
        message: 'Erro na API'
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockError)
        })
      )

      await expect(getLayout()).rejects.toThrow('Erro na API')
    })
  })

  describe('getProduct', () => {
    it('deve retornar dados do produto pelo slug', async () => {
      const mockProduct = {
        id: '1',
        name: 'Produto Teste',
        slug: 'produto-teste',
        images: ['img.jpg'],
        min_price_valid: 10.99
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: [mockProduct] })
        })
      )

      const result = await getProduct('produto-teste')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.instabuy.com.br/apiv3/item?subdomain=supermercado&slug=produto-teste'
      )
      expect(result).toEqual(mockProduct)
      expect(result.name).toBe('Produto Teste')
    })

    it('deve retornar null quando produto não existe', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: [] })
        })
      )

      const result = await getProduct('produto-inexistente')

      expect(result).toBeNull()
    })

    it('deve lançar erro quando API retorna status error', async () => {
      const mockError = {
        status: 'error',
        message: 'Produto não encontrado'
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockError)
        })
      )

      await expect(getProduct('slug-invalido')).rejects.toThrow('Produto não encontrado')
    })
  })
})
