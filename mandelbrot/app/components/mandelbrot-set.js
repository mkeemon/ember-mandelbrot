import Ember from 'ember';
import CanvasElement from 'mandelbrot/components/canvas-element';
import math from 'npm:mathjs';

export default CanvasElement.extend({
  maxIterations: 1000,
  centerX: -0.5,
  centerY: 0.0,
  increment: 0.0046875,

  setCanvas: Ember.on('didInsertElement', function() {
    const canvas = this.get('element');

    this.set('canvas', canvas);
    this.set('ctx', canvas.getContext('2d'));
    this.mandelbrotSet();
  }),

  click: function(event) {
    const width = this.get('width');
    const height = this.get('height');
    const centerX = this.get('centerX');
    const centerY = this.get('centerY');
    const increment = this.get('increment');
    const newX = centerX + ((event.offsetX - (width/2)) * increment);
    const newY = centerY + ((event.offsetY - (height/2)) * increment);

    Ember.debug('Zooming in');

    this.setProperties({
      centerX: newX,
      centerY: newY,
      increment: increment * 0.25,
    });

    this.mandelbrotSet();
  },

  contextMenu: function(event) {
    const width = this.get('width');
    const height = this.get('height');
    const centerX = this.get('centerX');
    const centerY = this.get('centerY');
    const increment = this.get('increment');
    const newX = centerX + ((event.offsetX - (width/2)) * increment);
    const newY = centerY + ((event.offsetY - (height/2)) * increment);

    Ember.debug('Zooming out');

    this.setProperties({
      centerX: newX,
      centerY: newY,
      increment: increment * 4,
    });

    this.mandelbrotSet();
  },

  setPixel: function(imageData, x, y, r, g, b, a) {
    const index = (x + y * imageData.width) * 4;

    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
  },

  mandelbrotPixel: function(x, y, maxIterations) {
    const c = math.complex(x, y);

    let z = math.complex(0, 0);
    let i;

    for (i = 0; i < maxIterations && math.abs(z) < 2.0; ++i) {
      z = math.add(math.multiply(z, z), c);
    }

    return i;
  },

  mandelbrotSet: function() {
    const ctx = this.get('ctx');
    const width = this.get('width');
    const height = this.get('height');
    const maxIterations = this.get('maxIterations');
    const centerX = this.get('centerX');
    const centerY = this.get('centerY');
    const increment = this.get('increment');
    const imageData = ctx.createImageData(width, height);
    const startX = centerX - (width/2 * increment);
    const startY = centerY - (height/2 * increment);
    const endX = centerX + (width/2 * increment);
    const endY = centerY + (height/2 * increment);

    // Z = Z^2 + C
    for (let iterateY = 0; iterateY < height; ++iterateY) {
      for (let iterateX = 0; iterateX < width; ++iterateX) {
        const x = startX + (endX - startX) * iterateX / (width - 1);
        const y = startY + (endY - startY) * iterateY / (height - 1);
        const iterations = this.mandelbrotPixel(x, y, maxIterations);

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 255;

        if (iterations < maxIterations) {
          let color = 3 * math.log(iterations) / math.log(maxIterations - 1.0);
          if (color < 1) {
            r = 255 * color;
            g = 0;
            b = 0;
          } else if (color < 2) {
            r = 255;
            g = 255 * (color - 1);
            b = 0;
          } else {
            r = 255;
            g = 255;
            b = 255 * (color - 2);
          }
        }

        this.setPixel(imageData, iterateX, iterateY, r, g, b, a);
      }
    }

    ctx.putImageData(imageData, 0, 0); // at coords 0,0
  },

});
