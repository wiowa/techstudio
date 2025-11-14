import { NxAppRspackPlugin } from '@nx/rspack/app-plugin.js';
import { NxReactRspackPlugin } from '@nx/rspack/react-plugin.js';
import {
  NxModuleFederationPlugin,
  NxModuleFederationDevServerPlugin,
} from '@nx/module-federation/rspack.js';
import { join } from 'path';

import config from './module-federation.config';

export default {
  resolve: {
    alias: {
      '@wiowa-tech-studio/ui': join(__dirname, '../../libs/shared/ui/src'),
    },
  },
  entry: {
    main: './src/main.ts',
    'service-worker': './src/service-worker.ts',
  },
  output: {
    path: join(__dirname, 'dist'),
    publicPath: 'auto',
  },
  devServer: {
    port: 4201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
  },
  plugins: [
    new NxAppRspackPlugin({
      tsConfig: './tsconfig.app.json',
      main: './src/main.ts',
      index: './src/index.html',
      baseHref: '/',
      assets: [
        './src/favicon.ico',
        './src/assets',
        './src/manifest.json',
        {
          glob: 'service-worker.ts',
          input: './src',
          output: '/',
        },
      ],
      styles: ['./src/styles.css'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactRspackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    new NxModuleFederationPlugin({ config }, { dts: false }),
    new NxModuleFederationDevServerPlugin({ config }),
  ],
};
