const notSupported = () => {
  throw new Error("canvas is not available in this browser bundle.");
};

export const createCanvas = notSupported;
export const loadImage = notSupported;

export class Canvas {}
export class Image {}

export default {
  createCanvas,
  loadImage,
  Canvas,
  Image,
};
