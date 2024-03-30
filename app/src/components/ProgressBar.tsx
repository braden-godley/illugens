function ProgressBar({ progress }: { progress: number }) {
  const progressBarWidth = Math.min(
    100,
    Math.max(0, Math.floor(progress * 100)),
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div
          className="h-2.5 rounded-full bg-blue-600"
          style={{
            width: `${progressBarWidth}%`,
            transition: "width 0.5s ease-in-out",
          }}
        ></div>
      </div>
      <p className="ml-2 text-lg font-medium text-gray-700">
        {progress !== 0 ? `${progressBarWidth}%` : "Not started"}
      </p>
    </div>
  );
}

export default ProgressBar;
