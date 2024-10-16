# threejs fireflies componenet and material
Creating fireflies in three.js. FireFly Shader. FireFly Material.

This project contains two main components for creating a firefly effect in a Three.js scene: `FireFlyMaterial` and `FireFlies`. You can use these components independently to customize your firefly effects.

## 1. FireFlyMaterial

The `FireFlyMaterial` class extends `ShaderMaterial` and allows you to create a custom shader material specifically designed for rendering fireflies.

### How to Use `FireFlyMaterial`

1. **Import the Material**:
   ```javascript
   import { FireFlyMaterial } from './FireFlyMaterial';
   ```

2. **Instantiate the Material**:
   ```javascript
   const fireflyMaterial = new FireFlyMaterial();
   ```

3. **Set Uniforms**:
   You can set various uniforms for the material, such as color and size.
   ```javascript
   fireflyMaterial.setColor(new Color('#ffffff')); // Set the firefly color
   fireflyMaterial.setRadius(0.1); // Set the firefly radius
   ```

4. **Apply to Geometry**:
   You can apply this material to any geometry (like `PlaneGeometry`).
   ```javascript
   const fireflyGeometry = new PlaneGeometry(0.2, 0.2);
   const fireflyMesh = new Mesh(fireflyGeometry, fireflyMaterial);
   scene.add(fireflyMesh);
   ```

## 2. FireFlies

The `FireFlies` class handles instancing and positioning of multiple fireflies in a scene, allowing for dynamic updates.

### How to Use `FireFlies`

1. **Import the Class**:
   ```javascript
   import { FireFlies } from './FireFlies';
   ```

2. **Create an Instance**:
   You can create an instance of the `FireFlies` class with desired properties.
   ```javascript
   const fireflies = new FireFlies({
       groupCount: 3,
       firefliesPerGroup: 100,
       groupRadius: 10,
       noiseTexture: yourNoiseTexture // Optional
   });
   ```

3. **Add to Scene**:
   The fireflies are automatically added to the scene upon instantiation.

4. **Update Loop**:
   Call the `update` method within your animation loop to update firefly animations.
   ```javascript
   function animate() {
       requestAnimationFrame(animate);
       fireflies.update(); // Update fireflies
       renderer.render(scene, camera);
   }
   animate();
   ```

## Example Usage

Here is a brief example of how both components can be used together:

```javascript
import { Scene, WebGLRenderer, PerspectiveCamera } from 'three';
import { FireFlyMaterial } from './FireFlyMaterial';
import { FireFlies } from './FireFlies';

// Initialize scene, camera, and renderer
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create fireflies
const fireflies = new FireFlies({
    groupCount: 3,
    firefliesPerGroup: 100,
    groupRadius: 10,
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    fireflies.update();
    renderer.render(scene, camera);
}
animate();
```

## Conclusion

With `FireFlyMaterial` and `FireFlies`, you can easily create dynamic and visually appealing firefly effects in your Three.js scenes. Feel free to customize the parameters and integrate them as needed in your projects!

