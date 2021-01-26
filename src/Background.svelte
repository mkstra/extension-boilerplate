<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import { uniqBy, union, head, isEmpty } from 'ramda';
	import { writable } from 'svelte/store';

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action == 'toggle-marked') {
			update(0, true) //user initiated
				.then(e => {
					sendResponse({ content: 'background to major tom' });
				})
				.catch(e => console.log('error in update', e));
		}
		return true; //async message passing
	});

	const getActiveTab = async () => {
		const idleState = await chromep.idle.queryState(20);
		if (idleState != 'active') return;

		const tabs = await chromep.tabs.query({
			active: true,
			lastFocusedWindow: true,
		});
		return head(tabs);
	};

	const update = async (interval, userAction = false) => {
		const tab = (await getActiveTab()) || {};
		const { url , title } = tab;
		if (!url) return;
		let node = await chromep.storage.sync.get(url);
		node = node[url] || {
			activeTime: 0,
			dateCreated: Date.now(),
			marked: false,
			blocked: false,
		};
		node['activeTime'] += interval;

		if (userAction) {
			node['marked'] = !node['marked'];
			node['blocked'] = true;
		}
		if (node['activeTime'] > 6000 && !node['marked'] && !node['blocked']) {
			node['marked'] = true;
		}
		console.log(node, 'node');
		try {
			await chromep.storage.sync.set({ [url]: node });
		} catch (err) {
			console.log(err, 'error in setting DB');
		}
	};

	const interval = 3000;
	setInterval(function() {
		update(interval);
		//moveNode(temp-key)
		//onChange-->messag

		console.log('runs update');
	}, interval);
</script>


