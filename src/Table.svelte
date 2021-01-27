<script>
    import { createEventDispatcher } from 'svelte';
	import { trimString } from './utils/utils';
    import {head} from "ramda"
    export let collection

    export let action //as propsAschildren??
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
            {#each Object.keys(head(collection)) as k}
            <th>{k}</th>
            {/each}
            <!-- <th on:click={sort("val")}>val</th> -->
        </tr>
    </thead>
    <tbody>
        {#each collection as row}
            <tr>
                <td>X</td>
                {#each Object.entries(row) as [k, v]}
                <td>
                    
   <!-- on:click={() => dispatch('message', {
                        url: row.url,
                        title: row.title,
                        dateCreated: row.dateCreated
                    })} -->
                    <button
                 
                    style={`background: ${true ? "green" : "red"}; color: white; font-weight: bold"`}>
                    <!-- {console.log(k,v, "entry")} -->
                    {`${k}-${v}`}
                </button>
                </td>
            
                {/each}
                <!-- <td style="min-width: 15rem">{trimString(row.title) || '/'}</td>
                <td>{new Date(row.dateCreated).toDateString()}</td>
                <td>
                    <a href={row.url}>{trimString(row.url, 70)}</a>
                </td> -->
            </tr>
        {/each}
    </tbody>
</table>