"use client";

interface MediaFiles {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
}

interface MediaManagerProps {
  mediaFiles: MediaFiles;
}

export default function MediaManager({ mediaFiles }: MediaManagerProps) {
  console.log("MediaManager: Received mediaFiles:", mediaFiles);

  return (
    <div className="space-y-6">
      {["images", "videos", "pdfs"].map((type) => {
        const mediaArray = mediaFiles[type as keyof MediaFiles] || [];
        console.log(`MediaManager: Processing ${type}:`, mediaArray);

        return (
          <div key={type}>
            <h3 className="font-semibold capitalize">{type}</h3>
            {mediaArray.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {mediaArray.map((url, index) => {
                  console.log(
                    `MediaManager: Rendering ${type} item ${index}:`,
                    url
                  );
                  return (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden border p-2"
                    >
                      {type === "images" ? (
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) =>
                            console.error(`Failed to load image: ${url}`, e)
                          }
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span>
                            {type.toUpperCase()} {index + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No {type} uploaded.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
