<script>
	/*global chrome*/
  'use strict';
  import toastr from "toastr"
  import hotkeys from 'hotkeys-js'
  import {path} from "ramda"
  
	// universal Web Extension
	window.browser = window.chrome || window.msBrowser || window.browser;

  hotkeys('shift+r', function(event, handler){
  // Prevent the default refresh event under WINDOWS system
    chrome.runtime.sendMessage({action: "toggle-marked"}, _ => _);
    event.preventDefault() 
  });

  let marked = false;

  //get initial value on page startup
  chrome.storage.sync.get(window.location.href, storage => {
    marked = !!path([window.location.href, "marked"], storage)
    console.log("heey", marked)
  })

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    /*changes = {
      url: {oldValue: {...}, newValue: {....}}, url2: {...}
    }*/
    const m = !!path([window.location.href, "newValue", "marked"], changes)
    if (m == marked) return //nothing changed (except timestamps)
    
    marked = m
    marked 
      ? toastr.info("ADDED: Press Shift + R to undo")
      : toastr.info("REMOVED: Press Shift + R to add again")

    return true //needed for async?!
  });

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request, "requ")
		sendResponse({ content: 'goodbye' });
    // marked = true;
    
    return true
  });
  

  toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": false,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
  }


	// console.log(M, 'materialize')
</script>

<button class="prosebar" style="background-color: {marked ? 'blue' : 'white'}">
	Shift + R to mark content
</button>
<!-- <div id="prosebar" class:marked={true}> Shift + RFFF qq mark</div> -->
