import type { Metadata } from "next";
import ShopCatalog from "./ShopCatalog";

export const metadata: Metadata = {
  title: "Practice Shop | Computer Steps",
  description: "Practise online shopping safely: search for items, fill a basket and check out with a pretend bank card.",
};

export default function ShopPage() {
  return <ShopCatalog />;
}
