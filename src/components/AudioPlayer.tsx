import {
  useReducer,
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
} from "react";
import styles from "./AudioPlayer.module.css";
import { cn } from "../lib/utils";

function formatTimer(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function AudioPlayer({ src }: { src: string }) {
  const seekBarRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playing, togglePlaying] = useReducer((state) => !state, false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(20);
  const [muted, toggleMuted] = useReducer((state) => !state, false);

  const handlePlayPause = () => {
    if (!audioRef.current) {
      console.error("audioRef not loaded");
      return;
    }

    if (!playing) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }

    togglePlaying();
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedTime = parseFloat(e.currentTarget.value);
    setProgress(updatedTime);

    if (audioRef.current) {
      audioRef.current.currentTime = updatedTime;
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedVolume = parseFloat(e.currentTarget.value);
    setVolume(updatedVolume);

    if (audioRef.current) {
      audioRef.current.volume = updatedVolume / 100;
    }
  };

  // We need to sync initial values with audio player. :(
  useEffect(() => {
    if (!audioRef.current) return;

    if (audioRef.current.readyState ?? 0 > 0) {
      setDuration(audioRef.current.duration);
    }

    audioRef.current.volume = volume / 100;
  }, [audioRef.current]);

  return (
    <div className="flex items-center gap-6 rounded-md bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        muted={muted}
        preload="metadata"
      />
      <button onClick={handlePlayPause}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          {playing ? (
            <path
              fillRule="evenodd"
              d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
              clipRule="evenodd"
            />
          )}
        </svg>
      </button>
      <span className="font-['Geist_Mono']">{formatTimer(progress)}</span>
      <input
        ref={seekBarRef}
        value={progress}
        onChange={handleProgressChange}
        className={cn(styles.slider, "flex-1")}
        style={{
          ["--seek-before-width" as string]: (progress / duration) * 100 + "%",
        }}
        type="range"
        step="0.001"
        max={duration}
      />
      <span className="font-['Geist_Mono']">{formatTimer(duration)}</span>
      <input
        ref={seekBarRef}
        value={volume}
        onChange={handleVolumeChange}
        className={cn(styles.slider, "w-12")}
        style={{
          ["--seek-before-width" as string]: volume + "%",
        }}
        type="range"
        step="0.01"
        max="100"
      />
      <button onClick={toggleMuted}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-5"
        >
          {muted ? (
            <>
              <path d="M10.047 3.062a.75.75 0 0 1 .453.688v12.5a.75.75 0 0 1-1.264.546L5.203 13H2.667a.75.75 0 0 1-.7-.48A6.985 6.985 0 0 1 1.5 10c0-.887.165-1.737.468-2.52a.75.75 0 0 1 .7-.48h2.535l4.033-3.796a.75.75 0 0 1 .811-.142ZM13.78 7.22a.75.75 0 1 0-1.06 1.06L14.44 10l-1.72 1.72a.75.75 0 0 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L16.56 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L15.5 8.94l-1.72-1.72Z" />
            </>
          ) : (
            <>
              <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 1.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796a.75.75 0 0 0 1.264-.546V3.75ZM16.45 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
              <path d="M14.329 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
