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

