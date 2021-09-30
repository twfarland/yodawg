import { Dawg, Word, State, Char } from './dawg';

// Lookup word in dawg
export function has(dawg: Dawg, word: string): boolean {
  let state: State | undefined = dawg.start;
  for (const char of word) {
    const children: Map<Char, State> | undefined =
      state !== undefined ? dawg.transitions.get(state) : undefined;
    if (children === undefined) {
      return false;
    }
    state = children.get(char);
  }
  return state !== undefined && dawg.final.has(state);
}

// Lookup all prefixes of word in dawg
export function prefixes(dawg: Dawg, word: string): Set<string> {
  const found = new Set<string>();
  let state: State | undefined = dawg.start;

  for (let i = 0; i < word.length; i++) {
    const children: Map<Char, State> | undefined =
      state !== undefined ? dawg.transitions.get(state) : undefined;
    if (children === undefined) {
      return found;
    }
    const char = word[i];
    const next = children.get(char);
    if (next === undefined) {
      return found;
    }
    state = next;
    if (dawg.final.has(state)) {
      found.add(word.slice(0, i + 1));
    }
  }

  return found;
}

// Lookup all words of 1..n length that can be constructed
// from a list of characters of n length
export function permutations(dawg: Dawg, characters: string): Set<string> {
  const found = new Set<string>();

  function removeFirst<T>(list: T[], value: T): T[] {
    const idx = list.indexOf(value);
    return list.slice(0, idx).concat(list.slice(idx + 1));
  }

  function search(word: Word, matched: Word, state: State): void {
    if (dawg.final.has(state)) {
      found.add(matched.join(''));
    }
    const children = dawg.transitions.get(state);
    if (children !== undefined) {
      for (const char of word) {
        const rest = removeFirst(word, char);
        const child = children.get(char);
        if (child !== undefined) {
          search(rest, [...matched, char], child);
        }
      }
    }
  }

  search(characters.split(''), [], Number(dawg.start));

  return found;
}
