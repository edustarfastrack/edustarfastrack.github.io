
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

    function create_fragment$t(ctx) {
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
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {
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
    			id: create_fragment$t.name
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

    const file$p = "src/shared/LargeHeading.svelte";

    function create_fragment$s(ctx) {
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
    			add_location(h3, file$p, 3, 0, 46);
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
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { black: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LargeHeading",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get black() {
    		throw new Error("<LargeHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set black(value) {
    		throw new Error("<LargeHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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
    const file$o = "src/shared/Tabs.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (15:8) {#each TabItems as Tab}
    function create_each_block_1(ctx) {
    	let h2;
    	let t_value = /*Tab*/ ctx[6].name + "";
    	let t;
    	let h2_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*Tab*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(t_value);

    			attr_dev(h2, "class", h2_class_value = "font-Display text-2xl md:text-3xl p-3 cursor-pointer " + (/*currentTab*/ ctx[2] === /*Tab*/ ctx[6].name
    			? "border-b-4 border-blue-500"
    			: ""));

    			add_location(h2, file$o, 15, 11, 354);
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
    			if (dirty & /*TabItems*/ 2 && t_value !== (t_value = /*Tab*/ ctx[6].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*currentTab, TabItems*/ 6 && h2_class_value !== (h2_class_value = "font-Display text-2xl md:text-3xl p-3 cursor-pointer " + (/*currentTab*/ ctx[2] === /*Tab*/ ctx[6].name
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(15:8) {#each TabItems as Tab}",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if sideNav }
    function create_if_block$4(ctx) {
    	let div1;
    	let div0;
    	let div1_transition;
    	let current;
    	let each_value = /*TabItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex flex-col justify-center items-center flex-wrap py-5");
    			add_location(div0, file$o, 25, 4, 678);
    			attr_dev(div1, "class", "fixed left-0 top-1/2 z-50");
    			add_location(div1, file$o, 24, 0, 618);
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
    			if (dirty & /*currentTab, TabItems, dispatch*/ 14) {
    				each_value = /*TabItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(24:0) {#if sideNav }",
    		ctx
    	});

    	return block;
    }

    // (27:8) {#each TabItems as Tab}
    function create_each_block$3(ctx) {
    	let h2;
    	let span;
    	let span_class_value;
    	let h2_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[5](/*Tab*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			span = element("span");
    			attr_dev(span, "class", span_class_value = /*Tab*/ ctx[6].icon);
    			add_location(span, file$o, 29, 15, 1011);

    			attr_dev(h2, "class", h2_class_value = "font-Display text-2xl px-3 p-2 m-2 bg-gray-600 text-white cursor-pointer rounded-full " + (/*currentTab*/ ctx[2] === /*Tab*/ ctx[6].name
    			? " text-blue-500"
    			: ""));

    			add_location(h2, file$o, 27, 11, 792);
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

    			if (dirty & /*TabItems*/ 2 && span_class_value !== (span_class_value = /*Tab*/ ctx[6].icon)) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*currentTab, TabItems*/ 6 && h2_class_value !== (h2_class_value = "font-Display text-2xl px-3 p-2 m-2 bg-gray-600 text-white cursor-pointer rounded-full " + (/*currentTab*/ ctx[2] === /*Tab*/ ctx[6].name
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(27:8) {#each TabItems as Tab}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value_1 = /*TabItems*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block = /*sideNav*/ ctx[0] && create_if_block$4(ctx);

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
    			add_location(div0, file$o, 13, 4, 249);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file$o, 11, 0, 219);
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
    			if (dirty & /*currentTab, TabItems, dispatch*/ 14) {
    				each_value_1 = /*TabItems*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("Tabs", slots, []);
    	let { sideNav = false } = $$props;
    	let dispatch = createEventDispatcher();
    	let { TabItems } = $$props;
    	let { currentTab } = $$props;
    	const writable_props = ["sideNav", "TabItems", "currentTab"];

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
    		if ("currentTab" in $$props) $$invalidate(2, currentTab = $$props.currentTab);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		sideNav,
    		dispatch,
    		TabItems,
    		currentTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("sideNav" in $$props) $$invalidate(0, sideNav = $$props.sideNav);
    		if ("dispatch" in $$props) $$invalidate(3, dispatch = $$props.dispatch);
    		if ("TabItems" in $$props) $$invalidate(1, TabItems = $$props.TabItems);
    		if ("currentTab" in $$props) $$invalidate(2, currentTab = $$props.currentTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sideNav, TabItems, currentTab, dispatch, click_handler, click_handler_1];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { sideNav: 0, TabItems: 1, currentTab: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*TabItems*/ ctx[1] === undefined && !("TabItems" in props)) {
    			console.warn("<Tabs> was created without expected prop 'TabItems'");
    		}

    		if (/*currentTab*/ ctx[2] === undefined && !("currentTab" in props)) {
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

    	get currentTab() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentTab(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/about/ImageSlide.svelte generated by Svelte v3.38.2 */
    const file$n = "src/components/about/ImageSlide.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (36:3) {#if img.id===currentImage}
    function create_if_block$3(ctx) {
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
    			add_location(img, file$n, 38, 8, 741);
    			add_location(br, file$n, 39, 90, 893);
    			attr_dev(i, "class", "fas fa-certificate text-yellow-300 text-2xl");
    			add_location(i, file$n, 39, 140, 943);
    			attr_dev(span, "class", "font-bold text-2xl");
    			add_location(span, file$n, 39, 95, 898);
    			attr_dev(p, "class", "bg-blue-500 p-3 absolute text-white bottom-0 right-0");
    			add_location(p, file$n, 39, 8, 811);
    			attr_dev(a, "href", "/img/" + /*img*/ ctx[4].name);
    			attr_dev(a, "data-lightbox", /*img*/ ctx[4].name);
    			attr_dev(a, "data-title", /*img*/ ctx[4].name);
    			add_location(a, file$n, 37, 7, 655);
    			attr_dev(div, "class", " ");
    			add_location(div, file$n, 36, 3, 615);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(36:3) {#if img.id===currentImage}",
    		ctx
    	});

    	return block;
    }

    // (35:3) {#each images as img}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*img*/ ctx[4].id === /*currentImage*/ ctx[0] && create_if_block$3(ctx);

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
    					if_block = create_if_block$3(ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(35:3) {#each images as img}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div;
    	let current;
    	let each_value = /*images*/ ctx[1];
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
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "relative md:w-96 w-72 md:h-105 h-96 text-center ");
    			add_location(div, file$n, 32, 0, 487);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageSlide",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/components/about/WhyUs.svelte generated by Svelte v3.38.2 */
    const file$m = "src/components/about/WhyUs.svelte";

    function create_fragment$p(ctx) {
    	let div6;
    	let div5;
    	let div0;
    	let imageslide;
    	let t0;
    	let div4;
    	let div1;
    	let h30;
    	let t2;
    	let p0;
    	let t4;
    	let div2;
    	let h31;
    	let t6;
    	let p1;
    	let t8;
    	let div3;
    	let h32;
    	let t10;
    	let p2;
    	let current;
    	imageslide = new ImageSlide({ $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			create_component(imageslide.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "100+";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Happy Students";
    			t4 = space();
    			div2 = element("div");
    			h31 = element("h3");
    			h31.textContent = "10+";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Years of Experience";
    			t8 = space();
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "100%";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "Success Ratio";
    			attr_dev(div0, "class", "flex justify-center items-center");
    			add_location(div0, file$m, 7, 8, 170);
    			attr_dev(h30, "class", "font-bold font-Display text-5xl text-blue-600 mx-10");
    			add_location(h30, file$m, 12, 16, 396);
    			attr_dev(p0, "class", "font-body text-xl");
    			add_location(p0, file$m, 13, 16, 486);
    			attr_dev(div1, "class", "p-3");
    			add_location(div1, file$m, 11, 12, 362);
    			attr_dev(h31, "class", "font-bold font-Display text-5xl text-red-600 mx-10");
    			add_location(h31, file$m, 16, 16, 599);
    			attr_dev(p1, "class", "font-body text-xl");
    			add_location(p1, file$m, 17, 16, 687);
    			attr_dev(div2, "class", "p-3");
    			add_location(div2, file$m, 15, 12, 565);
    			attr_dev(h32, "class", "font-bold font-Display text-5xl text-blue-600 mx-10");
    			add_location(h32, file$m, 20, 16, 805);
    			attr_dev(p2, "class", "font-body text-xl");
    			add_location(p2, file$m, 21, 16, 895);
    			attr_dev(div3, "class", "p-3");
    			add_location(div3, file$m, 19, 12, 771);
    			attr_dev(div4, "class", "py-24 flex flex-col md:flex-row flex-wrap justify-center items-center");
    			add_location(div4, file$m, 10, 8, 266);
    			attr_dev(div5, "class", "");
    			add_location(div5, file$m, 6, 4, 147);
    			attr_dev(div6, "class", "p-5 text-center flex flex-col items-center justify-center");
    			add_location(div6, file$m, 5, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			mount_component(imageslide, div0, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, h30);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div2, h31);
    			append_dev(div2, t6);
    			append_dev(div2, p1);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, h32);
    			append_dev(div3, t10);
    			append_dev(div3, p2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(imageslide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(imageslide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(imageslide);
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
    	validate_slots("WhyUs", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WhyUs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ImageSlide });
    	return [];
    }

    class WhyUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhyUs",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/components/about/WhoAreWe.svelte generated by Svelte v3.38.2 */

    function create_fragment$o(ctx) {
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props) {
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WhoAreWe",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/components/about/Mission.svelte generated by Svelte v3.38.2 */

    function create_fragment$n(ctx) {
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mission",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/components/about/Vision.svelte generated by Svelte v3.38.2 */

    function create_fragment$m(ctx) {
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vision",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/components/about/AboutUs.svelte generated by Svelte v3.38.2 */
    const file$l = "src/components/about/AboutUs.svelte";

    // (27:8) <LargeHeading>
    function create_default_slot_1$4(ctx) {
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
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(27:8) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (36:39) 
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
    		source: "(36:39) ",
    		ctx
    	});

    	return block;
    }

    // (34:40) 
    function create_if_block_2$1(ctx) {
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(34:40) ",
    		ctx
    	});

    	return block;
    }

    // (32:43) 
    function create_if_block_1$1(ctx) {
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(32:43) ",
    		ctx
    	});

    	return block;
    }

    // (30:7) {#if currentTab==="Why Us"}
    function create_if_block$2(ctx) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(30:7) {#if currentTab===\\\"Why Us\\\"}",
    		ctx
    	});

    	return block;
    }

    // (22:4) <IntersectionObserver {element} bind:intersecting>
    function create_default_slot$8(ctx) {
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
    				$$slots: { default: [create_default_slot_1$4] },
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
    	const if_block_creators = [create_if_block$2, create_if_block_1$1, create_if_block_2$1, create_if_block_3];
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
    			add_location(div, file$l, 22, 4, 831);
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
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(22:4) <IntersectionObserver {element} bind:intersecting>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let section;
    	let intersectionobserver;
    	let updating_intersecting;
    	let current;

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[6](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[0],
    		$$slots: { default: [create_default_slot$8] },
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
    			add_location(section, file$l, 20, 0, 655);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutUs",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/shared/Button.svelte generated by Svelte v3.38.2 */

    const file$k = "src/shared/Button.svelte";

    function create_fragment$k(ctx) {
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

    			add_location(button, file$k, 6, 0, 118);
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { type: 0, rounded: 1, inverted: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$k.name
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
    const file$j = "src/components/contactus/AddressTab.svelte";

    // (15:16) <Button rounded type="secondary">
    function create_default_slot$7(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Get Directions");
    			attr_dev(i, "class", "fas fa-directions");
    			add_location(i, file$j, 14, 50, 1115);
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
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(15:16) <Button rounded type=\\\"secondary\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
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
    				$$slots: { default: [create_default_slot$7] },
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
    			add_location(h2, file$j, 5, 4, 129);
    			add_location(br0, file$j, 8, 51, 279);
    			add_location(br1, file$j, 8, 76, 304);
    			add_location(br2, file$j, 8, 116, 344);
    			attr_dev(p, "class", " font-body");
    			add_location(p, file$j, 8, 12, 240);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$j, 7, 8, 213);
    			attr_dev(iframe, "title", "googleMapLocation");
    			if (iframe.src !== (iframe_src_value = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.131821581477!2d77.1519759152507!3d9.839294292961469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07a733ff04eeed%3A0x44c8ee5f5fbf504d!2sDr.%20Sunil's%20IELTS%20CENTER!5e0!3m2!1sen!2sin!4v1621527851572!5m2!1sen!2sin")) attr_dev(iframe, "src", iframe_src_value);
    			set_style(iframe, "border", "0");
    			iframe.allowFullscreen = "";
    			attr_dev(iframe, "loading", "lazy");
    			attr_dev(iframe, "class", "w-full h-64 p-3 bg-blue-50");
    			add_location(iframe, file$j, 12, 12, 437);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://www.google.com/maps/dir//Dr.+Sunil%27s+IELTS+CENTER/data=!4m8!4m7!1m0!1m5!1m1!1s0x3b07a733ff04eeed:0x44c8ee5f5fbf504d!2m2!1d77.1541646!2d9.839294299999999");
    			add_location(a, file$j, 13, 12, 874);
    			attr_dev(div1, "class", "w-full ");
    			add_location(div1, file$j, 11, 8, 403);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$j, 6, 4, 190);
    			attr_dev(div3, "class", "bg-white p-5 w-full rounded w-86 md:w-110");
    			add_location(div3, file$j, 4, 0, 69);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressTab",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/components/contactus/ContactSwBtn.svelte generated by Svelte v3.38.2 */

    const file$i = "src/components/contactus/ContactSwBtn.svelte";

    function create_fragment$i(ctx) {
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
    			add_location(i, file$i, 9, 12, 239);
    			attr_dev(div0, "class", "text-xl text-white");
    			add_location(div0, file$i, 8, 8, 194);
    			attr_dev(p, "class", "font-body text-white font-bold");
    			add_location(p, file$i, 11, 8, 292);
    			attr_dev(div1, "class", div1_class_value = "p-5 m-3 inline-block rounded-xl " + (/*selected*/ ctx[2] ? "bg-red-400" : "") + " cursor-pointer");
    			add_location(div1, file$i, 7, 4, 89);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { icon: 0, subtext: 1, selected: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactSwBtn",
    			options,
    			id: create_fragment$i.name
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
    const file$h = "src/components/contactus/contactSwitcher.svelte";

    function create_fragment$h(ctx) {
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
    			add_location(div, file$h, 7, 0, 180);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { currentItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactSwitcher",
    			options,
    			id: create_fragment$h.name
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
    const file$g = "src/components/contactus/MessageTab.svelte";

    // (23:20) <Button type="secondary"  rounded>
    function create_default_slot$6(ctx) {
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
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(23:20) <Button type=\\\"secondary\\\"  rounded>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let form;
    	let div2;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let div1;
    	let label3;
    	let t12;
    	let textarea;
    	let t13;
    	let div3;
    	let button1;
    	let button0;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "secondary",
    				rounded: true,
    				$$slots: { default: [create_default_slot$6] },
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
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Email";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			label2 = element("label");
    			label2.textContent = "Phone";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div1 = element("div");
    			label3 = element("label");
    			label3.textContent = "Message";
    			t12 = space();
    			textarea = element("textarea");
    			t13 = space();
    			div3 = element("div");
    			button1 = element("button");
    			create_component(button0.$$.fragment);
    			attr_dev(h2, "class", "font-dispalay text-2xl p-3");
    			add_location(h2, file$g, 5, 4, 129);
    			attr_dev(label0, "for", "Name");
    			attr_dev(label0, "class", "text-left");
    			add_location(label0, file$g, 9, 16, 370);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300");
    			add_location(input0, file$g, 10, 16, 436);
    			attr_dev(label1, "for", "Email");
    			attr_dev(label1, "class", "text-left");
    			add_location(label1, file$g, 11, 16, 570);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300");
    			add_location(input1, file$g, 12, 16, 637);
    			attr_dev(label2, "for", "Phone");
    			attr_dev(label2, "class", "text-left");
    			add_location(label2, file$g, 13, 16, 772);
    			attr_dev(input2, "type", "tel");
    			attr_dev(input2, "pattern", "[0-9]" + 10);
    			attr_dev(input2, "class", "ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300");
    			add_location(input2, file$g, 14, 16, 839);
    			attr_dev(div0, "class", "flex flex-col w-full md:w-max");
    			add_location(div0, file$g, 8, 12, 310);
    			attr_dev(label3, "for", "Message");
    			attr_dev(label3, "class", "text-left block");
    			add_location(label3, file$g, 17, 16, 1054);
    			attr_dev(textarea, "name", "Message");
    			attr_dev(textarea, "id", "Message");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "class", "w-full bg-blue-100 focus:ring-2 focus:ring-red-300  p-2 my-3 rounded outline-none");
    			add_location(textarea, file$g, 18, 16, 1131);
    			attr_dev(div1, "class", "w-full md:w-max");
    			add_location(div1, file$g, 16, 12, 1008);
    			attr_dev(div2, "class", "flex flex-col md:flex-row flex-wrap justify-evenly items-center w-full");
    			add_location(div2, file$g, 7, 8, 213);
    			add_location(button1, file$g, 22, 12, 1371);
    			attr_dev(div3, "class", "text-center");
    			add_location(div3, file$g, 21, 8, 1333);
    			attr_dev(form, "class", "");
    			add_location(form, file$g, 6, 4, 189);
    			attr_dev(div4, "class", "bg-white p-5 w-full rounded w-86 md:w-110");
    			add_location(div4, file$g, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, form);
    			append_dev(form, div2);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			append_dev(div0, t4);
    			append_dev(div0, label1);
    			append_dev(div0, t6);
    			append_dev(div0, input1);
    			append_dev(div0, t7);
    			append_dev(div0, label2);
    			append_dev(div0, t9);
    			append_dev(div0, input2);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, label3);
    			append_dev(div1, t12);
    			append_dev(div1, textarea);
    			append_dev(form, t13);
    			append_dev(form, div3);
    			append_dev(div3, button1);
    			mount_component(button0, button1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
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
    	validate_slots("MessageTab", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MessageTab> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button });
    	return [];
    }

    class MessageTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessageTab",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/contactus/PhoneTab.svelte generated by Svelte v3.38.2 */

    const file$f = "src/components/contactus/PhoneTab.svelte";

    function create_fragment$f(ctx) {
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
    			add_location(h2, file$f, 1, 4, 60);
    			add_location(h3, file$f, 3, 8, 147);
    			attr_dev(i0, "class", "fas fa-phone-alt  text-white");
    			add_location(i0, file$f, 5, 149, 349);
    			attr_dev(div0, "class", "bg-blue-400  text-white hover:bg-blue-500 inline-block p-2");
    			add_location(div0, file$f, 5, 77, 277);
    			attr_dev(a0, "class", "font-bold ");
    			attr_dev(a0, "href", "tel:+91-97444-12045");
    			add_location(a0, file$f, 5, 12, 212);
    			attr_dev(i1, "class", "fab fa-whatsapp  text-white");
    			add_location(i1, file$f, 6, 104, 509);
    			attr_dev(div1, "class", "bg-blue-400  text-white hover:bg-blue-500 inline-block p-2");
    			add_location(div1, file$f, 6, 32, 437);
    			attr_dev(a1, "href", "#whatsapp");
    			add_location(a1, file$f, 6, 12, 417);
    			attr_dev(p0, "class", "p-2");
    			add_location(p0, file$f, 4, 8, 184);
    			attr_dev(i2, "class", "fas fa-phone-alt  text-white");
    			add_location(i2, file$f, 10, 146, 758);
    			attr_dev(div2, "class", "bg-red-400  text-white hover:bg-red-500 inline-block p-2");
    			add_location(div2, file$f, 10, 76, 688);
    			attr_dev(a2, "class", "font-bold ");
    			attr_dev(a2, "href", "tel:+91-9446129722");
    			add_location(a2, file$f, 10, 12, 624);
    			attr_dev(p1, "class", "p-2");
    			add_location(p1, file$f, 9, 8, 596);
    			attr_dev(div3, "class", "");
    			add_location(div3, file$f, 2, 4, 124);
    			attr_dev(div4, "class", "bg-white p-5 w-full rounded w-86 md:w-110");
    			add_location(div4, file$f, 0, 0, 0);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PhoneTab",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/contactus/ContactUs.svelte generated by Svelte v3.38.2 */
    const file$e = "src/components/contactus/ContactUs.svelte";

    // (14:4) <LargeHeading black={false}>
    function create_default_slot$5(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Get In Touch";
    			attr_dev(h2, "class", "font-bold");
    			add_location(h2, file$e, 13, 32, 516);
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(14:4) <LargeHeading black={false}>",
    		ctx
    	});

    	return block;
    }

    // (25:41) 
    function create_if_block_2(ctx) {
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(25:41) ",
    		ctx
    	});

    	return block;
    }

    // (23:39) 
    function create_if_block_1(ctx) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:39) ",
    		ctx
    	});

    	return block;
    }

    // (21:7) {#if currentItem==="Message"}
    function create_if_block$1(ctx) {
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:7) {#if currentItem===\\\"Message\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let section;
    	let largeheading;
    	let t0;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let contactswitcher;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	largeheading = new LargeHeading({
    			props: {
    				black: false,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contactswitcher = new ContactSwitcher({
    			props: { currentItem: /*currentItem*/ ctx[0] },
    			$$inline: true
    		});

    	contactswitcher.$on("TabChange", /*handleTabChange*/ ctx[1]);
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2];
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
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			create_component(contactswitcher.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if (img.src !== (img_src_value = "/img/bro.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "contact Us illlustration");
    			add_location(img, file$e, 16, 8, 669);
    			attr_dev(div0, "class", "hidden md:block");
    			add_location(div0, file$e, 15, 4, 631);
    			attr_dev(div1, "class", "flex flex-col justify-center items-center");
    			add_location(div1, file$e, 18, 4, 740);
    			attr_dev(div2, "class", "flex items-center justify-around py-24");
    			add_location(div2, file$e, 14, 3, 574);
    			attr_dev(section, "id", "ContactUs");
    			attr_dev(section, "class", "flex flex-col justify-center items-center p-5 text-center  bg-pink-600 w-screen overflow-hidden");
    			add_location(section, file$e, 12, 0, 355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(largeheading, section, null);
    			append_dev(section, t0);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(contactswitcher, div1, null);
    			append_dev(div1, t2);

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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactUs",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/shared/Subtext.svelte generated by Svelte v3.38.2 */

    const file$d = "src/shared/Subtext.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(h4, file$d, 3, 0, 47);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { black: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subtext",
    			options,
    			id: create_fragment$d.name
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
    const file$c = "src/components/Courses/CourseCard.svelte";

    // (9:4) <Subtext black={redCard}>
    function create_default_slot_1$3(ctx) {
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
    		id: create_default_slot_1$3.name,
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

    function create_fragment$c(ctx) {
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
    				$$slots: { default: [create_default_slot_1$3] },
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
    			add_location(h2, file$c, 7, 4, 302);
    			attr_dev(div, "class", div_class_value = "w-72 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 " + (/*redCard*/ ctx[0] ? "bg-blue-600 border-0" : "bg-none"));
    			add_location(div, file$c, 6, 0, 175);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { redCard: 0, cardTitle: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CourseCard",
    			options,
    			id: create_fragment$c.name
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
    const file$b = "src/components/Courses/CourseSection.svelte";

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
    function create_default_slot_1$2(ctx) {
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
    		id: create_default_slot_1$2.name,
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

    function create_fragment$b(ctx) {
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
    	let div6;
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
    	let div5;
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
    				$$slots: { default: [create_default_slot_1$2] },
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
    			div0 = element("div");
    			create_component(coursecard0.$$.fragment);
    			t1 = space();
    			create_component(coursecard1.$$.fragment);
    			t2 = space();
    			create_component(coursecard2.$$.fragment);
    			t3 = space();
    			div6 = element("div");
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Online Classes:";
    			t5 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "8:00AM - 1:00PM";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "2:00PM - 5:00PM";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "8:30PM - 10:30PM";
    			t11 = space();
    			div4 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Institute Timing:";
    			t13 = space();
    			div3 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "10:00AM - 5:00PM";
    			t15 = space();
    			li4 = element("li");
    			li4.textContent = "Monday - Friday";
    			t17 = space();
    			div5 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Staturdays and sundays are holidays for both online and offline classes";
    			attr_dev(div0, "class", "flex flex-col md:flex-row justify-center items-center text-center py-24");
    			add_location(div0, file$b, 9, 0, 255);
    			attr_dev(h30, "class", "p-2 font-Display font-bold");
    			add_location(h30, file$b, 22, 8, 1121);
    			attr_dev(li0, "class", "text-blue-500");
    			add_location(li0, file$b, 24, 16, 1234);
    			attr_dev(li1, "class", "text-red-400");
    			add_location(li1, file$b, 25, 16, 1297);
    			attr_dev(li2, "class", "text-green-700");
    			add_location(li2, file$b, 26, 16, 1359);
    			add_location(ul0, file$b, 24, 12, 1230);
    			attr_dev(div1, "class", "text-left p-2");
    			add_location(div1, file$b, 23, 8, 1190);
    			attr_dev(div2, "class", "flex justify-center ");
    			add_location(div2, file$b, 21, 4, 1078);
    			attr_dev(h31, "class", "p-2 font-Display font-bold");
    			add_location(h31, file$b, 30, 8, 1486);
    			attr_dev(li3, "class", "text-blue-500");
    			add_location(li3, file$b, 32, 16, 1601);
    			attr_dev(li4, "class", "text-red-400");
    			add_location(li4, file$b, 33, 16, 1665);
    			add_location(ul1, file$b, 32, 12, 1597);
    			attr_dev(div3, "class", "text-left p-2");
    			add_location(div3, file$b, 31, 8, 1557);
    			attr_dev(div4, "class", "flex justify-center ");
    			add_location(div4, file$b, 29, 4, 1443);
    			attr_dev(h32, "class", "font-bold text-red-700 p-2");
    			add_location(h32, file$b, 37, 8, 1769);
    			attr_dev(div5, "class", "");
    			add_location(div5, file$b, 36, 4, 1746);
    			attr_dev(div6, "class", "bg-gray-100 p-5 md:w-2/3 m-auto");
    			add_location(div6, file$b, 20, 0, 1028);
    			attr_dev(section, "id", "Courses");
    			attr_dev(section, "class", "text-center mt-24 mb-16 w-screen overflow-hidden");
    			add_location(section, file$b, 7, 0, 129);
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
    			append_dev(section, div6);
    			append_dev(div6, div2);
    			append_dev(div2, h30);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(div6, t11);
    			append_dev(div6, div4);
    			append_dev(div4, h31);
    			append_dev(div4, t13);
    			append_dev(div4, div3);
    			append_dev(div3, ul1);
    			append_dev(ul1, li3);
    			append_dev(ul1, t15);
    			append_dev(ul1, li4);
    			append_dev(div6, t17);
    			append_dev(div6, div5);
    			append_dev(div5, h32);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CourseSection",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/footer/Footer.svelte generated by Svelte v3.38.2 */

    const file$a = "src/components/footer/Footer.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let h30;
    	let t2;
    	let h31;
    	let t3;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h30 = element("h3");
    			h30.textContent = `© Edustar Fastrack IELTS Coaching center ${/*dt*/ ctx[0]}`;
    			t2 = space();
    			h31 = element("h3");
    			t3 = text("Powered by ");
    			a = element("a");
    			a.textContent = "Infyplus Innovations";
    			attr_dev(h30, "class", "font-display font-bold text-white p-3");
    			add_location(h30, file$a, 4, 4, 122);
    			attr_dev(a, "href", "https://infyplus.tech");
    			attr_dev(a, "class", "font-bold");
    			add_location(a, file$a, 5, 52, 281);
    			attr_dev(h31, "class", "font-body text-white p-3");
    			add_location(h31, file$a, 5, 4, 233);
    			attr_dev(section, "id", "Footer");
    			attr_dev(section, "class", "bg-purple-700 p-5 text-center");
    			add_location(section, file$a, 3, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h30);
    			append_dev(section, t2);
    			append_dev(section, h31);
    			append_dev(h31, t3);
    			append_dev(h31, a);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/shared/Branding.svelte generated by Svelte v3.38.2 */

    const file$9 = "src/shared/Branding.svelte";

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
    			add_location(img, file$9, 1, 4, 35);
    			add_location(h3, file$9, 2, 4, 80);
    			attr_dev(div, "class", "inline-block p-5");
    			add_location(div, file$9, 0, 0, 0);
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

    const file$8 = "src/shared/Navlinks.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:4) {#each navlinks as navlink(navlink.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let a;
    	let t_value = /*navlink*/ ctx[1].name + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*navlink*/ ctx[1].section);
    			attr_dev(a, "class", "hover:text-purple-700 no-underline");
    			add_location(a, file$8, 13, 28, 447);
    			attr_dev(li, "class", "p-5 text-xl");
    			add_location(li, file$8, 13, 4, 423);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
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

    			attr_dev(ul, "class", "flex flex-col md:flex-row");
    			add_location(ul, file$8, 11, 4, 336);
    			attr_dev(nav, "class", "md:inline-block hidden ");
    			add_location(nav, file$8, 10, 0, 294);
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
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$1, null, get_each_context$1);
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
    			section: "#ContactUs"
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
    const file$7 = "src/shared/Navbar.svelte";

    function create_fragment$7(ctx) {
    	let div4;
    	let div2;
    	let h3;
    	let div0;
    	let i;
    	let t0;
    	let div1;
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
    			div1.textContent = "+91 12345667890";
    			t2 = space();
    			div3 = element("div");
    			create_component(branding.$$.fragment);
    			t3 = space();
    			create_component(navlinks.$$.fragment);
    			attr_dev(i, "class", "fas fa-phone ");
    			add_location(i, file$7, 8, 48, 297);
    			attr_dev(div0, "class", "inline bg-blue-500 p-3");
    			add_location(div0, file$7, 8, 11, 260);
    			attr_dev(div1, "class", "inline-block p-2");
    			add_location(div1, file$7, 9, 12, 345);
    			attr_dev(h3, "class", "bg-red-500 inline-block text-white m-2");
    			add_location(h3, file$7, 7, 8, 197);
    			attr_dev(div2, "class", "flex justify-end");
    			add_location(div2, file$7, 6, 4, 158);
    			attr_dev(div3, "class", "flex flex-col md:flex-row items-center md:justify-between ");
    			add_location(div3, file$7, 12, 4, 427);
    			attr_dev(div4, "class", "fixed w-full bg-purple-100 z-10");
    			add_location(div4, file$7, 5, 0, 108);
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

    const file$6 = "src/components/Header/heroImgs.svelte";

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
    			add_location(img, file$6, 15, 4, 840);
    			attr_dev(path, "fill", "#0F62FE");
    			attr_dev(path, "d", "M43,-59.8C49.4,-54.4,44,-33.5,46.7,-17.1C49.5,-0.7,60.3,11.2,59.9,21.6C59.5,32,47.9,40.9,36,53.4C24.1,65.8,12.1,81.8,-2.9,85.7C-17.8,89.7,-35.6,81.6,-47.5,69.2C-59.4,56.8,-65.3,40,-69.7,23.4C-74.1,6.8,-76.9,-9.5,-73.8,-25.5C-70.7,-41.5,-61.8,-57.2,-48.6,-60.3C-35.3,-63.4,-17.6,-53.9,0.3,-54.3C18.3,-54.8,36.5,-65.1,43,-59.8Z");
    			attr_dev(path, "transform", "translate(100 100)");
    			add_location(path, file$6, 17, 4, 970);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 16, 0, 903);
    			attr_dev(div, "class", "absolute w-96 md:w-72 lg:w-96  bottom-36 md:right-2  hidden  md:block");
    			add_location(div, file$6, 14, 0, 752);
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
    			attr_dev(img, "class", "absolute");
    			add_location(img, file$6, 7, 8, 191);
    			attr_dev(path, "fill", "#ff784e");
    			attr_dev(path, "d", "M33.8,-45.7C46.3,-37.4,60.8,-30.9,64.8,-20.6C68.8,-10.2,62.4,4,58.1,19.4C53.8,34.8,51.7,51.5,42.3,58.8C33,66.1,16.5,64.1,-1.3,65.9C-19.1,67.6,-38.1,73.2,-46.9,65.7C-55.7,58.2,-54.1,37.6,-57.3,20.4C-60.4,3.2,-68.1,-10.7,-66.2,-23.1C-64.4,-35.5,-53,-46.3,-40.3,-54.6C-27.7,-62.9,-13.8,-68.6,-1.6,-66.4C10.6,-64.2,21.2,-54,33.8,-45.7Z");
    			attr_dev(path, "transform", "translate(100 100)");
    			add_location(path, file$6, 9, 8, 320);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 8, 4, 249);
    			attr_dev(div0, "class", "absolute w-96  md:w-72 lg:w-96   md:bottom-36 md:left-2");
    			add_location(div0, file$6, 6, 4, 113);
    			attr_dev(div1, "class", "flex  md:block justify-center");
    			add_location(div1, file$6, 5, 0, 65);
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
    const file$5 = "src/components/Header/HeroSection.svelte";

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
    function create_default_slot_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut temporibus recusandae, incidunt mollitia qui quos obcaecati cumque. Maiores, reprehenderit provident?";
    			attr_dev(p, "class", "w-3/4 md:w-2/3 hidden md:block");
    			add_location(p, file$5, 15, 8, 602);
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
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(15:4) <Subtext>",
    		ctx
    	});

    	return block;
    }

    // (19:4) <Button type="primary" rounded={true}>
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
    		source: "(19:4) <Button type=\\\"primary\\\" rounded={true}>",
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
    	let a;
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
    				$$slots: { default: [create_default_slot_1$1] },
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
    			a = element("a");
    			create_component(button.$$.fragment);
    			t4 = space();
    			create_component(heroimgs0.$$.fragment);
    			t5 = space();
    			create_component(heroimgs1.$$.fragment);
    			attr_dev(h1, "class", "text-4xl md:text-5xl lg:text-6xl p-5 font-Display");
    			add_location(h1, file$5, 11, 4, 442);
    			attr_dev(a, "href", "#ContactUs");
    			add_location(a, file$5, 17, 0, 826);
    			attr_dev(div0, "class", "md:w-1/2");
    			add_location(div0, file$5, 9, 4, 362);
    			attr_dev(div1, "class", "text-center flex flex-col justify-center items-center h-full py-48 pt-56 md:pb-36 mb-48 md:mb-0 relative");
    			add_location(div1, file$5, 8, 0, 239);
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
    const file$4 = "src/components/Header/Header.svelte";

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
    			attr_dev(section, "class", "w-screen overflow-hidden relative");
    			attr_dev(section, "id", "Home");
    			add_location(section, file$4, 5, 0, 125);
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
    const file$3 = "src/components/testimonials/TestmContent.svelte";

    // (8:4) <Subtext>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
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
    			add_location(h3, file$3, 6, 4, 210);
    			if (img.src !== (img_src_value = "/img/" + /*Testimonial*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*Testimonial*/ ctx[0].img);
    			attr_dev(img, "class", "w-24 rounded-full");
    			add_location(img, file$3, 9, 8, 303);
    			add_location(h4, file$3, 11, 12, 423);
    			add_location(p, file$3, 12, 12, 463);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$3, 10, 8, 396);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$3, 8, 4, 280);
    			attr_dev(div2, "class", "p-5 w-full md:w-1/2 lg:w-2/5");
    			add_location(div2, file$3, 5, 0, 140);
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
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*Testimonial*/ 1) && t0_value !== (t0_value = /*Testimonial*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			const subtext_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				subtext_changes.$$scope = { dirty, ctx };
    			}

    			subtext.$set(subtext_changes);

    			if (!current || dirty & /*Testimonial*/ 1 && img.src !== (img_src_value = "/img/" + /*Testimonial*/ ctx[0].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*Testimonial*/ 1 && img_alt_value !== (img_alt_value = /*Testimonial*/ ctx[0].img)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty & /*Testimonial*/ 1) && t4_value !== (t4_value = /*Testimonial*/ ctx[0].name + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*Testimonial*/ 1) && t6_value !== (t6_value = /*Testimonial*/ ctx[0].designation + "")) set_data_dev(t6, t6_value);
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

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtext.$$.fragment, local);

    			if (local) {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    				div2_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(subtext);
    			if (detaching && div2_transition) div2_transition.end();
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
    	let { Testimonial } = $$props;
    	const writable_props = ["Testimonial"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestmContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("Testimonial" in $$props) $$invalidate(0, Testimonial = $$props.Testimonial);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Subtext, fade, slide, Testimonial });

    	$$self.$inject_state = $$props => {
    		if ("Testimonial" in $$props) $$invalidate(0, Testimonial = $$props.Testimonial);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Testimonial, slots, $$scope];
    }

    class TestmContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { Testimonial: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestmContent",
    			options,
    			id: create_fragment$3.name
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
    const file$2 = "src/components/testimonials/TestmNav.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(i0, file$2, 11, 7, 349);
    			attr_dev(div0, "class", "pointer bg-blue-500 px-2 p-1 m-3 text-white inline");
    			add_location(div0, file$2, 9, 4, 228);
    			attr_dev(i1, "class", "fas fa-arrow-right");
    			add_location(i1, file$2, 15, 7, 547);
    			attr_dev(div1, "class", "pointer bg-blue-500 px-2 p-1 m-3 text-white inline");
    			add_location(div1, file$2, 13, 4, 425);
    			attr_dev(div2, "class", "flex flex-nowrap h-16 my-2 items-center justify-center");
    			add_location(div2, file$2, 8, 0, 155);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { currentItemNum: 0, maxItems: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestmNav",
    			options,
    			id: create_fragment$2.name
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
    const file$1 = "src/components/testimonials/Testimonials.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (108:8) <LargeHeading>
    function create_default_slot_1(ctx) {
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
    			add_location(i, file$1, 107, 37, 2892);
    			attr_dev(h2, "class", "text-left relative pt-10 pl-3");
    			add_location(h2, file$1, 107, 102, 2957);
    			attr_dev(div, "class", "");
    			add_location(div, file$1, 107, 23, 2878);
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
    		source: "(108:8) <LargeHeading>",
    		ctx
    	});

    	return block;
    }

    // (114:8) <TestmContent Testimonial={Testimonial}>
    function create_default_slot(ctx) {
    	let t_value = /*Testimonial*/ ctx[9].content + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*viewArray*/ 2 && t_value !== (t_value = /*Testimonial*/ ctx[9].content + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(114:8) <TestmContent Testimonial={Testimonial}>",
    		ctx
    	});

    	return block;
    }

    // (113:8) {#each viewArray as Testimonial(Testimonial.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let testmcontent;
    	let current;

    	testmcontent = new TestmContent({
    			props: {
    				Testimonial: /*Testimonial*/ ctx[9],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

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
    			if (dirty & /*viewArray*/ 2) testmcontent_changes.Testimonial = /*Testimonial*/ ctx[9];

    			if (dirty & /*$$scope, viewArray*/ 4098) {
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
    		source: "(113:8) {#each viewArray as Testimonial(Testimonial.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let largeheading;
    	let t0;
    	let testmnav;
    	let t1;
    	let div2;
    	let div1;
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
    	const get_key = ctx => /*Testimonial*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			create_component(largeheading.$$.fragment);
    			t0 = space();
    			create_component(testmnav.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex self-start  justify-between");
    			add_location(div0, file$1, 106, 4, 2808);
    			attr_dev(div1, "class", "flex flex-col md:flex-row justify-evenly items-center flex-wrap py-10");
    			add_location(div1, file$1, 111, 4, 3245);
    			attr_dev(div2, "class", "h-96 overflow-hidden");
    			add_location(div2, file$1, 110, 0, 3206);
    			attr_dev(div3, "class", "md:w-2/3");
    			add_location(div3, file$1, 105, 3, 2781);
    			attr_dev(section, "id", "Testimonials");
    			attr_dev(section, "class", "p-5 flex flex-col justify-center items-center my-24 w-screen overflow-hidden");
    			add_location(section, file$1, 104, 0, 2665);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			mount_component(largeheading, div0, null);
    			append_dev(div0, t0);
    			mount_component(testmnav, div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const largeheading_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				largeheading_changes.$$scope = { dirty, ctx };
    			}

    			largeheading.$set(largeheading_changes);
    			const testmnav_changes = {};
    			if (dirty & /*end*/ 1) testmnav_changes.currentItemNum = /*end*/ ctx[0];
    			testmnav.$set(testmnav_changes);

    			if (dirty & /*viewArray*/ 2) {
    				each_value = /*viewArray*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, null, get_each_context);
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

    	let Testimonials = [
    		{
    			id: 1,
    			title: "Life changing course!",
    			name: "Melbin CM",
    			designation: "Engineer,Google,California",
    			content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae.",
    			img: "Melbin.jpg"
    		},
    		{
    			id: 2,
    			title: "pwoli sanam m#$%#",
    			name: "Melbin CM",
    			designation: "Engineer,Google,California",
    			content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    			img: "Melbin.jpg"
    		},
    		{
    			id: 3,
    			title: "stupendous",
    			name: "Melbin CM",
    			designation: "Engineer,Google,California",
    			content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    			img: "Melbin.jpg"
    		},
    		{
    			id: 4,
    			title: "stupendous2",
    			name: "Melbin CM",
    			designation: "Engineer,Google,California",
    			content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    			img: "Melbin.jpg"
    		},
    		{
    			id: 5,
    			title: "stupendous3",
    			name: "Melbin CM",
    			designation: "Engineer,Google,California",
    			content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    			img: "Melbin.jpg"
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
    			$$invalidate(5, start = 0);
    			$$invalidate(0, end = numItems);
    			addViewItems(start, end);
    		} else if (end + numItems > maxItems) {
    			$$invalidate(0, end = maxItems);
    			$$invalidate(5, start = end - maxItems % numItems);
    			addViewItems(start, end);
    		} else {
    			$$invalidate(5, start += numItems);
    			$$invalidate(0, end = end + numItems);
    			addViewItems(start, end);
    		}
    	};

    	const handleLeftClick = () => {
    		if (end <= numItems) {
    			$$invalidate(0, end = maxItems);
    			$$invalidate(5, start = end - numItems);
    			addViewItems(start, end);
    		} else if (start - numItems < 0) {
    			$$invalidate(5, start = 0);
    			$$invalidate(0, end = numItems);
    			addViewItems(start, end);
    		} else {
    			$$invalidate(0, end -= numItems);
    			$$invalidate(5, start = start - numItems);
    			addViewItems(start, end);
    		}
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
    		handleLeftClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("Testimonials" in $$props) Testimonials = $$props.Testimonials;
    		if ("viewArray" in $$props) $$invalidate(1, viewArray = $$props.viewArray);
    		if ("numItems" in $$props) numItems = $$props.numItems;
    		if ("maxItems" in $$props) $$invalidate(2, maxItems = $$props.maxItems);
    		if ("start" in $$props) $$invalidate(5, start = $$props.start);
    		if ("end" in $$props) $$invalidate(0, end = $$props.end);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*start, end*/ 33) ;
    	};
    	return [end, viewArray, maxItems, handleRightClick, handleLeftClick, start];
    }

    class Testimonials_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonials_1",
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
    	let contactus;
    	let t4;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	coursesection = new CourseSection({ $$inline: true });
    	aboutus = new AboutUs({ $$inline: true });
    	testimonials = new Testimonials_1({ $$inline: true });
    	contactus = new ContactUs({ $$inline: true });
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
    			create_component(contactus.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file, 13, 0, 405);
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
    			mount_component(contactus, main, null);
    			append_dev(main, t4);
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
    			transition_in(contactus.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(coursesection.$$.fragment, local);
    			transition_out(aboutus.$$.fragment, local);
    			transition_out(testimonials.$$.fragment, local);
    			transition_out(contactus.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(coursesection);
    			destroy_component(aboutus);
    			destroy_component(testimonials);
    			destroy_component(contactus);
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
    		Header,
    		Testimonials: Testimonials_1
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
