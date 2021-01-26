<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import {getActiveTab} from "./utils"

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action == 'toggle-marked') {
			update() //user initiated
				.then(e => {
					sendResponse({ content: 'added content' });
				})
				.catch(e => console.log('error in update', e));
		}
		return true; //async message passing
	});

	const Node = (url, title) => ({
		// activeTime: 0,
		dateCreated: Date.now(),
		marked: false,
		// blocked: false,
		title,
		url,
	})

	const update = async () => {
		const tab = (await getActiveTab()) || {};
		const { url, title } = tab;
		if (!url) return;
		let entry = await chromep.storage.sync.get(url);
		const node = Node(url, title)
		console.log(node, "node")
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


