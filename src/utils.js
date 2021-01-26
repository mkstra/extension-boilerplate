import { pickBy, assoc } from 'ramda';

export const trimString = (s, l=50) => s.length > l 
            ? s.substring(0, l) + "..."
            : s


export const JSONDownloadable = data => `data:
    'text/json;charset=utf-8,' 
    ${encodeURIComponent(JSON.stringify(data))}`

//TODO split into pipe components
export const storageToColl = store => {
        const nodes = pickBy((val, key) => val['marked'], store);
        //flatten // ["url", "{}"]
        return Object.entries(nodes)
            .map(([url, node]) => assoc('url', url, node))
            .map(({ url, title, dateCreated }) => ({
                title: title || '',
                created: new Date(dateCreated).toDateString(),
                url,

            }));
    };
