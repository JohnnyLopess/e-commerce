# FreshMarket - E-commerce

Projeto desenvolvido para o processo seletivo de Desenvolvedor Front-End (Estágio) da **Instabuy**.

🔗 **Demo:** [https://freshmarket-6ubxguapm-johnnylopis-5795s-projects.vercel.app/](https://freshmarket-6ubxguapm-johnnylopis-5795s-projects.vercel.app/)

## 📋 Sobre o Projeto

E-commerce de supermercado com duas telas principais:

1. **Home** - Banners e produtos organizados por categorias e ofertas
2. **Detalhes do Produto** - Informações completas, galeria de imagens e botão de compra

## 🚀 Como Rodar

### Pré-requisitos
- Docker e Docker Compose instalados

### Comandos

```bash
# Clonar o repositório
git clone https://github.com/JohnnyLopess/freshmarket..git
cd freshmarket.

# Desenvolvimento
make dev
# Acesse: http://localhost:3000

# Rodar testes
make test

# Verificar lint
make lint

# Parar containers
make stop
```

## 🧪 Testes

O projeto possui **66 testes automatizados** cobrindo:

- Hook `useProduct` (15 testes)
- ProductPage (19 testes)
- CategoryPage (13 testes)
- HomePage (8 testes)
- API e utilitários (11 testes)

```bash
make test
```

## 📁 Estrutura

```
src/
├── components/    # Componentes reutilizáveis
│   ├── ProductCard.jsx
│   ├── CategoryProductCard.jsx
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── ScrollToTop.jsx
├── hooks/         # Custom hooks
│   └── useProduct.js
├── pages/         # Páginas da aplicação
│   ├── HomePage.jsx
│   ├── ProductPage.jsx
│   ├── CategoryPage.jsx
│   └── SearchPage.jsx
├── services/      # Chamadas de API
│   └── api.js
├── tests/         # Testes unitários
├── utils/         # Funções utilitárias
│   └── imageUrl.js
└── styles/        # CSS global
```

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **React Router** - Navegação
- **Vitest** - Testes
- **Docker** - Containerização
- **Vercel** - Deploy

## ✅ Requisitos Obrigatórios

### Tela 1: Home
- ✅ Banners da API
- ✅ Produtos com imagem, nome e preço
- ✅ Endpoint `GET /layout?subdomain=supermercado`

### Tela 2: Detalhes do Produto
- ✅ Nome do produto
- ✅ Preço
- ✅ Imagens (galeria)
- ✅ Descrição
- ✅ Botão "Adicionar ao carrinho"
- ✅ Endpoint `GET /item?subdomain=supermercado&slug={slug}`

## ✨ Funcionalidades Extras

### Páginas Extras
- **CategoryPage** - Listagem por categoria com filtros e ordenação
- **SearchPage** - Busca de produtos

### Arquitetura
- Testes automatizados
- Docker para desenvolvimento
- CI/CD

## 📡 API

O projeto consome a API da Instabuy:

| Endpoint | Descrição |
|----------|-----------|
| `GET /layout` | Banners e produtos da home |
| `GET /item?slug={slug}` | Detalhes do produto |
| `GET /menu` | Categorias e subcategorias |
| `GET /search` | Busca de produtos |

## 👤 Autor

**Johnny da Ponte Lopes**

- GitHub: [@JohnnyLopess](https://github.com/JohnnyLopess)