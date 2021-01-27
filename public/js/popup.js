
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = key && { [key]: value };
            const child_ctx = assign(assign({}, info.ctx), info.resolved);
            const block = type && (info.current = type)(child_ctx);
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                flush();
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
        }
        if (is_promise(promise)) {
            promise.then(value => {
                update(info.then, 1, info.value, value);
            }, error => {
                update(info.catch, 2, info.error, error);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = { [info.value]: promise };
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
     * Tests whether or not an object is an array.
     *
     * @private
     * @param {*} val The object to test.
     * @return {Boolean} `true` if `val` is an array, `false` otherwise.
     * @example
     *
     *      _isArray([]); //=> true
     *      _isArray(null); //=> false
     *      _isArray({}); //=> false
     */
    var _isArray = Array.isArray || function _isArray(val) {
      return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
    };

    function _isString(x) {
      return Object.prototype.toString.call(x) === '[object String]';
    }

    function _has(prop, obj) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    var toString = Object.prototype.toString;

    var _isArguments =
    /*#__PURE__*/
    function () {
      return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
        return toString.call(x) === '[object Arguments]';
      } : function _isArguments(x) {
        return _has('callee', x);
      };
    }();

    var hasEnumBug = !
    /*#__PURE__*/
    {
      toString: null
    }.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

    var hasArgsEnumBug =
    /*#__PURE__*/
    function () {

      return arguments.propertyIsEnumerable('length');
    }();

    var contains = function contains(list, item) {
      var idx = 0;

      while (idx < list.length) {
        if (list[idx] === item) {
          return true;
        }

        idx += 1;
      }

      return false;
    };
    /**
     * Returns a list containing the names of all the enumerable own properties of
     * the supplied object.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {k: v} -> [k]
     * @param {Object} obj The object to extract properties from
     * @return {Array} An array of the object's own properties.
     * @see R.keysIn, R.values
     * @example
     *
     *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
     */


    var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
    /*#__PURE__*/
    _curry1(function keys(obj) {
      return Object(obj) !== obj ? [] : Object.keys(obj);
    }) :
    /*#__PURE__*/
    _curry1(function keys(obj) {
      if (Object(obj) !== obj) {
        return [];
      }

      var prop, nIdx;
      var ks = [];

      var checkArgsLength = hasArgsEnumBug && _isArguments(obj);

      for (prop in obj) {
        if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
          ks[ks.length] = prop;
        }
      }

      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;

        while (nIdx >= 0) {
          prop = nonEnumerableProps[nIdx];

          if (_has(prop, obj) && !contains(ks, prop)) {
            ks[ks.length] = prop;
          }

          nIdx -= 1;
        }
      }

      return ks;
    });

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

    /**
     * Gives a single-word string description of the (native) type of a value,
     * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
     * attempt to distinguish user Object types any further, reporting them all as
     * 'Object'.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Type
     * @sig (* -> {*}) -> String
     * @param {*} val The value to test
     * @return {String}
     * @example
     *
     *      R.type({}); //=> "Object"
     *      R.type(1); //=> "Number"
     *      R.type(false); //=> "Boolean"
     *      R.type('s'); //=> "String"
     *      R.type(null); //=> "Null"
     *      R.type([]); //=> "Array"
     *      R.type(/[A-z]/); //=> "RegExp"
     *      R.type(() => {}); //=> "Function"
     *      R.type(undefined); //=> "Undefined"
     */

    var type =
    /*#__PURE__*/
    _curry1(function type(val) {
      return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
    });

    function _arrayFromIterator(iter) {
      var list = [];
      var next;

      while (!(next = iter.next()).done) {
        list.push(next.value);
      }

      return list;
    }

    function _includesWith(pred, x, list) {
      var idx = 0;
      var len = list.length;

      while (idx < len) {
        if (pred(x, list[idx])) {
          return true;
        }

        idx += 1;
      }

      return false;
    }

    function _functionName(f) {
      // String(x => x) evaluates to "x => x", so the pattern may not match.
      var match = String(f).match(/^function (\w*)/);
      return match == null ? '' : match[1];
    }

    // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    function _objectIs(a, b) {
      // SameValue algorithm
      if (a === b) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return a !== 0 || 1 / a === 1 / b;
      } else {
        // Step 6.a: NaN == NaN
        return a !== a && b !== b;
      }
    }

    var _objectIs$1 = typeof Object.is === 'function' ? Object.is : _objectIs;

    /**
     * private _uniqContentEquals function.
     * That function is checking equality of 2 iterator contents with 2 assumptions
     * - iterators lengths are the same
     * - iterators values are unique
     *
     * false-positive result will be returned for comparision of, e.g.
     * - [1,2,3] and [1,2,3,4]
     * - [1,1,1] and [1,2,3]
     * */

    function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
      var a = _arrayFromIterator(aIterator);

      var b = _arrayFromIterator(bIterator);

      function eq(_a, _b) {
        return _equals(_a, _b, stackA.slice(), stackB.slice());
      } // if *a* array contains any element that is not included in *b*


      return !_includesWith(function (b, aItem) {
        return !_includesWith(eq, aItem, b);
      }, b, a);
    }

    function _equals(a, b, stackA, stackB) {
      if (_objectIs$1(a, b)) {
        return true;
      }

      var typeA = type(a);

      if (typeA !== type(b)) {
        return false;
      }

      if (a == null || b == null) {
        return false;
      }

      if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
        return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
      }

      if (typeof a.equals === 'function' || typeof b.equals === 'function') {
        return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
      }

      switch (typeA) {
        case 'Arguments':
        case 'Array':
        case 'Object':
          if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
            return a === b;
          }

          break;

        case 'Boolean':
        case 'Number':
        case 'String':
          if (!(typeof a === typeof b && _objectIs$1(a.valueOf(), b.valueOf()))) {
            return false;
          }

          break;

        case 'Date':
          if (!_objectIs$1(a.valueOf(), b.valueOf())) {
            return false;
          }

          break;

        case 'Error':
          return a.name === b.name && a.message === b.message;

        case 'RegExp':
          if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
            return false;
          }

          break;
      }

      var idx = stackA.length - 1;

      while (idx >= 0) {
        if (stackA[idx] === a) {
          return stackB[idx] === b;
        }

        idx -= 1;
      }

      switch (typeA) {
        case 'Map':
          if (a.size !== b.size) {
            return false;
          }

          return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));

        case 'Set':
          if (a.size !== b.size) {
            return false;
          }

          return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));

        case 'Arguments':
        case 'Array':
        case 'Object':
        case 'Boolean':
        case 'Number':
        case 'String':
        case 'Date':
        case 'Error':
        case 'RegExp':
        case 'Int8Array':
        case 'Uint8Array':
        case 'Uint8ClampedArray':
        case 'Int16Array':
        case 'Uint16Array':
        case 'Int32Array':
        case 'Uint32Array':
        case 'Float32Array':
        case 'Float64Array':
        case 'ArrayBuffer':
          break;

        default:
          // Values of other types are only equal if identical.
          return false;
      }

      var keysA = keys(a);

      if (keysA.length !== keys(b).length) {
        return false;
      }

      var extendedStackA = stackA.concat([a]);
      var extendedStackB = stackB.concat([b]);
      idx = keysA.length - 1;

      while (idx >= 0) {
        var key = keysA[idx];

        if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
          return false;
        }

        idx -= 1;
      }

      return true;
    }

    /**
     * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
     * cyclical data structures.
     *
     * Dispatches symmetrically to the `equals` methods of both arguments, if
     * present.
     *
     * @func
     * @memberOf R
     * @since v0.15.0
     * @category Relation
     * @sig a -> b -> Boolean
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     * @example
     *
     *      R.equals(1, 1); //=> true
     *      R.equals(1, '1'); //=> false
     *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
     *
     *      const a = {}; a.v = a;
     *      const b = {}; b.v = b;
     *      R.equals(a, b); //=> true
     */

    var equals =
    /*#__PURE__*/
    _curry2(function equals(a, b) {
      return _equals(a, b, [], []);
    });

    function _indexOf(list, a, idx) {
      var inf, item; // Array.prototype.indexOf doesn't exist below IE9

      if (typeof list.indexOf === 'function') {
        switch (typeof a) {
          case 'number':
            if (a === 0) {
              // manually crawl the list to distinguish between +0 and -0
              inf = 1 / a;

              while (idx < list.length) {
                item = list[idx];

                if (item === 0 && 1 / item === inf) {
                  return idx;
                }

                idx += 1;
              }

              return -1;
            } else if (a !== a) {
              // NaN
              while (idx < list.length) {
                item = list[idx];

                if (typeof item === 'number' && item !== item) {
                  return idx;
                }

                idx += 1;
              }

              return -1;
            } // non-zero numbers can utilise Set


            return list.indexOf(a, idx);
          // all these types can utilise Set

          case 'string':
          case 'boolean':
          case 'function':
          case 'undefined':
            return list.indexOf(a, idx);

          case 'object':
            if (a === null) {
              // null can utilise Set
              return list.indexOf(a, idx);
            }

        }
      } // anything else not covered above, defer to R.equals


      while (idx < list.length) {
        if (equals(list[idx], a)) {
          return idx;
        }

        idx += 1;
      }

      return -1;
    }

    function _includes(a, list) {
      return _indexOf(list, a, 0) >= 0;
    }

    function _isObject(x) {
      return Object.prototype.toString.call(x) === '[object Object]';
    }

    var _Set =
    /*#__PURE__*/
    function () {
      function _Set() {
        /* globals Set */
        this._nativeSet = typeof Set === 'function' ? new Set() : null;
        this._items = {};
      }

      // until we figure out why jsdoc chokes on this
      // @param item The item to add to the Set
      // @returns {boolean} true if the item did not exist prior, otherwise false
      //
      _Set.prototype.add = function (item) {
        return !hasOrAdd(item, true, this);
      }; //
      // @param item The item to check for existence in the Set
      // @returns {boolean} true if the item exists in the Set, otherwise false
      //


      _Set.prototype.has = function (item) {
        return hasOrAdd(item, false, this);
      }; //
      // Combines the logic for checking whether an item is a member of the set and
      // for adding a new item to the set.
      //
      // @param item       The item to check or add to the Set instance.
      // @param shouldAdd  If true, the item will be added to the set if it doesn't
      //                   already exist.
      // @param set        The set instance to check or add to.
      // @return {boolean} true if the item already existed, otherwise false.
      //


      return _Set;
    }();

    function hasOrAdd(item, shouldAdd, set) {
      var type = typeof item;
      var prevSize, newSize;

      switch (type) {
        case 'string':
        case 'number':
          // distinguish between +0 and -0
          if (item === 0 && 1 / item === -Infinity) {
            if (set._items['-0']) {
              return true;
            } else {
              if (shouldAdd) {
                set._items['-0'] = true;
              }

              return false;
            }
          } // these types can all utilise the native Set


          if (set._nativeSet !== null) {
            if (shouldAdd) {
              prevSize = set._nativeSet.size;

              set._nativeSet.add(item);

              newSize = set._nativeSet.size;
              return newSize === prevSize;
            } else {
              return set._nativeSet.has(item);
            }
          } else {
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = {};
                set._items[type][item] = true;
              }

              return false;
            } else if (item in set._items[type]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type][item] = true;
              }

              return false;
            }
          }

        case 'boolean':
          // set._items['boolean'] holds a two element array
          // representing [ falseExists, trueExists ]
          if (type in set._items) {
            var bIdx = item ? 1 : 0;

            if (set._items[type][bIdx]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type][bIdx] = true;
              }

              return false;
            }
          } else {
            if (shouldAdd) {
              set._items[type] = item ? [false, true] : [true, false];
            }

            return false;
          }

        case 'function':
          // compare functions for reference equality
          if (set._nativeSet !== null) {
            if (shouldAdd) {
              prevSize = set._nativeSet.size;

              set._nativeSet.add(item);

              newSize = set._nativeSet.size;
              return newSize === prevSize;
            } else {
              return set._nativeSet.has(item);
            }
          } else {
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = [item];
              }

              return false;
            }

            if (!_includes(item, set._items[type])) {
              if (shouldAdd) {
                set._items[type].push(item);
              }

              return false;
            }

            return true;
          }

        case 'undefined':
          if (set._items[type]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type] = true;
            }

            return false;
          }

        case 'object':
          if (item === null) {
            if (!set._items['null']) {
              if (shouldAdd) {
                set._items['null'] = true;
              }

              return false;
            }

            return true;
          }

        /* falls through */

        default:
          // reduce the search size of heterogeneous sets by creating buckets
          // for each type.
          type = Object.prototype.toString.call(item);

          if (!(type in set._items)) {
            if (shouldAdd) {
              set._items[type] = [item];
            }

            return false;
          } // scan through all previously applied items


          if (!_includes(item, set._items[type])) {
            if (shouldAdd) {
              set._items[type].push(item);
            }

            return false;
          }

          return true;
      }
    } // A simple Set type that honours R.equals semantics

    /**
     * Returns the empty value of its argument's type. Ramda defines the empty
     * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
     * types are supported if they define `<Type>.empty`,
     * `<Type>.prototype.empty` or implement the
     * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
     *
     * Dispatches to the `empty` method of the first argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category Function
     * @sig a -> a
     * @param {*} x
     * @return {*}
     * @example
     *
     *      R.empty(Just(42));      //=> Nothing()
     *      R.empty([1, 2, 3]);     //=> []
     *      R.empty('unicorns');    //=> ''
     *      R.empty({x: 1, y: 2});  //=> {}
     */

    var empty$1 =
    /*#__PURE__*/
    _curry1(function empty(x) {
      return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
        return arguments;
      }() : void 0 // else
      ;
    });

    /**
     * Returns a new list containing only one copy of each element in the original
     * list, based upon the value returned by applying the supplied function to
     * each list element. Prefers the first item if the supplied function produces
     * the same value on two items. [`R.equals`](#equals) is used for comparison.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig (a -> b) -> [a] -> [a]
     * @param {Function} fn A function used to produce a value to use during comparisons.
     * @param {Array} list The array to consider.
     * @return {Array} The list of unique items.
     * @example
     *
     *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
     */

    var uniqBy =
    /*#__PURE__*/
    _curry2(function uniqBy(fn, list) {
      var set = new _Set();
      var result = [];
      var idx = 0;
      var appliedItem, item;

      while (idx < list.length) {
        item = list[idx];
        appliedItem = fn(item);

        if (set.add(appliedItem)) {
          result.push(item);
        }

        idx += 1;
      }

      return result;
    });

    /**
     * Returns `true` if the given value is its type's empty value; `false`
     * otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Logic
     * @sig a -> Boolean
     * @param {*} x
     * @return {Boolean}
     * @see R.empty
     * @example
     *
     *      R.isEmpty([1, 2, 3]);   //=> false
     *      R.isEmpty([]);          //=> true
     *      R.isEmpty('');          //=> true
     *      R.isEmpty(null);        //=> false
     *      R.isEmpty({});          //=> true
     *      R.isEmpty({length: 0}); //=> false
     */

    var isEmpty =
    /*#__PURE__*/
    _curry1(function isEmpty(x) {
      return x != null && equals(x, empty$1(x));
    });

    const trimString = (s, l = 50) => s.length > l
        ? s.substring(0, l) + "..."
        : s;

    const JSONDownloadable = data => `data:
    'text/json;charset=utf-8,' 
    ${encodeURIComponent(JSON.stringify(data))}`;

    const Node = (url, title, dateCreated=Date.now()) => ({
        dateCreated,
        // marked: false,
        // blocked: false,
        title: title || "",
        url,
    });

    const UrlToDOM = async url =>
        fetch(url)
            .then(response => response.text())
            .then(html => {
                // Convert the HTML string into a document object
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                console.log("DOOOC", doc);
                return doc
            })
            .catch(function (err) {
                // There was an error
                console.log('URL FAIL: ', url, err);
            });

    /* src/Dashboard.svelte generated by Svelte v3.5.4 */

    const file = "src/Dashboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    // (38:8) {#each collection as row}
    function create_each_block(ctx) {
    	var tr, td0, button, t0_value = ctx.addAction ? "(+)": "X", t0, button_style_value, t1, td1, t2_value = trimString(ctx.row.title) || '/', t2, t3, td2, t4_value = new Date(ctx.row.dateCreated).toDateString(), t4, t5, td3, a, t6_value = trimString(ctx.row.url, 70), t6, a_href_value, t7, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			a = element("a");
    			t6 = text(t6_value);
    			t7 = space();
    			attr(button, "style", button_style_value = `background: ${ctx.addAction ? "green" : "red"}; color: white; font-weight: bold"`);
    			add_location(button, file, 40, 20, 805);
    			attr(td0, "class", "svelte-o60a6m");
    			add_location(td0, file, 39, 16, 780);
    			set_style(td1, "min-width", "15rem");
    			attr(td1, "class", "svelte-o60a6m");
    			add_location(td1, file, 52, 16, 1259);
    			attr(td2, "class", "svelte-o60a6m");
    			add_location(td2, file, 53, 16, 1340);
    			attr(a, "href", a_href_value = ctx.row.url);
    			add_location(a, file, 55, 20, 1433);
    			attr(td3, "class", "svelte-o60a6m");
    			add_location(td3, file, 54, 16, 1408);
    			add_location(tr, file, 38, 12, 759);
    			dispose = listen(button, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, button);
    			append(button, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);
    			append(tr, td3);
    			append(td3, a);
    			append(a, t6);
    			append(tr, t7);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.addAction) && t0_value !== (t0_value = ctx.addAction ? "(+)": "X")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.addAction) && button_style_value !== (button_style_value = `background: ${ctx.addAction ? "green" : "red"}; color: white; font-weight: bold"`)) {
    				attr(button, "style", button_style_value);
    			}

    			if ((changed.collection) && t2_value !== (t2_value = trimString(ctx.row.title) || '/')) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.collection) && t4_value !== (t4_value = new Date(ctx.row.dateCreated).toDateString())) {
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
    	var table, thead, tr, th0, t0_value = ctx.addAction ?  "Add": "Delete", t0, t1, t2, th1, t4, th2, t6, th3, t8, tbody;

    	var each_value = ctx.collection;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			t0 = text(t0_value);
    			t1 = text(" Entry");
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "title";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "date";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "url";
    			t8 = space();
    			tbody = element("tbody");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(th0, "class", "svelte-o60a6m");
    			add_location(th0, file, 28, 12, 492);
    			attr(th1, "class", "svelte-o60a6m");
    			add_location(th1, file, 30, 12, 551);
    			attr(th2, "class", "svelte-o60a6m");
    			add_location(th2, file, 31, 12, 578);
    			attr(th3, "class", "svelte-o60a6m");
    			add_location(th3, file, 32, 12, 604);
    			add_location(tr, file, 27, 8, 475);
    			add_location(thead, file, 26, 4, 459);
    			add_location(tbody, file, 36, 4, 705);
    			attr(table, "class", "svelte-o60a6m");
    			add_location(table, file, 25, 0, 447);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, table, anchor);
    			append(table, thead);
    			append(thead, tr);
    			append(tr, th0);
    			append(th0, t0);
    			append(th0, t1);
    			append(tr, t2);
    			append(tr, th1);
    			append(tr, t4);
    			append(tr, th2);
    			append(tr, t6);
    			append(tr, th3);
    			append(table, t8);
    			append(table, tbody);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if ((changed.addAction) && t0_value !== (t0_value = ctx.addAction ?  "Add": "Delete")) {
    				set_data(t0, t0_value);
    			}

    			if (changed.collection || changed.trimString || changed.addAction) {
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

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(table);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	

        let { collection, addAction } = $$props;
        const dispatch = createEventDispatcher();

    	const writable_props = ['collection', 'addAction'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ row }) {
    		return dispatch('message', {
    	                        url: row.url,
    	                        title: row.title,
    	                        dateCreated: row.dateCreated
    	                    });
    	}

    	$$self.$set = $$props => {
    		if ('collection' in $$props) $$invalidate('collection', collection = $$props.collection);
    		if ('addAction' in $$props) $$invalidate('addAction', addAction = $$props.addAction);
    	};

    	return {
    		collection,
    		addAction,
    		dispatch,
    		click_handler
    	};
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["collection", "addAction"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.collection === undefined && !('collection' in props)) {
    			console.warn("<Dashboard> was created without expected prop 'collection'");
    		}
    		if (ctx.addAction === undefined && !('addAction' in props)) {
    			console.warn("<Dashboard> was created without expected prop 'addAction'");
    		}
    	}

    	get collection() {
    		throw new Error("<Dashboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collection(value) {
    		throw new Error("<Dashboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addAction() {
    		throw new Error("<Dashboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addAction(value) {
    		throw new Error("<Dashboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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

    /* src/Popup.svelte generated by Svelte v3.5.4 */

    const file$1 = "src/Popup.svelte";

    // (147:31) 
    function create_if_block_2(ctx) {
    	var div, t1, button, t3, await_block_anchor, promise, current, dispose;

    	let info = {
    		ctx,
    		current: null,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 'his',
    		error: 'error',
    		blocks: Array(3)
    	};

    	handle_promise(promise = ctx.history, info);

    	return {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Bootstrap your STREAM";
    			t1 = space();
    			button = element("button");
    			button.textContent = "CHECK LAST WEEK's HISTORY";
    			t3 = space();
    			await_block_anchor = empty();

    			info.block.c();
    			add_location(div, file$1, 147, 1, 4355);
    			add_location(button, file$1, 148, 1, 4389);
    			dispose = listen(button, "click", ctx.click_handler_2);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			insert(target, t1, anchor);
    			insert(target, button, anchor);
    			insert(target, t3, anchor);
    			insert(target, await_block_anchor, anchor);

    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (('history' in changed) && promise !== (promise = ctx.history) && handle_promise(promise, info)) ; else {
    				info.block.p(changed, assign(assign({}, ctx), info.resolved));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    				detach(t1);
    				detach(button);
    				detach(t3);
    				detach(await_block_anchor);
    			}

    			info.block.d(detaching);
    			info = null;

    			dispose();
    		}
    	};
    }

    // (130:31) 
    function create_if_block_1(ctx) {
    	var input, t0, button, t2, br0, t3, br1, t4, await_block_anchor, promise, current, dispose;

    	let info = {
    		ctx,
    		current: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 'coll',
    		error: 'error',
    		blocks: Array(3)
    	};

    	handle_promise(promise = ctx.collection, info);

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
    			await_block_anchor = empty();

    			info.block.c();
    			set_style(input, "min-width", "20vw");
    			attr(input, "type", "text");
    			add_location(input, file$1, 130, 1, 3886);
    			add_location(button, file$1, 131, 1, 3960);
    			add_location(br0, file$1, 132, 1, 4013);
    			add_location(br1, file$1, 133, 1, 4021);

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
    			insert(target, await_block_anchor, anchor);

    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.deleteConfirm && (input.value !== ctx.deleteConfirm)) input.value = ctx.deleteConfirm;
    			info.ctx = ctx;

    			if (('collection' in changed) && promise !== (promise = ctx.collection) && handle_promise(promise, info)) ; else {
    				info.block.p(changed, assign(assign({}, ctx), info.resolved));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
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
    				detach(await_block_anchor);
    			}

    			info.block.d(detaching);
    			info = null;

    			run_all(dispose);
    		}
    	};
    }

    // (127:0) {#if isEmpty(hash)}
    function create_if_block(ctx) {
    	var button0, t_1, button1, dispose;

    	return {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "View Dashboard";
    			t_1 = space();
    			button1 = element("button");
    			button1.textContent = "Bootstrap your Stream";
    			add_location(button0, file$1, 127, 1, 3705);
    			add_location(button1, file$1, 128, 1, 3776);

    			dispose = [
    				listen(button0, "click", ctx.click_handler),
    				listen(button1, "click", ctx.click_handler_1)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, button0, anchor);
    			insert(target, t_1, anchor);
    			insert(target, button1, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button0);
    				detach(t_1);
    				detach(button1);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (161:1) {:catch error}
    function create_catch_block_1(ctx) {
    	var p, t_value = ctx.error.message, t;

    	return {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$1, 161, 2, 4667);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.history) && t_value !== (t_value = ctx.error.message)) {
    				set_data(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (158:1) {:then his}
    function create_then_block_1(ctx) {
    	var current;

    	var dashboard = new Dashboard({
    		props: {
    		collection: ctx.his,
    		addAction: true
    	},
    		$$inline: true
    	});
    	dashboard.$on("message", ctx.onAdd);

    	return {
    		c: function create() {
    			dashboard.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var dashboard_changes = {};
    			if (changed.history) dashboard_changes.collection = ctx.his;
    			dashboard.$set(dashboard_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(dashboard, detaching);
    		}
    	};
    }

    // (156:17)    <p>...history</p>  {:then his}
    function create_pending_block_1(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...history";
    			add_location(p, file$1, 156, 2, 4510);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (144:1) {:catch error}
    function create_catch_block(ctx) {
    	var p, t_value = ctx.error.message, t;

    	return {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$1, 144, 2, 4270);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.collection) && t_value !== (t_value = ctx.error.message)) {
    				set_data(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (138:1) {:then coll}
    function create_then_block(ctx) {
    	var current;

    	var dashboard = new Dashboard({
    		props: {
    		collection: ctx.coll.sort(func),
    		addAction: false
    	},
    		$$inline: true
    	});
    	dashboard.$on("message", ctx.onRemove);

    	return {
    		c: function create() {
    			dashboard.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var dashboard_changes = {};
    			if (changed.collection) dashboard_changes.collection = ctx.coll.sort(func);
    			dashboard.$set(dashboard_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(dashboard, detaching);
    		}
    	};
    }

    // (136:20)    <p>...waiting</p>  {:then coll}
    function create_pending_block(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...waiting";
    			add_location(p, file$1, 136, 2, 4052);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var a0, t0, t1, hr0, t2, a1, t4, hr1, t5, current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (isEmpty(ctx.hash)) return 0;
    		if (ctx.hash == '#dashboard') return 1;
    		if (ctx.hash == '#bootstrap') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

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
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(a0, "href", ctx.link);
    			attr(a0, "download", "data.json");
    			add_location(a0, file$1, 120, 0, 3523);
    			add_location(hr0, file$1, 121, 0, 3580);
    			attr(a1, "href", "mailto:strasser.ms@gmail.com?subject=streamdata!&body=Hi.");
    			add_location(a1, file$1, 122, 0, 3587);
    			add_location(hr1, file$1, 123, 0, 3675);
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
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.link) {
    				attr(a0, "href", ctx.link);
    			}

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

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

    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function func(a, b) {
    	return b.dateCreated - a.dateCreated;
    }

    function instance$1($$self, $$props, $$invalidate) {


    	//TODO: put Storage in a temp subscription and only run "updateStorage" inside the reducer action

    	const getStorage = async () => {
    		const storage = await chromePromise$1.storage.sync.get(null);

    		$$invalidate('collection', collection = Object.entries(storage)
    			.map(([url, node]) => assoc('url', url, node))
    			.map(({ url, title, dateCreated }) => ({
    				title: title || '',
    				dateCreated,
    				url,
    			}))
    			.filter(({ url }) => url != 'blacklist'));
    		$$invalidate('link', link = JSONDownloadable(collection));
    		return collection;
    	};

    	let collection = getStorage();

    	let link = '';
    	let deleteConfirm = "type: 'IRREVERSIBLE' to confirm";
    	let hash = window.location.hash;
    	let history = [];

    	fetch('https://dacapo.io/hacking-scientific-text')
    		.then(res => res)
    		.then(res => console.log('aaaasa', res));

    	const openTab = hash => {
    		/*https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
                #window lets popup know what's up
            */
    		chrome.tabs.create({ url: chrome.extension.getURL('popup.html#' + hash) });
    	};

    	const clearStorage = async () => {
    		if (deleteConfirm == 'IRREVERSIBLE') {
    			await chromePromise$1.storage.sync.clear();
    		} else {
    			alert("type in 'IRREVERSIBLE' into the input field");
    		}
    		getStorage();
    	};

    	const onRemove = async ({ detail }) => {
    		console.log(detail, 'detail');
    		await chromePromise$1.storage.sync.remove(detail.url);
    		getStorage();
    	};

    	const onAdd = async ({ detail }) => {
    		console.log(detail, "yo");
    		const {url, title, dateCreated} = detail;
    		await chromePromise$1.storage.sync.set({[url]: Node(url, title, dateCreated)});
    		getStorage();
    	};

    	getStorage();
    	// const removeItem = async itemID => {
    	// 	await chromep.storage.sync.remove(itemID);
    	// 	getStorage();
    	// };

    	//TODO:
    		//dedupe, normalize (no hashes), "no-homepage"
    	const asyncFilter = async (arr, predicate) =>
    		Promise.all(arr.map(predicate)).then(results => arr.filter((_v, index) => results[index]));

    	const getHistory = async (msSinceNow = 1000 * 60 * 60 * 24 * 30) => {
    		let historyItems = await chromePromise$1.history.search({
    			text: '', // Return every history item....
    			startTime: new Date().getTime() - msSinceNow,
    			maxResults: 50,
    			// that was accessed less than one week ago.
    		});
    		const blacklist = await chromePromise$1.storage.sync.get('blacklist');

    		//filter out historyItems that intersect with blacklist

    		historyItems = historyItems.filter(
    			item => !blacklist['blacklist'].some(term => item['url'].includes(term))
    		).map(
    			item => ({...item, url: normalizeUrl_1(item.url, {stripHash: true})})
    		);
    		historyItems = uniqBy(e => e.url, historyItems)
    		//no homepages, only if has path aka something.com
    		.filter(item=> (item.url.split("/").length - 1)>2); //superfancy

    		historyItems = await asyncFilter(historyItems, async item => {
    			let doc;
    			try {
    				doc = await UrlToDOM(item.url);
    				console.log(item.url, 'worked', doc);
    				return !!doc.querySelector('article');
    			} catch (err) {
    				console.log(err, 'error in DOM');
    				return false;
    			}
    		});

    		//cast lastVisitTime -> dateCreated
    		historyItems = historyItems.map(e => ({ ...e, dateCreated: e.lastVisitTime }));
    		//callback

    		console.log('history', historyItems, blacklist['blacklist']);

    		return historyItems;
    	};

    	function click_handler() {
    		return openTab('dashboard');
    	}

    	function click_handler_1() {
    		return openTab('bootstrap');
    	}

    	function input_input_handler() {
    		deleteConfirm = this.value;
    		$$invalidate('deleteConfirm', deleteConfirm);
    	}

    	function click_handler_2() {
    				history = getHistory(); $$invalidate('history', history);
    			}

    	return {
    		collection,
    		link,
    		deleteConfirm,
    		hash,
    		history,
    		openTab,
    		clearStorage,
    		onRemove,
    		onAdd,
    		getHistory,
    		click_handler,
    		click_handler_1,
    		input_input_handler,
    		click_handler_2
    	};
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
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
