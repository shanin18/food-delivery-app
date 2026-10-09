let recentSearches: string[] = [];

export function matchesSearch(query: string, text: string) {
  const searchable = text.toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).every(word => searchable.includes(word));
}

export function getRecentSearches() {
  return [...recentSearches];
}

export function rememberSearch(value: string) {
  const term = value.trim().slice(0, 60);
  if (term) recentSearches = [term, ...recentSearches.filter(keyword => keyword.toLowerCase() !== term.toLowerCase())].slice(0, 6);
  return getRecentSearches();
}

export function clearRecentSearches() {
  recentSearches = [];
  return getRecentSearches();
}
