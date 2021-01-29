<script>
	import { createEventDispatcher } from 'svelte';
	import {isEmpty} from "ramda"

	export let data;
	export let columns;
	const dispatch = createEventDispatcher();
</script>

<style>
	/* ! needs bundle.css inside popup.html */
	table,
	th,
	td {
		border: 1px solid darkgrey;
		border-collapse: collapse;
		padding: 0.4rem;
	}
	table {
		background: #eee;
		/* min-width: 80vw; */
		/* text-align: center; */
	}
</style>

{#if (!isEmpty(data))}

<table>
	<thead>
		<tr>
			<!-- TODO slot with blank column header -->
			{#each columns as config}
			<th>{config.title}</th>
			{/each}
		
		</tr>
	</thead>
	<tbody>

		{#each data as row}
		<tr>
			{#each columns as config}
			<td style={config.style}>
				{#if !config.key}
				<button class={config.klass} on:click={() => dispatch('message', row)}>
					{@html config.value(row)}</button>
				{:else}
				{@html config.value(row)}
				{/if}
			</td>{/each}
			</tr>
		{/each}
	</tbody>
</table>
{/if}
