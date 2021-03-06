precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uPaletteSampler;
uniform float uPalette;

void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, uvs);
	
	float texel=texture2D(uSampler, uvs).r;
	fg=texture2D(uPaletteSampler, vec2(floor(texel*5.0)/4.0,uPalette));
	gl_FragColor = fg;
}