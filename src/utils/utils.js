import { pickBy, assoc, head } from 'ramda';
import chromep from 'chrome-promise';

export const trimString = (s, l = 50) => s.length > l
    ? s.substring(0, l) + "..."
    : s

export const JSONDownloadable = data => `data:
    'text/json;charset=utf-8,' 
    ${encodeURIComponent(JSON.stringify(data))}`

export const Node = (url, title, dateCreated=Date.now()) => ({
    dateCreated,
    // marked: false,
    // blocked: false,
    title: title || "",
    url,
});
export const loadBlackList = async () => fetch("https://raw.githubusercontent.com/mkstra/browserhistory/main/params.json")
     .then(res => res.json())
     // .then(res => console.log("aaa", res))
     .then(({blacklist}) => chromep.storage.sync.set({blacklist}))

export const pipeAwait = (...fns) => param => fns.reduce(async (result, next) => next(await result), param)     

export const UrlToDOM = async url =>
    fetch(url)
        .then(response => response.text())
        .then(html => {
            // Convert the HTML string into a document object
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            console.log("DOOOC", doc)
            return doc
        })
        .catch(function (err) {
            // There was an error
            console.log('URL FAIL: ', url, err);
        })

export const getActiveTab = async (detectionIntervalSeconds = 20) => {
    const idleState = await chromep.idle.queryState(detectionIntervalSeconds);
    if (idleState != 'active') return;

    const tabs = await chromep.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });
    return head(tabs);
};

//TODO: legit ISBN check, not just length of string/digits
/*You cannot validate an ISBN using a regex alone, because the last digit is computed 
using a checksum algorithm. The regular expressions in this section validate the format of an ISBN only.*/

//http://regexlib.com/REDetails.aspx?regexp_id=79
export const extractISBN10 = (node) => node.innerText.match(/^\d{9}[\d|X]$/)
