import { fileURLToPath, URL } from 'node:url'

import Vue from '@vitejs/plugin-vue'
// import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import VueDevTools from 'vite-plugin-vue-devtools'

// import VueMacros from 'unplugin-vue-macros/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    VueDevTools(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        // 'vue/macros',
      ],
      dts: 'src/auto-imports.d.ts',
      // dirs: [
      //   'src/composables',
      //   'src/stores',
      // ],
      vueTemplate: true,
    }),
    // VueMacros({
    //   plugins: {
    //     vue: Vue({
    //       include: [/\.vue$/],
    //       reactivityTransform: true,
    //     }),
    //   },
    // }),
    // Components({
    //   // allow auto load markdown components under `./src/components/`
    //   extensions: ['vue'],
    //   // allow auto import and register components used in markdown
    //   include: [/\.vue$/, /\.vue\?vue/],
    //   dts: 'src/components.d.ts',
    // }),
    Vue({
      include: [/\.vue$/],
    }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
