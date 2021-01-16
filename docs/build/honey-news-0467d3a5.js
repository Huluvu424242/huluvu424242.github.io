import { e as consoleError, r as registerInstance, h, f as Host, g as getElement } from './index-79c6be8f.js';

class Logger {
  constructor(enableLogging) {
    Logger.isLoggingActive = enableLogging;
  }
  static disableLogging() {
    this.isLoggingActive = false;
  }
  static enableLogging() {
    this.isLoggingActive = true;
  }
  static toggleLogging(enableLogging) {
    if (enableLogging) {
      Logger.enableLogging();
    }
    else {
      Logger.disableLogging();
    }
  }
  static logMessage(message) {
    if (console && this.isLoggingActive) {
      console.log(message);
    }
  }
  static debugMessage(message) {
    if (console && this.isLoggingActive) {
      console.debug(message);
    }
  }
  static errorMessage(message) {
    if (console && this.isLoggingActive) {
      console.error(message);
    }
  }
  static infoMessage(message) {
    if (console && this.isLoggingActive) {
      console.info(message);
    }
  }
}
Logger.isLoggingActive = true;

let pendingIds = 0;
let callbackIds = 0;
const pending = new Map();
const callbacks = new Map();

const createWorker = (workerPath, workerName, workerMsgId) => {
  const worker = new Worker(workerPath, {name:workerName});

  worker.addEventListener('message', ({data}) => {
  if (data) {
    const workerMsg = data[0];
    const id = data[1];
    const value = data[2];

    if (workerMsg === workerMsgId) {
    const err = data[3];
    const [resolve, reject, callbackIds] = pending.get(id);
    pending.delete(id);

    if (err) {
      const errObj = (err.isError)
      ? Object.assign(new Error(err.value.message), err.value)
      : err.value;

      consoleError(errObj);
      reject(errObj);
    } else {
      if (callbackIds) {
      callbackIds.forEach(id => callbacks.delete(id));
      }
      resolve(value);
    }
    } else if (workerMsg === workerMsgId + '.cb') {
    try {
      callbacks.get(id)(...value);
    } catch (e) {
      consoleError(e);
    }
    }
  }
  });

  return worker;
};

const createWorkerProxy = (worker, workerMsgId, exportedMethod) => (
  (...args) => new Promise((resolve, reject) => {
  let pendingId = pendingIds++;
  let i = 0;
  let argLen = args.length;
  let mainData = [resolve, reject];
  pending.set(pendingId, mainData);

  for (; i < argLen; i++) {
    if (typeof args[i] === 'function') {
    const callbackId = callbackIds++;
    callbacks.set(callbackId, args[i]);
    args[i] = [workerMsgId + '.cb', callbackId];
    (mainData[2] = mainData[2] || []).push(callbackId);
    }
  }
  const postMessage = (w) => (
    w.postMessage(
    [workerMsgId, pendingId, exportedMethod, args],
    args.filter(a => a instanceof ArrayBuffer)
    )
  );
  if (worker.then) {
    worker.then(postMessage);
  } else {
    postMessage(worker);
  }
  })
);

const workerPromise = import('./fetch-es6.worker-bfc6ad6b.js').then(m => m.worker);
const loadData = /*@__PURE__*/createWorkerProxy(workerPromise, 'stencil.fetch-es6.worker', 'loadData');

const honeyNewsCss = ":host>svg{padding:var(--honey-news-padding, 5px);font-size:var(--honey-news-font-size, medium);border:var(--honey-news-border, 0);width:var(--honey-news-width, 36px);height:var(--honey-news-height, 36px)}:host>svg>path{stroke-width:5}.speakerimage{stroke:var(--honey-news-color, blue);fill:var(--honey-news-color, blue);background:var(--honey-news-background, transparent)}.speakerimage-disabled{stroke:var(--honey-disabled-color, gray);fill:var(--honey-disabled-color, gray);background:var(--honey-disabled-background, lightgrey);cursor:var(--honey-disabled-cursor, not-allowed)}";

const HoneyNews = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.options = {
      disabledHostClass: "speaker-disabled",
      enabledHostClass: "speaker-enabled",
      disabledTitleText: "Vorlesen deaktiviert, da keine Texte verfügbar",
      pressedTitleText: "Liest gerade vor",
      titleText: "Vorlesen",
      altText: "Symbol eines tönenden Lautsprechers",
      unpressedAltText: "Symbol eines angehaltenen, tönenden Lautsprechers",
      pressedPureAltText: "Symbol eines tönenden Lautsprechers",
      unpressedPureAltText: "Symbol eines ausgeschaltenen Lautsprechers"
    };
    /**
     * true wenn das Tag ohne alt Attribute deklariert wurde
     */
    this.createAltText = false;
    /**
     * true wenn das Tag ohne title Attribut deklariert wurde
     */
    this.createTitleText = false;
    /**
     * initial computed taborder
     */
    this.taborder = "0";
    /**
     * texte to speech out
     */
    this.urls = [];
    /**
     * enable console logging
     */
    this.verbose = false;
  }
  connectedCallback() {
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || "";
    this.createTitleText = !this.hostElement.title;
    this.createAltText = !this.hostElement["alt"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    this.initialisiereUrls();
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
  }
  async componentWillLoad() {
    await this.loadFeeds();
  }
  /**
   * Update speaker options
   * @param options : NewsOptions plain object to set the options
   */
  async updateOptions(options) {
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        this.options[prop] = options[prop];
      }
    }
    this.options = Object.assign({}, this.options);
  }
  initialisiereUrls() {
    this.urls.push("https://cors-anywhere.herokuapp.com/https://media.ccc.de/news.atom");
    this.urls.push("https://cors-anywhere.herokuapp.com/https://a.4cdn.org/a/threads.json");
    this.urls.push("https://codepen.io/spark/feed");
    this.urls.push("https://cors-anywhere.herokuapp.com/https://www.hongkiat.com/blog/feed/");
    // neue Referenz erzeugen um Rendering zu triggern
    this.urls = [...this.urls];
  }
  hasNoFeeds() {
    return (!this.urls
      || this.urls.length < 1
      || this.urls.filter(item => item.trim().length > 0).length < 1);
  }
  createNewTitleText() {
    if (this.hasNoFeeds()) {
      return this.options.disabledTitleText;
    }
    else {
      return this.options.titleText;
    }
  }
  getTitleText() {
    if (this.createTitleText) {
      return this.createNewTitleText();
    }
    else {
      return this.hostElement.title;
    }
  }
  createNewAltText() {
    return this.options.altText;
  }
  getAltText() {
    if (this.createAltText) {
      return this.createNewAltText();
    }
    else {
      return this.hostElement.getAttribute("alt");
    }
  }
  async loadFeedContent(url) {
    let feedResponse;
    try {
      feedResponse = await loadData(url);
      console.log("response", feedResponse);
    }
    catch (error) {
      console.log("Error", error);
    }
    return feedResponse;
  }
  getPayload(data) {
    return data.json ? data.json : data.text;
  }
  async loadFeeds() {
    return this.urls.forEach(async (url) => {
      const feedResponse = await this.loadFeedContent(url);
      console.log("###\n" + this.getPayload(feedResponse));
    });
  }
  getFeedUrls() {
    if (this.urls) {
      return this.urls;
    }
    else {
      return [];
    }
  }
  getHostClass() {
    let hostClass = this.initialHostClass;
    if (this.hasNoFeeds()) {
      return hostClass + " " + this.options.disabledHostClass;
    }
    else {
      return hostClass + " " + this.options.enabledHostClass;
    }
  }
  render() {
    Logger.debugMessage('##RENDER##');
    return (h(Host, { title: this.getTitleText(), alt: this.getAltText(), role: "button", tabindex: this.hasNoFeeds() ? -1 : this.taborder, class: this.getHostClass(), disabled: this.hasNoFeeds() }));
  }
  static get assetsDirs() { return ["assets"]; }
  get hostElement() { return getElement(this); }
};
HoneyNews.style = honeyNewsCss;

export { HoneyNews as H, createWorker as c };
