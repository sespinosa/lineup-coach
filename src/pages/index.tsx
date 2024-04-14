import fs from 'fs';
import { useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import VideoBox from "~/components/VideoBox";
import VerticalGallery from '~/components/VerticalGallery';
import { saveSamples } from '~/utils/sampleFiles';

import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"


import type {
  Sample,
} from "~/types";

export const getServerSideProps = () => {
  return {
    props: {
      env: process.env.NODE_ENV,
      videoExists: !!fs.existsSync("./public/big_buck_bunny_720p_h264.mov")
    }
  };
};

type HomePageProps = {
  env: string;
  videoExists: boolean;
};

const Home = ({ env, videoExists } : HomePageProps) => {
  const [ devMode ] = useState<boolean>(true);
  const [ samples, setSamples ] = useState<Sample[]>([]);
  const [ record, setRecord ] = useState<boolean>(false);
  const [ videoStatus, setVideoStatus ] = useState<boolean>(false);

  const toggleRecording = () => {
    setRecord(!record);
  };

  const _saveSamples = () => {
    saveSamples([...samples], { meta: { foo: "bar" } });
    setSamples([]);
  };

  return (
    <>
      <Head>
        <title>Lineup Coach POC</title>
        <meta name="description" content="Lineup Coach POC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center items-center min-h-screen w-full bg-zinc-900 text-white">
        <div className='w-full text-center'>
          {
            !videoExists && env === 'development'
            &&
            <div className='text-lg mb-2 shadow-2xl rounded-lg p-2 bg-yellow-700 transition-all'>
              Test video not found, please execute the `download-test-video.sh` script in the root folder of this project, and refresh this page.
            </div>
          }
        </div>
        <div
          className="flex shadow-2xl rounded-lg p-2 bg-zinc-800 transition-all"
          style={{ visibility: videoStatus ? "visible" : "hidden"}}
        >
          <div className="max-w-[50vw] w-[50vw] border-r-4 border-solid border-zinc-900">
            <div className='pb-3'>
              <Button
                onClick={toggleRecording}
                variant={record ? 'destructive' : 'default'}
                className='select-none'
                size='lg'
              >
                {record ? 'Stop Recording' : 'Start Recording'}
              </Button>
              {
                samples.length > 0
                &&
                (
                  !!record
                  ?
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className='ml-2 select-none'
                          size='lg'
                          disabled={!!record}
                        >
                          Save Samples
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>To save the sample you need to stop recording first.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  :
                  <Button
                    onClick={_saveSamples}
                    className='ml-2 select-none'
                    size='lg'
                  >
                    Save Samples
                  </Button>

                )
              }
              <Link href="/explore">
                <Button
                  variant="secondary"
                  className='ml-4 select-none'
                >
                  Explore Samples
                </Button>
              </Link>
            </div>
            <VideoBox
              getSamples={record ? setSamples : undefined}
              setStatus={setVideoStatus}
              dev={devMode}
            />
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