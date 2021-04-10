class Logger {
  constructor(enableLogging) {
    Logger.isLoggingActive = enableLogging;
  }
  static disableLogging() {
    this.isLoggingActive = false;
  }
  static enableLogging() {
    this.isLoggingActive = true;
  }
  static toggleLogging(enableLogging) {
    if (enableLogging) {
      Logger.enableLogging();
    }
    else {
      Logger.disableLogging();
    }
  }
  static logMessage(message) {
    if (console && this.isLoggingActive) {
      console.log(message);
    }
  }
  static debugMessage(message) {
    if (console && this.isLoggingActive) {
      console.debug(message);
    }
  }
  static errorMessage(message) {
    if (console && this.isLoggingActive) {
      console.error(message);
    }
  }
  static infoMessage(message) {
    if (console && this.isLoggingActive) {
      console.info(message);
    }
  }
}
Logger.isLoggingActive = true;

export { Logger as L };
