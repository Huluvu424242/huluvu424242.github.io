import {Component, Element, h, Host, State} from '@stencil/core';
import {navigateToRoute, router} from "../routing/SimpleRouter";
import {Disclaimer} from "../snippets/Disclaimer";
import {Subscription} from "rxjs";

@Component({
  tag: "honey-news-header",
  styleUrl: "Header.css",
  assetsDirs: ['../assets', 'assets'],
  shadow: true
})
export class Header {


  @Element() hostElement;

  routerSubscription: Subscription = null;
  @State() route: string = "";

  public connectedCallback() {
    // States initialisieren
    this.routerSubscription = router.getRouteListener().subscribe((route: string) => {
        this.route = route;
      },
      (error) => {
        console.error(error);
      },
      () => {
        console.info("Router Subject' complete");
      });
  }


  public disconnectedCallback() {
    this.routerSubscription.unsubscribe();
  }

  protected navigateTo(event: UIEvent): void {
    event.preventDefault();
    navigateToRoute(event.currentTarget["pathname"]);
  }


  render() {
    return (
      <Host>
        <nav class="border split-nav">
          <div class="nav-brand">
            <h3 role="heading" aria-level="1"><a href="/"
                                                 onClick={this.navigateTo}
                                                 class={this.route === "/" ? "selected" : null}
            > RSS/Atom Feed Reader</a></h3>
          </div>
          <div class="collapsible">
            <input id="collapsible0" type="checkbox" name="collapsible0"/>
            <label htmlFor="collapsible0">
              <div class="bar1"/>
              <div class="bar2"/>
              <div class="bar3"/>
              <div class="bar4"/>
              <div class="bar5"/>
            </label>
            <div class="collapsible-body">
              <ul role="listbox" class="inline">
                <li role="listitem"><span role="heading" aria-level="2"><a href="/feeds"
                                                                           onClick={this.navigateTo}
                                                                           class={this.route === "/feeds" ? "selected" : null}
                >Feeds</a></span>
                </li>
                <li role="listitem"><span role="heading" aria-level="2"><a href="/news"
                                                                           onClick={this.navigateTo}
                                                                           class={this.route === "/news" ? "selected" : null}
                >News</a></span>
                </li>
                <li role="listitem"><span role="heading" aria-level="2"><a href="/statistic"
                                                                           onClick={this.navigateTo}
                                                                           class={this.route === "/statistic" ? "selected" : null}
                >Statistik</a></span>
                </li>
                <li role="listitem"><span role="heading" aria-level="2"><a
                  href="https://github.com/Huluvu424242/honey-news"
                  target="_blank">Github</a></span></li>
                <li role="listitem"><span role="heading" aria-level="2"><a href="/about"
                                                                           onClick={this.navigateTo}
                                                                           class={this.route === "/about" ? "selected" : null}
                >About</a></span>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <Disclaimer/>
      </Host>
    );
  }
}
