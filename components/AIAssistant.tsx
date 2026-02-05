
import React, { useState } from 'react';
import { Bot, X, Sparkles, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatInterface } from './ai/ChatInterface';
import { ViewType } from '../types';

interface AIAssistantProps {
  onNavigate?: (view: ViewType) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 border-2 border-white/20"
      >
        <Sparkles size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Dentis AI</h3>
                  <p className="text-[10px] text-blue-100 opacity-90">Assistente Inteligente</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onNavigate && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate(ViewType.AI_ASSISTANT);
                    }}
                    title="Expandir"
                    className="hover:bg-white/20 p-1.5 rounded-lg transition"
                  >
                    <Maximize2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                mode="floating"
                onClose={() => setIsOpen(false)}
                onNavigate={(view) => {
                  // Example: if assistant suggests opening a patient, we can do it here
                  if (onNavigate) onNavigate(view);
                }}
              />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
