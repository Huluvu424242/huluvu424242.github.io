import {HoneyNews} from "./honey-news";

describe('Unit test: honey-news satisfy', () => {

  it('should init the feedLoader variable', () => {
    const component = new HoneyNews();

    expect(component.feedLoader).not.toBeNull();
  });


});



