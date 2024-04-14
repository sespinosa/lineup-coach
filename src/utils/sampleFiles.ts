/**
 * TODO:
 * - This full functionality should be moved to service workers.
 * - We need to add compression to the file before saving ('deflate' using `pako`).
 * - The compression should be moved to a service worker after tested in main thread.
 * - Service workers should communicate events via event-blocking based `Atomics` (via `SharedArrayBuffer`).
 * Info here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics
 * 
 * -----------------------------------------------------------------------------------------------------------
 * 
 * DMC Format:
 *  This is a binary format that stores serialized sample data, each sample is composed by:
 *  - Header length: 4 bytes (uint32)
 *  - Header: JSON string (parse please)
 *    - timestamp: number
 *    - width: number
 *    - height: number
 *    - mimeType: string (if any)
 *    - byteLength: number
 *    - meta: object (if any)
 * - Body (Sample binary data): determined by byteLength in the header (get from dataURL).
 * 
 * While this is being created, we need to build the general header
 * for the file (that includes each sample with their own header):
 *  - Magic number: 1337 (4 bytes uint32)
 *  - Sample count: number of samples (4 bytes uint32)
 *  - Header byte length: 4 bytes (uint32)
 *  - Header: JSON string (parse please)
 *  - filename: string
 *  - description: string
 *  - meta: object (if any)
 * 
 * After both header and body (that are the samples with header concatenated) are created, we save the file
 * concatenating them header first and then body.
 * 
 * Nice to have: Compress everything with zlib before saving
 * (maybe only compress after the magic number and the sample count, maybe not)
 * but has to be a lossless streamable compression format so you can get the metadata just reading few bytes.
 * 
 */

import type {
  Sample,
  SampleFileHeader,
  HeaderObject,
  SampleHeaderObject,
  LoadSamplesReturn,
  SampleObject
} from "~/types";

const dataUrlToBuffer = (b64Data: string) => {
  const byteString = atob(b64Data);
  const buffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i);
  }
  return buffer;
}



/**
 * Needs to be chunked because Javascript is unable to deal with so many arguments in a function.
 * (And that's because we are ...spreading the whole sample buffer as arguments of String.fromCharCode)
 */
const bufferToDataUrl = (buffer: Uint8Array, mimeType: string) => {
  try {
    const CHUNK_SIZE = 8192;
    const chunks: string[] = [];
    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      const chunk = buffer.subarray(i, i + CHUNK_SIZE);
      chunks.push(String.fromCharCode(...chunk));
    }
    const b64Data = btoa(chunks.join(''));
    return `data:${mimeType};base64,${b64Data}`;
  } catch (error) {
    console.error('Error converting buffer to data URL:', error);
    return '';
  }
}

export const generateHeader = (samples: Sample[], header?: SampleFileHeader) => {
  const encodedHeader = (new TextEncoder()).encode(JSON.stringify(header));

  const headerBuffer = new Uint8Array((3 * Uint32Array.BYTES_PER_ELEMENT) + encodedHeader.byteLength);
  const headerView = new DataView(headerBuffer.buffer);

  headerView.setUint32(0, 1337, true);
  headerView.setUint32(Uint32Array.BYTES_PER_ELEMENT, samples.length ?? 0, true);
  headerView.setUint32(2 * Uint32Array.BYTES_PER_ELEMENT, !!header ? encodedHeader.byteLength : 0, true);
  headerBuffer.set(encodedHeader, 3 * Uint32Array.BYTES_PER_ELEMENT);
    
  return headerBuffer;

};

export const packageSample = (sample: Sample) => {
  const mimeType = sample.dataURL.substring(sample.dataURL.indexOf(":") + 1, sample.dataURL.indexOf(";"));
  const b64 = sample.dataURL.substring(sample.dataURL.indexOf(",") + 1);
  const bodyData = dataUrlToBuffer(b64);

  const header = {
    timestamp: sample.timestamp,
    width: sample.width,
    height: sample.height,
    mimeType,
    byteLength: bodyData.byteLength
  };

  const encodedHeader = (new TextEncoder()).encode(JSON.stringify(header));

  const sampleBuffer = new Uint8Array(Uint32Array.BYTES_PER_ELEMENT + encodedHeader.byteLength + bodyData.byteLength);

  (new DataView(sampleBuffer.buffer)).setUint32(0, encodedHeader.byteLength, true);

  sampleBuffer.set(encodedHeader, Uint32Array.BYTES_PER_ELEMENT);
  sampleBuffer.set(bodyData, Uint32Array.BYTES_PER_ELEMENT + encodedHeader.byteLength);

  return sampleBuffer;
};

export const getFile = (samples: Sample[], header?: SampleFileHeader) => {
  const headerBuffer = generateHeader(samples, header);
  const samplesBuffers = samples.map(packageSample);

  const samplesBuffer = new Uint8Array(samplesBuffers.reduce((acc, curr) => acc + curr.byteLength, 0));
  let offset = 0;
  samplesBuffers.forEach((sampleBuffer) => {
    samplesBuffer.set(sampleBuffer, offset);
    offset += sampleBuffer.byteLength;
  });

  const fileBuffer = new Uint8Array(headerBuffer.byteLength + samplesBuffer.byteLength);
  fileBuffer.set(headerBuffer, 0);
  fileBuffer.set(samplesBuffer, headerBuffer.byteLength);

  return fileBuffer;
};

export const saveSamples = (samples: Sample[], header?: SampleFileHeader) => {
  const buff = getFile(samples, header);
  const blob = new Blob([buff], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `samples-${+new Date()}.dmc`;
  link.click();
};


export const loadSamples = (
  samplesBuffer: ArrayBuffer,
  setSamples?: (sample: SampleObject) => void
): LoadSamplesReturn | undefined => {

  try {
    const decoder = new TextDecoder();
    const samplesView = new DataView(samplesBuffer);
    const magicNumber = samplesView.getUint32(0, true);

    if(magicNumber !== 1337) {
      console.error("Incorrect Magic Number");
      return;
    }

    const sampleCount = samplesView.getUint32(Uint32Array.BYTES_PER_ELEMENT, true);
    const headerLength = samplesView.getUint32(2 * Uint32Array.BYTES_PER_ELEMENT, true);
    const headerBuffer = new Uint8Array(samplesBuffer, 3 * Uint32Array.BYTES_PER_ELEMENT, headerLength);

    const header = JSON.parse(decoder.decode(headerBuffer)) as HeaderObject;
    
    const samples = [];

    let offset = (3 * Uint32Array.BYTES_PER_ELEMENT) + headerLength;
  
    while(offset < samplesBuffer.byteLength) {
      if(offset + Uint32Array.BYTES_PER_ELEMENT >= samplesBuffer.byteLength) {
        break;
      }

      const sampleLength = samplesView.getUint32(offset, true);
      const sampleHeaderBuff = new Uint8Array(samplesBuffer, offset + Uint32Array.BYTES_PER_ELEMENT, sampleLength);
      const sampleHeader = JSON.parse(decoder.decode(sampleHeaderBuff)) as SampleHeaderObject;
      const sampleBodyLength = sampleHeader.byteLength ?? 0;
      offset = offset + Uint32Array.BYTES_PER_ELEMENT + sampleLength;
      const sampleBodyBuff = new Uint8Array(samplesBuffer, offset, sampleBodyLength);

      const b64 = bufferToDataUrl(sampleBodyBuff, sampleHeader.mimeType ?? "image/png");

      if(setSamples) {
        setSamples({
            timestamp: sampleHeader.timestamp,
            width: sampleHeader.width,
            height: sampleHeader.height,
            dataURL: b64
          });
      }
      else {
        samples.push({
          timestamp: sampleHeader.timestamp,
          width: sampleHeader.width,
          height: sampleHeader.height,
          dataURL: b64
        });
      }

      offset = offset + sampleBodyLength;
    }
    if(setSamples) {
      return { sampleCount, header };
    }

    return { sampleCount, header, samples };
  }
  catch(e) {
    console.error(e);
    return;
  }
};

const def = {
  generateHeader,
  packageSample,
  getFile,
  saveSamples,
  loadSamples,
};

export default def;