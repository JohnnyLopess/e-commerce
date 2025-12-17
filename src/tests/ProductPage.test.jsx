import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductPage from '../pages/ProductPage'
import * as api from '../services/api'

vi.mock('../services/api')

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ slug: 'produto-teste' }),
    useNavigate: () => vi.fn()
  }
})

const mockProductByUnit = {
  id: 'prod1',
  name: 'Produto por Unidade',
  slug: 'produto-por-unidade',
  brand: 'Marca Teste',
  images: ['image1.jpg', 'image2.jpg'],
  prices: [{ price: 10.00, promo_price: 8.00 }],
  unit_type: 'UN',
  description: '<p>Descrição do produto</p>'
}

const mockProductByKg = {
  id: 'prod2',
  name: 'Produto por Kg',
  slug: 'produto-por-kg',
  brand: 'Marca KG',
  images: ['image1.jpg'],
  prices: [{ price: 39.90 }],
  unit_type: 'KG',
  description: null
}

const renderProductPage = () => {
  return render(
    <BrowserRouter>
      <ProductPage />
    </BrowserRouter>
  )
}

describe('ProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    api.getProduct.mockImplementation(() => new Promise(() => {}))
    
    renderProductPage()
    
    expect(screen.getByText(/Carregando produto.../i)).toBeInTheDocument()
  })

  it('deve exibir nome do produto após carregar', async () => {
    api.getProduct.mockResolvedValue(mockProductByUnit)
    
    renderProductPage()
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Produto por Unidade' })).toBeInTheDocument()
    })
  })

  it('deve exibir marca do produto', async () => {
    api.getProduct.mockResolvedValue(mockProductByUnit)
    
    renderProductPage()
    
    await waitFor(() => {
      expect(screen.getByText('Marca Teste')).toBeInTheDocument()
    })
  })

  it('deve exibir preço promocional quando disponível', async () => {
    api.getProduct.mockResolvedValue(mockProductByUnit)
    
    renderProductPage()
    
    await waitFor(() => {
      const prices = screen.getAllByText(/8\.00/)
      expect(prices.length).toBeGreaterThan(0)
    })
  })

  it('deve exibir botão de adicionar ao carrinho', async () => {
    api.getProduct.mockResolvedValue(mockProductByUnit)
    
    renderProductPage()
    
    await waitFor(() => {
      expect(screen.getByText('Adicionar ao carrinho')).toBeInTheDocument()
    })
  })

  it('deve exibir descrição do produto', async () => {
    api.getProduct.mockResolvedValue(mockProductByUnit)
    
    renderProductPage()
    
    await waitFor(() => {
      expect(screen.getByText('Descrição do produto')).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem quando não há descrição', async () => {
    api.getProduct.mockResolvedValue(mockProductByKg)
    
    renderProductPage()
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma descrição disponível/i)).toBeInTheDocument()
    })
  })

  describe('Produtos por unidade', () => {
    it('deve exibir "Quantidade" como label', async () => {
      api.getProduct.mockResolvedValue(mockProductByUnit)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('Quantidade')).toBeInTheDocument()
      })
    })

    it('deve exibir unidade /un', async () => {
      api.getProduct.mockResolvedValue(mockProductByUnit)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('/un')).toBeInTheDocument()
      })
    })

    it('deve incrementar quantidade ao clicar no botão +', async () => {
      api.getProduct.mockResolvedValue(mockProductByUnit)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument()
      })

      const increaseButton = screen.getByLabelText('Aumentar quantidade')
      fireEvent.click(increaseButton)

      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Produtos por kg', () => {
    it('deve exibir "Peso aproximado" como label', async () => {
      api.getProduct.mockResolvedValue(mockProductByKg)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('Peso aproximado')).toBeInTheDocument()
      })
    })

    it('deve exibir unidade /kg', async () => {
      api.getProduct.mockResolvedValue(mockProductByKg)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('/kg')).toBeInTheDocument()
      })
    })

    it('deve exibir peso inicial de 0,50 kg', async () => {
      api.getProduct.mockResolvedValue(mockProductByKg)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('0,50 kg')).toBeInTheDocument()
      })
    })

    it('deve incrementar peso em 0,25 kg ao clicar no botão +', async () => {
      api.getProduct.mockResolvedValue(mockProductByKg)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('0,50 kg')).toBeInTheDocument()
      })

      const increaseButton = screen.getByLabelText('Aumentar peso')
      fireEvent.click(increaseButton)

      expect(screen.getByText('0,75 kg')).toBeInTheDocument()
    })

    it('deve exibir aviso sobre peso variável', async () => {
      api.getProduct.mockResolvedValue(mockProductByKg)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText(/O peso final pode variar/i)).toBeInTheDocument()
      })
    })

    it('deve calcular total corretamente baseado no peso', async () => {
      api.getProduct.mockResolvedValue(mockProductByKg)
      
      renderProductPage()
      
      await waitFor(() => {
        // 39.90 * 0.5 = 19.95
        expect(screen.getByText(/R\$ 19.95/)).toBeInTheDocument()
      })
    })
  })

  describe('Badges', () => {
    it('deve exibir badge de desconto quando tem promo_price menor que price', async () => {
      api.getProduct.mockResolvedValue(mockProductByUnit)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('-20%')).toBeInTheDocument()
      })
    })

    it('deve exibir badge indisponível quando block_sale é true', async () => {
      const blockedProduct = {
        ...mockProductByUnit,
        block_sale: true
      }
      api.getProduct.mockResolvedValue(blockedProduct)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('Indisponível')).toBeInTheDocument()
      })
    })

    it('deve exibir badge indisponível quando estoque é zero', async () => {
      const outOfStockProduct = {
        ...mockProductByUnit,
        prices: [{ price: 10.00, promo_price: 8.00, qtd_stock: 0 }]
      }
      api.getProduct.mockResolvedValue(outOfStockProduct)
      
      renderProductPage()
      
      await waitFor(() => {
        expect(screen.getByText('Indisponível')).toBeInTheDocument()
      })
    })
  })
})
