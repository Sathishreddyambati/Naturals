import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import ReviewModeration from "@/components/admin/ReviewModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const rows = await db
    .select({
      id: reviews.id,
      productName: products.name,
      customerName: reviews.customerName,
      rating: reviews.rating,
      comment: reviews.comment,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt));

  return <ReviewModeration reviews={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))} />;
}
