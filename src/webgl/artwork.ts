/**
 * The living artwork: an organic, ink-stained membrane rendered behind the page.
 *
 * Isolated on purpose — nothing in here knows about Astro components, and no
 * component imports rendering logic. The contract with the page is:
 *   - sections mark themselves with [data-artwork="hero|about|skills|projects|contact"]
 *   - anything may dispatch window event "eitaar:pulse" {x, y} in client coords
 *   - theme changes are picked up from <html data-theme> automatically
 */

import { FRAG, VERT } from "./glsl";
import {
	type ArtworkState,
	adjustForNarrow,
	mixState,
	SECTION_ORDER,
	type SectionName,
	STATES,
} from "./states";

const PLANE_X = 3.6;
const PLANE_Z = 2.4;
const FOV = (40 * Math.PI) / 180;

interface Tier {
	segX: number;
	segZ: number;
	maxDpr: number;
}

function pickTier(width: number, coarsePointer: boolean): Tier {
	if (coarsePointer || width < 820) return { segX: 132, segZ: 90, maxDpr: 1.5 };
	return { segX: 208, segZ: 136, maxDpr: 1.75 };
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB | null {
	const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
	if (!m) return null;
	const s = m[1];
	const full =
		s.length === 3
			? s
					.split("")
					.map((c) => c + c)
					.join("")
			: s;
	const n = Number.parseInt(full, 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ── minimal column-major mat4 helpers ── */

function perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number) {
	const f = 1 / Math.tan(fovy / 2);
	out.fill(0);
	out[0] = f / aspect;
	out[5] = f;
	out[10] = (far + near) / (near - far);
	out[11] = -1;
	out[14] = (2 * far * near) / (near - far);
}

function lookAt(
	out: Float32Array,
	eye: readonly number[],
	target: readonly number[],
	up: readonly number[],
) {
	let fx = target[0] - eye[0];
	let fy = target[1] - eye[1];
	let fz = target[2] - eye[2];
	let len = Math.hypot(fx, fy, fz) || 1;
	fx /= len;
	fy /= len;
	fz /= len;
	let sx = fy * up[2] - fz * up[1];
	let sy = fz * up[0] - fx * up[2];
	let sz = fx * up[1] - fy * up[0];
	len = Math.hypot(sx, sy, sz) || 1;
	sx /= len;
	sy /= len;
	sz /= len;
	const ux = sy * fz - sz * fy;
	const uy = sz * fx - sx * fz;
	const uz = sx * fy - sy * fx;
	out[0] = sx;
	out[1] = ux;
	out[2] = -fx;
	out[3] = 0;
	out[4] = sy;
	out[5] = uy;
	out[6] = -fy;
	out[7] = 0;
	out[8] = sz;
	out[9] = uz;
	out[10] = -fz;
	out[11] = 0;
	out[12] = -(sx * eye[0] + sy * eye[1] + sz * eye[2]);
	out[13] = -(ux * eye[0] + uy * eye[1] + uz * eye[2]);
	out[14] = fx * eye[0] + fy * eye[1] + fz * eye[2];
	out[15] = 1;
}

function multiply(out: Float32Array, a: Float32Array, b: Float32Array) {
	for (let c = 0; c < 4; c++) {
		const b0 = b[c * 4];
		const b1 = b[c * 4 + 1];
		const b2 = b[c * 4 + 2];
		const b3 = b[c * 4 + 3];
		out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
		out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
		out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
		out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
	}
}

interface Impulse {
	gx: number;
	gz: number;
	age: number;
	strength: number;
	active: boolean;
}

export function bootArtwork(canvas: HTMLCanvasElement): void {
	try {
		new Inkfield(canvas).start();
	} catch {
		canvas.remove();
		document.documentElement.classList.add("no-webgl");
	}
}

class Inkfield {
	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private indexCount: number;
	private locs = new Map<string, WebGLUniformLocation | null>();

	private tier: Tier;
	private proj = new Float32Array(16);
	private view = new Float32Array(16);
	private viewProj = new Float32Array(16);

	private cur: ArtworkState;
	private narrow: boolean;
	private reduced: boolean;
	private lost = false;
	private running = false;
	private rafId = 0;
	private lastNow = 0;
	private artTime = 13.7;

	private anchors: { name: SectionName; top: number }[] = [];
	private projTop = 0;
	private projHeight = 1;

	private pointerGx = 0;
	private pointerGz = 0;
	private pointerEnergy = 0;
	private lastClient: { x: number; y: number } | null = null;

	private impulses: Impulse[] = Array.from({ length: 4 }, () => ({
		gx: 0,
		gz: 0,
		age: 1,
		strength: 0,
		active: false,
	}));
	private impulseCursor = 0;

	private colors = {
		paper: [0.09, 0.075, 0.06] as RGB,
		paperDeep: [0.13, 0.11, 0.09] as RGB,
		pigment: [0.05, 0.04, 0.03] as RGB,
		accent: [0.75, 0.42, 0.27] as RGB,
	};

	private resizeQueued = false;
	private staticQueued = false;

	private cleanups: (() => void)[] = [];
	private themeObserver: MutationObserver | null = null;
	private motionQuery: MediaQueryList;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const gl = canvas.getContext("webgl2", {
			alpha: true,
			antialias: true,
			depth: true,
			premultipliedAlpha: false,
			powerPreference: "high-performance",
		});
		if (!gl) throw new Error("webgl2 unavailable");
		this.gl = gl;

		this.program = this.buildProgram();
		this.vao = this.buildGeometry(pickTier(window.innerWidth, this.isCoarse()));
		this.tier = pickTier(window.innerWidth, this.isCoarse());
		this.indexCount = (this.tier.segX * this.tier.segZ * 6) as number;

		this.narrow = window.innerWidth < 820 || this.isCoarse();
		this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		this.cur = { ...STATES.hero };

		this.readColors();
		this.resize();
		this.bindEvents();
	}

	/* ── setup ── */

	private loc(name: string): WebGLUniformLocation | null {
		if (!this.locs.has(name)) {
			this.locs.set(name, this.gl.getUniformLocation(this.program, name));
		}
		return this.locs.get(name) ?? null;
	}

	private compile(type: number, src: string): WebGLShader {
		const gl = this.gl;
		const sh = gl.createShader(type);
		if (!sh) throw new Error("shader alloc failed");
		gl.shaderSource(sh, src);
		gl.compileShader(sh);
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(sh) ?? "compile failed");
		}
		return sh;
	}

	private buildProgram(): WebGLProgram {
		const gl = this.gl;
		const prog = gl.createProgram();
		if (!prog) throw new Error("program alloc failed");
		gl.attachShader(prog, this.compile(gl.VERTEX_SHADER, VERT));
		gl.attachShader(prog, this.compile(gl.FRAGMENT_SHADER, FRAG));
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(prog) ?? "link failed");
		}
		return prog;
	}

	private buildGeometry(tier: Tier): WebGLVertexArrayObject {
		const gl = this.gl;
		const vao = gl.createVertexArray();
		if (!vao) throw new Error("vao alloc failed");
		gl.bindVertexArray(vao);

		const vertsPerRow = tier.segX + 1;
		const positions = new Float32Array(vertsPerRow * (tier.segZ + 1) * 2);
		let p = 0;
		for (let z = 0; z <= tier.segZ; z++) {
			for (let x = 0; x <= tier.segX; x++) {
				positions[p++] = (x / tier.segX) * 2 - 1;
				positions[p++] = (z / tier.segZ) * 2 - 1;
			}
		}
		const posBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		const indices = new Uint16Array(tier.segX * tier.segZ * 6);
		let i = 0;
		for (let z = 0; z < tier.segZ; z++) {
			for (let x = 0; x < tier.segX; x++) {
				const a = z * vertsPerRow + x;
				const b = a + 1;
				const c = a + vertsPerRow;
				const d = c + 1;
				indices[i++] = a;
				indices[i++] = c;
				indices[i++] = b;
				indices[i++] = b;
				indices[i++] = c;
				indices[i++] = d;
			}
		}
		const idxBuf = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		gl.bindVertexArray(null);
		return vao;
	}

	private isCoarse(): boolean {
		return window.matchMedia("(pointer: coarse)").matches;
	}

	private readColors() {
		const cs = getComputedStyle(document.documentElement);
		const read = (name: string, fallback: RGB): RGB =>
			hexToRgb(cs.getPropertyValue(name)) ?? fallback;
		this.colors.paper = read("--paper", this.colors.paper);
		this.colors.paperDeep = read("--art-base", this.colors.paperDeep);
		this.colors.pigment = read("--art-pigment", this.colors.pigment);
		this.colors.accent = read("--accent", this.colors.accent);
	}

	private measure() {
		this.anchors = [];
		for (const el of document.querySelectorAll<HTMLElement>("[data-artwork]")) {
			const name = el.getAttribute("data-artwork") as SectionName | null;
			if (!name || !SECTION_ORDER.includes(name)) continue;
			this.anchors.push({ name, top: el.offsetTop });
		}
		this.anchors.sort((a, b) => a.top - b.top);
		const projEl = document.querySelector<HTMLElement>('[data-artwork-scope="projects"]');
		if (projEl) {
			this.projTop = projEl.offsetTop;
			this.projHeight = Math.max(projEl.offsetHeight, 1);
		} else {
			this.projTop = 0;
			this.projHeight = 1;
		}
	}

	private resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, this.tier.maxDpr);
		const w = Math.max(window.innerWidth, 1);
		const h = Math.max(window.innerHeight, 1);
		this.canvas.width = Math.round(w * dpr);
		this.canvas.height = Math.round(h * dpr);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		perspective(this.proj, FOV, w / h, 0.1, 30);

		const nextTier = pickTier(w, this.isCoarse());
		if (nextTier.segX !== this.tier.segX) {
			this.tier = nextTier;
			this.vao = this.buildGeometry(nextTier);
			this.indexCount = nextTier.segX * nextTier.segZ * 6;
		}
		this.narrow = w < 820 || this.isCoarse();
		this.measure();
	}

	/* ── events ── */

	private bindEvents() {
		const onResize = () => {
			if (this.resizeQueued) return;
			this.resizeQueued = true;
			requestAnimationFrame(() => {
				this.resizeQueued = false;
				this.resize();
				if (this.reduced) this.staticRender();
			});
		};
		window.addEventListener("resize", onResize, { passive: true });
		this.cleanups.push(() => window.removeEventListener("resize", onResize));

		const onMove = (e: PointerEvent) => {
			if (e.pointerType === "touch") return;
			this.lastClient = { x: e.clientX, y: e.clientY };
			if (this.lastClientPrev) {
				const dx = e.clientX - this.lastClientPrev.x;
				const dy = e.clientY - this.lastClientPrev.y;
				this.pointerEnergy = Math.min(1, this.pointerEnergy + Math.hypot(dx, dy) * 0.004);
			}
			this.lastClientPrev = { x: e.clientX, y: e.clientY };
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		this.cleanups.push(() => window.removeEventListener("pointermove", onMove));

		const onPulse = (e: Event) => {
			const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
			if (!detail || this.reduced) return;
			const hit = this.raycastToGrid(detail.x, detail.y);
			if (!hit) return;
			const im = this.impulses[this.impulseCursor];
			this.impulseCursor = (this.impulseCursor + 1) % this.impulses.length;
			im.gx = hit[0];
			im.gz = hit[1];
			im.age = 0;
			im.strength = 0.9;
			im.active = true;
		};
		window.addEventListener("eitaar:pulse", onPulse);
		this.cleanups.push(() => window.removeEventListener("eitaar:pulse", onPulse));

		const onVis = () => {
			if (document.hidden) {
				this.pause();
			} else if (!this.reduced && !this.lost) {
				this.resume();
			}
		};
		document.addEventListener("visibilitychange", onVis);
		this.cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

		const onMotionChange = () => {
			this.reduced = this.motionQuery.matches;
			if (this.reduced) {
				this.pause();
				this.staticRender();
			} else if (!document.hidden && !this.lost) {
				this.resume();
			}
		};
		this.motionQuery.addEventListener("change", onMotionChange);
		this.cleanups.push(() => this.motionQuery.removeEventListener("change", onMotionChange));

		this.themeObserver = new MutationObserver(() => {
			this.readColors();
			if (this.reduced) this.staticRender();
		});
		this.themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		const onLost = (e: Event) => {
			e.preventDefault();
			this.lost = true;
			this.pause();
		};
		this.canvas.addEventListener("webglcontextlost", onLost);
		this.cleanups.push(() => this.canvas.removeEventListener("webglcontextlost", onLost));
	}

	private lastClientPrev: { x: number; y: number } | null = null;

	/* ── camera / raycast ── */

	private camEye: [number, number, number] = [0, 1.35, 3.9];
	private camFwd: [number, number, number] = [0, 0, -1];
	private camRight: [number, number, number] = [1, 0, 0];
	private camUp: [number, number, number] = [0, 1, 0];

	private updateCamera(s: ArtworkState) {
		const yaw = s.yaw;
		const cy = Math.cos(yaw);
		const sy = Math.sin(yaw);
		const ex = s.camX * cy + s.camZ * sy;
		const ez = -s.camX * sy + s.camZ * cy;
		this.camEye = [ex, s.camY, ez];
		const tx = 0;
		const tz = 0;
		let fx = tx - ex;
		let fy = s.tgtY - s.camY;
		let fz = tz - ez;
		const fl = Math.hypot(fx, fy, fz) || 1;
		fx /= fl;
		fy /= fl;
		fz /= fl;
		this.camFwd = [fx, fy, fz];
		let rx = fz;
		const ry = 0;
		let rz = -fx;
		const rl = Math.hypot(rx, ry, rz) || 1;
		rx /= rl;
		rz /= rl;
		this.camRight = [rx, ry, rz];
		this.camUp = [ry * fz - rz * fy, rz * fx - rx * fz, rx * fy - ry * fx];
		lookAt(this.view, this.camEye, [tx, s.tgtY, tz], [0, 1, 0]);
		multiply(this.viewProj, this.proj, this.view);
	}

	/** Client coords → point on the sheet in grid space, or null. */
	private raycastToGrid(clientX: number, clientY: number): [number, number] | null {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const ndcX = (clientX / w) * 2 - 1;
		const ndcY = 1 - (clientY / h) * 2;
		const tanF = Math.tan(FOV / 2);
		const aspect = w / h;
		const [fx, fy, fz] = this.camFwd;
		const [rx, , rz] = this.camRight;
		const [ux, uy, uz] = this.camUp;
		const dx = fx + rx * ndcX * tanF * aspect + ux * ndcY * tanF;
		const dy = fy + uy * ndcY * tanF;
		const dz = fz + rz * ndcX * tanF * aspect + uz * ndcY * tanF;
		if (Math.abs(dy) < 1e-4) return null;
		const t = -this.camEye[1] / dy;
		if (t <= 0) return null;
		const px = this.camEye[0] + dx * t;
		const pz = this.camEye[2] + dz * t;
		return [px / PLANE_X, pz / PLANE_Z];
	}

	/* ── simulation ── */

	private targetState(): ArtworkState {
		const y = window.scrollY + window.innerHeight * 0.45;
		const a = this.anchors;
		if (a.length === 0) return STATES.hero;
		if (y <= a[0].top) return STATES[a[0].name];
		if (y >= a[a.length - 1].top) return STATES[a[a.length - 1].name];
		let base = mixState(STATES.hero, STATES.hero, 0);
		for (let i = 0; i < a.length - 1; i++) {
			if (y >= a[i].top && y < a[i + 1].top) {
				const local = (y - a[i].top) / Math.max(a[i + 1].top - a[i].top, 1);
				const eased = local * local * (3 - 2 * local);
				base = mixState(STATES[a[i].name], STATES[a[i + 1].name], eased);
				break;
			}
		}
		// lateral drift while moving through the project archive
		if (this.projHeight > 1) {
			const p = Math.min(
				Math.max((window.scrollY + window.innerHeight * 0.45 - this.projTop) / this.projHeight, 0),
				1,
			);
			base.camX += Math.sin(p * Math.PI * 2) * 0.3;
			base.yaw += Math.sin(p * Math.PI * 2 + 0.7) * 0.06;
		}
		return this.narrow ? adjustForNarrow(base) : base;
	}

	private update(dt: number) {
		const k = 1 - Math.exp(-dt * 2.2);
		const tgt = this.targetState();
		const keys = Object.keys(tgt) as (keyof ArtworkState)[];
		for (const key of keys) {
			this.cur[key] += (tgt[key] - this.cur[key]) * k;
		}

		this.artTime += dt * this.cur.speed * 6;

		// pointer inertia
		this.pointerEnergy *= Math.exp(-dt * 1.6);
		if (this.lastClient && !this.reduced) {
			const hit = this.raycastToGrid(this.lastClient.x, this.lastClient.y);
			if (hit) {
				const pk = 1 - Math.exp(-dt * 3);
				this.pointerGx += (hit[0] - this.pointerGx) * pk;
				this.pointerGz += (hit[1] - this.pointerGz) * pk;
			}
		}

		for (const im of this.impulses) {
			if (!im.active) continue;
			im.age += dt * 0.55;
			if (im.age >= 1) {
				im.active = false;
				im.strength = 0;
			}
		}
	}

	/* ── drawing ── */

	private packImpulses(): Float32Array {
		const out = new Float32Array(16);
		this.impulses.forEach((im, i) => {
			out[i * 4] = im.gx;
			out[i * 4 + 1] = im.gz;
			out[i * 4 + 2] = im.age;
			out[i * 4 + 3] = im.active ? im.strength : 0;
		});
		return out;
	}

	private draw() {
		const gl = this.gl;
		const s = this.cur;
		this.updateCamera(s);

		gl.clearColor(this.colors.paper[0], this.colors.paper[1], this.colors.paper[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.program);
		gl.bindVertexArray(this.vao);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.uniformMatrix4fv(this.loc("uViewProj"), false, this.viewProj);
		gl.uniform1f(this.loc("uTime"), this.artTime);
		gl.uniform1f(this.loc("uAmp"), s.amp);
		gl.uniform1f(this.loc("uFreq"), s.freq);
		gl.uniform1f(this.loc("uWarp"), s.warp);
		gl.uniform2f(this.loc("uFlow"), Math.cos(s.flowAngle), Math.sin(s.flowAngle));
		gl.uniform4f(
			this.loc("uPointer"),
			this.pointerGx,
			this.pointerGz,
			0.16,
			this.reduced ? 0 : this.pointerEnergy * 0.9,
		);
		gl.uniform4fv(this.loc("uImpulses"), this.packImpulses());

		gl.uniform3fv(this.loc("uPaperDeep"), this.colors.paperDeep);
		gl.uniform3fv(this.loc("uPigment"), this.colors.pigment);
		gl.uniform3fv(this.loc("uAccent"), this.colors.accent);
		gl.uniform1f(this.loc("uInkAmount"), s.ink);
		gl.uniform1f(this.loc("uInkScale"), s.inkScale);
		gl.uniform1f(this.loc("uStreak"), s.streak);
		gl.uniform1f(this.loc("uFlowAngle"), s.flowAngle);
		gl.uniform1f(this.loc("uFarFog"), s.farFog);

		gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
		gl.bindVertexArray(null);
	}

	/** One composed, motionless frame — for prefers-reduced-motion. */
	private staticRender() {
		this.measure();
		const savedTime = this.artTime;
		this.artTime = 53.0;
		const saved = this.cur;
		this.cur = this.targetState();
		this.cur.amp *= 0.85;
		this.draw();
		this.cur = saved;
		this.artTime = savedTime;
	}

	/* ── lifecycle ── */

	private loop = (now: number) => {
		if (!this.running) return;
		const dt = Math.min((now - this.lastNow) / 1000, 0.05);
		this.lastNow = now;
		this.update(dt);
		this.draw();
		this.rafId = requestAnimationFrame(this.loop);
	};

	private resume() {
		if (this.running) return;
		this.running = true;
		this.lastNow = performance.now();
		this.rafId = requestAnimationFrame(this.loop);
	}

	private pause() {
		this.running = false;
		cancelAnimationFrame(this.rafId);
	}

	start() {
		if (this.reduced) {
			this.staticRender();
			// keep the composition correct while scrolling, without any motion
			window.addEventListener(
				"scroll",
				() => {
					if (this.staticQueued) return;
					this.staticQueued = true;
					requestAnimationFrame(() => {
						this.staticQueued = false;
						if (this.reduced) this.staticRender();
					});
				},
				{ passive: true },
			);
			return;
		}
		this.resume();
	}
}
