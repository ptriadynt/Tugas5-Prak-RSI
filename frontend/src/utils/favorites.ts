const FAVORITES_KEY_PREFIX = 'kantin_fav_';

function getKey(userId?: number | null): string {
  return `${FAVORITES_KEY_PREFIX}${userId ?? 'guest'}`;
}

export function getFavoriteStallIds(userId?: number | null): number[] {
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isStallFavorite(stallId: number, userId?: number | null): boolean {
  const favs = getFavoriteStallIds(userId);
  return favs.includes(stallId);
}

export function toggleFavoriteStall(stallId: number, userId?: number | null): boolean {
  const favs = getFavoriteStallIds(userId);
  let updated: number[];
  const exists = favs.includes(stallId);

  if (exists) {
    updated = favs.filter((id) => id !== stallId);
  } else {
    updated = [...favs, stallId];
  }

  localStorage.setItem(getKey(userId), JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('favorites-updated', { detail: { stallId, isFavorite: !exists } }));
  return !exists;
}

