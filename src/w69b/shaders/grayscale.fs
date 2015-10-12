// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>

void main() {
    // output pos normalized to 0..1
    vec2 p = (getNormalizedFragCoord() / dim);
    p *= texscale;
    vec4 color = texture2D(imageIn, p);
    float gray = (color.r + color.g + color.b) / 3.0;
    gl_FragColor = vec4(gray, gray, gray, 1.0);
}
