// app/casques/page.js
import { supabase } from '@/lib/supabaseClient';
import HeadphonesList from '@/components/HeadphonesList';

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
      type,
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



export default async function Heaphones() {
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
        <HeadphonesList initialProducts={headphones} />
      </div>
    </main>
  );
}

