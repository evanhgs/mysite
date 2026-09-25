// Shaders du champ de cubes. Chaque instance lit sa position (xyz) et sa
// taille (w) dans une texture de formations ; le morphing se fait ici, sur
// le GPU, sans aucun calcul par cube côté JavaScript.
export const vertexShader = /* glsl */ `
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D uForm;
uniform int uWidth;
uniform int uRowsPer;
uniform int uFrom;
uniform int uTo;
uniform float uT;
uniform float uStagger;
uniform float uSwirl;
uniform float uOrtho;
uniform mat4 uOrthoProj;
uniform float uTime;
uniform float uBreath;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uEye;
uniform float uFaceFrom;
uniform float uFaceTo;
uniform vec3 uLightFrom;
uniform vec3 uLightTo;

in float aId;
in float aSeed;

out float vShade;
out float vFog;

vec4 formation(int row, int id) {
	return texelFetch(uForm, ivec2(id % uWidth, row * uRowsPer + id / uWidth), 0);
}

void main() {
	int id = int(aId + 0.5);
	vec4 a = formation(uFrom, id);
	vec4 b = formation(uTo, id);

	// Chaque cube part avec un léger décalage (aSeed) : le morphing « coule ».
	float k = clamp((uT - aSeed * uStagger) / max(1e-4, 1.0 - uStagger), 0.0, 1.0);
	k = k * k * (3.0 - 2.0 * k);

	vec3 p = mix(a.xyz, b.xyz, k);
	vec3 swirl = normalize(vec3(sin(aSeed * 91.7), cos(aSeed * 47.3), sin(aSeed * 13.1 + 1.7)) + 1e-4);
	p += swirl * uSwirl * sin(3.14159265 * k);

	float s = mix(a.w, b.w, k) * (1.0 + uBreath * sin(uTime * 1.3 + aSeed * 6.2831853));

	// Anamorphose : chaque cube tourne sa face avant vers le point de vue
	// exact (uEye). De là, il se projette en carré parfait, sans faces latérales.
	vec3 local = position * s;
	vec3 n = normal;
	float face = mix(uFaceFrom, uFaceTo, k);
	if (face > 0.0) {
		vec3 d = normalize(uEye - p);
		vec3 ax = normalize(cross(vec3(0.0, 1.0, 0.0), d));
		vec3 ay = cross(d, ax);
		mat3 r = mat3(ax, ay, d);
		local = mix(local, r * local, face);
		n = normalize(mix(n, r * n, face));
	}
	// Éclairage directionnel, quantifié en trois tons dans le fragment.
	vShade = dot(n, normalize(mix(uLightFrom, uLightTo, k)));
	vec4 mv = viewMatrix * vec4(p + local, 1.0);

	// Perspective → orthographique, mélangés en coordonnées normalisées :
	// continu, exact à uOrtho = 1, et c'est précisément l'effet « vertigo ».
	vec4 cp = projectionMatrix * mv;
	vec4 co = uOrthoProj * mv;
	gl_Position = vec4(mix(cp.xyz / cp.w, co.xyz / co.w, uOrtho), 1.0);

	vFog = smoothstep(uFogNear, uFogFar, -mv.z);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uToneX;
uniform vec3 uToneY;
uniform vec3 uToneZ;
uniform vec3 uFlat;
uniform float uFlatAmt;
uniform vec3 uFogColor;
uniform float uFogAmt;

in float vShade;
in float vFog;

out vec4 fragColor;

void main() {
	// Aplats op-art : trois tons seulement, selon l'orientation de la face.
	vec3 c = vShade > 0.62 ? uToneY : (vShade > 0.3 ? uToneX : uToneZ);
	c = mix(c, uFlat, uFlatAmt);
	c = mix(c, uFogColor, vFog * uFogAmt);
	fragColor = vec4(c, 1.0);
}
`;
