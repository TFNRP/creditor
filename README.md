# PMARP Creditor

An easy to use command-line interface for building creditory information from resource manifests, with the added feature of custom `manifest.yaml` files that can be ignored by the fxserver.  
You can see a preview [here](https://tfnrp.github.io/creditor/html/index.html).

## Installation

With npm

```sh-session
npm install @pmarp/creditor --global
```

## Usage

In shell at the directory of your server's resources, search through all directories for `fxmanifest.lua`, `__resource.lua` and custom `manifest.yaml` files and output the result to a file `credits.json`.

```sh-session
creditor --output ./credits.json
```

## Example

### Fx Manifest

Simply add appropriate [manifest entries](#manifest-entries) to your resource's [`fxmanifest.lua`](https://docs.fivem.net/docs/scripting-reference/resource-manifest/resource-manifest).  
These entries will be read by the creditor and added to the credits.

[Example](https://github.com/TFNRP/creditor/blob/main/test/fxmanifest.lua)
[Preview](https://tfnrp.github.io/creditor/html/index.html#test)
```lua
-- fxmanifest.lua
fx_version 'cerulean'
game 'gta5'

repository 'https://github.com/TFNRP/holster'
version '0.1.0'
author 'Reece Stokes <hagen@hyena.gay>'
description 'Holster resource for FiveM'
```

### Custom YAML

The creditor is not limited to just `fxmanifest.lua`s and will also read any [YAML file](https://yaml.org) with the name `manifest.yaml`.  
This allows you to place credit files in places that should not be registered by your fxserver.  
A particular good use-case can be for resources containing multiple resources, and can be added to the resource's `meta` directory for crediting of individual files & folders.

[Example](https://github.com/TFNRP/creditor/blob/main/test/manifest.yaml)  
[Preview](https://tfnrp.github.io/creditor/html/index.html#Idea%20&%20Concept)
```yaml
# manifest.yaml
name: Idea & Concept
author: glitchdetector
description: Special thanks to glitchdetector.
repository: https://github.com/glitchdetector/fx-credits
```

## Manifest Entries

[200]: https://img.icons8.com/color/24/000000/checked-2--v1.png "Yes"
[400]: https://img.icons8.com/color/24/000000/close-window.png "No"

Entry | Description | Optional | Default | Example
-- | -- | -- | :--: | --
`id`          | This resource's name / id of this credit.                                                                  | ![yes][200] | Resource's name | `'mrpd'`
`name`        | The name to display this credit as.                                                                        | ![yes][200] | id              | `'Mission Row PD'`
`contact`     | An email address to contact the author. This field will be autofilled if an email is supplied in `author`. | ![yes][200] | `nil`           | `'hagendetector@gmail.com'`
`author`      | The author's name. May also contain an email address encased in fat brackets.                              | ![no][400]  | `nil`           | `'Hagen Hyena <hagendetector@gmail.com>'`
`version`     | The version of this software, if any.                                                                      | ![yes][200] | `nil`           | `'1.0.0'`
`description` | The description of this resource/credit.                                                                   | ![yes][200] | `nil`           | `'This resource populates dynamic vehicles in ped traffic.'`
`gta5mods`    | The resource's [gta5-mods](https://gta5-mods.com) post.                                                    | ![yes][200] | `nil`           | `'https://www.gta5-mods.com/vehicles/brute-mr-tasty-gta-iv-style-add-on-liveries-template-sound-custom-shards'`
`repository`  | The resource's GitHub or GitLab repository.                                                                | ![yes][200] | `nil`           | `'https://github.com/TFNRP/axonbody3'`
`download`    | Miscellaneous download URL if no `repository` or `gta5mods` is available.                                  | ![yes][200] | `nil`           | `'https://forum.cfx.re/t/release-modern-seatbelt/4779995'`

## Command-Line Arguments

Argument | Shorthand | Optional | Default | Description | Example
-- | -- | -- | -- | -- | --
`--output` | `-o` | ![no][400] | | Where the output credits json file should go. | `--output ./generated` or `--output ./credits.json`
`--directory` | `-d` | ![yes][200] | Current directory | The directory to recursively scan for manifests. | `--directory ./resources`

## Credits

Special thanks to [glitchdetector](https://github.com/glitchdetector) for the idea, concept and his original [fx-credits](https://github.com/glitchdetector/fx-credits).
