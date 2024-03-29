import React, { useEffect, useRef } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

const FabricCanvas = () => {
  const { editor, onReady } = useFabricJSEditor();
  const addText = () => {
    editor?.addText("Test");
  };

  const toImage = () => {
    const url = editor?.canvas.toDataURL({
      format: "png",
    });
    const data = url?.split(",")[1];

    return data;
  };

  useEffect(() => {
    editor?.canvas.setBackgroundColor("#fff", () => null);
  }, [editor?.canvas]);

  return (
    <div>
      <button onClick={addText}>Add text</button>
      <button onClick={toImage}>To image</button>
      <div>
        <FabricJSCanvas
          className="mx-auto h-[800px] w-[800px] bg-white border border-black"
          onReady={onReady}
        />
      </div>
    </div>
  );
};

export default FabricCanvas;
