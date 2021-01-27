<script>
	/*global chrome*/
	'use strict';
	import toastr from 'toastr';
	import hotkeys from 'hotkeys-js';
	import { path, isEmpty } from 'ramda';
	import normalizeUrl from 'normalize-url';
	import { toastrOptions } from './utils/params';

	// universal Web Extension
	window.browser = window.chrome || window.msBrowser || window.browser;

	let activeTime = 0;
	const interval = 15000;
	let marked = false;

	let showReminder = true;
	const currentUrl = normalizeUrl(window.location.href, {stripHash: true});
	

	let startTimer = () =>
		//for the .info toast()
		setInterval(() => {
			activeTime += interval;

			if (activeTime > 120000) {
				toastr.info('ADD content to your stream?');
				showReminder = false;
				//! kinda nasty hack
				window.clearInterval(trackActiveTime);
			}
			// console.log(activeTime);
		}, interval);

	let trackActiveTime = startTimer();

	document.addEventListener(
		'visibilitychange',
		() => {
			/*only count when TAB is active tab*/
			document.hidden && window.clearInterval(trackActiveTime);

			if (!document.hidden && showReminder) {
				trackActiveTime = startTimer();
			}
		},
		false
	);

	const toggleContent = () => {
		chrome.runtime.sendMessage(
			{
				action: 'toggle:content',
				title: document.title,
				url: currentUrl,
			},
			_ => _
		);
	};
	hotkeys('shift+r', function(event, handler) {
		// Prevent the default refresh event under WINDOWS system
		toggleContent();
		event.preventDefault();
	});

	//get initial value on page startup
	chrome.storage.sync.get(currentUrl, storage => {
		marked = !isEmpty(storage);
		// console.log('Page is marked? ', marked);
	});

	chrome.storage.onChanged.addListener(function(changes, namespace) {
		/*changes = {
      url: {oldValue: {...}, newValue: {....}}, url2: {...}
	}*/
		window.clearInterval(trackActiveTime);
		showReminder = false;
		const m = !!path([currentUrl, 'newValue'], changes);

		if (m == marked) return; //nothing changed (except timestamps)

		marked = m;
		marked
			? toastr.info('ADDED: Press Shift + R to undo')
			: toastr.info('REMOVED: Press Shift + R to add again');

		return true; //needed for async?!
	});

	toastr.options = toastrOptions
</script>

<button
	class="prosebar"
	style="background-color: {marked ? '#3aec19a1' : '#569ef7b3'}"
	on:click={toggleContent}>
	{marked ? '[X] Remove Mark (Shift+R)' : '[+] Mark Content (Shift+R)'}
</button>
