import { useState } from "react";
import { galaxyAudio } from "../audio/galaxyAudio";

export default function AudioControl() {
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    setMuted(galaxyAudio.toggleMute());
  };

  return (
    <div className="audio-control">
      <button
        type="button"
        className={`audio-toggle on${muted ? " muted" : ""}`}
        onClick={toggle}
        aria-label={muted ? "Turn audio on" : "Turn audio off"}
        title={muted ? "Turn audio on" : "Turn audio off"}
      >
        <span className="audio-toggle-icon">{muted ? "♪" : "◉"}</span>
        <span className="audio-toggle-label">{muted ? "AUDIO OFF" : "AUDIO ON"}</span>
      </button>
    </div>
  );
}
