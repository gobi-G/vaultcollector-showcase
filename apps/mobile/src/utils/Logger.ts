/* eslint-disable no-console */
const isDev = __DEV__;

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function formatMessage(level: LogLevel, tag: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${tag}]`;
  if (context) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug(tag: string, message: string, context?: LogContext) {
    if (isDev) {
      console.log(formatMessage("debug", tag, message, context));
    }
  },

  info(tag: string, message: string, context?: LogContext) {
    if (isDev) {
      console.info(formatMessage("info", tag, message, context));
    }
  },

  warn(tag: string, message: string, context?: LogContext) {
    console.warn(formatMessage("warn", tag, message, context));
  },

  error(tag: string, message: string, error?: unknown, context?: LogContext) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? "");
    const combined = { ...context, error: errorMessage };
    console.error(formatMessage("error", tag, message, combined));
  },

  api(method: string, url: string, context?: LogContext) {
    if (isDev) {
      console.log(formatMessage("info", "API", `${method} ${url}`, context));
    }
  },

  nav(screen: string, context?: LogContext) {
    if (isDev) {
      console.log(formatMessage("debug", "NAV", `→ ${screen}`, context));
    }
  },

  auth(event: string, context?: LogContext) {
    if (isDev) {
      console.log(formatMessage("info", "AUTH", event, context));
    }
  },
};
