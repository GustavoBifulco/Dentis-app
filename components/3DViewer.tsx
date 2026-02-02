import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { useLoader } from '@react-three/fiber';
import { Loader2 } from 'lucide-react';

interface ThreeDViewerProps {
    url: string;
    className?: string;
    color?: string;
}

function Model({ url, color = '#E2E8F0' }: { url: string; color?: string }) {
    const geometry = useLoader(STLLoader, url);

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
                color={color}
                roughness={0.1}
                metalness={0.8}
                envMapIntensity={1}
            />
        </mesh>
    );
}

export default function ThreeDViewer({ url, className = "h-[400px] w-full", color }: ThreeDViewerProps) {
    return (
        <div className={`relative bg-[#F8FAFC] rounded-3xl overflow-hidden border border-slate-100 shadow-inner group ${className}`}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 80] }}>
                <color attach="background" args={['#F8FAFC']} />
                <Suspense fallback={null}>
                    <Stage environment="studio" intensity={0.5} contactShadow={{ opacity: 0.2, blur: 2 }}>
                        <Center>
                            <Model url={url} color={color} />
                        </Center>
                    </Stage>
                    <OrbitControls
                        makeDefault
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 1.75}
                    />
                </Suspense>
            </Canvas>

            {/* HUD Info */}
            <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
                <h4 className="text-slate-900 font-bold text-sm">Escaneamento Digital</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gire para inspecionar</p>
            </div>

            <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-lg text-[10px] font-black uppercase text-slate-800 tracking-tighter pointer-events-none">
                3D View Mode
            </div>
        </div>
    );
}
