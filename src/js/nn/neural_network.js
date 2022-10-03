/** Neural network */

import Layer from './layer';
import Activation from './activation';
import Element from '../util/element';
import Round from '../maths/round';

class NeuralNetwork {
  constructor() {
    this.data = [
      { input: [1, 0, 1], target: [1, 0, 0, 0] },
    ];
    this.state = {
      learningRate: 0.125,
      layers: [
        { size: this.data[0].input.length, values: this.data.input },
        { size: 4, bias: 1, activation: Activation.SIGMOID },
        { size: 3, bias: 1, activation: Activation.SIGMOID },
        { size: 7, bias: 1, activation: Activation.SIGMOID },
        // { size: 8, bias: 1, activation: Activation.SIGMOID },
        { size: this.data[0].target.length, activation: Activation.SIGMOID },
      ],
    };
    this.stats = {
      cycles: 0,
      epochs: 0,
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

    // set initial
    this.reset();
  }

  setInput(input) {
    this.layers[0].set(input);
  }

  forward() {
    this.layers.forEach(layer => layer.forward());
  }

  backpropagate() {
    // backpropagate output
    this.outputLayer.neurons.forEach((neuron, i) => {
      neuron.calculateError(this.data[0].target[i]);
    });

    // backpropagate hidden layers
    for (let i=this.hiddenLayers.length-1; i>=0; i--) {
      this.hiddenLayers[i].neurons.forEach(neuron => neuron.calculateError());
    }

    // set new weights
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => neuron.backpropagate(this.state.learningRate));
    });
  }

  cycle(n=1) {
    for (let i=0; i<n; i++) {
      this.forward();
      this.backpropagate();
    }
    this.stats.cycles += n;
    this.calculateTotalError();
  }

  calculateTotalError() {
    let total = 0;
    this.outputLayer.neurons.forEach((neuron, i) => {
      total += Math.abs(this.data[0].target[i] - neuron.value);
    });
    this.stats.error = Round(total, 5);
  }

  reset() {
    this.layers.forEach(layer => layer.reset());
    this.stats.cycles = 0;
    this.forward();
    this.calculateTotalError();
    this.refresh();
  }

  refresh() {
    this.layers.forEach(layer => layer.refresh());
    this.ref.learningRate.innerText = this.state.learningRate;
    this.ref.statCycles.innerText = this.stats.cycles;
    this.ref.statEpochs.innerText = this.stats.epochs;
    this.ref.statTime.innerText = this.stats.time;
    this.ref.statError.innerText = this.stats.error;
  }

  toJSON() {
    let json = {
      layers: this.layers.map(layer => layer.toJSON()),
    };
    return json;
  }

  render() {
    this.el = Element({
      class: 'neural-network',
      children: [{
        class: 'neural-network__layers',
        children: this.layers.map(layer => layer.el),
      }, {
        class: 'neural-network__stats',
        children: [
          { class: 'neural-network__stat', innerHTML: 'Cycles: <span data-stat="cycles"></span>' },
          { class: 'neural-network__stat', innerHTML: 'Epochs: <span data-stat="epochs"></span>' },
          { class: 'neural-network__stat', innerHTML: 'Learning Rate: <span data-stat="learning-rate"></span>' },
          { class: 'neural-network__stat', innerHTML: 'Exec. time: <span data-stat="time"></span>' },
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
                this.looping = true;
                const callback = () => {
                  return new Promise((resolve, reject) => {
                    let now = performance.now();
                    this.cycle(1);
                    this.stats.time = `${Round(performance.now() - now, 3)}ms`;
                    this.refresh();
                    resolve();
                  });
                };
                const loop = () => {
                  callback().then(() => {
                    if (this.looping) {
                      setTimeout(() => loop(), 10);
                    }
                  });
                }
                loop();
              }
            },
          },
        }, {
          class: 'neural-network__control',
          innerText: 'MANIFEST {}',
          addEventListener: {
            click: () => {
              let json = this.toJSON();
              console.log(json);
            }
          }
        }]
      }],
    });

    // refs
    this.ref = {};
    this.ref.learningRate = this.el.querySelector('[data-stat="learning-rate"]');
    this.ref.statCycles = this.el.querySelector('[data-stat="cycles"]');
    this.ref.statEpochs = this.el.querySelector('[data-stat="epochs"]');
    this.ref.statError = this.el.querySelector('[data-stat="error"]');
    this.ref.statTime = this.el.querySelector('[data-stat="time"]');

    // add to doc
    document.querySelector('body').appendChild(this.el);
  }
}

export default NeuralNetwork;
