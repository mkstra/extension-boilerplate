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
- [ ] <Fetch /> component with async and trial info?
- [ ] Buttons buttons buttons (with scoped CSS?)
- [ ] Use Commands API for Search Bar ?

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
- [ ] implement reframe in Svelte ..... lol
- [ ] slowly think about testing (look at https://github.com/Lamden/wallet/)
- [ ] run client side classifier (isPost)

## Features
- [ ] we can watch extension from
- [ ] pass messages from dashboard (get chrome.history or chrome.storage) https://developer.chrome.com/docs/extensions/mv2/messaging/

Making Data Entry more Expressive
- [ ] write some adaptors (Twitter, Youtube Vid, TikTok, Instagram)
- [ ] validate how this is better than annotation apps??? Memex or Hypothesis?
- Making Data Entry ceasier
- [ ] whitelist domains --> auto post
- [ ] no tags, no annotations, no lists, no upvotes, just vote with your attention

## CD / CI
- [ ] rollup --watch rebuild
- [ ] rollup restart daemon on crash
- [ ] tests 

## VSCODE setup
- [ ] not working! prettier for svelte
- [ ] shortcuts - bindings

## Code
- [ ] Keep Popup dumm (just user stats passed as JSON from BG )
- [ ] background script message passing -> successful login
- [ ] 