<script>
	/*global chrome*/
    'use strict';
    import chromep from 'chrome-promise'
    import {identity, union, head, isEmpty} from 'ramda'
    


    const addNode = (url) => {
        //TODO simple add node 
    }

    const update = async () => {
       const tabs = await chromep.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                })

        const activeTab = head(tabs)
        
        if (!activeTab) return

        const {id, url, status} = activeTab
        

    
        /* ?? probably not needed
        const currentWindow = await chromep.windows.get(windowId)
        */
         /* content = [{
                url: "wadad",
                   
                activeTime: 1000,
                marked: true,
                dateCreated: now()
                dateUpdated: now()
                --optional---
                xpath: "#obj -- highlight or whatever"
                doi: "adsad" 
        
            }, {.....} ]
            */
        //{content: []}

        //a function that takes state and 
        if (!url) return


        //TODO add temp property that get's cleaned after each session
                //and youDB that stays
        let entries = await chromep.storage.sync.get("youDB") 
        entries = entries["youDB"] || []
        
        console.log(entries, "entries")
        const node = entries.find(n => n["url"] == url) ||{
            url, 
            activeTime: 0, 
            marked: false
        }
        node["activeTime"] += 3000

        if (node["activeTime"] > 6000 && !node["deny"]) {
            node["marked"] = true
        }
        
        await chromep.storage.sync.set({youDB: union(entries, [node])})
        console.log("set node", node)

        
        }
    



    //is_active
    //activeTab (none or tab)
    //---> is stuff happening??
    // -> updateStorage??
    // update visit
    // check for candidate -> write to DB 
    // prosebar reflects state
    //no updates


setInterval(function () {
        update();
        console.log('runs update')
},  3000);
</script>