const formatDuration = (durationInSec) => {
  if (!durationInSec) return "0:00";
  const minutes = Math.floor(durationInSec / 60);
  const seconds = Math.floor(durationInSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export { formatDuration };
