import {Component, Element, h, Host, State} from '@stencil/core';
import {href, listenRouteChanges} from "../../../Router";
import {Disclaimer} from "./Disclaimer";
import {Subscription} from "rxjs";

@Component({
    tag: "honey-news-navbar",
    styleUrl: "Navbar.css",
    assetsDirs: ['../assets', 'assets'],
    shadow: true
})
export class Navbar {


    @Element() hostElement;

    readerLink: HTMLAnchorElement;
    feedsLink: HTMLAnchorElement;
    newsLink: HTMLAnchorElement;
    statisticLink: HTMLAnchorElement;
    aboutLink: HTMLAnchorElement;


    routerSubscription: Subscription = null;
    @State() route: string = "";

    public connectedCallback() {
        // States initialisieren
        this.routerSubscription = listenRouteChanges().subscribe((route: string) => {
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
        href(event.currentTarget["pathname"]);
    }


    render() {
        return (
            <Host>
                <nav class="border split-nav">
                    <div class="nav-brand">
                        <h3 role="heading" aria-level="1"><a href="/"
                                                             ref={(el) => this.readerLink = el as HTMLAnchorElement}
                                                             onClick={this.navigateTo}
                                                             class={this.route === "/" ? "selected" : null}
                        > RSS/Atom Feed Reader</a></h3>
                    </div>
                    <div class="collapsible">
                        <input id="appmenu" type="radio" name="appmenu"/>
                        <label htmlFor="appmenu">
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
                                                                                           ref={(el) => this.feedsLink = el as HTMLAnchorElement}>Feeds</a></span>
                                </li>
                                <li role="listitem"><span role="heading" aria-level="2"><a href="/news"
                                                                                           onClick={this.navigateTo}
                                                                                           class={this.route === "/news" ? "selected" : null}
                                                                                           ref={(el) => this.newsLink = el as HTMLAnchorElement}>News</a></span>
                                </li>
                                <li role="listitem"><span role="heading" aria-level="2"><a href="/statistic"
                                                                                           onClick={this.navigateTo}
                                                                                           class={this.route === "/statistic" ? "selected" : null}
                                                                                           ref={(el) => this.statisticLink = el as HTMLAnchorElement}>Statistik</a></span>
                                </li>
                                <li role="listitem"><span role="heading" aria-level="2"><a
                                    href="https://github.com/Huluvu424242/honey-news"
                                    target="_blank">Github</a></span></li>
                                <li role="listitem"><span role="heading" aria-level="2"><a href="/about"
                                                                                           onClick={this.navigateTo}
                                                                                           class={this.route === "/about" ? "selected" : null}
                                                                                           ref={(el) => this.aboutLink = el as HTMLAnchorElement}>About</a></span>
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
