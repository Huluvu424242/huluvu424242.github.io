import { r as registerInstance, h, e as Host } from './index-b07b787b.js';
import { L as Logger } from './logger-358e14e7.js';

const headerCss = ".headline{display:inline;height:1.5rem}.headitem{height:1.5rem;vertical-align:middle}.burgermenu{border:blue solid 1px}.headingtext{font-size:1.5rem}";

const Header = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    Logger.debugMessage('##RENDER##');
    return (h(Host, null, h("div", { class: "headline" }, h("a", { href: "/routemenu" }, h("img", { src: "build/assets/burgermenu-fasil.svg", class: "headitem burgermenu" }), h("span", { class: "sr-only" }, "Info f\u00FCr Screenreader")), h("span", { class: "headitem headingtext" }, "RSS/Atom Feed Reader"))));
  }
  static get assetsDirs() { return ["assets"]; }
};
Header.style = headerCss;

export { Header as honey_news_header };
