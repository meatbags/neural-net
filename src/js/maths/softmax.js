/** Softmax */

const Softmax = (x, arr) => {
  let max = Math.max(...arr);
  let denom = arr.map(x => Math.exp(x - max)).reduce((a, b) => a + b);
  return Math.exp(x) / denom;
};
const SoftmaxDerivative = (x, arr) => {
  // TODO
};

export { Softmax, SoftmaxDerivative };
