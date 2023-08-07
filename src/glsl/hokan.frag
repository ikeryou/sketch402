uniform sampler2D t;
uniform vec3 color;
uniform vec2 center;
uniform float col;
uniform float time;

varying vec2 vUv;

vec3 hsl2rgb( in vec3 c ){
  vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
  return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main(void) {
  vec2 uv = vec2(vUv.x, center.y);
  vec4 dest = texture2D(t, uv);

  dest.rgb = color;

  gl_FragColor = dest;
}
