import { useState } from 'react';
import Head from "next/head";
import VideoBox from "~/components/VideoBox";
import VerticalGallery from '~/components/VerticalGallery';

import type {
  Sample
} from "~/types";

const Home = () => {
  const [ samples, setSamples ] = useState<Sample[]>([]);
  return (
    <>
      <Head>
        <title>Lineup Coach POC</title>
        <meta name="description" content="Lineup Coach POC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center items-center min-h-screen w-full bg-zinc-900 text-white">
        <div
          className="flex shadow-2xl rounded-lg p2 bg-zinc-800"
          style={{ visibility: samples.length > 0 ? 'visible' : 'hidden'}}
        >
          <div className="max-w-[50vw] w-[50vw] border-r-4 border-solid border-zinc-900">
            <VideoBox getSamples={setSamples} />
          </div>
          <div className='p-3 w-[320px] max-w-[320px] text-center'>
            <VerticalGallery
                samples={samples}
                maxWidth={"320px"}
              />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;