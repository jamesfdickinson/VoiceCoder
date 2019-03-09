const VGMCore = require('../VGMCore/src/App.js');
const figlet = require('figlet');
const inquirer = require("inquirer");
const clear = require('clear');


async function main() {

    //title
    clear();
    console.log(figlet.textSync('VGM CLI'));
    console.log('----VGM CLI 1.0.0------');

    let vGMCore = new VGMCore();
    let game = vGMCore.game;

    //load data from server
    try {
        let data = await vGMCore.dataManagerWS.loadOrCreate("1235");
        game.load(data);
    } catch (ex) {
        console.error(ex.message);
    }

    let input = "start";
    //game loop
    while (input != "quit") {
        let response = await game.processRequest(input);
        console.log(response);

        let anwser = await inquirer.prompt([{
            type: 'input',
            name: 'prompt',
            message: " "
        }]);
        input = anwser.prompt;

    }
    let accessCode = await vGMCore.dataManagerWS.save("1235", game.getData());
    console.log(accessCode);
}

main();