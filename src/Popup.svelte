<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import { JSONDownloadable, trimString } from './utils/utils';
	import { assoc, isEmpty } from 'ramda';
	import Dashboard from './Dashboard.svelte';


	//TODO: put Storage in a temp subscription and only run "updateStorage" inside the reducer action

	const getStorage = async () => {
		const storage = await chromep.storage.sync.get(null);

		collection = Object.entries(storage)
			.map(([url, node]) => assoc('url', url, node))
			.map(({ url, title, dateCreated }) => ({
				title: title || '',
				dateCreated,
				url,
			}));
		link = JSONDownloadable(collection);
		return collection;
	};

	let collection = getStorage();

	let link = '';
	let deleteConfirm = "type: 'IRREVERSIBLE' to confirm";
	let hash = window.location.hash;

	fetch('https://dacapo.io/hacking-scientific-text')
		.then(res => res)
		.then(res => console.log('aaaasa', res));

	const openTab = (hash) => {
		/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
            #window lets popup know what's up
        */
		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#'+hash) });
	};

	const clearStorage = async () => {
		if (deleteConfirm == 'IRREVERSIBLE') {
			await chromep.storage.sync.clear();
		} else {
			alert("type in 'IRREVERSIBLE' into the input field");
		}
		getStorage();
	};

	const onRemove = async ({ detail }) => {
		console.log(detail, 'detail');
		await chromep.storage.sync.remove(detail.url);
		getStorage();
	};

	getStorage();
	// const removeItem = async itemID => {
	// 	await chromep.storage.sync.remove(itemID);
	// 	getStorage();
	// };
</script>

<a href={link} download="data.json">Download my Data</a>
<hr />
<a href="mailto:strasser.ms@gmail.com?subject=streamdata!&body=Hi.">Publish my Data</a>
<hr />


{#if isEmpty(hash)}
	<button on:click={()=> openTab("dashboard")}>View Dashboard</button>
	<button on:click={()=> openTab("bootstrap")}>Bootstrap your Stream</button>


{:else if hash == "#dashboard"}
	<input style="min-width: 20vw" type="text" bind:value={deleteConfirm} />
	<button on:click={clearStorage}>DELETE ALL</button>
	<br />
	<br />

	{#await collection}
		<p>...waiting</p>
	{:then coll}
		<!-- <p>The number is {coll}</p> -->
		<Dashboard
			collection={coll.sort((a, b) => b.dateCreated - a.dateCreated)}
			on:message={onRemove} />
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}

{:else if hash == "#bootstrap"}
	<div>bootstrap</div>
{/if}
