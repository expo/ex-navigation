import debug from 'debug';

if (__DEV__) {
  debug.enable('ExNavigation:*');
}

debug.useColors = () => true;

export function createLogger(prefix) {
  return debug(`ExNavigation:${prefix}`);
}
