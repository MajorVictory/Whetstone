@echo off
cd ..
"C:/Program Files/7-Zip/7z.exe" a Whetstone.zip "I:\DnD\FoundryVtt\Data\modules\Whetstone" -xr!*.git* -xr!makezip.bat -xr!Thumbs.db -xr!*.zip -xr!*.pdn
pause

