import multer from 'multer';

export const mimeTypeMapping = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
    'application/sla': 'stl',
};

export default multer({
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        if (Object.keys(mimeTypeMapping).indexOf(file.mimetype) !== -1) {
            return cb(null, true);
        }

        cb(null, false);
    },
});
