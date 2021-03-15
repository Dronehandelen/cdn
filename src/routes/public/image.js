import express from 'express';
import * as Storage from '../../services/storage.js';
import streamResponse from '../../services/streamResponse.js';
import * as fileRepository from '../../repositories/file.js';
import ValidationException, {
    validationError,
} from '../../exceptions/validation.js';
import moment from 'moment';
import sharp from 'sharp';

const router = express.Router();

router.get('/images/:fileName', (req, res, next) => {
    const getImage = async (res, fileName) => {
        const fileNameParts = fileName.split('.');

        if (fileNameParts.length < 2) {
            throw new ValidationException(
                validationError(
                    'imageId',
                    'image id must be in format "<imageId>.<extension>"'
                )
            );
        }

        const fileId = fileNameParts.shift();
        const fileExtension = fileNameParts.join('.');

        const file = await fileRepository.getFile(fileId, fileExtension);
        const ifModifiedSince = req.get('If-Modified-Since');

        if (
            ifModifiedSince &&
            moment(file.createdAt).isSameOrBefore(
                moment(ifModifiedSince),
                'seconds'
            )
        ) {
            return res.sendStatus(304);
        }

        res.set('Cache-Control', `public, max-age=${86400 * 365}`);
        res.set('Content-Type', file.fileType);
        res.set('Last-Modified', file.createdAt.toUTCString());

        return await streamResponse(
            await Storage.get(file.bucket, file.filePath),
            res,
            [
                (req.query.maxWidth || req.query.maxHeight) &&
                    sharp().resize({
                        width:
                            req.query.maxWidth && parseInt(req.query.maxWidth),
                        height:
                            req.query.maxHeight &&
                            parseInt(req.query.maxHeight),
                        withoutEnlargement: true,
                    }),
            ].filter(Boolean)
        );
    };

    getImage(res, req.params.fileName).catch(next);
});

export default router;
