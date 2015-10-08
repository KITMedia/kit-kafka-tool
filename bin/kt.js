#! /usr/bin/env node
var program = require('commander'),
    kafka = require('kafka-node'),
    fs = require('fs'),
    configFilePath = [process.env.HOME, '.kt/config.json'].join('/'),
    Producer = kafka.Producer,
    client,
    producer,
    env,
    payload,
    config,
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
    .action(function (envValue) {
            env = envValue;
        });

program.parse(process.argv);

validate(env, 'No [env] specified');
validate(program.numberOfMessages, 'Missing argument -n, amount of messages to send to a kafka topic.');
validate(program.topic, 'Missing argument -t, kafka destination topic.');

if( !fs.existsSync(configFilePath)) {
    console.error('Missing configuration file in folder', configFilePath);
    program.outputHelp();
    process.exit(1);
}

config = require(configFilePath);
env = config.env[env];

validate(env, ['Environment', env, 'could not be found in configuration file:', configFilePath].join(' '));
validate(env.zookeeper,'Could not find zookeeper property in environment file' );
validate(env.zookeeper.host, 'Could not find zookeeper.host property in environment file.');
validate(env.zookeeper.port, 'Could not find zookeeper.port property in environment file.');

client = new kafka.Client([env.zookeeper.host, env.zookeeper.port].join(':'));
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