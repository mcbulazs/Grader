import type { Metadata } from "next";
import PrintTable from "./PrintTable";

export const metadata: Metadata = { title: "Ponttáblázat" };

export default function Page() {
  return <PrintTable />;
}
