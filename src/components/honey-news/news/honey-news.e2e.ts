import {newE2EPage} from '@stencil/core/testing';
import {E2EElement, E2EPage} from "@stencil/core/testing/puppeteer/puppeteer-declarations";

describe('E2E: honey-news satisfy', () => {

  describe('simple check for present at page', () => {

    let page: E2EPage;
    let element: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({html: `<honey-news></honey-news>`});
      element = await page.find('honey-news');
    });

    it('Add Feed Button is present', async () => {
      const el = await page.find('honey-news');
      expect(el).not.toBeNull();
    });
  });
});

