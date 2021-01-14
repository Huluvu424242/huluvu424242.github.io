import { r as registerInstance, h, e as Host, g as getElement } from './index-cb1a92c3.js';

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

class Fileloader {
  constructor(fileURL) {
    this.url = fileURL;
  }
  static async loadData(dataUrl) {
    const fileLoader = Fileloader.of(dataUrl);
    if (fileLoader) {
      return await fileLoader.loadFileContent();
    }
    else {
      return new Promise((resolve) => { resolve(null); });
    }
  }
  static of(fileURL) {
    try {
      return new Fileloader(new URL(fileURL));
    }
    catch (ex) {
      Logger.errorMessage("Invalid URL:" + fileURL + "\n" + ex);
      return null;
    }
  }
  async loadFileContent() {
    // const headers: Headers = new Headers();
    const response = await fetch(this.url.toString(), {
      method: 'GET',
    });
    if (response.ok) {
      return response.text();
    }
    else {
      return new Promise((resolve) => { resolve(null); });
    }
  }
}

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
  async loadFeedContent() {
    // const url: string = "https://media.ccc.de/news.atom";
    const url = "https://codepen.io/spark/feed/";
    Logger.debugMessage("audioURL: " + url);
    const audioData = await Fileloader.loadData(url);
    if (audioData) {
      this.urls = [...this.urls, audioData];
    }
    Logger.debugMessage('###Texte###' + this.urls);
  }
  async loadFeeds() {
    this.urls = [];
    await this.loadFeedContent();
  }
  textidsChanged(newValue, oldValue) {
    Logger.debugMessage("textids changed from" + oldValue + " to " + newValue);
    this.loadFeeds();
  }
  getTexte() {
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
    return (h(Host, { title: this.getTitleText(), alt: this.getAltText(), role: "button", tabindex: this.hasNoFeeds() ? -1 : this.taborder, class: this.getHostClass(), disabled: this.hasNoFeeds() }, h("honey-news", null)));
  }
  static get assetsDirs() { return ["assets"]; }
  get hostElement() { return getElement(this); }
  static get watchers() { return {
    "textids": ["textidsChanged"]
  }; }
};
HoneyNews.style = honeyNewsCss;

export { HoneyNews as honey_news };
