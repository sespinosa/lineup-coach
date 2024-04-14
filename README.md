# Lineup Coach

It's a t3 app so run it using their [docs](https://create.t3.gg/en/introduction).

[File that encodes in the `.dmc` format (binary serializable format for general sample data with metadata)](src/utils/sampleFiles.ts)

[Hook for recording the window, it supports webcam too](src/hooks/useMediaStream.tsx)

[Hook for extracting the samples from the video](src/hooks/useSampleRecorder.tsx)

---

## TODO

- Frequency
- Smaller default resolution, custom resolution via UI.
- Compression
- Service Workers (distributed pool, multiple threads)
- Generate binary instead of b64 (it's encoding twice and is not necesary)
- Sync Service Workers using [`Atomics`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- Peer connection via `postgres` for phone and distributed backend.