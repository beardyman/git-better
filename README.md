# git-better
A Tool suite of git extensions for day to day use.

## Installation
Works with node 10 or newer.
```sh 
npm i @beardyman/git-better
```

## Usage
Create a config, base it off of one of the examples in `example-configs`.
```sh
git better-init hotfix
```

Start a new branch
```sh
git start feature myBranch
```

Update your branch
```sh
git update
```

Rename a branch
```sh
git rename newBranchName
```

Finish your branch
```sh
git finish
```

Promote one trunk branch to another
```sh
# From the develop branch
git promote
```
