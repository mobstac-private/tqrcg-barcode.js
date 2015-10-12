// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai'], function(chai) {
  var expect = chai.expect;
  describe('iconvlite compare to iconv.js', function() {
    var allBytes = [];
    for (var i = 1; i < 256; ++i) {
      allBytes.push(i);
    }

    function testCharset(charset) {
      allBytes.forEach(function(b) {
        var liteString = w69b.iconvlite.toString([b], charset);
        // skip dummy char
        if (liteString.charCodeAt(0) == 65533)
          return;
        var utf8bytes = iconv.convert([b], charset, 'UTF-8');
        expect(utf8bytes).not.be.null;
        var iconvString = w69b.utf8.UTF8BytesToString(utf8bytes);
        expect(liteString).equals(iconvString);
        expect(w69b.iconvlite.toBytes(liteString, charset)).deep.equals([b]);
      });
    }

    function testEncode(str, charset) {
      var utf8Bytes = w69b.utf8.stringToUTF8Bytes(str);
      var bytes = iconv.convert(utf8Bytes, 'UTF-8', charset);
      var liteBytes = w69b.iconvlite.toBytes(str, charset);
      expect(liteBytes).deep.equals(bytes);
    }

    it('should encode strings', function() {
      testEncode('ABC', 'ISO-8859-1');
      testEncode('Hellö ä$ölkQ', 'ISO-8859-1');
      testEncode('$€', 'ISO-8859-1');
    });

    w69b.iconvlite.getSupportedCharsets().forEach(function(charset) {
      it('should decode ' + charset, function() {
        testCharset(charset);
      });
    });

  });
});
