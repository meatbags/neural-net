/** Activation functions */

import { Sigmoid, SigmoidDerivative } from '../maths/sigmoid';
import { ReLU, ReLUDerivative } from '../maths/relu';

class Activation {
  static NONE = 'NONE';
  static SIGMOID = 'SIGMOID';
  static RELU = 'RELU';

  static getValue(type, x) {
    switch (type) {
      case Activation.SIGMOID: return Sigmoid(x); break;
      case Activation.RELU: return ReLU(x); break;
      default: return x; break;
    }
  }

  static getDerivative(type, x) {
    switch (type) {
      case Activation.SIGMOID: return SigmoidDerivative(x); break;
      case Activation.RELU: return ReLUDerivative(x); break;
      default: return 0; break;
    }
  }
}

export default Activation;
