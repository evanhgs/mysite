// Champ de cubes instanciés : une géométrie de cube partagée, trois maillages
// (principal, « devant », « derrière ») pour l'astuce de stencil de la jonction
// impossible, et une texture de formations (x, y, z, taille) par instance.
import {
	AlwaysStencilFunc,
	BoxGeometry,
	DataTexture,
	FloatType,
	GLSL3,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	KeepStencilOp,
	Matrix4,
	Mesh,
	NearestFilter,
	NotEqualStencilFunc,
	ReplaceStencilOp,
	RGBAFormat,
	type Scene,
	ShaderMaterial,
} from 'three';
import { rgb } from '../stage';
import { fragmentShader, vertexShader } from './shaders';

const TEX_WIDTH = 1024;

export interface FieldGroups {
	/** Instances dessinées « devant » la jonction (ids [start, start + count)). */
	mark: [number, number];
	/** Instances qui passent derrière la marque quand la jonction est active. */
	late: [number, number];
}

export interface Tones {
	x: string;
	y: string;
	z: string;
	flat: string;
	fog: string;
}

export class CubeField {
	readonly count: number;
	readonly rows: number;
	readonly rowsPer: number;
	private readonly data: Float32Array;
	private readonly texture: DataTexture;
	private readonly base = new BoxGeometry(1, 1, 1);
	private readonly meshes: Mesh[] = [];
	private readonly late: ShaderMaterial;
	readonly uniforms;

	constructor(count: number, rows: number, groups: FieldGroups, tones: Tones, seed = 7) {
		this.count = count;
		this.rows = rows;
		this.rowsPer = Math.ceil(count / TEX_WIDTH);
		this.data = new Float32Array(TEX_WIDTH * this.rowsPer * rows * 4);
		this.texture = new DataTexture(this.data, TEX_WIDTH, this.rowsPer * rows, RGBAFormat, FloatType);
		this.texture.minFilter = NearestFilter;
		this.texture.magFilter = NearestFilter;
		this.texture.generateMipmaps = false;
		this.texture.needsUpdate = true;

		this.uniforms = {
			uForm: { value: this.texture },
			uWidth: { value: TEX_WIDTH },
			uRowsPer: { value: this.rowsPer },
			uFrom: { value: 0 },
			uTo: { value: 0 },
			uT: { value: 0 },
			uStagger: { value: 0.35 },
			uSwirl: { value: 0 },
			uOrtho: { value: 0 },
			uOrthoProj: { value: new Matrix4() },
			uTime: { value: 0 },
			uBreath: { value: 0 },
			uFogNear: { value: 10 },
			uFogFar: { value: 80 },
			uEye: { value: [0, 0, 30] as [number, number, number] },
			uFaceFrom: { value: 0 },
			uFaceTo: { value: 0 },
			uLightFrom: { value: [0.45, 0.85, 0.05] as [number, number, number] },
			uLightTo: { value: [0.45, 0.85, 0.05] as [number, number, number] },
			uToneX: { value: rgb(tones.x) },
			uToneY: { value: rgb(tones.y) },
			uToneZ: { value: rgb(tones.z) },
			uFlat: { value: rgb(tones.flat) },
			uFlatAmt: { value: 1 },
			uFogColor: { value: rgb(tones.fog) },
			uFogAmt: { value: 0 },
		};

		// Graine pseudo-aléatoire par instance (décalage du morphing).
		let s = seed >>> 0;
		const rand = () => {
			s = (s + 0x6d2b79f5) >>> 0;
			let t = s;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
		const seeds = Float32Array.from({ length: count }, () => rand());

		const [markStart, markCount] = groups.mark;
		const [lateStart, lateCount] = groups.late;
		const ranges: { ids: number[]; order: number; kind: 'main' | 'mark' | 'late' }[] = [
			{ ids: [], order: 0, kind: 'main' },
			{ ids: [], order: 1, kind: 'mark' },
			{ ids: [], order: 2, kind: 'late' },
		];
		for (let i = 0; i < count; i++) {
			if (i >= markStart && i < markStart + markCount) ranges[1].ids.push(i);
			else if (i >= lateStart && i < lateStart + lateCount) ranges[2].ids.push(i);
			else ranges[0].ids.push(i);
		}

		let late: ShaderMaterial | null = null;
		for (const r of ranges) {
			if (r.ids.length === 0) continue;
			const geo = new InstancedBufferGeometry();
			geo.index = this.base.index;
			geo.setAttribute('position', this.base.getAttribute('position'));
			geo.setAttribute('normal', this.base.getAttribute('normal'));
			geo.setAttribute('aId', new InstancedBufferAttribute(Float32Array.from(r.ids), 1));
			geo.setAttribute('aSeed', new InstancedBufferAttribute(Float32Array.from(r.ids, (i) => seeds[i]), 1));
			geo.instanceCount = r.ids.length;

			const mat = new ShaderMaterial({
				glslVersion: GLSL3,
				vertexShader,
				fragmentShader,
				uniforms: this.uniforms,
				stencilWrite: true,
				stencilRef: r.kind === 'mark' ? 1 : r.kind === 'late' ? 1 : 0,
				stencilFunc: AlwaysStencilFunc,
				stencilZPass: r.kind === 'late' ? KeepStencilOp : ReplaceStencilOp,
			});
			if (r.kind === 'late') late = mat;
			const mesh = new Mesh(geo, mat);
			mesh.frustumCulled = false;
			mesh.renderOrder = r.order;
			this.meshes.push(mesh);
		}
		this.late = late ?? new ShaderMaterial();
	}

	/** Écrit une formation (count × [x, y, z, taille]) dans la ligne `row`. */
	setFormation(row: number, values: Float32Array) {
		const offset = row * this.rowsPer * TEX_WIDTH * 4;
		this.data.fill(0, offset, offset + this.rowsPer * TEX_WIDTH * 4);
		this.data.set(values.subarray(0, this.count * 4), offset);
		this.texture.needsUpdate = true;
	}

	/** Jonction impossible : les cubes « derrière » s'effacent sous la marque. */
	setJoinActive(on: boolean) {
		const func = on ? NotEqualStencilFunc : AlwaysStencilFunc;
		if (this.late.stencilFunc !== func) {
			this.late.stencilFunc = func;
			this.late.needsUpdate = true;
		}
	}

	addTo(scene: Scene) {
		for (const m of this.meshes) scene.add(m);
	}

	/** Après une perte de contexte : la texture doit être renvoyée au GPU. */
	reupload() {
		this.texture.needsUpdate = true;
	}

	dispose() {
		for (const m of this.meshes) {
			m.geometry.dispose();
			(m.material as ShaderMaterial).dispose();
		}
		this.base.dispose();
		this.texture.dispose();
	}
}
