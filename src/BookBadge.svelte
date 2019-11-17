<script>
import { collectionData } from 'rxfire/firestore';
import { startWith, map} from 'rxjs/operators';
import {db} from "./firebaseSetup.js"
// User ID passed from parent

// Form Text
export let db
export let uid
// Query requires an index, see screenshot below

const sepp = "q8ksupF9ZO4tmUdvXizY"
const users = db.collection('users') 
const query = users.where('name', '==', "markus")
const books = collectionData(query, 'id').pipe(startWith([{name: "yo"}]));

/*
const query = users.orderBy('name', 'desc')
const books = collectionData(query, 'books_wanted')
.pipe(map(user => user.name))
.subscribe(count => console.log(`Clicked ${count}`));
*/

collectionData(
      users.orderBy('name', 'desc'),
      'yolo'
    ).subscribe(users => {
      console.log('firestoreList', users);
      // re-render on each change
    });


</script>
<h1>Books yea</h1>
{#each $books as book}

        <h2> Book x: {book.books_wanted}</h2>
        
	{/each}
