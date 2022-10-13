/** connection */

import * as THREE from 'three';
import Global from '../render/global';
import Element from '../util/element';
import Round from '../maths/round';

class Connection {
  constructor(params) {
    this.params = params;
    this.node = {
      src: params.src || null,
      dst: params.dst || null,
    };
    this.weight = params.weight !== undefined ? params.weight : Math.random();
    this.node.src.addOutgoingConnection(this);
    this.node.dst.addIncomingConnection(this);
    this.visible = this.node.src.visible && this.node.dst.visible;
    this.render();

    // visualiser
    let height = 1;
    let thickness = 0.25;
    let geo = new THREE.BoxBufferGeometry(thickness, height, thickness);
    geo.translate(0, height/2, 0);
    let mat = new THREE.MeshStandardMaterial();
    this.mesh = new THREE.Mesh(geo, mat);
    Global.Scene.add(this.mesh);
  }

  getWeight() {
    return this.weight;
  }

  setWeight(weight) {
    this.weight = weight;
  }

  getWeightedValue() {
    return this.weight * this.node.src.value;
  }

  getInput() {
    return this.node.src.value;
  }

  getWeightedError() {
    return this.weight * this.node.dst.error;
  }

  reset() {
    this.weight = this.params.weight !== undefined ? this.params.weight : Math.random();
  }

  refresh() {
    // HTML
    if (this.visible) {
      // set connection position, rotation, size
      let rect1 = this.node.src.el.getBoundingClientRect();
      let rect2 = this.node.dst.el.getBoundingClientRect();
      let radius = rect1.width / 2;
      let dx = rect2.left - rect1.left;
      let dy = rect2.top - rect1.top;
      let dist = Math.hypot(dx, dy);
      let theta = Math.atan2(dy, dx);
      let deg = theta / Math.PI * 180;
      this.el.style.width = `${dist}px`;
      this.el.style.transform = `translate(0, -50%) rotate(${deg}deg)`;
      this.ref.inner.style.width = `${dist - radius * 2}px`;
      this.ref.weight.style.transform = `translate(-50%, -50%) rotate(${-deg}deg)`;
      this.ref.weight.innerText = 'W=' + Round(this.weight, 3);
      this.ref.inner.style.borderWidth = `${0.125 + this.weight * 4}px`;
    }

    // visualiser
    let p1 = this.node.src.mesh.position;
    let p2 = this.node.dst.mesh.position;
    let dist = p1.distanceTo(p2);
    let theta = Math.atan2(p2.y-p1.y, p2.x-p1.x);
    this.mesh.position.copy(p1);
    this.mesh.scale.y = dist
    this.mesh.rotation.z = theta - Math.PI / 2;
  }

  render() {
    if (!this.visible) return;

    this.el = Element({
      class: 'connection',
      children: [
        { class: 'connection__inner' },
        { class: 'connection__weight' },
      ],
    });

    // refs
    this.ref = {};
    this.ref.inner = this.el.querySelector('.connection__inner');
    this.ref.weight = this.el.querySelector('.connection__weight');

    // add to from connection
    this.node.src.el.appendChild(this.el);
  }
}

export default Connection;
