
App.MandelbrotsController = Ember.Controller.extend({
  actions: {
    new: function() {
    },
    show: function(X, iY, P, iQ) {
    }
  }
});

App.Canvas = Ember.View.extend({
  tagName: 'canvas',
  attributeBindings: ['height', 'width'],
  width: 640,
  height: 480,
  canvas: null,
  ctx: null,
});

App.MandelbrotView = App.Canvas.extend({
  maxIterations: 1000,
  centerX: -0.5,
  centerY: 0.0,
  increment: 0.0046875,
  
  setPixel: function(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
  },

  mandelbrotPixel: function(x, y, maxIterations) {
    var z = math.complex(0, 0);
    var c = math.complex(x, y);
    for (var i = 0; i < maxIterations && math.abs(z) < 2.0; ++i) {
      z = math.add(math.multiply(z, z), c);
    }
    return i;
  },

  mandelbrotSet: function() {
    var canvas = this.get('canvas');
    var ctx = this.get('ctx');
    var width = this.get('width');
    var height = this.get('height');
    var imageData = ctx.createImageData(width, height);
    var maxIterations = this.get('maxIterations');
    var centerX = this.get('centerX');
    var centerY = this.get('centerY');
    var increment = this.get('increment');

    var startX = centerX - (width/2 * increment);
    var startY = centerY - (height/2 * increment);
    var endX = centerX + (width/2 * increment);
    var endY = centerY + (height/2 * increment);

    // Z = Z^2 + C
    for (var iterateY = 0; iterateY < height; ++iterateY) {
      for (var iterateX = 0; iterateX < width; ++iterateX) {
	var x = startX + (endX - startX) * iterateX / (width - 1);
	var y = startY + (endY - startY) * iterateY / (height - 1);

	var iterations = this.mandelbrotPixel(x, y, maxIterations);

	var r = 0;
	var g = 0;
	var b = 0;
	var a = 255;

	if (iterations < maxIterations) {
          var color = 3 * math.log(iterations) / math.log(maxIterations - 1.0);
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

  didInsertElement: function() {
    var canvas = this.get('element');
    this.set('canvas', canvas);
    this.set('ctx', canvas.getContext('2d'));
    this.mandelbrotSet();
  },
  click: function(event) {
    var width = this.get('width');
    var height = this.get('height');
    var centerX = this.get('centerX');
    var centerY = this.get('centerY');
    var increment = this.get('increment');
    var newX = centerX + ((event.offsetX - (width/2)) * increment);
    var newY = centerY + ((event.offsetY - (height/2)) * increment);
    this.set('centerX', newX);
    this.set('centerY', newY);
    this.set('increment', increment * 0.25);
    this.mandelbrotSet();
    return false;
  },
  contextMenu: function(event) {
    var width = this.get('width');
    var height = this.get('height');
    var centerX = this.get('centerX');
    var centerY = this.get('centerY');
    var increment = this.get('increment');
    var newX = centerX + ((event.offsetX - (width/2)) * increment);
    var newY = centerY + ((event.offsetY - (height/2)) * increment);
    this.set('centerX', newX);
    this.set('centerY', newY);
    this.set('increment', increment * 4);
    this.mandelbrotSet();
    return false;
  }
});
