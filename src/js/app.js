/** App */

import NeuralNetwork from './nn/neural_network';
import Dataset from './nn/dataset';

class App {
  constructor() {
    this.modules = {
      dataset: new Dataset(),
      neuralNetwork: new NeuralNetwork(),
    };
    this.call('bind');
    window.addEventListener('resize', () => {
      this.call('refresh');
    });
  }

  call(func) {
    for (const key in this.modules) {
      if (typeof this.modules[key][func] === 'function') {
        this.modules[key][func](this);
      }
    }
  }
}

window.addEventListener('load', () => {
  const app = new App();
});
