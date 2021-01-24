/*global chrome*/
//Note: If multiple pages are listening for 
//FIXME:onMessage events, only the first to call sendResponse() 
//for a particular event will succeed in sending the response. All other responses to that event will be ignored.
'use strict';

// universal Web Extension
window.browser = window.msBrowser || window.browser || window.chrome;
const appURL = browser.extension.getURL('index.html');
// chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
// })

function updateActiveTabState() {
    // updateLocal("www.dacapi.io", 0)
    // If idle, ignore
    chrome.idle.queryState(20, state => { //this is in seconds for some reason
        // User is active
        console.log(state, "state")
        if (state === "active") {
            chrome.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                },
                tabs => {
                    if (tabs.length === 0) return;

                    const tab = tabs[0];
                    const tabID = tab && tab.id;
                    const tabURL = tab && tab.url;

                    if (
                        tab &&
                        tabURL && 
                        ["loading", "complete"].indexOf(tab.status) > -1
                    ) {


                        chrome.windows.get(tabs[0].windowId, function (currentWindow) {
                            if (currentWindow.focused == true) {
                                updateLocal(tabURL, tabID);
                            }
                        });
                    }
                }
            );
        }
    });
}

function updateLocal(domain, tabId) {
    console.log(domain, tabId)
    console.log(localStorage, "store")
    // const apps = JSON.parse(localStorage["apps"]);

    // let readings;
    chrome.storage.sync.get(['visitDurations'], function(result) {
        //{"u1": time1, "u2": time2}
        const urls = result['visitDurations'] 
        || {"visitDuration": {[domain]: 0}} //if the database is set up afresh
       

        //once per installation ? browser setup?

        console.log(urls, "urls")
        const duration = urls[domain] || 0
    
        if (duration > 3000){

            // chrome.tabs.create({url:"popup.html"});

            console.log(domain, "qualifies!")

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {action: "fat yolo"}, function(response) {
                    console.log(response.content, "response in background");


                });  
            });
        
            return 

                //TODO: popup menu
        }
        else {
                //send message to popup
                urls[domain] = duration + 1000; //timeinterval
                chrome.storage.sync.set({visitDurations: urls}, function(result) {
                    console.log('set domain value', urls[domain], domain);
                  });
                }
        })
}

setInterval(function () {
    updateActiveTabState();
    console.log('runs interval')
},  3000);

