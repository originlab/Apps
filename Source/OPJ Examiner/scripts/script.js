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
            document.getElementById("msg").innerHTML =  "Click any the graph name to show its graph preview.";                            
            //When click the graph name (link) in Table1 
            $("#tb1 a").click(function(){
                var $anchor = $(this);             
                //Get the name of object
                var objName = $anchor.parents("tr").find("td:nth-child(2)").html();
                //Global variable
                graphPaths = "<div class=\"panel-graphpreview\" id=\"graphpreview\">";
                //This is the function to call OC to append the paths of graph preview                             
                var showImageStatus = window.external.ExtCall("ShowGraphPreview", checkmode, objName); 
                
                //Append a button at the end of the popover                              
                graphPaths += "</div></br><div style=\"text-align:center\"><button type=\"button\" class=\"btn btn-xs btn-primary tab1ClosePreview\">" +  
                                                "Close Preview</button></div>"
                
                //Initialize popovers
                //$anchor.popover("destroy").popover({
                $anchor.popover({    
                    html: "true",
                    placement : "left",
                    title: "Graph Preview",
                    content: graphPaths,
                    viewport: "#tab-1",
                })
                $anchor.popover("show");
                $("[data-toggle='popover']").not($anchor).popover("destroy");
                //When click the Close Preview button         
                $anchor.on("shown.bs.popover", function() {
                     $('.tab1ClosePreview').click(function() {        
                        $anchor.popover("destroy");
                        document.getElementById("msg").className = "text-success";
                        document.getElementById("msg").innerHTML =  "Click the graph name to show its graph preview."; 
                    });
                });
                
                enableToActiveImage(showImageStatus, checkmode, objName);        
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
            document.getElementById("msg").innerHTML = "There is no Independent book in this project!"; 
            document.getElementById("table2").style.display = "none";
            return;
        }
        else
        {
            document.getElementById("msg").className = "text-success";
            document.getElementById("msg").innerHTML = "Double click on any row to active the book!"; 
            //4. Enable to sort table by clicking table header
            $(function(){
            $("#tb2").tablesorter();
            });        
            //5. Enable to check/uncheck DeleteAll checkbox to check/uncheck all the checkboxes
            var deletecheck = document.getElementById("checkbox0");
            deletecheck.addEventListener("click", function(){
                if($(this).is(':checked'))
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
            $(":checkbox").each(function() {
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
                        //6. Double click any row in table to active its corresponding workbook
                        return function() {  
                                            var cell = row.getElementsByTagName("td")[1];
                                            var bookName = cell.innerHTML;
                                            if(window.external.ExtCall("ActivePage", bookName))
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML = "Active " + bookName + "."; 
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
            document.getElementById("msg").innerHTML = "Double click on any row to active the book!"; 
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
                        //6. Double click any row in table to active its corresponding workbook
                        return function() {  
                                            var cell = row.getElementsByTagName("td")[1];
                                            var bookName = cell.innerHTML;
                                            if(window.external.ExtCall("ActivePage", bookName))
                                            {
                                                document.getElementById("msg").className = "text-success";
                                                document.getElementById("msg").innerHTML = "Active " + bookName + "."; 
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
    var data = "";
    data += "<div class=\"table-responsive\">";
    data += "<table id=\"tb1\" class=\"table table-condensed table-hover\">";   // Set the head for table
    data += "<thead>" + 
            "<tr>" + 
            "<th>#</th>" +   
            "<th>Short Name</th>" + 
            "<th>Long Name</th>" +  
            "<th>Number of Graphs</th>" + 
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
        data += "<td></td>"; // Column for number of dependents
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
    table.rows[RowIndex].cells[3].innerHTML = JsonOutput.Num;
    table.rows[RowIndex].cells[4].innerHTML = "<a data-toggle=\"popover\">" + JsonOutput.Name + "</a>";
} 

//This is the function used to append to
//show the current book or sheet in table
function showCurrentAcitve(currentname)
{
    var data = "";
    data += "<small class=\"text-primary\">" +
            "* " +
            currentname +
            "</small>";
    document.getElementById("ActiveBookMsg").style.display = "block"; 
    document.getElementById("ActiveBookMsg").innerHTML = data;     
}

function appendImageInContent(stringOutput)
{
    var JsonOutput = JSON.parse(stringOutput);//Parse string to Json
    imagePath = "<img name=\"" +
                JsonOutput.Name +
                "\" src=\"" + 
                JsonOutput.Path + 
                "\" class=\"img-responsive center-block\"/>" +  
                "</br></br>"; 
    graphPaths += imagePath;
}

// This is the function used to show the graph preview
function enableToActiveImage(showImageStatus, checkmode, objName)
{
    if (showImageStatus == -1)
    {
        document.getElementById("msg").className = "text-danger";
        document.getElementById("msg").innerHTML = "Failed to show preview!"; 
    }
    else
    {
        $(document).on("dblclick", "#graphpreview img", function(){
            var imgSource = $(this).attr("src");
            var graphName = imgSource.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi,"$1");
            window.external.ExtCall("ActivePage", graphName);
        });
        
        var graphName =  window.external.ExtCall("ShowGraphNameString", checkmode, objName);
        document.getElementById("msg").className = "text-success";
        document.getElementById("msg").innerHTML = graphName; 
        $("#msg").append(" Double click the preview to active its graph window.");
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
        data += "<table id=\"tb2\" class=\"table table-condensed table-hover\">";   // Set the head for table
        data += "<thead>" + 
                "<tr>" + 
                "<th>#<img src=\"icon/expand.png\" width=\"5\"></th>" +   
                "<th>Short Name <img src=\"icon/expand.png\" width=\"5\"></th>" + 
                "<th>Long Name <img src=\"icon/expand.png\" width=\"5\"></th>" +  
                "<th>Project Folder <img src=\"icon/expand.png\" width=\"5\"></th>" + 
                "<th>Size <img src=\"icon/expand.png\" width=\"5\"></th>" + 
                "<th><input type=\"checkbox\" id=\"checkbox0\"><label for=\"checkbox0\">Delete</label></th>" + 
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
        data += "<table id=\"tb3\" class=\"table table-condensed table-hover\">";   // Set the head for table
        data += "<thead>" + 
                "<tr>" + 
                "<th>#<img src=\"icon/expand.png\" width=\"5\"></th>" +   
                "<th>Short Name <img src=\"icon/expand.png\" width=\"5\"></th>" + 
                "<th>Long Name <img src=\"icon/expand.png\" width=\"5\"></th>" +  
                "<th>Project Folder <img src=\"icon/expand.png\" width=\"5\"></th>" + 
                "<th>Size <img src=\"icon/expand.png\" width=\"5\"></th>" + 
                "<th>Number of Dependents <img src=\"icon/expand.png\" width=\"5\"></th>" + 
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