<script>
import { authState } from 'rxfire/auth';
import BookBadge from "./BookBadge.svelte"

export let app
console.log("APPP", app)
//TODO: very hacky because of chrome hostility... 
const {firebase_ : firebase} = app

const auth = firebase.auth()
const db = firebase.firestore()
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
        signInOptions: [{
          provider: firebase["auth"].EmailAuthProvider.PROVIDER_ID,
        
        }],
        signInSuccessUrl: "/",
      }

const loginUI = (force) => {
  if (force) {
    ui.start('#firebaseui-auth-container', uiConfig);
    }
}

loginUI(ui.isPendingRedirect())


let user;
const unsubscribe = authState(auth).subscribe(u => {
    console.log("user here", u); 
    //TODO: is there a better way than mutating user?
    user = u 
});

</script>
    <div id="firebaseui-auth-container"></div>
{#if user}
    <button on:click={() => auth.signOut() }>Logout</button>
    <hr>
    <BookBadge uid={user.uid} db={db} />
{:else}
    <div id="loader">Loading...</div>
   <button on:click={loginUI}>
		Signin 
	</button>
{/if}