import {
  type MutableRefObject
} from "react";

export type SampleRecorderProps = {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  freq: number;
};

export type SampleFileHeader = {
  filename?: string;
  description?: string;
  meta?: Record<string, unknown>;
};

export type SampleHeader = {
  timestamp?: number;
  width?: number;
  height?: number;
};

export type Sample = {
  timestamp: number;
  width: number;
  height: number;
  dataURL: string;
  byteLength: number;
};

export interface HeaderObject {
  filename?: string;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface SampleHeaderObject {
  timestamp?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  byteLength?: number;
  meta?: Record<string, unknown>;
}

export interface SampleObject {
  timestamp?: number;
  width?: number;
  height?: number;
  dataURL: string;
};
export interface LoadSamplesReturn {
  sampleCount: number;
  header: HeaderObject;
  samples?: SampleObject[];
}