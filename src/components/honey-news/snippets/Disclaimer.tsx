import {FunctionalComponent, h} from '@stencil/core';


interface DisclaimerProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}

export const Disclaimer: FunctionalComponent<DisclaimerProps> = () => (
  <div class="row flex-spaces">
    <input class="alert-state" id="disclaimer" type="checkbox"/>
    <div class="alert alert-danger dismissible">
      <div class="row">
        <h3>!!! Das ist eine Demo Seite welche alle Feature der App zeigen soll - aus
          diesem Grund ist auch die Statistik eingeschaltet !!!
        </h3>
        <div class="background-warning">
          <p>
            Es werden nur Daten zu den abgerufenen Feeds gespeichert (in memory) wie: URL, Anzahl der
            Abfragen und Anzahl valider Anworten.
            Sollten Sie die Speicherung nicht wünschen - dann geben Sie bitte keinen neuen Feed ein.
            Vielen Dank für Ihr Verständnis.
          </p>
        </div>
      </div>
      <label class="paper-btn" title="Hinweis Ausblenden" htmlFor="disclaimer">X</label>
    </div>
  </div>
);

