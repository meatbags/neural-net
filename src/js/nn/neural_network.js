/** Neural network */

import Layer from './layer';
import Activation from './activation';
import Element from '../util/element';
import Round from '../maths/round';

class NeuralNetwork {
  constructor() {
    this.datasetIndex = -1;
    this.dataset = [
      { input: [0, 0], output: 0 },
      { input: [0, 1], output: 1 },
      { input: [1, 0], output: 0 },
      { input: [1, 1], output: 1 },
    ]

    // state
    this.state = {
      learningRate: 0.125,
      inputSize: 2,
      outputSize: 2,
    };

    // stats
    this.stats = {
      epochs: 0,
      steps: 0,
      totalError: 0,
    };

    // create layers
    this.layers = [
      { size: this.state.inputSize, },
      { size: 8, bias: 1, activation: Activation.SIGMOID },
      { size: this.state.outputSize, activation: Activation.SIGMOID },
    ].map(params => new Layer(params));
    for (let i=0; i<this.layers.length; i++) {
      if (i + 1 < this.layers.length) {
        this.layers[i].connect(this.layers[i+1]);
      }
    }

    // layer refs
    this.inputLayer = this.layers[0];
    this.hiddenLayers = this.layers.filter((layer, i) => i !== 0 && i !== this.layers.length-1);
    this.outputLayer = this.layers[this.layers.length-1];

    // render UI
    this.render();

    // set initial
    this.reset();
  }

  forward(input=null) {
    if (!input) return;
    this.inputLayer.setValues(input);
    this.layers.forEach(layer => layer.forward());
  }

  getTargetArray(target) {
    let arr = new Array(this.state.outputSize).fill(0);
    arr[target] = 1;
    return arr;
  }

  backpropagate(target) {
    // create target if not array
    target = this.getTargetArray(target);

    // backpropagate output
    this.outputLayer.neurons.forEach((neuron, i) => {
      neuron.calculateError(target[i]);
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

  getError(expected) {
    expected = this.getTargetArray(expected);
    let error = 0;
    this.outputLayer.neurons.forEach((neuron, i) => {
      error += Math.pow(expected[i] - neuron.value, 2);
    });
    return error;
  }

  runEpochStep(index) {
    let data = this.dataset[index];
    this.forward(data.input);
    this.backpropagate(data.output);
    data.error = this.getError(data.output);
    this.stats.steps += 1;
  }

  runEpochs(n=1) {
    this.datasetIndex = -1;
    for (let i=0; i<n; i++) {
      let error = 0;
      for (let j=0; j<this.dataset.length; j++) {
        this.runEpochStep(j);
        error += this.dataset[j].error;
      }
      this.stats.totalError = Round(error, 4);
      this.stats.epochs += 1;
    }
  }

  onDataSelected(data) {
    this.datasetIndex = data.index;
    this.forward(data.input);
    this.refresh();
  }

  step() {
    this.datasetIndex = (this.datasetIndex + 1) % this.dataset.length;
    this.runEpochStep(this.datasetIndex);
  }

  loop() {
    if (this.looping) {
      this.looping = false;
    } else {
      this.looping = true;
      const callback = () => {
        return new Promise((resolve, reject) => {
          //let now = performance.now();
          this.runEpochs(1);
          //this.stats.time = `${Round(performance.now() - now, 3)}ms`;
          this.refresh();
          resolve();
        });
      };
      const loopCallback = () => {
        callback().then(() => {
          if (this.looping) {
            setTimeout(() => loopCallback(), 1);
          }
        });
      }
      loopCallback();
    }
  }

  reset() {
    this.layers.forEach(layer => layer.reset());
    this.stats.epochs = 0;
    this.stats.steps = 0;
    this.stats.totalError = 0;
    this.forward(this.dataset[0].input);
    this.refresh();
  }

  refresh() {
    this.layers.forEach(layer => layer.refresh());
    for (const key in this.stats) {
      this.ref[key].innerText = this.stats[key];
    }
    this.el.querySelectorAll('.data.active').forEach(el => el.classList.remove('active'));
    this.dataset.forEach((data, i) => {
      let err = data.error !== undefined ? Round(data.error, 4) : 'n/a';
      data.el.querySelector('.data__error').innerText = err;
      if (this.datasetIndex == i) {
        data.el.classList.add('active');
      }
    });
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
        class: 'neural-network__body',
        children: [{
          class: 'neural-network__layers',
          children: this.layers.map(layer => layer.el),
        }, {
          class: 'neural-network__dataset',
        }]
      }, {
        class: 'neural-network__footer',
        children: [
          { class: 'neural-network__controls' }
        ]
      }, {
        class: 'neural-network__stats',
      }],
    });

    // dataset
    this.dataset.forEach((data, i) => {
      data.index = i;
      data.el = Element({
        class: 'data',
        dataset: { index: i },
        children: [
          { class: 'data__input', innerText: data.input }, {
            class: 'data__output',
            innerText: `${data.output} [${this.getTargetArray(data.output).join(',')}]`
          },
          { class: 'data__error', },
        ],
        addEventListener: {
          click: () => {
            this.onDataSelected(data);
          }
        }
      });
      this.el.querySelector('.neural-network__dataset').appendChild(data.el);
    });

    // controls
    let controls = this.el.querySelector('.neural-network__controls');
    let labelCallback = {
      'RESET': () => { this.reset(); },
      'FORWARD': () => { this.forward(); },
      'STEP+1': () => { this.step(); },
      'EPOCH+1': () => { this.runEpochs(1); },
      'E+100': () => { this.runEpochs(100); },
      'E+1K': () => { this.runEpochs(1000); },
      'LOOP+': () => { this.loop(); },
      'MANIFEST {}': () => { console.log(this.toJSON()); },
    };
    for (const key in labelCallback) {
      let label = key;
      let callback = labelCallback[key];
      controls.appendChild(
        Element({
          class: 'neural-network__control',
          innerText: key,
          addEventListener: {
            click: () => {
              callback();
              this.refresh();
            }
          },
        })
      );
    }

    // refs
    this.ref = {};
    for (const key in this.stats) {
      let stat = Element({
        class: 'neural-network__stat',
        innerHTML: `${key}: <span></span>`,
      });
      this.el.querySelector('.neural-network__stats').appendChild(stat);
      this.ref[key] = stat.querySelector('span');
    }

    // add to doc
    document.querySelector('body').appendChild(this.el);
  }
}

export default NeuralNetwork;
