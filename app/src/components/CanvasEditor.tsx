import { FabricJSCanvas, FabricJSEditor, useFabricJSEditor } from "fabricjs-react";
import React, { useEffect } from "react";

const CanvasEditor = ({
  setEditor,
  onRunJob
}: {
  setEditor: (editor: FabricJSEditor|undefined) => void
  onRunJob: () => void;
}) => {
  const { editor, onReady } = useFabricJSEditor();

  useEffect(() => {
    editor?.canvas.setBackgroundColor("#fff", () => null);
    addText();
  }, [editor?.canvas]);

  useEffect(() => {
    setEditor(editor);
  }, [editor])

  const addText = () => {
    editor?.addText("Text");
  };

  return (
    <div className="my-4">
      <FabricJSCanvas
        className="mx-auto aspect-square w-full border border-black"
        onReady={onReady}
      />
      <button
        onClick={addText}
        className="focus:shadow-outline mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Add Text
      </button>
      <button
        onClick={onRunJob}
        className="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none"
      >
        Submit
      </button>
    </div>
  );
};

export default CanvasEditor;
