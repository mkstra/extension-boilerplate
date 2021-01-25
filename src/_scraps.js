let map = {}; // You could also use an array
let lastClickTime = Date.now()
onkeydown = onkeyup = function(e){
  map[e.key] = e.type == 'keydown'; //genius
  // console.log(map, "map")
  /* insert conditional here */
  // if ( (Date.now() - lastClickTime) < 1000) return 

  // lastClickTime = Date.now()

  if(map["Shift"] && map["R"])
  {// CTRL+SHIFT+A

    console.log('Shift R');
    //send to background -- background handles state???? send back action?
  }
}

window.addEventListener('keydown', onkeydown)
window.addEventListener('keyup', onkeyup)