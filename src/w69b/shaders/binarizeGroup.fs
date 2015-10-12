// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>

#include <_mirror.fs>

// Same filter as binarizeAvg1, but operates on pre-processed output
// of binarize1 instead of rgb input.

uniform vec2 sampleDirection;
uniform vec2 outOffset;
uniform vec2 inOffset;

vec2 inOffsetNormalized = inOffset / texdim;
vec2 sampleStep = sampleDirection / indim;

void addSample(inout vec4 result, vec2 p, float offset, float weight) {
    vec2 pos = (p + offset * sampleStep);
    mirror(pos);
    pos *= texscale;
    pos += inOffsetNormalized;
    vec4 color = texture2D(imageIn, pos);
    // result.r += color.r * weight;
    // result.g += color.g * weight;
    result.r = min(result.r, color.r);
    result.g = max(result.g, color.g);
    result.b += color.b * weight;
}

#include <_gauss9.fs>

void main() {
    vec2 p = (getNormalizedFragCoord() - outOffset) / dim;
    vec4 result  = vec4(0.0, 0.0, 0.0, 1.0);
    gauss9(result, p);

    // // // gl_FragColor = color;
    gl_FragColor = result;
    // // gl_FragColor = vec4(1.0) - vec4(color.rgb, 0);
}
