// app/headphones/page.js
import { supabase } from '@/lib/supabaseClient';
import HeadphonesList from '@/components/HeadphonesList';


// Fonction utilitaire pour parser un nombre ou retourner null
function parseNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// Fonction pour récupérer les casques avec leurs statistiques d’avis
async function getheadphonesWithStats(searchParamsObject) {
  const range = searchParamsObject.range ?? 'all';
  const type = searchParamsObject.type ?? 'all';
  const min = parseNumber(searchParamsObject.min);
  const max = parseNumber(searchParamsObject.max);
  const q = (searchParamsObject.q ?? '').trim();
  const sort = searchParamsObject.sort ?? 'price-asc';

  // 1) on récupère les produits avec leurs avis
  let query = supabase
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
    `);

  // Filtres côté DB
  if (range !== 'all') {
    query = query.eq('range', range);
  }

  if (type !== 'all') {
    query = query.eq('type', type);
  }

  if (min !== null) {
    query = query.gte('price_eur', min);
  }

  if (max !== null) {
    query = query.lte('price_eur', max);
  }

  if (q) {
    const pattern = `%${q}%`;
    // name OR short_description OR range
    query = query.or(
      `name.ilike.${pattern},short_description.ilike.${pattern},range.ilike.${pattern}`
    );
  }

  // Tri côté DB (prix) – pour la note on triera après
  if (sort === 'price-asc') {
    query = query.order('price_eur', { ascending: true });
  } else if (sort === 'price-desc') {
    query = query.order('price_eur', { ascending: false });
  } else {
    // pour rating-desc, on met un tri par défaut, on affinera en JS
    query = query.order('price_eur', { ascending: true });
  }

  const { data, error } = await query;

  // Gestion des erreurs
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

  // Tri côté serveur par note si demandé
  if (sort === 'rating-desc') {
    headphones.sort((a, b) => {
      const ar = a.avgRating ?? 0;
      const br = b.avgRating ?? 0;
      return br - ar;
    });
  }

  return headphones;
}



export default async function Headphones({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const headphones = await getheadphonesWithStats(resolvedSearchParams);

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
        <HeadphonesList headphones={headphones} />
      </div>
    </main>
  );
}

