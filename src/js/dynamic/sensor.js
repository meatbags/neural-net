/** Sensor */

import * as THREE from 'three';
import Global from '../render/global';
import Clamp from '../util/clamp';

class Sensor {
  constructor(params) {
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
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * 0.1;
  }
}

Sensor.prototype.isSensor = true;

export default Sensor;
