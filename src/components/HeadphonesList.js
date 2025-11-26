// app/casques/CasquesList.jsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function HeadphonesList({ initialProducts }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- Lecture des filtres depuis l'URL ---

  const rangeFilter = searchParams.get('range') ?? 'all';
  const typeFilter = searchParams.get('type') ?? 'all';
  const minPrice = searchParams.get('min') ?? '';
  const maxPrice = searchParams.get('max') ?? '';
  const search = searchParams.get('q') ?? '';
  const sortBy = searchParams.get('sort') ?? 'price-asc';

  // --- Helpers pour mettre à jour l'URL ---

  const updateParam = (key, value, defaultValue = '') => {
    const params = new URLSearchParams(searchParams.toString());

    const normalized = value === undefined || value === null ? '' : `${value}`;

    if (normalized === '' || normalized === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, normalized);
    }

    const newQuery = params.toString();
    const url = newQuery ? `${pathname}?${newQuery}` : pathname;

    router.replace(url, { scroll: false });
  };

  const handleRangeChange = (value) => {
    updateParam('range', value, 'all');
  };

  const handleTypeChange = (value) => {
    updateParam('type', value, 'all');
  };

  const handleMinPriceChange = (value) => {
    updateParam('min', value, '');
  };

  const handleMaxPriceChange = (value) => {
    updateParam('max', value, '');
  };

  const handleSearchChange = (value) => {
    updateParam('q', value, '');
  };

  const handleSortChange = (value) => {
    updateParam('sort', value, 'price-asc');
  };

  // --- Options de filtres (gammes / types) ---

  const ranges = useMemo(
    () => ['all', ...Array.from(new Set(initialProducts.map(p => p.range)))],
    [initialProducts]
  );

  const types = useMemo(
    () => ['all', ...Array.from(new Set(initialProducts.map(p => p.type)))],
    [initialProducts]
  );

  // --- Application des filtres en mémoire ---

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filtre gamme
    if (rangeFilter !== 'all') {
      result = result.filter(p => p.range === rangeFilter);
    }

    // Filtre type
    if (typeFilter !== 'all') {
      result = result.filter(p => p.type === typeFilter);
    }

    // Prix min / max
    const min = minPrice !== '' ? Number(minPrice) : null;
    if (min !== null && !Number.isNaN(min)) {
      result = result.filter(p => p.price_eur >= min);
    }

    const max = maxPrice !== '' ? Number(maxPrice) : null;
    if (max !== null && !Number.isNaN(max)) {
      result = result.filter(p => p.price_eur <= max);
    }

    // Recherche texte (nom / description courte / gamme)
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.name?.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.range?.toLowerCase().includes(q))
      );
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_eur - b.price_eur;
      if (sortBy === 'price-desc') return b.price_eur - a.price_eur;
      if (sortBy === 'rating-desc') {
        const ar = a.avgRating ?? 0;
        const br = b.avgRating ?? 0;
        return br - ar;
      }
      return 0;
    });

    return result;
  }, [initialProducts, rangeFilter, typeFilter, minPrice, maxPrice, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Barre de filtres */}
      <section className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Gamme */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Gamme</label>
            <select
              value={rangeFilter}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm"
            >
              {ranges.map((r) => (
                <option key={r} value={r}>
                  {r === 'all' ? 'Toutes' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'Tous' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Prix min / max */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Prix min (€)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm w-24"
              placeholder="min"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Prix max (€)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm w-24"
              placeholder="max"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          {/* Recherche */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Recherche</label>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nom, gamme..."
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm w-full md:w-64"
            />
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm"
            >
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating-desc">Note décroissante</option>
            </select>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section>
        <p className="text-xs text-slate-400 mb-2">
          {filteredProducts.length} casque(s) trouvé(s)
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/casques/${product.id}`}
              className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 flex flex-col hover:border-sky-500 transition-colors"
            >
              {product.imageUrl && (
                <div className="mb-4 aspect-4/3 overflow-hidden rounded-lg bg-slate-800 flex items-center justify-center">
                  <Image
                    width={300}
                    height={225}
                    src={product.imageUrl}
                    alt={product.image_alt}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <div className="text-xs uppercase tracking-wide text-sky-400 mb-1">
                  {product.range}
                </div>

                <h2 className="text-lg font-semibold mb-1">
                  {product.name}
                </h2>

                <p className="text-sm text-slate-300 mb-3">
                  {product.short_description}
                </p>

                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="font-semibold text-sky-300">
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

                <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                  <span>SKU : {product.sku}</span>
                  <span>ID : {product.id}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
