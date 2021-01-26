
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
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

    function _isPlaceholder(a) {
      return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
    }

    /**
     * Optimized internal one-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */

    function _curry1(fn) {
      return function f1(a) {
        if (arguments.length === 0 || _isPlaceholder(a)) {
          return f1;
        } else {
          return fn.apply(this, arguments);
        }
      };
    }

    /**
     * Optimized internal two-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */

    function _curry2(fn) {
      return function f2(a, b) {
        switch (arguments.length) {
          case 0:
            return f2;

          case 1:
            return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
              return fn(a, _b);
            });

          default:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
              return fn(_a, b);
            }) : _isPlaceholder(b) ? _curry1(function (_b) {
              return fn(a, _b);
            }) : fn(a, b);
        }
      };
    }

    /**
     * Optimized internal three-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */

    function _curry3(fn) {
      return function f3(a, b, c) {
        switch (arguments.length) {
          case 0:
            return f3;

          case 1:
            return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
              return fn(a, _b, _c);
            });

          case 2:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
              return fn(_a, b, _c);
            }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
              return fn(a, _b, _c);
            }) : _curry1(function (_c) {
              return fn(a, b, _c);
            });

          default:
            return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
              return fn(_a, _b, c);
            }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
              return fn(_a, b, _c);
            }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
              return fn(a, _b, _c);
            }) : _isPlaceholder(a) ? _curry1(function (_a) {
              return fn(_a, b, c);
            }) : _isPlaceholder(b) ? _curry1(function (_b) {
              return fn(a, _b, c);
            }) : _isPlaceholder(c) ? _curry1(function (_c) {
              return fn(a, b, _c);
            }) : fn(a, b, c);
        }
      };
    }

    /**
     * Makes a shallow clone of an object, setting or overriding the specified
     * property with the given value. Note that this copies and flattens prototype
     * properties onto the new object as well. All non-primitive properties are
     * copied by reference.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Object
     * @sig String -> a -> {k: v} -> {k: v}
     * @param {String} prop The property name to set
     * @param {*} val The new value
     * @param {Object} obj The object to clone
     * @return {Object} A new object equivalent to the original except for the changed property.
     * @see R.dissoc, R.pick
     * @example
     *
     *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
     */

    var assoc =
    /*#__PURE__*/
    _curry3(function assoc(prop, val, obj) {
      var result = {};

      for (var p in obj) {
        result[p] = obj[p];
      }

      result[prop] = val;
      return result;
    });

    const trimString = (s, l=50) => s.length > l 
                ? s.substring(0, l) + "..."
                : s;

    const JSONDownloadable = data => `data:
    'text/json;charset=utf-8,' 
    ${encodeURIComponent(JSON.stringify(data))}`;

    /* src/Popup.svelte generated by Svelte v3.5.4 */

    const file = "src/Popup.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    // (73:0) {:else}
    function create_else_block(ctx) {
    	var input, t0, button, t2, br0, t3, br1, t4, table, thead, tr, th0, t6, th1, t8, th2, t10, th3, t12, tbody, dispose;

    	var each_value = ctx.collection;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "DELETE ALL";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Delete Entry";
    			t6 = space();
    			th1 = element("th");
    			th1.textContent = "title";
    			t8 = space();
    			th2 = element("th");
    			th2.textContent = "createTime";
    			t10 = space();
    			th3 = element("th");
    			th3.textContent = "url";
    			t12 = space();
    			tbody = element("tbody");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			set_style(input, "min-width", "20vw");
    			attr(input, "type", "text");
    			add_location(input, file, 73, 1, 1774);
    			add_location(button, file, 74, 4, 1851);
    			add_location(br0, file, 75, 4, 1907);
    			add_location(br1, file, 76, 8, 1920);
    			attr(th0, "class", "svelte-o60a6m");
    			add_location(th0, file, 81, 4, 1957);
    			attr(th1, "class", "svelte-o60a6m");
    			add_location(th1, file, 83, 4, 1984);
    			attr(th2, "class", "svelte-o60a6m");
    			add_location(th2, file, 84, 4, 2003);
    			attr(th3, "class", "svelte-o60a6m");
    			add_location(th3, file, 85, 4, 2027);
    			add_location(tr, file, 80, 3, 1948);
    			add_location(thead, file, 79, 2, 1937);
    			add_location(tbody, file, 89, 2, 2111);
    			attr(table, "class", "svelte-o60a6m");
    			add_location(table, file, 78, 1, 1927);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(button, "click", ctx.clearStorage)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);

    			input.value = ctx.deleteConfirm;

    			insert(target, t0, anchor);
    			insert(target, button, anchor);
    			insert(target, t2, anchor);
    			insert(target, br0, anchor);
    			insert(target, t3, anchor);
    			insert(target, br1, anchor);
    			insert(target, t4, anchor);
    			insert(target, table, anchor);
    			append(table, thead);
    			append(thead, tr);
    			append(tr, th0);
    			append(tr, t6);
    			append(tr, th1);
    			append(tr, t8);
    			append(tr, th2);
    			append(tr, t10);
    			append(tr, th3);
    			append(table, t12);
    			append(table, tbody);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.deleteConfirm && (input.value !== ctx.deleteConfirm)) input.value = ctx.deleteConfirm;

    			if (changed.collection || changed.trimString) {
    				each_value = ctx.collection;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    				detach(t0);
    				detach(button);
    				detach(t2);
    				detach(br0);
    				detach(t3);
    				detach(br1);
    				detach(t4);
    				detach(table);
    			}

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    }

    // (71:0) {#if !big}
    function create_if_block(ctx) {
    	var button, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "View Dashboard";
    			add_location(button, file, 71, 1, 1714);
    			dispose = listen(button, "click", ctx.openTab);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    // (91:3) {#each collection as row}
    function create_each_block(ctx) {
    	var tr, div, button, t1, td0, t2_value = trimString(ctx.row.title) || '/', t2, t3, td1, t4_value = ctx.row.created, t4, t5, td2, a, t6_value = trimString(ctx.row.url, 70), t6, a_href_value, t7, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			tr = element("tr");
    			div = element("div");
    			button = element("button");
    			button.textContent = "X";
    			t1 = space();
    			td0 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td2 = element("td");
    			a = element("a");
    			t6 = text(t6_value);
    			t7 = space();
    			set_style(button, "background", "red");
    			set_style(button, "color", "white");
    			set_style(button, "font-weight", "bold");
    			add_location(button, file, 93, 24, 2207);
    			add_location(div, file, 92, 20, 2177);
    			set_style(td0, "min-width", "15rem");
    			attr(td0, "class", "svelte-o60a6m");
    			add_location(td0, file, 101, 5, 2383);
    			attr(td1, "class", "svelte-o60a6m");
    			add_location(td1, file, 102, 5, 2453);
    			attr(a, "href", a_href_value = ctx.row.url);
    			add_location(a, file, 104, 6, 2492);
    			attr(td2, "class", "svelte-o60a6m");
    			add_location(td2, file, 103, 5, 2481);
    			add_location(tr, file, 91, 4, 2152);
    			dispose = listen(button, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, div);
    			append(div, button);
    			append(tr, t1);
    			append(tr, td0);
    			append(td0, t2);
    			append(tr, t3);
    			append(tr, td1);
    			append(td1, t4);
    			append(tr, t5);
    			append(tr, td2);
    			append(td2, a);
    			append(a, t6);
    			append(tr, t7);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.collection) && t2_value !== (t2_value = trimString(ctx.row.title) || '/')) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.collection) && t4_value !== (t4_value = ctx.row.created)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.collection) && t6_value !== (t6_value = trimString(ctx.row.url, 70))) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.collection) && a_href_value !== (a_href_value = ctx.row.url)) {
    				attr(a, "href", a_href_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	var a0, t0, t1, hr0, t2, a1, t4, hr1, t5, if_block_anchor;

    	function select_block_type(ctx) {
    		if (!ctx.big) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			a0 = element("a");
    			t0 = text("Download my Data");
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			a1 = element("a");
    			a1.textContent = "Publish my Data";
    			t4 = space();
    			hr1 = element("hr");
    			t5 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr(a0, "href", ctx.link);
    			attr(a0, "download", "data.json");
    			add_location(a0, file, 66, 0, 1543);
    			add_location(hr0, file, 67, 0, 1600);
    			attr(a1, "href", "mailto:strasser.ms@gmail.com?subject=streamdata!&body=Hi.");
    			add_location(a1, file, 68, 0, 1607);
    			add_location(hr1, file, 69, 0, 1695);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a0, anchor);
    			append(a0, t0);
    			insert(target, t1, anchor);
    			insert(target, hr0, anchor);
    			insert(target, t2, anchor);
    			insert(target, a1, anchor);
    			insert(target, t4, anchor);
    			insert(target, hr1, anchor);
    			insert(target, t5, anchor);
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.link) {
    				attr(a0, "href", ctx.link);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a0);
    				detach(t1);
    				detach(hr0);
    				detach(t2);
    				detach(a1);
    				detach(t4);
    				detach(hr1);
    				detach(t5);
    			}

    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {

    	let collection = [{ url: 'test.com', title: 'storage not loading.... sry' }];

    	let link = '';
    	let deleteConfirm = "type: 'IRREVERSIBLE' to confirm";
    	let big = window.location.hash == '#big';

    	const openTab = () => {
    		/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
                #window lets popup know what's up
            */
    		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#big') });
    	};

    	const getStorage = async () => {
    		const storage = await chromePromise$1.storage.sync.get(null);

    		$$invalidate('collection', collection = Object.entries(storage)
    			.map(([url, node]) => assoc('url', url, node))
    			.map(({ url, title, dateCreated }) => ({
    				title: title || '',
    				created: new Date(dateCreated).toDateString(),
    				url,
    			})));
    		$$invalidate('link', link = JSONDownloadable(collection));
    	};

    	const clearStorage = async () => {
    		if (deleteConfirm == 'IRREVERSIBLE') {
    			await chromePromise$1.storage.sync.clear();
    		} else {
    			alert("type in 'IRREVERSIBLE' into the input field");
    		}
    		getStorage();
    	};

    	getStorage();
    	const removeItem = async itemID => {
    		await chromePromise$1.storage.sync.remove(itemID);
    		getStorage();
    	};

    	function input_input_handler() {
    		deleteConfirm = this.value;
    		$$invalidate('deleteConfirm', deleteConfirm);
    	}

    	function click_handler({ row }) {
    		return removeItem(row.url);
    	}

    	return {
    		collection,
    		link,
    		deleteConfirm,
    		big,
    		openTab,
    		clearStorage,
    		removeItem,
    		input_input_handler,
    		click_handler
    	};
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    // import parsing from "./parsing"
    const app = new Popup({
    	target: document.body,
    	// props: {
    	// 	name: 'world',
    	// },
    });

    return app;

}());
//# sourceMappingURL=popup.js.map
