/** Exponential Linear Unit activation function */

const ALPHA = 1;
const ELU = x => x < 0 ? (Math.exp(x) - 1) * ALPHA : x;
const ELUDerivative = x => x < 0 ? Math.exp(x) * ALPHA : 1;

export { ELU, ELUDerivative };
