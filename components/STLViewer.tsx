import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

interface STLViewerProps {
    url: string;
    className?: string;
    color?: string;
}

function Model({ url, color = '#6366f1' }: { url: string; color?: string }) {
    // Use useLoader to load the STL file
    const geometry = useLoader(STLLoader, url);

    // Center geometry to ensure it rotates around the center
    useMemo(() => {
        if (geometry) {
            geometry.computeVertexNormals();
            geometry.center();
        }
    }, [geometry]);

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
                color={color}
                roughness={0.3}
                metalness={0.1}
            />
        </mesh>
    );
}

export default function STLViewer({ url, className = "h-64 w-full", color }: STLViewerProps) {
    return (
        <div className={`relative bg-slate-900 rounded-xl overflow-hidden shadow-inner ${className}`}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 0, 100] }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        <Center>
                            <Model url={url} color={color} />
                        </Center>
                    </Stage>
                    <OrbitControls
                        autoRotate
                        autoRotateSpeed={4}
                        makeDefault
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 1.75}
                    />
                </Suspense>
            </Canvas>

            {/* Loading Overlay */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                Visualizador 3D
            </div>
        </div>
    );
}
