// (c) 2013 Manuel Braun (mb@w69b.com)
#include <_binarize_unions.fs>

uniform sampler2D origImage;

vec2 texscaleBlackLevels = indim / texdim;

// Use black levels estimated in estimateBlack shader to
// apply thresholding to original input image.

void main() {
    vec2 p = getNormalizedFragCoord() / dim;

    // sampler 0 has to have same dimension as output.
    vec4 color = texture2D(origImage, p);
    float gray = (color.r + color.g + color.b) / 3.0;
    float black = texture2D(imageIn, p * texscaleBlackLevels).z;
    float binary = gray > black ? 1.0 : 0.0;
    // binary = black;

    gl_FragColor = vec4(binary, binary, binary, 1.0);
}
