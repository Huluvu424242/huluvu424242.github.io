import FeedMe, {Feed} from "feedme/dist/feedme";
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
    const backendUrl: string = "https://huluvu424242.herokuapp.com/feed";
    const queryUrl: string = backendUrl + "?url=" + url;
    console.debug("###query url " + queryUrl);
    fetch(queryUrl, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      // headers: {
      //   'Content-Type': 'application/json'
      //   // 'Content-Type': 'application/x-www-form-urlencoded',
      // },
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then((response: Response) => {
      if (response.status != 200) {
        console.error(new Error(`status code ${response.statusText}`));
        return;
      }
      const data: FeedData = {
        status: null, url: null, statusText: null, feedtitle: null, items: null
      };
      let parser = new FeedMe(true);
      parser.end(response.text());
      // const feed = parser.done() as Feed;
      try {
        data.status = response.status;
        data.statusText = response.statusText;
        data.url = queryUrl;
        const feed: Feed = parser.done();
        data.feedtitle = JSON.stringify(feed.title);
        data.items = feed.items;
      } catch (ex) {
        // expect to failed if no body
        console.warn("Error during read data of response " + ex);
      }
      resolve(data);
      // parser.on('finish', () => {
      //   try {
      //     data.status = response.status;
      //     data.statusText = response.statusText;
      //     data.url = queryUrl;
      //     const feed: Feed = parser.done();
      //     data.feedtitle = JSON.stringify(feed.title);
      //     data.items = feed.items;
      //   } catch (ex) {
      //     // expect to failed if no body
      //     console.warn("Error during read data of response " + ex);
      //   }
      //   resolve(data);
      // });
      // response.pipe(parser);
    });
  });
}

