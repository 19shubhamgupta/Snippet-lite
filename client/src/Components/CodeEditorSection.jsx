import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Save } from "lucide-react";
import { useSnippetStore } from "../store/useSnippetStore";

const CodeEditorSection = () => {
  const {
    isSelectedSnippet,
    selectedSnippetCode,
    selectedSnippetLanguage,
    getSnippet,
    getOutput,
    saveSnippet,
  } = useSnippetStore();
  const [code, setCode] = useState(
    '// Welcome to the code editor\nconsole.log("Hello, World!");'
  );
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [exeBtnEnabled, setExeBtnEnabled] = useState(true);
  const [saveBtnEnabled, setSaveBtnEnabled] = useState(true);

  useEffect(() => {
    if (isSelectedSnippet != null) getSnippet(isSelectedSnippet);
  }, [isSelectedSnippet]);

  useEffect(() => {
    setCode(selectedSnippetCode);
    setLanguage(selectedSnippetLanguage);
  }, [selectedSnippetCode, selectedSnippetLanguage]);

  const handleExecute = async () => {
    setExeBtnEnabled(false);
    let result = await getOutput(language, code);
    setOutput(result.output || result.error);
    setExeBtnEnabled(true);
  };

  const handleSave = async () => {
    setSaveBtnEnabled(false);
    await saveSnippet(language, code);
    setSaveBtnEnabled(true);
  };

  return (
    <>
      {isSelectedSnippet !== null && (
        <div className="flex-1 min-h-screen flex flex-col bg-zinc-900">
          {/* Language Selector */}
          <div className="bg-zinc-800 p-3 border-b border-zinc-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-700 text-white px-3 py-1 rounded border border-zinc-600 focus:border-blue-400 outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="60vh"
              language={language}
              value={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-zinc-800 p-4 border-t border-zinc-700 flex gap-3">
            <button
              onClick={handleExecute}
              disabled={!exeBtnEnabled}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                exeBtnEnabled
                  ? "bg-green-600 hover:bg-green-500 text-white cursor-pointer"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {!exeBtnEnabled ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play size={16} />
              )}
              {exeBtnEnabled ? "Execute" : "Executing..."}
            </button>
            <button
              onClick={handleSave}
              disabled={!saveBtnEnabled}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                saveBtnEnabled
                  ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {!saveBtnEnabled ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              {saveBtnEnabled ? "Save" : "Saving..."}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-zinc-800 border-t border-zinc-700">
            <div className="p-3 border-b border-zinc-600">
              <h3 className="text-zinc-300 font-medium">Output</h3>
            </div>
            <div className="p-4 h-32 overflow-auto">
              <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono">
                {output || "No output yet. Click Execute to run your code."}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CodeEditorSection;
