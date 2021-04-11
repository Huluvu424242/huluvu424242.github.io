import { g as getRenderingRef, f as forceUpdate, e as Build, h, r as registerInstance, i as Host, j as getElement } from './index-962e0e26.js';
import { L as Logger } from './logger-358e14e7.js';

const appendToMap = (map, propName, value) => {
    const items = map.get(propName);
    if (!items) {
        map.set(propName, [value]);
    }
    else if (!items.includes(value)) {
        items.push(value);
    }
};
const debounce = (fn, ms) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = 0;
            fn(...args);
        }, ms);
    };
};

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement) => !('isConnected' in maybeElement) || maybeElement.isConnected;
const cleanupElements = debounce((map) => {
    for (let key of map.keys()) {
        map.set(key, map.get(key).filter(isConnected));
    }
}, 2000);
const stencilSubscription = ({ on }) => {
    const elmsToUpdate = new Map();
    if (typeof getRenderingRef === 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        on('dispose', () => {
            elmsToUpdate.clear();
        });
        on('get', (propName) => {
            const elm = getRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        });
        on('set', (propName) => {
            const elements = elmsToUpdate.get(propName);
            if (elements) {
                elmsToUpdate.set(propName, elements.filter(forceUpdate));
            }
            cleanupElements(elmsToUpdate);
        });
        on('reset', () => {
            elmsToUpdate.forEach((elms) => elms.forEach(forceUpdate));
            cleanupElements(elmsToUpdate);
        });
    }
};

const createObservableMap = (defaultState, shouldUpdate = (a, b) => a !== b) => {
    let states = new Map(Object.entries(defaultState !== null && defaultState !== void 0 ? defaultState : {}));
    const handlers = {
        dispose: [],
        get: [],
        set: [],
        reset: [],
    };
    const reset = () => {
        states = new Map(Object.entries(defaultState !== null && defaultState !== void 0 ? defaultState : {}));
        handlers.reset.forEach((cb) => cb());
    };
    const dispose = () => {
        // Call first dispose as resetting the state would
        // cause less updates ;)
        handlers.dispose.forEach((cb) => cb());
        reset();
    };
    const get = (propName) => {
        handlers.get.forEach((cb) => cb(propName));
        return states.get(propName);
    };
    const set = (propName, value) => {
        const oldValue = states.get(propName);
        if (shouldUpdate(value, oldValue, propName)) {
            states.set(propName, value);
            handlers.set.forEach((cb) => cb(propName, value, oldValue));
        }
    };
    const state = (typeof Proxy === 'undefined'
        ? {}
        : new Proxy(defaultState, {
            get(_, propName) {
                return get(propName);
            },
            ownKeys(_) {
                return Array.from(states.keys());
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            has(_, propName) {
                return states.has(propName);
            },
            set(_, propName, value) {
                set(propName, value);
                return true;
            },
        }));
    const on = (eventName, callback) => {
        handlers[eventName].push(callback);
        return () => {
            removeFromArray(handlers[eventName], callback);
        };
    };
    const onChange = (propName, cb) => {
        const unSet = on('set', (key, newValue) => {
            if (key === propName) {
                cb(newValue);
            }
        });
        const unReset = on('reset', () => cb(defaultState[propName]));
        return () => {
            unSet();
            unReset();
        };
    };
    const use = (...subscriptions) => subscriptions.forEach((subscription) => {
        if (subscription.set) {
            on('set', subscription.set);
        }
        if (subscription.get) {
            on('get', subscription.get);
        }
        if (subscription.reset) {
            on('reset', subscription.reset);
        }
    });
    const forceUpdate = (key) => {
        const oldValue = states.get(key);
        handlers.set.forEach((cb) => cb(key, oldValue, oldValue));
    };
    return {
        state,
        get,
        set,
        on,
        onChange,
        use,
        dispose,
        reset,
        forceUpdate,
    };
};
const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        array.length--;
    }
};

const createStore = (defaultState, shouldUpdate) => {
    const map = createObservableMap(defaultState, shouldUpdate);
    stencilSubscription(map);
    return map;
};

let defaultRouter;
const createRouter = (opts) => {
    var _a;
    const win = window;
    const url = new URL(win.location.href);
    const parseURL = (_a = opts === null || opts === void 0 ? void 0 : opts.parseURL) !== null && _a !== void 0 ? _a : DEFAULT_PARSE_URL;
    const { state, onChange, dispose } = createStore({
        url,
        activePath: parseURL(url)
    }, (newV, oldV, prop) => {
        if (prop === 'url') {
            return newV.href !== oldV.href;
        }
        return newV !== oldV;
    });
    const push = (href) => {
        history.pushState(null, null, href);
        const url = new URL(href, document.baseURI);
        state.url = url;
        state.activePath = parseURL(url);
    };
    const match = (routes) => {
        const { activePath } = state;
        for (let route of routes) {
            const params = matchPath(activePath, route.path);
            if (params) {
                if (route.to != null) {
                    const to = (typeof route.to === 'string')
                        ? route.to
                        : route.to(activePath);
                    push(to);
                    return match(routes);
                }
                else {
                    return { params, route };
                }
            }
        }
        return undefined;
    };
    const navigationChanged = () => {
        const url = new URL(win.location.href);
        state.url = url;
        state.activePath = parseURL(url);
    };
    const Switch = (_, childrenRoutes) => {
        const result = match(childrenRoutes);
        if (result) {
            if (typeof result.route.jsx === 'function') {
                return result.route.jsx(result.params);
            }
            else {
                return result.route.jsx;
            }
        }
    };
    const disposeRouter = () => {
        defaultRouter = undefined;
        win.removeEventListener('popstate', navigationChanged);
        dispose();
    };
    const router = defaultRouter = {
        Switch,
        get url() {
            return state.url;
        },
        get activePath() {
            return state.activePath;
        },
        push,
        onChange: onChange,
        dispose: disposeRouter,
    };
    // Initial update
    navigationChanged();
    // Listen URL changes
    win.addEventListener('popstate', navigationChanged);
    return router;
};
const Route = (props, children) => {
    var _a;
    if ('to' in props) {
        return {
            path: props.path,
            to: props.to,
        };
    }
    if (Build.isDev && props.render && children.length > 0) {
        console.warn('Route: if `render` is provided, the component should not have any children');
    }
    return {
        path: props.path,
        id: props.id,
        jsx: (_a = props.render) !== null && _a !== void 0 ? _a : children,
    };
};
const href = (href, router = defaultRouter) => {
    if (Build.isDev && !router) {
        throw new Error('Router must be defined in href');
    }
    return {
        href,
        onClick: (ev) => {
            if (ev.metaKey || ev.ctrlKey) {
                return;
            }
            if (ev.which == 2 || ev.button == 1) {
                return;
            }
            ev.preventDefault();
            router.push(href);
        },
    };
};
const matchPath = (pathname, path) => {
    if (typeof path === 'string') {
        if (path === pathname) {
            return {};
        }
    }
    else if (typeof path === 'function') {
        const params = path(pathname);
        if (params) {
            return params === true
                ? {}
                : { ...params };
        }
    }
    else {
        const results = path.exec(pathname);
        if (results) {
            path.lastIndex = 0;
            return { ...results };
        }
    }
    return undefined;
};
const DEFAULT_PARSE_URL = (url) => {
    return url.pathname.toLowerCase();
};
const NotFound = () => ({});

/**
 * TS adaption of https://github.com/pillarjs/path-to-regexp/blob/master/index.js
 */
/**
 * Default configs.
 */
const DEFAULT_DELIMITER = '/';
const DEFAULT_DELIMITERS = './';
/**
 * The main path matching regexp utility.
 */
const PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g');
/**
 * Parse a string for the raw tokens.
 */
const parse = (str, options) => {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
    var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
    var pathEscaped = false;
    var res;
    while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        // Ignore already escaped sequences.
        if (escaped) {
            path += escaped[1];
            pathEscaped = true;
            continue;
        }
        var prev = '';
        var next = str[index];
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];
        if (!pathEscaped && path.length) {
            var k = path.length - 1;
            if (delimiters.indexOf(path[k]) > -1) {
                prev = path[k];
                path = path.slice(0, k);
            }
        }
        // Push the current path onto the tokens.
        if (path) {
            tokens.push(path);
            path = '';
            pathEscaped = false;
        }
        var partial = prev !== '' && next !== undefined && next !== prev;
        var repeat = modifier === '+' || modifier === '*';
        var optional = modifier === '?' || modifier === '*';
        var delimiter = prev || defaultDelimiter;
        var pattern = capture || group;
        tokens.push({
            name: name || key++,
            prefix: prev,
            delimiter: delimiter,
            optional: optional,
            repeat: repeat,
            partial: partial,
            pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
        });
    }
    // Push any remaining characters.
    if (path || index < str.length) {
        tokens.push(path + str.substr(index));
    }
    return tokens;
};
/**
 * Escape a regular expression string.
 */
const escapeString = (str) => {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
};
/**
 * Escape the capturing group by escaping special characters and meaning.
 */
const escapeGroup = (group) => {
    return group.replace(/([=!:$/()])/g, '\\$1');
};
/**
 * Get the flags for a regexp from the options.
 */
const flags = (options) => {
    return options && options.sensitive ? '' : 'i';
};
/**
 * Pull out keys from a regexp.
 */
const regexpToRegexp = (path, keys) => {
    if (!keys)
        return path;
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);
    if (groups) {
        for (var i = 0; i < groups.length; i++) {
            keys.push({
                name: i,
                prefix: null,
                delimiter: null,
                optional: false,
                repeat: false,
                partial: false,
                pattern: null
            });
        }
    }
    return path;
};
/**
 * Transform an array into a regexp.
 */
const arrayToRegexp = (path, keys, options) => {
    var parts = [];
    for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
    }
    return new RegExp('(?:' + parts.join('|') + ')', flags(options));
};
/**
 * Create a path regexp from string input.
 */
const stringToRegexp = (path, keys, options) => {
    return tokensToRegExp(parse(path, options), keys, options);
};
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
const tokensToRegExp = (tokens, keys, options) => {
    options = options || {};
    var strict = options.strict;
    var end = options.end !== false;
    var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
    var delimiters = options.delimiters || DEFAULT_DELIMITERS;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
    var route = '';
    var isEndDelimited = false;
    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === 'string') {
            route += escapeString(token);
            isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
        }
        else {
            var prefix = escapeString(token.prefix || '');
            var capture = token.repeat
                ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
                : token.pattern;
            if (keys)
                keys.push(token);
            if (token.optional) {
                if (token.partial) {
                    route += prefix + '(' + capture + ')?';
                }
                else {
                    route += '(?:' + prefix + '(' + capture + '))?';
                }
            }
            else {
                route += prefix + '(' + capture + ')';
            }
        }
    }
    if (end) {
        if (!strict)
            route += '(?:' + delimiter + ')?';
        route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
    }
    else {
        if (!strict)
            route += '(?:' + delimiter + '(?=' + endsWith + '))?';
        if (!isEndDelimited)
            route += '(?=' + delimiter + '|' + endsWith + ')';
    }
    return new RegExp('^' + route, flags(options));
};
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
const pathToRegexp = (path, keys, options) => {
    if (path instanceof RegExp) {
        return regexpToRegexp(path, keys);
    }
    if (Array.isArray(path)) {
        return arrayToRegexp(path, keys, options);
    }
    return stringToRegexp(path, keys, options);
};

let cacheCount = 0;
const patternCache = {};
const cacheLimit = 10000;
// Memoized function for creating the path match regex
const compilePath = (pattern, options) => {
    const cacheKey = `${options.end}${options.strict}`;
    const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});
    const cachePattern = JSON.stringify(pattern);
    if (cache[cachePattern]) {
        return cache[cachePattern];
    }
    const keys = [];
    const re = pathToRegexp(pattern, keys, options);
    const compiledPattern = { re, keys };
    if (cacheCount < cacheLimit) {
        cache[cachePattern] = compiledPattern;
        cacheCount += 1;
    }
    return compiledPattern;
};
const match = (pathname, options = {}) => {
    const { exact = false, strict = false } = options;
    const { re, keys } = compilePath(pathname, { end: exact, strict });
    return (path) => {
        const match = re.exec(path);
        if (!match) {
            return undefined;
        }
        const [url, ...values] = match;
        const isExact = path === url;
        if (exact && !isExact) {
            return undefined;
        }
        return keys.reduce((memo, key, index) => {
            memo[key.name] = values[index];
            return memo;
        }, {});
    };
};

const Disclaimer = () => (h("div", { class: "row flex-spaces" },
  h("input", { class: "alert-state", id: "disclaimer", type: "checkbox" }),
  h("div", { class: "alert alert-danger dismissible" },
    h("div", { class: "row" },
      h("h3", null, "!!! Das ist eine Demo Seite welche alle Feature der App zeigen soll - aus diesem Grund ist auch die Statistik eingeschaltet !!!"),
      h("div", { class: "background-warning" },
        h("p", null, "Es werden nur Daten zu den abgerufenen Feeds gespeichert (in memory) wie: URL, Anzahl der Abfragen und Anzahl valider Anworten. Sollten Sie die Speicherung nicht w\u00FCnschen - dann geben Sie bitte keinen neuen Feed ein. Vielen Dank f\u00FCr Ihr Verst\u00E4ndnis."))),
    h("label", { class: "paper-btn", title: "Hinweis Ausblenden", htmlFor: "disclaimer" }, "X"))));

const Navbar = () => (h("nav", { class: "border split-nav" },
  h("div", { class: "nav-brand" },
    h("h3", { role: "heading", "aria-level": "1" },
      h("a", { href: "/" }, "RSS/Atom Feed Reader"))),
  h("div", { class: "collapsible" },
    h("input", { id: "appmenu", type: "radio", name: "appmenu" }),
    h("label", { htmlFor: "appmenu" },
      h("div", { class: "bar1" }),
      h("div", { class: "bar2" }),
      h("div", { class: "bar3" }),
      h("div", { class: "bar4" }),
      h("div", { class: "bar5" })),
    h("div", { class: "collapsible-body" },
      h("ul", { role: "listbox", class: "inline" },
        h("li", { role: "item" },
          h("span", { role: "heading", "aria-level": "2" },
            h("a", Object.assign({}, href('/feeds')), "Feeds"))),
        h("li", { role: "item" },
          h("span", { role: "heading", "aria-level": "2" },
            h("a", Object.assign({}, href('/')), "News"))),
        h("li", { role: "item" },
          h("span", { role: "heading", "aria-level": "2" },
            h("a", Object.assign({}, href('/statistic')), "Statistik"))),
        h("li", { role: "item" },
          h("span", { role: "heading", "aria-level": "2" },
            h("a", { href: "https://github.com/Huluvu424242/honey-news", target: "_blank" }, "Github"))),
        h("li", { role: "item" },
          h("span", { role: "heading", "aria-level": "2" },
            h("a", Object.assign({}, href('/about')), "About"))))))));

const Header = () => ([
  h(Navbar, null),
  h(Disclaimer, null)
]);

const About = () => ([
  h("p", null, "Eine SPA auf Basis mehrerer Webkomponenten, gebaut mit Stencil und styled by papercss."),
  h("p", null,
    "Das minifizierte Stylesheet von PaperCSS wurde \u00FCber den assets Folder f\u00FCr alle Komponenten zug\u00E4nglich gemacht. Es wurde dann pro Komponente per @import url(...) importiert - was eigentlich ein AntiPattern ist aber ich habe aktuell nix besseres gefunden. Daher - warten auf ConstructedStyleSheets Spec ... Beim @import url(...) hat sich herausgestellt, dass die CSS Properties (Variablen) nicht mit geladen wurden. Daher hab ich diese herausgezogen und unter global/varibales.css eingebunden. Dadurch wird in der index.html folgender Eintrag notwendig:",
    h("pre", null, "< link rel=\"stylesheet\" href=\"/build/honey-news.css\"/>")),
  h("p", null, "Das Routing der SPA wurde \u00FCber stencil-router-v2 realisiert. Somit wird bei Klick auf einen Link zwar der URL ge\u00E4ndert aber nicht die ganze Seite neu geladen - was ja praktisch den Kern des Routings in SPAs darstellt."),
  h("p", null, "F\u00FCr das Backend wurde ein nodejs express server verwendet und auf heroku deployed. Ein separates Backend war leider auf Grund der \u00FCblcihen CORS Problematiken notwendig (CORS-PROXY im Service Worker habe ich leider nicht realisiert bekommen - da hat halt der Browser strikt was dagegen).")
]);

const appShellCss = "@charset \"UTF-8\";.text-primary{color:#41403e;color:var(--primary)}.background-primary{background-color:#41403e;background-color:var(--primary-light)}.text-secondary{color:#41403e;color:var(--secondary)}.background-secondary{background-color:#41403e;background-color:var(--secondary-light)}.text-success{color:#41403e;color:var(--success)}.background-success{background-color:#41403e;background-color:var(--success-light)}.text-warning{color:#41403e;color:var(--warning)}.background-warning{background-color:#41403e;background-color:var(--warning-light)}.text-danger{color:#41403e;color:var(--danger)}.background-danger{background-color:#41403e;background-color:var(--danger-light)}.text-muted{color:#41403e;color:var(--muted)}.background-muted{background-color:#41403e;background-color:var(--muted-light)}/*! normalize.css v7.0.0 | MIT License | github.com/necolas/normalize.css */html{line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:0.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace, monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects}abbr[title]{border-bottom:none;text-decoration:underline;-webkit-text-decoration:underline dotted;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace, monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:0.35em 0.75em 0.625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}.container{margin:0 auto;max-width:960px;position:relative;width:100%}@media only screen and (max-width: 992px){.container{width:85%}}@media only screen and (max-width: 480px){.container{width:90%}}.container.container-xs{max-width:480px}.container.container-sm{max-width:768px}.container.container-md{max-width:992px}.container.container-lg{max-width:1200px}.section{margin-bottom:2rem;margin-top:1rem;word-wrap:break-word}.section::after{color:#8f8d89;content:\"~~~\";display:block;font-size:1.5rem;position:relative;text-align:center}hr{border:0}hr::after{color:#8f8d89;content:\"~~~\";display:block;font-size:1.5rem;position:relative;text-align:center;top:-0.75rem}.paper{background-color:#41403e;background-color:var(--main-background);border:1px solid #c1c0bd;box-shadow:-1px 5px 35px -9px rgba(0, 0, 0, 0.2);margin-bottom:1rem;margin-top:1rem;padding:2rem}@media only screen and (max-width: 480px){.paper{margin-bottom:0;margin-top:0;padding:1rem;width:100%}}.row{display:flex;flex-flow:row wrap;margin-bottom:1rem;margin-left:auto;margin-right:auto}.row.flex-right{justify-content:flex-end}.row.flex-center{justify-content:center}.row.flex-edges{justify-content:space-between}.row.flex-spaces{justify-content:space-around}.row.flex-top{align-items:flex-start}.row.flex-middle{align-items:center}.row.flex-bottom{align-items:flex-end}.col{padding:1rem}@media only screen and (max-width: 768px){.col{flex:0 0 100%;max-width:100%}}.col-fill{flex:1 1 0;width:auto}@media only screen and (min-width: 0){.col-1{flex:0 0 8.3333333333%;max-width:8.3333333333%}.col-2{flex:0 0 16.6666666667%;max-width:16.6666666667%}.col-3{flex:0 0 25%;max-width:25%}.col-4{flex:0 0 33.3333333333%;max-width:33.3333333333%}.col-5{flex:0 0 41.6666666667%;max-width:41.6666666667%}.col-6{flex:0 0 50%;max-width:50%}.col-7{flex:0 0 58.3333333333%;max-width:58.3333333333%}.col-8{flex:0 0 66.6666666667%;max-width:66.6666666667%}.col-9{flex:0 0 75%;max-width:75%}.col-10{flex:0 0 83.3333333333%;max-width:83.3333333333%}.col-11{flex:0 0 91.6666666667%;max-width:91.6666666667%}.col-12{flex:0 0 100%;max-width:100%}}@media only screen and (min-width: 480px){.xs-1{flex:0 0 8.3333333333%;max-width:8.3333333333%}.xs-2{flex:0 0 16.6666666667%;max-width:16.6666666667%}.xs-3{flex:0 0 25%;max-width:25%}.xs-4{flex:0 0 33.3333333333%;max-width:33.3333333333%}.xs-5{flex:0 0 41.6666666667%;max-width:41.6666666667%}.xs-6{flex:0 0 50%;max-width:50%}.xs-7{flex:0 0 58.3333333333%;max-width:58.3333333333%}.xs-8{flex:0 0 66.6666666667%;max-width:66.6666666667%}.xs-9{flex:0 0 75%;max-width:75%}.xs-10{flex:0 0 83.3333333333%;max-width:83.3333333333%}.xs-11{flex:0 0 91.6666666667%;max-width:91.6666666667%}.xs-12{flex:0 0 100%;max-width:100%}}@media only screen and (min-width: 768px){.sm-1{flex:0 0 8.3333333333%;max-width:8.3333333333%}.sm-2{flex:0 0 16.6666666667%;max-width:16.6666666667%}.sm-3{flex:0 0 25%;max-width:25%}.sm-4{flex:0 0 33.3333333333%;max-width:33.3333333333%}.sm-5{flex:0 0 41.6666666667%;max-width:41.6666666667%}.sm-6{flex:0 0 50%;max-width:50%}.sm-7{flex:0 0 58.3333333333%;max-width:58.3333333333%}.sm-8{flex:0 0 66.6666666667%;max-width:66.6666666667%}.sm-9{flex:0 0 75%;max-width:75%}.sm-10{flex:0 0 83.3333333333%;max-width:83.3333333333%}.sm-11{flex:0 0 91.6666666667%;max-width:91.6666666667%}.sm-12{flex:0 0 100%;max-width:100%}}@media only screen and (min-width: 992px){.md-1{flex:0 0 8.3333333333%;max-width:8.3333333333%}.md-2{flex:0 0 16.6666666667%;max-width:16.6666666667%}.md-3{flex:0 0 25%;max-width:25%}.md-4{flex:0 0 33.3333333333%;max-width:33.3333333333%}.md-5{flex:0 0 41.6666666667%;max-width:41.6666666667%}.md-6{flex:0 0 50%;max-width:50%}.md-7{flex:0 0 58.3333333333%;max-width:58.3333333333%}.md-8{flex:0 0 66.6666666667%;max-width:66.6666666667%}.md-9{flex:0 0 75%;max-width:75%}.md-10{flex:0 0 83.3333333333%;max-width:83.3333333333%}.md-11{flex:0 0 91.6666666667%;max-width:91.6666666667%}.md-12{flex:0 0 100%;max-width:100%}}@media only screen and (min-width: 1200px){.lg-1{flex:0 0 8.3333333333%;max-width:8.3333333333%}.lg-2{flex:0 0 16.6666666667%;max-width:16.6666666667%}.lg-3{flex:0 0 25%;max-width:25%}.lg-4{flex:0 0 33.3333333333%;max-width:33.3333333333%}.lg-5{flex:0 0 41.6666666667%;max-width:41.6666666667%}.lg-6{flex:0 0 50%;max-width:50%}.lg-7{flex:0 0 58.3333333333%;max-width:58.3333333333%}.lg-8{flex:0 0 66.6666666667%;max-width:66.6666666667%}.lg-9{flex:0 0 75%;max-width:75%}.lg-10{flex:0 0 83.3333333333%;max-width:83.3333333333%}.lg-11{flex:0 0 91.6666666667%;max-width:91.6666666667%}.lg-12{flex:0 0 100%;max-width:100%}}.align-top{align-self:flex-start}.align-middle{align-self:center}.align-bottom{align-self:flex-end}.container{margin:0 auto;max-width:960px;position:relative;width:100%}@media only screen and (max-width: 992px){.container{width:85%}}@media only screen and (max-width: 480px){.container{width:90%}}code{color:#41403e;color:var(--secondary);background-color:#41403e;background-color:var(--primary-shaded-70);border-radius:3px;font-size:80%;padding:2px 4px}kbd{color:#41403e;color:var(--primary-inverse);background-color:#41403e;background-color:var(--primary);border-radius:3px;font-size:80%;padding:2px 4px}pre{color:#41403e;color:var(--inverse-primary);background-color:#41403e;background-color:var(--primary-shaded-70);border-color:#41403e;border-color:var(--primary-shaded-50);border-radius:3px;border-style:solid;border-width:1px;display:block;font-size:80%;line-height:1.5;overflow-x:auto;padding:1em;white-space:pre;word-break:break-all;word-wrap:break-word}pre code{color:#41403e;color:var(--inverse-primary);background:transparent;display:block;font-size:inherit;padding:initial;white-space:pre}html{color:#41403e;color:var(--primary);font-family:\"Neucha\", sans-serif;font-size:20px}p,a,button,table,thead,tbody,th,tr,td,input,textarea,select,option{font-family:\"Neucha\", sans-serif}h1,h2,h3,h4,h5,h6{font-family:\"Patrick Hand SC\", sans-serif;font-weight:normal}h1{font-size:4rem}h2{font-size:3rem}h3{font-size:2rem}h4{font-size:1.5rem}h5{font-size:1rem}h6{font-size:0.8rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}img{border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;border-color:#41403e;border-color:var(--primary);border-style:solid;border-width:2px;display:block;height:auto;max-width:100%}img.float-left{float:left;margin:1rem 1rem 1rem 0}img.float-right{float:right;margin:1rem 0 1rem 1rem}img.no-responsive{display:initial;height:initial;max-width:initial}img.no-border{border:0;border-radius:0}ol{list-style-type:decimal}ol ol{list-style-type:upper-alpha}ol ol ol{list-style-type:upper-roman}ol ol ol ol{list-style-type:lower-alpha}ol ol ol ol ol{list-style-type:lower-roman}ul{list-style:none;margin-left:0}ul li::before{content:\"-\"}ul li{text-indent:-7px}ul li .badge,ul li [popover-bottom]::after,ul li [popover-left]::after,ul li [popover-right]::after,ul li [popover-top]::after{text-indent:0}ul li::before{left:-7px;position:relative}ul ul li::before{content:\"+\"}ul ul ul li::before{content:\"~\"}ul ul ul ul li::before{content:\"⤍\"}ul ul ul ul ul li::before{content:\"⁎\"}ul.inline li{display:inline;margin-left:5px}table{box-sizing:border-box;max-width:100%;overflow-x:auto;width:100%}@media only screen and (max-width: 480px){table thead tr th{padding:2%}table tbody tr td{padding:2%}}table thead tr th{line-height:1.5;padding:8px;text-align:left;vertical-align:bottom}table tbody tr td{border-top:1px dashed #d9d9d8;line-height:1.5;padding:8px;vertical-align:top}table.table-hover tbody tr:hover{color:#41403e;color:var(--secondary)}table.table-alternating tbody tr:nth-of-type(even){color:#82807c}.border{border-color:#41403e;border-color:var(--primary);border-style:solid;border-width:2px}.border,.border-1,.child-borders>*:nth-child(6n+1){border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px}.border-2,.child-borders>*:nth-child(6n+2){border-bottom-left-radius:185px 25px;border-bottom-right-radius:20px 205px;border-top-left-radius:125px 25px;border-top-right-radius:10px 205px}.border-3,.child-borders>*:nth-child(6n+3){border-bottom-left-radius:225px 15px;border-bottom-right-radius:15px 255px;border-top-left-radius:15px 225px;border-top-right-radius:255px 15px}.border-4,.child-borders>*:nth-child(6n+4){border-bottom-left-radius:25px 115px;border-bottom-right-radius:155px 25px;border-top-left-radius:15px 225px;border-top-right-radius:25px 150px}.border-5,.child-borders>*:nth-child(6n+5){border-bottom-left-radius:20px 115px;border-bottom-right-radius:15px 105px;border-top-left-radius:250px 15px;border-top-right-radius:25px 80px}.border-6,.child-borders>*:nth-child(6n+6){border-bottom-left-radius:15px 225px;border-bottom-right-radius:20px 205px;border-top-left-radius:28px 125px;border-top-right-radius:100px 30px}.child-borders>*{border-color:#41403e;border-color:var(--primary);border-style:solid;border-width:2px}.border-white{border-color:#41403e;border-color:var(--white)}.border-dotted{border-style:dotted}.border-dashed{border-style:dashed}.border-thick{border-width:5px}.border-primary{border-color:#41403e;border-color:var(--primary)}.border-secondary{border-color:#41403e;border-color:var(--secondary)}.border-success{border-color:#41403e;border-color:var(--success)}.border-warning{border-color:#41403e;border-color:var(--warning)}.border-danger{border-color:#41403e;border-color:var(--danger)}.border-muted{border-color:#41403e;border-color:var(--muted)}.shadow{transition:all 235ms ease 0s;box-shadow:15px 28px 25px -18px rgba(0, 0, 0, 0.2)}.shadow.shadow-large{transition:all 235ms ease 0s;box-shadow:20px 38px 34px -26px rgba(0, 0, 0, 0.2)}.shadow.shadow-small{transition:all 235ms ease 0s;box-shadow:10px 19px 17px -13px rgba(0, 0, 0, 0.2)}.shadow.shadow-hover:hover{transform:translate3d(0, 2px, 0);box-shadow:2px 8px 8px -5px rgba(0, 0, 0, 0.3)}.child-shadows>*{transition:all 235ms ease 0s;box-shadow:15px 28px 25px -18px rgba(0, 0, 0, 0.2)}.child-shadows-hover>*{transition:all 235ms ease 0s;box-shadow:15px 28px 25px -18px rgba(0, 0, 0, 0.2)}.child-shadows-hover>*:hover{transform:translate3d(0, 2px, 0);box-shadow:2px 8px 8px -5px rgba(0, 0, 0, 0.3)}.collapsible{display:flex;flex-direction:column}.collapsible:nth-of-type(1){border-top-color:#41403e;border-top-color:var(--muted-light);border-top-style:solid;border-top-width:1px}.collapsible .collapsible-body{border-bottom-color:#41403e;border-bottom-color:var(--muted-light);background-color:#41403e;background-color:var(--white-dark-light-80);transition:all 235ms ease-in-out 0s;border-bottom-style:solid;border-bottom-width:1px;margin:0;max-height:0;opacity:0;overflow:hidden;padding:0 0.75rem}.collapsible input{display:none}.collapsible input:checked+label{color:#41403e;color:var(--primary)}.collapsible input[id^=collapsible]:checked~div.collapsible-body{margin:0;max-height:960px;opacity:1;padding:0.75rem}.collapsible label{color:#41403e;color:var(--primary);border-bottom-color:#41403e;border-bottom-color:var(--muted-light);border-bottom-style:solid;border-bottom-width:1px;display:inline-block;font-weight:600;margin:0 0 -1px;padding:0.75rem;text-align:center}.collapsible label:hover{color:#41403e;color:var(--muted);cursor:pointer}.alert{border-color:#41403e;border-color:var(--primary);border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;border-style:solid;border-width:2px;margin-bottom:20px;padding:15px;width:100%}.alert.dismissible{transition:all 235ms ease-in-out 0s;display:flex;justify-content:space-between;max-height:48rem;overflow:hidden}.alert .btn-close{transition:all 235ms ease-in-out 0s;color:#41403e;color:var(--primary-light-10);cursor:pointer;margin-left:0.75rem}.alert .btn-close:hover,.alert .btn-close:active,.alert .btn-close:focus{color:#41403e;color:var(--primary-dark-10)}.alert-primary{color:#41403e;color:var(--primary-text);background-color:#41403e;background-color:var(--primary-light);border-color:#41403e;border-color:var(--primary)}.alert-primary .btn-close{color:#41403e;color:var(--primary-light-10)}.alert-primary .btn-close:hover,.alert-primary .btn-close:active,.alert-primary .btn-close:focus{color:#41403e;color:var(--primary-dark-10)}.alert-secondary{color:#41403e;color:var(--secondary-text);background-color:#41403e;background-color:var(--secondary-light);border-color:#41403e;border-color:var(--secondary)}.alert-secondary .btn-close{color:#41403e;color:var(--secondary-light-10)}.alert-secondary .btn-close:hover,.alert-secondary .btn-close:active,.alert-secondary .btn-close:focus{color:#41403e;color:var(--secondary-dark-10)}.alert-success{color:#41403e;color:var(--success-text);background-color:#41403e;background-color:var(--success-light);border-color:#41403e;border-color:var(--success)}.alert-success .btn-close{color:#41403e;color:var(--success-light-10)}.alert-success .btn-close:hover,.alert-success .btn-close:active,.alert-success .btn-close:focus{color:#41403e;color:var(--success-dark-10)}.alert-warning{color:#41403e;color:var(--warning-text);background-color:#41403e;background-color:var(--warning-light);border-color:#41403e;border-color:var(--warning)}.alert-warning .btn-close{color:#41403e;color:var(--warning-light-10)}.alert-warning .btn-close:hover,.alert-warning .btn-close:active,.alert-warning .btn-close:focus{color:#41403e;color:var(--warning-dark-10)}.alert-danger{color:#41403e;color:var(--danger-text);background-color:#41403e;background-color:var(--danger-light);border-color:#41403e;border-color:var(--danger)}.alert-danger .btn-close{color:#41403e;color:var(--danger-light-10)}.alert-danger .btn-close:hover,.alert-danger .btn-close:active,.alert-danger .btn-close:focus{color:#41403e;color:var(--danger-dark-10)}.alert-muted{color:#41403e;color:var(--muted-text);background-color:#41403e;background-color:var(--muted-light);border-color:#41403e;border-color:var(--muted)}.alert-muted .btn-close{color:#41403e;color:var(--muted-light-10)}.alert-muted .btn-close:hover,.alert-muted .btn-close:active,.alert-muted .btn-close:focus{color:#41403e;color:var(--muted-dark-10)}.alert-state{display:none}.alert-state:checked+.dismissible{border-width:0;margin:0;max-height:0;opacity:0;padding-bottom:0;padding-top:0}article .article-title{font-size:3rem}article .article-meta{color:#41403e;color:var(--muted-text);font-size:15px}article .article-meta a{color:#41403e;color:var(--muted-text);background-image:none}article .article-meta a:hover{color:#41403e;color:var(--light-dark)}article .text-lead{font-size:30px;line-height:1.3;margin:35px}article button:not(:first-of-type){margin-left:2rem}@media only screen and (max-width: 480px){article button:not(:first-of-type){margin-left:0}}article p{line-height:1.6}.badge{border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;color:#41403e;color:var(--white);background-color:#41403e;background-color:var(--muted);border-color:#41403e;border-color:var(--primary);border:2px solid;border-color:transparent;display:inline-block;font-size:75%;font-weight:700;line-height:1;padding:0.25em 0.4em;text-align:center;vertical-align:baseline;white-space:nowrap}.badge.primary{background-color:#41403e;background-color:var(--primary)}.badge.secondary{background-color:#41403e;background-color:var(--secondary)}.badge.success{background-color:#41403e;background-color:var(--success)}.badge.warning{background-color:#41403e;background-color:var(--warning)}.badge.danger{background-color:#41403e;background-color:var(--danger)}.badge.muted{background-color:#41403e;background-color:var(--muted)}ul.breadcrumb{list-style:none;padding:10px 16px}ul.breadcrumb li{display:inline;font-size:20px}ul.breadcrumb li::before{content:\"\"}ul.breadcrumb li a{color:#41403e;color:var(--secondary);background-image:none;text-decoration:none}ul.breadcrumb li a:hover{text-decoration:underline}ul.breadcrumb li+li::before{content:\"/ \";padding:8px}button,.paper-btn,[type=button]{border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;transition:all 235ms ease 0s;box-shadow:15px 28px 25px -18px rgba(0, 0, 0, 0.2);transition:all 235ms ease-in-out 0s;color:#41403e;color:var(--primary);border-color:#41403e;border-color:var(--primary);background-color:#41403e;background-color:var(--main-background);align-self:center;background-image:none;border-style:solid;border-width:2px;cursor:pointer;display:inline-block;font-size:1rem;outline:none;padding:0.75rem}@media only screen and (max-width: 520px){button,.paper-btn,[type=button]{display:inline-block;margin:0 auto;margin-bottom:1rem;text-align:center}}button.btn-large,.paper-btn.btn-large,[type=button].btn-large{transition:all 235ms ease 0s;box-shadow:20px 38px 34px -26px rgba(0, 0, 0, 0.2);font-size:2rem;padding:1rem}button.btn-small,.paper-btn.btn-small,[type=button].btn-small{transition:all 235ms ease 0s;box-shadow:10px 19px 17px -13px rgba(0, 0, 0, 0.2);font-size:0.75rem;padding:0.5rem}button.btn-block,.paper-btn.btn-block,[type=button].btn-block{display:block;width:100%}button:hover,.paper-btn:hover,[type=button]:hover{transform:translate3d(0, 2px, 0);box-shadow:2px 8px 8px -5px rgba(0, 0, 0, 0.3)}button:focus,.paper-btn:focus,[type=button]:focus{border-color:#41403e;border-color:var(--secondary);border-style:solid;border-width:2px;box-shadow:2px 8px 4px -6px rgba(0, 0, 0, 0.3)}button:active,.paper-btn:active,[type=button]:active{border-color:rgba(0, 0, 0, 0.2);transition:none}button.disabled,button[disabled],.paper-btn.disabled,.paper-btn[disabled],[type=button].disabled,[type=button][disabled]{cursor:not-allowed;opacity:0.5}a{color:#41403e;color:var(--secondary);background-image:linear-gradient(5deg, transparent 65%, #0071de 80%, transparent 90%), linear-gradient(165deg, transparent 5%, #0071de 15%, transparent 25%), linear-gradient(165deg, transparent 45%, #0071de 55%, transparent 65%), linear-gradient(15deg, transparent 25%, #0071de 35%, transparent 50%);background-position:0 90%;background-repeat:repeat-x;background-size:4px 3px;text-decoration:none}a:visited{color:#41403e;color:var(--primary);text-decoration:none}button.btn-primary,.paper-btn.btn-primary,[type=button].btn-primary{color:#41403e;color:var(--primary-text);background-color:#41403e;background-color:var(--primary-light);border-color:#41403e;border-color:var(--primary)}button.btn-primary:hover:active,.paper-btn.btn-primary:hover:active,[type=button].btn-primary:hover:active{background-color:#a8a6a3}button.btn-secondary,.paper-btn.btn-secondary,[type=button].btn-secondary{color:#41403e;color:var(--secondary-text);background-color:#41403e;background-color:var(--secondary-light);border-color:#41403e;border-color:var(--secondary)}button.btn-secondary:hover:active,.paper-btn.btn-secondary:hover:active,[type=button].btn-secondary:hover:active{background-color:#abd6ff}button.btn-success,.paper-btn.btn-success,[type=button].btn-success{color:#41403e;color:var(--success-text);background-color:#41403e;background-color:var(--success-light);border-color:#41403e;border-color:var(--success)}button.btn-success:hover:active,.paper-btn.btn-success:hover:active,[type=button].btn-success:hover:active{background-color:#b7c9a1}button.btn-warning,.paper-btn.btn-warning,[type=button].btn-warning{color:#41403e;color:var(--warning-text);background-color:#41403e;background-color:var(--warning-light);border-color:#41403e;border-color:var(--warning)}button.btn-warning:hover:active,.paper-btn.btn-warning:hover:active,[type=button].btn-warning:hover:active{background-color:#ede49b}button.btn-danger,.paper-btn.btn-danger,[type=button].btn-danger{color:#41403e;color:var(--danger-text);background-color:#41403e;background-color:var(--danger-light);border-color:#41403e;border-color:var(--danger)}button.btn-danger:hover:active,.paper-btn.btn-danger:hover:active,[type=button].btn-danger:hover:active{background-color:#e6a5a1}button.btn-muted,.paper-btn.btn-muted,[type=button].btn-muted{color:#41403e;color:var(--muted-text);background-color:#41403e;background-color:var(--muted-light);border-color:#41403e;border-color:var(--muted)}button.btn-muted:hover:active,.paper-btn.btn-muted:hover:active,[type=button].btn-muted:hover:active{background-color:#caced1}button.btn-primary-outline,.paper-btn.btn-primary-outline,[type=button].btn-primary-outline{background-color:white;border-color:#a8a6a3;color:#41403e}button.btn-primary-outline:hover,.paper-btn.btn-primary-outline:hover,[type=button].btn-primary-outline:hover{background-color:#c1c0bd;border-color:#41403e}button.btn-primary-outline:hover:active,.paper-btn.btn-primary-outline:hover:active,[type=button].btn-primary-outline:hover:active{background-color:#a8a6a3}button.btn-secondary-outline,.paper-btn.btn-secondary-outline,[type=button].btn-secondary-outline{background-color:white;border-color:#abd6ff;color:#0057ab}button.btn-secondary-outline:hover,.paper-btn.btn-secondary-outline:hover,[type=button].btn-secondary-outline:hover{background-color:#deefff;border-color:#0071de}button.btn-secondary-outline:hover:active,.paper-btn.btn-secondary-outline:hover:active,[type=button].btn-secondary-outline:hover:active{background-color:#abd6ff}button.btn-success-outline,.paper-btn.btn-success-outline,[type=button].btn-success-outline{background-color:white;border-color:#b7c9a1;color:#6c844d}button.btn-success-outline:hover,.paper-btn.btn-success-outline:hover,[type=button].btn-success-outline:hover{background-color:#d0dbc2;border-color:#86a361}button.btn-success-outline:hover:active,.paper-btn.btn-success-outline:hover:active,[type=button].btn-success-outline:hover:active{background-color:#b7c9a1}button.btn-warning-outline,.paper-btn.btn-warning-outline,[type=button].btn-warning-outline{background-color:white;border-color:#ede49b;color:#cab925}button.btn-warning-outline:hover,.paper-btn.btn-warning-outline:hover,[type=button].btn-warning-outline:hover{background-color:#f5f0c6;border-color:#ddcd45}button.btn-warning-outline:hover:active,.paper-btn.btn-warning-outline:hover:active,[type=button].btn-warning-outline:hover:active{background-color:#ede49b}button.btn-danger-outline,.paper-btn.btn-danger-outline,[type=button].btn-danger-outline{background-color:white;border-color:#e6a5a1;color:#7f2722}button.btn-danger-outline:hover,.paper-btn.btn-danger-outline:hover,[type=button].btn-danger-outline:hover{background-color:#f0cbc9;border-color:#a7342d}button.btn-danger-outline:hover:active,.paper-btn.btn-danger-outline:hover:active,[type=button].btn-danger-outline:hover:active{background-color:#e6a5a1}button.btn-muted-outline,.paper-btn.btn-muted-outline,[type=button].btn-muted-outline{background-color:white;border-color:#caced1;color:#6c757d}button.btn-muted-outline:hover,.paper-btn.btn-muted-outline:hover,[type=button].btn-muted-outline:hover{background-color:#e6e7e9;border-color:#868e96}button.btn-muted-outline:hover:active,.paper-btn.btn-muted-outline:hover:active,[type=button].btn-muted-outline:hover:active{background-color:#caced1}.card{transition:all 235ms ease 0s;box-shadow:15px 28px 25px -18px rgba(0, 0, 0, 0.2);border-color:#41403e;border-color:var(--muted-light);-webkit-backface-visibility:hidden;backface-visibility:hidden;border-style:solid;border-width:2px;display:flex;flex-direction:column;position:relative;will-change:transform;word-wrap:break-word}.card:hover{transform:translate3d(0, 2px, 0);box-shadow:2px 8px 8px -5px rgba(0, 0, 0, 0.3)}.card .card-header,.card .card-footer{background-color:#41403e;background-color:var(--white-dark);border-color:#41403e;border-color:var(--muted-light);padding:0.75rem 1.25rem}.card .card-header{border-bottom-style:solid;border-bottom-width:2px}.card .card-footer{border-top-style:solid;border-top-width:2px}.card .card-body{flex:1 1 auto;padding:1.25rem}.card .card-body .card-title,.card .card-body h4{margin-bottom:0.5rem;margin-top:0}.card .card-body .card-subtitle,.card .card-body h5{color:#0071de;margin-bottom:0.5rem;margin-top:0}.card .card-body .card-text,.card .card-body p{margin-bottom:1rem;margin-top:0}.card .card-body .card-link+.card-link,.card .card-body a+a{margin-left:1.25rem}.card .image-top,.card .image-bottom,.card img{border:0;border-radius:0}input,select,textarea{color:#41403e;color:var(--primary);border-color:#41403e;border-color:var(--primary);background:transparent;border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-style:solid;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;border-width:2px;display:block;font-size:1rem;outline:none;padding:0.5rem}input:focus,select:focus,textarea:focus{border-color:#41403e;border-color:var(--secondary);border-style:solid;border-width:2px}select{height:2.35rem}.disabled,input.disabled,input[disabled],select.disabled,select[disabled],textarea.disabled,textarea[disabled]{cursor:not-allowed;opacity:0.5}.form-group{margin-bottom:1rem}.form-group>label,.form-group legend{display:inline-block;margin-bottom:0.5rem}.form-group .input-block{width:100%}.form-group textarea{max-height:90vh;max-width:100%}.form-group textarea.no-resize{resize:none}.form-group .paper-radio,.form-group .paper-check{cursor:pointer;display:block;margin-bottom:0.5rem;}.form-group .paper-radio input,.form-group .paper-check input{border:0;height:1px;margin:-1px;opacity:0;overflow:hidden;padding:0;position:absolute;width:1px;}.form-group .paper-radio input+span,.form-group .paper-check input+span{display:block}.form-group .paper-radio input+span::before,.form-group .paper-check input+span::before{border-color:#41403e;border-color:var(--primary);border-style:solid;border-width:2px;content:\"\";display:inline-block;height:1rem;margin-right:0.75em;position:relative;vertical-align:-0.25em;width:1rem}.form-group .paper-radio input[type=radio]+span::before,.form-group .paper-check input[type=radio]+span::before{border-bottom-left-radius:0.7rem 1rem;border-bottom-right-radius:1rem 0.9rem;border-top-left-radius:1rem 1rem;border-top-right-radius:1rem 0.6rem}.form-group .paper-radio input[type=radio]:checked+span::before,.form-group .paper-check input[type=radio]:checked+span::before{background:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20viewBox%3D'0%200%20100%20100'%3E%3Cpath%20fill%3D'%230071de'%20d%3D'M49.346,46.341c-3.79-2.005,3.698-10.294,7.984-8.89%20c8.713,2.852,4.352,20.922-4.901,20.269c-4.684-0.33-12.616-7.405-14.38-11.818c-2.375-5.938,7.208-11.688,11.624-13.837%20c9.078-4.42,18.403-3.503,22.784,6.651c4.049,9.378,6.206,28.09-1.462,36.276c-7.091,7.567-24.673,2.277-32.357-1.079%20c-11.474-5.01-24.54-19.124-21.738-32.758c3.958-19.263,28.856-28.248,46.044-23.244c20.693,6.025,22.012,36.268,16.246,52.826%20c-5.267,15.118-17.03,26.26-33.603,21.938c-11.054-2.883-20.984-10.949-28.809-18.908C9.236,66.096,2.704,57.597,6.01,46.371%20c3.059-10.385,12.719-20.155,20.892-26.604C40.809,8.788,58.615,1.851,75.058,12.031c9.289,5.749,16.787,16.361,18.284,27.262%20c0.643,4.698,0.646,10.775-3.811,13.746'%3E%3C/path%3E%3C/svg%3E\") left center no-repeat}.form-group .paper-radio input[type=checkbox],.form-group .paper-check input[type=checkbox]{}.form-group .paper-radio input[type=checkbox]+span::before,.form-group .paper-check input[type=checkbox]+span::before{border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px}.form-group .paper-radio input[type=checkbox]:checked+span::before,.form-group .paper-check input[type=checkbox]:checked+span::before{background:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20viewBox%3D'0%200%20100%20100'%3E%3Cpath%20stroke%3D'%230071de'%20fill-opacity%3D'0'%20stroke-width%3D'16'%20d%3D'm13,62c0.61067,1.6%201.3045,2.3045%201.75717,2.75716c0.72683,0.72684%201.24283,1.24284%202.07617,2.07617c0.54133,0.54133%201.04116,1.06035%201.82833,1.82383c0.5781,0.5607%201.00502,0.96983%202.02633,1.74417c0.55877,0.42365%201.191,0.84034%201.884,1.284c1.16491,0.74577%201.59777,1.00147%202.5,1.55067c0.4692,0.28561%201.43689,0.86868%201.93067,1.16534c0.99711,0.59904%201.99667,1.19755%202.49283,1.49866c0.98501,0.59779%201.47073,0.89648%201.94733,1.2c1.3971,0.88972%201.83738,1.19736%202.7,1.7955c0.42201,0.29262%201.24022,0.87785%202.05583,1.41917c0.79531,0.52785%201.59376,1.0075%202.38,1.43867c0.74477,0.40842%201.45167,0.75802%202.37817,1.22517c0.76133,0.38387%201.54947,0.82848%202.40717,1.41084c0.7312,0.49647%201.49563,1.08231%202.27884,1.258c0.35564,0.07978%200.14721,-0.95518%200.35733,-1.86867c0.18092,-0.78651%200.98183,-1.2141%200.99983,-2.07867c0.02073,-0.99529%200.07916,-1.79945%200.42533,-2.56133c0.43607,-0.95973%200.53956,-1.66774%200.79617,-2.68183c0.18888,-0.74645%200.39764,-1.31168%200.7785,-2.6235c0.20865,-0.71867%200.41483,-1.48614%200.708,-2.28c0.15452,-0.41843%200.77356,-1.73138%201.348,-2.64133c0.30581,-0.48443%200.65045,-0.97043%201.0065,-1.4745c0.74776,-1.05863%201.1531,-1.60163%201.9375,-2.77084c0.40621,-0.60548%200.80272,-1.23513%201.2045,-1.8765c0.40757,-0.65062%200.81464,-1.31206%201.2315,-1.9755c0.41946,-0.66757%200.83374,-1.34258%201.73067,-2.648c0.44696,-0.65053%200.91436,-1.28356%201.386,-1.9095c0.46972,-0.6234%200.94725,-1.2364%201.422,-1.8465c0.94116,-1.20947%201.86168,-2.40844%202.30367,-3.0105c0.438,-0.59664%200.86246,-1.19396%201.27501,-1.7895c0.40743,-0.58816%200.80352,-1.17234%201.185,-1.7535c1.10526,-1.68381%201.44079,-2.23511%201.77633,-2.7705c0.32878,-0.52461%200.96306,-1.5459%201.27467,-2.04c0.60654,-0.96177%201.20782,-1.88193%201.51051,-2.325c0.59013,-0.86381%201.17888,-1.68032%201.46416,-2.075c0.5498,-0.76063%201.31747,-1.8231%201.77883,-2.4895c0.43918,-0.63437%200.85266,-1.25267%201.45717,-2.15717c0.59549,-0.891%200.96531,-1.46814%201.51466,-2.22933c0.58413,-0.80936%201.12566,-1.40253%201.83801,-2.12333c0.61304,-0.62031%200.45171,-1.48306%200.7045,-2.34733c0.25668,-0.87762%200.75447,-1.62502%201,-2.40983c0.25128,-0.8032%200.7633,-1.39453%201.33217,-2.25417c0.54528,-0.82398%200.73415,-1.6714%201.31516,-2.336c0.55639,-0.63644%201.38658,-1.22588%201.8595,-1.9c0.5082,-0.72441%200.78867,-1.4%201.60266,-1.56667l0.71184,-0.4905'%3E%3C/path%3E%3C/svg%3E\") left center no-repeat}.form-group .paper-switch-label,.form-group .paper-switch-2-label{cursor:pointer;float:left}.form-group .paper-switch-label{margin:-6px 10px 0 0}.form-group .paper-switch-2-label{margin:0 10px 0 0}.form-group .paper-switch,.form-group .paper-switch-2{display:block;float:left;margin:0 10px 0 0;position:relative}.form-group .paper-switch input,.form-group .paper-switch-2 input{height:0;opacity:0;width:0}.form-group .paper-switch input:checked+.paper-switch-slider,.form-group .paper-switch-2 input:checked+.paper-switch-slider{background-color:#41403e;background-color:var(--success-light)}.form-group .paper-switch input:checked+.paper-switch-slider::before,.form-group .paper-switch-2 input:checked+.paper-switch-slider::before{transform:translateX(26px)}.form-group .paper-switch input:focus+.paper-switch-slider,.form-group .paper-switch-2 input:focus+.paper-switch-slider{box-shadow:0 0 3px #0071de}.form-group .paper-switch .paper-switch-slider,.form-group .paper-switch-2 .paper-switch-slider{border-color:#41403e;border-color:var(--primary);border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-style:solid;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;border-width:2px;bottom:0;cursor:pointer;left:0;position:absolute;right:0;top:0;transition:0.4s}.form-group .paper-switch .paper-switch-slider::before,.form-group .paper-switch-2 .paper-switch-slider::before{background:#41403e;background:var(--secondary);border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;content:\"\";left:4px;position:absolute;transition:0.4s}.form-group .paper-switch .paper-switch-slider.round,.form-group .paper-switch-2 .paper-switch-slider.round{border-color:#41403e;border-color:var(--primary);border-bottom-left-radius:0.7rem 1rem;border-bottom-right-radius:1rem 0.9rem;border-style:solid;border-top-left-radius:1rem 1rem;border-top-right-radius:1rem 0.6rem;border-width:2px}.form-group .paper-switch .paper-switch-slider.round::before,.form-group .paper-switch-2 .paper-switch-slider.round::before{background:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20viewBox%3D'0%200%20100%20100'%3E%3Cpath%20fill%3D'%230071de'%20d%3D'M49.346,46.341c-3.79-2.005,3.698-10.294,7.984-8.89%20c8.713,2.852,4.352,20.922-4.901,20.269c-4.684-0.33-12.616-7.405-14.38-11.818c-2.375-5.938,7.208-11.688,11.624-13.837%20c9.078-4.42,18.403-3.503,22.784,6.651c4.049,9.378,6.206,28.09-1.462,36.276c-7.091,7.567-24.673,2.277-32.357-1.079%20c-11.474-5.01-24.54-19.124-21.738-32.758c3.958-19.263,28.856-28.248,46.044-23.244c20.693,6.025,22.012,36.268,16.246,52.826%20c-5.267,15.118-17.03,26.26-33.603,21.938c-11.054-2.883-20.984-10.949-28.809-18.908C9.236,66.096,2.704,57.597,6.01,46.371%20c3.059-10.385,12.719-20.155,20.892-26.604C40.809,8.788,58.615,1.851,75.058,12.031c9.289,5.749,16.787,16.361,18.284,27.262%20c0.643,4.698,0.646,10.775-3.811,13.746'%3E%3C/path%3E%3C/svg%3E\") left center no-repeat;border-bottom-left-radius:0.7rem 1rem;border-bottom-right-radius:1rem 0.9rem;border-top-left-radius:1rem 1rem;border-top-right-radius:1rem 0.6rem;left:4px}.form-group .paper-switch{height:12px;width:60px}.form-group .paper-switch .paper-switch-slider::before{bottom:-6px;height:20px;width:20px}.form-group .paper-switch .paper-switch-slider.round::before{bottom:-7px;height:23px;width:23px}.form-group .paper-switch-2{height:22px;width:50px}.form-group .paper-switch-2 .paper-switch-slider::before{bottom:2px;height:14px;width:14px}.form-group .paper-switch-2 .paper-switch-slider.round::before{bottom:2px;height:14px;width:14px}.form-group .paper-switch-tile{cursor:pointer;display:block;float:left;height:80px;margin:40px 0 0 40px;perspective:1000px;position:relative;transform:translate(-50%, -50%);transform-style:preserve-3d;width:80px}.form-group .paper-switch-tile:hover .paper-switch-tile-card{box-shadow:2px 8px 4px -5px rgba(0, 0, 0, 0.2);transform:rotateX(30deg)}.form-group .paper-switch-tile:hover:checked+.paper-switch-tile-card{background-color:transparent;box-shadow:0 10px 15px -15px rgba(0, 0, 0, 0.9);transform:rotateX(150deg)}.form-group .paper-switch-tile input{display:none}.form-group .paper-switch-tile input:checked+.paper-switch-tile-card{transform:rotateX(180deg)}.form-group .paper-switch-tile-card{background-color:transparent;border-color:transparent;height:100%;position:relative;transform-style:preserve-3d;transition:all 600ms;width:100%}.form-group .paper-switch-tile-card div{-webkit-backface-visibility:hidden;backface-visibility:hidden;box-shadow:2px 8px 8px -5px rgba(0, 0, 0, 0.3);height:100%;line-height:70px;position:absolute;text-align:center;width:100%}.form-group .paper-switch-tile-card .paper-switch-tile-card-back{transform:rotateX(180deg)}.form-group input[type=range]{-webkit-appearance:none;-moz-appearance:none;appearance:none;border-width:0;padding:0;}.form-group input[type=range]::-webkit-slider-runnable-track{background:#41403e;background:var(--secondary);border-color:#41403e;border-color:var(--primary);border-radius:18px;border-style:solid;border-width:1px;box-shadow:1px 1px 1px #000, 0 0 1px #0d0d0d;cursor:pointer;height:8px;margin:10px 0;width:100%}.form-group input[type=range]::-webkit-slider-thumb{background:#41403e;background:var(--white);border-color:#41403e;border-color:var(--primary);-webkit-appearance:none;appearance:none;border-bottom-left-radius:0.7rem 1rem;border-bottom-right-radius:1rem 0.9rem;border-style:solid;border-top-left-radius:1rem 1rem;border-top-right-radius:1rem 0.6rem;border-width:1px;box-shadow:1px 1px 1px #000, 0 0 1px #0d0d0d;cursor:pointer;height:36px;margin-top:-14px;width:16px}.form-group input[type=range]::-moz-range-track{background:#41403e;background:var(--secondary);border-color:#41403e;border-color:var(--primary);border-radius:18px;box-shadow:1px 1px 1px #000, 0 0 1px #0d0d0d;cursor:pointer;height:8px;width:100%}.form-group input[type=range]::-moz-range-thumb{background:#41403e;background:var(--white);border-color:#41403e;border-color:var(--primary);border-bottom-left-radius:0.7rem 1rem;border-bottom-right-radius:1rem 0.9rem;border-style:solid;border-top-left-radius:1rem 1rem;border-top-right-radius:1rem 0.6rem;border-width:1px;box-shadow:1px 1px 1px #000, 0 0 1px #0d0d0d;cursor:pointer;height:36px;width:16px}.form-group input[type=range]::-ms-track{background:transparent;border-color:transparent;border-width:16px 0;color:transparent;cursor:pointer;height:8px;width:100%}.form-group input[type=range]::-ms-fill-lower,.form-group input[type=range]::-ms-fill-upper{background:#41403e;background:var(--secondary);border-color:#41403e;border-color:var(--primary);border-radius:18px;border-style:solid;border-width:1px;box-shadow:1px 1px 1px #000, 0 0 1px #0d0d0d}.form-group input[type=range]::-ms-thumb{background:#41403e;background:var(--white);border-color:#41403e;border-color:var(--primary);border:1px solid #41403e;border-bottom-left-radius:0.7rem 1rem;border-bottom-right-radius:1rem 0.9rem;border-style:solid;border-top-left-radius:1rem 1rem;border-top-right-radius:1rem 0.6rem;border-width:1px;box-shadow:1px 1px 1px #000, 0 0 1px #0d0d0d;cursor:pointer;height:36px;width:16px}fieldset.form-group{border:0;padding:0}.modal{transition:opacity 235ms ease-in-out 0s;background:rgba(0, 0, 0, 0.6);bottom:0;flex:1 1 auto;left:0;opacity:0;position:fixed;right:0;text-align:left;top:0;visibility:hidden;word-wrap:break-word;z-index:12}.modal-bg{bottom:0;cursor:pointer;left:0;position:absolute;right:0;top:0}.modal .modal-body{color:#41403e;color:var(--primary);background:#41403e;background:var(--main-background);border-color:#41403e;border-color:var(--muted-light);transition:all 235ms ease-in-out 0s;-webkit-backface-visibility:hidden;backface-visibility:hidden;border:2px solid;left:50%;padding:1.25rem;position:absolute;top:0;transform:translate(-50%, -50%)}@media only screen and (max-width: 768px){.modal .modal-body{box-sizing:border-box;width:90%}}.modal .btn-close{color:#41403e;color:var(--primary-light);transition:all 235ms ease-in-out 0s;cursor:pointer;font-size:30px;height:1.1rem;position:absolute;right:1rem;text-decoration:none;top:1rem;width:1.1rem}.modal .btn-close:hover,.modal .btn-close:active,.modal .btn-close:focus{color:#41403e;color:var(--primary)}.modal h4,.modal .modal-title{margin-bottom:0.5rem;margin-top:0}.modal h5,.modal .modal-subtitle{color:#41403e;color:var(--secondary);margin-bottom:0.5rem;margin-top:0}.modal p,.modal .modal-text{margin-bottom:1rem;margin-top:0}.modal .modal-link+.modal-link,.modal a+a{margin-left:1.25rem}.modal .paper-btn{background:#41403e;background:var(--main-background);display:inline-block;text-decoration:none}.modal .modal-link,.modal a{background-image:linear-gradient(5deg, transparent 65%, #0071de 80%, transparent 90%), linear-gradient(165deg, transparent 5%, #0071de 15%, transparent 25%), linear-gradient(165deg, transparent 45%, #0071de 55%, transparent 65%), linear-gradient(15deg, transparent 25%, #0071de 35%, transparent 50%);background-position:0 90%;background-repeat:repeat-x;background-size:4px 3px;cursor:pointer;text-decoration:none}.modal .modal-link:hover,.modal .modal-link:focus,.modal .modal-link:visited,.modal a:hover,.modal a:focus,.modal a:visited{color:#41403e;color:var(--primary);text-decoration:none}.modal-state{display:none}.modal-state:checked+.modal{opacity:1;visibility:visible}.modal-state:checked+.modal .modal-body{top:50%}[popover-top],[popover-right],[popover-bottom],[popover-left]{margin:24px;position:relative}[popover-top]:hover::after,[popover-right]:hover::after,[popover-bottom]:hover::after,[popover-left]:hover::after{opacity:1;transition:opacity 0.2s ease-out}[popover-top]::after,[popover-right]::after,[popover-bottom]::after,[popover-left]::after{border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;transition:opacity 235ms ease-in-out 0s;background-color:#41403e;background-color:var(--light-dark);border-color:#41403e;border-color:var(--primary);border-style:solid;border-width:2px;color:white;font-size:0.7em;left:50%;min-width:80px;opacity:0;padding:4px 2px;position:absolute;text-align:center;top:-6px;transform:translateX(-50%) translateY(-100%)}[popover-left]::before{left:0;margin-left:-12px;top:50%;transform:translateY(-50%) rotate(-90deg)}[popover-left]::after{content:attr(popover-left);left:0;margin-left:-8px;top:50%;transform:translateX(-100%) translateY(-50%)}[popover-right]::before{left:100%;margin-left:1px;top:50%;transform:translatey(-50%) rotate(90deg)}[popover-right]::after{content:attr(popover-right);left:100%;margin-left:8px;top:50%;transform:translateX(0%) translateY(-50%)}[popover-top]::before{left:50%}[popover-top]::after{content:attr(popover-top);left:50%}[popover-bottom]::before{margin-top:8px;top:100%;transform:translateX(-50%) translatey(-100%) rotate(-180deg)}[popover-bottom]::after{content:attr(popover-bottom);margin-top:8px;top:100%;transform:translateX(-50%) translateY(0%)}.progress{border-bottom-left-radius:20px 115px;border-bottom-right-radius:15px 105px;border-top-left-radius:250px 15px;border-top-right-radius:25px 80px;border-color:#41403e;border-color:var(--primary);border:2px solid;box-shadow:2px 8px 8px -5px rgba(0, 0, 0, 0.3);height:1.2rem;overflow:hidden;width:100%}.progress .bar{border-bottom-left-radius:20px 115px;border-bottom-right-radius:15px 105px;border-top-left-radius:250px 15px;border-top-right-radius:25px 80px;transition:all 235ms ease-in-out 0s;background-color:#41403e;background-color:var(--primary-light);border-color:#41403e;border-color:var(--primary);border-right:2px solid;display:flex;flex-direction:column;font-size:0.6rem;height:100%;justify-content:center;text-align:center;width:0%}.progress .bar.striped{background:repeating-linear-gradient(45deg, #c1c0bd, #c1c0bd 0.25rem, #a8a6a3 0.25rem, #a8a6a3 0.5rem)}.progress .bar.primary{background-color:#41403e;background-color:var(--primary-light)}.progress .bar.primary.striped{background:repeating-linear-gradient(45deg, #c1c0bd, #c1c0bd 0.25rem, #a8a6a3 0.25rem, #a8a6a3 0.5rem)}.progress .bar.secondary{background-color:#41403e;background-color:var(--secondary-light)}.progress .bar.secondary.striped{background:repeating-linear-gradient(45deg, #deefff, #deefff 0.25rem, #abd6ff 0.25rem, #abd6ff 0.5rem)}.progress .bar.success{background-color:#41403e;background-color:var(--success-light)}.progress .bar.success.striped{background:repeating-linear-gradient(45deg, #d0dbc2, #d0dbc2 0.25rem, #b7c9a1 0.25rem, #b7c9a1 0.5rem)}.progress .bar.warning{background-color:#41403e;background-color:var(--warning-light)}.progress .bar.warning.striped{background:repeating-linear-gradient(45deg, #f5f0c6, #f5f0c6 0.25rem, #ede49b 0.25rem, #ede49b 0.5rem)}.progress .bar.danger{background-color:#41403e;background-color:var(--danger-light)}.progress .bar.danger.striped{background:repeating-linear-gradient(45deg, #f0cbc9, #f0cbc9 0.25rem, #e6a5a1 0.25rem, #e6a5a1 0.5rem)}.progress .bar.muted{background-color:#41403e;background-color:var(--muted-light)}.progress .bar.muted.striped{background:repeating-linear-gradient(45deg, #e6e7e9, #e6e7e9 0.25rem, #caced1 0.25rem, #caced1 0.5rem)}.progress .bar.w-0{width:0%}.progress .bar.w-1{width:1%}.progress .bar.w-2{width:2%}.progress .bar.w-3{width:3%}.progress .bar.w-4{width:4%}.progress .bar.w-5{width:5%}.progress .bar.w-6{width:6%}.progress .bar.w-7{width:7%}.progress .bar.w-8{width:8%}.progress .bar.w-9{width:9%}.progress .bar.w-10{width:10%}.progress .bar.w-11{width:11%}.progress .bar.w-12{width:12%}.progress .bar.w-13{width:13%}.progress .bar.w-14{width:14%}.progress .bar.w-15{width:15%}.progress .bar.w-16{width:16%}.progress .bar.w-17{width:17%}.progress .bar.w-18{width:18%}.progress .bar.w-19{width:19%}.progress .bar.w-20{width:20%}.progress .bar.w-21{width:21%}.progress .bar.w-22{width:22%}.progress .bar.w-23{width:23%}.progress .bar.w-24{width:24%}.progress .bar.w-25{width:25%}.progress .bar.w-26{width:26%}.progress .bar.w-27{width:27%}.progress .bar.w-28{width:28%}.progress .bar.w-29{width:29%}.progress .bar.w-30{width:30%}.progress .bar.w-31{width:31%}.progress .bar.w-32{width:32%}.progress .bar.w-33{width:33%}.progress .bar.w-34{width:34%}.progress .bar.w-35{width:35%}.progress .bar.w-36{width:36%}.progress .bar.w-37{width:37%}.progress .bar.w-38{width:38%}.progress .bar.w-39{width:39%}.progress .bar.w-40{width:40%}.progress .bar.w-41{width:41%}.progress .bar.w-42{width:42%}.progress .bar.w-43{width:43%}.progress .bar.w-44{width:44%}.progress .bar.w-45{width:45%}.progress .bar.w-46{width:46%}.progress .bar.w-47{width:47%}.progress .bar.w-48{width:48%}.progress .bar.w-49{width:49%}.progress .bar.w-50{width:50%}.progress .bar.w-51{width:51%}.progress .bar.w-52{width:52%}.progress .bar.w-53{width:53%}.progress .bar.w-54{width:54%}.progress .bar.w-55{width:55%}.progress .bar.w-56{width:56%}.progress .bar.w-57{width:57%}.progress .bar.w-58{width:58%}.progress .bar.w-59{width:59%}.progress .bar.w-60{width:60%}.progress .bar.w-61{width:61%}.progress .bar.w-62{width:62%}.progress .bar.w-63{width:63%}.progress .bar.w-64{width:64%}.progress .bar.w-65{width:65%}.progress .bar.w-66{width:66%}.progress .bar.w-67{width:67%}.progress .bar.w-68{width:68%}.progress .bar.w-69{width:69%}.progress .bar.w-70{width:70%}.progress .bar.w-71{width:71%}.progress .bar.w-72{width:72%}.progress .bar.w-73{width:73%}.progress .bar.w-74{width:74%}.progress .bar.w-75{width:75%}.progress .bar.w-76{width:76%}.progress .bar.w-77{width:77%}.progress .bar.w-78{width:78%}.progress .bar.w-79{width:79%}.progress .bar.w-80{width:80%}.progress .bar.w-81{width:81%}.progress .bar.w-82{width:82%}.progress .bar.w-83{width:83%}.progress .bar.w-84{width:84%}.progress .bar.w-85{width:85%}.progress .bar.w-86{width:86%}.progress .bar.w-87{width:87%}.progress .bar.w-88{width:88%}.progress .bar.w-89{width:89%}.progress .bar.w-90{width:90%}.progress .bar.w-91{width:91%}.progress .bar.w-92{width:92%}.progress .bar.w-93{width:93%}.progress .bar.w-94{width:94%}.progress .bar.w-95{width:95%}.progress .bar.w-96{width:96%}.progress .bar.w-97{width:97%}.progress .bar.w-98{width:98%}.progress .bar.w-99{width:99%}.progress .bar.w-100{width:100%}.progress .bar.w-0,.progress .bar.w-100{border-right:0}.tabs .content{display:none;flex-basis:100%;padding:0.75rem 0 0}.tabs input{display:none}.tabs input:checked+label{color:#41403e;color:var(--primary);border-bottom-color:#41403e;border-bottom-color:var(--secondary);border-bottom-style:solid;border-bottom-width:3px}.tabs input[id$=tab1]:checked~div[id$=content1]{display:block}.tabs input[id$=tab2]:checked~div[id$=content2]{display:block}.tabs input[id$=tab3]:checked~div[id$=content3]{display:block}.tabs input[id$=tab4]:checked~div[id$=content4]{display:block}.tabs input[id$=tab5]:checked~div[id$=content5]{display:block}.tabs label{color:#41403e;color:var(--primary-light);display:inline-block;font-weight:600;margin:0 0 -1px;padding:0.75rem;text-align:center}.tabs label:hover{color:#41403e;color:var(--muted);cursor:pointer}.margin{margin:1rem}.margin-top{margin-top:1rem}.margin-top-large{margin-top:2rem}.margin-top-small{margin-top:0.5rem}.margin-top-none{margin-top:0}.margin-right{margin-right:1rem}.margin-right-large{margin-right:2rem}.margin-right-small{margin-right:0.5rem}.margin-right-none{margin-right:0}.margin-bottom{margin-bottom:1rem}.margin-bottom-large{margin-bottom:2rem}.margin-bottom-small{margin-bottom:0.5rem}.margin-bottom-none{margin-bottom:0}.margin-left{margin-left:1rem}.margin-left-large{margin-left:2rem}.margin-left-small{margin-left:0.5rem}.margin-left-none{margin-left:0}.margin-large{margin:2rem}.margin-small{margin:0.5rem}.margin-none{margin:0}.padding{padding:1rem}.padding-top{padding-top:1rem}.padding-top-large{padding-top:2rem}.padding-top-small{padding-top:0.5rem}.padding-top-none{padding-top:0}.padding-right{padding-right:1rem}.padding-right-large{padding-right:2rem}.padding-right-small{padding-right:0.5rem}.padding-right-none{padding-right:0}.padding-bottom{padding-bottom:1rem}.padding-bottom-large{padding-bottom:2rem}.padding-bottom-small{padding-bottom:0.5rem}.padding-bottom-none{padding-bottom:0}.padding-left{padding-left:1rem}.padding-left-large{padding-left:2rem}.padding-left-small{padding-left:0.5rem}.padding-left-none{padding-left:0}.padding-large{padding:2rem}.padding-small{padding:0.5rem}.padding-none{padding:0}nav{background-color:#41403e;background-color:var(--main-background);display:flex;padding:0.3rem;position:relative;width:100%;z-index:100}@media only screen and (max-width: 768px){nav{display:block}}nav .bar1,nav .bar2,nav .bar3{background-color:#41403e;background-color:var(--primary);border-color:#41403e;border-color:var(--primary);color:#41403e;color:var(--primary);border-bottom-left-radius:15px 5px;border-bottom-right-radius:15px 3px;margin:6px 0;transition:0.4s;width:2rem}nav .collapsible input[id^=collapsible]:checked+button .bar1,nav .collapsible input[id^=collapsible]:checked+label .bar1{transform:rotate(-45deg) translate(-9px, 7px)}nav .collapsible input[id^=collapsible]:checked+button .bar2,nav .collapsible input[id^=collapsible]:checked+label .bar2{opacity:0}nav .collapsible input[id^=collapsible]:checked+button .bar3,nav .collapsible input[id^=collapsible]:checked+label .bar3{transform:rotate(45deg) translate(-8px, -9px)}nav.split-nav{justify-content:space-between}nav.fixed{left:0;position:fixed;right:0;top:0}nav div{margin:0 1rem}nav ul.inline{margin-bottom:0;margin-top:10px;padding:0}nav ul.inline li{display:inline-block;margin:0 0.5rem}@media only screen and (max-width: 768px){nav ul.inline li{display:block;margin:1rem 0}}nav a{color:#41403e;color:var(--primary);border-bottom-color:#41403e;border-bottom-color:var(--primary);background-image:none;border-bottom-left-radius:15px 3px;border-bottom-right-radius:15px 5px;border-bottom-style:solid;border-bottom-width:5px;padding-bottom:0.1rem}nav a:hover{border-color:#41403e;border-color:var(--primary-light);border-bottom-style:solid;border-bottom-width:5px}nav ul.inline li a{font-size:1.3rem}nav ul.inline li::before{content:\"\"}@media only screen and (max-width: 992px){nav ul{text-align:center}}nav .nav-brand h1,nav .nav-brand h2,nav .nav-brand h3,nav .nav-brand h4,nav .nav-brand h5,nav .nav-brand h6{margin:0;margin-bottom:0.2rem}@media only screen and (max-width: 768px){nav .collapsible{width:100%}}nav .collapsible input[id^=collapsible]:checked~div.collapsible-body{margin:0;max-height:960px;opacity:1;padding:0}nav .collapsible:nth-of-type(1),nav .collapsible .collapsible-body{border:0}@media only screen and (min-width: 769px){nav .collapsible:nth-of-type(1),nav .collapsible .collapsible-body{display:contents}}nav div.collapsible-body{padding:none}nav .collapsible label{border-color:#41403e;border-color:var(--primary);border-bottom-left-radius:15px 255px;border-bottom-right-radius:225px 15px;border-style:solid;border-top-left-radius:255px 15px;border-top-right-radius:15px 225px;border-width:2px}nav .collapsible>button{border:0}nav .collapsible>button,nav .collapsible>label{background-color:#41403e;background-color:var(--main-background);display:none;font-size:0.5rem;margin-right:1rem;padding:0.25rem;position:absolute;right:0;top:0.2rem}@media only screen and (max-width: 768px){nav .collapsible>button,nav .collapsible>label{display:block}}";

const Router = createRouter();
const AppShell = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * true wenn das Tag ohne alt Attribute deklariert wurde
     */
    this.createAriaLabel = false;
    /**
     * true wenn das Tag ohne title Attribut deklariert wurde
     */
    this.createTitleText = false;
    /**
     * initial computed taborder
     */
    this.taborder = "0";
    this.options = {
      disabledHostClass: "honey-news-disabled",
      enabledHostClass: "honey-news",
      disabledTitleText: "News Reader nicht verfügbar",
      titleText: "News Reader",
      ariaLabel: "Neuigkeiten der abonierten Feeds",
    };
    /**
     * enable console logging
     */
    this.verbose = false;
  }
  connectedCallback() {
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || null;
    this.createTitleText = !this.hostElement.title;
    this.createAriaLabel = !this.hostElement["aria-label"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
  }
  createNewTitleText() {
    // if (this.) {
    //   return this.options.disabledTitleText;
    // } else {
    return this.options.titleText;
    // }
  }
  getTitleText() {
    if (this.createTitleText) {
      return this.createNewTitleText();
    }
    else {
      return this.hostElement.title;
    }
  }
  getAriaLabel() {
    if (this.createAriaLabel) {
      return this.options.ariaLabel;
    }
    else {
      return this.hostElement.getAttribute("aria-label");
    }
  }
  getHostClass() {
    let hostClass = this.initialHostClass;
    // if (this.hasNoFeeds()) {
    //   return hostClass + " " + this.options.disabledHostClass;
    // } else {
    //   return hostClass + " " + this.options.enabledHostClass;
    // }
    return hostClass;
  }
  getBody() {
    switch (window.location.pathname) {
      case "/statistic":
        return h("honey-news-statistic", null);
      case "/feeds":
        return h("honey-news-feeds", null);
      default:
        return h("honey-news-feed", null);
    }
  }
  render() {
    Logger.debugMessage('##RENDER##');
    return (h(Host, { title: this.getTitleText(), "aria-label": this.getAriaLabel(),
      // tabindex={this.hasNoFeeds() ? -1 : this.taborder}
      // class={this.getHostClass()}
      // disabled={this.hasNoFeeds()}
      class: "paper" }, h(Router.Switch, null, h(Route, { path: "/" }, h(Header, null), h("honey-news-feed", null)), h(Route, { path: "/feeds" }, h(Header, null), h("honey-news-feeds", null)), h(Route, { path: "/statistic" }, h(Header, null), h("honey-news-statistic", null)), h(Route, { path: "/about" }, h(Header, null), h(About, null)))));
  }
  static get assetsDirs() { return ["assets"]; }
  get hostElement() { return getElement(this); }
};
AppShell.style = appShellCss;

export { AppShell as honey_news };
