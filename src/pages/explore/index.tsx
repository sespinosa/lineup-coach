import { useState } from "react";
import Head from "next/head";
import { loadSamples } from "~/utils/sampleFiles";
import { Button } from "~/components/ui/button";

import type {
  HeaderObject,
  SampleObject,
} from "~/types";

const selectFile = (cb: (data: string | ArrayBuffer | null) => void) => {

  const handleFile = () => {
    if(fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
    
        reader.onload = (event) => {
          if(event.target) {
            const fileContent = event.target.result;
            cb(fileContent)
          }
        };
    
        if (file) {
          reader.readAsArrayBuffer(file);
        }
    }
  };

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.dmc';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', handleFile);

  fileInput.click();
};

interface MetaObject {
  sampleCount: number;
  header: HeaderObject;
};

const ExplorePage = () => {
  const [ meta, setMeta ] = useState<MetaObject | undefined>();
  const [ samples, setSamples ] = useState<SampleObject[]>([]);

  const setSampleFromOutside = (s: SampleObject) => {
    setSamples((prev: SampleObject[]) => [...prev, s] as SampleObject[]);
  }

  const _selectFile = () => {
    selectFile(data => {
      const meta = loadSamples(data as ArrayBuffer, setSampleFromOutside);
      setMeta(meta);
    });
  };

  console.log(meta);

  return (
    <>
      <Head>
        <title>Lineup Coach POC</title>
        <meta name="description" content="Lineup Coach POC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center items-center min-h-screen w-full bg-zinc-900 text-white">
        <div
          className="flex flex-col shadow-2xl rounded-lg p-4 bg-zinc-800 transition-all"
        >
          <div className="flex items-center justify-evenly">
            <Button
                variant="secondary"
                onClick={_selectFile}
              >
                Open Sample Set
              </Button>
            {
              !!meta
              &&
              <div className="bg-slate-950 rounded-lg py-4 px-8 mb-3">
                <pre className="pre">
                  {JSON.stringify(meta, null, 2)}
                </pre>
              </div>
            }
          </div>
          {
            samples.length > 0
            &&
            <div className="grid grid-cols-4 gap-4 mt-4">
            {
              samples.map((sample, i) => (
                <div key={i} className="bg-gray-200 p-4">
                  <img
                    src={sample.dataURL}
                    alt={`Sample ${i}`}
                    className="w-full h-auto"
                  />
                </div>
              ))
            }
            </div>
          }
        </div>
      </main>
    </>
  );
};

export default ExplorePage;