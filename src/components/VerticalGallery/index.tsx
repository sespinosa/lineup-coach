import { useState, useEffect } from "react";
import prettyBytes from "pretty-bytes";

import type {
  Sample
} from "~/types";

type VerticalGalleryProps = {
  samples?: Sample[];
  maxWidth?: string | number;
};

/**
 * TODO:
 * This should do the base64 conversion instead of extracting in dataURL (que are converting to binary again before saving).
 * The amount of space that is being wasted right now in memory is considerable, also needs to compress in 'deflate' before downloading.
 * 
 */

const VerticalGallery = ({ samples = [], maxWidth="240px" } : VerticalGalleryProps) => {
  console.log(samples);
  const [ byteSize, setByteSize ] = useState<number>(0);

  useEffect(() => {
    setByteSize(samples.reduce((acc, s) => acc + s.byteLength, 0));
  }, [samples]);

  return (
    <div className="max-w-full w-full h-full max-h-[20rem] bg-zinc-900 px-4 rounded-lg min-h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-center mb-4">Samples: {samples.length} {samples.length > 0 ? `(${prettyBytes(byteSize)})` : ''}</h2>
      {
        samples.slice(0, 10).map((s, i) => (
          <div key={samples.length - i} className="flex flex-col w-full bg-zinc-900 rounded-lg mb-4">
            <img
              alt={`${s.timestamp}`}
              src={s.dataURL}
              className={`w-full rounded-lg h-auto`}
              style={{ maxWidth }}
            />
          </div>
        
        ))
      }
    </div>
  );
};

export default VerticalGallery;