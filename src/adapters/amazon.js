
import {path} from "ramda"


const getISBNsfromAmazonPage = doc => //{ISBN-10: "1577315936", ISBN-13: "978-1577315933"} 
    {
        try {
            const isbns = Array.from(doc
                .getElementById("detailBulletsWrapper_feature_div")
                .querySelectorAll("span"))

                //Array
                .map(span => span.innerText)
                .filter(text => text.includes("ISBN-10") || text.includes("ISBN-13"))
                .filter(e => e.length > 15)
                // .map(e => e.split(" : "))
                
                if (isbns.length > 0) {
                    return ({hasISBN: true})
                }
                // .map(e => ({hasISBN: true}))
                // .map(([a, b]) => ({ "ISBN": b })) //[ [], []]
                // .reduce((acc, next) => ({ ...acc, ...next }), {})
        }
        catch (err) {
            console.log(err, "error ISBN")
            return ({a: 5})
        }
    }    


export const AmazonBookPageInfo = doc => (
    {
        img: path(['src'], doc.querySelector("#imgBlkFront")),
        productTitle: path(['textContent'], doc.querySelector("#productTitle")),
        author: path(['textContent'], doc.querySelector("#bylineInfo > span:nth-child(1) > span.a-declarative > a.a-link-normal.contributorNameID")),
        
        ...getISBNsfromAmazonPage(doc)
    })
//TODO use Chrome Dev Tools to "copy JS Path"
/* This won't work for Kindle */
