#include <Origin.h>
#include <../OriginLab/DialogEx.h>
#include <../OriginLab/HTMLDlg.h>

//--- CPY 5/29/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
#include <operation.h>
static int find_result_sheets_in_diff_book(Datasheet& wks, vector<string>& vsNames)
{
    WorksheetPage wp = wks.GetPage();
    if(!wp)
        return false;
    vector<uint> unOpIDs;
    if(wks.FindOutgoingOperations(unOpIDs) <= 0)
        return false;
    vsNames.SetSize(0);
    for(int ii = 0; ii < unOpIDs.GetSize(); ii++)
    {
        Operation &op = (Operation &)Project.GetOperationObject(unOpIDs[ii]);
        if(op)
        {
            DataRange dr;
            Worksheet wResult;
            if(op_get_output(op, dr, wResult))
            {
                WorksheetPage wpr = wResult.GetPage();
                if(wpr.GetName() != wp.GetName())
                    vsNames.Add(wResult.GetName());
            }
        }
    }
    return vsNames.GetSize();
}
static int find_dependent_analysis_output_books(Page& pg)
{
	int nn = 0;
	vector<string> vsNames;
	foreach(Layer sheet in pg.Layers)
	{
		Datasheet wks = sheet;
		nn += find_result_sheets_in_diff_book(wks, vsNames);
	}
		
	return nn;
}
//--- end FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK

//---- LabTalk Access
class OPJExaminerDlg;
static OPJExaminerDlg *s_pDlg = NULL;
//----

//Declare a struct for the dependent graphs of an object
struct stOneObjectDependents
{
	string SN;
	string LN;
	string Name;
};

//Declare a struct for a book
struct stOneBook
{
	string SN;
	string LN;
	string Path;
	string Size;
	int Num;
};

struct stOneGraph
{
	string Name;
	string Path;
};

class OPJExaminerDlg:public HTMLDlg
{
protected:
	// Return full path and file name to HTML file.
	string GetInitURL()
	{
		string strFile = __FILE__;
		return GetFilePath(strFile) + "OPJExaminer.html";
	}
	// Return title of dialog.
	string GetDialogTitle() {return "OPJ Examiner";}

public:
	int Create(HWND hParent = NULL)
	{
		InitMsgMap();
		int nRet = HTMLDlg::Create(hParent);
		ModifyStyle(0, WS_MAXIMIZEBOX);
		//ModifyStyle(WS_THICKFRAME, 0); // Remove sizing border.
		
		//-----Yuki 2017-05-17 APPS_280-S1 CHANGE_TO_USE_SYS_VAR_FOR_DPI
		okutil_sys_values("BDPI", &m_sysValBDPI);//Remember current into dialog variable
		double dTemp=1;
		okutil_sys_values("BDPI", &dTemp, false);//Set @BDPI=1
		
		m_dhtml.UpdateWindow();
		return nRet;
	}
protected:
	BOOL OnDestroy()
	{
		HTMLDlg::OnDestroy();
		s_pDlg = NULL;
		okutil_sys_values("BDPI", &m_sysValBDPI, false);//Restore @BDPI=0
		//-----END CHANGE_TO_USE_SYS_VAR_FOR_DPI
		delete this;
		return TRUE;
	}
	BOOL GetDlgInitSize(int& width, int& height) // when the dialog is ready, need to init the size and position of dialog
	{
		width = 723;
		height = 531;
		return TRUE;
	}
	
	///Disable resize
	BOOL OnDlgResize(int nType, int cx, int cy) // when you resize the dialog, need to reinit the size and position of each control in dialog
	{
		if( !IsInitReady() )
			return false;

		 MoveControlsHelper _temp(this); // you can uncomment this line, if the dialog flickers when you resize it
		HTMLDlg::OnDlgResize(nType, cx, cy); //place html control in dialog

		if( !IsHTMLDocumentCompleted() ) //check the state of HTML control
			return FALSE;

		return TRUE;
	}
	
public:
	DECLARE_DISPATCH_MAP

	EVENTS_BEGIN_DERIV(HTMLDlg)
		ON_DESTROY(OnDestroy)
		ON_SIZE(OnDlgResize) //Disable resize
	EVENTS_END_DERIV

	// This method will be called from Javascript.
	// It is used to get the info of dependent graphs
	// and fill the table.
	int GetAllDependentsInfo(string strMode)
	{
		string strOneObject;
		
		m_pg = Project.Pages();
		if(!m_pg.IsValid())
			return -1;
		if(!(m_pg.GetType() == EXIST_WKS || m_pg.GetType() == EXIST_MATRIX))
			return -1;
		int nNum = GetObjectsNum(strMode);
		if(nNum < 1)
			return nNum;
		Object jsscript = m_dhtml.GetScript();
		if(!jsscript)
			return -1;
		jsscript.newTab1Table(nNum, strMode);
		
		int nRowIndex = 1;
		if(strMode == "sheet")
		{	
			foreach(Layer shtLayer in m_pg.Layers)
			{
				strOneObject = GetOneObjectDependents(shtLayer);
				jsscript.showTab1OneRow(strOneObject, nRowIndex);
				nRowIndex++;
			}
		}	
		else if(strMode == "column")
		{	
			if(m_pg.GetType() == EXIST_WKS)
			{
				m_wks = Project.ActiveLayer();
				foreach(Column cc in m_wks.Columns)
				{
					strOneObject = GetOneObjectDependents(cc);
					jsscript.showTab1OneRow(strOneObject, nRowIndex);
					nRowIndex++;
				}
			}
			else if(m_pg.GetType() == EXIST_MATRIX)
			{
				m_matrixly = Project.ActiveLayer();
				foreach(MatrixObject matrixobj in m_matrixly.MatrixObjects)
				{
					strOneObject = GetOneObjectDependents(matrixobj);
					jsscript.showTab1OneRow(strOneObject, nRowIndex);
					nRowIndex++;
				}
			}
			else
				return -1;
		}
		else 
			return -1;
		
		string CurrentName = GetCurrentActive(strMode);
		jsscript.showCurrentAcitve(CurrentName);
		return nNum;
	}
	
	// This method will be called from Javascript.
	// It is used to show the dependent graph preview.	
	string ShowGraphPreview(string strGraphName)
	{
		Object jsscript = m_dhtml.GetScript();
		if(!jsscript)
			return "0";
		
		char TempPath[MAXFULLPATH];
		DWORD nRet = GetTempPath(MAXFULLPATH, TempPath);
		if(!nRet)
			return "0";
		
		string strGraphPath = GetDependentGraphPreview(TempPath, strGraphName);
		if(strGraphPath == NULL)
			return "0";
		return strGraphPath;
	}
	
	// This method will be called from Javascript.
	// This function is used to show the full string 
	// of dependent graph names in message box.	
	string ShowGraphNameString(string strMode,string strObjName)
	{
		vector<string> vsGraphName;
		string strGraphName = "(";
		if(!DependentsVector(strMode, strObjName, vsGraphName))
			return "Failed!";
		for(int ii = 0; ii < vsGraphName.GetSize(); ii++ )
		{
			strGraphName += vsGraphName[ii] + " ";
		}
		strGraphName += ")";
		return strGraphName;
	}
	
	// This method will be called from Javascript.
	// This function is used to get the info of independent 
	// book and fill the table.
	int GetIndependentBookInfo()
	{	
		vector<string> vsPageName;
		int nNum = GetBooksNum(true, vsPageName);
		if(nNum < 1)
			return nNum;
		Object jsscript = m_dhtml.GetScript();
		if(!jsscript)
			return -1;
		jsscript.newTab2Table(nNum);
		
		int nRowIndex =1;
		for(int ii=0; ii < vsPageName.GetSize(); ii++)
		{
			Page pg(vsPageName[ii]);
			if(pg.IsValid())
			{
				string strOneIndependentBook = GetOneBookInfo(true, pg);
				jsscript.showTab2OneRow(strOneIndependentBook, nRowIndex);
				nRowIndex++;
			}
		}
		return true;
	}
	
	// This method will be called from Javascript.
	// This function is used to active book
	bool ActivePage(string strbookName)
	{
		PageBase pg(strbookName);
		if(!pg)
			return false;   
		else
			pg.SetShow(PAGE_ACTIVATE); 
			return true;
	}
	
	// This method will be called from Javascript.
	// This function is used to delete book
	bool DeletePage(string strBookName)
	{
		PageBase pg(strBookName);
		if(!pg)
			return false;
		else
			pg.Destroy(); 
			return true;
	}
	
	// This method will be called from Javascript.
	// This function is used to get the info of dependent 
	// book and fill the table.
	int GetDependentBookInfo()
	{	
		vector<string> vsPageName;
		int nNum = GetBooksNum(false, vsPageName);
		if(nNum < 1)
			return nNum;
		Object jsscript = m_dhtml.GetScript();
		if(!jsscript)
			return -1;
		jsscript.newTab3Table(nNum);
		
		int nRowIndex =1;
		for(int ii=0; ii < vsPageName.GetSize(); ii++)
		{
			Page pg(vsPageName[ii]);
			if(pg.IsValid())
			{
				string strOneDependentBook =GetOneBookInfo(false, pg);
				jsscript.showTab3OneRow(strOneDependentBook, nRowIndex);
				nRowIndex++;
			}
		}
		return true;
	}
	
	
private:
	// This function is used to count the worksheets/matrix sheets
	// or columns/matrix object in active workbook or worksheet.
	int GetObjectsNum(string strMode)
	{
		Page pg = Project.Pages();
		int nObjectNum = 0;
		if(strMode == "sheet")
		{
			nObjectNum = pg.Layers.Count();	
		}
		else if(strMode == "column")
		{
			if(pg.GetType() == EXIST_WKS)
			{
				Worksheet wks = Project.ActiveLayer();
				nObjectNum = wks.GetNumCols();
			}
			
			if(pg.GetType() ==  EXIST_MATRIX)
			{
				MatrixLayer matrixly = Project.ActiveLayer();
				nObjectNum = matrixly.MatrixObjects.Count();
			}
		}
		else
			return -1;
		return nObjectNum;
	}
	
	//This function is used to get 
	//the dependent graph info of one sheet or one column
	string GetOneObjectDependents(OriginObject obj)
	{
		FindDependentHelper _dep;
		int nn,mm;
		string strDependents;
		vector<string> vsGraph, vsSheet;
		stOneObjectDependents stOneResult;
		
		
		stOneResult.SN = obj.GetName();
		stOneResult.LN = obj.GetLongName();
		nn = obj.FindDepdendentGraphs(vsGraph);
		//int nSize = vsGraph.GetSize();
		for(int ii = 0; ii < vsGraph.GetSize(); ii++)
		{
			strDependents += "<a data-toggle=\"popover\">" + vsGraph[ii] + "</a>" + " "; 
		}
		
		//--- Yuki 5/31/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
		Datasheet dts;
		dts = obj;
		if(dts)
		{
			mm = find_result_sheets_in_diff_book(dts, vsSheet);
			for(ii = 0; ii < vsSheet.GetSize(); ii++)
			{
				strDependents += vsSheet[ii] + " "; 
			}
		}
		//---END APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
		stOneResult.Name = strDependents;
		
		string strOutput;
		JSON.ToString(stOneResult, strOutput);
		return strOutput;
	}
	
	// This funtion is used to return the name of
	// current book or sheet
	string GetCurrentActive(string strMode)
	{
		string CurrentName;
		
		if(strMode == "sheet")
		{
			CurrentName = m_pg.GetName() + " (" + m_pg.GetLongName() + ")";
		}
		else if(strMode == "column")
		{
			if(m_pg.GetType() == EXIST_WKS)
			{
				CurrentName = m_pg.GetName() + " (" + m_pg.GetLongName() + ")" + ": " + m_wks.GetName(); 
			}
			else if(m_pg.GetType() == EXIST_MATRIX)
			{
				CurrentName = m_pg.GetName() + " (" + m_pg.GetLongName() + ")" + ": " + m_matrixly.GetName(); 
			}
		}
		return CurrentName;
	}
	
	
	//This function is used to show a full string 
	//the dependent graph info in message box
	bool DependentsVector(string strMode, string strObjName, vector<string>& vsGraphName)
	{
		FindDependentHelper _dep;
		Page pg = m_pg;
		int nn;
		
		if(strMode == "sheet")
		{
			Layer sheetLayer = pg.Layers(strObjName);
			nn = sheetLayer.FindDepdendentGraphs(vsGraphName);
		}
		if(strMode == "column")
		{
			if(pg.GetType() == EXIST_WKS)
			{
				Worksheet wks = m_wks;
				Column cc = wks.Columns(strObjName);
				nn = cc.FindDepdendentGraphs(vsGraphName);
			}
			
			if(pg.GetType() == EXIST_MATRIX)
			{
				MatrixLayer matrixly = m_matrixly;
				MatrixObject matrixObj = matrixly.MatrixObjects(strObjName);
				nn = matrixObj.FindDepdendentGraphs(vsGraphName);
			}
		}
		return true;	
	}
	
	string GetDependentGraphPreview(string strFolder, string strGraphName)
	{
		stOneGraph stOneResult;
		string strOneGraph;
		
		GraphPage gp = Project.GraphPages(strGraphName);
		if( !gp )
			return NULL;
		
		//Set the save path for preview image
		string strGraphPath = strFolder + strGraphName + ".png";
		bool bRet = gp.SavePreviewImage(strGraphPath);
		if(!bRet)
			return NULL;
		stOneResult.Name = strGraphName;
		stOneResult.Path = strGraphPath;
		JSON.ToString(stOneResult, strOneGraph);
		return strOneGraph;
	}
	
	
	// This function is used to count the independent or dependent book in project.
	int GetBooksNum(bool bIndependentMode, vector<string>& vsPageName)
	{
		FindDependentHelper _dep;
		vector<string> vsGraphName;
		//--- CPY 5/29/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
		//int nBooksNum = 0;
		//string strPageNameString;
		vsPageName.SetSize(0);
		//---
		foreach(PageBase pg in Project.Pages)
		{
			if(!pg.IsValid())
				return -1;
			int nPageType = pg.GetType();
			if(nPageType == EXIST_WKS || nPageType == EXIST_MATRIX)
			{
				int nn = pg.FindDepdendentGraphs(vsGraphName);
				//--- CPY 5/29/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
				Page pgBook = pg;
				nn += find_dependent_analysis_output_books(pgBook);
				if(bIndependentMode)
				{
					if(nn == 0)
					{
						//--- CPY 5/29/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
						//strPageNameString += pg.GetName() + " ";
						//nBooksNum++;
						vsPageName.Add(pg.GetName());
						//---	
					}
				}
				else
				{
					if(nn > 0)
					{
						//--- CPY 5/29/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
						//strPageNameString += pg.GetName() + " ";
						//nBooksNum++;
						vsPageName.Add(pg.GetName());
						//---
					}
				}
			}
		}
		//--- CPY 5/29/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
		//int nRet = strPageNameString.GetTokens(vsPageName, ' ');
		//return nBooksNum;
		return vsPageName.GetSize();
		//---
	}
	
	//This function is used to get 
	//one independent or dependent book info
	string GetOneBookInfo(bool bIndependentMode, Page pg)
	{
		stOneBook stOneResult;
		stOneResult.SN = pg.GetName();
		stOneResult.LN = pg.GetLongName();
		PropertyInfo pgInfo;
		if(!pg.GetPageInfo(pgInfo))
			return NULL;
		stOneResult.Path =pgInfo.szLocation;
		string size = pgInfo.szSize;
		stOneResult.Size = size.GetToken(0, '(');
		if(!bIndependentMode)
		{
			FindDependentHelper _dep;
			vector<string> vs;
			int nn;
			nn = pg.FindDepdendentGraphs(vs);
			//--- Yuki 5/31/2017 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
			int mm;
			mm += find_dependent_analysis_output_books(pg);
			stOneResult.Num = vs.GetSize() + mm;
			//--- END FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
		}
		
		string strOneIndependent;
		JSON.ToString(stOneResult, strOneIndependent);
		return strOneIndependent;
	}
	
private:
	Page m_pg;
	Worksheet m_wks;
	MatrixLayer m_matrixly;
	double m_sysValBDPI;
};

BEGIN_DISPATCH_MAP(OPJExaminerDlg, HTMLDlg)
	DISP_FUNCTION(OPJExaminerDlg, GetAllDependentsInfo, VTS_I4, VTS_STR)
	DISP_FUNCTION(OPJExaminerDlg, ShowGraphPreview, VTS_STR, VTS_STR)
	DISP_FUNCTION(OPJExaminerDlg, ShowGraphNameString, VTS_STR, VTS_STR VTS_STR)
	DISP_FUNCTION(OPJExaminerDlg, GetIndependentBookInfo, VTS_I4, VTS_VOID)
	DISP_FUNCTION(OPJExaminerDlg, ActivePage, VTS_BOOL, VTS_STR)
	DISP_FUNCTION(OPJExaminerDlg, DeletePage, VTS_BOOL, VTS_STR)
	DISP_FUNCTION(OPJExaminerDlg, GetDependentBookInfo, VTS_I4, VTS_VOID)
END_DISPATCH_MAP

//---- LabTalk Access
void DoOPJExaminerDlg()
{
	if( s_pDlg == NULL )
	{
		s_pDlg = new OPJExaminerDlg;
		if( s_pDlg )
			s_pDlg->Create(GetWindow());
	}
}
