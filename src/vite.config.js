import vue from '@vitejs/plugin-vue';
import {defineConfig} from "vite";
import anywidget from "@anywidget/vite";

export default defineConfig(async ({command}) => {
    let define = {};
    if (command === "build") {
        define["process.env.NODE_ENV"] = JSON.stringify("production");
    }
    return {
        plugins: [vue(), anywidget()],
        build: {
            outDir: "ipywwt/static",
            lib: {
                entry: ["js/index.js"],
                formats: ["es"],
            },
            rollupOptions: {
                output: {
                    manualChunks: false,
                    inlineDynamicImports: true,
                    entryFileNames: '[name].js',   // currently does not work for the legacy bundle
                    assetFileNames: '[name].[ext]', // currently does not work for images
                },
            },
        },
        define,
    }
});