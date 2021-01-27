<script>
    import { createEventDispatcher } from 'svelte';
	import { trimString } from './utils';

    export let collection
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
                    on:click={() => dispatch('message', {
                        url: row.url
                    })}
                    style="background: red; color: white; font-weight: bold">
                    X
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