# KIT-KAFKA-TOOL

This is a simple CLI helper that simplifies the task of sending messages to a kafka topic.

# Installation
The instruction below will clone the repository, create system wide links so that you can execute the script from any folder and create and edit a configuration file.
```
$ git clone git@github.com:KITMedia/kit-kafka-tool.git
$ cd kit-kafka-tool
$ npm link
$ mkdir ~/.kt
$ touch ~/.kt/config.json
$ nano ~/.kt/config.json
```

# Usage
Send 10 message using a CLI argument as the message payload.
```
$ kt l -n 10 -t kvid -j message.json
```

Send 10 messages using a CLI argument as a path to a JSON file containing your message payload.
```
$ kt l -n 10 -t kvid -m MyMessage
```

```
Usage: kt [env] [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -n --numberOfMessages <n>  The amount of messages to send to a kafka topic.
    -t --topic [value]         Topic
    -m --message [value]       Message to send to topic
    -j --json [value]          JSON file containing the message payload
```

# Configuration
The [env] argument loads it’s information from the file *~./kt/config.json* which allows you to have multiple environments using shortnames.
```
{
	"env": {
		"l": {
			"zookeeper": {
				"host": "localhost",
				"port": 2181
			}
		}
	}
}
```