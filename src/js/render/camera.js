/** Camera */

import * as THREE from 'three';
import Global from './global';

class Camera {
  constructor() {
    this.camera = Global.Camera;
    let x = 10;
    let y = 0;
    let z = 20;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(new THREE.Vector3(x, y, 0));
  }

  resize() {
    setTimeout(() => {
      // set aspect
      let rect = document.querySelector('canvas').getBoundingClientRect();
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
    }, 50);
  }
}

export default Camera;
