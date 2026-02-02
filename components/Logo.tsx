
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  
  const sizes = {
    sm: { text: 'text-xl', barHeight: 'h-[3px]' },
    md: { text: 'text-3xl', barHeight: 'h-[4px]' },
    lg: { text: 'text-4xl', barHeight: 'h-[5px]' },
    xl: { text: 'text-6xl', barHeight: 'h-[6px]' },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col w-fit group ${className}`}>
      {/* Fonte ajustada para font-medium (menos espessa que font-black) */}
      <span className={`font-medium tracking-tight text-lux-text leading-none ${s.text} transition-colors duration-300`}>
        Dentis
      </span>

      <div className={`w-full ${s.barHeight} mt-1 rounded-full overflow-hidden`}>
         <div 
            className="w-full h-full transition-all duration-500 ease-out group-hover:scale-x-110"
            style={{
                // Gradiente fixo: Roxo (#8B5CF6) para Azul (#3B82F6)
                // Usa variável CSS para permitir override via configurações se desejado
                background: `var(--logo-gradient, linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%))`,
                opacity: 1
            }}
         />
      </div>
    </div>
  );
};

export default Logo;
