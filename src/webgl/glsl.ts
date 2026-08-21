/* GLSL sources for the living inked-surface artwork. WebGL2 / GLSL ES 3.00. */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

// Simplex 2D noise — Ian McEwan / Ashima Arts (MIT)
float snoise(vec2 v) {
	const vec4 C = vec4(
		0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439
	);
	vec2 i = floor(v + dot(v, C.yy));
	vec2 x0 = v - i + dot(i, C.xx);
	vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod289(i);
	vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
	vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
	m = m * m;
	m = m * m;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
	vec3 g;
	g.x = a0.x * x0.x + h.x * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

// Domain-rotated FBM — non-looping by construction
float fbm(vec2 p) {
	float f = 0.0;
	float a = 0.5;
	mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
	for (int i = 0; i < 4; i++) {
		f += a * snoise(p);
		p = rot * p * 2.02;
		a *= 0.5;
	}
	return f;
}
`;

export const VERT = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec2 aGrid;

uniform mat4 uViewProj;
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uWarp;
uniform vec2 uFlow;
uniform vec4 uPointer;     // grid-space x, z, radius, strength
uniform vec4 uImpulses[4]; // grid-space x, z, age 0..1, strength

out vec3 vNormal;
out vec3 vWorld;
out vec2 vGrid;
out float vHeight;
out float vDist;

${NOISE}

const vec2 PLANE = vec2(3.6, 2.4);

float surfaceField(vec2 g) {
	vec2 drift = vec2(uTime * 0.016, uTime * -0.010);
	vec2 q = vec2(fbm(g * uFreq + drift), fbm(g * uFreq + drift + 5.2));
	return fbm(g * uFreq + q * uWarp + uFlow * uTime * 0.05);
}

// the sheet sinks toward its border — an organic silhouette, not a rectangle
float edgeMask(vec2 g) {
	return smoothstep(1.0, 0.42, max(abs(g.x), abs(g.y)));
}

float displacement(vec2 g) {
	float h = surfaceField(g) * edgeMask(g);

	// soft pressure under the pointer, with inertia applied on the JS side
	vec2 dp = g - uPointer.xy;
	h -= exp(-dot(dp, dp) / max(uPointer.z * uPointer.z, 1e-4)) * uPointer.w * 0.25;

	// slow ripples left by disturbances (project hover, focus)
	for (int i = 0; i < 4; i++) {
		vec4 im = uImpulses[i];
		if (im.w > 0.001) {
			vec2 d = g - im.xy;
			float dist = length(d);
			float wave = sin(dist * 10.0 - im.z * 9.0);
			h += wave * exp(-dist * dist * 7.0) * exp(-im.z * 2.8) * im.w * 0.25;
		}
	}
	return h;
}

void main() {
	float eps = 0.04;
	float h = displacement(aGrid);
	float hx = displacement(aGrid + vec2(eps, 0.0));
	float hz = displacement(aGrid + vec2(0.0, eps));

	vec3 pos = vec3(aGrid.x * PLANE.x, h * uAmp, aGrid.y * PLANE.y);
	vec3 dx = vec3(eps * PLANE.x, (hx - h) * uAmp, 0.0);
	vec3 dz = vec3(0.0, (hz - h) * uAmp, eps * PLANE.y);
	vNormal = normalize(cross(dz, dx));

	vWorld = pos;
	vGrid = aGrid;
	vHeight = h;

	vec4 clip = uViewProj * vec4(pos, 1.0);
	vDist = clip.w;
	gl_Position = clip;
}
`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vWorld;
in vec2 vGrid;
in float vHeight;
in float vDist;

uniform float uTime;
uniform vec3 uPaperDeep;
uniform vec3 uPigment;
uniform vec3 uAccent;
uniform float uInkAmount;
uniform float uInkScale;
uniform float uStreak;
uniform float uFlowAngle;
uniform float uFarFog;
uniform vec4 uPointer;
uniform vec4 uImpulses[4];

out vec4 fragColor;

${NOISE}

const vec2 PLANE = vec2(3.6, 2.4);

void main() {
	// torn-paper boundary: alpha dissolves along a noise-perturbed edge
	float nudge = fbm(vGrid * 2.8 + 7.3) * 0.16;
	float body =
		smoothstep(1.0, 0.66, abs(vGrid.x) + nudge) *
		smoothstep(1.0, 0.58, abs(vGrid.y) + nudge);

	// far edge of the sheet fades into the page
	float fog = smoothstep(uFarFog, uFarFog * 0.5, vDist);

	// ── pigment field ──
	float ca = cos(uFlowAngle);
	float sa = sin(uFlowAngle);
	vec2 wc = mat2(ca, -sa, sa, ca) * vWorld.xz;
	wc *= vec2(1.0, mix(1.0, 0.26, uStreak)); // narrow flowing paths when streaked
	float t = uTime * 0.012;
	float blotchN = fbm(wc * uInkScale + vec2(t, -t * 0.65) + fbm(wc * uInkScale * 0.45) * 0.85);

	// whole regions of the sheet stay completely pristine
	float region = fbm(vWorld.xz * 0.32 + 17.3);
	float regionMask = smoothstep(-0.45, 0.35, region);

	// folds deepen existing pools; they do not create stains on their own
	float hn = clamp(vHeight * 0.75 + 0.5, 0.0, 1.0);
	float fold = pow(1.0 - hn, 2.0);

	// wetness: recent disturbances stain temporarily, then dry
	vec2 g = vWorld.xz / PLANE;
	float wet = 0.0;
	vec2 dp = g - uPointer.xy;
	wet += exp(-dot(dp, dp) / max(uPointer.z * uPointer.z, 1e-4)) * uPointer.w * 0.35;
	for (int i = 0; i < 4; i++) {
		vec4 im = uImpulses[i];
		if (im.w > 0.001) {
			vec2 d = g - im.xy;
			wet += exp(-dot(d, d) * 22.0) * exp(-im.z * 2.2) * im.w * 0.5;
		}
	}

	// passive blotches: only the upper lobes of the noise stain, masked by region
	float thr = mix(0.62, 0.16, clamp(uInkAmount, 0.0, 1.0));
	float passive = smoothstep(thr, thr + 0.30, blotchN * 0.9) * regionMask;
	passive *= 0.55 + fold * 0.65;

	float stain = clamp(passive + wet * 0.7, 0.0, 1.0);

	// sparse oxide accents — rare, never dominant
	float accN = snoise(vWorld.xz * 0.55 + 31.7) * 0.5 + 0.5;
	float acc = smoothstep(0.86, 0.94, accN) * stain;

	vec3 albedo = mix(uPaperDeep, uPigment, stain);
	albedo = mix(albedo, uAccent, acc * 0.75);

	// faint tonal variation — material, not grime
	albedo *= 0.99 + (snoise(vWorld.xz * 1.4) * 0.5 + 0.5) * 0.02;

	// matte wrap light + valley occlusion
	vec3 N = normalize(vNormal);
	vec3 L = normalize(vec3(0.32, 0.85, 0.42));
	float ndl = dot(N, L) * 0.5 + 0.5;
	float diff = pow(ndl, 1.6);
	float ao = mix(0.72, 1.0, hn);

	fragColor = vec4(albedo * diff * ao, body * fog);
}
`;
