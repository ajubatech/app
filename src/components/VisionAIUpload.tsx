import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface VisionAIUploadProps {
  onAnalysis: (result: any) => void;
}

export default function VisionAIUpload({ onAnalysis }: VisionAIUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setPreview(URL.createObjectURL(file));

      // Upload to temporary storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp-uploads')
        .upload(`vision-ai/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('temp-uploads')
        .getPublicUrl(uploadData.path);

      // Call Vision AI edge function
      const { data, error } = await supabase.functions.invoke('image-insight', {
        body: { imageUrl: publicUrl }
      });

      if (error) throw error;

      onAnalysis(data);
      toast.success('Image analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysis]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
  });

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the image here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: 5MB
            </p>
          </div>
        )}
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full aspect-video object-cover rounded-xl"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearPreview}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing image...</span>
        </div>
      )}
    </div>
  );
}