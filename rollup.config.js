import typescript from '@rollup/plugin-typescript';
import inlineCode from "rollup-plugin-inline-code";
import commonjs from "@rollup/plugin-commonjs";


export default [
  {
    input: './src/main.ts',
    output: {
      file: './bin/main.js',
      format: 'cjs',
      name: 'main',
      sourcemap: true,
    },
    plugins: [commonjs(), inlineCode(), typescript()]
  },
]