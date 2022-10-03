/** RELU activation function */

const ReLU = x => Math.max(0, x);
const ReLUDerivative = x => x > 0 ? 1 : 0;

export { ReLU, ReLUDerivative };
