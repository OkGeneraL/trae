"use client";

import { useState } from "react";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import FileTree from "../../components/FileTree";
import Editor from "../../components/Editor";
import Terminal from "../../components/Terminal";

export default function Workspace() {
  const [code, setCode] = useState("// Select a file to start editing");
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const handleFileSelect = async (node: any) => {
    if (node.isLeaf) {
      setActiveFile(node.data.id);
      try {
        const response = await fetch(
          `/api/workspace?path=${node.data.name}`
        );
        const data = await response.json();
        setCode(data.content);
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;

    try {
      await fetch("/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: activeFile, content: code }),
      });
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Error saving file.");
    }
  };

  return (
    <WorkspaceLayout>
      <FileTree onSelect={handleFileSelect} />
      <div className="md:col-span-3 grid grid-rows-2 gap-4">
        <Editor code={code} setCode={setCode} onSave={handleSaveFile} />
        <Terminal />
      </div>
    </WorkspaceLayout>
  );
}
