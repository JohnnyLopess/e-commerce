const BASE_URL = 'https://api.instabuy.com.br/apiv3'
const SUBDOMAIN = 'supermercado'

export async function getLayout() {
  const response = await fetch(`${BASE_URL}/layout?subdomain=${SUBDOMAIN}`)
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Erro ao carregar layout')
  }
  
  return data.data
}

export async function getProduct(slug) {
  const response = await fetch(`${BASE_URL}/item?subdomain=${SUBDOMAIN}&slug=${slug}`)
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Erro ao carregar produto')
  }
  
  return data.data?.[0] || null
}

export async function getItems(page = 1, limit = 30, options = {}) {
  let url = `${BASE_URL}/item?subdomain=${SUBDOMAIN}&page=${page}&N=${limit}`
  
  if (options.categorySlug) {
    url += `&category_slug=${encodeURIComponent(options.categorySlug)}`
  }
  if (options.subcategoryId) {
    url += `&subcategory_id=${encodeURIComponent(options.subcategoryId)}`
  }
  if (options.categoryId) {
    url += `&category_id=${encodeURIComponent(options.categoryId)}`
  }
  if (options.sort) {
    url += `&sort=${encodeURIComponent(options.sort)}`
  }
  if (options.minPrice) {
    url += `&min_price=${options.minPrice}`
  }
  if (options.maxPrice) {
    url += `&max_price=${options.maxPrice}`
  }
  
  const response = await fetch(url)
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Erro ao carregar produtos')
  }
  
  return {
    products: data.data || [],
    total: data.count || 0,
    page,
    limit
  }
}

// Carregar todos os produtos de uma categoria (múltiplas páginas)
export async function getAllItemsByCategory(categoryId, maxItems = 500) {
  let allProducts = []
  let page = 1
  let total = 0
  
  do {
    const data = await getItems(page, 30, { categoryId })
    allProducts = [...allProducts, ...data.products]
    total = data.total
    page++
  } while (allProducts.length < total && allProducts.length < maxItems && page <= 20)
  
  return {
    products: allProducts,
    total
  }
}

export async function getMenu() {
  const response = await fetch(`${BASE_URL}/menu?subdomain=${SUBDOMAIN}`)
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Erro ao carregar menu')
  }
  
  return data.data || []
}

export async function getSubcategoryName(subcategoryId, productSlug) {
  try {
    // Buscar pelo slug do produto para obter dados completos com título da subcategoria
    if (productSlug) {
      const response = await fetch(`${BASE_URL}/item?subdomain=${SUBDOMAIN}&slug=${productSlug}`)
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        const item = data.data[0]
        // Verificar se subcategory_ids tem o objeto com título
        const subcatInfo = item.subcategory_ids?.find(s => 
          (typeof s === 'object' && s.id === subcategoryId)
        )
        if (subcatInfo && subcatInfo.title) {
          return subcatInfo.title
        }
      }
    }
    return null
  } catch {
    return null
  }
}

export async function searchProducts(query, page = 1, limit = 25) {
  const response = await fetch(
    `${BASE_URL}/search?subdomain=${SUBDOMAIN}&search=${encodeURIComponent(query)}&page=${page}&N=${limit}`
  )
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar produtos')
  }
  
  return {
    products: data.data || [],
    total: data.count || 0,
    page,
    limit
  }
}
