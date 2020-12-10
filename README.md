# git-better
![Unit Tests](https://github.com/beardyman/git-better/workflows/Unit%20Tests/badge.svg)

A Tool suite of git extensions for day to day use.

Includes configurable workflows that ensure up-to-date branches before creating or finishing working branches.

Included commands are:
```shell script
git start
git update
git finish
git rename
git promote
git open
```

## Installation
Works with node 10 or newer.
```shell script 
npm i -g @beardyman/git-better
```

## Configuration
`git-better` has some defaults, however if you have a non-traditional base branch name or want to use some of its more 
advanced features, you're going to want to create a configuration.  

Configurations will be read from two different spots and if they both exist, merged together favoring values in the 
config closest to the code.

You can create a config by hand, however there is a built-in helper to initialize a config from one of the examples in 
this repository under /example-configs.
```shell script
git better-init hotfix
# or for a global config
git better-init --global hotfix
```
This will create a file called `.gbrc.json` in the root of your repository (or in your home folder if you chose 
the `--global` option). If you like, you can convert that file to a `.js` file and export your config.

### Configuration Options
There are only a few base configuration options. These are their defaults: 
```json
{
  "defaultBase": "main",
  "defaultRemote": "origin",
  "alwaysPush": false
}
```
`defaultBase` is the base branch that any new branch (unless it matches a workflow) will be started from or finished 
into.

`defaultRemote` is the remote to push and pull from. This is generally `origin` however some workflows may specify 
different remotes for certain purposes. This is overridable with the `-r|--remote` option.

`alwaysPush` specifies to push your branches when taking a given action. `git finish` for example will merge your working 
branch into its base branch and if this option is true immediately push your merge to the remote. This is overridable 
with the `-p|--push` option

### Defining Workflows
Workflows can be defined to take specific actions when starting or finishing branches. These are also defined in the 
`.gbrc.json` configuration file. An example configuration for a hotfix workflow:
```json
{
  "workflows": {
    "feature": {
      "from": "develop",
      "to": "develop"
    },
    "hotfix": {
      "from": "main",
      "to": [
        "main",
        "develop"
      ]
    }
  },
  "promotionPaths": {
    "develop": "main"
  }
}
```
This configuration defines two workflows for `feature` and `hotfix` branches. This sort of workflow is useful if you 
need to have multiple base branches for a development environment vs a production environment.  

The `feature` workflow is pretty simple.  It will create new branches from the `develop` branch and also finish branches 
into the `develop` branch. To start a new feature branch, use `git start feature myBranch`, this will create a branch 
named `feature/myBranch` from the `develop` branch using this workflow.

The `hotfix` workflow works a little differently. It will create new branches from the `main` branch, but it will merge
the branch into `main` and then `develop` branch.  This allows hotfixes to bypass development environments but still 
merge any fixes into the develop codebase.

Finally, this configuration also defines a promotion path from `develop` to `main`.  This means that when `git promote` 
is ran on the `develop` branch, the `develop` branch will be merged into the `main` branch effectively promoting the 
development environment to the production environment in this example.

## Usage
Open the repository UI
```shell script
cd my-git-repo
git open
```

Start a new branch
```shell script
git start feature myBranch
```

Open the repository UI to the current branch
```shell script
git open -b|--branch
```

Update your branch from its base branch
```shell script
git update
```

Rename a branch
```shell script
git rename newBranchName
```

Finish your branch
```shell script
git finish
```

Finish and push your branch
```shell script
git finish -p|--push
```

Promote one trunk branch to another
```shell script
# From the develop branch
git promote
```

## Documentation
Each command has its own man page where all of the options are documented.
They can be opened like so:
```shell script
man git-finish
```
