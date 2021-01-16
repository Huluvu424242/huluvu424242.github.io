import {Component, Element, h, Host, Method, Prop, State} from "@stencil/core";
import {Logger} from "../../libs/logger";
import {NewsOptions} from "./news-options";
import {ResponseData, loadData} from "../../fetch-es6.worker";


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
  @State() urls: string[] = [];

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

  protected initialisiereUrls(){
    this.urls.push("https://cors-anywhere.herokuapp.com/https://media.ccc.de/news.atom");
    this.urls.push("https://cors-anywhere.herokuapp.com/https://a.4cdn.org/a/threads.json");
    this.urls.push("https://codepen.io/spark/feed");
    this.urls.push("https://cors-anywhere.herokuapp.com/https://www.hongkiat.com/blog/feed/");
    // neue Referenz erzeugen um Rendering zu triggern
    this.urls = [...this.urls];
  }



  protected hasNoFeeds(): boolean {
    return (!this.urls
      || this.urls.length < 1
      || this.urls.filter(item => item.trim().length > 0).length < 1
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


  protected async loadFeedContent(url: string): Promise<ResponseData> {
    let feedResponse: ResponseData;
    try {
      feedResponse = await loadData(url);
      console.log("response", feedResponse);
    } catch (error) {
      console.log("Error", error);
    }
    return feedResponse;
  }

  protected getPayload(data: ResponseData) {
    return data.json ? data.json : data.text;
  }

  protected async loadFeeds():Promise<void> {
     return this.urls.forEach( async (url) =>
    {
      const feedResponse: ResponseData = await this.loadFeedContent(url);
      console.log("###\n" + this.getPayload(feedResponse));
    });
  }


  protected getFeedUrls(): string[] {
    if (this.urls) {
      return this.urls;
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
