<script>
/*global chrome*/

import { authState } from 'rxfire/auth';
  // Your web app's Firebase configuration
const chromestoreID = "bedmbgkddhhnajfafgpbpbcjmdnnngll"
//...bf is localhost
const localDevID = "ldhfcelpkklpbfafamncdmgenaphmibf"
const EXTENSION_ID = localDevID
  //TODO: Attention - chrome id on localhost isn't same as chrome store
//To send messages to content scripts, use tabs.sendMessage.

  let user;


window.c = chrome.runtime.sendMessage
chrome.runtime.sendMessage(EXTENSION_ID, {greeting: "svelte"}, async function(response) {
  console.log("response: bg -> auth", response.farewell);
  return true
});

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
  const auth = firebase.auth()
  console.log("below")
  const unsubscribe = authState(auth).subscribe(u => {
    console.log("user here", u); 
    //TODO: is there a better way than mutating user?
    user = u
   


  }
  );
  const isExistingUser = (currentUser) => (currentUser.metadata.lastSignInTime - currentUser.metadata.creationTime) > 1000
	const ui = new firebaseui.auth.AuthUI(auth);
	const uiConfig = {
          credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
          callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // Do something with the returned AuthResult.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            console.log("authResult", authResult)
            return false;
          },
          signInFailure: function(error) {
            // Return a promise when error handling is completed and FirebaseUI
            // will reset, clearing any UI. This commonly occurs for error code
            // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
            // occurs. Check below for more details on this.
            console.error("---sign in FAILURE")
            return false
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }},
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
	  }
  ],
  signInSuccessUrl: "/",
}

  const loginUI = (force) => {
  if (force) {
    ui.start('#firebaseui-auth-container', uiConfig);
  }
}
loginUI(ui.isPendingRedirect())


</script>
    <div id="firebaseui-auth-container"></div>
     <div id="loader">Loading...</div>
{#if user}
    <button on:click={() => auth.signOut() }>Logout</button>
    <hr>
{:else}
   <button on:click={loginUI}>
		Signin 
	</button>
{/if}
 