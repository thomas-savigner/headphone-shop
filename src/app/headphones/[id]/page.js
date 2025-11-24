// app/headphones/[id]/page.jsx
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

// Fonction pour récupérer un produit avec ses avis
async function getProductWithReviews(id) {
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
      description,
      type,
      connectivity,
      driver_size_mm,
      frequency_response_hz,
      impedance_ohm,
      sensitivity_db,
      weight_g,
      battery_life_h,
      microphone,
      noise_cancelling,
      created_at,
      reviews:reviews (
        review_id,
        author,
        rating,
        comment,
        date
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error) {
      console.error(error);
    }
    return null;
  }

  const ratings = data.reviews?.map((r) => r.rating) ?? [];
  const reviewsCount = ratings.length;
  const avgRating =
    reviewsCount > 0
      ? Math.round(
        (ratings.reduce((sum, r) => sum + r, 0) / reviewsCount) * 10
      ) / 10
      : null;

  const rawImagePath = data.image_path ?? '';
  const cleanPath = rawImagePath.startsWith('images/')
    ? rawImagePath.replace(/^images\//, '')
    : rawImagePath;

  const { data: imageData } = supabase.storage
    .from('images')
    .getPublicUrl(cleanPath);

  return {
    ...data,
    imageUrl: imageData?.publicUrl || null,
    reviewsCount,
    avgRating
  };
}

export default async function CasqueDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductWithReviews(id);

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/headphones"
            className="text-sm text-sky-400 hover:underline"
          >
            ← Retour au catalogue
          </Link>
          <h1 className="text-2xl font-semibold mt-6">
            Casque introuvable
          </h1>
          <p className="text-slate-300 mt-2">
            Le produit que tu cherches n’existe pas ou plus.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/headphones"
          className="text-sm text-sky-400 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        <section className="mt-6 grid gap-8 md:grid-cols-[1.2fr,1fr]">
          {/* Colonne gauche : visuel + info principales */}
          <div>
            {product.imageUrl && (
              <div className="mb-4 w-1/2 aspect-4/3 overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
                <Image
                  width={500}
                  height={500}
                  src={product.imageUrl}
                  alt={product.image_alt}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="text-xs uppercase tracking-wide text-sky-400 mb-1">
              {product.range}
            </div>
            <h1 className="text-2xl font-semibold mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4 text-sm text-slate-200">
              <span className="text-2xl font-semibold text-sky-300">
                {product.price_eur} €
              </span>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                {product.avgRating ? (
                  <>
                    <span>⭐ {product.avgRating.toFixed(1)} / 5</span>
                    <span className="text-slate-500">
                      ({product.reviewsCount} avis)
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500">Aucun avis</span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              {product.description}
            </p>

            <div className="mt-4 text-xs text-slate-500 flex flex-wrap gap-3">
              <span>SKU : {product.sku}</span>
              <span>ID : {product.id}</span>
              {product.created_at && (
                <span>
                  Ajouté le : {new Date(product.created_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>

          {/* Colonne droite : fiche technique + avis */}
          <div className="space-y-6">
            {/* Fiche technique */}
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
              <h2 className="text-lg font-semibold mb-3">
                Fiche technique
              </h2>
              <dl className="grid grid-cols-1 text-sm gap-y-1">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Type</dt>
                  <dd>{product.type}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Connectivité</dt>
                  <dd className="text-right">{product.connectivity}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Transducteurs</dt>
                  <dd>{product.driver_size_mm} mm</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Réponse en fréquence</dt>
                  <dd>{product.frequency_response_hz} Hz</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Impédance</dt>
                  <dd>{product.impedance_ohm} Ω</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Sensibilité</dt>
                  <dd>{product.sensitivity_db} dB</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Poids</dt>
                  <dd>{product.weight_g} g</dd>
                </div>
                {product.battery_life_h && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Autonomie</dt>
                    <dd>{product.battery_life_h} h</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Micro</dt>
                  <dd>{product.microphone ? 'Oui' : 'Non'}</dd>
                </div>
                {product.noise_cancelling && product.noise_cancelling !== 'false' && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Réduction de bruit</dt>
                    <dd>{product.noise_cancelling}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Avis */}
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
              <h2 className="text-lg font-semibold mb-3">
                Avis des utilisateurs
              </h2>

              {product.reviewsCount === 0 && (
                <p className="text-sm text-slate-400">
                  Aucun avis pour le moment.
                </p>
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {product.reviews
                  ?.sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((review) => (
                    <div
                      key={review.review_id}
                      className="border border-slate-800 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          {review.author}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="text-xs text-sky-300 mb-1">
                        ⭐ {review.rating} / 5
                      </div>
                      <p className="text-slate-200 text-sm">
                        {review.comment}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
