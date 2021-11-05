# Tabs Quick Access

Firefox add-on that allows to store specific tabs and quickly jump back to them via the add-ons's quick access menu.

> This add-ons is under development and not published on [addons.mozilla.org](https://addons.mozilla.org) (AMO) yet!

## Build

This repository uses webpack to optimize files in the `/src` directory and generate binary artifacts like icons.

The generated output will be put into `/dist` and is the code ready to be submitted to AMO.

Run the build with

```sh
$ npm run build
```

## Install

You can install the contents of `/dist` as temporary add-on in Firefox for testing purposes and development.

Open _about:debugging_ in the address bar and switch to the _This Firefox_ tab.

Click on _Load Temporary Add-on_ and open `/dist/manifest.json`. The add-on will stay loaded until you close Firefox.
