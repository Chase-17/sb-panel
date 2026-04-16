import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  presetTypography,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        // Game Icons - RPG/fantasy themed
        'game-icons': () => import('@iconify-json/game-icons/icons.json').then(i => i.default),
        // Phosphor - clean modern icons
        'ph': () => import('@iconify-json/ph/icons.json').then(i => i.default),
        // Tabler - line icons
        'tabler': () => import('@iconify-json/tabler/icons.json').then(i => i.default),
      },
    }),
    presetTypography(),
  ],
  theme: {
    colors: {
      // Zombie apocalypse vibes 🧟
      blood: {
        DEFAULT: '#8B0000',
        light: '#B22222',
        dark: '#5C0000',
      },
      decay: {
        DEFAULT: '#556B2F',
        light: '#6B8E23',
        dark: '#3D4F22',
      },
      bone: {
        DEFAULT: '#F5F5DC',
        light: '#FFFFF0',
        dark: '#D4D4AA',
      },
      ash: {
        DEFAULT: '#2F2F2F',
        light: '#404040',
        dark: '#1A1A1A',
      },
      rust: '#B7410E',
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-blood text-bone hover:bg-blood-light active:bg-blood-dark',
    'btn-secondary': 'btn bg-ash-light text-bone border border-bone/20 hover:bg-ash hover:border-bone/40',
    'input-field': 'w-full px-3 py-2 bg-ash/50 border border-bone/20 rounded-lg text-bone placeholder-bone/40 focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood/50 box-border',
    'card': 'bg-ash/80 backdrop-blur-sm rounded-xl p-4 border border-bone/10',
    'icon': 'inline-block w-5 h-5 flex-shrink-0',
    'icon-sm': 'inline-block w-4 h-4 flex-shrink-0',
    'icon-lg': 'inline-block w-6 h-6 flex-shrink-0',
    'icon-xl': 'inline-block w-8 h-8 flex-shrink-0',
  },
})
