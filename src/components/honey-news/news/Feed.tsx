import {Component, Element, h, Host, Method, Prop, State} from "@stencil/core";
import {Logger} from "../../../libs/logger";
import {FeedOptions} from "./FeedOptions";
import {FeedLoader} from "./FeedLoader";
import {getFeedsSingleObserver, Post} from "../../../fetch-es6.worker";
import {from, Subscription} from "rxjs";
import {PipeOperators} from "../PipeOperators";

@Component({
  tag: "honey-news-feed",
  styleUrl: "Feed.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class Feed {

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
  createAriaLabel: boolean = false;

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
  feedsSubscription: Subscription;

  lastUpdate: Date = null;

  @State() options: FeedOptions = {
    disabledHostClass: "honey-news-disabled",
    enabledHostClass: "flex-item",
    disabledTitleText: "Noch keine News verfügbar",
    titleText: "Aktuelle News aus den Feeds",
    ariaLabel: "Neuigkeiten der abonierten Feeds",
  };

  /**
   * enable console logging
   */
  @Prop() verbose: boolean = false;

  public connectedCallback() {
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || "flex-item";
    this.createTitleText = !this.hostElement.title;
    this.createAriaLabel = !this.hostElement["aria-label"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    this.initialisiereUrls();
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
    this.feedsSubscription = this.subscribeFeeds();
  }

  public async componentWillLoad() {
    this.singleLoadFeeds();
  }

  public disconnectedCallback() {
    this.feedsSubscription.unsubscribe();
  }

  public singleLoadFeeds(): void {
    from(getFeedsSingleObserver(this.feedLoader.getFeedURLs(), false))
      .subscribe({
        next: (posts: Post[]) => {
          this.lastUpdate = this.lastUpdate || posts[0].exaktdate;
          this.feeds = [...posts]
        }
      });
  }

  public subscribeFeeds(): Subscription {
    return this.feedLoader.getFeedsPeriodicObserver()
      .subscribe({
        next: (posts: Post[]) => {
          this.lastUpdate = this.lastUpdate || posts[0].exaktdate;
          this.feeds = [...posts]
        }
      });
  }


  protected initialisiereUrls() {
    const predefinedURLs: string[] = [
      "https://www.tagesschau.de/xml/atom/",
      "https://www.zdf.de/rss/zdf/nachrichten",
      "https://kenfm.de/feed/",
      "https://dev.to/feed/",
      "https://media.ccc.de/c/wikidatacon2019/podcast/webm-hq.xml",
      "https://media.ccc.de/updates.rdf",
      "https://www.deutschlandfunk.de/die-nachrichten.353.de.rss",
      "https://rss.dw.com/xml/rss-de-all",
      "http://newsfeed.zeit.de",
      "http://www.stern.de/feed/standard/all",
      "https://www.spiegel.de/international/index.rss",
      "rt.com/rss/",
      "https://codepen.io/spark/feed",
      "https://www.hongkiat.com/blog/feed/"
    ];
    from(predefinedURLs).subscribe((url) => this.feedLoader.addFeedUrl(url));
  }


  /**
   * Update speaker options
   * @param options : FeedOptions plain object to set the options
   */
  @Method()
  public async updateOptions(options: FeedOptions) {
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
    return this.options.ariaLabel;
  }

  protected getAltText(): string {
    if (this.createAriaLabel) {
      return this.createNewAltText();
    } else {
      return this.hostElement.getAttribute("aria-label");
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
    if (!this.feedLoader.getFeedURLs().includes(url)) {

      this.feedLoader.addFeedUrl(url);
      from(getFeedsSingleObserver([url], true)).subscribe();
      setTimeout(
        () => {
          from(getFeedsSingleObserver([url], false)).subscribe();
          // from(loadFeedRanking("https://huluvu424242.herokuapp.com/feeds")).pipe(catchError(() => EMPTY))
          //   .subscribe(
          //     (statisticDatas: StatisticData[]) => {
          //       this.statistic = [...statisticDatas];
          //     }
          //   );
        }
        , 3000
      );
    }
  }

  lastHour: Date = null;

  getUeberschrift(post: Post) {
    this.lastHour = this.lastHour || post.exaktdate;
    const hour: Date = post.exaktdate;
    if (PipeOperators.compareDates(this.lastUpdate, post.exaktdate) < 0) {
      this.lastUpdate = post.exaktdate;
    }
    if (hour.getUTCHours() != this.lastHour.getUTCHours()) {
      this.lastHour = hour;
      return <h2>{post.exaktdate.toLocaleDateString() + " " + this.lastHour.getHours()} Uhr</h2>;
    } else {
      return;
    }
  }

  getPostEntry(post: Post) {
    return <li>
      <div>({post.pubdate})[{post.feedtitle}]</div>
      <div><a href={this.getPostLink(post.item)}
              target="_blank">{post.item.title}</a></div>
    </li>;
  }

  getNeuesteMeldung() {
    if (this.lastUpdate) {
      return <span>(neueste Meldung: {this.lastUpdate?.toLocaleDateString() + "  " + this.lastUpdate?.toLocaleTimeString()} )</span>
    }
  }

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host
        title={this.getTitleText()}
        alt={this.getAltText()}
        tabindex={this.hasNoFeeds() ? -1 : this.taborder}
        class={this.getHostClass()}
        disabled={this.hasNoFeeds()}
      >
        <h2>Verwaltung</h2>
        <input id="newurl" ref={(el) => this.inputNewUrl = el as HTMLInputElement}/>
        <button id="addurl" onClick={(event: UIEvent) => this.addUrl(event)}>Add Feed URL</button>

        <h2>News Feed
          {
            this.getNeuesteMeldung()
          }
        </h2>
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
