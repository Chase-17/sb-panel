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
      cdn: 'https://esm.sh/',
    }),
    presetTypography(),
  ],
  theme: {
    colors: {
      // Zombie apocalypse vibes 🧟
      blood: '#8B0000',
      decay: '#556B2F',
      bone: '#F5F5DC',
      ash: '#2F2F2F',
      rust: '#B7410E',
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-blood text-bone hover:bg-rust',
    'btn-secondary': 'btn bg-ash text-bone border border-bone/30 hover:bg-bone/10',
    'input-field': 'w-full px-3 py-2 bg-ash/50 border border-bone/20 rounded-lg text-bone placeholder-bone/40 focus:outline-none focus:border-blood',
    'card': 'bg-ash/80 rounded-xl p-4 border border-bone/10',
  },
})
