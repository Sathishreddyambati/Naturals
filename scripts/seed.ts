/**
 * Idempotent seed script — safe to run multiple times.
 * Usage: npx tsx scripts/seed.ts
 */
import "dotenv/config";
import { db } from "../src/db";
import { admins, products, productVariants, coupons } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@indiranaturals.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const [existing] = await db.select().from(admins).where(eq(admins.email, email));
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }
  const passwordHash = await hashPassword(password);
  await db.insert(admins).values({ email, passwordHash, name: "Indira Naturals Admin" });
  console.log(`Seeded admin account: ${email}`);
}

type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string;
  usage: string;
  image: string;
  isFeatured: boolean;
  sortOrder: number;
  variants: { packSize: string; price: number; compareAtPrice?: number; stock: number }[];
};

const seedProducts: SeedProduct[] = [
  {
    slug: "garlic-powder",
    name: "Pure Garlic Powder",
    tagline: "Slow-dried garlic, milled fine",
    description:
      "Our garlic powder is made from sun-ripened garlic bulbs, dehydrated at low temperature and stone-milled to preserve natural aroma and pungency. One ingredient, nothing else.",
    ingredients: "100% Dehydrated Garlic.",
    usage: "Use in curries, marinades, soups and rubs. 1/4 tsp powder ≈ 1 fresh clove.",
    image: "/images/products/garlic-powder.png",
    isFeatured: true,
    sortOrder: 1,
    variants: [
      { packSize: "50g", price: 14900, compareAtPrice: 16900, stock: 120 },
      { packSize: "100g", price: 24900, compareAtPrice: 27900, stock: 90 },
      { packSize: "250g", price: 54900, stock: 40 },
    ],
  },
  {
    slug: "ginger-powder",
    name: "Pure Ginger Powder",
    tagline: "Fresh ginger root, gently dried",
    description:
      "Harvested ginger root washed, sliced and dried before fine milling, retaining its warm aroma and natural heat for cooking, baking and teas.",
    ingredients: "100% Dehydrated Ginger.",
    usage: "Great in teas, baked goods, curries and golden milk. 1/4 tsp ≈ 1 tsp fresh grated ginger.",
    image: "/images/products/ginger-powder.png",
    isFeatured: true,
    sortOrder: 2,
    variants: [
      { packSize: "50g", price: 14900, stock: 100 },
      { packSize: "100g", price: 24900, stock: 70 },
      { packSize: "250g", price: 54900, stock: 25 },
    ],
  },
  {
    slug: "onion-powder",
    name: "Pure Onion Powder",
    tagline: "Slow-dried onions, deep flavour",
    description:
      "Made from quality onions, thinly sliced and dehydrated to concentrate their natural sweetness, then milled into a fine, pantry-friendly powder.",
    ingredients: "100% Dehydrated Onion.",
    usage: "Use in gravies, dry rubs, snacks and spice blends. 1 tbsp ≈ 1 small onion.",
    image: "/images/products/onion-powder.png",
    isFeatured: true,
    sortOrder: 3,
    variants: [
      { packSize: "50g", price: 13900, stock: 110 },
      { packSize: "100g", price: 22900, stock: 80 },
      { packSize: "250g", price: 49900, stock: 30 },
    ],
  },
  {
    slug: "tomato-powder",
    name: "Pure Tomato Powder",
    tagline: "Vine-ripened tomatoes, concentrated",
    description:
      "Ripe tomatoes dried and milled into a vibrant powder that adds tangy depth to soups, sauces and masalas without adding extra liquid.",
    ingredients: "100% Dehydrated Tomato.",
    usage: "Mix with water for quick tomato paste, or stir into curries, soups and chutneys.",
    image: "/images/products/tomato-powder.png",
    isFeatured: true,
    sortOrder: 4,
    variants: [
      { packSize: "50g", price: 15900, stock: 95 },
      { packSize: "100g", price: 26900, stock: 60 },
      { packSize: "250g", price: 59900, stock: 20 },
    ],
  },
  {
    slug: "turmeric-powder",
    name: "Pure Turmeric Powder",
    tagline: "Golden roots, stone-milled",
    description:
      "Turmeric roots cleaned, boiled, dried and stone-milled the traditional way for a vivid colour and earthy aroma in everyday cooking.",
    ingredients: "100% Turmeric Root.",
    usage: "A kitchen staple for curries, rice, milk and more.",
    image: "/images/products/turmeric-powder.png",
    isFeatured: false,
    sortOrder: 5,
    variants: [
      { packSize: "100g", price: 19900, stock: 85 },
      { packSize: "250g", price: 44900, stock: 35 },
    ],
  },
  {
    slug: "beetroot-powder",
    name: "Pure Beetroot Powder",
    tagline: "Earthy, vibrant, versatile",
    description:
      "Fresh beetroot dried and milled into a vivid powder — a natural way to add colour and earthy sweetness to smoothies, batters and dips.",
    ingredients: "100% Dehydrated Beetroot.",
    usage: "Blend into smoothies, batters, dips or natural food colouring.",
    image: "/images/products/beetroot-powder.png",
    isFeatured: false,
    sortOrder: 6,
    variants: [
      { packSize: "50g", price: 17900, stock: 70 },
      { packSize: "100g", price: 29900, stock: 40 },
    ],
  },
];

async function seedProductsAndVariants() {
  for (const p of seedProducts) {
    const [existing] = await db.select().from(products).where(eq(products.slug, p.slug));
    let productId: number;
    if (existing) {
      productId = existing.id;
      await db
        .update(products)
        .set({
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          ingredients: p.ingredients,
          usage: p.usage,
          images: [p.image],
          isFeatured: p.isFeatured,
          sortOrder: p.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
      console.log(`Updated product: ${p.slug}`);
    } else {
      const [inserted] = await db
        .insert(products)
        .values({
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          category: "powders",
          images: [p.image],
          ingredients: p.ingredients,
          usage: p.usage,
          isActive: true,
          isFeatured: p.isFeatured,
          sortOrder: p.sortOrder,
        })
        .returning();
      productId = inserted.id;
      console.log(`Inserted product: ${p.slug}`);
    }

    const existingVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    for (let i = 0; i < p.variants.length; i++) {
      const v = p.variants[i];
      const match = existingVariants.find((ev) => ev.packSize === v.packSize);
      if (match) {
        await db
          .update(productVariants)
          .set({ price: v.price, compareAtPrice: v.compareAtPrice ?? null, stock: v.stock, sortOrder: i })
          .where(eq(productVariants.id, match.id));
      } else {
        await db.insert(productVariants).values({
          productId,
          packSize: v.packSize,
          sku: `${p.slug.toUpperCase().replace(/-/g, "")}-${v.packSize}`,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          stock: v.stock,
          isActive: true,
          sortOrder: i,
        });
      }
    }
  }
}

async function seedCoupon() {
  const code = "FRESH10";
  const [existing] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (existing) {
    console.log(`Coupon already exists: ${code}`);
    return;
  }
  await db.insert(coupons).values({
    code,
    type: "percent",
    value: 10,
    minOrderValue: 50000,
    maxDiscount: 20000,
    isActive: true,
  });
  console.log(`Seeded coupon: ${code}`);
}

async function main() {
  await seedAdmin();
  await seedProductsAndVariants();
  await seedCoupon();
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
