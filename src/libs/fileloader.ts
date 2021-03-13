import {Logger} from "./logger";

export interface ResponseInfo {
  content: string;
  status: number;
}

export class Fileloader {

  static async loadData(dataUrl: string): Promise<string> {
    const fileLoader: Fileloader = Fileloader.of(dataUrl);
    if (fileLoader) {
      return await fileLoader.loadFileContent();
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }

  protected url: URL;

  constructor(fileURL: URL) {
    this.url = fileURL;
  }

  public static of(fileURL: string): Fileloader {
    try {
      return new Fileloader(new URL(fileURL));
    } catch (ex) {
      Logger.errorMessage("Invalid URL:" + fileURL + "\n" + ex);
      return null;
    }
  }

  public async loadFileContent(): Promise<string> {
    // const headers: Headers = new Headers();
    const response = await fetch(this.url.toString(), {
      // method: 'GET', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
      // headers: headers,
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    if (response.ok) {
      return response.text();
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }


  public static async loadCCCFeed(): Promise<string> {
    try {
      const headers = new Headers();
      headers.append('Origin', 'media.ccc.de');
      headers.append('origin', 'media.ccc.de');
      headers.set('Origin', 'media.ccc.de');
      headers.set('origin', 'media.ccc.de');
      const response = await fetch("https://media.ccc.de/news.atom", {
        referrer: 'media.ccc.de',
        headers: headers,
        // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      });
      return response.text();
    } catch (fehler) {
      Logger.errorMessage("ccc fetch error:" + fehler)
      return new Promise<string>((resolve) => {
        resolve(null);
      });
    }
  }


  public static loadCCCFeedProxy(): any {
    const url: string = "https://media.ccc.de/news.atom";
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';


    // var slice = [].slice;
    // var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      // var args = slice.call(arguments);
      // var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
      // if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
      //   targetOrigin[1] !== cors_api_host) {
      //   args[1] = cors_api_url + args[1];
      // }
      const urlCall = cors_api_url + url;
      Logger.debugMessage("###" + urlCall);
      return open.apply(this, urlCall);
    };
  }


  public static async loadCCCFeedXML(): Promise<string> {
    function reqListener() {
      Logger.debugMessage('#####' + this.responseText);
    }

    try {
      var oReq = new XMLHttpRequest();
      oReq.addEventListener("load", reqListener);
      oReq.open("GET", "https://cors-anywhere.herokuapp.com/https://media.ccc.de/news.atom");
      oReq.send();

      return "ccc test";
    } catch (fehler) {
      Logger.errorMessage("ccc fetch error:" + fehler)
      return new Promise<string>((resolve) => {
        resolve(null);
      });
    }
  }

  public static async load4ChanFeed(): Promise<string> {
    function reqListener() {
      Logger.debugMessage('#####' + this.responseText);
    }

    try {
      var oReq = new XMLHttpRequest();
      oReq.addEventListener("load", reqListener);
      oReq.open("GET", "https://cors-anywhere.herokuapp.com/https://a.4cdn.org/a/threads.json");
      oReq.send();

      return "4chan test";
    } catch (fehler) {
      Logger.errorMessage("4chan fetch error:" + fehler)
      return new Promise<string>((resolve) => {
        resolve(null);
      });
    }
  }


  // public static async loadSparkFeed(): Promise<string> {
  //   const response = await fetch("https://codepen.io/spark/feed");
  //   if (response.ok) {
  //     return response.text();
  //   } else {
  //     return new Promise<string>((resolve) => {
  //       resolve(null);
  //     });
  //   }
  // }

  // public static async loadHongkiatFeed(): Promise<string> {
  //   const response = await fetch("https://cors-anywhere.herokuapp.com/https://www.hongkiat.com/blog/feed/");
  //   if (response.ok) {
  //     return response.text();
  //   } else {
  //     return new Promise<string>((resolve) => {
  //       resolve(null);
  //     });
  //   }
  // }
}
