import {FunctionalComponent, h} from '@stencil/core';
import {href} from "stencil-router-v2";


interface DisclaimerProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}

export const Disclaimer: FunctionalComponent<DisclaimerProps> = () => (
  <div class="row flex-spaces">
    <input class="alert-state" id="disclaimer" type="checkbox"/>
    <div class="alert alert-danger dismissible">
      <div class="row">
        <p>!!! Das ist eine Demo Seite welche alle Feature der App zeigen soll - aus
          diesem Grund ist auch die Statistik eingeschaltet !!!
        </p>
        <div class="background-warning">
          <p>
            Es werden nur Daten zu den abgerufenen Feeds gespeichert (in memory) wie: url, anzahl der
            abfragen,
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
);


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

interface HeaderProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}

export const Header: FunctionalComponent<HeaderProps> = () => ([
  <Disclaimer/>,
  <Navbar/>
]);


interface AboutProps {
  // hier könnten properties für Parameterübergaben rein
}

export const About: FunctionalComponent<AboutProps> = () => ([
  <p>
    Eine SPA auf Basis mehrerer Webkomponenten, gebaut mit Stencil und styled by papercss.
  </p>,
  <p>
    Das minifizierte Stylesheet von PaperCSS wurde über den assets Folder für alle Komponenten zugänglich gemacht.
    Es wurde dann pro Komponente per @import url(...) importiert - was eigentlich ein AntiPattern ist aber ich habe
    aktuell nix besseres gefunden. Daher - warten auf ConstructedStyleSheets Spec ...
    Beim @import url(...) hat sich herausgestellt, dass die CSS Properties (Variablen) nicht mit geladen wurden.
    Daher hab ich diese herausgezogen und unter global/varibales.css eingebunden.
    Dadurch wird in der index.html folgender Eintrag notwendig:
    <pre>
                &lt; link rel="stylesheet" href="/build/honey-news.css"/&gt;
                </pre>
  </p>,
  <p>
    Das Routing der SPA wurde über stencil-router-v2 realisiert. Somit wird bei Klick auf einen Link zwar der URL
    geändert aber nicht die ganze Seite neu geladen - was ja praktisch den Kern des Routings in SPAs darstellt.
  </p>,
  <p>
    Für das Backend wurde ein nodejs express server verwendet und auf heroku deployed. Ein separates Backend war
    leider auf Grund der üblcihen CORS Problematiken notwendig (CORS-PROXY im Service Worker habe ich leider nicht
    realisiert bekommen - da hat halt der Browser strikt was dagegen).
  </p>
]);
