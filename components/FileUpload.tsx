
import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileChange: (file: File) => void;
  imagePreview: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, imagePreview }) => {
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  }, [onFileChange]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const onContainerClick = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <div
      onClick={onContainerClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="w-full cursor-pointer"
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        accept="image/*"
        onChange={onInputChange}
      />
      <div className="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700">
        {imagePreview ? (
          <div className="relative group">
            <img src={imagePreview} alt="Waste preview" className="mx-auto max-h-80 rounded-lg shadow-md" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <p className="text-white text-lg font-semibold">Click or drop to change image</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-xl font-semibold">Drag & drop an image here</p>
            <p>or <span className="text-emerald-500 font-medium">click to browse</span></p>
            <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
