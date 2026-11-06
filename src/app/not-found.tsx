import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md text-center">
      <h1 className="text-xl font-semibold">Ez az oldal nem létezik</h1>
      <p className="mt-2 text-muted">Lehet, hogy elírás van a címben.</p>
      <Link href="/" className="btn btn-primary mt-5">
        Vissza a számolóhoz
      </Link>
    </div>
  );
}
