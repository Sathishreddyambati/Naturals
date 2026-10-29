import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ---------- Admins ----------
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull().default("Admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Customers ----------
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Products ----------
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    tagline: varchar("tagline", { length: 255 }).notNull().default(""),
    description: text("description").notNull().default(""),
    category: varchar("category", { length: 100 }).notNull().default("powders"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    ingredients: text("ingredients").notNull().default(""),
    usage: text("usage").notNull().default(""),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("products_category_idx").on(table.category)],
);

// ---------- Product Variants (pack sizes) ----------
export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    packSize: varchar("pack_size", { length: 50 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    price: integer("price").notNull(), // stored in paise (INR smallest unit)
    compareAtPrice: integer("compare_at_price"),
    stock: integer("stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("variants_product_idx").on(table.productId)],
);

// ---------- Coupons ----------
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // 'percent' | 'flat'
  value: integer("value").notNull(), // percent (0-100) or flat paise
  minOrderValue: integer("min_order_value").notNull().default(0),
  maxDiscount: integer("max_discount"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Orders ----------
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
    customerId: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    shippingAddress: jsonb("shipping_address").$type<{
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    }>().notNull(),
    items: jsonb("items")
      .$type<
        Array<{
          productId: number;
          variantId: number;
          name: string;
          packSize: string;
          image: string;
          price: number;
          quantity: number;
        }>
      >()
      .notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    shippingFee: integer("shipping_fee").notNull().default(0),
    total: integer("total").notNull(),
    couponCode: varchar("coupon_code", { length: 50 }),
    paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("razorpay"),
    status: varchar("status", { length: 30 }).notNull().default("pending_payment"),
    // pending_payment | paid | processing | shipped | delivered | cancelled | failed | refunded
    paymentStatus: varchar("payment_status", { length: 30 }).notNull().default("pending"),
    // pending | paid | failed | refunded
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
    razorpaySignature: text("razorpay_signature"),
    trackingCarrier: varchar("tracking_carrier", { length: 100 }),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    statusHistory: jsonb("status_history")
      .$type<Array<{ status: string; at: string; note?: string }>>()
      .notNull()
      .default([]),
    stockRestored: boolean("stock_restored").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_email_idx").on(table.email),
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
  ],
);

// ---------- Reviews ----------
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    isApproved: boolean("is_approved").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("reviews_product_idx").on(table.productId)],
);

// ---------- Contact Messages ----------
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull().default("General Inquiry"),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Newsletter ----------
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Store Settings (singleton row) ----------
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------- Processed Webhook Events (idempotency) ----------
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 100 }).notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const numericHelper = numeric; // retained for potential future use
