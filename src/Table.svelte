<script>
	import { createEventDispatcher } from 'svelte';
	import { trimString } from './utils/utils';
	import { head, omit} from 'ramda';

	export let collection;
	export let excludeColumns;

	// export let action //as propsAschildren??
	const dispatch = createEventDispatcher();
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

<table>
	<thead>
		<tr>
			<th>Add Books</th>
			{#each Object
			.keys(head(
				collection.map(r => omit(excludeColumns, r))
				)) as k}
				<th>{k}</th>
			{/each}
			<!-- <th on:click={sort("val")}>val</th> -->
		</tr>
	</thead>
	<tbody>
		{#each collection as row}
			<tr>
				<td>
					<button
						on:click={() => dispatch('message', row)}
						style={`background: ${true ? 'green' : 'red'}; color: white; font-weight: bold"`}>
						{`+`}
					</button>
				</td>
				{#each Object.entries(omit(excludeColumns, row)) as [k, v]}
					<td>{@html v}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
