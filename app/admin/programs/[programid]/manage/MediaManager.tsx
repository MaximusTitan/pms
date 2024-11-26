"use client";

import React, { useState } from "react";

interface MediaFiles {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
}

interface MediaManagerProps {
  mediaFiles: MediaFiles;
}

const MediaManager: React.FC<MediaManagerProps> = ({ mediaFiles }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleUpload = () => {
    // Upload logic here
    console.log("Upload initiated");
  };

  return (
    <div>
      <button
        onClick={handleUpload}
        className="mb-4 p-2 bg-rose-500 text-white rounded"
      >
        Upload Media
      </button>
      {["images", "videos", "pdfs"].map((type) => {
        const mediaArray = mediaFiles[type as keyof MediaFiles] || [];

        return (
          <div key={type} className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold capitalize text-lg mb-4">{type}</h3>
            {mediaArray.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mediaArray.map((url, index) => {
                  return (
                    <div
                      key={index}
                      className="group relative rounded-lg overflow-hidden border hover:border-rose-500 transition-all duration-200"
                    >
                      <div className="aspect-video">
                        {type === "images" ? (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                            onError={(e) =>
                              console.error(`Failed to load image: ${url}`, e)
                            }
                          />
                        ) : type === "videos" ? (
                          <video
                            src={url}
                            className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                            onError={(e) =>
                              console.error(`Failed to load video: ${url}`, e)
                            }
                            controls
                          />
                        ) : (
                          <div className="h-full">
                            <object
                              data={url}
                              className="w-full h-full bg-gray-50 flex flex-col items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <svg
                                className="w-12 h-12 text-gray-400 mb-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M4 18h12V6h-4V2H4v16zm0-18h8l6 6v14H2V0h2zm9 0v5h5L13 0z" />
                              </svg>
                              <span className="text-sm text-gray-600">
                                PDF {index + 1}
                              </span>
                            </object>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {type === "pdfs"
                          ? "Click to open"
                          : `${type.slice(0, -1)} ${index + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No {type} uploaded.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MediaManager;
