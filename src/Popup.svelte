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
	import { assoc, isEmpty, path, uniqBy, pipe, map, filter } from 'ramda';
	import normalizeUrl from 'normalize-url';
	import { AmazonBookPageInfo } from './adapters/amazon';
	import toastr from 'toastr';
	import { toastrOptions } from './utils/params';
	import Table from './Table.svelte';

	toastr.options = toastrOptions;
	let scrapeCount = [0, 0];

	//TODO: put Storage in a temp subscription and only run "updateStorage" inside the reducer action

	const getStorage = async () => {
		const storage = await chromep.storage.sync.get(null);

		collection = Object.entries(storage)
			.map(([url, node]) => assoc('url', url, node))
			.filter(({ url }) => url != 'blacklist');
		//TODO: schema verification
		return collection;
	};

	const getBooks = async () => {
		let historyItems = await chromep.history.search({
			text: '', // Return every history item....
			startTime: 0,
			maxResults: 20000,
			// that was accessed less than one week ago.
		});
		historyItems = historyPipe([])(historyItems)
			.filter(e => e.url.includes('amazon.') && !e.url.includes('aws'))
			.filter(({ url }) => {
				try {
					return url
						.split('/')[3]
						.split('-')
						.every(s => s[0].toUpperCase() == s[0]);
				} catch (error) {
					console.log(error, 'URL probably not a book');
					return false;
				}
			});

		//for display during loading
		scrapeCount = [historyItems.length, 0];

		console.log(historyItems, 'd');
		let nodes = await asyncMap(historyItems, async item => {
			const doc = await idiotSafe(UrlToDOM)(item['url']);
			scrapeCount[1] += 1;
			return {
				...item,
				doc,
			};
		});

		const bookColl = nodes
			.map(n => ({ ...n, ...AmazonBookPageInfo(n.doc) }))
			// .map(n=>{console.log(n);
			// return n
			// })
			.filter(n => path(['hasISBN'], n))
			.map(({ productTitle, author, img, url, title, dateCreated }) => ({
				productTitle: productTitle,
				author,
				title,
				// img: `<img src=${img}/>`,
				dateCreated,
				url,
			}));
		console.log(bookColl, 'books!');
		return bookColl;
	};

	let link = '';
	let collection = getStorage().then(c => {
		link = JSONDownloadable(c);
	});

	let deleteConfirm = "type: 'IRREVERSIBLE' to confirm";
	let hash = window.location.hash;
	let history = [];
	let bookCollection = new Promise((res, rej) => {
		console.log('doing nothing');
	});

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
		//maybe have some ###hash scheme for adding to DB?
		await chromep.storage.sync.set({ [detail.url]: detail });
		toastr.success(`${detail.title} added to stream`);
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
			try {
				return doc.querySelector('article');
			} catch (error) {
				console.log(error, 'with doc: ', doc);
				return false;
			}
		});

		console.log('history', historyItems, blacklist['blacklist']);

		return historyItems;
	};

	console.log(history, 'history');
</script>

<div class="border-glow">

	{#if isEmpty(hash)}
		<button class="subtle-button" on:click={() => openTab('dashboard')}>💫 View Dashboard</button>
		<hr />
		<button class="subtle-button border-glow" on:click={() => openTab('bootstrap')}>
			🥳 Bootstrap Stream
		</button>
	{:else if hash == '#dashboard'}
		<input class="subtle-input" style="min-width: 20vw" type="text" bind:value={deleteConfirm} />
		<button class="danger-button" on:click={clearStorage}>DELETE ALL</button>
		<br />

		{#await collection}
			<p>...waiting</p>
		{:then coll}
			<!-- <p>The number is {coll}</p> -->
			<Table
				columns={[{ key: null, title: 'Remove', value: v => ' X ' }, { key: 'title', title: 'Title', value: v => `<a href=${v.url}> ${v.productTitle || v.title}</a>` }, { key: 'dateCreated', title: 'Date', value: v => new Date(v.dateCreated).toDateString() }]}
				data={coll.sort((a, b) => b.dateCreated - a.dateCreated)}
				on:message={onRemove} />
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	{:else if hash == '#bootstrap'}
		<h1>Bootstrap your STREAM</h1>

		<button
			class="glow-on-hover"
			on:click={() => {
				bookCollection = getBooks();
			}}>
			Get Book from History!
		</button>
		{#await bookCollection}
			<p>
				{scrapeCount[0] > 0 ? `Progress: ${scrapeCount[1]} of ${scrapeCount[0]} your pages
 Amazon pages searched. If nothing happens, it's because of too many fetch requests to Amazon (which denies then)` : '-'}
			</p>
		{:then bc}
			<Table
				data={bc}
				on:message={onAdd}
				columns={[{ key: null, title: 'Add', value: v => ' + ', klass: 'green-button' }, { key: 'productTitle', title: 'Book', value: v => `<a href=${v.url}> ${v.productTitle}</a>`, styling: 'min-width: 20vw' }, { key: 'dateCreated', title: 'Date', value: v => new Date(v.dateCreated).toDateString() }]} />
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}

		<button
			class="glow-on-hover"
			on:click={() => {
				history = getHistory();
			}}>
			Scan history for articles (last 30 days)
		</button>

		{#await history}
			<p>...running **Article?** classifier on history documents</p>
		{:then hist}
			<!-- <p>The number is {coll}</p> -->
			<Table
				data={hist}
				columns={[{ key: null, title: 'Add', value: v => ' + ' }, { key: 'title', title: 'Title', value: v => `<a href=${v.url}> ${v.title}</a>` }, { key: 'dateCreated', title: 'Date', value: v => new Date(v.dateCreated).toDateString() }]}
				on:message={onAdd} />
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	{/if}
	<hr />
	<a href={link} download="data.json">↓ Download my Data</a>
	<hr />
	<a href="mailto:strasser.ms@gmail.com?subject=streamdata!&body=Hi.">⤴ Publish my Data</a>
</div>
