
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
     * Returns the nth element of the given list or string. If n is negative the
     * element at index length + n is returned.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Number -> [a] -> a | Undefined
     * @sig Number -> String -> String
     * @param {Number} offset
     * @param {*} list
     * @return {*}
     * @example
     *
     *      const list = ['foo', 'bar', 'baz', 'quux'];
     *      R.nth(1, list); //=> 'bar'
     *      R.nth(-1, list); //=> 'quux'
     *      R.nth(-99, list); //=> undefined
     *
     *      R.nth(2, 'abc'); //=> 'c'
     *      R.nth(3, 'abc'); //=> ''
     * @symb R.nth(-1, [a, b, c]) = c
     * @symb R.nth(0, [a, b, c]) = a
     * @symb R.nth(1, [a, b, c]) = b
     */

    var nth =
    /*#__PURE__*/
    _curry2(function nth(offset, list) {
      var idx = offset < 0 ? list.length + offset : offset;
      return _isString(list) ? list.charAt(idx) : list[idx];
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

    /**
     * Returns the first element of the given list or string. In some libraries
     * this function is named `first`.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> a | Undefined
     * @sig String -> String
     * @param {Array|String} list
     * @return {*}
     * @see R.tail, R.init, R.last
     * @example
     *
     *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
     *      R.head([]); //=> undefined
     *
     *      R.head('abc'); //=> 'a'
     *      R.head(''); //=> ''
     */

    var head =
    /*#__PURE__*/
    nth(0);

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

    const interval = 3000;

    function instance($$self) {

            /* youDB = [{
                    url: "wadad",
                       
                    activeTime: 1000,
                    marked: true,
                    dateCreated: now()
                    dateUpdated: now()
                    --optional---
                    xpath: "#obj -- highlight or whatever"
                    doi: "adsad" 
            
                }, {.....} ]
            */


        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            
            if (request.action == "toggle-marked") {
                console.log("yeahh");
                update(0, true).
                    then(e=> {
                        console.log("fatjew");
                        sendResponse({ content: 'background to major tom' });
                    }).catch(e => console.log('error 111', e));
            }
            
            return true
    		// marked = true;
        });
        const getActiveTab = async () => {
            const idleState = await chromePromise$1.idle.queryState(20);
            if (idleState != "active") return

           const tabs = await chromePromise$1.tabs.query({
                        active: true,
                        lastFocusedWindow: true
                    });
            return head(tabs)
        };

        
        
        const update = async (interval, userAction=false) => {
            //TODO add temp property that get's cleaned after each session
                    //and youDB that stays
            
            const tab = await getActiveTab() || {};
            const {url, id} = tab;
            if (!url) return

            console.log("aaa");
            const dbKey="prose-log-entries";
            let entries = await chromePromise$1.storage.sync.get(dbKey); 
            entries = entries[dbKey] || [];

            // entries = upsertNode(entries, n => n["url"] == url, increaseActiveTime) 

            //! all this is mutative if node exists
            let node = entries.find(n => n["url"] == url) ||{
                url, 
                activeTime: 0, 
                dateCreated: Date.now(),

                marked: false,
                blocked: false,
            
            };
            node["activeTime"] += interval;

            if (userAction) {
                node["marked"] = !node["marked"];
                node["blocked"] = true;
            }
            if (node["activeTime"] > 6000 && !node["marked"] && !node["blocked"]) {
                node["marked"] = true;       
            }

            entries = uniqBy(
                    n => n["url"], 
                    entries.concat(node) //adds updated node instead of rewriting collection [a, b, c , a]
                );
            console.log(node, "node");

            let res;
            console.log(entries);
            try {
                res = await chromePromise$1.storage.sync.set({[dbKey]: entries});

            }
            catch (err) {
                    chrome.storage.sync.set({[dbKey]: entries}, e => console.log(entries, "entries set"));
                    console.log(err, "error in setting DB");
            }
            console.log(res, "updaete res");

            return res
        };
    setInterval(function () {
            update(interval);
            //moveNode(temp-key)
            //onChange-->messag

            console.log('runs update');
    },  interval);

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
