/** Activation functions */

import { Sigmoid, SigmoidDerivative } from '../maths/sigmoid';
import { ReLU, ReLUDerivative } from '../maths/relu';
// import { Softmax, SoftmaxDerivative } from '../maths/softmax';

class Activation {
  static SIGMOID = 'SIGMOID';
  static RELU = 'RELU';
  // this.SOFTMAX = 'SOFTMAX';

  static getValue(type, x) {
    switch (type) {
      case Activation.SIGMOID: return Sigmoid(x); break;
      case Activation.RELU: return ReLU(x); break;
      //case this.SOFTMAX: return Softmax(x, arr); break;
      default: return x; break;
    }
  }

  static getDerivative(type, x) {
    switch (type) {
      case Activation.SIGMOID: return SigmoidDerivative(x); break;
      case Activation.RELU: return ReLUDerivative(x); break;
      //case this.SOFTMAX: return SoftmaxDerivative(x, arr); break;
      default: return 0; break;
    }
  }
}

export default Activation;
