/** Sensor */

import * as THREE from 'three';
import Global from '../render/global';
import Clamp from '../util/clamp';
import { v4 as uuidv4 } from 'uuid';

const BLEND = 0.025;

class Sensor {
  constructor(params) {
    this.id = uuidv4();

    // value
    this.value = params.value !== undefined ? params.value : 0;

    // visualiser
    let geo = new THREE.BoxBufferGeometry(1, 1, 1);
    let mat = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0});
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(params.position || new THREE.Vector3());
    Global.Scene.add(this.mesh);
  }

  getValue() {
    return this.value;
  }

  update() {
    let target = Clamp(this.value, 0, 1);
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * BLEND;
  }
}

Sensor.prototype.isSensor = true;

export default Sensor;
