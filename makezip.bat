@echo off
cd ..
"C:/Program Files/7-Zip/7z.exe" a Whetstone.zip "E:\Git Repos\Whetstone" -xr!*.git* -xr!makezip.bat -xr!Thumbs.db -xr!*.zip -xr!*.pdn
pause

