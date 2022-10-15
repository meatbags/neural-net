/** Camera */

import * as THREE from 'three';
import Global from './global';

class Camera {
  constructor() {
    this.camera = Global.Camera;
    this.camera.up.set(0, 0, 1);
    this.target = new THREE.Vector3();
    this.distance = 1;
    this.height = 100;
    this.angle = 0;
    this.rotationSpeed = Math.PI * 2 / 120;
  }

  resize() {
    setTimeout(() => {
      // set aspect
      let rect = document.querySelector('canvas').getBoundingClientRect();
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
    }, 50);
  }

  update(delta) {
    // centre
    this.angle += this.rotationSpeed * delta;
    let x = Math.cos(this.angle) * this.distance;
    let y = Math.sin(this.angle) * this.distance;
    this.camera.position.set(x, y, this.height);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
}

export default Camera;
