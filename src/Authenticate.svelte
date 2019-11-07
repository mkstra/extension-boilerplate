<script>
import { authState } from 'rxfire/auth';
  console.log(firebase, "authenticate")
  let user;
  const unsubscribe = authState(auth).subscribe(u => user = u);
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
 
