import { fabric } from "fabric";
import {
  FabricJSCanvas,
  FabricJSEditor,
  useFabricJSEditor,
} from "fabricjs-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";

const CanvasEditor = ({
  setEditor,
  onRunJob,
}: {
  setEditor: (editor: FabricJSEditor | undefined) => void;
  onRunJob: () => void;
}) => {
  const { editor, onReady } = useFabricJSEditor();
  const uploadRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    editor?.canvas.setBackgroundColor("#fff", () => null);
    addText();
  }, [editor?.canvas]);

  useEffect(() => {
    setEditor(editor);

    const handleKeyDown = (e: KeyboardEvent) => {
      // TODO: Make it ignore this if you're currently editing a text item
      if (document.activeElement !== document.body) return;
      if (
        e.key === "Delete" ||
        e.key === "Backspace" ||
        (e.ctrlKey && e.key === "x")
      ) {
        e.preventDefault();
        const selectedItems = editor?.canvas.getActiveObjects();
        if (selectedItems === undefined) return;
        for (const selectedItem of selectedItems) {
          editor?.canvas.remove(selectedItem);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  const addText = () => {
    const text = new fabric.IText("Text", {
      fontFamily: "sans-serif",
      scaleX: 3,
      scaleY: 3,
    });
    editor?.canvas.add(text);

    editor?.canvas.setActiveObject(text);
  };

  const addImage = () => {
    if (!uploadRef.current) return;
    uploadRef.current.click();
  };

  const onImageUploaded = () => {
    const input = uploadRef.current;
    if (!input) return;
    const file = input?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          const fabricImage = new fabric.Image(img);
          const baseWidth = 500;
          const width = fabricImage.width as number;
          fabricImage.scaleX = baseWidth / width;
          fabricImage.scaleY = baseWidth / width;
          editor?.canvas.add(fabricImage);
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="my-4 relative">
      <div className={`absolute z-10 top-0 bottom-0 left-0 right-0 bg-[rgb(0,0,0,.5)] flex items-center justify-center ${session === null ? "" : "hidden"}`}>
        <p className="text-white text-2xl">Please sign in to generate images</p>
      </div>
      <FabricJSCanvas
        className="mx-auto aspect-square w-full border border-black"
        onReady={onReady}
      />
      <div className="mt-2 flex gap-2">
        <Button
          variant="outline"
          onClick={addText}
        >
          Add Text
        </Button>
        <Button
          variant="outline"
          onClick={addImage}
        >
          Add Image
        </Button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageUploaded}
        />
        <Button
          onClick={onRunJob}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CanvasEditor;
