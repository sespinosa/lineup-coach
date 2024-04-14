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
  env?: string;
  getSamples?: (sample: Sample[]) => void;
  setStatus?: (status: boolean) => void;
  dev?: boolean;
};

const initialParams : MediaConstraints = { video: true, audio: false, cursor: 'never' };

const VideoBox = ({ env, getSamples, setStatus, dev } : VideoBoxProps) => {
  const [ streamParams ] = useState<MediaConstraints | undefined>(!dev ? initialParams : undefined);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { mediaStream, error } = useMediaStream(streamParams, true);
  const { samples } = useSampleRecorder({ videoRef, freq: 500 }, !!getSamples);


  useEffect(() => {
    if(!!setStatus) {
      if(dev) {
        setStatus(true);
      }
      else {
        setStatus(!!mediaStream);
      }
    }
  }, [mediaStream, setStatus, dev]);

  useEffect(() => {
    if (mediaStream && videoRef.current && !dev) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, dev]);

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
        !dev
        &&
        (
          !mediaStream
          ?
          <p>Loading...</p>
          :
          <video
            className='rounded-bl-lg'
            ref={videoRef}
            autoPlay
          />
        )
      }
      {
        dev
        &&
        <video
          className='rounded-bl-lg'
          ref={videoRef}
          src={env === "production" ? "https://download.blender.org/peach/bigbuckbunny_movies/big_buck_bunny_720p_h264.mov" : "/big_buck_bunny_720p_h264.mov"}
          autoPlay
          loop
          muted
        >
          If you see this text, it means you haven&apos;t downloaded the test video file, just execute the `download-test-video.sh` in the root folder of this project.
        </video>
      }
    </div>
  );
};

export default VideoBox;