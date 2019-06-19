import { BexioService } from './services/BexioService'
import "reflect-metadata";
import { createConnection, getConnectionOptions } from 'typeorm';
import yargs from 'yargs'
import CliController from './controllers/CliController';

async function init() {
    let connectionOptions = await getConnectionOptions()

    // @ts-ignore
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') connectionOptions['ssl'] = true
    await createConnection(connectionOptions)


    yargs
        .command({
            command: ['server', 'srv', 'run', 'up', '$0'],
            describe: 'start up the server',
            handler: CliController.startServer
        })

    BexioService.addCommandline(yargs)

    yargs.argv
}

init()