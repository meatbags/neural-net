/** Round */

const Round = (x, places) => {
  let d = Math.pow(10, places);
  return Math.round(x * d) / d;
};

export default Round;
