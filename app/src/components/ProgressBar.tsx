function ProgressBar({ progress }: { progress: number }) {
  const progressBarWidth = Math.min(100, Math.max(0, Math.floor(progress * 100)));

  return (
    <div className="flex flex-col gap-4 h-full items-center justify-center p-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progressBarWidth}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>
      <p className="text-lg font-medium text-gray-700 ml-2">
        {progress !== 0 ? `${progressBarWidth}%` : "Not started"}
      </p>
    </div>
  );
}

export default ProgressBar;
