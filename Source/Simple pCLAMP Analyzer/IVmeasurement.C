/*------------------------------------------------------------------------------*
 * File Name: IVmeasurement.c													*
 * Created: Alex Zholos 12/06/2009												*		*
 *------------------------------------------------------------------------------*/

#include <Origin.h>
#include <GetNBox.h>

void IVmeasurement()
{
	// Declare a tree for a Tree style GetN dialog
	GETN_TREE(tr)
	GETN_OPTION_GRIDLINE(flexGridInsetVert) // add vertical divider line
	
	double vv;
	LT_get_var("q1", &vv); //get number of episodes
	GETN_NUM(Episodes, "Number of episodes:",vv)
	GETN_OPTION_COLOR_LABEL(COLOR_RED)
	
	GETN_COMBO(Epoch, "Choose Epoch", 2, "1|2|3|4|5|6|7|8|9")
		
	GETN_CHECK(Num1, "Min     All episodes", false)
	GETN_NUM(Num2, "                From episode", 0)
	GETN_NUM(Num3, "                To episode", 0)
		

	GETN_CHECK(Num4, "Max     All episodes", false)
	GETN_NUM(Num5, "                From episode", 0)
	GETN_NUM(Num6, "                To episode", 0)	
	
	GETN_CHECK(Num7, "Mean    All episodes", false)
	GETN_NUM(Num8, "                From episode", 0)
	GETN_NUM(Num9, "                To episode", 0)
	
	GETN_CHECK(Num10, "Absolute peak    All episodes", false)
	
	if( GetNBox(tr, "Choose measurements & episodes")) 
	{
		LT_set_var("Epoch",tr.Epoch.nVal);
		
		///---Alex 3/17/2016 ORG-14292 P1 VAR_NAMES_CONFLICT
		/*LT_set_var("Num1",tr.Num1.nVal);
		LT_set_var("Num2",tr.Num2.dVal);*/
		LT_set_var("Num1t",tr.Num1.nVal);
		LT_set_var("Num2t",tr.Num2.dVal);
		
		
		LT_set_var("Num3",tr.Num3.dVal);
		LT_set_var("Num4",tr.Num4.nVal);
		LT_set_var("Num5",tr.Num5.dVal);
		LT_set_var("Num6",tr.Num6.dVal);
		LT_set_var("Num7",tr.Num7.nVal);
		LT_set_var("Num8",tr.Num8.dVal);
		LT_set_var("Num9",tr.Num9.dVal);
		LT_set_var("Num10",tr.Num10.dVal);
	};
}

void open_ppt_help( const string strFile, const string strPath )
{
	open_file_by_file_name( strFile, strPath );
}
