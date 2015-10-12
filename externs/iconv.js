/**
 * @type {Object}
 */
window.iconv = {};

/**
 * Converts bytes from inCharset to outCharset. Returns converted byte
 * sequence or null on error.
 * @param {(Array.<number>|Uint8Array)} inBytes input byte sequence.
 * @param {string} inCharset encoding of inBytes.
 * @param {string} outCharset desired encoding of output.
 * @return {Array.<number>} byte sequence of string encoded in outCharset, or
 * null in case of errors.
 */
window.iconv.convert = function(inBytes, inCharset, outCharset) { };
