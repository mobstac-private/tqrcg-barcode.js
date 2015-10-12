// (c) 2013 Manuel Braun (mb@w69b.com)
attribute vec2 position;

void main(void) {
  gl_Position = vec4(position, 0, 1);
}
