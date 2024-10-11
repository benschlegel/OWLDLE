/**
 * Describes game state. "in-progress" by default, "won"/"lost" after game finished. "won-old"/"lost-old" only used when reading from localStorage (e.g. to not play confetti effect again)
 */
export type GameState = 'in-progress' | 'won' | 'lost' | 'won-old' | 'lost-old';
