'use strict';

const JSend = ( function() {
	function _JSend( request, response, next ) {
		let body;
		let envelope;
		let self;

		envelope = false;
		function error( message, statusCode ) {
			if ( response.headersSent ) {
				console.log( 'attempting to send headers again', message );
				return;
			}
			message = message instanceof Error ? message.message : message;
			statusCode = statusCode || 500;
			if ( ! envelope ) {
				return response.status( statusCode ).json( {
					message : message
				} );
			}
			body = {
				status : 'error',
				message : message,
				code : statusCode
			};
			response.json( body );
		}

		function fail( data, statusCode ) {
			let message;

			if ( response.headersSent ) {
				console.log( 'attempting to send headers again', data );
				return;
			}
			statusCode = statusCode || 400;
			message = data instanceof Error ? data.message : 'Fail.';
			if ( ! envelope ) {
				response.status( statusCode ).json( {
					message : message,
				} );
				return;
			}
			body = {
				status : 'fail',
				data : data
			};
			response.json( body );
		}

		function forbidden( data ) {
			fail( data, 403 );
		}

		function notFound( data ) {
			fail( data, 404 );
		}

		function success( data, statusCode, headers ) {
			if ( response.headersSent ) {
				console.log( 'attempting to send headers again', data );
				return;
			}
			data = data || null;
			statusCode = ! data ? 204 : statusCode || 200;
			if ( headers ) {
				response.set( headers );
			}
			if ( ! envelope ) {
				return response.status( statusCode ).json( data );
			}
			body = {
				status : 'success',
				data : data
			};
			response.json( body );
		}

		function successStatic( data ) {
			return success( data, 200, {
				'Cache-Control' : 'public, max-age=86400',
			} );
		}

		self = {
			error : error,
			fail : fail,
			success : success
		};
		response.error = error;
		response.fail = fail;
		response.forbidden = forbidden;
		response.notFound = notFound;
		response.success = success;
		response.static = successStatic;
		response.jsend = self;
		next();
	}

	return _JSend;

} )();

module.exports = JSend;
