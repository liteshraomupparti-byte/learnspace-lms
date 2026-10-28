import React, { useState } from 'react';
import { Play, AlertCircle, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  lessonTitle: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, lessonTitle }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const cleanVideoId = videoId ? videoId.trim() : '';

  const toggleFullscreen = () => {
    const el = document.getElementById('video-player-container');
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      id="video-player-container"
      className="relative w-full aspect-video bg-[#050505] rounded-2xl overflow-hidden shadow-md flex items-center justify-center group"
    >
      {cleanVideoId && !hasError ? (
        <iframe
          key={cleanVideoId}
          src={`https://www.youtube-nocookie.com/embed/${cleanVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
          title={lessonTitle}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 text-white max-w-lg">
          <div className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center mb-4 backdrop-blur-xs">
            {hasError ? (
              <AlertCircle className="w-7 h-7 text-amber-400" />
            ) : (
              <Play className="w-6 h-6 fill-current text-white/90 ml-1" />
            )}
          </div>

          <h3 className="text-base font-semibold text-white/95 mb-1.5">
            {hasError ? 'Video Playback Unavailable' : 'No Video Connected'}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-3">
            {hasError
              ? `The YouTube video ID "${cleanVideoId}" could not be embedded. Please verify the ID or privacy settings in the Admin Dashboard.`
              : `This lesson ("${lessonTitle}") does not have a verified video ID configured yet. You can read the lesson notes on the right.`}
          </p>

          <span className="text-[11px] font-mono text-neutral-500 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800">
            {cleanVideoId ? `ID: ${cleanVideoId}` : 'Awaiting Video Assignment'}
          </span>
        </div>
      )}

      {cleanVideoId && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 z-10"
          title="Toggle Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
