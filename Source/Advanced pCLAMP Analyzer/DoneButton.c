#include <Origin.h>
#include <Dialog.h>
#include "DoneButton.h"

class DoneButtonDialog : public Dialog {
public:
#ifdef _OWIN64
	DoneButtonDialog() : Dialog(IDD_DIALOG1, "DoneButton_64") {
#else
	DoneButtonDialog() : Dialog(IDD_DIALOG1, "DoneButton") {
#endif
	}
	
	~DoneButtonDialog() {
	}
	
	BOOL Create(HWND hParent = NULL) {
		InitMsgMap();
		BOOL bReturn = Dialog::Create(hParent, 0);
		
		m_ct = GetItem(IDC_STATIC1);
		Visible = TRUE;
		return bReturn;
	}
	//int DoModal(HWND hParent = NULL) {
		//InitMsgMap();
		//return Dialog::DoModal(hParent);
	//}
	
	void SetTitle(string strTitle) {
		Text = strTitle;
	}
	
	void SetLabel(string strLabel) {
		m_ct.Text = strLabel;
	}
	
	string m_strLT;
	
protected:
	EVENTS_BEGIN
		ON_INIT(OnInitDialog)	
		ON_BN_CLICKED(IDC_BUTTON1, OnDone)
	EVENTS_END
	
	BOOL OnInitDialog() {
		return TRUE;
	}
	
	BOOL OnDone(Control ctrl) {
		//MessageBox(GetSafeHwnd(), "Change the code in OnDone event handler to do what you want.");
		
		LT_execute( m_strLT );
		
		SendMessage(WM_CLOSE);
		return TRUE;
	}
	
private:
	Control m_ct;

};

void TestDoneButtonDialog( const string strLT, const string strTitle="Test", const string strLabel = "Test it." ) {

	DoneButtonDialog *doneBtnDlg;
	doneBtnDlg = new DoneButtonDialog;
	doneBtnDlg->Create(GetWindow());
	
	doneBtnDlg->SetTitle( strTitle );
	doneBtnDlg->SetLabel( strLabel );
	
	doneBtnDlg->m_strLT = strLT;
	
	//DoneButtonDialog dlg;
	//dlg.DoModal(GetWindow());
}

void open_doc_help( const string strFile, const string strPath )
{
	open_file_by_file_name( strFile, strPath );
}