/** Global */

import * as THREE from 'three';

class Global {
  static Camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  static Renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  static Scene = new THREE.Scene();
}

export default Global;
