/** Neuron */

import Activation from './activation';
import Element from '../util/element';
import Round from '../maths/round';

const MAX_VISIBLE_NEURONS_PER_LAYER = 10;

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
  }

  addIncomingConnection(conn) {
    this.connections.in.push(conn);
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

  refresh() {
    if (!this.visible) return;

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
    this.ref.value = this.el.querySelector('.neuron__value');
    this.ref.error = this.el.querySelector('.neuron__error');
    this.ref.in = this.el.querySelector('.neuron__in');
    this.ref.out = this.el.querySelector('.neuron__out');
  }
}

export default Neuron;
