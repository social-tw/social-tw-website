# Local Development

# Troubleshooting Tips
* pull latest changes from master and `yarn install` and `yarn build`
* install circom if you haven't already
* run following command and set up Twitter API Key. By default, it's a invalid API key.
    ```shell
    cp packages/relay/.env_example packages/relay/.env
    ```
* you may start all daemons in one terminal window with `yarn start`, or start each daemon in a separate terminal window. If you start separately, it's easier to debug, since you don't need to restart hardhat node and redeploy contracts every time you change the code.

## Use VSCode Debugger to Debug Relay
With this configuration `.vscode/launch.json` in place, you can use VSCode debugger to debug relay.
```json
"version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Attach to backend process TS-Node",
            "processId": "${command:PickProcess}",
            "skipFiles": [
                "<node_internals>/**"
            ]
        },
    ],
```

![Select debug configuration](./images/AttachProcess.png)
Select debug configuration
![Attach to process](./images/AttachProcess2.png)
attach to process
![Set breakpoint](./images/SetBreakpoint.png)
and set breakpoint.

You may also use auto attach mode, which will automatically attach to the process when you start the relay server or run testing suite. If auto 

# Testing
In the root directory, run:
```shell
yarn run test
```
or run tests for a specific package:
```shell
yarn run test --scope @unirep-app/relay
```
To run specific test file:
```shell
yarn test test/login.test.ts
```

We use nock to mock the HTTP requests. If you want to run the tests with real HTTP requests. You can turn on nock debug mode by setting `DEBUG=nock.*` in front of your shell command and run the tests.
```shell
DEBUG=nock.* yarn test test/login.test.ts
```
