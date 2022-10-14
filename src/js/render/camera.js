/** Camera */

import * as THREE from 'three';
import Global from './global';

class Camera {
  constructor() {
    this.camera = Global.Camera;
  }

  resize() {
    setTimeout(() => {
      // set aspect
      let rect = document.querySelector('canvas').getBoundingClientRect();
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();

      // centre
      let x = 0;
      let y = 0;
      let n = 0;
      Global.Scene.children.forEach(child => {
        if (child.position) {
          x += child.position.x;
          y += child.position.y;
          n += 1;
        }
      });
      x /= n;
      y /= n;
      this.camera.position.set(0, 0, 60);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }, 50);
  }
}

export default Camera;
