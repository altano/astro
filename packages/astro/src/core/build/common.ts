import npath from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { AstroConfig, RouteData } from '../../@types/astro.js';
import { appendForwardSlash } from '../../core/path.js';
import type { FileDescriptor } from './util.js';

const STATUS_CODE_PAGES = new Set(['/404', '/500']);
const FALLBACK_OUT_DIR_NAME = './.astro/';

function getOutRoot(astroConfig: AstroConfig): URL {
	if (astroConfig.output === 'static') {
		return new URL('./', astroConfig.outDir);
	} else {
		return new URL('./', astroConfig.build.client);
	}
}

export function getOutFolder(
	astroConfig: AstroConfig,
	pathname: string,
	routeData: RouteData,
	fileDescriptor: FileDescriptor | null = null
): URL {
	const outRoot = getOutRoot(astroConfig);
	const routeType = routeData.type;

	// This is the root folder to write to.
	switch (routeType) {
		case 'endpoint':
			return new URL('.' + appendForwardSlash(npath.dirname(pathname)), outRoot);
		case 'fallback':
		case 'page':
		case 'redirect':
			// @TODO Document when we disregard build.format
			if (fileDescriptor?.isHtml === false) {
				if (pathname === '' || routeData.isIndex) {
					throw new Error(`Root must be html`);
				}
				const dirname = npath.dirname(pathname);
				const result = new URL('.' + appendForwardSlash(dirname), outRoot);

				debugger;

				return result;
			}
			switch (astroConfig.build.format) {
				case 'directory': {
					if (STATUS_CODE_PAGES.has(pathname)) {
						return new URL('.' + appendForwardSlash(npath.dirname(pathname)), outRoot);
					}
					return new URL('.' + appendForwardSlash(pathname), outRoot);
				}
				case 'file': {
					const d = pathname === '' ? pathname : npath.dirname(pathname);
					return new URL('.' + appendForwardSlash(d), outRoot);
				}
				case 'preserve': {
					let dir;
					// If the pathname is '' then this is the root index.html
					// If this is an index route, the folder should be the pathname, not the parent
					if (pathname === '' || routeData.isIndex) {
						dir = pathname;
					} else {
						dir = npath.dirname(pathname);
					}
					return new URL('.' + appendForwardSlash(dir), outRoot);
				}
			}
	}
}

export function getOutFile(
	astroConfig: AstroConfig,
	outFolder: URL,
	pathname: string,
	routeData: RouteData,
	fileDescriptor: FileDescriptor | null = null
): URL {
	const routeType = routeData.type;
	switch (routeType) {
		case 'endpoint':
			return new URL(npath.basename(pathname), outFolder);
		case 'page':
		case 'fallback':
		case 'redirect':
			// @TODO Document when we disregard build.format
			if (fileDescriptor?.isHtml === false) {
				let baseName = fileDescriptor.filename ? fileDescriptor.filename : npath.basename(pathname);
				// If there is no base name this is the root route.
				// If this is an index route, the name should be `index.html`.
				if (!baseName || routeData.isIndex) {
					throw new Error(`Root must be html`);
				}
				const result = new URL(`./${baseName}`, outFolder);

				debugger;

				return result;
			}
			switch (astroConfig.build.format) {
				case 'directory': {
					if (STATUS_CODE_PAGES.has(pathname)) {
						const baseName = npath.basename(pathname);
						return new URL('./' + (baseName || 'index') + '.html', outFolder);
					}
					return new URL('./index.html', outFolder);
				}
				case 'file': {
					const baseName = npath.basename(pathname);
					return new URL('./' + (baseName || 'index') + '.html', outFolder);
				}
				case 'preserve': {
					let baseName = npath.basename(pathname);
					// If there is no base name this is the root route.
					// If this is an index route, the name should be `index.html`.
					if (!baseName || routeData.isIndex) {
						baseName = 'index';
					}
					return new URL(`./${baseName}.html`, outFolder);
				}
			}
	}
}

/**
 * Ensures the `outDir` is within `process.cwd()`. If not it will fallback to `<cwd>/.astro`.
 * This is used for static `ssrBuild` so the output can access node_modules when we import
 * the output files. A hardcoded fallback dir is fine as it would be cleaned up after build.
 */
export function getOutDirWithinCwd(outDir: URL): URL {
	if (fileURLToPath(outDir).startsWith(process.cwd())) {
		return outDir;
	} else {
		return new URL(FALLBACK_OUT_DIR_NAME, pathToFileURL(process.cwd() + npath.sep));
	}
}
