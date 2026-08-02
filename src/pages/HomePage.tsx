import { useRouter } from '@/store/router';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductSection } from '@/components/home/ProductSection';
import { PromoBanner } from '@/components/home/PromoBanner';
import { StoreLocation } from '@/components/home/StoreLocation';
import { SocialFollow } from '@/components/home/SocialFollow';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function HomePage() {
  useScrollReveal();
  const { navigate } = useRouter();

  return (
    <>
      <Hero />

      <ProductSection
        eyebrow="Oportunidades"
        title="Promoções"
        filter="isPromo"
        cta="Ver promoções"
        ctaTo="/catalogo/promocoes"
      />

      <CategoryGrid />

      <ProductSection
        eyebrow="Seleção Dipa"
        title="Produtos em destaque"
        filter="isFeatured"
        cta="Ver todos"
        ctaTo="/catalogo"
      />

      <PromoBanner />

      <ProductSection
        eyebrow="Acabou de chegar"
        title="Novidades"
        filter="isNew"
        cta="Ver novidades"
        ctaTo="/catalogo/novidades"
      />

      <StoreLocation />

      <SocialFollow />
    </>
  );
}
