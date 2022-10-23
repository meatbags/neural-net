/** Neuron */

import * as THREE from 'three';
import Global from '../render/global';
import Activation from './activation';
import Clamp from '../util/clamp';
import Config from './config';
import { v4 as uuidv4 } from 'uuid';

class Neuron {
  constructor(params) {
    this.id = uuidv4();

    // network settings
    this.activation = params.activation || Activation.NONE;
    this.bias = params.bias || 0;

    // state
    this.active = true;
    this.value = 0;
    this.error = 0;
    this.derivative = -1;
    this.valueBuffer = this.value;
    this.errorBuffer = this.error;
    this.changed = false;
    this.connections = {};
    this.connections.in = [];
    this.connections.out = [];

    // visualiser
    let geo = new THREE.SphereBufferGeometry(0.5, 12, 12);
    let mat = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0});
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(params.position || new THREE.Vector3());
    Global.Scene.add(this.mesh);
  }

  getValue() {
    return this.value;
  }

  getError() {
    return this.error;
  }

  addConnectionIn(conn) {
    this.connections.in.push(conn);
    this.onConnected();
  }

  addConnectionOut(conn) {
    this.connections.out.push(conn);
    this.onConnected();
  }

  removeConnection(conn) {
    this.connections.out = this.connections.out.filter(c => c.id !== conn.id);
    this.connections.in = this.connections.in.filter(c => c.id !== conn.id);
  }

  isConnected(neuron) {
    return this.connections.in.findIndex(conn => conn.src.id === neuron.id) !== -1 ||
      this.connections.out.findIndex(conn => conn.dst.id === neuron.id) !== -1;
  }

  isInputNeuron() {
    return this.connections.in.findIndex(conn => conn.hasSensor) !== -1;
  }

  isOutputNeuron() {
    return this.connections.out.findIndex(conn => conn.hasSensor) !== -1;
  }

  onConnected() {
    if (this.isInputNeuron()) {
      this.activation = Activation.RELU;
    } else if (this.isOutputNeuron()) {
      this.activation = Activation.SIGMOID;
    } else {
      if (this.activation === Activation.NONE) {
        this.activation = Activation.LEAKY_RELU;
      }
    }
  }

  buffer() {
    // buffer input value
    let value = this.bias;
    this.connections.in.forEach(conn => { value += conn.getValue(); });
    this.valueBuffer = Activation.getValue(this.activation, value);

    // buffer output error
    let error = 0;
    this.connections.out.forEach(conn => { error += conn.getError(); });
    this.derivative = Activation.getDerivative(this.activation, this.value);
    this.errorBuffer = error * this.derivative;
  }

  randomise() {
    this.value = Math.random();
  }

  swap() {
    this.value = this.valueBuffer;
    this.error = this.errorBuffer;
  }

  drift() {
    const DRIFT = 0.25;
    this.mesh.position.x += (Math.random() * 2 - 1) * DRIFT;
    this.mesh.position.z += (Math.random() * 2 - 1) * DRIFT;
    this.connections.in.forEach(conn => conn.setPosition());
    this.connections.out.forEach(conn => conn.setPosition());
  }

  destroy() {
    this.connections.in.forEach(conn => conn.destroy());
    this.connections.out.forEach(conn => conn.destroy());
    Global.Sceme.remove(this.mesh);
  }

  update() {
    let scale = this.mesh.scale.x + (Math.max(0.25, this.value) - this.mesh.scale.x) * Config.BLEND_FACTOR;
    this.mesh.scale.setScalar(scale);
    let target = Clamp(this.value, 0, 1);
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * Config.BLEND_FACTOR;
  }
}

Neuron.prototype.isNeuron = true;

export default Neuron;
