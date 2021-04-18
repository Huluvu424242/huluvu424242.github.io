import {Component, Element, h, Host, Method, Prop, State} from "@stencil/core";
import {Subscription} from "rxjs";
import {Logger} from "../../../shared/logger";
import {StatisticOptions} from "./StatisticOptions";
import {StatisticData} from "@huluvu424242/liona-feeds/dist/esm/feeds/statistic";
import {StatisticLoader} from "./StatisticLoader";

@Component({
  tag: "honey-news-statistic",
  styleUrl: "Statistic.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class Statistic {

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

  statisticLoader: StatisticLoader = new StatisticLoader();


  @State() statistic: StatisticData[];
  statisticSubscription: Subscription;

  lastUpdate: Date = null;

  @State() options: StatisticOptions = {
    disabledHostClass: "honey-news-statistic-disabled",
    enabledHostClass: "honey-news-statistic-enabled",
    disabledTitleText: "Noch keine Statistik verfügbar",
    titleText: "Statistische Übersicht",
    ariaLabel: "Statistiken zur Aufrufhäufigkeit der Feeds",
  };


  /**
   * enable console logging
   */
  @Prop() verbose: boolean = false;

  public connectedCallback() {
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


  public disconnectedCallback() {
    this.statisticSubscription.unsubscribe();
  }

  protected subscribeStatistics(): Subscription {
    return this.statisticLoader.subscribeStatistiken()
      .subscribe((statisticDatas: StatisticData[]) => this.statistic = [...statisticDatas]);
  }

  /**
   * Update statistic options
   * @param options : NewsOptions plain object to set the options
   */
  @Method()
  public async updateOptions(options: StatisticOptions) {
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        this.options[prop] = options[prop];
      }
    }
    this.options = {...this.options};
  }


  protected hasNoStatistics(): boolean {
    return (!this.statistic || this.statistic.length < 1);
  }

  protected createNewTitleText(): string {
    if (this.hasNoStatistics()) {
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

  protected createNewAriaLabel(): string {
    return this.options.ariaLabel;
  }

  protected getAriaLabel(): string {
    if (this.createAriaLabel) {
      return this.createNewAriaLabel();
    } else {
      return this.hostElement.getAttribute("aria-label");
    }
  }

  protected getHostClass(): string {
    let hostClass = this.initialHostClass;
    if (this.hasNoStatistics()) {
      return hostClass + " " + this.options.disabledHostClass;
    } else {
      return hostClass + " " + this.options.enabledHostClass;
    }
  }

  lastHour: Date = null;

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host
        title={this.getTitleText()}
        aria-label={this.getAriaLabel()}
        tabindex={this.hasNoStatistics() ? -1 : this.taborder}
        class={this.getHostClass()}
        disabled={this.hasNoStatistics()}
      >
        <table>
          <tr>
            <th>Score</th>
            <th>Url</th>
            <th>Angefragt</th>
            <th>Kontaktiert</th>
            <th>Geantwortet</th>
          </tr>
          {this.statistic?.map((item: StatisticData) =>
            <tr>
              <td>{item.score}</td>
              <td><a href={item.url} target="_blank">{item.url}</a></td>
              <td>{item.countRequested}</td>
              <td>{item.countContacted}</td>
              <td>{item.countResponseOK}</td>
            </tr>
          )}
        </table>
      </Host>
    );
  }
}
