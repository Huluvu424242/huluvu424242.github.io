import FeedMe, {Feed} from "feedme/dist/feedme";
import * as http from "http";
import {FeedItem} from "feedme/dist/parser";


export interface Post {
  hashcode: string;
  queryurl: string;
  feedtitle: string;
  exaktdate: Date;
  sortdate: string
  pubdate: string,
  item: FeedItem;
}

export interface ResponseData {
  status: number;
  statusText: string;
  json: JSON;
  text: string;
}

export interface FeedData {
  url: string;
  status: number;
  statusText: string;
  feedtitle: string;
  items: FeedItem[];
}

export async function loadData(request: RequestInfo): Promise<ResponseData> {
  const response: Response = await fetch(request);
  const data: ResponseData = {
    status: null, statusText: null, json: null, text: null
  };
  try {
    data.status = response.status;
    data.statusText = response.statusText;
    data.text = await response.text();
    data.json = JSON.parse(data.text);
  } catch (ex) {
    // expect to failed if no body
    console.warn("Error during read data of response " + ex);
  }
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return data;
}

// async für stencil worker
export async function loadFeedData(url: string): Promise<FeedData> {
  return new Promise<FeedData>((resolve) => {
    const proxyUrl: string = "https://cors-anywhere.herokuapp.com/";
    const queryUrl: string = proxyUrl + url;
    console.debug("###query url " + queryUrl);
    http.get(queryUrl, (response) => {
      if (response.statusCode != 200) {
        console.error(new Error(`status code ${response.statusCode}`));
        return;
      }
      const data: FeedData = {
        status: null, url: null, statusText: null, feedtitle: null, items: null
      };
      let parser = new FeedMe(true);
      // parser.on('title', (title) => {
      //   console.log('title of feed is', title);
      // });
      // parser.on('item', (item) => {
      //   console.log();
      //   console.log('news:', item.title);
      //   console.log(item.description);
      // });
      parser.on('finish', () => {
        try {
          data.status = response.statusCode;
          data.statusText = response.statusMessage;
          data.url = queryUrl;
          const feed: Feed = parser.done();
          data.feedtitle = JSON.stringify(feed.title);
          data.items = feed.items;
        } catch (ex) {
          // expect to failed if no body
          console.warn("Error during read data of response " + ex);
        }
        resolve(data);
      });
      response.pipe(parser);
    });
  });
}

