import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [],
  optimizeDeps: {
    exclude: ['chart.js'],
    esbuildOptions: {
      treeShaking: true,
    },
  },
  define: {
    __IS_MICROFRONTEND__: false,
    'process.env': {},
  },
  resolve: {
    alias: {
      '~@thoughtspot': '@thoughtspot',
    },
  },
};

export default config;
