/** Neural network dynamic */

import * as THREE from 'three';
import Neuron from './neuron';
import Sensor from './sensor';
import Connection from './connection';

class NeuralNetworkDynamic {
  constructor() {
    this.children = [];
    this.timer = { age: 0, reset: 0.1 };

    let r1 = 30;
    let r2 = 5;
    let posterise = 0.1;
    let activeRadius = 4;
    let dotThreshold = 0.45;
    let padding = 1.5;
    let inputNeurons = 20;
    let neuronShells = 12;
    let neuronSpacing = 1;
    let outputNeurons = 12;

    // groups
    let inputs = [];
    let neurons = [];
    let outputs = [];

    // sensors INPUT
    for (let i=0; i<inputNeurons; i++) {
      let angle = Math.PI * 2 / inputNeurons * i;
      let p = new THREE.Vector3(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      let p2 = new THREE.Vector3(Math.cos(angle) * (r1-padding), Math.sin(angle) * (r1-padding), 0);
      let sensor = new Sensor({value: Math.random(), position: p});
      let neuron = new Neuron({position: p2});
      let conn = new Connection(sensor, neuron);
      sensor.mesh.rotation.z = angle;
      inputs.push(sensor);
      neurons.push(neuron);
      this.children.push(sensor, neuron, conn);
    }

    // hidden layers
    let n = 500;
    while (neurons.length < n) {
      let x = (Math.random() * 2 - 1) * r1;
      let y = (Math.random() * 2 - 1) * r1;
      let dist = Math.hypot(x, y);
      dist = Math.round(dist / posterise) * posterise;
      if (dist < r2 + padding*2 || dist > r1 - padding*2) continue;
      let angle = Math.atan2(y, x);
      x = Math.cos(angle) * dist;
      y = Math.sin(angle) * dist;
      let p = new THREE.Vector3(x, y, 0);
      let neuron = new Neuron({position: p});
      neurons.push(neuron);
      this.children.push(neuron);
    }

    // sensors OUTPUT
    for (let i=0; i<outputNeurons; i++) {
      let angle = Math.PI * 2 / outputNeurons * i;
      let p = new THREE.Vector3(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
      let p2 = new THREE.Vector3(Math.cos(angle) * (r2+padding), Math.sin(angle) * (r2+padding), 0);
      let sensor = new Sensor({value: Math.random(), position: p});
      let neuron = new Neuron({position: p2});
      let conn = new Connection(sensor, neuron);
      sensor.mesh.rotation.z = angle;
      outputs.push(sensor);
      neurons.push(neuron);
      this.children.push(sensor, neuron, conn);
    }

    // connect neurons inward N->N
    let origin = new THREE.Vector3();
    neurons.forEach(neuron => {
      let p = neuron.mesh.position;
      let normal = origin.clone().sub(p).normalize();
      let dist = origin.distanceTo(p);

      // get siblings between neuron & centre
      let siblings = neurons.filter(n => {
        if (n.id === neuron.id) return false;
        let np = n.mesh.position;
        if (np.distanceTo(p) > dist) return false;
        if (np.clone().sub(p).normalize().dot(normal) < dotThreshold) return false;
        return true;
      });

      // connect inside radius favouring nearby
      siblings.forEach(sibling => {
        let dist = sibling.mesh.position.distanceTo(p);
        if (dist < activeRadius) {
          let conn = new Connection(neuron, sibling);
          this.children.push(conn);
        }
      });
    });

    // get refs
    this.sensors = this.children.filter(child => child.isSensor);
    this.neurons = this.children.filter(child => child.isNeuron);
    this.connections = this.children.filter(child => child.isConnection);

    // logs
    console.log('SENSORS:', this.sensors.length);
    console.log('CONNECTIONS:', this.connections.length);
    console.log('NEURONS:', this.neurons.length);

    // reset all children
    window.addEventListener('click', () => {
      this.sensors.forEach(child => {
        child.value = Math.round(Math.random());
      });
    });
  }

  update(delta) {
    // randomly change a sensor
    if (Math.random() > 0.1) {
      let index = Math.floor(Math.random() * this.sensors.length);
      this.sensors[index].value = Math.random();
    }

    // update network
    this.children.forEach(child => { if (child.buffer) child.buffer(); });
    this.children.forEach(child => { if (child.swap) child.swap(); });

    // update graphics
    this.children.forEach(child => child.update(delta));
  }
}

export default NeuralNetworkDynamic;
