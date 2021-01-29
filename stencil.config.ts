import {Config} from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';
// import resolvePlugin from 'rollup-plugin-commonjs';

export const config: Config = {
  namespace: 'honey-news',
  testing: {
    /**
     * Gitlab CI doesn't allow sandbox, therefor this parameters must be passed to your Headless Chrome
     * before it can run your tests
     */
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
      strict: true,
      footer: '*Built with [StencilJS](https://stenciljs.com/)* by Huluvu424242'
    },
    {
      type: 'docs-json',
      file: 'src/components/custom-elements.json'
    },
    {
      type: 'www',
      dir: 'docs',
      serviceWorker: {
        swSrc: 'src/sw.js'
      }
    }
  ],
  rollupPlugins: {
    before: [
      // Plugins injected before rollupNodeResolve()
      // resolvePlugin()
    ],
    after: [
      // Plugins injected after commonjs()
      nodePolyfills()
    ]
  }
};


