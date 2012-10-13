$(function() {
	var video = document.querySelector('video');
	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');
	var localMediaStream = null;
	var imageData = ctx.createImageData(400, 300);
	var tracker = new HT.Tracker();
	
	var it = 0;

	function snapshot() {
	  if (localMediaStream) {
		ctx.drawImage(video, 0, 0, 400, 300);
		imageData = ctx.getImageData(0, 0, 400, 300);
		if (it % 1 == 0) {
			candidate = tracker.detect(imageData);
		}
		if (candidate) {
			drawHull(candidate.hull, "red");
		}
		//console.log(candidate.hull);
		it++;
	  }
	  window.webkitRequestAnimationFrame(snapshot);
	}
	
	function drawHull(hull, color) {
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
	};
	

	
	window.webkitRequestAnimationFrame(snapshot);
	

	// Not showing vendor prefixes or code that works cross-browser.
	navigator.webkitGetUserMedia({video: true}, function(stream) {
	  video.src = window.webkitURL.createObjectURL(stream);
	  localMediaStream = stream;
	}, function() {console.log('poop');});
})