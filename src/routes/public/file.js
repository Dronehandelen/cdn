import express from 'express';
import * as Storage from '../../services/storage.js';
import streamResponse from '../../services/streamResponse.js';
import * as fileRepository from '../../repositories/file.js';
import ValidationException, {
    validationError,
} from '../../exceptions/validation.js';
import NotFound from '../../exceptions/notFound.js';

const router = express.Router();

const getFile = (req, res, next) => {
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

        const secretKey = req.params.secretKey;
        const fileId = fileNameParts.shift();
        const fileExtension = fileNameParts.join('.');

        const file = await fileRepository.getFile(fileId, fileExtension);

        if (!file || (file.secretKey != null && file.secretKey !== secretKey)) {
            throw new NotFound('file');
        }

        res.set('Cache-Control', 'public, max-age=86400');
        res.set('X-Robots-Tag', 'none');
        res.set('Content-Type', file.fileType);
        res.set('Last-Modified', file.createdAt.toUTCString());

        return await streamResponse(
            await Storage.get(file.bucket, file.filePath),
            res
        );
    };

    getImage(res, req.params.fileName).catch(next);
};

router.get('/files/:fileName', getFile);
router.get('/files/:secretKey/:fileName', getFile);

export default router;
