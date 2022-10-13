/** Neural network */

import Layer from './layer';
import Activation from './activation';
import Element from '../util/element';
import Round from '../maths/round';

const LEARNING_RATE = 0.01;

class NeuralNetwork {
  constructor() {
    this.stats = {
      learningRate: LEARNING_RATE,
      epochs: 0,
      steps: 0,
      dff: 0,
      totalError: 0,
      averageError: 0,
    };
    this.renderScaffold();
  }

  bind(root) {
    this.ref = {};
    this.ref.dataset = root.modules.dataset;
  }

  onDatasetLoaded() {
    // create layers
    this.layers = [
      { size: this.ref.dataset.getInputSize(), },
      // { size: this.ref.dataset.getHiddenLayerSize(), bias: 0, activation: Activation.SIGMOID },
      { size: 12, bias: 0, activation: Activation.SIGMOID },
      { size: 6, bias: 0, activation: Activation.SIGMOID },
      { size: 5, bias: 0, activation: Activation.SIGMOID },
      // { size: this.ref.dataset.getOutputSize(), bias: 1, activation: Activation.SIGMOID },
      { size: this.ref.dataset.getOutputSize(), activation: Activation.SIGMOID },
    ].map((params, i) => new Layer({ index: i, ...params }));

    // connect neurons
    for (let i=0; i<this.layers.length; i++) {
      if (i + 1 < this.layers.length) {
        this.layers[i].connect(this.layers[i+1]);
      }
    }

    // layer refs
    this.inputLayer = this.layers[0];
    this.hiddenLayers = this.layers.filter((layer, i) => i > 0 && i < this.layers.length-1);
    this.outputLayer = this.layers[this.layers.length-1];

    // render UI
    this.render();

    // set initial
    this.reset();
  }

  forward(input=null) {
    if (!input) {
      let index = this.ref.dataset.getCurrentIndex();
      let data = this.ref.dataset.getData(index);
      input = data.input;
    }
    this.inputLayer.setValues(input);
    this.layers.forEach(layer => layer.forward());
  }

  backpropagate(target) {
    // create target if not array
    target = this.ref.dataset.getOutputArray(target);

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
      layer.neurons.forEach(neuron => neuron.backpropagate(LEARNING_RATE));
    });
  }

  getError(target) {
    target = this.ref.dataset.getOutputArray(target);
    let error = 0;
    this.outputLayer.neurons.forEach((neuron, i) => {
      error += Math.pow(target[i] - neuron.value, 2);
    });
    return error;
  }

  runEpochStep(index) {
    let data = this.ref.dataset.getData(index);
    this.forward(data.input);
    this.backpropagate(data.output);
    this.ref.dataset.setError(index, this.getError(data.output));
    this.stats.steps += 1;
  }

  runEpochs(n=1) {
    let samples = this.ref.dataset.getDataSize();
    for (let i=0; i<n; i++) {
      let error = 0;
      for (let j=0; j<samples; j++) {
        this.runEpochStep(j);
        error += this.ref.dataset.getError(j);
      }
      this.stats.totalError = Round(error, 4);
      this.stats.averageError = Round(error / samples, 4);
      this.stats.epochs += 1;
      this.ref.dataset.shuffleData();
    }
  }

  forwardSingle() {
    this.forward();
    let index = this.getOutputValue();
    console.log(index);
  }

  getOutputValue() {
    let values = this.outputLayer.neurons.map(neuron => neuron.getValue());
    //let total = values.reduce((a, b) => a + b);
    //let normalised = values.map(value => value / total);
    //let max = Math.max(...normalised);
    let max = Math.max(...values);
    let index = values.findIndex(value => value == max);
    return index;
  }

  step() {
    this.runEpochStep(this.ref.dataset.getCurrentIndex());
    this.ref.dataset.nextIndex();
  }

  loop(n=1) {
    if (this.looping) {
      this.looping = false;
    } else {
      this.looping = true;
      const callback = () => {
        return new Promise((resolve, reject) => {
          this.runEpochs(n);
          // select random data point for visual interest
          let index = Math.floor(this.ref.dataset.getDataSize() * Math.random());
          let input = this.ref.dataset.getData(index).input;
          this.forward(input);
          // refresh
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
    this.forward(this.ref.dataset.getData(0).input);
    this.refresh();
  }

  refresh() {
    this.layers.forEach(layer => layer.refresh());
    for (const key in this.stats) {
      this.ref[key].innerText = this.stats[key];
    }
    this.ref.dataset.refresh();
  }

  toJSON() {
    let json = {
      layers: this.layers.map(layer => layer.toJSON()),
    };
    return json;
  }

  renderScaffold() {
    let scaffold = Element({
      class: 'neural-network',
      children: [{
          class: 'neural-network__header',
          innerHTML: '&nbsp;'
        },{
          class: 'neural-network__body',
          children: [
            { id: 'neural-network', class: 'neural-network__network' },
            { id: 'dataset', class: 'neural-network__dataset' },
          ],
        }, {
          class: 'neural-network__footer',
        },
      ]
    });
    document.querySelector('body').appendChild(scaffold);
  }

  render() {
    this.el = {};
    this.el.layers = Element({ class: 'neural-network__layers' });
    this.el.controls = Element({ class: 'neural-network__controls' });
    this.el.stats = Element({ class: 'neural-network__stats' });
    this.el.inputBox = Element({ class: 'neural-network__input-box' });

    // add layers
    this.layers.forEach(layer => {
      this.el.layers.appendChild(layer.el);
    });

    // add controls
    let labelCallback = {
      'RESET': () => { this.reset(); },
      'FORWARD>>': () => { this.forwardSingle(); },
      'STEP+1': () => { this.step(); },
      'EPOCH+1': () => { this.runEpochs(1); },
      'E+100': () => { this.runEpochs(100); },
      'E+1K': () => { this.runEpochs(1000); },
      'LOOP+': () => { this.loop(1); },
      'LOOP+10': () => { this.loop(10); },
      'LOOP+50': () => { this.loop(50); },
      'MANIFEST {}': () => { console.log(this.toJSON()); },
    };
    for (const key in labelCallback) {
      let label = key;
      let callback = labelCallback[key];
      this.el.controls.appendChild(
        Element({
          class: 'neural-network__control',
          innerText: key,
          addEventListener: {
            click: () => {
              console.log(key);
              callback();
              this.refresh();
            }
          },
        })
      );
    }

    // add stats
    for (const key in this.stats) {
      let stat = Element({
        class: 'neural-network__stat',
        innerHTML: `${key}: <span></span>`,
      });
      this.el.stats.appendChild(stat);
      this.ref[key] = stat.querySelector('span');
    }

    // add inputs
    this.el.inputBox.appendChild(Element({
      class: 'input-box',
      children: [{
        type: 'input',
        name: 'nn-input'
      }, {
        class: 'input-box__button',
        innerText: '>>',
        addEventListener: {
          click: () => {
            let v = this.el.inputBox.querySelector('input[name="nn-input"]').value;
            let input = v.split(',').map(v => parseInt(v));
            this.ref.dataset.normalise(input);
            this.forward(input);
            let output = this.getOutputValue();
            this.el.inputBox.querySelector('input[name="nn-output"]').value = output;
            console.log(v, input, output);
            this.refresh();
          }
        }
      }, {
        type: 'input',
        name: 'nn-output'
      }]
    }));

    // add to doc
    document.querySelector('#neural-network').appendChild(this.el.layers);
    document.querySelector('#neural-network').appendChild(this.el.stats);
    document.querySelector('#neural-network').appendChild(this.el.inputBox);
    document.querySelector('.neural-network__footer').appendChild(this.el.controls);
  }
}

export default NeuralNetwork;
