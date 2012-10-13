$(function() {
	console.log('loaded');
  var onFailSoHard = function(e) {
    console.log('Reeeejected!', e);
  };

  // Not showing vendor prefixes.
  navigator.webkitGetUserMedia({video: true}, function(localMediaStream) {
    var video = document.querySelector('video');
    video.src = window.webkitURL.createObjectURL(localMediaStream);
    console.log('wtf');
    // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
    video.onloadedmetadata = function(e) {
      // Ready to go. Do some stuff.
    };
  }, onFailSoHard);
});
