
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_node(node) {
        if (!node)
            return document;
        return (node.getRootNode ? node.getRootNode() : node.ownerDocument); // check for getRootNode because IE is still supported
    }
    function get_root_for_styles(node) {
        const root = get_root_for_node(node);
        return root.host ? root : root;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_styles(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_node(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
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
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
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
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.40.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    function commonjsRequire (target) {
    	throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
    }

    var moment = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
        module.exports = factory() ;
    }(commonjsGlobal, (function () {
        var hookCallback;

        function hooks() {
            return hookCallback.apply(null, arguments);
        }

        // This is done to register the method called with moment()
        // without creating circular dependencies.
        function setHookCallback(callback) {
            hookCallback = callback;
        }

        function isArray(input) {
            return (
                input instanceof Array ||
                Object.prototype.toString.call(input) === '[object Array]'
            );
        }

        function isObject(input) {
            // IE8 will treat undefined and null as object if it wasn't for
            // input != null
            return (
                input != null &&
                Object.prototype.toString.call(input) === '[object Object]'
            );
        }

        function hasOwnProp(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b);
        }

        function isObjectEmpty(obj) {
            if (Object.getOwnPropertyNames) {
                return Object.getOwnPropertyNames(obj).length === 0;
            } else {
                var k;
                for (k in obj) {
                    if (hasOwnProp(obj, k)) {
                        return false;
                    }
                }
                return true;
            }
        }

        function isUndefined(input) {
            return input === void 0;
        }

        function isNumber(input) {
            return (
                typeof input === 'number' ||
                Object.prototype.toString.call(input) === '[object Number]'
            );
        }

        function isDate(input) {
            return (
                input instanceof Date ||
                Object.prototype.toString.call(input) === '[object Date]'
            );
        }

        function map(arr, fn) {
            var res = [],
                i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function createUTC(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, true).utc();
        }

        function defaultParsingFlags() {
            // We need to deep clone this object.
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidEra: null,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false,
                parsedDateParts: [],
                era: null,
                meridiem: null,
                rfc2822: false,
                weekdayMismatch: false,
            };
        }

        function getParsingFlags(m) {
            if (m._pf == null) {
                m._pf = defaultParsingFlags();
            }
            return m._pf;
        }

        var some;
        if (Array.prototype.some) {
            some = Array.prototype.some;
        } else {
            some = function (fun) {
                var t = Object(this),
                    len = t.length >>> 0,
                    i;

                for (i = 0; i < len; i++) {
                    if (i in t && fun.call(this, t[i], i, t)) {
                        return true;
                    }
                }

                return false;
            };
        }

        function isValid(m) {
            if (m._isValid == null) {
                var flags = getParsingFlags(m),
                    parsedParts = some.call(flags.parsedDateParts, function (i) {
                        return i != null;
                    }),
                    isNowValid =
                        !isNaN(m._d.getTime()) &&
                        flags.overflow < 0 &&
                        !flags.empty &&
                        !flags.invalidEra &&
                        !flags.invalidMonth &&
                        !flags.invalidWeekday &&
                        !flags.weekdayMismatch &&
                        !flags.nullInput &&
                        !flags.invalidFormat &&
                        !flags.userInvalidated &&
                        (!flags.meridiem || (flags.meridiem && parsedParts));

                if (m._strict) {
                    isNowValid =
                        isNowValid &&
                        flags.charsLeftOver === 0 &&
                        flags.unusedTokens.length === 0 &&
                        flags.bigHour === undefined;
                }

                if (Object.isFrozen == null || !Object.isFrozen(m)) {
                    m._isValid = isNowValid;
                } else {
                    return isNowValid;
                }
            }
            return m._isValid;
        }

        function createInvalid(flags) {
            var m = createUTC(NaN);
            if (flags != null) {
                extend(getParsingFlags(m), flags);
            } else {
                getParsingFlags(m).userInvalidated = true;
            }

            return m;
        }

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        var momentProperties = (hooks.momentProperties = []),
            updateInProgress = false;

        function copyConfig(to, from) {
            var i, prop, val;

            if (!isUndefined(from._isAMomentObject)) {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (!isUndefined(from._i)) {
                to._i = from._i;
            }
            if (!isUndefined(from._f)) {
                to._f = from._f;
            }
            if (!isUndefined(from._l)) {
                to._l = from._l;
            }
            if (!isUndefined(from._strict)) {
                to._strict = from._strict;
            }
            if (!isUndefined(from._tzm)) {
                to._tzm = from._tzm;
            }
            if (!isUndefined(from._isUTC)) {
                to._isUTC = from._isUTC;
            }
            if (!isUndefined(from._offset)) {
                to._offset = from._offset;
            }
            if (!isUndefined(from._pf)) {
                to._pf = getParsingFlags(from);
            }
            if (!isUndefined(from._locale)) {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i = 0; i < momentProperties.length; i++) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (!isUndefined(val)) {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        // Moment prototype object
        function Moment(config) {
            copyConfig(this, config);
            this._d = new Date(config._d != null ? config._d.getTime() : NaN);
            if (!this.isValid()) {
                this._d = new Date(NaN);
            }
            // Prevent infinite loop in case updateOffset creates new moment
            // objects.
            if (updateInProgress === false) {
                updateInProgress = true;
                hooks.updateOffset(this);
                updateInProgress = false;
            }
        }

        function isMoment(obj) {
            return (
                obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
            );
        }

        function warn(msg) {
            if (
                hooks.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' &&
                console.warn
            ) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;

            return extend(function () {
                if (hooks.deprecationHandler != null) {
                    hooks.deprecationHandler(null, msg);
                }
                if (firstTime) {
                    var args = [],
                        arg,
                        i,
                        key;
                    for (i = 0; i < arguments.length; i++) {
                        arg = '';
                        if (typeof arguments[i] === 'object') {
                            arg += '\n[' + i + '] ';
                            for (key in arguments[0]) {
                                if (hasOwnProp(arguments[0], key)) {
                                    arg += key + ': ' + arguments[0][key] + ', ';
                                }
                            }
                            arg = arg.slice(0, -2); // Remove trailing comma and space
                        } else {
                            arg = arguments[i];
                        }
                        args.push(arg);
                    }
                    warn(
                        msg +
                            '\nArguments: ' +
                            Array.prototype.slice.call(args).join('') +
                            '\n' +
                            new Error().stack
                    );
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        var deprecations = {};

        function deprecateSimple(name, msg) {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(name, msg);
            }
            if (!deprecations[name]) {
                warn(msg);
                deprecations[name] = true;
            }
        }

        hooks.suppressDeprecationWarnings = false;
        hooks.deprecationHandler = null;

        function isFunction(input) {
            return (
                (typeof Function !== 'undefined' && input instanceof Function) ||
                Object.prototype.toString.call(input) === '[object Function]'
            );
        }

        function set(config) {
            var prop, i;
            for (i in config) {
                if (hasOwnProp(config, i)) {
                    prop = config[i];
                    if (isFunction(prop)) {
                        this[i] = prop;
                    } else {
                        this['_' + i] = prop;
                    }
                }
            }
            this._config = config;
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
            // TODO: Remove "ordinalParse" fallback in next major release.
            this._dayOfMonthOrdinalParseLenient = new RegExp(
                (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                    '|' +
                    /\d{1,2}/.source
            );
        }

        function mergeConfigs(parentConfig, childConfig) {
            var res = extend({}, parentConfig),
                prop;
            for (prop in childConfig) {
                if (hasOwnProp(childConfig, prop)) {
                    if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                        res[prop] = {};
                        extend(res[prop], parentConfig[prop]);
                        extend(res[prop], childConfig[prop]);
                    } else if (childConfig[prop] != null) {
                        res[prop] = childConfig[prop];
                    } else {
                        delete res[prop];
                    }
                }
            }
            for (prop in parentConfig) {
                if (
                    hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])
                ) {
                    // make sure changes to properties don't modify parent config
                    res[prop] = extend({}, res[prop]);
                }
            }
            return res;
        }

        function Locale(config) {
            if (config != null) {
                this.set(config);
            }
        }

        var keys;

        if (Object.keys) {
            keys = Object.keys;
        } else {
            keys = function (obj) {
                var i,
                    res = [];
                for (i in obj) {
                    if (hasOwnProp(obj, i)) {
                        res.push(i);
                    }
                }
                return res;
            };
        }

        var defaultCalendar = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L',
        };

        function calendar(key, mom, now) {
            var output = this._calendar[key] || this._calendar['sameElse'];
            return isFunction(output) ? output.call(mom, now) : output;
        }

        function zeroFill(number, targetLength, forceSign) {
            var absNumber = '' + Math.abs(number),
                zerosToFill = targetLength - absNumber.length,
                sign = number >= 0;
            return (
                (sign ? (forceSign ? '+' : '') : '-') +
                Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
                absNumber
            );
        }

        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
            localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
            formatFunctions = {},
            formatTokenFunctions = {};

        // token:    'M'
        // padded:   ['MM', 2]
        // ordinal:  'Mo'
        // callback: function () { this.month() + 1 }
        function addFormatToken(token, padded, ordinal, callback) {
            var func = callback;
            if (typeof callback === 'string') {
                func = function () {
                    return this[callback]();
                };
            }
            if (token) {
                formatTokenFunctions[token] = func;
            }
            if (padded) {
                formatTokenFunctions[padded[0]] = function () {
                    return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                };
            }
            if (ordinal) {
                formatTokenFunctions[ordinal] = function () {
                    return this.localeData().ordinal(
                        func.apply(this, arguments),
                        token
                    );
                };
            }
        }

        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens),
                i,
                length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '',
                    i;
                for (i = 0; i < length; i++) {
                    output += isFunction(array[i])
                        ? array[i].call(mom, format)
                        : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());
            formatFunctions[format] =
                formatFunctions[format] || makeFormatFunction(format);

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(
                    localFormattingTokens,
                    replaceLongDateFormatTokens
                );
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }

        var defaultLongDateFormat = {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A',
        };

        function longDateFormat(key) {
            var format = this._longDateFormat[key],
                formatUpper = this._longDateFormat[key.toUpperCase()];

            if (format || !formatUpper) {
                return format;
            }

            this._longDateFormat[key] = formatUpper
                .match(formattingTokens)
                .map(function (tok) {
                    if (
                        tok === 'MMMM' ||
                        tok === 'MM' ||
                        tok === 'DD' ||
                        tok === 'dddd'
                    ) {
                        return tok.slice(1);
                    }
                    return tok;
                })
                .join('');

            return this._longDateFormat[key];
        }

        var defaultInvalidDate = 'Invalid date';

        function invalidDate() {
            return this._invalidDate;
        }

        var defaultOrdinal = '%d',
            defaultDayOfMonthOrdinalParse = /\d{1,2}/;

        function ordinal(number) {
            return this._ordinal.replace('%d', number);
        }

        var defaultRelativeTime = {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            ss: '%d seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            w: 'a week',
            ww: '%d weeks',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years',
        };

        function relativeTime(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return isFunction(output)
                ? output(number, withoutSuffix, string, isFuture)
                : output.replace(/%d/i, number);
        }

        function pastFuture(diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return isFunction(format) ? format(output) : format.replace(/%s/i, output);
        }

        var aliases = {};

        function addUnitAlias(unit, shorthand) {
            var lowerCase = unit.toLowerCase();
            aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
        }

        function normalizeUnits(units) {
            return typeof units === 'string'
                ? aliases[units] || aliases[units.toLowerCase()]
                : undefined;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        var priorities = {};

        function addUnitPriority(unit, priority) {
            priorities[unit] = priority;
        }

        function getPrioritizedUnits(unitsObj) {
            var units = [],
                u;
            for (u in unitsObj) {
                if (hasOwnProp(unitsObj, u)) {
                    units.push({ unit: u, priority: priorities[u] });
                }
            }
            units.sort(function (a, b) {
                return a.priority - b.priority;
            });
            return units;
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        function absFloor(number) {
            if (number < 0) {
                // -0 -> 0
                return Math.ceil(number) || 0;
            } else {
                return Math.floor(number);
            }
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                value = absFloor(coercedNumber);
            }

            return value;
        }

        function makeGetSet(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    set$1(this, unit, value);
                    hooks.updateOffset(this, keepTime);
                    return this;
                } else {
                    return get(this, unit);
                }
            };
        }

        function get(mom, unit) {
            return mom.isValid()
                ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
                : NaN;
        }

        function set$1(mom, unit, value) {
            if (mom.isValid() && !isNaN(value)) {
                if (
                    unit === 'FullYear' &&
                    isLeapYear(mom.year()) &&
                    mom.month() === 1 &&
                    mom.date() === 29
                ) {
                    value = toInt(value);
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                        value,
                        mom.month(),
                        daysInMonth(value, mom.month())
                    );
                } else {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
                }
            }
        }

        // MOMENTS

        function stringGet(units) {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units]();
            }
            return this;
        }

        function stringSet(units, value) {
            if (typeof units === 'object') {
                units = normalizeObjectUnits(units);
                var prioritized = getPrioritizedUnits(units),
                    i;
                for (i = 0; i < prioritized.length; i++) {
                    this[prioritized[i].unit](units[prioritized[i].unit]);
                }
            } else {
                units = normalizeUnits(units);
                if (isFunction(this[units])) {
                    return this[units](value);
                }
            }
            return this;
        }

        var match1 = /\d/, //       0 - 9
            match2 = /\d\d/, //      00 - 99
            match3 = /\d{3}/, //     000 - 999
            match4 = /\d{4}/, //    0000 - 9999
            match6 = /[+-]?\d{6}/, // -999999 - 999999
            match1to2 = /\d\d?/, //       0 - 99
            match3to4 = /\d\d\d\d?/, //     999 - 9999
            match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
            match1to3 = /\d{1,3}/, //       0 - 999
            match1to4 = /\d{1,4}/, //       0 - 9999
            match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
            matchUnsigned = /\d+/, //       0 - inf
            matchSigned = /[+-]?\d+/, //    -inf - inf
            matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
            matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
            matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
            // any word (or two) characters or numbers including two/three word month in arabic.
            // includes scottish gaelic two word and hyphenated months
            matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
            regexes;

        regexes = {};

        function addRegexToken(token, regex, strictRegex) {
            regexes[token] = isFunction(regex)
                ? regex
                : function (isStrict, localeData) {
                      return isStrict && strictRegex ? strictRegex : regex;
                  };
        }

        function getParseRegexForToken(token, config) {
            if (!hasOwnProp(regexes, token)) {
                return new RegExp(unescapeFormat(token));
            }

            return regexes[token](config._strict, config._locale);
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function unescapeFormat(s) {
            return regexEscape(
                s
                    .replace('\\', '')
                    .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                        matched,
                        p1,
                        p2,
                        p3,
                        p4
                    ) {
                        return p1 || p2 || p3 || p4;
                    })
            );
        }

        function regexEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var tokens = {};

        function addParseToken(token, callback) {
            var i,
                func = callback;
            if (typeof token === 'string') {
                token = [token];
            }
            if (isNumber(callback)) {
                func = function (input, array) {
                    array[callback] = toInt(input);
                };
            }
            for (i = 0; i < token.length; i++) {
                tokens[token[i]] = func;
            }
        }

        function addWeekParseToken(token, callback) {
            addParseToken(token, function (input, array, config, token) {
                config._w = config._w || {};
                callback(input, config._w, config, token);
            });
        }

        function addTimeToArrayFromToken(token, input, config) {
            if (input != null && hasOwnProp(tokens, token)) {
                tokens[token](input, config._a, config, token);
            }
        }

        var YEAR = 0,
            MONTH = 1,
            DATE = 2,
            HOUR = 3,
            MINUTE = 4,
            SECOND = 5,
            MILLISECOND = 6,
            WEEK = 7,
            WEEKDAY = 8;

        function mod(n, x) {
            return ((n % x) + x) % x;
        }

        var indexOf;

        if (Array.prototype.indexOf) {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (o) {
                // I know
                var i;
                for (i = 0; i < this.length; ++i) {
                    if (this[i] === o) {
                        return i;
                    }
                }
                return -1;
            };
        }

        function daysInMonth(year, month) {
            if (isNaN(year) || isNaN(month)) {
                return NaN;
            }
            var modMonth = mod(month, 12);
            year += (month - modMonth) / 12;
            return modMonth === 1
                ? isLeapYear(year)
                    ? 29
                    : 28
                : 31 - ((modMonth % 7) % 2);
        }

        // FORMATTING

        addFormatToken('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        });

        addFormatToken('MMM', 0, 0, function (format) {
            return this.localeData().monthsShort(this, format);
        });

        addFormatToken('MMMM', 0, 0, function (format) {
            return this.localeData().months(this, format);
        });

        // ALIASES

        addUnitAlias('month', 'M');

        // PRIORITY

        addUnitPriority('month', 8);

        // PARSING

        addRegexToken('M', match1to2);
        addRegexToken('MM', match1to2, match2);
        addRegexToken('MMM', function (isStrict, locale) {
            return locale.monthsShortRegex(isStrict);
        });
        addRegexToken('MMMM', function (isStrict, locale) {
            return locale.monthsRegex(isStrict);
        });

        addParseToken(['M', 'MM'], function (input, array) {
            array[MONTH] = toInt(input) - 1;
        });

        addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
            var month = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (month != null) {
                array[MONTH] = month;
            } else {
                getParsingFlags(config).invalidMonth = input;
            }
        });

        // LOCALES

        var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
                '_'
            ),
            MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
            defaultMonthsShortRegex = matchWord,
            defaultMonthsRegex = matchWord;

        function localeMonths(m, format) {
            if (!m) {
                return isArray(this._months)
                    ? this._months
                    : this._months['standalone'];
            }
            return isArray(this._months)
                ? this._months[m.month()]
                : this._months[
                      (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                          ? 'format'
                          : 'standalone'
                  ][m.month()];
        }

        function localeMonthsShort(m, format) {
            if (!m) {
                return isArray(this._monthsShort)
                    ? this._monthsShort
                    : this._monthsShort['standalone'];
            }
            return isArray(this._monthsShort)
                ? this._monthsShort[m.month()]
                : this._monthsShort[
                      MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
                  ][m.month()];
        }

        function handleStrictParse(monthName, format, strict) {
            var i,
                ii,
                mom,
                llc = monthName.toLocaleLowerCase();
            if (!this._monthsParse) {
                // this is not used
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
                for (i = 0; i < 12; ++i) {
                    mom = createUTC([2000, i]);
                    this._shortMonthsParse[i] = this.monthsShort(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeMonthsParse(monthName, format, strict) {
            var i, mom, regex;

            if (this._monthsParseExact) {
                return handleStrictParse.call(this, monthName, format, strict);
            }

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            // TODO: add sorting
            // Sorting makes sure if one month (or abbr) is a prefix of another
            // see sorting in computeMonthsParse
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp(
                        '^' + this.months(mom, '').replace('.', '') + '$',
                        'i'
                    );
                    this._shortMonthsParse[i] = new RegExp(
                        '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                        'i'
                    );
                }
                if (!strict && !this._monthsParse[i]) {
                    regex =
                        '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (
                    strict &&
                    format === 'MMMM' &&
                    this._longMonthsParse[i].test(monthName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'MMM' &&
                    this._shortMonthsParse[i].test(monthName)
                ) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function setMonth(mom, value) {
            var dayOfMonth;

            if (!mom.isValid()) {
                // No op
                return mom;
            }

            if (typeof value === 'string') {
                if (/^\d+$/.test(value)) {
                    value = toInt(value);
                } else {
                    value = mom.localeData().monthsParse(value);
                    // TODO: Another silent failure?
                    if (!isNumber(value)) {
                        return mom;
                    }
                }
            }

            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function getSetMonth(value) {
            if (value != null) {
                setMonth(this, value);
                hooks.updateOffset(this, true);
                return this;
            } else {
                return get(this, 'Month');
            }
        }

        function getDaysInMonth() {
            return daysInMonth(this.year(), this.month());
        }

        function monthsShortRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsShortStrictRegex;
                } else {
                    return this._monthsShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsShortRegex')) {
                    this._monthsShortRegex = defaultMonthsShortRegex;
                }
                return this._monthsShortStrictRegex && isStrict
                    ? this._monthsShortStrictRegex
                    : this._monthsShortRegex;
            }
        }

        function monthsRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsStrictRegex;
                } else {
                    return this._monthsRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    this._monthsRegex = defaultMonthsRegex;
                }
                return this._monthsStrictRegex && isStrict
                    ? this._monthsStrictRegex
                    : this._monthsRegex;
            }
        }

        function computeMonthsParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var shortPieces = [],
                longPieces = [],
                mixedPieces = [],
                i,
                mom;
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                shortPieces.push(this.monthsShort(mom, ''));
                longPieces.push(this.months(mom, ''));
                mixedPieces.push(this.months(mom, ''));
                mixedPieces.push(this.monthsShort(mom, ''));
            }
            // Sorting makes sure if one month (or abbr) is a prefix of another it
            // will match the longer piece.
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 12; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
            }
            for (i = 0; i < 24; i++) {
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._monthsShortRegex = this._monthsRegex;
            this._monthsStrictRegex = new RegExp(
                '^(' + longPieces.join('|') + ')',
                'i'
            );
            this._monthsShortStrictRegex = new RegExp(
                '^(' + shortPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        addFormatToken('Y', 0, 0, function () {
            var y = this.year();
            return y <= 9999 ? zeroFill(y, 4) : '+' + y;
        });

        addFormatToken(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        });

        addFormatToken(0, ['YYYY', 4], 0, 'year');
        addFormatToken(0, ['YYYYY', 5], 0, 'year');
        addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

        // ALIASES

        addUnitAlias('year', 'y');

        // PRIORITIES

        addUnitPriority('year', 1);

        // PARSING

        addRegexToken('Y', matchSigned);
        addRegexToken('YY', match1to2, match2);
        addRegexToken('YYYY', match1to4, match4);
        addRegexToken('YYYYY', match1to6, match6);
        addRegexToken('YYYYYY', match1to6, match6);

        addParseToken(['YYYYY', 'YYYYYY'], YEAR);
        addParseToken('YYYY', function (input, array) {
            array[YEAR] =
                input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
        });
        addParseToken('YY', function (input, array) {
            array[YEAR] = hooks.parseTwoDigitYear(input);
        });
        addParseToken('Y', function (input, array) {
            array[YEAR] = parseInt(input, 10);
        });

        // HELPERS

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        // HOOKS

        hooks.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        // MOMENTS

        var getSetYear = makeGetSet('FullYear', true);

        function getIsLeapYear() {
            return isLeapYear(this.year());
        }

        function createDate(y, m, d, h, M, s, ms) {
            // can't just apply() to create a date:
            // https://stackoverflow.com/q/181348
            var date;
            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                date = new Date(y + 400, m, d, h, M, s, ms);
                if (isFinite(date.getFullYear())) {
                    date.setFullYear(y);
                }
            } else {
                date = new Date(y, m, d, h, M, s, ms);
            }

            return date;
        }

        function createUTCDate(y) {
            var date, args;
            // the Date.UTC function remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                args = Array.prototype.slice.call(arguments);
                // preserve leap years using a full 400 year cycle, then reset
                args[0] = y + 400;
                date = new Date(Date.UTC.apply(null, args));
                if (isFinite(date.getUTCFullYear())) {
                    date.setUTCFullYear(y);
                }
            } else {
                date = new Date(Date.UTC.apply(null, arguments));
            }

            return date;
        }

        // start-of-first-week - start-of-year
        function firstWeekOffset(year, dow, doy) {
            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
                fwd = 7 + dow - doy,
                // first-week day local weekday -- which local weekday is fwd
                fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

            return -fwdlw + fwd - 1;
        }

        // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
            var localWeekday = (7 + weekday - dow) % 7,
                weekOffset = firstWeekOffset(year, dow, doy),
                dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
                resYear,
                resDayOfYear;

            if (dayOfYear <= 0) {
                resYear = year - 1;
                resDayOfYear = daysInYear(resYear) + dayOfYear;
            } else if (dayOfYear > daysInYear(year)) {
                resYear = year + 1;
                resDayOfYear = dayOfYear - daysInYear(year);
            } else {
                resYear = year;
                resDayOfYear = dayOfYear;
            }

            return {
                year: resYear,
                dayOfYear: resDayOfYear,
            };
        }

        function weekOfYear(mom, dow, doy) {
            var weekOffset = firstWeekOffset(mom.year(), dow, doy),
                week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
                resWeek,
                resYear;

            if (week < 1) {
                resYear = mom.year() - 1;
                resWeek = week + weeksInYear(resYear, dow, doy);
            } else if (week > weeksInYear(mom.year(), dow, doy)) {
                resWeek = week - weeksInYear(mom.year(), dow, doy);
                resYear = mom.year() + 1;
            } else {
                resYear = mom.year();
                resWeek = week;
            }

            return {
                week: resWeek,
                year: resYear,
            };
        }

        function weeksInYear(year, dow, doy) {
            var weekOffset = firstWeekOffset(year, dow, doy),
                weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
            return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
        }

        // FORMATTING

        addFormatToken('w', ['ww', 2], 'wo', 'week');
        addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

        // ALIASES

        addUnitAlias('week', 'w');
        addUnitAlias('isoWeek', 'W');

        // PRIORITIES

        addUnitPriority('week', 5);
        addUnitPriority('isoWeek', 5);

        // PARSING

        addRegexToken('w', match1to2);
        addRegexToken('ww', match1to2, match2);
        addRegexToken('W', match1to2);
        addRegexToken('WW', match1to2, match2);

        addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
            input,
            week,
            config,
            token
        ) {
            week[token.substr(0, 1)] = toInt(input);
        });

        // HELPERS

        // LOCALES

        function localeWeek(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        }

        var defaultLocaleWeek = {
            dow: 0, // Sunday is the first day of the week.
            doy: 6, // The week that contains Jan 6th is the first week of the year.
        };

        function localeFirstDayOfWeek() {
            return this._week.dow;
        }

        function localeFirstDayOfYear() {
            return this._week.doy;
        }

        // MOMENTS

        function getSetWeek(input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        function getSetISOWeek(input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        // FORMATTING

        addFormatToken('d', 0, 'do', 'day');

        addFormatToken('dd', 0, 0, function (format) {
            return this.localeData().weekdaysMin(this, format);
        });

        addFormatToken('ddd', 0, 0, function (format) {
            return this.localeData().weekdaysShort(this, format);
        });

        addFormatToken('dddd', 0, 0, function (format) {
            return this.localeData().weekdays(this, format);
        });

        addFormatToken('e', 0, 0, 'weekday');
        addFormatToken('E', 0, 0, 'isoWeekday');

        // ALIASES

        addUnitAlias('day', 'd');
        addUnitAlias('weekday', 'e');
        addUnitAlias('isoWeekday', 'E');

        // PRIORITY
        addUnitPriority('day', 11);
        addUnitPriority('weekday', 11);
        addUnitPriority('isoWeekday', 11);

        // PARSING

        addRegexToken('d', match1to2);
        addRegexToken('e', match1to2);
        addRegexToken('E', match1to2);
        addRegexToken('dd', function (isStrict, locale) {
            return locale.weekdaysMinRegex(isStrict);
        });
        addRegexToken('ddd', function (isStrict, locale) {
            return locale.weekdaysShortRegex(isStrict);
        });
        addRegexToken('dddd', function (isStrict, locale) {
            return locale.weekdaysRegex(isStrict);
        });

        addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
            var weekday = config._locale.weekdaysParse(input, token, config._strict);
            // if we didn't get a weekday name, mark the date as invalid
            if (weekday != null) {
                week.d = weekday;
            } else {
                getParsingFlags(config).invalidWeekday = input;
            }
        });

        addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
            week[token] = toInt(input);
        });

        // HELPERS

        function parseWeekday(input, locale) {
            if (typeof input !== 'string') {
                return input;
            }

            if (!isNaN(input)) {
                return parseInt(input, 10);
            }

            input = locale.weekdaysParse(input);
            if (typeof input === 'number') {
                return input;
            }

            return null;
        }

        function parseIsoWeekday(input, locale) {
            if (typeof input === 'string') {
                return locale.weekdaysParse(input) % 7 || 7;
            }
            return isNaN(input) ? null : input;
        }

        // LOCALES
        function shiftWeekdays(ws, n) {
            return ws.slice(n, 7).concat(ws.slice(0, n));
        }

        var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                '_'
            ),
            defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            defaultWeekdaysRegex = matchWord,
            defaultWeekdaysShortRegex = matchWord,
            defaultWeekdaysMinRegex = matchWord;

        function localeWeekdays(m, format) {
            var weekdays = isArray(this._weekdays)
                ? this._weekdays
                : this._weekdays[
                      m && m !== true && this._weekdays.isFormat.test(format)
                          ? 'format'
                          : 'standalone'
                  ];
            return m === true
                ? shiftWeekdays(weekdays, this._week.dow)
                : m
                ? weekdays[m.day()]
                : weekdays;
        }

        function localeWeekdaysShort(m) {
            return m === true
                ? shiftWeekdays(this._weekdaysShort, this._week.dow)
                : m
                ? this._weekdaysShort[m.day()]
                : this._weekdaysShort;
        }

        function localeWeekdaysMin(m) {
            return m === true
                ? shiftWeekdays(this._weekdaysMin, this._week.dow)
                : m
                ? this._weekdaysMin[m.day()]
                : this._weekdaysMin;
        }

        function handleStrictParse$1(weekdayName, format, strict) {
            var i,
                ii,
                mom,
                llc = weekdayName.toLocaleLowerCase();
            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._minWeekdaysParse = [];

                for (i = 0; i < 7; ++i) {
                    mom = createUTC([2000, 1]).day(i);
                    this._minWeekdaysParse[i] = this.weekdaysMin(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._shortWeekdaysParse[i] = this.weekdaysShort(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeWeekdaysParse(weekdayName, format, strict) {
            var i, mom, regex;

            if (this._weekdaysParseExact) {
                return handleStrictParse$1.call(this, weekdayName, format, strict);
            }

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._minWeekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._fullWeekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already

                mom = createUTC([2000, 1]).day(i);
                if (strict && !this._fullWeekdaysParse[i]) {
                    this._fullWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                    this._shortWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                    this._minWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                }
                if (!this._weekdaysParse[i]) {
                    regex =
                        '^' +
                        this.weekdays(mom, '') +
                        '|^' +
                        this.weekdaysShort(mom, '') +
                        '|^' +
                        this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (
                    strict &&
                    format === 'dddd' &&
                    this._fullWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'ddd' &&
                    this._shortWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'dd' &&
                    this._minWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function getSetDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        }

        function getSetLocaleDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        }

        function getSetISODayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }

            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.

            if (input != null) {
                var weekday = parseIsoWeekday(input, this.localeData());
                return this.day(this.day() % 7 ? weekday : weekday - 7);
            } else {
                return this.day() || 7;
            }
        }

        function weekdaysRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysStrictRegex;
                } else {
                    return this._weekdaysRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    this._weekdaysRegex = defaultWeekdaysRegex;
                }
                return this._weekdaysStrictRegex && isStrict
                    ? this._weekdaysStrictRegex
                    : this._weekdaysRegex;
            }
        }

        function weekdaysShortRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysShortStrictRegex;
                } else {
                    return this._weekdaysShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                    this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                }
                return this._weekdaysShortStrictRegex && isStrict
                    ? this._weekdaysShortStrictRegex
                    : this._weekdaysShortRegex;
            }
        }

        function weekdaysMinRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysMinStrictRegex;
                } else {
                    return this._weekdaysMinRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                    this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                }
                return this._weekdaysMinStrictRegex && isStrict
                    ? this._weekdaysMinStrictRegex
                    : this._weekdaysMinRegex;
            }
        }

        function computeWeekdaysParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var minPieces = [],
                shortPieces = [],
                longPieces = [],
                mixedPieces = [],
                i,
                mom,
                minp,
                shortp,
                longp;
            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, 1]).day(i);
                minp = regexEscape(this.weekdaysMin(mom, ''));
                shortp = regexEscape(this.weekdaysShort(mom, ''));
                longp = regexEscape(this.weekdays(mom, ''));
                minPieces.push(minp);
                shortPieces.push(shortp);
                longPieces.push(longp);
                mixedPieces.push(minp);
                mixedPieces.push(shortp);
                mixedPieces.push(longp);
            }
            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
            // will match the longer piece.
            minPieces.sort(cmpLenRev);
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);

            this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._weekdaysShortRegex = this._weekdaysRegex;
            this._weekdaysMinRegex = this._weekdaysRegex;

            this._weekdaysStrictRegex = new RegExp(
                '^(' + longPieces.join('|') + ')',
                'i'
            );
            this._weekdaysShortStrictRegex = new RegExp(
                '^(' + shortPieces.join('|') + ')',
                'i'
            );
            this._weekdaysMinStrictRegex = new RegExp(
                '^(' + minPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        function hFormat() {
            return this.hours() % 12 || 12;
        }

        function kFormat() {
            return this.hours() || 24;
        }

        addFormatToken('H', ['HH', 2], 0, 'hour');
        addFormatToken('h', ['hh', 2], 0, hFormat);
        addFormatToken('k', ['kk', 2], 0, kFormat);

        addFormatToken('hmm', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
        });

        addFormatToken('hmmss', 0, 0, function () {
            return (
                '' +
                hFormat.apply(this) +
                zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2)
            );
        });

        addFormatToken('Hmm', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2);
        });

        addFormatToken('Hmmss', 0, 0, function () {
            return (
                '' +
                this.hours() +
                zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2)
            );
        });

        function meridiem(token, lowercase) {
            addFormatToken(token, 0, 0, function () {
                return this.localeData().meridiem(
                    this.hours(),
                    this.minutes(),
                    lowercase
                );
            });
        }

        meridiem('a', true);
        meridiem('A', false);

        // ALIASES

        addUnitAlias('hour', 'h');

        // PRIORITY
        addUnitPriority('hour', 13);

        // PARSING

        function matchMeridiem(isStrict, locale) {
            return locale._meridiemParse;
        }

        addRegexToken('a', matchMeridiem);
        addRegexToken('A', matchMeridiem);
        addRegexToken('H', match1to2);
        addRegexToken('h', match1to2);
        addRegexToken('k', match1to2);
        addRegexToken('HH', match1to2, match2);
        addRegexToken('hh', match1to2, match2);
        addRegexToken('kk', match1to2, match2);

        addRegexToken('hmm', match3to4);
        addRegexToken('hmmss', match5to6);
        addRegexToken('Hmm', match3to4);
        addRegexToken('Hmmss', match5to6);

        addParseToken(['H', 'HH'], HOUR);
        addParseToken(['k', 'kk'], function (input, array, config) {
            var kInput = toInt(input);
            array[HOUR] = kInput === 24 ? 0 : kInput;
        });
        addParseToken(['a', 'A'], function (input, array, config) {
            config._isPm = config._locale.isPM(input);
            config._meridiem = input;
        });
        addParseToken(['h', 'hh'], function (input, array, config) {
            array[HOUR] = toInt(input);
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmmss', function (input, array, config) {
            var pos1 = input.length - 4,
                pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('Hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
        });
        addParseToken('Hmmss', function (input, array, config) {
            var pos1 = input.length - 4,
                pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
        });

        // LOCALES

        function localeIsPM(input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return (input + '').toLowerCase().charAt(0) === 'p';
        }

        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
            // Setting the hour should keep the time, because the user explicitly
            // specified which hour they want. So trying to maintain the same hour (in
            // a new timezone) makes sense. Adding/subtracting hours does not follow
            // this rule.
            getSetHour = makeGetSet('Hours', true);

        function localeMeridiem(hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        }

        var baseConfig = {
            calendar: defaultCalendar,
            longDateFormat: defaultLongDateFormat,
            invalidDate: defaultInvalidDate,
            ordinal: defaultOrdinal,
            dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
            relativeTime: defaultRelativeTime,

            months: defaultLocaleMonths,
            monthsShort: defaultLocaleMonthsShort,

            week: defaultLocaleWeek,

            weekdays: defaultLocaleWeekdays,
            weekdaysMin: defaultLocaleWeekdaysMin,
            weekdaysShort: defaultLocaleWeekdaysShort,

            meridiemParse: defaultLocaleMeridiemParse,
        };

        // internal storage for locale config files
        var locales = {},
            localeFamilies = {},
            globalLocale;

        function commonPrefix(arr1, arr2) {
            var i,
                minl = Math.min(arr1.length, arr2.length);
            for (i = 0; i < minl; i += 1) {
                if (arr1[i] !== arr2[i]) {
                    return i;
                }
            }
            return minl;
        }

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0,
                j,
                next,
                locale,
                split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (
                        next &&
                        next.length >= j &&
                        commonPrefix(split, next) >= j - 1
                    ) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return globalLocale;
        }

        function loadLocale(name) {
            var oldLocale = null,
                aliasedRequire;
            // TODO: Find a better way to register and load all the locales in Node
            if (
                locales[name] === undefined &&
                'object' !== 'undefined' &&
                module &&
                module.exports
            ) {
                try {
                    oldLocale = globalLocale._abbr;
                    aliasedRequire = commonjsRequire;
                    aliasedRequire('./locale/' + name);
                    getSetGlobalLocale(oldLocale);
                } catch (e) {
                    // mark as not found to avoid repeating expensive file require call causing high CPU
                    // when trying to find en-US, en_US, en-us for every format call
                    locales[name] = null; // null means not found
                }
            }
            return locales[name];
        }

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        function getSetGlobalLocale(key, values) {
            var data;
            if (key) {
                if (isUndefined(values)) {
                    data = getLocale(key);
                } else {
                    data = defineLocale(key, values);
                }

                if (data) {
                    // moment.duration._locale = moment._locale = data;
                    globalLocale = data;
                } else {
                    if (typeof console !== 'undefined' && console.warn) {
                        //warn user if arguments are passed but the locale could not be set
                        console.warn(
                            'Locale ' + key + ' not found. Did you forget to load it?'
                        );
                    }
                }
            }

            return globalLocale._abbr;
        }

        function defineLocale(name, config) {
            if (config !== null) {
                var locale,
                    parentConfig = baseConfig;
                config.abbr = name;
                if (locales[name] != null) {
                    deprecateSimple(
                        'defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                            'an existing locale. moment.defineLocale(localeName, ' +
                            'config) should only be used for creating a new locale ' +
                            'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                    );
                    parentConfig = locales[name]._config;
                } else if (config.parentLocale != null) {
                    if (locales[config.parentLocale] != null) {
                        parentConfig = locales[config.parentLocale]._config;
                    } else {
                        locale = loadLocale(config.parentLocale);
                        if (locale != null) {
                            parentConfig = locale._config;
                        } else {
                            if (!localeFamilies[config.parentLocale]) {
                                localeFamilies[config.parentLocale] = [];
                            }
                            localeFamilies[config.parentLocale].push({
                                name: name,
                                config: config,
                            });
                            return null;
                        }
                    }
                }
                locales[name] = new Locale(mergeConfigs(parentConfig, config));

                if (localeFamilies[name]) {
                    localeFamilies[name].forEach(function (x) {
                        defineLocale(x.name, x.config);
                    });
                }

                // backwards compat for now: also set the locale
                // make sure we set the locale AFTER all child locales have been
                // created, so we won't end up with the child locale set.
                getSetGlobalLocale(name);

                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        }

        function updateLocale(name, config) {
            if (config != null) {
                var locale,
                    tmpLocale,
                    parentConfig = baseConfig;

                if (locales[name] != null && locales[name].parentLocale != null) {
                    // Update existing child locale in-place to avoid memory-leaks
                    locales[name].set(mergeConfigs(locales[name]._config, config));
                } else {
                    // MERGE
                    tmpLocale = loadLocale(name);
                    if (tmpLocale != null) {
                        parentConfig = tmpLocale._config;
                    }
                    config = mergeConfigs(parentConfig, config);
                    if (tmpLocale == null) {
                        // updateLocale is called for creating a new locale
                        // Set abbr so it will have a name (getters return
                        // undefined otherwise).
                        config.abbr = name;
                    }
                    locale = new Locale(config);
                    locale.parentLocale = locales[name];
                    locales[name] = locale;
                }

                // backwards compat for now: also set the locale
                getSetGlobalLocale(name);
            } else {
                // pass null for config to unupdate, useful for tests
                if (locales[name] != null) {
                    if (locales[name].parentLocale != null) {
                        locales[name] = locales[name].parentLocale;
                        if (name === getSetGlobalLocale()) {
                            getSetGlobalLocale(name);
                        }
                    } else if (locales[name] != null) {
                        delete locales[name];
                    }
                }
            }
            return locales[name];
        }

        // returns locale data
        function getLocale(key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return globalLocale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        }

        function listLocales() {
            return keys(locales);
        }

        function checkOverflow(m) {
            var overflow,
                a = m._a;

            if (a && getParsingFlags(m).overflow === -2) {
                overflow =
                    a[MONTH] < 0 || a[MONTH] > 11
                        ? MONTH
                        : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                        ? DATE
                        : a[HOUR] < 0 ||
                          a[HOUR] > 24 ||
                          (a[HOUR] === 24 &&
                              (a[MINUTE] !== 0 ||
                                  a[SECOND] !== 0 ||
                                  a[MILLISECOND] !== 0))
                        ? HOUR
                        : a[MINUTE] < 0 || a[MINUTE] > 59
                        ? MINUTE
                        : a[SECOND] < 0 || a[SECOND] > 59
                        ? SECOND
                        : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                        ? MILLISECOND
                        : -1;

                if (
                    getParsingFlags(m)._overflowDayOfYear &&
                    (overflow < YEAR || overflow > DATE)
                ) {
                    overflow = DATE;
                }
                if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                    overflow = WEEK;
                }
                if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                    overflow = WEEKDAY;
                }

                getParsingFlags(m).overflow = overflow;
            }

            return m;
        }

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
            basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
            tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
            isoDates = [
                ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
                ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
                ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
                ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
                ['YYYY-DDD', /\d{4}-\d{3}/],
                ['YYYY-MM', /\d{4}-\d\d/, false],
                ['YYYYYYMMDD', /[+-]\d{10}/],
                ['YYYYMMDD', /\d{8}/],
                ['GGGG[W]WWE', /\d{4}W\d{3}/],
                ['GGGG[W]WW', /\d{4}W\d{2}/, false],
                ['YYYYDDD', /\d{7}/],
                ['YYYYMM', /\d{6}/, false],
                ['YYYY', /\d{4}/, false],
            ],
            // iso time formats and regexes
            isoTimes = [
                ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
                ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
                ['HH:mm:ss', /\d\d:\d\d:\d\d/],
                ['HH:mm', /\d\d:\d\d/],
                ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
                ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
                ['HHmmss', /\d\d\d\d\d\d/],
                ['HHmm', /\d\d\d\d/],
                ['HH', /\d\d/],
            ],
            aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
            // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
            rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
            obsOffsets = {
                UT: 0,
                GMT: 0,
                EDT: -4 * 60,
                EST: -5 * 60,
                CDT: -5 * 60,
                CST: -6 * 60,
                MDT: -6 * 60,
                MST: -7 * 60,
                PDT: -7 * 60,
                PST: -8 * 60,
            };

        // date from iso format
        function configFromISO(config) {
            var i,
                l,
                string = config._i,
                match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
                allowTime,
                dateFormat,
                timeFormat,
                tzFormat;

            if (match) {
                getParsingFlags(config).iso = true;

                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(match[1])) {
                        dateFormat = isoDates[i][0];
                        allowTime = isoDates[i][2] !== false;
                        break;
                    }
                }
                if (dateFormat == null) {
                    config._isValid = false;
                    return;
                }
                if (match[3]) {
                    for (i = 0, l = isoTimes.length; i < l; i++) {
                        if (isoTimes[i][1].exec(match[3])) {
                            // match[2] should be 'T' or space
                            timeFormat = (match[2] || ' ') + isoTimes[i][0];
                            break;
                        }
                    }
                    if (timeFormat == null) {
                        config._isValid = false;
                        return;
                    }
                }
                if (!allowTime && timeFormat != null) {
                    config._isValid = false;
                    return;
                }
                if (match[4]) {
                    if (tzRegex.exec(match[4])) {
                        tzFormat = 'Z';
                    } else {
                        config._isValid = false;
                        return;
                    }
                }
                config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
                configFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        function extractFromRFC2822Strings(
            yearStr,
            monthStr,
            dayStr,
            hourStr,
            minuteStr,
            secondStr
        ) {
            var result = [
                untruncateYear(yearStr),
                defaultLocaleMonthsShort.indexOf(monthStr),
                parseInt(dayStr, 10),
                parseInt(hourStr, 10),
                parseInt(minuteStr, 10),
            ];

            if (secondStr) {
                result.push(parseInt(secondStr, 10));
            }

            return result;
        }

        function untruncateYear(yearStr) {
            var year = parseInt(yearStr, 10);
            if (year <= 49) {
                return 2000 + year;
            } else if (year <= 999) {
                return 1900 + year;
            }
            return year;
        }

        function preprocessRFC2822(s) {
            // Remove comments and folding whitespace and replace multiple-spaces with a single space
            return s
                .replace(/\([^)]*\)|[\n\t]/g, ' ')
                .replace(/(\s\s+)/g, ' ')
                .replace(/^\s\s*/, '')
                .replace(/\s\s*$/, '');
        }

        function checkWeekday(weekdayStr, parsedInput, config) {
            if (weekdayStr) {
                // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
                var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                    weekdayActual = new Date(
                        parsedInput[0],
                        parsedInput[1],
                        parsedInput[2]
                    ).getDay();
                if (weekdayProvided !== weekdayActual) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return false;
                }
            }
            return true;
        }

        function calculateOffset(obsOffset, militaryOffset, numOffset) {
            if (obsOffset) {
                return obsOffsets[obsOffset];
            } else if (militaryOffset) {
                // the only allowed military tz is Z
                return 0;
            } else {
                var hm = parseInt(numOffset, 10),
                    m = hm % 100,
                    h = (hm - m) / 100;
                return h * 60 + m;
            }
        }

        // date and time from ref 2822 format
        function configFromRFC2822(config) {
            var match = rfc2822.exec(preprocessRFC2822(config._i)),
                parsedArray;
            if (match) {
                parsedArray = extractFromRFC2822Strings(
                    match[4],
                    match[3],
                    match[2],
                    match[5],
                    match[6],
                    match[7]
                );
                if (!checkWeekday(match[1], parsedArray, config)) {
                    return;
                }

                config._a = parsedArray;
                config._tzm = calculateOffset(match[8], match[9], match[10]);

                config._d = createUTCDate.apply(null, config._a);
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

                getParsingFlags(config).rfc2822 = true;
            } else {
                config._isValid = false;
            }
        }

        // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
        function configFromString(config) {
            var matched = aspNetJsonRegex.exec(config._i);
            if (matched !== null) {
                config._d = new Date(+matched[1]);
                return;
            }

            configFromISO(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            configFromRFC2822(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            if (config._strict) {
                config._isValid = false;
            } else {
                // Final attempt, use Input Fallback
                hooks.createFromInputFallback(config);
            }
        }

        hooks.createFromInputFallback = deprecate(
            'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
                'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
                'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
            function (config) {
                config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
            }
        );

        // Pick the first defined of two or three arguments.
        function defaults(a, b, c) {
            if (a != null) {
                return a;
            }
            if (b != null) {
                return b;
            }
            return c;
        }

        function currentDateArray(config) {
            // hooks is actually the exported moment object
            var nowValue = new Date(hooks.now());
            if (config._useUTC) {
                return [
                    nowValue.getUTCFullYear(),
                    nowValue.getUTCMonth(),
                    nowValue.getUTCDate(),
                ];
            }
            return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function configFromArray(config) {
            var i,
                date,
                input = [],
                currentDate,
                expectedWeekday,
                yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear != null) {
                yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

                if (
                    config._dayOfYear > daysInYear(yearToUse) ||
                    config._dayOfYear === 0
                ) {
                    getParsingFlags(config)._overflowDayOfYear = true;
                }

                date = createUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] =
                    config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
            }

            // Check for 24:00:00.000
            if (
                config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0
            ) {
                config._nextDay = true;
                config._a[HOUR] = 0;
            }

            config._d = (config._useUTC ? createUTCDate : createDate).apply(
                null,
                input
            );
            expectedWeekday = config._useUTC
                ? config._d.getUTCDay()
                : config._d.getDay();

            // Apply timezone offset from input. The actual utcOffset can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            }

            if (config._nextDay) {
                config._a[HOUR] = 24;
            }

            // check for mismatching day of week
            if (
                config._w &&
                typeof config._w.d !== 'undefined' &&
                config._w.d !== expectedWeekday
            ) {
                getParsingFlags(config).weekdayMismatch = true;
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = defaults(
                    w.GG,
                    config._a[YEAR],
                    weekOfYear(createLocal(), 1, 4).year
                );
                week = defaults(w.W, 1);
                weekday = defaults(w.E, 1);
                if (weekday < 1 || weekday > 7) {
                    weekdayOverflow = true;
                }
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                curWeek = weekOfYear(createLocal(), dow, doy);

                weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

                // Default to current week.
                week = defaults(w.w, curWeek.week);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < 0 || weekday > 6) {
                        weekdayOverflow = true;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from beginning of week
                    weekday = w.e + dow;
                    if (w.e < 0 || w.e > 6) {
                        weekdayOverflow = true;
                    }
                } else {
                    // default to beginning of week
                    weekday = dow;
                }
            }
            if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                getParsingFlags(config)._overflowWeeks = true;
            } else if (weekdayOverflow != null) {
                getParsingFlags(config)._overflowWeekday = true;
            } else {
                temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                config._a[YEAR] = temp.year;
                config._dayOfYear = temp.dayOfYear;
            }
        }

        // constant that refers to the ISO standard
        hooks.ISO_8601 = function () {};

        // constant that refers to the RFC 2822 form
        hooks.RFC_2822 = function () {};

        // date from string and format string
        function configFromStringAndFormat(config) {
            // TODO: Move this to another part of the creation flow to prevent circular deps
            if (config._f === hooks.ISO_8601) {
                configFromISO(config);
                return;
            }
            if (config._f === hooks.RFC_2822) {
                configFromRFC2822(config);
                return;
            }
            config._a = [];
            getParsingFlags(config).empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i,
                parsedInput,
                tokens,
                token,
                skipped,
                stringLength = string.length,
                totalParsedInputLength = 0,
                era;

            tokens =
                expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                    [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        getParsingFlags(config).unusedInput.push(skipped);
                    }
                    string = string.slice(
                        string.indexOf(parsedInput) + parsedInput.length
                    );
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        getParsingFlags(config).empty = false;
                    } else {
                        getParsingFlags(config).unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                } else if (config._strict && !parsedInput) {
                    getParsingFlags(config).unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            getParsingFlags(config).charsLeftOver =
                stringLength - totalParsedInputLength;
            if (string.length > 0) {
                getParsingFlags(config).unusedInput.push(string);
            }

            // clear _12h flag if hour is <= 12
            if (
                config._a[HOUR] <= 12 &&
                getParsingFlags(config).bigHour === true &&
                config._a[HOUR] > 0
            ) {
                getParsingFlags(config).bigHour = undefined;
            }

            getParsingFlags(config).parsedDateParts = config._a.slice(0);
            getParsingFlags(config).meridiem = config._meridiem;
            // handle meridiem
            config._a[HOUR] = meridiemFixWrap(
                config._locale,
                config._a[HOUR],
                config._meridiem
            );

            // handle era
            era = getParsingFlags(config).era;
            if (era !== null) {
                config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
            }

            configFromArray(config);
            checkOverflow(config);
        }

        function meridiemFixWrap(locale, hour, meridiem) {
            var isPm;

            if (meridiem == null) {
                // nothing to do
                return hour;
            }
            if (locale.meridiemHour != null) {
                return locale.meridiemHour(hour, meridiem);
            } else if (locale.isPM != null) {
                // Fallback
                isPm = locale.isPM(meridiem);
                if (isPm && hour < 12) {
                    hour += 12;
                }
                if (!isPm && hour === 12) {
                    hour = 0;
                }
                return hour;
            } else {
                // this is not supposed to happen
                return hour;
            }
        }

        // date from string and array of format strings
        function configFromStringAndArray(config) {
            var tempConfig,
                bestMoment,
                scoreToBeat,
                i,
                currentScore,
                validFormatFound,
                bestFormatIsValid = false;

            if (config._f.length === 0) {
                getParsingFlags(config).invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                validFormatFound = false;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._f = config._f[i];
                configFromStringAndFormat(tempConfig);

                if (isValid(tempConfig)) {
                    validFormatFound = true;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += getParsingFlags(tempConfig).charsLeftOver;

                //or tokens
                currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

                getParsingFlags(tempConfig).score = currentScore;

                if (!bestFormatIsValid) {
                    if (
                        scoreToBeat == null ||
                        currentScore < scoreToBeat ||
                        validFormatFound
                    ) {
                        scoreToBeat = currentScore;
                        bestMoment = tempConfig;
                        if (validFormatFound) {
                            bestFormatIsValid = true;
                        }
                    }
                } else {
                    if (currentScore < scoreToBeat) {
                        scoreToBeat = currentScore;
                        bestMoment = tempConfig;
                    }
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        function configFromObject(config) {
            if (config._d) {
                return;
            }

            var i = normalizeObjectUnits(config._i),
                dayOrDate = i.day === undefined ? i.date : i.day;
            config._a = map(
                [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
                function (obj) {
                    return obj && parseInt(obj, 10);
                }
            );

            configFromArray(config);
        }

        function createFromConfig(config) {
            var res = new Moment(checkOverflow(prepareConfig(config)));
            if (res._nextDay) {
                // Adding is smart enough around DST
                res.add(1, 'd');
                res._nextDay = undefined;
            }

            return res;
        }

        function prepareConfig(config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || getLocale(config._l);

            if (input === null || (format === undefined && input === '')) {
                return createInvalid({ nullInput: true });
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (isMoment(input)) {
                return new Moment(checkOverflow(input));
            } else if (isDate(input)) {
                config._d = input;
            } else if (isArray(format)) {
                configFromStringAndArray(config);
            } else if (format) {
                configFromStringAndFormat(config);
            } else {
                configFromInput(config);
            }

            if (!isValid(config)) {
                config._d = null;
            }

            return config;
        }

        function configFromInput(config) {
            var input = config._i;
            if (isUndefined(input)) {
                config._d = new Date(hooks.now());
            } else if (isDate(input)) {
                config._d = new Date(input.valueOf());
            } else if (typeof input === 'string') {
                configFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                configFromArray(config);
            } else if (isObject(input)) {
                configFromObject(config);
            } else if (isNumber(input)) {
                // from milliseconds
                config._d = new Date(input);
            } else {
                hooks.createFromInputFallback(config);
            }
        }

        function createLocalOrUTC(input, format, locale, strict, isUTC) {
            var c = {};

            if (format === true || format === false) {
                strict = format;
                format = undefined;
            }

            if (locale === true || locale === false) {
                strict = locale;
                locale = undefined;
            }

            if (
                (isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)
            ) {
                input = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c._isAMomentObject = true;
            c._useUTC = c._isUTC = isUTC;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;

            return createFromConfig(c);
        }

        function createLocal(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, false);
        }

        var prototypeMin = deprecate(
                'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
                function () {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other < this ? this : other;
                    } else {
                        return createInvalid();
                    }
                }
            ),
            prototypeMax = deprecate(
                'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
                function () {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other > this ? this : other;
                    } else {
                        return createInvalid();
                    }
                }
            );

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return createLocal();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (!moments[i].isValid() || moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        // TODO: Use [].sort instead?
        function min() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        }

        function max() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        }

        var now = function () {
            return Date.now ? Date.now() : +new Date();
        };

        var ordering = [
            'year',
            'quarter',
            'month',
            'week',
            'day',
            'hour',
            'minute',
            'second',
            'millisecond',
        ];

        function isDurationValid(m) {
            var key,
                unitHasDecimal = false,
                i;
            for (key in m) {
                if (
                    hasOwnProp(m, key) &&
                    !(
                        indexOf.call(ordering, key) !== -1 &&
                        (m[key] == null || !isNaN(m[key]))
                    )
                ) {
                    return false;
                }
            }

            for (i = 0; i < ordering.length; ++i) {
                if (m[ordering[i]]) {
                    if (unitHasDecimal) {
                        return false; // only allow non-integers for smallest unit
                    }
                    if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                        unitHasDecimal = true;
                    }
                }
            }

            return true;
        }

        function isValid$1() {
            return this._isValid;
        }

        function createInvalid$1() {
            return createDuration(NaN);
        }

        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            this._isValid = isDurationValid(normalizedInput);

            // representation for dateAddRemove
            this._milliseconds =
                +milliseconds +
                seconds * 1e3 + // 1000
                minutes * 6e4 + // 1000 * 60
                hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days + weeks * 7;
            // It is impossible to translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months + quarters * 3 + years * 12;

            this._data = {};

            this._locale = getLocale();

            this._bubble();
        }

        function isDuration(obj) {
            return obj instanceof Duration;
        }

        function absRound(number) {
            if (number < 0) {
                return Math.round(-1 * number) * -1;
            } else {
                return Math.round(number);
            }
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if (
                    (dontConvert && array1[i] !== array2[i]) ||
                    (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
                ) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        // FORMATTING

        function offset(token, separator) {
            addFormatToken(token, 0, 0, function () {
                var offset = this.utcOffset(),
                    sign = '+';
                if (offset < 0) {
                    offset = -offset;
                    sign = '-';
                }
                return (
                    sign +
                    zeroFill(~~(offset / 60), 2) +
                    separator +
                    zeroFill(~~offset % 60, 2)
                );
            });
        }

        offset('Z', ':');
        offset('ZZ', '');

        // PARSING

        addRegexToken('Z', matchShortOffset);
        addRegexToken('ZZ', matchShortOffset);
        addParseToken(['Z', 'ZZ'], function (input, array, config) {
            config._useUTC = true;
            config._tzm = offsetFromString(matchShortOffset, input);
        });

        // HELPERS

        // timezone chunker
        // '+10:00' > ['10',  '00']
        // '-1530'  > ['-15', '30']
        var chunkOffset = /([\+\-]|\d\d)/gi;

        function offsetFromString(matcher, string) {
            var matches = (string || '').match(matcher),
                chunk,
                parts,
                minutes;

            if (matches === null) {
                return null;
            }

            chunk = matches[matches.length - 1] || [];
            parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
            minutes = +(parts[1] * 60) + toInt(parts[2]);

            return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function cloneWithOffset(input, model) {
            var res, diff;
            if (model._isUTC) {
                res = model.clone();
                diff =
                    (isMoment(input) || isDate(input)
                        ? input.valueOf()
                        : createLocal(input).valueOf()) - res.valueOf();
                // Use low-level api, because this fn is low-level api.
                res._d.setTime(res._d.valueOf() + diff);
                hooks.updateOffset(res, false);
                return res;
            } else {
                return createLocal(input).local();
            }
        }

        function getDateOffset(m) {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(m._d.getTimezoneOffset());
        }

        // HOOKS

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        hooks.updateOffset = function () {};

        // MOMENTS

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        function getSetOffset(input, keepLocalTime, keepMinutes) {
            var offset = this._offset || 0,
                localAdjust;
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            if (input != null) {
                if (typeof input === 'string') {
                    input = offsetFromString(matchShortOffset, input);
                    if (input === null) {
                        return this;
                    }
                } else if (Math.abs(input) < 16 && !keepMinutes) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = getDateOffset(this);
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addSubtract(
                            this,
                            createDuration(input - offset, 'm'),
                            1,
                            false
                        );
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        hooks.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
                return this;
            } else {
                return this._isUTC ? offset : getDateOffset(this);
            }
        }

        function getSetZone(input, keepLocalTime) {
            if (input != null) {
                if (typeof input !== 'string') {
                    input = -input;
                }

                this.utcOffset(input, keepLocalTime);

                return this;
            } else {
                return -this.utcOffset();
            }
        }

        function setOffsetToUTC(keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        }

        function setOffsetToLocal(keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(getDateOffset(this), 'm');
                }
            }
            return this;
        }

        function setOffsetToParsedOffset() {
            if (this._tzm != null) {
                this.utcOffset(this._tzm, false, true);
            } else if (typeof this._i === 'string') {
                var tZone = offsetFromString(matchOffset, this._i);
                if (tZone != null) {
                    this.utcOffset(tZone);
                } else {
                    this.utcOffset(0, true);
                }
            }
            return this;
        }

        function hasAlignedHourOffset(input) {
            if (!this.isValid()) {
                return false;
            }
            input = input ? createLocal(input).utcOffset() : 0;

            return (this.utcOffset() - input) % 60 === 0;
        }

        function isDaylightSavingTime() {
            return (
                this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset()
            );
        }

        function isDaylightSavingTimeShifted() {
            if (!isUndefined(this._isDSTShifted)) {
                return this._isDSTShifted;
            }

            var c = {},
                other;

            copyConfig(c, this);
            c = prepareConfig(c);

            if (c._a) {
                other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
                this._isDSTShifted =
                    this.isValid() && compareArrays(c._a, other.toArray()) > 0;
            } else {
                this._isDSTShifted = false;
            }

            return this._isDSTShifted;
        }

        function isLocal() {
            return this.isValid() ? !this._isUTC : false;
        }

        function isUtcOffset() {
            return this.isValid() ? this._isUTC : false;
        }

        function isUtc() {
            return this.isValid() ? this._isUTC && this._offset === 0 : false;
        }

        // ASP.NET json date format regex
        var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
            // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
            // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
            // and further modified to allow for strings containing both week and day
            isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

        function createDuration(input, key) {
            var duration = input,
                // matching against regexp is expensive, do it on demand
                match = null,
                sign,
                ret,
                diffRes;

            if (isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months,
                };
            } else if (isNumber(input) || !isNaN(+input)) {
                duration = {};
                if (key) {
                    duration[key] = +input;
                } else {
                    duration.milliseconds = +input;
                }
            } else if ((match = aspNetRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
                };
            } else if ((match = isoRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: parseIso(match[2], sign),
                    M: parseIso(match[3], sign),
                    w: parseIso(match[4], sign),
                    d: parseIso(match[5], sign),
                    h: parseIso(match[6], sign),
                    m: parseIso(match[7], sign),
                    s: parseIso(match[8], sign),
                };
            } else if (duration == null) {
                // checks for null or undefined
                duration = {};
            } else if (
                typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)
            ) {
                diffRes = momentsDifference(
                    createLocal(duration.from),
                    createLocal(duration.to)
                );

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            if (isDuration(input) && hasOwnProp(input, '_isValid')) {
                ret._isValid = input._isValid;
            }

            return ret;
        }

        createDuration.fn = Duration.prototype;
        createDuration.invalid = createInvalid$1;

        function parseIso(inp, sign) {
            // We'd normally use ~~inp for this, but unfortunately it also
            // converts floats to ints.
            // inp may be undefined, so careful calling replace on it.
            var res = inp && parseFloat(inp.replace(',', '.'));
            // apply sign while we're at it
            return (isNaN(res) ? 0 : res) * sign;
        }

        function positiveMomentsDifference(base, other) {
            var res = {};

            res.months =
                other.month() - base.month() + (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +base.clone().add(res.months, 'M');

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            if (!(base.isValid() && other.isValid())) {
                return { milliseconds: 0, months: 0 };
            }

            other = cloneWithOffset(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(
                        name,
                        'moment().' +
                            name +
                            '(period, number) is deprecated. Please use moment().' +
                            name +
                            '(number, period). ' +
                            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                    );
                    tmp = val;
                    val = period;
                    period = tmp;
                }

                dur = createDuration(val, period);
                addSubtract(this, dur, direction);
                return this;
            };
        }

        function addSubtract(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = absRound(duration._days),
                months = absRound(duration._months);

            if (!mom.isValid()) {
                // No op
                return;
            }

            updateOffset = updateOffset == null ? true : updateOffset;

            if (months) {
                setMonth(mom, get(mom, 'Month') + months * isAdding);
            }
            if (days) {
                set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
            }
            if (milliseconds) {
                mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
            }
            if (updateOffset) {
                hooks.updateOffset(mom, days || months);
            }
        }

        var add = createAdder(1, 'add'),
            subtract = createAdder(-1, 'subtract');

        function isString(input) {
            return typeof input === 'string' || input instanceof String;
        }

        // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
        function isMomentInput(input) {
            return (
                isMoment(input) ||
                isDate(input) ||
                isString(input) ||
                isNumber(input) ||
                isNumberOrStringArray(input) ||
                isMomentInputObject(input) ||
                input === null ||
                input === undefined
            );
        }

        function isMomentInputObject(input) {
            var objectTest = isObject(input) && !isObjectEmpty(input),
                propertyTest = false,
                properties = [
                    'years',
                    'year',
                    'y',
                    'months',
                    'month',
                    'M',
                    'days',
                    'day',
                    'd',
                    'dates',
                    'date',
                    'D',
                    'hours',
                    'hour',
                    'h',
                    'minutes',
                    'minute',
                    'm',
                    'seconds',
                    'second',
                    's',
                    'milliseconds',
                    'millisecond',
                    'ms',
                ],
                i,
                property;

            for (i = 0; i < properties.length; i += 1) {
                property = properties[i];
                propertyTest = propertyTest || hasOwnProp(input, property);
            }

            return objectTest && propertyTest;
        }

        function isNumberOrStringArray(input) {
            var arrayTest = isArray(input),
                dataTypeTest = false;
            if (arrayTest) {
                dataTypeTest =
                    input.filter(function (item) {
                        return !isNumber(item) && isString(input);
                    }).length === 0;
            }
            return arrayTest && dataTypeTest;
        }

        function isCalendarSpec(input) {
            var objectTest = isObject(input) && !isObjectEmpty(input),
                propertyTest = false,
                properties = [
                    'sameDay',
                    'nextDay',
                    'lastDay',
                    'nextWeek',
                    'lastWeek',
                    'sameElse',
                ],
                i,
                property;

            for (i = 0; i < properties.length; i += 1) {
                property = properties[i];
                propertyTest = propertyTest || hasOwnProp(input, property);
            }

            return objectTest && propertyTest;
        }

        function getCalendarFormat(myMoment, now) {
            var diff = myMoment.diff(now, 'days', true);
            return diff < -6
                ? 'sameElse'
                : diff < -1
                ? 'lastWeek'
                : diff < 0
                ? 'lastDay'
                : diff < 1
                ? 'sameDay'
                : diff < 2
                ? 'nextDay'
                : diff < 7
                ? 'nextWeek'
                : 'sameElse';
        }

        function calendar$1(time, formats) {
            // Support for single parameter, formats only overload to the calendar function
            if (arguments.length === 1) {
                if (!arguments[0]) {
                    time = undefined;
                    formats = undefined;
                } else if (isMomentInput(arguments[0])) {
                    time = arguments[0];
                    formats = undefined;
                } else if (isCalendarSpec(arguments[0])) {
                    formats = arguments[0];
                    time = undefined;
                }
            }
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're local/utc/offset or not.
            var now = time || createLocal(),
                sod = cloneWithOffset(now, this).startOf('day'),
                format = hooks.calendarFormat(this, sod) || 'sameElse',
                output =
                    formats &&
                    (isFunction(formats[format])
                        ? formats[format].call(this, now)
                        : formats[format]);

            return this.format(
                output || this.localeData().calendar(format, this, createLocal(now))
            );
        }

        function clone() {
            return new Moment(this);
        }

        function isAfter(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() > localInput.valueOf();
            } else {
                return localInput.valueOf() < this.clone().startOf(units).valueOf();
            }
        }

        function isBefore(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() < localInput.valueOf();
            } else {
                return this.clone().endOf(units).valueOf() < localInput.valueOf();
            }
        }

        function isBetween(from, to, units, inclusivity) {
            var localFrom = isMoment(from) ? from : createLocal(from),
                localTo = isMoment(to) ? to : createLocal(to);
            if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
                return false;
            }
            inclusivity = inclusivity || '()';
            return (
                (inclusivity[0] === '('
                    ? this.isAfter(localFrom, units)
                    : !this.isBefore(localFrom, units)) &&
                (inclusivity[1] === ')'
                    ? this.isBefore(localTo, units)
                    : !this.isAfter(localTo, units))
            );
        }

        function isSame(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input),
                inputMs;
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() === localInput.valueOf();
            } else {
                inputMs = localInput.valueOf();
                return (
                    this.clone().startOf(units).valueOf() <= inputMs &&
                    inputMs <= this.clone().endOf(units).valueOf()
                );
            }
        }

        function isSameOrAfter(input, units) {
            return this.isSame(input, units) || this.isAfter(input, units);
        }

        function isSameOrBefore(input, units) {
            return this.isSame(input, units) || this.isBefore(input, units);
        }

        function diff(input, units, asFloat) {
            var that, zoneDelta, output;

            if (!this.isValid()) {
                return NaN;
            }

            that = cloneWithOffset(input, this);

            if (!that.isValid()) {
                return NaN;
            }

            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

            units = normalizeUnits(units);

            switch (units) {
                case 'year':
                    output = monthDiff(this, that) / 12;
                    break;
                case 'month':
                    output = monthDiff(this, that);
                    break;
                case 'quarter':
                    output = monthDiff(this, that) / 3;
                    break;
                case 'second':
                    output = (this - that) / 1e3;
                    break; // 1000
                case 'minute':
                    output = (this - that) / 6e4;
                    break; // 1000 * 60
                case 'hour':
                    output = (this - that) / 36e5;
                    break; // 1000 * 60 * 60
                case 'day':
                    output = (this - that - zoneDelta) / 864e5;
                    break; // 1000 * 60 * 60 * 24, negate dst
                case 'week':
                    output = (this - that - zoneDelta) / 6048e5;
                    break; // 1000 * 60 * 60 * 24 * 7, negate dst
                default:
                    output = this - that;
            }

            return asFloat ? output : absFloor(output);
        }

        function monthDiff(a, b) {
            if (a.date() < b.date()) {
                // end-of-month calculations work correct when the start month has more
                // days than the end month.
                return -monthDiff(b, a);
            }
            // difference in months
            var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
                // b is in (anchor - 1 month, anchor + 1 month)
                anchor = a.clone().add(wholeMonthDiff, 'months'),
                anchor2,
                adjust;

            if (b - anchor < 0) {
                anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor - anchor2);
            } else {
                anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor2 - anchor);
            }

            //check for negative zero, return zero if negative zero
            return -(wholeMonthDiff + adjust) || 0;
        }

        hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

        function toString() {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }

        function toISOString(keepOffset) {
            if (!this.isValid()) {
                return null;
            }
            var utc = keepOffset !== true,
                m = utc ? this.clone().utc() : this;
            if (m.year() < 0 || m.year() > 9999) {
                return formatMoment(
                    m,
                    utc
                        ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                        : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
                );
            }
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                if (utc) {
                    return this.toDate().toISOString();
                } else {
                    return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                        .toISOString()
                        .replace('Z', formatMoment(m, 'Z'));
                }
            }
            return formatMoment(
                m,
                utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }

        /**
         * Return a human readable representation of a moment that can
         * also be evaluated to get a new moment which is the same
         *
         * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
         */
        function inspect() {
            if (!this.isValid()) {
                return 'moment.invalid(/* ' + this._i + ' */)';
            }
            var func = 'moment',
                zone = '',
                prefix,
                year,
                datetime,
                suffix;
            if (!this.isLocal()) {
                func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
                zone = 'Z';
            }
            prefix = '[' + func + '("]';
            year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
            datetime = '-MM-DD[T]HH:mm:ss.SSS';
            suffix = zone + '[")]';

            return this.format(prefix + year + datetime + suffix);
        }

        function format(inputString) {
            if (!inputString) {
                inputString = this.isUtc()
                    ? hooks.defaultFormatUtc
                    : hooks.defaultFormat;
            }
            var output = formatMoment(this, inputString);
            return this.localeData().postformat(output);
        }

        function from(time, withoutSuffix) {
            if (
                this.isValid() &&
                ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
            ) {
                return createDuration({ to: this, from: time })
                    .locale(this.locale())
                    .humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function fromNow(withoutSuffix) {
            return this.from(createLocal(), withoutSuffix);
        }

        function to(time, withoutSuffix) {
            if (
                this.isValid() &&
                ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
            ) {
                return createDuration({ from: this, to: time })
                    .locale(this.locale())
                    .humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function toNow(withoutSuffix) {
            return this.to(createLocal(), withoutSuffix);
        }

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        function locale(key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = getLocale(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        }

        var lang = deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        );

        function localeData() {
            return this._locale;
        }

        var MS_PER_SECOND = 1000,
            MS_PER_MINUTE = 60 * MS_PER_SECOND,
            MS_PER_HOUR = 60 * MS_PER_MINUTE,
            MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

        // actual modulo - handles negative numbers (for dates before 1970):
        function mod$1(dividend, divisor) {
            return ((dividend % divisor) + divisor) % divisor;
        }

        function localStartOfDate(y, m, d) {
            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                return new Date(y + 400, m, d) - MS_PER_400_YEARS;
            } else {
                return new Date(y, m, d).valueOf();
            }
        }

        function utcStartOfDate(y, m, d) {
            // Date.UTC remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
            } else {
                return Date.UTC(y, m, d);
            }
        }

        function startOf(units) {
            var time, startOfDate;
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond' || !this.isValid()) {
                return this;
            }

            startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

            switch (units) {
                case 'year':
                    time = startOfDate(this.year(), 0, 1);
                    break;
                case 'quarter':
                    time = startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3),
                        1
                    );
                    break;
                case 'month':
                    time = startOfDate(this.year(), this.month(), 1);
                    break;
                case 'week':
                    time = startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday()
                    );
                    break;
                case 'isoWeek':
                    time = startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1)
                    );
                    break;
                case 'day':
                case 'date':
                    time = startOfDate(this.year(), this.month(), this.date());
                    break;
                case 'hour':
                    time = this._d.valueOf();
                    time -= mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    );
                    break;
                case 'minute':
                    time = this._d.valueOf();
                    time -= mod$1(time, MS_PER_MINUTE);
                    break;
                case 'second':
                    time = this._d.valueOf();
                    time -= mod$1(time, MS_PER_SECOND);
                    break;
            }

            this._d.setTime(time);
            hooks.updateOffset(this, true);
            return this;
        }

        function endOf(units) {
            var time, startOfDate;
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond' || !this.isValid()) {
                return this;
            }

            startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

            switch (units) {
                case 'year':
                    time = startOfDate(this.year() + 1, 0, 1) - 1;
                    break;
                case 'quarter':
                    time =
                        startOfDate(
                            this.year(),
                            this.month() - (this.month() % 3) + 3,
                            1
                        ) - 1;
                    break;
                case 'month':
                    time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                    break;
                case 'week':
                    time =
                        startOfDate(
                            this.year(),
                            this.month(),
                            this.date() - this.weekday() + 7
                        ) - 1;
                    break;
                case 'isoWeek':
                    time =
                        startOfDate(
                            this.year(),
                            this.month(),
                            this.date() - (this.isoWeekday() - 1) + 7
                        ) - 1;
                    break;
                case 'day':
                case 'date':
                    time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                    break;
                case 'hour':
                    time = this._d.valueOf();
                    time +=
                        MS_PER_HOUR -
                        mod$1(
                            time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                            MS_PER_HOUR
                        ) -
                        1;
                    break;
                case 'minute':
                    time = this._d.valueOf();
                    time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                    break;
                case 'second':
                    time = this._d.valueOf();
                    time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                    break;
            }

            this._d.setTime(time);
            hooks.updateOffset(this, true);
            return this;
        }

        function valueOf() {
            return this._d.valueOf() - (this._offset || 0) * 60000;
        }

        function unix() {
            return Math.floor(this.valueOf() / 1000);
        }

        function toDate() {
            return new Date(this.valueOf());
        }

        function toArray() {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hour(),
                m.minute(),
                m.second(),
                m.millisecond(),
            ];
        }

        function toObject() {
            var m = this;
            return {
                years: m.year(),
                months: m.month(),
                date: m.date(),
                hours: m.hours(),
                minutes: m.minutes(),
                seconds: m.seconds(),
                milliseconds: m.milliseconds(),
            };
        }

        function toJSON() {
            // new Date(NaN).toJSON() === null
            return this.isValid() ? this.toISOString() : null;
        }

        function isValid$2() {
            return isValid(this);
        }

        function parsingFlags() {
            return extend({}, getParsingFlags(this));
        }

        function invalidAt() {
            return getParsingFlags(this).overflow;
        }

        function creationData() {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict,
            };
        }

        addFormatToken('N', 0, 0, 'eraAbbr');
        addFormatToken('NN', 0, 0, 'eraAbbr');
        addFormatToken('NNN', 0, 0, 'eraAbbr');
        addFormatToken('NNNN', 0, 0, 'eraName');
        addFormatToken('NNNNN', 0, 0, 'eraNarrow');

        addFormatToken('y', ['y', 1], 'yo', 'eraYear');
        addFormatToken('y', ['yy', 2], 0, 'eraYear');
        addFormatToken('y', ['yyy', 3], 0, 'eraYear');
        addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

        addRegexToken('N', matchEraAbbr);
        addRegexToken('NN', matchEraAbbr);
        addRegexToken('NNN', matchEraAbbr);
        addRegexToken('NNNN', matchEraName);
        addRegexToken('NNNNN', matchEraNarrow);

        addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
            input,
            array,
            config,
            token
        ) {
            var era = config._locale.erasParse(input, token, config._strict);
            if (era) {
                getParsingFlags(config).era = era;
            } else {
                getParsingFlags(config).invalidEra = input;
            }
        });

        addRegexToken('y', matchUnsigned);
        addRegexToken('yy', matchUnsigned);
        addRegexToken('yyy', matchUnsigned);
        addRegexToken('yyyy', matchUnsigned);
        addRegexToken('yo', matchEraYearOrdinal);

        addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
        addParseToken(['yo'], function (input, array, config, token) {
            var match;
            if (config._locale._eraYearOrdinalRegex) {
                match = input.match(config._locale._eraYearOrdinalRegex);
            }

            if (config._locale.eraYearOrdinalParse) {
                array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
            } else {
                array[YEAR] = parseInt(input, 10);
            }
        });

        function localeEras(m, format) {
            var i,
                l,
                date,
                eras = this._eras || getLocale('en')._eras;
            for (i = 0, l = eras.length; i < l; ++i) {
                switch (typeof eras[i].since) {
                    case 'string':
                        // truncate time
                        date = hooks(eras[i].since).startOf('day');
                        eras[i].since = date.valueOf();
                        break;
                }

                switch (typeof eras[i].until) {
                    case 'undefined':
                        eras[i].until = +Infinity;
                        break;
                    case 'string':
                        // truncate time
                        date = hooks(eras[i].until).startOf('day').valueOf();
                        eras[i].until = date.valueOf();
                        break;
                }
            }
            return eras;
        }

        function localeErasParse(eraName, format, strict) {
            var i,
                l,
                eras = this.eras(),
                name,
                abbr,
                narrow;
            eraName = eraName.toUpperCase();

            for (i = 0, l = eras.length; i < l; ++i) {
                name = eras[i].name.toUpperCase();
                abbr = eras[i].abbr.toUpperCase();
                narrow = eras[i].narrow.toUpperCase();

                if (strict) {
                    switch (format) {
                        case 'N':
                        case 'NN':
                        case 'NNN':
                            if (abbr === eraName) {
                                return eras[i];
                            }
                            break;

                        case 'NNNN':
                            if (name === eraName) {
                                return eras[i];
                            }
                            break;

                        case 'NNNNN':
                            if (narrow === eraName) {
                                return eras[i];
                            }
                            break;
                    }
                } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                    return eras[i];
                }
            }
        }

        function localeErasConvertYear(era, year) {
            var dir = era.since <= era.until ? +1 : -1;
            if (year === undefined) {
                return hooks(era.since).year();
            } else {
                return hooks(era.since).year() + (year - era.offset) * dir;
            }
        }

        function getEraName() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].name;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].name;
                }
            }

            return '';
        }

        function getEraNarrow() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].narrow;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].narrow;
                }
            }

            return '';
        }

        function getEraAbbr() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].abbr;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].abbr;
                }
            }

            return '';
        }

        function getEraYear() {
            var i,
                l,
                dir,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                dir = eras[i].since <= eras[i].until ? +1 : -1;

                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (
                    (eras[i].since <= val && val <= eras[i].until) ||
                    (eras[i].until <= val && val <= eras[i].since)
                ) {
                    return (
                        (this.year() - hooks(eras[i].since).year()) * dir +
                        eras[i].offset
                    );
                }
            }

            return this.year();
        }

        function erasNameRegex(isStrict) {
            if (!hasOwnProp(this, '_erasNameRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasNameRegex : this._erasRegex;
        }

        function erasAbbrRegex(isStrict) {
            if (!hasOwnProp(this, '_erasAbbrRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasAbbrRegex : this._erasRegex;
        }

        function erasNarrowRegex(isStrict) {
            if (!hasOwnProp(this, '_erasNarrowRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasNarrowRegex : this._erasRegex;
        }

        function matchEraAbbr(isStrict, locale) {
            return locale.erasAbbrRegex(isStrict);
        }

        function matchEraName(isStrict, locale) {
            return locale.erasNameRegex(isStrict);
        }

        function matchEraNarrow(isStrict, locale) {
            return locale.erasNarrowRegex(isStrict);
        }

        function matchEraYearOrdinal(isStrict, locale) {
            return locale._eraYearOrdinalRegex || matchUnsigned;
        }

        function computeErasParse() {
            var abbrPieces = [],
                namePieces = [],
                narrowPieces = [],
                mixedPieces = [],
                i,
                l,
                eras = this.eras();

            for (i = 0, l = eras.length; i < l; ++i) {
                namePieces.push(regexEscape(eras[i].name));
                abbrPieces.push(regexEscape(eras[i].abbr));
                narrowPieces.push(regexEscape(eras[i].narrow));

                mixedPieces.push(regexEscape(eras[i].name));
                mixedPieces.push(regexEscape(eras[i].abbr));
                mixedPieces.push(regexEscape(eras[i].narrow));
            }

            this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
            this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
            this._erasNarrowRegex = new RegExp(
                '^(' + narrowPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        addFormatToken(0, ['gg', 2], 0, function () {
            return this.weekYear() % 100;
        });

        addFormatToken(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        });

        function addWeekYearFormatToken(token, getter) {
            addFormatToken(0, [token, token.length], 0, getter);
        }

        addWeekYearFormatToken('gggg', 'weekYear');
        addWeekYearFormatToken('ggggg', 'weekYear');
        addWeekYearFormatToken('GGGG', 'isoWeekYear');
        addWeekYearFormatToken('GGGGG', 'isoWeekYear');

        // ALIASES

        addUnitAlias('weekYear', 'gg');
        addUnitAlias('isoWeekYear', 'GG');

        // PRIORITY

        addUnitPriority('weekYear', 1);
        addUnitPriority('isoWeekYear', 1);

        // PARSING

        addRegexToken('G', matchSigned);
        addRegexToken('g', matchSigned);
        addRegexToken('GG', match1to2, match2);
        addRegexToken('gg', match1to2, match2);
        addRegexToken('GGGG', match1to4, match4);
        addRegexToken('gggg', match1to4, match4);
        addRegexToken('GGGGG', match1to6, match6);
        addRegexToken('ggggg', match1to6, match6);

        addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
            input,
            week,
            config,
            token
        ) {
            week[token.substr(0, 2)] = toInt(input);
        });

        addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
            week[token] = hooks.parseTwoDigitYear(input);
        });

        // MOMENTS

        function getSetWeekYear(input) {
            return getSetWeekYearHelper.call(
                this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy
            );
        }

        function getSetISOWeekYear(input) {
            return getSetWeekYearHelper.call(
                this,
                input,
                this.isoWeek(),
                this.isoWeekday(),
                1,
                4
            );
        }

        function getISOWeeksInYear() {
            return weeksInYear(this.year(), 1, 4);
        }

        function getISOWeeksInISOWeekYear() {
            return weeksInYear(this.isoWeekYear(), 1, 4);
        }

        function getWeeksInYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        }

        function getWeeksInWeekYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
        }

        function getSetWeekYearHelper(input, week, weekday, dow, doy) {
            var weeksTarget;
            if (input == null) {
                return weekOfYear(this, dow, doy).year;
            } else {
                weeksTarget = weeksInYear(input, dow, doy);
                if (week > weeksTarget) {
                    week = weeksTarget;
                }
                return setWeekAll.call(this, input, week, weekday, dow, doy);
            }
        }

        function setWeekAll(weekYear, week, weekday, dow, doy) {
            var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
                date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

            this.year(date.getUTCFullYear());
            this.month(date.getUTCMonth());
            this.date(date.getUTCDate());
            return this;
        }

        // FORMATTING

        addFormatToken('Q', 0, 'Qo', 'quarter');

        // ALIASES

        addUnitAlias('quarter', 'Q');

        // PRIORITY

        addUnitPriority('quarter', 7);

        // PARSING

        addRegexToken('Q', match1);
        addParseToken('Q', function (input, array) {
            array[MONTH] = (toInt(input) - 1) * 3;
        });

        // MOMENTS

        function getSetQuarter(input) {
            return input == null
                ? Math.ceil((this.month() + 1) / 3)
                : this.month((input - 1) * 3 + (this.month() % 3));
        }

        // FORMATTING

        addFormatToken('D', ['DD', 2], 'Do', 'date');

        // ALIASES

        addUnitAlias('date', 'D');

        // PRIORITY
        addUnitPriority('date', 9);

        // PARSING

        addRegexToken('D', match1to2);
        addRegexToken('DD', match1to2, match2);
        addRegexToken('Do', function (isStrict, locale) {
            // TODO: Remove "ordinalParse" fallback in next major release.
            return isStrict
                ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
                : locale._dayOfMonthOrdinalParseLenient;
        });

        addParseToken(['D', 'DD'], DATE);
        addParseToken('Do', function (input, array) {
            array[DATE] = toInt(input.match(match1to2)[0]);
        });

        // MOMENTS

        var getSetDayOfMonth = makeGetSet('Date', true);

        // FORMATTING

        addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

        // ALIASES

        addUnitAlias('dayOfYear', 'DDD');

        // PRIORITY
        addUnitPriority('dayOfYear', 4);

        // PARSING

        addRegexToken('DDD', match1to3);
        addRegexToken('DDDD', match3);
        addParseToken(['DDD', 'DDDD'], function (input, array, config) {
            config._dayOfYear = toInt(input);
        });

        // HELPERS

        // MOMENTS

        function getSetDayOfYear(input) {
            var dayOfYear =
                Math.round(
                    (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
                ) + 1;
            return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
        }

        // FORMATTING

        addFormatToken('m', ['mm', 2], 0, 'minute');

        // ALIASES

        addUnitAlias('minute', 'm');

        // PRIORITY

        addUnitPriority('minute', 14);

        // PARSING

        addRegexToken('m', match1to2);
        addRegexToken('mm', match1to2, match2);
        addParseToken(['m', 'mm'], MINUTE);

        // MOMENTS

        var getSetMinute = makeGetSet('Minutes', false);

        // FORMATTING

        addFormatToken('s', ['ss', 2], 0, 'second');

        // ALIASES

        addUnitAlias('second', 's');

        // PRIORITY

        addUnitPriority('second', 15);

        // PARSING

        addRegexToken('s', match1to2);
        addRegexToken('ss', match1to2, match2);
        addParseToken(['s', 'ss'], SECOND);

        // MOMENTS

        var getSetSecond = makeGetSet('Seconds', false);

        // FORMATTING

        addFormatToken('S', 0, 0, function () {
            return ~~(this.millisecond() / 100);
        });

        addFormatToken(0, ['SS', 2], 0, function () {
            return ~~(this.millisecond() / 10);
        });

        addFormatToken(0, ['SSS', 3], 0, 'millisecond');
        addFormatToken(0, ['SSSS', 4], 0, function () {
            return this.millisecond() * 10;
        });
        addFormatToken(0, ['SSSSS', 5], 0, function () {
            return this.millisecond() * 100;
        });
        addFormatToken(0, ['SSSSSS', 6], 0, function () {
            return this.millisecond() * 1000;
        });
        addFormatToken(0, ['SSSSSSS', 7], 0, function () {
            return this.millisecond() * 10000;
        });
        addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
            return this.millisecond() * 100000;
        });
        addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
            return this.millisecond() * 1000000;
        });

        // ALIASES

        addUnitAlias('millisecond', 'ms');

        // PRIORITY

        addUnitPriority('millisecond', 16);

        // PARSING

        addRegexToken('S', match1to3, match1);
        addRegexToken('SS', match1to3, match2);
        addRegexToken('SSS', match1to3, match3);

        var token, getSetMillisecond;
        for (token = 'SSSS'; token.length <= 9; token += 'S') {
            addRegexToken(token, matchUnsigned);
        }

        function parseMs(input, array) {
            array[MILLISECOND] = toInt(('0.' + input) * 1000);
        }

        for (token = 'S'; token.length <= 9; token += 'S') {
            addParseToken(token, parseMs);
        }

        getSetMillisecond = makeGetSet('Milliseconds', false);

        // FORMATTING

        addFormatToken('z', 0, 0, 'zoneAbbr');
        addFormatToken('zz', 0, 0, 'zoneName');

        // MOMENTS

        function getZoneAbbr() {
            return this._isUTC ? 'UTC' : '';
        }

        function getZoneName() {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }

        var proto = Moment.prototype;

        proto.add = add;
        proto.calendar = calendar$1;
        proto.clone = clone;
        proto.diff = diff;
        proto.endOf = endOf;
        proto.format = format;
        proto.from = from;
        proto.fromNow = fromNow;
        proto.to = to;
        proto.toNow = toNow;
        proto.get = stringGet;
        proto.invalidAt = invalidAt;
        proto.isAfter = isAfter;
        proto.isBefore = isBefore;
        proto.isBetween = isBetween;
        proto.isSame = isSame;
        proto.isSameOrAfter = isSameOrAfter;
        proto.isSameOrBefore = isSameOrBefore;
        proto.isValid = isValid$2;
        proto.lang = lang;
        proto.locale = locale;
        proto.localeData = localeData;
        proto.max = prototypeMax;
        proto.min = prototypeMin;
        proto.parsingFlags = parsingFlags;
        proto.set = stringSet;
        proto.startOf = startOf;
        proto.subtract = subtract;
        proto.toArray = toArray;
        proto.toObject = toObject;
        proto.toDate = toDate;
        proto.toISOString = toISOString;
        proto.inspect = inspect;
        if (typeof Symbol !== 'undefined' && Symbol.for != null) {
            proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
                return 'Moment<' + this.format() + '>';
            };
        }
        proto.toJSON = toJSON;
        proto.toString = toString;
        proto.unix = unix;
        proto.valueOf = valueOf;
        proto.creationData = creationData;
        proto.eraName = getEraName;
        proto.eraNarrow = getEraNarrow;
        proto.eraAbbr = getEraAbbr;
        proto.eraYear = getEraYear;
        proto.year = getSetYear;
        proto.isLeapYear = getIsLeapYear;
        proto.weekYear = getSetWeekYear;
        proto.isoWeekYear = getSetISOWeekYear;
        proto.quarter = proto.quarters = getSetQuarter;
        proto.month = getSetMonth;
        proto.daysInMonth = getDaysInMonth;
        proto.week = proto.weeks = getSetWeek;
        proto.isoWeek = proto.isoWeeks = getSetISOWeek;
        proto.weeksInYear = getWeeksInYear;
        proto.weeksInWeekYear = getWeeksInWeekYear;
        proto.isoWeeksInYear = getISOWeeksInYear;
        proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
        proto.date = getSetDayOfMonth;
        proto.day = proto.days = getSetDayOfWeek;
        proto.weekday = getSetLocaleDayOfWeek;
        proto.isoWeekday = getSetISODayOfWeek;
        proto.dayOfYear = getSetDayOfYear;
        proto.hour = proto.hours = getSetHour;
        proto.minute = proto.minutes = getSetMinute;
        proto.second = proto.seconds = getSetSecond;
        proto.millisecond = proto.milliseconds = getSetMillisecond;
        proto.utcOffset = getSetOffset;
        proto.utc = setOffsetToUTC;
        proto.local = setOffsetToLocal;
        proto.parseZone = setOffsetToParsedOffset;
        proto.hasAlignedHourOffset = hasAlignedHourOffset;
        proto.isDST = isDaylightSavingTime;
        proto.isLocal = isLocal;
        proto.isUtcOffset = isUtcOffset;
        proto.isUtc = isUtc;
        proto.isUTC = isUtc;
        proto.zoneAbbr = getZoneAbbr;
        proto.zoneName = getZoneName;
        proto.dates = deprecate(
            'dates accessor is deprecated. Use date instead.',
            getSetDayOfMonth
        );
        proto.months = deprecate(
            'months accessor is deprecated. Use month instead',
            getSetMonth
        );
        proto.years = deprecate(
            'years accessor is deprecated. Use year instead',
            getSetYear
        );
        proto.zone = deprecate(
            'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
            getSetZone
        );
        proto.isDSTShifted = deprecate(
            'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
            isDaylightSavingTimeShifted
        );

        function createUnix(input) {
            return createLocal(input * 1000);
        }

        function createInZone() {
            return createLocal.apply(null, arguments).parseZone();
        }

        function preParsePostFormat(string) {
            return string;
        }

        var proto$1 = Locale.prototype;

        proto$1.calendar = calendar;
        proto$1.longDateFormat = longDateFormat;
        proto$1.invalidDate = invalidDate;
        proto$1.ordinal = ordinal;
        proto$1.preparse = preParsePostFormat;
        proto$1.postformat = preParsePostFormat;
        proto$1.relativeTime = relativeTime;
        proto$1.pastFuture = pastFuture;
        proto$1.set = set;
        proto$1.eras = localeEras;
        proto$1.erasParse = localeErasParse;
        proto$1.erasConvertYear = localeErasConvertYear;
        proto$1.erasAbbrRegex = erasAbbrRegex;
        proto$1.erasNameRegex = erasNameRegex;
        proto$1.erasNarrowRegex = erasNarrowRegex;

        proto$1.months = localeMonths;
        proto$1.monthsShort = localeMonthsShort;
        proto$1.monthsParse = localeMonthsParse;
        proto$1.monthsRegex = monthsRegex;
        proto$1.monthsShortRegex = monthsShortRegex;
        proto$1.week = localeWeek;
        proto$1.firstDayOfYear = localeFirstDayOfYear;
        proto$1.firstDayOfWeek = localeFirstDayOfWeek;

        proto$1.weekdays = localeWeekdays;
        proto$1.weekdaysMin = localeWeekdaysMin;
        proto$1.weekdaysShort = localeWeekdaysShort;
        proto$1.weekdaysParse = localeWeekdaysParse;

        proto$1.weekdaysRegex = weekdaysRegex;
        proto$1.weekdaysShortRegex = weekdaysShortRegex;
        proto$1.weekdaysMinRegex = weekdaysMinRegex;

        proto$1.isPM = localeIsPM;
        proto$1.meridiem = localeMeridiem;

        function get$1(format, index, field, setter) {
            var locale = getLocale(),
                utc = createUTC().set(setter, index);
            return locale[field](utc, format);
        }

        function listMonthsImpl(format, index, field) {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';

            if (index != null) {
                return get$1(format, index, field, 'month');
            }

            var i,
                out = [];
            for (i = 0; i < 12; i++) {
                out[i] = get$1(format, i, field, 'month');
            }
            return out;
        }

        // ()
        // (5)
        // (fmt, 5)
        // (fmt)
        // (true)
        // (true, 5)
        // (true, fmt, 5)
        // (true, fmt)
        function listWeekdaysImpl(localeSorted, format, index, field) {
            if (typeof localeSorted === 'boolean') {
                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            } else {
                format = localeSorted;
                index = format;
                localeSorted = false;

                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            }

            var locale = getLocale(),
                shift = localeSorted ? locale._week.dow : 0,
                i,
                out = [];

            if (index != null) {
                return get$1(format, (index + shift) % 7, field, 'day');
            }

            for (i = 0; i < 7; i++) {
                out[i] = get$1(format, (i + shift) % 7, field, 'day');
            }
            return out;
        }

        function listMonths(format, index) {
            return listMonthsImpl(format, index, 'months');
        }

        function listMonthsShort(format, index) {
            return listMonthsImpl(format, index, 'monthsShort');
        }

        function listWeekdays(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
        }

        function listWeekdaysShort(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
        }

        function listWeekdaysMin(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
        }

        getSetGlobalLocale('en', {
            eras: [
                {
                    since: '0001-01-01',
                    until: +Infinity,
                    offset: 1,
                    name: 'Anno Domini',
                    narrow: 'AD',
                    abbr: 'AD',
                },
                {
                    since: '0000-12-31',
                    until: -Infinity,
                    offset: 1,
                    name: 'Before Christ',
                    narrow: 'BC',
                    abbr: 'BC',
                },
            ],
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function (number) {
                var b = number % 10,
                    output =
                        toInt((number % 100) / 10) === 1
                            ? 'th'
                            : b === 1
                            ? 'st'
                            : b === 2
                            ? 'nd'
                            : b === 3
                            ? 'rd'
                            : 'th';
                return number + output;
            },
        });

        // Side effect imports

        hooks.lang = deprecate(
            'moment.lang is deprecated. Use moment.locale instead.',
            getSetGlobalLocale
        );
        hooks.langData = deprecate(
            'moment.langData is deprecated. Use moment.localeData instead.',
            getLocale
        );

        var mathAbs = Math.abs;

        function abs() {
            var data = this._data;

            this._milliseconds = mathAbs(this._milliseconds);
            this._days = mathAbs(this._days);
            this._months = mathAbs(this._months);

            data.milliseconds = mathAbs(data.milliseconds);
            data.seconds = mathAbs(data.seconds);
            data.minutes = mathAbs(data.minutes);
            data.hours = mathAbs(data.hours);
            data.months = mathAbs(data.months);
            data.years = mathAbs(data.years);

            return this;
        }

        function addSubtract$1(duration, input, value, direction) {
            var other = createDuration(input, value);

            duration._milliseconds += direction * other._milliseconds;
            duration._days += direction * other._days;
            duration._months += direction * other._months;

            return duration._bubble();
        }

        // supports only 2.0-style add(1, 's') or add(duration)
        function add$1(input, value) {
            return addSubtract$1(this, input, value, 1);
        }

        // supports only 2.0-style subtract(1, 's') or subtract(duration)
        function subtract$1(input, value) {
            return addSubtract$1(this, input, value, -1);
        }

        function absCeil(number) {
            if (number < 0) {
                return Math.floor(number);
            } else {
                return Math.ceil(number);
            }
        }

        function bubble() {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds,
                minutes,
                hours,
                years,
                monthsFromDays;

            // if we have a mix of positive and negative values, bubble down first
            // check: https://github.com/moment/moment/issues/2166
            if (
                !(
                    (milliseconds >= 0 && days >= 0 && months >= 0) ||
                    (milliseconds <= 0 && days <= 0 && months <= 0)
                )
            ) {
                milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                days = 0;
                months = 0;
            }

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absFloor(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absFloor(seconds / 60);
            data.minutes = minutes % 60;

            hours = absFloor(minutes / 60);
            data.hours = hours % 24;

            days += absFloor(hours / 24);

            // convert days to months
            monthsFromDays = absFloor(daysToMonths(days));
            months += monthsFromDays;
            days -= absCeil(monthsToDays(monthsFromDays));

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;

            return this;
        }

        function daysToMonths(days) {
            // 400 years have 146097 days (taking into account leap year rules)
            // 400 years have 12 months === 4800
            return (days * 4800) / 146097;
        }

        function monthsToDays(months) {
            // the reverse of daysToMonths
            return (months * 146097) / 4800;
        }

        function as(units) {
            if (!this.isValid()) {
                return NaN;
            }
            var days,
                months,
                milliseconds = this._milliseconds;

            units = normalizeUnits(units);

            if (units === 'month' || units === 'quarter' || units === 'year') {
                days = this._days + milliseconds / 864e5;
                months = this._months + daysToMonths(days);
                switch (units) {
                    case 'month':
                        return months;
                    case 'quarter':
                        return months / 3;
                    case 'year':
                        return months / 12;
                }
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(monthsToDays(this._months));
                switch (units) {
                    case 'week':
                        return days / 7 + milliseconds / 6048e5;
                    case 'day':
                        return days + milliseconds / 864e5;
                    case 'hour':
                        return days * 24 + milliseconds / 36e5;
                    case 'minute':
                        return days * 1440 + milliseconds / 6e4;
                    case 'second':
                        return days * 86400 + milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond':
                        return Math.floor(days * 864e5) + milliseconds;
                    default:
                        throw new Error('Unknown unit ' + units);
                }
            }
        }

        // TODO: Use this.as('ms')?
        function valueOf$1() {
            if (!this.isValid()) {
                return NaN;
            }
            return (
                this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6
            );
        }

        function makeAs(alias) {
            return function () {
                return this.as(alias);
            };
        }

        var asMilliseconds = makeAs('ms'),
            asSeconds = makeAs('s'),
            asMinutes = makeAs('m'),
            asHours = makeAs('h'),
            asDays = makeAs('d'),
            asWeeks = makeAs('w'),
            asMonths = makeAs('M'),
            asQuarters = makeAs('Q'),
            asYears = makeAs('y');

        function clone$1() {
            return createDuration(this);
        }

        function get$2(units) {
            units = normalizeUnits(units);
            return this.isValid() ? this[units + 's']() : NaN;
        }

        function makeGetter(name) {
            return function () {
                return this.isValid() ? this._data[name] : NaN;
            };
        }

        var milliseconds = makeGetter('milliseconds'),
            seconds = makeGetter('seconds'),
            minutes = makeGetter('minutes'),
            hours = makeGetter('hours'),
            days = makeGetter('days'),
            months = makeGetter('months'),
            years = makeGetter('years');

        function weeks() {
            return absFloor(this.days() / 7);
        }

        var round = Math.round,
            thresholds = {
                ss: 44, // a few seconds to seconds
                s: 45, // seconds to minute
                m: 45, // minutes to hour
                h: 22, // hours to day
                d: 26, // days to month/week
                w: null, // weeks to month
                M: 11, // months to year
            };

        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
            var duration = createDuration(posNegDuration).abs(),
                seconds = round(duration.as('s')),
                minutes = round(duration.as('m')),
                hours = round(duration.as('h')),
                days = round(duration.as('d')),
                months = round(duration.as('M')),
                weeks = round(duration.as('w')),
                years = round(duration.as('y')),
                a =
                    (seconds <= thresholds.ss && ['s', seconds]) ||
                    (seconds < thresholds.s && ['ss', seconds]) ||
                    (minutes <= 1 && ['m']) ||
                    (minutes < thresholds.m && ['mm', minutes]) ||
                    (hours <= 1 && ['h']) ||
                    (hours < thresholds.h && ['hh', hours]) ||
                    (days <= 1 && ['d']) ||
                    (days < thresholds.d && ['dd', days]);

            if (thresholds.w != null) {
                a =
                    a ||
                    (weeks <= 1 && ['w']) ||
                    (weeks < thresholds.w && ['ww', weeks]);
            }
            a = a ||
                (months <= 1 && ['M']) ||
                (months < thresholds.M && ['MM', months]) ||
                (years <= 1 && ['y']) || ['yy', years];

            a[2] = withoutSuffix;
            a[3] = +posNegDuration > 0;
            a[4] = locale;
            return substituteTimeAgo.apply(null, a);
        }

        // This function allows you to set the rounding function for relative time strings
        function getSetRelativeTimeRounding(roundingFunction) {
            if (roundingFunction === undefined) {
                return round;
            }
            if (typeof roundingFunction === 'function') {
                round = roundingFunction;
                return true;
            }
            return false;
        }

        // This function allows you to set a threshold for relative time strings
        function getSetRelativeTimeThreshold(threshold, limit) {
            if (thresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return thresholds[threshold];
            }
            thresholds[threshold] = limit;
            if (threshold === 's') {
                thresholds.ss = limit - 1;
            }
            return true;
        }

        function humanize(argWithSuffix, argThresholds) {
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var withSuffix = false,
                th = thresholds,
                locale,
                output;

            if (typeof argWithSuffix === 'object') {
                argThresholds = argWithSuffix;
                argWithSuffix = false;
            }
            if (typeof argWithSuffix === 'boolean') {
                withSuffix = argWithSuffix;
            }
            if (typeof argThresholds === 'object') {
                th = Object.assign({}, thresholds, argThresholds);
                if (argThresholds.s != null && argThresholds.ss == null) {
                    th.ss = argThresholds.s - 1;
                }
            }

            locale = this.localeData();
            output = relativeTime$1(this, !withSuffix, th, locale);

            if (withSuffix) {
                output = locale.pastFuture(+this, output);
            }

            return locale.postformat(output);
        }

        var abs$1 = Math.abs;

        function sign(x) {
            return (x > 0) - (x < 0) || +x;
        }

        function toISOString$1() {
            // for ISO strings we do not use the normal bubbling rules:
            //  * milliseconds bubble up until they become hours
            //  * days do not bubble at all
            //  * months bubble up until they become years
            // This is because there is no context-free conversion between hours and days
            // (think of clock changes)
            // and also not between days and months (28-31 days per month)
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var seconds = abs$1(this._milliseconds) / 1000,
                days = abs$1(this._days),
                months = abs$1(this._months),
                minutes,
                hours,
                years,
                s,
                total = this.asSeconds(),
                totalSign,
                ymSign,
                daysSign,
                hmsSign;

            if (!total) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            // 3600 seconds -> 60 minutes -> 1 hour
            minutes = absFloor(seconds / 60);
            hours = absFloor(minutes / 60);
            seconds %= 60;
            minutes %= 60;

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

            totalSign = total < 0 ? '-' : '';
            ymSign = sign(this._months) !== sign(total) ? '-' : '';
            daysSign = sign(this._days) !== sign(total) ? '-' : '';
            hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

            return (
                totalSign +
                'P' +
                (years ? ymSign + years + 'Y' : '') +
                (months ? ymSign + months + 'M' : '') +
                (days ? daysSign + days + 'D' : '') +
                (hours || minutes || seconds ? 'T' : '') +
                (hours ? hmsSign + hours + 'H' : '') +
                (minutes ? hmsSign + minutes + 'M' : '') +
                (seconds ? hmsSign + s + 'S' : '')
            );
        }

        var proto$2 = Duration.prototype;

        proto$2.isValid = isValid$1;
        proto$2.abs = abs;
        proto$2.add = add$1;
        proto$2.subtract = subtract$1;
        proto$2.as = as;
        proto$2.asMilliseconds = asMilliseconds;
        proto$2.asSeconds = asSeconds;
        proto$2.asMinutes = asMinutes;
        proto$2.asHours = asHours;
        proto$2.asDays = asDays;
        proto$2.asWeeks = asWeeks;
        proto$2.asMonths = asMonths;
        proto$2.asQuarters = asQuarters;
        proto$2.asYears = asYears;
        proto$2.valueOf = valueOf$1;
        proto$2._bubble = bubble;
        proto$2.clone = clone$1;
        proto$2.get = get$2;
        proto$2.milliseconds = milliseconds;
        proto$2.seconds = seconds;
        proto$2.minutes = minutes;
        proto$2.hours = hours;
        proto$2.days = days;
        proto$2.weeks = weeks;
        proto$2.months = months;
        proto$2.years = years;
        proto$2.humanize = humanize;
        proto$2.toISOString = toISOString$1;
        proto$2.toString = toISOString$1;
        proto$2.toJSON = toISOString$1;
        proto$2.locale = locale;
        proto$2.localeData = localeData;

        proto$2.toIsoString = deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
            toISOString$1
        );
        proto$2.lang = lang;

        // FORMATTING

        addFormatToken('X', 0, 0, 'unix');
        addFormatToken('x', 0, 0, 'valueOf');

        // PARSING

        addRegexToken('x', matchSigned);
        addRegexToken('X', matchTimestamp);
        addParseToken('X', function (input, array, config) {
            config._d = new Date(parseFloat(input) * 1000);
        });
        addParseToken('x', function (input, array, config) {
            config._d = new Date(toInt(input));
        });

        //! moment.js

        hooks.version = '2.29.1';

        setHookCallback(createLocal);

        hooks.fn = proto;
        hooks.min = min;
        hooks.max = max;
        hooks.now = now;
        hooks.utc = createUTC;
        hooks.unix = createUnix;
        hooks.months = listMonths;
        hooks.isDate = isDate;
        hooks.locale = getSetGlobalLocale;
        hooks.invalid = createInvalid;
        hooks.duration = createDuration;
        hooks.isMoment = isMoment;
        hooks.weekdays = listWeekdays;
        hooks.parseZone = createInZone;
        hooks.localeData = getLocale;
        hooks.isDuration = isDuration;
        hooks.monthsShort = listMonthsShort;
        hooks.weekdaysMin = listWeekdaysMin;
        hooks.defineLocale = defineLocale;
        hooks.updateLocale = updateLocale;
        hooks.locales = listLocales;
        hooks.weekdaysShort = listWeekdaysShort;
        hooks.normalizeUnits = normalizeUnits;
        hooks.relativeTimeRounding = getSetRelativeTimeRounding;
        hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
        hooks.calendarFormat = getCalendarFormat;
        hooks.prototype = proto;

        // currently HTML5 input type only supports 24-hour formats
        hooks.HTML5_FMT = {
            DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
            DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
            DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
            DATE: 'YYYY-MM-DD', // <input type="date" />
            TIME: 'HH:mm', // <input type="time" />
            TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
            TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
            WEEK: 'GGGG-[W]WW', // <input type="week" />
            MONTH: 'YYYY-MM', // <input type="month" />
        };

        return hooks;

    })));
    });

    /*! @preserve
     * numeral.js
     * version : 2.0.6
     * author : Adam Draper
     * license : MIT
     * http://adamwdraper.github.com/Numeral-js/
     */

    var numeral = createCommonjsModule(function (module) {
    (function (global, factory) {
        if (module.exports) {
            module.exports = factory();
        } else {
            global.numeral = factory();
        }
    }(commonjsGlobal, function () {
        /************************************
            Variables
        ************************************/

        var numeral,
            _,
            VERSION = '2.0.6',
            formats = {},
            locales = {},
            defaults = {
                currentLocale: 'en',
                zeroFormat: null,
                nullFormat: null,
                defaultFormat: '0,0',
                scalePercentBy100: true
            },
            options = {
                currentLocale: defaults.currentLocale,
                zeroFormat: defaults.zeroFormat,
                nullFormat: defaults.nullFormat,
                defaultFormat: defaults.defaultFormat,
                scalePercentBy100: defaults.scalePercentBy100
            };


        /************************************
            Constructors
        ************************************/

        // Numeral prototype object
        function Numeral(input, number) {
            this._input = input;

            this._value = number;
        }

        numeral = function(input) {
            var value,
                kind,
                unformatFunction,
                regexp;

            if (numeral.isNumeral(input)) {
                value = input.value();
            } else if (input === 0 || typeof input === 'undefined') {
                value = 0;
            } else if (input === null || _.isNaN(input)) {
                value = null;
            } else if (typeof input === 'string') {
                if (options.zeroFormat && input === options.zeroFormat) {
                    value = 0;
                } else if (options.nullFormat && input === options.nullFormat || !input.replace(/[^0-9]+/g, '').length) {
                    value = null;
                } else {
                    for (kind in formats) {
                        regexp = typeof formats[kind].regexps.unformat === 'function' ? formats[kind].regexps.unformat() : formats[kind].regexps.unformat;

                        if (regexp && input.match(regexp)) {
                            unformatFunction = formats[kind].unformat;

                            break;
                        }
                    }

                    unformatFunction = unformatFunction || numeral._.stringToNumber;

                    value = unformatFunction(input);
                }
            } else {
                value = Number(input)|| null;
            }

            return new Numeral(input, value);
        };

        // version number
        numeral.version = VERSION;

        // compare numeral object
        numeral.isNumeral = function(obj) {
            return obj instanceof Numeral;
        };

        // helper functions
        numeral._ = _ = {
            // formats numbers separators, decimals places, signs, abbreviations
            numberToFormat: function(value, format, roundingFunction) {
                var locale = locales[numeral.options.currentLocale],
                    negP = false,
                    optDec = false,
                    leadingCount = 0,
                    abbr = '',
                    trillion = 1000000000000,
                    billion = 1000000000,
                    million = 1000000,
                    thousand = 1000,
                    decimal = '',
                    neg = false,
                    abbrForce, // force abbreviation
                    abs,
                    int,
                    precision,
                    signed,
                    thousands,
                    output;

                // make sure we never format a null value
                value = value || 0;

                abs = Math.abs(value);

                // see if we should use parentheses for negative number or if we should prefix with a sign
                // if both are present we default to parentheses
                if (numeral._.includes(format, '(')) {
                    negP = true;
                    format = format.replace(/[\(|\)]/g, '');
                } else if (numeral._.includes(format, '+') || numeral._.includes(format, '-')) {
                    signed = numeral._.includes(format, '+') ? format.indexOf('+') : value < 0 ? format.indexOf('-') : -1;
                    format = format.replace(/[\+|\-]/g, '');
                }

                // see if abbreviation is wanted
                if (numeral._.includes(format, 'a')) {
                    abbrForce = format.match(/a(k|m|b|t)?/);

                    abbrForce = abbrForce ? abbrForce[1] : false;

                    // check for space before abbreviation
                    if (numeral._.includes(format, ' a')) {
                        abbr = ' ';
                    }

                    format = format.replace(new RegExp(abbr + 'a[kmbt]?'), '');

                    if (abs >= trillion && !abbrForce || abbrForce === 't') {
                        // trillion
                        abbr += locale.abbreviations.trillion;
                        value = value / trillion;
                    } else if (abs < trillion && abs >= billion && !abbrForce || abbrForce === 'b') {
                        // billion
                        abbr += locale.abbreviations.billion;
                        value = value / billion;
                    } else if (abs < billion && abs >= million && !abbrForce || abbrForce === 'm') {
                        // million
                        abbr += locale.abbreviations.million;
                        value = value / million;
                    } else if (abs < million && abs >= thousand && !abbrForce || abbrForce === 'k') {
                        // thousand
                        abbr += locale.abbreviations.thousand;
                        value = value / thousand;
                    }
                }

                // check for optional decimals
                if (numeral._.includes(format, '[.]')) {
                    optDec = true;
                    format = format.replace('[.]', '.');
                }

                // break number and format
                int = value.toString().split('.')[0];
                precision = format.split('.')[1];
                thousands = format.indexOf(',');
                leadingCount = (format.split('.')[0].split(',')[0].match(/0/g) || []).length;

                if (precision) {
                    if (numeral._.includes(precision, '[')) {
                        precision = precision.replace(']', '');
                        precision = precision.split('[');
                        decimal = numeral._.toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                    } else {
                        decimal = numeral._.toFixed(value, precision.length, roundingFunction);
                    }

                    int = decimal.split('.')[0];

                    if (numeral._.includes(decimal, '.')) {
                        decimal = locale.delimiters.decimal + decimal.split('.')[1];
                    } else {
                        decimal = '';
                    }

                    if (optDec && Number(decimal.slice(1)) === 0) {
                        decimal = '';
                    }
                } else {
                    int = numeral._.toFixed(value, 0, roundingFunction);
                }

                // check abbreviation again after rounding
                if (abbr && !abbrForce && Number(int) >= 1000 && abbr !== locale.abbreviations.trillion) {
                    int = String(Number(int) / 1000);

                    switch (abbr) {
                        case locale.abbreviations.thousand:
                            abbr = locale.abbreviations.million;
                            break;
                        case locale.abbreviations.million:
                            abbr = locale.abbreviations.billion;
                            break;
                        case locale.abbreviations.billion:
                            abbr = locale.abbreviations.trillion;
                            break;
                    }
                }


                // format number
                if (numeral._.includes(int, '-')) {
                    int = int.slice(1);
                    neg = true;
                }

                if (int.length < leadingCount) {
                    for (var i = leadingCount - int.length; i > 0; i--) {
                        int = '0' + int;
                    }
                }

                if (thousands > -1) {
                    int = int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + locale.delimiters.thousands);
                }

                if (format.indexOf('.') === 0) {
                    int = '';
                }

                output = int + decimal + (abbr ? abbr : '');

                if (negP) {
                    output = (negP && neg ? '(' : '') + output + (negP && neg ? ')' : '');
                } else {
                    if (signed >= 0) {
                        output = signed === 0 ? (neg ? '-' : '+') + output : output + (neg ? '-' : '+');
                    } else if (neg) {
                        output = '-' + output;
                    }
                }

                return output;
            },
            // unformats numbers separators, decimals places, signs, abbreviations
            stringToNumber: function(string) {
                var locale = locales[options.currentLocale],
                    stringOriginal = string,
                    abbreviations = {
                        thousand: 3,
                        million: 6,
                        billion: 9,
                        trillion: 12
                    },
                    abbreviation,
                    value,
                    regexp;

                if (options.zeroFormat && string === options.zeroFormat) {
                    value = 0;
                } else if (options.nullFormat && string === options.nullFormat || !string.replace(/[^0-9]+/g, '').length) {
                    value = null;
                } else {
                    value = 1;

                    if (locale.delimiters.decimal !== '.') {
                        string = string.replace(/\./g, '').replace(locale.delimiters.decimal, '.');
                    }

                    for (abbreviation in abbreviations) {
                        regexp = new RegExp('[^a-zA-Z]' + locale.abbreviations[abbreviation] + '(?:\\)|(\\' + locale.currency.symbol + ')?(?:\\))?)?$');

                        if (stringOriginal.match(regexp)) {
                            value *= Math.pow(10, abbreviations[abbreviation]);
                            break;
                        }
                    }

                    // check for negative number
                    value *= (string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2 ? 1 : -1;

                    // remove non numbers
                    string = string.replace(/[^0-9\.]+/g, '');

                    value *= Number(string);
                }

                return value;
            },
            isNaN: function(value) {
                return typeof value === 'number' && isNaN(value);
            },
            includes: function(string, search) {
                return string.indexOf(search) !== -1;
            },
            insert: function(string, subString, start) {
                return string.slice(0, start) + subString + string.slice(start);
            },
            reduce: function(array, callback /*, initialValue*/) {
                if (this === null) {
                    throw new TypeError('Array.prototype.reduce called on null or undefined');
                }

                if (typeof callback !== 'function') {
                    throw new TypeError(callback + ' is not a function');
                }

                var t = Object(array),
                    len = t.length >>> 0,
                    k = 0,
                    value;

                if (arguments.length === 3) {
                    value = arguments[2];
                } else {
                    while (k < len && !(k in t)) {
                        k++;
                    }

                    if (k >= len) {
                        throw new TypeError('Reduce of empty array with no initial value');
                    }

                    value = t[k++];
                }
                for (; k < len; k++) {
                    if (k in t) {
                        value = callback(value, t[k], k, t);
                    }
                }
                return value;
            },
            /**
             * Computes the multiplier necessary to make x >= 1,
             * effectively eliminating miscalculations caused by
             * finite precision.
             */
            multiplier: function (x) {
                var parts = x.toString().split('.');

                return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
            },
            /**
             * Given a variable number of arguments, returns the maximum
             * multiplier that must be used to normalize an operation involving
             * all of them.
             */
            correctionFactor: function () {
                var args = Array.prototype.slice.call(arguments);

                return args.reduce(function(accum, next) {
                    var mn = _.multiplier(next);
                    return accum > mn ? accum : mn;
                }, 1);
            },
            /**
             * Implementation of toFixed() that treats floats more like decimals
             *
             * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
             * problems for accounting- and finance-related software.
             */
            toFixed: function(value, maxDecimals, roundingFunction, optionals) {
                var splitValue = value.toString().split('.'),
                    minDecimals = maxDecimals - (optionals || 0),
                    boundedPrecision,
                    optionalsRegExp,
                    power,
                    output;

                // Use the smallest precision value possible to avoid errors from floating point representation
                if (splitValue.length === 2) {
                  boundedPrecision = Math.min(Math.max(splitValue[1].length, minDecimals), maxDecimals);
                } else {
                  boundedPrecision = minDecimals;
                }

                power = Math.pow(10, boundedPrecision);

                // Multiply up by precision, round accurately, then divide and use native toFixed():
                output = (roundingFunction(value + 'e+' + boundedPrecision) / power).toFixed(boundedPrecision);

                if (optionals > maxDecimals - boundedPrecision) {
                    optionalsRegExp = new RegExp('\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$');
                    output = output.replace(optionalsRegExp, '');
                }

                return output;
            }
        };

        // avaliable options
        numeral.options = options;

        // avaliable formats
        numeral.formats = formats;

        // avaliable formats
        numeral.locales = locales;

        // This function sets the current locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        numeral.locale = function(key) {
            if (key) {
                options.currentLocale = key.toLowerCase();
            }

            return options.currentLocale;
        };

        // This function provides access to the loaded locale data.  If
        // no arguments are passed in, it will simply return the current
        // global locale object.
        numeral.localeData = function(key) {
            if (!key) {
                return locales[options.currentLocale];
            }

            key = key.toLowerCase();

            if (!locales[key]) {
                throw new Error('Unknown locale : ' + key);
            }

            return locales[key];
        };

        numeral.reset = function() {
            for (var property in defaults) {
                options[property] = defaults[property];
            }
        };

        numeral.zeroFormat = function(format) {
            options.zeroFormat = typeof(format) === 'string' ? format : null;
        };

        numeral.nullFormat = function (format) {
            options.nullFormat = typeof(format) === 'string' ? format : null;
        };

        numeral.defaultFormat = function(format) {
            options.defaultFormat = typeof(format) === 'string' ? format : '0.0';
        };

        numeral.register = function(type, name, format) {
            name = name.toLowerCase();

            if (this[type + 's'][name]) {
                throw new TypeError(name + ' ' + type + ' already registered.');
            }

            this[type + 's'][name] = format;

            return format;
        };


        numeral.validate = function(val, culture) {
            var _decimalSep,
                _thousandSep,
                _currSymbol,
                _valArray,
                _abbrObj,
                _thousandRegEx,
                localeData,
                temp;

            //coerce val to string
            if (typeof val !== 'string') {
                val += '';

                if (console.warn) {
                    console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
                }
            }

            //trim whitespaces from either sides
            val = val.trim();

            //if val is just digits return true
            if (!!val.match(/^\d+$/)) {
                return true;
            }

            //if val is empty return false
            if (val === '') {
                return false;
            }

            //get the decimal and thousands separator from numeral.localeData
            try {
                //check if the culture is understood by numeral. if not, default it to current locale
                localeData = numeral.localeData(culture);
            } catch (e) {
                localeData = numeral.localeData(numeral.locale());
            }

            //setup the delimiters and currency symbol based on culture/locale
            _currSymbol = localeData.currency.symbol;
            _abbrObj = localeData.abbreviations;
            _decimalSep = localeData.delimiters.decimal;
            if (localeData.delimiters.thousands === '.') {
                _thousandSep = '\\.';
            } else {
                _thousandSep = localeData.delimiters.thousands;
            }

            // validating currency symbol
            temp = val.match(/^[^\d]+/);
            if (temp !== null) {
                val = val.substr(1);
                if (temp[0] !== _currSymbol) {
                    return false;
                }
            }

            //validating abbreviation symbol
            temp = val.match(/[^\d]+$/);
            if (temp !== null) {
                val = val.slice(0, -1);
                if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million && temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
                    return false;
                }
            }

            _thousandRegEx = new RegExp(_thousandSep + '{2}');

            if (!val.match(/[^\d.,]/g)) {
                _valArray = val.split(_decimalSep);
                if (_valArray.length > 2) {
                    return false;
                } else {
                    if (_valArray.length < 2) {
                        return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
                    } else {
                        if (_valArray[0].length === 1) {
                            return ( !! _valArray[0].match(/^\d+$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                        } else {
                            return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                        }
                    }
                }
            }

            return false;
        };


        /************************************
            Numeral Prototype
        ************************************/

        numeral.fn = Numeral.prototype = {
            clone: function() {
                return numeral(this);
            },
            format: function(inputString, roundingFunction) {
                var value = this._value,
                    format = inputString || options.defaultFormat,
                    kind,
                    output,
                    formatFunction;

                // make sure we have a roundingFunction
                roundingFunction = roundingFunction || Math.round;

                // format based on value
                if (value === 0 && options.zeroFormat !== null) {
                    output = options.zeroFormat;
                } else if (value === null && options.nullFormat !== null) {
                    output = options.nullFormat;
                } else {
                    for (kind in formats) {
                        if (format.match(formats[kind].regexps.format)) {
                            formatFunction = formats[kind].format;

                            break;
                        }
                    }

                    formatFunction = formatFunction || numeral._.numberToFormat;

                    output = formatFunction(value, format, roundingFunction);
                }

                return output;
            },
            value: function() {
                return this._value;
            },
            input: function() {
                return this._input;
            },
            set: function(value) {
                this._value = Number(value);

                return this;
            },
            add: function(value) {
                var corrFactor = _.correctionFactor.call(null, this._value, value);

                function cback(accum, curr, currI, O) {
                    return accum + Math.round(corrFactor * curr);
                }

                this._value = _.reduce([this._value, value], cback, 0) / corrFactor;

                return this;
            },
            subtract: function(value) {
                var corrFactor = _.correctionFactor.call(null, this._value, value);

                function cback(accum, curr, currI, O) {
                    return accum - Math.round(corrFactor * curr);
                }

                this._value = _.reduce([value], cback, Math.round(this._value * corrFactor)) / corrFactor;

                return this;
            },
            multiply: function(value) {
                function cback(accum, curr, currI, O) {
                    var corrFactor = _.correctionFactor(accum, curr);
                    return Math.round(accum * corrFactor) * Math.round(curr * corrFactor) / Math.round(corrFactor * corrFactor);
                }

                this._value = _.reduce([this._value, value], cback, 1);

                return this;
            },
            divide: function(value) {
                function cback(accum, curr, currI, O) {
                    var corrFactor = _.correctionFactor(accum, curr);
                    return Math.round(accum * corrFactor) / Math.round(curr * corrFactor);
                }

                this._value = _.reduce([this._value, value], cback);

                return this;
            },
            difference: function(value) {
                return Math.abs(numeral(this._value).subtract(value).value());
            }
        };

        /************************************
            Default Locale && Format
        ************************************/

        numeral.register('locale', 'en', {
            delimiters: {
                thousands: ',',
                decimal: '.'
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            ordinal: function(number) {
                var b = number % 10;
                return (~~(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
            },
            currency: {
                symbol: '$'
            }
        });

        

    (function() {
            numeral.register('format', 'bps', {
                regexps: {
                    format: /(BPS)/,
                    unformat: /(BPS)/
                },
                format: function(value, format, roundingFunction) {
                    var space = numeral._.includes(format, ' BPS') ? ' ' : '',
                        output;

                    value = value * 10000;

                    // check for space before BPS
                    format = format.replace(/\s?BPS/, '');

                    output = numeral._.numberToFormat(value, format, roundingFunction);

                    if (numeral._.includes(output, ')')) {
                        output = output.split('');

                        output.splice(-1, 0, space + 'BPS');

                        output = output.join('');
                    } else {
                        output = output + space + 'BPS';
                    }

                    return output;
                },
                unformat: function(string) {
                    return +(numeral._.stringToNumber(string) * 0.0001).toFixed(15);
                }
            });
    })();


    (function() {
            var decimal = {
                base: 1000,
                suffixes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            },
            binary = {
                base: 1024,
                suffixes: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
            };

        var allSuffixes =  decimal.suffixes.concat(binary.suffixes.filter(function (item) {
                return decimal.suffixes.indexOf(item) < 0;
            }));
            var unformatRegex = allSuffixes.join('|');
            // Allow support for BPS (http://www.investopedia.com/terms/b/basispoint.asp)
            unformatRegex = '(' + unformatRegex.replace('B', 'B(?!PS)') + ')';

        numeral.register('format', 'bytes', {
            regexps: {
                format: /([0\s]i?b)/,
                unformat: new RegExp(unformatRegex)
            },
            format: function(value, format, roundingFunction) {
                var output,
                    bytes = numeral._.includes(format, 'ib') ? binary : decimal,
                    suffix = numeral._.includes(format, ' b') || numeral._.includes(format, ' ib') ? ' ' : '',
                    power,
                    min,
                    max;

                // check for space before
                format = format.replace(/\s?i?b/, '');

                for (power = 0; power <= bytes.suffixes.length; power++) {
                    min = Math.pow(bytes.base, power);
                    max = Math.pow(bytes.base, power + 1);

                    if (value === null || value === 0 || value >= min && value < max) {
                        suffix += bytes.suffixes[power];

                        if (min > 0) {
                            value = value / min;
                        }

                        break;
                    }
                }

                output = numeral._.numberToFormat(value, format, roundingFunction);

                return output + suffix;
            },
            unformat: function(string) {
                var value = numeral._.stringToNumber(string),
                    power,
                    bytesMultiplier;

                if (value) {
                    for (power = decimal.suffixes.length - 1; power >= 0; power--) {
                        if (numeral._.includes(string, decimal.suffixes[power])) {
                            bytesMultiplier = Math.pow(decimal.base, power);

                            break;
                        }

                        if (numeral._.includes(string, binary.suffixes[power])) {
                            bytesMultiplier = Math.pow(binary.base, power);

                            break;
                        }
                    }

                    value *= (bytesMultiplier || 1);
                }

                return value;
            }
        });
    })();


    (function() {
            numeral.register('format', 'currency', {
            regexps: {
                format: /(\$)/
            },
            format: function(value, format, roundingFunction) {
                var locale = numeral.locales[numeral.options.currentLocale],
                    symbols = {
                        before: format.match(/^([\+|\-|\(|\s|\$]*)/)[0],
                        after: format.match(/([\+|\-|\)|\s|\$]*)$/)[0]
                    },
                    output,
                    symbol,
                    i;

                // strip format of spaces and $
                format = format.replace(/\s?\$\s?/, '');

                // format the number
                output = numeral._.numberToFormat(value, format, roundingFunction);

                // update the before and after based on value
                if (value >= 0) {
                    symbols.before = symbols.before.replace(/[\-\(]/, '');
                    symbols.after = symbols.after.replace(/[\-\)]/, '');
                } else if (value < 0 && (!numeral._.includes(symbols.before, '-') && !numeral._.includes(symbols.before, '('))) {
                    symbols.before = '-' + symbols.before;
                }

                // loop through each before symbol
                for (i = 0; i < symbols.before.length; i++) {
                    symbol = symbols.before[i];

                    switch (symbol) {
                        case '$':
                            output = numeral._.insert(output, locale.currency.symbol, i);
                            break;
                        case ' ':
                            output = numeral._.insert(output, ' ', i + locale.currency.symbol.length - 1);
                            break;
                    }
                }

                // loop through each after symbol
                for (i = symbols.after.length - 1; i >= 0; i--) {
                    symbol = symbols.after[i];

                    switch (symbol) {
                        case '$':
                            output = i === symbols.after.length - 1 ? output + locale.currency.symbol : numeral._.insert(output, locale.currency.symbol, -(symbols.after.length - (1 + i)));
                            break;
                        case ' ':
                            output = i === symbols.after.length - 1 ? output + ' ' : numeral._.insert(output, ' ', -(symbols.after.length - (1 + i) + locale.currency.symbol.length - 1));
                            break;
                    }
                }


                return output;
            }
        });
    })();


    (function() {
            numeral.register('format', 'exponential', {
            regexps: {
                format: /(e\+|e-)/,
                unformat: /(e\+|e-)/
            },
            format: function(value, format, roundingFunction) {
                var output,
                    exponential = typeof value === 'number' && !numeral._.isNaN(value) ? value.toExponential() : '0e+0',
                    parts = exponential.split('e');

                format = format.replace(/e[\+|\-]{1}0/, '');

                output = numeral._.numberToFormat(Number(parts[0]), format, roundingFunction);

                return output + 'e' + parts[1];
            },
            unformat: function(string) {
                var parts = numeral._.includes(string, 'e+') ? string.split('e+') : string.split('e-'),
                    value = Number(parts[0]),
                    power = Number(parts[1]);

                power = numeral._.includes(string, 'e-') ? power *= -1 : power;

                function cback(accum, curr, currI, O) {
                    var corrFactor = numeral._.correctionFactor(accum, curr),
                        num = (accum * corrFactor) * (curr * corrFactor) / (corrFactor * corrFactor);
                    return num;
                }

                return numeral._.reduce([value, Math.pow(10, power)], cback, 1);
            }
        });
    })();


    (function() {
            numeral.register('format', 'ordinal', {
            regexps: {
                format: /(o)/
            },
            format: function(value, format, roundingFunction) {
                var locale = numeral.locales[numeral.options.currentLocale],
                    output,
                    ordinal = numeral._.includes(format, ' o') ? ' ' : '';

                // check for space before
                format = format.replace(/\s?o/, '');

                ordinal += locale.ordinal(value);

                output = numeral._.numberToFormat(value, format, roundingFunction);

                return output + ordinal;
            }
        });
    })();


    (function() {
            numeral.register('format', 'percentage', {
            regexps: {
                format: /(%)/,
                unformat: /(%)/
            },
            format: function(value, format, roundingFunction) {
                var space = numeral._.includes(format, ' %') ? ' ' : '',
                    output;

                if (numeral.options.scalePercentBy100) {
                    value = value * 100;
                }

                // check for space before %
                format = format.replace(/\s?\%/, '');

                output = numeral._.numberToFormat(value, format, roundingFunction);

                if (numeral._.includes(output, ')')) {
                    output = output.split('');

                    output.splice(-1, 0, space + '%');

                    output = output.join('');
                } else {
                    output = output + space + '%';
                }

                return output;
            },
            unformat: function(string) {
                var number = numeral._.stringToNumber(string);
                if (numeral.options.scalePercentBy100) {
                    return number * 0.01;
                }
                return number;
            }
        });
    })();


    (function() {
            numeral.register('format', 'time', {
            regexps: {
                format: /(:)/,
                unformat: /(:)/
            },
            format: function(value, format, roundingFunction) {
                var hours = Math.floor(value / 60 / 60),
                    minutes = Math.floor((value - (hours * 60 * 60)) / 60),
                    seconds = Math.round(value - (hours * 60 * 60) - (minutes * 60));

                return hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
            },
            unformat: function(string) {
                var timeArray = string.split(':'),
                    seconds = 0;

                // turn hours and minutes into seconds and add them all up
                if (timeArray.length === 3) {
                    // hours
                    seconds = seconds + (Number(timeArray[0]) * 60 * 60);
                    // minutes
                    seconds = seconds + (Number(timeArray[1]) * 60);
                    // seconds
                    seconds = seconds + Number(timeArray[2]);
                } else if (timeArray.length === 2) {
                    // minutes
                    seconds = seconds + (Number(timeArray[0]) * 60);
                    // seconds
                    seconds = seconds + Number(timeArray[1]);
                }
                return Number(seconds);
            }
        });
    })();

    return numeral;
    }));
    });

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/TweetBlock.svelte generated by Svelte v3.40.1 */
    const file$6 = "src/TweetBlock.svelte";

    // (28:4) {#if conclusion}
    function create_if_block$3(ctx) {
    	let div;
    	let div_intro;

    	function select_block_type(ctx, dirty) {
    		if (/*correct*/ ctx[7] === false) return create_if_block_1$2;
    		if (/*correct*/ ctx[7]) return create_if_block_2$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "absolute z-50");
    			set_style(div, "left", "calc(50% - 4rem)");
    			set_style(div, "top", "calc(50% - 4rem)");
    			add_location(div, file$6, 28, 8, 716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, { duration: 300, delay: 300 });
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(28:4) {#if conclusion}",
    		ctx
    	});

    	return block;
    }

    // (39:26) 
    function create_if_block_2$2(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z");
    			add_location(path, file$6, 45, 20, 1449);
    			add_location(g, file$6, 44, 16, 1425);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			set_style(svg, "color", "rgb(29, 161, 242)");
    			set_style(svg, "fill", "currentColor");
    			attr_dev(svg, "class", "w-32 h-32");
    			add_location(svg, file$6, 39, 12, 1250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(39:26) ",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#if correct === false}
    function create_if_block_1$2(ctx) {
    	let svg;
    	let path;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(path, "d", "M29.5 35L165.5 171");
    			attr_dev(path, "stroke-width", "25");
    			add_location(path, file$6, 35, 16, 1072);
    			attr_dev(circle, "cx", "100");
    			attr_dev(circle, "cy", "100");
    			attr_dev(circle, "r", "87.5");
    			attr_dev(circle, "stroke-width", "25");
    			add_location(circle, file$6, 36, 16, 1137);
    			attr_dev(svg, "class", "w-32 h-32 text-red-400");
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 34, 12, 928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(34:8) {#if correct === false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div16;
    	let t0;
    	let div15;
    	let div5;
    	let div3;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let div0;
    	let span0;
    	let t2;
    	let t3;
    	let svg0;
    	let g0;
    	let path0;
    	let t4;
    	let div1;
    	let t5;
    	let t6;
    	let t7;
    	let div4;
    	let svg1;
    	let g1;
    	let path1;
    	let t8;
    	let div6;
    	let t9;
    	let t10;
    	let div14;
    	let div9;
    	let div7;
    	let t11_value = /*twitterDateFormatter*/ ctx[8](/*date*/ ctx[4]) + "";
    	let t11;
    	let t12;
    	let div8;
    	let svg2;
    	let g2;
    	let path2;
    	let circle;
    	let path3;
    	let t13;
    	let hr;
    	let t14;
    	let div13;
    	let div10;
    	let svg3;
    	let g3;
    	let path4;
    	let t15;
    	let span1;
    	let t16_value = /*numberFormatter*/ ctx[9](/*favorites*/ ctx[5]) + "";
    	let t16;
    	let t17;
    	let div11;
    	let svg4;
    	let g4;
    	let path5;
    	let t18;
    	let span2;
    	let t19_value = /*numberFormatter*/ ctx[9](/*retweets*/ ctx[6]) + "";
    	let t19;
    	let t20;
    	let div12;
    	let svg5;
    	let g5;
    	let path6;
    	let path7;
    	let t21;
    	let span3;
    	let if_block = /*conclusion*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div15 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t2 = text(/*fullName*/ ctx[1]);
    			t3 = space();
    			svg0 = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t4 = space();
    			div1 = element("div");
    			t5 = text("@");
    			t6 = text(/*username*/ ctx[2]);
    			t7 = space();
    			div4 = element("div");
    			svg1 = svg_element("svg");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			t8 = space();
    			div6 = element("div");
    			t9 = text(/*text*/ ctx[3]);
    			t10 = space();
    			div14 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			t11 = text(t11_value);
    			t12 = space();
    			div8 = element("div");
    			svg2 = svg_element("svg");
    			g2 = svg_element("g");
    			path2 = svg_element("path");
    			circle = svg_element("circle");
    			path3 = svg_element("path");
    			t13 = space();
    			hr = element("hr");
    			t14 = space();
    			div13 = element("div");
    			div10 = element("div");
    			svg3 = svg_element("svg");
    			g3 = svg_element("g");
    			path4 = svg_element("path");
    			t15 = space();
    			span1 = element("span");
    			t16 = text(t16_value);
    			t17 = space();
    			div11 = element("div");
    			svg4 = svg_element("svg");
    			g4 = svg_element("g");
    			path5 = svg_element("path");
    			t18 = space();
    			span2 = element("span");
    			t19 = text(t19_value);
    			t20 = space();
    			div12 = element("div");
    			svg5 = svg_element("svg");
    			g5 = svg_element("g");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			t21 = space();
    			span3 = element("span");
    			span3.textContent = "Copy link to Tweet";
    			attr_dev(img, "class", "img-fluid rounded-full w-12 h-12");
    			if (!src_url_equal(img.src, img_src_value = "images/th.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Donald Trump Twitter");
    			add_location(img, file$6, 55, 16, 2532);
    			attr_dev(path0, "d", "M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z");
    			add_location(path0, file$6, 67, 36, 3235);
    			add_location(g0, file$6, 66, 32, 3195);
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "aria-label", "Verified account");
    			set_style(svg0, "color", "rgb(29, 161, 242)");
    			set_style(svg0, "fill", "currentColor");
    			attr_dev(svg0, "class", "inline-block h-4 ml-0 max-w-full relative align-text-bottom select-none");
    			add_location(svg0, file$6, 60, 28, 2816);
    			add_location(span0, file$6, 58, 24, 2742);
    			attr_dev(div0, "class", "font-bold text-md");
    			add_location(div0, file$6, 57, 20, 2686);
    			attr_dev(div1, "class", "text-sm text-gray-500");
    			add_location(div1, file$6, 73, 20, 4216);
    			attr_dev(div2, "class", "pl-2 pt-1");
    			add_location(div2, file$6, 56, 16, 2642);
    			attr_dev(div3, "class", "pb-2 flex");
    			add_location(div3, file$6, 54, 12, 2492);
    			attr_dev(path1, "d", "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z");
    			add_location(path1, file$6, 85, 24, 4692);
    			add_location(g1, file$6, 84, 20, 4664);
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "class", "inline-block h-6 m-0 max-w-full relative align-text-bottom select-none w-6");
    			set_style(svg1, "color", "rgb(29, 161, 242)");
    			set_style(svg1, "fill", "currentColor");
    			add_location(svg1, file$6, 79, 16, 4404);
    			attr_dev(div4, "class", "pb-0");
    			add_location(div4, file$6, 78, 12, 4369);
    			attr_dev(div5, "class", "flex items-start justify-between");
    			add_location(div5, file$6, 53, 8, 2433);
    			attr_dev(div6, "class", "pt-2 leading-6 text-lg ");
    			add_location(div6, file$6, 91, 8, 5438);
    			attr_dev(div7, "class", "text-sm pt-2 ");
    			add_location(div7, file$6, 96, 16, 5642);
    			attr_dev(path2, "d", "M12 18.042c-.553 0-1-.447-1-1v-5.5c0-.553.447-1 1-1s1 .447 1 1v5.5c0 .553-.447 1-1 1z");
    			add_location(path2, file$6, 106, 28, 6099);
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "8.042");
    			attr_dev(circle, "r", "1.25");
    			add_location(circle, file$6, 107, 28, 6225);
    			attr_dev(path3, "d", "M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z");
    			add_location(path3, file$6, 108, 28, 6291);
    			add_location(g2, file$6, 105, 24, 6067);
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "class", "inline-block relative select-none w-full align-text-bottom");
    			set_style(svg2, "fill", "currentColor");
    			add_location(svg2, file$6, 100, 20, 5829);
    			attr_dev(div8, "class", "w-5 rounded-full hover:text-blue-400");
    			add_location(div8, file$6, 99, 16, 5758);
    			attr_dev(div9, "class", "flex flex-row items-end justify-between");
    			add_location(div9, file$6, 95, 12, 5572);
    			attr_dev(hr, "class", "my-2");
    			add_location(hr, file$6, 113, 12, 6607);
    			attr_dev(path4, "d", "M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z");
    			add_location(path4, file$6, 122, 28, 7061);
    			add_location(g3, file$6, 121, 24, 7029);
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "class", "inline-block relative w-5");
    			set_style(svg3, "fill", "currentColor");
    			add_location(svg3, file$6, 116, 20, 6825);
    			attr_dev(span1, "class", "ml-3");
    			add_location(span1, file$6, 125, 20, 7594);
    			attr_dev(div10, "class", "flex justify-between items-center text-sm mr-3 xl:mr-6 hover:text-pink-500 hover:underline cursor-pointer");
    			add_location(div10, file$6, 115, 16, 6685);
    			attr_dev(path5, "d", "M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z");
    			add_location(path5, file$6, 136, 24, 8102);
    			add_location(g4, file$6, 135, 20, 8074);
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "class", "inline-block relative w-5");
    			set_style(svg4, "fill", "currentColor");
    			add_location(svg4, file$6, 130, 20, 7874);
    			attr_dev(span2, "class", "ml-3");
    			add_location(span2, file$6, 139, 20, 8682);
    			attr_dev(div11, "class", "flex justify-between items-center text-sm mr-3 xl:mr-6 hover:text-blue-400 hover:underline cursor-pointer");
    			add_location(div11, file$6, 129, 16, 7734);
    			attr_dev(path6, "d", "M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z");
    			add_location(path6, file$6, 150, 24, 9177);
    			attr_dev(path7, "d", "M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z");
    			add_location(path7, file$6, 150, 595, 9748);
    			add_location(g5, file$6, 149, 20, 9149);
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "class", "inline-block relative w-5");
    			set_style(svg5, "fill", "currentColor");
    			add_location(svg5, file$6, 144, 20, 8949);
    			attr_dev(span3, "class", "ml-3");
    			add_location(span3, file$6, 153, 20, 10331);
    			attr_dev(div12, "class", "flex justify-between items-center text-sm hover:text-green-400 hover:underline cursor-pointer");
    			add_location(div12, file$6, 143, 16, 8821);
    			attr_dev(div13, "class", "flex items-center");
    			add_location(div13, file$6, 114, 12, 6637);
    			attr_dev(div14, "class", "flex flex-col text-gray-500");
    			add_location(div14, file$6, 94, 8, 5518);
    			attr_dev(div15, "class", "max-w-xl p-4 border border-black-200 rounded-2xl");
    			attr_dev(div15, "id", "realOrFake");
    			add_location(div15, file$6, 52, 4, 2346);
    			attr_dev(div16, "class", "relative w-auto rounded-2xl");
    			add_location(div16, file$6, 26, 0, 645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			if (if_block) if_block.m(div16, null);
    			append_dev(div16, t0);
    			append_dev(div16, div15);
    			append_dev(div15, div5);
    			append_dev(div5, div3);
    			append_dev(div3, img);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(span0, svg0);
    			append_dev(svg0, g0);
    			append_dev(g0, path0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, svg1);
    			append_dev(svg1, g1);
    			append_dev(g1, path1);
    			append_dev(div15, t8);
    			append_dev(div15, div6);
    			append_dev(div6, t9);
    			append_dev(div15, t10);
    			append_dev(div15, div14);
    			append_dev(div14, div9);
    			append_dev(div9, div7);
    			append_dev(div7, t11);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div8, svg2);
    			append_dev(svg2, g2);
    			append_dev(g2, path2);
    			append_dev(g2, circle);
    			append_dev(g2, path3);
    			append_dev(div14, t13);
    			append_dev(div14, hr);
    			append_dev(div14, t14);
    			append_dev(div14, div13);
    			append_dev(div13, div10);
    			append_dev(div10, svg3);
    			append_dev(svg3, g3);
    			append_dev(g3, path4);
    			append_dev(div10, t15);
    			append_dev(div10, span1);
    			append_dev(span1, t16);
    			append_dev(div13, t17);
    			append_dev(div13, div11);
    			append_dev(div11, svg4);
    			append_dev(svg4, g4);
    			append_dev(g4, path5);
    			append_dev(div11, t18);
    			append_dev(div11, span2);
    			append_dev(span2, t19);
    			append_dev(div13, t20);
    			append_dev(div13, div12);
    			append_dev(div12, svg5);
    			append_dev(svg5, g5);
    			append_dev(g5, path6);
    			append_dev(g5, path7);
    			append_dev(div12, t21);
    			append_dev(div12, span3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*conclusion*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*conclusion*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div16, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*fullName*/ 2) set_data_dev(t2, /*fullName*/ ctx[1]);
    			if (dirty & /*username*/ 4) set_data_dev(t6, /*username*/ ctx[2]);
    			if (dirty & /*text*/ 8) set_data_dev(t9, /*text*/ ctx[3]);
    			if (dirty & /*date*/ 16 && t11_value !== (t11_value = /*twitterDateFormatter*/ ctx[8](/*date*/ ctx[4]) + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*favorites*/ 32 && t16_value !== (t16_value = /*numberFormatter*/ ctx[9](/*favorites*/ ctx[5]) + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*retweets*/ 64 && t19_value !== (t19_value = /*numberFormatter*/ ctx[9](/*retweets*/ ctx[6]) + "")) set_data_dev(t19, t19_value);
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TweetBlock', slots, []);
    	let { conclusion = false } = $$props;
    	let { fullName = "Donald Trump" } = $$props;
    	let { username = "realDonaldTrump" } = $$props;
    	let { text = "lorem ipsum dolor sit amet kasldald asdkald asd" } = $$props;
    	let { date = new Date() } = $$props;
    	let { favorites = 58123 } = $$props;
    	let { retweets = 15002 } = $$props;
    	let { correct } = $$props;

    	let twitterDateFormatter = d => {
    		return moment(d).format('h:mm A [·] MMM DD[,] YYYY');
    	};

    	let numberFormatter = n => {
    		return numeral(n).format('0a');
    	};

    	const writable_props = [
    		'conclusion',
    		'fullName',
    		'username',
    		'text',
    		'date',
    		'favorites',
    		'retweets',
    		'correct'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TweetBlock> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('conclusion' in $$props) $$invalidate(0, conclusion = $$props.conclusion);
    		if ('fullName' in $$props) $$invalidate(1, fullName = $$props.fullName);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('date' in $$props) $$invalidate(4, date = $$props.date);
    		if ('favorites' in $$props) $$invalidate(5, favorites = $$props.favorites);
    		if ('retweets' in $$props) $$invalidate(6, retweets = $$props.retweets);
    		if ('correct' in $$props) $$invalidate(7, correct = $$props.correct);
    	};

    	$$self.$capture_state = () => ({
    		moment,
    		numeral,
    		fade,
    		conclusion,
    		fullName,
    		username,
    		text,
    		date,
    		favorites,
    		retweets,
    		correct,
    		twitterDateFormatter,
    		numberFormatter
    	});

    	$$self.$inject_state = $$props => {
    		if ('conclusion' in $$props) $$invalidate(0, conclusion = $$props.conclusion);
    		if ('fullName' in $$props) $$invalidate(1, fullName = $$props.fullName);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('date' in $$props) $$invalidate(4, date = $$props.date);
    		if ('favorites' in $$props) $$invalidate(5, favorites = $$props.favorites);
    		if ('retweets' in $$props) $$invalidate(6, retweets = $$props.retweets);
    		if ('correct' in $$props) $$invalidate(7, correct = $$props.correct);
    		if ('twitterDateFormatter' in $$props) $$invalidate(8, twitterDateFormatter = $$props.twitterDateFormatter);
    		if ('numberFormatter' in $$props) $$invalidate(9, numberFormatter = $$props.numberFormatter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		conclusion,
    		fullName,
    		username,
    		text,
    		date,
    		favorites,
    		retweets,
    		correct,
    		twitterDateFormatter,
    		numberFormatter
    	];
    }

    class TweetBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			conclusion: 0,
    			fullName: 1,
    			username: 2,
    			text: 3,
    			date: 4,
    			favorites: 5,
    			retweets: 6,
    			correct: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TweetBlock",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*correct*/ ctx[7] === undefined && !('correct' in props)) {
    			console.warn("<TweetBlock> was created without expected prop 'correct'");
    		}
    	}

    	get conclusion() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set conclusion(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullName() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullName(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get username() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get favorites() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favorites(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get retweets() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set retweets(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correct() {
    		throw new Error("<TweetBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correct(value) {
    		throw new Error("<TweetBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    /* node_modules/svelte-range-slider-pips/src/RangePips.svelte generated by Svelte v3.40.1 */

    const file$5 = "node_modules/svelte-range-slider-pips/src/RangePips.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (140:2) {#if ( all && first !== false ) || first }
    function create_if_block_9(ctx) {
    	let span;
    	let span_style_value;
    	let if_block = (/*all*/ ctx[3] === 'label' || /*first*/ ctx[4] === 'label') && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "pip first");
    			attr_dev(span, "style", span_style_value = "" + ((/*vertical*/ ctx[2] ? 'top' : 'left') + ": 0%;"));
    			toggle_class(span, "selected", /*isSelected*/ ctx[13](/*min*/ ctx[0]));
    			toggle_class(span, "in-range", /*inRange*/ ctx[12](/*min*/ ctx[0]));
    			add_location(span, file$5, 140, 4, 3417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*all*/ ctx[3] === 'label' || /*first*/ ctx[4] === 'label') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*vertical*/ 4 && span_style_value !== (span_style_value = "" + ((/*vertical*/ ctx[2] ? 'top' : 'left') + ": 0%;"))) {
    				attr_dev(span, "style", span_style_value);
    			}

    			if (dirty & /*isSelected, min*/ 8193) {
    				toggle_class(span, "selected", /*isSelected*/ ctx[13](/*min*/ ctx[0]));
    			}

    			if (dirty & /*inRange, min*/ 4097) {
    				toggle_class(span, "in-range", /*inRange*/ ctx[12](/*min*/ ctx[0]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(140:2) {#if ( all && first !== false ) || first }",
    		ctx
    	});

    	return block;
    }

    // (146:6) {#if all === 'label' || first === 'label'}
    function create_if_block_10(ctx) {
    	let span;
    	let t_value = /*formatter*/ ctx[9](/*min*/ ctx[0], 0) + "";
    	let t;
    	let if_block0 = /*prefix*/ ctx[7] && create_if_block_12(ctx);
    	let if_block1 = /*suffix*/ ctx[8] && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t = text(t_value);
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "pipVal");
    			add_location(span, file$5, 146, 8, 3627);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*prefix*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_12(ctx);
    					if_block0.c();
    					if_block0.m(span, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*formatter, min*/ 513 && t_value !== (t_value = /*formatter*/ ctx[9](/*min*/ ctx[0], 0) + "")) set_data_dev(t, t_value);

    			if (/*suffix*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_11(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(146:6) {#if all === 'label' || first === 'label'}",
    		ctx
    	});

    	return block;
    }

    // (148:10) {#if prefix}
    function create_if_block_12(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*prefix*/ ctx[7]);
    			attr_dev(span, "class", "pipVal-prefix");
    			add_location(span, file$5, 147, 22, 3671);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prefix*/ 128) set_data_dev(t, /*prefix*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(148:10) {#if prefix}",
    		ctx
    	});

    	return block;
    }

    // (148:88) {#if suffix}
    function create_if_block_11(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*suffix*/ ctx[8]);
    			attr_dev(span, "class", "pipVal-suffix");
    			add_location(span, file$5, 147, 100, 3749);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*suffix*/ 256) set_data_dev(t, /*suffix*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(148:88) {#if suffix}",
    		ctx
    	});

    	return block;
    }

    // (153:2) {#if ( all && rest !== false ) || rest}
    function create_if_block_4$1(ctx) {
    	let each_1_anchor;
    	let each_value = Array(/*pipCount*/ ctx[15] + 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*vertical, percentOf, pipVal, isSelected, inRange, suffix, formatter, prefix, all, rest, min, max, pipCount*/ 64463) {
    				each_value = Array(/*pipCount*/ ctx[15] + 1);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(153:2) {#if ( all && rest !== false ) || rest}",
    		ctx
    	});

    	return block;
    }

    // (155:6) {#if pipVal(i) !== min && pipVal(i) !== max}
    function create_if_block_5(ctx) {
    	let span;
    	let t;
    	let span_style_value;
    	let if_block = (/*all*/ ctx[3] === 'label' || /*rest*/ ctx[6] === 'label') && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(span, "class", "pip");
    			attr_dev(span, "style", span_style_value = "" + ((/*vertical*/ ctx[2] ? 'top' : 'left') + ": " + /*percentOf*/ ctx[11](/*pipVal*/ ctx[14](/*i*/ ctx[23])) + "%;"));
    			toggle_class(span, "selected", /*isSelected*/ ctx[13](/*pipVal*/ ctx[14](/*i*/ ctx[23])));
    			toggle_class(span, "in-range", /*inRange*/ ctx[12](/*pipVal*/ ctx[14](/*i*/ ctx[23])));
    			add_location(span, file$5, 155, 8, 3987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*all*/ ctx[3] === 'label' || /*rest*/ ctx[6] === 'label') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(span, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*vertical, percentOf, pipVal*/ 18436 && span_style_value !== (span_style_value = "" + ((/*vertical*/ ctx[2] ? 'top' : 'left') + ": " + /*percentOf*/ ctx[11](/*pipVal*/ ctx[14](/*i*/ ctx[23])) + "%;"))) {
    				attr_dev(span, "style", span_style_value);
    			}

    			if (dirty & /*isSelected, pipVal*/ 24576) {
    				toggle_class(span, "selected", /*isSelected*/ ctx[13](/*pipVal*/ ctx[14](/*i*/ ctx[23])));
    			}

    			if (dirty & /*inRange, pipVal*/ 20480) {
    				toggle_class(span, "in-range", /*inRange*/ ctx[12](/*pipVal*/ ctx[14](/*i*/ ctx[23])));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(155:6) {#if pipVal(i) !== min && pipVal(i) !== max}",
    		ctx
    	});

    	return block;
    }

    // (161:10) {#if all === 'label' || rest === 'label'}
    function create_if_block_6(ctx) {
    	let span;
    	let t_value = /*formatter*/ ctx[9](/*pipVal*/ ctx[14](/*i*/ ctx[23]), /*i*/ ctx[23]) + "";
    	let t;
    	let if_block0 = /*prefix*/ ctx[7] && create_if_block_8(ctx);
    	let if_block1 = /*suffix*/ ctx[8] && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t = text(t_value);
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "pipVal");
    			add_location(span, file$5, 161, 12, 4247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*prefix*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(span, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*formatter, pipVal*/ 16896 && t_value !== (t_value = /*formatter*/ ctx[9](/*pipVal*/ ctx[14](/*i*/ ctx[23]), /*i*/ ctx[23]) + "")) set_data_dev(t, t_value);

    			if (/*suffix*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(161:10) {#if all === 'label' || rest === 'label'}",
    		ctx
    	});

    	return block;
    }

    // (163:14) {#if prefix}
    function create_if_block_8(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*prefix*/ ctx[7]);
    			attr_dev(span, "class", "pipVal-prefix");
    			add_location(span, file$5, 162, 26, 4295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prefix*/ 128) set_data_dev(t, /*prefix*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(163:14) {#if prefix}",
    		ctx
    	});

    	return block;
    }

    // (163:98) {#if suffix}
    function create_if_block_7(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*suffix*/ ctx[8]);
    			attr_dev(span, "class", "pipVal-suffix");
    			add_location(span, file$5, 162, 110, 4379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*suffix*/ 256) set_data_dev(t, /*suffix*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(163:98) {#if suffix}",
    		ctx
    	});

    	return block;
    }

    // (154:4) {#each Array(pipCount + 1) as _, i}
    function create_each_block$1(ctx) {
    	let show_if = /*pipVal*/ ctx[14](/*i*/ ctx[23]) !== /*min*/ ctx[0] && /*pipVal*/ ctx[14](/*i*/ ctx[23]) !== /*max*/ ctx[1];
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pipVal, min, max*/ 16387) show_if = /*pipVal*/ ctx[14](/*i*/ ctx[23]) !== /*min*/ ctx[0] && /*pipVal*/ ctx[14](/*i*/ ctx[23]) !== /*max*/ ctx[1];

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(154:4) {#each Array(pipCount + 1) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (170:2) {#if ( all && last !== false ) || last}
    function create_if_block$2(ctx) {
    	let span;
    	let span_style_value;
    	let if_block = (/*all*/ ctx[3] === 'label' || /*last*/ ctx[5] === 'label') && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "pip last");
    			attr_dev(span, "style", span_style_value = "" + ((/*vertical*/ ctx[2] ? 'top' : 'left') + ": 100%;"));
    			toggle_class(span, "selected", /*isSelected*/ ctx[13](/*max*/ ctx[1]));
    			toggle_class(span, "in-range", /*inRange*/ ctx[12](/*max*/ ctx[1]));
    			add_location(span, file$5, 170, 4, 4558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*all*/ ctx[3] === 'label' || /*last*/ ctx[5] === 'label') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*vertical*/ 4 && span_style_value !== (span_style_value = "" + ((/*vertical*/ ctx[2] ? 'top' : 'left') + ": 100%;"))) {
    				attr_dev(span, "style", span_style_value);
    			}

    			if (dirty & /*isSelected, max*/ 8194) {
    				toggle_class(span, "selected", /*isSelected*/ ctx[13](/*max*/ ctx[1]));
    			}

    			if (dirty & /*inRange, max*/ 4098) {
    				toggle_class(span, "in-range", /*inRange*/ ctx[12](/*max*/ ctx[1]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(170:2) {#if ( all && last !== false ) || last}",
    		ctx
    	});

    	return block;
    }

    // (176:6) {#if all === 'label' || last === 'label'}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t_value = /*formatter*/ ctx[9](/*max*/ ctx[1], /*pipCount*/ ctx[15]) + "";
    	let t;
    	let if_block0 = /*prefix*/ ctx[7] && create_if_block_3$1(ctx);
    	let if_block1 = /*suffix*/ ctx[8] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t = text(t_value);
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "pipVal");
    			add_location(span, file$5, 176, 8, 4768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*prefix*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(span, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*formatter, max, pipCount*/ 33282 && t_value !== (t_value = /*formatter*/ ctx[9](/*max*/ ctx[1], /*pipCount*/ ctx[15]) + "")) set_data_dev(t, t_value);

    			if (/*suffix*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(176:6) {#if all === 'label' || last === 'label'}",
    		ctx
    	});

    	return block;
    }

    // (178:10) {#if prefix}
    function create_if_block_3$1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*prefix*/ ctx[7]);
    			attr_dev(span, "class", "pipVal-prefix");
    			add_location(span, file$5, 177, 22, 4812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prefix*/ 128) set_data_dev(t, /*prefix*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(178:10) {#if prefix}",
    		ctx
    	});

    	return block;
    }

    // (178:95) {#if suffix}
    function create_if_block_2$1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*suffix*/ ctx[8]);
    			attr_dev(span, "class", "pipVal-suffix");
    			add_location(span, file$5, 177, 107, 4897);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*suffix*/ 256) set_data_dev(t, /*suffix*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(178:95) {#if suffix}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = (/*all*/ ctx[3] && /*first*/ ctx[4] !== false || /*first*/ ctx[4]) && create_if_block_9(ctx);
    	let if_block1 = (/*all*/ ctx[3] && /*rest*/ ctx[6] !== false || /*rest*/ ctx[6]) && create_if_block_4$1(ctx);
    	let if_block2 = (/*all*/ ctx[3] && /*last*/ ctx[5] !== false || /*last*/ ctx[5]) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "rangePips");
    			toggle_class(div, "focus", /*focus*/ ctx[10]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[2]);
    			add_location(div, file$5, 138, 0, 3317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*all*/ ctx[3] && /*first*/ ctx[4] !== false || /*first*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*all*/ ctx[3] && /*rest*/ ctx[6] !== false || /*rest*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*all*/ ctx[3] && /*last*/ ctx[5] !== false || /*last*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*focus*/ 1024) {
    				toggle_class(div, "focus", /*focus*/ ctx[10]);
    			}

    			if (dirty & /*vertical*/ 4) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let pipStep;
    	let pipCount;
    	let pipVal;
    	let isSelected;
    	let inRange;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RangePips', slots, []);
    	let { range = false } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { step = 1 } = $$props;
    	let { values = [(max + min) / 2] } = $$props;
    	let { vertical = false } = $$props;
    	let { pipstep = undefined } = $$props;
    	let { all = true } = $$props;
    	let { first = undefined } = $$props;
    	let { last = undefined } = $$props;
    	let { rest = undefined } = $$props;
    	let { prefix = "" } = $$props;
    	let { suffix = "" } = $$props;
    	let { formatter = (v, i) => v } = $$props;
    	let { focus = undefined } = $$props;
    	let { percentOf = undefined } = $$props;

    	const writable_props = [
    		'range',
    		'min',
    		'max',
    		'step',
    		'values',
    		'vertical',
    		'pipstep',
    		'all',
    		'first',
    		'last',
    		'rest',
    		'prefix',
    		'suffix',
    		'formatter',
    		'focus',
    		'percentOf'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RangePips> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('range' in $$props) $$invalidate(16, range = $$props.range);
    		if ('min' in $$props) $$invalidate(0, min = $$props.min);
    		if ('max' in $$props) $$invalidate(1, max = $$props.max);
    		if ('step' in $$props) $$invalidate(17, step = $$props.step);
    		if ('values' in $$props) $$invalidate(18, values = $$props.values);
    		if ('vertical' in $$props) $$invalidate(2, vertical = $$props.vertical);
    		if ('pipstep' in $$props) $$invalidate(19, pipstep = $$props.pipstep);
    		if ('all' in $$props) $$invalidate(3, all = $$props.all);
    		if ('first' in $$props) $$invalidate(4, first = $$props.first);
    		if ('last' in $$props) $$invalidate(5, last = $$props.last);
    		if ('rest' in $$props) $$invalidate(6, rest = $$props.rest);
    		if ('prefix' in $$props) $$invalidate(7, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(8, suffix = $$props.suffix);
    		if ('formatter' in $$props) $$invalidate(9, formatter = $$props.formatter);
    		if ('focus' in $$props) $$invalidate(10, focus = $$props.focus);
    		if ('percentOf' in $$props) $$invalidate(11, percentOf = $$props.percentOf);
    	};

    	$$self.$capture_state = () => ({
    		range,
    		min,
    		max,
    		step,
    		values,
    		vertical,
    		pipstep,
    		all,
    		first,
    		last,
    		rest,
    		prefix,
    		suffix,
    		formatter,
    		focus,
    		percentOf,
    		inRange,
    		isSelected,
    		pipStep,
    		pipVal,
    		pipCount
    	});

    	$$self.$inject_state = $$props => {
    		if ('range' in $$props) $$invalidate(16, range = $$props.range);
    		if ('min' in $$props) $$invalidate(0, min = $$props.min);
    		if ('max' in $$props) $$invalidate(1, max = $$props.max);
    		if ('step' in $$props) $$invalidate(17, step = $$props.step);
    		if ('values' in $$props) $$invalidate(18, values = $$props.values);
    		if ('vertical' in $$props) $$invalidate(2, vertical = $$props.vertical);
    		if ('pipstep' in $$props) $$invalidate(19, pipstep = $$props.pipstep);
    		if ('all' in $$props) $$invalidate(3, all = $$props.all);
    		if ('first' in $$props) $$invalidate(4, first = $$props.first);
    		if ('last' in $$props) $$invalidate(5, last = $$props.last);
    		if ('rest' in $$props) $$invalidate(6, rest = $$props.rest);
    		if ('prefix' in $$props) $$invalidate(7, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(8, suffix = $$props.suffix);
    		if ('formatter' in $$props) $$invalidate(9, formatter = $$props.formatter);
    		if ('focus' in $$props) $$invalidate(10, focus = $$props.focus);
    		if ('percentOf' in $$props) $$invalidate(11, percentOf = $$props.percentOf);
    		if ('inRange' in $$props) $$invalidate(12, inRange = $$props.inRange);
    		if ('isSelected' in $$props) $$invalidate(13, isSelected = $$props.isSelected);
    		if ('pipStep' in $$props) $$invalidate(20, pipStep = $$props.pipStep);
    		if ('pipVal' in $$props) $$invalidate(14, pipVal = $$props.pipVal);
    		if ('pipCount' in $$props) $$invalidate(15, pipCount = $$props.pipCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pipstep, max, min, step, vertical*/ 655367) {
    			$$invalidate(20, pipStep = pipstep || ((max - min) / step >= (vertical ? 50 : 100)
    			? (max - min) / (vertical ? 10 : 20)
    			: 1));
    		}

    		if ($$self.$$.dirty & /*max, min, step, pipStep*/ 1179651) {
    			$$invalidate(15, pipCount = parseInt((max - min) / (step * pipStep), 10));
    		}

    		if ($$self.$$.dirty & /*min, step, pipStep*/ 1179649) {
    			$$invalidate(14, pipVal = function (val) {
    				return min + val * step * pipStep;
    			});
    		}

    		if ($$self.$$.dirty & /*values*/ 262144) {
    			$$invalidate(13, isSelected = function (val) {
    				return values.some(v => v === val);
    			});
    		}

    		if ($$self.$$.dirty & /*range, values*/ 327680) {
    			$$invalidate(12, inRange = function (val) {
    				if (range === "min") {
    					return values[0] > val;
    				} else if (range === "max") {
    					return values[0] < val;
    				} else if (range) {
    					return values[0] < val && values[1] > val;
    				}
    			});
    		}
    	};

    	return [
    		min,
    		max,
    		vertical,
    		all,
    		first,
    		last,
    		rest,
    		prefix,
    		suffix,
    		formatter,
    		focus,
    		percentOf,
    		inRange,
    		isSelected,
    		pipVal,
    		pipCount,
    		range,
    		step,
    		values,
    		pipstep,
    		pipStep
    	];
    }

    class RangePips extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			range: 16,
    			min: 0,
    			max: 1,
    			step: 17,
    			values: 18,
    			vertical: 2,
    			pipstep: 19,
    			all: 3,
    			first: 4,
    			last: 5,
    			rest: 6,
    			prefix: 7,
    			suffix: 8,
    			formatter: 9,
    			focus: 10,
    			percentOf: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RangePips",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get range() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set range(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pipstep() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pipstep(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get all() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set all(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get first() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rest() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rest(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatter() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatter(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focus(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percentOf() {
    		throw new Error("<RangePips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percentOf(value) {
    		throw new Error("<RangePips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-range-slider-pips/src/RangeSlider.svelte generated by Svelte v3.40.1 */

    const { console: console_1 } = globals;
    const file$4 = "node_modules/svelte-range-slider-pips/src/RangeSlider.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	child_ctx[62] = i;
    	return child_ctx;
    }

    // (779:6) {#if float}
    function create_if_block_2(ctx) {
    	let span;
    	let t_value = /*handleFormatter*/ ctx[19](/*value*/ ctx[60], /*index*/ ctx[62]) + "";
    	let t;
    	let if_block0 = /*prefix*/ ctx[16] && create_if_block_4(ctx);
    	let if_block1 = /*suffix*/ ctx[17] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t = text(t_value);
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "rangeFloat");
    			add_location(span, file$4, 779, 8, 22468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*prefix*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(span, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*handleFormatter, values*/ 524289 && t_value !== (t_value = /*handleFormatter*/ ctx[19](/*value*/ ctx[60], /*index*/ ctx[62]) + "")) set_data_dev(t, t_value);

    			if (/*suffix*/ ctx[17]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(779:6) {#if float}",
    		ctx
    	});

    	return block;
    }

    // (781:10) {#if prefix}
    function create_if_block_4(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*prefix*/ ctx[16]);
    			attr_dev(span, "class", "rangeFloat-prefix");
    			add_location(span, file$4, 780, 22, 22516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*prefix*/ 65536) set_data_dev(t, /*prefix*/ ctx[16]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(781:10) {#if prefix}",
    		ctx
    	});

    	return block;
    }

    // (781:104) {#if suffix}
    function create_if_block_3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*suffix*/ ctx[17]);
    			attr_dev(span, "class", "rangeFloat-suffix");
    			add_location(span, file$4, 780, 116, 22610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*suffix*/ 131072) set_data_dev(t, /*suffix*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(781:104) {#if suffix}",
    		ctx
    	});

    	return block;
    }

    // (757:2) {#each values as value, index}
    function create_each_block(ctx) {
    	let span1;
    	let span0;
    	let t;
    	let span1_style_value;
    	let span1_aria_valuemin_value;
    	let span1_aria_valuemax_value;
    	let span1_aria_valuenow_value;
    	let span1_aria_valuetext_value;
    	let span1_aria_orientation_value;
    	let span1_tabindex_value;
    	let mounted;
    	let dispose;
    	let if_block = /*float*/ ctx[6] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(span0, "class", "rangeNub");
    			add_location(span0, file$4, 777, 6, 22416);
    			attr_dev(span1, "role", "slider");
    			attr_dev(span1, "class", "rangeHandle");
    			attr_dev(span1, "data-handle", /*index*/ ctx[62]);
    			attr_dev(span1, "style", span1_style_value = "" + ((/*vertical*/ ctx[5] ? 'top' : 'left') + ": " + /*$springPositions*/ ctx[26][/*index*/ ctx[62]] + "%; z-index: " + (/*activeHandle*/ ctx[25] === /*index*/ ctx[62] ? 3 : 2) + ";"));

    			attr_dev(span1, "aria-valuemin", span1_aria_valuemin_value = /*range*/ ctx[1] === true && /*index*/ ctx[62] === 1
    			? /*values*/ ctx[0][0]
    			: /*min*/ ctx[2]);

    			attr_dev(span1, "aria-valuemax", span1_aria_valuemax_value = /*range*/ ctx[1] === true && /*index*/ ctx[62] === 0
    			? /*values*/ ctx[0][1]
    			: /*max*/ ctx[3]);

    			attr_dev(span1, "aria-valuenow", span1_aria_valuenow_value = /*value*/ ctx[60]);
    			attr_dev(span1, "aria-valuetext", span1_aria_valuetext_value = "" + (/*prefix*/ ctx[16] + /*handleFormatter*/ ctx[19](/*value*/ ctx[60], /*index*/ ctx[62]) + /*suffix*/ ctx[17]));
    			attr_dev(span1, "aria-orientation", span1_aria_orientation_value = /*vertical*/ ctx[5] ? 'vertical' : 'horizontal');
    			attr_dev(span1, "aria-disabled", /*disabled*/ ctx[8]);
    			attr_dev(span1, "disabled", /*disabled*/ ctx[8]);
    			attr_dev(span1, "tabindex", span1_tabindex_value = /*disabled*/ ctx[8] ? -1 : 0);
    			toggle_class(span1, "hoverable", /*hover*/ ctx[7] && !/*disabled*/ ctx[8]);
    			toggle_class(span1, "active", /*focus*/ ctx[23] && /*activeHandle*/ ctx[25] === /*index*/ ctx[62]);
    			toggle_class(span1, "press", /*handlePressed*/ ctx[24] && /*activeHandle*/ ctx[25] === /*index*/ ctx[62]);
    			add_location(span1, file$4, 757, 4, 21568);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span1, t);
    			if (if_block) if_block.m(span1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span1, "blur", /*sliderBlurHandle*/ ctx[29], false, false, false),
    					listen_dev(span1, "focus", /*sliderFocusHandle*/ ctx[30], false, false, false),
    					listen_dev(span1, "keydown", /*sliderKeydown*/ ctx[31], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*float*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*vertical, $springPositions, activeHandle*/ 100663328 && span1_style_value !== (span1_style_value = "" + ((/*vertical*/ ctx[5] ? 'top' : 'left') + ": " + /*$springPositions*/ ctx[26][/*index*/ ctx[62]] + "%; z-index: " + (/*activeHandle*/ ctx[25] === /*index*/ ctx[62] ? 3 : 2) + ";"))) {
    				attr_dev(span1, "style", span1_style_value);
    			}

    			if (dirty[0] & /*range, values, min*/ 7 && span1_aria_valuemin_value !== (span1_aria_valuemin_value = /*range*/ ctx[1] === true && /*index*/ ctx[62] === 1
    			? /*values*/ ctx[0][0]
    			: /*min*/ ctx[2])) {
    				attr_dev(span1, "aria-valuemin", span1_aria_valuemin_value);
    			}

    			if (dirty[0] & /*range, values, max*/ 11 && span1_aria_valuemax_value !== (span1_aria_valuemax_value = /*range*/ ctx[1] === true && /*index*/ ctx[62] === 0
    			? /*values*/ ctx[0][1]
    			: /*max*/ ctx[3])) {
    				attr_dev(span1, "aria-valuemax", span1_aria_valuemax_value);
    			}

    			if (dirty[0] & /*values*/ 1 && span1_aria_valuenow_value !== (span1_aria_valuenow_value = /*value*/ ctx[60])) {
    				attr_dev(span1, "aria-valuenow", span1_aria_valuenow_value);
    			}

    			if (dirty[0] & /*prefix, handleFormatter, values, suffix*/ 720897 && span1_aria_valuetext_value !== (span1_aria_valuetext_value = "" + (/*prefix*/ ctx[16] + /*handleFormatter*/ ctx[19](/*value*/ ctx[60], /*index*/ ctx[62]) + /*suffix*/ ctx[17]))) {
    				attr_dev(span1, "aria-valuetext", span1_aria_valuetext_value);
    			}

    			if (dirty[0] & /*vertical*/ 32 && span1_aria_orientation_value !== (span1_aria_orientation_value = /*vertical*/ ctx[5] ? 'vertical' : 'horizontal')) {
    				attr_dev(span1, "aria-orientation", span1_aria_orientation_value);
    			}

    			if (dirty[0] & /*disabled*/ 256) {
    				attr_dev(span1, "aria-disabled", /*disabled*/ ctx[8]);
    			}

    			if (dirty[0] & /*disabled*/ 256) {
    				attr_dev(span1, "disabled", /*disabled*/ ctx[8]);
    			}

    			if (dirty[0] & /*disabled*/ 256 && span1_tabindex_value !== (span1_tabindex_value = /*disabled*/ ctx[8] ? -1 : 0)) {
    				attr_dev(span1, "tabindex", span1_tabindex_value);
    			}

    			if (dirty[0] & /*hover, disabled*/ 384) {
    				toggle_class(span1, "hoverable", /*hover*/ ctx[7] && !/*disabled*/ ctx[8]);
    			}

    			if (dirty[0] & /*focus, activeHandle*/ 41943040) {
    				toggle_class(span1, "active", /*focus*/ ctx[23] && /*activeHandle*/ ctx[25] === /*index*/ ctx[62]);
    			}

    			if (dirty[0] & /*handlePressed, activeHandle*/ 50331648) {
    				toggle_class(span1, "press", /*handlePressed*/ ctx[24] && /*activeHandle*/ ctx[25] === /*index*/ ctx[62]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(757:2) {#each values as value, index}",
    		ctx
    	});

    	return block;
    }

    // (786:2) {#if range}
    function create_if_block_1(ctx) {
    	let span;
    	let span_style_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "rangeBar");
    			attr_dev(span, "style", span_style_value = "" + ((/*vertical*/ ctx[5] ? 'top' : 'left') + ": " + /*rangeStart*/ ctx[27](/*$springPositions*/ ctx[26]) + "%; " + (/*vertical*/ ctx[5] ? 'bottom' : 'right') + ":\n      " + /*rangeEnd*/ ctx[28](/*$springPositions*/ ctx[26]) + "%;"));
    			add_location(span, file$4, 786, 4, 22731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*vertical, $springPositions*/ 67108896 && span_style_value !== (span_style_value = "" + ((/*vertical*/ ctx[5] ? 'top' : 'left') + ": " + /*rangeStart*/ ctx[27](/*$springPositions*/ ctx[26]) + "%; " + (/*vertical*/ ctx[5] ? 'bottom' : 'right') + ":\n      " + /*rangeEnd*/ ctx[28](/*$springPositions*/ ctx[26]) + "%;"))) {
    				attr_dev(span, "style", span_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(786:2) {#if range}",
    		ctx
    	});

    	return block;
    }

    // (792:2) {#if pips}
    function create_if_block$1(ctx) {
    	let rangepips;
    	let current;

    	rangepips = new RangePips({
    			props: {
    				values: /*values*/ ctx[0],
    				min: /*min*/ ctx[2],
    				max: /*max*/ ctx[3],
    				step: /*step*/ ctx[4],
    				range: /*range*/ ctx[1],
    				vertical: /*vertical*/ ctx[5],
    				all: /*all*/ ctx[11],
    				first: /*first*/ ctx[12],
    				last: /*last*/ ctx[13],
    				rest: /*rest*/ ctx[14],
    				pipstep: /*pipstep*/ ctx[10],
    				prefix: /*prefix*/ ctx[16],
    				suffix: /*suffix*/ ctx[17],
    				formatter: /*formatter*/ ctx[18],
    				focus: /*focus*/ ctx[23],
    				percentOf: /*percentOf*/ ctx[21]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(rangepips.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rangepips, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const rangepips_changes = {};
    			if (dirty[0] & /*values*/ 1) rangepips_changes.values = /*values*/ ctx[0];
    			if (dirty[0] & /*min*/ 4) rangepips_changes.min = /*min*/ ctx[2];
    			if (dirty[0] & /*max*/ 8) rangepips_changes.max = /*max*/ ctx[3];
    			if (dirty[0] & /*step*/ 16) rangepips_changes.step = /*step*/ ctx[4];
    			if (dirty[0] & /*range*/ 2) rangepips_changes.range = /*range*/ ctx[1];
    			if (dirty[0] & /*vertical*/ 32) rangepips_changes.vertical = /*vertical*/ ctx[5];
    			if (dirty[0] & /*all*/ 2048) rangepips_changes.all = /*all*/ ctx[11];
    			if (dirty[0] & /*first*/ 4096) rangepips_changes.first = /*first*/ ctx[12];
    			if (dirty[0] & /*last*/ 8192) rangepips_changes.last = /*last*/ ctx[13];
    			if (dirty[0] & /*rest*/ 16384) rangepips_changes.rest = /*rest*/ ctx[14];
    			if (dirty[0] & /*pipstep*/ 1024) rangepips_changes.pipstep = /*pipstep*/ ctx[10];
    			if (dirty[0] & /*prefix*/ 65536) rangepips_changes.prefix = /*prefix*/ ctx[16];
    			if (dirty[0] & /*suffix*/ 131072) rangepips_changes.suffix = /*suffix*/ ctx[17];
    			if (dirty[0] & /*formatter*/ 262144) rangepips_changes.formatter = /*formatter*/ ctx[18];
    			if (dirty[0] & /*focus*/ 8388608) rangepips_changes.focus = /*focus*/ ctx[23];
    			if (dirty[0] & /*percentOf*/ 2097152) rangepips_changes.percentOf = /*percentOf*/ ctx[21];
    			rangepips.$set(rangepips_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rangepips.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rangepips.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rangepips, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(792:2) {#if pips}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*values*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block0 = /*range*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*pips*/ ctx[9] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "id", /*id*/ ctx[15]);
    			attr_dev(div, "class", "rangeSlider");
    			toggle_class(div, "range", /*range*/ ctx[1]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[8]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[5]);
    			toggle_class(div, "focus", /*focus*/ ctx[23]);
    			toggle_class(div, "min", /*range*/ ctx[1] === 'min');
    			toggle_class(div, "max", /*range*/ ctx[1] === 'max');
    			toggle_class(div, "pips", /*pips*/ ctx[9]);
    			toggle_class(div, "pip-labels", /*all*/ ctx[11] === 'label' || /*first*/ ctx[12] === 'label' || /*last*/ ctx[13] === 'label' || /*rest*/ ctx[14] === 'label');
    			add_location(div, file$4, 739, 0, 21069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			/*div_binding*/ ctx[45](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousedown", /*bodyInteractStart*/ ctx[34], false, false, false),
    					listen_dev(window, "touchstart", /*bodyInteractStart*/ ctx[34], false, false, false),
    					listen_dev(window, "mousemove", /*bodyInteract*/ ctx[35], false, false, false),
    					listen_dev(window, "touchmove", /*bodyInteract*/ ctx[35], false, false, false),
    					listen_dev(window, "mouseup", /*bodyMouseUp*/ ctx[36], false, false, false),
    					listen_dev(window, "touchend", /*bodyTouchEnd*/ ctx[37], false, false, false),
    					listen_dev(window, "keydown", /*bodyKeyDown*/ ctx[38], false, false, false),
    					listen_dev(div, "mousedown", /*sliderInteractStart*/ ctx[32], false, false, false),
    					listen_dev(div, "mouseup", /*sliderInteractEnd*/ ctx[33], false, false, false),
    					listen_dev(div, "touchstart", prevent_default(/*sliderInteractStart*/ ctx[32]), false, true, false),
    					listen_dev(div, "touchend", prevent_default(/*sliderInteractEnd*/ ctx[33]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*vertical, $springPositions, activeHandle, range, values, min, max, prefix, handleFormatter, suffix, disabled, hover, focus, handlePressed, sliderBlurHandle, sliderFocusHandle, float*/ 1737163247 | dirty[1] & /*sliderKeydown*/ 1) {
    				each_value = /*values*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*range*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*pips*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*pips*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*id*/ 32768) {
    				attr_dev(div, "id", /*id*/ ctx[15]);
    			}

    			if (dirty[0] & /*range*/ 2) {
    				toggle_class(div, "range", /*range*/ ctx[1]);
    			}

    			if (dirty[0] & /*disabled*/ 256) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[8]);
    			}

    			if (dirty[0] & /*vertical*/ 32) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[5]);
    			}

    			if (dirty[0] & /*focus*/ 8388608) {
    				toggle_class(div, "focus", /*focus*/ ctx[23]);
    			}

    			if (dirty[0] & /*range*/ 2) {
    				toggle_class(div, "min", /*range*/ ctx[1] === 'min');
    			}

    			if (dirty[0] & /*range*/ 2) {
    				toggle_class(div, "max", /*range*/ ctx[1] === 'max');
    			}

    			if (dirty[0] & /*pips*/ 512) {
    				toggle_class(div, "pips", /*pips*/ ctx[9]);
    			}

    			if (dirty[0] & /*all, first, last, rest*/ 30720) {
    				toggle_class(div, "pip-labels", /*all*/ ctx[11] === 'label' || /*first*/ ctx[12] === 'label' || /*last*/ ctx[13] === 'label' || /*rest*/ ctx[14] === 'label');
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*div_binding*/ ctx[45](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function index(el) {
    	if (!el) return -1;
    	var i = 0;

    	while (el = el.previousElementSibling) {
    		i++;
    	}

    	return i;
    }

    /**
     * noramlise a mouse or touch event to return the
     * client (x/y) object for that event
     * @param {event} e a mouse/touch event to normalise
     * @returns {object} normalised event client object (x,y)
     **/
    function normalisedClient(e) {
    	if (e.type.includes("touch")) {
    		return e.touches[0];
    	} else {
    		return e;
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let percentOf;
    	let clampValue;
    	let alignValueToStep;

    	let $springPositions,
    		$$unsubscribe_springPositions = noop,
    		$$subscribe_springPositions = () => ($$unsubscribe_springPositions(), $$unsubscribe_springPositions = subscribe(springPositions, $$value => $$invalidate(26, $springPositions = $$value)), springPositions);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_springPositions());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RangeSlider', slots, []);
    	let { range = false } = $$props;
    	let { pushy = false } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { step = 1 } = $$props;
    	let { values = [(max + min) / 2] } = $$props;
    	let { vertical = false } = $$props;
    	let { float = false } = $$props;
    	let { hover = true } = $$props;
    	let { disabled = false } = $$props;
    	let { pips = false } = $$props;
    	let { pipstep = undefined } = $$props;
    	let { all = undefined } = $$props;
    	let { first = undefined } = $$props;
    	let { last = undefined } = $$props;
    	let { rest = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { prefix = "" } = $$props;
    	let { suffix = "" } = $$props;
    	let { formatter = (v, i) => v } = $$props;
    	let { handleFormatter = formatter } = $$props;
    	let { precision = 2 } = $$props;
    	let { springValues = { stiffness: 0.15, damping: 0.4 } } = $$props;

    	// prepare dispatched events
    	const dispatch = createEventDispatcher();

    	// dom references
    	let slider;

    	// state management
    	let valueLength = 0;

    	let focus = false;
    	let handleActivated = false;
    	let handlePressed = false;
    	let keyboardActive = false;
    	let activeHandle = values.length - 1;
    	let startValue;
    	let previousValue;

    	// copy the initial values in to a spring function which
    	// will update every time the values array is modified
    	let springPositions;

    	

    	/**
     * check if an element is a handle on the slider
     * @param {object} el dom object reference we want to check
     * @returns {boolean}
     **/
    	function targetIsHandle(el) {
    		const handles = slider.querySelectorAll(".handle");
    		const isHandle = Array.prototype.includes.call(handles, el);
    		const isChild = Array.prototype.some.call(handles, e => e.contains(el));
    		return isHandle || isChild;
    	}

    	/**
     * trim the values array based on whether the property
     * for 'range' is 'min', 'max', or truthy. This is because we
     * do not want more than one handle for a min/max range, and we do
     * not want more than two handles for a true range.
     * @param {array} values the input values for the rangeSlider
     * @return {array} the range array for creating a rangeSlider
     **/
    	function trimRange(values) {
    		if (range === "min" || range === "max") {
    			return values.slice(0, 1);
    		} else if (range) {
    			return values.slice(0, 2);
    		} else {
    			return values;
    		}
    	}

    	/**
     * helper to return the slider dimensions for finding
     * the closest handle to user interaction
     * @return {object} the range slider DOM client rect
     **/
    	function getSliderDimensions() {
    		return slider.getBoundingClientRect();
    	}

    	/**
     * helper to return closest handle to user interaction
     * @param {object} clientPos the client{x,y} positions to check against
     * @return {number} the index of the closest handle to clientPos
     **/
    	function getClosestHandle(clientPos) {
    		// first make sure we have the latest dimensions
    		// of the slider, as it may have changed size
    		const dims = getSliderDimensions();

    		// calculate the interaction position, percent and value
    		let hPos = 0;

    		let hPercent = 0;
    		let hVal = 0;

    		if (vertical) {
    			hPos = clientPos.clientY - dims.top;
    			hPercent = hPos / dims.height * 100;
    			hVal = (max - min) / 100 * hPercent + min;
    		} else {
    			hPos = clientPos.clientX - dims.left;
    			hPercent = hPos / dims.width * 100;
    			hVal = (max - min) / 100 * hPercent + min;
    		}

    		let closest;

    		// if we have a range, and the handles are at the same
    		// position, we want a simple check if the interaction
    		// value is greater than return the second handle
    		if (range === true && values[0] === values[1]) {
    			if (hVal > values[1]) {
    				return 1;
    			} else {
    				return 0;
    			}
    		} else // we sort the handles values, and return the first one closest
    		// to the interaction value
    		{
    			closest = values.indexOf([...values].sort((a, b) => Math.abs(hVal - a) - Math.abs(hVal - b))[0]); // if there are multiple handles, and not a range, then
    		}

    		return closest;
    	}

    	/**
     * take the interaction position on the slider, convert
     * it to a value on the range, and then send that value
     * through to the moveHandle() method to set the active
     * handle's position
     * @param {object} clientPos the client{x,y} of the interaction
     **/
    	function handleInteract(clientPos) {
    		// first make sure we have the latest dimensions
    		// of the slider, as it may have changed size
    		const dims = getSliderDimensions();

    		// calculate the interaction position, percent and value
    		let hPos = 0;

    		let hPercent = 0;
    		let hVal = 0;

    		if (vertical) {
    			hPos = clientPos.clientY - dims.top;
    			hPercent = hPos / dims.height * 100;
    			hVal = (max - min) / 100 * hPercent + min;
    		} else {
    			hPos = clientPos.clientX - dims.left;
    			hPercent = hPos / dims.width * 100;
    			hVal = (max - min) / 100 * hPercent + min;
    		}

    		// move handle to the value
    		moveHandle(activeHandle, hVal);
    	}

    	/**
     * move a handle to a specific value, respecting the clamp/align rules
     * @param {number} index the index of the handle we want to move
     * @param {number} value the value to move the handle to
     * @return {number} the value that was moved to (after alignment/clamping)
     **/
    	function moveHandle(index, value) {
    		// align & clamp the value so we're not doing extra
    		// calculation on an out-of-range value down below
    		value = alignValueToStep(value);

    		// if this is a range slider
    		if (range) {
    			// restrict the handles of a range-slider from
    			// going past one-another unless "pushy" is true
    			if (index === 0 && value > values[1]) {
    				if (pushy) {
    					$$invalidate(0, values[1] = value, values);
    				} else {
    					value = values[1];
    				}
    			} else if (index === 1 && value < values[0]) {
    				if (pushy) {
    					$$invalidate(0, values[0] = value, values);
    				} else {
    					value = values[0];
    				}
    			}
    		}

    		// if the value has changed, update it
    		if (values[index] !== value) {
    			$$invalidate(0, values[index] = value, values);
    		}

    		// fire the change event when the handle moves,
    		// and store the previous value for the next time
    		if (previousValue !== value) {
    			eChange();
    			previousValue = value;
    		}
    	}

    	/**
     * helper to find the beginning range value for use with css style
     * @param {array} values the input values for the rangeSlider
     * @return {number} the beginning of the range
     **/
    	function rangeStart(values) {
    		if (range === "min") {
    			return 0;
    		} else {
    			return values[0];
    		}
    	}

    	/**
     * helper to find the ending range value for use with css style
     * @param {array} values the input values for the rangeSlider
     * @return {number} the end of the range
     **/
    	function rangeEnd(values) {
    		if (range === "max") {
    			return 0;
    		} else if (range === "min") {
    			return 100 - values[0];
    		} else {
    			return 100 - values[1];
    		}
    	}

    	/**
     * when the user has unfocussed (blurred) from the
     * slider, deactivated all handles
     * @param {event} e the event from browser
     **/
    	function sliderBlurHandle(e) {
    		if (keyboardActive) {
    			$$invalidate(23, focus = false);
    			handleActivated = false;
    			$$invalidate(24, handlePressed = false);
    		}
    	}

    	/**
     * when the user focusses the handle of a slider
     * set it to be active
     * @param {event} e the event from browser
     **/
    	function sliderFocusHandle(e) {
    		if (!disabled) {
    			$$invalidate(25, activeHandle = index(e.target));
    			$$invalidate(23, focus = true);
    		}
    	}

    	/**
     * handle the keyboard accessible features by checking the
     * input type, and modfier key then moving handle by appropriate amount
     * @param {event} e the event from browser
     **/
    	function sliderKeydown(e) {
    		if (!disabled) {
    			const handle = index(e.target);
    			let jump = e.ctrlKey || e.metaKey || e.shiftKey ? step * 10 : step;
    			let prevent = false;

    			switch (e.key) {
    				case "PageDown":
    					jump *= 10;
    				case "ArrowRight":
    				case "ArrowUp":
    					moveHandle(handle, values[handle] + jump);
    					prevent = true;
    					break;
    				case "PageUp":
    					jump *= 10;
    				case "ArrowLeft":
    				case "ArrowDown":
    					moveHandle(handle, values[handle] - jump);
    					prevent = true;
    					break;
    				case "Home":
    					moveHandle(handle, min);
    					prevent = true;
    					break;
    				case "End":
    					moveHandle(handle, max);
    					prevent = true;
    					break;
    			}

    			if (prevent) {
    				e.preventDefault();
    				e.stopPropagation();
    			}
    		}
    	}

    	/**
     * function to run when the user touches
     * down on the slider element anywhere
     * @param {event} e the event from browser
     **/
    	function sliderInteractStart(e) {
    		if (!disabled) {
    			const clientPos = normalisedClient(e);

    			// set the closest handle as active
    			$$invalidate(23, focus = true);

    			handleActivated = true;
    			$$invalidate(24, handlePressed = true);
    			$$invalidate(25, activeHandle = getClosestHandle(clientPos));

    			// fire the start event
    			startValue = previousValue = alignValueToStep(values[activeHandle]);

    			eStart();

    			// for touch devices we want the handle to instantly
    			// move to the position touched for more responsive feeling
    			if (e.type === "touchstart") {
    				handleInteract(clientPos);
    			}
    		}
    	}

    	/**
     * function to run when the user stops touching
     * down on the slider element anywhere
     * @param {event} e the event from browser
     **/
    	function sliderInteractEnd(e) {
    		// fire the stop event for touch devices
    		if (e.type === "touchend") {
    			eStop();
    		}

    		$$invalidate(24, handlePressed = false);
    	}

    	/**
     * unfocus the slider if the user clicked off of
     * it, somewhere else on the screen
     * @param {event} e the event from browser
     **/
    	function bodyInteractStart(e) {
    		keyboardActive = false;

    		if (focus && e.target !== slider && !slider.contains(e.target)) {
    			$$invalidate(23, focus = false);
    		}
    	}

    	/**
     * send the clientX through to handle the interaction
     * whenever the user moves acros screen while active
     * @param {event} e the event from browser
     **/
    	function bodyInteract(e) {
    		if (!disabled) {
    			if (handleActivated) {
    				handleInteract(normalisedClient(e));
    			}
    		}
    	}

    	/**
     * if user triggers mouseup on the body while
     * a handle is active (without moving) then we
     * trigger an interact event there
     * @param {event} e the event from browser
     **/
    	function bodyMouseUp(e) {
    		if (!disabled) {
    			const el = e.target;

    			// this only works if a handle is active, which can
    			// only happen if there was sliderInteractStart triggered
    			// on the slider, already
    			if (handleActivated) {
    				if (el === slider || slider.contains(el)) {
    					$$invalidate(23, focus = true);

    					if (!targetIsHandle(el)) {
    						handleInteract(normalisedClient(e));
    					}
    				}

    				// fire the stop event for mouse device
    				// when the body is triggered with an active handle
    				eStop();
    			}
    		}

    		handleActivated = false;
    		$$invalidate(24, handlePressed = false);
    	}

    	/**
     * if user triggers touchend on the body then we
     * defocus the slider completely
     * @param {event} e the event from browser
     **/
    	function bodyTouchEnd(e) {
    		handleActivated = false;
    		$$invalidate(24, handlePressed = false);
    	}

    	function bodyKeyDown(e) {
    		if (!disabled) {
    			if (e.target === slider || slider.contains(e.target)) {
    				keyboardActive = true;
    			}
    		}
    	}

    	function eStart() {
    		!disabled && dispatch("start", {
    			activeHandle,
    			value: startValue,
    			values: values.map(v => alignValueToStep(v))
    		});
    	}

    	function eStop() {
    		!disabled && dispatch("stop", {
    			activeHandle,
    			startValue,
    			value: values[activeHandle],
    			values: values.map(v => alignValueToStep(v))
    		});
    	}

    	function eChange() {
    		!disabled && dispatch("change", {
    			activeHandle,
    			startValue,
    			previousValue: typeof previousValue === "undefined"
    			? startValue
    			: previousValue,
    			value: values[activeHandle],
    			values: values.map(v => alignValueToStep(v))
    		});
    	}

    	const writable_props = [
    		'range',
    		'pushy',
    		'min',
    		'max',
    		'step',
    		'values',
    		'vertical',
    		'float',
    		'hover',
    		'disabled',
    		'pips',
    		'pipstep',
    		'all',
    		'first',
    		'last',
    		'rest',
    		'id',
    		'prefix',
    		'suffix',
    		'formatter',
    		'handleFormatter',
    		'precision',
    		'springValues'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<RangeSlider> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			slider = $$value;
    			$$invalidate(22, slider);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('range' in $$props) $$invalidate(1, range = $$props.range);
    		if ('pushy' in $$props) $$invalidate(39, pushy = $$props.pushy);
    		if ('min' in $$props) $$invalidate(2, min = $$props.min);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    		if ('step' in $$props) $$invalidate(4, step = $$props.step);
    		if ('values' in $$props) $$invalidate(0, values = $$props.values);
    		if ('vertical' in $$props) $$invalidate(5, vertical = $$props.vertical);
    		if ('float' in $$props) $$invalidate(6, float = $$props.float);
    		if ('hover' in $$props) $$invalidate(7, hover = $$props.hover);
    		if ('disabled' in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ('pips' in $$props) $$invalidate(9, pips = $$props.pips);
    		if ('pipstep' in $$props) $$invalidate(10, pipstep = $$props.pipstep);
    		if ('all' in $$props) $$invalidate(11, all = $$props.all);
    		if ('first' in $$props) $$invalidate(12, first = $$props.first);
    		if ('last' in $$props) $$invalidate(13, last = $$props.last);
    		if ('rest' in $$props) $$invalidate(14, rest = $$props.rest);
    		if ('id' in $$props) $$invalidate(15, id = $$props.id);
    		if ('prefix' in $$props) $$invalidate(16, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(17, suffix = $$props.suffix);
    		if ('formatter' in $$props) $$invalidate(18, formatter = $$props.formatter);
    		if ('handleFormatter' in $$props) $$invalidate(19, handleFormatter = $$props.handleFormatter);
    		if ('precision' in $$props) $$invalidate(40, precision = $$props.precision);
    		if ('springValues' in $$props) $$invalidate(41, springValues = $$props.springValues);
    	};

    	$$self.$capture_state = () => ({
    		spring,
    		createEventDispatcher,
    		RangePips,
    		range,
    		pushy,
    		min,
    		max,
    		step,
    		values,
    		vertical,
    		float,
    		hover,
    		disabled,
    		pips,
    		pipstep,
    		all,
    		first,
    		last,
    		rest,
    		id,
    		prefix,
    		suffix,
    		formatter,
    		handleFormatter,
    		precision,
    		springValues,
    		dispatch,
    		slider,
    		valueLength,
    		focus,
    		handleActivated,
    		handlePressed,
    		keyboardActive,
    		activeHandle,
    		startValue,
    		previousValue,
    		springPositions,
    		index,
    		normalisedClient,
    		targetIsHandle,
    		trimRange,
    		getSliderDimensions,
    		getClosestHandle,
    		handleInteract,
    		moveHandle,
    		rangeStart,
    		rangeEnd,
    		sliderBlurHandle,
    		sliderFocusHandle,
    		sliderKeydown,
    		sliderInteractStart,
    		sliderInteractEnd,
    		bodyInteractStart,
    		bodyInteract,
    		bodyMouseUp,
    		bodyTouchEnd,
    		bodyKeyDown,
    		eStart,
    		eStop,
    		eChange,
    		alignValueToStep,
    		clampValue,
    		percentOf,
    		$springPositions
    	});

    	$$self.$inject_state = $$props => {
    		if ('range' in $$props) $$invalidate(1, range = $$props.range);
    		if ('pushy' in $$props) $$invalidate(39, pushy = $$props.pushy);
    		if ('min' in $$props) $$invalidate(2, min = $$props.min);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    		if ('step' in $$props) $$invalidate(4, step = $$props.step);
    		if ('values' in $$props) $$invalidate(0, values = $$props.values);
    		if ('vertical' in $$props) $$invalidate(5, vertical = $$props.vertical);
    		if ('float' in $$props) $$invalidate(6, float = $$props.float);
    		if ('hover' in $$props) $$invalidate(7, hover = $$props.hover);
    		if ('disabled' in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ('pips' in $$props) $$invalidate(9, pips = $$props.pips);
    		if ('pipstep' in $$props) $$invalidate(10, pipstep = $$props.pipstep);
    		if ('all' in $$props) $$invalidate(11, all = $$props.all);
    		if ('first' in $$props) $$invalidate(12, first = $$props.first);
    		if ('last' in $$props) $$invalidate(13, last = $$props.last);
    		if ('rest' in $$props) $$invalidate(14, rest = $$props.rest);
    		if ('id' in $$props) $$invalidate(15, id = $$props.id);
    		if ('prefix' in $$props) $$invalidate(16, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(17, suffix = $$props.suffix);
    		if ('formatter' in $$props) $$invalidate(18, formatter = $$props.formatter);
    		if ('handleFormatter' in $$props) $$invalidate(19, handleFormatter = $$props.handleFormatter);
    		if ('precision' in $$props) $$invalidate(40, precision = $$props.precision);
    		if ('springValues' in $$props) $$invalidate(41, springValues = $$props.springValues);
    		if ('slider' in $$props) $$invalidate(22, slider = $$props.slider);
    		if ('valueLength' in $$props) $$invalidate(42, valueLength = $$props.valueLength);
    		if ('focus' in $$props) $$invalidate(23, focus = $$props.focus);
    		if ('handleActivated' in $$props) handleActivated = $$props.handleActivated;
    		if ('handlePressed' in $$props) $$invalidate(24, handlePressed = $$props.handlePressed);
    		if ('keyboardActive' in $$props) keyboardActive = $$props.keyboardActive;
    		if ('activeHandle' in $$props) $$invalidate(25, activeHandle = $$props.activeHandle);
    		if ('startValue' in $$props) startValue = $$props.startValue;
    		if ('previousValue' in $$props) previousValue = $$props.previousValue;
    		if ('springPositions' in $$props) $$subscribe_springPositions($$invalidate(20, springPositions = $$props.springPositions));
    		if ('alignValueToStep' in $$props) $$invalidate(43, alignValueToStep = $$props.alignValueToStep);
    		if ('clampValue' in $$props) $$invalidate(44, clampValue = $$props.clampValue);
    		if ('percentOf' in $$props) $$invalidate(21, percentOf = $$props.percentOf);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*min, max*/ 12) {
    			/**
     * clamp a value from the range so that it always
     * falls within the min/max values
     * @param {number} val the value to clamp
     * @return {number} the value after it's been clamped
     **/
    			$$invalidate(44, clampValue = function (val) {
    				// return the min/max if outside of that range
    				return val <= min ? min : val >= max ? max : val;
    			});
    		}

    		if ($$self.$$.dirty[0] & /*min, max, step*/ 28 | $$self.$$.dirty[1] & /*clampValue, precision*/ 8704) {
    			/**
     * align the value with the steps so that it
     * always sits on the closest (above/below) step
     * @param {number} val the value to align
     * @return {number} the value after it's been aligned
     **/
    			$$invalidate(43, alignValueToStep = function (val) {
    				// sanity check for performance
    				if (val <= min) {
    					return min;
    				} else if (val >= max) {
    					return max;
    				}

    				// find the middle-point between steps
    				// and see if the value is closer to the
    				// next step, or previous step
    				let remainder = (val - min) % step;

    				let aligned = val - remainder;

    				if (Math.abs(remainder) * 2 >= step) {
    					aligned += remainder > 0 ? step : -step;
    				}

    				// make sure the value is within acceptable limits
    				aligned = clampValue(aligned);

    				// make sure the returned value is set to the precision desired
    				// this is also because javascript often returns weird floats
    				// when dealing with odd numbers and percentages
    				return parseFloat(aligned.toFixed(precision));
    			});
    		}

    		if ($$self.$$.dirty[0] & /*min, max*/ 12 | $$self.$$.dirty[1] & /*precision*/ 512) {
    			/**
     * take in a value, and then calculate that value's percentage
     * of the overall range (min-max);
     * @param {number} val the value we're getting percent for
     * @return {number} the percentage value
     **/
    			$$invalidate(21, percentOf = function (val) {
    				let perc = (val - min) / (max - min) * 100;

    				if (isNaN(perc) || perc <= 0) {
    					return 0;
    				} else if (perc >= 100) {
    					return 100;
    				} else {
    					return parseFloat(perc.toFixed(precision));
    				}
    			});
    		}

    		if ($$self.$$.dirty[0] & /*values, max, min, percentOf, springPositions*/ 3145741 | $$self.$$.dirty[1] & /*alignValueToStep, valueLength, springValues*/ 7168) {
    			{
    				// check that "values" is an array, or set it as array
    				// to prevent any errors in springs, or range trimming
    				if (!Array.isArray(values)) {
    					$$invalidate(0, values = [(max + min) / 2]);
    					console.error("'values' prop should be an Array (https://github.com/simeydotme/svelte-range-slider-pips#slider-props)");
    				}

    				// trim the range so it remains as a min/max (only 2 handles)
    				// and also align the handles to the steps
    				$$invalidate(0, values = trimRange(values.map(v => alignValueToStep(v))));

    				// check if the valueLength (length of values[]) has changed,
    				// because if so we need to re-seed the spring function with the
    				// new values array.
    				if (valueLength !== values.length) {
    					// set the initial spring values when the slider initialises,
    					// or when values array length has changed
    					$$subscribe_springPositions($$invalidate(20, springPositions = spring(values.map(v => percentOf(v)), springValues)));
    				} else {
    					// update the value of the spring function for animated handles
    					// whenever the values has updated
    					springPositions.set(values.map(v => percentOf(v)));
    				}

    				// set the valueLength for the next check
    				$$invalidate(42, valueLength = values.length);
    			}
    		}
    	};

    	return [
    		values,
    		range,
    		min,
    		max,
    		step,
    		vertical,
    		float,
    		hover,
    		disabled,
    		pips,
    		pipstep,
    		all,
    		first,
    		last,
    		rest,
    		id,
    		prefix,
    		suffix,
    		formatter,
    		handleFormatter,
    		springPositions,
    		percentOf,
    		slider,
    		focus,
    		handlePressed,
    		activeHandle,
    		$springPositions,
    		rangeStart,
    		rangeEnd,
    		sliderBlurHandle,
    		sliderFocusHandle,
    		sliderKeydown,
    		sliderInteractStart,
    		sliderInteractEnd,
    		bodyInteractStart,
    		bodyInteract,
    		bodyMouseUp,
    		bodyTouchEnd,
    		bodyKeyDown,
    		pushy,
    		precision,
    		springValues,
    		valueLength,
    		alignValueToStep,
    		clampValue,
    		div_binding
    	];
    }

    class RangeSlider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				range: 1,
    				pushy: 39,
    				min: 2,
    				max: 3,
    				step: 4,
    				values: 0,
    				vertical: 5,
    				float: 6,
    				hover: 7,
    				disabled: 8,
    				pips: 9,
    				pipstep: 10,
    				all: 11,
    				first: 12,
    				last: 13,
    				rest: 14,
    				id: 15,
    				prefix: 16,
    				suffix: 17,
    				formatter: 18,
    				handleFormatter: 19,
    				precision: 40,
    				springValues: 41
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RangeSlider",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get range() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set range(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pushy() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pushy(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get float() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set float(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pips() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pips(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pipstep() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pipstep(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get all() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set all(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get first() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rest() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rest(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatter() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatter(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleFormatter() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleFormatter(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get precision() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set precision(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get springValues() {
    		throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set springValues(value) {
    		throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TweetOrNotBlock.svelte generated by Svelte v3.40.1 */
    const file$3 = "src/TweetOrNotBlock.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let rangeslider;
    	let updating_values;
    	let div_style_value;
    	let current;

    	function rangeslider_values_binding(value) {
    		/*rangeslider_values_binding*/ ctx[8](value);
    	}

    	let rangeslider_props = {
    		min: -100,
    		max: 100,
    		pips: true,
    		pipstep: 100,
    		all: "label",
    		formatter: /*tick*/ ctx[5],
    		disabled: /*voted*/ ctx[0]
    	};

    	if (/*hue*/ ctx[1] !== void 0) {
    		rangeslider_props.values = /*hue*/ ctx[1];
    	}

    	rangeslider = new RangeSlider({ props: rangeslider_props, $$inline: true });
    	binding_callbacks.push(() => bind(rangeslider, 'values', rangeslider_values_binding));
    	rangeslider.$on("stop", /*handleStop*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(rangeslider.$$.fragment);
    			attr_dev(div, "class", "w-full xl:w-96 px-8");

    			attr_dev(div, "style", div_style_value = `
        --range-handle-focus: ${/*color*/ ctx[2]};
        --range-range: ${/*lightColor*/ ctx[3]};
        --range-handle-inactive: ${/*lightColor*/ ctx[3]};
        `);

    			add_location(div, file$3, 50, 0, 1086);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(rangeslider, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const rangeslider_changes = {};
    			if (dirty & /*voted*/ 1) rangeslider_changes.disabled = /*voted*/ ctx[0];

    			if (!updating_values && dirty & /*hue*/ 2) {
    				updating_values = true;
    				rangeslider_changes.values = /*hue*/ ctx[1];
    				add_flush_callback(() => updating_values = false);
    			}

    			rangeslider.$set(rangeslider_changes);

    			if (!current || dirty & /*color, lightColor*/ 12 && div_style_value !== (div_style_value = `
        --range-handle-focus: ${/*color*/ ctx[2]};
        --range-range: ${/*lightColor*/ ctx[3]};
        --range-handle-inactive: ${/*lightColor*/ ctx[3]};
        `)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rangeslider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rangeslider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(rangeslider);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let percentage;
    	let lightColor;
    	let color;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TweetOrNotBlock', slots, []);
    	const dispatch = createEventDispatcher();
    	let { voted = false } = $$props;
    	let { refresh = false } = $$props;

    	let percentageToHue = p => {
    		let polynomial = x => {
    			return 148 * x ** 2 - 388 * x + 360;
    		};

    		return Math.round(polynomial(p));
    	};

    	function handleStop({ detail }) {
    		if (!voted) {
    			dispatch('vote', { value: (detail.values[0] + 100) / 200 });
    		}
    	}

    	const emojiMap = {
    		'-100': '👎 fake',
    		'0': '😐 idk maybe?',
    		'100': '👍 real'
    	};

    	let hue = [0];

    	let tick = v => {
    		return emojiMap[`${v}`];
    	};

    	let topTick = v => {
    		return v;
    	};

    	const writable_props = ['voted', 'refresh'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TweetOrNotBlock> was created with unknown prop '${key}'`);
    	});

    	function rangeslider_values_binding(value) {
    		hue = value;
    		($$invalidate(1, hue), $$invalidate(6, refresh));
    	}

    	$$self.$$set = $$props => {
    		if ('voted' in $$props) $$invalidate(0, voted = $$props.voted);
    		if ('refresh' in $$props) $$invalidate(6, refresh = $$props.refresh);
    	};

    	$$self.$capture_state = () => ({
    		RangeSlider,
    		createEventDispatcher,
    		dispatch,
    		voted,
    		refresh,
    		percentageToHue,
    		handleStop,
    		emojiMap,
    		hue,
    		tick,
    		topTick,
    		percentage,
    		color,
    		lightColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('voted' in $$props) $$invalidate(0, voted = $$props.voted);
    		if ('refresh' in $$props) $$invalidate(6, refresh = $$props.refresh);
    		if ('percentageToHue' in $$props) $$invalidate(10, percentageToHue = $$props.percentageToHue);
    		if ('hue' in $$props) $$invalidate(1, hue = $$props.hue);
    		if ('tick' in $$props) $$invalidate(5, tick = $$props.tick);
    		if ('topTick' in $$props) topTick = $$props.topTick;
    		if ('percentage' in $$props) $$invalidate(7, percentage = $$props.percentage);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('lightColor' in $$props) $$invalidate(3, lightColor = $$props.lightColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*refresh*/ 64) {
    			{
    				if (refresh) {
    					$$invalidate(1, hue = [0]);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*hue*/ 2) {
    			$$invalidate(7, percentage = (hue[0] + 100) / 200);
    		}

    		if ($$self.$$.dirty & /*percentage*/ 128) {
    			$$invalidate(3, lightColor = `hsl(${percentageToHue(percentage)}, 89.1%, 53.1%)`);
    		}

    		if ($$self.$$.dirty & /*percentage*/ 128) {
    			$$invalidate(2, color = `hsl(${percentageToHue(percentage)}, 89.1%, 53.1%)`);
    		}
    	};

    	return [
    		voted,
    		hue,
    		color,
    		lightColor,
    		handleStop,
    		tick,
    		refresh,
    		percentage,
    		rangeslider_values_binding
    	];
    }

    class TweetOrNotBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { voted: 0, refresh: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TweetOrNotBlock",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get voted() {
    		throw new Error("<TweetOrNotBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set voted(value) {
    		throw new Error("<TweetOrNotBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get refresh() {
    		throw new Error("<TweetOrNotBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set refresh(value) {
    		throw new Error("<TweetOrNotBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TextContent.svelte generated by Svelte v3.40.1 */

    const file$2 = "src/TextContent.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let article;
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let a0;
    	let t4;
    	let b0;
    	let a1;
    	let t6;
    	let h30;
    	let t8;
    	let p1;
    	let t9;
    	let a2;
    	let t11;
    	let a3;
    	let t13;
    	let t14;
    	let p2;
    	let t15;
    	let a4;
    	let t17;
    	let a5;
    	let t19;
    	let a6;
    	let t21;
    	let t22;
    	let h31;
    	let t24;
    	let p3;
    	let t25;
    	let b1;
    	let t27;
    	let b2;
    	let t29;

    	const block = {
    		c: function create() {
    			div = element("div");
    			article = element("article");
    			h1 = element("h1");
    			h1.textContent = "Would Trump Tweet This?";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("You'll be shown some tweets (actual or ");
    			a0 = element("a");
    			a0.textContent = "AI-generated";
    			t4 = text(")\n            supposedly from Donald Trump. ");
    			b0 = element("b");
    			a1 = element("a");
    			a1.textContent = "Can you tell the real apart from the fake?";
    			t6 = space();
    			h30 = element("h3");
    			h30.textContent = "History";
    			t8 = space();
    			p1 = element("p");
    			t9 = text("Countless times, the ");
    			a2 = element("a");
    			a2.textContent = "tweets of Donald Trump";
    			t11 = text(" have sparked outrages and confusions throughout the twitter world.\n            People's rage and frustration built up from ");
    			a3 = element("a");
    			a3.textContent = "the actions of the Trump government (Reuters)";
    			t13 = text("\n            was officially too much for Twitter when the final straw was drawn earlier this year.");
    			t14 = space();
    			p2 = element("p");
    			t15 = text("Following the ");
    			a4 = element("a");
    			a4.textContent = "tragic events on January 6th 2021";
    			t17 = text(",\n            Twitter ");
    			a5 = element("a");
    			a5.textContent = "permanently suspended";
    			t19 = space();
    			a6 = element("a");
    			a6.textContent = "@realDonaldTrump";
    			t21 = text("\n            's account, and it is honestly one of the best things to happen in 2021.");
    			t22 = space();
    			h31 = element("h3");
    			h31.textContent = "Present";
    			t24 = space();
    			p3 = element("p");
    			t25 = text("While we haven't particularly missed his tweets, I thought it would be a fun idea to see if we could generate tweets that are insane but coherent with his style. \n            The tweet you see below is ");
    			b1 = element("b");
    			b1.textContent = "not necessarily real";
    			t27 = text(". If it is real, then the ");
    			b2 = element("b");
    			b2.textContent = "date/retweets/favorites";
    			t29 = text(" are accurate!");
    			add_location(h1, file$2, 4, 8, 101);
    			attr_dev(a0, "href", "https://github.com/jsvine/markovify");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$2, 6, 51, 198);
    			attr_dev(a1, "href", "#realOrFake");
    			add_location(a1, file$2, 7, 45, 323);
    			add_location(b0, file$2, 7, 42, 320);
    			add_location(p0, file$2, 5, 8, 143);
    			add_location(h30, file$2, 9, 8, 417);
    			attr_dev(a2, "href", "https://www.thetrumparchive.com/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$2, 11, 33, 493);
    			attr_dev(a3, "href", "https://www.reuters.com/article/usa-trump-legacy-analysis-int-idUSKBN29P0EX");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$2, 12, 56, 702);
    			attr_dev(p1, "class", "prose");
    			add_location(p1, file$2, 10, 8, 442);
    			attr_dev(a4, "href", "https://www.nytimes.com/spotlight/us-capitol-riots-investigations");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$2, 16, 26, 1003);
    			attr_dev(a5, "href", "https://blog.twitter.com/en_us/topics/company/2020/suspension");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$2, 17, 20, 1154);
    			attr_dev(a6, "href", "https://twitter.com/realDonaldTrump?lang=en");
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$2, 18, 12, 1280);
    			add_location(p2, file$2, 15, 8, 973);
    			add_location(h31, file$2, 21, 8, 1477);
    			add_location(b1, file$2, 24, 39, 1722);
    			add_location(b2, file$2, 24, 92, 1775);
    			add_location(p3, file$2, 22, 8, 1504);
    			attr_dev(article, "class", "prose text-center mx-auto p-4");
    			add_location(article, file$2, 3, 4, 45);
    			attr_dev(div, "class", "mx-auto pt-8 lg:pt-12");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, article);
    			append_dev(article, h1);
    			append_dev(article, t1);
    			append_dev(article, p0);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(p0, t4);
    			append_dev(p0, b0);
    			append_dev(b0, a1);
    			append_dev(article, t6);
    			append_dev(article, h30);
    			append_dev(article, t8);
    			append_dev(article, p1);
    			append_dev(p1, t9);
    			append_dev(p1, a2);
    			append_dev(p1, t11);
    			append_dev(p1, a3);
    			append_dev(p1, t13);
    			append_dev(article, t14);
    			append_dev(article, p2);
    			append_dev(p2, t15);
    			append_dev(p2, a4);
    			append_dev(p2, t17);
    			append_dev(p2, a5);
    			append_dev(p2, t19);
    			append_dev(p2, a6);
    			append_dev(p2, t21);
    			append_dev(article, t22);
    			append_dev(article, h31);
    			append_dev(article, t24);
    			append_dev(article, p3);
    			append_dev(p3, t25);
    			append_dev(p3, b1);
    			append_dev(p3, t27);
    			append_dev(p3, b2);
    			append_dev(p3, t29);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextContent', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextContent> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TextContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextContent",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function createStreak() {
        const { subscribe, set, update } = writable(0);
        return {
            subscribe,
            increment: () => update(n => n + 1),
            decrement: () => update(n => n - 1),
            reset: () => update(n => 0)
        }
    }

    const streak = createStreak();
    const bestScore = writable(0);

    /* src/Footer.svelte generated by Svelte v3.40.1 */

    const file$1 = "src/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let hr;
    	let t0;
    	let p;
    	let span;
    	let t1;
    	let a0;
    	let svg0;
    	let title;
    	let t2;
    	let path0;
    	let path1;
    	let t3;
    	let a1;
    	let svg1;
    	let path2;
    	let t4;
    	let t5;
    	let a2;
    	let svg2;
    	let path3;
    	let t6;
    	let t7;
    	let a3;
    	let svg3;
    	let path4;
    	let t8;
    	let t9;
    	let a4;
    	let svg4;
    	let path5;
    	let t10;
    	let a5;
    	let t11;
    	let svg5;
    	let g;
    	let path6;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			hr = element("hr");
    			t0 = space();
    			p = element("p");
    			span = element("span");
    			t1 = text("made with\n            ");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			title = svg_element("title");
    			t2 = text("svelte-logo");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t3 = text(" +\n            ");
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path2 = svg_element("path");
    			t4 = space();
    			t5 = text("+\n\n\n            ");
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path3 = svg_element("path");
    			t6 = space();
    			t7 = text("+\n\n            ");
    			a3 = element("a");
    			svg3 = svg_element("svg");
    			path4 = svg_element("path");
    			t8 = space();
    			t9 = text("+\n\n            ");
    			a4 = element("a");
    			svg4 = svg_element("svg");
    			path5 = svg_element("path");
    			t10 = text("\n            \n\n            by ");
    			a5 = element("a");
    			t11 = text("Aalekh Patel\n            ");
    			svg5 = svg_element("svg");
    			g = svg_element("g");
    			path6 = svg_element("path");
    			add_location(hr, file$1, 4, 4, 66);
    			add_location(title, file$1, 9, 20, 359);
    			attr_dev(path0, "d", "M94.1566,22.8189c-10.4-14.8851-30.94-19.2971-45.7914-9.8348L22.2825,29.6078A29.9234,29.9234,0,0,0,8.7639,49.6506a31.5136,31.5136,0,0,0,3.1076,20.2318A30.0061,30.0061,0,0,0,7.3953,81.0653a31.8886,31.8886,0,0,0,5.4473,24.1157c10.4022,14.8865,30.9423,19.2966,45.7914,9.8348L84.7167,98.3921A29.9177,29.9177,0,0,0,98.2353,78.3493,31.5263,31.5263,0,0,0,95.13,58.117a30,30,0,0,0,4.4743-11.1824,31.88,31.88,0,0,0-5.4473-24.1157");
    			set_style(path0, "fill", "#ff3e00");
    			add_location(path0, file$1, 10, 20, 406);
    			attr_dev(path1, "d", "M45.8171,106.5815A20.7182,20.7182,0,0,1,23.58,98.3389a19.1739,19.1739,0,0,1-3.2766-14.5025,18.1886,18.1886,0,0,1,.6233-2.4357l.4912-1.4978,1.3363.9815a33.6443,33.6443,0,0,0,10.203,5.0978l.9694.2941-.0893.9675a5.8474,5.8474,0,0,0,1.052,3.8781,6.2389,6.2389,0,0,0,6.6952,2.485,5.7449,5.7449,0,0,0,1.6021-.7041L69.27,76.281a5.4306,5.4306,0,0,0,2.4506-3.631,5.7948,5.7948,0,0,0-.9875-4.3712,6.2436,6.2436,0,0,0-6.6978-2.4864,5.7427,5.7427,0,0,0-1.6.7036l-9.9532,6.3449a19.0329,19.0329,0,0,1-5.2965,2.3259,20.7181,20.7181,0,0,1-22.2368-8.2427,19.1725,19.1725,0,0,1-3.2766-14.5024,17.9885,17.9885,0,0,1,8.13-12.0513L55.8833,23.7472a19.0038,19.0038,0,0,1,5.3-2.3287A20.7182,20.7182,0,0,1,83.42,29.6611a19.1739,19.1739,0,0,1,3.2766,14.5025,18.4,18.4,0,0,1-.6233,2.4357l-.4912,1.4978-1.3356-.98a33.6175,33.6175,0,0,0-10.2037-5.1l-.9694-.2942.0893-.9675a5.8588,5.8588,0,0,0-1.052-3.878,6.2389,6.2389,0,0,0-6.6952-2.485,5.7449,5.7449,0,0,0-1.6021.7041L37.73,51.719a5.4218,5.4218,0,0,0-2.4487,3.63,5.7862,5.7862,0,0,0,.9856,4.3717,6.2437,6.2437,0,0,0,6.6978,2.4864,5.7652,5.7652,0,0,0,1.602-.7041l9.9519-6.3425a18.978,18.978,0,0,1,5.2959-2.3278,20.7181,20.7181,0,0,1,22.2368,8.2427,19.1725,19.1725,0,0,1,3.2766,14.5024,17.9977,17.9977,0,0,1-8.13,12.0532L51.1167,104.2528a19.0038,19.0038,0,0,1-5.3,2.3287");
    			set_style(path1, "fill", "#fff");
    			add_location(path1, file$1, 10, 472, 858);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "w-4 xl:w-6 inline-block");
    			attr_dev(svg0, "viewBox", "0 0 107 128");
    			add_location(svg0, file$1, 8, 16, 244);
    			attr_dev(a0, "href", "https://svelte.dev/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$1, 7, 12, 181);
    			attr_dev(path2, "d", "M9.563 26.873c-1.22-.96-2.52-1.878-3.408-3.172-1.87-2.283-3.31-4.925-4.294-7.703-.595-1.806-.8-3.743-1.566-5.48-.802-1.26.138-2.64 1.52-3.04.615-.118 1.696-.7.39-.284-1.17.858-1.283-.78-.083-.884.82-.11 1.12-.78.84-1.382-.88-.574 2.132-1.203.616-2.06C2 1.168 5.786.84 4.852 2.774 4.63 4.26 7.498 2.5 6.832 4.218c.677.825 2.534.188 2.487 1.345.986.068 1.324.897 2.25.96.96.433 2.697.774 3.023 1.855-.95.753-3.153-1.555-3.26.53.288 3.08.214 6.252 1.34 9.185.533 1.775 1.825 3.173 2.99 4.556 1.117 1.354 2.63 2.308 4.17 3.11 1.352.638 2.81 1.06 4.283 1.326.597-.457 1.653-2.156 2.584-1.44.045.806-1.85 1.684-.09 1.595 1.035-.312 1.752.8 2.603-.204.785.93 3.26-.593 2.703 1.306-.755.487-1.856.193-2.612.863-1.247-.623-2.24.557-3.62.408-1.533.275-3.092.385-4.646.387-2.55-.2-5.153-.286-7.578-1.174-1.367-.397-2.7-1.175-3.9-1.954zm2.153.933c1.334.576 2.64 1.184 4.1 1.368 2.32.322 4.715.82 7.043.366-1.054-.476-2.143.185-3.193-.34-1.26.27-2.6-.07-3.9-.237-1.455-.648-3.026-1.094-4.388-1.936-1.703-.622.88.798 1.34.913 1.064.604-1.17-.3-1.486-.56-.892-.5-1.005-.396-.088.112l.56.314zm-2.54-1.794c1.293.48-.006-.91-.597-.83-.262-.455-1.003-.743-.48-.987-.94.326-.984-1.24-1.425-1.016-.994-.314-.387-1.426-1.57-2.11-.108-.72-1.176-1.343-1.516-2.428-.15-.556-1.207-2.15-.558-.666.552 1.43 1.524 2.653 2.334 3.875.628 1.164 1.37 2.38 2.514 3.107.386.37.758.937 1.302 1.053zm-3.724-4.09c.045-.195.236.422 0 0zm5.273 4.663c.286-.128-.412-.162 0 0zm.7.256c-.073-.353-.32.198 0 0zm.88.366c.418-.398-.645-.25 0 0zm1.506.84c.254-.375-.813-.14 0 0zm-2.89-2.015c.65-.42-.84-.006 0 0zm.66.33c-.02-.222-.235.1 0 0zm3.293 2.056c.53.334 3.092.732 1.488.137-.27.056-2.975-.766-1.488-.137zm-5.228-4.072c-.05-.222-.822-.246 0 0zm1.533.894c.4-.28-.828-.215 0 0zm1.3.8c.573-.216-.928-.217 0 0zM9.02 23.665c.62.476 2.506.06.95-.284-.707-.377-2.3-.635-1.214.227l.263.057zm4.32 2.637c.26-.44-1.086-.252 0 0zm-1.313-1.043c1.52.43-1.277-.96-.375-.16l.2.09.175.068zm2.632 1.52c1.44.014-1.3-.2 0 0zm-6.193-3.947c-.056-.268-.355.022 0 0zm8.627 5.312c.038-.484-.47.36 0 0zm-6.17-3.81c-.087-.255-.45-.01 0 0zm-2.32-1.67c.826-.05-1.13-.364 0 0zM5.856 20.89c-.103-.396-.898-.712 0 0zm7.212 4.577c-.15-.173-.07.037 0 0zm4.488 2.755c-.014-.264-.244.1 0 0zm-4.885-3.165c.08-.34-.705-.103 0 0zm-3.344-2.12c.615-.065-.985-.415 0 0zm5.656 3.515c.958-.38-.933-.185 0 0zm-2.942-1.997c1.103.142-1.313-.75-.243-.08l.243.08zm3.835 2.358c1.03-.615.69 1.443 1.748.174 1.043-.762-.9.942.384.136.93-.622 2.303.295 3.17.593.624-.03 1.23.54 1.87.193 1.23-.332-2.408-.492-1.454-1.08-1.126.328-1.958-.39-2.513-1.112-1.264-.292-2.724-.938-3.355-2.056-.257-.42.37.06-.222-.627-.76-.677-1.14-1.446-1.652-2.27-.61-.325-.683-1.284-.744-.032.005-.79-.737-1.323-.92-1.102-.003-.76.795-.38.236-.942-.12-.79-.516-1.61-.634-2.502-.185-.43-.026-1.35-.63-.377-.22 1.027-.073-1.262.27-.508.45-.77-.162-.68-.186-.573.293-.65.186-1.572-.077-1.22.156-.69.247-2.535-.233-2.208.29-.72.552-3.297-.712-2.315-.512.007-1.398.186-1.817.394 1.313.724-.132.262-.668.146-.07.67-.6.38-1.26.387 1.058.13-.515 1.08-1.12.712-.788.376.68 1.316.015 1.607.082.437-1.207-.158-1.106.854-.764-.322-.105 1.2.278.685 1.3.352.915 1.154.948 1.917-.212.444-1.046-1.044-.186-.975-.68-1.103-.75-.4-1.315.114-.13.037 1.44.73.454 1.07.867.134.892.893 1.068 1.372.52.543.413-.6 1.037.053-.395-.58-2.09-1.637-.725-1.3-.007-.584-.247-1.056.172-1.045.415-.75-.434 1.85.5.896.258-.113.323-.75.787.06.674.664.244 1.144-.708.536.17.578 1.273.784 1.065 1.687.22.795.527.502.795.456.2.772.33.204.34-.163.962.206.736.775 1.038 1.172.663.3-.95-2.028.19-.7 1.197 1.08.45 1.533-.625 1.36.68-.055.9.92 1.75.885.776.37 1.3 1.787-.036 1.196-.463-.418-2.106-.934-.764-.14 1.238.574 2.222.916 3.416 1.637.854.6 1.223 1.308 1.547 1.447-.718.343-2.164-.274-1.1-.463-.67-.122-1.424-.46-.782.374.546.456 1.933.408 2.182.46-.21.464-.573.5.008.537-.648.346.208.4.268.597zm-1.326-3.744c-.395-.413-.497-1.185-.07-.513.22.088.7 1.263.07.513zM18.87 25.8c.246-.016.007.187 0 0zm-4.94-3.755c-.016-.624.142.48 0 0zm-.43-.577c-.497-.96.625.27 0 0zm-5.202-3.6c.292-.078.144.498 0 0zm4.14 2.244c.18-.673.2.564 0 0zm-2.925-2.034c-.206-.37.43.348 0 0zm2.51.804c-.47-1.053.334-.575.105.172l-.105-.172zm-4.328-2.886c-.2-.346-.557-1.36-.445-1.67.1.504 1.072 2.17.476.7-.658-1.24.787.402.936.712.07.307-.406-.084-.084.638-.588-.822-.347.454-.882-.37zm-1.337-.922c.055-.804.306.55 0 0zm.602.208c.287-.606.486.845 0 0zM5.5 14.182c-.498-.495-.858-.95.024-.307.34.013-.755-1.037.082-.334.88.16.434 1.443-.105.64zm.76-.02c.29-.287.154.282 0 0zm.468.15c-.44-.822.532.345 0 0zm-.93-.888c-1.448-1.29 1.82.673.236.24l-.236-.24zm4.148 2.41c-.627-.375-.167-2.644.047-1.093.61-.197-.034.802.42.792-.07.63-.275.857-.467.3zm1.534.907c.06-.684.13.468 0 0zm-.266-.264c.07-.292.006.344 0 0zM6.092 13c-.93-1.283 2.703 1.298.596.325-.22-.058-.485-.078-.596-.325zm2.955 1.566c-.088-1.08.196.18 0 0zm2.243 1.44c.173-.615.013.407 0 0zM6.235 12.51c.553-.118 2.3.97.695.31-.177-.196-.556-.107-.695-.31zm4.746 2.366c.06-1.105.33-.66.002.16l-.002-.16zm-4.335-2.75c.226-.33-.598-1.493.118-.417.3.246.897.412.38.516.815.72-.2.195-.497-.1zm4.1 2.406c.155-1.26.137.737 0 0zm-4.57-3.568c.172-.074.09.23 0 0zm1.07.637c.275-.578.508.644 0 0zm3.017 1.678c-.002-.22.057.323 0 0zm-.175-.386c-.418-1.033.4.547 0 0zm-.257-.678c-.07-.427.24.536 0 0zm.418-.68c-.288-.506.363-2.23.436-1.16-.303.834-.087 1.3.123.18.39-.88-.084 1.737-.56.98zm.43-2.566c.125-.154.028.185 0 0zM9.96 23.12c-.17-.15.022.094 0 0zm1.48.748c.823.212.82-.128.075-.23-.4-.372-1.662-.767-.532-.046.074.2.31.185.457.275zm-2.92-1.94c.453.34 1.707.958.646.13.358-.416-.685-.638-.34-.916-.88-.54-.695-.5-.078-.473-1.058-.473.153-.437.096-.68-.408-.08-2.026-.72-1.074.052-.968-.493-.23.184-.523.113-1-.27.88.754-.157.5.567.45 1.528 1.153.24.476-.17.244.922.615 1.2.8zm1.547.89c1.88.606-.923-.74 0 0zm7.92 4.798c.024-.374-.257.32 0 0zm.814.343c.434-.42.018.67.72-.103.007-.553-.02-.88-.806-.208-.217.12-.313.63.087.31zM5.878 19.84c-.133-.524-.934-.522 0 0zm.87.57c-.323-.535-1.152-.485 0 0zm4.946 2.983c.483.43 2.218.315.586.053-.24-.357-1.533-.27-.586-.053zm6.798 4.2c.743-.624-.72.278 0 0zm1.546 1.062c.005-.2-.32.087 0 0zm.003-.28c.823-.87-.797.05 0 0zM3.74 18.05c-.7-1-.436-1.45-1.112-2.267-.128-.625-1.16-2.043-.534-.54.574.88.744 2.24 1.646 2.81zm16.04 10.046c1.515-.978-.62-.426 0 0zm1.156.453c.76-.65-.48-.136 0 0zM5.62 18.735c.217-.323-.56-.042 0 0zm15.075 9.505c.734-.473-.17-.4-.133.043l.133-.043zm-9.962-6.28c-.025-.32-.388.027 0 0zm.615.354c-.196-.396-.3.062 0 0zm10.525 6.245c.94-.68-.57-.13-.197.13l.197-.13zm-.36-.174c.767-.642-.81.284 0 0zm1.84 1.225c.514-.344-.625-.11 0 0zm-17.26-11.11c.69.154 2.755 1.698 1.537.107-.624-.185-.25-1.71-.887-1.44.427.714.35 1.018-.546.568-1.127-.55-.633.272-.413.5-.3.07.397.26.31.266zm-3.14-2.48c.123-.51-1.137-2.81-.595-1.152.195.347.175 1.005.595 1.152zm5.766 3.555c-.356-.297-.017-.042 0 0zm.874.204c0-.54-.966-.22 0 0zm7.577 4.776c-.145-.37-.57-.008 0 0zm.364.266c-.054-.207-.2.04 0 0zm3.003 1.892c.29-.213-.36-.028 0 0zM4.52 16.422c.826-.32-.885-.228 0 0zM16.5 23.97c-.01-.535-.527.133 0 0zM4.193 15.66c.53-.18-.49-.118 0 0zm1.54.746c-.01-.176-.163.067 0 0zm18.788 11.52c.682-.138 2.238.347 2.49-.18-.83-.02-2.867-.585-2.963.134l.18.03.293.018zM6.223 16.53c.012-.542-.422-.02 0 0zm-4.05-2.81c-.184-1.032-.7-.156 0 0zm.965.243c.012-.332-.884-.298 0 0zm.552.27c-.16-.13-.124.163 0 0zm3.473 2.227c.164-.15-.387-.11 0 0zm-3.84-2.84c-.094-.78-1.12-.117 0 0zm-1.98-1.285c-.028-.36-.193.136 0 0zm.295-.222c-.048-.427-.253.054 0 0zm1.627.97c.688-.27-1.253-.56-.14-.05l.14.05zM25.043 26.54c.44-.404-.56-.125 0 0zm2.63 1.363c.177-.52-.445.07 0 0zM3.43 12.235c.073-.505-.546.1 0 0zm-2.316-1.55C.992 9.97 1.01 8.72 2.198 9.142c-1.587.316 1.1 1.974.76.664.668.033 1.306-.395.955.253C5.23 9.916 6.14 8.774 7.412 8.935c1-.132 2.072-.23 3.14-.63.877-.063 1.72-1.007 1.24-1.567-1.196-.1-2.448.048-3.77.312-1.465.304-2.795.883-4.273 1.13-1.44.194.29.533-.123.61-.75.26.897.436-.097.712-.614-.117-1.253-.328-.99-.975-1.38.18-2.593.752-1.502 2.156l.08.001zM4.442 9c.323-1.192 1.733.98.53.16-.143-.108-.38-.195-.53-.16zm.063-.578c.467-.347.248.195 0 0zm.593.01c.043-.548 1.358.3.217.197l-.217-.197zm.81-.326c.297-.347.086.307 0 0zm.208-.14c.494-.593 2.793-.38 1.1-.058-.45-.34-.797.2-1.1.058zm3-.463c-.074-1.62 1.492.575 0 0zm.852-.005c.31-.816 1.21-.328.145-.164.023.087-.032.422-.145.164zm-6.873 4.327c.93-.57-.987-.494 0 0zm.688.2c.326-.347-.7-.14 0 0zM1.757 10.57c.53-.41-.63-.155 0 0zm27.47 17.185c.015-.474-.406.213 0 0zm-2.79-1.905c.08-.545-.36.047 0 0zm3.56 2.09c.743.003 2.252-.23.635-.23-.254.04-1.48.03-.635.23zM4.39 11.673c.602-.04.94-.663-.117-.628-1.64-.17 1.446.562-.2.352-.222.147.314.316.327.275zm.53.268c-.063-.386-.186.205 0 0zm.63-1.676c.26-.324-.36-.087 0 0zm-2-3.344c1.074-.365 2.542-.775 3.05.18-.516-.62-.208-1.232.28-.324.69.918 1.034-.418.586-.726.51.634 1.09.934.342.04.815-.98-1.63.128-2.186.117-.267.12-2.76.636-2.07.713zm.63-1.205c.612-.462 2.118.275 1.152-.46-.095-.083-2.115.557-1.152.46zm2.232.092c.716.018-.31-.963.544-.518-.14-.458-.994-.543-1.412-.727-.236.418.48 1.25.867 1.245zm-1.84-2.026c.248-.336-.435.17 0 0zM5.48 4c1.155-.153-.294-.497-.233-.012L5.48 4zM3.776 2.67c-.813-1.062 1.53.178.703-.933-.696-.553-1.363.624-.703.933zm10.434 5.62c.373-.66-1.54-.89-.25-.234.118.04.092.28.25.234z");
    			add_location(path2, file$1, 14, 139, 2445);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "w-4 xl:w-6 inline-block");
    			attr_dev(svg1, "viewBox", "0 0 32 32");
    			attr_dev(svg1, "preserveAspectRatio", "xMidYMid");
    			add_location(svg1, file$1, 14, 16, 2322);
    			attr_dev(a1, "href", "https://flask.palletsprojects.com/en/2.0.x/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$1, 13, 12, 2235);
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "clip-rule", "evenodd");
    			attr_dev(path3, "d", "M25.517 0C18.712 0 14.46 3.382 12.758 10.146c2.552-3.382 5.529-4.65 8.931-3.805 1.941.482 3.329 1.882 4.864 3.432 2.502 2.524 5.398 5.445 11.722 5.445 6.804 0 11.057-3.382 12.758-10.145-2.551 3.382-5.528 4.65-8.93 3.804-1.942-.482-3.33-1.882-4.865-3.431C34.736 2.92 31.841 0 25.517 0zM12.758 15.218C5.954 15.218 1.701 18.6 0 25.364c2.552-3.382 5.529-4.65 8.93-3.805 1.942.482 3.33 1.882 4.865 3.432 2.502 2.524 5.397 5.445 11.722 5.445 6.804 0 11.057-3.381 12.758-10.145-2.552 3.382-5.529 4.65-8.931 3.805-1.941-.483-3.329-1.883-4.864-3.432-2.502-2.524-5.398-5.446-11.722-5.446z");
    			attr_dev(path3, "fill", "#06B6D4");
    			add_location(path3, file$1, 20, 20, 11922);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "class", "w-4 xl:w-6 inline-block");
    			attr_dev(svg2, "viewBox", "0 0 62 31");
    			add_location(svg2, file$1, 19, 16, 11809);
    			attr_dev(a2, "href", "https://tailwindcss.com/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$1, 18, 12, 11741);
    			attr_dev(path4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(path4, "d", "M21.6945 10.5028C19.7767 11.1429 18.8533 12.2911 18.2242 14.0793C18.0618 14.5569 17.6559 15.0852 17.1993 15.4408L18.7721 17.1275L13.7797 13.6323L0 4C0 4 0.994414 10.4621 1.33942 12.8397C1.58295 14.5162 1.99898 15.2681 3.3181 16.0302L3.84574 16.3147L6.11869 17.5136L4.76913 16.8125L10.9994 20.2163L10.9589 20.3078L4.25163 17.1986C4.60678 18.4179 5.29678 20.765 5.59104 21.8014C5.9056 22.919 6.26075 23.3255 7.34649 23.7217L9.34546 24.4533L10.5834 23.9656L9.01061 25.0121L1.14662 35C6.37237 30.1432 10.7965 28.4159 14.0334 27.0036C18.1633 25.2153 20.6493 24.0672 22.2728 19.942C23.4296 17.0462 24.3327 13.3376 25.4793 11.9049L27.9248 8.77548C27.9248 8.77548 22.8614 10.1167 21.6945 10.5028Z");
    			attr_dev(path4, "fill", "#3F00A5");
    			add_location(path4, file$1, 26, 20, 12802);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "class", "w-4 xl:w-6 inline-block");
    			attr_dev(svg3, "viewBox", "0 0 40 40");
    			add_location(svg3, file$1, 25, 16, 12689);
    			attr_dev(a3, "href", "https://fauna.com");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$1, 24, 12, 12628);
    			attr_dev(path5, "d", "M 12 2 C 9.25 2 7 4.25 7 7 L 7 43 C 7 45.75 9.25 48 12 48 L 40 48 C 42.75 48 45 45.75 45 43 L 45 7 C 45 4.25 42.75 2 40 2 Z M 12 4 L 40 4 C 41.667969 4 43 5.332031 43 7 L 43 43 C 43 44.667969 41.667969 46 40 46 L 12 46 C 10.332031 46 9 44.667969 9 43 L 9 7 C 9 5.332031 10.332031 4 12 4 Z M 21.40625 9 L 16.46875 9.03125 C 16.46875 9.03125 16.472656 25.261719 16.5 25.1875 C 31.636719 19.296875 30.5 23.46875 30.5 23.46875 L 30.5 40.9375 L 35.25 40.9375 L 35.25 23.53125 C 35.25 13.941406 21.40625 19.40625 21.40625 19.40625 Z M 31.65625 9.03125 C 31.65625 9.03125 29.949219 12.972656 28.0625 15.28125 L 33.3125 15.28125 C 36.160156 11.59375 37.09375 9.03125 37.09375 9.03125 Z M 16.5625 30.96875 L 16.5625 40.90625 L 21.53125 35.9375 Z");
    			add_location(path5, file$1, 31, 123, 13781);
    			attr_dev(svg4, "fill", "#000000");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "class", "w-4 xl:w-6 inline-block");
    			attr_dev(svg4, "viewBox", "0 0 50 50");
    			add_location(svg4, file$1, 31, 16, 13674);
    			attr_dev(a4, "href", "https://www.heroku.com/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$1, 30, 12, 13607);
    			attr_dev(path6, "d", "M296.133,354.174c49.885-5.891,102.942-24.029,102.942-110.192   c0-24.49-8.624-44.448-22.67-59.869c2.266-5.89,9.515-28.114-2.734-58.947c0,0-18.139-5.898-60.759,22.669   c-18.139-4.983-38.09-8.163-56.682-8.163c-19.053,0-39.011,3.18-56.697,8.163c-43.082-28.567-61.22-22.669-61.22-22.669   c-12.241,30.833-4.983,53.057-2.718,58.947c-14.061,15.42-22.677,35.379-22.677,59.869c0,86.163,53.057,104.301,102.942,110.192   c-6.344,5.452-12.241,15.873-14.507,30.387c-12.702,5.438-45.808,15.873-65.758-18.592c0,0-11.795-21.31-34.012-22.669   c0,0-22.224-0.453-1.813,13.592c0,0,14.96,6.812,24.943,32.653c0,0,13.6,43.089,76.179,29.48v38.543 c0,5.906-4.53,12.702-15.865,10.89C96.139,438.977,32.2,354.626,32.2,255.77c0-123.807,100.216-224.022,224.03-224.022 c123.347,0,224.023,100.216,223.57,224.022c0,98.856-63.946,182.754-152.828,212.688c-11.342,2.266-15.873-4.53-15.873-10.89 V395.45C311.1,374.577,304.288,360.985,296.133,354.174L296.133,354.174z M512,256.23C512,114.73,397.263,0,256.23,0 C114.73,0,0,114.73,0,256.23C0,397.263,114.73,512,256.23,512C397.263,512,512,397.263,512,256.23L512,256.23z");
    			attr_dev(path6, "fill", "#0D2636");
    			add_location(path6, file$1, 42, 20, 14824);
    			add_location(g, file$1, 41, 16, 14800);
    			attr_dev(svg5, "class", "w-4 xl:w-6 inline-block");
    			attr_dev(svg5, "viewBox", "0 0 512 512");
    			add_location(svg5, file$1, 37, 12, 14679);
    			attr_dev(a5, "href", "https://github.com/aalekhpatel07");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$1, 35, 15, 14582);
    			attr_dev(span, "class", "text-xs xl:text-lg");
    			add_location(span, file$1, 6, 8, 126);
    			attr_dev(p, "class", "text-center text-xs leading-10");
    			add_location(p, file$1, 5, 4, 75);
    			attr_dev(footer, "class", "bg-white bottom-0 sticky");
    			add_location(footer, file$1, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, hr);
    			append_dev(footer, t0);
    			append_dev(footer, p);
    			append_dev(p, span);
    			append_dev(span, t1);
    			append_dev(span, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, title);
    			append_dev(title, t2);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(span, t3);
    			append_dev(span, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path2);
    			append_dev(a1, t4);
    			append_dev(span, t5);
    			append_dev(span, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path3);
    			append_dev(a2, t6);
    			append_dev(span, t7);
    			append_dev(span, a3);
    			append_dev(a3, svg3);
    			append_dev(svg3, path4);
    			append_dev(a3, t8);
    			append_dev(span, t9);
    			append_dev(span, a4);
    			append_dev(a4, svg4);
    			append_dev(svg4, path5);
    			append_dev(span, t10);
    			append_dev(span, a5);
    			append_dev(a5, t11);
    			append_dev(a5, svg5);
    			append_dev(svg5, g);
    			append_dev(g, path6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.40.1 */
    const file = "src/App.svelte";

    // (116:12) {#if tweet}
    function create_if_block(ctx) {
    	let tweetblock;
    	let updating_conclusion;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let t3;
    	let br1;
    	let t4;
    	let t5;
    	let t6;
    	let br2;
    	let t7;
    	let tweetornotblock;
    	let updating_voted;
    	let t8;
    	let br3;
    	let t9;
    	let button;
    	let svg;
    	let path;
    	let t10;
    	let span;
    	let t12;
    	let br4;
    	let t13;
    	let br5;
    	let current;
    	let mounted;
    	let dispose;

    	function tweetblock_conclusion_binding(value) {
    		/*tweetblock_conclusion_binding*/ ctx[9](value);
    	}

    	let tweetblock_props = {
    		fullName: "Donald Trump",
    		username: "realDonaldTrump",
    		text: /*tweet*/ ctx[2].text,
    		date: new Date(/*tweet*/ ctx[2].date),
    		favorites: Number.parseInt(/*tweet*/ ctx[2].favorites),
    		retweets: Number.parseInt(/*tweet*/ ctx[2].retweets),
    		correct: /*correct*/ ctx[3]
    	};

    	if (/*voted*/ ctx[0] !== void 0) {
    		tweetblock_props.conclusion = /*voted*/ ctx[0];
    	}

    	tweetblock = new TweetBlock({ props: tweetblock_props, $$inline: true });
    	binding_callbacks.push(() => bind(tweetblock, 'conclusion', tweetblock_conclusion_binding));

    	function tweetornotblock_voted_binding(value) {
    		/*tweetornotblock_voted_binding*/ ctx[10](value);
    	}

    	let tweetornotblock_props = { refresh: /*shouldReset*/ ctx[1] };

    	if (/*voted*/ ctx[0] !== void 0) {
    		tweetornotblock_props.voted = /*voted*/ ctx[0];
    	}

    	tweetornotblock = new TweetOrNotBlock({
    			props: tweetornotblock_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tweetornotblock, 'voted', tweetornotblock_voted_binding));
    	tweetornotblock.$on("vote", /*handleVote*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(tweetblock.$$.fragment);
    			t0 = space();
    			br0 = element("br");
    			t1 = text("\n                \n                Streak: ");
    			t2 = text(/*$streak*/ ctx[4]);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n                Best Score: ");
    			t5 = text(/*$bestScore*/ ctx[5]);
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			create_component(tweetornotblock.$$.fragment);
    			t8 = space();
    			br3 = element("br");
    			t9 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t10 = space();
    			span = element("span");
    			span.textContent = "Refresh";
    			t12 = space();
    			br4 = element("br");
    			t13 = space();
    			br5 = element("br");
    			add_location(br0, file, 126, 16, 3374);
    			add_location(br1, file, 131, 16, 3565);
    			add_location(br2, file, 133, 16, 3628);
    			add_location(br3, file, 139, 16, 3816);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "1");
    			attr_dev(path, "d", "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15");
    			add_location(path, file, 146, 24, 4219);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-8 w-8");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 145, 20, 4084);
    			attr_dev(button, "class", "rounded-full w-16 h-16 flex justify-center items-center");
    			set_style(button, "background", "rgb(29, 161, 242)");
    			set_style(button, "color", "white");
    			add_location(button, file, 140, 16, 3838);
    			attr_dev(span, "class", "cursor-pointer select-none");
    			add_location(span, file, 149, 16, 4473);
    			add_location(br4, file, 150, 16, 4568);
    			add_location(br5, file, 151, 16, 4590);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tweetblock, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(tweetornotblock, target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br5, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*handleReset*/ ctx[7], false, false, false),
    					listen_dev(span, "click", /*handleReset*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const tweetblock_changes = {};
    			if (dirty & /*tweet*/ 4) tweetblock_changes.text = /*tweet*/ ctx[2].text;
    			if (dirty & /*tweet*/ 4) tweetblock_changes.date = new Date(/*tweet*/ ctx[2].date);
    			if (dirty & /*tweet*/ 4) tweetblock_changes.favorites = Number.parseInt(/*tweet*/ ctx[2].favorites);
    			if (dirty & /*tweet*/ 4) tweetblock_changes.retweets = Number.parseInt(/*tweet*/ ctx[2].retweets);
    			if (dirty & /*correct*/ 8) tweetblock_changes.correct = /*correct*/ ctx[3];

    			if (!updating_conclusion && dirty & /*voted*/ 1) {
    				updating_conclusion = true;
    				tweetblock_changes.conclusion = /*voted*/ ctx[0];
    				add_flush_callback(() => updating_conclusion = false);
    			}

    			tweetblock.$set(tweetblock_changes);
    			if (!current || dirty & /*$streak*/ 16) set_data_dev(t2, /*$streak*/ ctx[4]);
    			if (!current || dirty & /*$bestScore*/ 32) set_data_dev(t5, /*$bestScore*/ ctx[5]);
    			const tweetornotblock_changes = {};
    			if (dirty & /*shouldReset*/ 2) tweetornotblock_changes.refresh = /*shouldReset*/ ctx[1];

    			if (!updating_voted && dirty & /*voted*/ 1) {
    				updating_voted = true;
    				tweetornotblock_changes.voted = /*voted*/ ctx[0];
    				add_flush_callback(() => updating_voted = false);
    			}

    			tweetornotblock.$set(tweetornotblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tweetblock.$$.fragment, local);
    			transition_in(tweetornotblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tweetblock.$$.fragment, local);
    			transition_out(tweetornotblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tweetblock, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t7);
    			destroy_component(tweetornotblock, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(116:12) {#if tweet}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let div1;
    	let textcontent;
    	let t0;
    	let div0;
    	let t1;
    	let footer;
    	let current;
    	textcontent = new TextContent({ $$inline: true });
    	let if_block = /*tweet*/ ctx[2] && create_if_block(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(textcontent.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "mt-4 mx-auto flex justify-center items-center flex-col px-4");
    			add_location(div0, file, 112, 12, 2797);
    			add_location(div1, file, 110, 8, 2752);
    			attr_dev(div2, "class", "");
    			add_location(div2, file, 107, 4, 2634);
    			add_location(main, file, 106, 0, 2623);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			mount_component(textcontent, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(main, t1);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*tweet*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*tweet*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textcontent.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textcontent.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(textcontent);
    			if (if_block) if_block.d();
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function endpoint(action, version = 1) {
    	let BASE = 'https://would-trump-tweet-this.herokuapp.com/';
    	return BASE + `api/v${version}/${action}`;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $streak;
    	let $bestScore;
    	validate_store(streak, 'streak');
    	component_subscribe($$self, streak, $$value => $$invalidate(4, $streak = $$value));
    	validate_store(bestScore, 'bestScore');
    	component_subscribe($$self, bestScore, $$value => $$invalidate(5, $bestScore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	numeral.register('locale', 'enc', {
    		abbreviations: {
    			thousand: 'K',
    			million: 'M',
    			billion: 'B',
    			trillion: 'T'
    		}
    	});

    	numeral.locale('enc');
    	const tweetEndpoint = endpoint('tweet');
    	const voteEndpoint = endpoint('vote');
    	let { voted = false } = $$props;
    	let { shouldReset = false } = $$props;

    	async function getTweet() {
    		let response = await fetch(tweetEndpoint, {
    			method: 'GET',
    			headers: {
    				'Accept': 'application/json',
    				'Content-Type': 'application/json'
    			}
    		});

    		return await response.json();
    	}

    	async function castVote({ tweet_id, value }) {
    		let response = await fetch(voteEndpoint, {
    			method: 'POST',
    			headers: {
    				'Accept': 'application/json',
    				'Content-Type': 'application/json'
    			},
    			body: JSON.stringify({ tweet_id, value })
    		});

    		return await response.json();
    	}

    	let tweet = undefined;
    	let vote = undefined;
    	let correct;

    	function handleVote({ detail }) {
    		$$invalidate(0, voted = true);
    		$$invalidate(8, vote = detail.value);

    		castVote({
    			tweet_id: tweet.tweet_id,
    			value: detail.value
    		});
    	} // setTimeout(() => {
    	//     shouldReset = true

    	// }, 3000)
    	async function handleReset() {
    		$$invalidate(2, tweet = await getTweet());
    		$$invalidate(0, voted = false);
    		await tick();
    		$$invalidate(1, shouldReset = false);
    	}

    	onMount(async () => {
    		$$invalidate(2, tweet = await getTweet());
    	});

    	const writable_props = ['voted', 'shouldReset'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function tweetblock_conclusion_binding(value) {
    		voted = value;
    		$$invalidate(0, voted);
    	}

    	function tweetornotblock_voted_binding(value) {
    		voted = value;
    		$$invalidate(0, voted);
    	}

    	$$self.$$set = $$props => {
    		if ('voted' in $$props) $$invalidate(0, voted = $$props.voted);
    		if ('shouldReset' in $$props) $$invalidate(1, shouldReset = $$props.shouldReset);
    	};

    	$$self.$capture_state = () => ({
    		TweetBlock,
    		TweetOrNotBlock,
    		onMount,
    		tick,
    		TextContent,
    		streak,
    		bestScore,
    		numeral,
    		Footer,
    		endpoint,
    		tweetEndpoint,
    		voteEndpoint,
    		voted,
    		shouldReset,
    		getTweet,
    		castVote,
    		tweet,
    		vote,
    		correct,
    		handleVote,
    		handleReset,
    		$streak,
    		$bestScore
    	});

    	$$self.$inject_state = $$props => {
    		if ('voted' in $$props) $$invalidate(0, voted = $$props.voted);
    		if ('shouldReset' in $$props) $$invalidate(1, shouldReset = $$props.shouldReset);
    		if ('tweet' in $$props) $$invalidate(2, tweet = $$props.tweet);
    		if ('vote' in $$props) $$invalidate(8, vote = $$props.vote);
    		if ('correct' in $$props) $$invalidate(3, correct = $$props.correct);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*shouldReset*/ 2) {
    			{
    				if (shouldReset) {
    					handleReset();
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*tweet, voted, vote, correct, $streak*/ 285) {
    			{
    				if (tweet && voted) {
    					$$invalidate(3, correct = tweet.real ? vote >= .5 : vote < .5);

    					if (correct) {
    						streak.increment();
    						bestScore.update(n => Math.max(n, $streak));
    					} else {
    						streak.reset();
    					}
    				}
    			}
    		}
    	};

    	return [
    		voted,
    		shouldReset,
    		tweet,
    		correct,
    		$streak,
    		$bestScore,
    		handleVote,
    		handleReset,
    		vote,
    		tweetblock_conclusion_binding,
    		tweetornotblock_voted_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { voted: 0, shouldReset: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get voted() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set voted(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldReset() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldReset(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
