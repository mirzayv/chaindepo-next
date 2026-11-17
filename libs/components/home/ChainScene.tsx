import React, { useEffect, useRef } from 'react';

interface ChainSceneProps {
	className?: string;
	/** number of blocks in the chain */
	count?: number;
}

/**
 * 3D hash chain: glass blocks linked by metal rings, with a "verification" pulse running along them.
 * The last block's core uses the accent colour (the event just anchored on Ethereum).
 *
 * three.js is loaded lazily and only once the canvas scrolls into view, so it never slows the first paint.
 * Rendering pauses while the canvas is off screen, and honours prefers-reduced-motion.
 */
const ChainScene = ({ className, count = 5 }: ChainSceneProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let disposed = false;
		let cleanup: (() => void) | undefined;

		const start = async () => {
			const THREE = await import('three');
			const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
			const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
			if (disposed) return;

			const accentChannels = getComputedStyle(document.documentElement).getPropertyValue('--cd-accent').trim() || '47 143 181';
			const [r, g, b] = accentChannels.split(/\s+/).map(Number);
			const accent = new THREE.Color(r / 255, g / 255, b / 255);

			const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.1;

			const scene = new THREE.Scene();
			const pmrem = new THREE.PMREMGenerator(renderer);
			const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
			scene.environment = envTexture;

			const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

			const glass = new THREE.MeshPhysicalMaterial({
				color: '#ffffff',
				roughness: 0.08,
				transmission: 1,
				thickness: 1.2,
				ior: 1.45,
				clearcoat: 1,
				clearcoatRoughness: 0.05,
				attenuationColor: new THREE.Color('#cfe0ff'),
				attenuationDistance: 3,
			});
			const metal = new THREE.MeshPhysicalMaterial({ color: '#d9dde3', metalness: 1, roughness: 0.22, clearcoat: 0.6 });
			const glow = new THREE.MeshPhysicalMaterial({
				color: accent,
				emissive: accent,
				emissiveIntensity: 0.6,
				roughness: 0.3,
				metalness: 0.2,
			});
			const edge = new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.08 });

			const boxGeo = new RoundedBoxGeometry(1.5, 1.5, 1.5, 6, 0.22);
			const coreGeo = new RoundedBoxGeometry(0.62, 0.62, 0.62, 4, 0.12);
			const frameGeo = new RoundedBoxGeometry(1.62, 1.62, 1.62, 6, 0.24);
			const linkGeo = new THREE.TorusGeometry(0.3, 0.07, 16, 48);

			const group = new THREE.Group();
			scene.add(group);
			const gap = 2.15;
			const blocks: { group: InstanceType<typeof THREE.Group>; core: InstanceType<typeof THREE.Mesh>; phase: number }[] = [];
			for (let i = 0; i < count; i++) {
				const block = new THREE.Group();
				const core = new THREE.Mesh(coreGeo, i === count - 1 ? glow : metal);
				block.add(new THREE.Mesh(boxGeo, glass), new THREE.Mesh(frameGeo, edge), core);
				block.position.x = (i - (count - 1) / 2) * gap;
				group.add(block);
				blocks.push({ group: block, core, phase: i * 0.7 });
			}
			const links = Array.from({ length: count - 1 }, (_, i) => {
				const link = new THREE.Mesh(linkGeo, metal);
				link.position.x = (i + 0.5 - (count - 1) / 2) * gap;
				link.rotation.y = Math.PI / 2;
				group.add(link);
				return link;
			});

			const key = new THREE.DirectionalLight('#ffffff', 2.2);
			key.position.set(4, 6, 6);
			const rim = new THREE.PointLight(accent, 30, 20);
			rim.position.set(3, -1, 3);
			scene.add(key, rim);

			const chainWidth = (count - 1) * gap + 1.6;
			const resize = () => {
				const w = canvas.clientWidth;
				const h = canvas.clientHeight;
				if (!w || !h) return;
				renderer.setSize(w, h, false);
				camera.aspect = w / h;
				// fit the whole chain into ~72% of the canvas width, leaving room for the floating motion
				const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
				const fill = camera.aspect < 1.2 ? 0.94 : 0.72; // narrow screens: use almost the full width
				camera.position.set(0, 0.6, Math.max(9, chainWidth / fill / 2 / (halfH * camera.aspect)));
				camera.lookAt(0, 0, 0);
				camera.updateProjectionMatrix();
			};
			const resizeObserver = new ResizeObserver(resize);
			resizeObserver.observe(canvas);
			resize();

			let pointerX = 0;
			let pointerY = 0;
			const onPointer = (e: PointerEvent) => {
				pointerX = e.clientX / window.innerWidth - 0.5;
				pointerY = e.clientY / window.innerHeight - 0.5;
			};
			window.addEventListener('pointermove', onPointer);

			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const clock = new THREE.Clock();
			const frame = () => {
				const t = reduceMotion ? 0 : clock.getElapsedTime();
				blocks.forEach((block, i) => {
					block.group.position.y = Math.sin(t * 1.1 + block.phase) * 0.18;
					block.group.rotation.y = t * 0.35 + i * 0.4;
					block.group.rotation.x = Math.sin(t * 0.6 + i) * 0.15;
					// verification pulse travelling along the chain
					const pulse = Math.max(0, Math.sin(t * 1.4 - i * 0.9));
					block.core.scale.setScalar(1 + pulse * 0.18);
				});
				links.forEach((link, i) => {
					link.position.y = (blocks[i].group.position.y + blocks[i + 1].group.position.y) / 2;
					link.rotation.x = t * 0.8;
				});
				group.rotation.y += (pointerX * 0.5 - group.rotation.y) * 0.05;
				group.rotation.x += (pointerY * 0.25 - group.rotation.x) * 0.05;
				renderer.render(scene, camera);
			};

			// only animate while visible
			const visibility = new IntersectionObserver(([entry]) => {
				renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
			});
			visibility.observe(canvas);
			frame();

			cleanup = () => {
				renderer.setAnimationLoop(null);
				visibility.disconnect();
				resizeObserver.disconnect();
				window.removeEventListener('pointermove', onPointer);
				[boxGeo, coreGeo, frameGeo, linkGeo].forEach((geo) => geo.dispose());
				[glass, metal, glow, edge].forEach((mat) => mat.dispose());
				envTexture.dispose();
				pmrem.dispose();
				renderer.dispose();
			};
		};

		// lazy start: load three.js only when the canvas comes near the viewport
		const lazy = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					lazy.disconnect();
					start();
				}
			},
			{ rootMargin: '200px' },
		);
		lazy.observe(canvas);

		return () => {
			disposed = true;
			lazy.disconnect();
			cleanup?.();
		};
	}, [count]);

	return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default ChainScene;
