# Why?

Infrastructure for [future queries](https://dacapo.io/future-query/)

## To try out

API source
https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples

Install the dependencies...

```bash
yarn
```

...then start [Rollup](https://rollupjs.org):

```bash
yarn start
```
# TODOS
## Abstractions needed::
- [ ] SCHEMAS, above all!
- [ ] Wrappers for chrome.storage (which is basically a store...) {set: .., get:...}
- [ ] Async Prop Component
- [ ] /slot pass children
- [ ] less Svelte primitives (easier to port to CLJS later...)
- [ ] Buttons buttons buttons (with scoped CSS?)

## Technical /now
- [ ] Writing tests for this fucking thing?
- [ ] Blacklist also for toastr reminders to not annoy
- [x] Keypresses like Shift+R
- [x] add to "marks" 
- [x] separate YOUDB storage from TEMP-session
- [x] don't auto-add; just have reminder toast display!
- [ ] Regex and rules to trim URL names; 
- [ ] JSONDownload injects a random ' character at beginning
- [x] remove duplicates in history
- [ ] UI: fold similar candidates
- [ ]
- [x] todo and display message (change css)
- [ ] black and white list always on
- [ ] implement reframe in Svelte 
- [ ] slowly think about testing (look at https://github.com/Lamden/wallet/)
- [x] run client side classifier (isPost)

## Features
Making Data Entry more Expressive
- [ ] write some adaptors (Twitter, Youtube Vid, TikTok, Instagram)

## CD / CI
- [ ] rollup --watch rebuild
- [ ] rollup restart daemon on crash
- [ ] tests 
