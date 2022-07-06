# Runtime

[![GitHub Actions CI](https://github.com/nmshd/cns-runtime/workflows/Publish/badge.svg)](https://github.com/nmshd/cns-runtime/actions?query=workflow%3APublish)
[![npm version](https://badge.fury.io/js/@nmshd%2fruntime.svg)](https://www.npmjs.com/package/@nmshd/runtime)

The Enmeshed Runtime defines a framework for Enmeshed applications. This framework brings a module architecture: if the developer using this framework inherits from the provided `Runtime` class, they can reuse so called modules. Modules can be written by third party developers. One example for such a module could be the handling of Enmeshed messages with a specific `@type`.

In order to simplify the development of those modules, this project delivers wrappers around the functionality of the [transport](https://www.npmjs.com/package/@nmshd/transport)- and [consumption](https://www.npmjs.com/package/@nmshd/consumption)-library which map the data types from their rather technical format to a more consumer-friendly format.

Both the Enmeshed Connector and the official Enmeshed Apps implement this runtime.

## Documentation

You can find the documentation for Enmeshed on [enmeshed.eu](https://enmeshed.eu).

## Feedback

Please file any bugs or feature requests by creating an [issue](https://github.com/nmshd/feedback/issues).

Share your feedback with the Enmeshed team by contributing to the [discussions](https://github.com/nmshd/feedback/discussions).

## Contribute

Contribution to this project is highly apprecicated. Head over to our [contribution guide](https://github.com/nmshd/.github/blob/main/CONTRIBUTING.md) to learn more.

## License

[MIT](LICENSE)
