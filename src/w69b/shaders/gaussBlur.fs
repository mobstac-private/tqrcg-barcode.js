// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>
#include <_mirror.fs>

uniform vec2 sampleDirection;
uniform vec2 outOffset;
uniform vec2 inOffset;
vec2 sampleStep = sampleDirection / texdim;
vec2 inOffsetNormalized = inOffset / texdim;

void addSample(inout vec4 result, vec2 p, float offset, float weight) {
    vec2 pos = (p + (offset * sampleStep));
    mirror(pos);
    pos *= texscale;
    pos += inOffsetNormalized;
    vec4 color = texture2D(imageIn, pos);
    result.rgb += color.rgb * weight;
}

#include <_gauss9.fs>

void main() {
    vec2 p = (getNormalizedFragCoord() - outOffset) / dim;
    vec4 result  = vec4(0.0, 0.0, 0.0, 1.0);
    gauss9(result, p);
    gl_FragColor = result;
}
