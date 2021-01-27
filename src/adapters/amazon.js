
/* This won't work for Kindle */
const getISBNsfromAmazonPage = doc => //{ISBN-10: 8408063979, ISBN-13: 978} 
    Array.from(doc
        .getElementById("detailBulletsWrapper_feature_div")
        .querySelectorAll("span"))
        .map(span => span.innerText)
        .filter(text => text.includes("ISBN-10") || text.includes("ISBN-13"))
        .filter(e => e.length > 15)
        .map(e => e.split(" : "))
        .map(([a, b]) => ({ [a]: b })) //[ [], []]
        .reduce((acc, next) => ({ ...acc, ...next }), {})  