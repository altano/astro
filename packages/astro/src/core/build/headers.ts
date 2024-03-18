import contentTypeLib from 'content-type';

export class Headers {
	#headers: Response['headers'];
	#contentType: contentTypeLib.ParsedMediaType | null;

	constructor(headers: Response['headers']) {
		this.#headers = headers;
		this.#contentType = Headers.#parseContentType(headers);
	}

	get charset(): string | undefined {
		return this.#contentType?.parameters.charset;
	}

	get mediaType(): string | undefined {
		return this.#contentType?.type;
	}

	// get contentDisposition(): ResolvedContentType | null {
	// 	const contentDisposition = this.#headers.get("Content-Disposition");
	// 	if (contentDisposition != null) {

	// 	}

	// 	return null;
	// }

	static #parseContentType(headers: Response['headers']): contentTypeLib.ParsedMediaType | null {
		const header = headers.get('Content-Type');
		if (header == null) {
			return null;
		}

		try {
			const contentType = contentTypeLib.parse(header);
			return contentType;
		} catch (err) {
			console.error(`Had trouble parsing response header = "${header}"`);
		}

		return null;
	}
}
