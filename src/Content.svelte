<script>
	/*global chrome*/
	'use strict';

	// universal Web Extension
	window.browser = window.chrome || window.msBrowser || window.browser;

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
