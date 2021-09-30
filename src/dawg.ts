export type Char = string; // no char type in js
export type Word = Char[];
export type State = number;
export type StateKey = string;

export interface Dawg {
  nextId: () => State;
  states: Set<State>; // aka nodes, aka vertices
  start: State;
  final: Set<State>;
  alphabet: Set<Char>;
  transitions: Map<State, Map<Char, State>>; // aka edges, aka arcs
  register: Map<StateKey, State>;
}

export async function fromWords(
  words: AsyncIterableIterator<string> | IterableIterator<string>
): Promise<Dawg> {
  const dawg = blankDawg();
  let previousStr = '';
  for await (const str of words) {
    if (str < previousStr) {
      throw new Error('Words must be in ascending lexicographic order');
    }
    insertWord(dawg, str.split(''));
    previousStr = str;
  }
  minimize(dawg, dawg.start);
  return dawg;
}

export function blankDawg(): Dawg {
  const nextId = genIds();
  const start = nextId();
  const register = new Map<StateKey, State>();
  const states = new Set<State>([start]);
  const final = new Set<State>();
  const alphabet = new Set<Char>();
  const transitions = new Map<State, Map<Char, State>>();
  return {
    nextId,
    start,
    states,
    final,
    alphabet,
    transitions,
    register,
  };
}

export function insertWord(dawg: Dawg, word: Word): void {
  const { state: currentState, word: currentSuffix } = commonPrefix(
    dawg,
    dawg.start,
    word
  );
  if (hasChildren(dawg, currentState)) {
    minimize(dawg, currentState);
  }
  addSuffix(dawg, currentState, currentSuffix);
}

export function commonPrefix(
  dawg: Dawg,
  state: State,
  word: Word
): { state: State; word: Word } {
  const children = dawg.transitions.get(state);
  if (children === undefined || word.length === 0) {
    return { state, word };
  }
  const [c, ...suffix] = word;
  const next = children.get(c);
  if (next === undefined) {
    return { state, word };
  } else {
    return commonPrefix(dawg, next, suffix);
  }
}

export function minimize(dawg: Dawg, state: State): void {
  const children = dawg.transitions.get(state);
  const lastChild = children !== undefined && getLastInMap(children);
  if (!lastChild) {
    return;
  }
  const [char, child] = lastChild;
  if (hasChildren(dawg, child)) {
    minimize(dawg, child);
  }
  const childKey = getStateKey(dawg, child);
  const existing = dawg.register.get(childKey);

  if (existing !== undefined && children !== undefined) {
    // replace
    dawg.states.delete(child);
    dawg.final.delete(child);
    dawg.transitions.delete(child);
    children.set(char, existing);
  } else {
    // register
    dawg.register.set(childKey, child);
  }
}

export function addSuffix(dawg: Dawg, state: State, suffix: Word): void {
  let current = state;
  for (const char of suffix) {
    const child = dawg.nextId();
    dawg.states.add(child);
    dawg.alphabet.add(char);

    const existingChildren = dawg.transitions.get(current);
    if (existingChildren !== undefined) {
      existingChildren.set(char, child);
    } else {
      dawg.transitions.set(current, new Map([[char, child]]));
    }

    current = child;
  }
  dawg.final.add(current);
}

// Used in minimization to identify replaceable states.
// States are considered equivalent when they have the same outgoing
// transitions and the same finality flag.
export function getStateKey(
  { transitions, final }: Dawg,
  state: State
): StateKey {
  const children = Array.from(transitions.get(state) || new Map<Char, State>());
  return [
    final.has(state) ? '1' : '0',
    children.map(([char, toState]) => `${char}_${toState}`),
  ].join(' ');
}

export function hasChildren(dawg: Dawg, state: State): boolean {
  return dawg.transitions.get(state) !== undefined;
}

// Since ES6 maps retain their order of insertion,
// and the builder takes words in sorted order, we
// can get the last lexicographical entry like this:
function getLastInMap<K, V>(map: Map<K, V>): [K, V] | undefined {
  return Array.from(map)[map.size - 1];
}

function genIds() {
  let id = -1;
  return () => {
    id++;
    return id;
  };
}
