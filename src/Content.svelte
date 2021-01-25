<script>
	/*global chrome*/
  'use strict';
  import toastr from "toastr"
  import hotkeys from 'hotkeys-js'

  

	// universal Web Extension
	window.browser = window.chrome || window.msBrowser || window.browser;



  hotkeys('shift+r', function(event, handler){
  // Prevent the default refresh event under WINDOWS system
    chrome.runtime.sendMessage({action: "toggle-marked"}, res => console.log(res, "resssaa"));

    event.preventDefault() 
  });

  
  let marked = false;

  //check if this page is marked

  const isMarked = (location, storage) => {
    const node = storage.find(n => n.url == location)
    if (!node) return false
    return node.marked  
  }

  chrome.storage.sync.get("prose-log-entries", storage => {
    marked = isMarked(window.location.href, storage["prose-log-entries"])
    console.log("heey", marked)

  } )

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (const key in changes) {
      const storageChange = changes[key];
      const storage = storageChange.newValue

      const m = isMarked(window.location.href, storage)
      console.log("m", m)
      if (m == marked) return //nothing changed (except timestamps)
      
      marked = m
      
      if (marked) {
        toastr.info("Press Shift + R to undo", "Content added to your Store")
      } else {
        toastr.info("Press Shift + R to add again", "REMOVED")

      }
    }
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
