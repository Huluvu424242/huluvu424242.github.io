import {Component, Element, h, Host, Prop, State, Watch} from "@stencil/core";
import {Logger} from "../../shared/logger";
import {AppShellOptions} from "./AppShellOptions";
import {Subscription} from "rxjs";
import {router} from "./routing/SimpleRouter";
import {NewsLoader} from "./news/NewsLoader";
import {News} from "./news/News";
import {About} from "./snippets/About";

@Component({
  tag: "honey-news",
  styleUrl: "AppShell.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class AppShell {

  /**
   * Host Element
   */
  @Element() hostElement: HTMLElement;


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
   * Routing
   */
  routerSubscription: Subscription = null;
  @State() route: string = "";


  @State() options: AppShellOptions = {
    disabledHostClass: "honey-news-disabled",
    enabledHostClass: "honey-news",
    disabledTitleText: "News Reader nicht verfügbar",
    titleText: "News Reader",
    ariaLabel: "Neuigkeiten der abonierten Feeds",
  };

  /**
   * enable console logging
   */
  @Prop() verbose: boolean = false;

  /**
   * Shared State of AppShell
   */
  feedLoader: NewsLoader = new NewsLoader([]);


  /**
   * News reader Komponente
   */
    // @ts-ignore
  @Prop({mutable: true}) newsFeed: HTMLHoneyNewsFeedElement;

  @Watch("newsFeed")
  newsWatcher(newValue: HTMLHoneyNewsFeedElement, oldValue: HTMLHoneyNewsFeedElement) {
    oldValue = oldValue;
    if (newValue) {
      if (this.newsFeed) {
        this.newsFeed.feedLoader = this.feedLoader;
      }
    }
  }


  /**
   * Feeds Administration Komponente
   */
    // @ts-ignore
  @Prop({mutable: true}) feedAdministration: HTMLHoneyNewsFeedsElement;

  @Watch("feedAdministration")
  feedWatcher(newValue: News, oldValue: News) {
    oldValue = oldValue;
    if (newValue) {
      if (this.feedAdministration) {
        this.feedAdministration.feedLoader = this.feedLoader;
      }
    }
  }


  public connectedCallback() {
    // external objects initialisieren
    router.setRoutenPrefix(window.location.pathname);
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || null;
    this.createTitleText = !this.hostElement.title;
    this.createAriaLabel = !this.hostElement["aria-label"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    this.routerSubscription = router.getRouteListener().subscribe((route: string) => {
        this.route = route;
      },
      (error) => {
        console.error(error);
      },
      () => {
        console.info("Router Subject' complete");
      });
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
  }

  public disconnectedCallback() {
    this.routerSubscription.unsubscribe();
  }

  protected createNewTitleText(): string {
    // if (this.) {
    //   return this.options.disabledTitleText;
    // } else {
    return this.options.titleText;
    // }
  }

  protected getTitleText(): string {
    if (this.createTitleText) {
      return this.createNewTitleText();
    } else {
      return this.hostElement.title;
    }
  }

  protected getAriaLabel(): string {
    if (this.createAriaLabel) {
      return this.options.ariaLabel;
    } else {
      return this.hostElement.getAttribute("aria-label");
    }
  }

  protected getHostClass(): string {
    let hostClass = this.initialHostClass;
    // if (this.hasNoFeeds()) {
    //   return hostClass + " " + this.options.disabledHostClass;
    // } else {
    //   return hostClass + " " + this.options.enabledHostClass;
    // }
    return hostClass;
  }


  public render() {
    Logger.debugMessage('##RENDER##');

    // addRoute("", "<h1>Root empty</h1>");
    // addRoute("/", "<h1>Root</h1>");
    // addRoute("/news", "<h1>News</h1>");
    // addRoute("/feeds", "<h1>Feeds</h1>");
    // addRoute("/statistic", "<h1>Statistik</h1>");
    // addRoute("/about", "<h1>About</h1>");


    return (
      <Host
        title={this.getTitleText()}
        aria-label={this.getAriaLabel()}
        // tabindex={this.hasNoFeeds() ? -1 : this.taborder}
        // class={this.getHostClass()}
        // disabled={this.hasNoFeeds()}
        class="paper"
      >

        <honey-news-header/>

        <div class="row flex-left">
          <div class="sm-2 col background-primary">Route: {window.location.pathname}</div>
        </div>

        {!this.route || this.route === "/" || this.route === "/news" ? <honey-news-feed ref={(el) => {
          // @ts-ignore
          this.newsFeed = el as HTMLHoneyNewsFeedElement
        }}/> : null}
        {this.route === "/feeds" ? <honey-news-feeds ref={(el) => {
          // @ts-ignore
          this.feedAdministration = el as HTMLHoneyNewsFeedsElement
        }
        }/> : null}
        {this.route === "/statistic" ? <honey-news-statistic/> : null}
        {this.route === "/about" ? <About/> : null}

      </Host>
    );
  }
}
