import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const PRESET_COLORS = [
    { name: 'Azul Safira', hex: '#2563EB' }, // Highlighting the new default
    { name: 'Ouro Real', hex: '#B59410' },
    { name: 'Violeta Real', hex: '#7c3aed' },
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Titânio', hex: '#475569' },
    { name: 'Rubi', hex: '#dc2626' },
    { name: 'Laranja Solar', hex: '#ea580c' },
    { name: 'Ciano Elétrico', hex: '#06b6d4' },
];

/**
 * Helper to convert HEX to HSL
 */
const hexToHsl = (hex: string) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

/**
 * Helper to convert HSL to HEX
 */
const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    // Internal state for circular interaction
    const [hsl, setHsl] = useState(hexToHsl(color));
    const [isDraggingWheel, setIsDraggingWheel] = useState(false);

    // Sync external color changes to internal state
    useEffect(() => {
        setHsl(hexToHsl(color));
    }, [color]);

    // Update position when opening
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Calculate best position (bottom-right aligned mostly, but basic here)
            // Ensure it doesn't go offscreen would be ideal, but simple positioning first
            setDropdownPos({
                top: rect.bottom + 8 + window.scrollY,
                left: rect.right - 280 + window.scrollX // 280 roughly width, align right
            });
        }
    }, [isOpen]);

    // Close click outside logic is simpler with Portal if done via transparent backdrop
    // or standard event listener on document. We'll use document listener.
    useEffect(() => {
        if (!isOpen) return;
        const handleMouseDown = (e: MouseEvent) => {
            // Check if click is inside dropdown or trigger
            const target = e.target as HTMLElement;
            if (target.closest('.color-picker-portal') || target.closest('.color-picker-trigger')) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isOpen]);


    // --- Wheel Logic ---
    const wheelRef = useRef<HTMLDivElement>(null);

    const handleWheelInteraction = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!wheelRef.current) return;
        const rect = wheelRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as any).clientY;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = clientX - centerX;
        const y = clientY - centerY;

        // Calculate Angle (Hue)
        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        // Calculate Distance (Saturation - optional, we usually keep S=100 for wheel, or radius)
        // For this specific 'MacOS style' wheel request, often standard wheels are just HUE around, Saturation/Lightness inside?
        // Actually the image sent looks like a standard HSL wheel: Angle = H, Distance = S.
        // Let's approximate: 
        // Outer edge = 100% Saturation, Center = 0% Saturation (White/Grey).

        const radius = Math.min(rect.width, rect.height) / 2;
        const dist = Math.sqrt(x * x + y * y);
        const s = Math.min(100, Math.round((dist / radius) * 100));

        // Update
        const newHsl = { ...hsl, h: Math.round(angle), s, l: 50 }; // Reset L to 50 for pure colors usually
        setHsl(newHsl);
        onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
    };

    const handleWheelMouseDown = (e: React.MouseEvent) => {
        setIsDraggingWheel(true);
        handleWheelInteraction(e);
    };

    useEffect(() => {
        if (!isDraggingWheel) return;
        const move = (e: MouseEvent | TouchEvent) => handleWheelInteraction(e);
        const up = () => setIsDraggingWheel(false);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', up);
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
        };
    }, [isDraggingWheel]);


    // Lightness Slider Logic
    const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const l = parseInt(e.target.value);
        setHsl({ ...hsl, l });
        onChange(hslToHex(hsl.h, hsl.s, l));
    };

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="color-picker-trigger flex items-center gap-3 px-3 py-2 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
                <div
                    className="w-6 h-6 rounded-full border border-border shadow-inner ring-2 ring-offset-2 ring-transparent group-hover:ring-border transition-all"
                    style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-text-main uppercase tracking-widest hidden sm:block">
                    {color}
                </span>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left }}
                        className="color-picker-portal z-[9999] p-4 bg-surface rounded-2xl shadow-2xl border border-border/20 backdrop-blur-xl w-72"
                    >
                        {/* Circular Picker */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div
                                ref={wheelRef}
                                onMouseDown={handleWheelMouseDown}
                                onTouchStart={(e) => { setIsDraggingWheel(true); handleWheelInteraction(e); }}
                                className="relative w-48 h-48 rounded-full cursor-crosshair shadow-inner"
                                style={{
                                    background: `
                                        conic-gradient(
                                            from 0deg, 
                                            red, 
                                            yellow, 
                                            lime, 
                                            aqua, 
                                            blue, 
                                            magenta, 
                                            red
                                        ),
                                        radial-gradient(
                                            circle, 
                                            rgba(255,255,255,1) 0%, 
                                            rgba(255,255,255,0) 100%
                                        )
                                    `,
                                    // Mix blend needed for saturation perception usually, but simple overlay works ok for basic wheel
                                }}
                            >
                                {/* White Overlay for Saturation/Center */}
                                <div className="absolute inset-0 rounded-full" style={{
                                    background: 'radial-gradient(circle, white 0%, transparent 70%)'
                                }} />

                                {/* Pointer */}
                                <div
                                    className="absolute w-5 h-5 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        // Simple polar to cartesian for internal preview loc? 
                                        // Actually easier: Use current H/S to place pointer
                                        transform: `
                                            translate(-50%, -50%)
                                            rotate(${hsl.h - 90}deg)
                                            translateX(${hsl.s * 0.96}px) 
                                            rotate(-${hsl.h - 90}deg) 
                                        `
                                        // 0.96 = 48% of 200px roughly? 
                                        // 48px radius is 100%. 48 * s/100
                                        // Wheel size 192px (w-48). Radius 96px.
                                    }}
                                >
                                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                                </div>
                            </div>
                        </div>

                        {/* Lightness Slider */}
                        <div className="mb-4 px-2">
                            <div className="relative h-4 w-full rounded-full overflow-hidden shadow-inner">
                                <div className="absolute inset-0" style={{
                                    background: `linear-gradient(to right, #000 0%, ${hslToHex(hsl.h, hsl.s, 50)} 50%, #fff 100%)`
                                }} />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={hsl.l}
                                    onChange={handleLightnessChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {/* Knob indicator logic would go here, simplified for MVP */}
                            </div>
                            <div className="flex justify-between text-[10px] uppercase text-text-muted mt-1 font-bold tracking-wider">
                                <span>Dark</span>
                                <span>Light</span>
                            </div>
                        </div>


                        <div className="h-px bg-border my-4" />

                        {/* Presets */}
                        <div>
                            <p className="text-xs font-bold text-text-muted mb-3 uppercase tracking-tight">Cores Sugeridas</p>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.map((preset) => (
                                    <button
                                        key={preset.hex}
                                        onClick={() => onChange(preset.hex)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center hover:scale-110 ${color.toLowerCase() === preset.hex.toLowerCase() ? 'border-text-main scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: preset.hex }}
                                        title={preset.name}
                                    >
                                        {color.toLowerCase() === preset.hex.toLowerCase() && (
                                            <Check size={12} strokeWidth={4} className="text-white drop-shadow-md" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

