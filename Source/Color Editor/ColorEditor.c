/*------------------------------------------------------------------------------*
 * File Name: ColorEditor.c	 													*
 * Creation: OriginLab, 06/03/16												*
 * Purpose: 																	*
 * Copyright (c) OriginLab Corp. 2016											*
 * All Rights Reserved															*
 * 																				*
 * Modification Log:															*
 *------------------------------------------------------------------------------*/
 
////////////////////////////////////////////////////////////////////////////////////
// 
#include <origin.h>
#include <ocu.h> 
////////////////////////////////////////////////////////////////////////////////////
#include <..\Originlab\okThemeID.h>//------CPY 4/6/2017 APPS-312-P1 SAVE_THEME_ID_TO_PAGE_V1

/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_write_palette_binary
// This function writes the color map to a binary palette file - the format for the
// binary file is same as the Microsoft Palette file
//
int ol_write_palette_binary(string strFileName, short nColors)
{
	Worksheet wks = Project.ActiveLayer();
	// RGB datasets
	Dataset<BYTE> dsRed, dsGreen, dsBlue;
	dsRed.Attach(wks, 0);
	dsGreen.Attach(wks, 1);
	dsBlue.Attach(wks, 2);
	
	bool bRet;
	int ierr;

	file ff;
	bRet = ff.Open(strFileName, file::modeCreate + file::typeBinary + file::modeWrite);
	if(!bRet) return 1;
	
	// first write header information that includes some text 
	// plus information on file size etc.
	char c1[]="RIFF";
	ierr = ff.Write(&c1,4);					// write dword "RIFF"
	int isize = nColors*4 + 8 + 12;
	ierr = ff.Write(&isize,4);				// write dword - filesize
	char c2[] = "PAL ";
	ierr = ff.Write(&c2,4);					// write dword "PAL "
	char c3[] = "data";		
	ierr = ff.Write(&c3,4);					// write dword "data"
	isize = nColors*4 + 8;
	ierr = ff.Write(&isize,4);				// write dword - num entries
	short nShort = 768;
	ierr = ff.Write(&nShort,2);				// write word - ver. no.
	ierr = ff.Write(&nColors,2);				// write word - num colors
	
	// now write 256 entries of the color map
	for (int ii=0; ii < nColors; ii++)
	{		
		int ivalue = dsRed[ii] + 256 * dsGreen[ii] + 256 * 256 *dsBlue[ii];
		ierr = ff.Write(&ivalue,4);
	}
	// write one more word - dummy, 0
	int idummy = 0;
	ierr = ff.Write(&idummy,4);
	
	// close file
	bRet = ff.Close();
	if(!bRet) return 1;
	
	return 0;
}


/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_write_palette_ascii
// This function writes the color map to an ASCII palette file
//
int ol_write_palette_ascii(string strFileName, int nColors)
{
	Worksheet wks = Project.ActiveLayer();
	// RGB datasets
	Dataset<BYTE> dsRed, dsGreen, dsBlue;
	dsRed.Attach(wks, 0);
	dsGreen.Attach(wks, 1);
	dsBlue.Attach(wks, 2);

	stdioFile ff;
	ff.Open(strFileName, file::modeCreate | file::modeReadWrite );

	// write header lines
	ff.WriteString("JASC-PAL");			// write header text
	ff.WriteString("0100");				// write ver. no.
	string str;
	str.Format("""%d""", nColors);
	ff.WriteString(str);				// write num. cols.
	string strRGB;

	for (int ii=0; ii < nColors; ii++)
	{
		int ir = dsRed[ii];
		int ig = dsGreen[ii];
		int ib = dsBlue[ii];
		
		strRGB.Format("%d %d %d",ir, ig, ib);
		ff.WriteString(strRGB);
	}

	ff.Close();	
	
	return 0;
}	

/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_read_palette
// This function reads binary/ASCII palette files
//
int ol_read_palette(string strFileName)
{
	vector<BYTE> vRed, vGreen, vBlue;
	
	// Read first line to check if file is ascii or binary
	stdioFile ff;
	bool bRet = ff.Open(strFileName, file::modeRead);
    if(!bRet)
    	return 0;
	string str;
	ff.ReadString(str);
	ff.Close();
	int index=-1;
	is_str_match_begin_of_word("JASC", str, &index); 
	int nColors;
	if(0 == index)
		nColors = ol_read_palette_ascii(strFileName, vRed, vGreen, vBlue);
	else
		nColors = ol_read_palette_binary(strFileName, vRed, vGreen, vBlue);;	
	
	if(nColors>1 && nColors<=256)
	{
		Worksheet wks = Project.ActiveLayer();
		Dataset<BYTE> dsRed, dsGreen, dsBlue;
		dsRed.Attach(wks, 0);
		dsGreen.Attach(wks, 1);
		dsBlue.Attach(wks, 2);
		dsRed.SetSize(nColors); dsGreen.SetSize(nColors); dsBlue.SetSize(nColors);
		dsRed = vRed; dsGreen = vGreen; dsBlue = vBlue;
		return nColors;
	}
	else
		return 0;
}


/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_read_palette_binary
// This function reads the color map from a binary palette file - the format for the
// binary file is same as the Microsoft Palette file
//
int ol_read_palette_binary(string strFileName, vector<BYTE> &vRed, vector<BYTE> &vGreen, vector<BYTE> &vBlue )
{
	
	bool bRet;
	int ierr;

	file ff;
	bRet = ff.Open(strFileName, file::modeRead);
	if(!bRet) return -1;
	
	// first read header information that includes some text 
	// plus information on file size etc.

	int ijunk;
	ierr = ff.Read(&ijunk,4);	// read and discard "RIFF"
	int isize;
	ierr = ff.Read(&isize,4);	// read file size
	ierr = ff.Read(&ijunk,4);	// read and discard "PAL "
	ierr = ff.Read(&ijunk,4);	// read and discard "data"

	ierr = ff.Read(&isize,4);	// read size
	short nShort;
	ierr = ff.Read(&nShort,2);	// read short
	short nColors;
	ierr = ff.Read(&nColors,2);	// read num colors
	
	vRed.SetSize(nColors); vGreen.SetSize(nColors), vBlue.SetSize(nColors);
	if (nColors < 2 | nColors > 256)
	{
		bRet = ff.Close();
		return -1;
	}	
	// now read icol entries of the color map
	for (int ii=0; ii < nColors; ii++)
	{	
		int ivalue;
		ierr = ff.Read(&ivalue,4);	
		vBlue[ii] = (int) (ivalue / (256 * 256));
		ivalue = ivalue - vBlue[ii] * 256 * 256;
		vGreen[ii] = (int) (ivalue / 256);
		vRed[ii] = ivalue - vGreen[ii] * 256;		

	}

	// close file
	bRet = ff.Close();
	if(!bRet) return -1;
	
	return nColors;
}



/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_read_palette_ascii
// This function reads the color map from an ASCII palette file
//
int ol_read_palette_ascii(string strFileName, vector<BYTE> &vRed, vector<BYTE> &vGreen, vector<BYTE> &vBlue)
{
	stdioFile ff;
	ff.Open(strFileName, file::modeRead );

	// read header lines
	string strRGB;
	ff.ReadString(strRGB);			// read and discard header text
	ff.ReadString(strRGB);			// read and discard ver. no.

	ff.ReadString(strRGB);			// read num. cols. into string
	int nColors = atoi(strRGB);		// read from string to variable
	if ( nColors < 2 | nColors > 256 )
	{
		ff.Close();	
	 	return -1;
	}
	vRed.SetSize(nColors);	vGreen.SetSize(nColors);	vBlue.SetSize(nColors);

	for (int jj=0; jj < nColors; jj++)
	{
		ff.ReadString(strRGB);
		string str1 = strRGB.GetToken(0);
		string str2 = strRGB.GetToken(1);
		string str3 = strRGB.GetToken(2);
		vRed[jj] = atoi(str1);
		vGreen[jj] = atoi(str2);
		vBlue[jj] = atoi(str3);
	}

	ff.Close();	
	
	return nColors;
}
//------CPY 4/6/2017 APPS-312-P1 SAVE_THEME_ID_TO_PAGE_V1
static bool _is_color_list_ID(int nID)
{
	if(OTID_GLOBAL_COLOR_LIST == nID)
		return true;
	//the following are in a consecutive range
	//OTID_GLOBAL_LINECOLOR_LIST
	//OTID_GLOBAL_SYMBEDGECOLOR_LIST
	//OTID_GLOBAL_SYMBFILLCOLOR_LIST
	//OTID_GLOBAL_BORDERCOLOR_LIST
	//OTID_GLOBAL_FILLCOLOR_LIST
	if(nID >= OTID_GLOBAL_LINECOLOR_LIST && nID <= OTID_GLOBAL_FILLCOLOR_LIST)
		return true;
	
	return false;
}
//-------

/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_read_colorlist
// This function reads the color values from an Origin color list (OTH) file
// and return the internal theme ID, it will check that the OTH is a color list
// return 0 if not a valid OTH
// return -1 if not a color list
// nLocation = 0 if in \Color, =1 if in \IncrementList
int ol_read_colorlist(string strFileName, int& nThemeID, int& nLocation)
{
	Tree tr;
    tr.Load(strFileName);
    TreeNode tr1 = tr.e;
    if (!tr1) {
        return 0;
    }
    TreeNode tr2 = tr1.e;
    if (!tr2) {
        return 0;
    }
    TreeNode tr3 = tr2.e;
    if (!tr3) {
        return 0;
    }
    //------CPY 4/6/2017 APPS-312-P1 SAVE_THEME_ID_TO_PAGE_V1
    nThemeID = tr3.ID;
    if(!_is_color_list_ID(nThemeID))
    	return -1;
    string strFilePath = GetFilePath(strFileName);
	if(strFilePath.Match("*\\Themes\\IncrementList\\"))
		nLocation = 1;
	else
		nLocation = 0;
    //------
    DWORD rgb;
    vector<DWORD> vd;
    vd = tr3.nVals;
    vector<BYTE> vbRed, vbGreen, vbBlue;
    int nColors = vd.GetSize();
	for (int i = 0; i < nColors; i++)
	{
		rgb = okutil_convert_ocolor_to_RGB(vd[i]);
        //printf("%d => %d\n", vd[i], rgb);
		vbRed.Add(GetRValue(rgb));
		vbGreen.Add(GetGValue(rgb));
		vbBlue.Add(GetBValue(rgb));
	}
	Worksheet wks = Project.ActiveLayer();
	Dataset<BYTE> dsRed, dsGreen, dsBlue;
	dsRed.Attach(wks, 0);
	dsGreen.Attach(wks, 1);
	dsBlue.Attach(wks, 2);
	dsRed = vbRed;
	dsGreen = vbGreen;
	dsBlue = vbBlue;
	return nColors;
} 


/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_write_colorlist
// This function writes color values to an Origin color list (OTH) file
//
int ol_write_colorlist(string strFileName, int nColors, int nThemeID)
{
	Worksheet wks = Project.ActiveLayer();
	if( !wks.IsValid() )
		return 1;

	Dataset<BYTE> dsRed, dsGreen, dsBlue;
	dsRed.Attach(wks, 0);
	dsGreen.Attach(wks, 1);
	dsBlue.Attach(wks, 2);
	if( !dsRed.IsValid() || !dsGreen.IsValid() || !dsBlue.IsValid() )
		return 2;

	Tree tr;
	tr.SetAttribute("atp", 1);
	tr.SetAttribute(THEME_ELEMENT_BITS_NAME, FEB_NONE);
	tr.SetAttribute(THEME_ELEMENT2_BITS_NAME, FEB_NONE);
	tr.SetAttribute(THEME_OBJECT_BITS_NAME, FOB_GLOBAL);
	tr.SetAttribute(THEME_OBJECT2_BITS_NAME, FOB_NONE);
	tr.SetAttribute(THEME_PROPERTY_BITS_NAME, FPB_STYLE_COLOR_LIST);
	tr.SetAttribute(THEME_PROPERTY2_BITS_NAME, FPB_NONE);
	tr.SetAttribute(THEME_COUNT_NAME, 1);

	TreeNode tn1 = tr.AddNode("e", 1);
	if( !tn1.IsValid() )
		return 3;
	TreeNode tn2 = tn1.AddNode("e", 256);
	if( !tn2.IsValid() )
		return 3;
	//------CPY 4/6/2017 APPS-312-P1 SAVE_THEME_ID_TO_PAGE_V1
	//TreeNode tn3 = tn2.AddNode("e", 521);
	if(!_is_color_list_ID(nThemeID))
		nThemeID = OTID_GLOBAL_COLOR_LIST;
	TreeNode tn3 = tn2.AddNode("e", nThemeID);
	//------
	if( !tn3.IsValid() )
		return 3;

	vector<DWORD> pal;
	COLORREF color;
	for( int i = 0; i < nColors; i++ )
	{
		color = RGB(dsRed[i], dsGreen[i], dsBlue[i]);
		pal.Add(okutil_convert_RGB_to_ocolor(color));
	}
	tn3.nVals = pal;

	return tr.Save(strFileName) ? 0 : 4;
}

/////////////////////////////////////////////////////////////////////////////////////
// Function: ol_check_add_fld
// This function checks for a folder, and creates the folder if needed
//
bool ol_check_add_fld(string strFullPath)
{
	bool bret = CheckMakePath( strFullPath );
	return bret;
}
///////////////////////////// end of OriginC functions //////////////////////////////

//--- EJP 2017-01-26 APPS-82-S1 READ_GIMP_FILE
static int read_GIMP_palette(LPCSTR lpcszFilename, int* pR, int* pG, int* pB, int nBuffSize)
{
#if _OC_VER >= 0x0941
	return ocu_read_GIMP_palette(lpcszFilename, pR, pG, pB, nBuffSize);
#else
	int nCount = 0;
	stdioFile f;
	if( f.Open(lpcszFilename, file::modeRead) )
	{
		string str;
		bool bColor = false;
		if( f.ReadString(str) && 0 == str.CompareNoCase("GIMP Palette") )
		{
			while( !bColor )
			{
				if( !f.ReadString(str) )
					break;
				if( str[0] == '#' )
					continue;
				if( 3 <= str.GetNumTokens() )
				{
					string strTmp = str.GetToken(0);
					if( '0' <= strTmp[0] && strTmp[0] <= '9' )
						bColor = true;
				}
			}
		}
		if( bColor )
		{
			while( nCount < nBuffSize )
			{
				*pR++ = atoi(str.GetToken(0));
				*pG++ = atoi(str.GetToken(1));
				*pB++ = atoi(str.GetToken(2));
				nCount++;

				if( !f.ReadString(str) )
					break;
			}
		}
		else
			nCount = -2;
		f.Close();
	}
	else
		nCount = -1;
	return nCount;
#endif
}

#define CE_MIN_COLORS 2
#define CE_MAX_COLORS 256
int ol_load_gimp(string strFileName)
{
	int nR[CE_MAX_COLORS], nG[CE_MAX_COLORS], nB[CE_MAX_COLORS];
	int nColors =read_GIMP_palette(strFileName, nR, nG, nB, CE_MAX_COLORS);
	if( CE_MIN_COLORS <= nColors && nColors <= CE_MAX_COLORS )
	{
		Worksheet wks = Project.ActiveLayer();
		Dataset<BYTE> dsR, dsG, dsB;
		dsR.Attach(wks, 0); dsR.SetSize(nColors);
		dsG.Attach(wks, 1); dsG.SetSize(nColors);
		dsB.Attach(wks, 2); dsB.SetSize(nColors);
		for( int i = 0; i < nColors; i++ )
		{
			dsR[i] = nR[i];
			dsG[i] = nG[i];
			dsB[i] = nB[i];
		}
	}
	return nColors;
}
//---- end READ_GIMP_FILE

//---- CPY 2/2/2017 ORG-15977 EXPOSE_COLOR_FUNCTIONS_TO_OC
int ol_rgbToHue(int rr, int gg, int bb)
{
	double hh, ss, ll;
	DWORD rgb = RGB(rr, gg, bb);
	RGBtoHSL(rgb, &hh, &ss, &ll);
	return  nint(hh*360);
}
int ol_rgbToSatPercent(int rr, int gg, int bb)
{
	double hh, ss, ll;
	DWORD rgb = RGB(rr, gg, bb);
	RGBtoHSL(rgb, &hh, &ss, &ll);
	return nint(ss*100);
}
int ol_rgbToLightnessPercent(int rr, int gg, int bb)
{
	double hh, ss, ll;
	DWORD rgb = RGB(rr, gg, bb);
	RGBtoHSL(rgb, &hh, &ss, &ll);
	return nint(ll*100);
}
//---- end EXPOSE_COLOR_FUNCTIONS_TO_OC
