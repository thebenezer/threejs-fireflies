import { ShaderMaterial, AdditiveBlending, Color } from 'three';

/**
 * FireFlyMaterial class extends Three.js ShaderMaterial
 * for rendering firefly particles with customizable properties.
 */
export class FireFlyMaterial extends ShaderMaterial {
    constructor() {
        super({
            transparent: true,
            blending: AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uFireFlyRadius: { value: 0.1 },
                uNoiseTexture: { value: null }, // Updated to allow for texture assignment
                uColor: { value: new Color('#ffffff') }
            },
            vertexShader: `uniform float uTime;
            varying vec2 vUv;
            varying float vOffset;

            void main() {
                // Apply noise to the particle motion
                float displacementX = sin(uTime + float(gl_InstanceID) * 0.10) * 0.5;
                float displacementY = sin(uTime + float(gl_InstanceID) * 0.15) * 0.5;
                float displacementZ = sin(uTime + float(gl_InstanceID) * 0.13) * 0.5;

                // Make the object face the camera like a pointMaterial.
                float rotation = 0.0;
                vec2 rotatedPosition = vec2(
                    cos(rotation) * position.x - sin(rotation) * position.y,
                    sin(rotation) * position.x + cos(rotation) * position.y
                );

                vec4 finalPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
                finalPosition.xy += rotatedPosition;

                // Make the particles move
                finalPosition.x += displacementX;
                finalPosition.y += displacementY;
                finalPosition.z += displacementZ;

                gl_Position = projectionMatrix * finalPosition;

                vUv = uv;
                vOffset = float(gl_InstanceID);
            }`,
            fragmentShader: `varying vec2 vUv;
            uniform float uTime;
            uniform float uFireFlyRadius;
            uniform vec3 uColor;
            varying float vOffset;

            void main() {
                float distance = length(vUv - 0.5);
                float glow = smoothstep(0.50, uFireFlyRadius, distance);
                float disk = smoothstep(uFireFlyRadius, uFireFlyRadius - 0.01, distance);

                // Add a flashing effect using the time uniform
                float flash = sin(uTime * 3.0 + vOffset * 0.12) * 0.5 + 0.5; // Adjust the frequency and amplitude as desired
                float alpha = clamp((glow + disk) * flash, 0.0, 1.0);

                vec3 glowColor = uColor * 3. * flash;
                vec3 fireFlyColor = uColor * 3.;

                vec3 finalColor = mix(glowColor, fireFlyColor, disk);

                gl_FragColor = vec4(finalColor, alpha);
            }`
        });
    }

    /**
     * Update time uniform for animation.
     * @param {number} time - The time to update the uniform with.
     */
    updateTime(time) {
        this.uniforms.uTime.value = time;
    }

    /**
     * Set the noise texture uniform.
     * @param {Texture} texture - The noise texture to use.
     */
    setNoiseTexture(texture) {
        this.uniforms.uNoiseTexture.value = texture;
    }

    /**
     * Set the firefly color uniform.
     * @param {Color} color - The color for the fireflies.
     */
    setColor(color) {
        this.uniforms.uColor.value.copy(color);
    }

    /**
     * Set the firefly radius uniform.
     * @param {number} radius - The radius for fireflies.
     */
    setFireFlyRadius(radius) {
        this.uniforms.uFireFlyRadius.value = radius;
    }
}
