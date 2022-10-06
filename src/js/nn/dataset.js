/** Dataset */

import Element from '../util/element';
import Round from '../maths/round';

// visualiser
let MAX_VISIBLE_DATA_ITEMS = 100;

// network settings
let HIDDEN_LAYER_SIZE_REDUCER = 7;

// data shaping
let PADDING_VALUE = 10;
let MINIMUM_TOTAL_SIZE = 4;
let MAXIMUM_INPUT_SIZE = 4;
let MAXIMUM_INPUT_VALUE = 10;

class Dataset {
  constructor() {
    this.data = [];
    this.tokenMap = {};
    this.tokensUsed = {};
    this.currentIndex = 0;
    this.inputSize = null;
    this.outputSize = null;
  }

  bind(root) {
    this.ref = {};
    this.ref.neuralNetwork = root.modules.neuralNetwork;

    // load data
    fetch('./data/data.txt')
      .then(res => res.text())
      .then(text => {
        this.processRawData(text);
        this.render();
        this.ref.neuralNetwork.onDatasetLoaded();
      });
  }

  processRawData(text) {
    // tokenise data (0-9 => 0-9), (symbols=negative numbers)
    let data = text.split('\r\n');
    data = data.filter(row => row !== '' && row.indexOf(';') !== -1);
    data = data.map(row => this.tokenise(row.split(';')[1]));

    // filter non-numerical data (negative tokens) i.e. xP-F
    data = data.map(row => row.filter(value => value >= 0));

    // remove short data
    data = data.filter(row => row.length >= MINIMUM_TOTAL_SIZE);

    // shift data down 1 mod 10 (1->0, 0->9)
    data = data.map(row => row.filter(value => value == 0 ? 9 : value - 1));

    // pad data left
    let max = Math.max(...data.map(row => row.length));
    data = data.map(row => {
      row.unshift(...new Array(max - row.length).fill(PADDING_VALUE));
      return row;
    });

    // get input & output data
    data = data.map(row => ({
      input: row.slice(0, row.length - 1),
      output: row[row.length - 1],
    }));

    // resize input data
    data.forEach(row => {
      row.input = row.input.slice(row.input.length - MAXIMUM_INPUT_SIZE);
    });

    // normalise input data
    data.forEach(row => {
      row.input = row.input.map(value => value / MAXIMUM_INPUT_VALUE);
    });

    // set data, shuffle
    this.data = data;
    this.shuffleData();
  }

  tokenise(data) {
    return data.split('').map(char => {
      if (this.tokenMap[char] === undefined) {
        // get int token
        if (!Number.isNaN(parseInt(char))) {
          this.tokenMap[char] = parseInt(char);

        // find next NaN token
        } else {
          let n = -1;
          while (this.tokensUsed[n]) {
            n -= 1;
          }
          this.tokenMap[char] = n;
        }
      }
      this.tokensUsed[this.tokenMap[char]] = true;
      return this.tokenMap[char];
    });
  }

  setError(index, error) {
    this.data[index].error = error;
  }

  getError(index) {
    return this.data[index].error;
  }

  getData(index=null) {
    if (index !== null) {
      return this.data[index];
    }
    return this.data;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  nextIndex() {
    this.currentIndex = (this.currentIndex + 1) % this.data.length;
  }

  getInputSize() {
    if (this.inputSize === null) {
      this.inputSize = this.data[0].input.length;
    }
    return this.inputSize;
  }

  getOutputSize() {
    if (this.outputSize === null) {
      this.outputSize = Math.max(...this.data.map(row => row.output)) + 1;
    }
    return this.outputSize;
  }

  getHiddenLayerSize() {
    // calculate roughly appropriate hidden layer size
    // nSamples / (a * (nInput + nOutput))
    let nInput = this.getInputSize();
    let nOutput = this.getOutputSize();
    let nSamples = this.data.length;
    let s = nSamples / (HIDDEN_LAYER_SIZE_REDUCER * (nInput + nOutput));
    return Math.round(s);
  }

  getOutputArray(index) {
    let size = this.getOutputSize();
    let arr = new Array(size).fill(0);
    arr[index] = 1;
    return arr;
  }

  getDataSize() {
    return this.data.length;
  }

  onDataSelected(index) {
    this.currentIndex = index;
    console.log(this.getData(this.currentIndex));
    this.ref.neuralNetwork.forwardSingle();
    this.ref.neuralNetwork.refresh();
  }

  shuffleData() {
    for (let i=this.data.length-1; i>0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      this.data[i].index = j;
      this.data[j].index = i;
      [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
  }

  refresh() {
    this.el.querySelectorAll('.data.active').forEach(el => el.classList.remove('active'));
    this.data.forEach((row, i) => {
      if (!row.visible) return;

      // set update index (shuffled each epoch)
      row.el.dataset.index = i;
      row.el.parentNode.appendChild(row.el);

      // set error
      let err = row.error !== undefined ? Round(row.error, 4) : 'n/a';
      row.el.querySelector('.data-error').innerText = err;
      if (this.currentIndex == i) {
        row.el.classList.add('active');
      }
    });
  }

  render() {
    this.el = Element({
      class: 'dataset',
      children: [{
        class: 'dataset__header',
        innerText: `DATASET (n=${this.data.length}, showing=${MAX_VISIBLE_DATA_ITEMS})`
      }, {
        class: 'dataset__body',
      }]
    });

    // add data elements -- get dom refs
    let datasetBody = this.el.querySelector('.dataset__body');
    this.data.forEach((row, i) => {
      row.visible = i < MAX_VISIBLE_DATA_ITEMS;
      if (!row.visible) return;
      row.el = Element({
        class: 'data',
        dataset: { index: i },
        children: [{
            class: 'data-input',
            innerText: row.input.map(v => {
              return v == 1 ? 'A' : Math.round(v * MAXIMUM_INPUT_VALUE);
            }).join(' ')
          },
          { class: 'data-output', innerText: row.output },
          { class: 'data-error', },
        ],
        addEventListener: {
          click: () => {
            this.onDataSelected(row.index);
          },
        }
      });
      datasetBody.appendChild(row.el);
    });

    // add to doc
    this.domTarget = document.querySelector('#dataset');
    this.domTarget.appendChild(this.el);
  }
}

export default Dataset;
