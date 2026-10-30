/**
 * Strips Vietnamese diacritics (including đ/Đ) and lowercases text.
 */
export function stripVietnameseDiacritics(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Splits a string into normalized NFC lowercase alphanumeric word tokens.
 */
export function tokenizeSearchWords(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .normalize('NFC')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Parses a raw user search query into diacritic-aware tokens.
 * Each token records whether the user explicitly typed Vietnamese diacritics:
 * - Tokens WITH diacritics (e.g. "cá", "đậu", "thịt") require exact diacritic match on that word.
 * - Tokens WITHOUT diacritics (e.g. "ca", "dau", "thit") match accent-insensitively.
 */
export function parseIngredientSearchQuery(query) {
  const accentedWords = tokenizeSearchWords(query);
  if (accentedWords.length === 0) return null;

  const tokens = accentedWords.map((w) => {
    const stripped = stripVietnameseDiacritics(w);
    return {
      accented: w,
      stripped,
      hasDiacritics: w !== stripped,
    };
  });

  return {
    tokens,
    normAccented: accentedWords.join(' '),
    normStripped: tokens.map((t) => t.stripped).join(' '),
  };
}

/**
 * Computes relevance rank of `text` against `queryOrParsed`.
 * Returns -1 if not matched, or 0..9 (smaller = higher relevance):
 *   0: Exact full match (with diacritics)
 *   1: Exact full match (accent-insensitive)
 *   2: Starts from first word, whole-word match (with diacritics)
 *   3: Starts from first word, whole-word match (accent-insensitive)
 *   4: Starts from first word, prefix match (with diacritics)
 *   5: Starts from first word, prefix match (accent-insensitive)
 *   6: Inner word, whole-word match (with diacritics)
 *   7: Inner word, whole-word match (accent-insensitive)
 *   8: Inner word, prefix match (with diacritics)
 *   9: Inner word / compound-syllable prefix match (accent-insensitive)
 */
export function getIngredientMatchRank(text, queryOrParsed) {
  const parsed =
    queryOrParsed && typeof queryOrParsed === 'object'
      ? queryOrParsed
      : parseIngredientSearchQuery(queryOrParsed);
  if (!parsed) return 0;

  const { tokens, normAccented, normStripped } = parsed;
  const candAccented = tokenizeSearchWords(text);
  if (candAccented.length === 0) return -1;
  const candStripped = candAccented.map(stripVietnameseDiacritics);

  const fullAccented = candAccented.join(' ');
  const fullStripped = candStripped.join(' ');

  let bestRank = -1;
  const updateBest = (rank) => {
    if (bestRank === -1 || rank < bestRank) {
      bestRank = rank;
    }
  };

  if (candAccented.length >= tokens.length) {
    for (let startIdx = 0; startIdx <= candAccented.length - tokens.length; startIdx++) {
      let matched = true;
      for (let j = 0; j < tokens.length; j++) {
        const qt = tokens[j];
        const cw = qt.hasDiacritics ? candAccented[startIdx + j] : candStripped[startIdx + j];
        const target = qt.hasDiacritics ? qt.accented : qt.stripped;
        if (j < tokens.length - 1) {
          if (cw !== target) {
            matched = false;
            break;
          }
        } else if (!cw.startsWith(target)) {
          matched = false;
          break;
        }
      }
      if (!matched) continue;

      const lastIdx = startIdx + tokens.length - 1;
      const allExactAccented = tokens.every((qt, j) => candAccented[startIdx + j] === qt.accented);
      const allExactStripped = tokens.every((qt, j) => candStripped[startIdx + j] === qt.stripped);
      const allPrefixAccented =
        tokens.slice(0, -1).every((qt, j) => candAccented[startIdx + j] === qt.accented) &&
        candAccented[lastIdx].startsWith(tokens[tokens.length - 1].accented);

      if (candAccented.length === tokens.length && allExactAccented && fullAccented === normAccented) {
        return 0;
      }
      if (candAccented.length === tokens.length && allExactStripped && fullStripped === normStripped) {
        updateBest(1);
        continue;
      }

      if (startIdx === 0) {
        if (allExactAccented) updateBest(2);
        else if (allExactStripped) updateBest(3);
        else if (allPrefixAccented) updateBest(4);
        else updateBest(5);
      } else {
        if (allExactAccented) updateBest(6);
        else if (allExactStripped) updateBest(7);
        else if (allPrefixAccented) updateBest(8);
        else updateBest(9);
      }
    }
  }

  // Fallback for concatenated syllable queries >= 3 chars (e.g. "oliu" -> "Dầu ô liu")
  if (bestRank === -1) {
    const lastToken = tokens[tokens.length - 1];
    if (!lastToken.hasDiacritics && lastToken.stripped.length >= 3 && candAccented.length >= tokens.length) {
      const prefixCount = tokens.length - 1;
      for (let startIdx = 0; startIdx <= candAccented.length - tokens.length; startIdx++) {
        let prefixOk = true;
        for (let j = 0; j < prefixCount; j++) {
          const qt = tokens[j];
          const cw = qt.hasDiacritics ? candAccented[startIdx + j] : candStripped[startIdx + j];
          const target = qt.hasDiacritics ? qt.accented : qt.stripped;
          if (cw !== target) {
            prefixOk = false;
            break;
          }
        }
        if (!prefixOk) continue;

        const joinedRest = candStripped.slice(startIdx + prefixCount).join('');
        if (joinedRest.startsWith(lastToken.stripped)) {
          updateBest(startIdx === 0 ? 5 : 9);
          break;
        }
      }
    }
  }

  return bestRank;
}

/**
 * Boolean check whether `text` matches `queryOrParsed`.
 */
export function matchesIngredientSearch(text, queryOrParsed) {
  const parsed =
    queryOrParsed && typeof queryOrParsed === 'object'
      ? queryOrParsed
      : parseIngredientSearchQuery(queryOrParsed);
  if (!parsed) return true;
  return getIngredientMatchRank(text, parsed) >= 0;
}

/**
 * Filters and sorts an ingredient collection by search relevance, then Vietnamese alphabetical order.
 */
export function rankAndFilterIngredients(items, query, options = {}) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const parsed = parseIngredientSearchQuery(query);
  if (!parsed) return items;

  const {
    getName = (item) => item?.name || item?.Name || '',
    getSecondaryTexts = null,
  } = options;

  const scored = [];
  for (const item of items) {
    const name = getName(item) || '';
    let bestRank = getIngredientMatchRank(name, parsed);

    if (bestRank < 0 && typeof getSecondaryTexts === 'function') {
      const extras = getSecondaryTexts(item) || [];
      for (const extra of extras) {
        const extraRank = getIngredientMatchRank(extra, parsed);
        if (extraRank >= 0) {
          const adjusted = 20 + extraRank;
          if (bestRank < 0 || adjusted < bestRank) {
            bestRank = adjusted;
          }
        }
      }
    }

    if (bestRank >= 0) {
      scored.push({ item, name, rank: bestRank });
    }
  }

  scored.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'vi'));
  return scored.map((entry) => entry.item);
}
