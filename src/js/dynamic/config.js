/** Config */

class Config {
  // inputs
  static SENSOR_MIN_VALUE = 0;
  static SENSOR_MAX_VALUE = 1;

  // network shape
  static NETWORK_RADIUS_OUTER = 30;
  static NETWORK_RADIUS_INNER = 6;
  static SENSOR_RADIUS_OFFSET = 2;
  static INPUT_NEURONS_MIN = 24;
  static INPUT_NEURONS_MAX = 36;
  static OUTPUT_NEURONS_MIN = 8;
  static OUTPUT_NEURONS_MAX = 16;
  static NEURON_SHELL_SIZE = 3;
  static NEURON_SPACING = 1;
  static NEURON_RANDOMISE_POSITION = 0.5;

  // connections
  static NEURON_CONNECTIONS_MIN = 1;
  static NEURON_CONNECTIONS_MAX = 3;
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
