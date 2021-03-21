import {Component, h, Host} from "@stencil/core";
import {Logger} from "../../../libs/logger";

@Component({
  tag: "honey-news-header",
  styleUrl: "Header.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class Header {

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host>
        <div class="headline">
          <a href="/routemenu">
            <img src="build/assets/burgermenu-fasil.svg" class="headitem burgermenu"/>
            <span class="sr-only">Info für Screenreader</span>
          </a>
          <span class="headitem headingtext">RSS/Atom Feed Reader</span>
        </div>


      </Host>
    );
  }
}
