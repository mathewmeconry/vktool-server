import 'reflect-metadata'
import { BexioService } from './services/BexioService'
import { createConnection, getConnectionOptions } from 'typeorm'
import yargs from 'yargs'
import CliController from './controllers/CliController'

async function init() {
	let connectionOptions = await getConnectionOptions()

	await createConnection(connectionOptions)

	yargs.command({
		command: ['server', 'srv', 'run', 'up', '$0'],
		describe: 'start up the server',
		handler: CliController.startServer,
	})

	BexioService.addCommandline(yargs)

	yargs.argv
}

init()
