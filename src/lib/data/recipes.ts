export type Recipe = {
  slug: string;
  title: string;
  description: string;
  time: string;
  servings: string;
  image: string;
  ingredients: string[];
  steps: string[];
  usesProducts: string[]; // product slugs
};

export const recipes: Recipe[] = [
  {
    slug: "weeknight-garlic-ginger-stir-fry",
    title: "Weeknight Garlic-Ginger Stir Fry",
    description:
      "A fast, pantry-friendly stir fry that leans on Indira Naturals garlic and ginger powder for deep flavour without any chopping.",
    time: "20 min",
    servings: "2–3",
    image: "/images/products/ginger-powder.png",
    ingredients: [
      "2 cups mixed vegetables, sliced",
      "1 tbsp oil",
      "1 tsp Indira Naturals Garlic Powder",
      "1 tsp Indira Naturals Ginger Powder",
      "2 tbsp soy sauce",
      "1 tsp Indira Naturals Onion Powder",
      "Spring onions, to garnish",
    ],
    steps: [
      "Heat oil in a wok over high heat.",
      "Add vegetables and stir fry for 3–4 minutes until just tender.",
      "Sprinkle in garlic powder, ginger powder and onion powder, tossing to coat evenly.",
      "Add soy sauce and stir fry for another minute.",
      "Garnish with spring onions and serve hot over rice or noodles.",
    ],
    usesProducts: ["garlic-powder", "ginger-powder", "onion-powder"],
  },
  {
    slug: "instant-tomato-curry-base",
    title: "Instant Tomato Curry Base",
    description:
      "Keep this concentrate-style base on hand using tomato and onion powder for curries in minutes.",
    time: "15 min",
    servings: "4",
    image: "/images/products/tomato-powder.png",
    ingredients: [
      "3 tbsp Indira Naturals Tomato Powder",
      "1 tbsp Indira Naturals Onion Powder",
      "1 tsp Indira Naturals Garlic Powder",
      "1/2 cup warm water",
      "2 tbsp oil or ghee",
      "Salt and spices of choice",
    ],
    steps: [
      "Whisk tomato powder, onion powder, garlic powder and warm water into a smooth paste.",
      "Heat oil in a pan and pour in the paste, stirring continuously for 2–3 minutes.",
      "Add your choice of vegetables, paneer or legumes and simmer until cooked through.",
      "Season with salt and spices to taste and serve with rice or flatbread.",
    ],
    usesProducts: ["tomato-powder", "onion-powder", "garlic-powder"],
  },
  {
    slug: "golden-turmeric-ginger-milk",
    title: "Golden Turmeric-Ginger Milk",
    description:
      "A warming evening drink made with turmeric and ginger powder — a simple way to end the day.",
    time: "10 min",
    servings: "2",
    image: "/images/products/turmeric-powder.png",
    ingredients: [
      "2 cups milk (dairy or plant-based)",
      "1 tsp Indira Naturals Turmeric Powder",
      "1/2 tsp Indira Naturals Ginger Powder",
      "1 tbsp honey or jaggery, to taste",
      "A pinch of black pepper",
    ],
    steps: [
      "Warm the milk gently in a saucepan over low heat.",
      "Whisk in turmeric powder, ginger powder and black pepper.",
      "Simmer for 3–4 minutes, stirring occasionally.",
      "Remove from heat, stir in honey or jaggery, and serve warm.",
    ],
    usesProducts: ["turmeric-powder", "ginger-powder"],
  },
  {
    slug: "beetroot-hummus",
    title: "Vibrant Beetroot Hummus",
    description:
      "Classic hummus gets a naturally vivid twist with Indira Naturals beetroot powder.",
    time: "10 min",
    servings: "4",
    image: "/images/products/beetroot-powder.png",
    ingredients: [
      "1.5 cups cooked chickpeas",
      "2 tbsp tahini",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "1 tsp Indira Naturals Beetroot Powder",
      "1/2 tsp Indira Naturals Garlic Powder",
      "Salt, to taste",
    ],
    steps: [
      "Add all ingredients to a food processor.",
      "Blend until smooth, adding a splash of water if needed for consistency.",
      "Taste and adjust salt and lemon juice.",
      "Serve with pita, crackers or fresh vegetables.",
    ],
    usesProducts: ["beetroot-powder", "garlic-powder"],
  },
];

export function getRecipeBySlug(slug: string) {
  return recipes.find((r) => r.slug === slug) ?? null;
}
