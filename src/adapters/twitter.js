


`<div id="em-vote-1">👎</div> <div button=em-vote-2>👍</div>`

//light theme
let tweetSelector2 = (n) => `#react-root > div > div >
    div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > 
    main > div > div > div > div > div >
    div.css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div >
    section > div > div > div:nth-child(${n})`


    //don't forget the > if you don't chain
let tweetButtonSelector = () => `div > div > article > div > div > div > div.css-1dbjc4n.r-18u37iz > 
   div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-1mi0q7o > 
   div:nth-child(2) > div.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-156q2ks.r-1mdbhws`