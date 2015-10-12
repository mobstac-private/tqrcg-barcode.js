// (c) 2013 Manuel Braun (mb@w69b.com)
define('corrupt', function() {
  return function(received, howMany) {
    var corrupted = new Array(received.length);
    for (var j = 0; j < howMany; j++) {
      var location = Math.round(Math.random() * (received.length - 1));
      if (corrupted[location]) {
        j--;
      } else {
        corrupted[location] = true;
        // just corrupt it in some way.
        received[location] = (received[location] + 10) % 0xFF;
        // (received[location] + 1 +
        // Math.round(Math.random() * 255)) % 0xFF;
      }
    }
  }
});
