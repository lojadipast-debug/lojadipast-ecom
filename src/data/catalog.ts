export type Category =
  | 'bebe'
  | 'menina'
  | 'menino'
  | 'mochilas'
  | 'brinquedos'
  | 'acessorios';

export type AgeGroup = '0-3m' | '3-12m' | '1-3a' | '3-6a' | '6-10a';
export type BrandName =
  | 'Dipa Soft'
  | 'Petit Coton'
  | 'Nuage'
  | 'Bulle & Co'
  | 'Lapin Bleu'
  | 'Maison Douce';

export interface Product {
  id: string;
  name: string;
  category: Category;
  ageGroup: AgeGroup;
  brand: BrandName;
  price: number;
  oldPrice?: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  images: string[];
  description: string;
  details: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isPromo?: boolean;
  bestSeller?: boolean;
  stockQuantity?: number;
  subcategory?: string;
  promoActive?: boolean;
  promoOriginalPrice?: number;
  promoPrice?: number;
  promoStartDate?: string | null;
  promoEndDate?: string | null;
  createdAt?: string | null;
}

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

export function isNewWithin10Days(product: Product): boolean {
  if (!product.createdAt) return product.isNew ?? false;
  return Date.now() - new Date(product.createdAt).getTime() <= TEN_DAYS_MS;
}

export function promoDiscountPercent(product: Product): number {
  if (!isPromoActiveNow(product)) return 0;
  const oldP = product.promoOriginalPrice ?? product.oldPrice ?? product.price;
  const newP = product.promoPrice ?? product.price;
  if (oldP <= 0 || newP >= oldP) return 0;
  return Math.round(((oldP - newP) / oldP) * 100);
}

export function isPromoActiveNow(product: Product): boolean {
  if (!product.promoActive || !product.promoPrice) return false;
  const now = new Date();
  if (product.promoStartDate && new Date(product.promoStartDate) > now) return false;
  if (product.promoEndDate && new Date(product.promoEndDate) < now) return false;
  return true;
}

export function effectivePrice(product: Product): number {
  return isPromoActiveNow(product) ? product.promoPrice! : product.price;
}

export function effectiveOldPrice(product: Product): number | undefined {
  if (isPromoActiveNow(product)) {
    return product.promoOriginalPrice ?? product.price;
  }
  return product.oldPrice;
}

export function isOutOfStock(product: Product): boolean {
  return (product.stockQuantity ?? 0) <= 0;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  bebe: 'Bebé',
  menina: 'Menina',
  menino: 'Menino',
  mochilas: 'Mochilas',
  brinquedos: 'Brinquedos',
  acessorios: 'Acessórios',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  bebe: '👶',
  menina: '👧',
  menino: '👦',
  mochilas: '🎒',
  brinquedos: '🧸',
  acessorios: '🍼',
};

export const AGE_LABELS: Record<AgeGroup, string> = {
  '0-3m': '0–3 meses',
  '3-12m': '3–12 meses',
  '1-3a': '1–3 anos',
  '3-6a': '3–6 anos',
  '6-10a': '6–10 anos',
};

export const BRANDS: BrandName[] = [
  'Dipa Soft',
  'Petit Coton',
  'Nuage',
  'Bulle & Co',
  'Lapin Bleu',
  'Maison Douce',
];

const C = {
  lilas: { name: 'Lilás pastel', hex: '#d7c6f2' },
  azul: { name: 'Azul bebé', hex: '#c8d9f8' },
  rosa: { name: 'Rosa pastel', hex: '#fad4e6' },
  creme: { name: 'Creme', hex: '#fbf7f2' },
  branco: { name: 'Branco', hex: '#ffffff' },
  sage: { name: 'Verde sálvia', hex: '#d7e8d4' },
  nuvem: { name: 'Nuvem', hex: '#eef0f5' },
  terracota: { name: 'Terracota', hex: '#e8c4a8' },
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Conjunto Nuvenzinha de Algodão',
    category: 'bebe',
    ageGroup: '0-3m',
    brand: 'Dipa Soft',
    price: 38.9,
    oldPrice: 49.9,
    colors: [C.lilas, C.creme, C.azul],
    sizes: ['0-3m', '3-6m', '6-9m', '9-12m'],
    images: [
      'https://images.pexels.com/photos/28259755/pexels-photo-28259755.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/28259747/pexels-photo-28259747.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/14642652/pexels-photo-14642652.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description:
      'Conjunto de algodão orgânico extra suave, pensado para a pele sensível dos primeiros dias. Composição respirável e costuras planas que não marcam.',
    details: ['100% algodão orgânico GOTS', 'Botões de pressão em nacre', 'Lavável a 30°C', 'Costuras planas'],
    rating: 4.9,
    reviewsCount: 128,
    isFeatured: true,
    isPromo: true,
    bestSeller: true,
  },
  {
    id: 'p2',
    name: 'Vestido Flutuante Petal',
    category: 'menina',
    ageGroup: '3-6a',
    brand: 'Petit Coton',
    price: 42.0,
    colors: [C.rosa, C.creme, C.sage],
    sizes: ['2-3a', '3-4a', '4-5a', '5-6a', '6-7a'],
    images: [
      'https://images.pexels.com/photos/27505695/pexels-photo-27505695.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/20433620/pexels-photo-20433620.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/37638214/pexels-photo-37638214.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description:
      'Vestido em tule suave com forro de algodão. Movimento leve e festivo, perfeito para dias especiais.',
    details: ['Tule sem risco', 'Forro 100% algodão', 'Fecho nas costas com laço', 'Lavagem delicada'],
    rating: 4.8,
    reviewsCount: 86,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'p3',
    name: 'Camisola Tricot Montanha',
    category: 'menino',
    ageGroup: '3-6a',
    brand: 'Nuage',
    price: 34.5,
    colors: [C.azul, C.creme, C.sage],
    sizes: ['2-3a', '3-4a', '4-5a', '5-6a', '6-7a'],
    images: [
      'https://images.pexels.com/photos/28259752/pexels-photo-28259752.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/14641436/pexels-photo-14641436.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/30569741/pexels-photo-30569741.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description:
      'Camisola de tricot quentinha com padrão discreto. Confortável para os dias frescos de outono.',
    details: ['Mistura de lã merino', 'Não pica', 'Botões em madeira', 'Lavável à mão'],
    rating: 4.7,
    reviewsCount: 54,
    isFeatured: true,
    bestSeller: true,
  },
  {
    id: 'p4',
    name: 'Mochila Coelhinho Lavanda',
    category: 'mochilas',
    ageGroup: '3-6a',
    brand: 'Bulle & Co',
    price: 29.9,
    oldPrice: 36.0,
    colors: [C.lilas, C.rosa, C.azul],
    sizes: ['Único'],
    images: [
      'https://images.pexels.com/photos/4910563/pexels-photo-4910563.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/14017533/pexels-photo-14017533.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/4910501/pexels-photo-4910501.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description:
      'Mochila leve com alças acolchoadas e orelhinhas de coelho. O tamanho ideal para os primeiros anos de escola.',
    details: ['Tecido à prova de água', 'Alças acolchoadas', 'Bolso frontal', '49 cm de altura'],
    rating: 4.9,
    reviewsCount: 212,
    isFeatured: true,
    isPromo: true,
    bestSeller: true,
  },
  {
    id: 'p5',
    name: 'Urso de Pelúcia Caramelo',
    category: 'brinquedos',
    ageGroup: '1-3a',
    brand: 'Lapin Bleu',
    price: 26.0,
    colors: [C.terracota, C.creme],
    sizes: ['Pequeno', 'Médio', 'Grande'],
    images: [
      'https://images.pexels.com/photos/15130371/pexels-photo-15130371.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/1974656/pexels-photo-1974656.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/29279957/pexels-photo-29279957.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description:
      'Pelúcia hipoalergénica com enchimento reciclado. O companheiro macio para abraços sem fim.',
    details: ['Enchimento reciclado', 'Tecido certificado OEKO-TEX', 'Lavável à máquina 30°C', 'Sem peças pequenas'],
    rating: 5.0,
    reviewsCount: 167,
    isFeatured: true,
    isNew: true,
    bestSeller: true,
  },
  {
    id: 'p6',
    name: 'Sapatilhas Saltitonas',
    category: 'acessorios',
    ageGroup: '3-6a',
    brand: 'Maison Douce',
    price: 32.0,
    oldPrice: 40.0,
    colors: [C.azul, C.rosa, C.branco],
    sizes: ['26', '27', '28', '29', '30', '31', '32'],
    images: [
      'https://images.pexels.com/photos/4987523/pexels-photo-4987523.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/30395128/pexels-photo-30395128.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/22484673/pexels-photo-22484673.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description:
      'Sapatilhas leves com sola flexível anti-derrapante. Acompanham os primeiros passos com segurança.',
    details: ['Sola em TPR flexível', 'Pelica certificada', 'Fecho elástico', 'Palmilha amovível'],
    rating: 4.6,
    reviewsCount: 73,
    isPromo: true,
    bestSeller: true,
  },
  {
    id: 'p7',
    name: 'Body Mangas Compridas Estrelas',
    category: 'bebe',
    ageGroup: '3-12m',
    brand: 'Petit Coton',
    price: 18.5,
    colors: [C.nuvem, C.lilas, C.azul],
    sizes: ['3-6m', '6-9m', '9-12m', '12-18m'],
    images: [
      'https://images.pexels.com/photos/28259755/pexels-photo-28259755.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/28259747/pexels-photo-28259747.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description: 'Body de malha macia com estampa de estrelinhas. Fácil de vestir com fecho entre pernas.',
    details: ['95% algodão, 5% elastano', 'Estampa não tóxica', 'Botões de pressão', 'Lavável a 40°C'],
    rating: 4.7,
    reviewsCount: 41,
    isNew: true,
  },
  {
    id: 'p8',
    name: 'Tshirt Riscas Marinheiras',
    category: 'menino',
    ageGroup: '3-6a',
    brand: 'Dipa Soft',
    price: 16.0,
    colors: [C.azul, C.creme],
    sizes: ['2-3a', '3-4a', '4-5a', '5-6a', '6-7a'],
    images: [
      'https://images.pexels.com/photos/12999360/pexels-photo-12999360.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/26840179/pexels-photo-26840179.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description: 'T-shirt de riscas em algodão pima. Fresca e resistente para aventuras diárias.',
    details: ['Algodão pima peruano', 'Costuras reforçadas', 'Gola em canelado', 'Lavável a 40°C'],
    rating: 4.5,
    reviewsCount: 38,
    isNew: true,
  },
  {
    id: 'p9',
    name: 'Laço de Cabelo Veludo',
    category: 'menina',
    ageGroup: '1-3a',
    brand: 'Bulle & Co',
    price: 8.5,
    colors: [C.rosa, C.lilas, C.creme],
    sizes: ['Único'],
    images: [
      'https://images.pexels.com/photos/27816523/pexels-photo-27816523.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/20433620/pexels-photo-20433620.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description: 'Laço em veludo suave com pinça sem apertar. O toque final para qualquer visual.',
    details: ['Veludo macio', 'Pinça anti-derrapagem', 'Não marca o cabelo', '5 cm'],
    rating: 4.8,
    reviewsCount: 29,
    isNew: true,
  },
  {
    id: 'p10',
    name: 'Manta de Marmota Bordada',
    category: 'acessorios',
    ageGroup: '0-3m',
    brand: 'Maison Douce',
    price: 24.0,
    oldPrice: 30.0,
    colors: [C.creme, C.sage, C.rosa],
    sizes: ['70x90', '90x120'],
    images: [
      'https://images.pexels.com/photos/14642652/pexels-photo-14642652.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/14641436/pexels-photo-14641436.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description: 'Manta de algodão cetimado com bordado de marmota. Quentinha, leve e fácil de lavar.',
    details: ['Algodão cetimado', 'Bordado à mão', 'Reversível', 'Lavável à máquina'],
    rating: 4.9,
    reviewsCount: 64,
    isPromo: true,
  },
  {
    id: 'p11',
    name: 'Pelúcia Coelhinho Dipa',
    category: 'brinquedos',
    ageGroup: '0-3m',
    brand: 'Dipa Soft',
    price: 22.0,
    colors: [C.lilas, C.rosa, C.creme],
    sizes: ['Único'],
    images: [
      'https://images.pexels.com/photos/1974656/pexels-photo-1974656.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/15130371/pexels-photo-15130371.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description: 'O coelhinho Dipa em pelúcia — a mascote da marca. Orelhas longas para mordeduras e abraços.',
    details: ['Pelúcia hipoalergénica', 'Orelhas mordedoras', 'Lavável à máquina', '28 cm'],
    rating: 5.0,
    reviewsCount: 198,
    isFeatured: true,
    bestSeller: true,
  },
  {
    id: 'p12',
    name: 'Mochila Estrela Polar',
    category: 'mochilas',
    ageGroup: '6-10a',
    brand: 'Nuage',
    price: 39.0,
    colors: [C.azul, C.nuvem, C.lilas],
    sizes: ['Único'],
    images: [
      'https://images.pexels.com/photos/14017533/pexels-photo-14017533.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/4910501/pexels-photo-4910501.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
      'https://images.pexels.com/photos/4910563/pexels-photo-4910563.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    ],
    description: 'Mochila escolar ergonómica com compartimento para portátil. Conforto para os maiores.',
    details: ['Costas ventiladas', 'Compartimento 13"', 'Tecido impermeável', '42 cm de altura'],
    rating: 4.7,
    reviewsCount: 91,
    isNew: true,
  },
];

export const REVIEWS = [
  {
    id: 'r1',
    name: 'Sofia M.',
    location: 'Lisboa',
    rating: 5,
    text: 'A qualidade é extraordinária. O conjunto chegou lindamente embalado e o tecido é mesmo suave como prometido.',
    product: 'Conjunto Nuvenzinha de Algodão',
  },
  {
    id: 'r2',
    name: 'Inês C.',
    location: 'Porto',
    rating: 5,
    text: 'A mochila do coelhinho é o sucesso do infantário. Resistente e adorável — recomendo sem hesitar.',
    product: 'Mochila Coelhinho Lavanda',
  },
  {
    id: 'r3',
    name: 'Tiago R.',
    location: 'Coimbra',
    rating: 5,
    text: 'Comprei o urso para a minha filha e ela não larga. Pelúcia super macia e entregou em dois dias.',
    product: 'Urso de Pelúcia Caramelo',
  },
  {
    id: 'r4',
    name: 'Mariana L.',
    location: 'Braga',
    rating: 5,
    text: 'O atendimento foi atencioso e a devolução foi simples. A Dipa tornou tudo fácil e carinhoso.',
    product: 'Vestido Flutuante Petal',
  },
];

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand)
  )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
