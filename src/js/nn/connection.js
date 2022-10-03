/** connection */

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
    this.render();
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
  }

  render() {
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
