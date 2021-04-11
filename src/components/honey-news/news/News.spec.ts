import {News} from "./Feed";

describe('Unit test: honey-news satisfy', () => {

  it('should init the feedLoader variable', () => {
    const component = new News();

    expect(component.feedLoader).not.toBeNull();
  });


});



