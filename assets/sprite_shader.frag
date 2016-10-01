precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uPaletteSampler;
uniform float uPalette;

void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, uvs);
	
	float transparentTexel=texture2D(uSampler,vec2(1.0/16.0)).r;

	float texel=texture2D(uSampler, uvs).r;

	if(texel==transparentTexel){
		discard;
	}

	fg=texture2D(uPaletteSampler, vec2(floor(texel*5.0)/4.0,uPalette));
	//fg.rgb=vec3(texel);
	gl_FragColor = fg;
}