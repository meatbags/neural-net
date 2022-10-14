/** Renderer */

import * as THREE from 'three';
import Global from './global';

class Renderer {
  constructor() {
    this.renderer = Global.Renderer;
    this.renderer.setClearColor(0x0, 0);
    document.querySelector('body').appendChild(this.renderer.domElement);
  }

  resize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.render(Global.Scene, Global.Camera);
  }
}

export default Renderer;
