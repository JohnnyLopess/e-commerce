const IMAGE_BASE_URL = 'https://ibassets.com.br'

const SIZE_PREFIX = {
  small: 's',
  medium: 'm',
  big: 'b',
  large: 'l'
}

export function getBannerUrl(image) {
  return `${IMAGE_BASE_URL}/ib.store.banner/bnr-${image}`
}

export function getProductImageUrl(photo, size = 'medium') {
  const prefix = SIZE_PREFIX[size] || 'm'
  return `${IMAGE_BASE_URL}/ib.item.image.${size}/${prefix}-${photo}`
}

export function getResponsiveImageUrl(photo) {
  return {
    small: getProductImageUrl(photo, 'small'),
    medium: getProductImageUrl(photo, 'medium'),
    large: getProductImageUrl(photo, 'large')
  }
}
