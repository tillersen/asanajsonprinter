/* JavaScript for Asana-JSON-Printer */

window.onload = AJPRSetDefaults;

function AJPRreadfile(ev){
	if (window.FileReader) {
		var fileInput = document.getElementById('ajpr-json-file');
		var outTextbox = document.getElementById('ajpr-json-textbox');
		var file = fileInput.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {	outTextbox.innerText = reader.result;	}
		reader.readAsText(file);	
	} else {
		window.alert("Sorry, your browser does not support state of the art file selection and read methods. Please use the copy and paste way to insert the JSON code into the textbox.");
	}
}

function AJPRconvertJson(s) {
	if(s.trim()!="") {
		var jsonObj, x, i, tabletxt = "", infotxt = "";
		jsonObj = JSON.parse(s);
		jsonObj = jsonObj.data;
		/* create an object to store additional information */
		var dateoptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		var today  = new Date();
		var info = {today: today.toLocaleDateString(navigator.language,dateoptions), ntasks:0, nsections:0, nduedates:0, nassigned:0};
		/* analyse asana data */
		for (i in jsonObj) { //i is a string!
			E = jsonObj[i];
			/* Analyse Task name and Status 
			check if current entry is a section and store it */
			//if (E.name.endsWith(":")) {
			if (E.name.match(":$")) {
					//is a Section
					E.type = 'section';
					info.nsections +=1; //count sections
					E.cssclass = 'ajpr-asana-section';
					E.completed_text = "";
				} else {
					//is a task
					E.type = 'task';
					info.ntasks +=1; //count tasks
					E.cssclass = 'ajpr-asana-task';
					if (info.nsections > 0) E.cssclass = 'ajpr-asana-task-in-section';
					E.completed_text = "open";
					if (E.completed) {
						E.cssclass += ' ajpr-asana-status-completed';
						E.completed_text = "done";
					}
				}
			/* Analyse Due Date: */
			if (E.due_on==="null" || E.due_on===null || 
				E.due_on==="" || typeof E.due_on === "undefined") {
					var NoDuedateString = document.getElementById("txtNoDuedateString").value;
					E.due_on_text = NoDuedateString;
					E.hasduedate = false;
				} else {
					var duedate = new Date(E.due_on);
					E.due_on_text = duedate.toLocaleDateString(navigator.language);
					E.hasduedate = true;
					info.nduedates +=1; //count tasks with due-on dates
				}
			/* Analyse Assignee: */
			if (E.assignee==="null" || E.assignee===null || 
				E.assignee==="" || typeof E.assignee === "undefined") {
					var NoAssigneeString = document.getElementById("txtNoAssigneeString").value;
					E.assignee = NoAssigneeString;
				} else {
					E.assignee = E.assignee.name;
					info.nassigned +=1; //count assigned tasks
				}
				
			/* Analyse Projects: */
			if (E.projects==="null" || E.projects===null || 
				E.projects==="" || typeof E.projects === "undefined") {
					E.projects = "-";
				} else {
					var projectstxt = "";
					var sep = " / ";
					for (t in E.projects) {
						projectstxt += E.projects[t].name + sep;
					}
					projectstxt = projectstxt.slice(0,projectstxt.length-sep.length);
					E.projects = projectstxt;
				}
			
			/* Analyse Tags: */
			if (E.tags==="null" || E.tags===null || 
				E.tags==="" || typeof E.tags === "undefined") {
					E.tags = "-";
				} else {
					var tagstxt = "";
					var sep = " / ";
					for (t in E.tags) {
						tagstxt += E.tags[t].name + sep;
					}
					tagstxt = tagstxt.slice(0,tagstxt.length-sep.length);
					E.tags = tagstxt;
				}
			
			/* Analyse Likes: */
			if (E.liked = true){
				E.likes = E.likes.length;
				}
		}
		/* print info*/
		infotxt += '<p>';
		infotxt += info.today + '<br>';
		infotxt += 'Number of sections: ' + info.nsections + '<br>';
		infotxt += 'Number of tasks: ' + info.ntasks + '<br>';
		infotxt += 'Number of tasks with due dates: ' + info.nduedates + " (" + Math.floor((info.nduedates/info.ntasks)*100) + "% of tasks)" +'<br>';
		infotxt += 'Number of tasks with assignee: ' + info.nassigned + " (" + Math.floor((info.nassigned/info.ntasks)*100) + "% of tasks)" +'<br>';
		infotxt += '</>';
		
		var showNr = (document.getElementById("ajpr-nr-check").checked == true) ? true : false;
		var nrTH = document.getElementById("ajpr-nr-th").style;
		var showStatus = (document.getElementById("ajpr-status-check").checked == true) ? true : false;
		var statusTH = document.getElementById("ajpr-status-th").style;
		var showDuedate = (document.getElementById("ajpr-duedate-check").checked == true) ? true : false;
		var duedateTH = document.getElementById("ajpr-duedate-th").style;
		var showDuedateRelative = (document.getElementById("ajpr-duedate-relative-check").checked == true) ? true : false;
		var duedaterelativeTH = document.getElementById("ajpr-duedate-relative-th").style;
		var showAssignee = (document.getElementById("ajpr-assignee-check").checked == true) ? true : false;
		var assigneeTH = document.getElementById("ajpr-assignee-th").style;
		var showProjects = (document.getElementById("ajpr-projects-check").checked == true) ? true : false;
		var projectsTH = document.getElementById("ajpr-projects-th").style;
		var showTags = (document.getElementById("ajpr-tags-check").checked == true) ? true : false;
		var tagsTH = document.getElementById("ajpr-tags-th").style;
		var showLikes = (document.getElementById("ajpr-likes-check").checked == true) ? true : false;
		var likesTH = document.getElementById("ajpr-likes-th").style;
		
		for (i in jsonObj) { //i is a string!
			nr = Number(i)+1;
			E = jsonObj[i];
			
			tabletxt += '<tr>';
			
			if (showNr) { 
				tabletxt += '<td class="ajpr-asana-nr">' + nr + ')' + '</td>'; nrTH.display = "";
				} else { nrTH.display = "none";}
			
			if (showStatus) { 
				tabletxt += '<td class="ajpr-asana-status">' + E.completed_text + '</td>'; statusTH.display = "";
				} else { statusTH.display = "none";}
				
			/* No option to hide task name */
			tabletxt += '<td class="' + E.cssclass + '">' + E.name + '</td>';
				
			if (showDuedate) { 
				tabletxt += '<td class="ajpr-asana-duedate">' + E.due_on_text + '</td>'; duedateTH.display = "";
				} else { duedateTH.display = "none";}
				
			if (showDuedateRelative) { 
				if (E.hasduedate) {
					var diff = AJPRDateDiff("d", AJPRGetRefdate(), E.due_on)
					} else {
					var diff = "";
				}
				tabletxt += '<td class="ajpr-asana-duedate-relative">' + diff + '</td>'; 
				duedaterelativeTH.display = "";
				} else { duedaterelativeTH.display = "none";}
				
			if (showAssignee) { 
				tabletxt += '<td class="ajpr-asana-assignee">' + E.assignee + '</td>'; assigneeTH.display = "";
				} else { assigneeTH.display = "none";}
				
			if (showProjects) { 
				tabletxt += '<td class="ajpr-asana-projects">' + E.projects + '</td>'; projectsTH.display = "";
				} else { projectsTH.display = "none";}
				
			if (showTags) { 
				tabletxt += '<td class="ajpr-asana-tags">' + E.tags + '</td>'; tagsTH.display = "";
				} else { tagsTH.display = "none";}
				
			if (showLikes) { 
				tabletxt += '<td class="ajpr-asana-likes">' + E.likes + '</td>'; likesTH.display = "";
				} else { likesTH.display = "none";}
				
			tabletxt += '</tr>';
			}   
		//write HTML into document:
		document.getElementById("ajpr-output-infobox").innerHTML = infotxt;
		document.getElementById("ajpr-output-table-body").innerHTML = tabletxt;
	} else {
		window.alert("Text input is empty. Nothing to convert. Paste you JSON code first.");
	}
}


function AJPRtoggleInput(force){
/* Function to hide and show the left Input Container (Div) */
/* it does not set the w3-hide class explicitly, because the w3-hide class
was given in the html-code. The w3-show is dominant (override w3-hide). If
an element shall be visible onload it start with class="w3-hide w3-show" */
	//force: show | hide
	if (force === undefined) {
          force = "no";
    } 
	var i = document.getElementById("ajpr-input-div");
	var o = document.getElementById("ajpr-output-div");
    if (i.className.indexOf("w3-show") == -1) { //show
        i.className += " w3-show";
        o.className = o.className.replace("w3-rest", "w3-twothird");
    } else { //hide
        i.className = i.className.replace(" w3-show", "");
        o.className = o.className.replace("w3-twothird", "w3-rest");
    }
	if (force=="hide" && i.className.indexOf("w3-show") != -1) {
		AJPRtoggleInput();
	}
	if (force=="show" && i.className.indexOf("w3-show") == -1) {
		AJPRtoggleInput();
	}
}


function AJPRprint(){
/* Function to print without left pane */
	AJPRtoggleInput("hide");
	window.print();
}


function AJPRSetDefaults() {
/* Functions to be called onload of the window*/
	//set the default reference date for the Relative Due Date
	var today = new Date();
	document.getElementById("ajpr-refdate").valueAsDate = today;
	AJPRupdateRefDateInTH();
}


function AJPRupdateRefDateInTH() {
/* Functions to update the Table Header*/
	var refdate = document.getElementById("ajpr-refdate").valueAsDate;
	document.getElementById("ajpr-refdate-in-th").innerHTML = "until " + refdate.toLocaleDateString(navigator.language);
}


function AJPRGetRefdate() {
/* Function to get the Relative Date value*/
	return document.getElementById("ajpr-refdate").value;
}


function AJPRcopyOutputTable() {
/* Function to copy the whole output table to the clipboard */
	var table = document.getElementById('ajpr-output-table');
	if (table) {
		selectElementContents(table, true);
		alert("Copied the Output Table to the Clipboard.");
	}
	
}

function AJPRmarkOutputTable() {
/* Function to mark (select) the whole output table */
	var table = document.getElementById('ajpr-output-table');
	if (table) {
		selectElementContents(table);
	}
	
}


function selectElementContents(el, copy) {
/* Function to mark (select) an DOM element
 copied from https://stackoverflow.com/questions/2044616/select-a-complete-table-with-javascript-to-be-copied-to-clipboard 
 parameters: 
	el: DOM element
	copy: boolean: Copy the selection to the Clipboard?
 */
	if (copy === undefined) {
          copy = false;
    } 
	var body = document.body, range, sel;
	if (document.createRange && window.getSelection) {
		range = document.createRange();
		sel = window.getSelection();
		sel.removeAllRanges();
		try {
			range.selectNodeContents(el);
			sel.addRange(range);
		} catch (e) {
			range.selectNode(el);
			sel.addRange(range);
		}
		if (copy) document.execCommand("copy");
	} else if (body.createTextRange) {
		range = body.createTextRange();
		range.moveToElementText(el);
		range.select();
		if (copy) range.execCommand("Copy");
	}
}


function AJPRDateDiff(datepart, fromdate, todate) {
/* Functiomn to calculate Date Diffrences */
// datepart must be one of {'y', 'm', 'w', 'd', 'h', 'n', 's'}
  datepart = datepart.toLowerCase();
  fromdate = new Date(fromdate); //RefDate
  todate = new Date(todate); //DueOnDate
  var diff = todate - fromdate;	
  var divideBy = { w:604800000, 
                   d:86400000, 
                   h:3600000, 
                   n:60000, 
                   s:1000 };
  return Math.floor( diff/divideBy[datepart]);
}