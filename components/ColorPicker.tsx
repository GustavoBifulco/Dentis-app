import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const PRESET_COLORS = [
    { name: 'Ouro Real', hex: '#B59410' },
    { name: 'Azul Safira', hex: '#2563EB' }, // Default Dentis Blue
    { name: 'Violeta Real', hex: '#7c3aed' },
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Titânio', hex: '#475569' },
    { name: 'Rubi', hex: '#dc2626' },
    { name: 'Laranja Solar', hex: '#ea580c' },
    { name: 'Ciano Elétrico', hex: '#06b6d4' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
                <div
                    className="w-6 h-6 rounded-full border border-border shadow-inner ring-2 ring-offset-2 ring-transparent group-hover:ring-border transition-all"
                    style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-text-main uppercase tracking-widest">
                    {color}
                </span>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 z-50 p-4 bg-surface rounded-2xl shadow-xl border border-border w-64"
                    >
                        {/* Custom Picker */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-tight">Cor Personalizada</p>
                            <div className="custom-color-picker">
                                <HexColorPicker color={color} onChange={onChange} style={{ width: '100%', height: '160px' }} />
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
                )}
            </AnimatePresence>

            <style>{`
                .custom-color-picker .react-colorful__saturation {
                    border-radius: 8px 8px 0 0;
                }
                .custom-color-picker .react-colorful__hue {
                    border-radius: 0 0 8px 8px;
                    height: 16px;
                }
                .custom-color-picker .react-colorful__pointer {
                    width: 20px;
                    height: 20px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};
