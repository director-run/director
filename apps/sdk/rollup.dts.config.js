import dts from 'rollup-plugin-dts'
import { resolve } from 'path'

export default {
  input: 'dist/index.d.ts',
  output: {
    file: 'dist/index.bundled.d.ts',
    format: 'es'
  },
  external: [],
  plugins: [
    dts({
      respectExternal: false,
    })
  ],
  resolve: {
    alias: {
      '@director.run/gateway/client': resolve('../../packages/gateway/src/client.ts'),
      '@director.run/registry/client': resolve('../../apps/registry/src/client.ts')
    }
  }
}