# Runtime

[![GitHub Actions CI](https://github.com/nmshd/cns-runtime/workflows/Publish/badge.svg)](https://github.com/nmshd/cns-runtime/actions?query=workflow%3APublish)
[![npm version](https://badge.fury.io/js/@nmshd%2fruntime.svg)](https://www.npmjs.com/package/@nmshd/runtime)

The Enmeshed Runtime defines a framework for Enmeshed applications. This framework brings a module architecture: if the developer using this framework inherits from the provided `Runtime` class, they can reuse so called modules. Modules can be written by third party developers. One example for such a module could be the handling of Enmeshed messages with a specific `@type`.

In order to simplify the development of those modules, this project delivers wrappers around the functionality of the [transport](https://www.npmjs.com/package/@nmshd/transport)- and [consumption](https://www.npmjs.com/package/@nmshd/consumption)-library which map the data types from their rather technical format to a more consumer-friendly format.

Both the Enmeshed Connector and the official Enmeshed Apps implement this runtime.

## Documentation

The documentation for this project is currently under construction.

## Contribute

Currently contribution to this project is not possible. This will change soon.

## License

[UNLICENSED](LICENSE)
