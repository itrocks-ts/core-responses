import { Headers, Response } from '@itrocks/request-response'

export class JsonResponse extends Response
{

	constructor(public data: object | string, statusCode = 200, headers: Headers = {})
	{
		headers['Content-Type'] ??= 'application/json'
		super('', statusCode, headers)
		Object.defineProperty(this, 'body', {
			configurable: true,
			enumerable:   true,
			get: () => JSON.stringify(this.data, (_, value) => (typeof value === 'bigint') ? value.toString() : value),
			set: (body: string) => this.data = JSON.parse(body)
		})
	}

}
