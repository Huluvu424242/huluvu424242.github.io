# honey-news

<!-- Auto Generated Below -->


## Properties

| Property             | Attribute | Description                     | Type                        | Default     |
| -------------------- | --------- | ------------------------------- | --------------------------- | ----------- |
| `feedAdministration` | --        | Feeds Administration Komponente | `HTMLHoneyNewsFeedsElement` | `undefined` |
| `newsFeed`           | --        | News reader Komponente          | `HTMLHoneyNewsFeedElement`  | `undefined` |
| `verbose`            | `verbose` | enable console logging          | `boolean`                   | `false`     |


## Dependencies

### Depends on

- [honey-news-statistic](statistic)
- [honey-news-feeds](feeds)
- [honey-news-feed](news)
- [honey-news-header](header)

### Graph
```mermaid
graph TD;
  honey-news --> honey-news-statistic
  honey-news --> honey-news-feeds
  honey-news --> honey-news-feed
  honey-news --> honey-news-header
  style honey-news fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)* by Huluvu424242
