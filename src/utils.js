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

//TODO split into pipe components
// export const storageToColl = store => {
//         const nodes = pickBy((val, key) => val['marked'], store);
//         //flatten // ["url", "{}"]
//         return Object.entries(nodes)
//             .map(([url, node]) => assoc('url', url, node))
//             .map(({ url, title, dateCreated }) => ({
//                 title: title || '',
//                 created: new Date(dateCreated).toDateString(),
//                 url,

//             }));
//     };
