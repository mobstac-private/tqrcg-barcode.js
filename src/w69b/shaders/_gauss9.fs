// (c) 2013 Manuel Braun (mb@w69b.com)

    // 21 kernel
      // [0.04051, 0.04248, 0.04433, 0.04602, 0.04754, 0.04887, 0.04998, 0.05086,
      //   0.0515, 0.05189, 0.05202, 0.05189, 0.0515, 0.05086, 0.04998, 0.04887,
      //   0.04754, 0.04602, 0.04433, 0.04248, 0.04051];

// calls addSample(result, p, offset (-4..4), weight
// addSample needs to be defined.
void gauss9(inout vec4 result, vec2 p) {
    addSample(result, p, -4.0, 0.0459);
    addSample(result, p, -3.0, 0.0822);
    addSample(result, p, -2.0, 0.1247);
    addSample(result, p, -1.0, 0.1601);
    addSample(result, p, 0.0, 0.1741);
    addSample(result, p, 1.0, 0.1601);
    addSample(result, p, 2.0, 0.1247);
    addSample(result, p, 3.0, 0.0822);
    addSample(result, p, 4.0, 0.0459);
}
