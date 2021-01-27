<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import {
		JSONDownloadable,
		UrlToDOM,
		trimString,
		Node,
		asyncFilter,
		idiotSafe,
		historyPipe,
		asyncMap,
	} from './utils/utils';
	import { assoc, isEmpty, uniqBy, pipe, map, filter } from 'ramda';
	import Dashboard from './Dashboard.svelte';
	import normalizeUrl from 'normalize-url';

	import toastr from 'toastr';
	import { toastrOptions } from './utils/params';
	import Table from './Table.svelte';

	toastr.options = toastrOptions;

	//TODO: put Storage in a temp subscription and only run "updateStorage" inside the reducer action

	const getStorage = async () => {
		const storage = await chromep.storage.sync.get(null);

		collection = Object.entries(storage)
			.map(([url, node]) => assoc('url', url, node))
			.filter(({ url }) => url != 'blacklist');
		return collection;
	};

	let link = '';
	let collection = getStorage().then(c => {
		link = JSONDownloadable(c);
	});

	let deleteConfirm = "type: 'IRREVERSIBLE' to confirm";
	let hash = window.location.hash;
	let history = [];

	// fetch('https://dacapo.io/hacking-scientific-text')
	// 	.then(res => res)
	// 	.then(res => console.log('aaaasa', res));

	/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
            #window lets popup know what's up
        */
	const openTab = hash =>
		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#' + hash) });

	chrome.storage.onChanged.addListener((_c, _ns) => {
		getStorage().then(coll => {
			link = JSONDownloadable(coll);
		});
	});

	const clearStorage = async () => {
		if (deleteConfirm == 'IRREVERSIBLE') {
			await chromep.storage.sync.clear();
		} else {
			alert("type in 'IRREVERSIBLE' into the input field");
		}
	};

	const onRemove = async ({ detail }) => {
		console.log(detail, 'detail');
		await chromep.storage.sync.remove(detail.url);
	};

	const onAdd = async ({ detail }) => {
		console.log(detail, 'yo');
		const { url, title, dateCreated } = detail;
		await chromep.storage.sync.set({ [url]: Node(url, title, dateCreated) });
		toastr.success(`${title} added to stream`);
	};

	const getHistory = async (msSinceNow = 1000 * 60 * 60 * 24 * 30) => {
		const maxResults = 300;
		let historyItems = await chromep.history.search({
			text: '', // Return every history item....
			startTime: new Date().getTime() - msSinceNow,
			maxResults,
			// that was accessed less than one week ago.
		});
		const blacklist = await chromep.storage.sync.get('blacklist');

		historyItems = historyPipe(blacklist['blacklist'])(historyItems).filter(
			item => item.url.split('/').length - 1 > 2
		);
		//no homepages, only if has path aka something.com//superfancy

		historyItems = await asyncFilter(historyItems, async item => {
			const doc = await idiotSafe(UrlToDOM)(item['url']);
			return !!(doc && doc.querySelector('article'));
		});

		console.log('history', historyItems, blacklist['blacklist']);

		return historyItems;
	};

	const getBooks = async () => {
		let historyItems = await chromep.history.search({
			text: '', // Return every history item....
			startTime: 0,
			maxResults:20000,
			// that was accessed less than one week ago.
		});
		historyItems = historyPipe([])(historyItems).filter(
			e => e.url.includes('amazon.') && !e.url.includes('aws')
		);
		console.log(historyItems,"d")
		const docs = await asyncMap(historyItems.slice(0,20), async item => {
			try {
				return await UrlToDOM(item["url"])
			}
			catch (err) {
				console.log("error at", item["url"])
				return false
			}
		})
		console.log(docs, "aa")
	}
</script>

<a href={link} download="data.json">Download my Data</a>
<hr />
<a href="mailto:strasser.ms@gmail.com?subject=streamdata!&body=Hi.">Publish my Data</a>
<hr />


{#if isEmpty(hash)}
	<button on:click={() => openTab('dashboard')}>View Dashboard</button>
	<button on:click={() => openTab('bootstrap')}>Bootstrap your Stream</button>
{:else if hash == '#dashboard'}
	<input style="min-width: 20vw" type="text" bind:value={deleteConfirm} />
	<button on:click={clearStorage}>DELETE ALL</button>
	<br />
	<br />
	<button on:click={getBooks}>Get Books!</button>

	<Table
		collection={[{ a: 'b', b: 'cc', c: 'www' }, { a: 'wq', b: 'wq', c: 'wqa' }]} />

	{#await collection}
		<p>...waiting</p>
	{:then coll}
		<!-- <p>The number is {coll}</p> -->
		<Dashboard
			collection={coll.sort((a, b) => b.dateCreated - a.dateCreated)}
			on:message={onRemove}
			addAction={false} />
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
{:else if hash == '#bootstrap'}
	<h1>Bootstrap your STREAM</h1>
	<button
		class="yellow-btn"
		on:click={() => {
			history = getHistory();
		}}>
		Scan history for articles (last 30 days)
	</button>

	{#await history}
		<p>...running **Article?** classifier on history documents</p>
	{:then his}
		<!-- <p>The number is {coll}</p> -->
		<Dashboard collection={his} on:message={onAdd} addAction={true} />
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
{/if}
