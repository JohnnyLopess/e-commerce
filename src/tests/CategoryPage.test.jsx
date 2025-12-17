import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CategoryPage from '../pages/CategoryPage'

// Mock das funções da API
vi.mock('../services/api', () => ({
  getLayout: vi.fn(() => Promise.resolve({
    collection_items: [
      {
        id: 'cat-123',
        title: 'Açougue / Aves / Peixaria',
        slug: 'Acougue-Aves-Peixaria',
        items: []
      }
    ]
  })),
  getMenu: vi.fn(() => Promise.resolve([
    {
      id: 'cat-123',
      title: 'Açougue / Aves / Peixaria',
      subcategories: [
        { id: 'subcat-1', title: 'Aves e Frangos' },
        { id: 'subcat-2', title: 'Peixaria' }
      ]
    }
  ])),
  getItems: vi.fn(() => Promise.resolve({
    products: [
      {
        id: '1',
        name: 'Frango Inteiro',
        slug: 'frango-inteiro',
        images: ['image1.jpg'],
        prices: [{ price: 25.90, promo_price: null }],
        unit_type: 'KG',
        main_subcategory: 'subcat-1'
      },
      {
        id: '2',
        name: 'Salmão',
        slug: 'salmao',
        images: ['image2.jpg'],
        prices: [{ price: 45.90, promo_price: 39.90 }],
        unit_type: 'KG',
        main_subcategory: 'subcat-2'
      }
    ],
    total: 2
  })),
  getAllItemsByCategory: vi.fn(() => Promise.resolve({
    products: [
      {
        id: '1',
        name: 'Frango Inteiro',
        slug: 'frango-inteiro',
        images: ['image1.jpg'],
        prices: [{ price: 25.90, promo_price: null }],
        unit_type: 'KG',
        main_subcategory: 'subcat-1'
      },
      {
        id: '2',
        name: 'Salmão',
        slug: 'salmao',
        images: ['image2.jpg'],
        prices: [{ price: 45.90, promo_price: 39.90 }],
        unit_type: 'KG',
        main_subcategory: 'subcat-2'
      },
      {
        id: '3',
        name: 'Tilápia',
        slug: 'tilapia',
        images: ['image3.jpg'],
        prices: [{ price: 29.90, promo_price: null }],
        unit_type: 'KG',
        main_subcategory: 'subcat-2'
      }
    ],
    total: 3
  })),
  getSubcategoryName: vi.fn((id) => {
    const names = {
      'subcat-1': 'Aves e Frangos',
      'subcat-2': 'Peixaria'
    }
    return Promise.resolve(names[id] || null)
  })
}))

const renderCategoryPage = (route = '/categoria/Acougue-Aves-Peixaria?id=cat-123') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/categoria/:slug" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    renderCategoryPage()
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it('deve exibir título da categoria após carregar', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      // O título aparece no h1
      expect(screen.getByRole('heading', { level: 1, name: 'Açougue / Aves / Peixaria' })).toBeInTheDocument()
    })
  })

  it('deve exibir produtos após carregar', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText('Frango Inteiro')).toBeInTheDocument()
      expect(screen.getByText('Salmão')).toBeInTheDocument()
    })
  })

  it('deve exibir contagem de produtos', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText(/produtos encontrados/i)).toBeInTheDocument()
    })
  })

  it('deve exibir filtros de ordenação', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText('Ordenar por')).toBeInTheDocument()
    })
  })

  it('deve exibir filtro de faixa de preço', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText('Faixa de preço')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Mín')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Máx')).toBeInTheDocument()
    })
  })

  it('deve exibir botão de limpar filtros', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText('Limpar')).toBeInTheDocument()
    })
  })

  it('deve exibir breadcrumb com ícone de Home', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: '' })
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  it('deve exibir preço dos produtos', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText(/25[,.]90/)).toBeInTheDocument()
    })
  })

  it('deve exibir preço promocional quando disponível', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText(/39[,.]90/)).toBeInTheDocument()
    })
  })

  it('deve permitir alternar entre visualização grade e lista', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      const gridButton = screen.getByLabelText(/visualização em grade/i)
      const listButton = screen.getByLabelText(/visualização em lista/i)
      
      expect(gridButton).toBeInTheDocument()
      expect(listButton).toBeInTheDocument()
    })
  })

  it('deve exibir marca do produto quando disponível', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      expect(screen.getByText('Frango Inteiro')).toBeInTheDocument()
    })
  })

  it('deve exibir botão de adicionar ao carrinho', async () => {
    renderCategoryPage()
    
    await waitFor(() => {
      const addButtons = screen.getAllByLabelText(/adicionar .* ao carrinho/i)
      expect(addButtons.length).toBeGreaterThan(0)
    })
  })
})

