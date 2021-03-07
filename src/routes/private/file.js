import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import upload, { mimeTypeMapping } from '../../services/multer.js';
import ValidationException, {
    validationError,
} from '../../exceptions/validation.js';
import * as fileRepository from '../../repositories/file.js';
import storageConfig from '../../config/bucket.js';
import * as Storage from '../../services/storage.js';
import fileToUrl from '../../services/fileToUrl.js';
import streamResponse from '../../services/streamResponse.js';

const router = express.Router();

router.post('/files', upload.single('file'), (req, res, next) => {
    const uploadFile = async (file) => {
        const buffer = file && file.buffer;
        const extension = buffer && mimeTypeMapping[file.mimetype];

        if (!buffer || !extension) {
            throw new ValidationException(
                validationError(
                    'image',
                    'Invalid image. Must be an image under 4MB'
                )
            );
        }

        const filePath = `/${extension.replace('.', '')}/${moment().format(
            'YYYY'
        )}/${moment().format('MM')}/${moment().format(
            'DD'
        )}/${uuidv4()}.${extension}`;
        const isSecure = req.body && req.body.secure && req.body.secure === '1';

        const dbFile = await fileRepository.create({
            filePath,
            fileName: file.originalname.replace(`.${extension}`, ''),
            bucket: storageConfig.generalFileBucket,
            extension,
            fileType: file.mimetype,
            secretKey: isSecure ? uuidv4() : null,
        });

        await Storage.save(
            storageConfig.generalFileBucket,
            filePath,
            buffer,
            file.mimetype
        );

        return {
            id: dbFile.id,
            url: fileToUrl(dbFile),
        };
    };

    uploadFile(req.file)
        .then((data) => res.json(data))
        .catch(next);
});

router.post('/files/ids', (req, res, next) => {
    const getImages = async (ids) => {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return {
                files: [],
            };
        }

        return {
            files: (await fileRepository.getFileByIds(ids)).map((file) => ({
                ...file,
                url: fileToUrl(file),
            })),
        };
    };

    getImages(req.body.ids)
        .then((data) => res.json(data))
        .catch(next);
});

router.get('/files/:fileId/content', (req, res, next) => {
    const getImages = async (res, id) => {
        const file = await fileRepository.getFileById(id);

        return await streamResponse(
            await Storage.get(file.bucket, file.filePath),
            res
        );
    };

    getImages(res, req.params.fileId).catch(next);
});

export default router;
