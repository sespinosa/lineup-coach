'use client';
import { useState, useRef, useEffect } from 'react';
import useMediaStream from "~/hooks/useMediaStream";
import useSampleRecorder from '~/hooks/useSampleRecorder';

import type {
  Sample
} from "~/types";

interface MediaConstraints extends MediaStreamConstraints {
  cursor?: 'always' | 'motion' | 'never';
}

type VideoBoxProps = {
  getSamples?: (sample: Sample[]) => void;
};

const VideoBox = ({ getSamples } : VideoBoxProps) => {
  const [ streamParams ] = useState<MediaConstraints>({ video: true, audio: false, cursor: 'never' });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { mediaStream, error } = useMediaStream(streamParams, true);
  const { samples } = useSampleRecorder({ videoRef, freq: 500 });


  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!!getSamples && samples.length > 0) {
      getSamples(samples);
    }
  }, [samples, getSamples]);


  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="text-center">
      {
        !mediaStream
        ?
        <p>Loading...</p>
        :
        <video
          className='rounded-l-xl'
          ref={videoRef}
          autoPlay
        /> 
      }
    </div>
  );
};

export default VideoBox;