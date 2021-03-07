import util from 'util';
import stream from 'stream';

const pipeline = util.promisify(stream.pipeline);

export default async (readStream, writeStream) => {
    return await pipeline(readStream, writeStream);
};
