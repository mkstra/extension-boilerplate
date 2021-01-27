<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import {loadBlackList, Node} from './utils/utils'
	import normalizeUrl from 'normalize-url';

	loadBlackList();

	chrome.runtime.onMessage.addListener(function({ action, title, url }, sender, sendResponse) {
		if (action == 'toggle:content') {
			update(url, title) //user initiated
				.then(() => {
					sendResponse({ action: 'added content' });
				})
				.catch(e => console.log('error in update', e));
		}
		return true; //async message passing
	});


	const update = async (url, title) => {
		url = normalizeUrl(url, {stripHash: true})
		let entry = await chromep.storage.sync.get(url);
		const node = Node(url, title);
		console.log(node, 'node here');

		try {
			entry[url]
				? await chromep.storage.sync.remove(url)
				: await chromep.storage.sync.set({ [url]: node });
		} catch (err) {
			console.log(err, `error in ${entry[url] ? "REMOVE" : "SETTING"}`)
		}
		return true;
	};
</script>


