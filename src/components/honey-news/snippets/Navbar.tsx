import {FunctionalComponent, h} from '@stencil/core';
import {href} from "../../../Router";
// import {href} from "../../../Router";


interface NavbarProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}


function navigateTo(event:Event):void{
  event.preventDefault();
  href(event.currentTarget["pathname"]);
}




export const Navbar: FunctionalComponent<NavbarProps> = () => (
  <nav class="border split-nav">
    <div class="nav-brand">
      <h3 role="heading" aria-level="1"><a href="/">RSS/Atom Feed Reader</a></h3>
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
          <li role="item"><span role="heading" aria-level="2"><a href="/feeds" onClick={navigateTo}  >Feeds</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="/" onClick={navigateTo} >News</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="/statistic" onClick={navigateTo} >Statistik</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="https://github.com/Huluvu424242/honey-news" target="_blank">Github</a></span></li>
          <li role="item"><span role="heading" aria-level="2"><a href="/about" onClick={navigateTo}>About</a></span></li>
        </ul>
      </div>
    </div>
  </nav>
);
