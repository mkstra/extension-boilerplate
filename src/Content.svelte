<script>
	/*global chrome*/
	'use strict';
	import toastr from 'toastr';
	import { toastrOptions } from './utils/params';

	import hotkeys from 'hotkeys-js';
	import { path, isEmpty, uniq } from 'ramda';
	import normalizeUrl from 'normalize-url';
	// import {getSentences} from "./utils/api"

	// getSentences("yolo matteeee")

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
			console.log(activeTime)
			if (activeTime > 120000) {
				
				toastr.info('ADD content to your stream?');
				showReminder = false;
				//! kinda nasty hack
				window.clearInterval(trackActiveTime);
				clearInterval(trackActiveTime);
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
				console.log("show reminder")
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


	function getSelectionText() {
		var text = "";
		if (window.getSelection) {
			text = window.getSelection().toString();
		} else if (document.selection && document.selection.type != "Control") {
			text = document.selection.createRange().text;
		}
		return text;
}
	hotkeys('shift+f', function(event, handler) {
		// Prevent the default refresh event under WINDOWS system
		chrome.runtime.sendMessage(
			{
				action: 'get:sentences',
				sample: getSelectionText()
			},
			res => {
				
				const sentences = res.map(r => r.sentence)
				console.log(uniq(sentences))
				alert(sentences.map(s => s +"\n \n"))
			}
		);
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

	const tweet =document.querySelector("#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div.css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div > section > div > div > div:nth-child(1) > div > div > article > div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-1mi0q7o > div:nth-child(2) > div.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-156q2ks.r-1mdbhws")

</script>

<button
	class="prosebar {!marked && "border-glow"}"
	style={marked && "opacity: 0.75"}
	on:click={toggleContent}>
	{@html marked ? '<b>X</b> Remove (Shift+R)' : '<b>+</b> Mark (Shift+R)'}
</button>
