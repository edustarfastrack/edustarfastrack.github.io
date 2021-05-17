
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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
            throw new Error('Function called outside component initialization');
        return current_component;
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

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
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

    /* src/shared/LargeHeading.svelte generated by Svelte v3.38.2 */

    const file$f = "src/shared/LargeHeading.svelte";

    function create_fragment$k(ctx) {
    	let h3;
    	let h3_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			attr_dev(h3, "class", h3_class_value = "text-3xl md:text-3xl lg:text-4xl " + (/*black*/ ctx[0] ? "text-gray-800" : "text-white") + " p-3 font-Display");
    			add_location(h3, file$f, 3, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*black*/ 1 && h3_class_value !== (h3_class_value = "text-3xl md:text-3xl lg:text-4xl " + (/*black*/ ctx[0] ? "text-gray-800" : "text-white") + " p-3 font-Display")) {
    				attr_dev(h3, "class", h3_class_value);
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
    			if (detaching) detach_dev(h3);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LargeHeading", slots, ['default']);
    	let { black = true } = $$props;
    	const writable_props = ["black"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LargeHeading> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("black" in $$props) $$invalidate(0, black = $$props.black);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ black });

    	$$self.$inject_state = $$props => {
    		if ("black" in $$props) $$invalidate(0, black = $$props.black);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [black, $$scope, slots];
    }

    class LargeHeading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { black: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LargeHeading",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get black() {
    		throw new Error("<LargeHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set black(value) {
    		throw new Error("<LargeHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/Tabs.svelte generated by Svelte v3.38.2 */
    const file$e = "src/shared/Tabs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:8) {#each TabItems as Tab}
    function create_each_block$1(ctx) {
    	let h2;
    	let t_value = /*Tab*/ ctx[4] + "";
    	let t;
    	let h2_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*Tab*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(t_value);

    			attr_dev(h2, "class", h2_class_value = "font-Display text-2xl md:text-3xl p-3 cursor-pointer " + (/*currentTab*/ ctx[1] === /*Tab*/ ctx[4]
    			? "border-b-4 border-blue-500"
    			: ""));

    			add_location(h2, file$e, 12, 11, 276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);

    			if (!mounted) {
    				dispose = listen_dev(h2, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*TabItems*/ 1 && t_value !== (t_value = /*Tab*/ ctx[4] + "")) set_data_dev(t, t_value);

    			if (dirty & /*currentTab, TabItems*/ 3 && h2_class_value !== (h2_class_value = "font-Display text-2xl md:text-3xl p-3 cursor-pointer " + (/*currentTab*/ ctx[1] === /*Tab*/ ctx[4]
    			? "border-b-4 border-blue-500"
    			: ""))) {
    				attr_dev(h2, "class", h2_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:8) {#each TabItems as Tab}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*TabItems*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex justify-center items-center flex-wrap py-5");
    			add_location(div0, file$e, 10, 4, 171);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$e, 9, 0, 152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentTab, TabItems, dispatch*/ 7) {
    				each_value = /*TabItems*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
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

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, []);
    	let dispatch = createEventDispatcher();
    	let { TabItems } = $$props;
    	let { currentTab } = $$props;
    	const writable_props = ["TabItems", "currentTab"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = Tab => {
    		dispatch("tabChange", Tab);
    	};

    	$$self.$$set = $$props => {
    		if ("TabItems" in $$props) $$invalidate(0, TabItems = $$props.TabItems);
    		if ("currentTab" in $$props) $$invalidate(1, currentTab = $$props.currentTab);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		TabItems,
    		currentTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) $$invalidate(2, dispatch = $$props.dispatch);
    		if ("TabItems" in $$props) $$invalidate(0, TabItems = $$props.TabItems);
    		if ("currentTab" in $$props) $$invalidate(1, currentTab = $$props.currentTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [TabItems, currentTab, dispatch, click_handler];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { TabItems: 0, currentTab: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*TabItems*/ ctx[0] === undefined && !("TabItems" in props)) {
    			console.warn("<Tabs> was created without expected prop 'TabItems'");
    		}

    		if (/*currentTab*/ ctx[1] === undefined && !("currentTab" in props)) {
    			console.warn("<Tabs> was created without expected prop 'currentTab'");
    		}
    	}

    	get TabItems() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set TabItems(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentTab() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentTab(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/about/WhyUs.svelte generated by Svelte v3.38.2 */

    function create_fragment$i(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nobis eaque sit culpa ullam nam, labore itaque provident ea aliquam omnis modi minus quibusdam neque quaerat a quod beatae quia reiciendis ipsa. Corrupti, dicta. Laborum at possimus animi quidem eligendi provident.");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WhyUs", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WhyUs> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WhyUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhyUs",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/components/about/WhoAreWe.svelte generated by Svelte v3.38.2 */

    function create_fragment$h(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit amet.");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WhoAreWe", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WhoAreWe> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WhoAreWe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhoAreWe",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/about/Mission.svelte generated by Svelte v3.38.2 */

    function create_fragment$g(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio, perferendis?");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mission", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mission> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Mission extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mission",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/about/Vision.svelte generated by Svelte v3.38.2 */

    function create_fragment$f(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem, ipsum dolor sit amet consectetur adipisicing elit. Pariatur officia sequi nesciunt aliquid explicabo accusantium quas eum nostrum asperiores totam!");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Vision", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vision> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Vision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vision",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/about/AboutUs.svelte generated by Svelte v3.38.2 */
    const file$d = "src/components/about/AboutUs.svelte";

    // (17:8) <LargeHeading>
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About Us");
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
    		source: "(17:8) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (25:39) 
    function create_if_block_3(ctx) {
    	let vision;
    	let current;
    	vision = new Vision({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(vision.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(vision, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(vision.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(vision.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(vision, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(25:39) ",
    		ctx
    	});

    	return block;
    }

    // (23:40) 
    function create_if_block_2(ctx) {
    	let mission;
    	let current;
    	mission = new Mission({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mission.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mission, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mission.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mission.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mission, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(23:40) ",
    		ctx
    	});

    	return block;
    }

    // (21:43) 
    function create_if_block_1(ctx) {
    	let whoarewe;
    	let current;
    	whoarewe = new WhoAreWe({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(whoarewe.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(whoarewe, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(whoarewe.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(whoarewe.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(whoarewe, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:43) ",
    		ctx
    	});

    	return block;
    }

    // (19:7) {#if currentTab==="Why Us"}
    function create_if_block$1(ctx) {
    	let whyus;
    	let current;
    	whyus = new WhyUs({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(whyus.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(whyus, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(whyus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(whyus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(whyus, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(19:7) {#if currentTab===\\\"Why Us\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let section;
    	let div;
    	let largeheading;
    	let t0;
    	let tabs;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabs = new Tabs({
    			props: {
    				currentTab: /*currentTab*/ ctx[0],
    				TabItems: /*TabItems*/ ctx[1]
    			},
    			$$inline: true
    		});

    	tabs.$on("tabChange", /*handleTabChange*/ ctx[2]);
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentTab*/ ctx[0] === "Why Us") return 0;
    		if (/*currentTab*/ ctx[0] === "Who are We") return 1;
    		if (/*currentTab*/ ctx[0] === "Mission") return 2;
    		if (/*currentTab*/ ctx[0] === "Vision") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			create_component(tabs.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "md:w-2/3 p-5");
    			add_location(div, file$d, 15, 4, 493);
    			attr_dev(section, "class", "text-center my-5  flex justify-center items-center");
    			add_location(section, file$d, 14, 0, 420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(largeheading, div, null);
    			append_dev(div, t0);
    			mount_component(tabs, div, null);
    			append_dev(div, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const tabs_changes = {};
    			if (dirty & /*currentTab*/ 1) tabs_changes.currentTab = /*currentTab*/ ctx[0];
    			tabs.$set(tabs_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
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
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(largeheading);
    			destroy_component(tabs);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
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

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AboutUs", slots, []);
    	let TabItems = ["Why Us", "Who are We", "Mission", "Vision"];
    	let currentTab = "Why Us";

    	const handleTabChange = e => {
    		$$invalidate(0, currentTab = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AboutUs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LargeHeading,
    		Tabs,
    		WhyUs,
    		WhoAreWe,
    		Mission,
    		Vision,
    		TabItems,
    		currentTab,
    		handleTabChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("TabItems" in $$props) $$invalidate(1, TabItems = $$props.TabItems);
    		if ("currentTab" in $$props) $$invalidate(0, currentTab = $$props.currentTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentTab, TabItems, handleTabChange];
    }

    class AboutUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutUs",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/shared/Button.svelte generated by Svelte v3.38.2 */

    const file$c = "src/shared/Button.svelte";

    function create_fragment$d(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();

    			attr_dev(button, "class", button_class_value = "px-5 py-3 " + (/*rounded*/ ctx[1] ? "rounded-full" : "rounded-none") + " " + (/*inverted*/ ctx[2] && /*type*/ ctx[0] === "primary"
    			? "bg-none hover:bg-blue-500 hover:text-white text-blue-500 border-2 border-blue-500"
    			: /*inverted*/ ctx[2] && /*type*/ ctx[0] === "secondary"
    				? "ring-2 ring-green-400 text-green-400"
    				: !/*inverted*/ ctx[2] && /*type*/ ctx[0] === "primary"
    					? "bg-blue-600 text-white hover:bg-blue-500"
    					: !/*inverted*/ ctx[2] && /*type*/ ctx[0] === "secondary"
    						? "bg-red-400 hover:bg-red-500 text-white"
    						: "") + " ");

    			add_location(button, file$c, 6, 0, 118);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*rounded, inverted, type*/ 7 && button_class_value !== (button_class_value = "px-5 py-3 " + (/*rounded*/ ctx[1] ? "rounded-full" : "rounded-none") + " " + (/*inverted*/ ctx[2] && /*type*/ ctx[0] === "primary"
    			? "bg-none hover:bg-blue-500 hover:text-white text-blue-500 border-2 border-blue-500"
    			: /*inverted*/ ctx[2] && /*type*/ ctx[0] === "secondary"
    				? "ring-2 ring-green-400 text-green-400"
    				: !/*inverted*/ ctx[2] && /*type*/ ctx[0] === "primary"
    					? "bg-blue-600 text-white hover:bg-blue-500"
    					: !/*inverted*/ ctx[2] && /*type*/ ctx[0] === "secondary"
    						? "bg-red-400 hover:bg-red-500 text-white"
    						: "") + " ")) {
    				attr_dev(button, "class", button_class_value);
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
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { type = "primary" } = $$props;
    	let { rounded = false } = $$props;
    	let { inverted = false } = $$props;
    	const writable_props = ["type", "rounded", "inverted"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("rounded" in $$props) $$invalidate(1, rounded = $$props.rounded);
    		if ("inverted" in $$props) $$invalidate(2, inverted = $$props.inverted);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, rounded, inverted });

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("rounded" in $$props) $$invalidate(1, rounded = $$props.rounded);
    		if ("inverted" in $$props) $$invalidate(2, inverted = $$props.inverted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, rounded, inverted, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { type: 0, rounded: 1, inverted: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverted() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverted(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/Subtext.svelte generated by Svelte v3.38.2 */

    const file$b = "src/shared/Subtext.svelte";

    function create_fragment$c(ctx) {
    	let h4;
    	let h4_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			if (default_slot) default_slot.c();
    			attr_dev(h4, "class", h4_class_value = "text-lg md:text-md  p-5 flex items-center justify-center font-body " + (/*black*/ ctx[0] ? "text-white" : "text-gray-400"));
    			add_location(h4, file$b, 3, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);

    			if (default_slot) {
    				default_slot.m(h4, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*black*/ 1 && h4_class_value !== (h4_class_value = "text-lg md:text-md  p-5 flex items-center justify-center font-body " + (/*black*/ ctx[0] ? "text-white" : "text-gray-400"))) {
    				attr_dev(h4, "class", h4_class_value);
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
    			if (detaching) detach_dev(h4);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Subtext", slots, ['default']);
    	let { black = false } = $$props;
    	const writable_props = ["black"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Subtext> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("black" in $$props) $$invalidate(0, black = $$props.black);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ black });

    	$$self.$inject_state = $$props => {
    		if ("black" in $$props) $$invalidate(0, black = $$props.black);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [black, $$scope, slots];
    }

    class Subtext extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { black: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subtext",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get black() {
    		throw new Error("<Subtext>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set black(value) {
    		throw new Error("<Subtext>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Courses/CourseCard.svelte generated by Svelte v3.38.2 */
    const file$a = "src/components/Courses/CourseCard.svelte";

    // (9:4) <Subtext black={redCard}>
    function create_default_slot_1$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
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
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(9:4) <Subtext black={redCard}>",
    		ctx
    	});

    	return block;
    }

    // (12:4) <Button rounded type="{redCard?'secondary':'primary' }" inverted={!redCard}>
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Learn More..");
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
    		source: "(12:4) <Button rounded type=\\\"{redCard?'secondary':'primary' }\\\" inverted={!redCard}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let h2_class_value;
    	let t1;
    	let subtext;
    	let t2;
    	let button;
    	let div_class_value;
    	let current;

    	subtext = new Subtext({
    			props: {
    				black: /*redCard*/ ctx[0],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				rounded: true,
    				type: /*redCard*/ ctx[0] ? "secondary" : "primary",
    				inverted: !/*redCard*/ ctx[0],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*cardTitle*/ ctx[1]);
    			t1 = space();
    			create_component(subtext.$$.fragment);
    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(h2, "class", h2_class_value = "font-bold text-2xl " + (/*redCard*/ ctx[0] ? "text-white" : "text-black") + " font-Display");
    			add_location(h2, file$a, 7, 4, 302);
    			attr_dev(div, "class", div_class_value = "w-72 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 " + (/*redCard*/ ctx[0] ? "bg-blue-600 border-0" : "bg-none"));
    			add_location(div, file$a, 6, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			mount_component(subtext, div, null);
    			append_dev(div, t2);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*cardTitle*/ 2) set_data_dev(t0, /*cardTitle*/ ctx[1]);

    			if (!current || dirty & /*redCard*/ 1 && h2_class_value !== (h2_class_value = "font-bold text-2xl " + (/*redCard*/ ctx[0] ? "text-white" : "text-black") + " font-Display")) {
    				attr_dev(h2, "class", h2_class_value);
    			}

    			const subtext_changes = {};
    			if (dirty & /*redCard*/ 1) subtext_changes.black = /*redCard*/ ctx[0];

    			if (dirty & /*$$scope*/ 8) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);
    			const button_changes = {};
    			if (dirty & /*redCard*/ 1) button_changes.type = /*redCard*/ ctx[0] ? "secondary" : "primary";
    			if (dirty & /*redCard*/ 1) button_changes.inverted = !/*redCard*/ ctx[0];

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (!current || dirty & /*redCard*/ 1 && div_class_value !== (div_class_value = "w-72 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 " + (/*redCard*/ ctx[0] ? "bg-blue-600 border-0" : "bg-none"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtext.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtext.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(subtext);
    			destroy_component(button);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CourseCard", slots, ['default']);
    	let { redCard = false } = $$props;
    	let { cardTitle } = $$props;
    	const writable_props = ["redCard", "cardTitle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CourseCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("redCard" in $$props) $$invalidate(0, redCard = $$props.redCard);
    		if ("cardTitle" in $$props) $$invalidate(1, cardTitle = $$props.cardTitle);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Button, Subtext, redCard, cardTitle });

    	$$self.$inject_state = $$props => {
    		if ("redCard" in $$props) $$invalidate(0, redCard = $$props.redCard);
    		if ("cardTitle" in $$props) $$invalidate(1, cardTitle = $$props.cardTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [redCard, cardTitle, slots, $$scope];
    }

    class CourseCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { redCard: 0, cardTitle: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CourseCard",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cardTitle*/ ctx[1] === undefined && !("cardTitle" in props)) {
    			console.warn("<CourseCard> was created without expected prop 'cardTitle'");
    		}
    	}

    	get redCard() {
    		throw new Error("<CourseCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redCard(value) {
    		throw new Error("<CourseCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cardTitle() {
    		throw new Error("<CourseCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardTitle(value) {
    		throw new Error("<CourseCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Courses/CourseSection.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/components/Courses/CourseSection.svelte";

    // (9:0) <LargeHeading>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Courses We Offer");
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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(9:0) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (11:4) <CourseCard cardTitle="Course1">
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sapiente molestiae nostrum veniam provident aliquam unde eveniet temporibus. Aliquid, fuga.");
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
    		source: "(11:4) <CourseCard cardTitle=\\\"Course1\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:4) <CourseCard cardTitle="Course2" redCard>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sapiente molestiae nostrum veniam provident aliquam unde eveniet temporibus. Aliquid, fuga.");
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
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(14:4) <CourseCard cardTitle=\\\"Course2\\\" redCard>",
    		ctx
    	});

    	return block;
    }

    // (17:4) <CourseCard cardTitle="Course3">
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sapiente molestiae nostrum veniam provident aliquam unde eveniet temporibus. Aliquid, fuga.");
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
    		source: "(17:4) <CourseCard cardTitle=\\\"Course3\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section;
    	let largeheading;
    	let t0;
    	let div;
    	let coursecard0;
    	let t1;
    	let coursecard1;
    	let t2;
    	let coursecard2;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	coursecard0 = new CourseCard({
    			props: {
    				cardTitle: "Course1",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	coursecard1 = new CourseCard({
    			props: {
    				cardTitle: "Course2",
    				redCard: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	coursecard2 = new CourseCard({
    			props: {
    				cardTitle: "Course3",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(coursecard0.$$.fragment);
    			t1 = space();
    			create_component(coursecard1.$$.fragment);
    			t2 = space();
    			create_component(coursecard2.$$.fragment);
    			attr_dev(div, "class", "flex flex-col md:flex-row justify-center items-center text-center");
    			add_location(div, file$9, 9, 0, 219);
    			attr_dev(section, "id", "Courses");
    			attr_dev(section, "class", "text-center ");
    			add_location(section, file$9, 7, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(largeheading, section, null);
    			append_dev(section, t0);
    			append_dev(section, div);
    			mount_component(coursecard0, div, null);
    			append_dev(div, t1);
    			mount_component(coursecard1, div, null);
    			append_dev(div, t2);
    			mount_component(coursecard2, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const coursecard0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				coursecard0_changes.$$scope = { dirty, ctx };
    			}

    			coursecard0.$set(coursecard0_changes);
    			const coursecard1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				coursecard1_changes.$$scope = { dirty, ctx };
    			}

    			coursecard1.$set(coursecard1_changes);
    			const coursecard2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				coursecard2_changes.$$scope = { dirty, ctx };
    			}

    			coursecard2.$set(coursecard2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(coursecard0.$$.fragment, local);
    			transition_in(coursecard1.$$.fragment, local);
    			transition_in(coursecard2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(coursecard0.$$.fragment, local);
    			transition_out(coursecard1.$$.fragment, local);
    			transition_out(coursecard2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(largeheading);
    			destroy_component(coursecard0);
    			destroy_component(coursecard1);
    			destroy_component(coursecard2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CourseSection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CourseSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LargeHeading, CourseCard });
    	return [];
    }

    class CourseSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CourseSection",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/shared/Branding.svelte generated by Svelte v3.38.2 */

    const file$8 = "src/shared/Branding.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Edustar Fastrack";
    			if (img.src !== (img_src_value = "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Edustar Fastrack Logo");
    			add_location(img, file$8, 1, 4, 35);
    			add_location(h3, file$8, 2, 4, 80);
    			attr_dev(div, "class", "inline-block p-5");
    			add_location(div, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h3);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Branding", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Branding> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Branding extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Branding",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/shared/Navlinks.svelte generated by Svelte v3.38.2 */

    const file$7 = "src/shared/Navlinks.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:4) {#each navlinks as navlink(navlink.id)}
    function create_each_block(key_1, ctx) {
    	let li0;
    	let a;
    	let t_value = /*navlink*/ ctx[1].name + "";
    	let t;
    	let li1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li0 = element("li");
    			a = element("a");
    			t = text(t_value);
    			li1 = element("li");
    			attr_dev(a, "href", /*navlink*/ ctx[1].section);
    			attr_dev(a, "class", "hover:no-underline");
    			add_location(a, file$7, 13, 20, 439);
    			attr_dev(li0, "class", "p-5");
    			add_location(li0, file$7, 13, 4, 423);
    			add_location(li1, file$7, 13, 92, 511);
    			this.first = li0;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li0, anchor);
    			append_dev(li0, a);
    			append_dev(a, t);
    			insert_dev(target, li1, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li0);
    			if (detaching) detach_dev(li1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:4) {#each navlinks as navlink(navlink.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let nav;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*navlinks*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*navlink*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "flex flex-col md:flex-row");
    			add_location(ul, file$7, 11, 4, 336);
    			attr_dev(nav, "class", "md:inline-block hidden ");
    			add_location(nav, file$7, 10, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navlinks*/ 1) {
    				each_value = /*navlinks*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navlinks", slots, []);

    	let navlinks = [
    		{ id: 1, name: "Home", section: "#Home" },
    		{
    			id: 2,
    			name: "Courses",
    			section: "#Courses"
    		},
    		{
    			id: 3,
    			name: "AboutUs",
    			section: "#AboutUs"
    		},
    		{
    			id: 4,
    			name: "Testimonials",
    			section: "#Testimonials"
    		},
    		{
    			id: 5,
    			name: "Contact Us",
    			section: "#ContactUS"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navlinks> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ navlinks });

    	$$self.$inject_state = $$props => {
    		if ("navlinks" in $$props) $$invalidate(0, navlinks = $$props.navlinks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [navlinks];
    }

    class Navlinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navlinks",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/shared/Navbar.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/shared/Navbar.svelte";

    function create_fragment$7(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let i;
    	let t0;
    	let t1;
    	let div1;
    	let branding;
    	let t2;
    	let navlinks;
    	let current;
    	branding = new Branding({ $$inline: true });
    	navlinks = new Navlinks({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			i = element("i");
    			t0 = text("\n            +91 12345667890");
    			t1 = space();
    			div1 = element("div");
    			create_component(branding.$$.fragment);
    			t2 = space();
    			create_component(navlinks.$$.fragment);
    			attr_dev(i, "class", "fas fa-phone");
    			add_location(i, file$6, 8, 12, 266);
    			attr_dev(h3, "class", "bg-red-500 inline-block text-white p-2 mx-3");
    			add_location(h3, file$6, 7, 8, 197);
    			attr_dev(div0, "class", "flex justify-end");
    			add_location(div0, file$6, 6, 4, 158);
    			attr_dev(div1, "class", "flex flex-col md:flex-row items-center md:justify-between ");
    			add_location(div1, file$6, 12, 4, 352);
    			attr_dev(div2, "class", "fixed w-full bg-purple-100 z-10");
    			add_location(div2, file$6, 5, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(h3, i);
    			append_dev(h3, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(branding, div1, null);
    			append_dev(div1, t2);
    			mount_component(navlinks, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(branding.$$.fragment, local);
    			transition_in(navlinks.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(branding.$$.fragment, local);
    			transition_out(navlinks.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(branding);
    			destroy_component(navlinks);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Branding, Navlinks });
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Header/heroImgs.svelte generated by Svelte v3.38.2 */

    const file$5 = "src/components/Header/heroImgs.svelte";

    // (14:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (img.src !== (img_src_value = "/img/heroImg2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "absolute bottom-6 w-full");
    			add_location(img, file$5, 15, 4, 847);
    			attr_dev(path, "fill", "#0F62FE");
    			attr_dev(path, "d", "M43,-59.8C49.4,-54.4,44,-33.5,46.7,-17.1C49.5,-0.7,60.3,11.2,59.9,21.6C59.5,32,47.9,40.9,36,53.4C24.1,65.8,12.1,81.8,-2.9,85.7C-17.8,89.7,-35.6,81.6,-47.5,69.2C-59.4,56.8,-65.3,40,-69.7,23.4C-74.1,6.8,-76.9,-9.5,-73.8,-25.5C-70.7,-41.5,-61.8,-57.2,-48.6,-60.3C-35.3,-63.4,-17.6,-53.9,0.3,-54.3C18.3,-54.8,36.5,-65.1,43,-59.8Z");
    			attr_dev(path, "transform", "translate(100 100)");
    			add_location(path, file$5, 17, 4, 984);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 16, 0, 917);
    			attr_dev(div, "class", "absolute w-96 md:w-72 lg:w-96  bottom-36 md:right-2  hidden  md:block");
    			add_location(div, file$5, 14, 0, 759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(14:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if blue===true}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (img.src !== (img_src_value = "/img/heroImg1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "absolute w-full");
    			add_location(img, file$5, 7, 8, 191);
    			attr_dev(path, "fill", "#ff784e");
    			attr_dev(path, "d", "M33.8,-45.7C46.3,-37.4,60.8,-30.9,64.8,-20.6C68.8,-10.2,62.4,4,58.1,19.4C53.8,34.8,51.7,51.5,42.3,58.8C33,66.1,16.5,64.1,-1.3,65.9C-19.1,67.6,-38.1,73.2,-46.9,65.7C-55.7,58.2,-54.1,37.6,-57.3,20.4C-60.4,3.2,-68.1,-10.7,-66.2,-23.1C-64.4,-35.5,-53,-46.3,-40.3,-54.6C-27.7,-62.9,-13.8,-68.6,-1.6,-66.4C10.6,-64.2,21.2,-54,33.8,-45.7Z");
    			attr_dev(path, "transform", "translate(100 100)");
    			add_location(path, file$5, 9, 8, 327);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 8, 4, 256);
    			attr_dev(div0, "class", "absolute w-96  md:w-72 lg:w-96   md:bottom-36 md:left-2");
    			add_location(div0, file$5, 6, 4, 113);
    			attr_dev(div1, "class", "flex  md:block justify-center");
    			add_location(div1, file$5, 5, 0, 65);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(5:0) {#if blue===true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*blue*/ ctx[0] === true) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HeroImgs", slots, []);
    	let { blue = false } = $$props;
    	const writable_props = ["blue"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeroImgs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("blue" in $$props) $$invalidate(0, blue = $$props.blue);
    	};

    	$$self.$capture_state = () => ({ blue });

    	$$self.$inject_state = $$props => {
    		if ("blue" in $$props) $$invalidate(0, blue = $$props.blue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [blue];
    }

    class HeroImgs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { blue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroImgs",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get blue() {
    		throw new Error("<HeroImgs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blue(value) {
    		throw new Error("<HeroImgs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header/HeroSection.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/Header/HeroSection.svelte";

    // (11:4) <LargeHeading>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Edustar Nedumkandam");
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
    		source: "(11:4) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (15:4) <Subtext>
    function create_default_slot_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut temporibus recusandae, incidunt mollitia qui quos obcaecati cumque. Maiores, reprehenderit provident?";
    			attr_dev(p, "class", "w-3/4 md:w-2/3 hidden md:block");
    			add_location(p, file$4, 15, 8, 603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(15:4) <Subtext>",
    		ctx
    	});

    	return block;
    }

    // (18:0) <Button type="primary" rounded={true}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Enroll Now");
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
    		source: "(18:0) <Button type=\\\"primary\\\" rounded={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let largeheading;
    	let t0;
    	let h1;
    	let t2;
    	let subtext;
    	let t3;
    	let button;
    	let t4;
    	let heroimgs0;
    	let t5;
    	let heroimgs1;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	subtext = new Subtext({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				type: "primary",
    				rounded: true,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	heroimgs0 = new HeroImgs({ $$inline: true });
    	heroimgs1 = new HeroImgs({ props: { blue: true }, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Fastrack your foriegn Dreams with edustar IELTS coaching";
    			t2 = space();
    			create_component(subtext.$$.fragment);
    			t3 = space();
    			create_component(button.$$.fragment);
    			t4 = space();
    			create_component(heroimgs0.$$.fragment);
    			t5 = space();
    			create_component(heroimgs1.$$.fragment);
    			attr_dev(h1, "class", "text-4xl md:text-5xl lg:text-6xl p-5 font-Display");
    			add_location(h1, file$4, 11, 4, 443);
    			attr_dev(div0, "class", "md:w-1/2 w-full");
    			add_location(div0, file$4, 9, 4, 356);
    			attr_dev(div1, "class", "text-center flex flex-col justify-center items-center h-full py-48 md:pb-36 mb-48 md:mb-0 relative");
    			add_location(div1, file$4, 8, 0, 239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(largeheading, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			mount_component(subtext, div0, null);
    			append_dev(div0, t3);
    			mount_component(button, div0, null);
    			append_dev(div0, t4);
    			mount_component(heroimgs0, div0, null);
    			append_dev(div0, t5);
    			mount_component(heroimgs1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const subtext_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(subtext.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(heroimgs0.$$.fragment, local);
    			transition_in(heroimgs1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(subtext.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(heroimgs0.$$.fragment, local);
    			transition_out(heroimgs1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(largeheading);
    			destroy_component(subtext);
    			destroy_component(button);
    			destroy_component(heroimgs0);
    			destroy_component(heroimgs1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HeroSection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeroSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button, LargeHeading, Subtext, HeroImgs });
    	return [];
    }

    class HeroSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroSection",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Header/Header.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/Header/Header.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let navbar;
    	let t;
    	let herosection;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	herosection = new HeroSection({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(herosection.$$.fragment);
    			attr_dev(section, "class", "");
    			attr_dev(section, "id", "#Home");
    			add_location(section, file$3, 5, 0, 125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t);
    			mount_component(herosection, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(herosection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(herosection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			destroy_component(herosection);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, HeroSection });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/testimonials/TestmContent.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/components/testimonials/TestmContent.svelte";

    // (8:19) Lorem ipsum dolor sit amet consectetur adipisicing elit. Error, voluptas.
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Error, voluptas.");
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
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(8:19) Lorem ipsum dolor sit amet consectetur adipisicing elit. Error, voluptas.",
    		ctx
    	});

    	return block;
    }

    // (8:4) <Subtext>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
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
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(8:4) <Subtext>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let h3;
    	let t1;
    	let subtext;
    	let t2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t3;
    	let div0;
    	let h4;
    	let t5;
    	let p;
    	let current;

    	subtext = new Subtext({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Life changing Course";
    			t1 = space();
    			create_component(subtext.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			img = element("img");
    			t3 = space();
    			div0 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Melbin C M";
    			t5 = space();
    			p = element("p");
    			p.textContent = "Engineer,Google,California";
    			add_location(h3, file$2, 6, 4, 94);
    			if (img.src !== (img_src_value = "/img/Melbin.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Melbin");
    			attr_dev(img, "class", "w-24 rounded-full");
    			add_location(img, file$2, 9, 8, 261);
    			add_location(h4, file$2, 11, 12, 363);
    			add_location(p, file$2, 12, 12, 395);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$2, 10, 8, 336);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$2, 8, 4, 238);
    			attr_dev(div2, "class", "p-5");
    			add_location(div2, file$2, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(div2, t1);
    			mount_component(subtext, div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(div0, t5);
    			append_dev(div0, p);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const subtext_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(subtext);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TestmContent", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestmContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Subtext });
    	return [slots, $$scope];
    }

    class TestmContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestmContent",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/testimonials/TestmNav.svelte generated by Svelte v3.38.2 */

    function create_fragment$2(ctx) {
    	const block = {
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
    	validate_slots("TestmNav", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestmNav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TestmNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestmNav",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/testimonials/Testimonials.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/components/testimonials/Testimonials.svelte";

    // (10:8) <LargeHeading>
    function create_default_slot(ctx) {
    	let div;
    	let i;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			h2 = element("h2");
    			h2.textContent = "What People are Saying about Edustar?";
    			attr_dev(i, "class", "fas fa-quote-left absolute text-gray-300 text-6xl");
    			add_location(i, file$1, 9, 37, 349);
    			attr_dev(h2, "class", "text-left relative pt-10 pl-3");
    			add_location(h2, file$1, 9, 102, 414);
    			attr_dev(div, "class", "");
    			add_location(div, file$1, 9, 23, 335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(10:8) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let div0;
    	let largeheading;
    	let t0;
    	let testmnav;
    	let t1;
    	let div1;
    	let testmcontent;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	testmnav = new TestmNav({ $$inline: true });
    	testmcontent = new TestmContent({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			create_component(testmnav.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(testmcontent.$$.fragment);
    			attr_dev(div0, "class", "flex justify-between");
    			add_location(div0, file$1, 8, 4, 277);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$1, 12, 0, 552);
    			attr_dev(section, "id", "#Testimonials");
    			attr_dev(section, "class", "p-5 flex flex-col justify-center items-center w-full md:w-2/3");
    			add_location(section, file$1, 7, 0, 174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(largeheading, div0, null);
    			append_dev(div0, t0);
    			mount_component(testmnav, div0, null);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			mount_component(testmcontent, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(testmnav.$$.fragment, local);
    			transition_in(testmcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(testmnav.$$.fragment, local);
    			transition_out(testmcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(largeheading);
    			destroy_component(testmnav);
    			destroy_component(testmcontent);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testimonials", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testimonials> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LargeHeading, TestmContent, TestmNav });
    	return [];
    }

    class Testimonials extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonials",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let coursesection;
    	let t1;
    	let aboutus;
    	let t2;
    	let testimonials;
    	let current;
    	header = new Header({ $$inline: true });
    	coursesection = new CourseSection({ $$inline: true });
    	aboutus = new AboutUs({ $$inline: true });
    	testimonials = new Testimonials({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(coursesection.$$.fragment);
    			t1 = space();
    			create_component(aboutus.$$.fragment);
    			t2 = space();
    			create_component(testimonials.$$.fragment);
    			add_location(main, file, 11, 0, 284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(coursesection, main, null);
    			append_dev(main, t1);
    			mount_component(aboutus, main, null);
    			append_dev(main, t2);
    			mount_component(testimonials, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(coursesection.$$.fragment, local);
    			transition_in(aboutus.$$.fragment, local);
    			transition_in(testimonials.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(coursesection.$$.fragment, local);
    			transition_out(aboutus.$$.fragment, local);
    			transition_out(testimonials.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(coursesection);
    			destroy_component(aboutus);
    			destroy_component(testimonials);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AboutUs,
    		CourseSection,
    		Header,
    		Testimonials
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
