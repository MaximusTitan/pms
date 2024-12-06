// app/admin/programs/[programid]/ProgramViewClient.tsx
"use client"; // Make sure this is marked as a Client Component

import React from "react";

interface ProgramViewClientProps {
  affiliateId: string;
}

const ProgramViewClient: React.FC<ProgramViewClientProps> = ({
  affiliateId,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(
      `https://www.ischoolofai.com/the-genai-master-registration?sourceId=${affiliateId}`
    );
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        readOnly
        value={`https://www.ischoolofai.com/the-genai-master-registration?sourceId=${affiliateId}`}
        className="flex-1 mr-2 p-2 border rounded"
      />
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Copy
      </button>
    </div>
  );
};

export default ProgramViewClient;
