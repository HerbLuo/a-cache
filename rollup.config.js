import path from 'path'
import fse from 'fs-extra'
import rollupTypescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'

fse.emptyDirSync(path.join(__dirname, './typings'))

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
      useTsconfigDeclarationDir: true
    }),
    replace({
      exclude: 'node_modules/**',
      ['process.env.NODE_ENV']: JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
}
