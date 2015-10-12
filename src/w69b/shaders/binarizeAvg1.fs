// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>

// Compute gauss on gray levels and store in blue channel,
// Also compute dynamic range of pixels considered by gauss kernel
// and store min/max values in red/green channels

#include <_mirror.fs>

uniform vec2 sampleDirection;
vec2 sampleStep = sampleDirection / indim;

void addSample(inout vec4 result, vec2 p, float offset, float weight) {
    vec2 pos = (p + offset * sampleStep);
    mirror(pos);
    pos *= texscale;
    vec4 color = texture2D(imageIn, pos);
    float gray = (color.r + color.g + color.b) / 3.0;
    // float gray = color.r;
    result.r = min(result.r, gray);
    result.g = max(result.g, gray);
    result.b += gray * weight;
}

#include <_gauss9.fs>

void main() {
    vec2 p = getNormalizedFragCoord() / dim;
    vec4 result  = vec4(1.0, 0.0, 0.0, 1.0);
    gauss9(result, p);
    gl_FragColor = result;
}

