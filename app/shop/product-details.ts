export type Nutrition = {
  per: "100g" | "100ml";
  serving?: string;
  energy: string;
  fat: string;
  saturates: string;
  carbohydrate: string;
  sugars: string;
  fibre: string;
  protein: string;
  salt: string;
};

export type Review = {
  author: string;
  date: string;
  rating: number;
  title: string;
  body: string;
};

export type ProductDetails = {
  unitPrice: string;
  description: string;
  highlights: string[];
  ingredients?: string;
  allergens?: string;
  nutrition?: Nutrition;
  storage?: string;
  usage?: string;
  safety?: string;
  origin?: string;
  reviews: Review[];
};

export const PRODUCT_DETAILS: Record<string, ProductDetails> = {
  "wholemeal-bread": {
    unitPrice: "£0.15 per 100g",
    description: "A soft, medium-sliced wholemeal loaf baked with 100% wholemeal flour. Great for toast, sandwiches and packed lunches.",
    highlights: ["800g loaf, about 20 slices", "High in fibre", "Suitable for vegetarians"],
    ingredients: "Wholemeal Wheat Flour, Water, Yeast, Salt, Soya Flour, Vegetable Oil (Rapeseed), Spirit Vinegar, Emulsifier (E472e), Flour Treatment Agent (Ascorbic Acid).",
    allergens: "Contains Wheat, Gluten and Soya.",
    nutrition: { per: "100g", serving: "1 slice (40g)", energy: "1015kJ / 241kcal", fat: "2.5g", saturates: "0.5g", carbohydrate: "39.6g", sugars: "3.0g", fibre: "6.8g", protein: "10.2g", salt: "0.93g" },
    storage: "Store in a cool, dry place. Suitable for freezing — freeze on the day of purchase and use within 1 month.",
    reviews: [
      { author: "Margaret, Leeds", date: "12 August 2026", rating: 5, title: "Lovely soft bread", body: "Stays fresh for days and makes perfect toast. I buy it every week." },
      { author: "Tony, Bradford", date: "3 July 2026", rating: 4, title: "Good value", body: "Nice loaf for the price. Slices are a good thickness for sandwiches." },
      { author: "Priya, Wakefield", date: "18 May 2026", rating: 4, title: "Tasty", body: "Good flavour. I freeze half the loaf so none goes to waste." },
    ],
  },
  "tea-bags": {
    unitPrice: "£0.03 per tea bag",
    description: "A rich, full-flavoured blend of black teas from Kenya and Assam. Makes a proper strong cup of tea, with or without milk.",
    highlights: ["80 tea bags", "Rainforest Alliance certified", "Round bags for a quick brew"],
    ingredients: "Black Tea.",
    allergens: "No allergens.",
    nutrition: { per: "100ml", serving: "1 cup (250ml), brewed without milk", energy: "4kJ / 1kcal", fat: "0g", saturates: "0g", carbohydrate: "0g", sugars: "0g", fibre: "0g", protein: "0.1g", salt: "0g" },
    usage: "Place one tea bag in a cup and add freshly boiled water. Brew for 2–5 minutes, remove the bag and add milk or sugar to taste.",
    storage: "Store in a cool, dry place away from strong smells.",
    reviews: [
      { author: "Joan, Harrogate", date: "20 August 2026", rating: 5, title: "My favourite cuppa", body: "Strong and refreshing. One bag does a big mug." },
      { author: "Dave, Otley", date: "9 June 2026", rating: 5, title: "Great tea", body: "Better than the expensive brands in my opinion." },
      { author: "Sue, Ilkley", date: "2 April 2026", rating: 3, title: "A bit strong for me", body: "Nice tea but I have to take the bag out quickly or it gets bitter." },
    ],
  },
  "fresh-milk": {
    unitPrice: "£0.16 per 100ml",
    description: "Fresh semi-skimmed British milk from farms in Yorkshire. Perfect in tea, coffee and on cereal.",
    highlights: ["1 pint (568ml)", "100% British milk", "Source of calcium"],
    ingredients: "Semi Skimmed Milk.",
    allergens: "Contains Milk.",
    nutrition: { per: "100ml", serving: "1 glass (200ml)", energy: "209kJ / 50kcal", fat: "1.8g", saturates: "1.1g", carbohydrate: "4.8g", sugars: "4.8g", fibre: "0g", protein: "3.6g", salt: "0.10g" },
    storage: "Keep refrigerated below 5°C. Once opened, use within 3 days and by the use-by date.",
    origin: "Produced in the UK",
    reviews: [
      { author: "Brian, Leeds", date: "25 August 2026", rating: 5, title: "Always fresh", body: "Good long date on it every time I order." },
      { author: "Fatima, Huddersfield", date: "14 July 2026", rating: 4, title: "Nice milk", body: "Tastes fresh. The bottle is easy to pour." },
      { author: "Eileen, Pudsey", date: "30 May 2026", rating: 5, title: "No complaints", body: "Just what you want from milk!" },
    ],
  },
  "toilet-rolls": {
    unitPrice: "£0.55 per roll",
    description: "Soft and strong 2-ply quilted toilet tissue. Each roll has 200 sheets.",
    highlights: ["Pack of 4 rolls", "2-ply, 200 sheets per roll", "Made from responsibly sourced paper", "Safe for septic tanks"],
    usage: "Flush toilet tissue only. Do not flush wipes, kitchen roll or other items.",
    storage: "Store in a dry place.",
    reviews: [
      { author: "Carol, Keighley", date: "5 August 2026", rating: 4, title: "Soft and strong", body: "Good quality for the price. Lasts a while." },
      { author: "Mohammed, Leeds", date: "22 June 2026", rating: 5, title: "Great value", body: "As good as the big brands and cheaper." },
      { author: "Pat, Batley", date: "11 March 2026", rating: 3, title: "OK", body: "Does the job but I would like bigger packs." },
    ],
  },
  "washing-up-liquid": {
    unitPrice: "£0.30 per 100ml",
    description: "Concentrated washing up liquid with a fresh original scent. Cuts through grease so a little goes a long way.",
    highlights: ["500ml bottle", "Cuts through grease", "Gentle on hands"],
    usage: "Add a small squirt to a bowl of warm water. For tough grease, apply directly to a damp sponge.",
    safety: "Causes serious eye irritation. Keep out of reach of children. IF IN EYES: Rinse cautiously with water for several minutes. If eye irritation persists, get medical advice.",
    reviews: [
      { author: "Linda, Shipley", date: "19 August 2026", rating: 5, title: "Lasts ages", body: "One bottle lasts me over a month. Lots of bubbles." },
      { author: "George, Leeds", date: "7 July 2026", rating: 4, title: "Does the job", body: "Gets greasy pans clean. Nice smell too." },
      { author: "Amina, Dewsbury", date: "1 May 2026", rating: 4, title: "Good", body: "Works well and doesn't dry my hands out." },
    ],
  },
  "chocolate-biscuits": {
    unitPrice: "£0.60 per 100g",
    description: "Crunchy wheat biscuits topped with smooth milk chocolate. Perfect with a cup of tea.",
    highlights: ["300g pack, about 17 biscuits", "Made with real milk chocolate", "Suitable for vegetarians"],
    ingredients: "Wheat Flour, Milk Chocolate (27%) (Sugar, Cocoa Butter, Cocoa Mass, Dried Skimmed Milk, Dried Whey (Milk), Butter Oil (Milk), Emulsifier (Soya Lecithin)), Vegetable Oil (Palm), Wholemeal Wheat Flour, Sugar, Glucose-Fructose Syrup, Raising Agents (Sodium Bicarbonate, Malic Acid), Salt.",
    allergens: "Contains Wheat, Gluten, Milk and Soya. May contain Nuts.",
    nutrition: { per: "100g", serving: "1 biscuit (17g)", energy: "2071kJ / 495kcal", fat: "23.8g", saturates: "12.4g", carbohydrate: "62.1g", sugars: "29.0g", fibre: "3.4g", protein: "6.7g", salt: "0.93g" },
    storage: "Store in a cool, dry place. Once opened, keep in an airtight container.",
    reviews: [
      { author: "Rita, Leeds", date: "28 August 2026", rating: 5, title: "Too good!", body: "The packet never lasts long in our house." },
      { author: "Ken, Garforth", date: "16 June 2026", rating: 4, title: "Tasty", body: "Plenty of chocolate. Great for dunking." },
      { author: "Helen, Morley", date: "8 April 2026", rating: 4, title: "Nice biscuits", body: "The grandchildren love them. Some were broken in the pack." },
    ],
  },
  "instant-coffee": {
    unitPrice: "£3.50 per 100g",
    description: "Smooth, rich freeze-dried instant coffee made from 100% Arabica beans. Makes about 55 cups.",
    highlights: ["100g jar", "About 55 cups per jar", "Medium roast, strength 4"],
    ingredients: "100% Arabica Coffee.",
    allergens: "No allergens.",
    nutrition: { per: "100ml", serving: "1 mug (230ml), made with water", energy: "4kJ / 1kcal", fat: "0g", saturates: "0g", carbohydrate: "0.1g", sugars: "0g", fibre: "0g", protein: "0.1g", salt: "0g" },
    usage: "Add 1 teaspoon (1.8g) of coffee to a cup. Pour on hot water that has cooled slightly after boiling, then stir. Add milk and sugar to taste.",
    storage: "Store in a cool, dry place. Replace the lid tightly after use.",
    reviews: [
      { author: "Steve, Leeds", date: "10 August 2026", rating: 4, title: "Smooth taste", body: "Not bitter at all. Good morning coffee." },
      { author: "Angela, Castleford", date: "27 June 2026", rating: 5, title: "Lovely", body: "As nice as the coffee shop, much cheaper!" },
      { author: "Raj, Bradford", date: "15 March 2026", rating: 3, title: "A bit mild", body: "Nice, but I need two spoons for a strong cup." },
    ],
  },
  "olive-oil": {
    unitPrice: "£0.90 per 100ml",
    description: "Extra virgin olive oil from the first cold pressing of Spanish olives. Fruity and peppery — ideal for salads, dipping and cooking.",
    highlights: ["500ml glass bottle", "Extra virgin, cold pressed", "Suitable for vegans"],
    ingredients: "Extra Virgin Olive Oil.",
    allergens: "No allergens.",
    nutrition: { per: "100ml", serving: "1 tablespoon (15ml)", energy: "3404kJ / 828kcal", fat: "92.0g", saturates: "13.3g", carbohydrate: "0g", sugars: "0g", fibre: "0g", protein: "0g", salt: "0g" },
    storage: "Store in a cool, dark place away from direct sunlight. The oil may go cloudy when cold — this does not affect quality.",
    origin: "Produced in Spain",
    reviews: [
      { author: "Maria, Leeds", date: "21 August 2026", rating: 5, title: "Excellent quality", body: "Lovely peppery taste. Great on salads." },
      { author: "Paul, Wetherby", date: "4 July 2026", rating: 4, title: "Good oil", body: "Nice flavour for the price." },
      { author: "Nadia, Leeds", date: "13 May 2026", rating: 5, title: "My go-to oil", body: "I use it for everything. The glass bottle is a nice touch." },
    ],
  },
  "kitchen-roll": {
    unitPrice: "£1.00 per roll",
    description: "Thick and absorbent 2-ply kitchen roll for mopping up spills and wiping surfaces.",
    highlights: ["Pack of 2 rolls", "2-ply, 70 sheets per roll", "Extra absorbent"],
    usage: "Do not flush down the toilet. Dispose of used sheets in your general waste or food waste bin.",
    storage: "Store in a dry place.",
    reviews: [
      { author: "Janet, Leeds", date: "2 August 2026", rating: 4, title: "Absorbent", body: "Soaks up spills really well. Sheets tear off neatly." },
      { author: "Alan, Rothwell", date: "19 June 2026", rating: 3, title: "Rolls are small", body: "Good quality but I get through a roll quickly." },
      { author: "Zainab, Leeds", date: "6 April 2026", rating: 5, title: "Very good", body: "Strong even when wet. Would buy again." },
    ],
  },
  "laundry-detergent": {
    unitPrice: "£0.43 per 100ml",
    description: "Concentrated liquid laundry detergent that removes tough stains even at 30°C. Leaves clothes fresh and clean.",
    highlights: ["1.5 litre bottle — 50 washes", "Works at 30°C to save energy", "Suitable for whites and colours"],
    usage: "Use 1 cap (35ml) for a normal load, or 1½ caps for heavily soiled items. Pour into the drum before adding clothes.",
    safety: "Causes serious eye irritation. Keep out of reach of children. Do not swallow. IF SWALLOWED: Call a doctor if you feel unwell. IF IN EYES: Rinse cautiously with water for several minutes.",
    reviews: [
      { author: "Christine, Leeds", date: "24 August 2026", rating: 5, title: "Clothes come out lovely", body: "Great at 30 degrees and smells fresh for days." },
      { author: "Imran, Bradford", date: "11 July 2026", rating: 4, title: "Good detergent", body: "Removes most stains. The bottle lasts ages." },
      { author: "Doreen, Pontefract", date: "20 March 2026", rating: 4, title: "Nice smell", body: "Pricier than some, but you use less." },
    ],
  },
  carrots: {
    unitPrice: "£0.08 per 100g",
    description: "Sweet, crunchy British carrots. Lovely roasted, boiled or grated raw into salads.",
    highlights: ["1kg bag", "Grown in the UK", "Counts as 1 of your 5 a day (80g)"],
    ingredients: "Carrots.",
    allergens: "No allergens.",
    nutrition: { per: "100g", serving: "80g portion", energy: "144kJ / 34kcal", fat: "0.3g", saturates: "0.1g", carbohydrate: "7.9g", sugars: "7.4g", fibre: "2.4g", protein: "0.6g", salt: "0.10g" },
    storage: "Keep refrigerated. Wash before use.",
    origin: "Grown in the UK",
    reviews: [
      { author: "Barbara, Leeds", date: "26 August 2026", rating: 5, title: "Fresh and sweet", body: "Lovely carrots, lasted well in the fridge." },
      { author: "Frank, Horsforth", date: "8 July 2026", rating: 4, title: "Good size", body: "Nice even carrots, great for roasting." },
      { author: "Sana, Leeds", date: "17 May 2026", rating: 4, title: "Good value", body: "Cheap and tasty. A couple were a bit bendy." },
    ],
  },
  bananas: {
    unitPrice: "£0.19 each",
    description: "Ripe and ready-to-eat bananas, a great healthy snack for any time of day.",
    highlights: ["Pack of 5", "Fairtrade", "Counts as 1 of your 5 a day"],
    ingredients: "Bananas.",
    allergens: "No allergens.",
    nutrition: { per: "100g", serving: "1 banana (100g)", energy: "403kJ / 95kcal", fat: "0.3g", saturates: "0.1g", carbohydrate: "20.3g", sugars: "18.1g", fibre: "1.4g", protein: "1.2g", salt: "0g" },
    storage: "Store at room temperature. Do not refrigerate.",
    origin: "Produce of Colombia",
    reviews: [
      { author: "June, Leeds", date: "29 August 2026", rating: 4, title: "Nice bananas", body: "Arrived slightly green, ripe in two days." },
      { author: "Kevin, Seacroft", date: "12 July 2026", rating: 5, title: "Perfect", body: "Just how I like them." },
      { author: "Grace, Headingley", date: "3 June 2026", rating: 3, title: "Ripened fast", body: "Tasty but went brown quite quickly." },
    ],
  },
  apples: {
    unitPrice: "£0.27 each",
    description: "Crisp and juicy British Gala apples with a sweet, mild flavour.",
    highlights: ["Pack of 6", "British Gala apples", "Counts as 1 of your 5 a day"],
    ingredients: "Apples.",
    allergens: "No allergens.",
    nutrition: { per: "100g", serving: "1 apple (130g)", energy: "218kJ / 51kcal", fat: "0.1g", saturates: "0g", carbohydrate: "11.6g", sugars: "11.6g", fibre: "1.8g", protein: "0.6g", salt: "0g" },
    storage: "Keep refrigerated. Wash before eating.",
    origin: "Grown in the UK",
    reviews: [
      { author: "Irene, Leeds", date: "15 August 2026", rating: 5, title: "Crunchy!", body: "Lovely crisp apples, sweet and juicy." },
      { author: "Colin, Armley", date: "1 July 2026", rating: 4, title: "Good apples", body: "Nice size and taste. Good for lunch boxes." },
      { author: "Leila, Leeds", date: "22 April 2026", rating: 4, title: "Tasty", body: "Good flavour, one had a small bruise." },
    ],
  },
  eggs: {
    unitPrice: "£0.33 each",
    description: "Medium free range eggs from British hens. Class A and stamped with the British Lion mark.",
    highlights: ["6 medium eggs", "Free range", "British Lion quality"],
    ingredients: "Free Range Eggs.",
    allergens: "Contains Eggs.",
    nutrition: { per: "100g", serving: "1 egg (58g)", energy: "551kJ / 131kcal", fat: "9.0g", saturates: "2.5g", carbohydrate: "0g", sugars: "0g", fibre: "0g", protein: "12.6g", salt: "0.39g" },
    storage: "Keep refrigerated. Best before date is printed on each egg. Cook until the white and yolk are solid.",
    origin: "Produced in the UK",
    reviews: [
      { author: "Dorothy, Leeds", date: "27 August 2026", rating: 5, title: "Lovely eggs", body: "Bright orange yolks. Make a great breakfast." },
      { author: "Mark, Chapel Allerton", date: "5 July 2026", rating: 5, title: "Fresh", body: "Always fresh and none broken." },
      { author: "Hannah, Leeds", date: "10 May 2026", rating: 4, title: "Good", body: "Nice eggs, a bit small for medium." },
    ],
  },
  potatoes: {
    unitPrice: "£0.09 per 100g",
    description: "Versatile red-skinned potatoes with a fluffy texture. Perfect for mashing, roasting and baking.",
    highlights: ["2kg bag", "Great for roasting and mash", "Grown in the UK"],
    ingredients: "Potatoes.",
    allergens: "No allergens.",
    nutrition: { per: "100g", serving: "175g portion (raw)", energy: "327kJ / 77kcal", fat: "0.2g", saturates: "0g", carbohydrate: "17.0g", sugars: "0.8g", fibre: "1.4g", protein: "2.0g", salt: "0g" },
    storage: "Store in a cool, dark place. Remove from the bag. Do not eat green potatoes.",
    origin: "Grown in the UK",
    reviews: [
      { author: "Norman, Leeds", date: "18 August 2026", rating: 5, title: "Best roasties", body: "Crispy outside and fluffy inside. Perfect." },
      { author: "Shirley, Bramley", date: "30 June 2026", rating: 4, title: "Good potatoes", body: "Nice and clean, good size." },
      { author: "Omar, Leeds", date: "9 April 2026", rating: 4, title: "Good mash", body: "Make lovely creamy mash." },
    ],
  },
  "cheddar-cheese": {
    unitPrice: "£0.94 per 100g",
    description: "A creamy, full-flavoured mature Cheddar, aged for up to 9 months. Great in sandwiches or melted on toast.",
    highlights: ["400g block", "Mature, strength 4", "Made with British milk", "Suitable for vegetarians"],
    ingredients: "Mature Cheddar Cheese (Milk).",
    allergens: "Contains Milk.",
    nutrition: { per: "100g", serving: "30g portion", energy: "1725kJ / 416kcal", fat: "34.9g", saturates: "21.7g", carbohydrate: "0.1g", sugars: "0.1g", fibre: "0g", protein: "25.4g", salt: "1.80g" },
    storage: "Keep refrigerated. Once opened, wrap well and eat within 7 days.",
    origin: "Made in the UK",
    reviews: [
      { author: "Roy, Leeds", date: "23 August 2026", rating: 5, title: "Proper cheese", body: "Lovely tangy flavour. Great on crackers." },
      { author: "Wendy, Kirkstall", date: "14 July 2026", rating: 4, title: "Tasty", body: "Melts nicely for cheese on toast." },
      { author: "Yusuf, Leeds", date: "28 May 2026", rating: 5, title: "Great value", body: "Better than more expensive cheddars." },
    ],
  },
  butter: {
    unitPrice: "£0.84 per 100g",
    description: "Rich and creamy salted butter made with fresh British cream. Perfect for spreading, baking and cooking.",
    highlights: ["250g block", "Salted", "Made with British cream"],
    ingredients: "Butter (Milk), Salt (1.5%).",
    allergens: "Contains Milk.",
    nutrition: { per: "100g", serving: "10g portion", energy: "3041kJ / 740kcal", fat: "82.2g", saturates: "52.1g", carbohydrate: "0.6g", sugars: "0.6g", fibre: "0g", protein: "0.6g", salt: "1.50g" },
    storage: "Keep refrigerated. Suitable for freezing.",
    reviews: [
      { author: "Marjorie, Leeds", date: "16 August 2026", rating: 5, title: "Lovely butter", body: "Creamy and tasty — great for baking." },
      { author: "Peter, Meanwood", date: "29 June 2026", rating: 4, title: "Good", body: "Nice flavour, hard to spread straight from the fridge." },
      { author: "Ruth, Leeds", date: "7 April 2026", rating: 5, title: "Perfect", body: "Proper butter taste. Good price." },
    ],
  },
  "orange-juice": {
    unitPrice: "£0.17 per 100ml",
    description: "Smooth, not-from-concentrate orange juice made from freshly squeezed oranges. No added sugar.",
    highlights: ["1 litre carton", "Smooth, no bits", "No added sugar", "Counts as 1 of your 5 a day (150ml)"],
    ingredients: "Pure Squeezed Orange Juice.",
    allergens: "No allergens.",
    nutrition: { per: "100ml", serving: "1 glass (150ml)", energy: "188kJ / 44kcal", fat: "0g", saturates: "0g", carbohydrate: "8.8g", sugars: "8.8g", fibre: "0.5g", protein: "0.7g", salt: "0g" },
    storage: "Keep refrigerated. Once opened, use within 5 days. Shake well before serving.",
    reviews: [
      { author: "Beryl, Leeds", date: "20 August 2026", rating: 5, title: "Tastes fresh", body: "Like freshly squeezed. Lovely with breakfast." },
      { author: "Neil, Roundhay", date: "2 July 2026", rating: 4, title: "Nice juice", body: "Good taste, carton is easy to pour." },
      { author: "Aisha, Leeds", date: "19 May 2026", rating: 3, title: "A bit sharp", body: "Nice but a little sour for me." },
    ],
  },
  spaghetti: {
    unitPrice: "£0.17 per 100g",
    description: "Classic Italian-style spaghetti made from durum wheat semolina. Holds sauce perfectly.",
    highlights: ["500g pack, about 6 servings", "Made with durum wheat", "Ready in 10–12 minutes"],
    ingredients: "Durum Wheat Semolina.",
    allergens: "Contains Wheat and Gluten.",
    nutrition: { per: "100g", serving: "75g portion (dry)", energy: "1519kJ / 359kcal", fat: "1.5g", saturates: "0.3g", carbohydrate: "71.2g", sugars: "3.5g", fibre: "3.0g", protein: "12.5g", salt: "0.01g" },
    usage: "Add to a large pan of boiling water. Simmer for 10–12 minutes, stirring now and then. Drain and serve.",
    storage: "Store in a cool, dry place. Once opened, keep in an airtight container.",
    reviews: [
      { author: "Enzo, Leeds", date: "11 August 2026", rating: 4, title: "Good pasta", body: "Cooks well and doesn't go sticky." },
      { author: "Gillian, Moortown", date: "24 June 2026", rating: 5, title: "Great value", body: "As good as the Italian brands." },
      { author: "Tom, Leeds", date: "5 March 2026", rating: 4, title: "Nice", body: "Good texture. Lovely with bolognese." },
    ],
  },
  "baked-beans": {
    unitPrice: "£0.23 per 100g",
    description: "Tender haricot beans in a rich tomato sauce. A classic on toast or with a cooked breakfast.",
    highlights: ["415g tin", "High in fibre", "Counts as 1 of your 5 a day (half a tin)", "Suitable for vegans"],
    ingredients: "Beans (51%), Tomatoes (34%), Water, Sugar, Spirit Vinegar, Modified Cornflour, Salt, Spice Extracts, Herb Extract.",
    allergens: "No allergens.",
    nutrition: { per: "100g", serving: "half a tin (207g)", energy: "330kJ / 78kcal", fat: "0.2g", saturates: "0g", carbohydrate: "12.5g", sugars: "4.7g", fibre: "3.8g", protein: "4.7g", salt: "0.60g" },
    usage: "Hob: empty into a saucepan and heat gently for 4–5 minutes, stirring. Microwave: empty into a bowl, cover and heat for 2 minutes, stir, then heat for 1 more minute.",
    storage: "Store in a cool, dry place. Once opened, move to a covered container, keep refrigerated and eat within 2 days.",
    reviews: [
      { author: "Bill, Leeds", date: "30 August 2026", rating: 5, title: "Can't beat them", body: "The best beans. Lovely thick sauce." },
      { author: "Kate, Beeston", date: "17 July 2026", rating: 5, title: "Family favourite", body: "The kids won't eat any other brand!" },
      { author: "Ahmed, Leeds", date: "26 May 2026", rating: 4, title: "Tasty", body: "Great on toast. Would like a ring-pull lid." },
    ],
  },
  "bin-bags": {
    unitPrice: "£0.12 per bag",
    description: "Strong 50 litre black bin bags with easy-tie handles. Fits most standard kitchen bins.",
    highlights: ["Roll of 20 bags", "50 litre", "Tie handles", "Made from 100% recycled plastic"],
    usage: "Tear off one bag along the perforated line, open it out and fit it inside your bin. Tie the handles to close when full.",
    safety: "To avoid danger of suffocation, keep bags away from babies and children. Do not use in cots, beds, prams or playpens.",
    reviews: [
      { author: "Graham, Leeds", date: "13 August 2026", rating: 4, title: "Strong bags", body: "Don't split easily. The handles are handy." },
      { author: "Susan, Yeadon", date: "28 June 2026", rating: 3, title: "A bit thin", body: "OK for general rubbish, not for anything sharp." },
      { author: "Hassan, Leeds", date: "14 April 2026", rating: 5, title: "Great", body: "Perfect fit for my kitchen bin." },
    ],
  },
  "hand-soap": {
    unitPrice: "£0.50 per 100ml",
    description: "Gentle moisturising liquid hand soap with aloe vera. Leaves hands clean, soft and lightly scented.",
    highlights: ["250ml pump bottle", "With aloe vera", "Dermatologically tested"],
    ingredients: "Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Sodium Chloride, Glycerin, Parfum, Aloe Barbadensis Leaf Juice, Citric Acid, Sodium Benzoate.",
    usage: "Pump a small amount onto wet hands, lather for 20 seconds, then rinse.",
    safety: "For external use only. Avoid contact with eyes. If contact occurs, rinse well with water.",
    reviews: [
      { author: "Valerie, Leeds", date: "22 August 2026", rating: 5, title: "Lovely and gentle", body: "Doesn't dry my hands. Smells nice and fresh." },
      { author: "Derek, Guiseley", date: "9 July 2026", rating: 4, title: "Good soap", body: "Nice soap. Pump works well." },
      { author: "Mei, Leeds", date: "3 May 2026", rating: 4, title: "Nice", body: "Good for sensitive skin." },
    ],
  },
  toothpaste: {
    unitPrice: "£2.13 per 100ml",
    description: "Fluoride toothpaste that helps fight cavities and freshen breath, with a cool mint flavour.",
    highlights: ["75ml tube", "Contains fluoride (1450ppm)", "Fresh mint flavour"],
    ingredients: "Aqua, Hydrated Silica, Sorbitol, Glycerin, Sodium Lauryl Sulfate, Aroma, Sodium Fluoride, Cellulose Gum, Sodium Saccharin, Limonene.",
    usage: "Brush teeth thoroughly twice a day. Children under 6: use a pea-sized amount and supervise brushing.",
    safety: "Do not swallow. Contains sodium fluoride. If you are taking fluoride from other sources, ask your dentist.",
    reviews: [
      { author: "Edna, Leeds", date: "17 August 2026", rating: 5, title: "Fresh feeling", body: "Leaves my mouth feeling really clean." },
      { author: "Clive, Farsley", date: "25 June 2026", rating: 4, title: "Good toothpaste", body: "Nice minty taste, not too strong." },
      { author: "Rukhsana, Leeds", date: "12 March 2026", rating: 4, title: "Good price", body: "Does the job well for less money." },
    ],
  },
  sponges: {
    unitPrice: "£0.33 each",
    description: "Soft, absorbent viscose sponges for washing up and wiping down kitchen surfaces.",
    highlights: ["Pack of 3", "Non-scratch — safe on non-stick pans", "Machine washable at 60°C"],
    usage: "Rinse well after each use and leave to dry. Replace regularly for good hygiene.",
    reviews: [
      { author: "Sheila, Leeds", date: "8 August 2026", rating: 4, title: "Soft and absorbent", body: "Good for wiping surfaces. Last a few weeks each." },
      { author: "Terry, Bramhope", date: "21 June 2026", rating: 3, title: "OK", body: "Fine for the price but they wear out quickly." },
      { author: "Nasreen, Leeds", date: "30 April 2026", rating: 5, title: "Useful", body: "Great for my non-stick pans, no scratches." },
    ],
  },
};

export function getProductDetails(productId: string): ProductDetails | undefined {
  return PRODUCT_DETAILS[productId];
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((total, review) => total + review.rating, 0) / reviews.length) * 10) / 10;
}
