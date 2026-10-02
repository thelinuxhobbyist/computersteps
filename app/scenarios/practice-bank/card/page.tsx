import type { Metadata } from "next";
import MyCard from "./MyCard";

export const metadata: Metadata = {
  title: "My card",
};

export default function CardPage() {
  return <MyCard />;
}
