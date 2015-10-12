// (c) 2013 Manuel Braun (mb@w69b.com)

// 1 px margin from borders necessary for linear interpolation.
vec2 mirrorMargin = 1.0 / indim;
vec2 mirrorBorder = 1.0 - mirrorMargin;

// mirrors at edges to range 0..1
void mirror(inout vec2 pos) {
    // mirror at right and top border
    // 1.0 - pos if pos > 1.0
    pos = pos - step(mirrorBorder, pos) * (pos - mirrorBorder);
    // mirror at left and border (*= -1 if < 0, *= 1.0 else)
    pos *= 2.0 * (0.5 - step(0.0, -pos));
    // pos = clamp(pos, 0.1, 0.99);
}
