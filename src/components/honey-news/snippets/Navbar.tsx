import {FunctionalComponent, h} from '@stencil/core';
import {getClass, href} from "../../../Router";
// import {href} from "../../../Router";


interface NavbarProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}


function navigateTo(event:Event):void{
  event.preventDefault();
  href(event.currentTarget["pathname"]);
}


let readerLink: HTMLAnchorElement;
let feedsLink: HTMLAnchorElement;
let newsLink: HTMLAnchorElement;
let statisticLink: HTMLAnchorElement;
let aboutLink: HTMLAnchorElement;


export const Navbar: FunctionalComponent<NavbarProps> = () => (

  <nav class="border split-nav">
    <div class="nav-brand">
      <h3 role="heading" aria-level="1"><a href="/" onClick={navigateTo} class={getClass(readerLink)} ref={(el) => readerLink = el as HTMLAnchorElement}>RSS/Atom Feed Reader</a></h3>
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
          <li role="item"><span role="heading" aria-level="2"><a href="/feeds" onClick={navigateTo} class={getClass(feedsLink)} ref={(el) => feedsLink = el as HTMLAnchorElement}>Feeds</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="/news" onClick={navigateTo} class={getClass(newsLink)}  ref={(el) => newsLink = el as HTMLAnchorElement}>News</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="/statistic" onClick={navigateTo} class={getClass(statisticLink)}  ref={(el) => statisticLink = el as HTMLAnchorElement}>Statistik</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="https://github.com/Huluvu424242/honey-news" target="_blank">Github</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="/about" onClick={navigateTo} class={getClass(aboutLink)}  ref={(el) => aboutLink = el as HTMLAnchorElement}>About</a></span></li>
        </ul>
      </div>
    </div>
  </nav>
);
