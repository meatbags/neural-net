/** Sensor */

import * as THREE from 'three';
import Global from '../render/global';
import Config from './config';
import Clamp from '../util/clamp';
import { v4 as uuidv4 } from 'uuid';

class Sensor {
  constructor(params) {
    this.id = uuidv4();

    // value
    this.value = 0;
    if (params.value !== undefined) {
      this.value = params.value;
    } else {
      this.randomise();
    }

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

  randomise() {
    this.value = Config.SENSOR_MIN_VALUE + (Config.SENSOR_MAX_VALUE - Config.SENSOR_MIN_VALUE) * Math.random();
  }

  update() {
    let target = Clamp(this.value, 0, 1);
    this.mesh.material.emissiveIntensity += (target - this.mesh.material.emissiveIntensity) * Config.BLEND_FACTOR;
  }
}

Sensor.prototype.isSensor = true;

export default Sensor;
