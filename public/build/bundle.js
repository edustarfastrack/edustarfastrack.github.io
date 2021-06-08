
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    /* node_modules/svelte-intersection-observer/src/IntersectionObserver.svelte generated by Svelte v3.38.2 */

    const get_default_slot_changes = dirty => ({
    	intersecting: dirty & /*intersecting*/ 2,
    	entry: dirty & /*entry*/ 1,
    	observer: dirty & /*observer*/ 4
    });

    const get_default_slot_context = ctx => ({
    	intersecting: /*intersecting*/ ctx[1],
    	entry: /*entry*/ ctx[0],
    	observer: /*observer*/ ctx[2]
    });

    function create_fragment$G(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, intersecting, entry, observer*/ 263)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes, get_default_slot_context);
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
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IntersectionObserver", slots, ['default']);
    	let { element = null } = $$props;
    	let { once = false } = $$props;
    	let { root = null } = $$props;
    	let { rootMargin = "0px" } = $$props;
    	let { threshold = 0 } = $$props;
    	let { entry = null } = $$props;
    	let { intersecting = false } = $$props;
    	let { observer = null } = $$props;
    	const dispatch = createEventDispatcher();
    	let prevRootMargin = null;
    	let prevElement = null;

    	const initialize = () => {
    		$$invalidate(2, observer = new IntersectionObserver(entries => {
    				entries.forEach(_entry => {
    					$$invalidate(0, entry = _entry);
    					$$invalidate(1, intersecting = _entry.isIntersecting);
    				});
    			},
    		{ root, rootMargin, threshold }));
    	};

    	onMount(() => {
    		initialize();

    		return () => {
    			if (observer) observer.disconnect();
    		};
    	});

    	afterUpdate(async () => {
    		if (entry !== null) {
    			dispatch("observe", entry);

    			if (entry.isIntersecting) {
    				dispatch("intersect", entry);
    				if (once) observer.unobserve(element);
    			}
    		}

    		await tick();

    		if (element !== null && element !== prevElement) {
    			observer.observe(element);
    			if (prevElement !== null) observer.unobserve(prevElement);
    			prevElement = element;
    		}

    		if (prevRootMargin && rootMargin !== prevRootMargin) {
    			observer.disconnect();
    			prevElement = null;
    			initialize();
    		}

    		prevRootMargin = rootMargin;
    	});

    	const writable_props = [
    		"element",
    		"once",
    		"root",
    		"rootMargin",
    		"threshold",
    		"entry",
    		"intersecting",
    		"observer"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntersectionObserver> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("once" in $$props) $$invalidate(4, once = $$props.once);
    		if ("root" in $$props) $$invalidate(5, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("observer" in $$props) $$invalidate(2, observer = $$props.observer);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		entry,
    		intersecting,
    		observer,
    		tick,
    		createEventDispatcher,
    		afterUpdate,
    		onMount,
    		dispatch,
    		prevRootMargin,
    		prevElement,
    		initialize
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("once" in $$props) $$invalidate(4, once = $$props.once);
    		if ("root" in $$props) $$invalidate(5, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("observer" in $$props) $$invalidate(2, observer = $$props.observer);
    		if ("prevRootMargin" in $$props) prevRootMargin = $$props.prevRootMargin;
    		if ("prevElement" in $$props) prevElement = $$props.prevElement;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		entry,
    		intersecting,
    		observer,
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		$$scope,
    		slots
    	];
    }

    class IntersectionObserver_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {
    			element: 3,
    			once: 4,
    			root: 5,
    			rootMargin: 6,
    			threshold: 7,
    			entry: 0,
    			intersecting: 1,
    			observer: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntersectionObserver_1",
    			options,
    			id: create_fragment$G.name
    		});
    	}

    	get element() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get once() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rootMargin() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootMargin(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entry() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intersecting() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intersecting(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get observer() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set observer(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/LargeHeading.svelte generated by Svelte v3.38.2 */

    const file$D = "src/shared/LargeHeading.svelte";

    function create_fragment$F(ctx) {
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
    			add_location(h3, file$D, 3, 0, 46);
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
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, { black: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LargeHeading",
    			options,
    			id: create_fragment$F.name
    		});
    	}

    	get black() {
    		throw new Error("<LargeHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set black(value) {
    		throw new Error("<LargeHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/shared/Tabs.svelte generated by Svelte v3.38.2 */
    const file$C = "src/shared/Tabs.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (17:8) {#each TabItems as Tab}
    function create_each_block_1$1(ctx) {
    	let h2;
    	let t_value = /*Tab*/ ctx[7].name + "";
    	let t;
    	let h2_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*Tab*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(t_value);

    			attr_dev(h2, "class", h2_class_value = "font-Display text-2xl md:text-3xl p-3 cursor-pointer " + (/*currentTab*/ ctx[3] === /*Tab*/ ctx[7].name && /*TabRed*/ ctx[2] === false
    			? "border-b-4 border-blue-500"
    			: /*currentTab*/ ctx[3] === /*Tab*/ ctx[7].name && /*TabRed*/ ctx[2] === true
    				? "border-b-4 border-yellow-500"
    				: ""));

    			add_location(h2, file$C, 17, 11, 380);
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
    			if (dirty & /*TabItems*/ 2 && t_value !== (t_value = /*Tab*/ ctx[7].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*currentTab, TabItems, TabRed*/ 14 && h2_class_value !== (h2_class_value = "font-Display text-2xl md:text-3xl p-3 cursor-pointer " + (/*currentTab*/ ctx[3] === /*Tab*/ ctx[7].name && /*TabRed*/ ctx[2] === false
    			? "border-b-4 border-blue-500"
    			: /*currentTab*/ ctx[3] === /*Tab*/ ctx[7].name && /*TabRed*/ ctx[2] === true
    				? "border-b-4 border-yellow-500"
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(17:8) {#each TabItems as Tab}",
    		ctx
    	});

    	return block;
    }

    // (26:0) {#if sideNav }
    function create_if_block$c(ctx) {
    	let div1;
    	let div0;
    	let div1_transition;
    	let current;
    	let each_value = /*TabItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex flex-col justify-center items-center flex-wrap py-5");
    			add_location(div0, file$C, 27, 4, 788);
    			attr_dev(div1, "class", "fixed left-0 top-1/2 z-50");
    			add_location(div1, file$C, 26, 0, 728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentTab, TabItems, dispatch*/ 26) {
    				each_value = /*TabItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(26:0) {#if sideNav }",
    		ctx
    	});

    	return block;
    }

    // (29:8) {#each TabItems as Tab}
    function create_each_block$4(ctx) {
    	let h2;
    	let span;
    	let span_class_value;
    	let h2_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*Tab*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			span = element("span");
    			attr_dev(span, "class", span_class_value = /*Tab*/ ctx[7].icon);
    			add_location(span, file$C, 32, 17, 1134);

    			attr_dev(h2, "class", h2_class_value = "font-Display text-2xl px-3 p-2 m-2 bg-gray-600 text-white cursor-pointer rounded-full " + (/*currentTab*/ ctx[3] === /*Tab*/ ctx[7].name
    			? " text-blue-500"
    			: ""));

    			add_location(h2, file$C, 30, 12, 912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, span);

    			if (!mounted) {
    				dispose = listen_dev(h2, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*TabItems*/ 2 && span_class_value !== (span_class_value = /*Tab*/ ctx[7].icon)) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*currentTab, TabItems*/ 10 && h2_class_value !== (h2_class_value = "font-Display text-2xl px-3 p-2 m-2 bg-gray-600 text-white cursor-pointer rounded-full " + (/*currentTab*/ ctx[3] === /*Tab*/ ctx[7].name
    			? " text-blue-500"
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(29:8) {#each TabItems as Tab}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$E(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value_1 = /*TabItems*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block = /*sideNav*/ ctx[0] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "flex justify-center items-center flex-wrap py-5");
    			add_location(div0, file$C, 15, 4, 275);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file$C, 13, 0, 245);
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

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentTab, TabItems, TabRed, dispatch*/ 30) {
    				each_value_1 = /*TabItems*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*sideNav*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*sideNav*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$E($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, []);
    	let { sideNav = false } = $$props;
    	let dispatch = createEventDispatcher();
    	let { TabItems } = $$props;
    	let { TabRed = false } = $$props;
    	let { currentTab } = $$props;
    	const writable_props = ["sideNav", "TabItems", "TabRed", "currentTab"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = Tab => {
    		dispatch("tabChange", Tab.name);
    	};

    	const click_handler_1 = Tab => {
    		dispatch("tabChange", Tab.name);
    	};

    	$$self.$$set = $$props => {
    		if ("sideNav" in $$props) $$invalidate(0, sideNav = $$props.sideNav);
    		if ("TabItems" in $$props) $$invalidate(1, TabItems = $$props.TabItems);
    		if ("TabRed" in $$props) $$invalidate(2, TabRed = $$props.TabRed);
    		if ("currentTab" in $$props) $$invalidate(3, currentTab = $$props.currentTab);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		sideNav,
    		dispatch,
    		TabItems,
    		TabRed,
    		currentTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("sideNav" in $$props) $$invalidate(0, sideNav = $$props.sideNav);
    		if ("dispatch" in $$props) $$invalidate(4, dispatch = $$props.dispatch);
    		if ("TabItems" in $$props) $$invalidate(1, TabItems = $$props.TabItems);
    		if ("TabRed" in $$props) $$invalidate(2, TabRed = $$props.TabRed);
    		if ("currentTab" in $$props) $$invalidate(3, currentTab = $$props.currentTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sideNav,
    		TabItems,
    		TabRed,
    		currentTab,
    		dispatch,
    		click_handler,
    		click_handler_1
    	];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {
    			sideNav: 0,
    			TabItems: 1,
    			TabRed: 2,
    			currentTab: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$E.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*TabItems*/ ctx[1] === undefined && !("TabItems" in props)) {
    			console.warn("<Tabs> was created without expected prop 'TabItems'");
    		}

    		if (/*currentTab*/ ctx[3] === undefined && !("currentTab" in props)) {
    			console.warn("<Tabs> was created without expected prop 'currentTab'");
    		}
    	}

    	get sideNav() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sideNav(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get TabItems() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set TabItems(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get TabRed() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set TabRed(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentTab() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentTab(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/about/ImageSlide.svelte generated by Svelte v3.38.2 */
    const file$B = "src/components/about/ImageSlide.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (36:3) {#if img.id===currentImage}
    function create_if_block$b(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t1_value = /*img*/ ctx[4].studentName + "";
    	let t1;
    	let t2;
    	let br;
    	let t3;
    	let span;
    	let t4_value = /*img*/ ctx[4].score + "";
    	let t4;
    	let t5;
    	let i;
    	let t6;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			span = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			i = element("i");
    			t6 = space();
    			if (img.src !== (img_src_value = "/img/" + /*img*/ ctx[4].name)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*img*/ ctx[4].name);
    			attr_dev(img, "class", "absolute");
    			add_location(img, file$B, 38, 8, 748);
    			add_location(br, file$B, 39, 90, 900);
    			attr_dev(i, "class", "fas fa-certificate text-yellow-300 text-2xl");
    			add_location(i, file$B, 39, 140, 950);
    			attr_dev(span, "class", "font-bold text-2xl");
    			add_location(span, file$B, 39, 95, 905);
    			attr_dev(p, "class", "bg-blue-500 p-3 absolute text-white bottom-0 right-0");
    			add_location(p, file$B, 39, 8, 818);
    			attr_dev(a, "href", "/img/" + /*img*/ ctx[4].name);
    			attr_dev(a, "data-lightbox", /*img*/ ctx[4].name);
    			attr_dev(a, "data-title", /*img*/ ctx[4].name);
    			add_location(a, file$B, 37, 7, 662);
    			attr_dev(div, "class", " ");
    			add_location(div, file$B, 36, 3, 622);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(a, t0);
    			append_dev(a, p);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, br);
    			append_dev(p, t3);
    			append_dev(p, span);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			append_dev(span, i);
    			append_dev(div, t6);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(36:3) {#if img.id===currentImage}",
    		ctx
    	});

    	return block;
    }

    // (35:3) {#each images as img}
    function create_each_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*img*/ ctx[4].id === /*currentImage*/ ctx[0] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*img*/ ctx[4].id === /*currentImage*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentImage*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(35:3) {#each images as img}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let div;
    	let current;
    	let each_value = /*images*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "relative md:w-96 w-72 md:h-105 h-96 text-center ring-2 ");
    			add_location(div, file$B, 32, 0, 487);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images, currentImage*/ 3) {
    				each_value = /*images*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ImageSlide", slots, []);

    	let images = [
    		{
    			id: 1,
    			name: "scoreSheet1.jpeg",
    			studentName: "Josna",
    			score: 7.2
    		},
    		{
    			id: 2,
    			name: "scoreSheet2.jpeg",
    			studentName: "Mariyamma",
    			score: 7.2
    		}
    	];

    	let maxImage = 2, currentImage = 1;

    	let interval = setInterval(
    		() => {
    			if (currentImage >= maxImage) {
    				$$invalidate(0, currentImage = 1);
    			} else {
    				$$invalidate(0, currentImage++, currentImage);
    			}
    		},
    		3000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImageSlide> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		images,
    		maxImage,
    		currentImage,
    		interval
    	});

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("maxImage" in $$props) maxImage = $$props.maxImage;
    		if ("currentImage" in $$props) $$invalidate(0, currentImage = $$props.currentImage);
    		if ("interval" in $$props) interval = $$props.interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentImage*/ 1) ;
    	};

    	return [currentImage, images];
    }

    class ImageSlide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageSlide",
    			options,
    			id: create_fragment$D.name
    		});
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

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/components/about/WhyUs.svelte generated by Svelte v3.38.2 */
    const file$A = "src/components/about/WhyUs.svelte";

    // (23:8) <IntersectionObserver {element} bind:intersecting>
    function create_default_slot$d(ctx) {
    	let div3;
    	let div0;
    	let h30;
    	let t0_value = /*$value*/ ctx[2].toFixed(0) + "";
    	let t0;
    	let t1;
    	let t2;
    	let p0;
    	let t4;
    	let div1;
    	let h31;
    	let t5_value = /*$value*/ ctx[2].toFixed(0) / 10 + "";
    	let t5;
    	let t6;
    	let t7;
    	let p1;
    	let t9;
    	let div2;
    	let h32;
    	let t10_value = /*$value*/ ctx[2].toFixed(0) + "";
    	let t10;
    	let t11;
    	let t12;
    	let p2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = text("+");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Happy Students";
    			t4 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			t5 = text(t5_value);
    			t6 = text("+");
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "Years of Experience";
    			t9 = space();
    			div2 = element("div");
    			h32 = element("h3");
    			t10 = text(t10_value);
    			t11 = text("%");
    			t12 = space();
    			p2 = element("p");
    			p2.textContent = "Success Ratio";
    			attr_dev(h30, "class", "font-bold font-Display text-5xl text-blue-600 mx-10");
    			add_location(h30, file$A, 25, 16, 796);
    			attr_dev(p0, "class", "font-body text-xl");
    			add_location(p0, file$A, 26, 16, 902);
    			attr_dev(div0, "class", "p-3");
    			add_location(div0, file$A, 24, 12, 762);
    			attr_dev(h31, "class", "font-bold font-Display text-5xl text-red-600 mx-10");
    			add_location(h31, file$A, 29, 16, 1015);
    			attr_dev(p1, "class", "font-body text-xl");
    			add_location(p1, file$A, 30, 16, 1123);
    			attr_dev(div1, "class", "p-3");
    			add_location(div1, file$A, 28, 12, 981);
    			attr_dev(h32, "class", "font-bold font-Display text-5xl text-blue-600 mx-10");
    			add_location(h32, file$A, 33, 16, 1241);
    			attr_dev(p2, "class", "font-body text-xl");
    			add_location(p2, file$A, 34, 16, 1347);
    			attr_dev(div2, "class", "p-3");
    			add_location(div2, file$A, 32, 12, 1207);
    			attr_dev(div3, "class", "py-24 flex flex-col md:flex-row flex-wrap justify-center items-center overflow-hidden w-full");
    			add_location(div3, file$A, 23, 8, 623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h30);
    			append_dev(h30, t0);
    			append_dev(h30, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, h31);
    			append_dev(h31, t5);
    			append_dev(h31, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, h32);
    			append_dev(h32, t10);
    			append_dev(h32, t11);
    			append_dev(div2, t12);
    			append_dev(div2, p2);
    			/*div3_binding*/ ctx[4](div3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$value*/ 4 && t0_value !== (t0_value = /*$value*/ ctx[2].toFixed(0) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$value*/ 4 && t5_value !== (t5_value = /*$value*/ ctx[2].toFixed(0) / 10 + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$value*/ 4 && t10_value !== (t10_value = /*$value*/ ctx[2].toFixed(0) + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*div3_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(23:8) <IntersectionObserver {element} bind:intersecting>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
    	let div12;
    	let div11;
    	let div0;
    	let imageslide;
    	let t0;
    	let intersectionobserver;
    	let updating_intersecting;
    	let t1;
    	let div10;
    	let div3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div2;
    	let h20;
    	let t4;
    	let p0;
    	let strong0;
    	let t6;
    	let t7;
    	let div6;
    	let div4;
    	let h21;
    	let t9;
    	let p1;
    	let t10;
    	let strong1;
    	let t12;
    	let strong2;
    	let t14;
    	let strong3;
    	let t16;
    	let t17;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t18;
    	let div9;
    	let div7;
    	let img2;
    	let img2_src_value;
    	let t19;
    	let div8;
    	let h22;
    	let t21;
    	let p2;
    	let t22;
    	let strong4;
    	let t24;
    	let strong5;
    	let t26;
    	let strong6;
    	let t28;
    	let strong7;
    	let t30;
    	let current;
    	imageslide = new ImageSlide({ $$inline: true });

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[5](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[1],
    		$$slots: { default: [create_default_slot$d] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[0] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[0];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "intersecting", intersectionobserver_intersecting_binding));

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div11 = element("div");
    			div0 = element("div");
    			create_component(imageslide.$$.fragment);
    			t0 = space();
    			create_component(intersectionobserver.$$.fragment);
    			t1 = space();
    			div10 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Excellent Faculty";
    			t4 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Sunil Devaprabha PhD (HC)";
    			t6 = text("  was a School teacher for 15 years turned British Council Trained Trainer and Success Coach.  An energetic Motivator, he has been sharing strategic skill, success tools and core values to the masses. He specializes in Positive Thinking and Peak Performance.  A passionate coach, he has trained and motivated over 30,000 students on Goal Setting, Energy, Rapport Building, Teachers Training, Parental Guidance, and Emotional Intelligence. With 18 years of teaching experience; 2004 onwards he has started his career as a resource person for teachers and conducted more than 150 sessions across the state (Kerala) alone.");
    			t7 = space();
    			div6 = element("div");
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "100% Effective Learning Methods";
    			t9 = space();
    			p1 = element("p");
    			t10 = text("English speaking is compulsory in the institute.  We always ensure that students get some new pieces of information every day.  In every module we have a structure that is unique. Getting together during the festival season is part of our timetable. We also facilitate ");
    			strong1 = element("strong");
    			strong1.textContent = "interaction between students and people from English speaking countries";
    			t12 = text(".  We ensure that individual attention is given to all students. We always see to it that the latest study materials are given which helps the students in getting extra information and latest trends.  We give students a ");
    			strong2 = element("strong");
    			strong2.textContent = "test every week in the original IELTS format";
    			t14 = text(" that provides them an entire picture of how the exam is given and this removes the fear and prepares them to face the exam confidently.  Generally, speaking is the toughest area for most non-English speaking students. Anticipating this problem, we give individual speeches everyday to exam–going students.  We give extra listening in the morning every day.  No doubt, this has helped students score satisfactorily in the listening module. ");
    			strong3 = element("strong");
    			strong3.textContent = "VOA News and BBC news listening";
    			t16 = text("  help students improve their speaking and understanding skills");
    			t17 = space();
    			div5 = element("div");
    			img1 = element("img");
    			t18 = space();
    			div9 = element("div");
    			div7 = element("div");
    			img2 = element("img");
    			t19 = space();
    			div8 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Certified And Trustworthy";
    			t21 = space();
    			p2 = element("p");
    			t22 = text("Sunil Devaprabha completed his ");
    			strong4 = element("strong");
    			strong4.textContent = "PhD in Education (Effective Pedagogy)";
    			t24 = text("  from Commonwealth Vocational University New-Delhi a Registered agent of CVU Nuku’alofa, Tongatapu, Kingdom of Tonga\n                    He is a certified ");
    			strong5 = element("strong");
    			strong5.textContent = "`Train the Trainer’";
    			t26 = text("  by the ");
    			strong6 = element("strong");
    			strong6.textContent = "British Council-Chennai";
    			t28 = text("  and ");
    			strong7 = element("strong");
    			strong7.textContent = "IDP-Kochi";
    			t30 = text(" .");
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$A, 19, 8, 468);
    			if (img0.src !== (img0_src_value = "/img/devaprabha1.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Dr.sunil Devaprabha");
    			attr_dev(img0, "class", "p-5 rounded-left");
    			add_location(img0, file$A, 42, 20, 1658);
    			attr_dev(div1, "class", "md:w-1/3 relative");
    			add_location(div1, file$A, 41, 16, 1606);
    			attr_dev(h20, "class", "font-Display font-bold text-3xl p-2");
    			add_location(h20, file$A, 46, 16, 1846);
    			add_location(strong0, file$A, 47, 31, 1948);
    			attr_dev(p0, "class", "p-2");
    			add_location(p0, file$A, 47, 16, 1933);
    			attr_dev(div2, "class", " md:text-right w-full md:w-2/3");
    			add_location(div2, file$A, 45, 12, 1785);
    			attr_dev(div3, "class", "flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap");
    			add_location(div3, file$A, 39, 8, 1491);
    			attr_dev(h21, "class", "font-Display font-bold text-3xl p-2");
    			add_location(h21, file$A, 55, 16, 2863);
    			add_location(strong1, file$A, 56, 300, 3248);
    			add_location(strong2, file$A, 56, 608, 3556);
    			add_location(strong3, file$A, 56, 1110, 4058);
    			attr_dev(p1, "class", "p-2");
    			add_location(p1, file$A, 56, 16, 2964);
    			attr_dev(div4, "class", " md:text-left md:w-2/3 md:order-1 order-2");
    			add_location(div4, file$A, 54, 12, 2791);
    			if (img1.src !== (img1_src_value = "/img/ClassRoom1.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Dr.sunil Devaprabha");
    			attr_dev(img1, "class", "p-5 rounded-left");
    			add_location(img1, file$A, 60, 16, 4293);
    			attr_dev(div5, "class", "md:w-1/3 relative md:order-2 order-1");
    			add_location(div5, file$A, 59, 12, 4226);
    			attr_dev(div6, "class", "flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap");
    			add_location(div6, file$A, 50, 8, 2656);
    			if (img2.src !== (img2_src_value = "/img/trust.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Dr.sunil Devaprabha");
    			attr_dev(img2, "class", "p-5 rounded-left");
    			add_location(img2, file$A, 66, 16, 4578);
    			attr_dev(div7, "class", "md:w-1/3 relative");
    			add_location(div7, file$A, 65, 12, 4530);
    			attr_dev(h22, "class", "font-Display font-bold text-3xl p-2");
    			add_location(h22, file$A, 71, 16, 4763);
    			add_location(strong4, file$A, 72, 62, 4904);
    			add_location(strong5, file$A, 73, 38, 5114);
    			add_location(strong6, file$A, 73, 83, 5159);
    			add_location(strong7, file$A, 73, 129, 5205);
    			attr_dev(p2, "class", "p-2");
    			add_location(p2, file$A, 72, 16, 4858);
    			attr_dev(div8, "class", "md:text-right md:w-2/3");
    			add_location(div8, file$A, 69, 12, 4694);
    			attr_dev(div9, "class", "flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap");
    			add_location(div9, file$A, 63, 8, 4419);
    			attr_dev(div10, "class", "md:w-140");
    			add_location(div10, file$A, 38, 4, 1460);
    			attr_dev(div11, "class", "");
    			add_location(div11, file$A, 18, 4, 445);
    			attr_dev(div12, "class", "p-5 text-center flex flex-col items-center justify-center");
    			add_location(div12, file$A, 17, 0, 369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			append_dev(div11, div0);
    			mount_component(imageslide, div0, null);
    			append_dev(div11, t0);
    			mount_component(intersectionobserver, div11, null);
    			append_dev(div11, t1);
    			append_dev(div11, div10);
    			append_dev(div10, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img0);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, h20);
    			append_dev(div2, t4);
    			append_dev(div2, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t6);
    			append_dev(div10, t7);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t9);
    			append_dev(div4, p1);
    			append_dev(p1, t10);
    			append_dev(p1, strong1);
    			append_dev(p1, t12);
    			append_dev(p1, strong2);
    			append_dev(p1, t14);
    			append_dev(p1, strong3);
    			append_dev(p1, t16);
    			append_dev(div6, t17);
    			append_dev(div6, div5);
    			append_dev(div5, img1);
    			append_dev(div10, t18);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, img2);
    			append_dev(div9, t19);
    			append_dev(div9, div8);
    			append_dev(div8, h22);
    			append_dev(div8, t21);
    			append_dev(div8, p2);
    			append_dev(p2, t22);
    			append_dev(p2, strong4);
    			append_dev(p2, t24);
    			append_dev(p2, strong5);
    			append_dev(p2, t26);
    			append_dev(p2, strong6);
    			append_dev(p2, t28);
    			append_dev(p2, strong7);
    			append_dev(p2, t30);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 2) intersectionobserver_changes.element = /*element*/ ctx[1];

    			if (dirty & /*$$scope, element, $value*/ 70) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 1) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[0];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(imageslide.$$.fragment, local);
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(imageslide.$$.fragment, local);
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			destroy_component(imageslide);
    			destroy_component(intersectionobserver);
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
    	let $value;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WhyUs", slots, []);
    	const value = tweened(0, { duration: 1000, easing: cubicOut });
    	validate_store(value, "value");
    	component_subscribe($$self, value, value => $$invalidate(2, $value = value));
    	let element;
    	let intersecting;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WhyUs> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(0, intersecting);
    	}

    	$$self.$capture_state = () => ({
    		ImageSlide,
    		IntersectionObserver: IntersectionObserver_1,
    		tweened,
    		cubicOut,
    		value,
    		element,
    		intersecting,
    		$value
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(1, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*intersecting*/ 1) {
    			intersecting ? value.set(100) : value.set(0);
    		}
    	};

    	return [
    		intersecting,
    		element,
    		$value,
    		value,
    		div3_binding,
    		intersectionobserver_intersecting_binding
    	];
    }

    class WhyUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhyUs",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src/components/about/WhoAreWe.svelte generated by Svelte v3.38.2 */
    const file$z = "src/components/about/WhoAreWe.svelte";

    function create_fragment$B(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div2;
    	let h30;
    	let t5;
    	let h40;
    	let t7;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let div4;
    	let h31;
    	let t10;
    	let h41;
    	let div7_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "EDUSTAR FASTRACK, a premier institute in IELTS was established with an aim to impart quality training to IELTS aspirants. This institute has been branched out to Spoken English, Teachers Training, Interview training and IELTS. Those who have passed out of this institute with flying colours bear testimony to the fact that Edustar Fastrack is something special. We provide hostel facilities too";
    			t2 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Sunil Devaprabha PhD(HC)";
    			t5 = space();
    			h40 = element("h4");
    			h40.textContent = "Founder/ Instructor";
    			t7 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t8 = space();
    			div4 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Bijo Thomas";
    			t10 = space();
    			h41 = element("h4");
    			h41.textContent = "Overseas Head";
    			if (img0.src !== (img0_src_value = "/img/illustrations/Mission.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "");
    			add_location(img0, file$z, 6, 12, 232);
    			attr_dev(div0, "class", "flex justify-center items-center p-5");
    			add_location(div0, file$z, 5, 8, 169);
    			add_location(p, file$z, 9, 12, 344);
    			attr_dev(div1, "class", "p-5");
    			add_location(div1, file$z, 8, 8, 314);
    			if (img1.src !== (img1_src_value = "/img/devaprabha1.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "w-36 md:w-48 rounded-full");
    			add_location(img1, file$z, 12, 12, 832);
    			attr_dev(h30, "class", "text-xl md:text-2xl font-bold");
    			add_location(h30, file$z, 14, 16, 950);
    			add_location(h40, file$z, 15, 16, 1038);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$z, 13, 12, 919);
    			attr_dev(div3, "class", "p-5 flex justify-evenly items-center");
    			add_location(div3, file$z, 11, 8, 769);
    			if (img2.src !== (img2_src_value = "/img/Bijo.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "w-36 md:w-48 rounded-full");
    			add_location(img2, file$z, 19, 12, 1172);
    			attr_dev(h31, "class", "text-xl md:text-2xl font-bold");
    			add_location(h31, file$z, 21, 16, 1282);
    			add_location(h41, file$z, 22, 16, 1357);
    			attr_dev(div4, "class", "");
    			add_location(div4, file$z, 20, 12, 1251);
    			attr_dev(div5, "class", "p-5 flex justify-evenly items-center");
    			add_location(div5, file$z, 18, 8, 1109);
    			attr_dev(div6, "class", "md:w-140");
    			add_location(div6, file$z, 4, 4, 138);
    			attr_dev(div7, "class", "flex justify-center items-center");
    			add_location(div7, file$z, 3, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div0, img0);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			append_dev(div1, p);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, h30);
    			append_dev(div2, t5);
    			append_dev(div2, h40);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, h31);
    			append_dev(div4, t10);
    			append_dev(div4, h41);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div7_transition) div7_transition = create_bidirectional_transition(div7, fade, {}, true);
    					div7_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!div7_transition) div7_transition = create_bidirectional_transition(div7, fade, {}, false);
    				div7_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (detaching && div7_transition) div7_transition.end();
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

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WhoAreWe", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WhoAreWe> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade });
    	return [];
    }

    class WhoAreWe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhoAreWe",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src/components/about/Mission.svelte generated by Svelte v3.38.2 */
    const file$y = "src/components/about/Mission.svelte";

    function create_fragment$A(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let i;
    	let t1;
    	let p;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			i = element("i");
    			t1 = space();
    			p = element("p");
    			p.textContent = "Training process that will enable the Students to maintain an attitude of positive thinking, and therefore forget the mistakes of the past and press on the greater achievements of future.  Accelerated training on a platform that combines Attitude, Goal Setting, Mind Mapping, Meditation and Memory Techniques.  We use Motivation, Presentation, Group Discussions, Exercises, Debate, and Games to inspire the participants.";
    			if (img.src !== (img_src_value = "/img/illustrations/target.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$y, 6, 12, 200);
    			attr_dev(i, "class", "fas fa-quote-left absolute text-yellow-100 text-6xl left-2");
    			add_location(i, file$y, 8, 16, 318);
    			attr_dev(p, "class", "relative text-2xl");
    			add_location(p, file$y, 9, 12, 405);
    			attr_dev(div0, "class", "p-5 font-Display font-bold");
    			add_location(div0, file$y, 7, 12, 261);
    			attr_dev(div1, "class", "md:w-140");
    			add_location(div1, file$y, 5, 4, 165);
    			attr_dev(div2, "class", "flex justify-center items-center");
    			add_location(div2, file$y, 4, 4, 114);
    			attr_dev(div3, "class", "relative");
    			add_location(div3, file$y, 3, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, {}, true);
    					div3_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, {}, false);
    				div3_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
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

    function instance$A($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mission", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mission> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade });
    	return [];
    }

    class Mission extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mission",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src/components/about/Vision.svelte generated by Svelte v3.38.2 */
    const file$x = "src/components/about/Vision.svelte";

    function create_fragment$z(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let i;
    	let t1;
    	let p;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			i = element("i");
    			t1 = space();
    			p = element("p");
    			p.textContent = "To grow towards taking education  and recruitment to all corners of the world, helping aspiring individuals with our services and fulfilling the recruitment needs our stakeholders.";
    			if (img.src !== (img_src_value = "/img/illustrations/Vision.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "md:w-2/3");
    			add_location(img, file$x, 6, 12, 252);
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$x, 5, 8, 193);
    			attr_dev(i, "class", "fas fa-quote-left absolute text-blue-300 text-6xl left-2");
    			add_location(i, file$x, 9, 12, 394);
    			attr_dev(p, "class", "relative");
    			add_location(p, file$x, 10, 8, 475);
    			attr_dev(div1, "class", "p-5 font-Display font-bold");
    			add_location(div1, file$x, 8, 8, 341);
    			attr_dev(div2, "class", "md:w-140 text-2xl  p-5  relative");
    			add_location(div2, file$x, 4, 4, 138);
    			attr_dev(div3, "class", "flex justify-center items-center");
    			add_location(div3, file$x, 3, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, i);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, {}, true);
    					div3_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, {}, false);
    				div3_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
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

    function instance$z($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Vision", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vision> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade });
    	return [];
    }

    class Vision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vision",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src/components/about/AboutUs.svelte generated by Svelte v3.38.2 */
    const file$w = "src/components/about/AboutUs.svelte";

    // (27:8) <LargeHeading>
    function create_default_slot_1$7(ctx) {
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
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(27:8) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (36:39) 
    function create_if_block_3$1(ctx) {
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
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(36:39) ",
    		ctx
    	});

    	return block;
    }

    // (34:40) 
    function create_if_block_2$3(ctx) {
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(34:40) ",
    		ctx
    	});

    	return block;
    }

    // (32:43) 
    function create_if_block_1$3(ctx) {
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(32:43) ",
    		ctx
    	});

    	return block;
    }

    // (30:7) {#if currentTab==="Why Us"}
    function create_if_block$a(ctx) {
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
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(30:7) {#if currentTab===\\\"Why Us\\\"}",
    		ctx
    	});

    	return block;
    }

    // (22:4) <IntersectionObserver {element} bind:intersecting>
    function create_default_slot$c(ctx) {
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
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabs = new Tabs({
    			props: {
    				currentTab: /*currentTab*/ ctx[2],
    				TabItems: /*TabItems*/ ctx[3],
    				sideNav: /*intersecting*/ ctx[1]
    			},
    			$$inline: true
    		});

    	tabs.$on("tabChange", /*handleTabChange*/ ctx[4]);
    	const if_block_creators = [create_if_block$a, create_if_block_1$3, create_if_block_2$3, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentTab*/ ctx[2] === "Why Us") return 0;
    		if (/*currentTab*/ ctx[2] === "Who are We") return 1;
    		if (/*currentTab*/ ctx[2] === "Mission") return 2;
    		if (/*currentTab*/ ctx[2] === "Vision") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			create_component(tabs.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "md:w-2/3 p-5");
    			add_location(div, file$w, 22, 4, 831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(largeheading, div, null);
    			append_dev(div, t0);
    			mount_component(tabs, div, null);
    			append_dev(div, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const tabs_changes = {};
    			if (dirty & /*currentTab*/ 4) tabs_changes.currentTab = /*currentTab*/ ctx[2];
    			if (dirty & /*intersecting*/ 2) tabs_changes.sideNav = /*intersecting*/ ctx[1];
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
    			if (detaching) detach_dev(div);
    			destroy_component(largeheading);
    			destroy_component(tabs);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(22:4) <IntersectionObserver {element} bind:intersecting>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let section;
    	let intersectionobserver;
    	let updating_intersecting;
    	let current;

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[6](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[0],
    		$$slots: { default: [create_default_slot$c] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[1] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[1];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "intersecting", intersectionobserver_intersecting_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(intersectionobserver.$$.fragment);
    			attr_dev(section, "id", "AboutUs");
    			attr_dev(section, "class", "text-center w-screen flex flex-col justify-center items-center my-24 overflow-hidden");
    			add_location(section, file$w, 20, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(intersectionobserver, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 1) intersectionobserver_changes.element = /*element*/ ctx[0];

    			if (dirty & /*$$scope, element, currentTab, intersecting*/ 135) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 2) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[1];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(intersectionobserver);
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

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AboutUs", slots, []);
    	let element;
    	let intersecting;

    	let TabItems = [
    		{ name: "Why Us", icon: "fas fa-question" },
    		{ name: "Who are We", icon: "fas fa-users" },
    		{ name: "Mission", icon: "fas fa-bullseye" },
    		{
    			name: "Vision",
    			icon: "fas fa-binoculars"
    		}
    	];

    	let currentTab = "Why Us";

    	const handleTabChange = e => {
    		$$invalidate(2, currentTab = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AboutUs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(1, intersecting);
    	}

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		element,
    		intersecting,
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
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("TabItems" in $$props) $$invalidate(3, TabItems = $$props.TabItems);
    		if ("currentTab" in $$props) $$invalidate(2, currentTab = $$props.currentTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		element,
    		intersecting,
    		currentTab,
    		TabItems,
    		handleTabChange,
    		div_binding,
    		intersectionobserver_intersecting_binding
    	];
    }

    class AboutUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutUs",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src/shared/Button.svelte generated by Svelte v3.38.2 */

    const file$v = "src/shared/Button.svelte";

    function create_fragment$x(ctx) {
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

    			add_location(button, file$v, 6, 0, 118);
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
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { type: 0, rounded: 1, inverted: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$x.name
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

    /* src/components/contactus/AddressTab.svelte generated by Svelte v3.38.2 */
    const file$u = "src/components/contactus/AddressTab.svelte";

    // (15:16) <Button rounded type="secondary">
    function create_default_slot$b(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Get Directions");
    			attr_dev(i, "class", "fas fa-directions");
    			add_location(i, file$u, 14, 50, 1129);
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
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(15:16) <Button rounded type=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let div0;
    	let p;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let t6;
    	let div1;
    	let iframe;
    	let iframe_src_value;
    	let t7;
    	let a;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				rounded: true,
    				type: "secondary",
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Find us Here";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t2 = text("Edustar Fastrack ");
    			br0 = element("br");
    			t3 = text(" Varakukala Building ");
    			br1 = element("br");
    			t4 = text(" Opp.Vetinary Hospital,Nedumkanadam ");
    			br2 = element("br");
    			t5 = text("Idukki, Kerala");
    			t6 = space();
    			div1 = element("div");
    			iframe = element("iframe");
    			t7 = space();
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(h2, "class", "font-dispalay text-2xl p-3");
    			add_location(h2, file$u, 5, 4, 143);
    			add_location(br0, file$u, 8, 51, 293);
    			add_location(br1, file$u, 8, 76, 318);
    			add_location(br2, file$u, 8, 116, 358);
    			attr_dev(p, "class", " font-body");
    			add_location(p, file$u, 8, 12, 254);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$u, 7, 8, 227);
    			attr_dev(iframe, "title", "googleMapLocation");
    			if (iframe.src !== (iframe_src_value = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.131821581477!2d77.1519759152507!3d9.839294292961469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07a733ff04eeed%3A0x44c8ee5f5fbf504d!2sDr.%20Sunil's%20IELTS%20CENTER!5e0!3m2!1sen!2sin!4v1621527851572!5m2!1sen!2sin")) attr_dev(iframe, "src", iframe_src_value);
    			set_style(iframe, "border", "0");
    			iframe.allowFullscreen = "";
    			attr_dev(iframe, "loading", "lazy");
    			attr_dev(iframe, "class", "w-full h-64 p-3 bg-blue-50");
    			add_location(iframe, file$u, 12, 12, 451);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://www.google.com/maps/dir//Dr.+Sunil%27s+IELTS+CENTER/data=!4m8!4m7!1m0!1m5!1m1!1s0x3b07a733ff04eeed:0x44c8ee5f5fbf504d!2m2!1d77.1541646!2d9.839294299999999");
    			add_location(a, file$u, 13, 12, 888);
    			attr_dev(div1, "class", "w-full ");
    			add_location(div1, file$u, 11, 8, 417);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$u, 6, 4, 204);
    			attr_dev(div3, "class", "bg-white p-5 w-full rounded w-86 md:w-110");
    			attr_dev(div3, "id", "#Address");
    			add_location(div3, file$u, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h2);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(p, br0);
    			append_dev(p, t3);
    			append_dev(p, br1);
    			append_dev(p, t4);
    			append_dev(p, br2);
    			append_dev(p, t5);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, iframe);
    			append_dev(div1, t7);
    			append_dev(div1, a);
    			mount_component(button, a, null);
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
    			if (detaching) detach_dev(div3);
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

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddressTab", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddressTab> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button });
    	return [];
    }

    class AddressTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressTab",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src/components/contactus/ContactSwBtn.svelte generated by Svelte v3.38.2 */

    const file$t = "src/components/contactus/ContactSwBtn.svelte";

    function create_fragment$v(ctx) {
    	let div1;
    	let div0;
    	let i;
    	let i_class_value;
    	let t0;
    	let p;
    	let t1;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*subtext*/ ctx[1]);
    			attr_dev(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[0]);
    			add_location(i, file$t, 10, 12, 241);
    			attr_dev(div0, "class", "text-xl text-white");
    			add_location(div0, file$t, 9, 8, 196);
    			attr_dev(p, "class", "font-body text-white font-bold");
    			add_location(p, file$t, 12, 8, 294);
    			attr_dev(div1, "class", div1_class_value = "p-5 m-3 inline-block rounded-xl " + (/*selected*/ ctx[2] ? "bg-red-400" : "") + " cursor-pointer");
    			add_location(div1, file$t, 8, 4, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*icon*/ 1 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[0])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*subtext*/ 2) set_data_dev(t1, /*subtext*/ ctx[1]);

    			if (dirty & /*selected*/ 4 && div1_class_value !== (div1_class_value = "p-5 m-3 inline-block rounded-xl " + (/*selected*/ ctx[2] ? "bg-red-400" : "") + " cursor-pointer")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
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

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactSwBtn", slots, []);
    	let { icon } = $$props;
    	let { subtext } = $$props;
    	let { selected = false } = $$props;
    	const writable_props = ["icon", "subtext", "selected"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactSwBtn> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("subtext" in $$props) $$invalidate(1, subtext = $$props.subtext);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ icon, subtext, selected });

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("subtext" in $$props) $$invalidate(1, subtext = $$props.subtext);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon, subtext, selected, click_handler];
    }

    class ContactSwBtn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { icon: 0, subtext: 1, selected: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactSwBtn",
    			options,
    			id: create_fragment$v.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<ContactSwBtn> was created without expected prop 'icon'");
    		}

    		if (/*subtext*/ ctx[1] === undefined && !("subtext" in props)) {
    			console.warn("<ContactSwBtn> was created without expected prop 'subtext'");
    		}
    	}

    	get icon() {
    		throw new Error("<ContactSwBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ContactSwBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtext() {
    		throw new Error("<ContactSwBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtext(value) {
    		throw new Error("<ContactSwBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<ContactSwBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<ContactSwBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/contactus/contactSwitcher.svelte generated by Svelte v3.38.2 */
    const file$s = "src/components/contactus/contactSwitcher.svelte";

    function create_fragment$u(ctx) {
    	let div;
    	let contactswbtn0;
    	let t0;
    	let contactswbtn1;
    	let t1;
    	let contactswbtn2;
    	let current;

    	contactswbtn0 = new ContactSwBtn({
    			props: {
    				icon: "phone",
    				subtext: "+91 9744412045",
    				selected: /*currentItem*/ ctx[0] === "Phone" ? true : false
    			},
    			$$inline: true
    		});

    	contactswbtn0.$on("click", /*click_handler*/ ctx[2]);

    	contactswbtn1 = new ContactSwBtn({
    			props: {
    				icon: "map-marker-alt",
    				subtext: "Nedumkanadam,Idukki",
    				selected: /*currentItem*/ ctx[0] === "Address" ? true : false
    			},
    			$$inline: true
    		});

    	contactswbtn1.$on("click", /*click_handler_1*/ ctx[3]);

    	contactswbtn2 = new ContactSwBtn({
    			props: {
    				icon: "comment",
    				subtext: "send message",
    				selected: /*currentItem*/ ctx[0] === "Message" ? true : false
    			},
    			$$inline: true
    		});

    	contactswbtn2.$on("click", /*click_handler_2*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(contactswbtn0.$$.fragment);
    			t0 = space();
    			create_component(contactswbtn1.$$.fragment);
    			t1 = space();
    			create_component(contactswbtn2.$$.fragment);
    			attr_dev(div, "class", "");
    			add_location(div, file$s, 7, 0, 180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(contactswbtn0, div, null);
    			append_dev(div, t0);
    			mount_component(contactswbtn1, div, null);
    			append_dev(div, t1);
    			mount_component(contactswbtn2, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const contactswbtn0_changes = {};
    			if (dirty & /*currentItem*/ 1) contactswbtn0_changes.selected = /*currentItem*/ ctx[0] === "Phone" ? true : false;
    			contactswbtn0.$set(contactswbtn0_changes);
    			const contactswbtn1_changes = {};
    			if (dirty & /*currentItem*/ 1) contactswbtn1_changes.selected = /*currentItem*/ ctx[0] === "Address" ? true : false;
    			contactswbtn1.$set(contactswbtn1_changes);
    			const contactswbtn2_changes = {};
    			if (dirty & /*currentItem*/ 1) contactswbtn2_changes.selected = /*currentItem*/ ctx[0] === "Message" ? true : false;
    			contactswbtn2.$set(contactswbtn2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactswbtn0.$$.fragment, local);
    			transition_in(contactswbtn1.$$.fragment, local);
    			transition_in(contactswbtn2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactswbtn0.$$.fragment, local);
    			transition_out(contactswbtn1.$$.fragment, local);
    			transition_out(contactswbtn2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(contactswbtn0);
    			destroy_component(contactswbtn1);
    			destroy_component(contactswbtn2);
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

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactSwitcher", slots, []);
    	let dispatch = createEventDispatcher();
    	let { currentItem } = $$props;
    	const writable_props = ["currentItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactSwitcher> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("TabChange", "Phone");
    	};

    	const click_handler_1 = () => {
    		dispatch("TabChange", "Address");
    	};

    	const click_handler_2 = () => {
    		dispatch("TabChange", "Message");
    	};

    	$$self.$$set = $$props => {
    		if ("currentItem" in $$props) $$invalidate(0, currentItem = $$props.currentItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ContactSwBtn,
    		dispatch,
    		currentItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    		if ("currentItem" in $$props) $$invalidate(0, currentItem = $$props.currentItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentItem, dispatch, click_handler, click_handler_1, click_handler_2];
    }

    class ContactSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { currentItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactSwitcher",
    			options,
    			id: create_fragment$u.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentItem*/ ctx[0] === undefined && !("currentItem" in props)) {
    			console.warn("<ContactSwitcher> was created without expected prop 'currentItem'");
    		}
    	}

    	get currentItem() {
    		throw new Error("<ContactSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentItem(value) {
    		throw new Error("<ContactSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/contactus/MessageTab.svelte generated by Svelte v3.38.2 */

    const { console: console_1$3 } = globals;
    const file$r = "src/components/contactus/MessageTab.svelte";

    // (126:35) <Button type="secondary"  rounded>
    function create_default_slot$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
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
    		source: "(126:35) <Button type=\\\"secondary\\\"  rounded>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let form;
    	let p;
    	let t2;
    	let p_class_value;
    	let t3;
    	let div2;
    	let div0;
    	let input0;
    	let t4;
    	let label0;
    	let t6;
    	let input1;
    	let t7;
    	let label1;
    	let t9;
    	let input2;
    	let t10;
    	let label2;
    	let t12;
    	let input3;
    	let t13;
    	let div1;
    	let label3;
    	let t15;
    	let textarea;
    	let t16;
    	let div3;
    	let button1;
    	let button0;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button({
    			props: {
    				type: "secondary",
    				rounded: true,
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Get a Quote";
    			t1 = space();
    			form = element("form");
    			p = element("p");
    			t2 = text(/*result*/ ctx[5]);
    			t3 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t4 = space();
    			label0 = element("label");
    			label0.textContent = "Name";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Email";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			label2 = element("label");
    			label2.textContent = "Phone";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			div1 = element("div");
    			label3 = element("label");
    			label3.textContent = "Message";
    			t15 = space();
    			textarea = element("textarea");
    			t16 = space();
    			div3 = element("div");
    			button1 = element("button");
    			create_component(button0.$$.fragment);
    			attr_dev(h2, "class", "font-dispalay text-2xl p-3");
    			add_location(h2, file$r, 97, 4, 2697);
    			attr_dev(p, "class", p_class_value = "text-base text-center " + (!/*success*/ ctx[0] ? "text-red-400" : "text-green-400"));
    			attr_dev(p, "id", "result");
    			add_location(p, file$r, 99, 4, 2806);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "subject");
    			input0.value = "Edustar new customer";
    			add_location(input0, file$r, 102, 16, 3072);
    			attr_dev(label0, "for", "Name");
    			attr_dev(label0, "class", "text-left");
    			add_location(label0, file$r, 104, 16, 3167);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300");
    			attr_dev(input1, "name", "name");
    			attr_dev(input1, "placeholder", "Enter your name");
    			input1.required = true;
    			add_location(input1, file$r, 106, 16, 3250);
    			attr_dev(label1, "for", "Email");
    			attr_dev(label1, "class", "text-left");
    			add_location(label1, file$r, 107, 16, 3454);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "class", "ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300");
    			attr_dev(input2, "name", "email");
    			attr_dev(input2, "placeholder", "Enter your email");
    			input2.required = true;
    			add_location(input2, file$r, 108, 16, 3521);
    			attr_dev(label2, "for", "Phone");
    			attr_dev(label2, "class", "text-left");
    			attr_dev(label2, "type", "text");
    			attr_dev(label2, "required", "");
    			add_location(label2, file$r, 109, 16, 3729);
    			attr_dev(input3, "type", "tel");
    			attr_dev(input3, "class", "ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300");
    			attr_dev(input3, "name", "phone");
    			attr_dev(input3, "id", "phone");
    			attr_dev(input3, "placeholder", "Phone number");
    			add_location(input3, file$r, 112, 16, 3850);
    			attr_dev(div0, "class", "flex flex-col w-full md:w-max");
    			add_location(div0, file$r, 101, 12, 3012);
    			attr_dev(label3, "for", "Message");
    			attr_dev(label3, "class", "text-left block");
    			add_location(label3, file$r, 117, 16, 4149);
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "id", "message");
    			attr_dev(textarea, "placeholder", "Your Message");
    			attr_dev(textarea, "class", "w-full bg-blue-100 focus:ring-2 focus:ring-red-300  p-2 my-3 rounded outline-none");
    			textarea.required = true;
    			add_location(textarea, file$r, 118, 16, 4226);
    			attr_dev(div1, "class", "w-full md:w-max");
    			add_location(div1, file$r, 116, 12, 4103);
    			attr_dev(div2, "class", "flex flex-col md:flex-row flex-wrap justify-evenly items-center w-full");
    			add_location(div2, file$r, 100, 8, 2915);
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file$r, 125, 12, 4574);
    			attr_dev(div3, "class", "text-center");
    			add_location(div3, file$r, 124, 8, 4536);
    			add_location(form, file$r, 98, 4, 2757);
    			attr_dev(div4, "class", "bg-white p-5 w-full rounded w-86 md:w-110");
    			attr_dev(div4, "id", "#Message");
    			add_location(div4, file$r, 96, 0, 2623);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, form);
    			append_dev(form, p);
    			append_dev(p, t2);
    			append_dev(form, t3);
    			append_dev(form, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input0);
    			append_dev(div0, t4);
    			append_dev(div0, label0);
    			append_dev(div0, t6);
    			append_dev(div0, input1);
    			set_input_value(input1, /*name*/ ctx[1]);
    			append_dev(div0, t7);
    			append_dev(div0, label1);
    			append_dev(div0, t9);
    			append_dev(div0, input2);
    			set_input_value(input2, /*email*/ ctx[2]);
    			append_dev(div0, t10);
    			append_dev(div0, label2);
    			append_dev(div0, t12);
    			append_dev(div0, input3);
    			set_input_value(input3, /*phone*/ ctx[3]);
    			append_dev(div2, t13);
    			append_dev(div2, div1);
    			append_dev(div1, label3);
    			append_dev(div1, t15);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*message*/ ctx[4]);
    			append_dev(form, t16);
    			append_dev(form, div3);
    			append_dev(div3, button1);
    			mount_component(button0, button1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[9]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[10]),
    					listen_dev(form, "submit", prevent_default(/*submitForm*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*result*/ 32) set_data_dev(t2, /*result*/ ctx[5]);

    			if (!current || dirty & /*success*/ 1 && p_class_value !== (p_class_value = "text-base text-center " + (!/*success*/ ctx[0] ? "text-red-400" : "text-green-400"))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*name*/ 2 && input1.value !== /*name*/ ctx[1]) {
    				set_input_value(input1, /*name*/ ctx[1]);
    			}

    			if (dirty & /*email*/ 4 && input2.value !== /*email*/ ctx[2]) {
    				set_input_value(input2, /*email*/ ctx[2]);
    			}

    			if (dirty & /*phone*/ 8) {
    				set_input_value(input3, /*phone*/ ctx[3]);
    			}

    			if (dirty & /*message*/ 16) {
    				set_input_value(textarea, /*message*/ ctx[4]);
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(button0);
    			mounted = false;
    			run_all(dispose);
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

    function instance$t($$self, $$props, $$invalidate) {
    	let result;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MessageTab", slots, []);
    	let success = false;
    	let name, email, phone, message, subject;

    	// <input type="hidden" name="apikey" value="68f9da7b-24c5-41f6-8d9e-27ac23c5d94d" />
    	// const submitForm=(e)=>{
    	//    let formData={name,email,phone,message,subject};
    	// //   const formData = new FormData(form);
    	//   e.preventDefault();
    	//   var object = {};
    	//   var json = JSON.stringify(formData);
    	//   result= "Please wait...";
    	//   fetch("https://api.web3forms.com/submit", {
    	//     method: "POST",
    	//     headers: {
    	//       "Content-Type": "application/json",
    	//       Accept: "application/json",
    	//     },
    	//     body: json,
    	//   })
    	//     .then(async (response) => {
    	//       let json = await response.json();
    	//       if (response.status == 200) {
    	//         result =json.message;
    	//        success=true;
    	//       } else {
    	//         console.log(response);
    	//         result = json.message;
    	//        success=false;
    	//       }
    	//     })
    	//     .catch((error) => {
    	//       console.log(error);
    	//       result = "Something went wrong!";
    	//     })
    	//     .then(function () {
    	//       form.reset();
    	//       setTimeout(() => {
    	//         result = "";
    	//       }, 5000);
    	//     });
    	// }
    	const submitForm = () => {
    		const formData = new FormData();
    		formData.append("name", name);
    		formData.append("email", email);
    		formData.append("phone", phone);
    		formData.append("subject", " New Customer Query");
    		formData.append("apikey", "68f9da7b-24c5-41f6-8d9e-27ac23c5d94d");
    		var object = {};

    		formData.forEach((value, key) => {
    			object[key] = value;
    		});

    		var json = JSON.stringify(object);
    		$$invalidate(5, result = "Please wait..");

    		fetch("https://api.web3forms.com/submit", {
    			method: "POST",
    			headers: {
    				"Content-Type": "application/json",
    				"Accept": "application/json"
    			},
    			body: json
    		}).then(async response => {
    			let json = await response.json();

    			if (response.status == 200) {
    				$$invalidate(0, success = true);
    				$$invalidate(5, result = json.message);
    			} else {
    				$$invalidate(0, success = false);
    				console.log(response);
    				$$invalidate(5, result = json.message);
    			}
    		}).catch(error => {
    			console.log(error.message);
    			$$invalidate(5, result = "Something went wrong!");
    		}).then(function () {
    			$$invalidate(1, name = "");
    			$$invalidate(2, email = "");
    			$$invalidate(3, phone = "");
    			$$invalidate(4, message = "");

    			setTimeout(
    				() => {
    					$$invalidate(5, result = "");
    				},
    				3000
    			);
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<MessageTab> was created with unknown prop '${key}'`);
    	});

    	function input1_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	function input2_input_handler() {
    		email = this.value;
    		$$invalidate(2, email);
    	}

    	function input3_input_handler() {
    		phone = this.value;
    		$$invalidate(3, phone);
    	}

    	function textarea_input_handler() {
    		message = this.value;
    		$$invalidate(4, message);
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		success,
    		name,
    		email,
    		phone,
    		message,
    		subject,
    		submitForm,
    		result
    	});

    	$$self.$inject_state = $$props => {
    		if ("success" in $$props) $$invalidate(0, success = $$props.success);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("phone" in $$props) $$invalidate(3, phone = $$props.phone);
    		if ("message" in $$props) $$invalidate(4, message = $$props.message);
    		if ("subject" in $$props) subject = $$props.subject;
    		if ("result" in $$props) $$invalidate(5, result = $$props.result);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(5, result = "");

    	return [
    		success,
    		name,
    		email,
    		phone,
    		message,
    		result,
    		submitForm,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		textarea_input_handler
    	];
    }

    class MessageTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessageTab",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src/components/contactus/PhoneTab.svelte generated by Svelte v3.38.2 */

    const file$q = "src/components/contactus/PhoneTab.svelte";

    function create_fragment$s(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let div3;
    	let h3;
    	let t3;
    	let p0;
    	let a0;
    	let t4;
    	let div0;
    	let i0;
    	let t5;
    	let a1;
    	let div1;
    	let i1;
    	let t6;
    	let p1;
    	let a2;
    	let t7;
    	let div2;
    	let i2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Connect With Us";
    			t1 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = "From 9AM to 7PM IST";
    			t3 = space();
    			p0 = element("p");
    			a0 = element("a");
    			t4 = text("+91 9744412045 ");
    			div0 = element("div");
    			i0 = element("i");
    			t5 = space();
    			a1 = element("a");
    			div1 = element("div");
    			i1 = element("i");
    			t6 = space();
    			p1 = element("p");
    			a2 = element("a");
    			t7 = text("+91 9446129722 ");
    			div2 = element("div");
    			i2 = element("i");
    			attr_dev(h2, "class", "font-dispalay text-2xl p-3");
    			add_location(h2, file$q, 1, 4, 72);
    			add_location(h3, file$q, 3, 8, 159);
    			attr_dev(i0, "class", "fas fa-phone-alt  text-white");
    			add_location(i0, file$q, 5, 149, 361);
    			attr_dev(div0, "class", "bg-blue-400  text-white hover:bg-blue-500 inline-block p-2");
    			add_location(div0, file$q, 5, 77, 289);
    			attr_dev(a0, "class", "font-bold ");
    			attr_dev(a0, "href", "tel:+91-97444-12045");
    			add_location(a0, file$q, 5, 12, 224);
    			attr_dev(i1, "class", "fab fa-whatsapp  text-white");
    			add_location(i1, file$q, 6, 149, 566);
    			attr_dev(div1, "class", "bg-blue-400  text-white hover:bg-blue-500 inline-block p-2");
    			add_location(div1, file$q, 6, 77, 494);
    			attr_dev(a1, "href", "https://api.whatsapp.com/send?phone=919744412045&text=");
    			add_location(a1, file$q, 6, 12, 429);
    			attr_dev(p0, "class", "p-2");
    			add_location(p0, file$q, 4, 8, 196);
    			attr_dev(i2, "class", "fas fa-phone-alt  text-white");
    			add_location(i2, file$q, 10, 146, 815);
    			attr_dev(div2, "class", "bg-red-400  text-white hover:bg-red-500 inline-block p-2");
    			add_location(div2, file$q, 10, 76, 745);
    			attr_dev(a2, "class", "font-bold ");
    			attr_dev(a2, "href", "tel:+91-9446129722");
    			add_location(a2, file$q, 10, 12, 681);
    			attr_dev(p1, "class", "p-2");
    			add_location(p1, file$q, 9, 8, 653);
    			attr_dev(div3, "class", "");
    			add_location(div3, file$q, 2, 4, 136);
    			attr_dev(div4, "class", "bg-white p-5 w-full rounded w-86 md:w-110");
    			attr_dev(div4, "id", "#Phone");
    			add_location(div4, file$q, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(div3, t3);
    			append_dev(div3, p0);
    			append_dev(p0, a0);
    			append_dev(a0, t4);
    			append_dev(a0, div0);
    			append_dev(div0, i0);
    			append_dev(p0, t5);
    			append_dev(p0, a1);
    			append_dev(a1, div1);
    			append_dev(div1, i1);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(p1, a2);
    			append_dev(a2, t7);
    			append_dev(a2, div2);
    			append_dev(div2, i2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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

    function instance$s($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PhoneTab", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PhoneTab> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PhoneTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PhoneTab",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src/components/contactus/ContactUs.svelte generated by Svelte v3.38.2 */
    const file$p = "src/components/contactus/ContactUs.svelte";

    // (15:4) <LargeHeading black={false}>
    function create_default_slot$9(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Get In Touch";
    			attr_dev(h2, "class", "font-bold");
    			add_location(h2, file$p, 14, 32, 517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(15:4) <LargeHeading black={false}>",
    		ctx
    	});

    	return block;
    }

    // (27:42) 
    function create_if_block_2$2(ctx) {
    	let addresstab;
    	let current;
    	addresstab = new AddressTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addresstab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addresstab, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addresstab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addresstab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addresstab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(27:42) ",
    		ctx
    	});

    	return block;
    }

    // (25:40) 
    function create_if_block_1$2(ctx) {
    	let phonetab;
    	let current;
    	phonetab = new PhoneTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(phonetab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(phonetab, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(phonetab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(phonetab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(phonetab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(25:40) ",
    		ctx
    	});

    	return block;
    }

    // (23:8) {#if currentItem==="Message"}
    function create_if_block$9(ctx) {
    	let messagetab;
    	let current;
    	messagetab = new MessageTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(messagetab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(messagetab, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(messagetab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(messagetab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(messagetab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(23:8) {#if currentItem===\\\"Message\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let section;
    	let largeheading;
    	let t0;
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let contactswitcher;
    	let t2;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				black: false,
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contactswitcher = new ContactSwitcher({
    			props: { currentItem: /*currentItem*/ ctx[0] },
    			$$inline: true
    		});

    	contactswitcher.$on("TabChange", /*handleTabChange*/ ctx[1]);
    	const if_block_creators = [create_if_block$9, create_if_block_1$2, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentItem*/ ctx[0] === "Message") return 0;
    		if (/*currentItem*/ ctx[0] === "Phone") return 1;
    		if (/*currentItem*/ ctx[0] === "Address") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			create_component(contactswitcher.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			if (img.src !== (img_src_value = "/img/bro.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "contact Us illlustration");
    			add_location(img, file$p, 17, 8, 673);
    			attr_dev(div0, "class", "hidden md:block");
    			add_location(div0, file$p, 16, 4, 635);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$p, 21, 7, 891);
    			attr_dev(div2, "class", "flex flex-col justify-center items-center");
    			add_location(div2, file$p, 19, 4, 744);
    			attr_dev(div3, "class", "flex items-center justify-around md:py-24");
    			add_location(div3, file$p, 15, 3, 575);
    			attr_dev(section, "id", "ContactUs");
    			attr_dev(section, "class", "flex flex-col justify-center items-center p-5 text-center  bg-pink-600 w-screen overflow-hidden");
    			add_location(section, file$p, 13, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(largeheading, section, null);
    			append_dev(section, t0);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(contactswitcher, div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const contactswitcher_changes = {};
    			if (dirty & /*currentItem*/ 1) contactswitcher_changes.currentItem = /*currentItem*/ ctx[0];
    			contactswitcher.$set(contactswitcher_changes);
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
    					if_block.m(div1, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(contactswitcher.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(contactswitcher.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(largeheading);
    			destroy_component(contactswitcher);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
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

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactUs", slots, []);
    	let currentItem = "Message";

    	const handleTabChange = e => {
    		$$invalidate(0, currentItem = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactUs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LargeHeading,
    		AddressTab,
    		ContactSwitcher,
    		MessageTab,
    		PhoneTab,
    		currentItem,
    		handleTabChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentItem" in $$props) $$invalidate(0, currentItem = $$props.currentItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentItem, handleTabChange];
    }

    class ContactUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactUs",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/shared/Subtext.svelte generated by Svelte v3.38.2 */

    const file$o = "src/shared/Subtext.svelte";

    function create_fragment$q(ctx) {
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
    			add_location(h4, file$o, 3, 0, 47);
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
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { black: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subtext",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get black() {
    		throw new Error("<Subtext>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set black(value) {
    		throw new Error("<Subtext>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var _ = {
      $(selector) {
        if (typeof selector === "string") {
          return document.querySelector(selector);
        }
        return selector;
      },
      extend(...args) {
        return Object.assign(...args);
      },
      cumulativeOffset(element) {
        let top = 0;
        let left = 0;

        do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);

        return {
          top: top,
          left: left
        };
      },
      directScroll(element) {
        return element && element !== document && element !== document.body;
      },
      scrollTop(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollTop = value) : element.scrollTop;
        } else {
          return inSetter
            ? (document.documentElement.scrollTop = document.body.scrollTop = value)
            : window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;
        }
      },
      scrollLeft(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollLeft = value) : element.scrollLeft;
        } else {
          return inSetter
            ? (document.documentElement.scrollLeft = document.body.scrollLeft = value)
            : window.pageXOffset ||
                document.documentElement.scrollLeft ||
                document.body.scrollLeft ||
                0;
        }
      }
    };

    const defaultOptions = {
      container: "body",
      duration: 500,
      delay: 0,
      offset: 0,
      easing: cubicInOut,
      onStart: noop,
      onDone: noop,
      onAborting: noop,
      scrollX: false,
      scrollY: true
    };

    const _scrollTo = options => {
      let {
        offset,
        duration,
        delay,
        easing,
        x=0,
        y=0,
        scrollX,
        scrollY,
        onStart,
        onDone,
        container,
        onAborting,
        element
      } = options;

      if (typeof offset === "function") {
        offset = offset();
      }

      var cumulativeOffsetContainer = _.cumulativeOffset(container);
      var cumulativeOffsetTarget = element
        ? _.cumulativeOffset(element)
        : { top: y, left: x };

      var initialX = _.scrollLeft(container);
      var initialY = _.scrollTop(container);

      var targetX =
        cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + offset;
      var targetY =
        cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + offset;

      var diffX = targetX - initialX;
    	var diffY = targetY - initialY;

      let scrolling = true;
      let started = false;
      let start_time = now() + delay;
      let end_time = start_time + duration;

      function scrollToTopLeft(element, top, left) {
        if (scrollX) _.scrollLeft(element, left);
        if (scrollY) _.scrollTop(element, top);
      }

      function start(delayStart) {
        if (!delayStart) {
          started = true;
          onStart(element, {x, y});
        }
      }

      function tick(progress) {
        scrollToTopLeft(
          container,
          initialY + diffY * progress,
          initialX + diffX * progress
        );
      }

      function stop() {
        scrolling = false;
      }

      loop(now => {
        if (!started && now >= start_time) {
          start(false);
        }

        if (started && now >= end_time) {
          tick(1);
          stop();
          onDone(element, {x, y});
        }

        if (!scrolling) {
          onAborting(element, {x, y});
          return false;
        }
        if (started) {
          const p = now - start_time;
          const t = 0 + 1 * easing(p / duration);
          tick(t);
        }

        return true;
      });

      start(delay);

      tick(0);

      return stop;
    };

    const proceedOptions = options => {
    	let opts = _.extend({}, defaultOptions, options);
      opts.container = _.$(opts.container);
      opts.element = _.$(opts.element);
      return opts;
    };

    const scrollTo = options => {
      return _scrollTo(proceedOptions(options));
    };

    const makeScrollToAction = scrollToFunc => {
      return (node, options) => {
        let current = options;
        const handle = e => {
          e.preventDefault();
          scrollToFunc(
            typeof current === "string" ? { element: current } : current
          );
        };
        node.addEventListener("click", handle);
        node.addEventListener("touchstart", handle);
        return {
          update(options) {
            current = options;
          },
          destroy() {
            node.removeEventListener("click", handle);
            node.removeEventListener("touchstart", handle);
          }
        };
      };
    };

    const scrollto = makeScrollToAction(scrollTo);

    /* src/components/Courses/CourseCard.svelte generated by Svelte v3.38.2 */
    const file$n = "src/components/Courses/CourseCard.svelte";

    // (11:4) <Subtext black={redCard}>
    function create_default_slot_1$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
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
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(11:4) <Subtext black={redCard}>",
    		ctx
    	});

    	return block;
    }

    // (15:8) <Button rounded type="{redCard?'secondary':'primary' }" inverted={!redCard} >
    function create_default_slot$8(ctx) {
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
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(15:8) <Button rounded type=\\\"{redCard?'secondary':'primary' }\\\" inverted={!redCard} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let h2_class_value;
    	let t1;
    	let subtext;
    	let t2;
    	let a;
    	let button;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	subtext = new Subtext({
    			props: {
    				black: /*redCard*/ ctx[0],
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				rounded: true,
    				type: /*redCard*/ ctx[0] ? "secondary" : "primary",
    				inverted: !/*redCard*/ ctx[0],
    				$$slots: { default: [create_default_slot$8] },
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
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(h2, "class", h2_class_value = "font-bold text-2xl " + (/*redCard*/ ctx[0] ? "text-white" : "text-black") + " font-Display");
    			add_location(h2, file$n, 9, 4, 394);
    			attr_dev(a, "href", "#ContactUs");
    			add_location(a, file$n, 13, 4, 562);

    			attr_dev(div, "class", div_class_value = "w-72 md:w-96 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 " + /*order*/ ctx[2] + " " + (/*redCard*/ ctx[0]
    			? "bg-blue-600 border-0 md:-mt-5"
    			: "bg-none"));

    			add_location(div, file$n, 8, 0, 241);
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
    			append_dev(div, a);
    			mount_component(button, a, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(scrollto.call(null, a, "#ContactUs"));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*cardTitle*/ 2) set_data_dev(t0, /*cardTitle*/ ctx[1]);

    			if (!current || dirty & /*redCard*/ 1 && h2_class_value !== (h2_class_value = "font-bold text-2xl " + (/*redCard*/ ctx[0] ? "text-white" : "text-black") + " font-Display")) {
    				attr_dev(h2, "class", h2_class_value);
    			}

    			const subtext_changes = {};
    			if (dirty & /*redCard*/ 1) subtext_changes.black = /*redCard*/ ctx[0];

    			if (dirty & /*$$scope*/ 16) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);
    			const button_changes = {};
    			if (dirty & /*redCard*/ 1) button_changes.type = /*redCard*/ ctx[0] ? "secondary" : "primary";
    			if (dirty & /*redCard*/ 1) button_changes.inverted = !/*redCard*/ ctx[0];

    			if (dirty & /*$$scope*/ 16) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (!current || dirty & /*order, redCard*/ 5 && div_class_value !== (div_class_value = "w-72 md:w-96 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 " + /*order*/ ctx[2] + " " + (/*redCard*/ ctx[0]
    			? "bg-blue-600 border-0 md:-mt-5"
    			: "bg-none"))) {
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
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CourseCard", slots, ['default']);
    	let { redCard = false } = $$props;
    	let { cardTitle } = $$props;
    	let { order } = $$props;
    	const writable_props = ["redCard", "cardTitle", "order"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CourseCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("redCard" in $$props) $$invalidate(0, redCard = $$props.redCard);
    		if ("cardTitle" in $$props) $$invalidate(1, cardTitle = $$props.cardTitle);
    		if ("order" in $$props) $$invalidate(2, order = $$props.order);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Subtext,
    		scrollto,
    		redCard,
    		cardTitle,
    		order
    	});

    	$$self.$inject_state = $$props => {
    		if ("redCard" in $$props) $$invalidate(0, redCard = $$props.redCard);
    		if ("cardTitle" in $$props) $$invalidate(1, cardTitle = $$props.cardTitle);
    		if ("order" in $$props) $$invalidate(2, order = $$props.order);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [redCard, cardTitle, order, slots, $$scope];
    }

    class CourseCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { redCard: 0, cardTitle: 1, order: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CourseCard",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cardTitle*/ ctx[1] === undefined && !("cardTitle" in props)) {
    			console.warn("<CourseCard> was created without expected prop 'cardTitle'");
    		}

    		if (/*order*/ ctx[2] === undefined && !("order" in props)) {
    			console.warn("<CourseCard> was created without expected prop 'order'");
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

    	get order() {
    		throw new Error("<CourseCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<CourseCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Courses/CourseSection.svelte generated by Svelte v3.38.2 */
    const file$m = "src/components/Courses/CourseSection.svelte";

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

    // (11:4) <CourseCard cardTitle="Spoken English" order="md:order-1 order-2">
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Improve your spoken English skills & build confidence to succeed in your carreer and life .To become a fluent English speaker, you must study and master reading, listening, and speaking. At Edustar Fastrack, the lessons are structured to give you practice in all three areas at the same time");
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
    		source: "(11:4) <CourseCard cardTitle=\\\"Spoken English\\\" order=\\\"md:order-1 order-2\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:4) <CourseCard cardTitle="IELTS Coaching" redCard order="md:order-2 order-1">
    function create_default_slot_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("The International English Language Testing System, or IELTS, is an international standardized test of English language proficiency for non-native English language speakers. It is jointly managed by the British Council, IDP: IELTS Australia and Cambridge Assessment English, and was established in 1989. With expert faculity, quality study materials and training EDUSTAR strives to provide you the best IELTS coaching out there.");
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
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(14:4) <CourseCard cardTitle=\\\"IELTS Coaching\\\" redCard order=\\\"md:order-2 order-1\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:4) <CourseCard cardTitle="Teachers Training" order="md:order-3 order-3">
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Edustar Fastrack Teacher Training seeks to provide rigorous personal and professional training to teachers in the most effective way possible, with a user-friendly platform. Our vision is to be an indispensable source of information, guidance and continuing education, striving towards achieving excellence in teaching. This is a journey through new avenues of self-discovery and self-improvement – after all, the best teachers are those who develop continuously with holistic learning!");
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
    		source: "(17:4) <CourseCard cardTitle=\\\"Teachers Training\\\" order=\\\"md:order-3 order-3\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let section;
    	let largeheading;
    	let t0;
    	let div0;
    	let coursecard0;
    	let t1;
    	let coursecard1;
    	let t2;
    	let coursecard2;
    	let t3;
    	let div9;
    	let div7;
    	let div5;
    	let div2;
    	let h30;
    	let t5;
    	let div1;
    	let ul0;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let li2;
    	let t11;
    	let div4;
    	let h31;
    	let t13;
    	let div3;
    	let ul1;
    	let li3;
    	let t15;
    	let li4;
    	let t17;
    	let div6;
    	let p0;
    	let t19;
    	let ul2;
    	let li5;
    	let i0;
    	let t20;
    	let t21;
    	let li6;
    	let i1;
    	let t22;
    	let t23;
    	let li7;
    	let i2;
    	let t24;
    	let t25;
    	let li8;
    	let i3;
    	let t26;
    	let t27;
    	let p1;
    	let t29;
    	let div8;
    	let h32;
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
    				cardTitle: "Spoken English",
    				order: "md:order-1 order-2",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	coursecard1 = new CourseCard({
    			props: {
    				cardTitle: "IELTS Coaching",
    				redCard: true,
    				order: "md:order-2 order-1",
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	coursecard2 = new CourseCard({
    			props: {
    				cardTitle: "Teachers Training",
    				order: "md:order-3 order-3",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(coursecard0.$$.fragment);
    			t1 = space();
    			create_component(coursecard1.$$.fragment);
    			t2 = space();
    			create_component(coursecard2.$$.fragment);
    			t3 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Online Classes:";
    			t5 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "8:00 AM - 1:00 PM";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "2:00 PM - 5:00 PM";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "8:30 PM - 10:30 PM";
    			t11 = space();
    			div4 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Institute Timing:";
    			t13 = space();
    			div3 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "10:00 AM - 5:00 PM";
    			t15 = space();
    			li4 = element("li");
    			li4.textContent = "Monday - Friday";
    			t17 = space();
    			div6 = element("div");
    			p0 = element("p");
    			p0.textContent = "Join Our whatsapp group to avail following facilities";
    			t19 = space();
    			ul2 = element("ul");
    			li5 = element("li");
    			i0 = element("i");
    			t20 = text(" Get A,G Reading Tests Free");
    			t21 = space();
    			li6 = element("li");
    			i1 = element("i");
    			t22 = text("  Get Speaking cue Cards Free");
    			t23 = space();
    			li7 = element("li");
    			i2 = element("i");
    			t24 = text(" Buy Our Speaking & Reading Book");
    			t25 = space();
    			li8 = element("li");
    			i3 = element("i");
    			t26 = text(" Get listening Tests Free");
    			t27 = space();
    			p1 = element("p");
    			p1.textContent = "To join,click on the whatsapp icon on right";
    			t29 = space();
    			div8 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Saturdays and Sundays are holidays for both online and offline classes";
    			attr_dev(div0, "class", "flex flex-col md:flex-row justify-center items-center text-center py-16 flex-wrap");
    			add_location(div0, file$m, 9, 0, 255);
    			attr_dev(h30, "class", "p-2 font-Display font-bold");
    			add_location(h30, file$m, 24, 16, 2091);
    			attr_dev(li0, "class", "text-blue-500");
    			add_location(li0, file$m, 26, 24, 2220);
    			attr_dev(li1, "class", "text-red-400");
    			add_location(li1, file$m, 27, 24, 2293);
    			attr_dev(li2, "class", "text-green-700");
    			add_location(li2, file$m, 28, 24, 2365);
    			add_location(ul0, file$m, 26, 20, 2216);
    			attr_dev(div1, "class", "text-left p-2");
    			add_location(div1, file$m, 25, 16, 2168);
    			attr_dev(div2, "class", "flex justify-center ");
    			add_location(div2, file$m, 23, 12, 2040);
    			attr_dev(h31, "class", "p-2 font-Display font-bold");
    			add_location(h31, file$m, 32, 16, 2526);
    			attr_dev(li3, "class", "text-blue-500");
    			add_location(li3, file$m, 34, 24, 2657);
    			attr_dev(li4, "class", "text-red-400");
    			add_location(li4, file$m, 35, 24, 2731);
    			add_location(ul1, file$m, 34, 20, 2653);
    			attr_dev(div3, "class", "text-left p-2");
    			add_location(div3, file$m, 33, 16, 2605);
    			attr_dev(div4, "class", "flex justify-center ");
    			add_location(div4, file$m, 31, 12, 2475);
    			attr_dev(div5, "class", "md:w-1/2 md:border-r-2");
    			add_location(div5, file$m, 22, 8, 1991);
    			attr_dev(p0, "class", "font-bold underline p-2");
    			add_location(p0, file$m, 40, 12, 2895);
    			attr_dev(i0, "class", "fas fa-plane text-blue-400");
    			add_location(i0, file$m, 42, 20, 3048);
    			add_location(li5, file$m, 42, 16, 3044);
    			attr_dev(i1, "class", "fas fa-plane text-blue-400");
    			add_location(i1, file$m, 43, 20, 3143);
    			add_location(li6, file$m, 43, 16, 3139);
    			attr_dev(i2, "class", "fas fa-plane text-blue-400");
    			add_location(i2, file$m, 44, 20, 3240);
    			add_location(li7, file$m, 44, 16, 3236);
    			attr_dev(i3, "class", "fas fa-plane text-blue-400");
    			add_location(i3, file$m, 45, 20, 3340);
    			add_location(li8, file$m, 45, 16, 3336);
    			attr_dev(ul2, "class", "text-left px-5");
    			add_location(ul2, file$m, 41, 12, 3000);
    			attr_dev(p1, "class", "font-bold text-red-400 p-5");
    			add_location(p1, file$m, 47, 13, 3445);
    			attr_dev(div6, "class", "md:w-1/2 font-Display");
    			add_location(div6, file$m, 39, 8, 2847);
    			attr_dev(div7, "class", " flex flex-wrap items-center justify-center text-xl");
    			add_location(div7, file$m, 21, 4, 1917);
    			attr_dev(h32, "class", "font-bold text-red-700 p-2");
    			add_location(h32, file$m, 51, 8, 3584);
    			attr_dev(div8, "class", "");
    			add_location(div8, file$m, 50, 4, 3561);
    			attr_dev(div9, "class", "bg-gray-100 p-5 md:w-2/3 m-auto");
    			add_location(div9, file$m, 20, 0, 1867);
    			attr_dev(section, "id", "Courses");
    			attr_dev(section, "class", "text-center mt-24 mb-16 w-screen overflow-hidden");
    			add_location(section, file$m, 7, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(largeheading, section, null);
    			append_dev(section, t0);
    			append_dev(section, div0);
    			mount_component(coursecard0, div0, null);
    			append_dev(div0, t1);
    			mount_component(coursecard1, div0, null);
    			append_dev(div0, t2);
    			mount_component(coursecard2, div0, null);
    			append_dev(section, t3);
    			append_dev(section, div9);
    			append_dev(div9, div7);
    			append_dev(div7, div5);
    			append_dev(div5, div2);
    			append_dev(div2, h30);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, h31);
    			append_dev(div4, t13);
    			append_dev(div4, div3);
    			append_dev(div3, ul1);
    			append_dev(ul1, li3);
    			append_dev(ul1, t15);
    			append_dev(ul1, li4);
    			append_dev(div7, t17);
    			append_dev(div7, div6);
    			append_dev(div6, p0);
    			append_dev(div6, t19);
    			append_dev(div6, ul2);
    			append_dev(ul2, li5);
    			append_dev(li5, i0);
    			append_dev(li5, t20);
    			append_dev(ul2, t21);
    			append_dev(ul2, li6);
    			append_dev(li6, i1);
    			append_dev(li6, t22);
    			append_dev(ul2, t23);
    			append_dev(ul2, li7);
    			append_dev(li7, i2);
    			append_dev(li7, t24);
    			append_dev(ul2, t25);
    			append_dev(ul2, li8);
    			append_dev(li8, i3);
    			append_dev(li8, t26);
    			append_dev(div6, t27);
    			append_dev(div6, p1);
    			append_dev(div9, t29);
    			append_dev(div9, div8);
    			append_dev(div8, h32);
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CourseSection",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/components/footer/Footer.svelte generated by Svelte v3.38.2 */

    const file$l = "src/components/footer/Footer.svelte";

    function create_fragment$n(ctx) {
    	let section;
    	let h30;
    	let t2;
    	let div;
    	let ul;
    	let li0;
    	let a0;
    	let t4;
    	let li1;
    	let a1;
    	let t6;
    	let li2;
    	let a2;
    	let t8;
    	let h31;
    	let t9;
    	let a3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h30 = element("h3");
    			h30.textContent = `© Edustar Fastrack IELTS Coaching center ${/*dt*/ ctx[0]}`;
    			t2 = space();
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Privacy Policiy";
    			t6 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Terms And Conditions";
    			t8 = space();
    			h31 = element("h3");
    			t9 = text("Powered by ");
    			a3 = element("a");
    			a3.textContent = "Infyplus Innovations";
    			attr_dev(h30, "class", "font-display font-bold text-white p-3");
    			add_location(h30, file$l, 4, 4, 122);
    			attr_dev(a0, "href", "./index.html");
    			add_location(a0, file$l, 7, 28, 393);
    			attr_dev(li0, "class", "p-3");
    			add_location(li0, file$l, 7, 12, 377);
    			attr_dev(a1, "href", "./privacy.html");
    			add_location(a1, file$l, 8, 28, 458);
    			attr_dev(li1, "class", "p-3");
    			add_location(li1, file$l, 8, 12, 442);
    			attr_dev(a2, "href", "./TermsAndConditions.html");
    			add_location(a2, file$l, 9, 16, 524);
    			attr_dev(li2, "class", "p-3");
    			add_location(li2, file$l, 9, 0, 508);
    			attr_dev(ul, "class", "flex justify-center items-center flex-wrap");
    			add_location(ul, file$l, 6, 8, 309);
    			attr_dev(div, "class", "font-body text-white flex justify-center items-center");
    			add_location(div, file$l, 5, 4, 233);
    			attr_dev(a3, "href", "https://infyplus.tech");
    			attr_dev(a3, "class", "font-bold");
    			add_location(a3, file$l, 12, 52, 667);
    			attr_dev(h31, "class", "font-body text-white p-3");
    			add_location(h31, file$l, 12, 4, 619);
    			attr_dev(section, "id", "Footer");
    			attr_dev(section, "class", "bg-purple-700 p-5 text-center");
    			add_location(section, file$l, 3, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h30);
    			append_dev(section, t2);
    			append_dev(section, div);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(section, t8);
    			append_dev(section, h31);
    			append_dev(h31, t9);
    			append_dev(h31, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let dt = new Date().getFullYear();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ dt });

    	$$self.$inject_state = $$props => {
    		if ("dt" in $$props) $$invalidate(0, dt = $$props.dt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dt];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* node_modules/svelte-lightbox/src/LightboxThumbnail.svelte generated by Svelte v3.38.2 */
    const file$k = "node_modules/svelte-lightbox/src/LightboxThumbnail.svelte";

    function create_fragment$m(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*classes*/ ctx[0]) + " svelte-1u332e1"));
    			attr_dev(div0, "style", /*style*/ ctx[1]);
    			toggle_class(div0, "svelte-lightbox-unselectable", /*protect*/ ctx[2]);
    			add_location(div0, file$k, 11, 4, 296);
    			attr_dev(div1, "class", "clickable svelte-1u332e1");
    			add_location(div1, file$k, 10, 0, 231);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*classes*/ ctx[0]) + " svelte-1u332e1"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div0, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*classes, protect*/ 5) {
    				toggle_class(div0, "svelte-lightbox-unselectable", /*protect*/ ctx[2]);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxThumbnail", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { class: classes = "" } = $$props;
    	let { style = "" } = $$props;
    	let { protect = false } = $$props;
    	const writable_props = ["class", "style", "protect"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxThumbnail> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("click");

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, classes = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("protect" in $$props) $$invalidate(2, protect = $$props.protect);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		classes,
    		style,
    		protect
    	});

    	$$self.$inject_state = $$props => {
    		if ("classes" in $$props) $$invalidate(0, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("protect" in $$props) $$invalidate(2, protect = $$props.protect);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [classes, style, protect, dispatch, $$scope, slots, click_handler];
    }

    class LightboxThumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { class: 0, style: 1, protect: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxThumbnail",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get class() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxHeader.svelte generated by Svelte v3.38.2 */
    const file$j = "node_modules/svelte-lightbox/src/Modal/LightboxHeader.svelte";

    // (13:4) {#if closeButton}
    function create_if_block$8(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("×");
    			attr_dev(button, "size", /*size*/ ctx[0]);
    			attr_dev(button, "style", /*style*/ ctx[1]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*buttonClasses*/ ctx[3]) + " svelte-12yipzn"));
    			add_location(button, file$j, 13, 8, 365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(button, "size", /*size*/ ctx[0]);
    			}

    			if (dirty & /*style*/ 2) {
    				attr_dev(button, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*buttonClasses*/ 8 && button_class_value !== (button_class_value = "" + (null_to_empty(/*buttonClasses*/ ctx[3]) + " svelte-12yipzn"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(13:4) {#if closeButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let div_class_value;
    	let if_block = /*closeButton*/ ctx[4] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("svelte-lightbox-header " + /*headerClasses*/ ctx[2]) + " svelte-12yipzn"));
    			add_location(div, file$j, 11, 0, 279);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*closeButton*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*headerClasses*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty("svelte-lightbox-header " + /*headerClasses*/ ctx[2]) + " svelte-12yipzn"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxHeader", slots, []);
    	const dispatch = createEventDispatcher();
    	let { size = "xs" } = $$props;
    	let { style = "" } = $$props;
    	let { headerClasses = "" } = $$props;
    	let { buttonClasses = "" } = $$props;
    	let { closeButton = true } = $$props;
    	const writable_props = ["size", "style", "headerClasses", "buttonClasses", "closeButton"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxHeader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("close");

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("headerClasses" in $$props) $$invalidate(2, headerClasses = $$props.headerClasses);
    		if ("buttonClasses" in $$props) $$invalidate(3, buttonClasses = $$props.buttonClasses);
    		if ("closeButton" in $$props) $$invalidate(4, closeButton = $$props.closeButton);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		size,
    		style,
    		headerClasses,
    		buttonClasses,
    		closeButton
    	});

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("headerClasses" in $$props) $$invalidate(2, headerClasses = $$props.headerClasses);
    		if ("buttonClasses" in $$props) $$invalidate(3, buttonClasses = $$props.buttonClasses);
    		if ("closeButton" in $$props) $$invalidate(4, closeButton = $$props.closeButton);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		style,
    		headerClasses,
    		buttonClasses,
    		closeButton,
    		dispatch,
    		click_handler
    	];
    }

    class LightboxHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			size: 0,
    			style: 1,
    			headerClasses: 2,
    			buttonClasses: 3,
    			closeButton: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxHeader",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get size() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerClasses() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerClasses(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonClasses() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonClasses(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxBody.svelte generated by Svelte v3.38.2 */

    const { console: console_1$2 } = globals;
    const file$i = "node_modules/svelte-lightbox/src/Modal/LightboxBody.svelte";

    // (43:4) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-5blj8a");
    			toggle_class(div, "svelte-lightbox-image-portrait", /*portrait*/ ctx[2]);
    			toggle_class(div, "expand", /*imagePreset*/ ctx[3] == "expand");
    			toggle_class(div, "fit", /*imagePreset*/ ctx[3] == "fit");
    			add_location(div, file$i, 43, 8, 1302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			if (dirty & /*portrait*/ 4) {
    				toggle_class(div, "svelte-lightbox-image-portrait", /*portrait*/ ctx[2]);
    			}

    			if (dirty & /*imagePreset*/ 8) {
    				toggle_class(div, "expand", /*imagePreset*/ ctx[3] == "expand");
    			}

    			if (dirty & /*imagePreset*/ 8) {
    				toggle_class(div, "fit", /*imagePreset*/ ctx[3] == "fit");
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
    			/*div_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(43:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#if image.src}
    function create_if_block$7(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_style_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[0].alt);
    			attr_dev(img, "style", img_style_value = /*image*/ ctx[0].style);
    			attr_dev(img, "class", /*imageClass*/ ctx[5]);
    			add_location(img, file$i, 41, 8, 1205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*image*/ 1 && img.src !== (img_src_value = /*image*/ ctx[0].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*image*/ 1 && img_alt_value !== (img_alt_value = /*image*/ ctx[0].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*image*/ 1 && img_style_value !== (img_style_value = /*image*/ ctx[0].style)) {
    				attr_dev(img, "style", img_style_value);
    			}

    			if (dirty & /*imageClass*/ 32) {
    				attr_dev(img, "class", /*imageClass*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(41:4) {#if image.src}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*image*/ ctx[0].src) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "svelte-lightbox-body svelte-5blj8a");
    			toggle_class(div, "svelte-lightbox-unselectable", /*protect*/ ctx[1]);
    			add_location(div, file$i, 39, 0, 1097);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (dirty & /*protect*/ 2) {
    				toggle_class(div, "svelte-lightbox-unselectable", /*protect*/ ctx[1]);
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
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
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
    	let imageClass;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxBody", slots, ['default']);
    	let { image = {} } = $$props;
    	let { protect = false } = $$props;
    	let { portrait = false } = $$props;
    	let { imagePreset = false } = $$props;
    	let imageParent;

    	const presets = {
    		fit: {
    			width: "",
    			maxWidth: "80vw",
    			height: "",
    			maxHeight: "80vh"
    		},
    		expand: {
    			width: "100%",
    			maxWidth: "",
    			height: "auto",
    			maxHeight: ""
    		},
    		scroll: {
    			width: "auto",
    			height: "auto",
    			overflow: "scroll"
    		}
    	};

    	const writable_props = ["image", "protect", "portrait", "imagePreset"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<LightboxBody> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			imageParent = $$value;
    			$$invalidate(4, imageParent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(1, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(2, portrait = $$props.portrait);
    		if ("imagePreset" in $$props) $$invalidate(3, imagePreset = $$props.imagePreset);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		image,
    		protect,
    		portrait,
    		imagePreset,
    		imageParent,
    		presets,
    		imageClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(1, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(2, portrait = $$props.portrait);
    		if ("imagePreset" in $$props) $$invalidate(3, imagePreset = $$props.imagePreset);
    		if ("imageParent" in $$props) $$invalidate(4, imageParent = $$props.imageParent);
    		if ("imageClass" in $$props) $$invalidate(5, imageClass = $$props.imageClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*imageParent, imagePreset*/ 24) {
    			if (imageParent && imagePreset) {
    				const imageStyle = imageParent.firstChild.style;
    				imageStyle.width = presets[imagePreset].width;
    				imageStyle.height = presets[imagePreset].height;
    				imageStyle.maxWidth = presets[imagePreset].maxWidth;
    				imageStyle.maxHeight = presets[imagePreset].maxHeight;
    				imageStyle.overflow = presets[imagePreset].overflow;
    			}
    		}

    		if ($$self.$$.dirty & /*imagePreset*/ 8) {
    			console.log("imagePreset:", imagePreset);
    		}

    		if ($$self.$$.dirty & /*image, imagePreset*/ 9) {
    			$$invalidate(5, imageClass = `${image.class} ${imagePreset ? imagePreset : ""}`);
    		}
    	};

    	return [
    		image,
    		protect,
    		portrait,
    		imagePreset,
    		imageParent,
    		imageClass,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class LightboxBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			image: 0,
    			protect: 1,
    			portrait: 2,
    			imagePreset: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxBody",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get image() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imagePreset() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePreset(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxFooter.svelte generated by Svelte v3.38.2 */

    const file$h = "node_modules/svelte-lightbox/src/Modal/LightboxFooter.svelte";

    // (18:4) {#if galleryLength}
    function create_if_block$6(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*activeImage*/ ctx[3] + 1 + "";
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Image ");
    			t1 = text(t1_value);
    			t2 = text(" of ");
    			t3 = text(/*galleryLength*/ ctx[2]);
    			add_location(p, file$h, 18, 8, 373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeImage*/ 8 && t1_value !== (t1_value = /*activeImage*/ ctx[3] + 1 + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*galleryLength*/ 4) set_data_dev(t3, /*galleryLength*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(18:4) {#if galleryLength}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let h5;
    	let t1;
    	let div_class_value;
    	let if_block = /*galleryLength*/ ctx[2] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = space();
    			h5 = element("h5");
    			t1 = space();
    			if (if_block) if_block.c();
    			add_location(h2, file$h, 11, 4, 257);
    			add_location(h5, file$h, 14, 4, 298);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("svelte-lightbox-footer " + /*classes*/ ctx[4]) + " svelte-1u8lh7d"));
    			attr_dev(div, "style", /*style*/ ctx[5]);
    			add_location(div, file$h, 10, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			h2.innerHTML = /*title*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, h5);
    			h5.innerHTML = /*description*/ ctx[1];
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) h2.innerHTML = /*title*/ ctx[0];			if (dirty & /*description*/ 2) h5.innerHTML = /*description*/ ctx[1];
    			if (/*galleryLength*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*classes*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty("svelte-lightbox-footer " + /*classes*/ ctx[4]) + " svelte-1u8lh7d"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*style*/ 32) {
    				attr_dev(div, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
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
    	validate_slots("LightboxFooter", slots, []);
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { galleryLength } = $$props;
    	let { activeImage } = $$props;
    	let { classes = "" } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["title", "description", "galleryLength", "activeImage", "classes", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxFooter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("galleryLength" in $$props) $$invalidate(2, galleryLength = $$props.galleryLength);
    		if ("activeImage" in $$props) $$invalidate(3, activeImage = $$props.activeImage);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		description,
    		galleryLength,
    		activeImage,
    		classes,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("galleryLength" in $$props) $$invalidate(2, galleryLength = $$props.galleryLength);
    		if ("activeImage" in $$props) $$invalidate(3, activeImage = $$props.activeImage);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, description, galleryLength, activeImage, classes, style];
    }

    class LightboxFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			title: 0,
    			description: 1,
    			galleryLength: 2,
    			activeImage: 3,
    			classes: 4,
    			style: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxFooter",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*galleryLength*/ ctx[2] === undefined && !("galleryLength" in props)) {
    			console.warn("<LightboxFooter> was created without expected prop 'galleryLength'");
    		}

    		if (/*activeImage*/ ctx[3] === undefined && !("activeImage" in props)) {
    			console.warn("<LightboxFooter> was created without expected prop 'activeImage'");
    		}
    	}

    	get title() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get galleryLength() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set galleryLength(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/ModalCover.svelte generated by Svelte v3.38.2 */
    const file$g = "node_modules/svelte-lightbox/src/Modal/ModalCover.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-o5rrpx");
    			add_location(div, file$g, 12, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				if (!div_intro) div_intro = create_in_transition(div, fade, {
    					duration: /*transitionDuration*/ ctx[0] * 2
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();

    			div_outro = create_out_transition(div, fade, {
    				duration: /*transitionDuration*/ ctx[0] / 2
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
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

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ModalCover", slots, ['default']);
    	let { transitionDuration } = $$props;
    	const dispatch = createEventDispatcher();

    	const click = () => {
    		dispatch("click");
    	};

    	const writable_props = ["transitionDuration"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ModalCover> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("transitionDuration" in $$props) $$invalidate(0, transitionDuration = $$props.transitionDuration);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		transitionDuration,
    		dispatch,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("transitionDuration" in $$props) $$invalidate(0, transitionDuration = $$props.transitionDuration);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [transitionDuration, $$scope, slots, click_handler];
    }

    class ModalCover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { transitionDuration: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalCover",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*transitionDuration*/ ctx[0] === undefined && !("transitionDuration" in props)) {
    			console.warn("<ModalCover> was created without expected prop 'transitionDuration'");
    		}
    	}

    	get transitionDuration() {
    		throw new Error("<ModalCover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<ModalCover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/Modal.svelte generated by Svelte v3.38.2 */
    const file$f = "node_modules/svelte-lightbox/src/Modal/Modal.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let div_class_value;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*modalClasses*/ ctx[0]) + " svelte-1nx05o5"));
    			add_location(div, file$f, 15, 0, 312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*modalClasses*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(/*modalClasses*/ ctx[0]) + " svelte-1nx05o5"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*transitionDuration*/ ctx[1] }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*transitionDuration*/ ctx[1] }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
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

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { modalStyle } = $$props;
    	let { modalClasses } = $$props;
    	let { transitionDuration } = $$props;

    	const click = () => {
    		dispatch("click");
    	};

    	const writable_props = ["modalStyle", "modalClasses", "transitionDuration"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("modalStyle" in $$props) $$invalidate(2, modalStyle = $$props.modalStyle);
    		if ("modalClasses" in $$props) $$invalidate(0, modalClasses = $$props.modalClasses);
    		if ("transitionDuration" in $$props) $$invalidate(1, transitionDuration = $$props.transitionDuration);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		dispatch,
    		modalStyle,
    		modalClasses,
    		transitionDuration,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("modalStyle" in $$props) $$invalidate(2, modalStyle = $$props.modalStyle);
    		if ("modalClasses" in $$props) $$invalidate(0, modalClasses = $$props.modalClasses);
    		if ("transitionDuration" in $$props) $$invalidate(1, transitionDuration = $$props.transitionDuration);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modalClasses, transitionDuration, modalStyle, $$scope, slots, click_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			modalStyle: 2,
    			modalClasses: 0,
    			transitionDuration: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*modalStyle*/ ctx[2] === undefined && !("modalStyle" in props)) {
    			console.warn("<Modal> was created without expected prop 'modalStyle'");
    		}

    		if (/*modalClasses*/ ctx[0] === undefined && !("modalClasses" in props)) {
    			console.warn("<Modal> was created without expected prop 'modalClasses'");
    		}

    		if (/*transitionDuration*/ ctx[1] === undefined && !("transitionDuration" in props)) {
    			console.warn("<Modal> was created without expected prop 'transitionDuration'");
    		}
    	}

    	get modalStyle() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClasses() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/Index.svelte generated by Svelte v3.38.2 */

    // (44:8) <Body bind:image={image} bind:protect={protect} bind:portrait={portrait} bind:imagePreset>
    function create_default_slot_2$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[31], null);

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
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 1)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[31], dirty, null, null);
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
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(44:8) <Body bind:image={image} bind:protect={protect} bind:portrait={portrait} bind:imagePreset>",
    		ctx
    	});

    	return block;
    }

    // (41:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration on:click={ () => dispatch('modalClick') }>
    function create_default_slot_1$4(ctx) {
    	let header;
    	let updating_closeButton;
    	let t0;
    	let body;
    	let updating_image;
    	let updating_protect;
    	let updating_portrait;
    	let updating_imagePreset;
    	let t1;
    	let footer;
    	let updating_title;
    	let updating_description;
    	let updating_activeImage;
    	let current;

    	function header_closeButton_binding(value) {
    		/*header_closeButton_binding*/ ctx[16](value);
    	}

    	let header_props = {};

    	if (/*closeButton*/ ctx[8] !== void 0) {
    		header_props.closeButton = /*closeButton*/ ctx[8];
    	}

    	header = new LightboxHeader({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, "closeButton", header_closeButton_binding));
    	header.$on("close", /*close_handler*/ ctx[17]);

    	function body_image_binding(value) {
    		/*body_image_binding*/ ctx[18](value);
    	}

    	function body_protect_binding(value) {
    		/*body_protect_binding*/ ctx[19](value);
    	}

    	function body_portrait_binding(value) {
    		/*body_portrait_binding*/ ctx[20](value);
    	}

    	function body_imagePreset_binding(value) {
    		/*body_imagePreset_binding*/ ctx[21](value);
    	}

    	let body_props = {
    		$$slots: { default: [create_default_slot_2$2] },
    		$$scope: { ctx }
    	};

    	if (/*image*/ ctx[4] !== void 0) {
    		body_props.image = /*image*/ ctx[4];
    	}

    	if (/*protect*/ ctx[5] !== void 0) {
    		body_props.protect = /*protect*/ ctx[5];
    	}

    	if (/*portrait*/ ctx[6] !== void 0) {
    		body_props.portrait = /*portrait*/ ctx[6];
    	}

    	if (/*imagePreset*/ ctx[7] !== void 0) {
    		body_props.imagePreset = /*imagePreset*/ ctx[7];
    	}

    	body = new LightboxBody({ props: body_props, $$inline: true });
    	binding_callbacks.push(() => bind(body, "image", body_image_binding));
    	binding_callbacks.push(() => bind(body, "protect", body_protect_binding));
    	binding_callbacks.push(() => bind(body, "portrait", body_portrait_binding));
    	binding_callbacks.push(() => bind(body, "imagePreset", body_imagePreset_binding));

    	function footer_title_binding(value) {
    		/*footer_title_binding*/ ctx[22](value);
    	}

    	function footer_description_binding(value) {
    		/*footer_description_binding*/ ctx[23](value);
    	}

    	function footer_activeImage_binding(value) {
    		/*footer_activeImage_binding*/ ctx[24](value);
    	}

    	let footer_props = {
    		galleryLength: /*gallery*/ ctx[9] ? /*gallery*/ ctx[9].length : false
    	};

    	if (/*actualTitle*/ ctx[10] !== void 0) {
    		footer_props.title = /*actualTitle*/ ctx[10];
    	}

    	if (/*actualDescription*/ ctx[11] !== void 0) {
    		footer_props.description = /*actualDescription*/ ctx[11];
    	}

    	if (/*activeImage*/ ctx[0] !== void 0) {
    		footer_props.activeImage = /*activeImage*/ ctx[0];
    	}

    	footer = new LightboxFooter({ props: footer_props, $$inline: true });
    	binding_callbacks.push(() => bind(footer, "title", footer_title_binding));
    	binding_callbacks.push(() => bind(footer, "description", footer_description_binding));
    	binding_callbacks.push(() => bind(footer, "activeImage", footer_activeImage_binding));

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(body.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(body, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (!updating_closeButton && dirty[0] & /*closeButton*/ 256) {
    				updating_closeButton = true;
    				header_changes.closeButton = /*closeButton*/ ctx[8];
    				add_flush_callback(() => updating_closeButton = false);
    			}

    			header.$set(header_changes);
    			const body_changes = {};

    			if (dirty[1] & /*$$scope*/ 1) {
    				body_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_image && dirty[0] & /*image*/ 16) {
    				updating_image = true;
    				body_changes.image = /*image*/ ctx[4];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 32) {
    				updating_protect = true;
    				body_changes.protect = /*protect*/ ctx[5];
    				add_flush_callback(() => updating_protect = false);
    			}

    			if (!updating_portrait && dirty[0] & /*portrait*/ 64) {
    				updating_portrait = true;
    				body_changes.portrait = /*portrait*/ ctx[6];
    				add_flush_callback(() => updating_portrait = false);
    			}

    			if (!updating_imagePreset && dirty[0] & /*imagePreset*/ 128) {
    				updating_imagePreset = true;
    				body_changes.imagePreset = /*imagePreset*/ ctx[7];
    				add_flush_callback(() => updating_imagePreset = false);
    			}

    			body.$set(body_changes);
    			const footer_changes = {};
    			if (dirty[0] & /*gallery*/ 512) footer_changes.galleryLength = /*gallery*/ ctx[9] ? /*gallery*/ ctx[9].length : false;

    			if (!updating_title && dirty[0] & /*actualTitle*/ 1024) {
    				updating_title = true;
    				footer_changes.title = /*actualTitle*/ ctx[10];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_description && dirty[0] & /*actualDescription*/ 2048) {
    				updating_description = true;
    				footer_changes.description = /*actualDescription*/ ctx[11];
    				add_flush_callback(() => updating_description = false);
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 1) {
    				updating_activeImage = true;
    				footer_changes.activeImage = /*activeImage*/ ctx[0];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(body, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(41:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration on:click={ () => dispatch('modalClick') }>",
    		ctx
    	});

    	return block;
    }

    // (40:0) <ModalCover bind:transitionDuration on:click={ () => dispatch('topModalClick') }>
    function create_default_slot$6(ctx) {
    	let modal;
    	let updating_modalClasses;
    	let updating_modalStyle;
    	let updating_transitionDuration;
    	let current;

    	function modal_modalClasses_binding(value) {
    		/*modal_modalClasses_binding*/ ctx[25](value);
    	}

    	function modal_modalStyle_binding(value) {
    		/*modal_modalStyle_binding*/ ctx[26](value);
    	}

    	function modal_transitionDuration_binding(value) {
    		/*modal_transitionDuration_binding*/ ctx[27](value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot_1$4] },
    		$$scope: { ctx }
    	};

    	if (/*modalClasses*/ ctx[1] !== void 0) {
    		modal_props.modalClasses = /*modalClasses*/ ctx[1];
    	}

    	if (/*modalStyle*/ ctx[2] !== void 0) {
    		modal_props.modalStyle = /*modalStyle*/ ctx[2];
    	}

    	if (/*transitionDuration*/ ctx[3] !== void 0) {
    		modal_props.transitionDuration = /*transitionDuration*/ ctx[3];
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "modalClasses", modal_modalClasses_binding));
    	binding_callbacks.push(() => bind(modal, "modalStyle", modal_modalStyle_binding));
    	binding_callbacks.push(() => bind(modal, "transitionDuration", modal_transitionDuration_binding));
    	modal.$on("click", /*click_handler*/ ctx[28]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*gallery, actualTitle, actualDescription, activeImage, image, protect, portrait, imagePreset, closeButton*/ 4081 | dirty[1] & /*$$scope*/ 1) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_modalClasses && dirty[0] & /*modalClasses*/ 2) {
    				updating_modalClasses = true;
    				modal_changes.modalClasses = /*modalClasses*/ ctx[1];
    				add_flush_callback(() => updating_modalClasses = false);
    			}

    			if (!updating_modalStyle && dirty[0] & /*modalStyle*/ 4) {
    				updating_modalStyle = true;
    				modal_changes.modalStyle = /*modalStyle*/ ctx[2];
    				add_flush_callback(() => updating_modalStyle = false);
    			}

    			if (!updating_transitionDuration && dirty[0] & /*transitionDuration*/ 8) {
    				updating_transitionDuration = true;
    				modal_changes.transitionDuration = /*transitionDuration*/ ctx[3];
    				add_flush_callback(() => updating_transitionDuration = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(40:0) <ModalCover bind:transitionDuration on:click={ () => dispatch('topModalClick') }>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let modalcover;
    	let updating_transitionDuration;
    	let current;

    	function modalcover_transitionDuration_binding(value) {
    		/*modalcover_transitionDuration_binding*/ ctx[29](value);
    	}

    	let modalcover_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	if (/*transitionDuration*/ ctx[3] !== void 0) {
    		modalcover_props.transitionDuration = /*transitionDuration*/ ctx[3];
    	}

    	modalcover = new ModalCover({ props: modalcover_props, $$inline: true });
    	binding_callbacks.push(() => bind(modalcover, "transitionDuration", modalcover_transitionDuration_binding));
    	modalcover.$on("click", /*click_handler_1*/ ctx[30]);

    	const block = {
    		c: function create() {
    			create_component(modalcover.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalcover, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalcover_changes = {};

    			if (dirty[0] & /*modalClasses, modalStyle, transitionDuration, gallery, actualTitle, actualDescription, activeImage, image, protect, portrait, imagePreset, closeButton*/ 4095 | dirty[1] & /*$$scope*/ 1) {
    				modalcover_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_transitionDuration && dirty[0] & /*transitionDuration*/ 8) {
    				updating_transitionDuration = true;
    				modalcover_changes.transitionDuration = /*transitionDuration*/ ctx[3];
    				add_flush_callback(() => updating_transitionDuration = false);
    			}

    			modalcover.$set(modalcover_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalcover.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalcover.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalcover, detaching);
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

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { modalClasses = "" } = $$props;
    	let { modalStyle = "" } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { image = {} } = $$props;
    	let { protect = false } = $$props;
    	let { portrait = false } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { gallery = [] } = $$props;
    	let { activeImage } = $$props;
    	let { imagePreset } = $$props;
    	let { closeButton } = $$props;
    	let actualTitle;
    	let actualDescription;

    	const writable_props = [
    		"modalClasses",
    		"modalStyle",
    		"transitionDuration",
    		"image",
    		"protect",
    		"portrait",
    		"title",
    		"description",
    		"gallery",
    		"activeImage",
    		"imagePreset",
    		"closeButton"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	function header_closeButton_binding(value) {
    		closeButton = value;
    		$$invalidate(8, closeButton);
    	}

    	const close_handler = () => dispatch("close");

    	function body_image_binding(value) {
    		image = value;
    		$$invalidate(4, image);
    	}

    	function body_protect_binding(value) {
    		protect = value;
    		$$invalidate(5, protect);
    	}

    	function body_portrait_binding(value) {
    		portrait = value;
    		$$invalidate(6, portrait);
    	}

    	function body_imagePreset_binding(value) {
    		imagePreset = value;
    		$$invalidate(7, imagePreset);
    	}

    	function footer_title_binding(value) {
    		actualTitle = value;
    		(((($$invalidate(10, actualTitle), $$invalidate(13, title)), $$invalidate(9, gallery)), $$invalidate(14, description)), $$invalidate(0, activeImage));
    	}

    	function footer_description_binding(value) {
    		actualDescription = value;
    		(((($$invalidate(11, actualDescription), $$invalidate(14, description)), $$invalidate(9, gallery)), $$invalidate(13, title)), $$invalidate(0, activeImage));
    	}

    	function footer_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(0, activeImage);
    	}

    	function modal_modalClasses_binding(value) {
    		modalClasses = value;
    		$$invalidate(1, modalClasses);
    	}

    	function modal_modalStyle_binding(value) {
    		modalStyle = value;
    		$$invalidate(2, modalStyle);
    	}

    	function modal_transitionDuration_binding(value) {
    		transitionDuration = value;
    		$$invalidate(3, transitionDuration);
    	}

    	const click_handler = () => dispatch("modalClick");

    	function modalcover_transitionDuration_binding(value) {
    		transitionDuration = value;
    		$$invalidate(3, transitionDuration);
    	}

    	const click_handler_1 = () => dispatch("topModalClick");

    	$$self.$$set = $$props => {
    		if ("modalClasses" in $$props) $$invalidate(1, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(2, modalStyle = $$props.modalStyle);
    		if ("transitionDuration" in $$props) $$invalidate(3, transitionDuration = $$props.transitionDuration);
    		if ("image" in $$props) $$invalidate(4, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(5, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(6, portrait = $$props.portrait);
    		if ("title" in $$props) $$invalidate(13, title = $$props.title);
    		if ("description" in $$props) $$invalidate(14, description = $$props.description);
    		if ("gallery" in $$props) $$invalidate(9, gallery = $$props.gallery);
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("imagePreset" in $$props) $$invalidate(7, imagePreset = $$props.imagePreset);
    		if ("closeButton" in $$props) $$invalidate(8, closeButton = $$props.closeButton);
    		if ("$$scope" in $$props) $$invalidate(31, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		Header: LightboxHeader,
    		Body: LightboxBody,
    		Footer: LightboxFooter,
    		ModalCover,
    		Modal,
    		dispatch,
    		modalClasses,
    		modalStyle,
    		transitionDuration,
    		image,
    		protect,
    		portrait,
    		title,
    		description,
    		gallery,
    		activeImage,
    		imagePreset,
    		closeButton,
    		actualTitle,
    		actualDescription
    	});

    	$$self.$inject_state = $$props => {
    		if ("modalClasses" in $$props) $$invalidate(1, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(2, modalStyle = $$props.modalStyle);
    		if ("transitionDuration" in $$props) $$invalidate(3, transitionDuration = $$props.transitionDuration);
    		if ("image" in $$props) $$invalidate(4, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(5, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(6, portrait = $$props.portrait);
    		if ("title" in $$props) $$invalidate(13, title = $$props.title);
    		if ("description" in $$props) $$invalidate(14, description = $$props.description);
    		if ("gallery" in $$props) $$invalidate(9, gallery = $$props.gallery);
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("imagePreset" in $$props) $$invalidate(7, imagePreset = $$props.imagePreset);
    		if ("closeButton" in $$props) $$invalidate(8, closeButton = $$props.closeButton);
    		if ("actualTitle" in $$props) $$invalidate(10, actualTitle = $$props.actualTitle);
    		if ("actualDescription" in $$props) $$invalidate(11, actualDescription = $$props.actualDescription);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*title*/ 8192) {
    			// For variable title and description, we need to define this auxiliary variables
    			$$invalidate(10, actualTitle = title);
    		}

    		if ($$self.$$.dirty[0] & /*description*/ 16384) {
    			$$invalidate(11, actualDescription = description);
    		}

    		if ($$self.$$.dirty[0] & /*gallery, title, description, activeImage*/ 25089) {
    			// If there is not universal title or description for gallery, we will display individual title and description
    			if (gallery && !title && !description) {
    				$$invalidate(10, actualTitle = gallery[activeImage].title);
    				$$invalidate(11, actualDescription = gallery[activeImage].description);
    			}
    		}
    	};

    	return [
    		activeImage,
    		modalClasses,
    		modalStyle,
    		transitionDuration,
    		image,
    		protect,
    		portrait,
    		imagePreset,
    		closeButton,
    		gallery,
    		actualTitle,
    		actualDescription,
    		dispatch,
    		title,
    		description,
    		slots,
    		header_closeButton_binding,
    		close_handler,
    		body_image_binding,
    		body_protect_binding,
    		body_portrait_binding,
    		body_imagePreset_binding,
    		footer_title_binding,
    		footer_description_binding,
    		footer_activeImage_binding,
    		modal_modalClasses_binding,
    		modal_modalStyle_binding,
    		modal_transitionDuration_binding,
    		click_handler,
    		modalcover_transitionDuration_binding,
    		click_handler_1,
    		$$scope
    	];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$g,
    			create_fragment$g,
    			safe_not_equal,
    			{
    				modalClasses: 1,
    				modalStyle: 2,
    				transitionDuration: 3,
    				image: 4,
    				protect: 5,
    				portrait: 6,
    				title: 13,
    				description: 14,
    				gallery: 9,
    				activeImage: 0,
    				imagePreset: 7,
    				closeButton: 8
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeImage*/ ctx[0] === undefined && !("activeImage" in props)) {
    			console.warn("<Index> was created without expected prop 'activeImage'");
    		}

    		if (/*imagePreset*/ ctx[7] === undefined && !("imagePreset" in props)) {
    			console.warn("<Index> was created without expected prop 'imagePreset'");
    		}

    		if (/*closeButton*/ ctx[8] === undefined && !("closeButton" in props)) {
    			console.warn("<Index> was created without expected prop 'closeButton'");
    		}
    	}

    	get modalClasses() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalStyle() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gallery() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imagePreset() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePreset(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Gallery/InternalGallery.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$e = "node_modules/svelte-lightbox/src/Gallery/InternalGallery.svelte";

    function create_fragment$f(ctx) {
    	let div1;
    	let button0;
    	let svg0;
    	let g0;
    	let path0;
    	let button0_disabled_value;
    	let t0;
    	let div0;
    	let t1;
    	let button1;
    	let svg1;
    	let g1;
    	let path1;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			attr_dev(path0, "class", "arrow svelte-wwe8hv");
    			attr_dev(path0, "d", "M8.7,7.22,4.59,11.33a1,1,0,0,0,0,1.41l4,4");
    			add_location(path0, file$e, 48, 16, 1742);
    			add_location(g0, file$e, 47, 12, 1722);
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-wwe8hv");
    			add_location(svg0, file$e, 46, 8, 1649);
    			button0.disabled = button0_disabled_value = /*activeImage*/ ctx[0] === 0;
    			attr_dev(button0, "class", "previous-button svelte-wwe8hv");
    			add_location(button0, file$e, 45, 4, 1554);
    			attr_dev(div0, "class", "slot svelte-wwe8hv");
    			add_location(div0, file$e, 54, 4, 1888);
    			attr_dev(path1, "class", "arrow svelte-wwe8hv");
    			attr_dev(path1, "d", "M15.3,16.78l4.11-4.11a1,1,0,0,0,0-1.41l-4-4");
    			add_location(path1, file$e, 63, 16, 2198);
    			add_location(g1, file$e, 62, 12, 2178);
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-wwe8hv");
    			add_location(svg1, file$e, 61, 8, 2105);
    			button1.disabled = button1_disabled_value = /*activeImage*/ ctx[0] === /*images*/ ctx[2]?.length - 1;
    			attr_dev(button1, "class", "next-button svelte-wwe8hv");
    			add_location(button1, file$e, 60, 4, 2003);
    			attr_dev(div1, "class", "wrapper svelte-wwe8hv");
    			add_location(div1, file$e, 43, 0, 1504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, g0);
    			append_dev(g0, path0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[7](div0);
    			append_dev(div1, t1);
    			append_dev(div1, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g1);
    			append_dev(g1, path1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*previousImage*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*nextImage*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*activeImage*/ 1 && button0_disabled_value !== (button0_disabled_value = /*activeImage*/ ctx[0] === 0)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*activeImage, images*/ 5 && button1_disabled_value !== (button1_disabled_value = /*activeImage*/ ctx[0] === /*images*/ ctx[2]?.length - 1)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
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

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InternalGallery", slots, ['default']);
    	let { activeImage = 0 } = $$props;

    	// Here will be stored markup that will user put inside of this component
    	let slotContent;

    	// Auxiliary variable for storing elements with image that user has provided
    	let images;

    	/*
    Those functions move between active image, we dont need condition to disable their role, because this is already
    implemented in the element section by conditionally disabling buttons, that call this function.

     */
    	const previousImage = () => {
    		$$invalidate(0, activeImage--, activeImage);
    	};

    	const nextImage = () => {
    		$$invalidate(0, activeImage++, activeImage);
    	};

    	const writable_props = ["activeImage"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<InternalGallery> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slotContent = $$value;
    			$$invalidate(1, slotContent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		activeImage,
    		slotContent,
    		images,
    		previousImage,
    		nextImage
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("slotContent" in $$props) $$invalidate(1, slotContent = $$props.slotContent);
    		if ("images" in $$props) $$invalidate(2, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slotContent*/ 2) {
    			// Every time, when contents of this component changes, images will be updated
    			$$invalidate(2, images = slotContent?.children);
    		}

    		if ($$self.$$.dirty & /*images, activeImage*/ 5) {
    			{
    				/*
    When activeImage or images array changes, checks if active image points to existing image and then displays it,
    if selected image doesn't exist, then logs out error, these error normally does not occur, only in cases when
    activeImage is controlled programmatically
     */
    				if (images && activeImage < images.length) {
    					Object.values(images).forEach(img => {
    						img.hidden = true;
    						return img;
    					});

    					$$invalidate(2, images[activeImage].hidden = false, images);
    				} else if (images && activeImage >= images.length) {
    					console.error("LightboxGallery: Selected image doesn't exist, invalid activeImage");
    				}
    			}
    		}
    	};

    	return [
    		activeImage,
    		slotContent,
    		images,
    		previousImage,
    		nextImage,
    		$$scope,
    		slots,
    		div0_binding
    	];
    }

    class InternalGallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { activeImage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InternalGallery",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get activeImage() {
    		throw new Error("<InternalGallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<InternalGallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Lightbox.svelte generated by Svelte v3.38.2 */
    const get_thumbnail_slot_changes_1 = dirty => ({});
    const get_thumbnail_slot_context_1 = ctx => ({});
    const get_image_slot_changes = dirty => ({});
    const get_image_slot_context = ctx => ({});
    const get_thumbnail_slot_changes = dirty => ({});
    const get_thumbnail_slot_context = ctx => ({});

    // (83:4) {:else}
    function create_else_block_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[39], null);

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
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 256)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[39], dirty, null, null);
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(83:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if thumbnail || gallery}
    function create_if_block_3(ctx) {
    	let current;
    	const thumbnail_slot_template = /*#slots*/ ctx[22].thumbnail;
    	const thumbnail_slot = create_slot(thumbnail_slot_template, ctx, /*$$scope*/ ctx[39], get_thumbnail_slot_context);

    	const block = {
    		c: function create() {
    			if (thumbnail_slot) thumbnail_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (thumbnail_slot) {
    				thumbnail_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (thumbnail_slot) {
    				if (thumbnail_slot.p && (!current || dirty[1] & /*$$scope*/ 256)) {
    					update_slot(thumbnail_slot, thumbnail_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_thumbnail_slot_changes, get_thumbnail_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (thumbnail_slot) thumbnail_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(81:4) {#if thumbnail || gallery}",
    		ctx
    	});

    	return block;
    }

    // (80:0) <Thumbnail bind:thumbnailClasses bind:thumbnailStyle bind:protect on:click={toggle}>
    function create_default_slot_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*thumbnail*/ ctx[14] || /*gallery*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
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
    				} else {
    					if_block.p(ctx, dirty);
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
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(80:0) <Thumbnail bind:thumbnailClasses bind:thumbnailStyle bind:protect on:click={toggle}>",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if visible}
    function create_if_block$5(ctx) {
    	let modal;
    	let updating_modalClasses;
    	let updating_modalStyle;
    	let updating_transitionDuration;
    	let updating_image;
    	let updating_protect;
    	let updating_portrait;
    	let updating_title;
    	let updating_description;
    	let updating_gallery;
    	let updating_activeImage;
    	let updating_imagePreset;
    	let updating_closeButton;
    	let current;

    	function modal_modalClasses_binding(value) {
    		/*modal_modalClasses_binding*/ ctx[27](value);
    	}

    	function modal_modalStyle_binding(value) {
    		/*modal_modalStyle_binding*/ ctx[28](value);
    	}

    	function modal_transitionDuration_binding(value) {
    		/*modal_transitionDuration_binding*/ ctx[29](value);
    	}

    	function modal_image_binding(value) {
    		/*modal_image_binding*/ ctx[30](value);
    	}

    	function modal_protect_binding(value) {
    		/*modal_protect_binding*/ ctx[31](value);
    	}

    	function modal_portrait_binding(value) {
    		/*modal_portrait_binding*/ ctx[32](value);
    	}

    	function modal_title_binding(value) {
    		/*modal_title_binding*/ ctx[33](value);
    	}

    	function modal_description_binding(value) {
    		/*modal_description_binding*/ ctx[34](value);
    	}

    	function modal_gallery_binding(value) {
    		/*modal_gallery_binding*/ ctx[35](value);
    	}

    	function modal_activeImage_binding(value) {
    		/*modal_activeImage_binding*/ ctx[36](value);
    	}

    	function modal_imagePreset_binding(value) {
    		/*modal_imagePreset_binding*/ ctx[37](value);
    	}

    	function modal_closeButton_binding(value) {
    		/*modal_closeButton_binding*/ ctx[38](value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	if (/*modalClasses*/ ctx[2] !== void 0) {
    		modal_props.modalClasses = /*modalClasses*/ ctx[2];
    	}

    	if (/*modalStyle*/ ctx[3] !== void 0) {
    		modal_props.modalStyle = /*modalStyle*/ ctx[3];
    	}

    	if (/*transitionDuration*/ ctx[8] !== void 0) {
    		modal_props.transitionDuration = /*transitionDuration*/ ctx[8];
    	}

    	if (/*image*/ ctx[10] !== void 0) {
    		modal_props.image = /*image*/ ctx[10];
    	}

    	if (/*protect*/ ctx[9] !== void 0) {
    		modal_props.protect = /*protect*/ ctx[9];
    	}

    	if (/*portrait*/ ctx[11] !== void 0) {
    		modal_props.portrait = /*portrait*/ ctx[11];
    	}

    	if (/*title*/ ctx[6] !== void 0) {
    		modal_props.title = /*title*/ ctx[6];
    	}

    	if (/*description*/ ctx[7] !== void 0) {
    		modal_props.description = /*description*/ ctx[7];
    	}

    	if (/*gallery*/ ctx[5] !== void 0) {
    		modal_props.gallery = /*gallery*/ ctx[5];
    	}

    	if (/*activeImage*/ ctx[4] !== void 0) {
    		modal_props.activeImage = /*activeImage*/ ctx[4];
    	}

    	if (/*imagePreset*/ ctx[12] !== void 0) {
    		modal_props.imagePreset = /*imagePreset*/ ctx[12];
    	}

    	if (/*closeButton*/ ctx[13] !== void 0) {
    		modal_props.closeButton = /*closeButton*/ ctx[13];
    	}

    	modal = new Index({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "modalClasses", modal_modalClasses_binding));
    	binding_callbacks.push(() => bind(modal, "modalStyle", modal_modalStyle_binding));
    	binding_callbacks.push(() => bind(modal, "transitionDuration", modal_transitionDuration_binding));
    	binding_callbacks.push(() => bind(modal, "image", modal_image_binding));
    	binding_callbacks.push(() => bind(modal, "protect", modal_protect_binding));
    	binding_callbacks.push(() => bind(modal, "portrait", modal_portrait_binding));
    	binding_callbacks.push(() => bind(modal, "title", modal_title_binding));
    	binding_callbacks.push(() => bind(modal, "description", modal_description_binding));
    	binding_callbacks.push(() => bind(modal, "gallery", modal_gallery_binding));
    	binding_callbacks.push(() => bind(modal, "activeImage", modal_activeImage_binding));
    	binding_callbacks.push(() => bind(modal, "imagePreset", modal_imagePreset_binding));
    	binding_callbacks.push(() => bind(modal, "closeButton", modal_closeButton_binding));
    	modal.$on("close", /*close*/ ctx[17]);
    	modal.$on("topModalClick", /*coverClick*/ ctx[18]);
    	modal.$on("modalClick", /*modalClick*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*thumbnail, activeImage, gallery*/ 16432 | dirty[1] & /*$$scope*/ 256) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_modalClasses && dirty[0] & /*modalClasses*/ 4) {
    				updating_modalClasses = true;
    				modal_changes.modalClasses = /*modalClasses*/ ctx[2];
    				add_flush_callback(() => updating_modalClasses = false);
    			}

    			if (!updating_modalStyle && dirty[0] & /*modalStyle*/ 8) {
    				updating_modalStyle = true;
    				modal_changes.modalStyle = /*modalStyle*/ ctx[3];
    				add_flush_callback(() => updating_modalStyle = false);
    			}

    			if (!updating_transitionDuration && dirty[0] & /*transitionDuration*/ 256) {
    				updating_transitionDuration = true;
    				modal_changes.transitionDuration = /*transitionDuration*/ ctx[8];
    				add_flush_callback(() => updating_transitionDuration = false);
    			}

    			if (!updating_image && dirty[0] & /*image*/ 1024) {
    				updating_image = true;
    				modal_changes.image = /*image*/ ctx[10];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 512) {
    				updating_protect = true;
    				modal_changes.protect = /*protect*/ ctx[9];
    				add_flush_callback(() => updating_protect = false);
    			}

    			if (!updating_portrait && dirty[0] & /*portrait*/ 2048) {
    				updating_portrait = true;
    				modal_changes.portrait = /*portrait*/ ctx[11];
    				add_flush_callback(() => updating_portrait = false);
    			}

    			if (!updating_title && dirty[0] & /*title*/ 64) {
    				updating_title = true;
    				modal_changes.title = /*title*/ ctx[6];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_description && dirty[0] & /*description*/ 128) {
    				updating_description = true;
    				modal_changes.description = /*description*/ ctx[7];
    				add_flush_callback(() => updating_description = false);
    			}

    			if (!updating_gallery && dirty[0] & /*gallery*/ 32) {
    				updating_gallery = true;
    				modal_changes.gallery = /*gallery*/ ctx[5];
    				add_flush_callback(() => updating_gallery = false);
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 16) {
    				updating_activeImage = true;
    				modal_changes.activeImage = /*activeImage*/ ctx[4];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			if (!updating_imagePreset && dirty[0] & /*imagePreset*/ 4096) {
    				updating_imagePreset = true;
    				modal_changes.imagePreset = /*imagePreset*/ ctx[12];
    				add_flush_callback(() => updating_imagePreset = false);
    			}

    			if (!updating_closeButton && dirty[0] & /*closeButton*/ 8192) {
    				updating_closeButton = true;
    				modal_changes.closeButton = /*closeButton*/ ctx[13];
    				add_flush_callback(() => updating_closeButton = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(88:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (100:8) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[39], null);

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
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 256)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[39], dirty, null, null);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(100:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:26) 
    function create_if_block_2$1(ctx) {
    	let internalgallery;
    	let updating_activeImage;
    	let current;

    	function internalgallery_activeImage_binding(value) {
    		/*internalgallery_activeImage_binding*/ ctx[26](value);
    	}

    	let internalgallery_props = {
    		$$slots: { default: [create_default_slot_1$3] },
    		$$scope: { ctx }
    	};

    	if (/*activeImage*/ ctx[4] !== void 0) {
    		internalgallery_props.activeImage = /*activeImage*/ ctx[4];
    	}

    	internalgallery = new InternalGallery({
    			props: internalgallery_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(internalgallery, "activeImage", internalgallery_activeImage_binding));

    	const block = {
    		c: function create() {
    			create_component(internalgallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(internalgallery, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const internalgallery_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				internalgallery_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 16) {
    				updating_activeImage = true;
    				internalgallery_changes.activeImage = /*activeImage*/ ctx[4];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			internalgallery.$set(internalgallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(internalgallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(internalgallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(internalgallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(94:26) ",
    		ctx
    	});

    	return block;
    }

    // (92:8) {#if thumbnail}
    function create_if_block_1$1(ctx) {
    	let current;
    	const image_slot_template = /*#slots*/ ctx[22].image;
    	const image_slot = create_slot(image_slot_template, ctx, /*$$scope*/ ctx[39], get_image_slot_context);

    	const block = {
    		c: function create() {
    			if (image_slot) image_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (image_slot) {
    				image_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (image_slot) {
    				if (image_slot.p && (!current || dirty[1] & /*$$scope*/ 256)) {
    					update_slot(image_slot, image_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_image_slot_changes, get_image_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (image_slot) image_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(92:8) {#if thumbnail}",
    		ctx
    	});

    	return block;
    }

    // (95:12) <InternalGallery bind:activeImage>
    function create_default_slot_1$3(ctx) {
    	let t;
    	let current;
    	const thumbnail_slot_template = /*#slots*/ ctx[22].thumbnail;
    	const thumbnail_slot = create_slot(thumbnail_slot_template, ctx, /*$$scope*/ ctx[39], get_thumbnail_slot_context_1);
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[39], null);

    	const block = {
    		c: function create() {
    			if (thumbnail_slot) thumbnail_slot.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (thumbnail_slot) {
    				thumbnail_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (thumbnail_slot) {
    				if (thumbnail_slot.p && (!current || dirty[1] & /*$$scope*/ 256)) {
    					update_slot(thumbnail_slot, thumbnail_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_thumbnail_slot_changes_1, get_thumbnail_slot_context_1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 256)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[39], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (thumbnail_slot) thumbnail_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(95:12) <InternalGallery bind:activeImage>",
    		ctx
    	});

    	return block;
    }

    // (89:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration bind:image bind:protect            bind:portrait bind:title bind:description bind:gallery bind:activeImage bind:imagePreset bind:closeButton            on:close={close} on:topModalClick={coverClick} on:modalClick={modalClick}>
    function create_default_slot$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*thumbnail*/ ctx[14]) return 0;
    		if (/*gallery*/ ctx[5]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
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
    				} else {
    					if_block.p(ctx, dirty);
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(89:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration bind:image bind:protect            bind:portrait bind:title bind:description bind:gallery bind:activeImage bind:imagePreset bind:closeButton            on:close={close} on:topModalClick={coverClick} on:modalClick={modalClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let thumbnail_1;
    	let updating_thumbnailClasses;
    	let updating_thumbnailStyle;
    	let updating_protect;
    	let t;
    	let if_block_anchor;
    	let current;

    	function thumbnail_1_thumbnailClasses_binding(value) {
    		/*thumbnail_1_thumbnailClasses_binding*/ ctx[23](value);
    	}

    	function thumbnail_1_thumbnailStyle_binding(value) {
    		/*thumbnail_1_thumbnailStyle_binding*/ ctx[24](value);
    	}

    	function thumbnail_1_protect_binding(value) {
    		/*thumbnail_1_protect_binding*/ ctx[25](value);
    	}

    	let thumbnail_1_props = {
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	};

    	if (/*thumbnailClasses*/ ctx[0] !== void 0) {
    		thumbnail_1_props.thumbnailClasses = /*thumbnailClasses*/ ctx[0];
    	}

    	if (/*thumbnailStyle*/ ctx[1] !== void 0) {
    		thumbnail_1_props.thumbnailStyle = /*thumbnailStyle*/ ctx[1];
    	}

    	if (/*protect*/ ctx[9] !== void 0) {
    		thumbnail_1_props.protect = /*protect*/ ctx[9];
    	}

    	thumbnail_1 = new LightboxThumbnail({ props: thumbnail_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(thumbnail_1, "thumbnailClasses", thumbnail_1_thumbnailClasses_binding));
    	binding_callbacks.push(() => bind(thumbnail_1, "thumbnailStyle", thumbnail_1_thumbnailStyle_binding));
    	binding_callbacks.push(() => bind(thumbnail_1, "protect", thumbnail_1_protect_binding));
    	thumbnail_1.$on("click", /*toggle*/ ctx[16]);
    	let if_block = /*visible*/ ctx[15] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			create_component(thumbnail_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail_1, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const thumbnail_1_changes = {};

    			if (dirty[0] & /*thumbnail, gallery*/ 16416 | dirty[1] & /*$$scope*/ 256) {
    				thumbnail_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_thumbnailClasses && dirty[0] & /*thumbnailClasses*/ 1) {
    				updating_thumbnailClasses = true;
    				thumbnail_1_changes.thumbnailClasses = /*thumbnailClasses*/ ctx[0];
    				add_flush_callback(() => updating_thumbnailClasses = false);
    			}

    			if (!updating_thumbnailStyle && dirty[0] & /*thumbnailStyle*/ 2) {
    				updating_thumbnailStyle = true;
    				thumbnail_1_changes.thumbnailStyle = /*thumbnailStyle*/ ctx[1];
    				add_flush_callback(() => updating_thumbnailStyle = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 512) {
    				updating_protect = true;
    				thumbnail_1_changes.protect = /*protect*/ ctx[9];
    				add_flush_callback(() => updating_protect = false);
    			}

    			thumbnail_1.$set(thumbnail_1_changes);

    			if (/*visible*/ ctx[15]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 32768) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(thumbnail_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail_1, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("Lightbox", slots, ['thumbnail','default','image']);
    	let { thumbnailClasses = "" } = $$props;
    	let { thumbnailStyle = "" } = $$props;
    	let { modalClasses = "" } = $$props;
    	let { modalStyle = "" } = $$props;
    	let { activeImage = 0 } = $$props;
    	let { gallery = false } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { protect = false } = $$props;
    	let { image = {} } = $$props;
    	let { portrait = false } = $$props;
    	let { noScroll = true } = $$props;
    	let { thumbnail = false } = $$props;
    	let { imagePreset = false } = $$props;
    	let { clickToClose = false } = $$props;
    	let { closeButton = true } = $$props;
    	let visible = false;
    	let modalClicked = false;

    	const toggle = () => {
    		$$invalidate(15, visible = !visible);
    		toggleScroll();
    	};

    	const close = () => {
    		$$invalidate(15, visible = false);
    		toggleScroll();
    	};

    	const coverClick = () => {
    		// console.log('coverClick')
    		if (!modalClicked || clickToClose) {
    			close();
    		}

    		modalClicked = false;
    	};

    	const modalClick = () => {
    		// console.log('modalClick')
    		modalClicked = true;
    	};

    	let toggleScroll = () => {
    		
    	};

    	onMount(() => {
    		let defaultOverflow = document.body.style.overflow;

    		toggleScroll = () => {
    			if (noScroll) {
    				if (visible) {
    					document.body.style.overflow = "hidden";
    				} else {
    					document.body.style.overflow = defaultOverflow;
    				}
    			}
    		};
    	});

    	const writable_props = [
    		"thumbnailClasses",
    		"thumbnailStyle",
    		"modalClasses",
    		"modalStyle",
    		"activeImage",
    		"gallery",
    		"title",
    		"description",
    		"transitionDuration",
    		"protect",
    		"image",
    		"portrait",
    		"noScroll",
    		"thumbnail",
    		"imagePreset",
    		"clickToClose",
    		"closeButton"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lightbox> was created with unknown prop '${key}'`);
    	});

    	function thumbnail_1_thumbnailClasses_binding(value) {
    		thumbnailClasses = value;
    		$$invalidate(0, thumbnailClasses);
    	}

    	function thumbnail_1_thumbnailStyle_binding(value) {
    		thumbnailStyle = value;
    		$$invalidate(1, thumbnailStyle);
    	}

    	function thumbnail_1_protect_binding(value) {
    		protect = value;
    		$$invalidate(9, protect);
    	}

    	function internalgallery_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(4, activeImage);
    	}

    	function modal_modalClasses_binding(value) {
    		modalClasses = value;
    		$$invalidate(2, modalClasses);
    	}

    	function modal_modalStyle_binding(value) {
    		modalStyle = value;
    		$$invalidate(3, modalStyle);
    	}

    	function modal_transitionDuration_binding(value) {
    		transitionDuration = value;
    		$$invalidate(8, transitionDuration);
    	}

    	function modal_image_binding(value) {
    		image = value;
    		$$invalidate(10, image);
    	}

    	function modal_protect_binding(value) {
    		protect = value;
    		$$invalidate(9, protect);
    	}

    	function modal_portrait_binding(value) {
    		portrait = value;
    		$$invalidate(11, portrait);
    	}

    	function modal_title_binding(value) {
    		title = value;
    		$$invalidate(6, title);
    	}

    	function modal_description_binding(value) {
    		description = value;
    		$$invalidate(7, description);
    	}

    	function modal_gallery_binding(value) {
    		gallery = value;
    		$$invalidate(5, gallery);
    	}

    	function modal_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(4, activeImage);
    	}

    	function modal_imagePreset_binding(value) {
    		imagePreset = value;
    		$$invalidate(12, imagePreset);
    	}

    	function modal_closeButton_binding(value) {
    		closeButton = value;
    		$$invalidate(13, closeButton);
    	}

    	$$self.$$set = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("modalClasses" in $$props) $$invalidate(2, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(3, modalStyle = $$props.modalStyle);
    		if ("activeImage" in $$props) $$invalidate(4, activeImage = $$props.activeImage);
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("title" in $$props) $$invalidate(6, title = $$props.title);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("protect" in $$props) $$invalidate(9, protect = $$props.protect);
    		if ("image" in $$props) $$invalidate(10, image = $$props.image);
    		if ("portrait" in $$props) $$invalidate(11, portrait = $$props.portrait);
    		if ("noScroll" in $$props) $$invalidate(20, noScroll = $$props.noScroll);
    		if ("thumbnail" in $$props) $$invalidate(14, thumbnail = $$props.thumbnail);
    		if ("imagePreset" in $$props) $$invalidate(12, imagePreset = $$props.imagePreset);
    		if ("clickToClose" in $$props) $$invalidate(21, clickToClose = $$props.clickToClose);
    		if ("closeButton" in $$props) $$invalidate(13, closeButton = $$props.closeButton);
    		if ("$$scope" in $$props) $$invalidate(39, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Thumbnail: LightboxThumbnail,
    		Modal: Index,
    		InternalGallery,
    		onMount,
    		thumbnailClasses,
    		thumbnailStyle,
    		modalClasses,
    		modalStyle,
    		activeImage,
    		gallery,
    		title,
    		description,
    		transitionDuration,
    		protect,
    		image,
    		portrait,
    		noScroll,
    		thumbnail,
    		imagePreset,
    		clickToClose,
    		closeButton,
    		visible,
    		modalClicked,
    		toggle,
    		close,
    		coverClick,
    		modalClick,
    		toggleScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("modalClasses" in $$props) $$invalidate(2, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(3, modalStyle = $$props.modalStyle);
    		if ("activeImage" in $$props) $$invalidate(4, activeImage = $$props.activeImage);
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("title" in $$props) $$invalidate(6, title = $$props.title);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("protect" in $$props) $$invalidate(9, protect = $$props.protect);
    		if ("image" in $$props) $$invalidate(10, image = $$props.image);
    		if ("portrait" in $$props) $$invalidate(11, portrait = $$props.portrait);
    		if ("noScroll" in $$props) $$invalidate(20, noScroll = $$props.noScroll);
    		if ("thumbnail" in $$props) $$invalidate(14, thumbnail = $$props.thumbnail);
    		if ("imagePreset" in $$props) $$invalidate(12, imagePreset = $$props.imagePreset);
    		if ("clickToClose" in $$props) $$invalidate(21, clickToClose = $$props.clickToClose);
    		if ("closeButton" in $$props) $$invalidate(13, closeButton = $$props.closeButton);
    		if ("visible" in $$props) $$invalidate(15, visible = $$props.visible);
    		if ("modalClicked" in $$props) modalClicked = $$props.modalClicked;
    		if ("toggleScroll" in $$props) toggleScroll = $$props.toggleScroll;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		thumbnailClasses,
    		thumbnailStyle,
    		modalClasses,
    		modalStyle,
    		activeImage,
    		gallery,
    		title,
    		description,
    		transitionDuration,
    		protect,
    		image,
    		portrait,
    		imagePreset,
    		closeButton,
    		thumbnail,
    		visible,
    		toggle,
    		close,
    		coverClick,
    		modalClick,
    		noScroll,
    		clickToClose,
    		slots,
    		thumbnail_1_thumbnailClasses_binding,
    		thumbnail_1_thumbnailStyle_binding,
    		thumbnail_1_protect_binding,
    		internalgallery_activeImage_binding,
    		modal_modalClasses_binding,
    		modal_modalStyle_binding,
    		modal_transitionDuration_binding,
    		modal_image_binding,
    		modal_protect_binding,
    		modal_portrait_binding,
    		modal_title_binding,
    		modal_description_binding,
    		modal_gallery_binding,
    		modal_activeImage_binding,
    		modal_imagePreset_binding,
    		modal_closeButton_binding,
    		$$scope
    	];
    }

    class Lightbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				thumbnailClasses: 0,
    				thumbnailStyle: 1,
    				modalClasses: 2,
    				modalStyle: 3,
    				activeImage: 4,
    				gallery: 5,
    				title: 6,
    				description: 7,
    				transitionDuration: 8,
    				protect: 9,
    				image: 10,
    				portrait: 11,
    				noScroll: 20,
    				thumbnail: 14,
    				imagePreset: 12,
    				clickToClose: 21,
    				closeButton: 13
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lightbox",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get thumbnailClasses() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailClasses(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailStyle() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailStyle(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClasses() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalStyle() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gallery() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noScroll() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noScroll(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnail() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnail(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imagePreset() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePreset(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickToClose() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickToClose(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/gallery/GalleryModal.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$d = "src/components/gallery/GalleryModal.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (25:0) {#if modalOpen===true}
    function create_if_block$4(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let i;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*img*/ ctx[3];
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
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i, "class", "fas fa-window-close text-3xl text-red-500");
    			add_location(i, file$d, 33, 12, 933);
    			attr_dev(div0, "class", "fixed cursor-pointer right-5 top-5");
    			add_location(div0, file$d, 30, 8, 809);
    			attr_dev(div1, "class", "bg-white p-5 rounded-md  m-5 flex items-center justify-center flex-wrap max-h-screen overflow-scroll relative");
    			add_location(div1, file$d, 29, 4, 677);
    			attr_dev(div2, "class", "h-screen w-screen fixed bg-black bg-opacity-70 left-0 top-0 z-50 flex justify-center  items-center ");
    			add_location(div2, file$d, 25, 0, 506);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div1, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(div2, "click", self(/*click_handler_1*/ ctx[5]), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*galItem, img*/ 10) {
    				each_value = /*img*/ ctx[3];
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
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(25:0) {#if modalOpen===true}",
    		ctx
    	});

    	return block;
    }

    // (40:12) 
    function create_thumbnail_slot(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			attr_dev(img_1, "slot", "thumbnail");
    			if (img_1.src !== (img_1_src_value = /*imgItem*/ ctx[7])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", "Thumbnail");
    			add_location(img_1, file$d, 39, 12, 1185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_thumbnail_slot.name,
    		type: "slot",
    		source: "(40:12) ",
    		ctx
    	});

    	return block;
    }

    // (41:12) 
    function create_image_slot(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			attr_dev(img_1, "slot", "image");
    			if (img_1.src !== (img_1_src_value = /*imgItem*/ ctx[7])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", "");
    			add_location(img_1, file$d, 40, 12, 1252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_image_slot.name,
    		type: "slot",
    		source: "(41:12) ",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#each img as imgItem}
    function create_each_block$2(ctx) {
    	let div;
    	let lightbox;
    	let t;
    	let current;

    	lightbox = new Lightbox({
    			props: {
    				thumbnail: true,
    				imagePreset: "fit",
    				description: /*galItem*/ ctx[1],
    				$$slots: {
    					image: [create_image_slot],
    					thumbnail: [create_thumbnail_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(lightbox.$$.fragment);
    			t = space();
    			attr_dev(div, "class", " w-full md:w-56 ring-2 m-3  relative");
    			add_location(div, file$d, 37, 7, 1050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(lightbox, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const lightbox_changes = {};
    			if (dirty & /*galItem*/ 2) lightbox_changes.description = /*galItem*/ ctx[1];

    			if (dirty & /*$$scope*/ 1024) {
    				lightbox_changes.$$scope = { dirty, ctx };
    			}

    			lightbox.$set(lightbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(lightbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(36:8) {#each img as imgItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*modalOpen*/ ctx[0] === true && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*modalOpen*/ ctx[0] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*modalOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("GalleryModal", slots, []);
    	let { modalOpen = false } = $$props;
    	let { galItem } = $$props;
    	let dispatch = createEventDispatcher();
    	let img = [];
    	let num;

    	if (galItem === "Promotions") {
    		num = 20;
    	} else {
    		num = 12;
    	}

    	console.log(modalOpen);

    	if (modalOpen === true) {
    		for (let i = 1; i < num; i++) {
    			img.push(`/img/${galItem}/${galItem}${i}.${galItem === "Promotions" ? "jpg" : "jpeg"}`);
    		}

    		console.log(img);
    	}

    	const writable_props = ["modalOpen", "galItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<GalleryModal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("modalClose");
    	};

    	const click_handler_1 = () => {
    		dispatch("modalClose");
    	};

    	$$self.$$set = $$props => {
    		if ("modalOpen" in $$props) $$invalidate(0, modalOpen = $$props.modalOpen);
    		if ("galItem" in $$props) $$invalidate(1, galItem = $$props.galItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Lightbox,
    		modalOpen,
    		galItem,
    		dispatch,
    		img,
    		num
    	});

    	$$self.$inject_state = $$props => {
    		if ("modalOpen" in $$props) $$invalidate(0, modalOpen = $$props.modalOpen);
    		if ("galItem" in $$props) $$invalidate(1, galItem = $$props.galItem);
    		if ("dispatch" in $$props) $$invalidate(2, dispatch = $$props.dispatch);
    		if ("img" in $$props) $$invalidate(3, img = $$props.img);
    		if ("num" in $$props) num = $$props.num;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modalOpen, galItem, dispatch, img, click_handler, click_handler_1];
    }

    class GalleryModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { modalOpen: 0, galItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryModal",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*galItem*/ ctx[1] === undefined && !("galItem" in props)) {
    			console_1.warn("<GalleryModal> was created without expected prop 'galItem'");
    		}
    	}

    	get modalOpen() {
    		throw new Error("<GalleryModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalOpen(value) {
    		throw new Error("<GalleryModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get galItem() {
    		throw new Error("<GalleryModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set galItem(value) {
    		throw new Error("<GalleryModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/gallery/Gallery.svelte generated by Svelte v3.38.2 */
    const file$c = "src/components/gallery/Gallery.svelte";

    // (20:4) <LargeHeading>
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gallery");
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
    		source: "(20:4) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (28:44) 
    function create_if_block_2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "View Facilities and Training Gallery";
    			if (img.src !== (img_src_value = "/img/ClassRoom1.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "ring-2 ring-gray-400");
    			add_location(img, file$c, 29, 12, 1251);
    			attr_dev(h2, "class", "text-center font-bold text-blue-400 p-3 hover:text-blue-500");
    			add_location(h2, file$c, 30, 12, 1332);
    			attr_dev(div, "class", "max-w-110 p-5 bg-white shadow-md cursor-pointer");
    			add_location(div, file$c, 28, 8, 1150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleModalOpen*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(28:44) ",
    		ctx
    	});

    	return block;
    }

    // (23:8) {#if currentTab === "Promotions"}
    function create_if_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "View Offers and Promotions";
    			if (img.src !== (img_src_value = "/img/logo2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "ring-2 ring-gray-400");
    			add_location(img, file$c, 24, 8, 907);
    			attr_dev(h2, "class", "text-center font-bold text-blue-400 p-3 hover:text-blue-500");
    			add_location(h2, file$c, 25, 8, 978);
    			attr_dev(div, "class", "max-w-110 p-5 bg-white shadow-md cursor-pointer");
    			add_location(div, file$c, 23, 7, 810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleModalOpen*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:8) {#if currentTab === \\\"Promotions\\\"}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if modalOpen===true}
    function create_if_block$3(ctx) {
    	let gallerymodal;
    	let current;

    	gallerymodal = new GalleryModal({
    			props: {
    				galItem: /*currentTab*/ ctx[1],
    				modalOpen: /*modalOpen*/ ctx[0]
    			},
    			$$inline: true
    		});

    	gallerymodal.$on("modalClose", /*handleModalClose*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(gallerymodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerymodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallerymodal_changes = {};
    			if (dirty & /*currentTab*/ 2) gallerymodal_changes.galItem = /*currentTab*/ ctx[1];
    			if (dirty & /*modalOpen*/ 1) gallerymodal_changes.modalOpen = /*modalOpen*/ ctx[0];
    			gallerymodal.$set(gallerymodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerymodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerymodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerymodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(36:4) {#if modalOpen===true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let section;
    	let largeheading;
    	let t0;
    	let div;
    	let tabs;
    	let t1;
    	let t2;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabs = new Tabs({
    			props: {
    				currentTab: /*currentTab*/ ctx[1],
    				TabItems: /*TabItems*/ ctx[2],
    				TabRed: true
    			},
    			$$inline: true
    		});

    	tabs.$on("tabChange", /*handleTabChange*/ ctx[3]);

    	function select_block_type(ctx, dirty) {
    		if (/*currentTab*/ ctx[1] === "Promotions") return create_if_block_1;
    		if (/*currentTab*/ ctx[1] === "Training") return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*modalOpen*/ ctx[0] === true && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(tabs.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "md:w-2/3 flex flex-col justify-center items-center");
    			add_location(div, file$c, 20, 4, 611);
    			attr_dev(section, "id", "Gallery");
    			attr_dev(section, "class", "h-140 flex justify-center items-center flex-col py-10");
    			add_location(section, file$c, 18, 0, 481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(largeheading, section, null);
    			append_dev(section, t0);
    			append_dev(section, div);
    			mount_component(tabs, div, null);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(section, t2);
    			if (if_block1) if_block1.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const tabs_changes = {};
    			if (dirty & /*currentTab*/ 2) tabs_changes.currentTab = /*currentTab*/ ctx[1];
    			tabs.$set(tabs_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, null);
    				}
    			}

    			if (/*modalOpen*/ ctx[0] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*modalOpen*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(largeheading);
    			destroy_component(tabs);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
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
    	validate_slots("Gallery", slots, []);
    	let modalOpen = false;
    	let currentTab = "Promotions";

    	let TabItems = [
    		{
    			name: "Promotions",
    			icon: "fas fa-question"
    		},
    		{ name: "Training", icon: "fas fa-users" }
    	];

    	const handleTabChange = e => {
    		$$invalidate(1, currentTab = e.detail);
    	};

    	const handleModalClose = e => {
    		$$invalidate(0, modalOpen = false);
    	};

    	const handleModalOpen = () => {
    		$$invalidate(0, modalOpen = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LargeHeading,
    		Tabs,
    		GalleryModal,
    		modalOpen,
    		currentTab,
    		TabItems,
    		handleTabChange,
    		handleModalClose,
    		handleModalOpen
    	});

    	$$self.$inject_state = $$props => {
    		if ("modalOpen" in $$props) $$invalidate(0, modalOpen = $$props.modalOpen);
    		if ("currentTab" in $$props) $$invalidate(1, currentTab = $$props.currentTab);
    		if ("TabItems" in $$props) $$invalidate(2, TabItems = $$props.TabItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		modalOpen,
    		currentTab,
    		TabItems,
    		handleTabChange,
    		handleModalClose,
    		handleModalOpen
    	];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/shared/Branding.svelte generated by Svelte v3.38.2 */

    const file$b = "src/shared/Branding.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/logo2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Edustar Fastrack Logo");
    			attr_dev(img, "class", "md:w-32 w-16");
    			add_location(img, file$b, 1, 4, 64);
    			attr_dev(div, "class", "p-5 flex flex-col justify-center items-center");
    			add_location(div, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Branding",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/shared/Navlinks.svelte generated by Svelte v3.38.2 */
    const file$a = "src/shared/Navlinks.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:8) {#each navlinks as navlink(navlink.id)}
    function create_each_block_1(key_1, ctx) {
    	let li;
    	let a;
    	let t_value = /*navlink*/ ctx[4].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*navlink*/ ctx[4].section);
    			attr_dev(a, "class", "hover:text-purple-700 no-underline");
    			add_location(a, file$a, 26, 32, 826);
    			attr_dev(li, "class", "p-5 text-xl");
    			add_location(li, file$a, 26, 8, 802);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = action_destroyer(scrollto.call(null, a, /*navlink*/ ctx[4].section));
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(26:8) {#each navlinks as navlink(navlink.id)}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if mobileNav}
    function create_if_block$2(ctx) {
    	let nav;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let nav_class_value;
    	let nav_transition;
    	let current;
    	let each_value = /*navlinks*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*navlink*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "flex flex-col md:flex-row justify-center items-center");
    			add_location(ul, file$a, 32, 8, 1120);

    			attr_dev(nav, "class", nav_class_value = /*mobileNav*/ ctx[0]
    			? "fixed block left-0 w-full bg-purple-100"
    			: "hidden");

    			add_location(nav, file$a, 31, 4, 1018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlinks, mobileNav*/ 3) {
    				each_value = /*navlinks*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$1, null, get_each_context$1);
    			}

    			if (!current || dirty & /*mobileNav*/ 1 && nav_class_value !== (nav_class_value = /*mobileNav*/ ctx[0]
    			? "fixed block left-0 w-full bg-purple-100"
    			: "hidden")) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, slide, {}, true);
    				nav_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, slide, {}, false);
    			nav_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && nav_transition) nav_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(31:4) {#if mobileNav}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#each navlinks as navlink(navlink.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let a;
    	let t_value = /*navlink*/ ctx[4].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*navlink*/ ctx[4].section);
    			attr_dev(a, "class", "hover:text-purple-700 no-underline");
    			add_location(a, file$a, 34, 32, 1267);
    			attr_dev(li, "class", "p-5 text-xl");
    			add_location(li, file$a, 34, 8, 1243);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(scrollto.call(null, a, /*navlink*/ ctx[4].section)),
    					listen_dev(a, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(34:8) {#each navlinks as navlink(navlink.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let nav;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*navlinks*/ ctx[1];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*navlink*/ ctx[4].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block = /*mobileNav*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "fas fa-bars text-2xl");
    			add_location(span, file$a, 21, 4, 608);
    			attr_dev(div0, "class", "inline-block md:hidden p-5 mt-3 hover:text-blue-600");
    			add_location(div0, file$a, 17, 0, 490);
    			attr_dev(ul, "class", "flex flex-col md:flex-row");
    			add_location(ul, file$a, 24, 8, 707);
    			attr_dev(nav, "class", "md:inline-block hidden");
    			add_location(nav, file$a, 23, 4, 662);
    			attr_dev(div1, "class", "inline-block mt-5");
    			add_location(div1, file$a, 16, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div1, t0);
    			append_dev(div1, nav);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navlinks*/ 2) {
    				each_value_1 = /*navlinks*/ ctx[1];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (/*mobileNav*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*mobileNav*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
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
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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
    	let mobileNav;
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
    			name: "About Us",
    			section: "#AboutUs"
    		},
    		{
    			id: 4,
    			name: "Testimonials",
    			section: "#Testimonials"
    		},
    		{
    			id: 5,
    			name: "Gallery",
    			section: "#Gallery"
    		},
    		{
    			id: 6,
    			name: "Contact Us",
    			section: "#ContactUs"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navlinks> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, mobileNav = !mobileNav);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, mobileNav = !mobileNav);
    	};

    	$$self.$capture_state = () => ({ scrollto, slide, navlinks, mobileNav });

    	$$self.$inject_state = $$props => {
    		if ("navlinks" in $$props) $$invalidate(1, navlinks = $$props.navlinks);
    		if ("mobileNav" in $$props) $$invalidate(0, mobileNav = $$props.mobileNav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, mobileNav = false);
    	return [mobileNav, navlinks, click_handler, click_handler_1];
    }

    class Navlinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navlinks",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/shared/Navbar.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/shared/Navbar.svelte";

    function create_fragment$9(ctx) {
    	let div4;
    	let div2;
    	let h3;
    	let div0;
    	let i;
    	let t0;
    	let div1;
    	let a;
    	let t2;
    	let div3;
    	let branding;
    	let t3;
    	let navlinks;
    	let current;
    	branding = new Branding({ $$inline: true });
    	navlinks = new Navlinks({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "+91 9744412045";
    			t2 = space();
    			div3 = element("div");
    			create_component(branding.$$.fragment);
    			t3 = space();
    			create_component(navlinks.$$.fragment);
    			attr_dev(i, "class", "fas fa-phone");
    			add_location(i, file$9, 8, 66, 332);
    			attr_dev(div0, "class", "inline bg-blue-500 p-3 text-sm md:text-xl");
    			add_location(div0, file$9, 8, 11, 277);
    			attr_dev(a, "href", "tel:+91-97444-12045");
    			add_location(a, file$9, 9, 61, 428);
    			attr_dev(div1, "class", "inline-block p-2 text-sm md:text-xl");
    			add_location(div1, file$9, 9, 12, 379);
    			attr_dev(h3, "class", "bg-red-500 inline-block text-white m-1 absolute");
    			add_location(h3, file$9, 7, 8, 205);
    			attr_dev(div2, "class", "flex justify-end");
    			add_location(div2, file$9, 6, 4, 166);
    			attr_dev(div3, "class", "flex flex-row items-center justify-between");
    			add_location(div3, file$9, 12, 4, 512);
    			attr_dev(div4, "class", "fixed w-full md:px-5 bg-purple-100 z-10");
    			add_location(div4, file$9, 5, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, h3);
    			append_dev(h3, div0);
    			append_dev(div0, i);
    			append_dev(h3, t0);
    			append_dev(h3, div1);
    			append_dev(div1, a);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(branding, div3, null);
    			append_dev(div3, t3);
    			mount_component(navlinks, div3, null);
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
    			if (detaching) detach_dev(div4);
    			destroy_component(branding);
    			destroy_component(navlinks);
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Header/heroImgs.svelte generated by Svelte v3.38.2 */

    const file$8 = "src/components/Header/heroImgs.svelte";

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
    			attr_dev(img, "class", "absolute bottom-6");
    			add_location(img, file$8, 15, 4, 840);
    			attr_dev(path, "fill", "#0F62FE");
    			attr_dev(path, "d", "M43,-59.8C49.4,-54.4,44,-33.5,46.7,-17.1C49.5,-0.7,60.3,11.2,59.9,21.6C59.5,32,47.9,40.9,36,53.4C24.1,65.8,12.1,81.8,-2.9,85.7C-17.8,89.7,-35.6,81.6,-47.5,69.2C-59.4,56.8,-65.3,40,-69.7,23.4C-74.1,6.8,-76.9,-9.5,-73.8,-25.5C-70.7,-41.5,-61.8,-57.2,-48.6,-60.3C-35.3,-63.4,-17.6,-53.9,0.3,-54.3C18.3,-54.8,36.5,-65.1,43,-59.8Z");
    			attr_dev(path, "transform", "translate(100 100)");
    			add_location(path, file$8, 17, 4, 970);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$8, 16, 0, 903);
    			attr_dev(div, "class", "absolute w-96 md:w-72 lg:w-96  bottom-36 md:right-2  hidden  md:block");
    			add_location(div, file$8, 14, 0, 752);
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
    function create_if_block$1(ctx) {
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
    			attr_dev(img, "class", "absolute");
    			add_location(img, file$8, 7, 8, 191);
    			attr_dev(path, "fill", "#ff784e");
    			attr_dev(path, "d", "M33.8,-45.7C46.3,-37.4,60.8,-30.9,64.8,-20.6C68.8,-10.2,62.4,4,58.1,19.4C53.8,34.8,51.7,51.5,42.3,58.8C33,66.1,16.5,64.1,-1.3,65.9C-19.1,67.6,-38.1,73.2,-46.9,65.7C-55.7,58.2,-54.1,37.6,-57.3,20.4C-60.4,3.2,-68.1,-10.7,-66.2,-23.1C-64.4,-35.5,-53,-46.3,-40.3,-54.6C-27.7,-62.9,-13.8,-68.6,-1.6,-66.4C10.6,-64.2,21.2,-54,33.8,-45.7Z");
    			attr_dev(path, "transform", "translate(100 100)");
    			add_location(path, file$8, 9, 8, 320);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$8, 8, 4, 249);
    			attr_dev(div0, "class", "absolute w-96  md:w-72 lg:w-96   md:bottom-36 md:left-2");
    			add_location(div0, file$8, 6, 4, 113);
    			attr_dev(div1, "class", "flex  md:block justify-center");
    			add_location(div1, file$8, 5, 0, 65);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(5:0) {#if blue===true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*blue*/ ctx[0] === true) return create_if_block$1;
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { blue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroImgs",
    			options,
    			id: create_fragment$8.name
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
    const file$7 = "src/components/Header/HeroSection.svelte";

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
    function create_default_slot_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "If you have a strong desire to achieve your dream and if it is not happening with your efforts?  Do not know where to begin and how to progress? We can help to sort it out with bespoke programmes that can cater your requirements at the relevant areas.";
    			attr_dev(p, "class", "w-3/4 md:w-2/3 hidden md:block");
    			add_location(p, file$7, 15, 8, 667);
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
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(15:4) <Subtext>",
    		ctx
    	});

    	return block;
    }

    // (19:4) <Button type="primary" rounded={true}>
    function create_default_slot$3(ctx) {
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(19:4) <Button type=\\\"primary\\\" rounded={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let div0;
    	let largeheading;
    	let t0;
    	let h1;
    	let t2;
    	let subtext;
    	let t3;
    	let a;
    	let button;
    	let t4;
    	let heroimgs0;
    	let t5;
    	let heroimgs1;
    	let current;
    	let mounted;
    	let dispose;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	subtext = new Subtext({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				type: "primary",
    				rounded: true,
    				$$slots: { default: [create_default_slot$3] },
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
    			h1.textContent = "Fastrack your foreign Dreams with Edustar IELTS coaching";
    			t2 = space();
    			create_component(subtext.$$.fragment);
    			t3 = space();
    			a = element("a");
    			create_component(button.$$.fragment);
    			t4 = space();
    			create_component(heroimgs0.$$.fragment);
    			t5 = space();
    			create_component(heroimgs1.$$.fragment);
    			attr_dev(h1, "class", "text-4xl md:text-5xl lg:text-6xl p-5 font-Display font-semibold");
    			add_location(h1, file$7, 11, 4, 493);
    			attr_dev(a, "href", "#ContactUs");
    			add_location(a, file$7, 17, 0, 980);
    			attr_dev(div0, "class", "md:w-1/2");
    			add_location(div0, file$7, 9, 4, 413);
    			attr_dev(div1, "class", "text-center flex flex-col justify-center items-center h-full py-36 md:py-48 md:pt-56 md:pb-36 mb-48 md:mb-0 relative");
    			add_location(div1, file$7, 8, 0, 278);
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
    			append_dev(div0, a);
    			mount_component(button, a, null);
    			append_dev(div0, t4);
    			mount_component(heroimgs0, div0, null);
    			append_dev(div0, t5);
    			mount_component(heroimgs1, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(scrollto.call(null, a, "#ContactUs"));
    				mounted = true;
    			}
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
    			mounted = false;
    			dispose();
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
    	validate_slots("HeroSection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeroSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Button,
    		LargeHeading,
    		Subtext,
    		HeroImgs,
    		scrollto
    	});

    	return [];
    }

    class HeroSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroSection",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Header/Header.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/components/Header/Header.svelte";

    function create_fragment$6(ctx) {
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
    			attr_dev(section, "class", "w-screen overflow-hidden relative");
    			attr_dev(section, "id", "Home");
    			add_location(section, file$6, 5, 0, 125);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/testimonials/TestimonialModal.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/testimonials/TestimonialModal.svelte";

    // (16:8) <Subtext>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
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
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(16:8) <Subtext>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let span;
    	let t0;
    	let h3;
    	let t1_value = /*Testimonial*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let subtext;
    	let t3;
    	let div2;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t4;
    	let div1;
    	let h4;
    	let t5_value = /*Testimonial*/ ctx[0].name + "";
    	let t5;
    	let t6;
    	let p;
    	let t7_value = /*Testimonial*/ ctx[0].designation + "";
    	let t7;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;

    	subtext = new Subtext({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(subtext.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			img = element("img");
    			t4 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			t5 = text(t5_value);
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			attr_dev(span, "class", "fas fa-window-close text-3xl text-red-500 absolute  right-0");
    			add_location(span, file$5, 12, 16, 560);
    			attr_dev(div0, "class", " relative");
    			add_location(div0, file$5, 11, 12, 520);
    			attr_dev(h3, "class", "px-5");
    			add_location(h3, file$5, 14, 12, 673);
    			if (img.src !== (img_src_value = "/img/Testimonials/" + /*Testimonial*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*Testimonial*/ ctx[0].img);
    			attr_dev(img, "class", "w-24 rounded-full");
    			add_location(img, file$5, 18, 16, 808);
    			add_location(h4, file$5, 20, 20, 957);
    			add_location(p, file$5, 21, 20, 1006);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$5, 19, 16, 922);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$5, 17, 12, 777);
    			attr_dev(div3, "class", "bg-white p-5 h-fit max-h-screen w-full  overflow-scroll");
    			add_location(div3, file$5, 10, 8, 438);
    			attr_dev(div4, "class", "p-5 fixed top-0 left-0 w-screen h-screen bg-black flex justify-center items-center z-50");
    			add_location(div4, file$5, 7, 4, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, span);
    			append_dev(div3, t0);
    			append_dev(div3, h3);
    			append_dev(h3, t1);
    			append_dev(div3, t2);
    			mount_component(subtext, div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h4);
    			append_dev(h4, t5);
    			append_dev(div1, t6);
    			append_dev(div1, p);
    			append_dev(p, t7);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*Testimonial*/ 1) && t1_value !== (t1_value = /*Testimonial*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    			const subtext_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);

    			if (!current || dirty & /*Testimonial*/ 1 && img.src !== (img_src_value = "/img/Testimonials/" + /*Testimonial*/ ctx[0].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*Testimonial*/ 1 && img_alt_value !== (img_alt_value = /*Testimonial*/ ctx[0].img)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty & /*Testimonial*/ 1) && t5_value !== (t5_value = /*Testimonial*/ ctx[0].name + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*Testimonial*/ 1) && t7_value !== (t7_value = /*Testimonial*/ ctx[0].designation + "")) set_data_dev(t7, t7_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtext.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    					div4_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtext.$$.fragment, local);

    			if (local) {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    				div4_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(subtext);
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			dispose();
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
    	validate_slots("TestimonialModal", slots, ['default']);
    	let { Testimonial } = $$props;
    	let dispatch = createEventDispatcher();
    	const writable_props = ["Testimonial"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestimonialModal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("modalClose");
    	};

    	$$self.$$set = $$props => {
    		if ("Testimonial" in $$props) $$invalidate(0, Testimonial = $$props.Testimonial);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Subtext,
    		fade,
    		slide,
    		createEventDispatcher,
    		Testimonial,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("Testimonial" in $$props) $$invalidate(0, Testimonial = $$props.Testimonial);
    		if ("dispatch" in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Testimonial, dispatch, slots, click_handler, $$scope];
    }

    class TestimonialModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { Testimonial: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestimonialModal",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*Testimonial*/ ctx[0] === undefined && !("Testimonial" in props)) {
    			console.warn("<TestimonialModal> was created without expected prop 'Testimonial'");
    		}
    	}

    	get Testimonial() {
    		throw new Error("<TestimonialModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Testimonial(value) {
    		throw new Error("<TestimonialModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/testimonials/TestmContent.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/testimonials/TestmContent.svelte";

    // (23:4) <Subtext>
    function create_default_slot_1$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
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
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(23:4) <Subtext>",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if openModal===true}
    function create_if_block(ctx) {
    	let testimonialmodal;
    	let current;

    	testimonialmodal = new TestimonialModal({
    			props: {
    				Testimonial: /*Testimonial*/ ctx[0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	testimonialmodal.$on("modalClose", /*handleModalClose*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(testimonialmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(testimonialmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const testimonialmodal_changes = {};
    			if (dirty & /*Testimonial*/ 1) testimonialmodal_changes.Testimonial = /*Testimonial*/ ctx[0];

    			if (dirty & /*$$scope, Testimonial*/ 33) {
    				testimonialmodal_changes.$$scope = { dirty, ctx };
    			}

    			testimonialmodal.$set(testimonialmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(testimonialmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(testimonialmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(testimonialmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(32:0) {#if openModal===true}",
    		ctx
    	});

    	return block;
    }

    // (33:8) <TestimonialModal Testimonial={Testimonial} on:modalClose={handleModalClose}>
    function create_default_slot$1(ctx) {
    	let t_value = /*Testimonial*/ ctx[0].content + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Testimonial*/ 1 && t_value !== (t_value = /*Testimonial*/ ctx[0].content + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(33:8) <TestimonialModal Testimonial={Testimonial} on:modalClose={handleModalClose}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let h3;
    	let t0_value = /*Testimonial*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let subtext;
    	let t2;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t3;
    	let div0;
    	let h4;
    	let t4_value = /*Testimonial*/ ctx[0].name + "";
    	let t4;
    	let t5;
    	let p;
    	let t6_value = /*Testimonial*/ ctx[0].designation + "";
    	let t6;
    	let div2_transition;
    	let t7;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	subtext = new Subtext({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*openModal*/ ctx[1] === true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(subtext.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			img = element("img");
    			t3 = space();
    			div0 = element("div");
    			h4 = element("h4");
    			t4 = text(t4_value);
    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h3, file$4, 21, 4, 567);
    			if (img.src !== (img_src_value = "/img/Testimonials/" + /*Testimonial*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*Testimonial*/ ctx[0].img);
    			attr_dev(img, "class", "w-24 rounded-full");
    			add_location(img, file$4, 24, 8, 660);
    			add_location(h4, file$4, 26, 12, 799);
    			add_location(p, file$4, 27, 12, 839);
    			attr_dev(div0, "class", "w-full");
    			add_location(div0, file$4, 25, 8, 766);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$4, 23, 4, 637);
    			attr_dev(div2, "class", "p-5 w-72 md:w-96");
    			add_location(div2, file$4, 20, 0, 481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(h3, t0);
    			append_dev(div2, t1);
    			mount_component(subtext, div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p);
    			append_dev(p, t6);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*handleModalClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*Testimonial*/ 1) && t0_value !== (t0_value = /*Testimonial*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			const subtext_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);

    			if (!current || dirty & /*Testimonial*/ 1 && img.src !== (img_src_value = "/img/Testimonials/" + /*Testimonial*/ ctx[0].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*Testimonial*/ 1 && img_alt_value !== (img_alt_value = /*Testimonial*/ ctx[0].img)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty & /*Testimonial*/ 1) && t4_value !== (t4_value = /*Testimonial*/ ctx[0].name + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*Testimonial*/ 1) && t6_value !== (t6_value = /*Testimonial*/ ctx[0].designation + "")) set_data_dev(t6, t6_value);

    			if (/*openModal*/ ctx[1] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*openModal*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(subtext.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    					div2_transition.run(1);
    				});
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtext.$$.fragment, local);

    			if (local) {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    				div2_transition.run(0);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(subtext);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t7);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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
    	let openModal;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TestmContent", slots, ['default']);
    	let dispatch = createEventDispatcher();
    	let { Testimonial } = $$props;

    	const handleModalClick = () => {
    		$$invalidate(1, openModal = true);
    		dispatch("modalOpen");
    	};

    	const handleModalClose = () => {
    		$$invalidate(1, openModal = false);
    		dispatch("modalClose");
    	};

    	const writable_props = ["Testimonial"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestmContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("Testimonial" in $$props) $$invalidate(0, Testimonial = $$props.Testimonial);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Subtext,
    		fade,
    		slide,
    		TestimonialModal,
    		createEventDispatcher,
    		dispatch,
    		Testimonial,
    		handleModalClick,
    		handleModalClose,
    		openModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("Testimonial" in $$props) $$invalidate(0, Testimonial = $$props.Testimonial);
    		if ("openModal" in $$props) $$invalidate(1, openModal = $$props.openModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, openModal = false);
    	return [Testimonial, openModal, handleModalClick, handleModalClose, slots, $$scope];
    }

    class TestmContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { Testimonial: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestmContent",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*Testimonial*/ ctx[0] === undefined && !("Testimonial" in props)) {
    			console.warn("<TestmContent> was created without expected prop 'Testimonial'");
    		}
    	}

    	get Testimonial() {
    		throw new Error("<TestmContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Testimonial(value) {
    		throw new Error("<TestmContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/testimonials/TestmNav.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/testimonials/TestmNav.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let i1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			t1 = text(/*currentItemNum*/ ctx[0]);
    			t2 = text("/");
    			t3 = text(/*maxItems*/ ctx[1]);
    			t4 = space();
    			div1 = element("div");
    			i1 = element("i");
    			attr_dev(i0, "class", "fas fa-arrow-left");
    			add_location(i0, file$3, 11, 7, 349);
    			attr_dev(div0, "class", "pointer bg-blue-500 px-2 p-1 m-3 text-white inline");
    			add_location(div0, file$3, 9, 4, 228);
    			attr_dev(i1, "class", "fas fa-arrow-right");
    			add_location(i1, file$3, 15, 7, 547);
    			attr_dev(div1, "class", "pointer bg-blue-500 px-2 p-1 m-3 text-white inline");
    			add_location(div1, file$3, 13, 4, 425);
    			attr_dev(div2, "class", "flex flex-nowrap h-16 my-2 items-center justify-center");
    			add_location(div2, file$3, 8, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, t2);
    			append_dev(div2, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentItemNum*/ 1) set_data_dev(t1, /*currentItemNum*/ ctx[0]);
    			if (dirty & /*maxItems*/ 2) set_data_dev(t3, /*maxItems*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TestmNav", slots, []);
    	let dispatch = createEventDispatcher();
    	let { currentItemNum } = $$props;
    	let { maxItems } = $$props;
    	const writable_props = ["currentItemNum", "maxItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestmNav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("leftNavClick");
    	};

    	const click_handler_1 = () => {
    		dispatch("rightNavClick");
    	};

    	$$self.$$set = $$props => {
    		if ("currentItemNum" in $$props) $$invalidate(0, currentItemNum = $$props.currentItemNum);
    		if ("maxItems" in $$props) $$invalidate(1, maxItems = $$props.maxItems);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		currentItemNum,
    		maxItems
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) $$invalidate(2, dispatch = $$props.dispatch);
    		if ("currentItemNum" in $$props) $$invalidate(0, currentItemNum = $$props.currentItemNum);
    		if ("maxItems" in $$props) $$invalidate(1, maxItems = $$props.maxItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentItemNum, maxItems, dispatch, click_handler, click_handler_1];
    }

    class TestmNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { currentItemNum: 0, maxItems: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestmNav",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentItemNum*/ ctx[0] === undefined && !("currentItemNum" in props)) {
    			console.warn("<TestmNav> was created without expected prop 'currentItemNum'");
    		}

    		if (/*maxItems*/ ctx[1] === undefined && !("maxItems" in props)) {
    			console.warn("<TestmNav> was created without expected prop 'maxItems'");
    		}
    	}

    	get currentItemNum() {
    		throw new Error("<TestmNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentItemNum(value) {
    		throw new Error("<TestmNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxItems() {
    		throw new Error("<TestmNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxItems(value) {
    		throw new Error("<TestmNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/testimonials/Testimonials.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/components/testimonials/Testimonials.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (127:8) <LargeHeading>
    function create_default_slot_1(ctx) {
    	let div;
    	let i;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			h2 = element("h2");
    			h2.textContent = "What People say about Edustar?";
    			attr_dev(i, "class", "fas fa-quote-left absolute text-gray-300 text-6xl");
    			add_location(i, file$2, 126, 37, 5808);
    			attr_dev(h2, "class", "text-left relative pt-10 pl-3");
    			add_location(h2, file$2, 126, 102, 5873);
    			attr_dev(div, "class", "");
    			add_location(div, file$2, 126, 23, 5794);
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(127:8) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (137:8) <TestmContent Testimonial={Testimonial} on:modalOpen={modalOpen} on:modalClose={modalClose}>
    function create_default_slot(ctx) {
    	let t0_value = /*Testimonial*/ ctx[12].content.slice(0, 190) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*viewArray*/ 2 && t0_value !== (t0_value = /*Testimonial*/ ctx[12].content.slice(0, 190) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(137:8) <TestmContent Testimonial={Testimonial} on:modalOpen={modalOpen} on:modalClose={modalClose}>",
    		ctx
    	});

    	return block;
    }

    // (135:8) {#each viewArray as Testimonial(Testimonial.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let testmcontent;
    	let current;

    	testmcontent = new TestmContent({
    			props: {
    				Testimonial: /*Testimonial*/ ctx[12],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	testmcontent.$on("modalOpen", /*modalOpen*/ ctx[6]);
    	testmcontent.$on("modalClose", /*modalClose*/ ctx[5]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(testmcontent.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(testmcontent, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const testmcontent_changes = {};
    			if (dirty & /*viewArray*/ 2) testmcontent_changes.Testimonial = /*Testimonial*/ ctx[12];

    			if (dirty & /*$$scope, viewArray*/ 32770) {
    				testmcontent_changes.$$scope = { dirty, ctx };
    			}

    			testmcontent.$set(testmcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(testmcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(testmcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(testmcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(135:8) {#each viewArray as Testimonial(Testimonial.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let largeheading;
    	let t0;
    	let div0;
    	let testmnav;
    	let t1;
    	let div4;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	testmnav = new TestmNav({
    			props: {
    				currentItemNum: /*end*/ ctx[0],
    				maxItems: /*maxItems*/ ctx[2]
    			},
    			$$inline: true
    		});

    	testmnav.$on("leftNavClick", /*handleLeftClick*/ ctx[4]);
    	testmnav.$on("rightNavClick", /*handleRightClick*/ ctx[3]);
    	let each_value = /*viewArray*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*Testimonial*/ ctx[12].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(testmnav.$$.fragment);
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "absolute right-3 inline-block");
    			add_location(div0, file$2, 127, 8, 5981);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$2, 125, 4, 5756);
    			attr_dev(div2, "class", "md:w-2/3");
    			add_location(div2, file$2, 124, 3, 5729);
    			attr_dev(div3, "class", "flex flex-col md:flex-row md:justify-evenly justify-center items-center flex-wrap py-10");
    			add_location(div3, file$2, 133, 4, 6233);
    			attr_dev(div4, "class", "h-115 overflow-hidden");
    			add_location(div4, file$2, 132, 0, 6193);
    			attr_dev(section, "id", "Testimonials");
    			attr_dev(section, "class", "p-5 flex flex-col justify-center items-center my-24 w-screen overflow-hidden");
    			add_location(section, file$2, 123, 0, 5613);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			mount_component(largeheading, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(testmnav, div0, null);
    			append_dev(section, t1);
    			append_dev(section, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const testmnav_changes = {};
    			if (dirty & /*end*/ 1) testmnav_changes.currentItemNum = /*end*/ ctx[0];
    			testmnav.$set(testmnav_changes);

    			if (dirty & /*viewArray, modalOpen, modalClose*/ 98) {
    				each_value = /*viewArray*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div3, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeheading.$$.fragment, local);
    			transition_in(testmnav.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeheading.$$.fragment, local);
    			transition_out(testmnav.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(largeheading);
    			destroy_component(testmnav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testimonials", slots, []);

    	let Testimonials = [
    		{
    			id: 1,
    			title: "Best IELTS training center one can find!",
    			name: "AngelRose Kannadan",
    			designation: "Regd Nurse,Australia",
    			content: "Edustar is the best IELTS training center one can find. When I first joined I was nervous and not confident at all for attending the IELTS exam. But with just one month class, my standard of English along with my confidence increased to a great extend.My instructor Sunil sir was very friendly and professional. He always available for help and supported me to prepare better for my weakest sections and at the same time gave me valuable feedback on my performance based on the regular practice tests in the class. The advice I got really helped me face the test with more confidence and helped me to achieve my desired score of individual 7. Study material provided by Edustar was a very good resource for preparing for IELTS.All thanks to Sunil sir who was with me in every step of my way.I highly recommend Edustar Academy to all IELTS preparing candidates.",
    			img: "AngelRose.jpeg"
    		},
    		{
    			id: 2,
    			title: `Join “EDUSTAR”  if you really want to succeed in your life`,
    			name: "Neethumol John",
    			designation: "Canada",
    			content: `“To be honest, I was not proficient at all in English language when I started learning IELTS under Sunil sir supervision.I just want to say a massive thanks for your assistance to made me confident and achieve my dreams. I would say, to the least, You are my life saver and I don’t think I could be able to transform my life without you sir. I would recommend “EDUSTAR”  if you really want to succeed in your life.  Sunil sir is such a wonderful person who can guide, motivate and support you throughout your English learning journey.”`,
    			img: "Neethumol.jpeg"
    		},
    		{
    			id: 3,
    			title: "Massive THANK YOU to Sunil Sir",
    			name: "Linda Alias",
    			designation: "United Kingdom",
    			content: "Massive THANK YOU to Sunil Sir for his help and support.Sir has been fantastic, his guidance and tailored approach was the key to my success! I would strongly recommend Edustar   Institute to everyone who gets stuck and cannot progress with IELTS.Thank you once again!",
    			img: "LindaAlias.jpeg"
    		},
    		{
    			id: 4,
    			title: "My heartfelt thanks to EDUSTAR IELTS Academy",
    			name: "George Kutty",
    			designation: "Canada",
    			content: "Dr.Sunil Sir , his way of teaching and giving attention to each student is nice.Practice makes man perfect, so this is also a place where practice gain, learnt many things during his classes.  It helps me to pin point my week areas/skills in English.He shared a lot of material to help improve our vocabulary. We were also given a lot of practice material and online practice sessions.He kept all the sessions interactive and constantly helped us improve in all aspects.Overall this is an excellent academy to recommend others. my heartfelt thanks to EDUSTAR IELTS Academy.",
    			img: "GeorgeKutty.jpg"
    		},
    		{
    			id: 5,
    			title: "Extremely patient in helping me address the elusive aspects of the IELTS",
    			name: "Tom Thomas",
    			designation: "Canada",
    			content: "Dr. Sunil Devaprabha of EDU star (Idukki), was extremely patient in helping me address the elusive aspects of the IELTS, which were imperative to getting my required score . Regardless of the volume of students in the session, I always got personalized attention. It was the EDU Star  community's overall commitment that helped me achieve the band I wanted",
    			img: "TomThomas.jpeg"
    		},
    		{
    			id: 6,
    			title: "If you are an apirant of English language, Edustar Fastrack would be a top notch choice",
    			name: "Jismy jose",
    			designation: "Staff nurse Manchester University NHS Foundation trust",
    			content: "If you are an apirant of English language, Edustar International Education would be a top notch choice where you could find the best learning ambience I would rather say im much obliged to the unbeatable guidance provided by Dr. Sunil devaprabha in enhancing my English language proficiency to a much appreciated level",
    			img: "Jismi.jpeg"
    		}
    	];

    	let viewArray = [];
    	let numItems = 1;
    	let maxItems = parseInt(Testimonials.length);

    	if (window.innerWidth <= 720) {
    		numItems = 1;
    	} else if (window.innerWidth <= 1280) {
    		numItems = 2;
    	} else if (window.innerWidth <= 1920) {
    		numItems = 2;
    	} else if (window.innerWidth > 1920) {
    		numItems = 3;
    	}

    	let start = 0, end = numItems;

    	const addViewItems = (start, end) => {
    		$$invalidate(1, viewArray = []);

    		for (let i = start; i < end; i++) {
    			viewArray.push(Testimonials[i]);
    		}
    	};

    	addViewItems(start, end);

    	const handleRightClick = () => {
    		if (end >= maxItems) {
    			$$invalidate(7, start = 0);
    			$$invalidate(0, end = numItems);
    			addViewItems(start, end);
    		} else if (end + numItems > maxItems) {
    			$$invalidate(0, end = maxItems);
    			$$invalidate(7, start = end - maxItems % numItems);
    			addViewItems(start, end);
    		} else {
    			$$invalidate(7, start += numItems);
    			$$invalidate(0, end = end + numItems);
    			addViewItems(start, end);
    		}
    	};

    	const handleLeftClick = () => {
    		if (end <= numItems) {
    			$$invalidate(0, end = maxItems);
    			$$invalidate(7, start = end - numItems);
    			addViewItems(start, end);
    		} else if (start - numItems < 0) {
    			$$invalidate(7, start = 0);
    			$$invalidate(0, end = numItems);
    			addViewItems(start, end);
    		} else {
    			$$invalidate(0, end -= numItems);
    			$$invalidate(7, start = start - numItems);
    			addViewItems(start, end);
    		}
    	};

    	let interval;

    	const modalClose = () => {
    		interval = setInterval(
    			() => {
    				handleRightClick();
    			},
    			5000
    		);
    	};

    	modalClose();

    	const modalOpen = () => {
    		clearInterval(interval);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testimonials> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LargeHeading,
    		TestmContent,
    		TestmNav,
    		Testimonials,
    		viewArray,
    		numItems,
    		maxItems,
    		start,
    		end,
    		addViewItems,
    		handleRightClick,
    		handleLeftClick,
    		interval,
    		modalClose,
    		modalOpen
    	});

    	$$self.$inject_state = $$props => {
    		if ("Testimonials" in $$props) Testimonials = $$props.Testimonials;
    		if ("viewArray" in $$props) $$invalidate(1, viewArray = $$props.viewArray);
    		if ("numItems" in $$props) numItems = $$props.numItems;
    		if ("maxItems" in $$props) $$invalidate(2, maxItems = $$props.maxItems);
    		if ("start" in $$props) $$invalidate(7, start = $$props.start);
    		if ("end" in $$props) $$invalidate(0, end = $$props.end);
    		if ("interval" in $$props) interval = $$props.interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*start, end*/ 129) ;
    	};

    	return [
    		end,
    		viewArray,
    		maxItems,
    		handleRightClick,
    		handleLeftClick,
    		modalClose,
    		modalOpen,
    		start
    	];
    }

    class Testimonials_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonials_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/WhatsappButton.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/components/WhatsappButton.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let a;
    	let div0;
    	let i;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a = element("a");
    			div0 = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fab fa-whatsapp text-center");
    			add_location(i, file$1, 3, 12, 248);
    			attr_dev(div0, "class", "fixed right-5 bottom-5 bg-blue-500 text-white text-4xl rounded-full w-16 h-16 flex justify-center items-center hover:bg-blue-400");
    			add_location(div0, file$1, 2, 8, 93);
    			attr_dev(a, "href", "https://api.whatsapp.com/send?phone=919745971753&text=");
    			add_location(a, file$1, 1, 4, 19);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(div0, i);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	validate_slots("WhatsappButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WhatsappButton> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WhatsappButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhatsappButton",
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
    	let t3;
    	let gallery;
    	let t4;
    	let contactus;
    	let t5;
    	let whatsappbutton;
    	let t6;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	coursesection = new CourseSection({ $$inline: true });
    	aboutus = new AboutUs({ $$inline: true });
    	testimonials = new Testimonials_1({ $$inline: true });
    	gallery = new Gallery({ $$inline: true });
    	contactus = new ContactUs({ $$inline: true });
    	whatsappbutton = new WhatsappButton({ $$inline: true });
    	footer = new Footer({ $$inline: true });

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
    			t3 = space();
    			create_component(gallery.$$.fragment);
    			t4 = space();
    			create_component(contactus.$$.fragment);
    			t5 = space();
    			create_component(whatsappbutton.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file, 15, 0, 529);
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
    			append_dev(main, t3);
    			mount_component(gallery, main, null);
    			append_dev(main, t4);
    			mount_component(contactus, main, null);
    			append_dev(main, t5);
    			mount_component(whatsappbutton, main, null);
    			append_dev(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(coursesection.$$.fragment, local);
    			transition_in(aboutus.$$.fragment, local);
    			transition_in(testimonials.$$.fragment, local);
    			transition_in(gallery.$$.fragment, local);
    			transition_in(contactus.$$.fragment, local);
    			transition_in(whatsappbutton.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(coursesection.$$.fragment, local);
    			transition_out(aboutus.$$.fragment, local);
    			transition_out(testimonials.$$.fragment, local);
    			transition_out(gallery.$$.fragment, local);
    			transition_out(contactus.$$.fragment, local);
    			transition_out(whatsappbutton.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(coursesection);
    			destroy_component(aboutus);
    			destroy_component(testimonials);
    			destroy_component(gallery);
    			destroy_component(contactus);
    			destroy_component(whatsappbutton);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AboutUs,
    		ContactUs,
    		CourseSection,
    		Footer,
    		Gallery,
    		Header,
    		Testimonials: Testimonials_1,
    		WhatsappButton
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
