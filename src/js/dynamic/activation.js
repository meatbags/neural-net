/** Activation functions */

import { Sigmoid, SigmoidDerivative } from '../maths/sigmoid';
import { ReLU, ReLUDerivative } from '../maths/relu';
import { ELU, ELUDerivative } from '../maths/elu';
import { LeakyReLU, LeakyReLUDerivative } from '../maths/leaky_relu';

class Activation {
  static NONE = 'NONE';
  static ELU = 'ELU';
  static RELU = 'RELU';
  static LEAKY_RELU = 'LEAKY_RELU';
  static SIGMOID = 'SIGMOID';

  static getValue(type, x) {
    switch (type) {
      case Activation.ELU: return ELU(x); break;
      case Activation.RELU: return ReLU(x); break;
      case Activation.LEAKY_RELU: return LeakyReLU(x); break;
      case Activation.SIGMOID: return Sigmoid(x); break;
      default: return x; break;
    }
  }

  static getDerivative(type, x) {
    switch (type) {
      case Activation.ELU: return ELUDerivative(x); break;
      case Activation.RELU: return ReLUDerivative(x); break;
      case Activation.LEAKY_RELU: return LeakyReLUDerivative(x); break;
      case Activation.SIGMOID: return SigmoidDerivative(x); break;
      default: return 0; break;
    }
  }
}

export default Activation;
