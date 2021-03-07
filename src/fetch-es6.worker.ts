import {Feed} from "feedme/dist/feedme";
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
    }).then((response: Response) => {
      if (response.status != 200) {
        console.error(new Error(`status code ${response.statusText}`));
        return;
      }
      const data: FeedData = {
        status: null, url: null, statusText: null, feedtitle: null, items: null
      };
      data.status = response.status;
      data.statusText = response.statusText;
      data.url = queryUrl;
      response.json().then((feedData) => {
        if(!feedData) {
          console.error("###JSON:" + feedData);
        }
        try {
          const feed: Feed = feedData;
          data.feedtitle = JSON.stringify(feed.title);
          data.items = feed.items;
        } catch (ex) {
          // expect to failed if no body
          console.warn("Error during read data of response " + ex);
        }
        resolve(data);
      });
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

