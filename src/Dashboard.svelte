<script>
    import { createEventDispatcher } from 'svelte';
	import { trimString } from './utils/utils';

    export let collection
    export let addAction
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
            <th>{addAction ?  "Add": "Delete"} Entry</th>

            <th>title</th>
            <th>date</th>
            <th>url</th>
            <!-- <th on:click={sort("val")}>val</th> -->
        </tr>
    </thead>
    <tbody>
        {#each collection as row}
            <tr>
                <div>
                    <button
                    on:click={() => dispatch('message', {
                        url: row.url,
                        title: row.title,
                        dateCreated: row.dateCreated
                    })}
                    style={`background: ${addAction ? "green" : "red"}; color: white; font-weight: bold"`}>
                    {addAction ? "(+)": "X"}
                </button>
                </div>
            

                <td style="min-width: 15rem">{trimString(row.title) || '/'}</td>
                <td>{new Date(row.dateCreated).toDateString()}</td>
                <td>
                    <a href={row.url}>{trimString(row.url, 70)}</a>
                </td>
            </tr>
        {/each}
    </tbody>
</table>