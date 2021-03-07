export default {
    isProd: process.env.NODE_ENV === 'production',
    googleProjectId: 'norfpv',
    publicUrl: process.env.CONFIG_APP_PUBLIC_URL || "http://cdn.local.dronehandelen.no",
    port: process.env.CONFIG_APP_PORT
        ? parseInt(process.env.CONFIG_APP_PORT)
        : 80,
};
