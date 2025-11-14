// app/casques/page.jsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';


// Fonction pour récupérer les casques avec leurs statistiques d’avis
async function getheadphonesWithStats() {
  // 1) on récupère tous les produits + les ratings associés
  const { data, error } = await supabase
    .from('headphones')
    .select(`
      id,
      sku,
      name,
      range,
      price_eur,
      image_path,
      image_alt,
      short_description,
      reviews:reviews (rating)
    `)
    .order('price_eur', { ascending: true });

  if (error) {
    console.error(error);
    throw new Error('Erreur lors du chargement des produits');
  }

  // 2) on calcule moyenne + nombre d’avis
  const headphones = data.map((headphone) => {
    const ratings = headphone.reviews?.map((r) => r.rating) ?? [];
    const reviewsCount = ratings.length;
    const avgRating =
      reviewsCount > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r, 0) / reviewsCount) * 10
          ) / 10
        : null;

    // 3) URL publique de l’image (bucket "images")
    const { data: imageData } = supabase.storage
      .from('images')
      .getPublicUrl(headphone.image_path);

    return {
      ...headphone,
      imageUrl: imageData?.publicUrl || null,
      reviewsCount,
      avgRating
    };
  });

  return headphones;
}



export default async function CasquesPage() {
  const headphones = await getheadphonesWithStats();

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

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {headphones.map((headphone) => (
            <article
              key={headphone.id}
              className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 flex flex-col"
            >
              {headphone.imageUrl && (
                <div className="mb-4 aspect-4/3 overflow-hidden rounded-lg bg-slate-800 flex items-center justify-center">
                  <Image
                    src={headphone.imageUrl}
                    alt={headphone.image_alt}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <div className="text-xs uppercase tracking-wide text-sky-400 mb-1">
                  {headphone.range}
                </div>

                <h2 className="text-lg font-semibold mb-1">
                  {headphone.name}
                </h2>

                <p className="text-sm text-slate-300 mb-3">
                  {headphone.short_description}
                </p>

                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="font-semibold text-sky-300">
                    {headphone.price_eur} €
                  </span>

                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    {headphone.avgRating ? (
                      <>
                        <span>
                          ⭐ {headphone.avgRating.toFixed(1)} / 5
                        </span>
                        <span className="text-slate-500">
                          ({headphone.reviewsCount} avis)
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500">Aucun avis</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                  <span>SKU : {headphone.sku}</span>
                  <span>ID : {headphone.id}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

