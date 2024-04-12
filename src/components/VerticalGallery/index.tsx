import type {
  Sample
} from "~/types";

type VerticalGalleryProps = {
  samples?: Sample[];
  maxWidth?: string | number;
};

const VerticalGallery = ({ samples = [], maxWidth="240px" } : VerticalGalleryProps) => {
  return (
    <div className="max-w-full w-full h-full max-h-[20rem] bg-zinc-900 px-4 rounded-lg min-h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-center mb-4">Samples: {samples.length}</h2>
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