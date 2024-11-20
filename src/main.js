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

  /**
   * all files in the specified path
   * @type {string[]}
   */
  const fileNames = [];

  for await (const dirEntry of fs.walk(filePath)) {
    if (!dirEntry.isFile) {
      continue;
    }

    fileNames.push(dirEntry.path);
  }

  if (!fileNames.length) {
    printNormal(`no files in ${filePath}`);
    Deno.exit(0);
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
      for (const fileName of toTraditionalFileNames) {
        try {
          // rename file only, does not rename path
          const baseName = path.basename(fileName);
          const filePath = path.dirname(fileName);
          const traditional = convert.toTraditional(baseName, true);
          const newFileName = path.join(filePath, traditional);
          Deno.renameSync(fileName, newFileName);
          printNormal(
            `${fileName} -> ${newFileName}, convert to traditional Chinese complete`,
          );
        } catch (error) {
          printRed(
            `failed to convert to traditional Chinese, error:${error}`,
          );
        }
      }
    }
  } else {
    printNormal('all filenames do not contain simplified Chinese');
  }
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
