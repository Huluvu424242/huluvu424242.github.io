import {Component, h, Host, State} from "@stencil/core";
import {Logger} from "../../../libs/logger";

@Component({
  tag: "honey-news-header",
  styleUrl: "Header.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class Header {

  @State() menuIsOpen: boolean = false;

  burgerButton: HTMLButtonElement

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host>
        <div class="row flex-spaces">
          <input class="alert-state" id="disclaimer" type="checkbox"/>
          <div class="alert alert-danger dismissible">
            <div class="row">
              <p>!!! Das ist eine Demo Seite welche alle Feature der App zeigen soll - aus
                diesem Grund ist auch die Statistik eingeschaltet !!!
              </p>
              <div class="background-warning">
                <p>
                  Es werden nur Daten zu den abgerufenen Feeds gespeichert (in memory) wie: url, anzahl der abfragen,
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
        </div>
        <nav class="border fixed split-nav">
          <div class="nav-brand">
            <h3><a href="#">RSS/Atom Feed Reader</a></h3>
          </div>
          <div class="collapsible">
            <input id="collapsible1" type="checkbox" name="collapsible1"/>
            <label htmlFor="collapsible1">
              <div class="Feeds"></div>
              <div class="News"></div>
              <div class="Statistik"></div>
              <div class="About"></div>
              <div class="Github"></div>
            </label>
            <div class="collapsible-body">
              <ul class="inline">
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Github</a></li>
                <li><a href="#">Credits</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </Host>
    );
  }
}
