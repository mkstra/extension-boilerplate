<script>
/*
TODO:
  *Overlay
      Login / Logout window
  *Like Book / Like Article
  *Reads in Article

  *Site Intell
  *
*/
import BookBadge from "./BookBadge.svelte"
import { authState } from 'rxfire/auth';
import LoginForm from "./LoginForm.svelte"
import {firebase_} from "./firebaseSetup"
//firebase is in globals in <script> of public/index.html
const db = firebase_.firestore()
const auth = firebase_.auth()
let user;
const unsubscribe = authState(auth).subscribe(u => {
    console.log("user here", u); 
    //TODO: is there a better way than mutating user?
    user = u 
});

</script>
  {#if user}
    <hr>
    <BookBadge uid={user.uid} db={db} />
    <hr>

    <button on:click={() => auth.signOut() }>Logout</button>
  {:else}
    <LoginForm firebase_={firebase_} />

  {/if}
  <h1>tooo</h1>
