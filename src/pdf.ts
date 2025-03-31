import { Headers, Response } from '@itrocks/request-response'

export class PdfResponse extends Response
{

	constructor(data: any, statusCode = 200, headers: Headers = {})
	{
		headers['Content-Type'] ??= 'application/pdf'
		super(data, statusCode, headers)
	}

}
