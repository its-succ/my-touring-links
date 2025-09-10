const blobToBase64 = async (blob: Blob): Promise<string> => {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') throw Error('response not string');
      resolve(reader.result.replace(/data:.*\/.*;base64,/, ''));
    };
  });
};

const base64ToBlob = async (base64: string) => {
  return await fetch('data:application/octet-stream;base64,' + base64).then((res) => res.blob());
};

// 圧縮の実行
export const compress = async (payload: string) => {
  // テキストを圧縮するstreamの構築
  const readableStream = new Response(payload).body?.pipeThrough(new CompressionStream('deflate'));
  // Base64に変換したものを設定する
  return await blobToBase64(await new Response(readableStream).blob());
};

// 解凍の実行
export const decompress = async (compressed: string) => {
  // Base64をBlobに変換する
  const blob = await base64ToBlob(compressed);
  // テキストを解凍するstreamの構築
  const readableStream = blob.stream().pipeThrough(new DecompressionStream('deflate'));
  // 変換結果のテキストを設定する
  return await new Response(readableStream).text();
};
