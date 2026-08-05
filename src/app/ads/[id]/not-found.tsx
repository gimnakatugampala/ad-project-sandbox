import Link from "next/link";

export default function AdvertisementNotFound() {
  return (
    <main className="mx-auto max-w-2xl p-6 text-center">
      <h1 className="text-3xl font-bold">
        Advertisement not found
      </h1>

      <p className="mt-3 text-muted-foreground">
        This advertisement does not exist or is no
        longer publicly available.
      </p>

      <Link
        href="/ads"
        className="mt-6 inline-block underline"
      >
        Return to advertisements
      </Link>
    </main>
  );
}