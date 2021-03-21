import {Feed} from "./Feed";

describe('Unit test: honey-news satisfy', () => {

  it('should init the feedLoader variable', () => {
    const component = new Feed();

    expect(component.feedLoader).not.toBeNull();
  });


});



