import type { Metadata } from "next";
import Presets from "./Presets";

export const metadata: Metadata = { title: "Sávok" };

export default function Page() {
  return <Presets />;
}
