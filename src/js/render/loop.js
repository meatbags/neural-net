/** Loop */

class Loop {
  constructor() {
    this.timer = { now: 0, deltaMax: 0.2 };
  }

  bind(root) {
    this.ref = {};
    this.ref.renderer = root.modules.renderer;
    this.ref.camera = root.modules.camera;
    this.ref.neuralNetworkDynamic = root.modules.neuralNetworkDynamic;
    this.start();
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.timer.now = performance.now();
    this._loop();
  }

  stop() {
    this.active = false;
  }

  _loop() {
    if (!this.active) return;
    requestAnimationFrame(() => this._loop());

    // get time
    let now = performance.now();
    let delta = Math.min((now - this.timer.now) / 1000, this.timer.deltaMax);
    this.timer.now = now;

    // update
    this.ref.camera.update(delta);
    this.ref.neuralNetworkDynamic.update(delta);
    this.ref.renderer.render();
  }
}

export default Loop;
