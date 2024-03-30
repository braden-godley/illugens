import { fabric } from "fabric";
import {
  FabricJSCanvas,
  FabricJSEditor,
  useFabricJSEditor,
} from "fabricjs-react";
import React, { useEffect, useRef } from "react";

const CanvasEditor = ({
  setEditor,
  onRunJob,
}: {
  setEditor: (editor: FabricJSEditor | undefined) => void;
  onRunJob: () => void;
}) => {
  const { editor, onReady } = useFabricJSEditor();
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    editor?.canvas.setBackgroundColor("#fff", () => null);
    addText();
  }, [editor?.canvas]);

  useEffect(() => {
    setEditor(editor);
  }, [editor]);

  const addText = () => {
    editor?.addText("Text");
  };

  const addImage = () => {
    if (!uploadRef.current) return;
    uploadRef.current.click();
  };

  const onImageUploaded = () => {
    const input = uploadRef.current;
    if (!input) return;
    console.log("found input");
    const file = input?.files?.[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log("read file");
        const img = new Image();
        img.onload = function () {
          console.log("image loaded");
          const fabricImage = new fabric.Image(img)
          editor?.canvas.add(fabricImage);
        };
        if (e.target?.result) {
          console.log("e.target.result:", e.target.result)
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
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
        onClick={addImage}
        className="focus:shadow-outline mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Add Image
      </button>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageUploaded}
      />
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
