import {FunctionalComponent, h} from '@stencil/core';
import {href} from "stencil-router-v2";


interface NavbarProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}

export const Navbar: FunctionalComponent<NavbarProps> = () => (
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
);
