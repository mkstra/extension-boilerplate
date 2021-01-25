<script>
	/*global chrome*/
    'use strict';
    import chromep from 'chrome-promise'
    import {uniqBy, union, head, isEmpty} from 'ramda'
    import { writable } from 'svelte/store';

        /* youDB = [{
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

 
    const upsertNode = (state, predicate, updateFn) => {
        //TODO (accept multiples)
        const node = state.find(predicate) ||{
            url, 
            activeTime: 0, 
            dateCreated: Date.now(),

            marked: false,
            blocked: false,
        
        }
        return uniqBy(
            n => n["url"], 
            state + [updateFn(node)] //adds updated node instead of rewriting collection [a, b, c , a]
            )
    }
    const getActiveTab = async () => {
        const idleState = await chromep.idle.queryState(20)
        if (idleState != "active") return

       const tabs = await chromep.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                })
        return head(tabs)
    }

    
    
    const update = async (interval) => {
        //TODO add temp property that get's cleaned after each session
                //and youDB that stays
        
        const tab = await getActiveTab() || {}
        const {url, id} = tab
        if (!url) return


        const dbKey="prose-log-entries"
        let entries = await chromep.storage.sync.get(dbKey) 
        entries = entries[dbKey] || []

        // entries = upsertNode(entries, n => n["url"] == url, increaseActiveTime) 


        //! all this is mutative if node exists
        let node = entries.find(n => n["url"] == url) ||{
            url, 
            activeTime: 0, 
            dateCreated: Date.now(),

            marked: false,
            blocked: false,
        
        }
        node["activeTime"] += interval

        if (node["activeTime"] > 6000 && !node["marked"] && !node["blocked"]) {
            node["marked"] = true       
        }

        console.log(node);
        entries = uniqBy(
                n => n["url"], 
                entries.concat(node) //adds updated node instead of rewriting collection [a, b, c , a]
            )
        console.log(entries, "entries")
        const res = await chromep.storage.sync.set({[dbKey]: entries})
        console.log('res', res)

        if (node["marked"]){
           const response= await chromep.tabs.sendMessage(id, {action: "toast:marked"})
           console.log("response", response)
        }
    }

    //TODO storage.onChange()

    



    //is_active
    //activeTab (none or tab)
    //---> is stuff happening??
    // -> updateStorage??
    // update visit
    // check for candidate -> write to DB 
    // prosebar reflects state
    //no updates


const interval = 3000
setInterval(function () {
        update(interval);
        //moveNode(temp-key)
        //onChange-->messag

        console.log('runs update')
},  interval);
</script>