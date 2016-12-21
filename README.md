Skeleton project
================

About
-----
This project is a skeleton ES6 project using JSPM.  It contains a sensible project layout and a basic configuration, from which other JS projects can start.

Usage
-----
Clone the repository, change the required fields within package.json and then change the git repository with:
```bash
$ git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

You will need to install all of the Node and JSPM dependencies before doing anything else by running:
```bash
$ npm install
```

New JSPM packages can be added with:
```bash
$ jspm install [<alias>=]<packagename>
```

Building
--------
You can build the project using:
```bash
$ npm run build
```
This will create `dist/bundle.min.js` which is a self-executing Javascript bundle which can be used in non-ES2015-compliant browsers.  This is probably what you want to do upon release if you are writing a library for general use.

For a specific webapp, it is better to run:
```bash
$ npm run bundle
```
Which will create `public/js/main.bundle.js`.  This means that all code and JSPM dependencies will be bundled into a single Javascript file which will be requested as soon as one of the dependencies is required.  **Once you have done this it will keep using this bundle**.  That means that any changes to the original source will **not** be reflected in the website, until you run `npm run bundle` again, or alternatively remove it with `npm run clean`.

Author
------
[Guy Griffiths](https://github.com/guygriffiths)


