# git-better
A Tool suite of git extensions for day to day use.

![Unit Tests](https://github.com/beardyman/git-better/workflows/Unit%20Tests/badge.svg)


## Installation
Works with node 10 or newer.
```shell script 
npm i -g @beardyman/git-better
```

## Usage
Create a config, base it off of one of the examples in `example-configs`.
```shell script
git better-init hotfix
```

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
They can be be opened like so:
```shell script
man git-finish
```
