# CS 174A Project

Team members: Alexis Kim, Daniel Chen, Tiffany Chen


We will be modeling a hypercube, which is a geometric shape equated to a 4-dimensional cube. Although a true 4D hypercube can’t be modeled because we can only see in 3D, we will demonstrate the closest possible 3D representation of it. We will capture how the hypercube seems to change when we rotate our point of view in different directions. We may also implement an additional feature, where we cast light onto the hypercube and see the behavior of its shadow.

## What topics for the course are we using?
Points and vectors: vector operations, properties, finding new points
Transformations: rigid body transformations, rotation, scaling, translations
Viewing: eye/camera matrix
Lighting/illumination: spot lights, attenuation, colored light and objects
Shadow algorithms: shadow volumes, 2-pass z-buffer

## Interactivity
The user can click and drag to change the perspective from which we view the hypercube. The user will also be able to change the position of the light source and see how that affects the shadow. We will consider smooth UI interactions to ensure good interactivity, such as fast response time, click-drag speed, or intuitive UI controls.

## Advanced Features
Some advanced features that will be implemented include projecting a 4D object onto a 3D space, rotation simulation, and shadowing.

## Implementation
We will implement these features using the Three.js framework. We will use arrays to define our hypercube’s vertex positions, normals, and indices. Then we’ll create a rotation matrix to calculate the new coordinates of the hypercube as it rotates. In animate(), we can check for user input, such as keystrokes or mouse clicks, to change features about the hypercube such as the lighting source or the color of the hypercube. Potential challenges could come from the difficulty of calculating new coordinates for the hypercube based on transformations, managing the computational load efficiently, or improving the aesthetics of the animation.
