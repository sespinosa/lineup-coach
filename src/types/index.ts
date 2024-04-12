import {
  type MutableRefObject
} from "react";

export type SampleRecorderProps = {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  freq: number;
};

export type SampleHeader = {
  timestamp: number;
  width: number;
  height: number;
};

export type Sample = {
  timestamp: number;
  width: number;
  height: number;
  dataURL: string;
};