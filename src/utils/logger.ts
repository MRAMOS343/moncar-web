import { LIMITS } from '@/constants/limits';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = LIMITS.LOGGER.MAX_LOGS;
  private isDevelopment: boolean = import.meta.env.DEV;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    try {
      const entry: LogEntry = {
        level,
        message,
        data,
        timestamp: this.formatTimestamp(),
      };

      this.logs.push(entry);

      // Mantener solo los últimos maxLogs logs
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // En desarrollo, también enviar a console
      if (this.isDevelopment) {
        this.logToConsole(level, message, data);
      }

      // Aquí podrías enviar logs a un servicio externo como Sentry, LogRocket, etc.
      // this.sendToExternalService(entry);
    } catch (error) {
      // Fallback silencioso - no queremos que el logger tumbe la app
      try {
        console.error('[Logger Error]', error);
      } catch {
        // Silencio total si todo falla
      }
    }
  }

  private logToConsole(level: LogLevel, message: string, data?: any) {
    try {
      const styles: Record<LogLevel, string> = {
        info: 'color: #3B82F6; font-weight: bold',
        warn: 'color: #F59E0B; font-weight: bold',
        error: 'color: #EF4444; font-weight: bold',
        debug: 'color: #8B5CF6; font-weight: bold',
      };

      const emoji: Record<LogLevel, string> = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🐛',
      };

      console.log(
        `%c${emoji[level]} [${level.toUpperCase()}] ${message}`,
        styles[level],
        data || ''
      );
    } catch {
      // Si console.log falla, no hacer nada
    }
  }

  public info(message: string, data?: any) {
    try {
      this.addLog('info', message, data);
    } catch {
      // Silencio
    }
  }

  public warn(message: string, data?: any) {
    try {
      this.addLog('warn', message, data);
    } catch {
      // Silencio
    }
  }

  public error(message: string, data?: any) {
    try {
      this.addLog('error', message, data);
    } catch {
      // Silencio
    }
  }

  public debug(message: string, data?: any) {
    try {
      this.addLog('debug', message, data);
    } catch {
      // Silencio
    }
  }

  // Obtener todos los logs
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Obtener logs por nivel
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Limpiar logs
  public clearLogs() {
    this.logs = [];
  }

  // Exportar logs como JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Exportar instancia singleton
export const logger = new Logger();
