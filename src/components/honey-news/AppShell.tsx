import {Component, Element, h, Host, Prop, State} from "@stencil/core";
import {Logger} from "../../libs/logger";
import {AppShellOptions} from "./AppShellOptions";
import {createRouter, href, Route} from 'stencil-router-v2';

const Router = createRouter();

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

  public connectedCallback() {
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || "paper container";
    this.createTitleText = !this.hostElement.title;
    this.createAriaLabel = !this.hostElement["aria-label"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
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

  protected getBody(): string {
    switch (window.location.pathname) {
      case "/statistic":
        return <honey-news-statistic/>;
      case "/feeds":
        return <honey-news-feeds/>;
      default:
        return <honey-news-feed/>;
    }
  }

  protected getHeader(){
    return ([
      <div class="row flex-spaces">
        <input class="alert-state" id="disclaimer" type="checkbox"/>
        <div class="alert alert-danger dismissible">
          <div class="row">
            <p>!!! Das ist eine Demo Seite welche alle Feature der App zeigen soll - aus
              diesem Grund ist auch die Statistik eingeschaltet !!!
            </p>
            <div class="background-warning">
              <p>
                Es werden nur Daten zu den abgerufenen Feeds gespeichert (in memory) wie: url, anzahl der
                abfragen,
                anzahl valider responses
              </p>
              <p>
                Sollten Sie die Speicherung nicht wünschen - dann geben Sie bitte keinen neuen Feed ein.
                Vielen Dank für Ihr Verständnis.
              </p>
            </div>
          </div>
          <label class="btn-close" htmlFor="disclaimer">X</label>
        </div>
      </div>,
      <nav class="border split-nav">
        <div class="nav-brand">
          <h3><a href="#">RSS/Atom Feed Reader</a></h3>
        </div>
        <div class="collapsible">
          <input id="collapsible1" type="checkbox" name="collapsible1"/>
          <label htmlFor="collapsible1">
            <div class="bar1"/>
            <div class="bar2"/>
            <div class="bar3"/>
            <div class="bar4"/>
            <div class="bar5"/>
          </label>
          <div class="collapsible-body">
            <ul class="inline">
              <li><a {...href('/feeds')}>Feeds</a></li>
              <li>
                <a {...href('/')}>News</a>
              </li>
              <li>
                <a {...href('/statistic')}>Statistik</a>
              </li>
              <li><a href="https://github.com/Huluvu424242/honey-news" target="_blank">Github</a></li>
              <li><a {...href('/about')} >About</a></li>
            </ul>
          </div>
        </div>
      </nav>
    ]);
  }


  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host
        title={this.getTitleText()}
        aria-label={this.getAriaLabel()}
        // tabindex={this.hasNoFeeds() ? -1 : this.taborder}
        class={this.getHostClass()}
        // disabled={this.hasNoFeeds()}
      >


        <Router.Switch>

          <Route path="/">
            {this.getHeader()}
            <honey-news-feed/>
          </Route>

          <Route path="/feeds">
            {this.getHeader()}
            <honey-news-feeds/>
          </Route>

          <Route path="/statistic">
            {this.getHeader()}
            <honey-news-statistic/>
          </Route>

          <Route path="/about">
            {this.getHeader()}
            <p>
            Eine SPA auf Basis mehrerer Webkomponenten, gebaut mit Stencil und styled by papercss.
            </p>
            <p>
              Das minifizierte Stylesheet von PaperCSS wurde über den assets Folder für alle Komponenten zugänglich gemacht.
              Es wurde dann pro Komponente per @import url(...) importiert - was eigentlich ein AntiPattern ist aber ich habe
              aktuell nix besseres gefunden. Daher - warten auf ConstructedStyleSheets Spec ...
              Beim @import url(...) hat sich herausgestellt, dass die CSS Properties (Variablen) nicht mit geladen wurden.
              Daher hab ich diese herausgezogen und unter global/varibales.css eingebunden.
              Dadurch wird in der index.html folgender Eintrag notwendig:
                <pre>
                &lt; link rel="stylesheet" href="/build/honey-news.css"/&gt;
                </pre>
            </p>
            <p>
              Das Routing der SPA wurde über stencil-router-v2 realisiert. Somit wird bei Klick auf einen Link zwar der URL
              geändert aber nicht die ganze Seite neu geladen - was ja praktisch den Kern des Routings in SPAs darstellt.
            </p>
            <p>
              Für das Backend wurde ein nodejs express server verwendet und auf heroku deployed. Ein separates Backend war
              leider auf Grund der üblcihen CORS Problematiken notwendig (CORS-PROXY im Service Worker habe ich leider nicht
              realisiert bekommen - da hat halt der Browser strikt was dagegen).
            </p>

          </Route>

        </Router.Switch>
      </Host>
    );
  }
}
