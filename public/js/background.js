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
    // If idle, ignore
    chrome.idle.queryState(2000, state => {
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
                        tabURL && ["loading", "complete"].indexOf(tab.status) > -1
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

    let readings;
    chrome.storage.sync.get(['visitDurations'], function(result) {
        //{"u1": time1, "u2": time2}
        urls = result['visitDurations']
        duration = urls[domain]
        if (duration) {
            if (duration > 3000){

                console.log(domain, "qualifies!")
                return

                //TODO: popup menu
            }
            else {
                //send message to popup
                urls[domain] = duration + 1000; //timeinterval
                chrome.storage.sync.set({visitDurations: urls}, function(result) {
                    console.log('set domain value 1', domain);
                  });
            }
        }
        else {
            urls[domain] = 0
            chrome.storage.sync.set({visitDurations: urls}, function(result) {
                console.log('Value currently is ' + JSON.stringify(result));
              });
        }
    })
}

setInterval(function () {
    updateActiveTabState();
},  3000);

