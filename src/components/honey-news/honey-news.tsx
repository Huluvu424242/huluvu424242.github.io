import {Component, Element, h, Host, Method, Prop, State} from "@stencil/core";
import {Logger} from "../../libs/logger";
import {NewsOptions} from "./news-options";
import {FeedLoader} from "./FeedLoader";
import {Post} from "../../fetch-es6.worker";
import {from} from "rxjs";

@Component({
  tag: "honey-news",
  styleUrl: "honey-news.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class HoneyNews {

  /**
   * Host Element
   */
  @Element() hostElement: HTMLElement;

  /**
   * Input Element
   */
  inputNewUrl: HTMLInputElement;

  /**
   * Id des Host Elements, falls nicht verfügbar wird diese generiert
   */
  ident: string;

  /**
   * initiale class from host tag
   */
  initialHostClass: string;

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
   * Hilfsklasse zum Laden der Daten
   */
  feedLoader: FeedLoader = new FeedLoader([]);

  @State() feeds: Post[] = [];

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

  public componentWillLoad() {
    this.loadFeeds();
  }

  public loadFeeds(): void {
    const posts$ = this.feedLoader.loadFeedContent();
    posts$.subscribe({
      next: (posts: Post[]) => this.feeds = [...posts]
    });
  }


  protected initialisiereUrls() {
    const predefinedURLs: string[] = [
      "https://www.tagesschau.de/xml/atom/",
      "https://www.zdf.de/rss/zdf/nachrichten",
      "https://media.ccc.de/c/wikidatacon2019/podcast/webm-hq.xml",
      "https://media.ccc.de/updates.rdf",
      "https://www.deutschlandfunk.de/die-nachrichten.353.de.rss",
      "https://rss.dw.com/xml/rss-de-all",
      "http://newsfeed.zeit.de",
      "http://www.stern.de/feed/standard/all",
      "https://www.spiegel.de/international/index.rss",
      "rt.com/rss",
      // "https://a.4cdn.org/a/threads.json");
      // "https://codepen.io/spark/feed");
      "https://www.hongkiat.com/blog/feed/"
    ]
    from(predefinedURLs).subscribe((url) => this.feedLoader.addFeedUrl(url));
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


  protected hasNoFeeds(): boolean {
    return (!this.feeds || this.feeds.length < 1);
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

  protected getHostClass(): string {
    let hostClass = this.initialHostClass;
    if (this.hasNoFeeds()) {
      return hostClass + " " + this.options.disabledHostClass;
    } else {
      return hostClass + " " + this.options.enabledHostClass;
    }
  }

  getPostLink(item): string {
    if (typeof item.link === "string") {
      return item.link;
    }
    if (typeof (item.link.href == "string")) {
      return item.link.href;
    }
    return null
  }

  addUrl(event: UIEvent) {
    event = event;
    const url = this.inputNewUrl.value;
    this.feedLoader.addFeedUrl(url);
  }

  lastHour: number = 0;

  getUeberschrift(post: Post) {
    const hour: number = post.exaktdate.getHours();
    if (hour != this.lastHour) {
      this.lastHour = hour;
      return <h2>{post.exaktdate.toLocaleDateString() + " " + this.lastHour} Uhr</h2>;
    } else {
      return;
    }
  }

  getPostEntry(post: Post) {
    return <li>[{post.feedtitle}]({post.pubdate})<a href={this.getPostLink(post.item)}
                                                    target="_blank">{post.item.title}</a></li>;
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
        <h2>Verwaltung</h2>
        <input id="newurl" ref={(el) => this.inputNewUrl = el as HTMLInputElement}/>
        <button id="addurl" onClick={(event: UIEvent) => this.addUrl(event)}>Add Feed URL</button>

        <h2>News Feed</h2>
        <ol>
          {this.feeds.map((post) =>
            [
              this.getUeberschrift(post),
              this.getPostEntry(post)
            ]
          )}
        </ol>
      </Host>
    );
  }
}
