import fs from 'fs-extra';
import path from 'path';
import GoogleStorage from '@google-cloud/storage';
import storageConfig from '../config/bucket.js';
import pipe from './pipe.js';
import logger from './logger.js';

const getLocalBucketFileName = (bucket, fileName) =>
    `./storage/${bucket}${fileName}`;

const removeLeadingSlash = string => {
    if (string.startsWith('/')) {
        return removeLeadingSlash(string.substring(1));
    }

    return string;
};

const uploadFileToBucket = async (
    bucketName,
    fileName,
    buffer,
    contentType
) => {
    const newFileName = removeLeadingSlash(fileName);
    const storage = new GoogleStorage.Storage(storageConfig.gcpAuth);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(newFileName);

    logger.info(
        `Uploading file to bucket ${bucketName} and filename ${newFileName}`,
        { bucketName, newFileName }
    );

    await file.save(buffer, {
        metadata: {
            contentType,
        },
    });
};

const getFileStreamFromBucket = async (bucketName, fileName) => {
    const storage = new GoogleStorage.Storage(storageConfig.gcpAuth);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(removeLeadingSlash(fileName));

    return file.createReadStream();
};

const getFileStream = async (bucketName, fileName) => {
    return fs.createReadStream(getLocalBucketFileName(bucketName, fileName));
};

export const save = async (
    bucketName,
    fileName,
    buffer,
    contentType = undefined
) => {
    if (storageConfig.storage === 'bucket') {
        return await uploadFileToBucket(
            bucketName,
            fileName,
            buffer,
            contentType
        );
    }

    return fs.outputFile(getLocalBucketFileName(bucketName, fileName), buffer);
};

const getBucketFileWriteStream = async (bucketName, fileName) => {
    const storage = new GoogleStorage.Storage(storageConfig.gcpAuth);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(removeLeadingSlash(fileName));

    return file.createWriteStream({
        resumable: false,
    });
};

export const saveFileStream = async (bucketName, fileName, readStream) => {
    let writeStream;
    if (storageConfig.storage === 'bucket') {
        writeStream = await getBucketFileWriteStream(bucketName, fileName);
    } else {
        const localFilename = getLocalBucketFileName(bucketName, fileName);

        await fs.ensureDir(path.dirname(localFilename));
        writeStream = await fs.createWriteStream(localFilename);
    }

    return await pipe(readStream, writeStream);
};

export const get = async (bucketName, fileName) => {
    if (storageConfig.storage === 'bucket') {
        return await getFileStreamFromBucket(bucketName, fileName);
    }

    return await getFileStream(bucketName, fileName);
};

const copyLocal = async (from, to) => {
    await fs.copy(
        getLocalBucketFileName(from.bucketName, from.fileName),
        getLocalBucketFileName(to.bucketName, to.fileName)
    );
};

const copyBucket = async (from, to) => {
    const storage = new GoogleStorage.Storage(storageConfig.gcpAuth);

    const fromBucket = storage.bucket(from.bucketName);
    const toBucket = storage.bucket(to.bucketName);

    const fromFile = fromBucket.file(removeLeadingSlash(from.fileName));
    const toFile = toBucket.file(removeLeadingSlash(to.fileName));

    await fromFile.copy(toFile);
};

export const copyFile = async (from, to) => {
    if (storageConfig.storage === 'bucket') {
        return await copyBucket(from, to);
    }

    return await copyLocal(from, to);
};

const deleteLocal = async file => {
    await fs.remove(getLocalBucketFileName(file.bucketName, file.fileName));
};

const deleteBucket = async file => {
    const storage = new GoogleStorage.Storage(storageConfig.gcpAuth);

    const bucket = storage.bucket(file.bucketName);
    const bucketFile = bucket.file(removeLeadingSlash(file.fileName));

    await bucketFile.delete();
};

export const deleteFile = async file => {
    if (storageConfig.storage === 'bucket') {
        return await deleteBucket(file);
    }

    return await deleteLocal(file);
};
