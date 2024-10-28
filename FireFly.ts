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
import FireFlyMaterial from './FireFlyMaterial';

/**
 * This FireFlies class generates firefly particles using instanced rendering.
 * You can customize the number of firefly groups, how many fireflies per group,
 * their radius, and a noise texture for additional effects.
 * 
 * Usage:
 * const fireflies = new FireFlies(scene, {
 *   groupCount: 5,
 *   firefliesPerGroup: 100,
 *   groupRadius: 10,
 *   noiseTexture: yourNoiseTexture
 * });
 * 
 * In your render loop, call the update method:
 * fireflies.update(deltaTime);
 */

type Props = {
	groupCount: number; // Number of groups of fireflies
	firefliesPerGroup: number; // Number of fireflies in each group
	groupRadius: number; // Radius of each group
	noiseTexture: Texture | null; // Optional texture for noise effects
};

const defaultProps = {
	groupCount: 1,
	firefliesPerGroup: 50,
	groupRadius: 5,
	noiseTexture: null
};

export class FireFlies {
	private gl: Gl; // Instance of the Gl class for WebGL context
	private scene: Scene; // The Three.js scene to which the fireflies will be added
	private fireflyParticles: InstancedMesh; // Instanced mesh for rendering fireflies
	private fireflyCount: number; // Total number of fireflies
	private Uniforms = {
		uTime: { value: 0 }, // Uniform for time variable to animate fireflies
		uFireFlyRadius: { value: 0.1 }, // Uniform for firefly radius
		uPlayerPosition: { value: new Vector3(0, 0, 0) }, // Uniform for player position
		uNoiseTexture: { value: new Texture() }, // Uniform for noise texture
		uColor: { value: new Color('#ffffff') } // Uniform for firefly color
	};
	private groupCount: number; // Number of groups of fireflies
	private firefliesPerGroup: number; // Number of fireflies in each group
	private groupRadius: number; // Radius for grouping fireflies
	private fireflyMaterial: FireFlyMaterial;

	/**
	 * Constructs the FireFlies instance.
	 * @param _scene The Three.js scene where the fireflies will be rendered.
	 * @param props Configuration options for the fireflies.
	 */
	constructor(_scene: Scene, props: Props = defaultProps) {
		this.gl = Gl.getInstance(); // Get the WebGL context
		this.scene = _scene; // Assign the scene
		this.groupCount = props.groupCount; // Set group count
		this.groupRadius = props.groupRadius; // Set group radius
		this.firefliesPerGroup = props.firefliesPerGroup; // Set fireflies per group
		if (props.noiseTexture) {
			this.Uniforms.uNoiseTexture.value = props.noiseTexture; // Assign noise texture if provided
		}

		// Create a firefly geometry
		const fireflyGeometry = new PlaneGeometry(0.2, 0.2); // Adjust the size of the firefly as desired

		// Create a firefly material
		this.fireflyMaterial = new FireFlyMaterial();

		// Create a firefly object using instanced rendering
		this.fireflyCount = this.groupCount * this.firefliesPerGroup; // Calculate total firefly count
		this.fireflyParticles = new InstancedMesh(
			fireflyGeometry,
			this.fireflyMaterial,
			this.fireflyCount
		);

		// Set initial positions for the fireflies
		this.setInitialPositions(this.groupCount, this.firefliesPerGroup);
		this.scene.add(this.fireflyParticles); // Add fireflies to the scene
	}

	/**
	 * Sets the initial positions of the fireflies in their groups.
	 * @param groupCount The number of groups of fireflies.
	 * @param firefliesPerGroup The number of fireflies in each group.
	 */
	setInitialPositions(groupCount: number, firefliesPerGroup: number) {
		this.fireflyParticles.instanceMatrix.setUsage(DynamicDrawUsage); // Set usage to DynamicDraw

		const position = new Vector3(); // Vector to hold position
		const matrix = new Matrix4(); // Matrix to transform each firefly

		for (let i = 0; i < groupCount; i++) {
			// Calculate a random center position for each group
			const groupCenter = new Vector3(0, 0, 0); // Can be modified for dynamic positioning

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
		this.fireflyParticles.renderOrder = 1; // Set render order to ensure proper layering
		this.fireflyParticles.instanceMatrix.needsUpdate = true; // Mark the instance matrix for update
	}

	/**
	 * Updates the uniforms each frame.
	 * @param uTime The elapsed time since the last frame.
	 */
	update(delta: number) {
		this.Uniforms.uTime.value += delta;
		this.fireflyMaterial.updateTime(this.Uniforms.uTime.value);
	}

	/**
	 * Generates a random number based on a Gaussian distribution.
	 * @returns A random number from the Gaussian distribution.
	 */
	private randomGaussian() {
		let u = 0,
			v = 0;
		while (u === 0) u = Math.random(); // Convert [0,1) to (0,1)
		while (v === 0) v = Math.random();
		const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v); // Box-Muller transform
		return num; // Return the random number
	}
}
