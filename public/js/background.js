/*global chrome*/


//Note: If multiple pages are listening for 
//onMessage events, only the first to call sendResponse() for a particular event will succeed in sending the response. All other responses to that event will be ignored.
'use strict';

const chromestoreID = "bedmbgkddhhnajfafgpbpbcjmdnnngll"
//...bf is localhost
const localDevID = "ldhfcelpkklpbfafamncdmgenaphmibf"
const EXTENSION_ID = localDevID

// universal Web Extension
window.browser = window.msBrowser || window.browser || window.chrome;

// browser.runtime.onInstalled.addListener(details => {
// 	console.log('previousVersion', details.previousVersion);
// });

// console.log("background auth ", firebase)

// browser.browserAction.setBadgeText({text: 'asd'});
const appURL = browser.extension.getURL('index.html');
// Open new tab with our index.html when click on the extension button


const firebaseConfig = {
    apiKey: "AIzaSyDC1R-8N_K9ExqoUqlY_hv3Hsq-95fL7XU",
    authDomain: "together-7d90d.firebaseapp.com",
    databaseURL: "https://together-7d90d.firebaseio.com",
    projectId: "together-7d90d",
    storageBucket: "together-7d90d.appspot.com",
    messagingSenderId: "1051151523557",
    appId: "1:1051151523557:web:43e5075d31f4722731be0c",
    measurementId: "G-279CSGB8R1"
  };

// Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  //firebase.analytics();
  function initApp() {
	// Listen for auth state changes.
	firebase.auth().onAuthStateChanged(function(user) {
	  console.log('User state change detected from the Background script of the Chrome Extension:', user);
	});
  }
  
  window.onload = function() {
	initApp();
  };
chrome.runtime.onMessage.addListener(
	async function(request, sender, sendResponse) {
	  console.log(sender.tab ?
				  "from a content script:" + sender.tab.url :
				  "from the extension");
	

	console.log("request at bg", request)
	if (request.greeting == "svelte") {
			console.log("yolo svelte -> BG")
		  sendResponse({farewell: firebase.auth()});
	  }

	return true
	});


// chrome.runtime.onMessage.addListener(
// 	async function(request, sender, sendResponse) {
// 	  console.log(sender.tab ?
// 				  "from a content script:" + sender.tab.url :
// 				  "from the extension");
// 	  if (request.greeting == "hello") {

// 		  sendResponse({farewell: "goodbye"});
// 	  }
// 	});


