import * as convert from '@raise/han-convert';
import * as path from '@std/path';
import * as fs from '@std/fs';

if (import.meta.main) {
  if (!getCurrentJsFileName()) {
    printRed('can not get current js filename');
    Deno.exit(1);
  }

  if (!Deno.args.length) {
    printUsage();
    Deno.exit(0);
  }

  const filePath = Deno.args[0];
  printNormal(`filePath:${filePath}`);

  if (!fs.existsSync(filePath, { 'isDirectory': true })) {
    printRed(`${filePath} is not a path.`);
    Deno.exit(1);
  }

  await doPath(filePath);
  await doFile(filePath);
}

/**
 * print string with red
 * @param {string} str
 */
function printRed(str) {
  console.log(`%c${str}`, 'color: red');
}

/**
 * just normaly print string
 * @param {string} str
 */
function printNormal(str) {
  console.log(str);
}

function getCurrentJsFileName() {
  return import.meta.filename ? import.meta.filename : '';
}

function printUsage() {
  printNormal(
    `usage:\ndeno run -A src/${
      path.basename(getCurrentJsFileName())
    } <file path>`,
  );
}

/**
 * process path
 * @param {string} filePath
 */
async function doPath(filePath) {
  const pathNames = [];

  for await (const dirEntry of fs.walk(filePath)) {
    if (dirEntry.isDirectory) {
      pathNames.push(dirEntry.path);
    }
  }

  if (!pathNames.length) {
    printNormal(`no paths in ${filePath}`);
    return;
  }

  printNormal('\n');

  /**
   * the paths to be converted
   * @type {string[]}
   */
  const toTraditionalPathNames = [];

  // check the path name
  for (const pathName of pathNames) {
    const baseName = path.basename(pathName);
    const traditional = convert.toTraditional(baseName, true);

    if (baseName !== traditional) {
      printRed(`pathName:${pathName}, contains simplified Chinese`);
      toTraditionalPathNames.push(pathName);
    }
  }

  if (toTraditionalPathNames.length) {
    const input = confirm(
      'do you want to convert the path names listed above to traditional Chinese?',
    );

    if (input) {
      toTraditionalPathNames.sort().reverse();
      convertToTraditional(toTraditionalPathNames);
    }
  } else {
    printNormal('all path names do not contain simplified Chinese');
  }
}

/**
 * process file
 * @param {string} filePath
 */
async function doFile(filePath) {
  /**
   * all files in the specified path
   * @type {string[]}
   */
  const fileNames = [];

  for await (const dirEntry of fs.walk(filePath)) {
    if (dirEntry.isFile) {
      fileNames.push(dirEntry.path);
    }
  }

  if (!fileNames.length) {
    printNormal(`no files in ${filePath}`);
    return;
  }

  printNormal('\n');

  /**
   * the files to be converted
   * @type {string[]}
   */
  const toTraditionalFileNames = [];

  // check the filename
  for (const fileName of fileNames) {
    const baseName = path.basename(fileName);
    const traditional = convert.toTraditional(baseName, true);

    if (baseName !== traditional) {
      printRed(`fileName:${fileName}, contains simplified Chinese`);
      toTraditionalFileNames.push(fileName);
    }

    const regex = new RegExp('^.+ - .+\\.\\w+$', 'g');

    if (!regex.test(baseName)) {
      printRed(`fileName:${fileName}, irregular`);
    }
  }

  if (toTraditionalFileNames.length) {
    const input = confirm(
      'do you want to convert the filenames listed above to traditional Chinese?',
    );

    if (input) {
      convertToTraditional(toTraditionalFileNames);
    }
  } else {
    printNormal('all filenames do not contain simplified Chinese');
  }
}

/**
 * convert filename or path name to traditional Chinese
 * @param {string[]} filesOrPaths
 */
function convertToTraditional(filesOrPaths) {
  for (const oldName of filesOrPaths) {
    try {
      const baseName = path.basename(oldName);
      const tempPath = path.dirname(oldName);
      const traditional = convert.toTraditional(baseName, true);
      const newName = path.join(tempPath, traditional);
      Deno.renameSync(oldName, newName);
      printNormal(
        `${oldName} -> ${newName}, convert to traditional Chinese complete`,
      );
    } catch (error) {
      printRed(
        `failed to convert to traditional Chinese, error:${error}`,
      );
    }
  }
}
