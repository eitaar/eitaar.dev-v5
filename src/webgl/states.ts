export interface ArtworkState {
	camX: number;
	camY: number;
	camZ: number;
	tgtY: number;
	yaw: number;
	amp: number;
	freq: number;
	warp: number;
	speed: number;
	ink: number;
	inkScale: number;
	streak: number;
	flowAngle: number;
	farFog: number;
}

export const SECTION_ORDER = ["hero", "about", "skills", "projects", "contact"] as const;
export type SectionName = (typeof SECTION_ORDER)[number];

/** One visual state of the living surface per major section of the site. */
export const STATES: Record<SectionName, ArtworkState> = {
	hero: {
		camX: 0,
		camY: 2.1,
		camZ: 4.8,
		tgtY: -0.55,
		yaw: 0,
		amp: 0.2,
		freq: 0.65,
		warp: 0.75,
		speed: 0.05,
		ink: 0.14,
		inkScale: 1.05,
		streak: 0,
		flowAngle: 0.4,
		farFog: 8.5,
	},
	about: {
		camX: 0.25,
		camY: 1.5,
		camZ: 3.6,
		tgtY: -0.35,
		yaw: 0.06,
		amp: 0.3,
		freq: 0.95,
		warp: 1.0,
		speed: 0.07,
		ink: 0.34,
		inkScale: 1.3,
		streak: 0.1,
		flowAngle: 0.9,
		farFog: 7.0,
	},
	skills: {
		camX: -0.3,
		camY: 1.25,
		camZ: 3.2,
		tgtY: -0.25,
		yaw: -0.05,
		amp: 0.28,
		freq: 1.3,
		warp: 0.8,
		speed: 0.085,
		ink: 0.32,
		inkScale: 2.0,
		streak: 0.72,
		flowAngle: 0.55,
		farFog: 6.5,
	},
	projects: {
		camX: 0,
		camY: 1.05,
		camZ: 2.9,
		tgtY: -0.15,
		yaw: 0,
		amp: 0.38,
		freq: 1.15,
		warp: 1.15,
		speed: 0.105,
		ink: 0.55,
		inkScale: 1.45,
		streak: 0.15,
		flowAngle: 1.2,
		farFog: 6.0,
	},
	contact: {
		camX: 0,
		camY: 2.3,
		camZ: 5.4,
		tgtY: -0.7,
		yaw: 0,
		amp: 0.14,
		freq: 0.6,
		warp: 0.7,
		speed: 0.032,
		ink: 0.12,
		inkScale: 0.85,
		streak: 0,
		flowAngle: 0.4,
		farFog: 7.5,
	},
};

export function mixState(a: ArtworkState, b: ArtworkState, t: number): ArtworkState {
	const out = {} as ArtworkState;
	for (const key of Object.keys(a) as (keyof ArtworkState)[]) {
		out[key] = a[key] + (b[key] - a[key]) * t;
	}
	return out;
}

/** Narrow screens sit closer over a calmer sheet. */
export function adjustForNarrow(s: ArtworkState): ArtworkState {
	return {
		...s,
		camY: s.camY * 0.82,
		camZ: s.camZ * 0.88,
		amp: s.amp * 0.9,
		farFog: s.farFog * 0.85,
		speed: s.speed * 0.85,
	};
}
