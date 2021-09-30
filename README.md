# yodawg

A library for efficiently constructing and querying [DAWG](https://en.wikipedia.org/wiki/Deterministic_acyclic_finite_state_automaton) (directed acyclic word graph) data structures, aka DAFSA (directed acyclic finite state automation).

The implementation follows algorithm 1 described in https://aclanthology.org/J00-1002.pdf

![yodawg](https://i.imgur.com/Rq0AF.jpeg)

## Usage

The `fromWords` builder function takes an iterator of strings. These must be sorted in ascending lexicographical order (like a dictionary).

```typescript
import { fromWords, has, prefixes, permutations } from 'yodawg';

async function example() {
  const words = ['cat', 'cats', 'facet', 'facets', 'fact', 'facts'];
  const dawg = await fromWords(words.values());

  has(dawg, 'cat'); // true

  has(dawg, 'dog'); // false

  prefixes(dawg, 'cats'); // Set { 'cats', 'cat' }

  permutations(dawg, 'facts'); // Set { 'facts', 'fact', 'cats', 'cat' }
}
```

The dawg itself is a flat record of native js structures like Map and Set, so you can use that directly in other graph functions e.g: search.

```typescript
type Char = string;
type Word = Char[];
type State = number;
type StateKey = string;

interface Dawg {
  nextId: () => State;
  states: Set<State>; // aka nodes, aka vertices
  start: State;
  final: Set<State>;
  alphabet: Set<Char>;
  transitions: Map<State, Map<Char, State>>; // aka edges, aka arcs
  register: Map<StateKey, State>;
}
```
