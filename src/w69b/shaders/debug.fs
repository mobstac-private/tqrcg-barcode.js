// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>

uniform vec2 outOffset;

void main() {
    // output pos normalized to 0..1
    vec2 p = (getNormalizedFragCoord() - outOffset) / dim;
    vec4 color = vec4(1.0);
    color.rg = p;
    gl_FragColor = color;
}
