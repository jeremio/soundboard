import antfu from '@antfu/eslint-config'

export default antfu(
  {
    pnpm: true,
    vue: true,
    typescript: true,
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': ['error', {
        order: [['template', 'script'], 'style'],
      }],
    },
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
)
