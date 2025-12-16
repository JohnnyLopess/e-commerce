import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import * as api from '../services/api'

vi.mock('../services/api')

const mockItemsResponse = {
  products: [
    {
      id: 'all1',
      name: 'Produto Geral',
      slug: 'produto-geral',
      images: ['geral.jpg'],
      prices: [{ price: 15.00 }],
      unit_type: 'un'
    }
  ],
  total: 1,
  page: 1,
  limit: 200
}

const mockLayout = {
  banners: [
    { id: '1', image: 'banner1.jpg', is_desktop: true, is_mobile: false, is_mini: false },
    { id: '2', image: 'banner2.jpg', is_desktop: false, is_mobile: true, is_mini: false },
    { id: '3', image: 'mini1.jpg', is_desktop: false, is_mobile: false, is_mini: true }
  ],
  promo: [
    {
      id: 'p1',
      name: 'Produto Promoção',
      slug: 'produto-promocao',
      images: ['prod1.jpg'],
      prices: [{ price: 10.00, promo_price: 8.00 }],
      unit_type: 'un'
    }
  ],
  collection_items: [
    {
      id: 'c1',
      title: 'Bebidas Alcoólicas',
      slug: 'bebidas-alcoolicas',
      items: [
        {
          id: 'i1',
          name: 'Cerveja',
          slug: 'cerveja',
          images: ['cerveja.jpg'],
          prices: [{ price: 5.00 }],
          unit_type: 'un'
        }
      ]
    }
  ]
}

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    api.getLayout.mockImplementation(() => new Promise(() => {}))
    
    renderWithRouter(<HomePage />)
    
    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument()
  })

  it('deve exibir produtos promocionais após carregar', async () => {
    api.getLayout.mockResolvedValue(mockLayout)
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Ofertas do dia')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Produto Promoção')).toBeInTheDocument()
  })

  it('deve exibir categorias com ícones', async () => {
    api.getLayout.mockResolvedValue(mockLayout)
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Bebidas Alcoólicas').length).toBeGreaterThan(0)
    })
  })

  it('deve exibir badge de desconto quando produto tem promoção', async () => {
    api.getLayout.mockResolvedValue(mockLayout)
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('-20%')).toBeInTheDocument()
    })
  })

  it('deve exibir preço com unidade', async () => {
    api.getLayout.mockResolvedValue(mockLayout)
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('R$ 8.00')).toBeInTheDocument()
    })
  })

  it('deve exibir setas de navegação nas seções', async () => {
    api.getLayout.mockResolvedValue(mockLayout)
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      // Verifica se existem botões de navegação (setas)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('deve exibir categoria Ofertas na lista de categorias', async () => {
    api.getLayout.mockResolvedValue(mockLayout)
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Ofertas')).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem de erro quando API falha', async () => {
    api.getLayout.mockRejectedValue(new Error('Erro na API'))
    
    renderWithRouter(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Erro na API/i)).toBeInTheDocument()
    })
  })
})
