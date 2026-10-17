export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  priceMinor: number;
  imagePath: string;
  diet: "veg" | "non_veg" | "egg";
  isAvailable: boolean;
  featured?: boolean;
  options?: {
    name: string;
    choices: { label: string; priceDeltaMinor: number }[];
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export const CATEGORIES: Category[] = [
  { id: "burgers", name: "Burgers", slug: "burgers", sortOrder: 1 },
  { id: "french-fries", name: "Fries & Sides", slug: "french-fries", sortOrder: 2 },
  { id: "pizzas", name: "Pizzas", slug: "pizzas", sortOrder: 3 },
  { id: "sandwiches", name: "Sandwiches", slug: "sandwiches", sortOrder: 4 },
  { id: "momos", name: "Momos", slug: "momos", sortOrder: 5 },
  { id: "tea-coffee", name: "Tea & Coffee", slug: "tea-coffee", sortOrder: 6 },
  { id: "shakes", name: "Cold Shakes", slug: "shakes", sortOrder: 7 },
  { id: "soups", name: "Soups", slug: "soups", sortOrder: 8 },
  { id: "mocktails", name: "Mocktails", slug: "mocktails", sortOrder: 9 },
];

export const MENU_ITEMS: MenuItem[] = [
  // Burgers
  {
    id: "burger-crispy-dip",
    categoryId: "burgers",
    name: "Crispy Dip Special Burger",
    slug: "crispy-dip-special-burger",
    description: "Double crispy veg patties layered with melting cheddar, caramelized onions, and a side of hot molten cheese dip.",
    priceMinor: 12900,
    imagePath: "/brand/cafe_combo_hero.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
    options: [
      {
        name: "Cheese Level",
        choices: [
          { label: "Standard Cheddar", priceDeltaMinor: 0 },
          { label: "Extra Melting Dip (+₹20)", priceDeltaMinor: 2000 },
        ],
      },
    ],
  },
  {
    id: "burger-paneer-tikka",
    categoryId: "burgers",
    name: "Paneer Tikka Burger",
    slug: "paneer-tikka-burger",
    description: "Char-grilled tandoori paneer steak, creamy mint mayo, pickled red onions, and melting cheese in a brioche bun.",
    priceMinor: 9900,
    imagePath: "/brand/dishes/burger_paneer_tikka.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
  },
  {
    id: "burger-crispy",
    categoryId: "burgers",
    name: "Crispy Veg Burger",
    slug: "crispy-veg-burger",
    description: "Golden crumbed vegetable patty, crisp iceberg lettuce, sliced tomatoes, and house cheese sauce.",
    priceMinor: 4000,
    imagePath: "/brand/dishes/burger_crispy.jpg",
    diet: "veg",
    isAvailable: true,
  },
  {
    id: "burger-aloo-tikki",
    categoryId: "burgers",
    name: "Aloo Tikki Burger",
    slug: "aloo-tikki-burger",
    description: "Crispy spiced potato patty with sweet tangy sauce, crunchy onions, and fresh tomato.",
    priceMinor: 4000,
    imagePath: "/brand/dishes/burger_crispy.jpg",
    diet: "veg",
    isAvailable: true,
  },

  // Fries & Sides
  {
    id: "fries-cheese-loaded",
    categoryId: "french-fries",
    name: "Cheese Loaded Fries",
    slug: "cheese-loaded-fries",
    description: "Crispy golden French fries submerged in warm, flowing molten cheddar cheese sauce and dried herbs.",
    priceMinor: 10900,
    imagePath: "/brand/dishes/fries_cheese_loaded.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
  },
  {
    id: "fries-peri-peri",
    categoryId: "french-fries",
    name: "Peri Peri Fries",
    slug: "peri-peri-fries",
    description: "Classic crinkle-cut fries generously tossed in spicy, tangy African bird's eye peri-peri seasoning.",
    priceMinor: 8900,
    imagePath: "/brand/dishes/fries_peri_peri.jpg",
    diet: "veg",
    isAvailable: true,
  },
  {
    id: "fries-makhni-loaded",
    categoryId: "french-fries",
    name: "Makhni Loaded Fries",
    slug: "makhni-loaded-fries",
    description: "Golden fries topped with rich buttery makhni gravy, paneer bits, and cheese drizzle.",
    priceMinor: 12900,
    imagePath: "/brand/dishes/fries_cheese_loaded.jpg",
    diet: "veg",
    isAvailable: true,
  },

  // Pizzas
  {
    id: "pizza-margherita",
    categoryId: "pizzas",
    name: "Classic Margherita Pizza",
    slug: "classic-margherita-pizza",
    description: "Stone-baked crispy crust, rich Italian tomato concasse, fresh mozzarella cheese pull, and fragrant sweet basil.",
    priceMinor: 9900,
    imagePath: "/brand/dishes/pizza_margherita.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
    options: [
      {
        name: "Size",
        choices: [
          { label: "Small (6 inch)", priceDeltaMinor: 0 },
          { label: "Medium (9 inch)", priceDeltaMinor: 6000 },
          { label: "Large (12 inch)", priceDeltaMinor: 12000 },
        ],
      },
    ],
  },
  {
    id: "pizza-cheese-dip-special",
    categoryId: "pizzas",
    name: "Cheese Dip Special Pizza",
    slug: "cheese-dip-special-pizza",
    description: "Overloaded cheese burst pizza served with a warm, bubbling bowl of signature cheesy dip right in the center.",
    priceMinor: 16900,
    imagePath: "/brand/dishes/pizza_margherita.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
    options: [
      {
        name: "Size",
        choices: [
          { label: "Small (6 inch)", priceDeltaMinor: 0 },
          { label: "Medium (9 inch)", priceDeltaMinor: 9000 },
          { label: "Large (12 inch)", priceDeltaMinor: 18000 },
        ],
      },
    ],
  },
  {
    id: "pizza-paneer-delight",
    categoryId: "pizzas",
    name: "Paneer Delight Pizza",
    slug: "paneer-delight-pizza",
    description: "Marinated spiced cottage cheese chunks, golden sweet corn, sliced bell peppers, and mozzarella.",
    priceMinor: 13900,
    imagePath: "/brand/dishes/pizza_margherita.jpg",
    diet: "veg",
    isAvailable: true,
    options: [
      {
        name: "Size",
        choices: [
          { label: "Small (6 inch)", priceDeltaMinor: 0 },
          { label: "Medium (9 inch)", priceDeltaMinor: 7000 },
          { label: "Large (12 inch)", priceDeltaMinor: 14000 },
        ],
      },
    ],
  },

  // Sandwiches
  {
    id: "sandwich-cheese-corn",
    categoryId: "sandwiches",
    name: "Cheese Corn Sandwich",
    slug: "cheese-corn-sandwich",
    description: "Griddle-toasted golden bread packed with juicy sweet corn kernels and a dramatic molten cheese pull.",
    priceMinor: 8000,
    imagePath: "/brand/dishes/sandwich_cheese_corn.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
    options: [
      {
        name: "Size",
        choices: [
          { label: "Medium", priceDeltaMinor: 0 },
          { label: "Large", priceDeltaMinor: 4900 },
        ],
      },
    ],
  },
  {
    id: "sandwich-paneer",
    categoryId: "sandwiches",
    name: "Paneer Cheese Sandwich",
    slug: "paneer-cheese-sandwich",
    description: "Spiced paneer bhurji filling, zesty mint chutney, and creamy melting cheese pressed on panini grill.",
    priceMinor: 8000,
    imagePath: "/brand/dishes/sandwich_paneer.jpg",
    diet: "veg",
    isAvailable: true,
    options: [
      {
        name: "Size",
        choices: [
          { label: "Medium", priceDeltaMinor: 0 },
          { label: "Large", priceDeltaMinor: 4900 },
        ],
      },
    ],
  },

  // Momos
  {
    id: "momos-steamed-veg",
    categoryId: "momos",
    name: "Steamed Veg Momos (6 pcs)",
    slug: "steamed-veg-momos",
    description: "Hand-pleated delicate dumplings filled with finely chopped garden vegetables, served in bamboo steamer with red chili garlic dip.",
    priceMinor: 6000,
    imagePath: "/brand/dishes/momos_steamed.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
  },
  {
    id: "momos-kurkure",
    categoryId: "momos",
    name: "Kurkure Momos (6 pcs)",
    slug: "kurkure-momos",
    description: "Ultra-crispy golden crumb-coated fried momos, sprinkled with chaat masala, served with tandoori mayo.",
    priceMinor: 9900,
    imagePath: "/brand/dishes/momos_kurkure.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
  },
  {
    id: "momos-steamed-paneer",
    categoryId: "momos",
    name: "Steamed Paneer Momos (6 pcs)",
    slug: "steamed-paneer-momos",
    description: "Tender steamed dumplings stuffed with spiced cottage cheese and herbs, with fiery Himalayan dip.",
    priceMinor: 8000,
    imagePath: "/brand/dishes/momos_steamed.jpg",
    diet: "veg",
    isAvailable: true,
  },

  // Tea & Coffee
  {
    id: "beverage-cappuccino",
    categoryId: "tea-coffee",
    name: "Artisan Cappuccino",
    slug: "artisan-cappuccino",
    description: "Freshly pulled double espresso shot with velvety micro-foam and latte art, crafted with 100% Arabica beans.",
    priceMinor: 5000,
    imagePath: "/brand/dishes/beverage_hot_coffee.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
  },
  {
    id: "beverage-masala-chai",
    categoryId: "tea-coffee",
    name: "Kulhad Masala Chai",
    slug: "kulhad-masala-chai",
    description: "Authentic slow-brewed tea with crushed fresh ginger, green cardamom, and aromatic spices in an earthen clay cup.",
    priceMinor: 3500,
    imagePath: "/brand/dishes/beverage_masala_chai.jpg",
    diet: "veg",
    isAvailable: true,
  },

  // Shakes
  {
    id: "shake-cold-coffee-icecream",
    categoryId: "shakes",
    name: "Cold Coffee with Ice Cream",
    slug: "cold-coffee-with-icecream",
    description: "Chilled blended espresso, creamy whole milk, crowned with a rich vanilla ice cream scoop and chocolate fudge drizzle.",
    priceMinor: 8900,
    imagePath: "/brand/cafe_combo_hero.jpg",
    diet: "veg",
    isAvailable: true,
    featured: true,
  },
  {
    id: "shake-oreo",
    categoryId: "shakes",
    name: "Oreo Thick Shake",
    slug: "oreo-thick-shake",
    description: "Thick hand-spun milkshake blended with crunchy Oreo cookies, topped with whipped cream and crushed biscuits.",
    priceMinor: 8900,
    imagePath: "/brand/cafe_combo_hero.jpg",
    diet: "veg",
    isAvailable: true,
  },

  // Soups
  {
    id: "soup-manchow",
    categoryId: "soups",
    name: "Veg Manchow Soup",
    slug: "veg-manchow-soup",
    description: "Hearty, spicy Indo-Chinese dark broth with finely minced vegetables, served piping hot with crispy fried noodles.",
    priceMinor: 4900,
    imagePath: "/brand/dishes/fries_peri_peri.jpg",
    diet: "veg",
    isAvailable: true,
  },
  {
    id: "soup-sweet-corn",
    categoryId: "soups",
    name: "Sweet Corn Soup",
    slug: "sweet-corn-soup",
    description: "Comforting creamy sweet corn and vegetable soup, lightly peppered and garnished with spring greens.",
    priceMinor: 4900,
    imagePath: "/brand/dishes/sandwich_cheese_corn.jpg",
    diet: "veg",
    isAvailable: true,
  },

  // Mocktails
  {
    id: "mocktail-virgin-mojito",
    categoryId: "mocktails",
    name: "Virgin Mint Mojito",
    slug: "virgin-mint-mojito",
    description: "Crushed fresh mint sprigs, juicy lime wedges, and chilled sparkling soda poured over mountain crushed ice.",
    priceMinor: 7000,
    imagePath: "/brand/dishes/momos_steamed.jpg",
    diet: "veg",
    isAvailable: true,
  },
  {
    id: "mocktail-blueberry-mojito",
    categoryId: "mocktails",
    name: "Blueberry Mojito",
    slug: "blueberry-mojito",
    description: "Sweet wild blueberry compote infused with tangy lime, fresh garden mint, and fizzy soda.",
    priceMinor: 9900,
    imagePath: "/brand/dishes/momos_steamed.jpg",
    diet: "veg",
    isAvailable: true,
  },
];
