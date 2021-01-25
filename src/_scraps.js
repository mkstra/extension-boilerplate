let map = {}; // You could also use an array
let lastClickTime = Date.now()
onkeydown = onkeyup = function(e){
  map[e.key] = e.type == 'keydown'; //genius
  // console.log(map, "map")
  /* insert conditional here */
  // if ( (Date.now() - lastClickTime) < 1000) return 

  // lastClickTime = Date.now()

  if(map["Shift"] && map["R"])
  {// CTRL+SHIFT+A

    console.log('Shift R');
    //send to background -- background handles state???? send back action?
  }
}

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

    
const update_old = async (interval, userAction=false) => {
    //TODO add temp property that get's cleaned after each session
            //and youDB that stays
    
    const tab = await getActiveTab() || {}
    const {url, id} = tab
    if (!url) return

    console.log("aaa")
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

    if (userAction) {
        node["marked"] = !node["marked"]
        node["blocked"] = true
    }
    if (node["activeTime"] > 6000 && !node["marked"] && !node["blocked"]) {
        node["marked"] = true       
    }

    entries = uniqBy(
            n => n["url"], 
            entries.concat(node) //adds updated node instead of rewriting collection [a, b, c , a]
        )
    console.log(node, "node")

    let res;
    console.log(entries)
    try {
        res = await chromep.storage.sync.set({[dbKey]: entries})

    }
    catch (err) {
            chrome.storage.sync.set({[dbKey]: entries}, e => console.log(entries, "entries set"))
            console.log(err, "error in setting DB")
    }
    console.log(res, "updaete res")

    return res
}

window.addEventListener('keydown', onkeydown)
window.addEventListener('keyup', onkeyup)