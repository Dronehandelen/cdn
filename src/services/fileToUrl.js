import appConfig from '../config/app.js';
import imageTypes from '../config/imageTypes.js';

export default file => {
    const isImage = imageTypes.extensions.indexOf(file.extension) !== -1;

    return [
        appConfig.publicUrl,
        'api/v1/public',
        isImage ? 'images' : 'files',
        file.secretKey,
        `${file.id}.${file.extension}`,
    ]
        .filter(Boolean)
        .join('/');
};
