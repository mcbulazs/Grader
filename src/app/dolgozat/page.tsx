import type { Metadata } from "next";
import TestGrader from "./TestGrader";

export const metadata: Metadata = { title: "Dolgozat" };

export default function Page() {
  return <TestGrader />;
}
