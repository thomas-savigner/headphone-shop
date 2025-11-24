import Link from 'next/link';
import Image from 'next/image';


export default function HomePage() {
  
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold mb-2">
            Casques audio – catalogue
          </h1>
          <p className="text-slate-300">
            Données stockées dans Supabase (produits + avis) et affichées via
            Next.js.
          </p>
        </header>
        <section>
          <Link
            href="/headphones"
            className="text-sky-400 underline hover:text-sky-500"
          >
            Voir le catalogue des casques
          </Link>
        </section>
      </div>
    </main>
  );
}

