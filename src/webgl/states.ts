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
		camY: 1.35,
		camZ: 3.9,
		tgtY: -0.15,
		yaw: 0,
		amp: 0.34,
		freq: 0.85,
		warp: 0.9,
		speed: 0.05,
		ink: 0.16,
		inkScale: 1.05,
		streak: 0,
		flowAngle: 0.4,
		farFog: 7.5,
	},
	about: {
		camX: 0.25,
		camY: 0.95,
		camZ: 3.1,
		tgtY: -0.1,
		yaw: 0.06,
		amp: 0.44,
		freq: 1.15,
		warp: 1.0,
		speed: 0.07,
		ink: 0.32,
		inkScale: 1.3,
		streak: 0.1,
		flowAngle: 0.9,
		farFog: 6.5,
	},
	skills: {
		camX: -0.3,
		camY: 0.8,
		camZ: 2.8,
		tgtY: -0.05,
		yaw: -0.05,
		amp: 0.38,
		freq: 1.55,
		warp: 0.8,
		speed: 0.085,
		ink: 0.3,
		inkScale: 2.0,
		streak: 0.72,
		flowAngle: 0.55,
		farFog: 6.0,
	},
	projects: {
		camX: 0,
		camY: 0.72,
		camZ: 2.6,
		tgtY: 0,
		yaw: 0,
		amp: 0.52,
		freq: 1.3,
		warp: 1.15,
		speed: 0.105,
		ink: 0.5,
		inkScale: 1.45,
		streak: 0.15,
		flowAngle: 1.2,
		farFog: 5.5,
	},
	contact: {
		camX: 0,
		camY: 1.6,
		camZ: 4.6,
		tgtY: -0.2,
		yaw: 0,
		amp: 0.2,
		freq: 0.75,
		warp: 0.7,
		speed: 0.032,
		ink: 0.13,
		inkScale: 0.85,
		streak: 0,
		flowAngle: 0.4,
		farFog: 6.0,
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
