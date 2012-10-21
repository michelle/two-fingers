$(function() {
	var port = chrome.extension.connect({name: "activate"});
	
	function doSomething(msg) {
		port.postMessage({command: msg});
	}
	
	// TODO: Q-learning, says Hai
	var WIDTH = 40;
	var HEIGHT = 40;
	var XSECTIONS = 4;
	var YSECTIONS = 4;
	var SAMPLES = 1;
	var THRESHOLD = 2;
	var YTHRESHOLD = 2
	var DELAY = 50;
	
	var video = document.querySelector('video');
	var canvas = document.querySelector('#cam');
	var gridcanvas = document.querySelector('#grid');
	var ctx = canvas.getContext('2d');
	var grid = gridcanvas.getContext('2d');
	
	var localMediaStream = null;
	var xsections, xprevsections, ysections, yprevsections;
	var inarow = 0;
	var yinarow = 0;
	
	var it = 0;
	var delay = 0;
	ctx.translate(WIDTH, 0);
	ctx.scale(-1, 1);
	var action = 'back';
	
	// new impl
	var ack = 0;
	var activated = false;
	var forward = false;
	
	// guidelines
	function drawLines() {
		grid.strokeStyle = '#fff';
		grid.lineWidth = 0.1;
		xinterval = WIDTH/XSECTIONS;
		yinterval = HEIGHT/YSECTIONS
		for (var x = xinterval; x < WIDTH; x += xinterval) {
			grid.moveTo(x, 0);
			grid.lineTo(x, HEIGHT - 1);
			grid.closePath();
		    grid.stroke();
		}
		for (var y = yinterval; y < HEIGHT; y += yinterval) {
			grid.beginPath();
			grid.moveTo(0, y);
			grid.lineTo(WIDTH - 1, y);
			grid.closePath();
		    grid.stroke();
		}
	}
	
	drawLines();
	
	function snapshot() {
		// TODO: add buffer between sections to allow for some error.
	  if (localMediaStream) {
		ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
		
		if (it % SAMPLES == 0) {
		
			var pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
			// only iterate over red pixels
			var xsections = [];
			var ysections = [];
			var xdifferences = [];
			var ydifferences = [];
			
			for (var i = 0; i < XSECTIONS; i++) {
				xsections[i] = 0;
				xdifferences[i] = 0;
			}
			for (var i = 0; i < YSECTIONS; i++) {
				ysections[i] = 0;
				ydifferences[i] = 0;
			}
			for (var i = 0; i < pixels.length; i += 4) {
				xsections[(i/4) % XSECTIONS] += pixels[i];
			}
			var yiter = 0;
			for (var i = 0; i < pixels.length; i += 4) {
				ysections[yiter] += pixels[i];
				if (i != 0 && i % (pixels.length/YSECTIONS) == 0) {
					yiter++;
				}
			}
			
			// take avg and find all diffs
			var lowdiffs = true;
			var ylowdiffs = true;
			

			if (xprevsections) {
				for (var i in xsections) {
					xsections[i] = /*Math.round(*/xsections[i] / ((WIDTH * HEIGHT) / XSECTIONS)/*)*/;
					
					
					xdifferences[i] = (xprevsections[i] - xsections[i]);
					if (Math.abs(xdifferences[i]) > 8) {
						lowdiffs = false;
					}
					if (!activated && Math.abs(xdifferences[i]) > THRESHOLD && !lowdiffs) {
						if (i == 0) {
							activated = true;
							forward = true;
							console.log('start to track forward');
						}
						if (i == xsections.length - 1) {
							activated = true;
							forward = false;
							console.log('start to track back');
						}
						ack = i;
					} /*else if (activated && Math.abs(xdifferences[i]) > THRESHOLD) {
						if (Math.abs(xdifferences[i - 1]) <= THRESHOLD || lowdiffs) {
							activated = false;
							console.log('cancel activation');
						} else {
							ack = i;
						}
					}*/
					
				}
			}
			
			// check that the top is unmoving.
			if (yprevsections) {
				for (var i in ysections) {
					ysections[i] = /*Math.round(*/ysections[i] / ((WIDTH * HEIGHT) / YSECTIONS)/*)*/;

					ydifferences[i] = (yprevsections[i] - ysections[i]);
					if (Math.abs(ydifferences[i]) > 8) {
						ylowdiffs = false;
					}
				}
				if (Math.abs(yprevsections[0] - ysections[0]) > 1) {
					lowdiffs = false;
				}
			}
			
			// TODO: fix this 'heuristic'
			// heuristic for left-right.
			if (xprevsections && 
				lowdiffs &&
				delay == 0 &&
				Math.abs(xdifferences[0]) > THRESHOLD &&
				Math.abs(xdifferences[3]) > THRESHOLD &&
				Math.abs(Math.abs(xdifferences[0]) - Math.abs(xdifferences[3])) < 1.5) {
				console.log(xsections, xprevsections, xdifferences, ysections);
				inarow ++;
				if (xdifferences[0] < 0 && xdifferences[3] < 0) {
					action = 'back';
				} else {
					action = 'forward';
				}
			} else {
				if (inarow < 4 && inarow > 0 && it != 0) {
					console.log('do something');
					
					// this should be fine unless the background is extremely red or something.
					doSomething(action);
					delay = DELAY;
				} else if (inarow > 0) {
					console.log('too much movement!');
					delay = DELAY;
				}
				inarow = 0;
				
			}
			
			/*
			var first = true;
			while (activated && ((forward && ack < xdifferences.length) || (!forward && ack >= 0))) {
				console.log(xsections, xprevsections, xdifferences);
				if (Math.abs(xdifferences[ack]) > THRESHOLD && Math.abs(xdifferences[ack]) <= 8) {
					ack = forward ? ack + 1 : ack - 1;
				} else {
					if (first) {
						activated = false;
						console.log('broked', xdifferences);
					}
					break;
				}
				first = false;
			}
			if (activated && ((forward && ack == xdifferences.length) || (!forward && ack == -1))) {
				console.log('command activated');
				activated = false;
				var command = forward ? 'forward' : 'back';
				doSomething(command);
				delay = DELAY;
			}*/
			
			// heuristic for top-bottom.
			/*if (yprevsections &&
				ylowdiffs &&
				delay == 0 &&
				Math.abs(ydifferences[2]) > YTHRESHOLD &&
				Math.abs(ydifferences[3]) > YTHRESHOLD &&
				Math.abs(ydifferences[2]) - Math.abs(ydifferences[3]) < 1.5) {
				console.log(ysections, yprevsections, ydifferences)
				yinarow ++;
				action = 'up';
			} else {
				if (yinarow < 4 && yinarow > 0 && it != 0) {
					console.log('do something - y');
					
					doSomething(action);
					delay = DELAY;
				} else if (yinarow > 0) {
					console.log('too much movement - y!');
					delay = DELAY;
				}
				yinarow = 0;
			}*/
			
			
        xprevsections = xsections;
        yprevsections = ysections;
      }
      it++;
	  }
	
	  setTimeout(function() {
      window.webkitRequestAnimationFrame(snapshot);
	  }, 0);
	
	  if (delay > 0) {
      delay--;
      if (delay == 0) {
        console.log('unlocked');
      }
	  }
	}
	
	window.webkitRequestAnimationFrame(snapshot);
	

	navigator.webkitGetUserMedia({video: true}, function(stream) {
	  video.src = window.webkitURL.createObjectURL(stream);
	  localMediaStream = stream;
	}, function() {});
});
