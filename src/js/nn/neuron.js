/** Neuron */

import * as THREE from 'three';
import Global from '../render/global';

import Activation from './activation';
import Element from '../util/element';
import Round from '../maths/round';

const MAX_VISIBLE_NEURONS_PER_LAYER = 12;

class Neuron {
  constructor(params) {
    this.params = params;
    this.error = 0;
    this.weightedInput = 0;
    this.value = 0;
    this.index = params.index;
    this.bias = params.bias !== undefined ? params.bias : 0;
    this.activation = params.activation || null;
    this.connections = { in: [], out: [] };
    this.visible = this.index < MAX_VISIBLE_NEURONS_PER_LAYER;
    this.render();

    // visualiser
    let geo = new THREE.SphereBufferGeometry(1, 12, 12);
    let mat = new THREE.MeshStandardMaterial();
    this.position = params.position || new THREE.Vector3();
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
    Global.Scene.add(this.mesh);
  }

  getValue() {
    return this.value;
  }

  getWeightedInput() {
    return this.weightedInput;
  }

  setValue(value) {
    this.value = value;
  }

  setError(error) {
    this.error = error;
  }

  setBias(bias) {
    this.bias = bias;
  }

  addOutgoingConnection(conn) {
    this.connections.out.push(conn);
    if (this.el) {
      this.el.dataset.outgoing = 1;
    }
  }

  addIncomingConnection(conn) {
    this.connections.in.push(conn);
    if (this.el) {
      this.el.dataset.incoming = 1;
    }
  }

  calculateError(target=0) {
    // output layer
    if (this.connections.out.length == 0) {
      this.error = (this.value - target) * Activation.getDerivative(this.activation, this.value);

    // hidden layers
    } else if (this.connections.in.length > 0) {
      let error = 0;
      this.connections.out.forEach(conn => { error += conn.getWeightedError(); });
      this.error = error * Activation.getDerivative(this.activation, this.value);
    }
  }

  backpropagate(learningRate=0.25) {
    if (this.connections.in.length == 0) {
      return;
    }
    this.connections.in.forEach(conn => {
      conn.setWeight(conn.weight - learningRate * this.error * conn.getInput());
    });
  }

  calculateWeightedInput() {
    if (!this.connections.in.length) return;
    this.weightedInput = this.bias;
    this.connections.in.forEach(conn => {
      this.weightedInput += conn.getWeightedValue();
    });
  }

  activate() {
    if (!this.connections.in.length) return;
    this.value = Activation.getValue(this.activation, this.weightedInput);
  }

  hasOutput() {
    return this.connections.out.length > 0;
  }

  isOutputNeuron() {
    return this.connections.out.length == 0;
  }

  isInputNeuron() {
    return this.connections.in.length == 0;
  }

  toJSON() {}

  update() {
    // if input transmit
    // if forward-feeding
    // if backpropagating
    // if output snap value
  }

  refresh() {
    if (!this.visible) return;
    if (this.label) {
      this.ref.label.innerText = this.label;
    }
    this.ref.value.innerText = Round(this.value, 3);
    this.ref.error.innerText = this.error == 0 ? '' : Round(this.error, 5);
    if (!this.connections.in.length) {
      this.ref.in.classList.add('active');
      this.ref.in.innerText = Round(this.value, 3);
    }
    if (!this.connections.out.length) {
      this.ref.out.classList.add('active');
      this.ref.out.innerText = Math.round(this.value);
    }
  }

  render() {
    if (!this.visible) return;
    this.el = Element({
      class: 'neuron',
      children: [
        { class: 'neuron__label' },
        { class: 'neuron__value' },
        { class: 'neuron__error' },
        { class: 'neuron__in' },
        { class: 'neuron__out' },
      ],
      addEventListener: {
        click: () => this.el.classList.toggle('selected'),
      }
    });
    this.ref = {};
    this.ref.label = this.el.querySelector('.neuron__label');
    this.ref.value = this.el.querySelector('.neuron__value');
    this.ref.error = this.el.querySelector('.neuron__error');
    this.ref.in = this.el.querySelector('.neuron__in');
    this.ref.out = this.el.querySelector('.neuron__out');
  }
}

export default Neuron;
