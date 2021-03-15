export default (stream, res, extraPipes = []) => {
    return new Promise((resolve, reject) => {
        let newStream = stream
            .on('error', () => {
                reject(new Error('Problems finding file'));
            })
            .on('end', function () {
                resolve();
            });

        newStream = extraPipes.reduce(
            (newStream, pipe) => newStream.pipe(pipe),
            newStream
        );
        newStream.pipe(res);
    });
};
