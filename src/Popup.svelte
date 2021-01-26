<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import { pickBy, assoc } from 'ramda';

	console.log('logging inside special Popup DOM', chromep);

	let collection = [
		{ url: 'test.com', title: 'storage not loading.... sry' },
	];

	let link = '';

	const updateLink = () => {
		const data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collection));
		link = `data: ${data}`;
		return link;
	};
	let big = window.location.hash == '#big';

	const openTab = () => {
		/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
            #window lets popup know what's up
        */
		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#big') });
	};

	const storageToColl = store => {
		const nodes = pickBy((val, key) => val['marked'], store);
		//flatten // ["url", "{}"]
		return Object.entries(nodes)
			.map(([url, node]) => assoc('url', url, node))
			.map(({ url, title, dateCreated }) => ({
				title: title || '',
                created: new Date(dateCreated).toDateString(),
                url,

			}));
	};

	const getStorage = async () => {
		const storage = await chromep.storage.sync.get(null);
		collection = storageToColl(storage);
		updateLink();
	};

	getStorage();

	// ('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#container');
</script>

<div>

	<a href={link} download="data.json">Download my Data</a>

	{#if !big}
		<button on:click={openTab}>View Dashboard</button>
	{:else}
		<table>
			<thead>
				<tr>
                    <th>title</th>
                    <th>createTime</th>
					<th>url</th>
					<!-- <th on:click={sort("val")}>val</th> -->
				</tr>
			</thead>
			<tbody>
				{#each collection as row}
					<tr>
						<td>{row.title.substring(0,60) + "..."}</td>
                        <td>{row.created}</td>
                        <td><a href={row.url}>{row.url.substring(0,50) + "..."}</a></td>

					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
