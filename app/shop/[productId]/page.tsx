import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";
import { PRODUCTS, getProduct } from "../shop-data";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ productId: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProduct((await params).productId);
  return {
    title: product ? `${product.name} | Practice Shop | Computer Steps` : "Practice Shop | Computer Steps",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  if (!getProduct(productId)) notFound();
  return <ProductDetail productId={productId} />;
}
