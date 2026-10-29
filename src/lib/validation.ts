import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().default(""),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(12),
  country: z.string().min(2).max(100).default("India"),
});

export const checkoutItemSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive().max(50),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  address: addressSchema,
  items: z.array(checkoutItemSchema).min(1),
  couponCode: z.string().trim().optional().nullable(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().max(200).optional().default("General Inquiry"),
  message: z.string().min(5).max(2000),
});

export const reviewSchema = z.object({
  productId: z.number().int().positive(),
  customerName: z.string().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(["percent", "flat"]),
  value: z.number().int().positive(),
  minOrderValue: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const variantInputSchema = z.object({
  id: z.number().int().optional(),
  packSize: z.string().min(1).max(50),
  sku: z.string().min(1).max(100),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z.object({
  slug: z.string().min(2).max(255),
  name: z.string().min(2).max(255),
  tagline: z.string().max(255).optional().default(""),
  description: z.string().max(5000).optional().default(""),
  category: z.string().min(2).max(100),
  images: z.array(z.string()).default([]),
  ingredients: z.string().max(1000).optional().default(""),
  usage: z.string().max(1000).optional().default(""),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  variants: z.array(variantInputSchema).min(1),
});
