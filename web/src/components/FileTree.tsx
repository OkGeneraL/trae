import { Tree } from "react-arborist";

const initialData = [
  { id: "1", name: "file.py" },
  { id: "2", name: "folder", children: [{ id: "3", name: "file2.py" }] },
];

type FileTreeProps = {
  onSelect: (node: any) => void;
};

export default function FileTree({ onSelect }: FileTreeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
      <Tree initialData={initialData} onActivate={onSelect} />
    </div>
  );
}
