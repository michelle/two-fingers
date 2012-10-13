$(function() {
	console.log('content script injected2');
	console.log(window);
	
	var port = chrome.extension.connect({name: "activate"});
	
	function doSomething(msg) {
		port.postMessage({command: msg});
		console.log('posted');
	}
	
	
	port.onMessage.addListener(function(msg) {
		// dunno
	});
	
	// TODO: Q-learning, says Hai
	var WIDTH = 40;
	var HEIGHT = 40;
	var XSECTIONS = 4;
	var YSECTIONS = 4;
	var SAMPLES = 5;
	var THRESHOLD = 4;
	var video = document.querySelector('video');
	var canvas = document.querySelector('#cam');
	var gridcanvas = document.querySelector('#grid');
	var ctx = canvas.getContext('2d');
	var grid = gridcanvas.getContext('2d');
	var localMediaStream = null;
	//var imageData = ctx.createImageData(400, 300);
	//var tracker = new HT.Tracker();
	var xsections, xprevsections, ysections, yprevsections;
	var inarow = 0;
	
	var it = 0;
	var delay = 0;
	ctx.translate(WIDTH, 0);
	ctx.scale(-1, 1);
	var action = 'back';
	
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
	function snapshot() {
		// TODO: add buffer between sections to allow for some error.
	  if (localMediaStream) {
		ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
		
		
		drawLines();
		if (it % SAMPLES == 0) {
		
			var pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
			// only iterate over red pixels
			var xsections = [];
			var ysections = [];
			var xdifferences = [];
			for (var i = 0; i < XSECTIONS; i++) {
				xsections[i] = 0;
				xdifferences[i] = 0;
			}
			for (var i = 0; i < YSECTIONS; i++) {
				ysections[i] = 0;
			}
			for (var i = 0; i < pixels.length; i += 4) {
				xsections[(i/4) % XSECTIONS] += pixels[i];
			}
			for (var i = 0; i < pixels.length; i += 4) {
				ysections[0] += pixels[i];
				if (i >= pixels.length/YSECTIONS) {
					break;
				}
			}
			// take avg and find all diffs
			var lowdiffs = true;
				ysections[0] = Math.round(ysections[0] / ((WIDTH * HEIGHT) / YSECTIONS));
				if (yprevsections) {
					if (Math.abs(yprevsections[0] - ysections[0]) > 1) {
						lowdiffs = false;
					}
				}
			for (var i in xsections) {
				xsections[i] = /*Math.round(*/xsections[i] / ((WIDTH * HEIGHT) / XSECTIONS)/*)*/;
				if (xprevsections) {
					xdifferences[i] = (xprevsections[i] - xsections[i]);
					if (Math.abs(xdifferences[i]) > 9) {
						lowdiffs = false;
					}
				}
			}
			
			// TODO: fix this 'heuristic'
			if (xprevsections && 
				lowdiffs &&
				delay == 0 &&
				Math.abs(xdifferences[0]) > THRESHOLD &&
				Math.abs(xdifferences[3]) > THRESHOLD &&
				Math.abs(Math.abs(xdifferences[0]) - Math.abs(xdifferences[3])) < 2) {
				console.log(xsections, xprevsections, xdifferences, (xsections[0]+xsections[1]+xsections[2]+xsections[3])/4);
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
					delay = 50;
				} else if (inarow > 0) {
					console.log('too much movement!')
					delay = 50;
				}
				inarow = 0;
			}
			xprevsections = xsections;
			yprevsections = ysections;
		}
		it++;
		
		/*imageData = ctx.getImageData(0, 0, 400, 300);
		if (it % 1 == 0) {
			candidate = tracker.detect(imageData);
		}
		if (candidate) {
			drawHull(candidate.hull, "red");
		}
		//console.log(candidate.hull);
		it++;
		*/
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
	
	/*function drawHull(hull, color) {
	      var len = hull.length, i = 1;

	      if (len > 0){
	        ctx.beginPath();
	        ctx.lineWidth = 3;
	        ctx.strokeStyle = color;

	        ctx.moveTo(hull[0].x, hull[0].y);
	        for (; i < len; ++ i){
	          ctx.lineTo(hull[i].x, hull[i].y);
	        }

	        ctx.stroke();
	        ctx.closePath();
	      }
	};*/
	

	
	window.webkitRequestAnimationFrame(snapshot);
	

	// Not showing vendor prefixes or code that works cross-browser.
	navigator.webkitGetUserMedia({video: true}, function(stream) {
	  video.src = window.webkitURL.createObjectURL(stream);
	  localMediaStream = stream;
	}, function() {console.log('poop');});
});