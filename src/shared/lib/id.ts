export { nanoid } from '@reduxjs/toolkit'

export function nowIso(): string {
  return new Date().toISOString()
}
