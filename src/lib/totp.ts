import { createHmac, randomBytes } from 'crypto'

// TOTP (RFC 6238) sobre HOTP (RFC 4226): HMAC-SHA1 de un contador de 30s,
// truncamiento dinámico a 6 dígitos. Implementado con `crypto` del stdlib en
// vez de una librería — el algoritmo es corto y está fijado por estándar;
// verificado contra los 4 vectores de prueba del Apéndice B de la RFC.
const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const PASO_SEGUNDOS = 30
const DIGITOS = 6

function codificarBase32(buffer: Buffer): string {
  let bits = ''
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0')
  let salida = ''
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    salida += ALFABETO_BASE32[parseInt(bits.slice(i, i + 5), 2)]
  }
  return salida
}

function decodificarBase32(base32: string): Buffer {
  const limpio = base32.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const char of limpio) {
    const valor = ALFABETO_BASE32.indexOf(char)
    if (valor === -1) continue
    bits += valor.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

function generarCodigo(secretoBase32: string, contador: number): string {
  const clave = decodificarBase32(secretoBase32)
  const bufferContador = Buffer.alloc(8)
  bufferContador.writeBigUInt64BE(BigInt(contador))
  const hmac = createHmac('sha1', clave).update(bufferContador).digest()
  const offset = hmac[hmac.length - 1]! & 0x0f
  const binario =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff)
  return (binario % 10 ** DIGITOS).toString().padStart(DIGITOS, '0')
}

export function generarSecreto(): string {
  return codificarBase32(randomBytes(20))
}

// Tolera un paso hacia atrás/adelante (±30s) por drift de reloj del dispositivo.
export function verificarCodigo(secretoBase32: string, codigo: string, tolerancia = 1): boolean {
  if (!/^\d{6}$/.test(codigo)) return false
  const contadorActual = Math.floor(Date.now() / 1000 / PASO_SEGUNDOS)
  for (let i = -tolerancia; i <= tolerancia; i++) {
    if (generarCodigo(secretoBase32, contadorActual + i) === codigo) return true
  }
  return false
}

export function otpauthUri(secretoBase32: string, email: string): string {
  const emisor = encodeURIComponent('Forum Foundation')
  return `otpauth://totp/${emisor}:${encodeURIComponent(email)}?secret=${secretoBase32}&issuer=${emisor}&algorithm=SHA1&digits=${DIGITOS}&period=${PASO_SEGUNDOS}`
}
