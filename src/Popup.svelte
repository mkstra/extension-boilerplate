<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
    import {JSONDownloadable, trimString, storageToColl} from './utils'


	let collection = [
		{ url: 'test.com', title: 'storage not loading.... sry' },
	];

	let link = '';

	let big = window.location.hash == '#big';

	const openTab = () => {
		/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
            #window lets popup know what's up
        */
		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#big') });
	};

	const getStorage = async () => {
		const storage = await chromep.storage.sync.get(null);
		collection = storageToColl(storage);
		link = JSONDownloadable(collection);
	};

    getStorage();
    
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
						<td>{trimString(row.title)}</td>
                        <td>{row.created}</td>
                        <td><a href={row.url}>{trimString(row.url)}</a></td>

					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
