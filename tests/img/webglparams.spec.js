// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai', 'sinon'], function(chai, sinon) {
  var expect = chai.expect;
  describe('WebGLParams', function() {
    var WebGLParams = w69b.img.WebGLParams;

    function getProgramStub() {
      var set1iSpy = sinon.spy();
      var set1fSpy = sinon.spy();
      var set2fSpy = sinon.spy();
      return {
        setUniform1i: set1iSpy,
        setUniform1f: set1fSpy,
        setUniform2f: set2fSpy,
        getNamedSetterFunctions: function() {
          return {'1i': set1iSpy,
            '1f': set1fSpy,
            '2f': set2fSpy};
        }
      };
    }

    it('applies parameters to program', function() {
      var params = new WebGLParams();
      params.setInt('myint', 123);
      params.setFloat('myfloat', 3.33);
      params.setFloat('myvec', [1, 3]);
      var program = getProgramStub();
      params.apply(program);
      sinon.assert.calledWith(program.setUniform1i, 'myint', 123);
      sinon.assert.calledWith(program.setUniform1f, 'myfloat', 3.33);
      sinon.assert.calledWith(program.setUniform2f, 'myvec', 1, 3);
    });

    it('should set multiple values', function() {
      var params = new WebGLParams();
      params.set({'myfloat': 3.33,
        'myvec': [1, 3],
        'myint': ['i', 123]
      });
      var program = getProgramStub();
      params.apply(program);
      sinon.assert.calledWith(program.setUniform1i, 'myint', 123);
      sinon.assert.calledWith(program.setUniform1f, 'myfloat', 3.33);
      sinon.assert.calledWith(program.setUniform2f, 'myvec', 1, 3);
    });
  });
});

