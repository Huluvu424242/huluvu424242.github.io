import { r as registerInstance, h, e as Host, g as getElement } from './index-b07b787b.js';
import { L as Logger } from './logger-358e14e7.js';
import { t as timer, s as switchMap, f as from, l as loadFeedRanking, c as catchError, E as EMPTY } from './fetch-es6.worker-552e4ee2.js';

class StatisticLoader {
  subscribeStatistiken() {
    return timer(0, 60000 * 10)
      .pipe(switchMap(() => from(loadFeedRanking("https://huluvu424242.herokuapp.com/feeds")).pipe(catchError(() => EMPTY))));
  }
}

const statisticCss = ".flex-item{order:2}";

const Statistic = class {
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
    this.statisticLoader = new StatisticLoader();
    this.lastUpdate = null;
    this.options = {
      disabledHostClass: "honey-news-statistic-disabled",
      enabledHostClass: "honey-news-statistic-enabled",
      disabledTitleText: "Noch keine Statistik verfügbar",
      titleText: "Statistische Übersicht",
      ariaLabel: "Statistiken zur Aufrufhäufigkeit der Feeds",
    };
    /**
     * enable console logging
     */
    this.verbose = false;
    this.lastHour = null;
  }
  connectedCallback() {
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || null;
    this.createTitleText = !this.hostElement.title;
    this.createAriaLabel = !this.hostElement["alt"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
    this.statisticSubscription = this.subscribeStatistics();
  }
  disconnectedCallback() {
    this.statisticSubscription.unsubscribe();
  }
  subscribeStatistics() {
    return this.statisticLoader.subscribeStatistiken()
      .subscribe((statisticDatas) => this.statistic = [...statisticDatas]);
  }
  /**
   * Update statistic options
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
  hasNoStatistics() {
    return (!this.statistic || this.statistic.length < 1);
  }
  createNewTitleText() {
    if (this.hasNoStatistics()) {
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
  createNewAriaLabel() {
    return this.options.ariaLabel;
  }
  getAriaLabel() {
    if (this.createAriaLabel) {
      return this.createNewAriaLabel();
    }
    else {
      return this.hostElement.getAttribute("aria-label");
    }
  }
  getHostClass() {
    let hostClass = this.initialHostClass;
    if (this.hasNoStatistics()) {
      return hostClass + " " + this.options.disabledHostClass;
    }
    else {
      return hostClass + " " + this.options.enabledHostClass;
    }
  }
  render() {
    var _a;
    Logger.debugMessage('##RENDER##');
    return (h(Host, { title: this.getTitleText(), "aria-label": this.getAriaLabel(), tabindex: this.hasNoStatistics() ? -1 : this.taborder, class: this.getHostClass(), disabled: this.hasNoStatistics() }, h("table", null, h("tr", null, h("th", null, "Score"), h("th", null, "Url"), h("th", null, "Angefragt"), h("th", null, "Kontaktiert"), h("th", null, "Geantwortet")), (_a = this.statistic) === null || _a === void 0 ? void 0 :
      _a.map((item) => h("tr", null, h("td", null, item.score), h("td", null, h("a", { href: item.url, target: "_blank" }, item.url)), h("td", null, item.countRequested), h("td", null, item.countContacted), h("td", null, item.countResponseOK))))));
  }
  static get assetsDirs() { return ["assets"]; }
  get hostElement() { return getElement(this); }
};
Statistic.style = statisticCss;

export { Statistic as honey_news_statistic };
