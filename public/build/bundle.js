
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function to_number(value) {
        return value === '' ? null : +value;
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
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

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
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

    const fretNotes = [
        [getFrets("F")],
        [getFrets("C")],
        [getFrets("G#/Ab")],
        [getFrets("D#/Eb")],
        [getFrets("A#/Bb")],
        [getFrets("F")]
    ];

    const uiState = writable({
        xCordinate: 0,
        yCordinate: 0,
        timing: 5,
        modalIsVisible: false,
        isOptionsModalVisible: false,
        isInfoModalVisible: false
    });
    const selectedNotes = writable([]);
    const quizNotes = writable([]);
    const notes = readable(fretNotes);

    /************ FUNCTIONS ***********/
    function getFrets(singleNote) {
        const noteArray = [
            "C",
            "C#/Db",
            "D",
            "D#/Eb",
            "E",
            "F",
            "F#/Gb",
            "G",
            "G#/Ab",
            "A",
            "A#/Bb",
            "B"
        ];

        const noteIndex = noteArray.findIndex(note => note == singleNote);
        const newNoteArray = [
            ...noteArray.slice(noteIndex, noteArray.length),
            ...noteArray.slice(0, noteIndex)
        ];

        return newNoteArray;
    }

    const Game = (function() {
        let correct;
        let wrong;
        let inTime;
        let notInTime;

        const publicAPI = {
            initiliazeGame,
            getGameStats,
            getCorrectCount,
            getWrongCount,
            countCorrect,
            countWrong,
            resetGame
        };

        return publicAPI;

        /****************/
        function initiliazeGame() {
            correct = 0;
            wrong = 0;
            inTime = 0;
            notInTime = 0;
        }

        function getGameStats() {
            return {correct, wrong, inTime, notInTime}
        }

        function getCorrectCount() {
            return correct;
        }

        function getWrongCount() {
            return wrong;
        }

        function countCorrect(inTime) {
            correct += 1;
            countInTimeStat(inTime);
        }

        function countWrong() {
            wrong += 1;
            countInTimeStat(inTime);
        }

        function countInTimeStat(wasInTime) {
            wasInTime ? inTime += 1 : notInTime += 1;
        }

        function resetGame() {
            correct = 0;
            wrong = 0;
            inTime = 0;
            notInTime = 0;
        }
    })();

    function createNoteId(string, note) {
        return `${string}_${note}`;
    }

    function countFretsUp(currentFret, numberOfFretSteps) {
        return currentFret + numberOfFretSteps;
    }

    /**
     * Check if the user put in the correct note.
     * @param {string} key
     * @param {number} keyCode
     * @param {boolean} shiftKey
     * @param {string} searchedNote
     * @return {boolean}
     */
    function evaluateKeyInput(key, keyCode, shiftKey, searchedNote) {
      let keyInput = '';

      if(shiftKey && keyCode !== 17) {
        keyInput = getAccidentalStrings(key);
      } else if (keyCode !== 17) {
        keyInput = key.toUpperCase();
      }

      if (keyInput.length === 2) {
        const guessType1 = checkCorrectKeydown(keyInput[0], searchedNote);
        const guessType2 = checkCorrectKeydown(keyInput[1], searchedNote);

        return guessType1 || guessType2;
      }

      return checkCorrectKeydown(keyInput, searchedNote);
    }

    /**
     * Get the currently searched note and return whether the keyinput was correct.
     * @param {string} key
     * @param {string} searchedNote
     * @return {boolean}
     */
    function checkCorrectKeydown(key, searchedNote) {
      return searchedNote.includes(key);
    }


    /**
     * Returns the two possible strings with additional accidental
     * @param {string} key
     * @returns {Array}
     */
    function getAccidentalStrings(key) {
      const fromSharp =  `${key.toUpperCase()}#/${getCorrespondingFlat(key)}b`;
      const fromFlat = `${getCorrespondingSharp(key)}#/${key.toUpperCase()}b`;

      return [fromSharp, fromFlat]
    }

    /**
     * Checks if key input is a key that contains a note
     * @param {string} key
     * @return {boolean}
     */
    function isNoteKey(key) {
      return "CDEFGAB".includes(key.toUpperCase());
    }

    /**
     *
     * @param {string} key
     */
    function getCorrespondingFlat(key) {
      switch (key.toUpperCase()) {
        case 'C':
          return 'D';
        case 'D':
          return 'E';
        case 'F':
          return 'G';
        case 'G':
          return 'A';
        case 'A':
          return 'B';
      }
    }

    /**
     *
     * @param {string} key
     */
    function getCorrespondingSharp(key) {
      switch (key.toUpperCase()) {
        case 'D':
          return 'C';
        case 'E':
          return 'D';
        case 'G':
          return 'F';
        case 'A':
          return 'G';
        case 'B':
          return 'A';
      }
    }

    /* src/components/Note.svelte generated by Svelte v3.31.2 */

    const file = "src/components/Note.svelte";

    function create_fragment(ctx) {
    	let div;
    	let p;
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(/*note*/ ctx[0]);
    			attr_dev(p, "class", "text-xl svelte-1jvclyo");
    			toggle_class(p, "hidden", !/*visible*/ ctx[5]);
    			add_location(p, file, 18, 4, 341);
    			attr_dev(div, "class", div_class_value = "" + (/*bgColor*/ ctx[1] + " note pointer" + " svelte-1jvclyo"));
    			toggle_class(div, "quizNote", /*isQuizNote*/ ctx[2]);
    			add_location(div, file, 12, 0, 201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div,
    						"click",
    						function () {
    							if (is_function(/*handleClick*/ ctx[3])) /*handleClick*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"mousedown",
    						function () {
    							if (is_function(/*handleMouseDown*/ ctx[4])) /*handleMouseDown*/ ctx[4].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*note*/ 1) set_data_dev(t, /*note*/ ctx[0]);

    			if (dirty & /*visible*/ 32) {
    				toggle_class(p, "hidden", !/*visible*/ ctx[5]);
    			}

    			if (dirty & /*bgColor*/ 2 && div_class_value !== (div_class_value = "" + (/*bgColor*/ ctx[1] + " note pointer" + " svelte-1jvclyo"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*bgColor, isQuizNote*/ 6) {
    				toggle_class(div, "quizNote", /*isQuizNote*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Note", slots, []);
    	let { noteId } = $$props;
    	let { note } = $$props;
    	let { bgColor } = $$props;
    	let { isQuizNote } = $$props;
    	let { handleClick } = $$props;
    	let { handleMouseDown } = $$props;
    	let { visible } = $$props;

    	const writable_props = [
    		"noteId",
    		"note",
    		"bgColor",
    		"isQuizNote",
    		"handleClick",
    		"handleMouseDown",
    		"visible"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Note> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("noteId" in $$props) $$invalidate(6, noteId = $$props.noteId);
    		if ("note" in $$props) $$invalidate(0, note = $$props.note);
    		if ("bgColor" in $$props) $$invalidate(1, bgColor = $$props.bgColor);
    		if ("isQuizNote" in $$props) $$invalidate(2, isQuizNote = $$props.isQuizNote);
    		if ("handleClick" in $$props) $$invalidate(3, handleClick = $$props.handleClick);
    		if ("handleMouseDown" in $$props) $$invalidate(4, handleMouseDown = $$props.handleMouseDown);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		noteId,
    		note,
    		bgColor,
    		isQuizNote,
    		handleClick,
    		handleMouseDown,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ("noteId" in $$props) $$invalidate(6, noteId = $$props.noteId);
    		if ("note" in $$props) $$invalidate(0, note = $$props.note);
    		if ("bgColor" in $$props) $$invalidate(1, bgColor = $$props.bgColor);
    		if ("isQuizNote" in $$props) $$invalidate(2, isQuizNote = $$props.isQuizNote);
    		if ("handleClick" in $$props) $$invalidate(3, handleClick = $$props.handleClick);
    		if ("handleMouseDown" in $$props) $$invalidate(4, handleMouseDown = $$props.handleMouseDown);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [note, bgColor, isQuizNote, handleClick, handleMouseDown, visible, noteId];
    }

    class Note extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			noteId: 6,
    			note: 0,
    			bgColor: 1,
    			isQuizNote: 2,
    			handleClick: 3,
    			handleMouseDown: 4,
    			visible: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Note",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*noteId*/ ctx[6] === undefined && !("noteId" in props)) {
    			console.warn("<Note> was created without expected prop 'noteId'");
    		}

    		if (/*note*/ ctx[0] === undefined && !("note" in props)) {
    			console.warn("<Note> was created without expected prop 'note'");
    		}

    		if (/*bgColor*/ ctx[1] === undefined && !("bgColor" in props)) {
    			console.warn("<Note> was created without expected prop 'bgColor'");
    		}

    		if (/*isQuizNote*/ ctx[2] === undefined && !("isQuizNote" in props)) {
    			console.warn("<Note> was created without expected prop 'isQuizNote'");
    		}

    		if (/*handleClick*/ ctx[3] === undefined && !("handleClick" in props)) {
    			console.warn("<Note> was created without expected prop 'handleClick'");
    		}

    		if (/*handleMouseDown*/ ctx[4] === undefined && !("handleMouseDown" in props)) {
    			console.warn("<Note> was created without expected prop 'handleMouseDown'");
    		}

    		if (/*visible*/ ctx[5] === undefined && !("visible" in props)) {
    			console.warn("<Note> was created without expected prop 'visible'");
    		}
    	}

    	get noteId() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noteId(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get note() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set note(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isQuizNote() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isQuizNote(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClick() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClick(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleMouseDown() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleMouseDown(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const fretboard = get_store_value(notes);

    function getSameNoteStringLowerBandG(position) {
        const stringNumber = position.string + 1;
        return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsUp(position.fret, 4)));
    }

    /********* HELPERS */
    function getNoteToSearch(stringNumber, newFret) {
        return fretboard[stringNumber][0][newFret];
    }

    const FretboardNavigation = (function() {

        const publicAPI = {
            getQuestionPosition
        };

        return publicAPI;

        /******* LOGIC */
        function getQuestionPosition() {
            const position = {string: this.string, fret: this.fret};

            let searchNoteId;
            let question;

            switch (this.string) {
                case 1:
                    searchNoteId = getSameNoteStringLowerBandG(position);
                    question = createQuestion("same", getStringNote(1));
                    break;
            }

            console.log(question);
            console.log("Search the note: ", searchNoteId);
        }
    })();


    /********** HELPER FUNCTIONS */
    function getStringNote(string) {
        switch (string) {
            case 0:
                return "High-E";
            case 1:
                return "B";
            case 2:
                return "G";
            case 3:
                return "D";
            case 4: 
                return "A";
            case 5: 
                return "Low-E"
        }
    }

    function createQuestion(noteLevel , string) {
        return `Get the ${noteLevel} on the ${string} string`;
    }

    /* src/components/NoteGrid.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/components/NoteGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (46:4) {#each noteGradiation.notes[0] as note, j }
    function create_each_block_1(ctx) {
    	let note;
    	let current;

    	function func() {
    		return /*func*/ ctx[5](/*i*/ ctx[12], /*note*/ ctx[13]);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[6](/*i*/ ctx[12], /*note*/ ctx[13], ...args);
    	}

    	function func_2(...args) {
    		return /*func_2*/ ctx[7](/*i*/ ctx[12], /*note*/ ctx[13], ...args);
    	}

    	function func_3() {
    		return /*func_3*/ ctx[8](/*i*/ ctx[12], /*note*/ ctx[13], /*j*/ ctx[15]);
    	}

    	note = new Note({
    			props: {
    				noteId: func,
    				visible: /*$selectedNotes*/ ctx[1].find(func_1),
    				isQuizNote: /*$quizNotes*/ ctx[2].find(func_2),
    				note: /*note*/ ctx[13],
    				bgColor: /*noteGradiation*/ ctx[10].gradiation,
    				handleClick: func_3,
    				handleMouseDown: /*func_4*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(note.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(note, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const note_changes = {};
    			if (dirty & /*noteGradiations*/ 1) note_changes.noteId = func;
    			if (dirty & /*$selectedNotes, noteGradiations*/ 3) note_changes.visible = /*$selectedNotes*/ ctx[1].find(func_1);
    			if (dirty & /*$quizNotes, noteGradiations*/ 5) note_changes.isQuizNote = /*$quizNotes*/ ctx[2].find(func_2);
    			if (dirty & /*noteGradiations*/ 1) note_changes.note = /*note*/ ctx[13];
    			if (dirty & /*noteGradiations*/ 1) note_changes.bgColor = /*noteGradiation*/ ctx[10].gradiation;
    			if (dirty & /*noteGradiations*/ 1) note_changes.handleClick = func_3;
    			note.$set(note_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(note.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(note.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(note, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(46:4) {#each noteGradiation.notes[0] as note, j }",
    		ctx
    	});

    	return block;
    }

    // (44:0) {#each noteGradiations as noteGradiation, i }
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value_1 = /*noteGradiation*/ ctx[10].notes[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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

    			t = space();
    			attr_dev(div, "class", "note-grid mt-4 svelte-kmn9mo");
    			add_location(div, file$1, 44, 4, 1200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*createNoteId, noteGradiations, $selectedNotes, $quizNotes, addNoteToSelected, getMouseCoordinates*/ 31) {
    				each_value_1 = /*noteGradiation*/ ctx[10].notes[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(44:0) {#each noteGradiations as noteGradiation, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*noteGradiations*/ ctx[0];
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*noteGradiations, createNoteId, $selectedNotes, $quizNotes, addNoteToSelected, getMouseCoordinates*/ 31) {
    				each_value = /*noteGradiations*/ ctx[0];
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
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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
    	let $selectedNotes;
    	let $quizNotes;
    	validate_store(selectedNotes, "selectedNotes");
    	component_subscribe($$self, selectedNotes, $$value => $$invalidate(1, $selectedNotes = $$value));
    	validate_store(quizNotes, "quizNotes");
    	component_subscribe($$self, quizNotes, $$value => $$invalidate(2, $quizNotes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NoteGrid", slots, []);
    	let { noteGradiations } = $$props;

    	/************ FUNCTIONS ************/
    	function addNoteToSelected(stringNumber, note, fretNumber) {
    		FretboardNavigation.getQuestionPosition.call({ string: stringNumber, fret: fretNumber });
    		const newNote = createNoteId(stringNumber, note);
    		selectedNotes.update(selectedNotes => [...selectedNotes, newNote]);

    		uiState.update(uiState => {
    			return { ...uiState, modalIsVisible: true };
    		});
    	}

    	function getMouseCoordinates(event) {
    		uiState.update(uiState => {
    			return {
    				...uiState,
    				xCordinate: event.clientX,
    				yCordinate: event.clientY
    			};
    		});
    	}

    	const writable_props = ["noteGradiations"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NoteGrid> was created with unknown prop '${key}'`);
    	});

    	const func = (i, note) => createNoteId(i, note);
    	const func_1 = (i, note, songId) => songId == createNoteId(i, note);
    	const func_2 = (i, note, songId) => songId == createNoteId(i, note);
    	const func_3 = (i, note, j) => addNoteToSelected(i, note, j);
    	const func_4 = e => getMouseCoordinates(e);

    	$$self.$$set = $$props => {
    		if ("noteGradiations" in $$props) $$invalidate(0, noteGradiations = $$props.noteGradiations);
    	};

    	$$self.$capture_state = () => ({
    		Note,
    		createNoteId,
    		FretboardNavigation,
    		selectedNotes,
    		quizNotes,
    		uiState,
    		noteGradiations,
    		addNoteToSelected,
    		getMouseCoordinates,
    		$selectedNotes,
    		$quizNotes
    	});

    	$$self.$inject_state = $$props => {
    		if ("noteGradiations" in $$props) $$invalidate(0, noteGradiations = $$props.noteGradiations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		noteGradiations,
    		$selectedNotes,
    		$quizNotes,
    		addNoteToSelected,
    		getMouseCoordinates,
    		func,
    		func_1,
    		func_2,
    		func_3,
    		func_4
    	];
    }

    class NoteGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { noteGradiations: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoteGrid",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*noteGradiations*/ ctx[0] === undefined && !("noteGradiations" in props)) {
    			console.warn("<NoteGrid> was created without expected prop 'noteGradiations'");
    		}
    	}

    	get noteGradiations() {
    		throw new Error("<NoteGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noteGradiations(value) {
    		throw new Error("<NoteGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.31.2 */

    const file$2 = "src/components/Footer.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let h2;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;
    	let a0;
    	let t5;
    	let a1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "designed";
    			t1 = text("\n        & ");
    			span1 = element("span");
    			span1.textContent = "developed";
    			t3 = text(" by\n        ");
    			span2 = element("span");
    			a0 = element("a");
    			a0.textContent = "Adam Gniady";
    			t5 = text("\n        |\n        ");
    			a1 = element("a");
    			a1.textContent = "Impressum";
    			attr_dev(span0, "class", "font-serif");
    			add_location(span0, file$2, 2, 8, 125);
    			attr_dev(span1, "class", "font-mono");
    			add_location(span1, file$2, 3, 10, 176);
    			attr_dev(a0, "href", "https://github.com/webspaceadam");
    			attr_dev(a0, "target", "__blank");
    			add_location(a0, file$2, 5, 12, 266);
    			attr_dev(span2, "class", "font-black");
    			add_location(span2, file$2, 4, 8, 228);
    			attr_dev(a1, "href", "https://iamneuni.de/impressum");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$2, 8, 8, 375);
    			attr_dev(h2, "class", "text-green-700 mt-4");
    			add_location(h2, file$2, 1, 4, 84);
    			attr_dev(footer, "class", "absolute bottom-0 w-full h-28 flex justify-center items-center");
    			add_location(footer, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h2);
    			append_dev(h2, span0);
    			append_dev(h2, t1);
    			append_dev(h2, span1);
    			append_dev(h2, t3);
    			append_dev(h2, span2);
    			append_dev(span2, a0);
    			append_dev(h2, t5);
    			append_dev(h2, a1);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Checkbox.svelte generated by Svelte v3.31.2 */

    const file$3 = "src/components/Checkbox.svelte";

    function create_fragment$3(ctx) {
    	let label_1;
    	let div0;
    	let input;
    	let t0;
    	let svg;
    	let path;
    	let t1;
    	let div1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*label*/ ctx[1]);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "opacity-0 absolute cursor-pointer");
    			add_location(input, file$3, 7, 6, 295);
    			attr_dev(path, "d", "M0 11l2-2 5 5L18 3l2 2L7 18z");
    			add_location(path, file$3, 8, 119, 503);
    			attr_dev(svg, "class", "fill-current w-4 h-4 text-green-700 pointer-events-none");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			toggle_class(svg, "hidden", !/*checked*/ ctx[0]);
    			add_location(svg, file$3, 8, 6, 390);
    			attr_dev(div0, "class", "border-2 rounded border-green-700 w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500");
    			add_location(div0, file$3, 6, 4, 152);
    			attr_dev(div1, "class", "text-green-700 font-mono");
    			add_location(div1, file$3, 10, 4, 565);
    			attr_dev(label_1, "class", "mt-2 flex justify-start items-start");
    			attr_dev(label_1, "for", "time-constraint-control");
    			add_location(label_1, file$3, 5, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, div0);
    			append_dev(div0, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div0, t0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(label_1, t1);
    			append_dev(label_1, div1);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*checked*/ 1) {
    				toggle_class(svg, "hidden", !/*checked*/ ctx[0]);
    			}

    			if (dirty & /*label*/ 2) set_data_dev(t2, /*label*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			mounted = false;
    			dispose();
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
    	validate_slots("Checkbox", slots, []);
    	let { checked } = $$props;
    	let { label } = $$props;
    	const writable_props = ["checked", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({ checked, label });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, label, input_change_handler];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { checked: 0, label: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*checked*/ ctx[0] === undefined && !("checked" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'checked'");
    		}

    		if (/*label*/ ctx[1] === undefined && !("label" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'label'");
    		}
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/OptionsModal.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/components/OptionsModal.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "modal w-auto h-auto bg-white rounded-lg shadow-xl flex flex-col justify-center items-center p-4 svelte-mdzsui");
    			set_style(div, "margin-left", "-" + /*modalWidth*/ ctx[1] / 2 + "px");
    			set_style(div, "margin-top", "-" + /*modalWidth*/ ctx[1] / 2 + "px");
    			add_location(div, file$4, 23, 0, 380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[4](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*modalWidth*/ 2) {
    				set_style(div, "margin-left", "-" + /*modalWidth*/ ctx[1] / 2 + "px");
    			}

    			if (!current || dirty & /*modalWidth*/ 2) {
    				set_style(div, "margin-top", "-" + /*modalWidth*/ ctx[1] / 2 + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[4](null);
    			if (detaching && div_transition) div_transition.end();
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
    	validate_slots("OptionsModal", slots, ['default']);

    	onMount(() => {
    		$$invalidate(1, modalWidth = Modal.offsetWidth);
    		modalHeight = Modal.offsetHeight;
    	});

    	let Modal;
    	let modalWidth = 0;
    	let modalHeight = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OptionsModal> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			Modal = $$value;
    			$$invalidate(0, Modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		blur,
    		onMount,
    		Modal,
    		modalWidth,
    		modalHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ("Modal" in $$props) $$invalidate(0, Modal = $$props.Modal);
    		if ("modalWidth" in $$props) $$invalidate(1, modalWidth = $$props.modalWidth);
    		if ("modalHeight" in $$props) modalHeight = $$props.modalHeight;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Modal, modalWidth, $$scope, slots, div_binding];
    }

    class OptionsModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OptionsModal",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/components/Header.svelte";

    // (42:8) {#if withTimeConstraint}
    function create_if_block_2(ctx) {
    	let div;
    	let time_1;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			time_1 = element("time");
    			t0 = text(/*time*/ ctx[3]);
    			t1 = text(" Seconds");
    			attr_dev(time_1, "class", "font-black mr-2 svelte-17o5ddi");
    			toggle_class(time_1, "overTime", /*time*/ ctx[3] >= /*$uiState*/ ctx[4].timing);
    			add_location(time_1, file$5, 45, 10, 1111);
    			attr_dev(div, "class", "m-4 p-4 border-4 border-green-600 text-green-700 text-center rounded-full w-48");
    			add_location(div, file$5, 42, 8, 989);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, time_1);
    			append_dev(time_1, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*time*/ 8) set_data_dev(t0, /*time*/ ctx[3]);

    			if (dirty & /*time, $uiState*/ 24) {
    				toggle_class(time_1, "overTime", /*time*/ ctx[3] >= /*$uiState*/ ctx[4].timing);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(42:8) {#if withTimeConstraint}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if $uiState.isOptionsModalVisible}
    function create_if_block_1(ctx) {
    	let optionsmodal;
    	let current;

    	optionsmodal = new OptionsModal({
    			props: {
    				class: "w-96 h-96",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(optionsmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(optionsmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const optionsmodal_changes = {};

    			if (dirty & /*$$scope, $uiState, withTimeConstraint*/ 4113) {
    				optionsmodal_changes.$$scope = { dirty, ctx };
    			}

    			optionsmodal.$set(optionsmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(optionsmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(optionsmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(optionsmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(76:8) {#if $uiState.isOptionsModalVisible}",
    		ctx
    	});

    	return block;
    }

    // (77:12) <OptionsModal class="w-96 h-96">
    function create_default_slot_1(ctx) {
    	let h4;
    	let t1;
    	let div;
    	let checkbox;
    	let updating_checked;
    	let t2;
    	let label;
    	let t3;
    	let input;
    	let t4;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[8].call(null, value);
    	}

    	let checkbox_props = { label: "With time constraint?" };

    	if (/*withTimeConstraint*/ ctx[0] !== void 0) {
    		checkbox_props.checked = /*withTimeConstraint*/ ctx[0];
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Options";
    			t1 = space();
    			div = element("div");
    			create_component(checkbox.$$.fragment);
    			t2 = space();
    			label = element("label");
    			t3 = text("Timeroptions\n                        ");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Close";
    			attr_dev(h4, "class", "text-2xl text-green-700 font-black");
    			add_location(h4, file$5, 77, 16, 2205);
    			attr_dev(input, "class", "mt-2 border-2 rounded border-green-700 p-4 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500");
    			attr_dev(input, "type", "number");
    			add_location(input, file$5, 84, 24, 2604);
    			attr_dev(label, "class", "mt-2 text-left text-lg text-green-700 font-bold");
    			add_location(label, file$5, 82, 20, 2479);
    			attr_dev(div, "class", "flex flex-col justify-center");
    			add_location(div, file$5, 80, 16, 2319);
    			attr_dev(button, "class", "button");
    			add_location(button, file$5, 91, 16, 2962);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(checkbox, div, null);
    			append_dev(div, t2);
    			append_dev(div, label);
    			append_dev(label, t3);
    			append_dev(label, input);
    			set_input_value(input, /*$uiState*/ ctx[4].timing);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};

    			if (!updating_checked && dirty & /*withTimeConstraint*/ 1) {
    				updating_checked = true;
    				checkbox_changes.checked = /*withTimeConstraint*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);

    			if (dirty & /*$uiState*/ 16 && to_number(input.value) !== /*$uiState*/ ctx[4].timing) {
    				set_input_value(input, /*$uiState*/ ctx[4].timing);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(checkbox);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(77:12) <OptionsModal class=\\\"w-96 h-96\\\">",
    		ctx
    	});

    	return block;
    }

    // (106:8) {#if $uiState.isInfoModalVisible}
    function create_if_block(ctx) {
    	let optionsmodal;
    	let current;

    	optionsmodal = new OptionsModal({
    			props: {
    				class: "h-3/5",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(optionsmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(optionsmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const optionsmodal_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				optionsmodal_changes.$$scope = { dirty, ctx };
    			}

    			optionsmodal.$set(optionsmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(optionsmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(optionsmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(optionsmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(106:8) {#if $uiState.isInfoModalVisible}",
    		ctx
    	});

    	return block;
    }

    // (107:12) <OptionsModal class="h-3/5">
    function create_default_slot(ctx) {
    	let h4;
    	let t1;
    	let p;
    	let t2;
    	let strong;
    	let t4;
    	let t5;
    	let h5;
    	let t7;
    	let table;
    	let tr0;
    	let th0;
    	let t9;
    	let th1;
    	let t11;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let code0;
    	let t15;
    	let tr2;
    	let td2;
    	let t17;
    	let td3;
    	let code1;
    	let t19;
    	let tr3;
    	let td4;
    	let t21;
    	let td5;
    	let code2;
    	let t23;
    	let code3;
    	let t25;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Information";
    			t1 = space();
    			p = element("p");
    			t2 = text("This App is useable with your ");
    			strong = element("strong");
    			strong.textContent = "keyboard";
    			t4 = text("!");
    			t5 = space();
    			h5 = element("h5");
    			h5.textContent = "Keyboard Commands";
    			t7 = space();
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Command";
    			t9 = space();
    			th1 = element("th");
    			th1.textContent = "Key";
    			t11 = space();
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Get new random note";
    			t13 = space();
    			td1 = element("td");
    			code0 = element("code");
    			code0.textContent = "n";
    			t15 = space();
    			tr2 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Note without accidental";
    			t17 = space();
    			td3 = element("td");
    			code1 = element("code");
    			code1.textContent = "c, d, e, f, g, a, b";
    			t19 = space();
    			tr3 = element("tr");
    			td4 = element("td");
    			td4.textContent = "Note with accidental";
    			t21 = space();
    			td5 = element("td");
    			code2 = element("code");
    			code2.textContent = "Shift";
    			t23 = text("\n                            +\n                            ");
    			code3 = element("code");
    			code3.textContent = "c, d, e, f, g, a, b";
    			t25 = space();
    			button = element("button");
    			button.textContent = "Close";
    			attr_dev(h4, "class", "text-2xl text-green-700 font-black");
    			add_location(h4, file$5, 107, 16, 3461);
    			add_location(strong, file$5, 111, 50, 3633);
    			add_location(p, file$5, 110, 16, 3579);
    			attr_dev(h5, "class", "text-lg font-bold text-green-700 mt-4");
    			add_location(h5, file$5, 113, 16, 3697);
    			attr_dev(th0, "class", "p-4");
    			add_location(th0, file$5, 118, 24, 3915);
    			attr_dev(th1, "class", "p-4");
    			add_location(th1, file$5, 121, 24, 4022);
    			attr_dev(tr0, "class", "p-4");
    			add_location(tr0, file$5, 117, 20, 3874);
    			attr_dev(td0, "class", "p-4 border-2");
    			add_location(td0, file$5, 126, 24, 4176);
    			add_location(code0, file$5, 130, 28, 4358);
    			attr_dev(td1, "class", "p-4 border-2");
    			add_location(td1, file$5, 129, 24, 4304);
    			add_location(tr1, file$5, 125, 20, 4147);
    			attr_dev(td2, "class", "p-4 border-2");
    			add_location(td2, file$5, 134, 24, 4478);
    			add_location(code1, file$5, 138, 28, 4664);
    			attr_dev(td3, "class", "p-4 border-2");
    			add_location(td3, file$5, 137, 24, 4610);
    			add_location(tr2, file$5, 133, 20, 4449);
    			attr_dev(td4, "class", "p-4 border-2");
    			add_location(td4, file$5, 142, 24, 4802);
    			add_location(code2, file$5, 146, 28, 4985);
    			add_location(code3, file$5, 148, 28, 5062);
    			attr_dev(td5, "class", "p-4 border-2");
    			add_location(td5, file$5, 145, 24, 4931);
    			add_location(tr3, file$5, 141, 20, 4773);
    			attr_dev(table, "class", "border-2 mt-2");
    			add_location(table, file$5, 116, 16, 3824);
    			attr_dev(button, "class", "button");
    			add_location(button, file$5, 152, 16, 5192);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, strong);
    			append_dev(p, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t9);
    			append_dev(tr0, th1);
    			append_dev(table, t11);
    			append_dev(table, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, code0);
    			append_dev(table, t15);
    			append_dev(table, tr2);
    			append_dev(tr2, td2);
    			append_dev(tr2, t17);
    			append_dev(tr2, td3);
    			append_dev(td3, code1);
    			append_dev(table, t19);
    			append_dev(table, tr3);
    			append_dev(tr3, td4);
    			append_dev(tr3, t21);
    			append_dev(tr3, td5);
    			append_dev(td5, code2);
    			append_dev(td5, t23);
    			append_dev(td5, code3);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(table);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(107:12) <OptionsModal class=\\\"h-3/5\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let header;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let t5;
    	let button2;
    	let t7;
    	let button3;
    	let svg;
    	let path;
    	let t8;
    	let t9;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*withTimeConstraint*/ ctx[0] && create_if_block_2(ctx);
    	let if_block1 = /*$uiState*/ ctx[4].isOptionsModalVisible && create_if_block_1(ctx);
    	let if_block2 = /*$uiState*/ ctx[4].isInfoModalVisible && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Reset";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Show Random Note";
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Options";
    			t7 = space();
    			button3 = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(img, "class", "self-center mr-2");
    			attr_dev(img, "width", "100");
    			if (img.src !== (img_src_value = "assets/sveltuirLogo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Sveltuir Logo");
    			add_location(img, file$5, 24, 8, 539);
    			attr_dev(div0, "class", "flex justify-center p-2");
    			add_location(div0, file$5, 23, 4, 493);
    			attr_dev(button0, "class", "button");
    			add_location(button0, file$5, 28, 8, 704);
    			attr_dev(button1, "class", "button");
    			add_location(button1, file$5, 34, 8, 806);
    			attr_dev(button2, "class", "button");
    			add_location(button2, file$5, 49, 8, 1242);
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$5, 71, 16, 1879);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$5, 70, 12, 1766);
    			attr_dev(button3, "class", "text-green-700");
    			add_location(button3, file$5, 61, 8, 1509);
    			attr_dev(div1, "class", "max-h-24 flex justify-center");
    			add_location(div1, file$5, 27, 4, 653);
    			attr_dev(header, "class", "pt-8  text-center flex justify-center items-center");
    			add_location(header, file$5, 22, 0, 421);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, img);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t2);
    			append_dev(div1, button1);
    			append_dev(div1, t4);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, button2);
    			append_dev(div1, t7);
    			append_dev(div1, button3);
    			append_dev(button3, svg);
    			append_dev(svg, path);
    			append_dev(div1, t8);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t9);
    			if (if_block2) if_block2.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*resetGame*/ ctx[1])) /*resetGame*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*startRandomNoteQuiz*/ ctx[2])) /*startRandomNoteQuiz*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button2, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button3, "click", /*click_handler_1*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*withTimeConstraint*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$uiState*/ ctx[4].isOptionsModalVisible) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$uiState*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t9);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$uiState*/ ctx[4].isInfoModalVisible) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$uiState*/ 16) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
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
    	let $uiState;
    	validate_store(uiState, "uiState");
    	component_subscribe($$self, uiState, $$value => $$invalidate(4, $uiState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { resetGame } = $$props;
    	let { startRandomNoteQuiz } = $$props;
    	let { time } = $$props;
    	let { withTimeConstraint = true } = $$props;
    	let { fretboardNavigationQuestions = false } = $$props;

    	const writable_props = [
    		"resetGame",
    		"startRandomNoteQuiz",
    		"time",
    		"withTimeConstraint",
    		"fretboardNavigationQuestions"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => uiState.update(uiState => {
    		return { ...uiState, isOptionsModalVisible: true };
    	});

    	const click_handler_1 = () => uiState.update(uiState => {
    		return { ...uiState, isInfoModalVisible: true };
    	});

    	function checkbox_checked_binding(value) {
    		withTimeConstraint = value;
    		$$invalidate(0, withTimeConstraint);
    	}

    	function input_input_handler() {
    		$uiState.timing = to_number(this.value);
    		uiState.set($uiState);
    	}

    	const click_handler_2 = () => uiState.update(uiState => {
    		return { ...uiState, isOptionsModalVisible: false };
    	});

    	const click_handler_3 = () => uiState.update(uiState => {
    		return { ...uiState, isInfoModalVisible: false };
    	});

    	$$self.$$set = $$props => {
    		if ("resetGame" in $$props) $$invalidate(1, resetGame = $$props.resetGame);
    		if ("startRandomNoteQuiz" in $$props) $$invalidate(2, startRandomNoteQuiz = $$props.startRandomNoteQuiz);
    		if ("time" in $$props) $$invalidate(3, time = $$props.time);
    		if ("withTimeConstraint" in $$props) $$invalidate(0, withTimeConstraint = $$props.withTimeConstraint);
    		if ("fretboardNavigationQuestions" in $$props) $$invalidate(5, fretboardNavigationQuestions = $$props.fretboardNavigationQuestions);
    	};

    	$$self.$capture_state = () => ({
    		uiState,
    		Checkbox,
    		OptionsModal,
    		resetGame,
    		startRandomNoteQuiz,
    		time,
    		withTimeConstraint,
    		fretboardNavigationQuestions,
    		$uiState
    	});

    	$$self.$inject_state = $$props => {
    		if ("resetGame" in $$props) $$invalidate(1, resetGame = $$props.resetGame);
    		if ("startRandomNoteQuiz" in $$props) $$invalidate(2, startRandomNoteQuiz = $$props.startRandomNoteQuiz);
    		if ("time" in $$props) $$invalidate(3, time = $$props.time);
    		if ("withTimeConstraint" in $$props) $$invalidate(0, withTimeConstraint = $$props.withTimeConstraint);
    		if ("fretboardNavigationQuestions" in $$props) $$invalidate(5, fretboardNavigationQuestions = $$props.fretboardNavigationQuestions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		withTimeConstraint,
    		resetGame,
    		startRandomNoteQuiz,
    		time,
    		$uiState,
    		fretboardNavigationQuestions,
    		click_handler,
    		click_handler_1,
    		checkbox_checked_binding,
    		input_input_handler,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			resetGame: 1,
    			startRandomNoteQuiz: 2,
    			time: 3,
    			withTimeConstraint: 0,
    			fretboardNavigationQuestions: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*resetGame*/ ctx[1] === undefined && !("resetGame" in props)) {
    			console.warn("<Header> was created without expected prop 'resetGame'");
    		}

    		if (/*startRandomNoteQuiz*/ ctx[2] === undefined && !("startRandomNoteQuiz" in props)) {
    			console.warn("<Header> was created without expected prop 'startRandomNoteQuiz'");
    		}

    		if (/*time*/ ctx[3] === undefined && !("time" in props)) {
    			console.warn("<Header> was created without expected prop 'time'");
    		}
    	}

    	get resetGame() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resetGame(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startRandomNoteQuiz() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startRandomNoteQuiz(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withTimeConstraint() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withTimeConstraint(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fretboardNavigationQuestions() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fretboardNavigationQuestions(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.31.2 */
    const file$6 = "src/components/Modal.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Correct";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Wrong";
    			attr_dev(button0, "class", "button");
    			add_location(button0, file$6, 30, 2, 631);
    			attr_dev(button1, "class", "button bg-red-500 hover:bg-red-300");
    			add_location(button1, file$6, 34, 2, 712);
    			attr_dev(div, "class", "modal w-48 h-48 bg-white rounded-lg shadow-xl flex flex-col justify-center items-center svelte-18xvqek");
    			set_style(div, "--xCoordinate", /*xCoordinate*/ ctx[0] + 64 + "px");
    			set_style(div, "--yCoordinate", /*yCoordinate*/ ctx[1] + "px");
    			add_location(div, file$6, 22, 0, 397);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*handleModalCorrect*/ ctx[2])) /*handleModalCorrect*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*handleModalWrong*/ ctx[3])) /*handleModalWrong*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!current || dirty & /*xCoordinate*/ 1) {
    				set_style(div, "--xCoordinate", /*xCoordinate*/ ctx[0] + 64 + "px");
    			}

    			if (!current || dirty & /*yCoordinate*/ 2) {
    				set_style(div, "--yCoordinate", /*yCoordinate*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Modal", slots, []);
    	let { xCoordinate = 0 } = $$props;
    	let { yCoordinate = 0 } = $$props;
    	let { handleModalCorrect } = $$props;
    	let { handleModalWrong } = $$props;
    	const writable_props = ["xCoordinate", "yCoordinate", "handleModalCorrect", "handleModalWrong"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("xCoordinate" in $$props) $$invalidate(0, xCoordinate = $$props.xCoordinate);
    		if ("yCoordinate" in $$props) $$invalidate(1, yCoordinate = $$props.yCoordinate);
    		if ("handleModalCorrect" in $$props) $$invalidate(2, handleModalCorrect = $$props.handleModalCorrect);
    		if ("handleModalWrong" in $$props) $$invalidate(3, handleModalWrong = $$props.handleModalWrong);
    	};

    	$$self.$capture_state = () => ({
    		blur,
    		xCoordinate,
    		yCoordinate,
    		handleModalCorrect,
    		handleModalWrong
    	});

    	$$self.$inject_state = $$props => {
    		if ("xCoordinate" in $$props) $$invalidate(0, xCoordinate = $$props.xCoordinate);
    		if ("yCoordinate" in $$props) $$invalidate(1, yCoordinate = $$props.yCoordinate);
    		if ("handleModalCorrect" in $$props) $$invalidate(2, handleModalCorrect = $$props.handleModalCorrect);
    		if ("handleModalWrong" in $$props) $$invalidate(3, handleModalWrong = $$props.handleModalWrong);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*xCoordinate*/ 1) {
    			 if (xCoordinate >= window.innerWidth - 200) {
    				$$invalidate(0, xCoordinate -= 200);
    			}
    		}
    	};

    	return [xCoordinate, yCoordinate, handleModalCorrect, handleModalWrong];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			xCoordinate: 0,
    			yCoordinate: 1,
    			handleModalCorrect: 2,
    			handleModalWrong: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleModalCorrect*/ ctx[2] === undefined && !("handleModalCorrect" in props)) {
    			console.warn("<Modal> was created without expected prop 'handleModalCorrect'");
    		}

    		if (/*handleModalWrong*/ ctx[3] === undefined && !("handleModalWrong" in props)) {
    			console.warn("<Modal> was created without expected prop 'handleModalWrong'");
    		}
    	}

    	get xCoordinate() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xCoordinate(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yCoordinate() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yCoordinate(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleModalCorrect() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleModalCorrect(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleModalWrong() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleModalWrong(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { window: window_1 } = globals;
    const file$7 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (155:0) {:else}
    function create_else_block(ctx) {
    	let header;
    	let updating_withTimeConstraint;
    	let updating_fretboardNavigationQuestions;
    	let t0;
    	let t1;
    	let main;
    	let section;
    	let notegrid;
    	let t2;
    	let div;
    	let t3;
    	let current;

    	function header_withTimeConstraint_binding(value) {
    		/*header_withTimeConstraint_binding*/ ctx[11].call(null, value);
    	}

    	function header_fretboardNavigationQuestions_binding(value) {
    		/*header_fretboardNavigationQuestions_binding*/ ctx[12].call(null, value);
    	}

    	let header_props = {
    		time: /*time*/ ctx[0],
    		resetGame: /*resetGame*/ ctx[6],
    		startRandomNoteQuiz: /*startRandomNoteQuiz*/ ctx[7]
    	};

    	if (/*withTimeConstraint*/ ctx[2] !== void 0) {
    		header_props.withTimeConstraint = /*withTimeConstraint*/ ctx[2];
    	}

    	if (/*fretboardNavigationQuestions*/ ctx[3] !== void 0) {
    		header_props.fretboardNavigationQuestions = /*fretboardNavigationQuestions*/ ctx[3];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, "withTimeConstraint", header_withTimeConstraint_binding));
    	binding_callbacks.push(() => bind(header, "fretboardNavigationQuestions", header_fretboardNavigationQuestions_binding));
    	let if_block0 = /*$uiState*/ ctx[4].modalIsVisible && create_if_block_4(ctx);

    	notegrid = new NoteGrid({
    			props: {
    				noteGradiations: /*noteGradiations*/ ctx[5]
    			},
    			$$inline: true
    		});

    	let each_value = [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 12; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block1 = /*gameScore*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			main = element("main");
    			section = element("section");
    			create_component(notegrid.$$.fragment);
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "note-grid mt-4 svelte-1nudaf4");
    			add_location(div, file$7, 172, 6, 4350);
    			attr_dev(section, "class", "mt-8");
    			add_location(section, file$7, 170, 4, 4268);
    			attr_dev(main, "class", "text-center flex flex-col justify-center");
    			add_location(main, file$7, 167, 2, 4195);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			mount_component(notegrid, section, null);
    			append_dev(section, t2);
    			append_dev(section, div);

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(main, t3);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty & /*time*/ 1) header_changes.time = /*time*/ ctx[0];

    			if (!updating_withTimeConstraint && dirty & /*withTimeConstraint*/ 4) {
    				updating_withTimeConstraint = true;
    				header_changes.withTimeConstraint = /*withTimeConstraint*/ ctx[2];
    				add_flush_callback(() => updating_withTimeConstraint = false);
    			}

    			if (!updating_fretboardNavigationQuestions && dirty & /*fretboardNavigationQuestions*/ 8) {
    				updating_fretboardNavigationQuestions = true;
    				header_changes.fretboardNavigationQuestions = /*fretboardNavigationQuestions*/ ctx[3];
    				add_flush_callback(() => updating_fretboardNavigationQuestions = false);
    			}

    			header.$set(header_changes);

    			if (/*$uiState*/ ctx[4].modalIsVisible) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$uiState*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
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

    			if (/*gameScore*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*gameScore*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
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
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(notegrid.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(notegrid.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(notegrid);
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(155:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (151:0) {#if window.innerWidth < 780}
    function create_if_block$1(ctx) {
    	let h2;
    	let code;
    	let t1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			code = element("code");
    			code.textContent = "Sveltuir";
    			t1 = text(" is only useable on devices with a screen width that is greater than 780px");
    			add_location(code, file$7, 152, 4, 3662);
    			attr_dev(h2, "class", "text-2xl font-black text-green-700 text-center flex flex-col justify-center m-4");
    			add_location(h2, file$7, 151, 2, 3565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, code);
    			append_dev(h2, t1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(151:0) {#if window.innerWidth < 780}",
    		ctx
    	});

    	return block;
    }

    // (164:2) {#if $uiState.modalIsVisible}
    function create_if_block_4(ctx) {
    	let modal;
    	let updating_xCoordinate;
    	let current;

    	function modal_xCoordinate_binding(value) {
    		/*modal_xCoordinate_binding*/ ctx[13].call(null, value);
    	}

    	let modal_props = {
    		yCoordinate: /*$uiState*/ ctx[4].yCordinate,
    		handleModalCorrect: /*handleModalCorrect*/ ctx[8],
    		handleModalWrong: /*handleModalWrong*/ ctx[9]
    	};

    	if (/*$uiState*/ ctx[4].xCordinate !== void 0) {
    		modal_props.xCoordinate = /*$uiState*/ ctx[4].xCordinate;
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "xCoordinate", modal_xCoordinate_binding));

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
    			if (dirty & /*$uiState*/ 16) modal_changes.yCoordinate = /*$uiState*/ ctx[4].yCordinate;

    			if (!updating_xCoordinate && dirty & /*$uiState*/ 16) {
    				updating_xCoordinate = true;
    				modal_changes.xCoordinate = /*$uiState*/ ctx[4].xCordinate;
    				add_flush_callback(() => updating_xCoordinate = false);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(164:2) {#if $uiState.modalIsVisible}",
    		ctx
    	});

    	return block;
    }

    // (178:10) {:else}
    function create_else_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "-";
    			add_location(span, file$7, 178, 12, 4583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(178:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (175:10) {#if dot == 1}
    function create_if_block_3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "bg-red-400 w-8 h-8 rounded-full hover:bg-red-200");
    			add_location(button, file$7, 175, 12, 4465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(175:10) {#if dot == 1}",
    		ctx
    	});

    	return block;
    }

    // (174:8) {#each [0,0,1,0,1,0,1,0,1,0,0,1] as dot}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*dot*/ ctx[27] == 1) return create_if_block_3;
    		return create_else_block_1;
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
    		p: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(174:8) {#each [0,0,1,0,1,0,1,0,1,0,0,1] as dot}",
    		ctx
    	});

    	return block;
    }

    // (185:4) {#if gameScore}
    function create_if_block_1$1(ctx) {
    	let section;
    	let h3;
    	let t1;
    	let div;
    	let h40;
    	let t3;
    	let p0;
    	let t4_value = /*gameScore*/ ctx[1].correct + "";
    	let t4;
    	let t5;
    	let h41;
    	let t7;
    	let p1;
    	let t8_value = /*gameScore*/ ctx[1].wrong + "";
    	let t8;
    	let t9;
    	let section_transition;
    	let current;
    	let if_block = /*withTimeConstraint*/ ctx[2] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Your score";
    			t1 = space();
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "Correct";
    			t3 = space();
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			h41 = element("h4");
    			h41.textContent = "Wrong";
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			if (if_block) if_block.c();
    			attr_dev(h3, "class", "text-2xl text-green-700 font-black");
    			add_location(h3, file$7, 186, 8, 4792);
    			attr_dev(h40, "class", "text-xl text-green-700 font-mono mr-2");
    			add_location(h40, file$7, 188, 10, 4929);
    			attr_dev(p0, "class", "mr-8");
    			add_location(p0, file$7, 189, 10, 5002);
    			attr_dev(h41, "class", "text-xl text-red-700 font-mono mr-2");
    			add_location(h41, file$7, 191, 10, 5053);
    			add_location(p1, file$7, 192, 10, 5122);
    			attr_dev(div, "class", "flex flex-row justify-center items-center");
    			add_location(div, file$7, 187, 8, 4863);
    			attr_dev(section, "class", "mt-8 flex flex-col justify-center items-center");
    			add_location(section, file$7, 185, 6, 4685);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(section, t1);
    			append_dev(section, div);
    			append_dev(div, h40);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(p0, t4);
    			append_dev(div, t5);
    			append_dev(div, h41);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			append_dev(p1, t8);
    			append_dev(section, t9);
    			if (if_block) if_block.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*gameScore*/ 2) && t4_value !== (t4_value = /*gameScore*/ ctx[1].correct + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*gameScore*/ 2) && t8_value !== (t8_value = /*gameScore*/ ctx[1].wrong + "")) set_data_dev(t8, t8_value);

    			if (/*withTimeConstraint*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, blur, { duration: 200 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!section_transition) section_transition = create_bidirectional_transition(section, blur, { duration: 200 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			if (detaching && section_transition) section_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(185:4) {#if gameScore}",
    		ctx
    	});

    	return block;
    }

    // (195:8) {#if withTimeConstraint}
    function create_if_block_2$1(ctx) {
    	let div;
    	let h40;
    	let t1;
    	let p0;
    	let t2_value = /*gameScore*/ ctx[1].inTime + "";
    	let t2;
    	let t3;
    	let h41;
    	let t5;
    	let p1;
    	let t6_value = /*gameScore*/ ctx[1].notInTime + "";
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "In time";
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			h41 = element("h4");
    			h41.textContent = "Not in time";
    			t5 = space();
    			p1 = element("p");
    			t6 = text(t6_value);
    			attr_dev(h40, "class", "text-xl text-green-700 font-mono mr-2");
    			add_location(h40, file$7, 196, 12, 5273);
    			attr_dev(p0, "class", "mr-8");
    			add_location(p0, file$7, 197, 12, 5348);
    			attr_dev(h41, "class", "text-xl text-red-700 font-mono mr-2");
    			add_location(h41, file$7, 199, 12, 5400);
    			add_location(p1, file$7, 200, 12, 5477);
    			attr_dev(div, "class", "flex flex-row justify-center items-center");
    			add_location(div, file$7, 195, 10, 5205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, h41);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(p1, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameScore*/ 2 && t2_value !== (t2_value = /*gameScore*/ ctx[1].inTime + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*gameScore*/ 2 && t6_value !== (t6_value = /*gameScore*/ ctx[1].notInTime + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(195:8) {#if withTimeConstraint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (window.innerWidth < 780) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type();
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			if_block.c();
    			t = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(footer, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(footer, detaching);
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
    	let $notes;
    	let $uiState;
    	let $quizNotes;
    	validate_store(notes, "notes");
    	component_subscribe($$self, notes, $$value => $$invalidate(17, $notes = $$value));
    	validate_store(uiState, "uiState");
    	component_subscribe($$self, uiState, $$value => $$invalidate(4, $uiState = $$value));
    	validate_store(quizNotes, "quizNotes");
    	component_subscribe($$self, quizNotes, $$value => $$invalidate(18, $quizNotes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const gradiationColors = [
    		"bg-green-300",
    		"bg-green-400",
    		"bg-green-500",
    		"bg-green-600",
    		"bg-green-700",
    		"bg-green-800"
    	];

    	let time = 0;
    	let interval;
    	let gameScore;
    	let withTimeConstraint = false;
    	let fretboardNavigationQuestions = false;
    	let key;
    	let keyCode;

    	let noteGradiations = $notes.map((notes, i) => {
    		return {
    			notes: [...notes],
    			gradiation: gradiationColors[i]
    		};
    	});

    	Game.initiliazeGame();

    	function resetGame() {
    		// Appstate
    		$$invalidate(1, gameScore = null);

    		Game.resetGame();

    		// UI State
    		selectedNotes.set([]);

    		quizNotes.set([]);
    		$uiState.modalIsVisible ? toggleModal() : null;

    		// Errorhandling
    		stopTimer();
    	}

    	function startRandomNoteQuiz() {
    		// stop the timer, when currently one is running
    		interval >= 0 ? stopTimer() : null;

    		// Create Quiz
    		const stringNumber = Math.floor(Math.random() * 6);

    		const fretNumber = Math.floor(Math.random() * 12);
    		const selectedNote = $notes[stringNumber][0][fretNumber];
    		const selectedNoteId = createNoteId(stringNumber, selectedNote);
    		quizNotes.update(quizNotes => [...quizNotes, selectedNoteId]);
    		startTimer();
    	}

    	function startTimer() {
    		interval = setInterval(timer, 1000);
    	}

    	function stopTimer() {
    		$$invalidate(0, time = 0);
    		clearInterval(interval);
    		interval = null;
    	}

    	function timer() {
    		$$invalidate(0, time += 1);
    	}

    	function handleModalCorrect() {
    		Game.countCorrect(getTiming());
    		stopTimer();
    		toggleModal();
    		$$invalidate(1, gameScore = Game.getGameStats());
    	}

    	function handleModalWrong() {
    		Game.countWrong(getTiming());
    		stopTimer();
    		toggleModal();
    		$$invalidate(1, gameScore = Game.getGameStats());
    	}

    	function getTiming() {
    		return time < $uiState.timing;
    	}

    	function toggleModal() {
    		uiState.update(uiState => {
    			return {
    				...uiState,
    				modalIsVisible: !uiState.modalIsVisible
    			};
    		});
    	}

    	function handleKeydown(event) {
    		key = event.key;
    		keyCode = event.keyCode;
    		const shiftKey = event.shiftKey;

    		if (key === "n") {
    			startRandomNoteQuiz();
    			return;
    		}

    		if ($quizNotes.length > 0 && isNoteKey(key)) {
    			const searchedNote = $quizNotes[$quizNotes.length - 1];
    			const correctGuess = evaluateKeyInput(key, keyCode, shiftKey, searchedNote);

    			correctGuess
    			? handleKeydownCorrect(searchedNote)
    			: handleKeydownWrong(searchedNote);
    		}
    	}

    	function handleKeydownCorrect(correctNote) {
    		Game.countCorrect(getTiming());
    		stopTimer();
    		$$invalidate(1, gameScore = Game.getGameStats());
    		selectedNotes.update(selectedNotes => [...selectedNotes, correctNote]);
    	}

    	function handleKeydownWrong(correctNote) {
    		Game.countWrong(getTiming());
    		stopTimer();
    		$$invalidate(1, gameScore = Game.getGameStats());
    		selectedNotes.update(selectedNotes => [...selectedNotes, correctNote]);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function header_withTimeConstraint_binding(value) {
    		withTimeConstraint = value;
    		$$invalidate(2, withTimeConstraint);
    	}

    	function header_fretboardNavigationQuestions_binding(value) {
    		fretboardNavigationQuestions = value;
    		$$invalidate(3, fretboardNavigationQuestions);
    	}

    	function modal_xCoordinate_binding(value) {
    		$uiState.xCordinate = value;
    		uiState.set($uiState);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		blur,
    		notes,
    		selectedNotes,
    		quizNotes,
    		uiState,
    		Game,
    		createNoteId,
    		evaluateKeyInput,
    		isNoteKey,
    		NoteGrid,
    		Footer,
    		Header,
    		Modal,
    		gradiationColors,
    		time,
    		interval,
    		gameScore,
    		withTimeConstraint,
    		fretboardNavigationQuestions,
    		key,
    		keyCode,
    		noteGradiations,
    		resetGame,
    		startRandomNoteQuiz,
    		startTimer,
    		stopTimer,
    		timer,
    		handleModalCorrect,
    		handleModalWrong,
    		getTiming,
    		toggleModal,
    		handleKeydown,
    		handleKeydownCorrect,
    		handleKeydownWrong,
    		$notes,
    		$uiState,
    		$quizNotes
    	});

    	$$self.$inject_state = $$props => {
    		if ("time" in $$props) $$invalidate(0, time = $$props.time);
    		if ("interval" in $$props) interval = $$props.interval;
    		if ("gameScore" in $$props) $$invalidate(1, gameScore = $$props.gameScore);
    		if ("withTimeConstraint" in $$props) $$invalidate(2, withTimeConstraint = $$props.withTimeConstraint);
    		if ("fretboardNavigationQuestions" in $$props) $$invalidate(3, fretboardNavigationQuestions = $$props.fretboardNavigationQuestions);
    		if ("key" in $$props) key = $$props.key;
    		if ("keyCode" in $$props) keyCode = $$props.keyCode;
    		if ("noteGradiations" in $$props) $$invalidate(5, noteGradiations = $$props.noteGradiations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		time,
    		gameScore,
    		withTimeConstraint,
    		fretboardNavigationQuestions,
    		$uiState,
    		noteGradiations,
    		resetGame,
    		startRandomNoteQuiz,
    		handleModalCorrect,
    		handleModalWrong,
    		handleKeydown,
    		header_withTimeConstraint_binding,
    		header_fretboardNavigationQuestions_binding,
    		modal_xCoordinate_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
