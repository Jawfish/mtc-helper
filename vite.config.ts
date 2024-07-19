import { resolve } from 'path';
import fs from 'fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import { coverageConfigDefaults } from 'vitest/config';
import { build } from 'esbuild';

import manifest from './manifest.json';
import devManifest from './manifest.dev.json';
import pkg from './package.json';
import { injectScriptDest, injectScriptSrc } from './src/types/injectTypes';

const root = resolve(__dirname, 'src');

const assetsDir = resolve(root, 'assets');
const componentsDir = resolve(root, 'components');
const externalDir = resolve(root, 'external');
const hooksDir = resolve(root, 'hooks');
const injectDir = resolve(__dirname, 'inject');
const libDir = resolve(root, 'lib');
const mtcDir = resolve(root, 'mtc');
const outDir = resolve(__dirname, 'dist');
const pagesDir = resolve(root, 'pages');
const publicDir = resolve(__dirname, 'public');
const storeDir = resolve(root, 'store');

const isDev = process.env.__DEV__ === 'true' || process.env.NODE_ENV === 'development';

const extensionManifest = {
    ...manifest,
    ...(isDev ? devManifest : ({} as ManifestV3Export)),
    name: isDev ? `DEV: ${manifest.name}` : manifest.name,
    version: pkg.version
};

// plugin to remove dev icons from prod build
function stripDevIcons(apply: boolean) {
    if (apply) return null;

    return {
        name: 'strip-dev-icons',
        resolveId(source: string) {
            return source === 'virtual-module' ? source : null;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderStart(outputOptions: any, _: any) {
            const outDir = outputOptions.dir;
            fs.rm(resolve(outDir, 'dev-icon-32.png'), () =>
                // eslint-disable-next-line no-console
                console.log(`Deleted dev-icon-32.png frm prod build`)
            );
            fs.rm(resolve(outDir, 'dev-icon-128.png'), () =>
                // eslint-disable-next-line no-console
                console.log(`Deleted dev-icon-128.png frm prod build`)
            );
        }
    };
}

// plugin to compile inject-script.ts
function compileInjectScript() {
    const inFile = resolve(injectScriptSrc);
    const outFile = resolve(injectScriptDest);

    console.log(`Compiling ${inFile} to ${outFile}`);

    return {
        name: 'compile-inject-script',
        buildStart() {
            // TypeScript cast to ensure this context is correctly typed
            const self = this as unknown as { addWatchFile: (id: string) => void };
            self.addWatchFile(inFile);
        },
        async generateBundle() {
            try {
                await build({
                    entryPoints: [inFile],
                    outfile: outFile,
                    bundle: true,
                    sourcemap: isDev,
                    platform: 'browser',
                    target: 'esnext'
                });
            } catch (error) {
                process.exit(1);
            }
        }
    };
}

export default defineConfig({
    resolve: {
        alias: {
            '@assets': assetsDir,
            '@components': componentsDir,
            '@external': externalDir,
            '@hooks': hooksDir,
            '@inject': injectDir,
            '@lib': libDir,
            '@mtc': mtcDir,
            '@pages': pagesDir,
            '@src': root,
            '@store': storeDir
        }
    },
    plugins: [
        compileInjectScript(),
        react(),
        crx({
            manifest: extensionManifest as ManifestV3Export,
            contentScripts: {
                injectCss: true
            }
        }),
        stripDevIcons(isDev)
    ],
    publicDir,
    build: {
        outDir,
        sourcemap: isDev,
        emptyOutDir: !isDev
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
    },
    test: {
        setupFiles: ['testSetup.ts'],
        environment: 'jsdom',
        coverage: {
            include: ['src/**/*'],
            exclude: [
                'src/**/*.stories.tsx',
                'src/**/*.mock.ts',
                ...coverageConfigDefaults.exclude
            ]
        }
    }
});
