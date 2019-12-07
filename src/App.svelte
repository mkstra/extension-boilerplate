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
import {db, auth} from "./firebaseSetup"
//firebase is in globals in <script> of public/index.html
let user;
const unsubscribe = authState(auth).subscribe(u => {
    console.log("user here", u); 
    //TODO: is there a better way than mutating user?
    user = u 
});

export const getBookmarks = () => {
  chrome.bookmarks.search({}, function (bookmarks){
    
        console.log("bookmarks", bookmarks)
        //callback
  })
}

export const getHistory = () => {
    chrome.history.search({
        'text': '',              // Return every history item....
        'startTime': (new Date).getTime() - 100000000000000000000000  // that was accessed less than one week ago.
      }, function (historyItems){
    
        console.log("history", historyItems)
        //callback
    })
}
</script>
  {#if !user}
    <LoginForm />

  {:else}

    <hr>
    <BookBadge uid={user.uid} />
    <hr>
    <button on:click={() => auth.signOut() }>Logout</button>

  {/if}
      <button on:click={getHistory}>getHistory</button>
            <button on:click={getBookmarks}>getBookmarks</button>


