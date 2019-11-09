<script>
import LoginForm from './LoginForm.svelte'
const chromestoreID = "bedmbgkddhhnajfafgpbpbcjmdnnngll"
//...bf is localhost
const localDevID = "ldhfcelpkklpbfafamncdmgenaphmibf"
const EXTENSION_ID = localDevID
  //TODO: Attention - chrome id on localhost isn't same as chrome store
//To send messages to content scripts, use tabs.sendMessage.

//FIXME: firebase is injected from the index.html script
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
// Initialize Firebas

//FIXME: waiting for firebase to load into it....
const app = firebase.initializeApp(firebaseConfig);



console.log("app fiba", app)
</script>
<h1>App here</h1>

{#if app}
  <LoginForm app={app} />
  <!-- <BookBadge uid={uid} /> -->
{/if}



 