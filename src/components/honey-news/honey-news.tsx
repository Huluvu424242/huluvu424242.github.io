import {Component, Element, h, Host, Method, Prop, State} from "@stencil/core";
import {Logger} from "../../libs/logger";
import {NewsOptions} from "./news-options";
import {FeedData, loadFeedData} from "../../fetch-es6.worker";


@Component({
  tag: "honey-news",
  styleUrl: "honey-news.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class HoneyNews {

  /**
   * initiale class from host tag
   */
  initialHostClass: string;

  @State() options: NewsOptions = {
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
   * Host Element
   */
  @Element() hostElement: HTMLElement;

  /**
   * Id des Host Elements, falls nicht verfügbar wird diese generiert
   */
  ident: string;

  /**
   * true wenn das Tag ohne alt Attribute deklariert wurde
   */
  createAltText: boolean = false;

  /**
   * true wenn das Tag ohne title Attribut deklariert wurde
   */
  createTitleText: boolean = false;

  /**
   * initial computed taborder
   */
  taborder: string = "0";

  /**
   * texte to speech out
   */
  feedURLs: string[] = [];

  feeds: FeedEntry[] = [];

  /**
   * enable console logging
   */
  @Prop() verbose: boolean = false;

  public connectedCallback() {
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


  public async componentWillLoad() {
    await this.loadFeeds();
  }

  /**
   * Update speaker options
   * @param options : NewsOptions plain object to set the options
   */
  @Method()
  public async updateOptions(options: NewsOptions) {
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        this.options[prop] = options[prop];
      }
    }
    this.options = {...this.options};
  }

  protected initialisiereUrls() {
    this.feedURLs.push("https://www.zdf.de/rss/zdf/nachrichten");
    this.feedURLs.push("https://cors-anywhere.herokuapp.com/https://media.ccc.de/news.atom");
    this.feedURLs.push("https://cors-anywhere.herokuapp.com/https://a.4cdn.org/a/threads.json");
    this.feedURLs.push("https://codepen.io/spark/feed");
    this.feedURLs.push("https://cors-anywhere.herokuapp.com/https://www.hongkiat.com/blog/feed/");
  }


  protected hasNoFeeds(): boolean {
    return (!this.feedURLs
      || this.feedURLs.length < 1
      || this.feedURLs.filter(item => item.trim().length > 0).length < 1
    );
  }

  protected createNewTitleText(): string {
    if (this.hasNoFeeds()) {
      return this.options.disabledTitleText;
    } else {
      return this.options.titleText;
    }
  }

  protected getTitleText(): string {
    if (this.createTitleText) {
      return this.createNewTitleText();
    } else {
      return this.hostElement.title;
    }
  }

  protected createNewAltText(): string {
    return this.options.altText;
  }

  protected getAltText(): string {
    if (this.createAltText) {
      return this.createNewAltText();
    } else {
      return this.hostElement.getAttribute("alt");
    }
  }


  protected async loadFeedContent(url: string): Promise<FeedData> {
    let feedResponse: FeedData;
    try {
      feedResponse = await loadFeedData(url);
      console.log("response", feedResponse);
    } catch (error) {
      console.log("Error", error);
    }
    return feedResponse;
  }

  protected async loadFeeds(): Promise<void> {
    return this.feedURLs.forEach(async (url) => {
      const feedResponse: FeedData = await this.loadFeedContent(url);
      console.log("###\n" + JSON.stringify(feedResponse.feed.items));
    });
  }


  protected getFeedUrls(): string[] {
    if (this.feedURLs) {
      return this.feedURLs;
    } else {
      return [];
    }
  }


  protected getHostClass(): string {
    let hostClass = this.initialHostClass;
    if (this.hasNoFeeds()) {
      return hostClass + " " + this.options.disabledHostClass;
    } else {
      return hostClass + " " + this.options.enabledHostClass;
    }
  }

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host
        title={this.getTitleText()}
        alt={this.getAltText()}
        role="button"
        tabindex={this.hasNoFeeds() ? -1 : this.taborder}
        class={this.getHostClass()}
        disabled={this.hasNoFeeds()}
      >
      </Host>
    );
  }
}
