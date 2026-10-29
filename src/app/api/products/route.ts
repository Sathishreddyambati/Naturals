import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/data/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const sort = (searchParams.get("sort") as never) ?? undefined;
  const items = await listProducts({ search, category, sort });
  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      image: p.images[0] ?? "",
      minPrice: p.minPrice,
      totalStock: p.totalStock,
    })),
  });
}
