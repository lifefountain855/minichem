**Goal:** Build a multipage react website. make it responsive. have the home page be a scroll-driven 3D product landing page in a React + Vite + Tailwind CSS app using `@react-three/fiber`, `@react-three/drei`, `motion`, and `lenis`.
**Requirements:**
1. **Smooth Scrolling (Lenis):** Set up `@studio-freight/lenis` (or `lenis/react`) to manage page scrolling with smooth momentum so the 3D rotation feels fluid and weight-balanced.
2. **Fixed 3D Canvas:** Place a centered `<Canvas>` pinned to the viewport (`fixed inset-0 pointer-events-none`) so the HTML content scrolls over top while the model stays fixed in the screen center.
3. **3D Model Loading:** Implement a component that loads a `.glb` / `.gltf` model using `@react-three/drei`'s `useGLTF`. Include ambient and directional lighting.
4. **Scroll Sync:** Connect the page's scroll progress (`useScroll` from `motion`) to the 3D model's Y-axis rotation via `useFrame` so scrolling down smoothly rotates the product $360^\circ$ (or across multiple full turns).
5. **Tailwind Layout:** Create a multi-section scrollable wrapper (e.g., `min-h-[300vh]`) with overlay sections (`relative z-10`) displaying hero headers and feature text centered over the rotating model.
6. **Performance & Clean Code:** Ensure proper cleanup of the Lenis animation loop in `useEffect`, smooth frame updates, and clear instructions for replacing the model placeholder path (`/models/product.glb`).


**Tech Stack:**
* React + Vite
* Tailwind CSS
* `@react-three/fiber` & `@react-three/drei`
* `three`
* `motion` (or `framer-motion`)
* `@studio-freight/lenis` (or `lenis`)