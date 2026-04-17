import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  // Safelist for dynamically used icons and classes
  safelist: [
    // View mode icons
    'i-tabler-layout-grid', 'i-tabler-grid-dots', 'i-tabler-list', 'i-tabler-table',
    'i-tabler-layout-navbar-expand', 'i-tabler-layout-navbar-collapse',
    // Section icons
    'i-game-icons-skills', 'i-game-icons-star-formation', 'i-game-icons-broken-skull', 'i-game-icons-swap-bag',
    'i-game-icons-progression', 'i-game-icons-stats', 'i-game-icons-person',
    // Attribute icons
    'i-game-icons-muscle-up', 'i-game-icons-running-ninja', 'i-game-icons-heart-organ',
    'i-game-icons-brain', 'i-game-icons-eye-target', 'i-game-icons-psychic-waves',
    // Derived stat icons
    'i-game-icons-hearts', 'i-game-icons-sprint', 'i-game-icons-running-shoe', 'i-game-icons-vine-whip',
    // Skill icons
    'i-game-icons-auto-repair', 'i-game-icons-brain', 'i-game-icons-talk', 'i-game-icons-lock-picking',
    'i-game-icons-fist', 'i-game-icons-pistol-gun', 'i-game-icons-knife-thrust', 'i-game-icons-first-aid-kit',
    'i-game-icons-spy', 'i-game-icons-run', 'i-game-icons-jump-across',
    // Quality icons
    'i-game-icons-shield', 'i-game-icons-ninja-mask', 'i-game-icons-charm', 'i-game-icons-brain-stem',
    'i-game-icons-eye-target', 'i-game-icons-lightning-helix', 'i-game-icons-health-increase',
    // Drawback icons
    'i-game-icons-broken-bone', 'i-game-icons-bleeding-wound', 'i-game-icons-paranoia',
    'i-game-icons-screaming', 'i-game-icons-broken-heart',
    // Inventory icons  
    'i-game-icons-handgun', 'i-game-icons-bowie-knife', 'i-game-icons-backpack', 'i-game-icons-canteen',
    'i-game-icons-flashlight', 'i-game-icons-ammo-box', 'i-game-icons-grenade', 'i-game-icons-walkie-talkie',
    // Inventory type icons
    'i-game-icons-key', 'i-game-icons-bullets', 'i-game-icons-bow-arrow', 'i-game-icons-chest-armor',
    'i-game-icons-cardboard-box', 'i-tabler-check',
    // Attribute color classes
    'text-red-400', 'text-yellow-400', 'text-orange-400', 'text-blue-400', 'text-cyan-400', 'text-purple-400',
    // Section accent colors - text
    'text-cyan-300', 'text-red-500', 'text-red-400', 'text-toxic',
    // Section accent colors - border
    'border-cyan-400', 'border-cyan-400/30', 'hover:border-cyan-400', 'focus:border-cyan-400',
    'border-red-500', 'border-red-500/30', 'hover:border-red-500', 'focus:border-red-500',
    'border-toxic', 'focus:border-toxic',
    'focus:border-cyan-400/50', 'focus:border-red-500/50',
    'border-dashed', 'border-cyan-400/20', 'border-red-500/20',
    // Section accent colors - background
    'bg-cyan-400', 'bg-red-500', 'bg-toxic',
    'bg-yellow-400', 'bg-orange-400', 'bg-purple-400', 'bg-pink-400', 'bg-blue-400',
    // Dynamic color classes for item tiles (color picker colors)
    // gray-400
    'border-gray-400/30', 'hover:border-gray-400', 'text-gray-400', 'text-gray-400/70', 'text-gray-400/60', 'text-gray-400/50', 'text-gray-400/40', 'text-gray-400/20',
    // red-400 & red-500
    'border-red-400/30', 'hover:border-red-400', 'text-red-400/70', 'text-red-400/60', 'text-red-400/50', 'text-red-400/40', 'text-red-400/20',
    'text-red-500/50', 'text-red-500/40', 'text-red-500/20',
    // orange-400
    'border-orange-400/30', 'hover:border-orange-400', 'text-orange-400', 'text-orange-400/70', 'text-orange-400/60', 'text-orange-400/50', 'text-orange-400/40', 'text-orange-400/20',
    // amber-400
    'border-amber-400/30', 'hover:border-amber-400', 'text-amber-400', 'text-amber-400/70', 'text-amber-400/60', 'text-amber-400/50', 'text-amber-400/40', 'text-amber-400/20',
    // yellow-400
    'border-yellow-400/30', 'hover:border-yellow-400', 'text-yellow-400/70', 'text-yellow-400/60', 'text-yellow-400/50', 'text-yellow-400/40', 'text-yellow-400/20',
    // lime-400
    'border-lime-400/30', 'hover:border-lime-400', 'text-lime-400', 'text-lime-400/70', 'text-lime-400/60', 'text-lime-400/50', 'text-lime-400/40', 'text-lime-400/20',
    // green-400
    'border-green-400/30', 'hover:border-green-400', 'text-green-400', 'text-green-400/70', 'text-green-400/60', 'text-green-400/50', 'text-green-400/40', 'text-green-400/20',
    // emerald-400
    'border-emerald-400/30', 'hover:border-emerald-400', 'text-emerald-400', 'text-emerald-400/70', 'text-emerald-400/60', 'text-emerald-400/50', 'text-emerald-400/40', 'text-emerald-400/20',
    // teal-400
    'border-teal-400/30', 'hover:border-teal-400', 'text-teal-400', 'text-teal-400/70', 'text-teal-400/60', 'text-teal-400/50', 'text-teal-400/40', 'text-teal-400/20',
    // cyan-400
    'text-cyan-400/70', 'text-cyan-400/60', 'text-cyan-400/50', 'text-cyan-400/40', 'text-cyan-400/20',
    // sky-400
    'border-sky-400/30', 'hover:border-sky-400', 'text-sky-400', 'text-sky-400/70', 'text-sky-400/60', 'text-sky-400/50', 'text-sky-400/40', 'text-sky-400/20',
    // blue-400
    'border-blue-400/30', 'hover:border-blue-400', 'text-blue-400/70', 'text-blue-400/60', 'text-blue-400/50', 'text-blue-400/40', 'text-blue-400/20',
    // indigo-400
    'border-indigo-400/30', 'hover:border-indigo-400', 'text-indigo-400', 'text-indigo-400/70', 'text-indigo-400/60', 'text-indigo-400/50', 'text-indigo-400/40', 'text-indigo-400/20',
    // violet-400
    'border-violet-400/30', 'hover:border-violet-400', 'text-violet-400', 'text-violet-400/70', 'text-violet-400/60', 'text-violet-400/50', 'text-violet-400/40', 'text-violet-400/20',
    // purple-400
    'border-purple-400/30', 'hover:border-purple-400', 'text-purple-400/70', 'text-purple-400/60', 'text-purple-400/50', 'text-purple-400/40', 'text-purple-400/20',
    // fuchsia-400
    'border-fuchsia-400/30', 'hover:border-fuchsia-400', 'text-fuchsia-400', 'text-fuchsia-400/70', 'text-fuchsia-400/60', 'text-fuchsia-400/50', 'text-fuchsia-400/40', 'text-fuchsia-400/20',
    // pink-400
    'border-pink-400/30', 'hover:border-pink-400', 'text-pink-400', 'text-pink-400/70', 'text-pink-400/60', 'text-pink-400/50', 'text-pink-400/40', 'text-pink-400/20',
    // rose-400
    'border-rose-400/30', 'hover:border-rose-400', 'text-rose-400', 'text-rose-400/70', 'text-rose-400/60', 'text-rose-400/50', 'text-rose-400/40', 'text-rose-400/20',
    // toxic (custom color)
    'border-toxic/30', 'hover:border-toxic', 'text-toxic/70', 'text-toxic/60', 'text-toxic/50', 'text-toxic/40', 'text-toxic/20',
    // Broken item styles
    'border-red-500/50', 'text-red-500/30', 'text-red-500/70', 'line-through',
    'bg-red-500/10', 'bg-red-500/5', 'hover:bg-red-500/10',
    // Ring utilities for color picker selection
    'ring-2', 'ring-bone/50', 'ring-offset-2', 'ring-offset-night',
    'border-3',
    // Layout utilities for display modes
    'columns-2', 'break-inside-avoid', 'line-clamp-2',
    'gap-x-3', 'gap-y-1',
    'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-8',
    'aspect-[3/2]',
    // UI utilities
    'i-tabler-x', 'i-tabler-plus', 'i-tabler-trash', 'i-tabler-edit', 'i-tabler-search',
    'i-game-icons-locked-chest', 'i-game-icons-knapsack',
  ],
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
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Play:400,700',
        display: 'Russo One',
        mono: 'Share Tech Mono',
      },
    }),
  ],
  theme: {
    colors: {
      // Dark apocalypse theme 🧟
      // Background layers
      void: '#000000',      // True black
      night: '#0a0a0a',     // Near black
      dark: '#111111',      // Dark surface
      surface: '#1a1a1a',   // Elevated surface
      
      // Toxic/Acid green accent
      toxic: {
        DEFAULT: '#39FF14',
        dim: '#2ecc10',
        muted: '#1a7a0a',
        glow: '#39FF1440',
      },
      
      // Blood red accent  
      blood: {
        DEFAULT: '#dc2626',
        bright: '#ef4444',
        dim: '#991b1b',
        glow: '#dc262640',
      },
      
      // Text colors
      bone: {
        DEFAULT: '#e5e5e5',
        dim: '#a3a3a3',
        muted: '#525252',
      },
      
      // Status colors
      health: '#dc2626',
      energy: '#22c55e', 
      speed: '#3b82f6',
      essence: '#a855f7',
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded font-sans font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-toxic text-night hover:bg-toxic-dim active:scale-95',
    'btn-secondary': 'btn bg-surface text-bone border-2 border-toxic-muted hover:border-toxic hover:text-toxic',
    'btn-danger': 'btn bg-blood text-bone hover:bg-blood-bright',
    'input-field': 'w-full px-3 py-2 bg-transparent border-b border-bone-muted/50 text-bone font-sans placeholder-bone-muted/50 focus:outline-none focus:border-toxic transition-colors box-border',
    'input-flat': 'bg-transparent border-none outline-none text-center font-sans font-bold',
    'card': 'bg-surface border-2 border-bone-muted rounded-lg p-4',
    'card-toxic': 'bg-surface border-2 border-toxic-muted rounded-lg p-4',
    'card-blood': 'bg-surface border-2 border-blood-dim rounded-lg p-4',
    // Icon sizes (use rem for scaling with root font)
    'icon-xs': 'w-[0.75rem] h-[0.75rem]',
    'icon-sm': 'w-[1rem] h-[1rem]',
    'icon': 'w-[1.25rem] h-[1.25rem]',
    'icon-lg': 'w-[1.5rem] h-[1.5rem]',
    'icon-xl': 'w-[2rem] h-[2rem]',
  },
  // Reset button styles
  preflights: [
    {
      getCSS: () => `
        html {
          font-size: 20px;
        }
        @media (min-width: 768px) {
          html {
            font-size: 16px;
          }
        }
        button {
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          font: inherit;
          color: inherit;
          cursor: pointer;
        }
        button:focus {
          outline: none;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `
    }
  ],
})
