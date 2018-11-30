#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform float textureScale;
uniform float timeFactor;

uniform sampler2D uSampler;

void main() {
	vec2 pos = vTextureCoord;
	pos.x = mod(pos.x * textureScale, 1.0);
	pos.y = mod(pos.y * textureScale, 1.0);
	pos.y += mod(timeFactor,1.0) ;

	vec4 color = texture2D(uSampler, pos);
	
	gl_FragColor = color;
}