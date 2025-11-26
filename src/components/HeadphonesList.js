// app/casques/HeadphonesList.jsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getParam, setParam, replaceParam } from '@/lib/urlParams';

export default function HeadphonesList({ headphones }) {
    const safeHeadphones = useMemo(() => headphones ?? [], [headphones]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // --- Lecture des filtres depuis l'URL ---
    const rangeFilter = getParam(searchParams, 'range', 'all');
    const typeFilter = getParam(searchParams, 'type', 'all');
    const minPrice = getParam(searchParams, 'min', '');
    const maxPrice = getParam(searchParams, 'max', '');
    const search = getParam(searchParams, 'q', '');
    const sortBy = getParam(searchParams, 'sort', 'price-asc');

    // --- Options de filtres dynamiques (depuis les données) ---
    const ranges = useMemo(
        () => ['all', ...Array.from(new Set(safeHeadphones.map((h) => h.range)))],
        [safeHeadphones]
    );

    const types = useMemo(
        () => ['all', ...Array.from(new Set(safeHeadphones.map((h) => h.type)))],
        [safeHeadphones]
    );

    // --- Helpers pour mettre à jour l'URL ---
    const updateFilter = (key, value, defaultValue) => {
        const newParams = setParam(searchParams, key, value, defaultValue);
        replaceParam(router, pathname, newParams);
    };

    const handleRangeChange = (value) => {
        updateFilter('range', value, 'all');
    };

    const handleTypeChange = (value) => {
        updateFilter('type', value, 'all');
    };

    const handleMinPriceChange = (value) => {
        updateFilter('min', value, '');
    };

    const handleMaxPriceChange = (value) => {
        updateFilter('max', value, '');
    };

    const handleSearchChange = (value) => {
        updateFilter('q', value, '');
    };

    const handleSortChange = (value) => {
        updateFilter('sort', value, 'price-asc');
    };

    const handleResetFilters = () => {
        let params = setParam(searchParams, 'range', 'all', 'all');
        params = setParam(params, 'type', 'all', 'all');
        params = setParam(params, 'min', '', '');
        params = setParam(params, 'max', '', '');
        params = setParam(params, 'q', '', '');
        params = setParam(params, 'sort', 'price-asc', 'price-asc');

        replaceParam(router, pathname, params);
    };

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
                <button
                    onClick={handleResetFilters}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-700"
                >
                    Réinitialiser
                </button>

            </section>

            {/* Résultats */}
            <section>
                <p className="text-xs text-slate-400 mb-2">
                    {safeHeadphones.length} casque(s) trouvé(s)
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {safeHeadphones.map((product) => (
                        <Link
                            key={product.id}
                            href={`/headphones/${product.id}`}
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
