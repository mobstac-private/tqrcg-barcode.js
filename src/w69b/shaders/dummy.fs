// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>
#include <_mirror.fs>

// Just render input texture as is. Useful for debugging to view result on screen,
// when a texture is rendered on by multiple shaders with different viewports.
void main() {
    // output pos normalized to 0..1
    vec2 p = (getNormalizedFragCoord() / dim);
    mirror(p);
    p *= texscale;
    gl_FragColor = texture2D(imageIn, p);
}
