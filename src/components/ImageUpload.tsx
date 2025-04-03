import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Tag, Video, ExternalLink, Check, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MediaFile, MediaTag, VideoEmbed, ListingStatus } from '../types';

interface ImageUploadProps {
  onChange?: (files: MediaFile[], videos: VideoEmbed[]) => void;
}

export default function ImageUpload({ onChange }: ImageUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [videoEmbeds, setVideoEmbeds] = useState<VideoEmbed[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [customStatus, setCustomStatus] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
      tag: 'Gallery' as MediaTag
    }));

    setMediaFiles(prev => [...prev, ...newFiles]);
    onChange?.(mediaFiles, videoEmbeds);
  }, [mediaFiles, videoEmbeds, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    maxFiles: 10,
    maxSize: 5242880 // 5MB
  });

  const removeFile = (id: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== id));
    onChange?.(mediaFiles, videoEmbeds);
  };

  const updateFileTag = (id: string, tag: MediaTag) => {
    setMediaFiles(prev => prev.map(file => 
      file.id === id ? { ...file, tag } : file
    ));
    onChange?.(mediaFiles, videoEmbeds);
  };

  const updateFileStatus = (id: string, status: ListingStatus) => {
    setMediaFiles(prev => prev.map(file => 
      file.id === id ? { ...file, status } : file
    ));
    onChange?.(mediaFiles, videoEmbeds);
  };

  const addVideoEmbed = () => {
    if (!videoUrl) return;

    let platform: VideoEmbed['platform'];
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      platform = 'youtube';
    } else if (videoUrl.includes('vimeo.com')) {
      platform = 'vimeo';
    } else if (videoUrl.includes('tiktok.com')) {
      platform = 'tiktok';
    } else if (videoUrl.includes('instagram.com')) {
      platform = 'instagram';
    } else {
      alert('Invalid video URL. Please use YouTube, Vimeo, TikTok, or Instagram links.');
      return;
    }

    const newVideo: VideoEmbed = {
      url: videoUrl,
      platform,
      controls: {
        autoplay: false,
        loop: false,
        mute: true,
        isMain: false
      }
    };

    setVideoEmbeds(prev => [...prev, newVideo]);
    setVideoUrl('');
    onChange?.(mediaFiles, videoEmbeds);
  };

  const updateVideoControls = (index: number, controls: Partial<VideoEmbed['controls']>) => {
    setVideoEmbeds(prev => prev.map((video, i) => 
      i === index ? { ...video, controls: { ...video.controls, ...controls } } : video
    ));
    onChange?.(mediaFiles, videoEmbeds);
  };

  const removeVideo = (index: number) => {
    setVideoEmbeds(prev => prev.filter((_, i) => i !== index));
    onChange?.(mediaFiles, videoEmbeds);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600">
              Drag & drop images or videos here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Maximum 10 files, up to 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Video Embed Input */}
      <div className="flex gap-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste video URL (YouTube, Vimeo, TikTok, Instagram)"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={addVideoEmbed}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Video className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {/* Custom Status Input */}
      <div className="flex gap-4">
        <input
          type="text"
          value={customStatus}
          onChange={(e) => setCustomStatus(e.target.value.slice(0, 15))}
          placeholder="Custom status (max 15 characters)"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="text-gray-500 self-center">{customStatus.length}/15</span>
      </div>

      {/* Media Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mediaFiles.map((file) => (
          <div key={file.id} className="relative group">
            <img
              src={file.preview}
              alt="Preview"
              className="w-full aspect-square object-cover rounded-lg"
            />
            
            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-3">
              {/* Top Controls */}
              <div className="flex justify-between">
                <select
                  value={file.tag}
                  onChange={(e) => updateFileTag(file.id, e.target.value as MediaTag)}
                  className="text-xs bg-white/20 text-white rounded px-2 py-1"
                >
                  <option value="Gallery">Gallery</option>
                  <option value="Main Photo">Main Photo</option>
                  <option value="Property Info Pack">Property Info Pack</option>
                  <option value="Mandatory Doc by Govt">Mandatory Doc</option>
                </select>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-white hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Controls */}
              <select
                value={file.status}
                onChange={(e) => updateFileStatus(file.id, e.target.value as ListingStatus)}
                className="text-xs bg-white/20 text-white rounded px-2 py-1"
              >
                <option value="New">New</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
                <option value="Hidden">Hidden</option>
                {customStatus && <option value={customStatus}>{customStatus}</option>}
              </select>
            </div>

            {/* Status Badge */}
            {file.status && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {file.status}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Embeds */}
      {videoEmbeds.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Embedded Videos</h3>
          {videoEmbeds.map((video, index) => (
            <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <Video className="w-5 h-5 text-gray-500" />
              <span className="flex-1 truncate">{video.url}</span>
              
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={video.controls.autoplay}
                    onChange={(e) => updateVideoControls(index, { autoplay: e.target.checked })}
                    className="rounded"
                  />
                  Autoplay
                </label>
                
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={video.controls.loop}
                    onChange={(e) => updateVideoControls(index, { loop: e.target.checked })}
                    className="rounded"
                  />
                  Loop
                </label>
                
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={video.controls.mute}
                    onChange={(e) => updateVideoControls(index, { mute: e.target.checked })}
                    className="rounded"
                  />
                  Mute
                </label>
                
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={video.controls.isMain}
                    onChange={(e) => updateVideoControls(index, { isMain: e.target.checked })}
                    className="rounded"
                  />
                  Main
                </label>

                <button
                  onClick={() => removeVideo(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}