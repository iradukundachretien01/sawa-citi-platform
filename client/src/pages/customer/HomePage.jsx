import AppDownloadSection from '../../components/home/AppDownloadSection'
import CategoryStrip from '../../components/home/CategoryStrip'
import HeroSection from '../../components/home/HeroSection'
import PopularProducts from '../../components/home/PopularProducts'
import ProductGallerySection from '../../components/home/ProductGallerySection'
import TrustStrip from '../../components/home/TrustStrip'
import WhyShopSection from '../../components/home/WhyShopSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <PopularProducts />
      <ProductGallerySection />
      <TrustStrip />
      <AppDownloadSection />
      <WhyShopSection />
    </>
  )
}
