import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-4dadc9b2.js';

class Logger {
  constructor(enableLogging) {
    Logger.isLoggingActive = enableLogging;
  }
  static disableLogging() {
    this.isLoggingActive = false;
  }
  static enableLogging() {
    this.isLoggingActive = true;
  }
  static toggleLogging(enableLogging) {
    if (enableLogging) {
      Logger.enableLogging();
    }
    else {
      Logger.disableLogging();
    }
  }
  static logMessage(message) {
    if (console && this.isLoggingActive) {
      console.log(message);
    }
  }
  static debugMessage(message) {
    if (console && this.isLoggingActive) {
      console.debug(message);
    }
  }
  static errorMessage(message) {
    if (console && this.isLoggingActive) {
      console.error(message);
    }
  }
  static infoMessage(message) {
    if (console && this.isLoggingActive) {
      console.info(message);
    }
  }
}
Logger.isLoggingActive = true;

class Synthese {
  constructor() {
    this.sprachSynthese = window.speechSynthesis;
    this.sprachSynthese.onvoiceschanged = () => {
      if (!this.voices || this.voices.length < 1) {
        this.voices = this.sprachSynthese.getVoices();
        Logger.debugMessage("voices changed to: " + this.voices.join(","));
      }
      else {
        Logger.debugMessage("voices alraedy initialized");
      }
    };
    Logger.debugMessage("call getVoices()");
    this.sprachSynthese.getVoices();
  }
  getVoices() {
    return this.voices;
  }
}

class Sprachausgabe {
  constructor(onSpeakerStarted, onSpeakerFinished, onSpeakerPaused, onSpeakerResume, onSpeakerFailed, audioLang, audioPitch, audioRate, audioVolume, voiceName) {
    this.onSpeakerStarted = (ev) => onSpeakerStarted(ev);
    this.onSpeakerFinished = (ev) => onSpeakerFinished(ev);
    this.onSpeakerPaused = (ev) => onSpeakerPaused(ev);
    this.onSpeakerResume = (ev) => onSpeakerResume(ev);
    this.onSpeakerFailed = (ev) => onSpeakerFailed(ev);
    this.audioLang = audioLang;
    this.audioPitch = audioPitch;
    this.audioRate = audioRate;
    this.audioVolume = audioVolume;
    this.voiceName = voiceName;
    this.stimme = undefined;
    Logger.infoMessage("####constructor finished");
  }
  getDefaultStimme() {
    var namedMatch;
    var langMatches = [];
    var langDefaultMatch;
    var defaultMatch;
    const voices = Sprachausgabe.synthese.getVoices();
    Logger.infoMessage("Found voices:" + JSON.stringify(voices));
    if (!voices)
      return null;
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === this.voiceName ||
        voices[i].lang === this.audioLang ||
        voices[i].default) {
        Logger.debugMessage("voice matched:" + voices[i].name + voices[i].lang);
        if (voices[i].name === this.voiceName) {
          namedMatch = voices[i];
        }
        if (voices[i].lang === this.audioLang &&
          voices[i].default) {
          langDefaultMatch = voices[i];
        }
        if (voices[i].lang === this.audioLang) {
          langMatches.push(voices[i]);
        }
        if (voices[i].default) {
          defaultMatch = voices[i];
        }
      }
    }
    // Auswertung
    if (namedMatch) {
      return namedMatch;
    }
    if (langDefaultMatch) {
      return langDefaultMatch;
    }
    if (langMatches && langMatches.length > 0) {
      return langMatches[0];
    }
    if (defaultMatch) {
      return defaultMatch;
    }
    return voices[0];
  }
  erzeugeVorleser(text) {
    Logger.infoMessage("erzeugeVorleser started");
    const vorleser = new SpeechSynthesisUtterance(text);
    vorleser.onend = this.onSpeakerFinished;
    vorleser.onstart = this.onSpeakerStarted;
    vorleser.onpause = this.onSpeakerPaused;
    vorleser.onresume = this.onSpeakerResume;
    vorleser.onerror = this.onSpeakerFailed;
    vorleser.pitch = this.audioPitch;
    vorleser.rate = this.audioRate;
    vorleser.volume = this.audioVolume;
    vorleser.voice = this.stimme;
    vorleser.lang = this.audioLang;
    return vorleser;
  }
  textVorlesen(zuLesenderText) {
    if (!this.stimme) {
      this.stimme = this.getDefaultStimme();
      Logger.infoMessage("set default voice to " + this.stimme);
    }
    if (zuLesenderText) {
      // Auftrennung in Textblöcken nach Sprachen.
      // const texte: string[] = zuLesenderText.match(/(\S+[\s.]){1,20}/g);
      const vorleser = this.erzeugeVorleser(zuLesenderText);
      Logger.infoMessage("speaker lang used:" + vorleser.lang);
      if (vorleser.voice) {
        Logger.infoMessage("speaker voice used:" + vorleser.voice.name);
        Logger.infoMessage("speaker voice lang:" + vorleser.voice.lang);
      }
      else {
        Logger.infoMessage("no voice matched for text: " + zuLesenderText);
      }
      Sprachausgabe.synthese.sprachSynthese.speak(vorleser);
    }
  }
  pause() {
    Sprachausgabe.synthese.sprachSynthese.pause();
  }
  resume() {
    Sprachausgabe.synthese.sprachSynthese.resume();
  }
  cancel() {
    Sprachausgabe.synthese.sprachSynthese.cancel();
  }
}
Sprachausgabe.synthese = new Synthese();

class Fileloader {
  constructor(fileURL) {
    this.url = fileURL;
  }
  static async loadData(dataUrl) {
    const fileLoader = Fileloader.of(dataUrl);
    if (fileLoader) {
      return await fileLoader.loadFileContent();
    }
    else {
      return new Promise((resolve) => { resolve(null); });
    }
  }
  static of(fileURL) {
    try {
      return new Fileloader(new URL(fileURL));
    }
    catch (ex) {
      Logger.errorMessage("Invalid URL:" + fileURL + "\n" + ex);
      return null;
    }
  }
  async loadFileContent() {
    // const headers: Headers = new Headers();
    const response = await fetch(this.url.toString(), {
      method: 'GET',
    });
    if (response.ok) {
      return response.text();
    }
    else {
      return new Promise((resolve) => { resolve(null); });
    }
  }
}

const honeyNewsCss = ":host>svg{padding:var(--honey-news-padding, 5px);font-size:var(--honey-news-font-size, medium);border:var(--honey-news-border, 0);width:var(--honey-news-width, 36px);height:var(--honey-news-height, 36px)}:host>svg>path{stroke-width:5}.speakerimage{stroke:var(--honey-news-color, blue);fill:var(--honey-news-color, blue);background:var(--honey-news-background, transparent)}.speakerimage-disabled{stroke:var(--honey-disabled-color, gray);fill:var(--honey-disabled-color, gray);background:var(--honey-disabled-background, lightgrey);cursor:var(--honey-disabled-cursor, not-allowed)}";

const HoneyNews = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.honeySpeakerStarted = createEvent(this, "honeySpeakerStarted", 7);
    this.honeySpeakerFinished = createEvent(this, "honeySpeakerFinished", 7);
    this.honeySpeakerPaused = createEvent(this, "honeySpeakerPaused", 7);
    this.honeySpeakerResume = createEvent(this, "honeySpeakerResume", 7);
    this.honeySpeakerFailed = createEvent(this, "honeySpeakerFailed", 7);
    this.options = {
      disabledHostClass: "speaker-disabled",
      enabledHostClass: "speaker-enabled",
      disabledTitleText: "Vorlesen deaktiviert, da keine Texte verfügbar",
      pressedTitleText: "Liest gerade vor",
      unpressedTitleText: "Vorlesen",
      pressedAltText: "Symbol eines tönenden Lautsprechers",
      unpressedAltText: "Symbol eines angehaltenen, tönenden Lautsprechers",
      pressedPureAltText: "Symbol eines tönenden Lautsprechers",
      unpressedPureAltText: "Symbol eines ausgeschaltenen Lautsprechers"
    };
    /**
     * true wenn das Tag ohne alt Attribute deklariert wurde
     */
    this.createAltText = false;
    /**
     * true wenn das Tag ohne title Attribut deklariert wurde
     */
    this.createTitleText = false;
    /**
     * initial computed taborder
     */
    this.taborder = "0";
    /**
     * texte to speech out
     */
    this.texts = [];
    /**
     * if the toggle button is pressed
     */
    this.isPressed = false;
    /**
     * use pure speaker symbol for silence state
     */
    this.pure = false;
    /**
     * enable console logging
     */
    this.verbose = false;
    /**
     * icon width
     */
    this.iconwidth = "36";
    /**
     * icon height
     */
    this.iconheight = "36";
    /**
     * i18n language ident for Web Speech API: de-DE or en or de ...
     */
    this.audiolang = "de-DE";
    /**
     * pitch for Web Speech API
     */
    this.audiopitch = 1;
    /**
     * rate for Web Speech API
     */
    this.audiorate = 1;
    /**
     * volume for Web Speech API
     */
    this.audiovolume = 1;
    /**
     * voice name used of Web Speech API
     */
    this.voicename = undefined;
  }
  connectedCallback() {
    // States initialisieren
    this.ident = this.hostElement.id ? this.hostElement.id : Math.random().toString(36).substring(7);
    this.initialHostClass = this.hostElement.getAttribute("class") || "";
    this.createTitleText = !this.hostElement.title;
    this.createAltText = !this.hostElement["alt"];
    this.taborder = this.hostElement.getAttribute("tabindex") ? (this.hostElement.tabIndex + "") : "0";
    // Properties auswerten
    Logger.toggleLogging(this.verbose);
  }
  async componentWillLoad() {
    this.sprachAusgabe = new Sprachausgabe(() => {
      this.isPressed = true;
      this.honeySpeakerStarted.emit(this.ident);
      Logger.debugMessage("Vorlesen gestartet");
    }, () => {
      this.isPressed = false;
      this.honeySpeakerFinished.emit(this.ident);
      Logger.debugMessage("Vorlesen beendet");
    }, () => {
      this.isPressed = false;
      this.honeySpeakerPaused.emit(this.ident);
      Logger.debugMessage("Pause mit Vorlesen");
    }, () => {
      this.isPressed = true;
      this.honeySpeakerResume.emit(this.ident);
      Logger.debugMessage("Fortsetzen mit Vorlesen");
    }, (ev) => {
      this.isPressed = false;
      this.honeySpeakerFailed.emit(this.ident);
      Logger.errorMessage("Fehler beim Vorlesen" + JSON.stringify(ev));
    }, this.audiolang, this.audiopitch, this.audiorate, this.audiovolume, this.voicename);
    await this.updateTexte();
  }
  /**
   * Update speaker options
   * @param options : NewsOptions plain object to set the options
   */
  async updateOptions(options) {
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        this.options[prop] = options[prop];
      }
    }
    this.options = Object.assign({}, this.options);
  }
  /**
   * bricht laufende oder pausierende Ausgaben ab und startet dia Ausgabe von vorn
   */
  async startSpeaker() {
    // init für toggleAction
    this.isPressed = false;
    // negiert isPressed bricht vorher laufende Ausgaben ab
    await this.toggleAction();
  }
  /**
   * paused the speaker
   */
  async pauseSpeaker() {
    this.isPressed = false;
    this.sprachAusgabe.pause();
  }
  /**
   * continue speaker after paused
   */
  async resumeSpeaker() {
    this.isPressed = true;
    this.sprachAusgabe.resume();
  }
  /**
   * cancel the speaker
   */
  async cancelSpeaker() {
    this.isPressed = false;
    this.sprachAusgabe.cancel();
  }
  /**
   * call the toggle speaker action
   */
  async toggleSpeaker() {
    await this.toggleAction();
  }
  hasNoTexts() {
    return (!this.texts
      || this.texts.length < 1
      || this.texts.filter(item => item.trim().length > 0).length < 1);
  }
  createNewTitleText() {
    if (this.hasNoTexts()) {
      return this.options.disabledTitleText;
    }
    if (this.isPressed) {
      return this.options.pressedTitleText;
    }
    else {
      return this.options.unpressedTitleText;
    }
  }
  getTitleText() {
    if (this.createTitleText) {
      return this.createNewTitleText();
    }
    else {
      return this.hostElement.title;
    }
  }
  createNewAltText() {
    if (this.isPressed) {
      return this.pure ? this.options.pressedPureAltText : this.options.pressedAltText;
    }
    else {
      return this.pure ? this.options.unpressedPureAltText : this.options.unpressedAltText;
    }
  }
  getAltText() {
    if (this.createAltText) {
      return this.createNewAltText();
    }
    else {
      return this.hostElement.getAttribute("alt");
    }
  }
  loadDOMElementTexte() {
    if (this.textids) {
      const refIds = this.textids.split(",");
      refIds.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
          this.texts = [...this.texts, element.innerText];
        }
        else {
          Logger.errorMessage("text to speak not found of DOM element with id " + elementId);
        }
      });
    }
  }
  async loadAudioUrlText() {
    if (this.texturl) {
      Logger.debugMessage("audioURL: " + this.texturl);
      const audioData = await Fileloader.loadData(this.texturl);
      if (audioData) {
        this.texts = [...this.texts, audioData];
      }
      Logger.debugMessage('###Texte###' + this.texts);
    }
  }
  async updateTexte() {
    this.texts = [];
    this.loadDOMElementTexte();
    await this.loadAudioUrlText();
  }
  textidsChanged(newValue, oldValue) {
    Logger.debugMessage("textids changed from" + oldValue + " to " + newValue);
    this.updateTexte();
  }
  async texturlChanged(newValue, oldValue) {
    this.texturl = newValue;
    Logger.debugMessage("texturl changed from" + oldValue + " to " + newValue);
    await this.updateTexte();
  }
  getTexte() {
    if (this.texts) {
      return this.texts;
    }
    else {
      return [];
    }
  }
  textVorlesen(text) {
    this.isPressed = true;
    this.sprachAusgabe.textVorlesen(text + " ");
  }
  async toggleAction() {
    Logger.debugMessage("###TOGGLE TO" + this.isPressed);
    if (!this.isPressed) {
      await this.cancelSpeaker();
    }
    this.isPressed = !this.isPressed;
    const texte = this.getTexte();
    if (this.isPressed && texte.length > 0) {
      const vorzulesenderText = texte.join('');
      this.textVorlesen(vorzulesenderText);
    }
    else {
      await this.cancelSpeaker();
    }
  }
  async onClick() {
    if (this.hasNoTexts())
      return;
    await this.toggleAction();
  }
  async onKeyDown(ev) {
    if (this.hasNoTexts())
      return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      await this.toggleAction();
    }
  }
  getHostClass() {
    let hostClass = this.initialHostClass;
    if (this.hasNoTexts()) {
      return hostClass + " " + this.options.disabledHostClass;
    }
    else {
      return hostClass + " " + this.options.enabledHostClass;
    }
  }
  render() {
    Logger.debugMessage('##RENDER##');
    return (h(Host, { title: this.getTitleText(), alt: this.getAltText(), role: "button", tabindex: this.hasNoTexts() ? -1 : this.taborder, "aria-pressed": this.isPressed ? "true" : "false", class: this.getHostClass(), disabled: this.hasNoTexts() }, this.isPressed ? (h("svg", { id: this.ident + "-svg", xmlns: "http://www.w3.org/2000/svg", width: this.iconwidth, height: this.iconheight, role: "img", "aria-label": this.getAltText(), class: this.hasNoTexts() ? "speakerimage-disabled" : "speakerimage", viewBox: "0 0 75 75" }, h("path", { "stroke-linejoin": "round", d: "M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z" }), h("path", { id: this.ident + "-air", fill: "none", "stroke-linecap": "round", d: "M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" }, h("animate", { id: "airanimation", attributeType: "CSS", attributeName: "opacity", from: "1", to: "0", dur: "1s", repeatCount: "indefinite" })))) : (h("svg", { id: this.ident + "-svg", xmlns: "http://www.w3.org/2000/svg", width: this.iconwidth, height: this.iconheight, role: "img", "aria-label": this.getAltText(), class: this.hasNoTexts() ? "speakerimage-disabled" : "speakerimage", viewBox: "0 0 75 75" }, h("path", { "stroke-linejoin": "round", d: "M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z" }), this.pure ? (h("text", { id: this.ident + "-text", x: "60%", y: "55%" }, "OFF")) : (h("path", { id: this.ident + "-air", fill: "none", "stroke-linecap": "round", d: "M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" }))))));
  }
  static get assetsDirs() { return ["assets"]; }
  get hostElement() { return getElement(this); }
  static get watchers() { return {
    "textids": ["textidsChanged"],
    "texturl": ["texturlChanged"]
  }; }
};
HoneyNews.style = honeyNewsCss;

export { HoneyNews as honey_news };
