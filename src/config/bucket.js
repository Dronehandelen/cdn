export default {
    storage: process.env.CONFIG_IMAGE_STORAGE || 'local',
    generalFileBucket: 'norfpv-files-hot',
    gcpAuth: {
        keyFilename: '/secrets/google/credentials.json',
    },
};
