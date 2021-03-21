import { r as registerInstance, h, e as Host, g as getElement } from './index-b07b787b.js';
import { L as Logger } from './logger-358e14e7.js';

const appShellCss = ".flex-container{display:flex;flex-direction:column;background-color:#FADCB1;color:darkblue}";

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
  render() {
    Logger.debugMessage('##RENDER##');
    return (h(Host, { title: this.getTitleText(), "aria-label": this.getAriaLabel(),
      // tabindex={this.hasNoFeeds() ? -1 : this.taborder}
      class: this.getHostClass() }, h("div", { class: "flex-container" }, h("honey-news-header", { class: "flex-item" }), h("honey-news-feed", { class: "flex-item" }))));
  }
  static get assetsDirs() { return ["assets"]; }
  get hostElement() { return getElement(this); }
};
AppShell.style = appShellCss;

export { AppShell as honey_news };
