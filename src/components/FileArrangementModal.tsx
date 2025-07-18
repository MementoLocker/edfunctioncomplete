import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, GripVertical, Image, Video, Volume2, Save, RotateCcw } from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

interface FileArrangementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaFiles: MediaFile[];
  onSave: (reorderedFiles: MediaFile[]) => void;
}

export const FileArrangementModal: React.FC<FileArrangementModalProps> = ({
  isOpen,
  onClose,
  mediaFiles,
  onSave,
}) => {
  const [reorderedFiles, setReorderedFiles] = useState<MediaFile[]>(mediaFiles);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset to original order when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setReorderedFiles(mediaFiles);
      setHasChanges(false);
    }
  }, [isOpen, mediaFiles]);

  const handleReorder = (newOrder: MediaFile[]) => {
    setReorderedFiles(newOrder);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(reorderedFiles);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setReorderedFiles(mediaFiles);
    setHasChanges(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-green-500" />;
      case 'audio':
        return <Volume2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Image className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                File Arrangement
              </h2>
              <p className="text-gray-600 mt-1">
                Drag and drop to reorder your media files for the slideshow
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {reorderedFiles.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No files uploaded yet
                </h3>
                <p className="text-gray-500">
                  Upload some media files first to arrange their order
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Media Files ({reorderedFiles.length})
                    </h3>
                    <button
                      onClick={handleReset}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Order</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    This is the order your files will appear in the slideshow. Drag the handle (⋮⋮) to reorder.
                  </p>
                </div>

                <Reorder.Group
                  axis="y"
                  values={reorderedFiles}
                  onReorder={handleReorder}
                  className="space-y-3"
                >
                  {reorderedFiles.map((file, index) => (
                    <Reorder.Item
                      key={file.id}
                      value={file}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                      whileDrag={{ 
                        scale: 1.02, 
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        zIndex: 1000
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Order Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>

                        {/* File Preview */}
                        <div className="flex-shrink-0">
                          {file.type === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getFileIcon(file.type)}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getFileIcon(file.type)}
                            <h4 className="text-sm font-medium text-gray-800 truncate">
                              {file.name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="capitalize">{file.type}</span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>

                        {/* File Type Badge */}
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            file.type === 'image' ? 'bg-blue-100 text-blue-800' :
                            file.type === 'video' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <span className="text-amber-600 font-medium">● Unsaved changes</span>
              ) : (
                <span>No changes made</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                style={{ backgroundColor: hasChanges ? '#C0A172' : undefined }}
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};