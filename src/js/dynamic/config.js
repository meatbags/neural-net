/** Config */

class Config {
  // inputs
  static SENSOR_MIN_VALUE = 0;
  static SENSOR_MAX_VALUE = 1;

  // network shape
  static NETWORK_RADIUS_OUTER = 30;
  static NETWORK_RADIUS_INNER = 6;
  static SENSOR_RADIUS_OFFSET = 2;
  static INPUT_NEURONS = 24;
  static OUTPUT_NEURONS = 12;
  static NEURON_SHELLS = 10;
  static NEURON_SPACING = 1;
  static NEURON_RANDOMISE_POSITION = 0;

  // connections
  static NEURON_CONNECTIONS_MIN = 2;
  static NEURON_CONNECTIONS_MAX = -1;
  static NEURON_CONNECTION_CHANCE = 0.25;
  static NEURON_CONNECTION_LENGTH_MAX = 3;
  static NEURON_CONNECTION_DOT_MIN = 0.1;

  // training
  static LEARNING_RATE = 0.125;
  static WEIGHT_CHANGED_THRESHOLD = 0.01;
  static NEURON_CHANGED_THRESHOLD = 0.01;

  // animation
  static BLEND_FACTOR = 0.15;
}

export default Config;
