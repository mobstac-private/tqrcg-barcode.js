// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.WorkerMessageType');

/**
 * Constants for worker message types.
 * @enum {string}
 */
w69b.qr.WorkerMessageType = {
  DECODED: 'success',
  NOTFOUND: 'notfound',
  PATTERN: 'pattern'
};

goog.exportSymbol('w69b.qr.WorkerMessageType', w69b.qr.WorkerMessageType);
goog.exportSymbol('w69b.qr.WorkerMessageType.DECODED',
  w69b.qr.WorkerMessageType.DECODED);
goog.exportSymbol('w69b.qr.WorkerMessageType.NOTFOUND',
  w69b.qr.WorkerMessageType.NOTFOUND);
