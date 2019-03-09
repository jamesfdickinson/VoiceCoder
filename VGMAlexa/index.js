'use strict';

const Alexa = require('ask-sdk-core');
const VGMCore = require('../VGMCore/src/App.js');
//npm install --save ask-sdk-dynamodb-persistence-adapter

const vGMCore = new VGMCore();
let game = vGMCore.game;

async function getUserData(session, userId) {
    if (session && session.data && JSON.stringify(session.data) != "{}" && session.data.accessCode) {
        let data = session.data;
        return data;
    }
    if (userId) {
        let dataDB = vGMCore.loadDB(userId);
        return dataDB;
    }
}
async function saveUserData(userId, data) {
    if (userId) {
        let accessCode = await vGMCore.saveDB(userId, data);
        return accessCode;
    }
}


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async  handle(handlerInput) {
        //log request for debuging
        //console.log("request = " + JSON.stringify(handlerInput.requestEnvelope.request));


        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(null, userId);
        game.load(data);
        game.context = null;

        const speechText = game.processRequest("start");

        //save game - Session
        session.data = game.getData();
        session.state = game.context;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            // .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const AddRuleIntentHandler = {
    canHandle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AddRule';
    },
    async  handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;

        let event = slots.Event.value;
        let action = slots.Action.value;
        let value = slots.Value.value;
        let parameters = {
            "event": event,
            "action": action,
            "value": value
        }
        //default to start event if action is provided
        if (!parameters.event && parameters.action) {
            parameters.event = 'start';
        }
        const speechText = game.processRequest("createRule", parameters, game.context);

        //save game - Session
        session.data = game.getData();
        session.state = game.context;

        //save game - DB
        await saveUserData(userId, game.getData());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();

        //todo: show live demo of your game auto playing when a rule is added with a link to play it
        //todo: could show live video of game being played by your computer player you created
    }
};


const AddRuleEventIntentHandler = {
    canHandle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const request = handlerInput.requestEnvelope.request;
        return attributes.state === "createRuleEvent" &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AddRuleEvent';
    },
    async  handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;
        let event = slots.Event.value;

        const speechText = game.processRequest("createRuleEvent", event, game.context);

        //session save game
        session.data = game.getData();
        session.state = game.context;

        //save game - DB
        //todo: only save if new rule added
        await saveUserData(userId, game.getData());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();

    }
};

const AddRuleActionIntentHandler = {
    canHandle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const request = handlerInput.requestEnvelope.request;
        return attributes.state === "createRuleAction" &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AddRuleAction';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;
        let action = slots.Action.value;

        const speechText = game.processRequest("createRuleAction", action, game.context);

        //session save game
        session.data = game.getData();
        session.state = game.context;

        //save game - DB
        //todo: only save if new rule added
        await saveUserData(userId, game.getData());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const AddRuleValueIntentHandler = {
    canHandle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const request = handlerInput.requestEnvelope.request;
        return attributes.state === "createRuleValue" &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AddRuleValue';
    },
    async   handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;
        let value = slots.Value.value;

        const speechText = game.processRequest("createRuleValue", value, game.context);

        //session save game
        session.data = game.getData();
        session.state = game.context;

        //save game - DB
        //todo: only save if new rule added
        await saveUserData(userId, game.getData());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const RemoveRuleIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'RemoveRule';
    },
    async  handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;
        let event = slots.Event.value;
        let parameters = {
            "event": event,
            "action": null,
            "value": null
        }

        const speechText = game.processRequest("remove rule", parameters, game.context);

        //session save game
        session.data = game.getData();
        session.state = game.context;

        //save game - DB
        //todo: only save if new rule added
        await saveUserData(userId, game.getData());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();

    }
};
const CreateNewGameIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'CreateNewGame';
    },
    async   handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        const speechText = game.processRequest("new game");

        //session save game
        session.data = game.getData();
        session.state = game.context;

        //save game - DB
        //todo: only save if new rule added
        await saveUserData(userId, game.getData());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const GetAccessCodeIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'GetAccessCode';
    },
    async   handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let isDirectRequest = !(session && session.data && JSON.stringify(session.data) != "{}");

        let data = await getUserData(session, userId);
        game.load(data);

        // if(isDirectRequest){
        //     const speechText = game.processRequest("get code only");

        //     return handlerInput.responseBuilder
        //         .speak(speechText)
        //         .reprompt(speechText);
        // }
        //  else{
        const speechText = game.processRequest("get code");

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
        //}

    }
};
const ListEventsIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'ListEvents';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        const speechText = game.processRequest("list all events");

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const ListActionsIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'ListActions';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;
        let event = null;

        if (slots.Event) event = slots.Event.value;

        const speechText = game.processRequest("list actions", event);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ListValuesIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'ListValues';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        //get request value
        let slots = handlerInput.requestEnvelope.request.intent.slots;
        let action = slots.Action.value;

        const speechText = game.processRequest("list values", action);



        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const WhatIsAnEventIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'WhatIsAnEvent';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        const speechText = game.processRequest("what is an event");

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const WhatIsAnActionIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'WhatIsAnAction';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        const speechText = game.processRequest("what is an action");

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const WhatIsAValueIntentHandler = {
    canHandle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'WhatIsAValue';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        const speechText = game.processRequest("what is a value");

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};



const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        const { userId } = handlerInput.requestEnvelope.session.user;
        const session = handlerInput.attributesManager.getSessionAttributes();

        let data = await getUserData(session, userId);
        game.load(data);

        const speechText = game.processRequest("help");


        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            // .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            //.withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);
        const speechText = 'Sorry, I can\'t understand the command. Please say again.';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler,
        AddRuleIntentHandler,
        AddRuleEventIntentHandler,
        AddRuleActionIntentHandler,
        AddRuleValueIntentHandler,
        RemoveRuleIntentHandler,
        CreateNewGameIntentHandler,
        GetAccessCodeIntentHandler,
        ListEventsIntentHandler,
        ListActionsIntentHandler,
        ListValuesIntentHandler,
        WhatIsAnEventIntentHandler,
        WhatIsAnActionIntentHandler,
        WhatIsAValueIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();