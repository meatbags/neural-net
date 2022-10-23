/** Neural network dynamic */

import * as THREE from 'three';
import Config from './config';
import Neuron from './neuron';
import Sensor from './sensor';
import Connection from './connection';
import RandRange from '../maths/rand_range';

class NeuralNetworkDynamic {
  constructor() {
    this.timer = { age: 0, reset: 0.1 };

    // groups
    this.children = [];
    this.neurons = [];
    this.sensors = [];
    this.connections = [];

    // sensor/input neuron pairs
    for (let i=0; i<6; i++) {
      let isInput = i % 2 == 0;
      let x = (Math.random() * 2 - 1) * 30;
      let y = (Math.random() * 2 - 1) * 30;
      let origin = new THREE.Vector3(x, y, 0);
      let radiusOuter = Config.NETWORK_RADIUS_OUTER + Math.random() * 5;
      let radiusInner = Config.NETWORK_RADIUS_INNER + Math.random() * 10;
      let countInput = RandRange(Config.INPUT_NEURONS_MIN, Config.INPUT_NEURONS_MAX + 1);
      let countOutput = RandRange(Config.OUTPUT_NEURONS_MIN, Config.OUTPUT_NEURONS_MAX + 1);
      this.createSensorCluster(countInput, origin, radiusOuter, true);
      this.createSensorCluster(countOutput, origin, radiusInner, false);

      // generate neurons between input and output clusters
      let radiusRange = radiusOuter - radiusInner;
      let shells = Math.floor(radiusRange / Config.NEURON_SHELL_SIZE);
      let shellOffset = (radiusRange % Config.NEURON_SHELL_SIZE) / 2;

      for (let i=0; i<shells; i++) {
        let r = radiusInner + shellOffset + Config.NEURON_SHELL_SIZE * i;
        let positions = this.getRing(origin, r, Config.NEURON_SPACING);
        positions.forEach(p => {
          p.x += (Math.random() * 2 - 1) * Config.NEURON_RANDOMISE_POSITION;
          p.y += (Math.random() * 2 - 1) * Config.NEURON_RANDOMISE_POSITION;
          this.createNeuron(p, origin);
        });
      }
    }

    // connect neurons
    this.neurons.forEach(n => {
      this.connectToNetwork(n, this.neurons);
    });

    // logs
    console.log('SENSORS:', this.sensors.length);
    console.log('INPUT:', this.neurons.filter(n => n.isInputNeuron()).length);
    console.log('OUTPUT:', this.neurons.filter(n => n.isOutputNeuron()).length);
    console.log('NEURONS:', this.neurons.length);
    console.log('CONNECTIONS:', this.connections.length);

    // reset all children
    window.addEventListener('click', () => {
      this.randomise();
    });
  }

  createSensorCluster(count, origin, radius, isInput=true) {
    let offsetScale = isInput ? -1 : 1;
    for (let i=0; i<count; i++) {
      let angle = i / count * Math.PI * 2;
      let sinA = Math.sin(angle);
      let cosA = Math.cos(angle);
      let p = new THREE.Vector3(origin.x + cosA * radius, origin.y + sinA * radius, origin.z);
      let n = new THREE.Vector3(offsetScale * cosA, offsetScale * sinA, 0);
      this.createSensor(p, n, isInput);
    }
  }

  createSensor(position, orientation, isInput=true) {
    let p1 = position.clone();
    let p2 = position.clone().add(orientation.clone().multiplyScalar(Config.SENSOR_RADIUS_OFFSET));
    let sensor = new Sensor({ position: p1 });
    let neuron = new Neuron({ position: p2 });
    let connection = null;
    if (isInput) {
      connection = new Connection(sensor, neuron);
    } else {
      connection = new Connection(neuron, sensor);
    }
    this.children.push(sensor, neuron, connection);
    this.sensors.push(sensor);
    this.neurons.push(neuron);
    this.connections.push(connection);
  }

  createNeuron(position, origin=null) {
    let neuron = new Neuron({ position });
    if (origin) {
      neuron.userData = { origin };
    }
    this.children.push(neuron);
    this.neurons.push(neuron);
  }

  connectToNetwork(neuron, network) {
    if (neuron.isOutputNeuron()) return;

    // props
    let p = neuron.mesh.position;
    let input = null;
    let output = null;
    let d1 = -1;
    let d2 = -1;
    let normal = null;

    // defined origin
    if (neuron.userData && neuron.userData.origin) {
      normal = neuron.userData.origin.clone().sub(p).normalize();

    // get nearest input & output sensor
    } else {
      network.forEach(n => {
        let dist = n.mesh.position.distanceTo(p);
        if (n.isOutputNeuron() && (output === null || dist < d1)) {
          output = n;
          d1 = dist;
        } else if (n.isInputNeuron() && (input === null || dist < d2)) {
          input = n;
          d2 = dist;
        }
      });

      // check input and output in network
      if (input === null || output === null) {
        console.log('Missing input/output targets:', input, output);
        return;
      }

      // check neuron between input and output
      let v1 = p.clone().sub(input.mesh.position);
      let v2 = p.clone().sub(output.mesh.position);
      if (v1.dot(v2) > 0) {
        console.log('Neuron not between targets');
        return;
      }

      // normal vector towards output
      let origin = new THREE.Vector3();
      normal = output.mesh.position.clone().sub(input.mesh.position).normalize();
    }


    // get candidate sibling neurons between neuron & nearest output
    let siblings = network.filter(n => {
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
        this.connections.push(conn);
        siblings.splice(i, 1);
        if (
          Config.NEURON_CONNECTIONS_MAX > 0 &&
          neuron.connections.out.length == Config.NEURON_CONNECTIONS_MAX
        ) {
          break;
        }
      }
    }
  }

  randomise() {
    //this.neurons.forEach(neuron => neuron.randomise());
    this.sensors.forEach(sensor => sensor.randomise());
    this.connections.forEach(conn => conn.reset());
  }

  getRing(origin, radius, spacing) {
    let positions = [];
    let c = radius * Math.PI * 2;
    let steps = Math.floor(c / spacing);
    let thetaOffset = Math.random() * Math.PI * 2;
    let thetaStep = Math.PI * 2 / steps;
    for (let i=0; i<steps; i++) {
      let theta = thetaOffset + thetaStep * i;
      let x = origin.x + Math.cos(theta) * radius;
      let y = origin.y + Math.sin(theta) * radius;
      let z = Math.random() * 2 - 1;
      positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
  }

  update(delta) {
    // randomly change a sensor
    let index = Math.floor(Math.random() * this.sensors.length);
    this.sensors[index].randomise();

    // randomly move a neuron
    // index = Math.floor(Math.random() * this.neurons.length);
    // this.neurons[index].drift();

    // update network
    this.children.forEach(child => { if (child.buffer) child.buffer(); });
    this.children.forEach(child => { if (child.swap) child.swap(); });

    // update graphics
    this.children.forEach(child => child.update(delta));
  }
}

export default NeuralNetworkDynamic;
