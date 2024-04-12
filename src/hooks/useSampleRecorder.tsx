import {
  useState,
  useEffect,
} from "react";

import type {
  SampleRecorderProps,
  Sample
} from "~/types";


const useSampleRecorder = ({ videoRef, freq = 500 } : SampleRecorderProps) => {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/png");
          setSamples(prev => [
            {
              timestamp: +new Date(), 
              width: canvas.width,
              height: canvas.height,
              dataURL
            },
            ...prev
          ]);
        }
      }
    }, freq);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef, freq]);

  return { samples };
};


export default useSampleRecorder;