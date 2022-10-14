/** Synapse */

import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import Global from '../render/global';
import Clamp from '../util/clamp';

const LEARNING_RATE = 1/8;
const CHANGED_THRESHOLD = 0.01;
const BLEND = 0.025;

class Connection {
  constructor(src, dst) {
    this.id = uuidv4();

    // props
    this.src = src;
    this.dst = dst;
    this.hasSensor = src.isSensor || dst.isSensor;

    // state
    this.src = src;
    this.dst = dst;
    this.weight = this.hasSensor ? 1 : Math.random();
    this.weightBuffer = this.weight;
    this.changed = false;

    // set references
    if (this.src.isNeuron) this.src.addConnectionOut(this);
    if (this.dst.isNeuron) this.dst.addConnectionIn(this);

    // visualiser
    let geo = new THREE.BoxBufferGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    let mat = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0});
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.scale.set(0.1, 1, 0.1);
    Global.Scene.add(this.mesh);

    // set position
    this.setPosition();
  }

  getValue() {
    return this.weight * this.src.getValue();
  }

  getError() {
    if (this.dst.isSensor) {
      let value = this.src.getValue();
      let target = this.dst.getValue();
      return this.weight * (value - target);
    } else {
      return this.weight * this.dst.getError();
    }
  }

  buffer() {
    if (this.hasSensor) return;
    let error = this.dst.getError ? this.dst.getError() : 0;
    if (error) {
      this.weightBuffer = this.weight - error * this.src.getValue() * LEARNING_RATE;
    }
  }

  swap() {
    this.changed = Math.abs(this.weight - this.weightBuffer) >= CHANGED_THRESHOLD;
    this.weight = this.weightBuffer;
  }

  setPosition() {
    let p1 = this.src.mesh.position;
    let p2 = this.dst.mesh.position;
    let dist = p1.distanceTo(p2);
    let theta = Math.atan2(p2.y-p1.y, p2.x-p1.x);
    this.mesh.position.copy(p1);
    this.mesh.scale.y = dist * 1;
    this.mesh.rotation.z = theta - Math.PI / 2;
  }

  update() {
    let s = Math.max(0.25, this.weight * this.src.getValue()) * 0.25;
    s = this.mesh.scale.x + (s - this.mesh.scale.x) * BLEND;
    this.mesh.scale.x = s;
    this.mesh.scale.z = s;
    let target = Clamp(this.src.getValue(), 0, 1);
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * BLEND;
  }
}

Connection.prototype.isConnection = true;

export default Connection;
