/** Layer */

import Neuron from './neuron';
import Connector from './connector';
import Element from '../util/element';

class Layer {
  constructor(params) {
    this.params = params;
    this.neurons = [];
    this.connections = [];

    let size = params.size || 0;
    let p = {};
    if (params.bias !== undefined) p.bias = params.bias;
    if (params.activation !== undefined) p.activation = params.activation;
    for (let i=0; i<size; i++) {
      this.neurons.push(new Neuron(p));
    }

    this.render();
  }

  setValues(values) {
    values.forEach((v, i) => {
      this.neurons[i].setValue(v);
    });
  }

  connect(layer) {
    this.neurons.forEach(src => {
      layer.neurons.forEach(dst => {
        let conn = new Connector({src: src, dst: dst});
        this.connections.push(conn);
      });
    });
  }

  forward() {
    this.neurons.forEach(neuron => neuron.calculateWeightedInput());
    this.neurons.forEach(neuron => neuron.activate());
  }

  reset() {
    this.neurons.forEach(neuron => neuron.reset());
    this.connections.forEach(conn => conn.reset());
  }

  refresh() {
    this.neurons.forEach(neuron => neuron.refresh());
    this.connections.forEach(conn => conn.refresh());
  }

  render() {
    this.el = Element({
      class: 'layer',
      children: [{
        class: 'layer__neurons',
        children: [
          ...this.neurons.map(neuron => neuron.el), {
            class: 'layer__info',
          },
        ],
      }, {
        class: 'layer__controls',
        children: [{}],
      }],
    });

    if (this.params.bias !== undefined) {
      this.el.querySelector('.layer__info').appendChild(Element({
        innerText: 'BIAS=' + this.params.bias,
      }));
    }
    if (this.params.activation !== undefined) {
      this.el.querySelector('.layer__info').appendChild(Element({
        innerText: this.params.activation,
      }));
    }
  }
}

export default Layer;
