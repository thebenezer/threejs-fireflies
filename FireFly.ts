import {
	AdditiveBlending,
	Color,
	DynamicDrawUsage,
	InstancedMesh,
	Matrix4,
	Object3D,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Texture,
	Vector3
} from 'three';

import Gl from '@/Gl';

import FireFlyShader from '@/shaders/FireFlyShader';

type Props = {
	groupCount: number;
	firefliesPerGroup: number;
	groupRadius: number;
	noiseTexture: Texture | null;
};

const defaultProps = {
	groupCount: 1,
	firefliesPerGroup: 50,
	groupRadius: 5,
	noiseTexture: null
};

export class FireFlies {
	private scene: Scene;
	private fireflyParticles: InstancedMesh;
	private fireflyCount: number;
	private Uniforms = {
		uTime: { value: 0 },
		uFireFlyRadius: { value: 0.1 },
		uPlayerPosition: { value: new Vector3(0, 0, 0) },
		uNoiseTexture: { value: new Texture() },
		uColor: { value: new Color('#ffffff') }
	};
	private groupCount: number;
	private firefliesPerGroup: number;
	private groupRadius: number;

	constructor(_scene, props: Props = defaultProps) {
		this.scene = _scene;
		this.groupCount = props.groupCount;
		this.groupRadius = props.groupRadius;
		this.firefliesPerGroup = props.firefliesPerGroup;
		if (props.noiseTexture) {
			this.Uniforms.uNoiseTexture.value = props.noiseTexture;
		}

		// Create a firefly geometry
		const fireflyGeometry = new PlaneGeometry(0.2, 0.2); // Adjust the size of the firefly as desired

		// Create a firefly material
		const fireflyMaterial = new ShaderMaterial({
			transparent: true,
			blending: AdditiveBlending,
			uniforms: {
				uTime: this.Uniforms.uTime,
				uFireFlyRadius: this.Uniforms.uFireFlyRadius,
				uNoiseTexture: this.Uniforms.uNoiseTexture,
				uColor: this.Uniforms.uColor
			},
			vertexShader: FireFlyShader.vertex,
			fragmentShader: FireFlyShader.fragment
		});

		// Create a firefly object using instanced rendering
		this.fireflyCount = this.groupCount * this.firefliesPerGroup;
		this.fireflyParticles = new InstancedMesh(
			fireflyGeometry,
			fireflyMaterial,
			this.fireflyCount
		);

		// Set initial positions for the fireflies
		this.setInitialPositions(this.groupCount, this.firefliesPerGroup);
		this.scene.add(this.fireflyParticles);

		this.setupEventListeners();
	}

	setInitialPositions(groupCount: number, firefliesPerGroup: number) {
		this.fireflyParticles.instanceMatrix.setUsage(DynamicDrawUsage); // Set usage to DynamicDraw

		const position = new Vector3();
		const matrix = new Matrix4();

		for (let i = 0; i < groupCount; i++) {
			// Calculate a random center position for each group within a range
			const groupCenter = new Vector3(0, 0, 0);

			// Set positions for fireflies within the group
			for (let j = 0; j < firefliesPerGroup; j++) {
				// Calculate a random offset within the group
				const offset = new Vector3(
					this.randomGaussian() * this.groupRadius,
					this.randomGaussian() * this.groupRadius,
					this.randomGaussian() * this.groupRadius
				);

				// Calculate the final position by adding the group center and the offset
				position.copy(groupCenter).add(offset);

				// Set the matrix position for the firefly
				matrix.setPosition(position);
				const index = i * firefliesPerGroup + j; // Calculate the index within the instanced mesh
				this.fireflyParticles.setMatrixAt(index, matrix);
			}
		}
		this.fireflyParticles.renderOrder = 1;
		this.fireflyParticles.instanceMatrix.needsUpdate = true;
	}

  // call this in your render loop
	update() {
			this.Uniforms.uTime.value += this.gl.delta;
	}

	private setupEventListeners() {
		const colorPicker = document.querySelectorAll('.color-picker');
		const color1 = document.getElementById('color-picker-1');
		const color2 = document.getElementById('color-picker-2');
		const color3 = document.getElementById('color-picker-3');

		color1?.addEventListener('click', (e) => {
			colorPicker.forEach((picker) => picker.classList.remove('active'));
			color1?.classList.add('active');
			this.Uniforms.uColor.value = new Color('#41f2dd');
		});
		color2?.addEventListener('click', (e) => {
			colorPicker.forEach((picker) => picker.classList.remove('active'));
			color2?.classList.add('active');
			this.Uniforms.uColor.value = new Color('#c6f241');
		});
		color3?.addEventListener('click', (e) => {
			colorPicker.forEach((picker) => picker.classList.remove('active'));
			color3?.classList.add('active');
			this.Uniforms.uColor.value = new Color('#f28e41');
		});
	}

	private randomGaussian() {
		let u = 0,
			v = 0;
		while (u === 0) u = Math.random(); // Convert [0,1) to (0,1)
		while (v === 0) v = Math.random();
		const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
		return num;
	}
}
