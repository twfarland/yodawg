import { fromWords, has, permutations, prefixes } from '../src';

describe('dawg', () => {
  const basicWordList = ['cat', 'cats', 'facet', 'facets', 'fact', 'facts'];

  test('builds expected basic dawg', async () => {
    const basic = await fromWords(basicWordList.values());
    expect(basic.states).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(basic.final).toEqual(new Set([3, 4]));
    expect(basic.alphabet).toEqual(new Set(['a', 'c', 'e', 'f', 's', 't']));
    expect(basic.transitions).toEqual(
      new Map([
        [
          0,
          new Map([
            ['c', 1],
            ['f', 5],
          ]),
        ],
        [1, new Map([['a', 2]])],
        [2, new Map([['t', 3]])],
        [3, new Map([['s', 4]])],
        [5, new Map([['a', 6]])],
        [6, new Map([['c', 7]])],
        [
          7,
          new Map([
            ['e', 2],
            ['t', 3],
          ]),
        ],
      ])
    );
  });

  it('finds words', async () => {
    const basic = await fromWords(basicWordList.values());
    for (const word of basicWordList) {
      expect(has(basic, word)).toBe(true);
    }
    expect(has(basic, 'dog')).toBe(false);
  });

  it('finds prefixes', async () => {
    const basic = await fromWords(basicWordList.values());
    expect(prefixes(basic, 'facets')).toEqual(new Set(['facet', 'facets']));
  });

  it('finds permutations', async () => {
    const basic = await fromWords(basicWordList.values());
    expect(permutations(basic, 'facts')).toEqual(
      new Set(['facts', 'fact', 'cats', 'cat'])
    );
  });
});
