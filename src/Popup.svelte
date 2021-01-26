<script>
    /*global chrome*/
	'use strict';
    import chromep from 'chrome-promise';
    import {pickBy, assoc} from "ramda"


    console.log("logging inside special Popup DOM", chromep)
    


    let collection = [
		{url:"daco.uio", title:"hello"},
		{url:"asduwww", title:"world"},
		
    ];

   

    let link = ""

    const updateLink= () => {
        const data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(collection));
        link = `data: ${data}`
        return link
    }
    let big = (window.location.hash == '#big')




    const openTab = () => {
        /*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
            #window lets popup know what's up
        */
        chrome.tabs.create({url: chrome.extension.getURL('popup.html#big')});
    }

    const getStorage = async () => {
        const storage= await chromep.storage.sync.get(null)
        console.log(storage, "storage")

        const nodes = pickBy((val, key) => val["marked"], storage)
        //flatten 
        // ["url", "{}"]
        console.log(nodes)
        collection = Object.entries(nodes)
            .map(([url, node]) => assoc("url", url, node))
            .map(({url, title, dateCreated}) => ({url, title: title || "", created: new Date(dateCreated).toDateString()}) )

        updateLink()
    }
    getStorage()

  
    
// ('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#container');

</script>
<div>
    {#if !big}
        <button on:click={openTab}>View Dashboard</button>
    {/if}
    <a href={link} download="data.json">Download my Data</a>

<table>
	<thead>
		<tr>
			<th>title</th>
            <th>url</th>
            <th>createTime</th>
            <!-- <th on:click={sort("val")}>val</th> -->

		</tr>
	</thead>
	<tbody>
		{#each collection as row}
			<tr>
				<td>{row.title}</td>
                <td>{row.url}</td>
                <td>{row.created}</td>
			</tr>
		{/each}
	</tbody>
</table>
</div>