/** Neuron */

import * as THREE from 'three';
import Global from '../render/global';
import Activation from './activation';
import Clamp from '../util/clamp';

const CHANGED_THRESHOLD = 0.01;

class Neuron {
  constructor(params) {
    // network settings
    this.activation = params.activation || Activation.SIGMOID;
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
    if (this.connections.in.length == 1) {
      this.activation = Activation.NONE;
    } else {
      this.activation = Activation.SIGMOID;
    }
  }

  addConnectionOut(conn) {
    this.connections.out.push(conn);
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
    // this.changed = (Math.abs(this.value - this.valueBuffer) >= CHANGED_THRESHOLD) || (Math.abs(this.error - this.errorBuffer) >= CHANGED_THRESHOLD);
    this.value = this.valueBuffer;
    this.error = this.errorBuffer;
  }

  update() {
    let target = Clamp(this.value, 0, 1);
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * 0.1;
  }
}

Neuron.prototype.isNeuron = true;

export default Neuron;
