//TODO: legit ISBN check, not just length of string/digits

/*You cannot validate an ISBN using a regex alone, because the last digit is computed 
using a checksum algorithm. The regular expressions in this section validate the format of an ISBN only.*/

//http://regexlib.com/REDetails.aspx?regexp_id=79
export const extractISBN10 = (node) => node.innerText.match(/^\d{9}[\d|X]$/)

const extractISBN13 = (node) => null