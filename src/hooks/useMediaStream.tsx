import { useState, useEffect, useRef } from 'react';

interface MediaConstraints extends MediaStreamConstraints {
  cursor?: 'always' | 'motion' | 'never';
}

const useMediaStream = ( constraints: MediaConstraints | undefined, shareScreen = false ) => {
  const busyRef = useRef(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        if(constraints) {
          let stream: MediaStream;
          if (shareScreen) {
            stream = await (navigator.mediaDevices).getDisplayMedia(constraints);
          } else {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          }
          setMediaStream(stream);
          busyRef.current = false;
        }
      } catch (err) {
        setError(err as Error);
        busyRef.current = false;
      }
    };
    if(!mediaStream && !busyRef.current && constraints) {
      busyRef.current = true;
      void getUserMedia();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [constraints, shareScreen, mediaStream]);

  return { mediaStream, error };
};

export default useMediaStream;