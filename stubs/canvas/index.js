function notSupported() {
  throw new Error("canvas module is not available in this environment.");
}

function createCanvas() {
  return {
    getContext() {
      return null;
    }
  };
}

module.exports = {
  Canvas: function Canvas() {},
  Image: function Image() {},
  createCanvas,
  loadImage: notSupported,
  DOMMatrix: function DOMMatrix() {}
};
