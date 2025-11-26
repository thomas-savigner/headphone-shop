// lib/urlParams.js

// Lire un param avec fallback
export function getParam(searchParams, key, defaultValue = '') {
  const value = searchParams.get(key);
  return value ?? defaultValue;
}

// Définir / mettre à jour un paramètre (clé / valeur)
export function setParam(searchParams, key, value, defaultValue = '') {
  const params = new URLSearchParams(searchParams.toString());

  const normalized = value === undefined || value === null ? '' : `${value}`;

  // Si valeur vide ou égale au défaut -> on supprime le param pour garder une URL propre
  if (normalized === '' || normalized === defaultValue) {
    params.delete(key);
  } else {
    params.set(key, normalized);
  }

  return params;
}

// Construire l'URL finale
export function buildUrl(pathname, params) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// Appliquer l'URL dans Next.js
export function replaceParam(router, pathname, params) {
  const url = buildUrl(pathname, params);
  router.replace(url, { scroll: false });
}
