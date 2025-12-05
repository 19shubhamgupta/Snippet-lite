import React from "react";
import CodeEditorSection from "../Components/CodeEditorSection";
import FolderSection from "../Components/FolderSection";

const CodeEditorPage = () => {
  return (
    <>
      <div className="min-h-screen flex pt-20 bg-gray-950">
        <FolderSection />
        <CodeEditorSection />
      </div>
    </>
  );
};

export default CodeEditorPage;
