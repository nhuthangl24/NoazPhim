'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function ArtPlayerComponent({ url, title, onTimeUpdate, initialTime = 0 }) {
  const artRef = useRef(null);
  const playerRef = useRef(null);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy(false);
      playerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!url || !artRef.current) return;

    let isMounted = true;

    const initPlayer = async () => {
      const [{ default: Artplayer }, { default: Hls }] = await Promise.all([
        import('artplayer'),
        import('hls.js'),
      ]);

      if (!isMounted || !artRef.current) return;

      destroyPlayer();

      const player = new Artplayer({
        container: artRef.current,
        url: url,
        type: 'm3u8',
        autoplay: true,
        autoSize: false,
        autoMini: false,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        setting: true,
        hotkey: true,
        pip: true,
        mutex: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        playsInline: true,
        theme: '#e50914',
        lang: 'en',
        moreVideoAttr: {
          crossOrigin: 'anonymous',
        },
        customType: {
          m3u8: function (video, url) {
            if (Hls.isSupported()) {
              const hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
              });
              hls.loadSource(url);
              hls.attachMedia(video);
              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      hls.recoverMediaError();
                      break;
                    default:
                      hls.destroy();
                      break;
                  }
                }
              });
              player.on('destroy', () => hls.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = url;
            } else {
              player.notice.show = 'Trình duyệt không hỗ trợ phát HLS';
            }
          },
        },
      });

      if (initialTime > 0) {
        player.once('ready', () => {
          player.currentTime = initialTime;
        });
      }

      if (onTimeUpdate) {
        let lastSave = 0;
        player.on('video:timeupdate', () => {
          const now = Date.now();
          if (now - lastSave > 5000) {
            lastSave = now;
            onTimeUpdate(player.currentTime);
          }
        });
      }

      playerRef.current = player;
    };

    initPlayer();

    return () => {
      isMounted = false;
      destroyPlayer();
    };
  }, [url]);

  return (
    <div className="artplayer-wrapper">
      <div ref={artRef} className="artplayer-container"></div>
      {title && <div className="player-title">{title}</div>}
    </div>
  );
}
