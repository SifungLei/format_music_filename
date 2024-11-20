check the filename or sub path in the specified path recursively.  

if the filename or the sub path contains simplified Chinese, the program will try to rename it and convert simplified Chinese to traditional Chinese.  

usage:  
```
deno run -A src/main.js <path>
sh launch.sh <path>

for example:
sh launch.sh ~/music/
deno run -A src/main.js ~/music/
deno run -A .\src\main.js 'D:\music\'
```
