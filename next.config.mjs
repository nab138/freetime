// @ts-check

import withPWAInit from "@ducanh2912/next-pwa";


const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,

});

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["@deno/kv"]
    }
};

export default withPWA(nextConfig);
