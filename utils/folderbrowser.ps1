$title="Select an App in your local repository folder to link to in AppData\Local\OriginLab\Apps. Note: Your repository folder must be on the same PC as your AppData folder."
if ($PSVersionTable.PSVersion.Major -gt 2) {
	Add-Type -AssemblyName System.Windows.Forms
	$FolderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog -Property @{
		Description = $title
		SelectedPath = $PSScriptRoot
	}
	if ($FolderBrowser.ShowDialog() -eq "OK") {
		$FolderBrowser.SelectedPath
	}
}
else {
	$app = new-object -com Shell.Application
	$folder = $app.BrowseForFolder(0, $title, 0, "")
	$folder.Self.Path
}
