<script>
	/*global chrome*/
  'use strict';
  
  var map = {}; // You could also use an array
  onkeydown = onkeyup = function(e){
    map[e.key] = e.type == 'keydown'; //genius
    console.log(map, "map")
    /* insert conditional here */
    if(map["Shift"] && map["R"])
    {// CTRL+SHIFT+A
      console.log('Shift R');
      //send to background -- background handles state???? send back action?
    }
  }

  window.addEventListener('keydown', onkeydown)
  window.addEventListener('keyup', onkeyup)

	// universal Web Extension
	// window.browser = window.chrome || window.msBrowser || window.browser;

	let voted = false;

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		console.log('request here content');
		console.log(sender ? 'from a background script:' + sender : 'from the extension tt');

		sendResponse({ content: 'goodbye' });
		voted = true;
  });
  


	// console.log(M, 'materialize')
</script>

<button class="prosebar" style="background-color: {voted ? 'blue' : 'white'}">
	Shift + RFFF qqqqs mark
</button>
<!-- <div id="prosebar" class:voted={true}> Shift + RFFF qq mark</div> -->
