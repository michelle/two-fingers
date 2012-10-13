$(function() {
	// TODO: Q-learning, says Hai
	var WIDTH = 40;
	var HEIGHT = 10;
	var SECTIONS = 4;
	var SAMPLES = 15;
	var video = document.querySelector('video');
	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');
	var localMediaStream = null;
	//var imageData = ctx.createImageData(400, 300);
	//var tracker = new HT.Tracker();
	var sections, prevsections;
	var inarow = 0;
	
	var it = 0;

	function snapshot() {
	  if (localMediaStream) {
		ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
		
		if (it % SAMPLES == 0) {
		
			var pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
			// only iterate over red pixels
			var sections = [];
			for (var i = 0; i < SECTIONS; i++) {
				sections[i] = 0;
			}
			for (var i = 0; i < pixels.length; i += 4) {
				sections[(i/4) % SECTIONS] += pixels[i];
			}
			// take avg
			for (var i in sections) {
				sections[i] = Math.round(sections[i] / ((WIDTH * HEIGHT) / SECTIONS));
			}
			if (prevsections && Math.abs(prevsections[1] - sections[1]) > 5 && Math.abs(prevsections[2] - sections[2]) > 5) {
				console.log(sections);
				inarow ++;
			} else {
				if (inarow < 3 && inarow > 0) {
					console.log('do something');
				} else if (inarow > 0) {
					console.log('too much movement!')
				}
				inarow = 0;
			}
			prevsections = sections;
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
	  window.webkitRequestAnimationFrame(snapshot);
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
})