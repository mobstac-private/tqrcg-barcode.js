// (c) 2013 Manuel Braun (mb@w69b.com)
precision mediump float;

// uniform sampler2D imageIn;

// Sets red and green value to glFragCoord.
// The blue is set to to the red value of the texture between pixel 1 and 2.
void main() {
    vec4 result = vec4(1.0);
    result.rg = gl_FragCoord.xy / 10.0;
    gl_FragColor = result;
}
