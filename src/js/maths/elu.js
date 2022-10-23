/** Exponential Linear Unit activation function with MAX */

const ALPHA = 1;
const MAX = 1.0;
const ELU = x => { return x > 0 ? Math.min(MAX, x) : (Math.exp(x) - 1) * ALPHA; }
const ELUDerivative = x => { return x > 0 ? (x == MAX ? 0 : 1) : Math.exp(x) * ALPHA; }

export { ELU, ELUDerivative };
