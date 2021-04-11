import {News} from "./News";

describe('Unit test: honey-news satisfy', () => {

  it('should init the feedLoader variable', () => {
    const component = new News();

    expect(component.feedLoader).not.toBeNull();
  });


});



