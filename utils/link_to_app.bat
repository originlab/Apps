@echo off
setlocal enableextensions enabledelayedexpansion
set me=%~n0
set parent=%~dp0

pushd %parent%
for /f "delims=" %%a in ('powershell -executionpolicy bypass -File folderbrowser.ps1') do (
	set sourceapp=%%a
	set appname=%%~nxa
)
if "%appname%"=="" (
	echo User cancel
) else (
	set destapp=!localappdata!\OriginLab\Apps\!appname!
	mklink /J "!destapp!" "!sourceapp!"
)
pause
