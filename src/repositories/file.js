import db, { queryBuilder } from '../services/db.js';
import notFound from '../exceptions/notFound.js';

export const create = async ({
    fileName,
    filePath,
    bucket,
    fileType,
    extension,
    secretKey,
}) => {
    const res = await db.query(
        'INSERT INTO files("fileName", "filePath", "bucket", "fileType", "extension", "secretKey") VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
        [fileName, filePath, bucket, fileType, extension, secretKey]
    );

    return res.rows[0];
};

export const getImages = async (count, afterId = null) => {
    const imageExtensions = ['png', 'jpeg', 'jpg'];

    let res;

    if (afterId != null) {
        res = await db.query(
            'SELECT * FROM files WHERE extension = ANY($1) AND id < $3 ORDER BY id DESC LIMIT $2',
            [imageExtensions, count, afterId]
        );
    } else {
        res = await db.query(
            'SELECT * FROM files WHERE extension = ANY($1) ORDER BY id DESC LIMIT $2',
            [imageExtensions, count]
        );
    }

    return res.rows;
};

export const getFileByIds = async (ids) => {
    const {
        rows: files,
    } = await db.query('SELECT * FROM "files" WHERE "id" = ANY($1)', [ids]);

    return files;
};

export const getFile = async (id, extension) => {
    let res = await db.query(
        'SELECT * FROM files WHERE extension = $2 AND id = $1 LIMIT 1',
        [id, extension]
    );

    if (res.rows.length === 0) {
        throw new notFound('file');
    }

    return res.rows[0];
};

export const getFileById = async (id) => {
    let file = await queryBuilder('files').where('id', id).first();

    if (!file) {
        throw new notFound('file');
    }

    return file;
};
