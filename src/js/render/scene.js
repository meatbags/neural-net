/** Scene */

import * as THREE from 'three';
import Global from './global';

class Scene {
  constructor() {
    this.scene = Global.Scene;
    
    // lighting
    this.light = {};
    this.light.a = new THREE.AmbientLight(0xffffff, 0.125);
    this.light.p = new THREE.PointLight(0xffffff, 0.5, 100, 2);
    this.light.p.position.set(0, 0, 5);
    for (const key in this.light) {
      this.scene.add(this.light[key]);
    }
  }
}

export default Scene;
