/** Neuron */

import * as THREE from 'three';
import Global from '../render/global';
import Activation from './activation';
import Clamp from '../util/clamp';
import { v4 as uuidv4 } from 'uuid';

const CHANGED_THRESHOLD = 0.01;
const BLEND = 0.025;

class Neuron {
  constructor(params) {
    this.id = uuidv4();

    // network settings
    this.activation = params.activation || Activation.NONE;
    this.bias = params.bias || 0;

    // state
    this.value = 0;
    this.error = 0;
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
    this.chooseActivationFunction();
  }

  addConnectionOut(conn) {
    this.connections.out.push(conn);
    this.chooseActivationFunction();
  }

  chooseActivationFunction() {
    if (this.activation === Activation.NONE) {
      this.activation = Activation.LEAKY_RELU;
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
    this.errorBuffer = error * Activation.getDerivative(this.activation, this.value);
  }

  swap() {
    this.value = this.valueBuffer;
    this.error = this.errorBuffer;
  }

  update() {
    let scale = this.mesh.scale.x + (Math.max(0.25, this.value) - this.mesh.scale.x) * BLEND;
    this.mesh.scale.setScalar(scale);
    let target = Clamp(this.value, 0, 1);
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * BLEND;
  }
}

Neuron.prototype.isNeuron = true;

export default Neuron;
