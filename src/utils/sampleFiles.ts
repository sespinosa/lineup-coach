/**
 * DMC Format:
 *  This is a binary format that stores serialized sample data, each sample is composed by:
 *  - Sample index: 4 bytes (uint32)
 *  - Header length: 4 bytes (uint32)
 *  - Header: JSON string (parse please)
 *    - timestamp: number
 *    - width: number
 *    - height: number
  *   - mimeType: string (if any)
 *    - byteSize: number
 *    - meta: object (if any)
 * - Body (Sample binary data): determined by byteSize in the header (get from dataURL).
 * 
 * While this is being created, we need to build the general header
 * for the file (that includes each sample with their own header):
 * - Magic number: 1337 (4 bytes uint32)
 * - Sample count: number of samples (4 bytes uint32)
 * - Header byte length: 4 bytes (uint32)
 * - Header: JSON string (parse please)
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
 */
import type { Sample, SampleHeader } from "~/types";

export const saveSamples = (samples: Sample[], header?: SampleHeader) => {
  const encodedHeader = (new TextEncoder()).encode(JSON.stringify(header));
  const hat = new Uint32Array(3);
  hat[0] = 1337; // Magic Number.
  hat[1] = samples.length ?? 0; // Sample count.
  hat[2] = !!header ? encodedHeader.byteLength : 0; // Header byte length.

  const headerBuffer = new Uint8Array(hat.buffer, hat.byteLength + encodedHeader.byteLength);
  headerBuffer.set(encodedHeader, hat.byteLength);

  console.log(encodedHeader, hat, headerBuffer);

};

export const loadSamples = () => {
  return;
};

const def = {
  saveSamples,
  loadSamples
};

export default def;