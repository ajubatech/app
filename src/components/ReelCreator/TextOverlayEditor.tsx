import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Type, Check, Crown } from 'lucide-react';
import { useReelStore } from '../../store/reelStore';
import { TextStyle } from '../../types';
import { Slider } from '../ui/slider';

interface TextOverlayEditorProps {
  onAdd: (text: any) => void;
  onClose: () => void;
}

export default function TextOverlayEditor({ onAdd, onClose }: TextOverlayEditorProps) {
  const { textStyles, loadTextStyles, isLoading } = useReelStore();
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<TextStyle | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  
  useEffect(() => {
    loadTextStyles();
  }, []);
  
  const handleAdd = () => {
    if (!text.trim() || !selectedStyle) return;
    
    onAdd({
      id: Date.now().toString(),
      text,
      position,
      style: {
        font: selectedStyle.font,
        size: fontSize,
        color: selectedStyle.color,
        background: selectedStyle.background
      }
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Text</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Text Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                <div className="col-span-2 flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                textStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg text-center ${
                      selectedStyle?.id === style.id
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    style={{
                      backgroundColor: style.background || '#333',
                      color: style.color,
                      fontFamily: style.font
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>{style.name}</span>
                      {style.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <span>Sample Text</span>
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Font Size: {fontSize}px
            </label>
            <Slider
              value={[fontSize]}
              min={12}
              max={48}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              disabled={!text.trim() || !selectedStyle}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Add Text
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}