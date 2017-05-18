// This function will be called after the entire document has
// finished loading.
window.onload = function(){
           
    //***************
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
        //var checkStatus = 1;
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
                    html: "true",
                    placement : "top",
                    trigger: "manual",
                    title: "Graph Preview",
                    content: graphPreview,
                    viewport: "#tab-1"
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
        var findStatus = window.external.ExtCall("GetIndependentBookInfo");
        //3. Show message in box
        if(findStatus < 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Error!"; 
            document.getElementById("table2").style.display = "none";
            return;
        }
        else if (findStatus == 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "There are no independent book in this project."; 
            document.getElementById("table2").style.display = "none";
            return;
        }
        else
        {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Double click on any row to activate the book."; 
            //4. Enable to sort table by clicking table header
            $(function(){
            $("#tb2").tablesorter();
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
                                            var bookName = cell.innerHTML;
                                            if(window.external.ExtCall("ActivePage", bookName))
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML =  bookName + " is already active."; 
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
    //***************
    
    //***************
    // This fucntion will be triggered by clicking Delete button
    // When click Delete button in Tab2.
    var delete2 = document.getElementById("tab2Delete");
     delete2.addEventListener("click", function(){
        deleteBooks();
     });
    //***************
    
    //***************
    // This fucntion will be triggered by clicking Find button
    var find3 = document.getElementById("tab3Find");
    // When click Find button in Tab3.
    find3.addEventListener("click", function(){
        //1. Hide table3 div
        document.getElementById("table3").style.display = "none";
        //2. New a table and fill the table with dependents info
        var findStatus = window.external.ExtCall("GetDependentBookInfo");
        //3. Show message in box
        if(findStatus < 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Error!"; 
            document.getElementById("table3").style.display = "none";
            return;
        }
        else if (findStatus == 0)
        {
             document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "There is no book with dependent in this project!"; 
            document.getElementById("table3").style.display = "none";
            return;
        }
        else
        {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Double click on any row to activate the book!"; 
            //4. Enable to sort table by clicking table header
            $(function(){
            $("#tb3").tablesorter();
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
};

// This is the function used to generate 
// a dynamic table in the first tab 
function newTab1Table(RowsNum, checkmode) 
{     
    var tableHeader;
    if(checkmode=="sheet")
    {
        tableHeader = "Sheet";
    }
    else if(checkmode=="column")
    {
        tableHeader = "Column";
    }
    
    var data = "";
    data += "<div class=\"table-responsive\">";
    data += "<table id=\"tb1\" class=\"table table-condensed table-hover\">";   // Set the head for table
    data += "<thead>" + 
            "<tr>" + 
            "<th>#</th>" +   
            "<th>" + tableHeader + " Short Name</th>" + 
            "<th>" + tableHeader + " Long Name</th>" +  
            "<th>Graph Short Names</th>" + 
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
        
    var JsonOutput = JSON.parse(strGraphPath);//Parse string to Json
    if (strGraphPath == null)
    {
        document.getElementById("msg").className = "text-danger";
        document.getElementById("msg").innerHTML = "Failed to show preview!"; 
        return null;
    }
    else
    {
        var graphPath = "<img name=\"" +
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
        graphPreview += graphPath + "</div>";  
        return graphPreview;
    }
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
                "<th>Book Short Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Book Long Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +  
                "<th>Project Folder <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Size <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
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
} 

// This is the function used to delete 
// the rows that is checked in table 
function deleteBooks()
{
    var deleteRowNum = 0;
    $("#tb2 tbody input:checked").parents("tr").find("td:nth-child(2)").each(function() {
        if(window.external.ExtCall("DeletePage", this.innerHTML) == 0)
        {
            document.getElementById("msg").className = "text-danger";
            document.getElementById("msg").innerHTML = "Failed to delete " + bookName + "."; 
            return;
        }
        deleteRowNum++;
    });
    
    $("#tb2 tbody input:checked").parents("tr").remove();
    $("#tb2").trigger("update");
    document.getElementById("msg").className = "text-success";
    document.getElementById("msg").innerHTML = "Delete " + deleteRowNum + " books."; 
}

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
                "<th>Book Short Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" + 
                "<th>Book Long Name <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\" style=\"font-size:0.8rem;\"></th>" +  
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