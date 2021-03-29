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
        <div class="headline">
          <div class="vertical">
            <button
              ref={(el) => this.burgerButton = el as HTMLButtonElement}
              onClick={() => this.menuIsOpen = !this.menuIsOpen}
            >
              <img src="build/assets/burgermenu-fasil.svg" class="headitem burgermenu"/>
              < span
                class="sr-only">
              {this.menuIsOpen ? "Menü schließen" : "Menü öffnen"}
            </span>
            </button>
            {this.menuIsOpen ?
              <ul role="menu" class="vertical-menu">
                <li role="menuitem"><a href="#" class="active">Home</a></li>
                <li role="menuitem"><a href="#">Link 1</a></li>
              </ul>
              : ""
            }
          </div>
          <span class="headitem headingtext">RSS/Atom Feed Reader</span>
        </div>


      </Host>
    );
  }
}
