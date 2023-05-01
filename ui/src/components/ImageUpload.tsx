import React, { useState } from "react";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (previewUrl: string | null) => void;
}

function ImageUpload({
  onUpload,
  file,
  setFile,
  previewUrl,
  setPreviewUrl,
}: ImageUploadProps): JSX.Element {
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile != null) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result?.toString() ?? null);
        localStorage.setItem("uploadedImage", reader.result?.toString() ?? "");
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="">
      <div className="mb-4">
        <label
          htmlFor="fileInput"
          className="block text-sm font-medium text-gray-700"
        >
          Choose a file
        </label>
        <input
          id="fileInput"
          name="fileInput"
          type="file"
          accept=".jpg,.jpeg,.png"
          className="mt-1 py-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm"
          onChange={handleFileChange}
        />
      </div>
      {previewUrl != null && (
        <div className="mb-4">
          <img src={previewUrl} alt="Preview" className="h-48 w-48" />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
