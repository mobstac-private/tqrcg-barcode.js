// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(['chai'], function(chai) {
  var assert = chai.assert;
  describe('BitSource', function() {
    var BitSource = w69b.qr.BitSource;

    it('testSources', function() {
      var bytes = [1, 2, 3, 4, 5];
      var source = new BitSource(bytes);
      assert.equal(40, source.available());
      assert.equal(0, source.readBits(1));
      assert.equal(39, source.available());
      assert.equal(0, source.readBits(6));
      assert.equal(33, source.available());
      assert.equal(1, source.readBits(1));
      assert.equal(32, source.available());
      assert.equal(2, source.readBits(8));
      assert.equal(24, source.available());
      assert.equal(12, source.readBits(10));
      assert.equal(14, source.available());
      assert.equal(16, source.readBits(8));
      assert.equal(6, source.available());
      assert.equal(5, source.readBits(6));
      assert.equal(0, source.available());
    });
  });
});

