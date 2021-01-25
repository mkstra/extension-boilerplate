<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import { uniqBy, union, head, isEmpty } from 'ramda';
	import { writable } from 'svelte/store';

	/* youDB = [{
                url: "wadad",
                   
                activeTime: 1000,
                marked: true,
                dateCreated: now()
                dateUpdated: now()
                --optional---
                xpath: "#obj -- highlight or whatever"
                doi: "adsad" 
        
            }, {.....} ]
        */

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action == 'toggle-marked') {
			console.log('yeahh');
			update(0, true)
				.then(e => {
					console.log('fatjew');
					sendResponse({ content: 'background to major tom' });
				})
				.catch(e => console.log('error 111', e));
		}

		return true;
		// marked = true;
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
		const { url, id } = tab;
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
		let res;
		console.log(node, 'node');
		try {
			res = await chromep.storage.sync.set({ [url]: node });
		} catch (err) {
			// chrome.storage.sync.set({[url]: node}, e => console.log(node, "node set"))
			console.log(err, 'error in setting DB');
		}
		console.log(res, 'updaete res');

		return res;
	};

	const interval = 3000;
	setInterval(function() {
		update(interval);
		//moveNode(temp-key)
		//onChange-->messag

		console.log('runs update');
	}, interval);
</script>


