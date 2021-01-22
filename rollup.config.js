import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'

const plugins = [
  typescript({
    tsconfig: 'tsconfig.json',
    removeComments: true,
    useTsconfigDeclarationDir: true,
  }),
  resolve(),
  terser(),
]

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/pick-element.umd.js', format: 'umd', name: 'Layer', sourcemap: true },
    { file: 'dist/pick-element.js', format: 'esm', sourcemap: true },
  ],
  plugins,
}