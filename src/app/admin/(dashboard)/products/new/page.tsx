import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Add Product</h1>
      <p className="mt-1 text-sm text-white/50">Create a new product with pack sizes and pricing.</p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
