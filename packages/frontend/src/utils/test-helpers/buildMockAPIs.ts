import { SERVER } from '@/config'
import nock from 'nock'

export function buildMockConfigAPI() {
	const response = {
		UNIREP_ADDRESS: '0x83cB6AF63eAfEc7998cC601eC3f56d064892b386',
		APP_ADDRESS: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
		ETH_PROVIDER_URL: 'http://127.0.0.1:8545',
	}
	const expectation = nock(SERVER)
		.get('/api/config')
		.reply(200, response)

	return {
		expectation,
		response,
	}
}