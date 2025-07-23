import MonacoEditor from "react-monaco-editor";

type EditorProps = {
  code: string;
  setCode: (code: string) => void;
  onSave: () => void;
};

export default function Editor({ code, setCode, onSave }: EditorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
      <MonacoEditor
        height="100%"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={setCode}
      />
      <button
        onClick={onSave}
        className="absolute top-2 right-2 px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Save
      </button>
    </div>
  );
}
