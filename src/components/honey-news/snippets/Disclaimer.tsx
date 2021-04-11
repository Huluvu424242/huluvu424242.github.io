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

