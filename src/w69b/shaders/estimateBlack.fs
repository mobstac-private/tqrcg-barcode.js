// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>
#include <_mirror.fs>

// uniform float xoffsets[12];
// mapping indim.x => 2^i

// TODO: ensure that border pixsels handled correctly (border is cropped)

// Get position of input image at given scale  for sampling.
// depends on indim, texdim, output (dim) should be indim / 2
// scale: 0 ... x scale index, 0 = original size.
vec4 sampleAt(vec2 pos, float scale) {
    // scale 0 is at offset (0, 0), scale 1 at (inwidth, 0) ...
    mirror(pos);
    vec2 offset = scale * vec2(indim.x, 0) / texdim;
    pos = pos * texscale + offset;
    // And in 0..1
    return texture2D(imageIn, pos);
}

float getDynRange(vec4 color) {
    return color.g - color.r;
}


// Estimate black level. Pick gray level from scale space with the smallest kernel that still
// satisfies the mininmal dynamic range constraint.

void main() {
    vec2 p = getNormalizedFragCoord() / dim;
    vec4 color;
    float minDynRange = 0.3;

    color = sampleAt(p, 0.0);
    if (getDynRange(color) < minDynRange) {
        color = sampleAt(p, 1.0);
        if (getDynRange(color) < minDynRange) {
            color = sampleAt(p, 2.0);
        }
    }
    // small bias to white
    color.z -= 0.02;

    gl_FragColor = color;
}
