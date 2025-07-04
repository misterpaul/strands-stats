# Request

i have npm 24 installed. when i run `npm install` I get the following:

```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'cloudevents@8.0.3',
npm warn EBADENGINE   required: { node: '>=16 <=22' },
npm warn EBADENGINE   current: { node: 'v24.2.0', npm: '11.3.0' }
npm warn EBADENGINE }
```

# Response

Ah, that's a very common and expected warning when working on the cutting edge of Node.js versions!

Here's what's happening and how to solve it:

What it means: This is a warning, not an error. The installation likely succeeded. One of the dependencies your project uses (`cloudevents`, which is a dependency of the Functions Framework) has a rule in its `package.json` file that says, "I have only been officially tested on Node versions 16 through 22."

Why it's happening: You are using Node 24, which is newer than the "officially supported" range for that sub-package. The package author is just being cautious. Since we're in July 2025, it's almost certain the package works fine with Node 24, but the author just hasn't updated that version number yet.

How to fix it: You can tell npm to ignore this specific warning and proceed. This is a safe and standard practice in this scenario.

Run the installation command again with the `--ignore-engines` flag:

Bash

`npm install --ignore-engines`

This will install all the dependencies and suppress the EBADENGINE warning. Your local testing setup should work perfectly after this.
