/** Layer */

import * as THREE from 'three';
import Neuron from './neuron';
import Synapse from './synapse';
import Element from '../util/element';

class Layer {
  constructor(params) {
    this.params = params;
    this.neurons = [];
    this.synapses = [];


    let x = params.index * 15;
    let size = params.size || 0;
    let p = {};
    if (params.bias !== undefined) p.bias = params.bias;
    if (params.activation !== undefined) p.activation = params.activation;
    for (let i=0; i<size; i++) {
      let position =
      this.neurons.push(
        new Neuron({
          index: i,
          position: new THREE.Vector3(x, i*5, 0),
          ...p
        })
      );
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
        let conn = new Synapse({src: src, dst: dst});
        this.synapses.push(conn);
      });
    });
  }

  forward() {
    this.neurons.forEach(neuron => neuron.calculateWeightedInput());
    this.neurons.forEach(neuron => neuron.activate());
  }

  reset() {
    this.synapses.forEach(conn => conn.reset());
  }

  refresh() {
    this.neurons.forEach(neuron => neuron.refresh());
    this.synapses.forEach(conn => conn.refresh());
  }

  toJSON() {
    let json = {};
    json.size = this.neurons.length;
    if (this.params.bias !== undefined) json.bias = this.params.bias;
    if (this.params.activation !== undefined) json.activation = this.params.activation;
    json.weights = [];
    this.neurons.forEach(neuron => {
      if (neuron.hasOutput()) {
        let weights = neuron.connections.out.map(conn => conn.getWeight());
        json.weights.push(weights);
      }
    });
    return json;
  }

  fromJSON(json) {}

  render() {
    let neuronElements = this.neurons.map(neuron => neuron.visible ? neuron.el : null).filter(x => x !== null);
    this.el = Element({
      class: 'layer',
      children: [{
        class: 'layer__header',
        children: [{
          innerText: `(${this.params.size})`,
        }]
      }, {
        class: 'layer__neurons',
        children: neuronElements,
      }, {
        class: 'layer__footer',
      }],
    });
    if (this.params.bias !== undefined) {
      this.el.querySelector('.layer__footer').appendChild(Element({
        innerText: `BIAS(${this.params.bias})`,
      }));
    }
    if (this.params.activation !== undefined) {
      this.el.querySelector('.layer__footer').appendChild(Element({
        innerText: `Z(${this.params.activation})`,
      }));
    }
  }
}

export default Layer;
