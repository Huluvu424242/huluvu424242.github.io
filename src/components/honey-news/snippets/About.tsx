import {FunctionalComponent, h} from '@stencil/core';

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
