export type ProductCategory = "groceries" | "household";

export type Product = {
  id: string;
  name: string;
  pricePence: number;
  category: ProductCategory;
  image: string;
  imageAlt: string;
};

export const PRODUCTS: Product[] = [
  { id: "wholemeal-bread", name: "Loaf of Wholemeal Bread", pricePence: 120, category: "groceries", image: "/shop/products/wholemeal-bread.jpg", imageAlt: "A brown wholemeal loaf on a wooden board" },
  { id: "tea-bags", name: "Box of 80 Tea Bags", pricePence: 250, category: "groceries", image: "/shop/products/tea-bags.jpg", imageAlt: "Three tea bags standing side by side" },
  { id: "fresh-milk", name: "Pint of Fresh Milk", pricePence: 90, category: "groceries", image: "/shop/products/fresh-milk.jpg", imageAlt: "A glass of fresh milk on a wooden table" },
  { id: "toilet-rolls", name: "Pack of 4 Toilet Rolls", pricePence: 220, category: "household", image: "/shop/products/toilet-rolls.jpg", imageAlt: "A stack of white toilet rolls" },
  { id: "washing-up-liquid", name: "Washing Up Liquid (500ml)", pricePence: 150, category: "household", image: "/shop/products/washing-up-liquid.jpg", imageAlt: "A green bottle of washing up liquid" },
  { id: "chocolate-biscuits", name: "Box of Chocolate Biscuits", pricePence: 180, category: "groceries", image: "/shop/products/chocolate-biscuits.jpg", imageAlt: "A chocolate digestive biscuit" },
  { id: "instant-coffee", name: "Instant Coffee (100g)", pricePence: 350, category: "groceries", image: "/shop/products/instant-coffee.jpg", imageAlt: "A pile of instant coffee granules" },
  { id: "olive-oil", name: "Olive Oil (500ml)", pricePence: 450, category: "groceries", image: "/shop/products/olive-oil.jpg", imageAlt: "A glass bottle of golden olive oil with a cork" },
  { id: "kitchen-roll", name: "Kitchen Roll (2 Pack)", pricePence: 200, category: "household", image: "/shop/products/kitchen-roll.jpg", imageAlt: "A white roll of kitchen paper" },
  { id: "laundry-detergent", name: "Laundry Detergent (1.5L)", pricePence: 650, category: "household", image: "/shop/products/laundry-detergent.jpg", imageAlt: "Bottles of liquid laundry detergent on a shop shelf" },
];

export type PhotoCredit = {
  productId: string;
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
};

export const PHOTO_CREDITS: PhotoCredit[] = [
  { productId: "wholemeal-bread", title: "Wholemeal tin loaf", author: "muffinn from Worcester, UK", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Wholemeal_tin_loaf_(8370566283).jpg" },
  { productId: "tea-bags", title: "Tea bags", author: "André Karwath aka Aka", license: "CC BY-SA 2.5", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_bags.jpg" },
  { productId: "fresh-milk", title: "Glass of milk", author: "Santeri Viinamäki", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Glass_of_milk.jpg" },
  { productId: "toilet-rolls", title: "Toilet paper rolls and paper towel rolls", author: "Ser Amantio di Nicolao", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Toilet_paper_rolls_and_paper_towel_rolls_stacked_in_the_corner_of_an_orange_bathroom.jpg" },
  { productId: "washing-up-liquid", title: "Dish-soap", author: "Eladkrauz", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dish-soap.jpg" },
  { productId: "chocolate-biscuits", title: "McVitie's chocolate digestive biscuit", author: "Jolly Janner", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:McVitie%27s_chocolate_digestive_biscuit.jpg" },
  { productId: "instant-coffee", title: "Instant coffee", author: "Editor at Large", license: "CC BY-SA 2.5", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5", sourceUrl: "https://commons.wikimedia.org/wiki/File:Instant_coffee.jpg" },
  { productId: "olive-oil", title: "Bottle of olive oil", author: "margenauer from Pixabay", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bottle_of_olive_oil.jpg" },
  { productId: "kitchen-roll", title: "Paper towel", author: "Mets501", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Paper_towel.png" },
  { productId: "laundry-detergent", title: "Labour brand liquid detergent, Shau Kei Wan", author: "HAiEEMGAU MINGA", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:HK_SKW_%E7%AD%B2%E7%AE%95%E7%81%A3_Shau_Kei_Wan_%E6%9C%9B%E9%9A%86%E8%A1%97_Mong_Lung_Street_shop_%E5%A4%A9%E5%8A%9B%E8%97%A5%E6%88%BF_Tien_Lu_Dispensary_%E5%8B%9E%E5%B7%A5%E7%89%8C%E6%B4%97%E6%BD%94%E7%B2%BE_Labour_brand_liquid_detergent_December_2021_Px3.jpg" },
];

export const FREE_DELIVERY_THRESHOLD_PENCE = 3500;
export const STANDARD_DELIVERY_PENCE = 399;
export const UNDER_FIVE_LIMIT_PENCE = 500;
export const MAX_QUANTITY_PER_ITEM = 20;

export type CategoryFilter = "all" | "groceries" | "household" | "under-5";
export type SortOrder = "featured" | "price-asc" | "price-desc";

export const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Items" },
  { id: "groceries", label: "Groceries" },
  { id: "household", label: "Household" },
  { id: "under-5", label: "Under £5" },
];

export const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function filterProducts(
  products: Product[],
  { query = "", category = "all", sort = "featured" }: { query?: string; category?: CategoryFilter; sort?: SortOrder },
): Product[] {
  const keyword = query.trim().toLowerCase();

  const matches = products.filter((product) => {
    if (keyword && !product.name.toLowerCase().includes(keyword)) return false;
    if (category === "under-5") return product.pricePence < UNDER_FIVE_LIMIT_PENCE;
    if (category !== "all") return product.category === category;
    return true;
  });

  if (sort === "price-asc") return [...matches].sort((a, b) => a.pricePence - b.pricePence);
  if (sort === "price-desc") return [...matches].sort((a, b) => b.pricePence - a.pricePence);
  return matches;
}

export type BasketLines = Record<string, number>;

export type BasketItem = {
  product: Product;
  quantity: number;
  lineTotalPence: number;
};

export function getBasketItems(lines: BasketLines): BasketItem[] {
  return PRODUCTS.filter((product) => (lines[product.id] ?? 0) > 0).map((product) => {
    const quantity = lines[product.id];
    return { product, quantity, lineTotalPence: product.pricePence * quantity };
  });
}

export function countBasketItems(lines: BasketLines): number {
  return getBasketItems(lines).reduce((total, item) => total + item.quantity, 0);
}

export function formatItemCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export type OrderTotals = {
  subtotalPence: number;
  deliveryPence: number;
  totalPence: number;
  qualifiesForFreeDelivery: boolean;
  remainingForFreeDeliveryPence: number;
  freeDeliveryProgressPercent: number;
};

export function calculateTotals(lines: BasketLines): OrderTotals {
  const subtotalPence = getBasketItems(lines).reduce((total, item) => total + item.lineTotalPence, 0);
  const qualifiesForFreeDelivery = subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE;
  const deliveryPence = subtotalPence === 0 || qualifiesForFreeDelivery ? 0 : STANDARD_DELIVERY_PENCE;

  return {
    subtotalPence,
    deliveryPence,
    totalPence: subtotalPence + deliveryPence,
    qualifiesForFreeDelivery,
    remainingForFreeDeliveryPence: Math.max(0, FREE_DELIVERY_THRESHOLD_PENCE - subtotalPence),
    freeDeliveryProgressPercent: Math.min(100, (subtotalPence / FREE_DELIVERY_THRESHOLD_PENCE) * 100),
  };
}

export const PRACTICE_CARD = {
  bankName: "Library Bank",
  cardholderName: "YAMA STUDENT",
  cardNumber: "4532 0123 4567 8901",
  sortCode: "00-00-00",
  accountNumber: "12093653",
  expiry: "12/28",
  cvv: "321",
} as const;

export type DeliveryDetails = {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  townOrCity: string;
  postcode: string;
};

export type CardDetails = {
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateDeliveryDetails(details: DeliveryDetails): FieldErrors<DeliveryDetails> {
  const errors: FieldErrors<DeliveryDetails> = {};
  if (!details.fullName.trim()) errors.fullName = "Please type your full name.";
  if (!details.addressLine1.trim()) errors.addressLine1 = "Please type the first line of your address.";
  if (!details.townOrCity.trim()) errors.townOrCity = "Please type your town or city.";
  if (!details.postcode.trim()) errors.postcode = "Please type your postcode.";
  return errors;
}

const digitsOnly = (value: string) => value.replace(/\s+/g, "");

export function validateCardDetails(details: CardDetails): FieldErrors<CardDetails> {
  const errors: FieldErrors<CardDetails> = {};

  const name = details.nameOnCard.trim().replace(/\s+/g, " ").toUpperCase();
  if (!name) {
    errors.nameOnCard = "Please type the name shown on the card.";
  } else if (name !== PRACTICE_CARD.cardholderName) {
    errors.nameOnCard = `The name does not match. Type it exactly as it appears on the practice card: ${PRACTICE_CARD.cardholderName}.`;
  }

  const cardNumber = digitsOnly(details.cardNumber);
  if (!cardNumber) {
    errors.cardNumber = "Please type the 16-digit card number.";
  } else if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber = "A card number has 16 digits. Only type numbers (spaces are fine).";
  } else if (cardNumber !== digitsOnly(PRACTICE_CARD.cardNumber)) {
    errors.cardNumber = "The card number does not match. Check each group of 4 numbers on the practice card.";
  }

  const expiry = details.expiry.replace(/\s+/g, "");
  if (!expiry) {
    errors.expiry = "Please type the expiry date, like 12/28.";
  } else if (!/^\d{2}\/?\d{2}$/.test(expiry)) {
    errors.expiry = "Type the expiry date as month and year, like 12/28.";
  } else if (expiry.replace("/", "") !== PRACTICE_CARD.expiry.replace("/", "")) {
    errors.expiry = "The expiry date does not match the practice card.";
  }

  const cvv = details.cvv.trim();
  if (!cvv) {
    errors.cvv = "Please type the 3-digit security code.";
  } else if (!/^\d{3}$/.test(cvv)) {
    errors.cvv = "The security code is 3 numbers.";
  } else if (cvv !== PRACTICE_CARD.cvv) {
    errors.cvv = "The security code does not match the practice card.";
  }

  return errors;
}
