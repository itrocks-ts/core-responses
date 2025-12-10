[![npm version](https://img.shields.io/npm/v/@itrocks/core-responses?logo=npm)](https://www.npmjs.org/package/@itrocks/core-responses)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/core-responses)](https://www.npmjs.org/package/@itrocks/core-responses)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/core-responses?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/core-responses)
[![issues](https://img.shields.io/github/issues/itrocks-ts/core-responses)](https://github.com/itrocks-ts/core-responses/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# core-responses

Prefabricated HTTP it.rocks responses for HTML, JSON, and PDF formats.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/core-responses
```

## Usage

`@itrocks/core-responses` provides three small `Response` subclasses you can
use in any framework or HTTP server integration built on top of
[@itrocks/request-response](https://github.com/itrocks-ts/request-response):

- `HtmlResponse` – HTML pages with a convenient default `Content-Type` and
  automatic `<!DOCTYPE html>` prefix.
- `JsonResponse` – JSON payloads with safe serialisation (including `bigint`)
  and a typed `data` property.
- `PdfResponse` – binary PDF documents with the appropriate
  `Content-Type: application/pdf` header.

You typically never use this package alone: it is designed to be combined with
`@itrocks/request-response` (and optionally higher‑level modules such as
`@itrocks/action` or `@itrocks/framework`).

### Minimal example

```ts
import { GET, Request } from '@itrocks/request-response'
import { HtmlResponse } from '@itrocks/core-responses'

// Very small helper turning a framework request into a Request
function toRequest(raw: any): Request {
	return new Request(
		GET,
		'https',
		raw.headers.host ?? 'localhost',
		443,
		raw.url,
		raw.headers as Record<string, string>,
		raw.query as Record<string, string>,
		raw.body as any,
		raw.session
	)
}

async function helloHtml(rawRequest: any): Promise<HtmlResponse> {
	const request = toRequest(rawRequest)

	const name = request.parameters.name ?? 'world'

	// Body will automatically be prefixed with '<!DOCTYPE html>\n'
	return new HtmlResponse(`<html><body>Hello ${name}!</body></html>`)
}
```

### Integrated example with JSON and PDF

In a more realistic application you often return HTML for browser views, JSON
for APIs, and sometimes PDFs (for example invoices or reports). All of them can
be expressed using the specialised responses from this module.

The following pseudo‑adapter shows how you can wire them in an Express‑like
environment (any other framework works the same as long as you can access the
final `Response` object):

```ts
import { GET, Request, Response } from '@itrocks/request-response'
import { HtmlResponse, JsonResponse, PdfResponse } from '@itrocks/core-responses'

function toRequest(raw: any): Request {
	return new Request(
		GET,
		'https',
		raw.headers.host ?? 'localhost',
		443,
		raw.url,
		raw.headers as Record<string, string>,
		raw.query as Record<string, string>,
		raw.body as any,
		raw.session
	)
}

function send(rawReply: any, response: Response) {
	rawReply
		.status(response.status)
		.headers(response.headers)
		.send(response.body)
}

async function htmlRoute(rawReq: any, rawReply: any) {
	const request = toRequest(rawReq)
	const response = new HtmlResponse('<html>...</html>')
	send(rawReply, response)
}

async function jsonRoute(rawReq: any, rawReply: any) {
	const request = toRequest(rawReq)
	const payload = { ok: true, at: new Date().toISOString() }
	const response = new JsonResponse(payload)
	send(rawReply, response)
}

async function pdfRoute(rawReq: any, rawReply: any) {
	const request = toRequest(rawReq)
	const pdfBuffer = await buildInvoicePdf(request)
	const response = new PdfResponse(pdfBuffer)
	send(rawReply, response)
}
```

## API

`@itrocks/core-responses` exposes the following public classes:

- `HtmlResponse` – specialised `Response` for HTML bodies.
- `JsonResponse` – specialised `Response` for JSON payloads.
- `PdfResponse` – specialised `Response` for PDF documents.

All of them extend `Response` from
[`@itrocks/request-response`](https://github.com/itrocks-ts/request-response)
and are therefore compatible with any helper or adapter working with that
base type.

### `class HtmlResponse extends Response`

Represents an HTML HTTP response.

#### Constructor

```ts
constructor(body?: string, statusCode?: number, headers?: Headers)
```

Parameters:

- `body: string = ''` – HTML body of the response. If it does not already
  start with `<!DOCTYPE html>`, the constructor automatically prefixes it with
  the HTML5 doctype on a first line. This helps keep all HTML responses
  consistent without repeating the boilerplate.
- `statusCode: number = 200` – HTTP status code.
- `headers: Headers = {}` – Additional HTTP headers. If `Content-Type` is not
  already set, it is automatically initialised to `text/html`.

Use this class whenever you want to build an HTML page response while letting
the module take care of the correct content type and doctype.

### `class JsonResponse extends Response`

Represents a JSON HTTP response with a convenient `data` property bound to the
underlying `body`.

#### Constructor

```ts
constructor(data: object | string, statusCode?: number, headers?: Headers)
```

Parameters:

- `data: object | string` – The payload to serialise as JSON. It can be
  either a plain object/value or a pre‑serialised JSON string.
- `statusCode: number = 200` – HTTP status code.
- `headers: Headers = {}` – Additional HTTP headers. If `Content-Type` is not
  already set, it is automatically initialised to `application/json`.

The constructor defines a getter/setter on the inherited `body` property:

- reading `body` returns `JSON.stringify(data)` with a replacer that converts
  `bigint` values to strings (so that JSON serialisation always works),
- writing `body` parses the JSON string and updates `data` accordingly.

Typical usage is to read and write the `data` property from your application
code and let the response handle serialisation for you.

### `class PdfResponse extends Response`

Represents a PDF HTTP response.

#### Constructor

```ts
constructor(data: any, statusCode?: number, headers?: Headers)
```

Parameters:

- `data: any` – Binary content of the PDF (for example a `Buffer` or
  `Uint8Array`). The class does not enforce a specific type so that it can
  easily integrate with different PDF generation libraries.
- `statusCode: number = 200` – HTTP status code.
- `headers: Headers = {}` – Additional HTTP headers. If `Content-Type` is not
  already set, it is automatically initialised to `application/pdf`.

Use this response when your action produces PDF documents (invoices,
statements, reports…) and you want a correctly initialised `Response`
instance.

## Typical use cases

- Build HTML pages in actions or controllers while letting `HtmlResponse`
  enforce a consistent HTML5 doctype and content type.
- Return JSON payloads from API endpoints using `JsonResponse`, benefiting
  from automatic serialisation and `bigint` handling.
- Serve dynamically generated PDF files (invoices, labels, reports) using
  `PdfResponse` with the proper `Content-Type` header.
- Share a small, framework‑agnostic response layer between back‑end modules
  such as `@itrocks/action`, `@itrocks/home`, `@itrocks/list`, `@itrocks/print`
  and your own custom actions.
