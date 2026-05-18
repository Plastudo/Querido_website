interface Props {
  progress: number; // 0-100
  steps?: number;   // number of segments to show (default 16)
}

export default function ProgressBar({ progress, steps = 16 }: Props) {
  const completed = Math.round((progress / 100) * steps);

  return (
    <div className="progress-bar">
      {Array.from({ length: steps }, (_, i) => (
        <div
          key={i}
          className={`progress-step${i < completed ? ' is-complete' : i === completed && progress > 0 ? ' is-active' : ''}`}
        />
      ))}
    </div>
  );
}
