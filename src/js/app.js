/** App */

import NeuralNetworkDynamic from './dynamic/neural_network_dynamic';
import Camera from './render/camera';
import Scene from './render/scene';
import Renderer from './render/renderer';
import Loop from './render/loop';

class App {
  constructor() {
    this.modules = {
      neuralNetworkDynamic: new NeuralNetworkDynamic(),
      camera: new Camera(),
      scene: new Scene(),
      renderer: new Renderer(),
      loop: new Loop(),
    };
    this.call('bind');
    this.call('resize');
    window.addEventListener('resize', () => {
      this.call('resize');
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
