'use strict';

const bodyParser = require( 'body-parser' );
const CronJob = require( 'cron' ).CronJob;
const express = require( 'express' );
const http = require( 'http' );
const redis = require( 'redis' );
const session = require( 'express-session' );
const sessionConfig = require( './session.config.js' );
const JSend = require( './lib/jsend' );

// Constants with dependencies above
const app = express();
const router = express.Router();
const server = http.Server( app );
const RedisStore = require( 'connect-redis' )( session );
const client = redis.createClient();
sessionConfig.store = new RedisStore( {
	host : 'localhost',
	port : 6379,
	client : client,
	ttl : 900 // 15 minutes
} );

app.set( 'trust proxy', 1 );
app.use( session( sessionConfig ) );
app.use( bodyParser.urlencoded( { extended : false } ) );
app.use( JSend );

new CronJob( '*/10 * * * * *', ()=> {
}, null, true );

router.get( '/', ( request, response ) => {
	response.send( 'hello world' );
} );

router.get( '/session/check', ( request, response ) => {
	response.success( request.session );
} );

router.get( '/session/destroy', ( request, response ) => {
	request.session.destroy( ( _error ) => {
		if ( _error ) {
			return response.error( _error );
		}
		response.success( 'session destroyed' );
	} );
} );

app.use( '/vendor-trash/app', router );

server.listen( 3001, () => {
	console.log( 'Example app listening on port 3001!' );
} );
