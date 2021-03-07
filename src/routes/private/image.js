import express from 'express';
import * as fileRepository from '../../repositories/file.js';
import fileToUrl from '../../services/fileToUrl.js';

const router = express.Router();

const getInt = (value, defaultValue) => {
    if (!value) {
        return defaultValue;
    }

    if (isNaN(parseInt(value))) {
        return defaultValue;
    }

    return parseInt(value);
};

router.get('/images', (req, res, next) => {
    const getImages = async (count, after) => {
        let parsedAfter = null;

        if (after) {
            parsedAfter = new Buffer(after, 'base64').toString('ascii');
        }

        const files = await fileRepository.getImages(
            getInt(count, 10),
            parsedAfter
        );

        return files.map(file => ({
            cursor: new Buffer(file.id.toString()).toString('base64'),
            node: {
                fileId: file.id,
                url: fileToUrl(file),
            },
        }));
    };

    getImages(req.query.count, req.query.after)
        .then(data => res.json(data))
        .catch(next);
});

export default router;
