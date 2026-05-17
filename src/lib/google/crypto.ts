// Cifrado simétrico de tokens OAuth en reposo (AES-256-GCM).
// Server-only: usa node:crypto y la AUTH_SECRET del entorno.

import crypto from "crypto"

const ALGO = "aes-256-gcm"

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET no configurado: requerido para cifrar tokens")
  }
  // Deriva una clave de 32 bytes determinística desde el secreto.
  return crypto.createHash("sha256").update(secret).digest()
}

/** Devuelve "ivB64:tagB64:dataB64". */
export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    enc.toString("base64"),
  ].join(":")
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":")
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Token cifrado con formato inválido")
  }
  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(ivB64, "base64")
  )
  decipher.setAuthTag(Buffer.from(tagB64, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8")
}
