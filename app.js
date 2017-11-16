const aboutADozen = require('./aboutADozen');

module.exports.aboutADozen = (event, context, callback) => {
  let requestBodyJSON = {};
  try {
    requestBodyJSON = JSON.parse(event.body);
  } catch(e){
    requestBodyJSON = {
      number: 0
    };
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: aboutADozen(requestBodyJSON.number),
      // input: event,
      // requestBody: requestBodyJSON
    }),
  };

  callback(null, response);
};
