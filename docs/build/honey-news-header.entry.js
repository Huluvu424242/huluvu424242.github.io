import { r as registerInstance, h, e as Host } from './index-b07b787b.js';
import { L as Logger } from './logger-358e14e7.js';

const headerCss = ".headline{display:flex;height:1.5rem}.headitem{height:1.5rem;vertical-align:middle}.burgermenu{border:blue solid 1px}.headingtext{font-size:1.5rem}.vertical{flex-direction:column}.vertical-menu{padding:0;list-style:none}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}";

const Header = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.menuIsOpen = false;
  }
  render() {
    Logger.debugMessage('##RENDER##');
    return (h(Host, null, h("div", { class: "headline" }, h("div", { class: "vertical" }, h("button", { ref: (el) => this.burgerButton = el, onClick: () => this.menuIsOpen = !this.menuIsOpen }, h("img", { src: "build/assets/burgermenu-fasil.svg", class: "headitem burgermenu" }), h("span", { class: "sr-only" }, this.menuIsOpen ? "Menü schließen" : "Menü öffnen")), this.menuIsOpen ?
      h("ul", { role: "menu", class: "vertical-menu" }, h("li", { role: "menuitem" }, h("a", { href: "#", class: "active" }, "Home")), h("li", { role: "menuitem" }, h("a", { href: "#" }, "Link 1")))
      : ""), h("span", { class: "headitem headingtext" }, "RSS/Atom Feed Reader"))));
  }
  static get assetsDirs() { return ["assets"]; }
};
Header.style = headerCss;

export { Header as honey_news_header };
