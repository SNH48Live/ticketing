#!/usr/bin/env node

// Kudos: https://gist.github.com/malyw/b4e8284e42fdaeceab9a67a9b0263743

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 2});

  await page.goto('https://shop.48.cn/', {waitUntil: 'networkidle'});

  /**
   * Takes a screenshot of a DOM element on the page.
   *
   * @param {!{path:string, selector:string}=} opts
   * @return {!Promise<!Buffer>}
   */
  async function screenshotDOMElement(opts = {}) {
    const path = 'path' in opts ? opts.path : null;
    const selector = opts.selector;

    if (!selector) {
      throw Error('Please provide a selector.');
    }

    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element)
        return null;
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
    }, selector);

    if (!rect) {
      throw Error(`Could not find element that matches selector: ${selector}.`);
    }

    return await page.screenshot({
      path,
      clip: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    });
  }

  await screenshotDOMElement({
    path: 'ticketing.png',
    selector: '.index_2'
  });

  browser.close();
})();
