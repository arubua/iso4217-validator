#!/usr/bin/env node

const https = require('https');
const program = require('commander');
const csv = require('csv-parse/lib/sync');
const readline = require("readline");
const chalk = require('chalk');

//create interface to enable us to capture user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let list = [];
let userCode = "" ;
const csvUrl = 'https://focusmobile-interview-materials.s3.eu-west-3.amazonaws.com/Cheap.Stocks.Internationalization.Currencies.csv';

//setting the program version and defining the available flags/options the program supports
program
    .version('0.0.1')
    .option('-v, --validate ', 'checks whether your currency is acceptable as a means of payment')
    .parse(process.argv);



if (program.validate ){
    //fetch list of supported currencies from the server
    const req = https.get( csvUrl,(res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            //parse https response to an array list[] defined above using the csv-parse module
            list = csv(chunk, {
                columns: true,
                skip_empty_lines: true
            });
           
            //prompt and capture user currency
            rl.question(`Enter the ${chalk.cyan('ISO 4217 Code')} of whichever Currency you wish to use: `, function(code) {
                userCode = code.toUpperCase();

                //check validity of users currency
                isAcceptable(list);

                rl.close();
              
            });
            //terminate process
            rl.on("close", function() {
                console.log(chalk.cyan("\nThank you for shopping with us!!!"));
                process.exit(0);
            });
        });
    });
    //capture errors
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
};

//Check whether the provided ISO 4217 Code(userCode) is supported
function isAcceptable(currency) { 
    const found = currency.findIndex((country, index) => {
        if(country['ISO 4217 Code'] === userCode)
            return true;
        });
        if(found === -1 ){
            console.log(chalk.red(`Sorry, we currently don't support ${userCode} as a means of payment.`));
        }else{
            console.log(chalk.green(`We accept ${userCode} as a means of payment.`));
        };
};



