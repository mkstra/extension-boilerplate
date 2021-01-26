<script>
	/*global chrome*/
	'use strict';
	import chromep from 'chrome-promise';
	import { JSONDownloadable, trimString } from './utils';
	import { assoc } from 'ramda';

	let collection = [{ url: 'test.com', title: 'storage not loading.... sry' }];

	let link = '';
	let deleteConfirm = "type: 'IRREVERSIBLE' to confirm";
	let big = window.location.hash == '#big';

	const openTab = () => {
		/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
            #window lets popup know what's up
        */
		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#big') });
	};

	const getStorage = async () => {
		const storage = await chromep.storage.sync.get(null);

		collection = Object.entries(storage)
			.map(([url, node]) => assoc('url', url, node))
			.map(({ url, title, dateCreated }) => ({
				title: title || '',
				created: new Date(dateCreated).toDateString(),
				url,
			}));
		link = JSONDownloadable(collection);
	};

	const clearStorage = async () => {
		if (deleteConfirm == 'IRREVERSIBLE') {
			await chromep.storage.sync.clear();
		} else {
			alert("type in 'IRREVERSIBLE' into the input field");
		}
		getStorage();
	};

	getStorage();
	const removeItem = async itemID => {
		await chromep.storage.sync.remove(itemID);
		getStorage();
	};
</script>

<style>
	/* ! needs bundle.css inside popup.html */
	table,
	th,
	td {
		border: 1px solid black;
		border-collapse: collapse;
		padding: 0.5rem;
	}
	table {
		background: #eee;
		min-width: 80vw;
		text-align: center;
	}

</style>

<a href={link} download="data.json">Download my Data</a>
<hr />
<a href="mailto:strasser.ms@gmail.com?subject=streamdata!&body=Hi.">Publish my Data</a>
<hr />
{#if !big}
	<button on:click={openTab}>View Dashboard</button>
{:else}
	<input style="min-width: 20vw" type="text" bind:value={deleteConfirm} />
    <button on:click={clearStorage}>DELETE ALL</button>
    <br>
        <br>

	<table>
		<thead>
			<tr>
				<th>Delete Entry</th>

				<th>title</th>
				<th>createTime</th>
				<th>url</th>
				<!-- <th on:click={sort("val")}>val</th> -->
			</tr>
		</thead>
		<tbody>
			{#each collection as row}
				<tr>
                    <div>
                        <button
						on:click={() => removeItem(row.url)}
						style="background: red; color: white; font-weight: bold">
						X
					</button>
                    </div>
				

					<td style="min-width: 15rem">{trimString(row.title) || '/'}</td>
					<td>{row.created}</td>
					<td>
						<a href={row.url}>{trimString(row.url, 70)}</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
