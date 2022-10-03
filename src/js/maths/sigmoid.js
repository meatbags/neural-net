/** Sigmoid activation function */

const Sigmoid = x => 1 / (1 + Math.exp(-x));
const SigmoidDerivative = x => x * (1 - x);

export { Sigmoid, SigmoidDerivative };
