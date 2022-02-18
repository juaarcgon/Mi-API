
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
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
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
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
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
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
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.20.1 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (207:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*componentParams*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(207:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function wrap(route, userData, ...conditions) {
    	// Check if we don't have userData
    	if (userData && typeof userData == "function") {
    		conditions = conditions && conditions.length ? conditions : [];
    		conditions.unshift(userData);
    		userData = undefined;
    	}

    	// Parameter route and each item of conditions must be functions
    	if (!route || typeof route != "function") {
    		throw Error("Invalid parameter route");
    	}

    	if (conditions && conditions.length) {
    		for (let i = 0; i < conditions.length; i++) {
    			if (!conditions[i] || typeof conditions[i] != "function") {
    				throw Error("Invalid parameter conditions[" + i + "]");
    			}
    		}
    	}

    	// Returns an object that contains all the functions to execute too
    	const obj = { route, userData };

    	if (conditions && conditions.length) {
    		obj.conditions = conditions;
    	}

    	// The _sveltesparouter flag is to confirm the object was created by this router
    	Object.defineProperty(obj, "_sveltesparouter", { value: true });

    	return obj;
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(getLocation(), // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    	});
    }

    function pop() {
    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.history.back();
    	});
    }

    function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    		try {
    			window.history.replaceState(undefined, undefined, dest);
    		} catch(e) {
    			// eslint-disable-next-line no-console
    			console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    		}

    		// The method above doesn't trigger the hashchange event, so let's do that manually
    		window.dispatchEvent(new Event("hashchange"));
    	});
    }

    function link(node) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	// Destination must start with '/'
    	const href = node.getAttribute("href");

    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	// Add # to every href attribute
    	node.setAttribute("href", "#" + href);
    }

    function nextTickPromise(cb) {
    	return new Promise(resolve => {
    			setTimeout(
    				() => {
    					resolve(cb());
    				},
    				0
    			);
    		});
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loc,
    		$$unsubscribe_loc = noop;

    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, $$value => $$invalidate(4, $loc = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent} component - Svelte component for the route
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.route;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    			} else {
    				this.component = component;
    				this.conditions = [];
    				this.userData = undefined;
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix && path.startsWith(prefix)) {
    				path = path.substr(prefix.length) || "/";
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				out[this._keys[i]] = matches[++i] || null;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {SvelteComponent} component - Svelte component
     * @property {string} name - Name of the Svelte component
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {Object} [userData] - Custom data passed by the user
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	const dispatchNextTick = (name, detail) => {
    		// Execute this code when the current call stack is complete
    		setTimeout(
    			() => {
    				dispatch(name, detail);
    			},
    			0
    		);
    	};

    	const writable_props = ["routes", "prefix"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		nextTickPromise,
    		createEventDispatcher,
    		regexparam,
    		routes,
    		prefix,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		dispatch,
    		dispatchNextTick,
    		$loc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, $loc*/ 17) {
    			// Handle hash change events
    			// Listen to changes in the $loc store and update the page
    			 {
    				// Find a route matching the location
    				$$invalidate(0, component = null);

    				let i = 0;

    				while (!component && i < routesList.length) {
    					const match = routesList[i].match($loc.location);

    					if (match) {
    						const detail = {
    							component: routesList[i].component,
    							name: routesList[i].component.name,
    							location: $loc.location,
    							querystring: $loc.querystring,
    							userData: routesList[i].userData
    						};

    						// Check if the route can be loaded - if all conditions succeed
    						if (!routesList[i].checkConditions(detail)) {
    							// Trigger an event to notify the user
    							dispatchNextTick("conditionsFailed", detail);

    							break;
    						}

    						$$invalidate(0, component = routesList[i].component);

    						// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    						// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    						if (match && typeof match == "object" && Object.keys(match).length) {
    							$$invalidate(1, componentParams = match);
    						} else {
    							$$invalidate(1, componentParams = null);
    						}

    						dispatchNextTick("routeLoaded", detail);
    					}

    					i++;
    				}
    			}
    		}
    	};

    	return [
    		component,
    		componentParams,
    		routes,
    		prefix,
    		$loc,
    		RouteItem,
    		routesList,
    		dispatch,
    		dispatchNextTick,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { routes: 2, prefix: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (Array.isArray(mix)) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function isObject(value) {
      const type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    function getColumnSizeClass(isXs, colWidth, colSize) {
      if (colSize === true || colSize === '') {
        return isXs ? 'col' : `col-${colWidth}`;
      } else if (colSize === 'auto') {
        return isXs ? 'col-auto' : `col-${colWidth}-auto`;
      }

      return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    /* node_modules\sveltestrap\src\Button.svelte generated by Svelte v3.20.1 */
    const file = "node_modules\\sveltestrap\\src\\Button.svelte";

    // (53:0) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let button_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ value: /*value*/ ctx[6] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			add_location(button, file, 53, 2, 1061);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[21], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*close, children, $$scope*/ 262147) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*value*/ 64 && { value: /*value*/ ctx[6] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (37:0) {#if href}
    function create_if_block$1(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ href: /*href*/ ctx[3] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 37, 2, 825);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[20], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*href*/ 8 && { href: /*href*/ ctx[3] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
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
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(37:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (68:6) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(68:6) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (66:25) 
    function create_if_block_3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:25) ",
    		ctx
    	});

    	return block_1;
    }

    // (64:6) {#if close}
    function create_if_block_2(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file, 64, 8, 1250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:6) {#if close}",
    		ctx
    	});

    	return block_1;
    }

    // (63:10)        
    function fallback_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*close*/ ctx[1]) return 0;
    		if (/*children*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(button, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(63:10)        ",
    		ctx
    	});

    	return block_1;
    }

    // (49:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(49:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (47:4) {#if children}
    function create_if_block_1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(47:4) {#if children}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { block = false } = $$props;
    	let { children = undefined } = $$props;
    	let { close = false } = $$props;
    	let { color = "secondary" } = $$props;
    	let { disabled = false } = $$props;
    	let { href = "" } = $$props;
    	let { id = "" } = $$props;
    	let { outline = false } = $$props;
    	let { size = "" } = $$props;
    	let { style = "" } = $$props;
    	let { value = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(11, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$new_props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$new_props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$new_props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$new_props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$new_props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$new_props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		active,
    		block,
    		children,
    		close,
    		color,
    		disabled,
    		href,
    		id,
    		outline,
    		size,
    		style,
    		value,
    		props,
    		ariaLabel,
    		classes,
    		defaultAriaLabel
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(11, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$props) $$invalidate(6, value = $$new_props.value);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(8, classes = $$new_props.classes);
    		if ("defaultAriaLabel" in $$props) $$invalidate(9, defaultAriaLabel = $$new_props.defaultAriaLabel);
    	};

    	let ariaLabel;
    	let classes;
    	let defaultAriaLabel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(7, ariaLabel = $$props["aria-label"]);

    		if ($$self.$$.dirty & /*className, close, outline, color, size, block, active*/ 129026) {
    			 $$invalidate(8, classes = clsx(className, { close }, close || "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "btn-block" : false, { active }));
    		}

    		if ($$self.$$.dirty & /*close*/ 2) {
    			 $$invalidate(9, defaultAriaLabel = close ? "Close" : null);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		children,
    		close,
    		disabled,
    		href,
    		id,
    		style,
    		value,
    		ariaLabel,
    		classes,
    		defaultAriaLabel,
    		props,
    		className,
    		active,
    		block,
    		color,
    		outline,
    		size,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 11,
    			active: 12,
    			block: 13,
    			children: 0,
    			close: 1,
    			color: 14,
    			disabled: 2,
    			href: 3,
    			id: 4,
    			outline: 15,
    			size: 16,
    			style: 5,
    			value: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\Integrations\IntegrationsHome.svelte generated by Svelte v3.20.1 */
    const file$1 = "src\\front\\Integrations\\IntegrationsHome.svelte";

    // (53:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(53:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h2;
    	let t1;
    	let h30;
    	let t3;
    	let br0;
    	let t4;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let br1;
    	let t10;
    	let br2;
    	let t11;
    	let button3;
    	let t13;
    	let button4;
    	let t15;
    	let button5;
    	let br3;
    	let t17;
    	let br4;
    	let t18;
    	let button6;
    	let t20;
    	let button7;
    	let t22;
    	let br5;
    	let t23;
    	let h31;
    	let t25;
    	let br6;
    	let t26;
    	let button8;
    	let t28;
    	let button9;
    	let t30;
    	let button10;
    	let br7;
    	let t32;
    	let br8;
    	let t33;
    	let button11;
    	let t35;
    	let button12;
    	let t37;
    	let button13;
    	let br9;
    	let t39;
    	let br10;
    	let t40;
    	let button14;
    	let t42;
    	let button15;
    	let t44;
    	let button16;
    	let br11;
    	let t46;
    	let br12;
    	let t47;
    	let button17;
    	let br13;
    	let t49;
    	let h32;
    	let t51;
    	let br14;
    	let t52;
    	let button18;
    	let t54;
    	let button19;
    	let t56;
    	let button20;
    	let br15;
    	let t58;
    	let br16;
    	let t59;
    	let button21;
    	let t61;
    	let button22;
    	let t63;
    	let button23;
    	let br17;
    	let t65;
    	let br18;
    	let t66;
    	let button24;
    	let t68;
    	let button25;
    	let t70;
    	let button26;
    	let br19;
    	let t72;
    	let br20;
    	let t73;
    	let button27;
    	let t75;
    	let br21;
    	let t76;
    	let br22;
    	let t77;
    	let div;
    	let t78;
    	let br23;
    	let current;

    	const button28 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button28.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Integracion de APIs";
    			t1 = space();
    			h30 = element("h3");
    			h30.textContent = "Juan Manuel";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "API Grupo 05";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "API Grupo 09";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "API Grupo 12 ";
    			br1 = element("br");
    			t10 = space();
    			br2 = element("br");
    			t11 = space();
    			button3 = element("button");
    			button3.textContent = "API Grupo 22";
    			t13 = space();
    			button4 = element("button");
    			button4.textContent = "API Externa 01";
    			t15 = space();
    			button5 = element("button");
    			button5.textContent = "API Externa 02 ";
    			br3 = element("br");
    			t17 = space();
    			br4 = element("br");
    			t18 = space();
    			button6 = element("button");
    			button6.textContent = "API Externa 03";
    			t20 = space();
    			button7 = element("button");
    			button7.textContent = "API Externa 04";
    			t22 = space();
    			br5 = element("br");
    			t23 = space();
    			h31 = element("h3");
    			h31.textContent = "Adrian";
    			t25 = space();
    			br6 = element("br");
    			t26 = space();
    			button8 = element("button");
    			button8.textContent = "API Grupo 22";
    			t28 = space();
    			button9 = element("button");
    			button9.textContent = "API Grupo 10";
    			t30 = space();
    			button10 = element("button");
    			button10.textContent = "API Externa 01 ";
    			br7 = element("br");
    			t32 = space();
    			br8 = element("br");
    			t33 = space();
    			button11 = element("button");
    			button11.textContent = "API Externa 02";
    			t35 = space();
    			button12 = element("button");
    			button12.textContent = "API Externa 03";
    			t37 = space();
    			button13 = element("button");
    			button13.textContent = "API Externa 04 ";
    			br9 = element("br");
    			t39 = space();
    			br10 = element("br");
    			t40 = space();
    			button14 = element("button");
    			button14.textContent = "API Externa 05";
    			t42 = space();
    			button15 = element("button");
    			button15.textContent = "API Externa 06";
    			t44 = space();
    			button16 = element("button");
    			button16.textContent = "API Externa 07 ";
    			br11 = element("br");
    			t46 = space();
    			br12 = element("br");
    			t47 = space();
    			button17 = element("button");
    			button17.textContent = "API Externa 08 ";
    			br13 = element("br");
    			t49 = space();
    			h32 = element("h3");
    			h32.textContent = "Alejandro";
    			t51 = space();
    			br14 = element("br");
    			t52 = space();
    			button18 = element("button");
    			button18.textContent = "API Grupo 22";
    			t54 = space();
    			button19 = element("button");
    			button19.textContent = "API Grupo 12";
    			t56 = space();
    			button20 = element("button");
    			button20.textContent = "API Grupo 30 ";
    			br15 = element("br");
    			t58 = space();
    			br16 = element("br");
    			t59 = space();
    			button21 = element("button");
    			button21.textContent = "API Externa 01";
    			t61 = space();
    			button22 = element("button");
    			button22.textContent = "API Externa 02";
    			t63 = space();
    			button23 = element("button");
    			button23.textContent = "API Externa 03 ";
    			br17 = element("br");
    			t65 = space();
    			br18 = element("br");
    			t66 = space();
    			button24 = element("button");
    			button24.textContent = "API Externa 04";
    			t68 = space();
    			button25 = element("button");
    			button25.textContent = "API Externa 05";
    			t70 = space();
    			button26 = element("button");
    			button26.textContent = "API Externa 06 ";
    			br19 = element("br");
    			t72 = space();
    			br20 = element("br");
    			t73 = space();
    			button27 = element("button");
    			button27.textContent = "API Externa 07";
    			t75 = space();
    			br21 = element("br");
    			t76 = space();
    			br22 = element("br");
    			t77 = space();
    			div = element("div");
    			create_component(button28.$$.fragment);
    			t78 = space();
    			br23 = element("br");
    			set_style(h2, "text-align", "center");
    			add_location(h2, file$1, 5, 4, 134);
    			set_style(h30, "text-align", "center");
    			add_location(h30, file$1, 6, 4, 196);
    			add_location(br0, file$1, 7, 4, 251);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-secondary");
    			attr_dev(button0, "onclick", "window.location.href='#/integrations/Grupo05'");
    			set_style(button0, "margin-left", "12.5%");
    			set_style(button0, "width", "25%");
    			add_location(button0, file$1, 8, 4, 261);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-secondary");
    			attr_dev(button1, "onclick", "window.location.href='#/integrations/Grupo09'");
    			set_style(button1, "width", "25%");
    			add_location(button1, file$1, 9, 1, 430);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "btn btn-secondary");
    			attr_dev(button2, "onclick", "window.location.href='#/integrations/Grupo12'");
    			set_style(button2, "width", "25%");
    			add_location(button2, file$1, 10, 4, 581);
    			add_location(br1, file$1, 10, 151, 728);
    			add_location(br2, file$1, 11, 4, 738);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn btn-secondary");
    			attr_dev(button3, "onclick", "window.location.href='#/integrations/Grupo22'");
    			set_style(button3, "margin-left", "12.5%");
    			set_style(button3, "width", "25%");
    			add_location(button3, file$1, 12, 4, 748);
    			attr_dev(button4, "type", "button");
    			attr_dev(button4, "class", "btn btn-secondary");
    			attr_dev(button4, "onclick", "window.location.href='#/integrations/Externa01'");
    			set_style(button4, "width", "25%");
    			add_location(button4, file$1, 13, 4, 920);
    			attr_dev(button5, "type", "button");
    			attr_dev(button5, "class", "btn btn-secondary");
    			attr_dev(button5, "onclick", "window.location.href='#/integrations/Externa02'");
    			set_style(button5, "width", "25%");
    			add_location(button5, file$1, 14, 4, 1077);
    			add_location(br3, file$1, 14, 155, 1228);
    			add_location(br4, file$1, 15, 4, 1238);
    			attr_dev(button6, "type", "button");
    			attr_dev(button6, "class", "btn btn-secondary");
    			attr_dev(button6, "onclick", "window.location.href='#/integrations/Externa03'");
    			set_style(button6, "margin-left", "12.5%");
    			set_style(button6, "width", "25%");
    			add_location(button6, file$1, 16, 4, 1248);
    			attr_dev(button7, "type", "button");
    			attr_dev(button7, "class", "btn btn-secondary");
    			attr_dev(button7, "onclick", "window.location.href='#/integrations/Externa04'");
    			set_style(button7, "width", "25%");
    			add_location(button7, file$1, 17, 4, 1424);
    			add_location(br5, file$1, 18, 4, 1582);
    			set_style(h31, "text-align", "center");
    			add_location(h31, file$1, 19, 4, 1592);
    			add_location(br6, file$1, 20, 4, 1642);
    			attr_dev(button8, "type", "button");
    			attr_dev(button8, "class", "btn btn-secondary");
    			attr_dev(button8, "onclick", "window.location.href='#/integrations/api-22'");
    			set_style(button8, "margin-left", "12.5%");
    			set_style(button8, "width", "25%");
    			add_location(button8, file$1, 21, 4, 1652);
    			attr_dev(button9, "type", "button");
    			attr_dev(button9, "class", "btn btn-secondary");
    			attr_dev(button9, "onclick", "window.location.href='#/integrations/api-10'");
    			set_style(button9, "width", "25%");
    			add_location(button9, file$1, 22, 1, 1820);
    			attr_dev(button10, "type", "button");
    			attr_dev(button10, "class", "btn btn-secondary");
    			attr_dev(button10, "onclick", "window.location.href='#/integrations/coins'");
    			set_style(button10, "width", "25%");
    			add_location(button10, file$1, 23, 4, 1970);
    			add_location(br7, file$1, 23, 151, 2117);
    			add_location(br8, file$1, 24, 4, 2127);
    			attr_dev(button11, "type", "button");
    			attr_dev(button11, "class", "btn btn-secondary");
    			attr_dev(button11, "onclick", "window.location.href='#/integrations/Hearthstone'");
    			set_style(button11, "margin-left", "12.5%");
    			set_style(button11, "width", "25%");
    			add_location(button11, file$1, 25, 4, 2137);
    			attr_dev(button12, "type", "button");
    			attr_dev(button12, "class", "btn btn-secondary");
    			attr_dev(button12, "onclick", "window.location.href='#/integrations/City'");
    			set_style(button12, "width", "25%");
    			add_location(button12, file$1, 26, 4, 2315);
    			attr_dev(button13, "type", "button");
    			attr_dev(button13, "class", "btn btn-secondary");
    			attr_dev(button13, "onclick", "window.location.href='#/integrations/proxy_latency'");
    			set_style(button13, "width", "25%");
    			add_location(button13, file$1, 27, 4, 2467);
    			add_location(br9, file$1, 27, 159, 2622);
    			add_location(br10, file$1, 28, 4, 2632);
    			attr_dev(button14, "type", "button");
    			attr_dev(button14, "class", "btn btn-secondary");
    			attr_dev(button14, "onclick", "window.location.href='#/integrations/soccer_games'");
    			set_style(button14, "margin-left", "12.5%");
    			set_style(button14, "width", "25%");
    			add_location(button14, file$1, 29, 4, 2642);
    			attr_dev(button15, "type", "button");
    			attr_dev(button15, "class", "btn btn-secondary");
    			attr_dev(button15, "onclick", "window.location.href='#/integrations/name'");
    			set_style(button15, "width", "25%");
    			add_location(button15, file$1, 30, 4, 2821);
    			attr_dev(button16, "type", "button");
    			attr_dev(button16, "class", "btn btn-secondary");
    			attr_dev(button16, "onclick", "window.location.href='#/integrations/Investors'");
    			set_style(button16, "width", "25%");
    			add_location(button16, file$1, 31, 4, 2975);
    			add_location(br11, file$1, 31, 156, 3127);
    			add_location(br12, file$1, 32, 4, 3137);
    			attr_dev(button17, "type", "button");
    			attr_dev(button17, "class", "btn btn-secondary");
    			attr_dev(button17, "onclick", "window.location.href='#/integrations/Post_code'");
    			set_style(button17, "margin-left", "12.5%");
    			set_style(button17, "width", "25%");
    			add_location(button17, file$1, 33, 4, 3147);
    			add_location(br13, file$1, 33, 175, 3318);
    			set_style(h32, "text-align", "center");
    			add_location(h32, file$1, 34, 4, 3328);
    			add_location(br14, file$1, 35, 4, 3381);
    			attr_dev(button18, "type", "button");
    			attr_dev(button18, "class", "btn btn-secondary");
    			attr_dev(button18, "onclick", "window.location.href='#/integrations/G22'");
    			set_style(button18, "margin-left", "12.5%");
    			set_style(button18, "width", "25%");
    			add_location(button18, file$1, 36, 4, 3391);
    			attr_dev(button19, "type", "button");
    			attr_dev(button19, "class", "btn btn-secondary");
    			attr_dev(button19, "onclick", "window.location.href='#/integrations/G12'");
    			set_style(button19, "width", "25%");
    			add_location(button19, file$1, 37, 1, 3556);
    			attr_dev(button20, "type", "button");
    			attr_dev(button20, "class", "btn btn-secondary");
    			attr_dev(button20, "onclick", "window.location.href='#/integrations/G30'");
    			set_style(button20, "width", "25%");
    			add_location(button20, file$1, 38, 4, 3703);
    			add_location(br15, file$1, 38, 147, 3846);
    			add_location(br16, file$1, 39, 4, 3856);
    			attr_dev(button21, "type", "button");
    			attr_dev(button21, "class", "btn btn-secondary");
    			attr_dev(button21, "onclick", "window.location.href='#/integrations/E01'");
    			set_style(button21, "margin-left", "12.5%");
    			set_style(button21, "width", "25%");
    			add_location(button21, file$1, 40, 4, 3866);
    			attr_dev(button22, "type", "button");
    			attr_dev(button22, "class", "btn btn-secondary");
    			attr_dev(button22, "onclick", "window.location.href='#/integrations/E02'");
    			set_style(button22, "width", "25%");
    			add_location(button22, file$1, 41, 4, 4035);
    			attr_dev(button23, "type", "button");
    			attr_dev(button23, "class", "btn btn-secondary");
    			attr_dev(button23, "onclick", "window.location.href='#/integrations/E03'");
    			set_style(button23, "width", "25%");
    			add_location(button23, file$1, 42, 4, 4188);
    			add_location(br17, file$1, 42, 151, 4335);
    			add_location(br18, file$1, 43, 4, 4345);
    			attr_dev(button24, "type", "button");
    			attr_dev(button24, "class", "btn btn-secondary");
    			attr_dev(button24, "onclick", "window.location.href='#/integrations/E04'");
    			set_style(button24, "margin-left", "12.5%");
    			set_style(button24, "width", "25%");
    			add_location(button24, file$1, 44, 4, 4355);
    			attr_dev(button25, "type", "button");
    			attr_dev(button25, "class", "btn btn-secondary");
    			attr_dev(button25, "onclick", "window.location.href='#/integrations/E05'");
    			set_style(button25, "width", "25%");
    			add_location(button25, file$1, 45, 4, 4524);
    			attr_dev(button26, "type", "button");
    			attr_dev(button26, "class", "btn btn-secondary");
    			attr_dev(button26, "onclick", "window.location.href='#/integrations/E06'");
    			set_style(button26, "width", "25%");
    			add_location(button26, file$1, 46, 4, 4677);
    			add_location(br19, file$1, 46, 151, 4824);
    			add_location(br20, file$1, 47, 4, 4834);
    			attr_dev(button27, "type", "button");
    			attr_dev(button27, "class", "btn btn-secondary");
    			attr_dev(button27, "onclick", "window.location.href='#/integrations/E07'");
    			set_style(button27, "margin-left", "12.5%");
    			set_style(button27, "width", "25%");
    			add_location(button27, file$1, 48, 4, 4844);
    			add_location(br21, file$1, 49, 4, 5013);
    			add_location(br22, file$1, 50, 4, 5023);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			add_location(div, file$1, 51, 4, 5033);
    			add_location(br23, file$1, 54, 4, 5174);
    			add_location(main, file$1, 4, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t1);
    			append_dev(main, h30);
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, t4);
    			append_dev(main, button0);
    			append_dev(main, t6);
    			append_dev(main, button1);
    			append_dev(main, t8);
    			append_dev(main, button2);
    			append_dev(main, br1);
    			append_dev(main, t10);
    			append_dev(main, br2);
    			append_dev(main, t11);
    			append_dev(main, button3);
    			append_dev(main, t13);
    			append_dev(main, button4);
    			append_dev(main, t15);
    			append_dev(main, button5);
    			append_dev(main, br3);
    			append_dev(main, t17);
    			append_dev(main, br4);
    			append_dev(main, t18);
    			append_dev(main, button6);
    			append_dev(main, t20);
    			append_dev(main, button7);
    			append_dev(main, t22);
    			append_dev(main, br5);
    			append_dev(main, t23);
    			append_dev(main, h31);
    			append_dev(main, t25);
    			append_dev(main, br6);
    			append_dev(main, t26);
    			append_dev(main, button8);
    			append_dev(main, t28);
    			append_dev(main, button9);
    			append_dev(main, t30);
    			append_dev(main, button10);
    			append_dev(main, br7);
    			append_dev(main, t32);
    			append_dev(main, br8);
    			append_dev(main, t33);
    			append_dev(main, button11);
    			append_dev(main, t35);
    			append_dev(main, button12);
    			append_dev(main, t37);
    			append_dev(main, button13);
    			append_dev(main, br9);
    			append_dev(main, t39);
    			append_dev(main, br10);
    			append_dev(main, t40);
    			append_dev(main, button14);
    			append_dev(main, t42);
    			append_dev(main, button15);
    			append_dev(main, t44);
    			append_dev(main, button16);
    			append_dev(main, br11);
    			append_dev(main, t46);
    			append_dev(main, br12);
    			append_dev(main, t47);
    			append_dev(main, button17);
    			append_dev(main, br13);
    			append_dev(main, t49);
    			append_dev(main, h32);
    			append_dev(main, t51);
    			append_dev(main, br14);
    			append_dev(main, t52);
    			append_dev(main, button18);
    			append_dev(main, t54);
    			append_dev(main, button19);
    			append_dev(main, t56);
    			append_dev(main, button20);
    			append_dev(main, br15);
    			append_dev(main, t58);
    			append_dev(main, br16);
    			append_dev(main, t59);
    			append_dev(main, button21);
    			append_dev(main, t61);
    			append_dev(main, button22);
    			append_dev(main, t63);
    			append_dev(main, button23);
    			append_dev(main, br17);
    			append_dev(main, t65);
    			append_dev(main, br18);
    			append_dev(main, t66);
    			append_dev(main, button24);
    			append_dev(main, t68);
    			append_dev(main, button25);
    			append_dev(main, t70);
    			append_dev(main, button26);
    			append_dev(main, br19);
    			append_dev(main, t72);
    			append_dev(main, br20);
    			append_dev(main, t73);
    			append_dev(main, button27);
    			append_dev(main, t75);
    			append_dev(main, br21);
    			append_dev(main, t76);
    			append_dev(main, br22);
    			append_dev(main, t77);
    			append_dev(main, div);
    			mount_component(button28, div, null);
    			append_dev(main, t78);
    			append_dev(main, br23);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button28_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button28_changes.$$scope = { dirty, ctx };
    			}

    			button28.$set(button28_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button28.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button28.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button28);
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

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntegrationsHome> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("IntegrationsHome", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button });
    	return [];
    }

    class IntegrationsHome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntegrationsHome",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\front\Analytics.svelte generated by Svelte v3.20.1 */
    const file$2 = "src\\front\\Analytics.svelte";

    function create_fragment$3(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let t0;
    	let main;
    	let figure;
    	let div;
    	let t1;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra los datos de las 3 APIs. Los Ranking de las diversas APIs";
    			if (script0.src !== (script0_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$2, 93, 4, 3175);
    			if (script1.src !== (script1_src_value = "https://code.highcharts.com/highcharts-more.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$2, 94, 4, 3266);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$2, 95, 4, 3362);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/modules/accessibility.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$2, 96, 4, 3460);
    			attr_dev(div, "id", "container");
    			add_location(div, file$2, 103, 8, 3636);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$2, 104, 8, 3672);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$2, 102, 4, 3592);
    			add_location(main, file$2, 100, 0, 3578);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(script0, "load", loadGraph, false, false, false),
    				listen_dev(script1, "load", loadGraph, false, false, false),
    				listen_dev(script2, "load", loadGraph, false, false, false),
    				listen_dev(script3, "load", loadGraph, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			run_all(dispose);
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

    async function loadGraph() {
    	const resDatahappiness_rate = await fetch("/api/v2/happiness_rate");
    	const resDataGlobal_Competitiveness = await fetch("/api/v2/global_competitiveness_index");
    	const resDataCountries_for_equality = await fetch("/api/v2/countries_for_equality_stats");
    	let Data = await resDatahappiness_rate.json();
    	let Data1 = await resDataGlobal_Competitiveness.json();
    	let Data2 = await resDataCountries_for_equality.json();

    	let datahappiness_rate = Data.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["happinessRanking"]
    		};

    		return res;
    	});

    	let dataGlobal_Competitiveness = Data1.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["ranking"]
    		};

    		return res;
    	});

    	let dataCountries_for_equality = Data2.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking de Felicidad por Paises",
    			data: datahappiness_rate
    		},
    		{
    			name: "Ranking de Competitividad Global",
    			data: dataGlobal_Competitiveness
    		},
    		{
    			name: "Ranking de Igualdad",
    			data: dataCountries_for_equality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "40%" },
    		title: { text: "Mezcla de APIs" },
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 500,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$3($$self, $$props, $$invalidate) {
    	loadGraph();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Analytics> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Analytics", $$slots, []);
    	$$self.$capture_state = () => ({ Button, loadGraph });
    	return [];
    }

    class Analytics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Analytics",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\front\videos\About.svelte generated by Svelte v3.20.1 */

    const file$3 = "src\\front\\videos\\About.svelte";

    function create_fragment$4(ctx) {
    	let body;
    	let h3;
    	let t1;
    	let div0;
    	let h50;
    	let t3;
    	let iframe0;
    	let iframe0_src_value;
    	let t4;
    	let div1;
    	let h51;
    	let t6;
    	let iframe1;
    	let iframe1_src_value;
    	let t7;
    	let div2;
    	let h52;
    	let t9;
    	let iframe2;
    	let iframe2_src_value;

    	const block = {
    		c: function create() {
    			body = element("body");
    			h3 = element("h3");
    			h3.textContent = "Videos";
    			t1 = space();
    			div0 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Video Juan Manuel";
    			t3 = space();
    			iframe0 = element("iframe");
    			t4 = space();
    			div1 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Video Adrian";
    			t6 = space();
    			iframe1 = element("iframe");
    			t7 = space();
    			div2 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Video Alejandro";
    			t9 = space();
    			iframe2 = element("iframe");
    			attr_dev(h3, "align", "center");
    			add_location(h3, file$3, 7, 4, 76);
    			attr_dev(h50, "align", "center");
    			add_location(h50, file$3, 9, 8, 145);
    			attr_dev(iframe0, "title", "Video Juan Manuel");
    			attr_dev(iframe0, "width", "560");
    			attr_dev(iframe0, "height", "315");
    			if (iframe0.src !== (iframe0_src_value = "https://www.youtube.com/embed/asMyReN6gBc")) attr_dev(iframe0, "src", iframe0_src_value);
    			attr_dev(iframe0, "frameborder", "0");
    			attr_dev(iframe0, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe0.allowFullscreen = true;
    			add_location(iframe0, file$3, 10, 8, 199);
    			attr_dev(div0, "class", "columna svelte-1fqpbmq");
    			add_location(div0, file$3, 8, 4, 114);
    			attr_dev(h51, "align", "center");
    			add_location(h51, file$3, 13, 12, 489);
    			attr_dev(iframe1, "title", "Video Adrian");
    			attr_dev(iframe1, "width", "560");
    			attr_dev(iframe1, "height", "315");
    			if (iframe1.src !== (iframe1_src_value = "https://www.youtube.com/embed/7KIEKW5Djg4")) attr_dev(iframe1, "src", iframe1_src_value);
    			attr_dev(iframe1, "frameborder", "0");
    			attr_dev(iframe1, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe1.allowFullscreen = true;
    			add_location(iframe1, file$3, 14, 12, 542);
    			attr_dev(div1, "class", "columna svelte-1fqpbmq");
    			add_location(div1, file$3, 12, 8, 454);
    			attr_dev(h52, "align", "center");
    			add_location(h52, file$3, 17, 12, 827);
    			attr_dev(iframe2, "title", "Video Alejandro");
    			attr_dev(iframe2, "width", "560");
    			attr_dev(iframe2, "height", "315");
    			if (iframe2.src !== (iframe2_src_value = "https://www.youtube.com/embed/vMRcFGg8yww")) attr_dev(iframe2, "src", iframe2_src_value);
    			attr_dev(iframe2, "frameborder", "0");
    			attr_dev(iframe2, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe2.allowFullscreen = true;
    			add_location(iframe2, file$3, 18, 12, 883);
    			attr_dev(div2, "class", "columna svelte-1fqpbmq");
    			add_location(div2, file$3, 16, 8, 792);
    			add_location(body, file$3, 6, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, h3);
    			append_dev(body, t1);
    			append_dev(body, div0);
    			append_dev(div0, h50);
    			append_dev(div0, t3);
    			append_dev(div0, iframe0);
    			append_dev(body, t4);
    			append_dev(body, div1);
    			append_dev(div1, h51);
    			append_dev(div1, t6);
    			append_dev(div1, iframe1);
    			append_dev(body, t7);
    			append_dev(body, div2);
    			append_dev(div2, h52);
    			append_dev(div2, t9);
    			append_dev(div2, iframe2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
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

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules\sveltestrap\src\Table.svelte generated by Svelte v3.20.1 */
    const file$4 = "node_modules\\sveltestrap\\src\\Table.svelte";

    // (38:0) {:else}
    function create_else_block$2(ctx) {
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file$4, 38, 2, 908);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    				}
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if responsive}
    function create_if_block$2(ctx) {
    	let div;
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let table_levels = [/*props*/ ctx[3], { class: /*classes*/ ctx[1] }];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			add_location(table, file$4, 33, 4, 826);
    			attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			add_location(div, file$4, 32, 2, 788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null));
    				}
    			}

    			set_attributes(table, get_spread_update(table_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));

    			if (!current || dirty & /*responsiveClassName*/ 4) {
    				attr_dev(div, "class", /*responsiveClassName*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(32:0) {#if responsive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*responsive*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { class: className = "" } = $$props;
    	let { size = "" } = $$props;
    	let { bordered = false } = $$props;
    	let { borderless = false } = $$props;
    	let { striped = false } = $$props;
    	let { dark = false } = $$props;
    	let { hover = false } = $$props;
    	let { responsive = false } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Table", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$new_props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$new_props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$new_props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$new_props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$new_props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$new_props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		responsive,
    		props,
    		classes,
    		responsiveClassName
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("bordered" in $$props) $$invalidate(6, bordered = $$new_props.bordered);
    		if ("borderless" in $$props) $$invalidate(7, borderless = $$new_props.borderless);
    		if ("striped" in $$props) $$invalidate(8, striped = $$new_props.striped);
    		if ("dark" in $$props) $$invalidate(9, dark = $$new_props.dark);
    		if ("hover" in $$props) $$invalidate(10, hover = $$new_props.hover);
    		if ("responsive" in $$props) $$invalidate(0, responsive = $$new_props.responsive);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("responsiveClassName" in $$props) $$invalidate(2, responsiveClassName = $$new_props.responsiveClassName);
    	};

    	let classes;
    	let responsiveClassName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, size, bordered, borderless, striped, dark, hover*/ 2032) {
    			 $$invalidate(1, classes = clsx(className, "table", size ? "table-" + size : false, bordered ? "table-bordered" : false, borderless ? "table-borderless" : false, striped ? "table-striped" : false, dark ? "table-dark" : false, hover ? "table-hover" : false));
    		}

    		if ($$self.$$.dirty & /*responsive*/ 1) {
    			 $$invalidate(2, responsiveClassName = responsive === true
    			? "table-responsive"
    			: `table-responsive-${responsive}`);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		responsive,
    		classes,
    		responsiveClassName,
    		props,
    		className,
    		size,
    		bordered,
    		borderless,
    		striped,
    		dark,
    		hover,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 4,
    			size: 5,
    			bordered: 6,
    			borderless: 7,
    			striped: 8,
    			dark: 9,
    			hover: 10,
    			responsive: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bordered() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bordered(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get responsive() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set responsive(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\FormGroup.svelte generated by Svelte v3.20.1 */
    const file$5 = "node_modules\\sveltestrap\\src\\FormGroup.svelte";

    // (29:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let div_levels = [/*props*/ ctx[3], { id: /*id*/ ctx[0] }, { class: /*classes*/ ctx[2] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 29, 2, 648);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[10], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*classes*/ 4 && { class: /*classes*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(29:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if tag === 'fieldset'}
    function create_if_block$3(ctx) {
    	let fieldset;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let fieldset_levels = [/*props*/ ctx[3], { id: /*id*/ ctx[0] }, { class: /*classes*/ ctx[2] }];
    	let fieldset_data = {};

    	for (let i = 0; i < fieldset_levels.length; i += 1) {
    		fieldset_data = assign(fieldset_data, fieldset_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			if (default_slot) default_slot.c();
    			set_attributes(fieldset, fieldset_data);
    			add_location(fieldset, file$5, 25, 2, 568);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);

    			if (default_slot) {
    				default_slot.m(fieldset, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[10], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null));
    				}
    			}

    			set_attributes(fieldset, get_spread_update(fieldset_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*classes*/ 4 && { class: /*classes*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:0) {#if tag === 'fieldset'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[1] === "fieldset") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { class: className = "" } = $$props;
    	let { row = false } = $$props;
    	let { check = false } = $$props;
    	let { inline = false } = $$props;
    	let { disabled = false } = $$props;
    	let { id = "" } = $$props;
    	let { tag = null } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FormGroup", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("row" in $$new_props) $$invalidate(5, row = $$new_props.row);
    		if ("check" in $$new_props) $$invalidate(6, check = $$new_props.check);
    		if ("inline" in $$new_props) $$invalidate(7, inline = $$new_props.inline);
    		if ("disabled" in $$new_props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("tag" in $$new_props) $$invalidate(1, tag = $$new_props.tag);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		row,
    		check,
    		inline,
    		disabled,
    		id,
    		tag,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("row" in $$props) $$invalidate(5, row = $$new_props.row);
    		if ("check" in $$props) $$invalidate(6, check = $$new_props.check);
    		if ("inline" in $$props) $$invalidate(7, inline = $$new_props.inline);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("tag" in $$props) $$invalidate(1, tag = $$new_props.tag);
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, row, check, inline, disabled*/ 496) {
    			 $$invalidate(2, classes = clsx(className, row ? "row" : false, check ? "form-check" : "form-group", check && inline ? "form-check-inline" : false, check && disabled ? "disabled" : false));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		id,
    		tag,
    		classes,
    		props,
    		className,
    		row,
    		check,
    		inline,
    		disabled,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class FormGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 4,
    			row: 5,
    			check: 6,
    			inline: 7,
    			disabled: 8,
    			id: 0,
    			tag: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormGroup",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get row() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get check() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set check(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tag() {
    		throw new Error("<FormGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error("<FormGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Input.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$6 = "node_modules\\sveltestrap\\src\\Input.svelte";

    // (391:39) 
    function create_if_block_17(ctx) {
    	let select;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	let select_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ multiple: true },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] }
    	];

    	let select_data = {};

    	for (let i = 0; i < select_levels.length; i += 1) {
    		select_data = assign(select_data, select_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (default_slot) default_slot.c();
    			set_attributes(select, select_data);
    			if (/*value*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[161].call(select));
    			add_location(select, file$6, 391, 2, 7495);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, select, anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_options(select, /*value*/ ctx[1]);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(select, "blur", /*blur_handler_17*/ ctx[141], false, false, false),
    				listen_dev(select, "focus", /*focus_handler_17*/ ctx[142], false, false, false),
    				listen_dev(select, "change", /*change_handler_16*/ ctx[143], false, false, false),
    				listen_dev(select, "input", /*input_handler_16*/ ctx[144], false, false, false),
    				listen_dev(select, "change", /*select_change_handler_1*/ ctx[161])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[25], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[25], dirty, null));
    				}
    			}

    			set_attributes(select, get_spread_update(select_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ multiple: true },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				select_options(select, /*value*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(391:39) ",
    		ctx
    	});

    	return block;
    }

    // (376:40) 
    function create_if_block_16(ctx) {
    	let select;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	let select_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] }
    	];

    	let select_data = {};

    	for (let i = 0; i < select_levels.length; i += 1) {
    		select_data = assign(select_data, select_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (default_slot) default_slot.c();
    			set_attributes(select, select_data);
    			if (/*value*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[160].call(select));
    			add_location(select, file$6, 376, 2, 7281);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, select, anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_option(select, /*value*/ ctx[1]);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(select, "blur", /*blur_handler_16*/ ctx[137], false, false, false),
    				listen_dev(select, "focus", /*focus_handler_16*/ ctx[138], false, false, false),
    				listen_dev(select, "change", /*change_handler_15*/ ctx[139], false, false, false),
    				listen_dev(select, "input", /*input_handler_15*/ ctx[140], false, false, false),
    				listen_dev(select, "change", /*select_change_handler*/ ctx[160])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[25], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[25], dirty, null));
    				}
    			}

    			set_attributes(select, get_spread_update(select_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				select_option(select, /*value*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(376:40) ",
    		ctx
    	});

    	return block;
    }

    // (360:29) 
    function create_if_block_15(ctx) {
    	let textarea;
    	let dispose;

    	let textarea_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] }
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			set_attributes(textarea, textarea_data);
    			add_location(textarea, file$6, 360, 2, 7043);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(textarea, "blur", /*blur_handler_15*/ ctx[130], false, false, false),
    				listen_dev(textarea, "focus", /*focus_handler_15*/ ctx[131], false, false, false),
    				listen_dev(textarea, "keydown", /*keydown_handler_15*/ ctx[132], false, false, false),
    				listen_dev(textarea, "keypress", /*keypress_handler_15*/ ctx[133], false, false, false),
    				listen_dev(textarea, "keyup", /*keyup_handler_15*/ ctx[134], false, false, false),
    				listen_dev(textarea, "change", /*change_handler_14*/ ctx[135], false, false, false),
    				listen_dev(textarea, "input", /*input_handler_14*/ ctx[136], false, false, false),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[159])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea, get_spread_update(textarea_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(textarea, /*value*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(360:29) ",
    		ctx
    	});

    	return block;
    }

    // (86:0) {#if tag === 'input'}
    function create_if_block$4(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[3] === "text") return create_if_block_1$1;
    		if (/*type*/ ctx[3] === "password") return create_if_block_2$1;
    		if (/*type*/ ctx[3] === "email") return create_if_block_3$1;
    		if (/*type*/ ctx[3] === "file") return create_if_block_4;
    		if (/*type*/ ctx[3] === "checkbox") return create_if_block_5;
    		if (/*type*/ ctx[3] === "radio") return create_if_block_6;
    		if (/*type*/ ctx[3] === "url") return create_if_block_7;
    		if (/*type*/ ctx[3] === "number") return create_if_block_8;
    		if (/*type*/ ctx[3] === "date") return create_if_block_9;
    		if (/*type*/ ctx[3] === "time") return create_if_block_10;
    		if (/*type*/ ctx[3] === "datetime") return create_if_block_11;
    		if (/*type*/ ctx[3] === "color") return create_if_block_12;
    		if (/*type*/ ctx[3] === "range") return create_if_block_13;
    		if (/*type*/ ctx[3] === "search") return create_if_block_14;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
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
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(86:0) {#if tag === 'input'}",
    		ctx
    	});

    	return block;
    }

    // (340:2) {:else}
    function create_else_block$4(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: /*type*/ ctx[3] },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] },
    		{ value: /*value*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 340, 4, 6710);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_14*/ ctx[125], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_14*/ ctx[126], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_14*/ ctx[127], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_14*/ ctx[128], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_14*/ ctx[129], false, false, false),
    				listen_dev(input, "input", /*handleInput*/ ctx[13], false, false, false),
    				listen_dev(input, "change", /*handleInput*/ ctx[13], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				dirty[0] & /*type*/ 8 && { type: /*type*/ ctx[3] },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] },
    				dirty[0] & /*value*/ 2 && { value: /*value*/ ctx[1] }
    			]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(340:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (322:30) 
    function create_if_block_14(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "search" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 322, 4, 6422);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_13*/ ctx[118], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_13*/ ctx[119], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_13*/ ctx[120], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_13*/ ctx[121], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_13*/ ctx[122], false, false, false),
    				listen_dev(input, "change", /*change_handler_13*/ ctx[123], false, false, false),
    				listen_dev(input, "input", /*input_handler_13*/ ctx[124], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_9*/ ctx[158])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "search" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(322:30) ",
    		ctx
    	});

    	return block;
    }

    // (304:29) 
    function create_if_block_13(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "range" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 304, 4, 6114);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_12*/ ctx[111], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_12*/ ctx[112], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_12*/ ctx[113], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_12*/ ctx[114], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_12*/ ctx[115], false, false, false),
    				listen_dev(input, "change", /*change_handler_12*/ ctx[116], false, false, false),
    				listen_dev(input, "input", /*input_handler_12*/ ctx[117], false, false, false),
    				listen_dev(input, "change", /*input_change_input_handler*/ ctx[157]),
    				listen_dev(input, "input", /*input_change_input_handler*/ ctx[157])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "range" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(304:29) ",
    		ctx
    	});

    	return block;
    }

    // (286:29) 
    function create_if_block_12(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "color" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 286, 4, 5807);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_11*/ ctx[104], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_11*/ ctx[105], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_11*/ ctx[106], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_11*/ ctx[107], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_11*/ ctx[108], false, false, false),
    				listen_dev(input, "change", /*change_handler_11*/ ctx[109], false, false, false),
    				listen_dev(input, "input", /*input_handler_11*/ ctx[110], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_8*/ ctx[156])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "color" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(286:29) ",
    		ctx
    	});

    	return block;
    }

    // (268:32) 
    function create_if_block_11(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "datetime" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 268, 4, 5497);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_10*/ ctx[97], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_10*/ ctx[98], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_10*/ ctx[99], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_10*/ ctx[100], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_10*/ ctx[101], false, false, false),
    				listen_dev(input, "change", /*change_handler_10*/ ctx[102], false, false, false),
    				listen_dev(input, "input", /*input_handler_10*/ ctx[103], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_7*/ ctx[155])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "datetime" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(268:32) ",
    		ctx
    	});

    	return block;
    }

    // (250:28) 
    function create_if_block_10(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "time" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 250, 4, 5188);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_9*/ ctx[90], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_9*/ ctx[91], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_9*/ ctx[92], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_9*/ ctx[93], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_9*/ ctx[94], false, false, false),
    				listen_dev(input, "change", /*change_handler_9*/ ctx[95], false, false, false),
    				listen_dev(input, "input", /*input_handler_9*/ ctx[96], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_6*/ ctx[154])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "time" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(250:28) ",
    		ctx
    	});

    	return block;
    }

    // (232:28) 
    function create_if_block_9(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "date" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 232, 4, 4883);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_8*/ ctx[83], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_8*/ ctx[84], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_8*/ ctx[85], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_8*/ ctx[86], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_8*/ ctx[87], false, false, false),
    				listen_dev(input, "change", /*change_handler_8*/ ctx[88], false, false, false),
    				listen_dev(input, "input", /*input_handler_8*/ ctx[89], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_5*/ ctx[153])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "date" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(232:28) ",
    		ctx
    	});

    	return block;
    }

    // (214:30) 
    function create_if_block_8(ctx) {
    	let input;
    	let input_updating = false;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "number" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	function input_input_handler_4() {
    		input_updating = true;
    		/*input_input_handler_4*/ ctx[152].call(input);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 214, 4, 4576);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_7*/ ctx[76], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_7*/ ctx[77], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_7*/ ctx[78], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_7*/ ctx[79], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_7*/ ctx[80], false, false, false),
    				listen_dev(input, "change", /*change_handler_7*/ ctx[81], false, false, false),
    				listen_dev(input, "input", /*input_handler_7*/ ctx[82], false, false, false),
    				listen_dev(input, "input", input_input_handler_4)
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "number" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (!input_updating && dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			input_updating = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(214:30) ",
    		ctx
    	});

    	return block;
    }

    // (196:27) 
    function create_if_block_7(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "url" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 196, 4, 4270);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_6*/ ctx[69], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_6*/ ctx[70], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_6*/ ctx[71], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_6*/ ctx[72], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_6*/ ctx[73], false, false, false),
    				listen_dev(input, "change", /*change_handler_6*/ ctx[74], false, false, false),
    				listen_dev(input, "input", /*input_handler_6*/ ctx[75], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_3*/ ctx[151])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "url" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(196:27) ",
    		ctx
    	});

    	return block;
    }

    // (178:29) 
    function create_if_block_6(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "radio" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 178, 4, 3965);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_5*/ ctx[62], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_5*/ ctx[63], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_5*/ ctx[64], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_5*/ ctx[65], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_5*/ ctx[66], false, false, false),
    				listen_dev(input, "change", /*change_handler_5*/ ctx[67], false, false, false),
    				listen_dev(input, "input", /*input_handler_5*/ ctx[68], false, false, false),
    				listen_dev(input, "change", /*input_change_handler_2*/ ctx[150])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "radio" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(178:29) ",
    		ctx
    	});

    	return block;
    }

    // (159:32) 
    function create_if_block_5(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "checkbox" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 159, 4, 3636);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			input.checked = /*checked*/ ctx[0];
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_4*/ ctx[55], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_4*/ ctx[56], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_4*/ ctx[57], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_4*/ ctx[58], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_4*/ ctx[59], false, false, false),
    				listen_dev(input, "change", /*change_handler_4*/ ctx[60], false, false, false),
    				listen_dev(input, "input", /*input_handler_4*/ ctx[61], false, false, false),
    				listen_dev(input, "change", /*input_change_handler_1*/ ctx[149])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "checkbox" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty[0] & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(159:32) ",
    		ctx
    	});

    	return block;
    }

    // (141:28) 
    function create_if_block_4(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "file" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 141, 4, 3327);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_3*/ ctx[48], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_3*/ ctx[49], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_3*/ ctx[50], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_3*/ ctx[51], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_3*/ ctx[52], false, false, false),
    				listen_dev(input, "change", /*change_handler_3*/ ctx[53], false, false, false),
    				listen_dev(input, "input", /*input_handler_3*/ ctx[54], false, false, false),
    				listen_dev(input, "change", /*input_change_handler*/ ctx[148])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "file" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(141:28) ",
    		ctx
    	});

    	return block;
    }

    // (123:29) 
    function create_if_block_3$1(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "email" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 123, 4, 3021);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_2*/ ctx[41], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_2*/ ctx[42], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_2*/ ctx[43], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_2*/ ctx[44], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_2*/ ctx[45], false, false, false),
    				listen_dev(input, "change", /*change_handler_2*/ ctx[46], false, false, false),
    				listen_dev(input, "input", /*input_handler_2*/ ctx[47], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_2*/ ctx[147])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "email" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(123:29) ",
    		ctx
    	});

    	return block;
    }

    // (105:32) 
    function create_if_block_2$1(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "password" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 105, 4, 2711);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler_1*/ ctx[34], false, false, false),
    				listen_dev(input, "focus", /*focus_handler_1*/ ctx[35], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler_1*/ ctx[36], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler_1*/ ctx[37], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler_1*/ ctx[38], false, false, false),
    				listen_dev(input, "change", /*change_handler_1*/ ctx[39], false, false, false),
    				listen_dev(input, "input", /*input_handler_1*/ ctx[40], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_1*/ ctx[146])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "password" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(105:32) ",
    		ctx
    	});

    	return block;
    }

    // (87:2) {#if type === 'text'}
    function create_if_block_1$1(ctx) {
    	let input;
    	let dispose;

    	let input_levels = [
    		/*props*/ ctx[12],
    		{ id: /*id*/ ctx[6] },
    		{ type: "text" },
    		{ readOnly: /*readonly*/ ctx[4] },
    		{ class: /*classes*/ ctx[10] },
    		{ name: /*name*/ ctx[7] },
    		{ disabled: /*disabled*/ ctx[9] },
    		{ placeholder: /*placeholder*/ ctx[8] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$6, 87, 4, 2402);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "blur", /*blur_handler*/ ctx[27], false, false, false),
    				listen_dev(input, "focus", /*focus_handler*/ ctx[28], false, false, false),
    				listen_dev(input, "keydown", /*keydown_handler*/ ctx[29], false, false, false),
    				listen_dev(input, "keypress", /*keypress_handler*/ ctx[30], false, false, false),
    				listen_dev(input, "keyup", /*keyup_handler*/ ctx[31], false, false, false),
    				listen_dev(input, "change", /*change_handler*/ ctx[32], false, false, false),
    				listen_dev(input, "input", /*input_handler*/ ctx[33], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[145])
    			];
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, get_spread_update(input_levels, [
    				dirty[0] & /*props*/ 4096 && /*props*/ ctx[12],
    				dirty[0] & /*id*/ 64 && { id: /*id*/ ctx[6] },
    				{ type: "text" },
    				dirty[0] & /*readonly*/ 16 && { readOnly: /*readonly*/ ctx[4] },
    				dirty[0] & /*classes*/ 1024 && { class: /*classes*/ ctx[10] },
    				dirty[0] & /*name*/ 128 && { name: /*name*/ ctx[7] },
    				dirty[0] & /*disabled*/ 512 && { disabled: /*disabled*/ ctx[9] },
    				dirty[0] & /*placeholder*/ 256 && { placeholder: /*placeholder*/ ctx[8] }
    			]));

    			if (dirty[0] & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(87:2) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_if_block_15, create_if_block_16, create_if_block_17];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[11] === "input") return 0;
    		if (/*tag*/ ctx[11] === "textarea") return 1;
    		if (/*tag*/ ctx[11] === "select" && !/*multiple*/ ctx[5]) return 2;
    		if (/*tag*/ ctx[11] === "select" && /*multiple*/ ctx[5]) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { size = undefined } = $$props;
    	let { bsSize = undefined } = $$props;
    	let { color = undefined } = $$props;
    	let { checked = false } = $$props;
    	let { valid = false } = $$props;
    	let { invalid = false } = $$props;
    	let { plaintext = false } = $$props;
    	let { addon = false } = $$props;
    	let { value = "" } = $$props;
    	let { files = "" } = $$props;
    	let { readonly } = $$props;
    	let { multiple = false } = $$props;
    	let { id = "" } = $$props;
    	let { name = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { disabled = false } = $$props;

    	// eslint-disable-next-line no-unused-vars
    	const { type: _omitType, color: _omitColor, ...props } = clean($$props);

    	let classes;
    	let tag;

    	const handleInput = event => {
    		$$invalidate(1, value = event.target.value);
    	};

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, ['default']);

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_1(event) {
    		bubble($$self, event);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_2(event) {
    		bubble($$self, event);
    	}

    	function change_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_handler_2(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_3(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_3(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_3(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_3(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_3(event) {
    		bubble($$self, event);
    	}

    	function change_handler_3(event) {
    		bubble($$self, event);
    	}

    	function input_handler_3(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_4(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_4(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_4(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_4(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_4(event) {
    		bubble($$self, event);
    	}

    	function change_handler_4(event) {
    		bubble($$self, event);
    	}

    	function input_handler_4(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_5(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_5(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_5(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_5(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_5(event) {
    		bubble($$self, event);
    	}

    	function change_handler_5(event) {
    		bubble($$self, event);
    	}

    	function input_handler_5(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_6(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_6(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_6(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_6(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_6(event) {
    		bubble($$self, event);
    	}

    	function change_handler_6(event) {
    		bubble($$self, event);
    	}

    	function input_handler_6(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_7(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_7(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_7(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_7(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_7(event) {
    		bubble($$self, event);
    	}

    	function change_handler_7(event) {
    		bubble($$self, event);
    	}

    	function input_handler_7(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_8(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_8(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_8(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_8(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_8(event) {
    		bubble($$self, event);
    	}

    	function change_handler_8(event) {
    		bubble($$self, event);
    	}

    	function input_handler_8(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_9(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_9(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_9(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_9(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_9(event) {
    		bubble($$self, event);
    	}

    	function change_handler_9(event) {
    		bubble($$self, event);
    	}

    	function input_handler_9(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_10(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_10(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_10(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_10(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_10(event) {
    		bubble($$self, event);
    	}

    	function change_handler_10(event) {
    		bubble($$self, event);
    	}

    	function input_handler_10(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_11(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_11(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_11(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_11(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_11(event) {
    		bubble($$self, event);
    	}

    	function change_handler_11(event) {
    		bubble($$self, event);
    	}

    	function input_handler_11(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_12(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_12(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_12(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_12(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_12(event) {
    		bubble($$self, event);
    	}

    	function change_handler_12(event) {
    		bubble($$self, event);
    	}

    	function input_handler_12(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_13(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_13(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_13(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_13(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_13(event) {
    		bubble($$self, event);
    	}

    	function change_handler_13(event) {
    		bubble($$self, event);
    	}

    	function input_handler_13(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_14(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_14(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_14(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_14(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_14(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_15(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_15(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_15(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_15(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_15(event) {
    		bubble($$self, event);
    	}

    	function change_handler_14(event) {
    		bubble($$self, event);
    	}

    	function input_handler_14(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_16(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_16(event) {
    		bubble($$self, event);
    	}

    	function change_handler_15(event) {
    		bubble($$self, event);
    	}

    	function input_handler_15(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_17(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_17(event) {
    		bubble($$self, event);
    	}

    	function change_handler_16(event) {
    		bubble($$self, event);
    	}

    	function input_handler_16(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(2, files);
    	}

    	function input_change_handler_1() {
    		checked = this.checked;
    		value = this.value;
    		$$invalidate(0, checked);
    		$$invalidate(1, value);
    	}

    	function input_change_handler_2() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_3() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_4() {
    		value = to_number(this.value);
    		$$invalidate(1, value);
    	}

    	function input_input_handler_5() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_6() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_7() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_input_handler_8() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(1, value);
    	}

    	function input_input_handler_9() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(1, value);
    	}

    	function select_change_handler_1() {
    		value = select_multiple_value(this);
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(24, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(16, className = $$new_props.class);
    		if ("type" in $$new_props) $$invalidate(3, type = $$new_props.type);
    		if ("size" in $$new_props) $$invalidate(14, size = $$new_props.size);
    		if ("bsSize" in $$new_props) $$invalidate(15, bsSize = $$new_props.bsSize);
    		if ("color" in $$new_props) $$invalidate(17, color = $$new_props.color);
    		if ("checked" in $$new_props) $$invalidate(0, checked = $$new_props.checked);
    		if ("valid" in $$new_props) $$invalidate(18, valid = $$new_props.valid);
    		if ("invalid" in $$new_props) $$invalidate(19, invalid = $$new_props.invalid);
    		if ("plaintext" in $$new_props) $$invalidate(20, plaintext = $$new_props.plaintext);
    		if ("addon" in $$new_props) $$invalidate(21, addon = $$new_props.addon);
    		if ("value" in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ("files" in $$new_props) $$invalidate(2, files = $$new_props.files);
    		if ("readonly" in $$new_props) $$invalidate(4, readonly = $$new_props.readonly);
    		if ("multiple" in $$new_props) $$invalidate(5, multiple = $$new_props.multiple);
    		if ("id" in $$new_props) $$invalidate(6, id = $$new_props.id);
    		if ("name" in $$new_props) $$invalidate(7, name = $$new_props.name);
    		if ("placeholder" in $$new_props) $$invalidate(8, placeholder = $$new_props.placeholder);
    		if ("disabled" in $$new_props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("$$scope" in $$new_props) $$invalidate(25, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		type,
    		size,
    		bsSize,
    		color,
    		checked,
    		valid,
    		invalid,
    		plaintext,
    		addon,
    		value,
    		files,
    		readonly,
    		multiple,
    		id,
    		name,
    		placeholder,
    		disabled,
    		_omitType,
    		_omitColor,
    		props,
    		classes,
    		tag,
    		handleInput
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(24, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(16, className = $$new_props.className);
    		if ("type" in $$props) $$invalidate(3, type = $$new_props.type);
    		if ("size" in $$props) $$invalidate(14, size = $$new_props.size);
    		if ("bsSize" in $$props) $$invalidate(15, bsSize = $$new_props.bsSize);
    		if ("color" in $$props) $$invalidate(17, color = $$new_props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$new_props.checked);
    		if ("valid" in $$props) $$invalidate(18, valid = $$new_props.valid);
    		if ("invalid" in $$props) $$invalidate(19, invalid = $$new_props.invalid);
    		if ("plaintext" in $$props) $$invalidate(20, plaintext = $$new_props.plaintext);
    		if ("addon" in $$props) $$invalidate(21, addon = $$new_props.addon);
    		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
    		if ("files" in $$props) $$invalidate(2, files = $$new_props.files);
    		if ("readonly" in $$props) $$invalidate(4, readonly = $$new_props.readonly);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$new_props.multiple);
    		if ("id" in $$props) $$invalidate(6, id = $$new_props.id);
    		if ("name" in $$props) $$invalidate(7, name = $$new_props.name);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$new_props.placeholder);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("classes" in $$props) $$invalidate(10, classes = $$new_props.classes);
    		if ("tag" in $$props) $$invalidate(11, tag = $$new_props.tag);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*type, plaintext, addon, color, size, className, invalid, valid, bsSize*/ 4177928) {
    			 {
    				const checkInput = ["radio", "checkbox"].indexOf(type) > -1;
    				const isNotaNumber = new RegExp("\\D", "g");
    				const fileInput = type === "file";
    				const textareaInput = type === "textarea";
    				const rangeInput = type === "range";
    				const selectInput = type === "select";
    				const buttonInput = type === "button" || type === "reset" || type === "submit";
    				const unsupportedInput = type === "hidden" || type === "image";
    				$$invalidate(11, tag = selectInput || textareaInput ? type : "input");
    				let formControlClass = "form-control";

    				if (plaintext) {
    					formControlClass = `${formControlClass}-plaintext`;
    					$$invalidate(11, tag = "input");
    				} else if (fileInput) {
    					formControlClass = `${formControlClass}-file`;
    				} else if (checkInput) {
    					if (addon) {
    						formControlClass = null;
    					} else {
    						formControlClass = "form-check-input";
    					}
    				} else if (buttonInput) {
    					formControlClass = `btn btn-${color || "secondary"}`;
    				} else if (rangeInput) {
    					formControlClass = "form-control-range";
    				} else if (unsupportedInput) {
    					formControlClass = "";
    				}

    				if (size && isNotaNumber.test(size)) {
    					console.warn("Please use the prop \"bsSize\" instead of the \"size\" to bootstrap's input sizing.");
    					$$invalidate(15, bsSize = size);
    					$$invalidate(14, size = undefined);
    				}

    				$$invalidate(10, classes = clsx(className, invalid && "is-invalid", valid && "is-valid", bsSize ? `form-control-${bsSize}` : false, formControlClass));
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		checked,
    		value,
    		files,
    		type,
    		readonly,
    		multiple,
    		id,
    		name,
    		placeholder,
    		disabled,
    		classes,
    		tag,
    		props,
    		handleInput,
    		size,
    		bsSize,
    		className,
    		color,
    		valid,
    		invalid,
    		plaintext,
    		addon,
    		_omitType,
    		_omitColor,
    		$$props,
    		$$scope,
    		$$slots,
    		blur_handler,
    		focus_handler,
    		keydown_handler,
    		keypress_handler,
    		keyup_handler,
    		change_handler,
    		input_handler,
    		blur_handler_1,
    		focus_handler_1,
    		keydown_handler_1,
    		keypress_handler_1,
    		keyup_handler_1,
    		change_handler_1,
    		input_handler_1,
    		blur_handler_2,
    		focus_handler_2,
    		keydown_handler_2,
    		keypress_handler_2,
    		keyup_handler_2,
    		change_handler_2,
    		input_handler_2,
    		blur_handler_3,
    		focus_handler_3,
    		keydown_handler_3,
    		keypress_handler_3,
    		keyup_handler_3,
    		change_handler_3,
    		input_handler_3,
    		blur_handler_4,
    		focus_handler_4,
    		keydown_handler_4,
    		keypress_handler_4,
    		keyup_handler_4,
    		change_handler_4,
    		input_handler_4,
    		blur_handler_5,
    		focus_handler_5,
    		keydown_handler_5,
    		keypress_handler_5,
    		keyup_handler_5,
    		change_handler_5,
    		input_handler_5,
    		blur_handler_6,
    		focus_handler_6,
    		keydown_handler_6,
    		keypress_handler_6,
    		keyup_handler_6,
    		change_handler_6,
    		input_handler_6,
    		blur_handler_7,
    		focus_handler_7,
    		keydown_handler_7,
    		keypress_handler_7,
    		keyup_handler_7,
    		change_handler_7,
    		input_handler_7,
    		blur_handler_8,
    		focus_handler_8,
    		keydown_handler_8,
    		keypress_handler_8,
    		keyup_handler_8,
    		change_handler_8,
    		input_handler_8,
    		blur_handler_9,
    		focus_handler_9,
    		keydown_handler_9,
    		keypress_handler_9,
    		keyup_handler_9,
    		change_handler_9,
    		input_handler_9,
    		blur_handler_10,
    		focus_handler_10,
    		keydown_handler_10,
    		keypress_handler_10,
    		keyup_handler_10,
    		change_handler_10,
    		input_handler_10,
    		blur_handler_11,
    		focus_handler_11,
    		keydown_handler_11,
    		keypress_handler_11,
    		keyup_handler_11,
    		change_handler_11,
    		input_handler_11,
    		blur_handler_12,
    		focus_handler_12,
    		keydown_handler_12,
    		keypress_handler_12,
    		keyup_handler_12,
    		change_handler_12,
    		input_handler_12,
    		blur_handler_13,
    		focus_handler_13,
    		keydown_handler_13,
    		keypress_handler_13,
    		keyup_handler_13,
    		change_handler_13,
    		input_handler_13,
    		blur_handler_14,
    		focus_handler_14,
    		keydown_handler_14,
    		keypress_handler_14,
    		keyup_handler_14,
    		blur_handler_15,
    		focus_handler_15,
    		keydown_handler_15,
    		keypress_handler_15,
    		keyup_handler_15,
    		change_handler_14,
    		input_handler_14,
    		blur_handler_16,
    		focus_handler_16,
    		change_handler_15,
    		input_handler_15,
    		blur_handler_17,
    		focus_handler_17,
    		change_handler_16,
    		input_handler_16,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_change_handler,
    		input_change_handler_1,
    		input_change_handler_2,
    		input_input_handler_3,
    		input_input_handler_4,
    		input_input_handler_5,
    		input_input_handler_6,
    		input_input_handler_7,
    		input_input_handler_8,
    		input_change_input_handler,
    		input_input_handler_9,
    		textarea_input_handler,
    		select_change_handler,
    		select_change_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{
    				class: 16,
    				type: 3,
    				size: 14,
    				bsSize: 15,
    				color: 17,
    				checked: 0,
    				valid: 18,
    				invalid: 19,
    				plaintext: 20,
    				addon: 21,
    				value: 1,
    				files: 2,
    				readonly: 4,
    				multiple: 5,
    				id: 6,
    				name: 7,
    				placeholder: 8,
    				disabled: 9
    			},
    			[-1, -1, -1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*readonly*/ ctx[4] === undefined && !("readonly" in props)) {
    			console_1$1.warn("<Input> was created without expected prop 'readonly'");
    		}
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bsSize() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bsSize(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get plaintext() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plaintext(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addon() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addon(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Label.svelte generated by Svelte v3.20.1 */
    const file$7 = "node_modules\\sveltestrap\\src\\Label.svelte";

    function create_fragment$8(ctx) {
    	let label;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	let label_levels = [
    		/*props*/ ctx[3],
    		{ id: /*id*/ ctx[1] },
    		{ class: /*classes*/ ctx[2] },
    		{ for: /*fore*/ ctx[0] }
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			add_location(label, file$7, 73, 0, 1685);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[17], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, null));
    				}
    			}

    			set_attributes(label, get_spread_update(label_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*id*/ 2 && { id: /*id*/ ctx[1] },
    				dirty & /*classes*/ 4 && { class: /*classes*/ ctx[2] },
    				dirty & /*fore*/ 1 && { for: /*fore*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	const props = clean($$props);
    	let { hidden = false } = $$props;
    	let { check = false } = $$props;
    	let { size = "" } = $$props;
    	let { for: fore } = $$props;
    	let { id = "" } = $$props;
    	let { xs = "" } = $$props;
    	let { sm = "" } = $$props;
    	let { md = "" } = $$props;
    	let { lg = "" } = $$props;
    	let { xl = "" } = $$props;
    	const colWidths = { xs, sm, md, lg, xl };
    	let { widths = Object.keys(colWidths) } = $$props;
    	const colClasses = [];

    	widths.forEach(colWidth => {
    		let columnProp = $$props[colWidth];

    		if (!columnProp && columnProp !== "") {
    			return;
    		}

    		const isXs = colWidth === "xs";
    		let colClass;

    		if (isObject(columnProp)) {
    			const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
    			colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);

    			colClasses.push(clsx({
    				[colClass]: columnProp.size || columnProp.size === "",
    				[`order${colSizeInterfix}${columnProp.order}`]: columnProp.order || columnProp.order === 0,
    				[`offset${colSizeInterfix}${columnProp.offset}`]: columnProp.offset || columnProp.offset === 0
    			}));
    		} else {
    			colClass = getColumnSizeClass(isXs, colWidth, columnProp);
    			colClasses.push(colClass);
    		}
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Label", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("hidden" in $$new_props) $$invalidate(5, hidden = $$new_props.hidden);
    		if ("check" in $$new_props) $$invalidate(6, check = $$new_props.check);
    		if ("size" in $$new_props) $$invalidate(7, size = $$new_props.size);
    		if ("for" in $$new_props) $$invalidate(0, fore = $$new_props.for);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("xs" in $$new_props) $$invalidate(8, xs = $$new_props.xs);
    		if ("sm" in $$new_props) $$invalidate(9, sm = $$new_props.sm);
    		if ("md" in $$new_props) $$invalidate(10, md = $$new_props.md);
    		if ("lg" in $$new_props) $$invalidate(11, lg = $$new_props.lg);
    		if ("xl" in $$new_props) $$invalidate(12, xl = $$new_props.xl);
    		if ("widths" in $$new_props) $$invalidate(13, widths = $$new_props.widths);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		getColumnSizeClass,
    		isObject,
    		className,
    		props,
    		hidden,
    		check,
    		size,
    		fore,
    		id,
    		xs,
    		sm,
    		md,
    		lg,
    		xl,
    		colWidths,
    		widths,
    		colClasses,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("hidden" in $$props) $$invalidate(5, hidden = $$new_props.hidden);
    		if ("check" in $$props) $$invalidate(6, check = $$new_props.check);
    		if ("size" in $$props) $$invalidate(7, size = $$new_props.size);
    		if ("fore" in $$props) $$invalidate(0, fore = $$new_props.fore);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("xs" in $$props) $$invalidate(8, xs = $$new_props.xs);
    		if ("sm" in $$props) $$invalidate(9, sm = $$new_props.sm);
    		if ("md" in $$props) $$invalidate(10, md = $$new_props.md);
    		if ("lg" in $$props) $$invalidate(11, lg = $$new_props.lg);
    		if ("xl" in $$props) $$invalidate(12, xl = $$new_props.xl);
    		if ("widths" in $$props) $$invalidate(13, widths = $$new_props.widths);
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, hidden, check, size*/ 240) {
    			 $$invalidate(2, classes = clsx(className, hidden ? "sr-only" : false, check ? "form-check-label" : false, size ? `col-form-label-${size}` : false, colClasses, colClasses.length ? "col-form-label" : false));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		fore,
    		id,
    		classes,
    		props,
    		className,
    		hidden,
    		check,
    		size,
    		xs,
    		sm,
    		md,
    		lg,
    		xl,
    		widths,
    		colWidths,
    		colClasses,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 4,
    			hidden: 5,
    			check: 6,
    			size: 7,
    			for: 0,
    			id: 1,
    			xs: 8,
    			sm: 9,
    			md: 10,
    			lg: 11,
    			xl: 12,
    			widths: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fore*/ ctx[0] === undefined && !("for" in props)) {
    			console.warn("<Label> was created without expected prop 'for'");
    		}
    	}

    	get class() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get check() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set check(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get for() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set for(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widths() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widths(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\Pagination.svelte generated by Svelte v3.20.1 */
    const file$8 = "node_modules\\sveltestrap\\src\\Pagination.svelte";

    function create_fragment$9(ctx) {
    	let nav;
    	let ul;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	let nav_levels = [
    		/*props*/ ctx[3],
    		{ class: /*classes*/ ctx[1] },
    		{ "aria-label": /*ariaLabel*/ ctx[0] }
    	];

    	let nav_data = {};

    	for (let i = 0; i < nav_levels.length; i += 1) {
    		nav_data = assign(nav_data, nav_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "class", /*listClasses*/ ctx[2]);
    			add_location(ul, file$8, 20, 2, 455);
    			set_attributes(nav, nav_data);
    			add_location(nav, file$8, 19, 0, 397);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[8], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null));
    				}
    			}

    			if (!current || dirty & /*listClasses*/ 4) {
    				attr_dev(ul, "class", /*listClasses*/ ctx[2]);
    			}

    			set_attributes(nav, get_spread_update(nav_levels, [
    				dirty & /*props*/ 8 && /*props*/ ctx[3],
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] },
    				dirty & /*ariaLabel*/ 1 && { "aria-label": /*ariaLabel*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { listClassName = "" } = $$props;
    	let { size = "" } = $$props;
    	let { ariaLabel = "pagination" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pagination", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ("listClassName" in $$new_props) $$invalidate(5, listClassName = $$new_props.listClassName);
    		if ("size" in $$new_props) $$invalidate(6, size = $$new_props.size);
    		if ("ariaLabel" in $$new_props) $$invalidate(0, ariaLabel = $$new_props.ariaLabel);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		listClassName,
    		size,
    		ariaLabel,
    		props,
    		classes,
    		listClasses
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(4, className = $$new_props.className);
    		if ("listClassName" in $$props) $$invalidate(5, listClassName = $$new_props.listClassName);
    		if ("size" in $$props) $$invalidate(6, size = $$new_props.size);
    		if ("ariaLabel" in $$props) $$invalidate(0, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("listClasses" in $$props) $$invalidate(2, listClasses = $$new_props.listClasses);
    	};

    	let classes;
    	let listClasses;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 16) {
    			 $$invalidate(1, classes = clsx(className));
    		}

    		if ($$self.$$.dirty & /*listClassName, size*/ 96) {
    			 $$invalidate(2, listClasses = clsx(listClassName, "pagination", { [`pagination-${size}`]: !!size }));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		ariaLabel,
    		classes,
    		listClasses,
    		props,
    		className,
    		listClassName,
    		size,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Pagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 4,
    			listClassName: 5,
    			size: 6,
    			ariaLabel: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listClassName() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listClassName(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabel() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabel(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\PaginationItem.svelte generated by Svelte v3.20.1 */
    const file$9 = "node_modules\\sveltestrap\\src\\PaginationItem.svelte";

    function create_fragment$a(ctx) {
    	let li;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let li_levels = [/*props*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			set_attributes(li, li_data);
    			add_location(li, file$9, 17, 0, 309);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}

    			set_attributes(li, get_spread_update(li_levels, [
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*classes*/ 1 && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { disabled = false } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PaginationItem", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(3, active = $$new_props.active);
    		if ("disabled" in $$new_props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		active,
    		disabled,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(3, active = $$new_props.active);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ("classes" in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, active, disabled*/ 28) {
    			 $$invalidate(0, classes = clsx(className, "page-item", { active, disabled }));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [classes, props, className, active, disabled, $$props, $$scope, $$slots];
    }

    class PaginationItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { class: 2, active: 3, disabled: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaginationItem",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<PaginationItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<PaginationItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<PaginationItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<PaginationItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<PaginationItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<PaginationItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\sveltestrap\src\PaginationLink.svelte generated by Svelte v3.20.1 */
    const file$a = "node_modules\\sveltestrap\\src\\PaginationLink.svelte";

    // (50:2) {:else}
    function create_else_block$5(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[13], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(50:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:2) {#if previous || next || first || last}
    function create_if_block$5(ctx) {
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t0 = space();
    			span1 = element("span");
    			t1 = text(/*realLabel*/ ctx[7]);
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file$a, 45, 4, 995);
    			attr_dev(span1, "class", "sr-only");
    			add_location(span1, file$a, 48, 4, 1073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(span0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[13], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null));
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*defaultCaret*/ 32) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*realLabel*/ 128) set_data_dev(t1, /*realLabel*/ ctx[7]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(45:2) {#if previous || next || first || last}",
    		ctx
    	});

    	return block;
    }

    // (47:12)  
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*defaultCaret*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*defaultCaret*/ 32) set_data_dev(t, /*defaultCaret*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(47:12)  ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$5, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*previous*/ ctx[1] || /*next*/ ctx[0] || /*first*/ ctx[2] || /*last*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let a_levels = [/*props*/ ctx[8], { class: /*classes*/ ctx[6] }, { href: /*href*/ ctx[4] }];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file$a, 43, 0, 902);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[15], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*props*/ 256 && /*props*/ ctx[8],
    				dirty & /*classes*/ 64 && { class: /*classes*/ ctx[6] },
    				dirty & /*href*/ 16 && { href: /*href*/ ctx[4] }
    			]));
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
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { next = false } = $$props;
    	let { previous = false } = $$props;
    	let { first = false } = $$props;
    	let { last = false } = $$props;
    	let { ariaLabel = "" } = $$props;
    	let { href = "" } = $$props;
    	const props = clean($$props);
    	let defaultAriaLabel;
    	let defaultCaret;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PaginationLink", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(9, className = $$new_props.class);
    		if ("next" in $$new_props) $$invalidate(0, next = $$new_props.next);
    		if ("previous" in $$new_props) $$invalidate(1, previous = $$new_props.previous);
    		if ("first" in $$new_props) $$invalidate(2, first = $$new_props.first);
    		if ("last" in $$new_props) $$invalidate(3, last = $$new_props.last);
    		if ("ariaLabel" in $$new_props) $$invalidate(10, ariaLabel = $$new_props.ariaLabel);
    		if ("href" in $$new_props) $$invalidate(4, href = $$new_props.href);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		next,
    		previous,
    		first,
    		last,
    		ariaLabel,
    		href,
    		props,
    		defaultAriaLabel,
    		defaultCaret,
    		classes,
    		realLabel
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(9, className = $$new_props.className);
    		if ("next" in $$props) $$invalidate(0, next = $$new_props.next);
    		if ("previous" in $$props) $$invalidate(1, previous = $$new_props.previous);
    		if ("first" in $$props) $$invalidate(2, first = $$new_props.first);
    		if ("last" in $$props) $$invalidate(3, last = $$new_props.last);
    		if ("ariaLabel" in $$props) $$invalidate(10, ariaLabel = $$new_props.ariaLabel);
    		if ("href" in $$props) $$invalidate(4, href = $$new_props.href);
    		if ("defaultAriaLabel" in $$props) $$invalidate(11, defaultAriaLabel = $$new_props.defaultAriaLabel);
    		if ("defaultCaret" in $$props) $$invalidate(5, defaultCaret = $$new_props.defaultCaret);
    		if ("classes" in $$props) $$invalidate(6, classes = $$new_props.classes);
    		if ("realLabel" in $$props) $$invalidate(7, realLabel = $$new_props.realLabel);
    	};

    	let classes;
    	let realLabel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 512) {
    			 $$invalidate(6, classes = clsx(className, "page-link"));
    		}

    		if ($$self.$$.dirty & /*previous, next, first, last*/ 15) {
    			 if (previous) {
    				$$invalidate(11, defaultAriaLabel = "Previous");
    			} else if (next) {
    				$$invalidate(11, defaultAriaLabel = "Next");
    			} else if (first) {
    				$$invalidate(11, defaultAriaLabel = "First");
    			} else if (last) {
    				$$invalidate(11, defaultAriaLabel = "Last");
    			}
    		}

    		if ($$self.$$.dirty & /*ariaLabel, defaultAriaLabel*/ 3072) {
    			 $$invalidate(7, realLabel = ariaLabel || defaultAriaLabel);
    		}

    		if ($$self.$$.dirty & /*previous, next, first, last*/ 15) {
    			 if (previous) {
    				$$invalidate(5, defaultCaret = "‹");
    			} else if (next) {
    				$$invalidate(5, defaultCaret = "›");
    			} else if (first) {
    				$$invalidate(5, defaultCaret = "«");
    			} else if (last) {
    				$$invalidate(5, defaultCaret = "»");
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		next,
    		previous,
    		first,
    		last,
    		href,
    		defaultCaret,
    		classes,
    		realLabel,
    		props,
    		className,
    		ariaLabel,
    		defaultAriaLabel,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class PaginationLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 9,
    			next: 0,
    			previous: 1,
    			first: 2,
    			last: 3,
    			ariaLabel: 10,
    			href: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaginationLink",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previous() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set previous(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get first() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabel() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabel(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<PaginationLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<PaginationLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\happiness_rateAPI\CountriesTable.svelte generated by Svelte v3.20.1 */

    const { console: console_1$2 } = globals;
    const file$b = "src\\front\\happiness_rateAPI\\CountriesTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import {          onMount   }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount   }",
    		ctx
    	});

    	return block;
    }

    // (179:1) {:then countries}
    function create_then_block(ctx) {
    	let h3;
    	let t1;
    	let t2;
    	let current;

    	const table0 = new Table({
    			props: {
    				style: "background-color:#EAEEF0;",
    				$$slots: { default: [create_default_slot_21] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table1 = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_18] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Añadir nuevo país:";
    			t1 = space();
    			create_component(table0.$$.fragment);
    			t2 = space();
    			create_component(table1.$$.fragment);
    			add_location(h3, file$b, 180, 2, 4819);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(table0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(table1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table0_changes = {};

    			if (dirty[0] & /*newCountry*/ 1 | dirty[1] & /*$$scope*/ 2) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);
    			const table1_changes = {};

    			if (dirty[0] & /*countries*/ 32 | dirty[1] & /*$$scope*/ 2) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table0.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table0.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(table0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(table1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(179:1) {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (189:33) <Button color="primary" on:click={insertCountry}>
    function create_default_slot_22(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Añadir");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(189:33) <Button color=\\\"primary\\\" on:click={insertCountry}>",
    		ctx
    	});

    	return block;
    }

    // (182:2) <Table style="background-color:#EAEEF0;">
    function create_default_slot_21(ctx) {
    	let tr;
    	let td0;
    	let strong0;
    	let t1;
    	let input0;
    	let t2;
    	let td1;
    	let strong1;
    	let t4;
    	let input1;
    	let input1_updating = false;
    	let t5;
    	let td2;
    	let strong2;
    	let t7;
    	let input2;
    	let input2_updating = false;
    	let t8;
    	let td3;
    	let strong3;
    	let t10;
    	let input3;
    	let input3_updating = false;
    	let t11;
    	let td4;
    	let strong4;
    	let t13;
    	let input4;
    	let input4_updating = false;
    	let t14;
    	let td5;
    	let strong5;
    	let t16;
    	let current;
    	let dispose;

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[19].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[20].call(input2);
    	}

    	function input3_input_handler() {
    		input3_updating = true;
    		/*input3_input_handler*/ ctx[21].call(input3);
    	}

    	function input4_input_handler() {
    		input4_updating = true;
    		/*input4_input_handler*/ ctx[22].call(input4);
    	}

    	const button = new Button({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_22] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertCountry*/ ctx[8]);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			strong0 = element("strong");
    			strong0.textContent = "País:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			td1 = element("td");
    			strong1 = element("strong");
    			strong1.textContent = "Año:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			td2 = element("td");
    			strong2 = element("strong");
    			strong2.textContent = "Ranking de Felicidad:";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			td3 = element("td");
    			strong3 = element("strong");
    			strong3.textContent = "Tasa de Felicidad:";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			td4 = element("td");
    			strong4 = element("strong");
    			strong4.textContent = "Variación:";
    			t13 = space();
    			input4 = element("input");
    			t14 = space();
    			td5 = element("td");
    			strong5 = element("strong");
    			strong5.textContent = "Acción:";
    			t16 = space();
    			create_component(button.$$.fragment);
    			add_location(strong0, file$b, 183, 8, 4910);
    			add_location(input0, file$b, 183, 31, 4933);
    			add_location(td0, file$b, 183, 4, 4906);
    			add_location(strong1, file$b, 184, 8, 4989);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$b, 184, 30, 5011);
    			add_location(td1, file$b, 184, 4, 4985);
    			add_location(strong2, file$b, 185, 8, 5080);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file$b, 185, 47, 5119);
    			add_location(td2, file$b, 185, 4, 5076);
    			add_location(strong3, file$b, 186, 8, 5200);
    			attr_dev(input3, "type", "number");
    			add_location(input3, file$b, 186, 44, 5236);
    			add_location(td3, file$b, 186, 4, 5196);
    			add_location(strong4, file$b, 187, 8, 5314);
    			attr_dev(input4, "type", "number");
    			add_location(input4, file$b, 187, 36, 5342);
    			add_location(td4, file$b, 187, 4, 5310);
    			add_location(strong5, file$b, 188, 8, 5410);
    			add_location(td5, file$b, 188, 4, 5406);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$b, 182, 3, 4896);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, strong0);
    			append_dev(td0, t1);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newCountry*/ ctx[0].country);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, strong1);
    			append_dev(td1, t4);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newCountry*/ ctx[0].year);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			append_dev(td2, strong2);
    			append_dev(td2, t7);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newCountry*/ ctx[0].happinessRanking);
    			append_dev(tr, t8);
    			append_dev(tr, td3);
    			append_dev(td3, strong3);
    			append_dev(td3, t10);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newCountry*/ ctx[0].happinessRate);
    			append_dev(tr, t11);
    			append_dev(tr, td4);
    			append_dev(td4, strong4);
    			append_dev(td4, t13);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newCountry*/ ctx[0].var);
    			append_dev(tr, t14);
    			append_dev(tr, td5);
    			append_dev(td5, strong5);
    			append_dev(td5, t16);
    			mount_component(button, td5, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[18]),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler),
    				listen_dev(input3, "input", input3_input_handler),
    				listen_dev(input4, "input", input4_input_handler)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*newCountry*/ 1 && input0.value !== /*newCountry*/ ctx[0].country) {
    				set_input_value(input0, /*newCountry*/ ctx[0].country);
    			}

    			if (!input1_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input1, /*newCountry*/ ctx[0].year);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input2, /*newCountry*/ ctx[0].happinessRanking);
    			}

    			input2_updating = false;

    			if (!input3_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input3, /*newCountry*/ ctx[0].happinessRate);
    			}

    			input3_updating = false;

    			if (!input4_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input4, /*newCountry*/ ctx[0].var);
    			}

    			input4_updating = false;
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(182:2) <Table style=\\\"background-color:#EAEEF0;\\\">",
    		ctx
    	});

    	return block;
    }

    // (214:28) <Button outline color="danger" on:click="{deleteCountry(c.country,c.year)}">
    function create_default_slot_20(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Eliminar");
    			attr_dev(i, "class", "fa fa-trash");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$b, 213, 104, 6340);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(214:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteCountry(c.country,c.year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (215:6) <Button outline color="success" href="#/happiness_rate/{c.country}/{c.year}">
    function create_default_slot_19(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Modificar");
    			attr_dev(i, "class", "fa fa-trash");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$b, 214, 83, 6489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(215:6) <Button outline color=\\\"success\\\" href=\\\"#/happiness_rate/{c.country}/{c.year}\\\">",
    		ctx
    	});

    	return block;
    }

    // (205:16) {#each countries as c}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*c*/ ctx[29].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*c*/ ctx[29].year + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*c*/ ctx[29].happinessRanking + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*c*/ ctx[29].happinessRate + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*c*/ ctx[29].var + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;
    	let t11;
    	let current;

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_20] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*deleteCountry*/ ctx[9](/*c*/ ctx[29].country, /*c*/ ctx[29].year))) /*deleteCountry*/ ctx[9](/*c*/ ctx[29].country, /*c*/ ctx[29].year).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				href: "#/happiness_rate/" + /*c*/ ctx[29].country + "/" + /*c*/ ctx[29].year,
    				$$slots: { default: [create_default_slot_19] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			create_component(button0.$$.fragment);
    			t10 = space();
    			create_component(button1.$$.fragment);
    			t11 = space();
    			attr_dev(a, "href", a_href_value = "#/happiness_rate/" + /*c*/ ctx[29].country + "/" + /*c*/ ctx[29].year);
    			add_location(a, file$b, 207, 25, 5984);
    			add_location(td0, file$b, 206, 6, 5953);
    			add_location(td1, file$b, 209, 24, 6086);
    			add_location(td2, file$b, 210, 24, 6129);
    			add_location(td3, file$b, 211, 6, 6166);
    			add_location(td4, file$b, 212, 24, 6218);
    			add_location(td5, file$b, 213, 24, 6260);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$b, 205, 20, 5941);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			mount_component(button0, td5, null);
    			append_dev(td5, t10);
    			mount_component(button1, td5, null);
    			append_dev(tr, t11);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*countries*/ 32) && t0_value !== (t0_value = /*c*/ ctx[29].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*countries*/ 32 && a_href_value !== (a_href_value = "#/happiness_rate/" + /*c*/ ctx[29].country + "/" + /*c*/ ctx[29].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty[0] & /*countries*/ 32) && t2_value !== (t2_value = /*c*/ ctx[29].year + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*countries*/ 32) && t4_value !== (t4_value = /*c*/ ctx[29].happinessRanking + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*countries*/ 32) && t6_value !== (t6_value = /*c*/ ctx[29].happinessRate + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*countries*/ 32) && t8_value !== (t8_value = /*c*/ ctx[29].var + "")) set_data_dev(t8, t8_value);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty[0] & /*countries*/ 32) button1_changes.href = "#/happiness_rate/" + /*c*/ ctx[29].country + "/" + /*c*/ ctx[29].year;

    			if (dirty[1] & /*$$scope*/ 2) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(205:16) {#each countries as c}",
    		ctx
    	});

    	return block;
    }

    // (193:2) <Table bordered>
    function create_default_slot_18(ctx) {
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let current;
    	let each_value = /*countries*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "País";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Ranking de Felicidad";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Tasa de Felicidad";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Variación";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Acciones";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$b, 195, 20, 5639);
    			add_location(th1, file$b, 196, 17, 5671);
    			add_location(th2, file$b, 197, 17, 5702);
    			add_location(th3, file$b, 198, 5, 5738);
    			add_location(th4, file$b, 199, 5, 5771);
    			add_location(th5, file$b, 200, 5, 5796);
    			set_style(tr, "color", "#00680D");
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$b, 194, 16, 5591);
    			add_location(thead, file$b, 193, 12, 5565);
    			add_location(tbody, file$b, 203, 12, 5872);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*countries, deleteCountry*/ 544) {
    				each_value = /*countries*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(193:2) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (177:22)           Loading datas...   {:then countries}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading datas...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(177:22)           Loading datas...   {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (225:2) <PaginationItem class="{currentPage === 1 ? 'disabled' : ''}">
    function create_default_slot_17(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: { previous: true, href: "#/happiness_rate" },
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler*/ ctx[23]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(225:2) <PaginationItem class=\\\"{currentPage === 1 ? 'disabled' : ''}\\\">",
    		ctx
    	});

    	return block;
    }

    // (230:2) {#if currentPage != 1}
    function create_if_block_2$2(ctx) {
    	let current;

    	const paginationitem = new PaginationItem({
    			props: {
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 2) {
    				paginationitem_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem.$set(paginationitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(230:2) {#if currentPage != 1}",
    		ctx
    	});

    	return block;
    }

    // (232:3) <PaginationLink href="#/happiness_rate" on:click="{() => incrementOffset(-1)}" >
    function create_default_slot_16(ctx) {
    	let t_value = /*currentPage*/ ctx[1] - 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 2 && t_value !== (t_value = /*currentPage*/ ctx[1] - 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(232:3) <PaginationLink href=\\\"#/happiness_rate\\\" on:click=\\\"{() => incrementOffset(-1)}\\\" >",
    		ctx
    	});

    	return block;
    }

    // (231:2) <PaginationItem>
    function create_default_slot_15(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/happiness_rate",
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_1*/ ctx[24]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 2) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(231:2) <PaginationItem>",
    		ctx
    	});

    	return block;
    }

    // (236:3) <PaginationLink href="#/happiness_rate" >
    function create_default_slot_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*currentPage*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 2) set_data_dev(t, /*currentPage*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(236:3) <PaginationLink href=\\\"#/happiness_rate\\\" >",
    		ctx
    	});

    	return block;
    }

    // (235:2) <PaginationItem active>
    function create_default_slot_13(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/happiness_rate",
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 2) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(235:2) <PaginationItem active>",
    		ctx
    	});

    	return block;
    }

    // (240:2) {#if moreData}
    function create_if_block_1$2(ctx) {
    	let current;

    	const paginationitem = new PaginationItem({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 2) {
    				paginationitem_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem.$set(paginationitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(240:2) {#if moreData}",
    		ctx
    	});

    	return block;
    }

    // (242:3) <PaginationLink href="#/happiness_rate" on:click="{() => incrementOffset(1)}">
    function create_default_slot_12(ctx) {
    	let t_value = /*currentPage*/ ctx[1] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 2 && t_value !== (t_value = /*currentPage*/ ctx[1] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(242:3) <PaginationLink href=\\\"#/happiness_rate\\\" on:click=\\\"{() => incrementOffset(1)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (241:2) <PaginationItem >
    function create_default_slot_11(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/happiness_rate",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_2*/ ctx[25]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 2) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(241:2) <PaginationItem >",
    		ctx
    	});

    	return block;
    }

    // (246:2) <PaginationItem class="{moreData ? '' : 'disabled'}">
    function create_default_slot_10(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: { next: true, href: "#/happiness_rate" },
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_3*/ ctx[26]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(246:2) <PaginationItem class=\\\"{moreData ? '' : 'disabled'}\\\">",
    		ctx
    	});

    	return block;
    }

    // (222:1) <Pagination  style="float:center;" ariaLabel="Cambiar de página">
    function create_default_slot_9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const paginationitem0 = new PaginationItem({
    			props: {
    				class: /*currentPage*/ ctx[1] === 1 ? "disabled" : "",
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*currentPage*/ ctx[1] != 1 && create_if_block_2$2(ctx);

    	const paginationitem1 = new PaginationItem({
    			props: {
    				active: true,
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*moreData*/ ctx[2] && create_if_block_1$2(ctx);

    	const paginationitem2 = new PaginationItem({
    			props: {
    				class: /*moreData*/ ctx[2] ? "" : "disabled",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(paginationitem1.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			create_component(paginationitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(paginationitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(paginationitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem0_changes = {};
    			if (dirty[0] & /*currentPage*/ 2) paginationitem0_changes.class = /*currentPage*/ ctx[1] === 1 ? "disabled" : "";

    			if (dirty[1] & /*$$scope*/ 2) {
    				paginationitem0_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem0.$set(paginationitem0_changes);

    			if (/*currentPage*/ ctx[1] != 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const paginationitem1_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 2) {
    				paginationitem1_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem1.$set(paginationitem1_changes);

    			if (/*moreData*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const paginationitem2_changes = {};
    			if (dirty[0] & /*moreData*/ 4) paginationitem2_changes.class = /*moreData*/ ctx[2] ? "" : "disabled";

    			if (dirty[1] & /*$$scope*/ 2) {
    				paginationitem2_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem2.$set(paginationitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(paginationitem1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(paginationitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(paginationitem1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(paginationitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem0, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(paginationitem1, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(paginationitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(222:1) <Pagination  style=\\\"float:center;\\\" ariaLabel=\\\"Cambiar de página\\\">",
    		ctx
    	});

    	return block;
    }

    // (251:1) {#if exitoMsg}
    function create_if_block$6(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*exitoMsg*/ ctx[6]}. Dato insertado con éxito`;
    			set_style(p, "color", "green");
    			add_location(p, file$b, 251, 8, 7720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(251:1) {#if exitoMsg}",
    		ctx
    	});

    	return block;
    }

    // (256:2) <Button outline  color="primary" on:click={loadInitialData}>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Iniciar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(256:2) <Button outline  color=\\\"primary\\\" on:click={loadInitialData}>",
    		ctx
    	});

    	return block;
    }

    // (257:2) <Button outline  color="danger" on:click={deleteAllCountries}>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Eliminar todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(257:2) <Button outline  color=\\\"danger\\\" on:click={deleteAllCountries}>",
    		ctx
    	});

    	return block;
    }

    // (264:20) <FormGroup style="width:50%;">
    function create_default_slot_5(ctx) {
    	let label;
    	let t1;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[27].call(null, value);
    	}

    	let input_props = {
    		type: "text",
    		name: "selectCountry",
    		id: "selectCountry"
    	};

    	if (/*actualCountry*/ ctx[3] !== void 0) {
    		input_props.value = /*actualCountry*/ ctx[3];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Selecciona el País:";
    			t1 = space();
    			create_component(input.$$.fragment);
    			add_location(label, file$b, 264, 20, 8180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*actualCountry*/ 8) {
    				updating_value = true;
    				input_changes.value = /*actualCountry*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(264:20) <FormGroup style=\\\"width:50%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (272:20) <FormGroup style="width:50%;">
    function create_default_slot_3(ctx) {
    	let label;
    	let t1;
    	let updating_value;
    	let current;

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[28].call(null, value);
    	}

    	let input_props = {
    		type: "number",
    		name: "selectYear",
    		id: "selectYear"
    	};

    	if (/*actualYear*/ ctx[4] !== void 0) {
    		input_props.value = /*actualYear*/ ctx[4];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_1));

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Búsqueda por año:";
    			t1 = space();
    			create_component(input.$$.fragment);
    			add_location(label, file$b, 272, 24, 8515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*actualYear*/ 16) {
    				updating_value = true;
    				input_changes.value = /*actualYear*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(272:20) <FormGroup style=\\\"width:50%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (281:24) <Button outline  color="primary" on:click="{search(actualCountry,actualYear)}" class="button-search" >
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(281:24) <Button outline  color=\\\"primary\\\" on:click=\\\"{search(actualCountry,actualYear)}\\\" class=\\\"button-search\\\" >",
    		ctx
    	});

    	return block;
    }

    // (282:24) <Button outline  color="secondary" href="javascript:location.reload()">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(282:24) <Button outline  color=\\\"secondary\\\" href=\\\"javascript:location.reload()\\\">",
    		ctx
    	});

    	return block;
    }

    // (260:1) <Table bordered>
    function create_default_slot$1(ctx) {
    	let tbody;
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1;
    	let td2;
    	let div;
    	let t2;
    	let current;

    	const formgroup0 = new FormGroup({
    			props: {
    				style: "width:50%;",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const formgroup1 = new FormGroup({
    			props: {
    				style: "width:50%;",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				class: "button-search",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*search*/ ctx[12](/*actualCountry*/ ctx[3], /*actualYear*/ ctx[4]))) /*search*/ ctx[12](/*actualCountry*/ ctx[3], /*actualYear*/ ctx[4]).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				href: "javascript:location.reload()",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			tr = element("tr");
    			td0 = element("td");
    			create_component(formgroup0.$$.fragment);
    			t0 = space();
    			td1 = element("td");
    			create_component(formgroup1.$$.fragment);
    			t1 = space();
    			td2 = element("td");
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			add_location(td0, file$b, 262, 16, 8101);
    			add_location(td1, file$b, 270, 16, 8433);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			set_style(div, "margin-top", "6%");
    			add_location(div, file$b, 279, 20, 8795);
    			add_location(td2, file$b, 278, 16, 8769);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$b, 261, 12, 8079);
    			add_location(tbody, file$b, 260, 8, 8058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr);
    			append_dev(tr, td0);
    			mount_component(formgroup0, td0, null);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			mount_component(formgroup1, td1, null);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, div);
    			mount_component(button0, div, null);
    			append_dev(div, t2);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const formgroup0_changes = {};

    			if (dirty[0] & /*actualCountry*/ 8 | dirty[1] & /*$$scope*/ 2) {
    				formgroup0_changes.$$scope = { dirty, ctx };
    			}

    			formgroup0.$set(formgroup0_changes);
    			const formgroup1_changes = {};

    			if (dirty[0] & /*actualYear*/ 16 | dirty[1] & /*$$scope*/ 2) {
    				formgroup1_changes.$$scope = { dirty, ctx };
    			}

    			formgroup1.$set(formgroup1_changes);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formgroup0.$$.fragment, local);
    			transition_in(formgroup1.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formgroup0.$$.fragment, local);
    			transition_out(formgroup1.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			destroy_component(formgroup0);
    			destroy_component(formgroup1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(260:1) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let body0;
    	let t0;
    	let main;
    	let h2;
    	let t2;
    	let body1;
    	let t3;
    	let promise;
    	let t4;
    	let t5;
    	let t6;
    	let div;
    	let t7;
    	let t8;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*countries*/ ctx[5], info);

    	const pagination = new Pagination({
    			props: {
    				style: "float:center;",
    				ariaLabel: "Cambiar de página",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*exitoMsg*/ ctx[6] && create_if_block$6(ctx);

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*loadInitialData*/ ctx[11]);

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteAllCountries*/ ctx[10]);

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body0 = element("body");
    			t0 = space();
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Tasa de Felicidad";
    			t2 = space();
    			body1 = element("body");
    			t3 = space();
    			info.block.c();
    			t4 = space();
    			create_component(pagination.$$.fragment);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t7 = space();
    			create_component(button1.$$.fragment);
    			t8 = space();
    			create_component(table.$$.fragment);
    			set_style(body0, "background-color", "#082EFF");
    			add_location(body0, file$b, 169, 0, 4582);
    			attr_dev(h2, "align", "center");
    			add_location(h2, file$b, 173, 1, 4645);
    			set_style(body1, "background-color", "#082EFF");
    			add_location(body1, file$b, 174, 1, 4690);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			add_location(div, file$b, 254, 1, 7799);
    			add_location(main, file$b, 172, 0, 4636);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t2);
    			append_dev(main, body1);
    			append_dev(main, t3);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t4;
    			append_dev(main, t4);
    			mount_component(pagination, main, null);
    			append_dev(main, t5);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t6);
    			append_dev(main, div);
    			mount_component(button0, div, null);
    			append_dev(div, t7);
    			mount_component(button1, div, null);
    			append_dev(main, t8);
    			mount_component(table, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*countries*/ 32 && promise !== (promise = /*countries*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const pagination_changes = {};

    			if (dirty[0] & /*moreData, currentPage*/ 6 | dirty[1] & /*$$scope*/ 2) {
    				pagination_changes.$$scope = { dirty, ctx };
    			}

    			pagination.$set(pagination_changes);
    			if (/*exitoMsg*/ ctx[6]) if_block.p(ctx, dirty);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const table_changes = {};

    			if (dirty[0] & /*actualCountry, actualYear*/ 24 | dirty[1] & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(pagination.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(pagination.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(pagination);
    			if (if_block) if_block.d();
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let countries = [];

    	let newCountry = {
    		country: "",
    		year: "",
    		happinessRanking: "",
    		happinessRate: "",
    		var: ""
    	};

    	let exitoMsg = "";

    	// Para la paginacion
    	let recursos = 10;

    	let offset = 0;
    	let currentPage = 1;
    	let moreData = true;

    	// Para las Busquedas
    	let actualCountry = "";

    	let actualYear = "";
    	let country = [];
    	let year = [];
    	onMount(getCountry);

    	async function getCountry() {
    		console.log("Fetching countries...");
    		const res = await fetch("/api/v2/happiness_rate?offset=" + recursos * offset + "&limit=" + recursos);
    		const resNext = await fetch("/api/v2/happiness_rate?offset=" + recursos * (offset + 1) + "&limit=" + recursos);

    		if (res.ok && resNext.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			const jsonNext = await resNext.json();
    			$$invalidate(5, countries = json);

    			if (jsonNext.length == 0) {
    				$$invalidate(2, moreData = false);
    			} else {
    				$$invalidate(2, moreData = true);
    			}

    			console.log("Received " + countries.length + " countries.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	function incrementOffset(valor) {
    		offset += valor;
    		$$invalidate(1, currentPage += valor);
    		getCountry();
    	}

    	async function insertCountry() {
    		console.log("Inserting new country..." + JSON.stringify(newCountry));

    		const res = await fetch("/api/v2/happiness_rate", {
    			method: "POST",
    			body: JSON.stringify(newCountry),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			if (res.status == 201) {
    				window.alert("Dato creado");
    			} else if (res.status == 409) {
    				window.alert("Ya existe el dato");
    			} else if (res.status == 400) {
    				window.alert("Datos no validos(no se puede dejar los parametros vacios)");
    			}

    			getCountry();
    		});
    	}

    	async function deleteCountry(country, year) {
    		const res = await fetch("/api/v2/happiness_rate/" + country + "/" + year, { method: "DELETE" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("Dato borrado");
    			} else if (res.status == 404) {
    				window.alert("No existe el elemento");
    			}

    			getCountry();
    		});
    	}

    	async function deleteAllCountries() {
    		const res = await fetch("/api/v2/happiness_rate/", { method: "DELETE" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("Borrando datos");
    			} else if (res.status == 405) {
    				window.alert("No hay elementos que eliminar");
    			}

    			getCountry();
    		});
    	}

    	async function loadInitialData() {
    		const res = await fetch("/api/v2/happiness_rate/loadInitialData", { method: "GET" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("Insetando elementos en la tabla");
    			} else if (res.status == 409) {
    				window.alert("No es posible realizar la accion ya que hay elementos en ella,pulse el boton de eliminar para poder ejecutar esta accion");
    			}

    			getCountry();
    		});
    	}

    	async function search(country, year) {
    		var url = "/api/v2/happiness_rate";

    		if (country != "" && year != "") {
    			url = url + "?year=" + year + "&country=" + country;
    		} else if (country != "" && year == "") {
    			url = url + "?country=" + country;
    		} else if (country == "" && year != "") {
    			url = url + "?year=" + year;
    		}

    		const res = await fetch(url);

    		if (res.ok) {
    			const json = await res.json();
    			$$invalidate(5, countries = json);

    			if (country == "" && year == "") {
    				window.alert("Introduce datos");
    			} else if (countries.length > 0) {
    				window.alert("Datos encontrados");
    			} else {
    				window.alert("No hay resultados");
    			}
    		} else {
    			console.log("ERROR");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CountriesTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CountriesTable", $$slots, []);

    	function input0_input_handler() {
    		newCountry.country = this.value;
    		$$invalidate(0, newCountry);
    	}

    	function input1_input_handler() {
    		newCountry.year = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input2_input_handler() {
    		newCountry.happinessRanking = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input3_input_handler() {
    		newCountry.happinessRate = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input4_input_handler() {
    		newCountry.var = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	const click_handler = () => incrementOffset(-1);
    	const click_handler_1 = () => incrementOffset(-1);
    	const click_handler_2 = () => incrementOffset(1);
    	const click_handler_3 = () => incrementOffset(1);

    	function input_value_binding(value) {
    		actualCountry = value;
    		$$invalidate(3, actualCountry);
    	}

    	function input_value_binding_1(value) {
    		actualYear = value;
    		$$invalidate(4, actualYear);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Table,
    		Button,
    		Pagination,
    		PaginationItem,
    		PaginationLink,
    		Input,
    		FormGroup,
    		countries,
    		newCountry,
    		exitoMsg,
    		recursos,
    		offset,
    		currentPage,
    		moreData,
    		actualCountry,
    		actualYear,
    		country,
    		year,
    		getCountry,
    		incrementOffset,
    		insertCountry,
    		deleteCountry,
    		deleteAllCountries,
    		loadInitialData,
    		search
    	});

    	$$self.$inject_state = $$props => {
    		if ("countries" in $$props) $$invalidate(5, countries = $$props.countries);
    		if ("newCountry" in $$props) $$invalidate(0, newCountry = $$props.newCountry);
    		if ("exitoMsg" in $$props) $$invalidate(6, exitoMsg = $$props.exitoMsg);
    		if ("recursos" in $$props) recursos = $$props.recursos;
    		if ("offset" in $$props) offset = $$props.offset;
    		if ("currentPage" in $$props) $$invalidate(1, currentPage = $$props.currentPage);
    		if ("moreData" in $$props) $$invalidate(2, moreData = $$props.moreData);
    		if ("actualCountry" in $$props) $$invalidate(3, actualCountry = $$props.actualCountry);
    		if ("actualYear" in $$props) $$invalidate(4, actualYear = $$props.actualYear);
    		if ("country" in $$props) country = $$props.country;
    		if ("year" in $$props) year = $$props.year;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newCountry,
    		currentPage,
    		moreData,
    		actualCountry,
    		actualYear,
    		countries,
    		exitoMsg,
    		incrementOffset,
    		insertCountry,
    		deleteCountry,
    		deleteAllCountries,
    		loadInitialData,
    		search,
    		offset,
    		recursos,
    		country,
    		year,
    		getCountry,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input_value_binding,
    		input_value_binding_1
    	];
    }

    class CountriesTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CountriesTable",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\front\happiness_rateAPI\EditCountry.svelte generated by Svelte v3.20.1 */

    const { console: console_1$3 } = globals;
    const file$c = "src\\front\\happiness_rateAPI\\EditCountry.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (81:4) {:then countries}
    function create_then_block$1(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedVar, updatedHappinessRate, updatedHappinessRanking, updatedYear, updatedCountry*/ 8254) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(81:4) {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (100:25) <Button outline  color="success" on:click={updateCountry}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(100:25) <Button outline  color=\\\"success\\\" on:click={updateCountry}>",
    		ctx
    	});

    	return block;
    }

    // (82:8) <Table bordered>
    function create_default_slot_1$1(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t12;
    	let t13;
    	let td1;
    	let t14;
    	let t15;
    	let td2;
    	let input0;
    	let input0_updating = false;
    	let t16;
    	let td3;
    	let input1;
    	let input1_updating = false;
    	let t17;
    	let td4;
    	let input2;
    	let input2_updating = false;
    	let t18;
    	let td5;
    	let current;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[10].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[11].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[12].call(input2);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updateCountry*/ ctx[8]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "País";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Ranking de Felicidad";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Tasa de Felicidad";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Variacion";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Acción";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t12 = text(/*updatedCountry*/ ctx[1]);
    			t13 = space();
    			td1 = element("td");
    			t14 = text(/*updatedYear*/ ctx[2]);
    			t15 = space();
    			td2 = element("td");
    			input0 = element("input");
    			t16 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t17 = space();
    			td4 = element("td");
    			input2 = element("input");
    			t18 = space();
    			td5 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$c, 84, 19, 2518);
    			add_location(th1, file$c, 85, 17, 2550);
    			add_location(th2, file$c, 86, 17, 2581);
    			add_location(th3, file$c, 87, 17, 2629);
    			add_location(th4, file$c, 88, 5, 2662);
    			add_location(th5, file$c, 89, 5, 2687);
    			set_style(tr0, "color", "#00680D");
    			add_location(tr0, file$c, 83, 16, 2471);
    			add_location(thead, file$c, 82, 12, 2446);
    			add_location(td0, file$c, 94, 20, 2812);
    			add_location(td1, file$c, 95, 5, 2844);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$c, 96, 24, 2892);
    			add_location(td2, file$c, 96, 20, 2888);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$c, 97, 24, 2985);
    			add_location(td3, file$c, 97, 20, 2981);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file$c, 98, 9, 3060);
    			add_location(td4, file$c, 98, 5, 3056);
    			add_location(td5, file$c, 99, 20, 3136);
    			add_location(tr1, file$c, 93, 16, 2786);
    			add_location(tbody, file$c, 92, 12, 2761);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t12);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, t14);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, input0);
    			set_input_value(input0, /*updatedHappinessRanking*/ ctx[3]);
    			append_dev(tr1, t16);
    			append_dev(tr1, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*updatedHappinessRate*/ ctx[4]);
    			append_dev(tr1, t17);
    			append_dev(tr1, td4);
    			append_dev(td4, input2);
    			set_input_value(input2, /*updatedVar*/ ctx[5]);
    			append_dev(tr1, t18);
    			append_dev(tr1, td5);
    			mount_component(button, td5, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*updatedCountry*/ 2) set_data_dev(t12, /*updatedCountry*/ ctx[1]);
    			if (!current || dirty & /*updatedYear*/ 4) set_data_dev(t14, /*updatedYear*/ ctx[2]);

    			if (!input0_updating && dirty & /*updatedHappinessRanking*/ 8) {
    				set_input_value(input0, /*updatedHappinessRanking*/ ctx[3]);
    			}

    			input0_updating = false;

    			if (!input1_updating && dirty & /*updatedHappinessRate*/ 16) {
    				set_input_value(input1, /*updatedHappinessRate*/ ctx[4]);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty & /*updatedVar*/ 32) {
    				set_input_value(input2, /*updatedVar*/ ctx[5]);
    			}

    			input2_updating = false;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(82:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (79:22)           Loading countries...      {:then countries}
    function create_pending_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading countries...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(79:22)           Loading countries...      {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (105:4) {#if SuccessMsg}
    function create_if_block$7(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(/*SuccessMsg*/ ctx[6]);
    			t1 = text(". País actualizado con éxito");
    			set_style(p, "color", "green");
    			add_location(p, file$c, 105, 8, 3328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*SuccessMsg*/ 64) set_data_dev(t0, /*SuccessMsg*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(105:4) {#if SuccessMsg}",
    		ctx
    	});

    	return block;
    }

    // (108:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(108:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let h3;
    	let t0;
    	let strong;
    	let t1_value = /*params*/ ctx[0].country + "";
    	let t1;
    	let t2;
    	let t3_value = /*params*/ ctx[0].year + "";
    	let t3;
    	let t4;
    	let promise;
    	let t5;
    	let t6;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 7,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*countries*/ ctx[7], info);
    	let if_block = /*SuccessMsg*/ ctx[6] && create_if_block$7(ctx);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			t0 = text("Editar el Pais: ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			create_component(button.$$.fragment);
    			add_location(strong, file$c, 77, 24, 2277);
    			add_location(h3, file$c, 77, 4, 2257);
    			add_location(main, file$c, 76, 0, 2245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h3);
    			append_dev(h3, t0);
    			append_dev(h3, strong);
    			append_dev(strong, t1);
    			append_dev(strong, t2);
    			append_dev(strong, t3);
    			append_dev(main, t4);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t5;
    			append_dev(main, t5);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t6);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t1_value !== (t1_value = /*params*/ ctx[0].country + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*params*/ 1) && t3_value !== (t3_value = /*params*/ ctx[0].year + "")) set_data_dev(t3, t3_value);
    			info.ctx = ctx;

    			if (dirty & /*countries*/ 128 && promise !== (promise = /*countries*/ ctx[7]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[7] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*SuccessMsg*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(main, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let countries = {};
    	let updatedCountry = "";
    	let updatedYear = 0;
    	let updatedHappinessRanking = 0;
    	let updatedHappinessRate = 0;
    	let updatedVar = 0;
    	let SuccessMsg = "";
    	onMount(getCountry);

    	async function getCountry() {
    		console.log("Fetching countries...");
    		const res = await fetch("/api/v2/happiness_rate/" + params.country + "/" + params.year);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(7, countries = json);
    			$$invalidate(1, updatedCountry = params.country);
    			$$invalidate(2, updatedYear = parseInt(params.year));
    			$$invalidate(3, updatedHappinessRanking = countries.happinessRanking);
    			$$invalidate(4, updatedHappinessRate = countries.happinessRate);
    			$$invalidate(5, updatedVar = countries.var);
    			console.log("Received countries.");
    		} else if (res.status == 404) {
    			window.alert("El dato: " + params.country + " " + params.year + " no existe");
    		}
    	}

    	async function updateCountry() {
    		console.log("Updating countries..." + JSON.stringify(params.countriesCountry));

    		const res = await fetch("/api/v2/happiness_rate/" + params.country + "/" + params.year, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: params.country,
    				year: parseInt(params.year),
    				happinessRanking: updatedHappinessRanking,
    				happinessRate: updatedHappinessRate,
    				var: updatedVar
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getCountry();

    			if (res.ok) {
    				$$invalidate(6, SuccessMsg = res.status + ": " + res.statusText);
    				console.log("OK!" + SuccessMsg);
    			} else if (res.status == 400) {
    				window.alert("Datos no son válidos");
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<EditCountry> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditCountry", $$slots, []);

    	function input0_input_handler() {
    		updatedHappinessRanking = to_number(this.value);
    		$$invalidate(3, updatedHappinessRanking);
    	}

    	function input1_input_handler() {
    		updatedHappinessRate = to_number(this.value);
    		$$invalidate(4, updatedHappinessRate);
    	}

    	function input2_input_handler() {
    		updatedVar = to_number(this.value);
    		$$invalidate(5, updatedVar);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		params,
    		countries,
    		updatedCountry,
    		updatedYear,
    		updatedHappinessRanking,
    		updatedHappinessRate,
    		updatedVar,
    		SuccessMsg,
    		getCountry,
    		updateCountry
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("countries" in $$props) $$invalidate(7, countries = $$props.countries);
    		if ("updatedCountry" in $$props) $$invalidate(1, updatedCountry = $$props.updatedCountry);
    		if ("updatedYear" in $$props) $$invalidate(2, updatedYear = $$props.updatedYear);
    		if ("updatedHappinessRanking" in $$props) $$invalidate(3, updatedHappinessRanking = $$props.updatedHappinessRanking);
    		if ("updatedHappinessRate" in $$props) $$invalidate(4, updatedHappinessRate = $$props.updatedHappinessRate);
    		if ("updatedVar" in $$props) $$invalidate(5, updatedVar = $$props.updatedVar);
    		if ("SuccessMsg" in $$props) $$invalidate(6, SuccessMsg = $$props.SuccessMsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		updatedCountry,
    		updatedYear,
    		updatedHappinessRanking,
    		updatedHappinessRate,
    		updatedVar,
    		SuccessMsg,
    		countries,
    		updateCountry,
    		getCountry,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class EditCountry extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditCountry",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get params() {
    		throw new Error("<EditCountry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditCountry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\happiness_rateAPI\Graph.svelte generated by Svelte v3.20.1 */

    const file$d = "src\\front\\happiness_rateAPI\\Graph.svelte";

    function create_fragment$e(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let t0;
    	let main;
    	let figure;
    	let div;
    	let t1;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "En la gráfica podemos observar la Tasa  de Felicidad por Paises, donde se ve: el Ranking de Felicidad, tasa de felicidad y variacion de felicidad.";
    			if (script0.src !== (script0_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$d, 53, 1, 1189);
    			if (script1.src !== (script1_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$d, 54, 1, 1279);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/modules/export-data.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$d, 55, 1, 1376);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/modules/accessibility.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$d, 56, 1, 1475);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-pgbwiv");
    			add_location(div, file$d, 63, 2, 1645);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$d, 64, 2, 1675);
    			attr_dev(figure, "class", "highcharts-figure svelte-pgbwiv");
    			add_location(figure, file$d, 62, 1, 1607);
    			add_location(main, file$d, 61, 0, 1598);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(script0, "load", loadGraph$1, false, false, false),
    				listen_dev(script1, "load", loadGraph$1, false, false, false),
    				listen_dev(script2, "load", loadGraph$1, false, false, false),
    				listen_dev(script3, "load", loadGraph$1, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$1() {
    	let MyData = [];
    	let MyDataGraph = [];
    	const resData = await fetch("/api/v2/happiness_rate");
    	MyData = await resData.json();

    	MyData.forEach(x => {
    		MyDataGraph.push({
    			name: x.country + " " + x.year,
    			data: [
    				parseInt(x.happinessRanking),
    				parseFloat(x.happinessRate),
    				parseFloat(x.var)
    			],
    			pointPlacement: "on"
    		});
    	});

    	Highcharts.chart("container", {
    		chart: { type: "spline" },
    		title: { text: "Tasa de Felicidad" },
    		xAxis: {
    			categories: ["Ranking de Felicidad", "Tasa de Felicidad", "Variacion"]
    		},
    		yAxis: {
    			title: { text: "Posicionamiento" },
    			labels: {
    				formatter() {
    					return this.var;
    				}
    			}
    		},
    		tooltip: { crosshairs: true, shared: true },
    		plotOptions: {
    			spline: {
    				marker: {
    					radius: 4,
    					lineColor: "#666666",
    					lineWidth: 1
    				}
    			}
    		},
    		series: MyDataGraph
    	});
    }

    function instance$e($$self, $$props, $$invalidate) {
    	loadGraph$1();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Graph> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Graph", $$slots, []);
    	$$self.$capture_state = () => ({ loadGraph: loadGraph$1 });
    	return [];
    }

    class Graph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graph",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\front\happiness_rateAPI\GraphAwesome.svelte generated by Svelte v3.20.1 */

    const { console: console_1$4 } = globals;
    const file$e = "src\\front\\happiness_rateAPI\\GraphAwesome.svelte";

    function create_fragment$f(ctx) {
    	let main;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			div0.textContent = "Gráfica sobre la Tasa de Felicidad";
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "align", "center");
    			add_location(div0, file$e, 54, 4, 1855);
    			attr_dev(div1, "id", "radarChart");
    			attr_dev(div1, "align", "center");
    			add_location(div1, file$e, 55, 4, 1922);
    			add_location(main, file$e, 53, 0, 1842);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$2() {
    	const resData = await fetch("/api/v2/happiness_rate");
    	let Data = await resData.json();
    	console.log("Base de datos:" + Data);

    	let countries = Data.map(x => {
    		return x.country;
    	});

    	console.log("Paises:  " + countries);

    	let year = Data.map(x => {
    		return x.year;
    	});

    	console.log("Años" + year);

    	let ranking = Data.map(x => {
    		return x.happinessRanking;
    	});

    	console.log("Ranking de Felicidad:  " + ranking);

    	let rate = Data.map(x => {
    		return x.happinessRate;
    	});

    	console.log("Tasa de Felicidad: " + rate);

    	let variacion = Data.map(x => {
    		return x.var;
    	});

    	console.log("Variacion: " + variacion);
    	var tam = countries.length;
    	console.log("Tamaño:  " + tam);
    	var aux = ["x", "Ranking de Felicidad", "Tasa de Felicidad", "Variacion"];
    	var allData = [];

    	for (var i = 0; i < tam + 1; i++) {
    		allData[i] = aux;
    		aux = [];
    		aux.push(countries[i] + " " + year[i], ranking[i], rate[i], variacion[i]);
    	}

    	var chart = bb.generate({
    		data: {
    			x: "x",
    			columns: allData,
    			type: "radar",
    			labels: true
    		},
    		radar: {
    			axis: { max: 70 },
    			level: { depth: 3 },
    			direction: { clockwise: true }
    		},
    		size: { width: 640, height: 480 },
    		bindto: "#radarChart"
    	});
    }

    function instance$f($$self, $$props, $$invalidate) {
    	onMount(loadGraph$2);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<GraphAwesome> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GraphAwesome", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, loadGraph: loadGraph$2 });
    	return [];
    }

    class GraphAwesome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GraphAwesome",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Grupo05.svelte generated by Svelte v3.20.1 */

    const { console: console_1$5 } = globals;
    const file$f = "src\\front\\Integrations\\happiness_rate\\Grupo05.svelte";

    // (91:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(91:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y la media de la esperanza de vida.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$f, 84, 8, 2741);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$f, 85, 8, 2777);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$f, 83, 4, 2697);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$f, 89, 4, 2956);
    			add_location(main, file$f, 81, 0, 2683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$3() {
    	const resLife = await fetch("/api/v1/life_expectancies");
    	const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    	let Life = await resLife.json();
    	let Happy = await resDataHappiness_rate.json();
    	console.log(Life);

    	let dataHappiness = Happy.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["happinessRanking"]
    		};

    		return res;
    	});

    	let dataLife = Life.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["average_life_expectancy"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking de Felicidad",
    			data: dataHappiness
    		},
    		{
    			name: "Media de la Esperanza de Vida",
    			data: dataLife
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "40%" },
    		title: {
    			text: "Relación entre edad de la Media de la Esperanza de Vida y el Ranking de Felicidad"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$g($$self, $$props, $$invalidate) {
    	loadGraph$3();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Grupo05> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Grupo05", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$3 });
    	return [];
    }

    class Grupo05 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grupo05",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Grupo09.svelte generated by Svelte v3.20.1 */

    const { console: console_1$6 } = globals;
    const file$g = "src\\front\\Integrations\\happiness_rate\\Grupo09.svelte";

    // (92:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(92:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let main;
    	let figure;
    	let div0;
    	let t0;
    	let p;
    	let t2;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y el Porcentaje de energia renovable total.";
    			t2 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$g, 85, 8, 2758);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$g, 86, 8, 2794);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$g, 84, 4, 2714);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$g, 90, 4, 2981);
    			add_location(main, file$g, 82, 0, 2700);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t0);
    			append_dev(figure, p);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$4() {
    	const resRenewable = await fetch("/api/v4/renewable-sources-stats");
    	const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    	let renewable = await resRenewable.json();
    	let Happy = await resDataHappiness_rate.json();
    	console.log(renewable);

    	let dataHappiness = Happy.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["happinessRanking"]
    		};

    		return res;
    	});

    	let dataRenewable = renewable.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["percentage-re-total"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking de Felicidad",
    			data: dataHappiness
    		},
    		{
    			name: "Porcentaje de energia renovable total",
    			data: dataRenewable
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "40%" },
    		title: {
    			text: "Relación entre Porcentaje de energia renovable total y el Ranking de Felicidad"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$h($$self, $$props, $$invalidate) {
    	loadGraph$4();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<Grupo09> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Grupo09", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$4 });
    	return [];
    }

    class Grupo09 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grupo09",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Grupo12.svelte generated by Svelte v3.20.1 */

    const { console: console_1$7 } = globals;
    const file$h = "src\\front\\Integrations\\happiness_rate\\Grupo12.svelte";

    // (92:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(92:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let main;
    	let figure;
    	let div0;
    	let t0;
    	let p;
    	let t2;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y la media de edad de muerte por sobredosis.";
    			t2 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$h, 85, 8, 2715);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$h, 86, 8, 2751);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$h, 84, 4, 2671);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$h, 90, 4, 2939);
    			add_location(main, file$h, 82, 0, 2657);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t0);
    			append_dev(figure, p);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$5() {
    	const resOverdose = await fetch("/api/v2/overdose-deaths");
    	const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    	let overdose = await resOverdose.json();
    	let Happy = await resDataHappiness_rate.json();
    	console.log(overdose);

    	let dataHappiness = Happy.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["happinessRanking"]
    		};

    		return res;
    	});

    	let dataOverdose = overdose.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["mean_age"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking de Felicidad",
    			data: dataHappiness
    		},
    		{
    			name: "Media de edad",
    			data: dataOverdose
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "40%" },
    		title: {
    			text: "Relación entre la mediade edad de fallecidos por sobredosis y el Ranking de Felicidad"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$i($$self, $$props, $$invalidate) {
    	loadGraph$5();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Grupo12> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Grupo12", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$5 });
    	return [];
    }

    class Grupo12 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grupo12",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Grupo22.svelte generated by Svelte v3.20.1 */

    const { console: console_1$8 } = globals;
    const file$i = "src\\front\\Integrations\\happiness_rate\\Grupo22.svelte";

    // (90:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(90:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let main;
    	let figure;
    	let div0;
    	let t0;
    	let p;
    	let t2;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y los puntos en el baloncesto.";
    			t2 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$i, 83, 8, 2663);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$i, 84, 8, 2699);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$i, 82, 4, 2619);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$i, 88, 4, 2875);
    			add_location(main, file$i, 80, 0, 2605);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t0);
    			append_dev(figure, p);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$6() {
    	const resBasket = await fetch("/api/v1/og-basket-stats");
    	const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    	let Basket = await resBasket.json();
    	let Happy = await resDataHappiness_rate.json();
    	console.log(Basket);

    	let dataHappiness = Happy.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["happinessRanking"]
    		};

    		return res;
    	});

    	let dataBasket = Basket.map(x => {
    		let res = {
    			name: x.country + " - " + x.year,
    			value: x["points"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking de Felicidad",
    			data: dataHappiness
    		},
    		{ name: "Puntos", data: dataBasket }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "40%" },
    		title: {
    			text: "Relación entre los Puntos en el Baloncesto y el Ranking de Felicidad"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$j($$self, $$props, $$invalidate) {
    	loadGraph$6();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<Grupo22> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Grupo22", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$6 });
    	return [];
    }

    class Grupo22 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grupo22",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Externa01.svelte generated by Svelte v3.20.1 */

    const { console: console_1$9 } = globals;
    const file$j = "src\\front\\Integrations\\happiness_rate\\Externa01.svelte";

    // (103:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(103:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y las muertes totales por COVID.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$j, 96, 8, 3015);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$j, 97, 8, 3051);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$j, 95, 4, 2971);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$j, 101, 4, 3227);
    			add_location(main, file$j, 93, 0, 2957);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let Data = [];
    	let Country = [];
    	let Country2 = [];

    	async function loadGraph() {
    		const resCOVID = await fetch("https://covid-193.p.rapidapi.com/statistics", {
    			"method": "GET",
    			"headers": {
    				"x-rapidapi-host": "covid-193.p.rapidapi.com",
    				"x-rapidapi-key": "7ba6091b4amsh6731b2f89b0cdc6p106e3fjsnbd534659f6b0"
    			}
    		});

    		const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    		let Happy = await resDataHappiness_rate.json();

    		let dataHappiness = Happy.map(x => {
    			let res = {
    				name: x.country + " - " + x.year,
    				value: x["happinessRanking"]
    			};

    			return res;
    		});

    		Country = await resCOVID.json();
    		console.log(Country.response);
    		Country2 = Country.response;

    		Country2.forEach(x => {
    			let country = {
    				"name": x.country,
    				"value": x.deaths.total
    			};

    			Data.push(country);
    		});

    		let dataTotal = [
    			{
    				name: "Ranking de Felicidad",
    				data: dataHappiness
    			},
    			{
    				name: "Muertes Totales por COVID",
    				data: Data
    			}
    		];

    		Highcharts.chart("container", {
    			chart: { type: "packedbubble", height: "40%" },
    			title: {
    				text: "Relación entre las muertes totales por COVID y el Ranking de Felicidad"
    			},
    			tooltip: {
    				useHTML: true,
    				pointFormat: "<b>{point.name}:</b> {point.value}"
    			},
    			plotOptions: {
    				packedbubble: {
    					minSize: "30%",
    					maxSize: "120%",
    					zMin: 0,
    					zMax: 1000,
    					layoutAlgorithm: {
    						splitSeries: false,
    						gravitationalConstant: 0.02
    					},
    					dataLabels: {
    						enabled: true,
    						format: "{point.name}",
    						filter: { property: "y", operator: ">", value: 250 },
    						style: {
    							color: "black",
    							textOutline: "none",
    							fontWeight: "normal"
    						}
    					}
    				}
    			},
    			series: dataTotal
    		});
    	}

    	loadGraph();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$9.warn(`<Externa01> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Externa01", $$slots, []);

    	$$self.$capture_state = () => ({
    		pop,
    		Button,
    		Data,
    		Country,
    		Country2,
    		loadGraph
    	});

    	$$self.$inject_state = $$props => {
    		if ("Data" in $$props) Data = $$props.Data;
    		if ("Country" in $$props) Country = $$props.Country;
    		if ("Country2" in $$props) Country2 = $$props.Country2;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Externa01 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Externa01",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Externa02.svelte generated by Svelte v3.20.1 */

    const { console: console_1$a } = globals;
    const file$k = "src\\front\\Integrations\\happiness_rate\\Externa02.svelte";

    // (102:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(102:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y la Población por país.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$k, 95, 8, 3060);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$k, 96, 8, 3096);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$k, 94, 4, 3016);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$k, 100, 4, 3264);
    			add_location(main, file$k, 92, 0, 3002);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let Data = [];
    	let countriesPopulation = [];
    	let CountryPopulation = [];

    	async function loadGraph() {
    		const resPopulation = await fetch("https://ajayakv-rest-countries-v1.p.rapidapi.com/rest/v1/all", {
    			"method": "GET",
    			"headers": {
    				"x-rapidapi-host": "ajayakv-rest-countries-v1.p.rapidapi.com",
    				"x-rapidapi-key": "7ba6091b4amsh6731b2f89b0cdc6p106e3fjsnbd534659f6b0"
    			}
    		});

    		const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    		let Happy = await resDataHappiness_rate.json();

    		let dataHappiness = Happy.map(x => {
    			let res = {
    				name: x.country + " - " + x.year,
    				value: x["happinessRanking"]
    			};

    			return res;
    		});

    		CountryPopulation = await resPopulation.json();
    		console.log(CountryPopulation);

    		CountryPopulation.forEach(x => {
    			let country = { "name": x.name, "value": x.population };
    			Data.push(country);
    		});

    		let dataTotal = [
    			{
    				name: "Ranking de Felicidad",
    				data: dataHappiness
    			},
    			{ name: "Población por País", data: Data }
    		];

    		Highcharts.chart("container", {
    			chart: { type: "packedbubble", height: "40%" },
    			title: {
    				text: "Relación entre la Población por país y el Ranking de Felicidad"
    			},
    			tooltip: {
    				useHTML: true,
    				pointFormat: "<b>{point.name}:</b> {point.value}"
    			},
    			plotOptions: {
    				packedbubble: {
    					minSize: "30%",
    					maxSize: "120%",
    					zMin: 0,
    					zMax: 1000,
    					layoutAlgorithm: {
    						splitSeries: false,
    						gravitationalConstant: 0.02
    					},
    					dataLabels: {
    						enabled: true,
    						format: "{point.name}",
    						filter: { property: "y", operator: ">", value: 250 },
    						style: {
    							color: "black",
    							textOutline: "none",
    							fontWeight: "normal"
    						}
    					}
    				}
    			},
    			series: dataTotal
    		});
    	}

    	loadGraph();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$a.warn(`<Externa02> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Externa02", $$slots, []);

    	$$self.$capture_state = () => ({
    		pop,
    		Button,
    		Data,
    		countriesPopulation,
    		CountryPopulation,
    		loadGraph
    	});

    	$$self.$inject_state = $$props => {
    		if ("Data" in $$props) Data = $$props.Data;
    		if ("countriesPopulation" in $$props) countriesPopulation = $$props.countriesPopulation;
    		if ("CountryPopulation" in $$props) CountryPopulation = $$props.CountryPopulation;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Externa02 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Externa02",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Externa03.svelte generated by Svelte v3.20.1 */

    const { console: console_1$b } = globals;
    const file$l = "src\\front\\Integrations\\happiness_rate\\Externa03.svelte";

    // (103:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(103:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y el tiempo jugado.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$l, 96, 8, 2952);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$l, 97, 8, 2988);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$l, 95, 4, 2908);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$l, 101, 4, 3151);
    			add_location(main, file$l, 93, 0, 2894);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let Data = [];
    	let Over = [];

    	async function loadGraph() {
    		const resOver = await fetch("https://overtracker1.p.rapidapi.com/feed/global?page=1", {
    			"method": "GET",
    			"headers": {
    				"x-rapidapi-host": "overtracker1.p.rapidapi.com",
    				"x-rapidapi-key": "7ba6091b4amsh6731b2f89b0cdc6p106e3fjsnbd534659f6b0"
    			}
    		});

    		const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    		let Happy = await resDataHappiness_rate.json();

    		let dataHappiness = Happy.map(x => {
    			let res = {
    				name: x.country + " - " + x.year,
    				value: x["happinessRanking"]
    			};

    			return res;
    		});

    		Over = await resOver.json();
    		console.log(Over);

    		Over.forEach(x => {
    			let over = { "name": x.player.tag, "value": x.date };
    			Data.push(over);
    		});

    		let dataTotal = [
    			{
    				name: "Ranking de Felicidad",
    				data: dataHappiness
    			},
    			{ name: "Tag de Jugadores", data: Data }
    		];

    		Highcharts.chart("container", {
    			chart: { type: "packedbubble", height: "40%" },
    			title: {
    				text: "Relación entre el tiempo jugado y el Ranking de Felicidad"
    			},
    			tooltip: {
    				useHTML: true,
    				pointFormat: "<b>{point.name}:</b> {point.value}"
    			},
    			plotOptions: {
    				packedbubble: {
    					minSize: "30%",
    					maxSize: "120%",
    					zMin: 0,
    					zMax: 1000,
    					layoutAlgorithm: {
    						splitSeries: false,
    						gravitationalConstant: 0.02
    					},
    					dataLabels: {
    						enabled: true,
    						format: "{point.name}",
    						filter: { property: "y", operator: ">", value: 250 },
    						style: {
    							color: "black",
    							textOutline: "none",
    							fontWeight: "normal"
    						}
    					}
    				}
    			},
    			series: dataTotal
    		});
    	}

    	loadGraph();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$b.warn(`<Externa03> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Externa03", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, Data, Over, loadGraph });

    	$$self.$inject_state = $$props => {
    		if ("Data" in $$props) Data = $$props.Data;
    		if ("Over" in $$props) Over = $$props.Over;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Externa03 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Externa03",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\front\Integrations\happiness_rate\Externa04.svelte generated by Svelte v3.20.1 */

    const { console: console_1$c } = globals;
    const file$m = "src\\front\\Integrations\\happiness_rate\\Externa04.svelte";

    // (103:4) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(103:4) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra el ranking de felicidad y el número de mercados en la que se usa la criptomoneda.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$m, 96, 8, 2961);
    			attr_dev(p, "class", "highcharts-description");
    			attr_dev(p, "align", "center");
    			add_location(p, file$m, 97, 8, 2997);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$m, 95, 4, 2917);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$m, 101, 4, 3198);
    			add_location(main, file$m, 93, 0, 2903);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let Data = [];
    	let Coins = [];

    	async function loadGraph() {
    		const resCoins = await fetch("https://coinpaprika1.p.rapidapi.com/exchanges", {
    			"method": "GET",
    			"headers": {
    				"x-rapidapi-host": "coinpaprika1.p.rapidapi.com",
    				"x-rapidapi-key": "7ba6091b4amsh6731b2f89b0cdc6p106e3fjsnbd534659f6b0"
    			}
    		});

    		const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
    		let Happy = await resDataHappiness_rate.json();

    		let dataHappiness = Happy.map(x => {
    			let res = {
    				name: x.country + " - " + x.year,
    				value: x["happinessRanking"]
    			};

    			return res;
    		});

    		Coins = await resCoins.json();
    		console.log(Coins);

    		Coins.forEach(x => {
    			let coin = { "name": x.name, "value": x.markets };
    			Data.push(coin);
    		});

    		let dataTotal = [
    			{
    				name: "Ranking de Felicidad",
    				data: dataHappiness
    			},
    			{
    				name: "Nombre de la Criptomoneda",
    				data: Data
    			}
    		];

    		Highcharts.chart("container", {
    			chart: { type: "packedbubble", height: "40%" },
    			title: {
    				text: "Relación entre el número de mercados en la que se usa la criptomoneda y el Ranking de Felicidad"
    			},
    			tooltip: {
    				useHTML: true,
    				pointFormat: "<b>{point.name}:</b> {point.value}"
    			},
    			plotOptions: {
    				packedbubble: {
    					minSize: "30%",
    					maxSize: "120%",
    					zMin: 0,
    					zMax: 1000,
    					layoutAlgorithm: {
    						splitSeries: false,
    						gravitationalConstant: 0.02
    					},
    					dataLabels: {
    						enabled: true,
    						format: "{point.name}",
    						filter: { property: "y", operator: ">", value: 250 },
    						style: {
    							color: "black",
    							textOutline: "none",
    							fontWeight: "normal"
    						}
    					}
    				}
    			},
    			series: dataTotal
    		});
    	}

    	loadGraph();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$c.warn(`<Externa04> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Externa04", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, Data, Coins, loadGraph });

    	$$self.$inject_state = $$props => {
    		if ("Data" in $$props) Data = $$props.Data;
    		if ("Coins" in $$props) Coins = $$props.Coins;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Externa04 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Externa04",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\front\global_competitiveness_indexAPI\countries_adrescbar.svelte generated by Svelte v3.20.1 */

    const { console: console_1$d } = globals;
    const file$n = "src\\front\\global_competitiveness_indexAPI\\countries_adrescbar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (169:1) {:then countries_adrescbar}
    function create_then_block$2(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_19$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty[0] & /*countries_adrescbar, newCountry*/ 33 | dirty[1] & /*$$scope*/ 1) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(169:1) {:then countries_adrescbar}",
    		ctx
    	});

    	return block;
    }

    // (188:9) <Button outline  color="primary" on:click={insertCountries_adrescbar}>
    function create_default_slot_22$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Añadir");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22$1.name,
    		type: "slot",
    		source: "(188:9) <Button outline  color=\\\"primary\\\" on:click={insertCountries_adrescbar}>",
    		ctx
    	});

    	return block;
    }

    // (201:7) <Button outline color="danger" on:click="{deleteCountries_adrescbar(country_adrescbar.country)}">
    function create_default_slot_21$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21$1.name,
    		type: "slot",
    		source: "(201:7) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteCountries_adrescbar(country_adrescbar.country)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (202:7) <Button outline color="success" href="#/global_competitiveness_index/{country_adrescbar.country}/{country_adrescbar.year}">
    function create_default_slot_20$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Editar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20$1.name,
    		type: "slot",
    		source: "(202:7) <Button outline color=\\\"success\\\" href=\\\"#/global_competitiveness_index/{country_adrescbar.country}/{country_adrescbar.year}\\\">",
    		ctx
    	});

    	return block;
    }

    // (191:4) {#each countries_adrescbar as country_adrescbar}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*country_adrescbar*/ ctx[28].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*country_adrescbar*/ ctx[28].year + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*country_adrescbar*/ ctx[28].ranking + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*country_adrescbar*/ ctx[28].index + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*country_adrescbar*/ ctx[28].var + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;
    	let t11;
    	let current;

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_21$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*deleteCountries_adrescbar*/ ctx[9](/*country_adrescbar*/ ctx[28].country))) /*deleteCountries_adrescbar*/ ctx[9](/*country_adrescbar*/ ctx[28].country).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				href: "#/global_competitiveness_index/" + /*country_adrescbar*/ ctx[28].country + "/" + /*country_adrescbar*/ ctx[28].year,
    				$$slots: { default: [create_default_slot_20$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			create_component(button0.$$.fragment);
    			t10 = space();
    			create_component(button1.$$.fragment);
    			t11 = space();
    			attr_dev(a, "href", a_href_value = "#/global_competitiveness_index/" + /*country_adrescbar*/ ctx[28].country + "/" + /*country_adrescbar*/ ctx[28].year);
    			add_location(a, file$n, 193, 7, 5252);
    			add_location(td0, file$n, 192, 6, 5239);
    			add_location(td1, file$n, 195, 6, 5398);
    			add_location(td2, file$n, 196, 6, 5439);
    			add_location(td3, file$n, 197, 6, 5483);
    			add_location(td4, file$n, 198, 6, 5525);
    			add_location(td5, file$n, 199, 6, 5565);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$n, 191, 5, 5227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			mount_component(button0, td5, null);
    			append_dev(td5, t10);
    			mount_component(button1, td5, null);
    			append_dev(tr, t11);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*countries_adrescbar*/ 32) && t0_value !== (t0_value = /*country_adrescbar*/ ctx[28].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*countries_adrescbar*/ 32 && a_href_value !== (a_href_value = "#/global_competitiveness_index/" + /*country_adrescbar*/ ctx[28].country + "/" + /*country_adrescbar*/ ctx[28].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty[0] & /*countries_adrescbar*/ 32) && t2_value !== (t2_value = /*country_adrescbar*/ ctx[28].year + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*countries_adrescbar*/ 32) && t4_value !== (t4_value = /*country_adrescbar*/ ctx[28].ranking + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*countries_adrescbar*/ 32) && t6_value !== (t6_value = /*country_adrescbar*/ ctx[28].index + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*countries_adrescbar*/ 32) && t8_value !== (t8_value = /*country_adrescbar*/ ctx[28].var + "")) set_data_dev(t8, t8_value);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty[0] & /*countries_adrescbar*/ 32) button1_changes.href = "#/global_competitiveness_index/" + /*country_adrescbar*/ ctx[28].country + "/" + /*country_adrescbar*/ ctx[28].year;

    			if (dirty[1] & /*$$scope*/ 1) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(191:4) {#each countries_adrescbar as country_adrescbar}",
    		ctx
    	});

    	return block;
    }

    // (170:2) <Table bordered>
    function create_default_slot_19$1(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t12;
    	let td1;
    	let input1;
    	let input1_updating = false;
    	let t13;
    	let td2;
    	let input2;
    	let input2_updating = false;
    	let t14;
    	let td3;
    	let input3;
    	let input3_updating = false;
    	let t15;
    	let td4;
    	let input4;
    	let input4_updating = false;
    	let t16;
    	let td5;
    	let t17;
    	let current;
    	let dispose;

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[18].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[19].call(input2);
    	}

    	function input3_input_handler() {
    		input3_updating = true;
    		/*input3_input_handler*/ ctx[20].call(input3);
    	}

    	function input4_input_handler() {
    		input4_updating = true;
    		/*input4_input_handler*/ ctx[21].call(input4);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_22$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertCountries_adrescbar*/ ctx[8]);
    	let each_value = /*countries_adrescbar*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "País";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Posición";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Índice";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Variación";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Acciones";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t12 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t13 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t14 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t15 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t16 = space();
    			td5 = element("td");
    			create_component(button.$$.fragment);
    			t17 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$n, 172, 5, 4546);
    			add_location(th1, file$n, 173, 5, 4566);
    			add_location(th2, file$n, 174, 5, 4585);
    			add_location(th3, file$n, 175, 5, 4609);
    			add_location(th4, file$n, 176, 5, 4631);
    			add_location(th5, file$n, 177, 5, 4656);
    			attr_dev(tr0, "class", "svelte-1a08fx9");
    			add_location(tr0, file$n, 171, 4, 4535);
    			set_style(thead, "color", "#00680D");
    			add_location(thead, file$n, 170, 3, 4500);
    			add_location(input0, file$n, 182, 9, 4730);
    			add_location(td0, file$n, 182, 5, 4726);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$n, 183, 9, 4787);
    			add_location(td1, file$n, 183, 5, 4783);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file$n, 184, 9, 4855);
    			add_location(td2, file$n, 184, 5, 4851);
    			attr_dev(input3, "type", "number");
    			add_location(input3, file$n, 185, 9, 4926);
    			add_location(td3, file$n, 185, 5, 4922);
    			attr_dev(input4, "type", "number");
    			add_location(input4, file$n, 186, 9, 4995);
    			add_location(td4, file$n, 186, 5, 4991);
    			add_location(td5, file$n, 187, 5, 5058);
    			attr_dev(tr1, "class", "svelte-1a08fx9");
    			add_location(tr1, file$n, 181, 4, 4715);
    			add_location(tbody, file$n, 180, 3, 4702);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newCountry*/ ctx[0].country);
    			append_dev(tr1, t12);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newCountry*/ ctx[0].year);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newCountry*/ ctx[0].ranking);
    			append_dev(tr1, t14);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newCountry*/ ctx[0].index);
    			append_dev(tr1, t15);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newCountry*/ ctx[0].var);
    			append_dev(tr1, t16);
    			append_dev(tr1, td5);
    			mount_component(button, td5, null);
    			append_dev(tbody, t17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler),
    				listen_dev(input3, "input", input3_input_handler),
    				listen_dev(input4, "input", input4_input_handler)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*newCountry*/ 1 && input0.value !== /*newCountry*/ ctx[0].country) {
    				set_input_value(input0, /*newCountry*/ ctx[0].country);
    			}

    			if (!input1_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input1, /*newCountry*/ ctx[0].year);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input2, /*newCountry*/ ctx[0].ranking);
    			}

    			input2_updating = false;

    			if (!input3_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input3, /*newCountry*/ ctx[0].index);
    			}

    			input3_updating = false;

    			if (!input4_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input4, /*newCountry*/ ctx[0].var);
    			}

    			input4_updating = false;
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty[0] & /*countries_adrescbar, deleteCountries_adrescbar*/ 544) {
    				each_value = /*countries_adrescbar*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19$1.name,
    		type: "slot",
    		source: "(170:2) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (167:29)     Loading countries...   {:then countries_adrescbar}
    function create_pending_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading countries...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(167:29)     Loading countries...   {:then countries_adrescbar}",
    		ctx
    	});

    	return block;
    }

    // (212:8) <PaginationItem class="{currentPage === 1 ? 'disabled' : ''}">
    function create_default_slot_18$1(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				previous: true,
    				href: "#/global_competitiveness_index"
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler*/ ctx[22]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18$1.name,
    		type: "slot",
    		source: "(212:8) <PaginationItem class=\\\"{currentPage === 1 ? 'disabled' : ''}\\\">",
    		ctx
    	});

    	return block;
    }

    // (216:8) {#if currentPage != 1}
    function create_if_block_1$3(ctx) {
    	let current;

    	const paginationitem = new PaginationItem({
    			props: {
    				$$slots: { default: [create_default_slot_16$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 1) {
    				paginationitem_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem.$set(paginationitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(216:8) {#if currentPage != 1}",
    		ctx
    	});

    	return block;
    }

    // (218:12) <PaginationLink href="#/global_competitiveness_index" on:click="{() => incrementOffset(-1)}" >
    function create_default_slot_17$1(ctx) {
    	let t_value = /*currentPage*/ ctx[1] - 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 2 && t_value !== (t_value = /*currentPage*/ ctx[1] - 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17$1.name,
    		type: "slot",
    		source: "(218:12) <PaginationLink href=\\\"#/global_competitiveness_index\\\" on:click=\\\"{() => incrementOffset(-1)}\\\" >",
    		ctx
    	});

    	return block;
    }

    // (217:8) <PaginationItem>
    function create_default_slot_16$1(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/global_competitiveness_index",
    				$$slots: { default: [create_default_slot_17$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_1*/ ctx[23]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 1) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16$1.name,
    		type: "slot",
    		source: "(217:8) <PaginationItem>",
    		ctx
    	});

    	return block;
    }

    // (222:12) <PaginationLink href="#/global_competitiveness_index" >
    function create_default_slot_15$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*currentPage*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 2) set_data_dev(t, /*currentPage*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15$1.name,
    		type: "slot",
    		source: "(222:12) <PaginationLink href=\\\"#/global_competitiveness_index\\\" >",
    		ctx
    	});

    	return block;
    }

    // (221:8) <PaginationItem active>
    function create_default_slot_14$1(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/global_competitiveness_index",
    				$$slots: { default: [create_default_slot_15$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 1) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14$1.name,
    		type: "slot",
    		source: "(221:8) <PaginationItem active>",
    		ctx
    	});

    	return block;
    }

    // (225:8) {#if moreData}
    function create_if_block$8(ctx) {
    	let current;

    	const paginationitem = new PaginationItem({
    			props: {
    				$$slots: { default: [create_default_slot_12$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 1) {
    				paginationitem_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem.$set(paginationitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(225:8) {#if moreData}",
    		ctx
    	});

    	return block;
    }

    // (227:12) <PaginationLink href="#/global_competitiveness_index" on:click="{() => incrementOffset(1)}">
    function create_default_slot_13$1(ctx) {
    	let t_value = /*currentPage*/ ctx[1] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 2 && t_value !== (t_value = /*currentPage*/ ctx[1] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$1.name,
    		type: "slot",
    		source: "(227:12) <PaginationLink href=\\\"#/global_competitiveness_index\\\" on:click=\\\"{() => incrementOffset(1)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (226:8) <PaginationItem >
    function create_default_slot_12$1(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/global_competitiveness_index",
    				$$slots: { default: [create_default_slot_13$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_2*/ ctx[24]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 1) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$1.name,
    		type: "slot",
    		source: "(226:8) <PaginationItem >",
    		ctx
    	});

    	return block;
    }

    // (231:8) <PaginationItem class="{moreData ? '' : 'disabled'}">
    function create_default_slot_11$1(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				next: true,
    				href: "#/global_competitiveness_index"
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_3*/ ctx[25]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$1.name,
    		type: "slot",
    		source: "(231:8) <PaginationItem class=\\\"{moreData ? '' : 'disabled'}\\\">",
    		ctx
    	});

    	return block;
    }

    // (210:1) <Pagination style="float:center;" ariaLabel="Cambiar de página">
    function create_default_slot_10$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const paginationitem0 = new PaginationItem({
    			props: {
    				class: /*currentPage*/ ctx[1] === 1 ? "disabled" : "",
    				$$slots: { default: [create_default_slot_18$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*currentPage*/ ctx[1] != 1 && create_if_block_1$3(ctx);

    	const paginationitem1 = new PaginationItem({
    			props: {
    				active: true,
    				$$slots: { default: [create_default_slot_14$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*moreData*/ ctx[2] && create_if_block$8(ctx);

    	const paginationitem2 = new PaginationItem({
    			props: {
    				class: /*moreData*/ ctx[2] ? "" : "disabled",
    				$$slots: { default: [create_default_slot_11$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(paginationitem1.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			create_component(paginationitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(paginationitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(paginationitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem0_changes = {};
    			if (dirty[0] & /*currentPage*/ 2) paginationitem0_changes.class = /*currentPage*/ ctx[1] === 1 ? "disabled" : "";

    			if (dirty[1] & /*$$scope*/ 1) {
    				paginationitem0_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem0.$set(paginationitem0_changes);

    			if (/*currentPage*/ ctx[1] != 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const paginationitem1_changes = {};

    			if (dirty[0] & /*currentPage*/ 2 | dirty[1] & /*$$scope*/ 1) {
    				paginationitem1_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem1.$set(paginationitem1_changes);

    			if (/*moreData*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const paginationitem2_changes = {};
    			if (dirty[0] & /*moreData*/ 4) paginationitem2_changes.class = /*moreData*/ ctx[2] ? "" : "disabled";

    			if (dirty[1] & /*$$scope*/ 1) {
    				paginationitem2_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem2.$set(paginationitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(paginationitem1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(paginationitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(paginationitem1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(paginationitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem0, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(paginationitem1, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(paginationitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$1.name,
    		type: "slot",
    		source: "(210:1) <Pagination style=\\\"float:center;\\\" ariaLabel=\\\"Cambiar de página\\\">",
    		ctx
    	});

    	return block;
    }

    // (239:2) <Button outline  color="primary" on:click={loadInitialData}>
    function create_default_slot_9$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Iniciar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$1.name,
    		type: "slot",
    		source: "(239:2) <Button outline  color=\\\"primary\\\" on:click={loadInitialData}>",
    		ctx
    	});

    	return block;
    }

    // (240:2) <Button outline  color="danger" on:click={deleteAllCountries_adrescbar}>
    function create_default_slot_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Borrar todo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(240:2) <Button outline  color=\\\"danger\\\" on:click={deleteAllCountries_adrescbar}>",
    		ctx
    	});

    	return block;
    }

    // (249:20) <FormGroup style="width:50%;">
    function create_default_slot_6(ctx) {
    	let label;
    	let t1;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[26].call(null, value);
    	}

    	let input_props = {
    		type: "text",
    		name: "selectCountry",
    		id: "selectCountry"
    	};

    	if (/*searchCountry*/ ctx[3] !== void 0) {
    		input_props.value = /*searchCountry*/ ctx[3];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Introduzca un País:";
    			t1 = space();
    			create_component(input.$$.fragment);
    			add_location(label, file$n, 249, 20, 7495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*searchCountry*/ 8) {
    				updating_value = true;
    				input_changes.value = /*searchCountry*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(249:20) <FormGroup style=\\\"width:50%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (258:24) <Label >
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Introduzca un año");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(258:24) <Label >",
    		ctx
    	});

    	return block;
    }

    // (257:20) <FormGroup style="width:50%;">
    function create_default_slot_3$1(ctx) {
    	let t;
    	let updating_value;
    	let current;

    	const label = new Label({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[27].call(null, value);
    	}

    	let input_props = {
    		type: "number",
    		name: "selectYear",
    		id: "selectYear"
    	};

    	if (/*searchYear*/ ctx[4] !== void 0) {
    		input_props.value = /*searchYear*/ ctx[4];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    			t = space();
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    			const input_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*searchYear*/ 16) {
    				updating_value = true;
    				input_changes.value = /*searchYear*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(257:20) <FormGroup style=\\\"width:50%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (266:24) <Button outline  color="primary" on:click="{search(searchCountry,searchYear)}" class="button-search" >
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(266:24) <Button outline  color=\\\"primary\\\" on:click=\\\"{search(searchCountry,searchYear)}\\\" class=\\\"button-search\\\" >",
    		ctx
    	});

    	return block;
    }

    // (267:24) <Button outline  color="secondary" href="javascript:location.reload()">
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(267:24) <Button outline  color=\\\"secondary\\\" href=\\\"javascript:location.reload()\\\">",
    		ctx
    	});

    	return block;
    }

    // (245:1) <Table bordered>
    function create_default_slot$b(ctx) {
    	let tbody;
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1;
    	let td2;
    	let div;
    	let t2;
    	let current;

    	const formgroup0 = new FormGroup({
    			props: {
    				style: "width:50%;",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const formgroup1 = new FormGroup({
    			props: {
    				style: "width:50%;",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				class: "button-search",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*search*/ ctx[7](/*searchCountry*/ ctx[3], /*searchYear*/ ctx[4]))) /*search*/ ctx[7](/*searchCountry*/ ctx[3], /*searchYear*/ ctx[4]).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				href: "javascript:location.reload()",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			tr = element("tr");
    			td0 = element("td");
    			create_component(formgroup0.$$.fragment);
    			t0 = space();
    			td1 = element("td");
    			create_component(formgroup1.$$.fragment);
    			t1 = space();
    			td2 = element("td");
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			add_location(td0, file$n, 247, 16, 7416);
    			add_location(td1, file$n, 255, 16, 7748);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			set_style(div, "margin-top", "6%");
    			add_location(div, file$n, 264, 20, 8110);
    			add_location(td2, file$n, 263, 16, 8084);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$n, 246, 12, 7394);
    			add_location(tbody, file$n, 245, 8, 7373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr);
    			append_dev(tr, td0);
    			mount_component(formgroup0, td0, null);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			mount_component(formgroup1, td1, null);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, div);
    			mount_component(button0, div, null);
    			append_dev(div, t2);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const formgroup0_changes = {};

    			if (dirty[0] & /*searchCountry*/ 8 | dirty[1] & /*$$scope*/ 1) {
    				formgroup0_changes.$$scope = { dirty, ctx };
    			}

    			formgroup0.$set(formgroup0_changes);
    			const formgroup1_changes = {};

    			if (dirty[0] & /*searchYear*/ 16 | dirty[1] & /*$$scope*/ 1) {
    				formgroup1_changes.$$scope = { dirty, ctx };
    			}

    			formgroup1.$set(formgroup1_changes);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formgroup0.$$.fragment, local);
    			transition_in(formgroup1.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formgroup0.$$.fragment, local);
    			transition_out(formgroup1.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			destroy_component(formgroup0);
    			destroy_component(formgroup1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(245:1) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let body0;
    	let t0;
    	let main;
    	let h2;
    	let t2;
    	let body1;
    	let t3;
    	let promise;
    	let t4;
    	let t5;
    	let div;
    	let t6;
    	let t7;
    	let h5;
    	let strong;
    	let t9;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*countries_adrescbar*/ ctx[5], info);

    	const pagination = new Pagination({
    			props: {
    				style: "float:center;",
    				ariaLabel: "Cambiar de página",
    				$$slots: { default: [create_default_slot_10$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_9$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*loadInitialData*/ ctx[11]);

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteAllCountries_adrescbar*/ ctx[10]);

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body0 = element("body");
    			t0 = space();
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Índice de Competitividad Global";
    			t2 = space();
    			body1 = element("body");
    			t3 = space();
    			info.block.c();
    			t4 = space();
    			create_component(pagination.$$.fragment);
    			t5 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			h5 = element("h5");
    			strong = element("strong");
    			strong.textContent = "Busquedas:";
    			t9 = space();
    			create_component(table.$$.fragment);
    			set_style(body0, "background-color", "#082EFF");
    			add_location(body0, file$n, 159, 0, 4218);
    			attr_dev(h2, "align", "center");
    			add_location(h2, file$n, 163, 1, 4281);
    			set_style(body1, "background-color", "#082EFF");
    			add_location(body1, file$n, 164, 1, 4340);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			add_location(div, file$n, 237, 1, 7065);
    			add_location(strong, file$n, 242, 5, 7310);
    			add_location(h5, file$n, 242, 1, 7306);
    			add_location(main, file$n, 162, 0, 4272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t2);
    			append_dev(main, body1);
    			append_dev(main, t3);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t4;
    			append_dev(main, t4);
    			mount_component(pagination, main, null);
    			append_dev(main, t5);
    			append_dev(main, div);
    			mount_component(button0, div, null);
    			append_dev(div, t6);
    			mount_component(button1, div, null);
    			append_dev(main, t7);
    			append_dev(main, h5);
    			append_dev(h5, strong);
    			append_dev(main, t9);
    			mount_component(table, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*countries_adrescbar*/ 32 && promise !== (promise = /*countries_adrescbar*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const pagination_changes = {};

    			if (dirty[0] & /*moreData, currentPage*/ 6 | dirty[1] & /*$$scope*/ 1) {
    				pagination_changes.$$scope = { dirty, ctx };
    			}

    			pagination.$set(pagination_changes);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const table_changes = {};

    			if (dirty[0] & /*searchCountry, searchYear*/ 24 | dirty[1] & /*$$scope*/ 1) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(pagination.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(pagination.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(pagination);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let countries_adrescbar = [];

    	let newCountry = {
    		country: "",
    		year: "",
    		ranking: "",
    		index: "",
    		var: ""
    	};

    	let numCountries = 10;
    	let offset = 0;
    	let currentPage = 1;
    	let moreData = true;
    	let searchCountry = "";
    	let searchYear = "";
    	let country = [];
    	let year = [];
    	onMount(getCountries_adrescbar);

    	async function getCountries_adrescbar() {
    		const res = await fetch("/api/v2/global_competitiveness_index?offset=" + numCountries * offset + "&limit=" + numCountries);
    		const resNext = await fetch("/api/v2/global_competitiveness_index?offset=" + numCountries * (offset + 1) + "&limit=" + numCountries);

    		if (res.ok && resNext.ok) {
    			const json = await res.json();
    			const jsonNext = await resNext.json();
    			$$invalidate(5, countries_adrescbar = json);

    			if (jsonNext.length == 0) {
    				$$invalidate(2, moreData = false);
    			} else {
    				$$invalidate(2, moreData = true);
    			}

    			console.log("Received " + countries_adrescbar.length + " countries_adrescbar.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	function incrementOffset(val) {
    		offset += val;
    		$$invalidate(1, currentPage += val);
    		getCountries_adrescbar();
    	}

    	async function search(country, year) {
    		var url = "/api/v2/global_competitiveness_index";

    		if (country != "" && year != "") {
    			url = url + "?year=" + year + "&country=" + country;
    		} else if (country != "" && year == "") {
    			url = url + "?country=" + country;
    		} else if (country == "" && year != "") {
    			url = url + "?year=" + year;
    		}

    		const res = await fetch(url);

    		if (res.ok) {
    			const json = await res.json();
    			$$invalidate(5, countries_adrescbar = json);

    			if (country == "" && year == "") {
    				window.alert("Introduce datos para realizar la busqueda");
    			} else if (countries_adrescbar.length > 0) {
    				window.alert("Datos encontrados");
    			} else {
    				window.alert("No hay datos que cumplan la busqueda");
    			}
    		}
    	}

    	async function insertCountries_adrescbar() {
    		const res = await fetch("/api/v2/global_competitiveness_index", {
    			method: "POST",
    			body: JSON.stringify(newCountry),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			if (res.status == 201) {
    				window.alert("Datos añadidos");
    			} else if (res.status == 409) {
    				window.alert("Estos elementos ya estan registrados");
    			}

    			getCountries_adrescbar();
    		});
    	}

    	async function deleteCountries_adrescbar(country) {
    		const res = await fetch("/api/v2/global_competitiveness_index/" + country, { method: "DELETE" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("Dato borrado");
    			} else if (res.status == 404) {
    				window.alert("No existen ese dato");
    			}

    			getCountries_adrescbar();
    		});
    	}

    	async function deleteAllCountries_adrescbar() {
    		const res = await fetch("/api/v2/global_competitiveness_index/", { method: "DELETE" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("Datos borrados");
    			} else if (res.status == 405) {
    				window.alert("No existen datos que borrar");
    			}

    			getCountries_adrescbar();
    		});
    	}

    	async function loadInitialData() {
    		const res = await fetch("/api/v2/global_competitiveness_index/loadInitialData", { method: "GET" }).then(function (res) {
    			if (res.status == 409) {
    				window.alert("Datos ya registrados");
    			} else {
    				window.alert("Datos añadidos");
    			}

    			getCountries_adrescbar();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$d.warn(`<Countries_adrescbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Countries_adrescbar", $$slots, []);

    	function input0_input_handler() {
    		newCountry.country = this.value;
    		$$invalidate(0, newCountry);
    	}

    	function input1_input_handler() {
    		newCountry.year = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input2_input_handler() {
    		newCountry.ranking = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input3_input_handler() {
    		newCountry.index = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input4_input_handler() {
    		newCountry.var = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	const click_handler = () => incrementOffset(-1);
    	const click_handler_1 = () => incrementOffset(-1);
    	const click_handler_2 = () => incrementOffset(1);
    	const click_handler_3 = () => incrementOffset(1);

    	function input_value_binding(value) {
    		searchCountry = value;
    		$$invalidate(3, searchCountry);
    	}

    	function input_value_binding_1(value) {
    		searchYear = value;
    		$$invalidate(4, searchYear);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Table,
    		Button,
    		Pagination,
    		PaginationItem,
    		PaginationLink,
    		Input,
    		Label,
    		FormGroup,
    		countries_adrescbar,
    		newCountry,
    		numCountries,
    		offset,
    		currentPage,
    		moreData,
    		searchCountry,
    		searchYear,
    		country,
    		year,
    		getCountries_adrescbar,
    		incrementOffset,
    		search,
    		insertCountries_adrescbar,
    		deleteCountries_adrescbar,
    		deleteAllCountries_adrescbar,
    		loadInitialData
    	});

    	$$self.$inject_state = $$props => {
    		if ("countries_adrescbar" in $$props) $$invalidate(5, countries_adrescbar = $$props.countries_adrescbar);
    		if ("newCountry" in $$props) $$invalidate(0, newCountry = $$props.newCountry);
    		if ("numCountries" in $$props) numCountries = $$props.numCountries;
    		if ("offset" in $$props) offset = $$props.offset;
    		if ("currentPage" in $$props) $$invalidate(1, currentPage = $$props.currentPage);
    		if ("moreData" in $$props) $$invalidate(2, moreData = $$props.moreData);
    		if ("searchCountry" in $$props) $$invalidate(3, searchCountry = $$props.searchCountry);
    		if ("searchYear" in $$props) $$invalidate(4, searchYear = $$props.searchYear);
    		if ("country" in $$props) country = $$props.country;
    		if ("year" in $$props) year = $$props.year;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newCountry,
    		currentPage,
    		moreData,
    		searchCountry,
    		searchYear,
    		countries_adrescbar,
    		incrementOffset,
    		search,
    		insertCountries_adrescbar,
    		deleteCountries_adrescbar,
    		deleteAllCountries_adrescbar,
    		loadInitialData,
    		offset,
    		numCountries,
    		country,
    		year,
    		getCountries_adrescbar,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input_value_binding,
    		input_value_binding_1
    	];
    }

    class Countries_adrescbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Countries_adrescbar",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src\front\global_competitiveness_indexAPI\editCountry.svelte generated by Svelte v3.20.1 */

    const { console: console_1$e } = globals;
    const file$o = "src\\front\\global_competitiveness_indexAPI\\editCountry.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (83:4) {:then countries}
    function create_then_block$3(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedVar, updatedIndex, updatedRanking, params*/ 8207) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(83:4) {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (102:25) <Button outline  color="success" on:click={updateCountry}>
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(102:25) <Button outline  color=\\\"success\\\" on:click={updateCountry}>",
    		ctx
    	});

    	return block;
    }

    // (84:8) <Table bordered>
    function create_default_slot_1$3(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t12_value = /*params*/ ctx[0].country + "";
    	let t12;
    	let t13;
    	let td1;
    	let t14_value = /*params*/ ctx[0].year + "";
    	let t14;
    	let t15;
    	let td2;
    	let input0;
    	let input0_updating = false;
    	let t16;
    	let td3;
    	let input1;
    	let input1_updating = false;
    	let t17;
    	let td4;
    	let input2;
    	let input2_updating = false;
    	let t18;
    	let td5;
    	let current;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[10].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[11].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[12].call(input2);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updateCountry*/ ctx[6]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "País";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Posición";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Índice";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Variación";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Acción";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td1 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td2 = element("td");
    			input0 = element("input");
    			t16 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t17 = space();
    			td4 = element("td");
    			input2 = element("input");
    			t18 = space();
    			td5 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$o, 86, 20, 2533);
    			add_location(th1, file$o, 87, 17, 2565);
    			add_location(th2, file$o, 88, 17, 2596);
    			add_location(th3, file$o, 89, 17, 2632);
    			add_location(th4, file$o, 90, 5, 2654);
    			add_location(th5, file$o, 91, 5, 2679);
    			set_style(tr0, "color", "#00680D");
    			add_location(tr0, file$o, 85, 16, 2485);
    			add_location(thead, file$o, 84, 12, 2460);
    			add_location(td0, file$o, 96, 20, 2804);
    			add_location(td1, file$o, 97, 5, 2836);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$o, 98, 24, 2884);
    			add_location(td2, file$o, 98, 20, 2880);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$o, 99, 24, 2966);
    			add_location(td3, file$o, 99, 20, 2962);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file$o, 100, 9, 3031);
    			add_location(td4, file$o, 100, 5, 3027);
    			add_location(td5, file$o, 101, 20, 3105);
    			add_location(tr1, file$o, 95, 16, 2778);
    			add_location(tbody, file$o, 94, 12, 2753);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t12);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, t14);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, input0);
    			set_input_value(input0, /*updatedRanking*/ ctx[1]);
    			append_dev(tr1, t16);
    			append_dev(tr1, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*updatedIndex*/ ctx[2]);
    			append_dev(tr1, t17);
    			append_dev(tr1, td4);
    			append_dev(td4, input2);
    			set_input_value(input2, /*updatedVar*/ ctx[3]);
    			append_dev(tr1, t18);
    			append_dev(tr1, td5);
    			mount_component(button, td5, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*params*/ 1) && t12_value !== (t12_value = /*params*/ ctx[0].country + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*params*/ 1) && t14_value !== (t14_value = /*params*/ ctx[0].year + "")) set_data_dev(t14, t14_value);

    			if (!input0_updating && dirty & /*updatedRanking*/ 2) {
    				set_input_value(input0, /*updatedRanking*/ ctx[1]);
    			}

    			input0_updating = false;

    			if (!input1_updating && dirty & /*updatedIndex*/ 4) {
    				set_input_value(input1, /*updatedIndex*/ ctx[2]);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty & /*updatedVar*/ 8) {
    				set_input_value(input2, /*updatedVar*/ ctx[3]);
    			}

    			input2_updating = false;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(84:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (81:22)           Loading countries...      {:then countries}
    function create_pending_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading countries...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(81:22)           Loading countries...      {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (107:4) {#if SuccessMsg}
    function create_if_block$9(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(/*SuccessMsg*/ ctx[4]);
    			t1 = text(". País actualizado con éxito");
    			set_style(p, "color", "green");
    			add_location(p, file$o, 107, 8, 3297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*SuccessMsg*/ 16) set_data_dev(t0, /*SuccessMsg*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(107:4) {#if SuccessMsg}",
    		ctx
    	});

    	return block;
    }

    // (110:4) <Button outline color="danger" on:click="{pop}">
    function create_default_slot$c(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(110:4) <Button outline color=\\\"danger\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let body;
    	let t0;
    	let main;
    	let h5;
    	let t1;
    	let strong0;
    	let t2_value = /*params*/ ctx[0].country + "";
    	let t2;
    	let t3;
    	let strong1;
    	let t4_value = /*params*/ ctx[0].year + "";
    	let t4;
    	let t5;
    	let promise;
    	let t6;
    	let t7;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*countries*/ ctx[5], info);
    	let if_block = /*SuccessMsg*/ ctx[4] && create_if_block$9(ctx);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			h5 = element("h5");
    			t1 = text("Editando datos de ");
    			strong0 = element("strong");
    			t2 = text(t2_value);
    			t3 = text(" en el año ");
    			strong1 = element("strong");
    			t4 = text(t4_value);
    			t5 = space();
    			info.block.c();
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$o, 76, 0, 2179);
    			add_location(strong0, file$o, 79, 26, 2264);
    			add_location(strong1, file$o, 79, 70, 2308);
    			add_location(h5, file$o, 79, 4, 2242);
    			add_location(main, file$o, 78, 0, 2230);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h5);
    			append_dev(h5, t1);
    			append_dev(h5, strong0);
    			append_dev(strong0, t2);
    			append_dev(h5, t3);
    			append_dev(h5, strong1);
    			append_dev(strong1, t4);
    			append_dev(main, t5);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t6;
    			append_dev(main, t6);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t7);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t2_value !== (t2_value = /*params*/ ctx[0].country + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*params*/ 1) && t4_value !== (t4_value = /*params*/ ctx[0].year + "")) set_data_dev(t4, t4_value);
    			info.ctx = ctx;

    			if (dirty & /*countries*/ 32 && promise !== (promise = /*countries*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*SuccessMsg*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(main, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let countries = {};
    	let updatedCountry = "";
    	let updatedYear = 0;
    	let updatedRanking = 0;
    	let updatedIndex = 0;
    	let updatedVar = 0;
    	let SuccessMsg = "";
    	onMount(getCountries_adrescbar);

    	async function getCountries_adrescbar() {
    		const res = await fetch("/api/v2/global_competitiveness_index/" + params.country + "/" + params.year);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(5, countries = json);
    			updatedCountry = params.country;
    			updatedYear = parseInt(params.year);
    			$$invalidate(1, updatedRanking = countries.ranking);
    			$$invalidate(2, updatedIndex = countries.index);
    			$$invalidate(3, updatedVar = countries.var);
    			console.log("Received countries.");
    		} else if (res.status == 404) {
    			window.alert("El dato: " + params.country + " " + params.year + " no existe");
    		}
    	}

    	async function updateCountry() {
    		console.log("Updating countries..." + JSON.stringify(params.countriesCountry));

    		const res = await fetch("/api/v2/global_competitiveness_index/" + params.country + "/" + params.year, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: params.country,
    				year: parseInt(params.year),
    				ranking: updatedRanking,
    				index: updatedIndex,
    				var: updatedVar
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getCountries_adrescbar();

    			if (res.ok) {
    				$$invalidate(4, SuccessMsg = res.status + ": " + res.statusText);
    				console.log("OK!" + SuccessMsg);
    			} else if (res.status == 400) {
    				window.alert("Datos no son válidos");
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$e.warn(`<EditCountry> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditCountry", $$slots, []);

    	function input0_input_handler() {
    		updatedRanking = to_number(this.value);
    		$$invalidate(1, updatedRanking);
    	}

    	function input1_input_handler() {
    		updatedIndex = to_number(this.value);
    		$$invalidate(2, updatedIndex);
    	}

    	function input2_input_handler() {
    		updatedVar = to_number(this.value);
    		$$invalidate(3, updatedVar);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		params,
    		countries,
    		updatedCountry,
    		updatedYear,
    		updatedRanking,
    		updatedIndex,
    		updatedVar,
    		SuccessMsg,
    		getCountries_adrescbar,
    		updateCountry
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("countries" in $$props) $$invalidate(5, countries = $$props.countries);
    		if ("updatedCountry" in $$props) updatedCountry = $$props.updatedCountry;
    		if ("updatedYear" in $$props) updatedYear = $$props.updatedYear;
    		if ("updatedRanking" in $$props) $$invalidate(1, updatedRanking = $$props.updatedRanking);
    		if ("updatedIndex" in $$props) $$invalidate(2, updatedIndex = $$props.updatedIndex);
    		if ("updatedVar" in $$props) $$invalidate(3, updatedVar = $$props.updatedVar);
    		if ("SuccessMsg" in $$props) $$invalidate(4, SuccessMsg = $$props.SuccessMsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		updatedRanking,
    		updatedIndex,
    		updatedVar,
    		SuccessMsg,
    		countries,
    		updateCountry,
    		updatedCountry,
    		updatedYear,
    		getCountries_adrescbar,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class EditCountry$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditCountry",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get params() {
    		throw new Error("<EditCountry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditCountry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\global_competitiveness_indexAPI\Graph_adrescbar.svelte generated by Svelte v3.20.1 */

    const file$p = "src\\front\\global_competitiveness_indexAPI\\Graph_adrescbar.svelte";

    function create_fragment$q(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let t0;
    	let body;
    	let t1;
    	let main;
    	let figure;
    	let div;
    	let t2;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			t0 = space();
    			body = element("body");
    			t1 = space();
    			main = element("main");
    			figure = element("figure");
    			div = element("div");
    			t2 = space();
    			p = element("p");
    			p.textContent = "En el gráfico podemos observar el índice de competitividad entre paises europeos";
    			if (script0.src !== (script0_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$p, 56, 1, 1406);
    			if (script1.src !== (script1_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$p, 57, 1, 1496);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/modules/export-data.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$p, 58, 1, 1593);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/modules/accessibility.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$p, 59, 1, 1692);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$p, 63, 0, 1813);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-aca1wo");
    			add_location(div, file$p, 69, 2, 1915);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$p, 70, 2, 1945);
    			attr_dev(figure, "class", "highcharts-figure svelte-aca1wo");
    			add_location(figure, file$p, 68, 1, 1877);
    			add_location(main, file$p, 66, 0, 1866);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, body, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div);
    			append_dev(figure, t2);
    			append_dev(figure, p);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(script0, "load", loadGraph$7, false, false, false),
    				listen_dev(script1, "load", loadGraph$7, false, false, false),
    				listen_dev(script2, "load", loadGraph$7, false, false, false),
    				listen_dev(script3, "load", loadGraph$7, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$7() {
    	let MyData = [];
    	let MyDataGraph = [];
    	const resData = await fetch("/api/v2/global_competitiveness_index");
    	MyData = await resData.json();

    	MyData.forEach(x => {
    		MyDataGraph.push({
    			name: x.country + " (" + x.year + ") ",
    			data: [parseInt(x.ranking), parseFloat(x.index), parseFloat(x.var)]
    		});
    	});

    	Highcharts.chart("container", {
    		chart: { type: "column" },
    		title: { text: "Índice de competitividad global" },
    		xAxis: {
    			categories: [
    				"Ranking de Competitividad Global",
    				"Indice de Competitividad Global",
    				"Variacion"
    			],
    			crosshair: true
    		},
    		yAxis: {
    			min: -2,
    			max: 85,
    			title: { text: "Valor" }
    		},
    		tooltip: {
    			headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
    			pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" + "<td style=\"padding:0\"><b>{point.y:.1f} </b></td></tr>",
    			footerFormat: "</table>",
    			shared: true,
    			useHTML: true
    		},
    		plotOptions: {
    			column: { pointPadding: 0.1, borderWidth: 0 }
    		},
    		series: MyDataGraph
    	});
    }

    function instance$q($$self, $$props, $$invalidate) {
    	loadGraph$7();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Graph_adrescbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Graph_adrescbar", $$slots, []);
    	$$self.$capture_state = () => ({ loadGraph: loadGraph$7 });
    	return [];
    }

    class Graph_adrescbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graph_adrescbar",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src\front\global_competitiveness_indexAPI\Awesome_Graph.svelte generated by Svelte v3.20.1 */
    const file$q = "src\\front\\global_competitiveness_indexAPI\\Awesome_Graph.svelte";

    function create_fragment$r(ctx) {
    	let body;
    	let t0;
    	let div0;
    	let canvas;
    	let t1;
    	let main;
    	let div1;

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			div0 = element("div");
    			canvas = element("canvas");
    			t1 = space();
    			main = element("main");
    			div1 = element("div");
    			div1.textContent = "Aqui vemos la posición de los países en el ranking global. Menor tamaño equivale a mejor posición en el ranking";
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$q, 0, 0, 0);
    			attr_dev(canvas, "id", "cvs");
    			attr_dev(canvas, "width", "800");
    			attr_dev(canvas, "height", "278");
    			set_style(canvas, "border", "1px solid #eee");
    			add_location(canvas, file$q, 3, 0, 75);
    			attr_dev(div0, "align", "center");
    			add_location(div0, file$q, 2, 0, 51);
    			attr_dev(div1, "align", "center");
    			attr_dev(div1, "id", "cvs");
    			add_location(div1, file$q, 47, 4, 1416);
    			add_location(main, file$q, 46, 0, 1404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, canvas);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$8() {
    	let MyData = [];
    	let Mylabels = [];
    	let Myranking = [];
    	const resData = await fetch("/api/v2/global_competitiveness_index");
    	MyData = await resData.json();

    	MyData.forEach(x => {
    		Mylabels.push(x.country);
    	});

    	MyData.forEach(x => {
    		Myranking.push(x.ranking);
    	});

    	var labels = Mylabels;

    	new RGraph.Pie({
    			id: "cvs",
    			data: Myranking,
    			options: {
    				shadow: true,
    				shadowOffsetx: 0,
    				shadowOffsety: 5,
    				shadowColor: "#aaa",
    				variant: "donut3d",
    				labels,
    				labelsSticksLength: 15,
    				labelsSticksLinewidth: 2,
    				textAccessible: false,
    				colorsStroke: "transparent"
    			}
    		}).draw().responsive([
    		{
    			maxWidth: null,
    			width: 800,
    			height: 278,
    			options: {
    				radius: 100,
    				labelsList: true,
    				labels,
    				title: "",
    				tooltips: null
    			}
    		}
    	]);
    }

    function instance$r($$self, $$props, $$invalidate) {
    	onMount(loadGraph$8);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Awesome_Graph> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Awesome_Graph", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, loadGraph: loadGraph$8 });
    	return [];
    }

    class Awesome_Graph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Awesome_Graph",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\22.svelte generated by Svelte v3.20.1 */
    const file$r = "src\\front\\Integrations\\global_competitiveness_index\\22.svelte";

    // (90:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$d(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(90:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$r, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$r, 86, 8, 2797);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$r, 85, 4, 2753);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$r, 88, 4, 2844);
    			add_location(main, file$r, 83, 0, 2739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$9() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");
    	const resDataSwim = await fetch("https://sos1920-22.herokuapp.com/api/v1/swim-stats");
    	let MyData = await resMyData.json();
    	let SwimData = await resDataSwim.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let swin_stats = SwimData.map(x => {
    		let res = {
    			name: x.country + " swimmer posicion ",
    			value: x["position"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{ name: "Nadadores", data: swin_stats }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de la API del grupo 22 de nadadores y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$s($$self, $$props, $$invalidate) {
    	loadGraph$9();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_22> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_22", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$9 });
    	return [];
    }

    class _22 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_22",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\10.svelte generated by Svelte v3.20.1 */
    const file$s = "src\\front\\Integrations\\global_competitiveness_index\\10.svelte";

    // (89:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$e(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(89:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$s, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$s, 85, 8, 2786);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$s, 84, 4, 2742);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$s, 87, 4, 2833);
    			add_location(main, file$s, 82, 0, 2728);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$a() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");
    	const resDataGlobal_divorces = await fetch("/api/v2/global-divorces");
    	let MyData = await resMyData.json();
    	let DivorcesData = await resDataGlobal_divorces.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let global_divorces = DivorcesData.map(x => {
    		let res = { name: x.country, value: x["divorce"] };
    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{ name: "Divorcios", data: global_divorces }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "50%" },
    		title: {
    			text: "Aqui mostramos la integración de la API del grupo 10 de divorcios y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$t($$self, $$props, $$invalidate) {
    	loadGraph$a();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_10> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_10", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$a });
    	return [];
    }

    class _10 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_10",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\coins.svelte generated by Svelte v3.20.1 */
    const file$t = "src\\front\\Integrations\\global_competitiveness_index\\coins.svelte";

    // (97:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$f(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$f.name,
    		type: "slot",
    		source: "(97:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$f] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$t, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$t, 93, 8, 2954);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$t, 92, 4, 2910);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$t, 95, 4, 3001);
    			add_location(main, file$t, 90, 0, 2896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$b() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataCoin = await fetch("https://mineable-coins.p.rapidapi.com/coins", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "mineable-coins.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed"
    		}
    	});

    	let MyData = await resMyData.json();
    	let CoinData = await resDataCoin.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Coin = CoinData.map(x => {
    		let res = {
    			name: x.name,
    			value: parseInt(x["price"])
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{ name: "Coin", data: Coin }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API de coins y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$u($$self, $$props, $$invalidate) {
    	loadGraph$b();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Coins> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Coins", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$b });
    	return [];
    }

    class Coins extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Coins",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\Hearthstone.svelte generated by Svelte v3.20.1 */
    const file$u = "src\\front\\Integrations\\global_competitiveness_index\\Hearthstone.svelte";

    // (97:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$g(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$g.name,
    		type: "slot",
    		source: "(97:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$g] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$u, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$u, 93, 8, 3059);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$u, 92, 4, 3015);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$u, 95, 4, 3106);
    			add_location(main, file$u, 90, 0, 3001);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$c() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataHearthstone = await fetch("https://omgvamp-hearthstone-v1.p.rapidapi.com/cards/classes/Priest?cost=1", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "omgvamp-hearthstone-v1.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed"
    		}
    	});

    	let MyData = await resMyData.json();
    	let HearthstoneData = await resDataHearthstone.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Hearthstone = HearthstoneData.map(x => {
    		let res = {
    			name: x.name,
    			value: parseInt(x["health"])
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{
    			name: "Vida de las criaturas",
    			data: Hearthstone
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API de Hearthstone y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$v($$self, $$props, $$invalidate) {
    	loadGraph$c();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hearthstone> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hearthstone", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$c });
    	return [];
    }

    class Hearthstone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hearthstone",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\City.svelte generated by Svelte v3.20.1 */
    const file$v = "src\\front\\Integrations\\global_competitiveness_index\\City.svelte";

    // (99:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$h(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$h.name,
    		type: "slot",
    		source: "(99:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$h] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$v, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$v, 95, 8, 3088);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$v, 94, 4, 3044);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$v, 97, 4, 3135);
    			add_location(main, file$v, 92, 0, 3030);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$d() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataCity = await fetch("https://geocodeapi.p.rapidapi.com/GetNearestCities?latitude=53.55196&longitude=9.98558&range=0", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "geocodeapi.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed"
    		}
    	});

    	let MyData = await resMyData.json();
    	let CityData = await resDataCity.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let City = CityData.map(x => {
    		let res = { name: x.City, value: x["Population"] };
    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{
    			name: "Población algunas ciudades Alemanas",
    			data: City
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API que nos muestra ciudades cerca de las coordenadas que le pasamos y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$w($$self, $$props, $$invalidate) {
    	loadGraph$d();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<City> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("City", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$d });
    	return [];
    }

    class City extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "City",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\proxy_latency.svelte generated by Svelte v3.20.1 */
    const file$w = "src\\front\\Integrations\\global_competitiveness_index\\proxy_latency.svelte";

    // (98:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$i(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$i.name,
    		type: "slot",
    		source: "(98:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$i] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$w, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$w, 94, 8, 3068);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$w, 93, 4, 3024);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$w, 96, 4, 3115);
    			add_location(main, file$w, 91, 0, 3010);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$e() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataLatency = await fetch("https://proxypage1.p.rapidapi.com/v1/tier1?limit=100&country=US&type=HTTP", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "proxypage1.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed",
    			"content-type": "application/x-www-form-urlencoded"
    		}
    	});

    	let MyData = await resMyData.json();
    	let LatencyData = await resDataLatency.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Latency = LatencyData.map(x => {
    		let res = { name: x.ip, value: x.latency };
    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{ name: "IPs", data: Latency }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API que muestra la latencia por IPs y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$x($$self, $$props, $$invalidate) {
    	loadGraph$e();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Proxy_latency> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Proxy_latency", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$e });
    	return [];
    }

    class Proxy_latency extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Proxy_latency",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\soccer_games.svelte generated by Svelte v3.20.1 */
    const file$x = "src\\front\\Integrations\\global_competitiveness_index\\soccer_games.svelte";

    // (98:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$j(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$j.name,
    		type: "slot",
    		source: "(98:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$j] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$x, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$x, 94, 8, 3085);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$x, 93, 4, 3041);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$x, 96, 4, 3132);
    			add_location(main, file$x, 91, 0, 3027);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$f() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataSoccer = await fetch("https://montanaflynn-fifa-world-cup.p.rapidapi.com/games", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "montanaflynn-fifa-world-cup.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed",
    			"accepts": "json"
    		}
    	});

    	let MyData = await resMyData.json();
    	let SoccerData = await resDataSoccer.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Soccer = SoccerData.map(x => {
    		let res = {
    			name: x.team1_id + " vs " + x.team2_id,
    			value: x.id
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{
    			name: "Partidos del Mundial de Fútbol",
    			data: Soccer
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API que muestra partidos del Mundial de Fútbol y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$y($$self, $$props, $$invalidate) {
    	loadGraph$f();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Soccer_games> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Soccer_games", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$f });
    	return [];
    }

    class Soccer_games extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Soccer_games",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\Investors.svelte generated by Svelte v3.20.1 */
    const file$y = "src\\front\\Integrations\\global_competitiveness_index\\Investors.svelte";

    // (97:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$k(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$k.name,
    		type: "slot",
    		source: "(97:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$z(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$k] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$y, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$y, 93, 8, 3044);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$y, 92, 4, 3000);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$y, 95, 4, 3091);
    			add_location(main, file$y, 90, 0, 2986);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$g() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataInvestors = await fetch("https://investors-exchange-iex-trading.p.rapidapi.com/stock/msft/effective-spread", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "investors-exchange-iex-trading.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed"
    		}
    	});

    	let MyData = await resMyData.json();
    	let InvestorsData = await resDataInvestors.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Investors = InvestorsData.map(x => {
    		let res = { name: x.venueName, value: x.volume };
    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{ name: "Inversores", data: Investors }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API de inversiones y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$z($$self, $$props, $$invalidate) {
    	loadGraph$g();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Investors> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Investors", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$g });
    	return [];
    }

    class Investors extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Investors",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\name.svelte generated by Svelte v3.20.1 */
    const file$z = "src\\front\\Integrations\\global_competitiveness_index\\name.svelte";

    // (97:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$l(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$l.name,
    		type: "slot",
    		source: "(97:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$l] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$z, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$z, 93, 8, 2967);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$z, 92, 4, 2923);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$z, 95, 4, 3014);
    			add_location(main, file$z, 90, 0, 2909);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$h() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataName = await fetch("https://stopwords.p.rapidapi.com/categories", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "stopwords.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed"
    		}
    	});

    	let MyData = await resMyData.json();
    	let NameData = await resDataName.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Name = NameData.map(x => {
    		let res = {
    			name: x.category_name,
    			value: parseInt(x.words)
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{ name: "Nombres", data: Name }
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API tipos de nombres y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$A($$self, $$props, $$invalidate) {
    	loadGraph$h();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Name> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Name", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$h });
    	return [];
    }

    class Name extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Name",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src\front\Integrations\global_competitiveness_index\Post_code.svelte generated by Svelte v3.20.1 */
    const file$A = "src\\front\\Integrations\\global_competitiveness_index\\Post_code.svelte";

    // (97:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$m(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$m.name,
    		type: "slot",
    		source: "(97:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$B(ctx) {
    	let body;
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$m] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			body = element("body");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			set_style(body, "background-color", "#082EFF");
    			add_location(body, file$A, 0, 0, 0);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$A, 93, 8, 3081);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$A, 92, 4, 3037);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$A, 95, 4, 3128);
    			add_location(main, file$A, 90, 0, 3023);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$i() {
    	const resMyData = await fetch("/api/v2/global_competitiveness_index");

    	const resDataPost = await fetch("https://allies-postcoder.p.rapidapi.com/PCW45-12345-12345-1234X/addressgeo/uk/NR14%25207PZ?lines=3", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "allies-postcoder.p.rapidapi.com",
    			"x-rapidapi-key": "fe78d643b3msh07af37f2e92bccdp1ca7adjsn9ea37f0056ed"
    		}
    	});

    	let MyData = await resMyData.json();
    	let PostData = await resDataPost.json();

    	let global_competitiveness_index = MyData.map(x => {
    		let res = { name: x.country, value: x["ranking"] };
    		return res;
    	});

    	let Post = PostData.map(x => {
    		let res = {
    			name: x.addressline1,
    			value: parseInt(x.grideasting)
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Índice de competitividad Global",
    			data: global_competitiveness_index
    		},
    		{
    			name: "Direccion de codigo postal",
    			data: Post
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Aqui mostramos la integración de una API que muestra la direccion de codigos postales y lo comparamos con el Índice de Competitividad Global"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "30%",
    				maxSize: "120%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$B($$self, $$props, $$invalidate) {
    	loadGraph$i();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Post_code> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Post_code", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$i });
    	return [];
    }

    class Post_code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Post_code",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src\front\countries_for_equality_statsAPI\countries_for_equality_stats.svelte generated by Svelte v3.20.1 */

    const { console: console_1$f } = globals;
    const file$B = "src\\front\\countries_for_equality_statsAPI\\countries_for_equality_stats.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$4.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (174:4) {:then countries}
    function create_then_block$4(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_19$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty[0] & /*countries, newCountry*/ 33 | dirty[1] & /*$$scope*/ 4) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(174:4) {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (193:25) <Button outline  color="primary" on:click={insertCountry}>
    function create_default_slot_22$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Añadir");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22$2.name,
    		type: "slot",
    		source: "(193:25) <Button outline  color=\\\"primary\\\" on:click={insertCountry}>",
    		ctx
    	});

    	return block;
    }

    // (204:28) <Button outline color="danger" on:click="{deleteCountry(c.country,c.year)}">
    function create_default_slot_21$2(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Eliminar");
    			attr_dev(i, "class", "fa fa-trash");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$B, 203, 104, 6380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21$2.name,
    		type: "slot",
    		source: "(204:28) <Button outline color=\\\"danger\\\" on:click=\\\"{deleteCountry(c.country,c.year)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (205:6) <Button outline color="success" href="#/countries_for_equality_stats/{c.country}/{c.year}">
    function create_default_slot_20$2(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Modificar");
    			attr_dev(i, "class", "fa fa-trash");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$B, 204, 97, 6543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20$2.name,
    		type: "slot",
    		source: "(205:6) <Button outline color=\\\"success\\\" href=\\\"#/countries_for_equality_stats/{c.country}/{c.year}\\\">",
    		ctx
    	});

    	return block;
    }

    // (195:16) {#each countries as c}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = /*c*/ ctx[30].country + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let td1;
    	let t2_value = /*c*/ ctx[30].year + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*c*/ ctx[30].global_peace_index + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*c*/ ctx[30].global_peace_ranking + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*c*/ ctx[30].var + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;
    	let t11;
    	let current;

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_21$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*deleteCountry*/ ctx[8](/*c*/ ctx[30].country, /*c*/ ctx[30].year))) /*deleteCountry*/ ctx[8](/*c*/ ctx[30].country, /*c*/ ctx[30].year).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				href: "#/countries_for_equality_stats/" + /*c*/ ctx[30].country + "/" + /*c*/ ctx[30].year,
    				$$slots: { default: [create_default_slot_20$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			create_component(button0.$$.fragment);
    			t10 = space();
    			create_component(button1.$$.fragment);
    			t11 = space();
    			attr_dev(a, "href", a_href_value = "#/countries_for_equality_stats/" + /*c*/ ctx[30].country + "/" + /*c*/ ctx[30].year);
    			add_location(a, file$B, 197, 25, 6001);
    			add_location(td0, file$B, 196, 6, 5970);
    			add_location(td1, file$B, 199, 24, 6117);
    			add_location(td2, file$B, 200, 24, 6160);
    			add_location(td3, file$B, 201, 6, 6199);
    			add_location(td4, file$B, 202, 24, 6258);
    			add_location(td5, file$B, 203, 24, 6300);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$B, 195, 20, 5958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			mount_component(button0, td5, null);
    			append_dev(td5, t10);
    			mount_component(button1, td5, null);
    			append_dev(tr, t11);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*countries*/ 32) && t0_value !== (t0_value = /*c*/ ctx[30].country + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*countries*/ 32 && a_href_value !== (a_href_value = "#/countries_for_equality_stats/" + /*c*/ ctx[30].country + "/" + /*c*/ ctx[30].year)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty[0] & /*countries*/ 32) && t2_value !== (t2_value = /*c*/ ctx[30].year + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*countries*/ 32) && t4_value !== (t4_value = /*c*/ ctx[30].global_peace_index + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*countries*/ 32) && t6_value !== (t6_value = /*c*/ ctx[30].global_peace_ranking + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*countries*/ 32) && t8_value !== (t8_value = /*c*/ ctx[30].var + "")) set_data_dev(t8, t8_value);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty[0] & /*countries*/ 32) button1_changes.href = "#/countries_for_equality_stats/" + /*c*/ ctx[30].country + "/" + /*c*/ ctx[30].year;

    			if (dirty[1] & /*$$scope*/ 4) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(195:16) {#each countries as c}",
    		ctx
    	});

    	return block;
    }

    // (175:8) <Table bordered>
    function create_default_slot_19$2(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t12;
    	let td1;
    	let input1;
    	let input1_updating = false;
    	let t13;
    	let td2;
    	let input2;
    	let input2_updating = false;
    	let t14;
    	let td3;
    	let input3;
    	let input3_updating = false;
    	let t15;
    	let td4;
    	let input4;
    	let input4_updating = false;
    	let t16;
    	let td5;
    	let t17;
    	let current;
    	let dispose;

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[20].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[21].call(input2);
    	}

    	function input3_input_handler() {
    		input3_updating = true;
    		/*input3_input_handler*/ ctx[22].call(input3);
    	}

    	function input4_input_handler() {
    		input4_updating = true;
    		/*input4_input_handler*/ ctx[23].call(input4);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_22$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*insertCountry*/ ctx[7]);
    	let each_value = /*countries*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Pais";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Ranking de Paz";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Tasa de Paz";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Variación";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Acciones";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t12 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t13 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t14 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t15 = space();
    			td4 = element("td");
    			input4 = element("input");
    			t16 = space();
    			td5 = element("td");
    			create_component(button.$$.fragment);
    			t17 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$B, 177, 20, 5095);
    			add_location(th1, file$B, 178, 17, 5127);
    			add_location(th2, file$B, 179, 17, 5158);
    			add_location(th3, file$B, 180, 5, 5188);
    			add_location(th4, file$B, 181, 5, 5215);
    			add_location(th5, file$B, 182, 5, 5240);
    			attr_dev(tr0, "class", "svelte-1a08fx9");
    			add_location(tr0, file$B, 176, 16, 5069);
    			set_style(thead, "color", "#00680D");
    			add_location(thead, file$B, 175, 12, 5022);
    			add_location(input0, file$B, 187, 24, 5371);
    			add_location(td0, file$B, 187, 20, 5367);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$B, 188, 24, 5443);
    			add_location(td1, file$B, 188, 20, 5439);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file$B, 189, 24, 5526);
    			add_location(td2, file$B, 189, 20, 5522);
    			attr_dev(input3, "type", "number");
    			add_location(input3, file$B, 190, 24, 5623);
    			add_location(td3, file$B, 190, 20, 5619);
    			attr_dev(input4, "type", "number");
    			add_location(input4, file$B, 191, 24, 5722);
    			add_location(td4, file$B, 191, 20, 5718);
    			add_location(td5, file$B, 192, 20, 5800);
    			attr_dev(tr1, "class", "svelte-1a08fx9");
    			add_location(tr1, file$B, 186, 16, 5341);
    			add_location(tbody, file$B, 185, 12, 5316);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*newCountry*/ ctx[0].country);
    			append_dev(tr1, t12);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*newCountry*/ ctx[0].year);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*newCountry*/ ctx[0].global_peace_index);
    			append_dev(tr1, t14);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*newCountry*/ ctx[0].global_peace_ranking);
    			append_dev(tr1, t15);
    			append_dev(tr1, td4);
    			append_dev(td4, input4);
    			set_input_value(input4, /*newCountry*/ ctx[0].var);
    			append_dev(tr1, t16);
    			append_dev(tr1, td5);
    			mount_component(button, td5, null);
    			append_dev(tbody, t17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler),
    				listen_dev(input3, "input", input3_input_handler),
    				listen_dev(input4, "input", input4_input_handler)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*newCountry*/ 1 && input0.value !== /*newCountry*/ ctx[0].country) {
    				set_input_value(input0, /*newCountry*/ ctx[0].country);
    			}

    			if (!input1_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input1, /*newCountry*/ ctx[0].year);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input2, /*newCountry*/ ctx[0].global_peace_index);
    			}

    			input2_updating = false;

    			if (!input3_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input3, /*newCountry*/ ctx[0].global_peace_ranking);
    			}

    			input3_updating = false;

    			if (!input4_updating && dirty[0] & /*newCountry*/ 1) {
    				set_input_value(input4, /*newCountry*/ ctx[0].var);
    			}

    			input4_updating = false;
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty[0] & /*countries, deleteCountry*/ 288) {
    				each_value = /*countries*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19$2.name,
    		type: "slot",
    		source: "(175:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (172:22)           Loading datas...      {:then countries}
    function create_pending_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading datas...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(172:22)           Loading datas...      {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (216:2) <PaginationItem class="{currentPage === 1 ? 'disabled' : ''}">
    function create_default_slot_18$2(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				previous: true,
    				href: "#/countries_for_equality_stats"
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler*/ ctx[24]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18$2.name,
    		type: "slot",
    		source: "(216:2) <PaginationItem class=\\\"{currentPage === 1 ? 'disabled' : ''}\\\">",
    		ctx
    	});

    	return block;
    }

    // (219:2) {#if currentPage != 1}
    function create_if_block_1$4(ctx) {
    	let current;

    	const paginationitem = new PaginationItem({
    			props: {
    				$$slots: { default: [create_default_slot_16$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem_changes = {};

    			if (dirty[0] & /*currentPage*/ 8 | dirty[1] & /*$$scope*/ 4) {
    				paginationitem_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem.$set(paginationitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(219:2) {#if currentPage != 1}",
    		ctx
    	});

    	return block;
    }

    // (221:3) <PaginationLink href="#/countries_for_equality_stats" on:click="{() => incrementOffset(-1)}" >
    function create_default_slot_17$2(ctx) {
    	let t_value = /*currentPage*/ ctx[3] - 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 8 && t_value !== (t_value = /*currentPage*/ ctx[3] - 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17$2.name,
    		type: "slot",
    		source: "(221:3) <PaginationLink href=\\\"#/countries_for_equality_stats\\\" on:click=\\\"{() => incrementOffset(-1)}\\\" >",
    		ctx
    	});

    	return block;
    }

    // (220:2) <PaginationItem>
    function create_default_slot_16$2(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/countries_for_equality_stats",
    				$$slots: { default: [create_default_slot_17$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_1*/ ctx[25]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 8 | dirty[1] & /*$$scope*/ 4) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16$2.name,
    		type: "slot",
    		source: "(220:2) <PaginationItem>",
    		ctx
    	});

    	return block;
    }

    // (225:3) <PaginationLink href="#/countries_for_equality_stats" >
    function create_default_slot_15$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*currentPage*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 8) set_data_dev(t, /*currentPage*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15$2.name,
    		type: "slot",
    		source: "(225:3) <PaginationLink href=\\\"#/countries_for_equality_stats\\\" >",
    		ctx
    	});

    	return block;
    }

    // (224:2) <PaginationItem active>
    function create_default_slot_14$2(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/countries_for_equality_stats",
    				$$slots: { default: [create_default_slot_15$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 8 | dirty[1] & /*$$scope*/ 4) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14$2.name,
    		type: "slot",
    		source: "(224:2) <PaginationItem active>",
    		ctx
    	});

    	return block;
    }

    // (227:2) {#if moreData}
    function create_if_block$a(ctx) {
    	let current;

    	const paginationitem = new PaginationItem({
    			props: {
    				$$slots: { default: [create_default_slot_12$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem_changes = {};

    			if (dirty[0] & /*currentPage*/ 8 | dirty[1] & /*$$scope*/ 4) {
    				paginationitem_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem.$set(paginationitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(227:2) {#if moreData}",
    		ctx
    	});

    	return block;
    }

    // (229:3) <PaginationLink href="#/countries_for_equality_stats" on:click="{() => incrementOffset(1)}">
    function create_default_slot_13$2(ctx) {
    	let t_value = /*currentPage*/ ctx[3] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 8 && t_value !== (t_value = /*currentPage*/ ctx[3] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$2.name,
    		type: "slot",
    		source: "(229:3) <PaginationLink href=\\\"#/countries_for_equality_stats\\\" on:click=\\\"{() => incrementOffset(1)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (228:2) <PaginationItem >
    function create_default_slot_12$2(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				href: "#/countries_for_equality_stats",
    				$$slots: { default: [create_default_slot_13$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_2*/ ctx[26]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationlink_changes = {};

    			if (dirty[0] & /*currentPage*/ 8 | dirty[1] & /*$$scope*/ 4) {
    				paginationlink_changes.$$scope = { dirty, ctx };
    			}

    			paginationlink.$set(paginationlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$2.name,
    		type: "slot",
    		source: "(228:2) <PaginationItem >",
    		ctx
    	});

    	return block;
    }

    // (232:2) <PaginationItem class="{moreData ? '' : 'disabled'}">
    function create_default_slot_11$2(ctx) {
    	let current;

    	const paginationlink = new PaginationLink({
    			props: {
    				next: true,
    				href: "#/countries_for_equality_stats"
    			},
    			$$inline: true
    		});

    	paginationlink.$on("click", /*click_handler_3*/ ctx[27]);

    	const block = {
    		c: function create() {
    			create_component(paginationlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationlink, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$2.name,
    		type: "slot",
    		source: "(232:2) <PaginationItem class=\\\"{moreData ? '' : 'disabled'}\\\">",
    		ctx
    	});

    	return block;
    }

    // (215:2) <Pagination style="float:center;" ariaLabel="Cambiar de página">
    function create_default_slot_10$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const paginationitem0 = new PaginationItem({
    			props: {
    				class: /*currentPage*/ ctx[3] === 1 ? "disabled" : "",
    				$$slots: { default: [create_default_slot_18$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*currentPage*/ ctx[3] != 1 && create_if_block_1$4(ctx);

    	const paginationitem1 = new PaginationItem({
    			props: {
    				active: true,
    				$$slots: { default: [create_default_slot_14$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*moreData*/ ctx[4] && create_if_block$a(ctx);

    	const paginationitem2 = new PaginationItem({
    			props: {
    				class: /*moreData*/ ctx[4] ? "" : "disabled",
    				$$slots: { default: [create_default_slot_11$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paginationitem0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(paginationitem1.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			create_component(paginationitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(paginationitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(paginationitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paginationitem0_changes = {};
    			if (dirty[0] & /*currentPage*/ 8) paginationitem0_changes.class = /*currentPage*/ ctx[3] === 1 ? "disabled" : "";

    			if (dirty[1] & /*$$scope*/ 4) {
    				paginationitem0_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem0.$set(paginationitem0_changes);

    			if (/*currentPage*/ ctx[3] != 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const paginationitem1_changes = {};

    			if (dirty[0] & /*currentPage*/ 8 | dirty[1] & /*$$scope*/ 4) {
    				paginationitem1_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem1.$set(paginationitem1_changes);

    			if (/*moreData*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const paginationitem2_changes = {};
    			if (dirty[0] & /*moreData*/ 16) paginationitem2_changes.class = /*moreData*/ ctx[4] ? "" : "disabled";

    			if (dirty[1] & /*$$scope*/ 4) {
    				paginationitem2_changes.$$scope = { dirty, ctx };
    			}

    			paginationitem2.$set(paginationitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationitem0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(paginationitem1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(paginationitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationitem0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(paginationitem1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(paginationitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationitem0, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(paginationitem1, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(paginationitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$2.name,
    		type: "slot",
    		source: "(215:2) <Pagination style=\\\"float:center;\\\" ariaLabel=\\\"Cambiar de página\\\">",
    		ctx
    	});

    	return block;
    }

    // (238:2) <Button outline  color="primary" on:click={loadInitialData}>
    function create_default_slot_9$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Iniciar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$2.name,
    		type: "slot",
    		source: "(238:2) <Button outline  color=\\\"primary\\\" on:click={loadInitialData}>",
    		ctx
    	});

    	return block;
    }

    // (239:2) <Button outline  color="danger" on:click={deleteAllCountries}>
    function create_default_slot_8$2(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Eliminar todo");
    			attr_dev(i, "class", "fa fa-trash");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$B, 238, 64, 7934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$2.name,
    		type: "slot",
    		source: "(239:2) <Button outline  color=\\\"danger\\\" on:click={deleteAllCountries}>",
    		ctx
    	});

    	return block;
    }

    // (245:20) <FormGroup style="width:50%;">
    function create_default_slot_6$1(ctx) {
    	let label;
    	let t1;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[28].call(null, value);
    	}

    	let input_props = {
    		type: "text",
    		name: "selectCountry",
    		id: "selectCountry"
    	};

    	if (/*actualCountry*/ ctx[1] !== void 0) {
    		input_props.value = /*actualCountry*/ ctx[1];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Selecciona el País:";
    			t1 = space();
    			create_component(input.$$.fragment);
    			add_location(label, file$B, 245, 20, 8163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*actualCountry*/ 2) {
    				updating_value = true;
    				input_changes.value = /*actualCountry*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(245:20) <FormGroup style=\\\"width:50%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (254:24) <Label >
    function create_default_slot_5$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Búsqueda por año");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(254:24) <Label >",
    		ctx
    	});

    	return block;
    }

    // (253:20) <FormGroup style="width:50%;">
    function create_default_slot_3$2(ctx) {
    	let t;
    	let updating_value;
    	let current;

    	const label = new Label({
    			props: {
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[29].call(null, value);
    	}

    	let input_props = {
    		type: "number",
    		name: "selectYear",
    		id: "selectYear"
    	};

    	if (/*actualYear*/ ctx[2] !== void 0) {
    		input_props.value = /*actualYear*/ ctx[2];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    			t = space();
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    			const input_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*actualYear*/ 4) {
    				updating_value = true;
    				input_changes.value = /*actualYear*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(253:20) <FormGroup style=\\\"width:50%;\\\">",
    		ctx
    	});

    	return block;
    }

    // (262:24) <Button outline  color="primary" on:click="{buscanota(actualCountry, actualYear)}" class="button-search" >
    function create_default_slot_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Buscar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(262:24) <Button outline  color=\\\"primary\\\" on:click=\\\"{buscanota(actualCountry, actualYear)}\\\" class=\\\"button-search\\\" >",
    		ctx
    	});

    	return block;
    }

    // (263:24) <Button outline  color="secondary" href="javascript:location.reload()">
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(263:24) <Button outline  color=\\\"secondary\\\" href=\\\"javascript:location.reload()\\\">",
    		ctx
    	});

    	return block;
    }

    // (241:1) <Table bordered>
    function create_default_slot$n(ctx) {
    	let tbody;
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1;
    	let td2;
    	let div;
    	let t2;
    	let current;

    	const formgroup0 = new FormGroup({
    			props: {
    				style: "width:50%;",
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const formgroup1 = new FormGroup({
    			props: {
    				style: "width:50%;",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				class: "button-search",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*buscanota*/ ctx[11](/*actualCountry*/ ctx[1], /*actualYear*/ ctx[2]))) /*buscanota*/ ctx[11](/*actualCountry*/ ctx[1], /*actualYear*/ ctx[2]).apply(this, arguments);
    	});

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				href: "javascript:location.reload()",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			tr = element("tr");
    			td0 = element("td");
    			create_component(formgroup0.$$.fragment);
    			t0 = space();
    			td1 = element("td");
    			create_component(formgroup1.$$.fragment);
    			t1 = space();
    			td2 = element("td");
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			add_location(td0, file$B, 243, 16, 8084);
    			add_location(td1, file$B, 251, 16, 8439);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			set_style(div, "margin-top", "6%");
    			add_location(div, file$B, 260, 20, 8827);
    			add_location(td2, file$B, 259, 16, 8801);
    			attr_dev(tr, "class", "svelte-1a08fx9");
    			add_location(tr, file$B, 242, 12, 8062);
    			add_location(tbody, file$B, 241, 8, 8041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr);
    			append_dev(tr, td0);
    			mount_component(formgroup0, td0, null);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			mount_component(formgroup1, td1, null);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, div);
    			mount_component(button0, div, null);
    			append_dev(div, t2);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const formgroup0_changes = {};

    			if (dirty[0] & /*actualCountry*/ 2 | dirty[1] & /*$$scope*/ 4) {
    				formgroup0_changes.$$scope = { dirty, ctx };
    			}

    			formgroup0.$set(formgroup0_changes);
    			const formgroup1_changes = {};

    			if (dirty[0] & /*actualYear*/ 4 | dirty[1] & /*$$scope*/ 4) {
    				formgroup1_changes.$$scope = { dirty, ctx };
    			}

    			formgroup1.$set(formgroup1_changes);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formgroup0.$$.fragment, local);
    			transition_in(formgroup1.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formgroup0.$$.fragment, local);
    			transition_out(formgroup1.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			destroy_component(formgroup0);
    			destroy_component(formgroup1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$n.name,
    		type: "slot",
    		source: "(241:1) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
    	let body0;
    	let t0;
    	let main;
    	let h2;
    	let t2;
    	let body1;
    	let t3;
    	let promise;
    	let t4;
    	let t5;
    	let div;
    	let t6;
    	let t7;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*countries*/ ctx[5], info);

    	const pagination = new Pagination({
    			props: {
    				style: "float:center;",
    				ariaLabel: "Cambiar de página",
    				$$slots: { default: [create_default_slot_10$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const button0 = new Button({
    			props: {
    				outline: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_9$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*loadInitialData*/ ctx[10]);

    	const button1 = new Button({
    			props: {
    				outline: true,
    				color: "danger",
    				$$slots: { default: [create_default_slot_8$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*deleteAllCountries*/ ctx[9]);

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$n] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body0 = element("body");
    			t0 = space();
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Tasa de Igualdad";
    			t2 = space();
    			body1 = element("body");
    			t3 = space();
    			info.block.c();
    			t4 = space();
    			create_component(pagination.$$.fragment);
    			t5 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			create_component(table.$$.fragment);
    			set_style(body0, "background-color", "#082EFF");
    			add_location(body0, file$B, 164, 0, 4744);
    			attr_dev(h2, "align", "center");
    			add_location(h2, file$B, 168, 4, 4809);
    			set_style(body1, "background-color", "#082EFF");
    			add_location(body1, file$B, 169, 4, 4856);
    			set_style(div, "text-align", "center");
    			set_style(div, "padding-bottom", "3%");
    			add_location(div, file$B, 236, 1, 7737);
    			add_location(main, file$B, 167, 0, 4797);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t2);
    			append_dev(main, body1);
    			append_dev(main, t3);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t4;
    			append_dev(main, t4);
    			mount_component(pagination, main, null);
    			append_dev(main, t5);
    			append_dev(main, div);
    			mount_component(button0, div, null);
    			append_dev(div, t6);
    			mount_component(button1, div, null);
    			append_dev(main, t7);
    			mount_component(table, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*countries*/ 32 && promise !== (promise = /*countries*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const pagination_changes = {};

    			if (dirty[0] & /*moreData, currentPage*/ 24 | dirty[1] & /*$$scope*/ 4) {
    				pagination_changes.$$scope = { dirty, ctx };
    			}

    			pagination.$set(pagination_changes);
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const table_changes = {};

    			if (dirty[0] & /*actualCountry, actualYear*/ 6 | dirty[1] & /*$$scope*/ 4) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(pagination.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(pagination.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(pagination);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let countries = [];
    	let years = [];

    	let newCountry = {
    		country: "",
    		year: "",
    		global_peace_index: "",
    		global_peace_ranking: "",
    		var: ""
    	};

    	let actualCountry = "";
    	let actualYear = "";
    	let longitud = 10;
    	let limit = 2;
    	let offset = 0;
    	let currentPage = 1;
    	let moreData = true;
    	let field = "";
    	let value = "";
    	onMount(getcountries_for_equality_stats);

    	async function getcountries_for_equality_stats() {
    		console.log("Fetching countries...");
    		const res = await fetch("/api/v2/countries_for_equality_stats?offset=" + longitud * offset + "&limit=" + longitud);
    		const resNext = await fetch("/api/v2/countries_for_equality_stats?offset=" + longitud * (offset + 1) + "&limit=" + longitud);

    		if (res.ok && resNext.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			const jsonNext = await resNext.json();
    			$$invalidate(5, countries = json);

    			if (jsonNext.length == 0) {
    				$$invalidate(4, moreData = false);
    			} else {
    				$$invalidate(4, moreData = true);
    			}

    			console.log("Received " + countries.length + " countries.");
    		} else {
    			console.log("ERROR!");
    		}
    	}

    	function incrementOffset(valor) {
    		offset += valor;
    		$$invalidate(3, currentPage += valor);
    		getcountries_for_equality_stats();
    	}

    	async function insertCountry() {
    		console.log("Inserting new data..." + JSON.stringify(newCountry));

    		const res = await fetch("/api/v2/countries_for_equality_stats", {
    			method: "POST",
    			body: JSON.stringify(newCountry),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			if (res.status == 201) {
    				window.alert("DATO CREADO");
    			} else if (res.status == 409) {
    				window.alert("YA EXISTE EL DATO");
    			} else if (res.status == 400) {
    				window.alert("DATOS NO VALIDOS (NO SE PUEDE DEJAR VACIO EL PARAMETRO )");
    			}

    			getcountries_for_equality_stats();
    		});
    	}

    	async function deleteCountry(country) {
    		const res = await fetch("/api/v2/countries_for_equality_stats/" + country, { method: "DELETE" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("DATO BORRADO");
    			} else if (res.status == 404) {
    				window.alert("NO EXISTE EL ELEMENTO PARA ELIMINAR" + country);
    			}

    			getcountries_for_equality_stats();
    		});
    	}

    	async function deleteAllCountries() {
    		const res = await fetch("/api/v2/countries_for_equality_stats", { method: "DELETE" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("DATOS BORRADOS");
    			} else if (res.status == 405) {
    				window.alert("NO HAY ELEMENTOS PARA ELIMINAR");
    			}

    			getcountries_for_equality_stats();
    		});
    	}

    	async function loadInitialData() {
    		const res = await fetch("/api/v2/countries_for_equality_stats/loadInitialData", { method: "GET" }).then(function (res) {
    			if (res.status == 200) {
    				window.alert("DATOS INSETADOS");
    			} else if (res.status == 409) {
    				window.alert("HAY DATOS YA CARGADOS,PARA HACER LA CARGA DEBE ELIMINAR LOS DATOS PRIMERO");
    			}

    			getcountries_for_equality_stats();
    		});
    	}

    	async function buscanota(country, year) {
    		var url = "/api/v2/countries_for_equality_stats";

    		if (country != "" && year != "") {
    			url = url + "?year=" + year + "&country=" + country;
    		} else if (country != "" && year == "") {
    			url = url + "?country=" + country;
    		} else if (country == "" && year != "") {
    			url = url + "?year=" + year;
    		}

    		const res = await fetch(url);

    		if (res.ok) {
    			const json = await res.json();
    			$$invalidate(5, countries = json);

    			if (year == "" && country == "") {
    				window.alert("INTRODUCE DATOS");
    			} else if (countries.length > 0) {
    				window.alert("SE HA ENCONTRADO UNO O VARIOS RESULTADOS");
    			} else {
    				window.alert("NO SE HA ENCONTRADO RESULTADOS");
    			}
    		} else {
    			console.log("ERROR");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$f.warn(`<Countries_for_equality_stats> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Countries_for_equality_stats", $$slots, []);

    	function input0_input_handler() {
    		newCountry.country = this.value;
    		$$invalidate(0, newCountry);
    	}

    	function input1_input_handler() {
    		newCountry.year = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input2_input_handler() {
    		newCountry.global_peace_index = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input3_input_handler() {
    		newCountry.global_peace_ranking = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	function input4_input_handler() {
    		newCountry.var = to_number(this.value);
    		$$invalidate(0, newCountry);
    	}

    	const click_handler = () => incrementOffset(-1);
    	const click_handler_1 = () => incrementOffset(-1);
    	const click_handler_2 = () => incrementOffset(1);
    	const click_handler_3 = () => incrementOffset(1);

    	function input_value_binding(value) {
    		actualCountry = value;
    		$$invalidate(1, actualCountry);
    	}

    	function input_value_binding_1(value) {
    		actualYear = value;
    		$$invalidate(2, actualYear);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Table,
    		Button,
    		Input,
    		Label,
    		FormGroup,
    		Pagination,
    		PaginationItem,
    		PaginationLink,
    		countries,
    		years,
    		newCountry,
    		actualCountry,
    		actualYear,
    		longitud,
    		limit,
    		offset,
    		currentPage,
    		moreData,
    		field,
    		value,
    		getcountries_for_equality_stats,
    		incrementOffset,
    		insertCountry,
    		deleteCountry,
    		deleteAllCountries,
    		loadInitialData,
    		buscanota
    	});

    	$$self.$inject_state = $$props => {
    		if ("countries" in $$props) $$invalidate(5, countries = $$props.countries);
    		if ("years" in $$props) years = $$props.years;
    		if ("newCountry" in $$props) $$invalidate(0, newCountry = $$props.newCountry);
    		if ("actualCountry" in $$props) $$invalidate(1, actualCountry = $$props.actualCountry);
    		if ("actualYear" in $$props) $$invalidate(2, actualYear = $$props.actualYear);
    		if ("longitud" in $$props) longitud = $$props.longitud;
    		if ("limit" in $$props) limit = $$props.limit;
    		if ("offset" in $$props) offset = $$props.offset;
    		if ("currentPage" in $$props) $$invalidate(3, currentPage = $$props.currentPage);
    		if ("moreData" in $$props) $$invalidate(4, moreData = $$props.moreData);
    		if ("field" in $$props) field = $$props.field;
    		if ("value" in $$props) value = $$props.value;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newCountry,
    		actualCountry,
    		actualYear,
    		currentPage,
    		moreData,
    		countries,
    		incrementOffset,
    		insertCountry,
    		deleteCountry,
    		deleteAllCountries,
    		loadInitialData,
    		buscanota,
    		offset,
    		years,
    		longitud,
    		limit,
    		field,
    		value,
    		getcountries_for_equality_stats,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input_value_binding,
    		input_value_binding_1
    	];
    }

    class Countries_for_equality_stats extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Countries_for_equality_stats",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src\front\countries_for_equality_statsAPI\EditCountry.svelte generated by Svelte v3.20.1 */

    const { console: console_1$g } = globals;
    const file$C = "src\\front\\countries_for_equality_statsAPI\\EditCountry.svelte";

    // (1:0) <script>      import {          onMount      }
    function create_catch_block$5(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$5.name,
    		type: "catch",
    		source: "(1:0) <script>      import {          onMount      }",
    		ctx
    	});

    	return block;
    }

    // (81:4) {:then countries}
    function create_then_block$5(ctx) {
    	let current;

    	const table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, updatedVar, updatedGlobal_peace_ranking, updatedGlobal_peace_index, params*/ 8207) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$5.name,
    		type: "then",
    		source: "(81:4) {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (100:25) <Button outline  color="success" on:click={updatecountries_for_equality_stats}>
    function create_default_slot_2$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Actualizar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(100:25) <Button outline  color=\\\"success\\\" on:click={updatecountries_for_equality_stats}>",
    		ctx
    	});

    	return block;
    }

    // (82:8) <Table bordered>
    function create_default_slot_1$5(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t12_value = /*params*/ ctx[0].country + "";
    	let t12;
    	let t13;
    	let td1;
    	let t14_value = /*params*/ ctx[0].year + "";
    	let t14;
    	let t15;
    	let td2;
    	let input0;
    	let input0_updating = false;
    	let t16;
    	let td3;
    	let input1;
    	let input1_updating = false;
    	let t17;
    	let td4;
    	let input2;
    	let input2_updating = false;
    	let t18;
    	let td5;
    	let current;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[10].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[11].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[12].call(input2);
    	}

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "success",
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*updatecountries_for_equality_stats*/ ctx[6]);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Pais";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Año";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Ranking de Paz";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Tasa de Paz";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Variación";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Acciones";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td1 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td2 = element("td");
    			input0 = element("input");
    			t16 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t17 = space();
    			td4 = element("td");
    			input2 = element("input");
    			t18 = space();
    			td5 = element("td");
    			create_component(button.$$.fragment);
    			add_location(th0, file$C, 84, 19, 2459);
    			add_location(th1, file$C, 85, 17, 2491);
    			add_location(th2, file$C, 86, 17, 2522);
    			add_location(th3, file$C, 87, 5, 2552);
    			add_location(th4, file$C, 88, 5, 2579);
    			add_location(th5, file$C, 89, 5, 2604);
    			add_location(tr0, file$C, 83, 16, 2434);
    			add_location(thead, file$C, 82, 12, 2409);
    			add_location(td0, file$C, 94, 20, 2731);
    			add_location(td1, file$C, 95, 5, 2763);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$C, 96, 24, 2811);
    			add_location(td2, file$C, 96, 20, 2807);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$C, 97, 24, 2904);
    			add_location(td3, file$C, 97, 20, 2900);
    			attr_dev(input2, "type", "number");
    			add_location(input2, file$C, 98, 9, 2984);
    			add_location(td4, file$C, 98, 5, 2980);
    			add_location(td5, file$C, 99, 20, 3058);
    			add_location(tr1, file$C, 93, 16, 2705);
    			add_location(tbody, file$C, 92, 12, 2680);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t12);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, t14);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, input0);
    			set_input_value(input0, /*updatedGlobal_peace_index*/ ctx[1]);
    			append_dev(tr1, t16);
    			append_dev(tr1, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*updatedGlobal_peace_ranking*/ ctx[2]);
    			append_dev(tr1, t17);
    			append_dev(tr1, td4);
    			append_dev(td4, input2);
    			set_input_value(input2, /*updatedVar*/ ctx[3]);
    			append_dev(tr1, t18);
    			append_dev(tr1, td5);
    			mount_component(button, td5, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*params*/ 1) && t12_value !== (t12_value = /*params*/ ctx[0].country + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*params*/ 1) && t14_value !== (t14_value = /*params*/ ctx[0].year + "")) set_data_dev(t14, t14_value);

    			if (!input0_updating && dirty & /*updatedGlobal_peace_index*/ 2) {
    				set_input_value(input0, /*updatedGlobal_peace_index*/ ctx[1]);
    			}

    			input0_updating = false;

    			if (!input1_updating && dirty & /*updatedGlobal_peace_ranking*/ 4) {
    				set_input_value(input1, /*updatedGlobal_peace_ranking*/ ctx[2]);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty & /*updatedVar*/ 8) {
    				set_input_value(input2, /*updatedVar*/ ctx[3]);
    			}

    			input2_updating = false;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_component(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(82:8) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (79:22)           Loading datas...      {:then countries}
    function create_pending_block$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading datas...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$5.name,
    		type: "pending",
    		source: "(79:22)           Loading datas...      {:then countries}",
    		ctx
    	});

    	return block;
    }

    // (105:4) {#if MenExito}
    function create_if_block$b(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(/*MenExito*/ ctx[4]);
    			t1 = text(". Dato actualizado con éxito");
    			set_style(p, "color", "green");
    			add_location(p, file$C, 105, 8, 3269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*MenExito*/ 16) set_data_dev(t0, /*MenExito*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(105:4) {#if MenExito}",
    		ctx
    	});

    	return block;
    }

    // (108:4) <Button outline color="secondary" on:click="{pop}">
    function create_default_slot$o(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$o.name,
    		type: "slot",
    		source: "(108:4) <Button outline color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let main;
    	let h3;
    	let t0;
    	let strong;
    	let t1_value = /*params*/ ctx[0].country + "";
    	let t1;
    	let t2;
    	let t3_value = /*params*/ ctx[0].year + "";
    	let t3;
    	let t4;
    	let promise;
    	let t5;
    	let t6;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$5,
    		then: create_then_block$5,
    		catch: create_catch_block$5,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*countries*/ ctx[5], info);
    	let if_block = /*MenExito*/ ctx[4] && create_if_block$b(ctx);

    	const button = new Button({
    			props: {
    				outline: true,
    				color: "secondary",
    				$$slots: { default: [create_default_slot$o] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			t0 = text("Editar el dato: ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			create_component(button.$$.fragment);
    			add_location(strong, file$C, 77, 24, 2244);
    			add_location(h3, file$C, 77, 4, 2224);
    			add_location(main, file$C, 76, 0, 2212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h3);
    			append_dev(h3, t0);
    			append_dev(h3, strong);
    			append_dev(strong, t1);
    			append_dev(strong, t2);
    			append_dev(strong, t3);
    			append_dev(main, t4);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t5;
    			append_dev(main, t5);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t6);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*params*/ 1) && t1_value !== (t1_value = /*params*/ ctx[0].country + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*params*/ 1) && t3_value !== (t3_value = /*params*/ ctx[0].year + "")) set_data_dev(t3, t3_value);
    			info.ctx = ctx;

    			if (dirty & /*countries*/ 32 && promise !== (promise = /*countries*/ ctx[5]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*MenExito*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					if_block.m(main, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let countries = {};
    	let updatedCountry = "";
    	let updatedYear = 0;
    	let updatedGlobal_peace_index = 0;
    	let updatedGlobal_peace_ranking = 0;
    	let updatedVar = 0;
    	let MenExito = "";
    	onMount(getCountry);

    	async function getCountry() {
    		console.log("Fetching countries...");
    		const res = await fetch("/api/v2/countries_for_equality_stats/" + params.country + "/" + params.year);

    		if (res.ok) {
    			console.log("Ok:");
    			const json = await res.json();
    			$$invalidate(5, countries = json);
    			updatedCountry = params.country;
    			updatedYear = parseInt(params.year);
    			$$invalidate(1, updatedGlobal_peace_index = countries.global_peace_index);
    			$$invalidate(2, updatedGlobal_peace_ranking = countries.global_peace_ranking);
    			$$invalidate(3, updatedVar = countries.var);
    			console.log("Received countries.");
    		} else if (res.status == 404) {
    			window.alert("El dato: " + params.country + " " + params.year + " no existe");
    		}
    	}

    	async function updatecountries_for_equality_stats() {
    		const res = await fetch("/api/v2/countries_for_equality_stats/" + params.country + "/" + params.year, {
    			method: "PUT",
    			body: JSON.stringify({
    				country: params.country,
    				year: parseInt(params.year),
    				global_peace_index: updatedGlobal_peace_index,
    				global_peace_ranking: updatedGlobal_peace_ranking,
    				var: updatedVar
    			}),
    			headers: { "Content-Type": "application/json" }
    		}).then(function (res) {
    			getCountry();

    			if (res.ok) {
    				$$invalidate(4, MenExito = res.status + ": " + res.statusText);
    				console.log("OK!" + MenExito);
    			} else if (res.status == 400) {
    				window.alert("Datos no son válidos");
    			}
    		});
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$g.warn(`<EditCountry> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditCountry", $$slots, []);

    	function input0_input_handler() {
    		updatedGlobal_peace_index = to_number(this.value);
    		$$invalidate(1, updatedGlobal_peace_index);
    	}

    	function input1_input_handler() {
    		updatedGlobal_peace_ranking = to_number(this.value);
    		$$invalidate(2, updatedGlobal_peace_ranking);
    	}

    	function input2_input_handler() {
    		updatedVar = to_number(this.value);
    		$$invalidate(3, updatedVar);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pop,
    		Table,
    		Button,
    		params,
    		countries,
    		updatedCountry,
    		updatedYear,
    		updatedGlobal_peace_index,
    		updatedGlobal_peace_ranking,
    		updatedVar,
    		MenExito,
    		getCountry,
    		updatecountries_for_equality_stats
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("countries" in $$props) $$invalidate(5, countries = $$props.countries);
    		if ("updatedCountry" in $$props) updatedCountry = $$props.updatedCountry;
    		if ("updatedYear" in $$props) updatedYear = $$props.updatedYear;
    		if ("updatedGlobal_peace_index" in $$props) $$invalidate(1, updatedGlobal_peace_index = $$props.updatedGlobal_peace_index);
    		if ("updatedGlobal_peace_ranking" in $$props) $$invalidate(2, updatedGlobal_peace_ranking = $$props.updatedGlobal_peace_ranking);
    		if ("updatedVar" in $$props) $$invalidate(3, updatedVar = $$props.updatedVar);
    		if ("MenExito" in $$props) $$invalidate(4, MenExito = $$props.MenExito);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		updatedGlobal_peace_index,
    		updatedGlobal_peace_ranking,
    		updatedVar,
    		MenExito,
    		countries,
    		updatecountries_for_equality_stats,
    		updatedCountry,
    		updatedYear,
    		getCountry,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class EditCountry$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditCountry",
    			options,
    			id: create_fragment$D.name
    		});
    	}

    	get params() {
    		throw new Error("<EditCountry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditCountry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\front\countries_for_equality_statsAPI\Graphpro.svelte generated by Svelte v3.20.1 */

    const file$D = "src\\front\\countries_for_equality_statsAPI\\Graphpro.svelte";

    function create_fragment$E(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;
    	let t0;
    	let main;
    	let figure;
    	let div;
    	let t1;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "En la gráica podemos observar la Tasa de Igualdad por Paises, donde se ve: el Ranking de Igualdad, tasa de Igualdad y variacion de Igualdad.";
    			if (script0.src !== (script0_src_value = "https://code.highcharts.com/highcharts.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$D, 56, 1, 1033);
    			if (script1.src !== (script1_src_value = "https://code.highcharts.com/modules/exporting.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$D, 57, 1, 1123);
    			if (script2.src !== (script2_src_value = "https://code.highcharts.com/modules/export-data.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$D, 58, 1, 1220);
    			if (script3.src !== (script3_src_value = "https://code.highcharts.com/modules/accessibility.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$D, 59, 1, 1319);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-pgbwiv");
    			add_location(div, file$D, 65, 2, 1487);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$D, 66, 2, 1517);
    			attr_dev(figure, "class", "highcharts-figure svelte-pgbwiv");
    			add_location(figure, file$D, 64, 1, 1449);
    			add_location(main, file$D, 63, 0, 1440);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(script0, "load", loadGraph$j, false, false, false),
    				listen_dev(script1, "load", loadGraph$j, false, false, false),
    				listen_dev(script2, "load", loadGraph$j, false, false, false),
    				listen_dev(script3, "load", loadGraph$j, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$j() {
    	let MyData = [];
    	let MyDataGraph = [];
    	const resData = await fetch("/api/v2/countries_for_equality_stats");
    	MyData = await resData.json();

    	MyData.forEach(x => {
    		MyDataGraph.push({
    			name: x.country + " " + x.year,
    			data: [
    				parseInt(x.global_peace_ranking),
    				parseInt(x.global_peace_index),
    				parseInt(x.var)
    			]
    		});
    	});

    	Highcharts.chart("container", {
    		chart: { type: "areaspline" },
    		title: { text: "Tasa de Igualdad" },
    		xAxis: {
    			categories: ["Ranking de Paz Global", "Indice de Paz Global", "Variación"],
    			plotBands: [
    				{
    					from: 4.5,
    					to: 6.5,
    					color: "rgba(68, 170, 213, .2)"
    				}
    			]
    		},
    		yAxis: { title: { text: "units" } },
    		tooltip: { shared: true, valueSuffix: " units" },
    		credits: { enabled: false },
    		plotOptions: { areaspline: { fillOpacity: 0.5 } },
    		series: MyDataGraph
    	});
    }

    function instance$E($$self, $$props, $$invalidate) {
    	loadGraph$j();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Graphpro> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Graphpro", $$slots, []);
    	$$self.$capture_state = () => ({ loadGraph: loadGraph$j });
    	return [];
    }

    class Graphpro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graphpro",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src\front\countries_for_equality_statsAPI\GraphAwesome.svelte generated by Svelte v3.20.1 */
    const file$E = "src\\front\\countries_for_equality_statsAPI\\GraphAwesome.svelte";

    function create_fragment$F(ctx) {
    	let canvas;

    	const block = {
    		c: function create() {
    			canvas = element("canvas");
    			attr_dev(canvas, "id", "scatterChart");
    			attr_dev(canvas, "width", "3");
    			attr_dev(canvas, "height", "1");
    			add_location(canvas, file$E, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$k() {
    	const resData = await fetch("/api/v2/countries_for_equality_stats");
    	let MyData = await resData.json();
    	var ctx = document.getElementById("scatterChart");

    	let Country = MyData.map(d => {
    		return d.country;
    	});

    	let Year = MyData.map(d => {
    		return d.year;
    	});

    	let global_peace_index = MyData.map(d => {
    		return d.global_peace_index;
    	});

    	let global_peace_ranking = MyData.map(d => {
    		return d.global_peace_ranking;
    	});

    	let var1 = MyData.map(d => {
    		return d.var;
    	});

    	var tam = Country.lenght;
    	var allData = [];
    	var allData1 = [];
    	var allData2 = [];
    	var inteo = [];

    	for (var i = 0; i < tam; i++) {
    		inteo.push({ labels: Country[i] });
    	}

    	/* new Chart(ctx, {
         data: var1,
         labels: inteo,
         type: 'polarArea',
         options: animation.animateRotate
     });*/
    	for (var i = 0; i < tam; i++) {
    		inteo.push({ label: Country[i] });
    	}

    	var tam = Country.length;

    	for (var i = 0; i < tam; i++) {
    		allData.push({ y: Year[i], x: global_peace_index[i] });
    	}

    	for (var i = 0; i < tam; i++) {
    		allData1.push({ y: Year[i], x: global_peace_ranking[i] });
    	}

    	for (var i = 0; i < tam; i++) {
    		allData2.push({ y: Year[i], x: var1[i] });
    	}

    	var scatterChart = new Chart(ctx,
    	{
    			type: "scatter",
    			data: {
    				datasets: [
    					{
    						label: "AÑOS POR INDICE",
    						backgroundColor: "rgba(50, 50, 150, 1)",
    						pointBackgroundColor: "rgba(50, 50, 150, 1)",
    						data: allData
    					},
    					{
    						label: "AÑOS POR RANKING",
    						pointBackgroundColor: "rgba(150, 50, 50, 1)",
    						backgroundColor: "rgba(150, 50, 50, 1)",
    						data: allData1
    					},
    					{
    						label: "AÑOS POR VARIACION",
    						pointBackgroundColor: "rgba(50, 150, 50, 1)",
    						backgroundColor: "rgba(50, 150, 50, 1)",
    						data: allData2
    					}
    				]
    			},
    			options: {
    				scales: {
    					xAxes: [{ type: "linear", position: "bottom" }]
    				}
    			}
    		});
    }

    function instance$F($$self, $$props, $$invalidate) {
    	onMount(loadGraph$k);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GraphAwesome> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GraphAwesome", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, loadGraph: loadGraph$k });
    	return [];
    }

    class GraphAwesome$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GraphAwesome",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\22.svelte generated by Svelte v3.20.1 */
    const file$F = "src\\front\\Integrations\\countries_for_equality_stats\\22.svelte";

    // (90:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$p(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$p.name,
    		type: "slot",
    		source: "(90:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$G(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$p] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y los puntos totales de Formula1";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$F, 83, 8, 2710);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$F, 84, 8, 2748);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$F, 82, 4, 2666);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$F, 88, 4, 2909);
    			add_location(main, file$F, 81, 0, 2654);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$l() {
    	const resDataFormula = await fetch("/api/v2/formula-stats");
    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let formula = await resDataFormula.json();
    	let equality = await resDataEquality.json();

    	let dataFormula = formula.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["totalpointnumber"]
    		};

    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Puntos totales de Formula1",
    			data: dataFormula
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y los puntos totales de Formula1"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$G($$self, $$props, $$invalidate) {
    	loadGraph$l();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_22> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_22", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$l });
    	return [];
    }

    class _22$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_22",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\12.svelte generated by Svelte v3.20.1 */
    const file$G = "src\\front\\Integrations\\countries_for_equality_stats\\12.svelte";

    // (93:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$q(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$q.name,
    		type: "slot",
    		source: "(93:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$H(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$q] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica que muestra las diferencias entre entre número total de personas que dejan el colegio y el ranking de igualdad.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$G, 86, 8, 2830);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$G, 87, 8, 2866);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$G, 85, 4, 2786);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$G, 91, 4, 3068);
    			add_location(main, file$G, 83, 0, 2772);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$m() {
    	const datos_su_base = await fetch("https://sos1920-12.herokuapp.com/api/v2/school-dropouts");
    	const datos_mi_base = await fetch("/api/v2/countries_for_equality_stats");
    	let school_dropouts = await datos_su_base.json();
    	let equality_stats = await datos_mi_base.json();

    	let datoequality_stats = equality_stats.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataschool_dropouts = school_dropouts.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["sd_all"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking",
    			data: datoequality_stats
    		},
    		{
    			name: "Número total de abandonos en las escuelas",
    			data: dataschool_dropouts
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre número total de personas que dejan el colegio y el ranking de igualdad"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$H($$self, $$props, $$invalidate) {
    	loadGraph$m();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_12> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_12", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$m });
    	return [];
    }

    class _12 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_12",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\30.svelte generated by Svelte v3.20.1 */

    const { console: console_1$h } = globals;
    const file$H = "src\\front\\Integrations\\countries_for_equality_stats\\30.svelte";

    // (93:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$r(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$r.name,
    		type: "slot",
    		source: "(93:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$I(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$r] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el consumo de azucar y el ranking de paz.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$H, 86, 8, 2784);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$H, 87, 8, 2820);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$H, 85, 4, 2740);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$H, 91, 4, 2972);
    			add_location(main, file$H, 83, 0, 2726);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$n() {
    	const resDatasugarconsume = await fetch("https://sos1920-30.herokuapp.com/api/v2/sugarconsume");
    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let sugarconsume = await resDatasugarconsume.json();
    	let equality = await resDataEquality.json();
    	console.log(equality);

    	let datasugarconsume = sugarconsume.map(d => {
    		let res = {
    			name: d.place + " - " + d.year,
    			value: parseInt(d["sugarconsume"])
    		};

    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Consumo de azucar",
    			data: datasugarconsume
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y consumo de azucar"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 100,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$I($$self, $$props, $$invalidate) {
    	loadGraph$n();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$h.warn(`<_30> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_30", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$n });
    	return [];
    }

    class _30 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_30",
    			options,
    			id: create_fragment$I.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna1.svelte generated by Svelte v3.20.1 */

    const { console: console_1$i } = globals;
    const file$I = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna1.svelte";

    // (100:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$s(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$s.name,
    		type: "slot",
    		source: "(100:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$J(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$s] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y el diamentro de los planetas de star wars.";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$I, 93, 8, 3011);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$I, 94, 8, 3047);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$I, 92, 4, 2967);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$I, 98, 4, 3220);
    			add_location(main, file$I, 91, 0, 2955);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$o() {
    	const resDataStarWars = await fetch("https://swapi.dev/api/planets/");
    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let starwar1 = await resDataStarWars.json();
    	let starwar2 = starwar1.results;
    	let equality = await resDataEquality.json();
    	console.log(equality);

    	console.log(starwar2.map(d => {
    		let res = {
    			name: d.name,
    			value: parseInt(d["diameter"])
    		};

    		return res;
    	}));

    	let dataStarWars = starwar2.map(d => {
    		let res = {
    			name: d.name,
    			value: parseInt(d["diameter"])
    		};

    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Diametro de los planetas de star wars",
    			data: dataStarWars
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y el diamentro de los planetas de star wars"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$J($$self, $$props, $$invalidate) {
    	loadGraph$o();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$i.warn(`<APIExterna1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna1", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$o });
    	return [];
    }

    class APIExterna1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna1",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna2.svelte generated by Svelte v3.20.1 */

    const { console: console_1$j } = globals;
    const file$J = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna2.svelte";

    // (100:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$t(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$t.name,
    		type: "slot",
    		source: "(100:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$K(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$t] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y tvjan-tvmaze";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$J, 93, 8, 2951);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$J, 94, 8, 2987);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$J, 92, 4, 2907);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$J, 98, 4, 3130);
    			add_location(main, file$J, 91, 0, 2895);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$p() {
    	const resDatatvmaze = await fetch("https://tvjan-tvmaze-v1.p.rapidapi.com/schedule?filter=primetime", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "tvjan-tvmaze-v1.p.rapidapi.com",
    			"x-rapidapi-key": "5acefcc3b4msh4884fd7c1958392p10a3abjsn4fe5ecdb7afa"
    		}
    	});

    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let tvmaze = await resDatatvmaze.json();
    	let equality = await resDataEquality.json();
    	console.log(equality);
    	console.log(tvmaze);

    	let datatvmaze = tvmaze.map(d => {
    		let res = { name: d.name, value: d["runtime"] };
    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Tiempo en escena en tvmaze",
    			data: datatvmaze
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y el tiempo en escena en tvmaze"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$K($$self, $$props, $$invalidate) {
    	loadGraph$p();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$j.warn(`<APIExterna2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna2", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$p });
    	return [];
    }

    class APIExterna2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna2",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna3.svelte generated by Svelte v3.20.1 */

    const { console: console_1$k } = globals;
    const file$K = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna3.svelte";

    // (102:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$u(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$u.name,
    		type: "slot",
    		source: "(102:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$L(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$u] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y  el número de juegos de diferentes compañias";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$K, 95, 8, 3070);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$K, 96, 8, 3106);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$K, 94, 4, 3026);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$K, 100, 4, 3281);
    			add_location(main, file$K, 93, 0, 3014);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$L.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$q() {
    	const resDatatvideogames = await fetch("https://rawg-video-games-database.p.rapidapi.com/developers", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "rawg-video-games-database.p.rapidapi.com",
    			"x-rapidapi-key": "5acefcc3b4msh4884fd7c1958392p10a3abjsn4fe5ecdb7afa"
    		}
    	});

    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let videogames = await resDatatvideogames.json();
    	let equality = await resDataEquality.json();
    	let videogames1 = videogames.results;
    	console.log(equality);
    	console.log(videogames1);

    	let datavideogames = videogames1.map(d => {
    		let res = { name: d.name, value: d["games_count"] };
    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Número de juegos de diferentes compañias",
    			data: datavideogames
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y el número de juegos de diferentes compañias"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$L($$self, $$props, $$invalidate) {
    	loadGraph$q();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$k.warn(`<APIExterna3> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna3", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$q });
    	return [];
    }

    class APIExterna3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna3",
    			options,
    			id: create_fragment$L.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna4.svelte generated by Svelte v3.20.1 */

    const { console: console_1$l } = globals;
    const file$L = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna4.svelte";

    // (101:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$v(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$v.name,
    		type: "slot",
    		source: "(101:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$M(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$v] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y el precio más baratos de juegos de batman";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$L, 94, 8, 3057);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$L, 95, 8, 3093);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$L, 93, 4, 3013);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$L, 99, 4, 3265);
    			add_location(main, file$L, 92, 0, 3001);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$M.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$r() {
    	const resDatacheapshark = await fetch("https://cheapshark-game-deals.p.rapidapi.com/games?limit=60&title=batman&exact=0", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "cheapshark-game-deals.p.rapidapi.com",
    			"x-rapidapi-key": "5acefcc3b4msh4884fd7c1958392p10a3abjsn4fe5ecdb7afa"
    		}
    	});

    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let cheapshark = await resDatacheapshark.json();
    	let equality = await resDataEquality.json();
    	console.log(equality);
    	console.log(cheapshark);

    	let datacheapshark = cheapshark.map(d => {
    		let res = {
    			name: d.external,
    			value: parseFloat(d["cheapest"])
    		};

    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "El precio más baratos de juegos de batman",
    			data: datacheapshark
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y el precio más baratos de juegos de batman"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$M($$self, $$props, $$invalidate) {
    	loadGraph$r();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$l.warn(`<APIExterna4> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna4", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$r });
    	return [];
    }

    class APIExterna4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna4",
    			options,
    			id: create_fragment$M.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna5.svelte generated by Svelte v3.20.1 */

    const { console: console_1$m } = globals;
    const file$M = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna5.svelte";

    // (101:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$w(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$w.name,
    		type: "slot",
    		source: "(101:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$N(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$w] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y D de diferentes cervezas";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$M, 94, 8, 3031);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$M, 95, 8, 3067);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$M, 93, 4, 2987);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$M, 99, 4, 3222);
    			add_location(main, file$M, 92, 0, 2975);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$N.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$s() {
    	const resDataBaseExterna = await fetch("https://brianiswu-open-brewery-db-v1.p.rapidapi.com/breweries/autocomplete?query=dog", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "brianiswu-open-brewery-db-v1.p.rapidapi.com",
    			"x-rapidapi-key": "5acefcc3b4msh4884fd7c1958392p10a3abjsn4fe5ecdb7afa"
    		}
    	});

    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let BaseExterna = await resDataBaseExterna.json();
    	let equality = await resDataEquality.json();
    	console.log(equality);
    	console.log(BaseExterna);

    	let dataBaseExterna = BaseExterna.map(d => {
    		let res = { name: d.name, value: parseInt(d["id"]) };
    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "ID de diferentes cervezas",
    			data: dataBaseExterna
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y ID de diferentes cervezas"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$N($$self, $$props, $$invalidate) {
    	loadGraph$s();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$m.warn(`<APIExterna5> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna5", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$s });
    	return [];
    }

    class APIExterna5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna5",
    			options,
    			id: create_fragment$N.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna6.svelte generated by Svelte v3.20.1 */

    const { console: console_1$n } = globals;
    const file$N = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna6.svelte";

    // (102:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$x(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$x.name,
    		type: "slot",
    		source: "(102:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$O(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$x] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y el ranking de algunas comidas chinas";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$N, 95, 8, 3130);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$N, 96, 8, 3166);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$N, 94, 4, 3086);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$N, 100, 4, 3333);
    			add_location(main, file$N, 93, 0, 3074);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$O.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$t() {
    	const resDataBaseExterna = await fetch("https://rakuten_webservice-rakuten-recipe-v1.p.rapidapi.com/services/api/Recipe/CategoryRanking/20170426", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "rakuten_webservice-rakuten-recipe-v1.p.rapidapi.com",
    			"x-rapidapi-key": "5acefcc3b4msh4884fd7c1958392p10a3abjsn4fe5ecdb7afa"
    		}
    	});

    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let BaseExterna = await resDataBaseExterna.json();
    	let BaseExterna1 = BaseExterna.result;
    	let equality = await resDataEquality.json();
    	console.log(equality);
    	console.log(BaseExterna1);

    	let dataBaseExterna = BaseExterna1.map(d => {
    		let res = {
    			name: d.nickname,
    			value: parseInt(d["rank"])
    		};

    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Ranking de algunas comidas chinas",
    			data: dataBaseExterna
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y Ranking de algunas comidas chinass"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$O($$self, $$props, $$invalidate) {
    	loadGraph$t();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$n.warn(`<APIExterna6> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna6", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$t });
    	return [];
    }

    class APIExterna6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$O, create_fragment$O, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna6",
    			options,
    			id: create_fragment$O.name
    		});
    	}
    }

    /* src\front\Integrations\countries_for_equality_stats\APIExterna7.svelte generated by Svelte v3.20.1 */

    const { console: console_1$o } = globals;
    const file$O = "src\\front\\Integrations\\countries_for_equality_stats\\APIExterna7.svelte";

    // (102:8) <Button outline align = "center" color="secondary" on:click="{pop}">
    function create_default_slot$y(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Volver");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$y.name,
    		type: "slot",
    		source: "(102:8) <Button outline align = \\\"center\\\" color=\\\"secondary\\\" on:click=\\\"{pop}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$P(ctx) {
    	let t0;
    	let main;
    	let figure;
    	let div0;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let current;

    	const button = new Button({
    			props: {
    				outline: true,
    				align: "center",
    				color: "secondary",
    				$$slots: { default: [create_default_slot$y] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", pop);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			figure = element("figure");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Gráfica de diferencia entre el ranking de paz y Señal de movil";
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "id", "container");
    			add_location(div0, file$O, 95, 8, 3051);
    			attr_dev(p, "class", "highcharts-description");
    			add_location(p, file$O, 96, 8, 3087);
    			attr_dev(figure, "class", "highcharts-figure");
    			add_location(figure, file$O, 94, 4, 3007);
    			set_style(div1, "text-align", "center");
    			set_style(div1, "padding-bottom", "3%");
    			add_location(div1, file$O, 100, 4, 3232);
    			add_location(main, file$O, 93, 0, 2995);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, figure);
    			append_dev(figure, div0);
    			append_dev(figure, t1);
    			append_dev(figure, p);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$P.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function loadGraph$u() {
    	const resDataBaseExterna = await fetch("https://metropolis-api-phone.p.rapidapi.com/directory?country=BR", {
    		"method": "GET",
    		"headers": {
    			"x-rapidapi-host": "metropolis-api-phone.p.rapidapi.com",
    			"x-rapidapi-key": "5acefcc3b4msh4884fd7c1958392p10a3abjsn4fe5ecdb7afa"
    		}
    	});

    	const resDataEquality = await fetch("api/v2/countries_for_equality_stats");
    	let BaseExterna = await resDataBaseExterna.json();
    	let BaseExterna1 = BaseExterna.items;
    	let equality = await resDataEquality.json();
    	console.log(equality);
    	console.log(BaseExterna);

    	let dataBaseExterna = BaseExterna1.map(d => {
    		let res = {
    			name: d.arecode,
    			value: parseInt(d["country-calling-code"])
    		};

    		return res;
    	});

    	let dataEquality = equality.map(d => {
    		let res = {
    			name: d.country + " - " + d.year,
    			value: d["global_peace_ranking"]
    		};

    		return res;
    	});

    	let dataTotal = [
    		{
    			name: "Señal de movil",
    			data: dataBaseExterna
    		},
    		{
    			name: "Ranking de paz",
    			data: dataEquality
    		}
    	];

    	Highcharts.chart("container", {
    		chart: { type: "packedbubble", height: "60%" },
    		title: {
    			text: "Relación entre el ranking de paz y Señal de movil"
    		},
    		tooltip: {
    			useHTML: true,
    			pointFormat: "<b>{point.name}:</b> {point.value}"
    		},
    		plotOptions: {
    			packedbubble: {
    				minSize: "20%",
    				maxSize: "100%",
    				zMin: 0,
    				zMax: 1000,
    				layoutAlgorithm: {
    					splitSeries: false,
    					gravitationalConstant: 0.02
    				},
    				dataLabels: {
    					enabled: true,
    					format: "{point.name}",
    					filter: { property: "y", operator: ">", value: 250 },
    					style: {
    						color: "black",
    						textOutline: "none",
    						fontWeight: "normal"
    					}
    				}
    			}
    		},
    		series: dataTotal
    	});
    }

    function instance$P($$self, $$props, $$invalidate) {
    	loadGraph$u();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$o.warn(`<APIExterna7> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("APIExterna7", $$slots, []);
    	$$self.$capture_state = () => ({ pop, Button, loadGraph: loadGraph$u });
    	return [];
    }

    class APIExterna7 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIExterna7",
    			options,
    			id: create_fragment$P.name
    		});
    	}
    }

    /* src\front\NotFound.svelte generated by Svelte v3.20.1 */

    const file$P = "src\\front\\NotFound.svelte";

    function create_fragment$Q(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "¡La pagina no existe!";
    			add_location(h1, file$P, 1, 4, 12);
    			add_location(main, file$P, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Q($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", $$slots, []);
    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$Q.name
    		});
    	}
    }

    /* src\front\Home.svelte generated by Svelte v3.20.1 */

    const file$Q = "src\\front\\Home.svelte";

    function create_fragment$R(ctx) {
    	let head;
    	let title;
    	let t1;
    	let body;
    	let h40;
    	let t3;
    	let li0;
    	let a0;
    	let t5;
    	let li1;
    	let a1;
    	let t7;
    	let li2;
    	let a2;
    	let t9;
    	let br0;
    	let t10;
    	let h41;
    	let t12;
    	let div0;
    	let p0;
    	let t14;
    	let p1;
    	let em0;
    	let t16;
    	let p2;
    	let em1;
    	let t18;
    	let p3;
    	let em2;
    	let t20;
    	let br1;
    	let t21;
    	let h42;
    	let t23;
    	let div1;
    	let a3;
    	let t25;
    	let br2;
    	let t26;
    	let h43;
    	let t28;
    	let div2;
    	let a4;
    	let t30;
    	let br3;
    	let t31;
    	let h44;
    	let t33;
    	let li3;
    	let a5;
    	let t35;
    	let a6;
    	let t37;
    	let t38;
    	let li4;
    	let a7;
    	let t40;
    	let a8;
    	let t42;
    	let t43;
    	let li5;
    	let a9;
    	let t45;
    	let a10;
    	let t47;
    	let t48;
    	let br4;
    	let t49;
    	let li6;
    	let a11;
    	let t51;
    	let a12;
    	let t53;
    	let t54;
    	let li7;
    	let a13;
    	let t56;
    	let a14;
    	let t58;
    	let t59;
    	let li8;
    	let a15;
    	let t61;
    	let a16;
    	let t63;
    	let t64;
    	let br5;
    	let t65;
    	let br6;
    	let t66;
    	let div9;
    	let div3;
    	let h45;
    	let t68;
    	let li9;
    	let a17;
    	let t70;
    	let li10;
    	let a18;
    	let t72;
    	let br7;
    	let t73;
    	let div4;
    	let h46;
    	let t75;
    	let li11;
    	let a19;
    	let t77;
    	let li12;
    	let a20;
    	let t79;
    	let br8;
    	let t80;
    	let div5;
    	let h47;
    	let t82;
    	let li13;
    	let a21;
    	let t84;
    	let li14;
    	let a22;
    	let t86;
    	let br9;
    	let t87;
    	let div6;
    	let h48;
    	let t89;
    	let li15;
    	let a23;
    	let t91;
    	let br10;
    	let t92;
    	let div7;
    	let h49;
    	let t94;
    	let li16;
    	let a24;
    	let t96;
    	let br11;
    	let t97;
    	let div8;
    	let h410;
    	let t99;
    	let li17;
    	let a25;
    	let t101;
    	let br12;

    	const block = {
    		c: function create() {
    			head = element("head");
    			title = element("title");
    			title.textContent = "README.md";
    			t1 = space();
    			body = element("body");
    			h40 = element("h4");
    			h40.textContent = "Team";
    			t3 = space();
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Juan Manuel Arcos Gonzalez";
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Adrian Escudero Barra";
    			t7 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Alejandro Mena Claro";
    			t9 = space();
    			br0 = element("br");
    			t10 = space();
    			h41 = element("h4");
    			h41.textContent = "TeamProject description";
    			t12 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "We are going to analyse";
    			t14 = space();
    			p1 = element("p");
    			em0 = element("em");
    			em0.textContent = "happiness rate";
    			t16 = space();
    			p2 = element("p");
    			em1 = element("em");
    			em1.textContent = "competitiveness";
    			t18 = space();
    			p3 = element("p");
    			em2 = element("em");
    			em2.textContent = "equality";
    			t20 = space();
    			br1 = element("br");
    			t21 = space();
    			h42 = element("h4");
    			h42.textContent = "Repository";
    			t23 = space();
    			div1 = element("div");
    			a3 = element("a");
    			a3.textContent = "gti-sos/SOS1920-25";
    			t25 = space();
    			br2 = element("br");
    			t26 = space();
    			h43 = element("h4");
    			h43.textContent = "URL";
    			t28 = space();
    			div2 = element("div");
    			a4 = element("a");
    			a4.textContent = "https://sos1920-25.herokuapp.com/git";
    			t30 = space();
    			br3 = element("br");
    			t31 = space();
    			h44 = element("h4");
    			h44.textContent = "APIs";
    			t33 = space();
    			li3 = element("li");
    			a5 = element("a");
    			a5.textContent = "https://sos1920-25.herokuapp.com/api/v1/happiness_rate";
    			t35 = text("(developed by ");
    			a6 = element("a");
    			a6.textContent = "Juan Manuel Arcos Gonzalez";
    			t37 = text(")");
    			t38 = space();
    			li4 = element("li");
    			a7 = element("a");
    			a7.textContent = "https://sos1920-25.herokuapp.com/api/v1/global_competitiveness_index";
    			t40 = text("(developed by ");
    			a8 = element("a");
    			a8.textContent = "Adrian Escudero Barra";
    			t42 = text(")");
    			t43 = space();
    			li5 = element("li");
    			a9 = element("a");
    			a9.textContent = "https://sos1920-25.herokuapp.comapi/v1/countries_for_equality_stats";
    			t45 = text("(developed by ");
    			a10 = element("a");
    			a10.textContent = "Alejandro Mena Claro";
    			t47 = text(")");
    			t48 = space();
    			br4 = element("br");
    			t49 = space();
    			li6 = element("li");
    			a11 = element("a");
    			a11.textContent = "https://sos1920-25.herokuapp.com/#/happiness_rate";
    			t51 = text("(developed by ");
    			a12 = element("a");
    			a12.textContent = "Juan Manuel Arcos Gonzalez";
    			t53 = text(")");
    			t54 = space();
    			li7 = element("li");
    			a13 = element("a");
    			a13.textContent = "https://sos1920-25.herokuapp.com/#/global_competitiveness_index";
    			t56 = text("(developed by ");
    			a14 = element("a");
    			a14.textContent = "Adrian Escudero Barra";
    			t58 = text(")");
    			t59 = space();
    			li8 = element("li");
    			a15 = element("a");
    			a15.textContent = "https://sos1920-25.herokuapp.com/#/countries_for_equality_stats";
    			t61 = text("(developed by ");
    			a16 = element("a");
    			a16.textContent = "Alejandro Mena Claro";
    			t63 = text(")");
    			t64 = space();
    			br5 = element("br");
    			t65 = space();
    			br6 = element("br");
    			t66 = space();
    			div9 = element("div");
    			div3 = element("div");
    			h45 = element("h4");
    			h45.textContent = "Graficas Juan Manuel Arcos Gonzalez";
    			t68 = space();
    			li9 = element("li");
    			a17 = element("a");
    			a17.textContent = "Gráfica highcharts";
    			t70 = space();
    			li10 = element("li");
    			a18 = element("a");
    			a18.textContent = "Gráfica awesomegraph";
    			t72 = space();
    			br7 = element("br");
    			t73 = space();
    			div4 = element("div");
    			h46 = element("h4");
    			h46.textContent = "Graficas Adrian Escudero Barra";
    			t75 = space();
    			li11 = element("li");
    			a19 = element("a");
    			a19.textContent = "Gráfica highcharts";
    			t77 = space();
    			li12 = element("li");
    			a20 = element("a");
    			a20.textContent = "Gráfica awesomegraph";
    			t79 = space();
    			br8 = element("br");
    			t80 = space();
    			div5 = element("div");
    			h47 = element("h4");
    			h47.textContent = "Graficas Alejandro Mena Claro";
    			t82 = space();
    			li13 = element("li");
    			a21 = element("a");
    			a21.textContent = "Gráfica highcharts";
    			t84 = space();
    			li14 = element("li");
    			a22 = element("a");
    			a22.textContent = "Gráfica awesomegraph";
    			t86 = space();
    			br9 = element("br");
    			t87 = space();
    			div6 = element("div");
    			h48 = element("h4");
    			h48.textContent = "Gráfica conjunta";
    			t89 = space();
    			li15 = element("li");
    			a23 = element("a");
    			a23.textContent = "https://sos1920-25.herokuapp.com/#/Analytics";
    			t91 = space();
    			br10 = element("br");
    			t92 = space();
    			div7 = element("div");
    			h49 = element("h4");
    			h49.textContent = "Nuestras Integraciones";
    			t94 = space();
    			li16 = element("li");
    			a24 = element("a");
    			a24.textContent = "https://sos1920-25.herokuapp.com/#/integrations";
    			t96 = space();
    			br11 = element("br");
    			t97 = space();
    			div8 = element("div");
    			h410 = element("h4");
    			h410.textContent = "Videos";
    			t99 = space();
    			li17 = element("li");
    			a25 = element("a");
    			a25.textContent = "https://sos1920-25.herokuapp.com/#/about";
    			t101 = space();
    			br12 = element("br");
    			add_location(title, file$Q, 2, 1, 11);
    			add_location(head, file$Q, 1, 0, 2);
    			attr_dev(h40, "align", "center");
    			add_location(h40, file$Q, 15, 1, 142);
    			attr_dev(a0, "href", "https://github.com/juaarcgon");
    			add_location(a0, file$Q, 17, 21, 195);
    			attr_dev(li0, "align", "center");
    			add_location(li0, file$Q, 17, 2, 176);
    			attr_dev(a1, "href", "https://github.com/adriator77");
    			add_location(a1, file$Q, 18, 21, 294);
    			attr_dev(li1, "align", "center");
    			add_location(li1, file$Q, 18, 2, 275);
    			attr_dev(a2, "href", "https://github.com/LagForever");
    			add_location(a2, file$Q, 19, 21, 389);
    			attr_dev(li2, "align", "center");
    			add_location(li2, file$Q, 19, 2, 370);
    			add_location(br0, file$Q, 21, 1, 467);
    			attr_dev(h41, "align", "center");
    			add_location(h41, file$Q, 22, 1, 475);
    			add_location(p0, file$Q, 25, 2, 549);
    			add_location(em0, file$Q, 26, 5, 586);
    			add_location(p1, file$Q, 26, 2, 583);
    			add_location(em1, file$Q, 27, 5, 620);
    			add_location(p2, file$Q, 27, 2, 617);
    			add_location(em2, file$Q, 28, 5, 655);
    			add_location(p3, file$Q, 28, 2, 652);
    			attr_dev(div0, "align", "center");
    			add_location(div0, file$Q, 24, 1, 527);
    			add_location(br1, file$Q, 30, 1, 688);
    			attr_dev(h42, "align", "center");
    			add_location(h42, file$Q, 31, 1, 695);
    			attr_dev(a3, "href", "https://github.com/gti-sos/SOS1920-25");
    			add_location(a3, file$Q, 32, 21, 750);
    			attr_dev(div1, "align", "center");
    			add_location(div1, file$Q, 32, 1, 730);
    			add_location(br2, file$Q, 34, 1, 834);
    			attr_dev(h43, "align", "center");
    			add_location(h43, file$Q, 35, 1, 841);
    			attr_dev(a4, "href", "https://sos1920-25.herokuapp.com/");
    			add_location(a4, file$Q, 36, 21, 890);
    			attr_dev(div2, "align", "center");
    			add_location(div2, file$Q, 36, 1, 870);
    			add_location(br3, file$Q, 38, 1, 989);
    			attr_dev(h44, "align", "center");
    			add_location(h44, file$Q, 39, 1, 996);
    			attr_dev(a5, "href", "https://sos1920-25.herokuapp.com/api/v1/happiness_rate");
    			add_location(a5, file$Q, 41, 21, 1047);
    			attr_dev(a6, "href", "https://github.com/juaarcgon");
    			add_location(a6, file$Q, 41, 161, 1187);
    			attr_dev(li3, "align", "center");
    			add_location(li3, file$Q, 41, 2, 1028);
    			attr_dev(a7, "href", "https://sos1920-25.herokuapp.com/api/v1/global_competitiveness_index");
    			add_location(a7, file$Q, 42, 21, 1286);
    			attr_dev(a8, "href", "https://github.com/adriator77");
    			add_location(a8, file$Q, 42, 189, 1454);
    			attr_dev(li4, "align", "center");
    			add_location(li4, file$Q, 42, 2, 1267);
    			attr_dev(a9, "href", "https://sos1920-25.herokuapp.com/api/v1/countries_for_equality_stats");
    			add_location(a9, file$Q, 43, 21, 1550);
    			attr_dev(a10, "href", "https://github.com/LagForever");
    			add_location(a10, file$Q, 43, 188, 1717);
    			attr_dev(li5, "align", "center");
    			add_location(li5, file$Q, 43, 2, 1531);
    			add_location(br4, file$Q, 45, 1, 1796);
    			attr_dev(a11, "href", "https://sos1920-25.herokuapp.com/#/happiness_rate");
    			add_location(a11, file$Q, 47, 21, 1825);
    			attr_dev(a12, "href", "https://github.com/juaarcgon");
    			add_location(a12, file$Q, 47, 151, 1955);
    			attr_dev(li6, "align", "center");
    			add_location(li6, file$Q, 47, 2, 1806);
    			attr_dev(a13, "href", "https://sos1920-25.herokuapp.com/#/global_competitiveness_index");
    			add_location(a13, file$Q, 48, 21, 2054);
    			attr_dev(a14, "href", "https://github.com/adriator77");
    			add_location(a14, file$Q, 48, 179, 2212);
    			attr_dev(li7, "align", "center");
    			add_location(li7, file$Q, 48, 2, 2035);
    			attr_dev(a15, "href", "https://sos1920-25.herokuapp.com/#/countries_for_equality_stats");
    			add_location(a15, file$Q, 49, 21, 2308);
    			attr_dev(a16, "href", "https://github.com/LagForever");
    			add_location(a16, file$Q, 49, 179, 2466);
    			attr_dev(li8, "align", "center");
    			add_location(li8, file$Q, 49, 2, 2289);
    			add_location(br5, file$Q, 51, 1, 2544);
    			add_location(br6, file$Q, 52, 1, 2551);
    			add_location(h45, file$Q, 55, 1, 2603);
    			attr_dev(a17, "href", "https://sos1920-25.herokuapp.com/#/happiness_rate/graph");
    			add_location(a17, file$Q, 56, 5, 2655);
    			add_location(li9, file$Q, 56, 1, 2651);
    			attr_dev(a18, "href", "https://sos1920-25.herokuapp.com/#/happiness_rate/awesomegraph");
    			add_location(a18, file$Q, 57, 5, 2757);
    			add_location(li10, file$Q, 57, 1, 2753);
    			add_location(br7, file$Q, 58, 1, 2864);
    			attr_dev(div3, "class", "columna svelte-1fqpbmq");
    			add_location(div3, file$Q, 54, 1, 2579);
    			add_location(h46, file$Q, 61, 1, 2905);
    			attr_dev(a19, "href", "https://sos1920-25.herokuapp.com/#/global_competitiveness_index/graph");
    			add_location(a19, file$Q, 62, 5, 2952);
    			add_location(li11, file$Q, 62, 1, 2948);
    			attr_dev(a20, "href", "https://sos1920-25.herokuapp.com/#/global_competitiveness_index/Awesome_Graph");
    			add_location(a20, file$Q, 63, 5, 3068);
    			add_location(li12, file$Q, 63, 1, 3064);
    			add_location(br8, file$Q, 64, 1, 3190);
    			attr_dev(div4, "class", "columna svelte-1fqpbmq");
    			add_location(div4, file$Q, 60, 1, 2881);
    			add_location(h47, file$Q, 67, 1, 3231);
    			attr_dev(a21, "href", "https://sos1920-25.herokuapp.com/#/countries_for_equality_stats/graph");
    			add_location(a21, file$Q, 68, 5, 3277);
    			add_location(li13, file$Q, 68, 1, 3273);
    			attr_dev(a22, "href", "https://sos1920-25.herokuapp.com/#/countries_for_equality_stats/graphawesome");
    			add_location(a22, file$Q, 69, 5, 3393);
    			add_location(li14, file$Q, 69, 1, 3389);
    			add_location(br9, file$Q, 70, 1, 3514);
    			attr_dev(div5, "class", "columna svelte-1fqpbmq");
    			add_location(div5, file$Q, 66, 1, 3207);
    			add_location(h48, file$Q, 75, 1, 3559);
    			attr_dev(a23, "href", "https://sos1920-25.herokuapp.com/#/Analytics");
    			add_location(a23, file$Q, 76, 5, 3592);
    			add_location(li15, file$Q, 76, 1, 3588);
    			add_location(br10, file$Q, 77, 1, 3705);
    			attr_dev(div6, "class", "columna svelte-1fqpbmq");
    			add_location(div6, file$Q, 74, 1, 3535);
    			add_location(h49, file$Q, 81, 1, 3749);
    			attr_dev(a24, "href", "https://sos1920-25.herokuapp.com/#/integrations");
    			add_location(a24, file$Q, 82, 5, 3788);
    			add_location(li16, file$Q, 82, 1, 3784);
    			add_location(br11, file$Q, 83, 1, 3907);
    			attr_dev(div7, "class", "columna svelte-1fqpbmq");
    			add_location(div7, file$Q, 80, 1, 3725);
    			add_location(h410, file$Q, 87, 1, 3951);
    			attr_dev(a25, "href", "https://sos1920-25.herokuapp.com/#/about");
    			add_location(a25, file$Q, 88, 5, 3974);
    			add_location(li17, file$Q, 88, 1, 3970);
    			add_location(br12, file$Q, 89, 1, 4079);
    			attr_dev(div8, "class", "columna svelte-1fqpbmq");
    			add_location(div8, file$Q, 86, 1, 3927);
    			attr_dev(div9, "align", "center");
    			add_location(div9, file$Q, 53, 1, 2558);
    			attr_dev(body, "align", "center");
    			add_location(body, file$Q, 12, 0, 115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, title);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, h40);
    			append_dev(body, t3);
    			append_dev(body, li0);
    			append_dev(li0, a0);
    			append_dev(body, t5);
    			append_dev(body, li1);
    			append_dev(li1, a1);
    			append_dev(body, t7);
    			append_dev(body, li2);
    			append_dev(li2, a2);
    			append_dev(body, t9);
    			append_dev(body, br0);
    			append_dev(body, t10);
    			append_dev(body, h41);
    			append_dev(body, t12);
    			append_dev(body, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t14);
    			append_dev(div0, p1);
    			append_dev(p1, em0);
    			append_dev(div0, t16);
    			append_dev(div0, p2);
    			append_dev(p2, em1);
    			append_dev(div0, t18);
    			append_dev(div0, p3);
    			append_dev(p3, em2);
    			append_dev(body, t20);
    			append_dev(body, br1);
    			append_dev(body, t21);
    			append_dev(body, h42);
    			append_dev(body, t23);
    			append_dev(body, div1);
    			append_dev(div1, a3);
    			append_dev(body, t25);
    			append_dev(body, br2);
    			append_dev(body, t26);
    			append_dev(body, h43);
    			append_dev(body, t28);
    			append_dev(body, div2);
    			append_dev(div2, a4);
    			append_dev(body, t30);
    			append_dev(body, br3);
    			append_dev(body, t31);
    			append_dev(body, h44);
    			append_dev(body, t33);
    			append_dev(body, li3);
    			append_dev(li3, a5);
    			append_dev(li3, t35);
    			append_dev(li3, a6);
    			append_dev(li3, t37);
    			append_dev(body, t38);
    			append_dev(body, li4);
    			append_dev(li4, a7);
    			append_dev(li4, t40);
    			append_dev(li4, a8);
    			append_dev(li4, t42);
    			append_dev(body, t43);
    			append_dev(body, li5);
    			append_dev(li5, a9);
    			append_dev(li5, t45);
    			append_dev(li5, a10);
    			append_dev(li5, t47);
    			append_dev(body, t48);
    			append_dev(body, br4);
    			append_dev(body, t49);
    			append_dev(body, li6);
    			append_dev(li6, a11);
    			append_dev(li6, t51);
    			append_dev(li6, a12);
    			append_dev(li6, t53);
    			append_dev(body, t54);
    			append_dev(body, li7);
    			append_dev(li7, a13);
    			append_dev(li7, t56);
    			append_dev(li7, a14);
    			append_dev(li7, t58);
    			append_dev(body, t59);
    			append_dev(body, li8);
    			append_dev(li8, a15);
    			append_dev(li8, t61);
    			append_dev(li8, a16);
    			append_dev(li8, t63);
    			append_dev(body, t64);
    			append_dev(body, br5);
    			append_dev(body, t65);
    			append_dev(body, br6);
    			append_dev(body, t66);
    			append_dev(body, div9);
    			append_dev(div9, div3);
    			append_dev(div3, h45);
    			append_dev(div3, t68);
    			append_dev(div3, li9);
    			append_dev(li9, a17);
    			append_dev(div3, t70);
    			append_dev(div3, li10);
    			append_dev(li10, a18);
    			append_dev(div3, t72);
    			append_dev(div3, br7);
    			append_dev(div9, t73);
    			append_dev(div9, div4);
    			append_dev(div4, h46);
    			append_dev(div4, t75);
    			append_dev(div4, li11);
    			append_dev(li11, a19);
    			append_dev(div4, t77);
    			append_dev(div4, li12);
    			append_dev(li12, a20);
    			append_dev(div4, t79);
    			append_dev(div4, br8);
    			append_dev(div9, t80);
    			append_dev(div9, div5);
    			append_dev(div5, h47);
    			append_dev(div5, t82);
    			append_dev(div5, li13);
    			append_dev(li13, a21);
    			append_dev(div5, t84);
    			append_dev(div5, li14);
    			append_dev(li14, a22);
    			append_dev(div5, t86);
    			append_dev(div5, br9);
    			append_dev(div9, t87);
    			append_dev(div9, div6);
    			append_dev(div6, h48);
    			append_dev(div6, t89);
    			append_dev(div6, li15);
    			append_dev(li15, a23);
    			append_dev(div6, t91);
    			append_dev(div6, br10);
    			append_dev(div9, t92);
    			append_dev(div9, div7);
    			append_dev(div7, h49);
    			append_dev(div7, t94);
    			append_dev(div7, li16);
    			append_dev(li16, a24);
    			append_dev(div7, t96);
    			append_dev(div7, br11);
    			append_dev(div9, t97);
    			append_dev(div9, div8);
    			append_dev(div8, h410);
    			append_dev(div8, t99);
    			append_dev(div8, li17);
    			append_dev(li17, a25);
    			append_dev(div8, t101);
    			append_dev(div8, br12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$R.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$R($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$R, create_fragment$R, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$R.name
    		});
    	}
    }

    /* src\front\App.svelte generated by Svelte v3.20.1 */
    const file$R = "src\\front\\App.svelte";

    function create_fragment$S(ctx) {
    	let main;
    	let current;

    	const router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file$R, 115, 0, 5471);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$S.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$S($$self, $$props, $$invalidate) {
    	const routes = {
    		"/": Home,
    		"/integrations": IntegrationsHome,
    		"/analytics": Analytics,
    		"/about": About,
    		"/happiness_rate": CountriesTable,
    		"/happiness_rate/:country/:year": EditCountry,
    		"/happiness_rate/graph": Graph,
    		"/happiness_rate/awesomegraph": GraphAwesome,
    		"/integrations/Grupo05": Grupo05,
    		"/integrations/Grupo09": Grupo09,
    		"/integrations/Grupo12": Grupo12,
    		"/integrations/Grupo22": Grupo22,
    		"/integrations/Externa01": Externa01,
    		"/integrations/Externa02": Externa02,
    		"/integrations/Externa03": Externa03,
    		"/integrations/Externa04": Externa04,
    		"/global_competitiveness_index": Countries_adrescbar,
    		"/global_competitiveness_index/:country/:year": EditCountry$1,
    		"/global_competitiveness_index/graph": Graph_adrescbar,
    		"/global_competitiveness_index/Awesome_Graph": Awesome_Graph,
    		"/integrations/api-22": _22,
    		"/integrations/api-10": _10,
    		"/integrations/coins": Coins,
    		"/integrations/Hearthstone": Hearthstone,
    		"/integrations/City": City,
    		"/integrations/proxy_latency": Proxy_latency,
    		"/integrations/soccer_games": Soccer_games,
    		"/integrations/Investors": Investors,
    		"/integrations/name": Name,
    		"/integrations/Post_code": Post_code,
    		"/countries_for_equality_stats": Countries_for_equality_stats,
    		"/countries_for_equality_stats/:country/:year": EditCountry$2,
    		"/countries_for_equality_stats/graph": Graphpro,
    		"/countries_for_equality_stats/graphawesome": GraphAwesome$1,
    		"/integrations/G22": _22$1,
    		"/integrations/G12": _12,
    		"/integrations/G30": _30,
    		"/integrations/E01": APIExterna1,
    		"/integrations/E02": APIExterna2,
    		"/integrations/E03": APIExterna3,
    		"/integrations/E04": APIExterna4,
    		"/integrations/E05": APIExterna5,
    		"/integrations/E06": APIExterna6,
    		"/integrations/E07": APIExterna7,
    		"*": NotFound
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		Integrations: IntegrationsHome,
    		Analytics,
    		About,
    		CountriesTable,
    		EditCountry,
    		Graph,
    		GraphA: GraphAwesome,
    		Grupo05,
    		Grupo09,
    		Grupo12,
    		Grupo22,
    		Externa01,
    		Externa02,
    		Externa03,
    		Externa04,
    		countries_adrescbar: Countries_adrescbar,
    		editCountry1: EditCountry$1,
    		Graph_adrescbar,
    		Awesome_Graph_adrescbar: Awesome_Graph,
    		API_22: _22,
    		API_10: _10,
    		Coins,
    		Hearthstone,
    		City,
    		proxy_latency: Proxy_latency,
    		Soccer_games,
    		Investors,
    		Name,
    		Post_code,
    		countries_for_equality_stats: Countries_for_equality_stats,
    		EditCountry2: EditCountry$2,
    		Graphpro,
    		Graph2: GraphAwesome$1,
    		G22: _22$1,
    		G12: _12,
    		G30: _30,
    		E01: APIExterna1,
    		E02: APIExterna2,
    		E03: APIExterna3,
    		E04: APIExterna4,
    		E05: APIExterna5,
    		E06: APIExterna6,
    		E07: APIExterna7,
    		NotFound,
    		Home,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$S, create_fragment$S, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$S.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector('#SvelteApp')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
