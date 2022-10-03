/** Neural network */

import Layer from './layer';
import Activation from './activation';
import Element from '../util/element';
import Round from '../maths/round';

class NeuralNetwork {
  constructor() {
    this.data = [
      { input: [1, 0, 1], target: [1, 0, 0, 0, 0, 0, 0, 0, 0] },
    ];
    this.state = {
      learningRate: 0.125,
      layers: [
        { size: this.data[0].input.length, values: this.data.input },
        { size: 4, bias: 0, activation: Activation.SIGMOID },
        { size: 5, bias: 0, activation: Activation.SIGMOID },
        { size: 6, bias: 0, activation: Activation.SIGMOID },
        { size: this.data[0].target.length, activation: Activation.SIGMOID },
      ],
    };
    this.stats = {
      cycles: 0,
      error: 0,
    };

    // create layers
    this.layers = this.state.layers.map(p => new Layer(p));
    for (let i=0; i<this.layers.length; i++) {
      if (i + 1 < this.layers.length) {
        this.layers[i].connect(this.layers[i+1]);
      }
    }

    // layer refs
    this.inputLayer = this.layers[0];
    this.inputLayer.setValues(this.data[0].input);
    this.hiddenLayers = this.layers.filter((layer, i) => i !== 0 && i !== this.layers.length-1);
    this.outputLayer = this.layers[this.layers.length-1];

    this.render();
  }

  setInput(input) {
    this.layers[0].set(input);
  }

  reset() {
    this.layers.forEach(layer => layer.reset());
  }

  forward() {
    this.layers.forEach(layer => layer.forward());
  }

  backpropagate() {
    // backpropagate output & hidden layers
    this.outputLayer.neurons.forEach((neuron, i) => {
      neuron.calculateError(this.data[0].target[i]);
    });
    for (let i=this.hiddenLayers.length-1; i>=0; i--) {
      this.hiddenLayers[i].neurons.forEach(neuron => neuron.calculateError());
    }

    // set weights
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => neuron.backpropagate(this.state.learningRate));
    });
  }

  cycle(n=1) {
    for (let i=0; i<n; i++) {
      this.forward();
      this.backpropagate();
    }
    this.stats.cycles += 1;
    this.stats.error = Round(this.outputLayer.neurons.map(n => Math.abs(n.error)).reduce((a, b) => a + b), 5);
    this.refresh();
  }

  refresh() {
    this.layers.forEach(layer => layer.refresh());
    this.ref.learningRate.innerText = this.state.learningRate;
    this.ref.statCycles.innerText = this.stats.cycles;
    this.ref.statError.innerText = this.stats.error;
  }

  render() {
    this.el = Element({
      class: 'neural-network',
      children: [{
        class: 'neural-network__layers',
        children: [{
            class: 'neural-network__label',
            children: this.data[0].input.map(value => ({
              innerText: value,
            }))
          },
          ...this.layers.map(layer => layer.el),
          {
            class: 'neural-network__label',
            children: this.data[0].target.map(value => ({
              innerText: value,
            }))
          }
        ]
      }, {
        class: 'neural-network__stats',
        children: [
          { class: 'neural-network__stat', innerHTML: 'LearningRate: <span data-stat="learning-rate"></span>' },
          { class: 'neural-network__stat', innerHTML: 'Cycles: <span data-stat="cycles"></span>' },
          { class: 'neural-network__stat', innerHTML: 'Error: <span data-stat="error"></span>' },
        ]
      },{
        class: 'neural-network__controls',
        children: [{
          class: 'neural-network__control',
          innerText: 'RESET',
          addEventListener: {
            click: () => {
              this.reset();
              this.refresh();
            },
          },
        }, {
          class: 'neural-network__control',
          innerText: 'FORWARD',
          addEventListener: {
            click: () => {
              this.forward();
              this.refresh();
            },
          },
        }, {
          class: 'neural-network__control',
          innerText: 'CYCLE',
          addEventListener: {
            click: () => {
              this.cycle(1);
              this.refresh();
            },
          },
        }, {
          class: 'neural-network__control',
          innerText: 'x100',
          addEventListener: {
            click: () => {
              this.cycle(100);
              this.refresh();
            },
          },
        }, {
          class: 'neural-network__control',
          innerText: '>>',
          addEventListener: {
            click: () => {
              if (this.looping) {
                this.looping = false;
              } else {
                let callback = () => {
                  if (this.looping) requestAnimationFrame(() => callback());
                  this.cycle(1);
                  this.refresh();
                };
                this.looping = true;
                callback();
              }
            },
          },
        }]
      }],
    });

    // refs
    this.ref = {};
    this.ref.learningRate = this.el.querySelector('[data-stat="learning-rate"]');
    this.ref.statCycles = this.el.querySelector('[data-stat="cycles"]');
    this.ref.statError = this.el.querySelector('[data-stat="error"]');

    // add to doc
    document.querySelector('body').appendChild(this.el);
  }
}

export default NeuralNetwork;
