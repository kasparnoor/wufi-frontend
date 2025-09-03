// Minimal logger with environment-toggled verbosity
// Security: never log PII or sensitive tokens; callers must sanitize payloads

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDebug = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === 'true'

function log(level: LogLevel, ...args: any[]) {
  if (level === 'debug' && !isDebug) return
  try {
    // eslint-disable-next-line no-console
    ;(console as any)[level](...args)
  } catch {
    // no-op
  }
}

export const logger = {
  debug: (...args: any[]) => log('debug', ...args),
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
}

export default logger


