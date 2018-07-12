import rollupTypescript from 'rollup-plugin-typescript'
import typescript from 'typescript'

export default {
  input: 'index.ts',

  output: [
    {
      format: 'cjs',
      exports: 'named',
      file: 'lib/index.common.js'
    },
    {
      format: 'es',
      file: 'lib/index.esm.js'
    },
    {
      format: 'umd',
      file: 'lib/index.js',
      name: 'acache',
      globals: {}
    },
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  },
  plugins: [
    rollupTypescript({
      typescript
    })
  ]
}
