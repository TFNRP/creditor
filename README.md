# PMARP Creditor

An easy to use Command-Line Interface for building creditory information from resource manifests, with the added feature of custom `manifest.yaml` files that acts like a normal manifest.  

## Installation

```sh-session
npm install @pmarp/creditor --global
```

## Usage

Search through all directories for `fxmanifest.lua`, `__resource.lua` and custom `manifest.yaml` files and output the result to a file `credits.json`.

```sh-session
creditor --output ./credits.json
```

## Credits

Special thanks to [glitchdetector](https://github.com/glitchdetector) for the idea, concept and his original [fx-credits](https://github.com/glitchdetector/fx-credits).
