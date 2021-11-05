# Tabs Quick Access

Firefox add-on that allows to store specific tabs and quickly jump back to them via the add-ons's quick access menu.

> This add-ons is under development and not published on [addons.mozilla.org](https://addons.mozilla.org) (AMO) yet!

## Build

This repository uses webpack to optimize files in the `/src` directory and generate binary artifacts like icons.

The generated output will be put into `/dist` and is the code ready to be submitted to AMO.

Install dependencies, then run the build with

```sh
$ npm install
$ npm run build
```

> Webpack sometimes does not run properly. Make sure that both sub-dirs `/dist/icons` and `/dist/popup` are created properly.

## Load add-on in Firefox

You can install the contents of `/dist` as temporary add-on in Firefox for testing purposes and development.

Open _about:debugging_ in the address bar and switch to the _This Firefox_ tab.

Click on _Load Temporary Add-on_ and open `/dist/manifest.json`. The add-on will stay loaded until you close Firefox.

## Develop

You can run the build in watch mode while you are developing. This will make webpack build changes on the fly.

```sh
$ npm run build:watch
```

The contents of the popup will automatically load updated files. If you change the context menu, you have to click _Reload_ in _about:debugging_.
