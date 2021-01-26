<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';

	chrome.runtime.onMessage.addListener(function({action, title, url}, sender, sendResponse) {
		if (action == 'toggle-marked') {
			update(url, title) //user initiated
				.then(e => {
					sendResponse({ content: 'added content' });
				})
				.catch(e => console.log('error in update', e));
		}
		return true; //async message passing
	});

	const Node = (url, title) => ({
		dateCreated: Date.now(),
		// marked: false,
		// blocked: false,
		title,
		url,
	})

	const update = async (url, title) => {
		let entry = await chromep.storage.sync.get(url);
		const node = Node(url, title)
		console.log(node, "node here")
		if (entry[url]) {
			try {
				await chromep.storage.sync.remove(url);
			} catch (err) {
				console.log(err, 'error in removing from DB');
			}
		} else {
			try {
				await chromep.storage.sync.set({ [url]: node });
			} catch (err) {
				console.log(err, 'error in setting node in DB');
			}
		}
		return true
	};
</script>


