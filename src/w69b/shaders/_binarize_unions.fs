// (c) 2013 Manuel Braun (mb@w69b.com)
precision mediump float;

uniform float width;
uniform float height;
uniform float inwidth;
uniform float inheight;
uniform float texwidth;
uniform float texheight;
uniform vec2 fragCoordOffset;
uniform sampler2D imageIn;

vec2 dim = vec2(width, height);
vec2 texdim = vec2(texwidth, texheight);
vec2 indim = vec2(inwidth, inheight);
// multiplying with texscale transforms 0..1 to input position.
// glFragCoord.xy / dim => output pos normalized to 0..1
// Wanted: position on input (0..1).
// texscale = (indim / texture size)
vec2 texscale = indim / texdim;

// (x,y) Fragment coordinate normalized to center pixel sampling.
vec2 getNormalizedFragCoord() {
    return (gl_FragCoord.xy - fragCoordOffset) + 0.5;
}
