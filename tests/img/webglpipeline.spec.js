// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai', 'sinon'], function(chai, sinon) {
  var expect = chai.expect;
  describe('WebGLPipeline', function() {
    var WebGLPipeline = w69b.img.WebGLPipeline;
    var WebGLParams = w69b.img.WebGLParams;
    var filterStub, pipeline;

    function getProgramStub() {
      return {
        use: sinon.spy(),
        initCommonAttributes: sinon.spy(),
        setUniform1i: sinon.spy(),
        drawRect: sinon.spy()
      };
    }

    function getParamsStub() {
      return {
        apply: sinon.spy(),
        getValue: function() {
          return null;
        }
      };
    }

    beforeEach(function() {
      filterStub = {
        unbindFrameBuffer: sinon.spy(),
        attachTextureToFB: sinon.spy(),
        setViewport: sinon.spy()
      };
      pipeline = new WebGLPipeline(filterStub);
    });


    it('should run pipeline', function() {
      var program1Stub = getProgramStub();
      var params1Stub = getParamsStub();
      var params2Stub = getParamsStub();
      pipeline.addPass(program1Stub, params1Stub);
      pipeline.addPass(program1Stub, params2Stub);
      pipeline.render(1, 2, 3);
      sinon.assert.calledTwice(program1Stub.setUniform1i);
      sinon.assert.calledWith(program1Stub.setUniform1i, 'imageIn', 1);
      sinon.assert.called(params1Stub.apply);
      sinon.assert.calledWith(program1Stub.setUniform1i, 'imageIn', 3);
      sinon.assert.called(params2Stub.apply);
      sinon.assert.calledWith(filterStub.attachTextureToFB, 3);
      sinon.assert.calledWith(filterStub.attachTextureToFB, 2);
    });

    it('should run trivial pipeline', function() {
      var program1Stub = getProgramStub();
      var params1Stub = getParamsStub();
      pipeline.addPass(program1Stub, params1Stub);
      pipeline.render(1, 2, 3);
      sinon.assert.calledWith(program1Stub.setUniform1i, 'imageIn', 1);
      sinon.assert.called(params1Stub.apply);
      sinon.assert.calledWith(filterStub.attachTextureToFB, 2);
    });
  });
});

