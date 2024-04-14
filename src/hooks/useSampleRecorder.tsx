import {
  useState,
  useEffect,
} from "react";

import type {
  SampleRecorderProps,
  Sample
} from "~/types";


const useSampleRecorder = ({ videoRef, freq = 500 } : SampleRecorderProps, active = true ) => {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && active) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          // TODO: This part should be reversed, the dataURL is created only in the gallery (IF OPEN, if not hidden).
          const dataURL = canvas.toDataURL("image/png");
          // TODO: Here we should just pass the binary content and we save 1 step of conversion on saving (binary -> base64 -> binary, dummy stuff).
          const dataNoURLLength = dataURL.split(",")[1]?.length ?? 0;
          const byteLength = Math.floor(dataNoURLLength * 3 / 4); // (l*6)/8; Each base64 digit represents 6 bits of data
          setSamples(prev => [
            {
              timestamp: +new Date(), 
              width: canvas.width,
              height: canvas.height,
              dataURL,
              byteLength
            },
            ...prev
          ]);
        }
      }
    }, freq);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef, freq, active]);

  return { samples };
};


export default useSampleRecorder;