check the filename in the specified path recursively.  

if the filename contains simplified Chinese, the program will try to rename the filename and convert simplified Chinese to traditional Chinese.  

usage:  
```
shell:
deno run -A src/main.js <path>
sh launch.sh <path>

powershell:
deno run -A .\src\main.js 'D:\music\'

for example:
sh launch.sh /d/music
```
