class FlappyBirdGame {
    constructor(userId, dataManager) {
        this.dataManager = dataManager;

        this.name = "FlappyBirdGame";
        this.events = ["start", "tap", "hit box", "hit star", "hit ground", "hit top"]; //, "win", "lose"
        this.suggestedEvents = ["start", "tap", "hit box", "hit star", "hit ground", "hit top"];
        this.actions = ["move forward", "play sound", "flap", "add points", "set gravity", "set background", "flip gravity", "crash"];
        this.eventActions = {
            "start": ["move forward", "play sound", "set gravity", "set background", "flip gravity", "add points"],
            "tap": ["flap", "play sound", "set gravity", "set background", "flip gravity", "move forward", "add points"],
            "hit box": ["crash", "add points", "play sound", "set gravity", "set background", "flip gravity"],
            "hit star": ["crash", "add points", "play sound", "set gravity", "set background", "flip gravity"],
            "hit ground": ["crash", "play sound", "set gravity", "set background", "flip gravity", "add points"],
            "hit top": ["crash", "play sound", "set gravity", "set background", "flip gravity", "add points"],
            "win": ["play sound", "set background", "add points", "flip gravity"],
            "lose": ["play sound", "set background", "add points", "flip gravity"]
        };
        this.suggestedEventActions = {
            "start": ["move forward", "play sound", "set gravity", "set background"],
            "tap": ["flap", "play sound"],
            "hit box": ["crash", "play sound"],
            "hit star": ["add points", "play sound"],
            "hit ground": ["crash", "play sound"],
            "hit top": ["crash", "play sound"],
            "win": ["play sound", "set background"],
            "lose": ["play sound", "set background"]
        };
        this.actionValues = {
            "move forward": ["slow", "medium", "fast", "super fast"],
            "set gravity": ["large", "medium", "small", "reverse"],
            "play sound": ["boing", "spring", "twang", "slide whistle", "pop", "splat", "well done", "random"],
            "flap": ["small", "medium", "large"],
            "set background": ["sky", "winter", "moon", "forest", "desert", "random"],
            "add points": ["1", "10", "100", "1000"]
        };
        this.startText = "Welcome, Let's create a game. ";
        this.resumeText = "Welcome, Let's continue working on your game. ";
        this.helpText = `Voice Coder helps you learn about coding while creating your own game.  The game starts without any logic or rules.  
        Your job is to program rules.  Rules include events, actions, and sometimes values.  Events are when something happens.  Actions do stuff, like move, play a sound, or give points. 
        You can add a new rule by saying, "add new rule".  
        Once your game is created, you can play it on your mobile, tablet, or desktop computer.  
        To play your game, go to, <emphasis level="moderate">voice coder dot net</emphasis> and enter your access code.  
        You can share you created game with other people using the same code.
        Just ask me for your access code. To add a rule, say "add rule". To start over with a new game, say "new game".  You can get a list of all the events by asking, "List all events". For more details about events, actions, or values, just ask.
        `;
        this.whatIsAnEventText = "Events are when something happens. When a certain condition is met, an event is triggered.  These triggered events can be used to execute actions in the program.  ";
        this.whatIsAnActionText = "Actions do stuff. They can change the properties of game objects.  For example, set background to moon or move the player forward.  ";
        this.whatIsAVauleText = "Values are the settings applied to the action.  An action may do many different thing depending on the values it is passed.  These values are often called parameters.  ";



        this.tips = [
            {
                prompt: "Let's start with the first event. When the game starts the player needs to move forward.  What value do you want to assign it? slow, medium, fast, or super fast?",
                event: "start",
                action: "move forward",
                rule: { event: "start", action: "move forward", value: null },
                context: "createRuleValue",
                order: 0
            },
            {
                prompt: "On tap, the player should fly up.  How much should it fly up? small, medium, or large?",
                event: "tap",
                action: "flap",
                rule: { event: "tap", action: "flap", value: null },
                context: "createRuleValue",
                order: 1
            },
            {
                prompt: `Try adding a rule, when the player hits a star, then add points.  Say, 'add rule, when hit star, add points'.  `,
                event: "hit star",
                action: "add points",
                order: 2
            },
            {
                prompt: `Try adding a rule, when the player hits a star, then play a sound.  Say, 'add rule, when hit star, play sound'.  `,
                event: "hit star",
                action: "play sound",
                order: 2
            },
            {
                prompt: `Try adding a rule, when the player hits a box, then crash.  Say, 'add rule, when hit box, crash'.  `,
                event: "hit box",
                action: "crash",
                order: 2
            },
            {
                prompt: `Try changing the background.  Say, 'add rule, when start, set background'.  `,
                event: "start",
                action: "set background",
                order: 2
            },

            {
                prompt: `Try adding a rule, when the player hits a box, then play a sound.  Say, 'add rule, when hit box, play sound'.  `,
                event: "hit box",
                action: "play sound",
                order: 2
            },
            {
                prompt: `Try adding a silly rule.  Say, 'add rule, on tap, flip gravity'.  `,
                event: "tap",
                action: "flip gravity",
                order: 2
            },
            {
                prompt: `You can clear your current game and start fresh by saying, 'Create new game'.  `,
                event: null,
                action: null,
                order: 2
            },
            {
                prompt: `Try adding a silly rule.  Say, 'add rule, when tap, set background to random'.  `,
                event: "tap",
                action: "set background",
                order: 2
            },
            {
                prompt: `To add another rule, say "Add Rule".  You can always ask me for help.  `,
                event: null,
                action: null,
                order: 2
            }
        ];
        //todo: set up synonyms via alexa: https://developer.amazon.com/docs/custom-skills/define-synonyms-and-ids-for-slot-type-values-entity-resolution.html
        //The value "track"
        //The canonical value "song"
        this.synonyms =
            {
                "play a sound": "play sound",
                "hits box": "hit box",
                "hit the box": "hit box",
                "hits the box": "hit box",
                "hit a box": "hit box",
                "hits a box": "hit box",
                "touches box": "hit box",
                "touches the box": "hit box",
                "touches a box": "hit box",
                "hits star": "hit star",
                "hit the star": "hit star",
                "hits the star": "hit star",
                "hit a star": "hit star",
                "hits a star": "hit star",
                "touches star": "hit star",
                "touches the star": "hit star",
                "touches a star": "hit star",
                "hit the top": "hit top",
                "hit the buttom": "hit buttom",
                "change background": "set background",
                "change gravity": "set gravity",
                "fly": "flap",
                "game starts": "start",
                "set speed": "move forward",
                "set the speed": "move forward",
                "set player speed": "move forward",
                "move player forward": "move forward",
            };

        this.rules = [];
        this.author = null;
        this.accessCode = null;

        this.context = null;
        this.currentRule = null;

        this.userId = userId || "testId";

        this.onSave = function (data) { };
    }
    processRequest(command, parameters, context) {
        if (!context) context = this.context;
        if (!parameters) parameters = command;
        if (!command) command = "";

        //process request
        let output = "";

        if (command === "start") {
            let resultsMsg = this.start();
            output += resultsMsg;
        }
        if (command === "help") {
            let resultsMsg = this.help();
            output += resultsMsg;
        }
        else if (command === "get code") {
            //output += `Access code is: <emphasis level="strong"><say-as interpret-as="spell-out">${this.accessCode}</say-as></emphasis>. \n`;
            output += this.getAccessCode();
        }
        else if (command === "get code only") {
            //output += `Access code is: <emphasis level="strong"><say-as interpret-as="spell-out">${this.accessCode}</say-as></emphasis>. \n`;
            output += this.getAccessCode();
            return output;
        }
        else if (command === "new game") {
            this.reset();
            output += "New game created. \n";

            let resultsMsg = this.start();
            output += resultsMsg;
        }
        else if (command === "what is an event") {
            let results = this.whatIsAnEvent();
            return results;
        }
        else if (command === "what is an action") {
            let results = this.whatIsAnAction();
            return results;
        }
        else if (command === "what is a value") {
            let results = this.whatIsAVaule();
            return results;
        }
        else if (command === "list all rules") {
            // let resultsMsg = this.start();
            // output += resultsMsg;
        }
        else if (command === "list all events") {
            let resultsMsg = this.listEvents();
            output += resultsMsg;
        }
        else if (command === "list actions") {
            let event = parameters;
            let resultsMsg = this.listActions(event);
            output += resultsMsg;
        }
        else if (command === "list values") {
            let action = parameters;
            let resultsMsg = this.listValues(action);
            output += resultsMsg;
        }
        else if (command === "createRule") {
            let event = parameters.event;
            let action = parameters.action;
            let value = parameters.value;
            let resultsMsg = this.addRule(event, action, value);
            output += resultsMsg + "\n";
            //todo: when some parameters are missing, ask for missing data starting with the createRuleEvent
        }
        else if (command === "remove rule") {
            let event = parameters.event;
            let action = parameters.action;
            let value = parameters.value;
            let resultsMsg = this.removeRule(event);
            output += resultsMsg + "\n";
        }
        else if (command === "add rule") {

            let resultsMsg = this.startNewRuleToCurrentRule();
            output += resultsMsg + "\n";
            //ask for missing data starting with the createRuleEvent.  This context is started in getNextPrompt() when if notices a currentRule
        }
        else if (command === "createRuleEvent" || context === "createRuleEvent") {
            let event = parameters;
            let resultsMsg = this.addEventToCurrentRule(event);
            output += resultsMsg + "\n";
            //todo: set message here and have addEventToCurrentRule return bool. no need to give all options as it will ask again.
        }
        else if (command === "createRuleAction" || context === "createRuleAction") {
            let action = parameters;
            let resultsMsg = this.addActionToCurrentRule(action);
            output += resultsMsg + "\n";
            //todo: set message here and have addEventToCurrentRule return bool. no need to give all options as it will ask again.
        }
        else if (command === "createRuleValue" || context === "createRuleValue") {
            let value = parameters;
            let resultsMsg = this.addValueToCurrentRule(value);
            output += resultsMsg + "\n";
            //todo: set message here and have addEventToCurrentRule return bool. no need to give all options as it will ask again.
        }

        output += this.getNextPrompt();
        return output;
    }
    getNextPrompt() {
        //todo: move all "this." to top of function to be replaceble
        let output = "";

        //reset context : could context be saved/passed in from request instead of .this?  Should send with response for the client to send back with request.
        this.context = null;


        // //Tutorial
        // let nextStep = this.getNextTutorialStep();
        // if (nextStep) {
        //     if (!this.currentRule) {
        //         this.currentRule = nextStep.rule;
        //         this.context = nextStep.context;
        //         output = nextStep.prompt;
        //         return output;
        //     }
        // }

        //get current rule and get the next step
        //get event
        if (this.currentRule && !this.currentRule.event) {
            let allEvents = this.events;
            output += `What event should trigger the rule?  `;
            output += `Suggested events are: ${allEvents.join(", ")}`;
            this.context = "createRuleEvent";
            return output;
        }
        //get action
        if (this.currentRule && this.currentRule.event && !this.currentRule.action) {
            let event = this.currentRule.event;
            let allActions = this.suggestedEventActions[event];
            if (!allActions) {
                allActions = this.actions;
            }
            output += `When the event, ${this.currentRule.event}, is triggered, what action should happen?  `;
            output += `Suggested actions are: ${allActions.join(", ")}`;
            this.context = "createRuleAction";
            return output;
        }
        //get value
        if (this.currentRule && this.currentRule.action && !this.currentRule.value) {
            let allValues = this.actionValues[this.currentRule.action];
            if (allValues) {
                output += `The action, ${this.currentRule.action}, needs a value, what should it be?  `;
                output += `Suggested values are: ${allValues.join(", ")}`;
                this.context = "createRuleValue"
                return output;
            }
        }


        //check if all steps are done
        // let isReady = (!nextStep && !this.currentRule);
        // let ruleCount = this.rules.length || 0;
        // if (isReady) {
        // }

        //default output

        //Should this be said every time?
        let ruleCount = this.rules.length;
        if (ruleCount == 2 || ruleCount == 4 || ruleCount == 6 || ruleCount == 8) {
            output += this.getHowToPlay();
        }

        //get tip if not in the middle of a rule
        output += this.getTip();

        return output;
    }
    help() {
        let output = this.helpText;
        this.context = null;
        this.currentRule = null;
        return output;
    }
    getAccessCode() {
        this.context = null;
        this.currentRule = null;
        return this.getHowToPlay();
    }
    getHowToPlay() {


        // let output = `Your game is ready.  Go to <emphasis level="moderate">voice coder dot net</emphasis> and enter your access code to play.
        // Your access code is: <emphasis level="strong"><say-as interpret-as="spell-out">${this.accessCode}</say-as></emphasis>.   
        // <break time="2s"/> `;
        let output = `Your game is ready.  Go to <emphasis level="moderate">voice coder dot net</emphasis> and enter your access code: 
        <emphasis level="strong">${this.accessCode.split('').join(', ')}</emphasis>.   
        <break time="2s"/> `;
        return output;
    }
    getTip() {
        let rules = this.rules;
        // let isTutorialdone = !this.getNextTutorialStep();
        let ruleCount = this.rules.length || 0;

        //default tip
        let output = `To add another rule, say "Add Rule".  You can always ask me for help`;
        let tipsNotDone = this.tips.filter(function (tip) {
            let ruleFound = rules.find(function (rule) {
                if (tip.event && tip.event !== rule.event) {
                    return false;
                }
                if (tip.action && tip.action !== rule.action) {
                    return false;
                }
                if (!tip.event && !tip.action) {
                    return false;
                }
                return true;
            });
            let noMatch = !ruleFound;
            return noMatch; //return tips with no matching rule
        });
        // get lowest order possible
        let allOrders = tipsNotDone.map(function (tip) {
            return tip.order;
        });
        let lowestOrder = allOrders.reduce(function (prev, curr) {
            return prev < curr ? prev : curr;
        });
        //all with order number
        const tips = tipsNotDone.filter(tip => tip.order === lowestOrder);
        if (tips.length > 0) {
            let tip = tips[Math.floor(Math.random() * tips.length)];
            output = tip.prompt;
            if (!this.currentRule && tip.rule) {
                this.currentRule = tip.rule || null;
                this.context = tip.context || null;
            }
        }


        return output;
    }

    start() {
        this.context = null;
        this.currentRule = null;

        let isNew = (this.rules.length === 0);
        if (isNew) {
            return this.startText;
        } else {
            return this.resumeText;
        }
    }
    reset() {
        this.rules = [];
        this.author = null;
        this.accessCode = null;

        this.context = null;
        this.currentRule = null;
    }
    startNewRuleToCurrentRule() {
        this.currentRule = { event: null, action: null };
    }
    addEventToCurrentRule(event) {
        let output = "";

        if (this.synonyms[event])
            action = this.synonyms[event];

        if (!this.currentRule) {
            this.startNewRuleToCurrentRule();
        }
        //try to add a rule 
        let results = this.addEventToRule(this.currentRule, event);
        if (results) {
            // output = `Event ${event} added.  `;
        } else {
            //let allowedEvents = this.events.join(",");
            // output = `Event ${event} is not a valid event.  Possible events are ${allowedEvents}.  `;
            output = `Event ${event} is not a valid event.  `;
        }
        //add rule if all paramters are there
        let valid = this.isRuleValid(this.currentRule);
        if (valid) {
            output = this.addRule(this.currentRule.event, this.currentRule.action, this.currentRule.value);
            this.currentRule = null;
        }
        return output;
    }
    addActionToCurrentRule(action) {
        let output = "";

        if (this.synonyms[action])
            action = this.synonyms[action];

        if (!this.currentRule) {
            this.startNewRuleToCurrentRule();
        }
        //try to add a rule 
        let results = this.addActionToRule(this.currentRule, action);
        if (results) {
            // output = `Action ${action} added.  `;
        } else {
            // let allowedActions = this.actions.join(",");
            // output = `Action ${action} is not a valid action. Possible actions are ${allowedActions}.  `;
            output = `Action ${action} is not a valid action. `;
        }
        //add rule if all paramters are there
        let valid = this.isRuleValid(this.currentRule);
        if (valid) {
            output = this.addRule(this.currentRule.event, this.currentRule.action, this.currentRule.value);
            this.currentRule = null;
        }
        return output;
    }
    addValueToCurrentRule(value) {
        let output = "";

        if (this.synonyms[value])
            value = this.synonyms[value];

        if (!this.currentRule) {
            this.startNewRuleToCurrentRule();
        }
        //try to add a rule 
        let results = this.addValueToRule(this.currentRule, value);
        if (results) {
            // output = `Value ${value} added.  `;
        } else {
            // let allowedValues = this.actionValues[this.currentRule.action].join(",");
            // output = `Value ${value} is not a valid value. Possible values are ${allowedValues}.  `;
            output = `Value ${value} is not a valid value. `;
        }
        //add rule if all paramters are there
        let valid = this.isRuleValid(this.currentRule);
        if (valid) {
            output = this.addRule(this.currentRule.event, this.currentRule.action, this.currentRule.value);
            this.currentRule = null;

        }
        return output;
    }

    addEventToRule(rule, event) {
        if (!rule) return false;
        if (!event) return false;
        if (!this.events.includes(event)) return false;

        rule.event = event;

        return true;
    }
    addActionToRule(rule, action) {
        if (!rule) return false;
        if (!action) return false;
        if (!this.actions.includes(action)) return false;

        rule.action = action;

        return true;
    }
    addValueToRule(rule, value) {
        if (!rule) return false;
        if (!rule.action) return false;
        if (!this.actionValues[rule.action].includes(value)) return false;

        rule.value = value;

        return true;
    }
    isRuleValid(rule) {
        let requiresValue = this.actionValues[this.currentRule.action];
        if (this.currentRule && this.currentRule.event && this.currentRule.action && (this.currentRule.value || !requiresValue)) {
            return true;
        }
        return false;
    }

    addRule(event, action, value) {
        this.currentRule = null;

        if (this.synonyms[event])
            event = this.synonyms[event];

        if (this.synonyms[action])
            action = this.synonyms[action];

        if (this.synonyms[value])
            value = this.synonyms[value];

        if (!event) {
            this.currentRule = { event: null, action: null };
            return "";
            //return "No event found.  ";
        }
        if (!this.events.includes(event)) {
            let allowedEvents = this.events.join(", ");
            return `${event} is not a valid event.  `;
            // return `Event not found for this game: ${event}. Options: ${allowedEvents} .  `;
        } else {
            this.currentRule = { event: event, action: null };
        }
        if (!action) {
            return "";
            // return "No action found.  ";
        }
        if (!this.actions.includes(action)) {
            let allowedActions = this.actions.join(", ");
            return `${action} is not a valid action.  `;
            //return `Action not found for this game. `;
            // return `Action not found for this game . Options: ${allowedActions} .  `;
        } else {
            this.currentRule = { event: event, action: action };
        }

        let actionValues = this.actionValues[action];
        if (actionValues) {
            if (!value) {
                return "";
                // return "No value found.  ";
            }
            if (!actionValues.includes(value)) {
                let allowedValues = actionValues.join(", ");
                return `${value} is not a valid value for the action ${action}. `;
                // return `Value not allowed for this action: ${action}. Options: ${allowedValues} .  `;
            }
        }
        //remove any existing rule that has the same event and action
        this.removeRule(event, action);
        this.rules.push({
            event: event,
            action: action,
            value: value
        });
        this.currentRule = null;
        //trigger save event
        this.save();
        let output = "Rule added.  ";

        return output;
    }
    clearAll(eventName) {
        this.rules = [];
    }
    removeRule(event, action) {
        //remove any existing rule that has the same event and action
        this.rules = this.rules.filter(e =>
            !(e.event === event && (!action || e.action === action))
        );
        return "Rules removed.  ";
    }
    clearEvent(event) {
        //remove any existing rule that has the same event
        this.rules = this.rules.filter(e => !e.event === event);
    }
    listEvents() {
        let events = this.events.join(", ");
        return `Possible events are: ${events}. `;
    }
    listActions(event) {
        let actions = this.actions.join(", ");
        return `Possible actions are: ${actions}. `;
    }
    listValues(action) {
        let acationValid = this.actions[action];
        if (!acationValid) return `${action} is not a valid acation`;

        let actionValue = this.actionValues[action];
        if (!actionValue) return `${action} has not values`;

        let values = actionValue.join(", ");
        return `Possible values are: ${values}. `;
    }
    whatIsAnEvent() {
        return this.whatIsAnEventText;
    }
    whatIsAnAction() {
        return this.whatIsAnActionText;
    }
    whatIsAVaule() {
        return this.whatIsAVauleText;
    }


    load(data) {
        if (data) {
            this.name = data.name || null;
            this.rules = data.rules || [];
            this.author = data.author || null;
            this.accessCode = data.accessCode || null;
            this.context = data.context || null;
            this.currentRule = data.currentRule || null;
        }
    }
    getData() {
        let data = {};
        data.name = this.name || null;
        data.rules = this.rules || [];
        data.author = this.author || null;
        data.accessCode = this.accessCode || null;
        data.context = this.context || null;
        data.currentRule = this.currentRule || null;
        return data;
    }
    async  save() {
        let data = this.getData();
        this.onSave(data);
    }
    // async  save1() {
    //     let userId = this.userId;
    //     if (typeof this.dataManager == 'undefined') {
    //         return "Failed to save: dataManager == 'undefined'";
    //     }
    //     try {
    //         let data = {
    //             game: this.name,
    //             rules: this.rules,
    //             author: this.author
    //         }
    //         let id = await this.dataManager.save(userId, data);
    //         this.accessCode = id;
    //         return "Data saved: " + this.accessCode;
    //     } catch (ex) {
    //         return "Failed to save:" + ex;
    //     }
    // }

}
// Node.js
if (typeof module !== 'undefined' && typeof exports === 'object') { module.exports = FlappyBirdGame; }