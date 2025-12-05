import React, { useState, useEffect } from "react";
import { useSnippetStore } from "../store/useSnippetStore";
import {
  Folder,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
} from "lucide-react";

const FolderSection = () => {
  const {
    rootSnippets,
    fetchingRootSnippets,
    fetchRootSnippets,
    createNewFolder,
    createNewSnippet,
    isCreatingNewFile,
  } = useSnippetStore();

  useEffect(() => {
    fetchRootSnippets();
  }, []);

  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(""); // 'folder' or 'file'
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("javascript");
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleNewFolder = (snippet) => {
    setCurrentSnippet(snippet);
    setPopupType("folder");
    setFileName("");
    setShowPopup(true);
  };

  const handleNewRootFolder = () => {
    setCurrentSnippet({ id: "root" });
    setPopupType("folder");
    setFileName("");
    setShowPopup(true);
  };

  const handleNewSnippet = (snippet) => {
    setCurrentSnippet(snippet);
    setPopupType("snippet");
    setFileName("");
    setFileType("javascript");
    setShowPopup(true);
  };

  const handleSubmit = () => {
    if (!fileName.trim()) return;

    if (popupType === "folder") {
      createNewFolder(currentSnippet.id, fileName);
    } else {
      createNewSnippet(currentSnippet.id, fileName, fileType);
    }

    setShowPopup(false);
    setFileName("");
  };

  const handleCancel = () => {
    setShowPopup(false);
    setFileName("");
  };

  const handleShowEditor = (snippetId) => {
    console.log("Selected snippet ID:", snippetId);
    useSnippetStore.setState({ isSelectedSnippet: snippetId });
  };

  // Recursive component to render folder structure
  const FolderItem = ({ item, depth = 0 }) => {
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className="text-zinc-300 border-b-2 border-zinc-700 p-2 flex items-center justify-between group hover:bg-zinc-800"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <div className="flex items-center gap-2">
            {item.type === "folder" && hasChildren && (
              <button
                onClick={() => toggleFolder(item.id)}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            {item.type === "folder" && !hasChildren && (
              <div className="w-3.5" />
            )}
            {item.type === "folder" ? (
              <Folder size={16} className="text-blue-400" />
            ) : (
              <FileText size={16} className="text-green-400" />
            )}
            <span
              className={`${
                item.type === "snippet"
                  ? "cursor-pointer hover:text-blue-400"
                  : ""
              }`}
              onClick={
                item.type === "snippet"
                  ? () => handleShowEditor(item.id)
                  : undefined
              }
            >
              {item.name}
            </span>
          </div>
          {item.type === "folder" && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <FolderPlus
                size={17}
                className="text-gray-400 hover:text-blue-400 cursor-pointer"
                title="New Folder"
                onClick={() => handleNewFolder(item)}
              />
              <FilePlus
                size={17}
                className="text-gray-400 hover:text-green-400 cursor-pointer"
                title="New File"
                onClick={() => handleNewSnippet(item)}
              />
            </div>
          )}
        </div>
        {item.type === "folder" && isExpanded && hasChildren && (
          <div>
            {item.children.map((child) => (
              <FolderItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen w-60 border-gray-400 border-r-2 relative">
        {fetchingRootSnippets ? (
          <div>Loading...</div>
        ) : rootSnippets ? (
          rootSnippets.map((snippet) => (
            <FolderItem key={snippet.id} item={snippet} />
          ))
        ) : (
          <div>No Snippets Found</div>
        )}

        {/* FAB (Floating Action Button) */}
        <button
          onClick={handleNewRootFolder}
          className="fixed bottom-4 left-4 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
          title="Create New Folder"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg w-80">
            <h3 className="text-white text-lg mb-4">
              Create New {popupType === "folder" ? "Folder" : "Snippet"}
            </h3>

            <div className="mb-4">
              <label className="block text-zinc-300 mb-2">Name:</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full p-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-blue-400 outline-none"
                placeholder={`Enter ${popupType} name`}
                autoFocus
              />
            </div>

            {popupType === "snippet" && (
              <div className="mb-4">
                <label className="block text-zinc-300 mb-2">Type:</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full p-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-blue-400 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                disabled={!fileName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal for loading */}
      {isCreatingNewFile && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg w-80 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-white text-center">Creating file...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderSection;
