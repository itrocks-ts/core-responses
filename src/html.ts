import { Headers, Response } from '@itrocks/request-response'

export class HtmlResponse extends Response
{

	constructor(body = '', statusCode = 200, headers: Headers = {})
	{
		if (!body.startsWith('<!DOCTYPE html>')) {
			body = `<!DOCTYPE html>\n` + body
		}
		headers['Content-Type'] ??= 'text/html'
		super(body, statusCode, headers)
	}

}
