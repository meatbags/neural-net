/** Neural network dynamic */

import * as THREE from 'three';
import Neuron from './neuron';
import Sensor from './sensor';
import Connection from './connection';

class NeuralNetworkDynamic {
  constructor() {
    this.children = [];
    this.timer = { age: 0, reset: 0.1 };

    // INPUT
    let input = [
      new Sensor({value: 0, position: new THREE.Vector3(0, -1, 0)}),
      new Sensor({value: 1, position: new THREE.Vector3(0, 1, 0)}),
    ];
    let h1 = [
      new Neuron({position: new THREE.Vector3(5, -1, 0)}),
      new Neuron({position: new THREE.Vector3(5, 1, 0)})
    ];
    let h2 = [
      new Neuron({position: new THREE.Vector3(10, -4, 0)}),
      new Neuron({position: new THREE.Vector3(10, -2, 0)}),
      new Neuron({position: new THREE.Vector3(10, 0, 0)}),
      new Neuron({position: new THREE.Vector3(10, 2, 0)}),
      new Neuron({position: new THREE.Vector3(10, 4, 0)}),
    ];
    let h3 = [
      new Neuron({position: new THREE.Vector3(15, -2, 0)}),
      new Neuron({position: new THREE.Vector3(15, 0, 0)}),
      new Neuron({position: new THREE.Vector3(15, 2, 0)}),
    ];
    let output = [
      new Sensor({value: 0, position: new THREE.Vector3(20, 2, 0)}),
      new Sensor({value: 0, position: new THREE.Vector3(20, 0, 0)}),
      new Sensor({value: 1, position: new THREE.Vector3(20, -2, 0)}),
    ];

    this.children = [ ...input, ...h1, ...h2, ...h3, ...output ];
    const singleConnect = (a, b) => {
      a.forEach((src, i) => {
        this.children.push(new Connection(a[i], b[i]));
      });
    };
    const crossConnect = (a, b) => {
      a.forEach(src => {
        b.forEach(dst => {
          this.children.push(new Connection(src, dst));
        });
      });
    };

    // connect
    singleConnect(input, h1);
    crossConnect(h1, h2);
    crossConnect(h2, h3);
    singleConnect(h3, output);

    window.addEventListener('click', () => {
      this.children.forEach(child => {
        if (child.isSensor) {
          child.value = Math.round(Math.random());
        }
      });
    });
  }

  update(delta) {
    // step network
    this.timer.age -= delta;
    if (this.timer.age <= 0) {
      this.timer.age += this.timer.reset;
    }

    // update network
    this.children.forEach(child => { if (child.buffer) child.buffer(); });
    this.children.forEach(child => { if (child.swap) child.swap(); });

    // update graphics
    this.children.forEach(child => child.update(delta));
  }
}

export default NeuralNetworkDynamic;
