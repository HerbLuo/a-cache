import replace from 'rollup-plugin-replace'

export default {
  input: 'tsc-out/index.js',

  output: [
    {
      format: 'cjs',
      exports: 'named',
      file: 'lib/index.js'
    },
    {
      format: 'es',
      file: 'lib/index.esm.js'
    },
    {
      format: 'umd',
      file: 'lib/index.umd.js',
      name: 'acache',
      globals: {}
    },
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  },
  plugins: [
    replace({
      exclude: 'node_modules/**',
      ['process.env.NODE_ENV']: JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
}
