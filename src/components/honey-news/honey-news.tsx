import {Component, Element, h, Host, Method, Prop, State} from "@stencil/core";
import {Logger} from "../../libs/logger";
import {NewsOptions} from "./news-options";
import {FeedData, loadFeedData, Post} from "../../fetch-es6.worker";
import {from, Observable} from "rxjs";
import {concatMap, groupBy, map, mergeMap, tap, toArray} from "rxjs/operators";
import {FeedItem} from "feedme/dist/parser";
import DateTimeFormat = Intl.DateTimeFormat;


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
   * Input Element
   */
  inputNewUrl: HTMLInputElement;

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

  @State() feeds: Post[] = [];

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
    this.feedURLs.push("https://www.tagesschau.de/xml/atom/");
    this.feedURLs.push("https://www.zdf.de/rss/zdf/nachrichten");
    this.feedURLs.push("https://media.ccc.de/c/wikidatacon2019/podcast/webm-hq.xml");
    this.feedURLs.push("https://media.ccc.de/updates.rdf");
    // this.feedURLs.push("https://a.4cdn.org/a/threads.json");
    // this.feedURLs.push("https://codepen.io/spark/feed");
    this.feedURLs.push("https://www.hongkiat.com/blog/feed/");
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

  protected loadFeedContent(): Observable<Post> {
    const urlObservable: Observable<string> = from(this.feedURLs);
    return urlObservable.pipe(
      tap(
        (url) => console.log("### tap url " + url)
      ),
      mergeMap(
        (url: string) => {
          console.log("### switchMap url " + url);
          return from(loadFeedData(url));
        }
      ),
      tap(
        (feedData: FeedData) => console.log("### tap feed data " + feedData.feedtitle)
      ),
      mergeMap(
        (metaData: FeedData) => this.mapItemsToPost(metaData)
      ),
      groupBy(post => post.sortdate),
      mergeMap(group => group.pipe(toArray())),
      tap(
        (postings: Post[]) => postings.forEach((post) => console.log("### grouped post: " + post.pubdate))
      ),
      concatMap(
        (posts: Post[]) => from(this.sortMap(posts))
      ),
      // concatAll(),
    );
  }

  sortMap(post: Post[]): Post[] {
    const aIstGroesser: number = 1;
    const aIstKleiner: number = -1;
    return post.sort((lp, rp) => {
      const a: string = lp.sortdate;
      const b: string = rp.sortdate;
      if (!a) {
        return aIstKleiner;
      }
      if (!b) {
        return aIstGroesser;
      }
      if (a > b) {
        return aIstGroesser;
      } else if (b > a) {
        return aIstKleiner;
      } else {
        return 0
      }
    });
  }

  mapItemsToPost(feedData: FeedData): Observable<Post> {
    return from(feedData.items).pipe(
      map(
        (feeditem: FeedItem) => {
          const date: Date = this.getDateFromFeedItem(feeditem);
          const formatedDate = this.getFormattedDate(date);
          const sortDate = this.getSortDateFromFeedItem(date);
          const post: Post = {
            feedtitle: feedData.feedtitle,
            exaktdate: date,
            sortdate: sortDate,
            pubdate: formatedDate + " \t{" + sortDate + "}\t",
            item: feeditem
          };
          return post;
        }
      )
    );
  }

  getFormattedDate(date: Date): string {
    const minuteFormat: DateTimeFormat = new DateTimeFormat("de-DE",
      {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
    return date ? minuteFormat.format(date) : null;
  }

  getDateFromFeedItem(feedItem): Date {
    let datum: string;
    if (feedItem.pubdate) {
      datum = feedItem.pubdate;
    } else if (feedItem.updated) {
      datum = feedItem.updated;
    } else {
      datum = feedItem["dc:date"];
    }
    let date: Date = null;
    try {
      if (datum) {
        date = new Date(Date.parse(datum));
      }
    } catch (fehler) {
      console.error(fehler);
    }
    return date ? date : null;
  }

  getSortDateFromFeedItem(date: Date): string {
    if (date) {
      const hourFormat: DateTimeFormat = new DateTimeFormat("de-DE",
        {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric'});
      const formatedDate: string = hourFormat.format(date);
      const minute: number = date.getMinutes();
      const quadrant: number = Math.floor(minute / 15);
      return formatedDate + ':' + quadrant;
    } else {
      return null;
    }
  }

  protected async loadFeeds(): Promise<void> {
    return new Promise(
      (resolve) => {
        this.loadFeedContent().subscribe(
          {
            next: (post: Post) => this.feeds.push(post),
            error: (error) => error,
            complete: () => {
              // rendering trigger
              this.feeds = [...this.feeds];
              console.log("###complete with:\n" + JSON.stringify(this.feeds));
              // resolve the promise to continue after data load
              resolve();
            }
          }
        )
      }
    );
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
    this.feedURLs.push(url);
    this.loadFeeds();
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
        <h2>Legende</h2>
        <dl>
          <dt>[xxx]</dt>
          <dd>Titel der News Feed Quelle</dd>
          <dt>(xx.xx.xxxx xx:xx)</dt>
          <dd>Originale Zeit der Veröffentlichung</dd>
          <dt>{"{xx.xx.xxxx xx.xx}"}</dt>
          <dd>Berechnetes Sortierdatum</dd>
        </dl>

        <input id="newurl" ref={(el) => this.inputNewUrl = el as HTMLInputElement}/>
        <button id="addurl" onClick={(event: UIEvent) => this.addUrl(event)}>Add Feed URL</button>

        <h2>News Feed</h2>
        <ol>
          {this.feeds.map((post) =>
            <li>[{post.feedtitle}]({post.pubdate})<a href={this.getPostLink(post.item)}
                                                     target="_blank">{post.item.title}</a></li>
          )}
        </ol>
      </Host>
    );
  }
}
