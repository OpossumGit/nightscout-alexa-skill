/* *
 * This skill manages Nightscout instance
 * */
const Alexa = require('ask-sdk-core');
const https = require('https');

const uri = 'https://???.herokuapp.com/'; 
const passphrase = '???';

const setJSONstr = '{"enteredBy":"alexa", "eventType":"Site Change", "duration":0,"secret":"'+passphrase+'"}';
const insulinJSONstr = '{"enteredBy":"alexa", "eventType":"Insulin Change", "duration":0,"secret":"'+passphrase+'"}';
const sensorJSONstr = '{"enteredBy":"alexa", "eventType":"Sensor Change", "duration":0,"secret":"'+passphrase+'"}';
const batteryJSONstr = '{"enteredBy":"alexa", "eventType":"Pump Battery Change", "duration":0,"secret":"'+passphrase+'"}';

const getHttps = function(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(`${url}`, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
}

const postHttps = function(url, data) {
    return new Promise((resolve, reject) => {
            
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
              }
            }
        
        
        const request = https.request(`${url}`, options, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.write(data);
        request.end();
    });
}


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Dora`s Nightscout says hello. You can ask for latest sugar level or record new action. What do you want to do?';
        const reprompt = 'You may record Change Set, Change Battery, New Sensor and New Insulin. You may ask me for current glucose level too.';
      
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};

const CurrentLevelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CurrentLevelIntent';
    },
    async handle(handlerInput) {

        try {
            const response = await getHttps(uri+'api/v1/entries.json?count=1');
            let jsonResponse = JSON.parse(response);
            let value = (JSON.stringify(jsonResponse[0].sgv)/18.0182).toFixed(1);
            let direction;
            switch(jsonResponse[0].direction) {
                case 'FortyFiveDown':
                    direction = 'Slightly falling';
                    break;
                case 'FortyFiveUp':
                    direction = 'Slightly rising';
                    break;
                case 'SingleDown':
                    direction = 'Falling';
                    break;
                case 'SingleUp':
                    direction = 'Rising';
                    break;
                case 'DoubleDown':
                    direction = 'Rapidly falling';
                    break;
                case 'DoubleUp':
                    direction = 'Rapidly rising';
                    break;
                case 'Flat':
                    direction = 'Flat'
                    break;
                default:
                    direction= '';
            }
            
            const now = new Date().getTime();
            let time =  JSON.stringify(jsonResponse[0].date);
            let delta = ((now - time)/60000).toFixed(0);
            
            let min = 'minute';
            if (delta !== '1') min+='s';
            
            let speakOutput = value + ', ' + delta + ' ' + min + ' ago, ' + direction ;
           
            handlerInput.responseBuilder
                .speak(speakOutput)
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to get sugar level. ` + error)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
};

const SetIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetIntent';
    },
    async handle(handlerInput) {

        try {
            const response = await postHttps(uri+'api/v1/treatments.json', setJSONstr);
            
            let speakOutput = "Set change recorded" ;
           
            handlerInput.responseBuilder
                .speak(speakOutput)
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to record set change. ` + error)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
};

const SensorIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SensorIntent';
    },
    async handle(handlerInput) {

        try {
            const response = await postHttps(uri+'api/v1/treatments.json', sensorJSONstr);
            
            let speakOutput = "Sensor start recorded" ;
           
            handlerInput.responseBuilder
                .speak(speakOutput)
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to record sensor start. ` + error)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
};

const BatteryIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BatteryIntent';
    },
    async handle(handlerInput) {

        try {
            const response = await postHttps(uri+'api/v1/treatments.json', batteryJSONstr);
            
            let speakOutput = "New battery recorded" ;
           
            handlerInput.responseBuilder
                .speak(speakOutput)
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to record new battery. ` + error)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
    
};

const InsulinIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InsulinIntent';
    },
    async handle(handlerInput) {

        try {
            const response = await postHttps(uri+'api/v1/treatments.json', insulinJSONstr);
            
            let speakOutput = "New insulin recorded" ;
           
            handlerInput.responseBuilder
                .speak(speakOutput)
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to record new insulin. ` + error)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You may record Change Set, Change Battery, New Sensor and New Insulin. You may ask me for current glucose level too.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CurrentLevelIntentHandler,
        SetIntentHandler,
        SensorIntentHandler,
        BatteryIntentHandler,
        InsulinIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();