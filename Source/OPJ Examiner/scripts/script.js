// This function will be called after the entire document has
// finished loading.
window.onload = function(){
    //-----Yuki 2017-05-19 APPS_280-S3 LABEL CHANGES AND TOOLTIPS
    //Initial tooltip
    $("[data-toggle='tab']").tooltip({
        animate: true,
        container: "body",
        delay: {"show": 1000},
        placement: "right",
        trigger: "hover",        
    });   
    //End LABEL CHANGES AND TOOLTIPS 
    //***************
    
    //-----Yuki 7/12/2017 APPS_280-P4 ADD DATASIZE PARSER
    $.tablesorter.addParser({
        id: "datasize",
        is: function(s) {
            return s.match(new RegExp(/[0-9]+(\.[0-9]+)?\ (--|KB|B|GB|MB|TB)/));
        },
        format: function(s) {
            var suf = s.match(new RegExp(/(--|KB|B|GB|MB|TB)$/))[1];
            if('--' == suf)
                return null;
            else{
                var num = parseFloat( s.match(new RegExp(/^[0-9]+(\.[0-9]+)?/))[0]);
                switch( suf ) {
                    case 'B':
                        return num;
                    case 'KB':
                        return num * 1024;
                    case 'MB':
                        return num * 1024 * 1024;
                    case 'GB':
                        return num * 1024 * 1024 * 1024;
                    case 'TB':
                        return num * 1024 * 1024 * 1024 * 1024;
                }
            }
        },
        type: "numeric" 
    });
    //END ADD DATASIZE PARSER  
     
    // This fucntion will be triggered by clicking Check button
    var check1 = document.getElementById("tab1Check");
    // When click Check button in Tab1.
    check1.addEventListener("click", function(){
        //1. Hide active book message div
         document.getElementById("ActiveBookMsg").style.display = "none"; 
        //2. Check which mode is selected by user
        var checkmode = document.querySelector('input[name="checkmode"]:checked').value;
        //3. New a table and fill the table with dependents info
        var checkStatus = window.external.ExtCall("GetAllDependentsInfo", checkmode);
        //4. Show message in box
        if(checkStatus < 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Please active a book window!"; 
            document.getElementById("table1").style.display = "none";
            return;
        }
        else if (checkStatus == 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "There is no sheet/column in this book/sheet!"; 
            document.getElementById("table1").style.display = "none";
            return;
        }
        else
        {         
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML =  "Hover on the graph name to show preview.";    
                                 
            //When hover on the graph name (link) in Table1 
            $("#tb1 a").each(function(){   
                var $anchor = $(this);   
                var graphName = $(this).text();        
                var graphPreview = constructGraphPreview(graphName); 
                var enterTimer, leaveTimer;
                
                //Initialize popover               
                $anchor.popover({ 
                    container: "#tab-1",   
                    html: "true",
                    placement : "top",
                    trigger: "manual",
                    title: "Graph Preview",
                    content: graphPreview,
                })
                .on("mouseover", function (){
                        if(enterTimer)
                        {
                            clearTimeout(enterTimer);
                        }
                        if(leaveTimer)
                        {
                            clearTimeout(leaveTimer);
                        }
                        
                        //Close all other popovers
                        $("[data-toggle='popover']").not($anchor).popover("hide");
                        
                        //Start new timeout to show popover
                        enterTimer = setTimeout(function(){    
                            $anchor.popover("show");
                            document.getElementById("msg").className = "text-success";
                            document.getElementById("msg").innerHTML =  "Double click on the preview to activate the graph window."; 
                            //---YUKI 2017-05-18 APPS_280-P2 FIX_ACTIVATE_GRAPH_PAGE_CALLED_REPEATEDLY
                            $(".graphpreview img").bind("dblclick", function(){
                                var imgSource = $(this).attr("src");
                                var graphName = imgSource.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi,"$1"); 
                                if(window.external.ExtCall("ActivePage", graphName))
                                {
                                    document.getElementById("msg").className = "text-success";
                                    document.getElementById("msg").innerHTML = graphName + " is already active.";
                                    $("[data-toggle='popover']").popover("hide");
                                }
                            }); 
                            //--- END FIX_ACTIVATE_GRAPH_PAGE_CALLED_REPEATEDLY
                            $(".popover").on("mouseleave", function (){
                                $anchor.popover("hide");
                                document.getElementById("msg").className = "text-success";
                                document.getElementById("msg").innerHTML =  "Hover on the graph name to show its graph preview.";   
                            });         
                        },500);     
                })
                .on("mouseleave", function (){
                        if(enterTimer)
                        {
                            clearTimeout(enterTimer);
                        }
                        if(leaveTimer)
                        {
                            clearTimeout(leaveTimer); 
                        }
                        
                        leaveTimer = setTimeout(function(){
                            if (!$(".popover:hover").length)
                            {
                                $anchor.popover("hide");
                                document.getElementById("msg").className = "text-success";
                                document.getElementById("msg").innerHTML =  "Hover on the graph name to show its graph preview.";   
                            }
                        },100);
                });                        
            }); 
        }
    });
    //***************
    
    //***************
    // This fucntion will be triggered by clicking Find button
    var find2 = document.getElementById("tab2Find");
    // When click Find button in Tab2
    find2.addEventListener("click", function(){
        //1. Hide table2 div
        document.getElementById("table2").style.display = "none";
        $("#tab2Delete").attr('disabled', 'disabled');
        //2. New a table and fill the table with dependents info
        //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
        var startTime = new Date;
        Timer = setInterval(function() {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Finding / Updating... (" + Math.floor((new Date - startTime)/1000) + " Seconds)"; 
        }, 1000);
        //---END SCANNING_NEEDS_PROGRESS_INDICATION

        var checkmode = document.querySelector('#tab-2 input[name="radiomode"]:checked').value;
        var findStatus = window.external.ExtCall("GetIndependentBookInfo", checkmode);
        //3. Show message in box
        if(findStatus < 0)
        {
            //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
            clearInterval(Timer);
            //---END SCANNING_NEEDS_PROGRESS_INDICATION
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Error!"; 
            document.getElementById("table2").style.display = "none";
            return;
        }
        else if (findStatus == 0)
        {
            //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
            clearInterval(Timer);
            //---END SCANNING_NEEDS_PROGRESS_INDICATION
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "There is no independent book/sheet in this project."; 
            document.getElementById("table2").style.display = "none";
            return;
        }
        else
        {
            //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
            clearInterval(Timer);
            //---END SCANNING_NEEDS_PROGRESS_INDICATION
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Double click on any row to activate the book/sheet."; 
            //4. Enable to sort table by clicking table header
            $(function(){
                $("#tb2").tablesorter({
                    //-----Yuki 7/12/2017 APPS_280-P4 ADD DATASIZE PARSER
                    headers:{
                        4:{sorter: "datasize"}    
                    }
                    //---END APPS_280-P4 ADD DATASIZE PARSER
                });
            });        
            //5. Enable to check/uncheck DeleteAll checkbox to check/uncheck all the checkboxes
            var deletecheck = document.getElementById("checkbox0");
            deletecheck.addEventListener("click", function(){
                if($(this).is(":checked"))
                {
                    $(":checkbox").each(function() {
                    this.checked = true;                        
                    });
                }
                else
                {
                    $(":checkbox").each(function() {
                    this.checked = false;                        
                    });
                }  
            }); 
            
            //6. Disable or enable Delete button
            $(":checkbox").each(function(){
                $(this).click(function(){
                    var checklength = $("#tb2 tbody input:checked").length;
                    if(checklength >0)
                    {
                        $("#tab2Delete").removeAttr("disabled");
                    }
                    else
                    {
                        $("#tab2Delete").attr("disabled", "disabled");
                    }   
                })
            });
            
            //Enable to select every row in table
            var table = document.getElementById("tb2");
            var rows = table.getElementsByTagName("tr");
            for (i = 1; i < rows.length; i++) 
            {
                var currentRow = table.rows[i];
                var createClickHandler = 
                    function(row) 
                    {
                        //6. Double click any row in table to activate its corresponding workbook
                        return function() {  
                                            var cell = row.getElementsByTagName("td")[1];
                                            var name = cell.innerHTML;
                                            var location = row.getElementsByTagName("td")[3].innerHTML;
                                            var ret;
                                            if("book" == checkmode)
                                                ret = window.external.ExtCall("ActivePage", name);
                                            else if("sheet" == checkmode)
                                                ret = window.external.ExtCall("ActiveSheet", name, location);
                                            else
                                                ret = false;
                                            if(ret)
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML =  name + " is already active."; 
                                            }
                                            else
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML = "Failed to active " + name + "."; 
                                            }
                                        };
                    };
                currentRow.ondblclick = createClickHandler(currentRow);
            }
        }
            
    });
    //***************
      
    //***************
    // This fucntion will be triggered by clicking Find button
    var find3 = document.getElementById("tab3Find");
    // When click Find button in Tab3.
    find3.addEventListener("click", function(){
        //1. Hide table3 div
        document.getElementById("table3").style.display = "none";
        
        //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
        var startTime = new Date;
        Timer = setInterval(function() {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Finding / Updating... (" + Math.floor((new Date - startTime)/1000) + " Seconds)"; 
        }, 1000);
        //---END SCANNING_NEEDS_PROGRESS_INDICATION
        
        //2. New a table and fill the table with dependents info
        var findStatus = window.external.ExtCall("GetDependentBookInfo");
        //3. Show message in box
        if(findStatus < 0)
        {
            //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
            clearInterval(Timer);
            //---END SCANNING_NEEDS_PROGRESS_INDICATION
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Error!"; 
            document.getElementById("table3").style.display = "none";
            return;
        }
        else if (findStatus == 0)
        {
            //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
            clearInterval(Timer);
            //---END SCANNING_NEEDS_PROGRESS_INDICATION
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "There is no book with dependent in this project!"; 
            document.getElementById("table3").style.display = "none";
            return;
        }
        else
        {
            //-----Yuki 2017-05-31 APPS_280-S5 SCANNING_NEEDS_PROGRESS_INDICATION
            clearInterval(Timer);
            //---END SCANNING_NEEDS_PROGRESS_INDICATION
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Double click on any row to activate the book!"; 
            //4. Enable to sort table by clicking table header
            $(function(){
                $("#tb3").tablesorter({
                    //-----Yuki 7/12/2017 APPS_280-P4 ADD DATASIZE PARSER
                    headers:{
                        4:{sorter: "datasize"}    
                    }
                    //END APPS_280-P4 ADD DATASIZE PARSER
                });
            });        
           
            //5. Enable to select every row in table
            var table = document.getElementById("tb3");
            var rows = table.getElementsByTagName("tr");
            for (i = 1; i < rows.length; i++) 
            {
                var currentRow = table.rows[i];
                var createClickHandler = 
                    function(row) 
                    {
                        //6. Double click any row in table to activate its corresponding workbook
                        return function() {  
                                            var cell = row.getElementsByTagName("td")[1];
                                            var bookName = cell.innerHTML;
                                            if(window.external.ExtCall("ActivePage", bookName))
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML = bookName + " is already active."; 
                                            }
                                            else
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML = "Failed to active " + bookName + "."; 
                                            }
                                        };
                    };
                currentRow.ondblclick = createClickHandler(currentRow);
            }
        }
            
    });
    
    //Yuki 10/11/2017 APPS-68-S3-NEW_MATCHED_BOOK_TAB
    //***************
    // This fucntion will be triggered by clicking Find button
    var find4 = document.getElementById("tab4Find");
    // When click Find button in Tab4.
    find4.addEventListener("click",function(){
        //1.Clean and prepare section for new update 
        document.getElementById("section1").style.display = "none";
        $("#tab4Delete").attr('disabled', 'disabled');
        //2.Show indication when scanning
        var startTime = new Date;
        Timer = setInterval(function() {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Finding / Updating... (" + Math.floor((new Date - startTime)/1000) + " Seconds)"; 
        }, 1000);
        //3.Find matched books
        var findStatus = window.external.ExtCall("GetMatchedBookInfo"); 
        //4.Show message in box
        if(findStatus < 0)
        {
            clearInterval(Timer);
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Error!"; 
            document.getElementById("section1").style.display = "none";
            return;
        }
        else if(findStatus == 0)
        {
            clearInterval(Timer);
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "There is no matched book in this project."; 
            document.getElementById("section1").style.display = "none";
            return;
        }
        else
        {
            clearInterval(Timer);
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Double click on any row to activate the book."; 
            //5. Enable to sort table by clicking table header
            $(function(){
                $(".table").tablesorter({
                    headers:{
                        4:{sorter: "datasize"}    
                    }
                });
                //6. Tooltip to show the info of group  
                $(".panel-title a").each(function(){   
                    var $anchor = $(this);   
                    var temp = $(this).text().split( "#" );
                    var sectionIndex = temp[1] - 1; 
                    var groupPath = window.external.ExtCall("GetMatchedBookGroupInfo", sectionIndex);
                    
                    //Initialize popover               
                    $anchor.tooltip({
                        animate: true,
                        container: "body",  
                        delay:{"show": 500},
                        html: true,
                        placement:"bottom",
                        trigger: "hover",
                        title: "<p style=\"font-weight:bold;\">The same imported file:</p><p>" + groupPath + "</p>",
                    });
                }); 
            });
            
            //7. Enable to check/uncheck DeleteAll checkbox to check/uncheck all the checkboxes of this table
            $(".checkbox0").each(function(){
                var $anchor = $(this);
                $anchor.on("click",function(){
                    var $parentTableCheckboxes = $(this).parents("table").children("tbody").find(":checkbox");
                    if($(this).is(":checked"))
                    {
                        $parentTableCheckboxes.each(function() {
                            this.checked = true;                        
                        });
                    }
                    else
                    {
                        $parentTableCheckboxes.each(function() {
                            this.checked = false;                        
                        });
                    }
                });
            });
            
            //8. Disable or enable Delete button
            $(":checkbox").each(function(){
                $(this).click(function(){
                    var checklength = $("#sec1 tbody input:checked").length;
                    if(checklength >0)
                    {
                        $("#tab4Delete").removeAttr("disabled");
                    }
                    else
                    {
                        $("#tab4Delete").attr("disabled", "disabled");
                    }   
                })
            });
            
            //9. Enable to select every row in table
            var tableList = document.getElementsByTagName("table");
            for(i = 0; i < tableList.length; i++)
            {
                var table = tableList[i];
                var rows = table.getElementsByTagName("tr");
                for (j = 1; j < rows.length; j++) 
                {
                    var currentRow = table.rows[j];
                    var createClickHandler = 
                        function(row) 
                        {
                            //10. Double click any row in table to activate its corresponding workbook
                            return function() {  
                                                var cell = row.getElementsByTagName("td")[1];
                                                var bookName = cell.innerHTML;
                                                if(window.external.ExtCall("ActivePage", bookName))
                                                {
                                                    document.getElementById("msg").className = "text-success";
                                                    document.getElementById("msg").innerHTML = bookName + " is already active."; 
                                                }
                                                else
                                                {
                                                    document.getElementById("msg").className = "text-success";
                                                    document.getElementById("msg").innerHTML = "Failed to active " + bookName + "."; 
                                                }
                                            };
                        };
                    currentRow.ondblclick = createClickHandler(currentRow);
                }
            }
        }
    });
    //END APPS-68-S3-NEW_MATCHED_BOOK_TAB
    
    //Yuki 01/04/2018 APPS-68-S4-NEW_GRAPH_TAB
    var list5 = document.getElementById("tab5List");
    list5.addEventListener("click",function(){
        //1.Clean and prepare section for new update 
        document.getElementById("section2").style.display = "none";
        document.getElementById("table5").style.display = "none";
        //2.Show indication when scanning
        var startTime = new Date;
        Timer = setInterval(function() {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Finding / Updating... (" + Math.floor((new Date - startTime)/1000) + " Seconds)"; 
        }, 1000);  
        //3.Find graphs       
        var strGraphGroups = window.external.ExtCall("GetGraphGroupJSON");
        if(strGraphGroups == "")
        {
            clearInterval(Timer);
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "No graph in this project!"; 
            document.getElementById("section2").style.display = "none";
            return;
        }
        else
        {
            const viewmode = document.querySelector('input[name="viewmode"]:checked').value;
            if('extra_large_icon' == viewmode){
                //4.List graphs grouped by folders  
                clearInterval(Timer);
                newCollapsePanel(2);
                var graphGroups = JSON.parse(strGraphGroups);
                var groupSize = Object.keys(graphGroups).length;
                for(var ii = 0; ii < groupSize; ii++)
                {
                    var graphsInGroup = JSON.parse(graphGroups[ii]);   
                    var graphFolder =  graphsInGroup[0];
                    newGraphSection(ii, graphFolder);
                    insertGraphsToSection(ii, graphsInGroup);
                    document.getElementById("msg").className = "text-success";
                    document.getElementById("msg").innerHTML = "Double click to active, and hover to show info."; 
                }
                //6. Tooltip to show the info of graph  
                $("img").each(function(){  
                    var graphTooltip = "";
                    var $anchor = $(this);   
                    var graphPath = $(this).attr("src");
                    var graphName = graphPath.substring(graphPath.lastIndexOf("\\") + 1).replace(".png", "");
                    var graphInfo = window.external.ExtCall("GetGraphInfo", graphName);
                    //Yuki 03/16/2018 APPS_280_S9_ADD_HINTS_FOR_NO_PREVIEW_GRAPHS
                    if(graphInfo == "undefined")
                    {
                        graphTooltip = "<p style=\"color:#dc3545\">The preview is not available, but you can create preview graphs in Project Explorer.</p>" +
                                        "<p style=\"color:#dc3545\">Hover over any graph window in Project Explorer, then click the Create button in the pop-up message.</p>"
                    }
                    else
                    {
                        var JsonOutput = JSON.parse(graphInfo); 
                        //var graphTooltip = "";
                        graphTooltip += "<p><b>Long Name</b>: " + JsonOutput.LN + "</p>" + 
                                        "<p><b>Size</b>: " + JsonOutput.Size + "</p>"+
                                        "<p><b>Source</b>: " + JsonOutput.Source + "</p>";
                    }
                    //END APPS_280_S9_ADD_HINTS_FOR_NO_PREVIEW_GRAPHS
                    //Initialize popover               
                    $anchor.popover({
                        animate: true,
                        container: "body",  
                        delay:{"show": 800},
                        html: true,
                        placement:"top",
                        trigger: "hover",
                        title: graphName,
                        content:graphTooltip,
                    });
                }); 
                
                //5. Double click to active graph widow
                $("img").dblclick(function() 
                {
                    var graphPath = $(this).attr("src");
                    var graphName = graphPath.substring(graphPath.lastIndexOf("\\") + 1).replace(".png", "");
                    if(window.external.ExtCall("ActivePage", graphName))
                    {
                        document.getElementById("msg").className = "text-success";
                        document.getElementById("msg").innerHTML = graphName + " is already active."; 
                    }
                    else
                    {
                        document.getElementById("msg").className = "text-success";
                        document.getElementById("msg").innerHTML = "Failed to active " + graphName + "."; 
                    }
                });
                //Yuki 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
                $("#tab5Select").prop("disabled",false);
                $("#tab-5 .float-right").hide();
                //END 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
            }
            //Yuki 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
            if('details' == viewmode) {
                clearInterval(Timer);
                const graphGroups = JSON.parse(strGraphGroups);
                console.log(graphGroups)
                const groupSize = Object.keys(graphGroups).length;
                var rowsNum = 0;
                for(var ii = 0; ii < groupSize; ii++){
                    const graphsInGroup = JSON.parse(graphGroups[ii]);
                    rowsNum = rowsNum + Object.keys(graphsInGroup).length - 1;
                }
                newTab5Table(rowsNum);
                var rowIndex = 1;
                for(var ii = 0; ii < groupSize; ii++){
                    const graphsInGroup = JSON.parse(graphGroups[ii]);
                    var graphNum = Object.keys(graphsInGroup).length - 1;
                    for(var ii = 1; ii <= graphNum; ii++) {           
                        var graphName = graphsInGroup[ii];
                        var graphJson = window.external.ExtCall("GetGraphInfo", graphName);
                        showTab5OneRow(graphJson,rowIndex)
                        rowIndex++;
                    }
                }
                //Enable to sort table by clicking table header
                $(function(){
                    $("#tb5").tablesorter({
                        headers:{
                            3:{sorter: "datasize"}    
                        }
                    });
                }); 
                //Enable to select every row in table
                var table = document.getElementById("tb5");
                var rows = table.getElementsByTagName("tr");
                for (i = 1; i < rows.length; i++) 
                {
                    var currentRow = table.rows[i];
                    var createClickHandler = 
                        function(row) 
                        {
                            //Double click any row in table to activate its corresponding page
                            return function() {  
                                var cell = row.getElementsByTagName("td")[1];
                                var bookName = cell.innerHTML;
                                if(window.external.ExtCall("ActivePage", bookName))
                                {
                                    document.getElementById("msg").className = "text-success";
                                    document.getElementById("msg").innerHTML = bookName + " is already active."; 
                                }
                                else
                                {
                                    document.getElementById("msg").className = "text-success";
                                    document.getElementById("msg").innerHTML = "Failed to active " + bookName + "."; 
                                }
                            };
                        };
                    currentRow.ondblclick = createClickHandler(currentRow);
                }  
                //Enable to check/uncheck DeleteAll checkbox to check/uncheck all the checkboxes
                var checkall = document.getElementById("checkbox0");
                checkall.addEventListener("click", function(){
                    if($(this).is(":checked")) {
                        $(":checkbox").each(function() { this.checked = true;});
                    }
                    else {
                        $(":checkbox").each(function() { this.checked = false;});
                    }  
                }); 

                //init buttons and message
                document.getElementById("msg").className = "text-success";
                document.getElementById("msg").innerHTML = "Double click on any row to activate the book!"; 
                $("#tab5Select").prop("disabled",true);
                $("#tab-5 .float-right").show();
            } 
            //END 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB  
        }


   
    });
       
    selectedImgsArr = [];
    var selectMode = false;
    var select5 = document.getElementById("tab5Select");
    select5.addEventListener("click",function(){
        if(($("#section2").css("display")) == "none")
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Please check the graph list at first!"; 
        }
        else
        {
            if(!selectMode)
            {
                selectMode = true;
                $("span[name='tab5SelectText']").text("Cancel");
                $("#tab-5 .float-right").show();
                selectImage(selectedImgsArr);
            }
            else
            {
                selectMode = false;
                $("span[name='tab5SelectText']").text("Select");
                $("#tab-5 .float-right").hide();  
                $("img").removeClass("selected");
                $("img").off("click");
                selectedImgsArr = [];
            }         
        }  
    });
          
    var export5 = document.getElementById("tab5Export");
    export5.addEventListener("click",function(){
        //Yuki 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
        const viewmode = document.querySelector('input[name="viewmode"]:checked').value
        if("details" == viewmode){
            selectedImgsArr = [];
            $(".table").each(function(){
                $(this).find("tbody input:checked").parents("tr").find("td:nth-child(2)").each(function() {
                    selectedImgsArr.push(this.innerHTML);
                });
            });
        }
        //END 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
        var ret = window.external.ExtCall("ExportGraph", selectedImgsArr);
        if(ret)
        {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "The Export Graphs dialog is opened."; 
        }
        else
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Please select at least one graph."; 
        }        
    });
    
    var sendToGraph5 = document.getElementById("tab5SendToGraph");
    sendToGraph5.addEventListener("click",function(){
        //Yuki 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
        const viewmode = document.querySelector('input[name="viewmode"]:checked').value
        if("details" == viewmode){
            selectedImgsArr = [];
            $(".table").each(function(){
                $(this).find("tbody input:checked").parents("tr").find("td:nth-child(2)").each(function() {
                    selectedImgsArr.push(this.innerHTML);
                });
            });
        }
        //END 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
        var ret = window.external.ExtCall("SendToGraph", selectedImgsArr);
        if(ret)
        {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "The selected graph previews have been sent to the correspoding graph windows."; 
        }
        else
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Please select at least one graph."; 
        }        
    });
    //END APPS-68-S4-NEW_GRAPH_TAB
    
    //***************
    // This fucntion will be triggered by clicking Delete button
    // When click Delete button in Tab2, Tab4 and Tab5.
    $("#YesCancelDialog").on("click", "#YesDelete", function(e) {  
        //Yuki 01/04/2018 APPS-68-S4-NEW_GRAPH_TAB        
        var source = $(e.delegateTarget).data("bs.modal").options.source;
        if("tab5" == source){
            const viewmode = document.querySelector('input[name="viewmode"]:checked').value
            if("extra_large_icon" == viewmode)
                deleteGraphs(selectedImgsArr);
            //Yuki 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
            else if("details" == viewmode) 
                deleteBooksOrSheets("book");
            //END 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
        }
        //END APPS-68-S4-NEW_GRAPH_TAB
        else {
            if("tab2" == source) {
                var checkmode = document.querySelector('#tab-2 input[name="radiomode"]:checked').value;
                deleteBooksOrSheets(checkmode);
            }
            else
                deleteBooksOrSheets("book");
        }    
    });
    //***************   
};

// This is the function used to generate 
// a dynamic table in the first tab 
function newTab1Table(RowsNum, checkmode) 
{     
    var tableHeader;
    if(checkmode=="sheet")
    {
        tableHeader_1 = "Sheet";
        //-----Yuki 2017-05-31 APPS-280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
        tableHeader_3= "Dependent Short Names"
        //--- END APPS_280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
    }
    else if(checkmode=="column")
    {
        tableHeader_1 = "Column";
        //-----Yuki 2017-05-31 APPS_280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
        tableHeader_3= "Graph Short Names"
        //--- END APPS_280-S4 FIND_OP_OUTPUT_SHEET_NOT_IN_BOOK
    }
    
    var data = "";
    data += "<div class=\"table-responsive\">";
    data += "<table id=\"tb1\" class=\"table table-condensed table-hover\">";   // Set the head for table
    data += "<thead>" + 
            "<tr>" + 
            "<th>#</th>" +   
            "<th>" + tableHeader_1 + "</th>" + 
            "<th>Long Name</th>" +  
            "<th>" + tableHeader_3 + "</th>" + 
            "</tr>" +
            "</thead>" +
            "<tbody>";   
    for (var i = 1; i <= RowsNum; i++) // Set the body for table
    {   
        data += "<tr>";  
        data += "<td>" + i + "</td>"; // Column for number
        data += "<td></td>"; // Column for short name
        data += "<td></td>"; // Column for long name
        data += "<td></td>"; // Column for name of dependents
        data += "</tr>";   
    } 
    data += "</tbody>";    
    data += "</table>"; 
    data += "</div>";
    document.getElementById("table1").style.display = "block";   
    document.getElementById("table1").innerHTML = data;    
}    

function showTab1OneRow(stringOutput, RowIndex)
{ 
    var JsonOutput = JSON.parse(stringOutput);//Parse string to Json
    var table = document.getElementById("tb1");
    table.rows[RowIndex].cells[1].innerHTML = JsonOutput.SN;
    table.rows[RowIndex].cells[2].innerHTML = JsonOutput.LN;
    table.rows[RowIndex].cells[3].innerHTML = JsonOutput.Name;
} 

//This is the function used to append to
//show the current book or sheet in table
function showCurrentAcitve(currentname)
{
    var data = "";
    data += "<font class=\"text-primary\">" +
            "* The active book is " +
            currentname +
            "</font></br>";
    document.getElementById("ActiveBookMsg").style.display = "block"; 
    document.getElementById("ActiveBookMsg").innerHTML = data;     
}

//This is the function used to get the path of preview
//and then construct a graph preview div
function constructGraphPreview(graphName)
{
    var graphPreview = "<div class=\"graphpreview\">";
    //This is the function to call OC to append the paths of graph preview                             
    var strGraphPath = window.external.ExtCall("ShowGraphPreview", graphName); 
    var graphPath; 
    //-----Yuki 2017-05-23 APPS_280-P1 FIX_ERROR_MESSAGE_WHILE_GRAPH_PATH_IS_NULL
    //var JsonOutput = JSON.parse(strGraphPath);//Parse string to Json
    //END FIX_ERROR_MESSAGE_WHILE_GRAPH_PATH_IS_NULL   
    if (strGraphPath == "0")
    {
        document.getElementById("msg").className = "text-danger";
        document.getElementById("msg").innerHTML = "Failed to get preview!"; 
        //---Yuki 06/06/2017 APPS_280-P6 ADD_HINT_IN_PREVIEW_FOR_EMBEDDED_GRAPHS
        //return null;
        graphPath = "<p class=\"text-danger\"> Cannot view graph since it is an embedded graph!</p>";
        //---END APPS_280-P6 ADD_HINT_IN_PREVIEW_FOR_EMBEDDED_GRAPHS
    }
    else
    {
        //-----Yuki 2017-05-23 APPS_280-P1 FIX_ERROR_MESSAGE_WHILE_GRAPH_PATH_IS_NULL
        var JsonOutput = JSON.parse(strGraphPath);//Parse string to Json
        //END FIX_ERROR_MESSAGE_WHILE_GRAPH_PATH_IS_NULL
        graphPath = "<img name=\"" +
                    JsonOutput.Name +
                    "\" src=\"" + 
                    JsonOutput.Path + 
                    "\" class=\"img-responsive center-block\"/>";
        //---YUKI 2017-05-18 APPS_280-P1 FIX_ACTIVATE_GRAPH_PAGE_CALLED_REPEATEDLY
        // $(document).on("dblclick", ".graphpreview img", function() {
        //     var imgSource = $(this).attr("src");
        //     var graphName = imgSource.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi,"$1"); 
        //     if(window.external.ExtCall("ActivePage", graphName))
        //     {
        //         document.getElementById("msg").className = "text-success";
        //         document.getElementById("msg").innerHTML = graphName + " is already active.";
        //         $("[data-toggle='popover']").popover("hide");
        //     }
        // }); 
        //--- END FIX_ACTIVATE_GRAPH_PAGE_CALLED_REPEATEDLY                       
    }
    graphPreview += graphPath + "</div>";  
    return graphPreview;
}

// This is the function used to generate 
// a dynamic table in the second tab 
function newTab2Table(RowsNum) 
{     
    // If the number of rows = 0, error message shows
    if (RowsNum < 1) 
    { 
        document.getElementById("table2").style.display = "none";
        document.getElementById("msg").className = "text-danger";
        document.getElementById("msg").style.innerHTML = "There is no Independent Book!";
    }
    else
    {
        var data = ""; 
        data += "<div class=\"table-responsive\">";  
        data += "<table id=\"tb2\" class=\"table table-condensed table-hover\">";   // Set the head for table
        data += "<thead>" + 
                "<tr>" + 
                "<th># <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></span></th>" +
                "<th>Book/Sheet <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Long Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +  
                "<th>Location <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Size <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                //---Yuki 06/02/2017 APPS-280-S6 INDEP_BOOK_SHOW_OP_COUNT
                "<th>Operations <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
                //--- END 06/02/2017 APPS-280-S6 INDEP_BOOK_SHOW_OP_COUNT
                "<th><input type=\"checkbox\" id=\"checkbox0\"></th>" + //<label for=\"checkbox0\">Delete</label></th>" + 
                "</tr>" +
                "</thead>" +
                "<tbody>";   
        for (var i = 1; i <= RowsNum; i++) // Set the body for table
        {   
            data += "<tr>";  
            data += "<td>" + i + "</td>"; // Column for number
            data += "<td></td>"; // Column for short Name
            data += "<td></td>"; // Column for long Name
            data += "<td></td>"; // Column for project path
            data += "<td></td>"; // Column for size
            //---Yuki 06/02/2017 APPS-280-S6 INDEP_BOOK_SHOW_OP_COUNT
            data += "<td></td>"; // Column for operation
            //--- END 06/02/2017 APPS-280-S6 INDEP_BOOK_SHOW_OP_COUNT
            data += "<td><input type=\"checkbox\" name=\"checkbox\" id=\"checkbox" + i + "\"></td>"; // Column for delete checkbox
            data += "</tr>";   
        } 
        data += "</tbody>";    
        data += "</table>"; 
        data += "</div>";
        document.getElementById("table2").style.display = "block";   
        document.getElementById("table2").innerHTML = data;    
    }
} 

function showTab2OneRow(stringOutput, RowIndex)
{ 
    var JsonOutput = JSON.parse(stringOutput);//Parse string to Json
    var table = document.getElementById("tb2");
    table.rows[RowIndex].cells[1].innerHTML = JsonOutput.SN;
    table.rows[RowIndex].cells[2].innerHTML = JsonOutput.LN;
    table.rows[RowIndex].cells[3].innerHTML = JsonOutput.Path;
    table.rows[RowIndex].cells[4].innerHTML = JsonOutput.Size;
    //---Yuki 06/02/2017 APPS-280-S6 INDEP_BOOK_SHOW_OP_COUNT
    table.rows[RowIndex].cells[5].innerHTML = JsonOutput.OP;
    //---END 06/02/2017 APPS-280-S6 INDEP_BOOK_SHOW_OP_COUNT
} 

// This is the function used to delete 
// the rows that is checked in table 
function deleteBooksOrSheets(bookOrSheet)
{
    var deleteRowNum = 0;
    //Yuki 10/11/2017 APPS-68-S3-NEW_MATCHED_BOOK_TAB
    $(".table").each(function(){
        var $anchor = $(this);
        $(this).find("tbody input:checked").parents("tr").find("td:nth-child(2)").each(function() {
    //END 10/11/2017 APPS-68-S3-NEW_MATCHED_BOOK_TAB
            var ret;
            if("book" == bookOrSheet)
                ret = window.external.ExtCall("DeletePage", this.innerHTML);
            else {
                var location = $(this).next('td').next('td').text();
                ret = window.external.ExtCall("DeleteSheet", this.innerHTML, location);
            }
            if(!ret)
            {
                document.getElementById("msg").className = "text-danger";
                document.getElementById("msg").innerHTML = "Failed to delete " + this.innerHTML + "."; 
                return;
            }
            deleteRowNum++;
        });
        //Yuki 10/11/2017 APPS-68-S3-NEW_MATCHED_BOOK_TAB
        $(this).find("tbody input:checked").parents("tr").remove();
        $anchor.trigger("update");
        //END 10/11/2017 APPS-68-S3-NEW_MATCHED_BOOK_TAB
        document.getElementById("msg").className = "text-success";
        document.getElementById("msg").innerHTML = "Delete " + deleteRowNum + " book(s)/sheet(s)."; 
        $(".deletebutton").attr('disabled', 'disabled');
    });
}

//Yuki 01/04/2018 APPS-68-S4-NEW_GRAPH_TAB
function deleteGraphs(selectedImgsArr)
{
    var graphNum = selectedImgsArr.length;
    if(0 == graphNum)
    {
        document.getElementById("msg").className = "text-danger";
        document.getElementById("msg").innerHTML = "Please select at least one graph."; 
        return false;
    }
    var deleteGraphNum = 0;
    for(var ii=0; ii < graphNum; ii++)
    {
        if(window.external.ExtCall("DeletePage", selectedImgsArr[ii]) == 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Failed to delete " + selectedImgsArr[ii] + "."; 
            return false;
        }
        //Remove image from the section.
        var imgElement = $("img[src$='" + selectedImgsArr[ii] + ".png']");
        imgElement.parents("td").remove();
        selectedImgsArr.splice(ii, 1);
        deleteGraphNum++;
    }
    document.getElementById("msg").className = "text-success";
    document.getElementById("msg").innerHTML = "Delete " + deleteGraphNum + " graphs."; 
    return true;
}
//END APPS-68-S4-NEW_GRAPH_TAB

// This is the function used to generate 
// a dynamic table in the third tab 
function newTab3Table(RowsNum) 
{     
    // If the number of rows = 0, error message shows
    if (RowsNum < 1) 
    { 
        document.getElementById("table3").style.display = "none";
        document.getElementById("msg").className = "text-danger";
        document.getElementById("msg").style.innerHTML = "There is no book with dependent in this project!";
    }
    else
    {
        var data = "";  
        data += "<div class=\"table-responsive\">";  
        data += "<table id=\"tb3\" class=\"table table-condensed table-hover\">";   // Set the head for table      
        data += "<thead>" + 
                "<tr>" + 
                "<th># <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +   
                "<th>Book<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Long Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +  
                "<th>Project Folder <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Size <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Number of Dependents <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "</tr>" +
                "</thead>" +
                "<tbody>";   
        for (var i = 1; i <= RowsNum; i++) // Set the body for table
        {   
            data += "<tr>";  
            data += "<td>" + i + "</td>"; // Column for number
            data += "<td></td>"; // Column for short Name
            data += "<td></td>"; // Column for long Name
            data += "<td></td>"; // Column for project path
            data += "<td></td>"; // Column for size
            data += "<td></td>"; // Column for dependents number
            data += "</tr>";   
        } 
        data += "</tbody>";    
        data += "</table>"; 
        data += "</div>";
        document.getElementById("table3").style.display = "block";   
        document.getElementById("table3").innerHTML = data;    
    }
} 

function showTab3OneRow(stringOutput, RowIndex)
{ 
    var JsonOutput = JSON.parse(stringOutput);//Parse string to Json
    var table = document.getElementById("tb3");
    table.rows[RowIndex].cells[1].innerHTML = JsonOutput.SN;
    table.rows[RowIndex].cells[2].innerHTML = JsonOutput.LN;
    table.rows[RowIndex].cells[3].innerHTML = JsonOutput.Path;
    table.rows[RowIndex].cells[4].innerHTML = JsonOutput.Size;
    table.rows[RowIndex].cells[5].innerHTML = JsonOutput.Num;
} 

//Yuki 09/27/2017 APPS-68-S3-NEW_MATCHED_BOOK_TAB
//Yuki 01/05/2017 APPS-68-S4-NEW_GRAPH_TAB
//function newCollapsePanel()
//END APPS-68-S4-NEW_GRAPH_TAB
function newCollapsePanel(sectionID)
{
    var data = "";
    data += "<div class=\"panel-group\" id=\"sec" + sectionID + "\">";
            "</div>";
    document.getElementById("section" + sectionID).style.display = "block";   
    document.getElementById("section" + sectionID).innerHTML = data;   
}

function newSection(sectionIndex, RowsNum)
{
    var data = "";
    data += "<div class=\"panel panel-default\">";
    data += "<div class=\"panel-heading\">" +
            "<h5 class=\"panel-title\">" + 
            "<a data-toggle=\"collapse\" data-parent=\"#sec1\" href=\"#collapse" + sectionIndex + "\">" +
            //Yuki 03/16/2018 APPS_280_S8_ADD_BUTTONS_TO_SHOW_THE_SECTION_TITLE_STRAIGHTFORWARD
            "<span class=\"glyphicon glyphicon glyphicon-triangle-bottom\" aria-hidden=\"true\"></span>" +
            "<span> </span>" +
            // END APPS_280_S8_ADD_BUTTONS_TO_SHOW_THE_SECTION_TITLE_STRAIGHTFORWARD
            "Found #" + sectionIndex +
            "</a>" +
            "</h5>" +
            "</div>"; 
    //Expand the first section and collapse the other sections
    if(sectionIndex == 1) 
    {
        data += "<div id=\"collapse" + sectionIndex + "\" class=\"panel-collapse collapse in\">";
    }
    else
    {
        data += "<div id=\"collapse" + sectionIndex + "\" class=\"panel-collapse collapse\">";    
    }
    data += "<div class=\"panel-body\">" +
            "<table id=\"section" + sectionIndex + "tb\" class=\"table table-condensed table-hover\">";  
    data += "<thead>" +
            "<tr>" +
            "<th>#<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th>Book<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th>Long Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th>Project Folder <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th>Size <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th>Number of Imported File <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th><input type=\"checkbox\" class=\"checkbox0\"></th>" + 
            "</tr>" +
            "</thead>" +
            "<tbody>";                      
    for (var i = 1; i <= RowsNum; i++) // Set the body for table
    {   
        data += "<tr>";  
        data += "<td>" + i + "</td>"; // Column for number
        data += "<td></td>"; // Column for short Name
        data += "<td></td>"; // Column for long Name
        data += "<td></td>"; // Column for project path
        data += "<td></td>"; // Column for size
        data += "<td></td>"; // Column for the number of imported file
        data += "<td><input type=\"checkbox\" name=\"checkbox\" id=\"checkbox" + i + "\"></td>"; // Column for delete checkbox
        data += "</tr>";   
    } 
    data += "</tbody>" +
            "</table>" +
            "</div></div></div>";      
    $("#sec1").append(data);   
}

function showTab4OneRow(stringOutput, RowIndex, sectionIndex)
{
    var JsonOutput = JSON.parse(stringOutput);//Parse string to Json
    var table = document.getElementById("section" + sectionIndex + "tb");
    table.rows[RowIndex].cells[1].innerHTML = JsonOutput.SN;
    table.rows[RowIndex].cells[2].innerHTML = JsonOutput.LN;
    table.rows[RowIndex].cells[3].innerHTML = JsonOutput.Path;
    table.rows[RowIndex].cells[4].innerHTML = JsonOutput.Size;
    table.rows[RowIndex].cells[5].innerHTML = JsonOutput.ImportedFileNum;
}
//END APPS-68-S3-NEW_MATCHED_BOOK_TAB

//Yuki 01/05/2017 APPS-68-S4-NEW_GRAPH_TAB
function newGraphSection(sectionIndex, graphFolder)
{
    var data = "";
    data += "<div class=\"panel panel-default\">";
    data += "<div class=\"panel-heading\">" +
            "<h5 class=\"panel-title\">" + 
            // "<a data-toggle=\"collapse\" data-parent=\"#sec2\" href=\"#collapse_2" + sectionIndex + "\">" +
            "Folder:" + graphFolder +
            // "</a>" +
            "</h5>" +
            "</div>"; 
    //Expand the first section and collapse the other sections
    // if(sectionIndex == 1) 
    // {
    //     data += "<div id=\"collapse_2" + sectionIndex + "\" class=\"panel-collapse collapse in\">";
    // }
    // else
    // {
    //     data += "<div id=\"collapse_2" + sectionIndex + "\" class=\"panel-collapse collapse\">";    
    // }
    data += "<div class=\"panel-body\">"+
            "<div class=\"table-responsive\">"+
            "<table id=\"graphSection" + sectionIndex + "tb\" class=\"table table-condensed\">"+      
            "</table>"+
            "</div>"+
            "</div>"; 
    $("#sec2").append(data); 
}

function insertGraphsToSection(sectionIndex, graphsInGroup)
{
    var graphNum = Object.keys(graphsInGroup).length - 1;
    var data = "";
    var cols = 4;
    var rows = Math.floor(graphNum/cols) + 1; 
    var graphPaths = [];   
    for(var ii = 1; ii <= graphNum; ii++)
    {      
        var graphName = graphsInGroup[ii];
        var graphJson = window.external.ExtCall("ShowGraphPreview", graphName);
        //alert(graphJson);
        var graphObj = JSON.parse(graphJson);
        graphPaths[ii] = graphObj.Path;
    }
    for(ii = 0; ii < rows; ii++)
    {
        data += "<tr>";
        for(var jj = 0; jj < cols; jj++)
        {
            if((ii*cols+jj+1) <= graphNum)
            {
                data += "<td>"+
                        "<img class=\"img-responsive\" src = \"" + graphPaths[ii*cols+jj+1] + "\">"+
                        "</td>";
            }
            else
            {
                data += "<td></td>"
            }
        }
        data += "</tr>";
    }
    document.getElementById("graphSection" + sectionIndex + "tb").innerHTML = data;  
}

function selectImage(selectedImgsArr)
{
    $("img").click(function() 
    {
        var graphPath = $(this).attr("src");
        var graphName = graphPath.substring(graphPath.lastIndexOf("\\") + 1).replace(".png", "");
        if ($(this).hasClass("selected"))
        {
            $(this).removeClass("selected");
            selectedImgsArr.splice($.inArray(graphName, selectedImgsArr), 1);
        }
        else
        {
            $(this).addClass("selected");
            selectedImgsArr.push(graphName); 
        }
        var num = selectedImgsArr.length;
        document.getElementById("msg").className = "text-success";
        document.getElementById("msg").innerHTML = "Selecting " + num + " graphs."; 
    });    
}
//Yuki 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB 
function newTab5Table(RowsNum) 
{     
    var data = "";
    data += "<div class=\"table-responsive\">";
    data += "<table id=\"tb5\" class=\"table table-condensed table-hover\">";   // Set the head for table
    data += "<thead>" + 
            "<tr>" + 
            "<th>#<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +   
            "<th>Name<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +  
            "<th>Folder<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
            "<th>Size<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th>Source<span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +
            "<th><input type=\"checkbox\" id=\"checkbox0\"></th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>";   
    for (var i = 1; i <= RowsNum; i++) // Set the body for table
    {   
        data += "<tr>";  
        data += "<td>" + i + "</td>"; // Column for number
        data += "<td></td>"; // Column for short name
        data += "<td></td>"; // Column for location
        data += "<td></td>"; // Column for size
        data += "<td style='word-wrap:break-word;word-break:break-all;' width='40%;'></td>"; // Column for source
        data += "<td><input type=\"checkbox\" name=\"checkbox\" id=\"checkbox" + i + "\"></td>"; // Column for delete checkbox
        data += "</tr>";   
    } 
    data += "</tbody>";    
    data += "</table>"; 
    data += "</div>";
    document.getElementById("table5").style.display = "block";   
    document.getElementById("table5").innerHTML = data;    
} 
function showTab5OneRow(stringOutput, RowIndex)
{ 
    var JsonOutput = JSON.parse(stringOutput);//Parse string to Json
    var table = document.getElementById("tb5");
    table.rows[RowIndex].cells[1].innerHTML = JsonOutput.SN;
    table.rows[RowIndex].cells[2].innerHTML = JsonOutput.Path;
    table.rows[RowIndex].cells[3].innerHTML = JsonOutput.Size;
    table.rows[RowIndex].cells[4].innerHTML = JsonOutput.Source;
} 
//END 08/05/2021 APPS-1082-S1-DETAILS_VIEW_FOR_GRAPH_TAB  
//END APPS-68-S4-NEW_GRAPH_TAB
