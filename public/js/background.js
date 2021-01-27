
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function children(element) {
        return Array.from(element.childNodes);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            if (detaching)
                component.$$.fragment.d(1);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var chromePromise = createCommonjsModule(function (module, exports) {
    /*!
     * chrome-promise
     * https://github.com/tfoxy/chrome-promise
     *
     * Copyright 2015 Tomás Fox
     * Released under the MIT license
     */

    (function(root, factory) {
      {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(this || root);
      }
    }(typeof self !== 'undefined' ? self : commonjsGlobal, function(root) {
      var slice = Array.prototype.slice,
          hasOwnProperty = Object.prototype.hasOwnProperty;

      // Temporary hacky fix to make TypeScript `import` work
      ChromePromise.default = ChromePromise;

      return ChromePromise;

      ////////////////

      function ChromePromise(options) {
        options = options || {};
        var chrome = options.chrome || root.chrome;
        var Promise = options.Promise || root.Promise;
        var runtime = chrome.runtime;
        var self = this;
        if (!self) throw new Error('ChromePromise must be called with new keyword');

        fillProperties(chrome, self);

        if (chrome.permissions) {
          chrome.permissions.onAdded.addListener(permissionsAddedListener);
        }

        ////////////////

        function setPromiseFunction(fn, thisArg) {

          return function() {
            var args = slice.call(arguments);

            return new Promise(function(resolve, reject) {
              args.push(callback);

              fn.apply(thisArg, args);

              function callback() {
                var err = runtime.lastError;
                var results = slice.call(arguments);
                if (err) {
                  reject(err);
                } else {
                  switch (results.length) {
                    case 0:
                      resolve();
                      break;
                    case 1:
                      resolve(results[0]);
                      break;
                    default:
                      resolve(results);
                  }
                }
              }
            });

          };

        }

        function fillProperties(source, target) {
          for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
              var val;
              // Sometime around Chrome v71, certain deprecated methods on the
              // extension APIs started using proxies to throw an error if the
              // deprecated methods were accessed, regardless of whether they
              // were invoked or not.  That would cause this code to throw, even
              // if no one was actually invoking that method.
              try {
                val = source[key];
              } catch(err) {
               continue;
              }
              var type = typeof val;

              if (type === 'object' && !(val instanceof ChromePromise)) {
                target[key] = {};
                fillProperties(val, target[key]);
              } else if (type === 'function') {
                target[key] = setPromiseFunction(val, source);
              } else {
                target[key] = val;
              }
            }
          }
        }

        function permissionsAddedListener(perms) {
          if (perms.permissions && perms.permissions.length) {
            var approvedPerms = {};
            perms.permissions.forEach(function(permission) {
              var api = /^[^.]+/.exec(permission);
              if (api in chrome) {
                approvedPerms[api] = chrome[api];
              }
            });
            fillProperties(approvedPerms, self);
          }
        }
      }
    }));
    });

    var chromep = new chromePromise();
    // Temporary hacky fix to make TypeScript `import` work
    chromep.default = chromep;

    var chromePromise$1 = chromep;

    const Node = (url, title, dateCreated=Date.now()) => ({
        dateCreated,
        // marked: false,
        // blocked: false,
        title: title || "",
        url,
    });
    const loadBlackList = async () => fetch("https://raw.githubusercontent.com/mkstra/browserhistory/main/params.json")
         .then(res => res.json())
         // .then(res => console.log("aaa", res))
         .then(({blacklist}) => chromePromise$1.storage.sync.set({blacklist}));

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
    const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
    const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

    const testParameter = (name, filters) => {
    	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
    };

    const normalizeDataURL = (urlString, {stripHash}) => {
    	const match = /^data:(?<type>.*?),(?<data>.*?)(?:#(?<hash>.*))?$/.exec(urlString);

    	if (!match) {
    		throw new Error(`Invalid URL: ${urlString}`);
    	}

    	let {type, data, hash} = match.groups;
    	const mediaType = type.split(';');
    	hash = stripHash ? '' : hash;

    	let isBase64 = false;
    	if (mediaType[mediaType.length - 1] === 'base64') {
    		mediaType.pop();
    		isBase64 = true;
    	}

    	// Lowercase MIME type
    	const mimeType = (mediaType.shift() || '').toLowerCase();
    	const attributes = mediaType
    		.map(attribute => {
    			let [key, value = ''] = attribute.split('=').map(string => string.trim());

    			// Lowercase `charset`
    			if (key === 'charset') {
    				value = value.toLowerCase();

    				if (value === DATA_URL_DEFAULT_CHARSET) {
    					return '';
    				}
    			}

    			return `${key}${value ? `=${value}` : ''}`;
    		})
    		.filter(Boolean);

    	const normalizedMediaType = [
    		...attributes
    	];

    	if (isBase64) {
    		normalizedMediaType.push('base64');
    	}

    	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
    		normalizedMediaType.unshift(mimeType);
    	}

    	return `data:${normalizedMediaType.join(';')},${isBase64 ? data.trim() : data}${hash ? `#${hash}` : ''}`;
    };

    const normalizeUrl = (urlString, options) => {
    	options = {
    		defaultProtocol: 'http:',
    		normalizeProtocol: true,
    		forceHttp: false,
    		forceHttps: false,
    		stripAuthentication: true,
    		stripHash: false,
    		stripWWW: true,
    		removeQueryParameters: [/^utm_\w+/i],
    		removeTrailingSlash: true,
    		removeSingleSlash: true,
    		removeDirectoryIndex: false,
    		sortQueryParameters: true,
    		...options
    	};

    	urlString = urlString.trim();

    	// Data URL
    	if (/^data:/i.test(urlString)) {
    		return normalizeDataURL(urlString, options);
    	}

    	if (/^view-source:/i.test(urlString)) {
    		throw new Error('`view-source:` is not supported as it is a non-standard protocol');
    	}

    	const hasRelativeProtocol = urlString.startsWith('//');
    	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

    	// Prepend protocol
    	if (!isRelativeUrl) {
    		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
    	}

    	const urlObj = new URL(urlString);

    	if (options.forceHttp && options.forceHttps) {
    		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
    	}

    	if (options.forceHttp && urlObj.protocol === 'https:') {
    		urlObj.protocol = 'http:';
    	}

    	if (options.forceHttps && urlObj.protocol === 'http:') {
    		urlObj.protocol = 'https:';
    	}

    	// Remove auth
    	if (options.stripAuthentication) {
    		urlObj.username = '';
    		urlObj.password = '';
    	}

    	// Remove hash
    	if (options.stripHash) {
    		urlObj.hash = '';
    	}

    	// Remove duplicate slashes if not preceded by a protocol
    	if (urlObj.pathname) {
    		urlObj.pathname = urlObj.pathname.replace(/(?<!\b(?:[a-z][a-z\d+\-.]{1,50}:))\/{2,}/g, '/');
    	}

    	// Decode URI octets
    	if (urlObj.pathname) {
    		try {
    			urlObj.pathname = decodeURI(urlObj.pathname);
    		} catch (_) {}
    	}

    	// Remove directory index
    	if (options.removeDirectoryIndex === true) {
    		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
    	}

    	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
    		let pathComponents = urlObj.pathname.split('/');
    		const lastComponent = pathComponents[pathComponents.length - 1];

    		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
    			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
    			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
    		}
    	}

    	if (urlObj.hostname) {
    		// Remove trailing dot
    		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

    		// Remove `www.`
    		if (options.stripWWW && /^www\.(?!www\.)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63})$/.test(urlObj.hostname)) {
    			// Each label should be max 63 at length (min: 1).
    			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
    			// Each TLD should be up to 63 characters long (min: 2).
    			// It is technically possible to have a single character TLD, but none currently exist.
    			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
    		}
    	}

    	// Remove query unwanted parameters
    	if (Array.isArray(options.removeQueryParameters)) {
    		for (const key of [...urlObj.searchParams.keys()]) {
    			if (testParameter(key, options.removeQueryParameters)) {
    				urlObj.searchParams.delete(key);
    			}
    		}
    	}

    	// Sort query parameters
    	if (options.sortQueryParameters) {
    		urlObj.searchParams.sort();
    	}

    	if (options.removeTrailingSlash) {
    		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
    	}

    	const oldUrlString = urlString;

    	// Take advantage of many of the Node `url` normalizations
    	urlString = urlObj.toString();

    	if (!options.removeSingleSlash && urlObj.pathname === '/' && !oldUrlString.endsWith('/') && urlObj.hash === '') {
    		urlString = urlString.replace(/\/$/, '');
    	}

    	// Remove ending `/` unless removeSingleSlash is false
    	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '' && options.removeSingleSlash) {
    		urlString = urlString.replace(/\/$/, '');
    	}

    	// Restore relative protocol, if applicable
    	if (hasRelativeProtocol && !options.normalizeProtocol) {
    		urlString = urlString.replace(/^http:\/\//, '//');
    	}

    	// Remove http/https
    	if (options.stripProtocol) {
    		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
    	}

    	return urlString;
    };

    var normalizeUrl_1 = normalizeUrl;

    /* src/Background.svelte generated by Svelte v3.5.4 */

    function create_fragment(ctx) {
    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function instance($$self) {

    	loadBlackList();

    	chrome.runtime.onMessage.addListener(function({ action, title, url }, sender, sendResponse) {
    		if (action == 'toggle:content') {
    			update(url, title) //user initiated
    				.then(() => {
    					sendResponse({ action: 'added content' });
    				})
    				.catch(e => console.log('error in update', e));
    		}
    		return true; //async message passing
    	});


    	const update = async (url, title) => {
    		url = normalizeUrl_1(url, {stripHash: true});
    		let entry = await chromePromise$1.storage.sync.get(url);
    		const node = Node(url, title);
    		console.log(node, 'node here');

    		try {
    			entry[url]
    				? await chromePromise$1.storage.sync.remove(url)
    				: await chromePromise$1.storage.sync.set({ [url]: node });
    		} catch (err) {
    			console.log(err, `error in ${entry[url] ? "REMOVE" : "SETTING"}`);
    		}
    		return true;
    	};

    	return {};
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    // import App from './App.svelte';
    // import parsing from "./parsing"
    const app = new Background({
    	target: document.body,
    	// props: {
    	// 	name: 'world',
    	// },
    });

    return app;

}());
//# sourceMappingURL=background.js.map
