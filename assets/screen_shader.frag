precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, uvs);
	gl_FragColor = fg;
}