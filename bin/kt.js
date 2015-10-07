#! /usr/bin/env node

//kt [env] [arguments]
//-p – produce
//-n – number of messages
//-i – interval, sends -n number of messages per interval
//kt local -p kvid -m "message" -n 10
//kt local -p kvid -json ~/file/location.json -n 10 -i 3600

var program = require('commander'),
    kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client(),
    producer,
    envValue,
    payload,
    validate =function (value, errorMessage) {
        if (typeof value === 'undefined') {
            console.error(errorMessage);
            program.outputHelp();
            process.exit(1);
        }
    },
    makePayload = function (options) {
        var _payload = {
            topic: options.topic,
            messages: []
        },
        message;


        if(options.json === true || options.message === true) {
            console.error("You need to specificy a message value or json file.");
            program.outputHelp();
            process.exit(1);

        }

        if(options.json)  {
            validate(options.json, 'Missing argument -j, JSON file containing the message payload to send to kafka topic.');
            var json = require(process.cwd() + "/" + options.json);
            message = JSON.stringify(json);
        } else {
            validate(options.message, 'Missing argument -m, message to send to kafka topic.');
            message = options.message;
        }

        for(var i = 1;i<=options.numberOfMessages; i++) {
            _payload.messages.push(message);
        }
        return [_payload];
    };

program
.version('0.0.1')
    .arguments('[env]')
    .option('-n --numberOfMessages <n>', 'The amount of messages to send to a kafka topic.', parseInt)
    .option('-t --topic [value]', 'Topic')
    .option('-m --message [value]', 'Message to send to topic')
    .option('-j --json [value]', 'JSON file containing the message payload')
    .action(function (env) {
            envValue = env;
        });

program.parse(process.argv);

validate(envValue, 'No [env] specified');
validate(program.numberOfMessages, 'Missing argument -n, amount of messages to send to a kafka topic.');
validate(program.topic, 'Missing argument -t, kafka destination topic.');

producer = new Producer(client);
payload = makePayload(program);

producer.on('ready', function () {
    producer.send(payload, function (err, data) {
        producer.close(
            function () {
                process.exit(0);
            });
    });

});