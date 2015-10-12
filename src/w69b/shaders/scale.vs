// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>


uniform float outOffsetX;
uniform float inOffsetX;

vec2 outOffset = vec2(outOffsetX, 0);
// in 0..1 range of total texture  size (texdim)
vec2 inOffset = vec2(inOffsetX, 0) / texdim;

// sqrt (2)/2
vec2 stepX = vec2(0.7, 0) / indim;
vec2 stepY = vec2(0, 0.7) / indim;

vec2 scale = indim / dim;

vec3 combine(vec3 color1, vec3 color2) {
    return vec3(
        min(color1.x, color2.x),
        max(color1.y, color2.y),
        color1.z + color2.z);
}

vec3 sample(vec2 p, vec2 offset) {
    vec2 pos = (p + offset);
    // clamp
    pos = min(vec2(1.0, 1.0), pos);
    pos = max(vec2(0.0, 0.0), pos);
    pos = inOffset + texscale * pos;
    return texture2D(imageIn, pos).xyz;
}

// TODO: this does not handle different scales in x and y correctly.

void main() {
    // Out pos in 0..1 range
    vec2 p = (getNormalizedFragCoord() - outOffset) / dim;

    // vec3 result = texture2D(imageIn, p * texscale).xyz;
    vec3 result = sample(p, - stepX - stepY);
    result = combine(result, sample(p, stepX + stepY));
    result = combine(result, sample(p, stepX - stepY));
    result = combine(result, sample(p, -stepX + stepY));
    result.z /= 4.0;

    gl_FragColor = vec4(result, 1.0);
    // gl_FragColor = vec4(avg, avg, avg, 1.0);
    // gl_FragColor = vec4(1.0) - vec4(color.rgb, 0);
}
