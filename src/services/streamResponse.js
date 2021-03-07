export default (stream, res) => {
    return new Promise((resolve, reject) => {
        stream
            .on('error', () => {
                reject(new Error('Problems finding file'));
            })
            .on('end', function() {
                resolve();
            })
            .pipe(res);
    });
};
