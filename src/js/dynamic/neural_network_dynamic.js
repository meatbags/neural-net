/** Neural network dynamic */

import * as THREE from 'three';
import Config from './config';
import Neuron from './neuron';
import Sensor from './sensor';
import Connection from './connection';

class NeuralNetworkDynamic {
  constructor() {
    this.children = [];
    this.timer = { age: 0, reset: 0.1 };

    // sensors & input neurons
    for (let i=0; i<Config.INPUT_NEURONS; i++) {
      let angle = Math.PI * 2 / Config.INPUT_NEURONS * i;
      let r1 = Config.NETWORK_RADIUS_OUTER + Config.SENSOR_RADIUS_OFFSET;
      let r2 = Config.NETWORK_RADIUS_OUTER;
      let p = new THREE.Vector3(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      let p2 = new THREE.Vector3(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
      let sensor = new Sensor({position: p});
      let neuron = new Neuron({position: p2});
      let conn = new Connection(sensor, neuron);
      sensor.mesh.rotation.z = angle;
      this.children.push(sensor, neuron, conn);
    }

    // neuron shells
    let radiusRange = Config.NETWORK_RADIUS_OUTER - Config.NETWORK_RADIUS_INNER;
    let radiusStep = radiusRange / (Config.NEURON_SHELLS + 1);
    for (let i=0; i<Config.NEURON_SHELLS; i++) {
      let radius = Config.NETWORK_RADIUS_INNER + radiusStep * (i + 1);
      let positions = this.getRing(radius, Config.NEURON_SPACING);
      positions.forEach(p => {
        p.x += (Math.random() * 2 - 1) * Config.NEURON_RANDOMISE_POSITION;
        p.y += (Math.random() * 2 - 1) * Config.NEURON_RANDOMISE_POSITION;
        let neuron = new Neuron({position: p});
        this.children.push(neuron);
      });
    }

    // sensors & output neurons
    for (let i=0; i<Config.OUTPUT_NEURONS; i++) {
      let angle = Math.PI * 2 / Config.OUTPUT_NEURONS * i;
      let r1 = Config.NETWORK_RADIUS_INNER - Config.SENSOR_RADIUS_OFFSET;
      let r2 = Config.NETWORK_RADIUS_INNER;
      let p = new THREE.Vector3(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      let p2 = new THREE.Vector3(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
      let sensor = new Sensor({position: p});
      let neuron = new Neuron({position: p2});
      let conn = new Connection(neuron, sensor);
      sensor.mesh.rotation.z = angle;
      this.children.push(sensor, neuron, conn);
    }

    // get refs
    this.sensors = this.children.filter(child => child.isSensor);
    this.neurons = this.children.filter(child => child.isNeuron);

    // connect neurons
    let origin = new THREE.Vector3();
    this.neurons.forEach(neuron => {
      let p = neuron.mesh.position;
      let normal = origin.clone().sub(p).normalize();

      // get siblings between neuron & centre
      let siblings = this.neurons.filter(n => {
        if (
          n.id === neuron.id ||
          n.mesh.position.distanceTo(p) > Config.NEURON_CONNECTION_LENGTH_MAX ||
          n.mesh.position.clone().sub(p).normalize().dot(normal) < Config.NEURON_CONNECTION_DOT_MIN ||
          neuron.isConnected(n)
        ) {
          return false;
        }
        return true;
      });

      // no possible connections
      if (siblings.length == 0) {
        console.log('No siblings');
      }

      // connect inside radius favouring nearby
      while (neuron.connections.out.length < Config.NEURON_CONNECTIONS_MIN && siblings.length) {
        for (let i=siblings.length-1; i>=0; i--) {
          let sibling = siblings[i];
          // let dist = sibling.mesh.position.distanceTo(p);
          if (Math.random() > Config.NEURON_CONNECTION_CHANCE) {
            continue;
          }
          let conn = new Connection(neuron, sibling);
          this.children.push(conn);
          siblings.splice(i, 1);
          if (Config.NEURON_CONNECTIONS_MAX > 0 && neuron.connections.out.length == Config.NEURON_CONNECTIONS_MAX) {
            break;
          }
        }
      }
    });

    // get connections
    this.connections = this.children.filter(child => child.isConnection);

    // logs
    console.log('SENSORS:', this.sensors.length);
    console.log('CONNECTIONS:', this.connections.length);
    console.log('NEURONS:', this.neurons.length);

    // reset all children
    window.addEventListener('click', () => {
      this.randomise();
    });
  }

  randomise() {
    //this.neurons.forEach(neuron => neuron.randomise());
    this.sensors.forEach(sensor => sensor.randomise());
    this.connections.forEach(conn => conn.reset());
  }

  getRing(radius, spacing) {
    let positions = [];
    let c = radius * Math.PI * 2;
    let steps = Math.floor(c / spacing);
    let thetaOffset = Math.random() * Math.PI * 2;
    let thetaStep = Math.PI * 2 / steps;
    for (let i=0; i<steps; i++) {
      let theta = thetaOffset + thetaStep * i;
      positions.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
    }
    return positions;
  }

  update(delta) {
    // randomly change a sensor
    let index = Math.floor(Math.random() * this.sensors.length);
    this.sensors[index].randomise();

    // randomly move a neuron
    index = Math.floor(Math.random() * this.neurons.length);
    this.neurons[index].drift();

    // update network
    this.children.forEach(child => { if (child.buffer) child.buffer(); });
    this.children.forEach(child => { if (child.swap) child.swap(); });

    // update graphics
    this.children.forEach(child => child.update(delta));
  }
}

export default NeuralNetworkDynamic;
