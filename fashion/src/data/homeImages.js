/** `public/` altındaki dosyalar — prod’da `base` alt dizini varsa Vite BASE_URL ile birleştirilir */
export function publicUrl(path) {
  const normalized = String(path).replace(/^\//, '')
  const base = import.meta.env.BASE_URL ?? '/'
  if (base === '/') return `/${normalized}`
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  return `${b}/${normalized}`
}

/** Ana sayfa — yerel moda/kıyafet görselleri (public/images/home) */
export const homeImages = {
  heroBanner: publicUrl('images/home/hero-banner.png'),
  heroRedDress: publicUrl('images/home/hero-red-dress.png'),
  heroEditorial: publicUrl('images/home/hero-editorial.jpg'),
  heroProduct: publicUrl('images/home/hero-product.jpg'),
  stepStudio: publicUrl('images/home/step-studio.jpg'),
  stepShopping: publicUrl('images/home/step-shopping.jpg'),
  stepRunway: publicUrl('images/home/step-runway.jpg'),
  detail01: publicUrl('images/home/detail-01.jpg'),
  detail02: publicUrl('images/home/detail-02.jpg'),
  detail03: publicUrl('images/home/detail-03.jpg'),
  detail04: publicUrl('images/home/detail-04.jpg'),
  productSwapModel: publicUrl('images/home/product-swap-model.png'),
  productSwapProduct: publicUrl('images/home/product-swap-product.png'),
  productSwapResult: publicUrl('images/home/product-swap-result.png'),
  mekanChair: publicUrl('images/home/mekan-chair.jpg'),
  mekanGlass: publicUrl('images/home/mekan-glass.jpg'),
  mekanSofa: publicUrl('images/home/mekan-sofa.jpg'),
  mekanRoom: publicUrl('images/home/mekan-room.jpg'),
}
