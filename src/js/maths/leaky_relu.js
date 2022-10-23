/** Leaky ReLU with MAX */

const MAX = 2.0;
const ALPHA = 0.1;
const LeakyReLU = x => { return x > 0 ? Math.min(MAX, x) : x * ALPHA; };
const LeakyReLUDerivative = x => { return x > 0 ? (x == MAX ? 0 : 1) : ALPHA; }

export { LeakyReLU, LeakyReLUDerivative };
