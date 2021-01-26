import { pickBy, assoc, head } from 'ramda';
import chromep from 'chrome-promise';

export const trimString = (s, l=50) => s.length > l 
            ? s.substring(0, l) + "..."
            : s

export const JSONDownloadable = data => `data:
    'text/json;charset=utf-8,' 
    ${encodeURIComponent(JSON.stringify(data))}`

export const getActiveTab = async (detectionIntervalSeconds=20) => {
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
