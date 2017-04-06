# Apps
Source code for some Origin Apps

To start you need to setup your local path, then clone from 

git@github.com:originlab/Apps.git

Lets assume your local path is c:\Github\, and after a successfuly clone, it will look like this

c:\Github\Apps with the following folders:
Source
utils

To start working with an App, use the following steps:
1. Install the App with its OPX file, does not matter if it is old or not
2. Find the App folder, from Origin, script window do %@A= will give you the Apps root
3. Rename the App's folder, for example, if you have installed "Color Editor", then rename it to "Color Editor Installed". We need to do this because next step we will need to setup a symbolic link folder with the one from Github
4. right-click to Run As Administrator D:\Github\Apps\utils\link_to_app.bat
5. Select the App's folder from c:\Github\Apps\Source\YouApp
6. A symbolic link is made to this folder in the Origin Apps folder, you can go back the the Origin Apps root to check
7. Next we add the App to Code Builder. From Code Builder right-click Apps and Add Existing Folder
Now you are ready to work on the App, any modification you make is from the Github folder which you push.
