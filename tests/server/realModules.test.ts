import { execFileSync } from 'node:child_process'

/**
 * Los demás tests usan dobles de Firebase Admin y AWS, así que no detectaron el ERR_REQUIRE_ESM de producción
 * (firebase-admin -> jwks-rsa -> jose@6, solo ESM). El runtime de Vercel no permite require() de ESM:
 * `--no-experimental-require-module` reproduce ese entorno en Node. Solo CARGA los módulos reales; no abre
 * conexiones ni usa credenciales.
 */
const MODULES = ['firebase-admin/app', 'firebase-admin/auth', 'firebase-admin/firestore', 'jwks-rsa', '@aws-sdk/client-sesv2']

const load = (name: string) =>
  execFileSync(process.execPath, ['--no-experimental-require-module', '-e', `require(${JSON.stringify(name)})`], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

describe('carga de módulos reales sin require() de ESM (runtime de Vercel)', () => {
  it.each(MODULES)('%s se puede cargar con require()', (name) => {
    expect(() => load(name)).not.toThrow()
  })

  it('jwks-rsa resuelve un jose con build CommonJS (no el jose@6 solo ESM)', () => {
    const version = execFileSync(
      process.execPath,
      ['-e', "const r=require('module').createRequire(require.resolve('jwks-rsa'));console.log(r('jose/package.json').version)"],
      { encoding: 'utf8' },
    ).trim()
    expect(Number(version.split('.')[0])).toBeLessThan(6)
  })
})
