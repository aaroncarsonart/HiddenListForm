/******************************************************************
HiddenSearchList
*******************************************************************
This allows for a field to search through a hidden list, and then show the
matching results.

It works!  Now I just have to combine hidden-list-search with hidden-form-controls.
******************************************************************/

function HiddenListSearch(){
	var hidden = 'hidden';
	var self = this;
	var dropdownFocused = false;
	
	// TODO include this if I need more than one dropdown???
	var dropdownFocusedId  = "";
	var showElementCondition = null;
	var enterKeyDown = false;
	var enterKeyReleased = true;
	
	// ****************************************************
	// Set the value of the showElementCondition.
	// ****************************************************
	this.setShowElementCondition = function(newFunction) {
		showElementCondition = newFunction;
	}
	
	// ****************************************************
	// Get the value of the showElementCondition.
	// (sets it to default if uninitialized)
	// ****************************************************
	this.getShowElementCondition = function(newFunction) {
		// determine onClickFunction
		if(typeof showElementCondition === 'undefined' ||
		   typeof showElementCondition != 'function') {
			console.log("search() - helper not a function, setting default");
			showElementCondition = function(listValue){
				return true;
			}
		}
		return showElementCondition;
	}
	
	// ************************************************************
	// Set the class of an element with the id to contain .hidden.
	// ************************************************************
	this.show = function(elem) {
		var elemClassName = elem.className;
		var index = (' ' + elemClassName + ' ').indexOf(hidden);
		
		if(index > -1){
			elem.setAttribute('class', elemClassName.replace(/(\s|^)hidden(\s|$)/, ' '));
		}
	}

	// ************************************************************
	// Set the class of an element with the id to not contain
	// .hidden.
	// ************************************************************
	this.hide = function(elem){
		var elemClassName = elem.className;
		var index = (' ' + elemClassName + ' ').indexOf(hidden);
	
		if(index === -1){
			elem.setAttribute('class', elem.className + ' ' + hidden);
		}
	}
	
	// **********************************************************
	// Registers multiple listeners on the input, for testing.
	// (used only to discover order of event firing)
	// **********************************************************
	this.registerManyListeners = function(inputId){
		var inputElement = document.getElementById(inputId);
				
		// 1.) handle KEYPRESS
		inputElement.addEventListener('keypress', function(event) {
			console.log("keypress: "+String.fromCharCode(event.keyCode));
			event.preventDefault();		 					
		});
		
		// 2.) handle KEYDOWN
		inputElement.addEventListener('keydown', function(event) {
			console.log("keydown: "+String.fromCharCode(event.keyCode));
		});

		// 3.) handle KEYUP		
		inputElement.addEventListener('keyup', function(event) {
			console.log("keyup: "+String.fromCharCode(event.keyCode));
		});
		
		// 4.) handle INPUT
		inputElement.addEventListener('input', function(event){
			console.log("input: " + inputElement.value);
		});
	}
				
	// ************************************************************
	// Creates a search for a text input that searches the given
	// list and displays the results in a selectable drop-down 
	// menu.
	// ************************************************************
	function search(inputValue, listId){
		var showCondition = self.getShowElementCondition();
		
		var ul = document.getElementById(listId);
		var query = inputValue.toLowerCase();
		
		// 1. Walk the LI elements of the drop down.  
		var nodes = ul.getElementsByTagName('LI');
		var nodeCount = nodes.length;
		var searchableItemsCount = nodeCount - 1;
		var hiddenCount = 0;
		
		for(var i = 1; i < nodeCount; i++) {
			var li = nodes[i];
			var a = li.childNodes[0];
			var listValue = a.innerHTML.toLowerCase();
			var queryIndex = listValue.indexOf(query);
			//console.log(i + ' queryIndex: ' + queryIndex);

			// 2. if it starts with the query, set the LI to visible.
			if(queryIndex == 0 && showCondition(a.innerHTML)) {
				self.show(li);
			}

			// 3. if it doesn't match, set the LI to hidden.
			else {
				self.hide(li);
				hiddenCount++;
			}
		}
				
		// 4. If no results, show a link to add the new text as a tag.
		var addNew = nodes[0];
		if (searchableItemsCount == hiddenCount) {
			self.show(addNew);
		}
		else{
			self.hide(addNew);
		}		
	}
		
	// *******************************************
	// Registers a listener for each dropdown list
	// element's nested anchor element do
	// something useful.
	//
	// Note that index zero is reserved for a 
	// special "Add new" li element that has
	// unique functionality from the rest.
	// *******************************************
	this.registerListOnClick = function(inputId, listId, hiddenInputId, onClickFunction) {
		var ul = document.getElementById(listId);
		var nodeList = ul.getElementsByTagName('LI');
		var listLength = nodeList.length;
		
		// register the first li element.
		var firstLink = nodeList[0].childNodes[0]
		firstLink.onclick = function(event) {
			event.preventDefault();
			var inputElement = document.getElementById(inputId);
		    var selectedValue = inputElement.value;
			inputElement.value = "";
			search("", listId);
			//setHiddenInputValue(selectedValue, hiddenInputId);
			onClickFunction(selectedValue);
			inputElement.focus();
		}
		
		// register all other li elements
		for(var i = 1; i < listLength; i++) {
			var li = nodeList[i];
			var a = li.childNodes[0];
			
			// **************************************
			// 1.) handle ONCLICK for anchor element
			// **************************************
			a.onclick = function(event){
			    var target = event.target || event.srcElement;
			    var selectedValue = event.target.innerHTML;
				event.preventDefault();
				//setHiddenInputValue(selectedValue, hiddenInputId);
				onClickFunction(selectedValue);
				dropdownFocused = false;
				console.log('set dropdownFocused: ' + dropdownFocused);
				var inputElement = document.getElementById(inputId);
				inputElement.value = "";
				search("", listId);
				inputElement.focus();
			}
			
			
			a.addEventListener('focus', function(){
				console.log('a.onfocus()');
				dropdownFocused = true;
				console.log('set dropdownFocused: ' + dropdownFocused);
				//var inputElement = document.getElementById(inputId);
				//inputElement.focus();
				//return false;
			});
			
			// **************************************
			// 2.) handle KEYDOWN for anchor element
			// **************************************
			/*
			a.addEventListener('keydown', function(event) {
				console.log('keydown');
					
				// ESCAPE key pressed.
				if(event.keyCode == 27){
					console.log("escape key pressed");
					var inputElement = document.getElementById(inputId);
					hideDropdownMenuIfVisible(inputElement);
				}
			
				
				// TAB key pressed.
				else if(event.keyCode == 9){
					console.log("tab key pressed");
					var inputElement = document.getElementById(inputId);
					hideDropdownMenuIfVisible(inputElement);
				}
			
			});
			*/
		}
	}
	
	// ***********************************************************
	// Called by selecting a list element anchor, for now this
	// sets the value of the hidden input to the selected value.
	// ***********************************************************
	function setHiddenInputValue(selectedValue, hiddenInputId){
		var hiddenInput = document.getElementById(hiddenInputId);
		hiddenInput.setAttribute('value', selectedValue);	
	}
	
	function getFirstVisibleListElement(
		inputValue, listId, hiddenInputId) {
		var showCondition = self.getShowElementCondition();
		var ul = document.getElementById(listId);
		var query = inputValue.toLowerCase();
		
		// 1. Walk the LI elements of the drop down.  
		var nodes = ul.getElementsByTagName('LI');
		var nodeCount = nodes.length;
		var searchableItemsCount = nodeCount - 1;
		var hiddenCount = 0;
		
		for(var i = 1; i < nodeCount; i++) {
			var li = nodes[i];
			var a = li.childNodes[0];
			var listValue = a.innerHTML;
			var queryIndex =listValue.toLowerCase().indexOf(query);
		
			// 2. get the first match (the first visible element)
			if(queryIndex == 0 && showCondition(listValue)) {
				return li;
			}
			else{
				hiddenCount++;
			}
		}
				
		// 3. If no matches, get the add new list element.
		var addNew = nodes[0];
		return addNew;
	}


	
	// ***********************************************************
	// Called by pressing enter when focused on the input, this
	// sets the value of the hidden input to the selected value.
	// ***********************************************************
	function clickFirstVisibleListElement(inputValue, 
	                                      listId, 
	                                      onClickFunction) {
		var ul = document.getElementById(listId);
		var query = inputValue.toLowerCase();
		var showCondition = self.getShowElementCondition();
		
		// 1. Walk the LI elements of the drop down.  
		var nodes = ul.getElementsByTagName('LI');
		var nodeCount = nodes.length;
		var searchableItemsCount = nodeCount - 1;
		var hiddenCount = 0;
		
		for(var i = 1; i < nodeCount; i++) {
			var li = nodes[i];
			var a = li.childNodes[0];
			var listValue = a.innerHTML;
			var queryIndex =listValue.toLowerCase().indexOf(query);
			
			// 2. click the first match (the first visible element)
			if(queryIndex == 0 && showCondition(listValue, listId)) {
				a.click();
				break;
			}
			else{
				hiddenCount++;
			}
		}
				
		// 3. If no matches, click the add new link.
		var addNew = nodes[0];
		if (searchableItemsCount == hiddenCount) {
			addNew.childNodes[0].click();
			onClickFunction(inputValue);			
		}
	}
	
	// ************************************************************
	// Helper function that registers all listeners with an
	// expected naming scheme from the given hidden inputName.
	// For example if the inputName is "tags", then the following
	// corresponding elements must have the following id's:
	//
	// inputId:        "tags-input"
	// listId:         "tags-list"
	// dropdownToggle:	"tags-dropdown-button"
	// hiddenInputId:  "tags-value"
		
	// ************************************************************
	this.registerInputListenersFor = function(inputName, onClickFunction){		
		var inputId				= inputName + '-input'; 
		var listId				= inputName + '-list'; 
		var dropdownButtonId	= inputName + '-dropdown-button'; 
		var hiddenInputId		= inputName + '-value'; 
		
		// determine onClickFunction
		if(typeof onClickFunction === 'undefined'){
			onClickFunction = function(inputValue){
				setHiddenInputValue(inputValue, hiddenInputId);
			}
		}
				
		self.registerInputListeners(inputId, listId, dropdownButtonId, hiddenInputId, onClickFunction);
		self.registerListOnClick(inputId, listId, hiddenInputId, onClickFunction);
		console.log('dropdownFocused: ' + dropdownFocused);	
	}
	
	// ************************************************************
	// Register a listener for each list element.  This must be
	// called in order to have any functionality.
	// (The helper function registerInputListenersFor(inputName)
    // will also work).
	// ************************************************************
	this.registerInputListeners = function(inputId, listId, dropdownButtonId, hiddenInputId, onClickFunction) {
		console.log('registerListeners("' + 
			inputId          + '", "' +
		    listId           + '", "' +
		    dropdownButtonId + '", "' + 
		    hiddenInputId    + '")');
		
		var inputElement = document.getElementById(inputId);
		
		// **************************************
		// 1.) handle KEYPRESS for input element
		// **************************************
		inputElement.addEventListener('keypress', function(event) {
			// ENTER key pressed.
			if(event.keyCode == 13) {
				
				// consume the event.
				event.preventDefault();	
								
				// only continue one per key release.
				if(enterKeyDown && enterKeyReleased) {
					
					if(inputElement.getAttribute('aria-expanded') == "false") {
						showDropdownMenuIfHidden(inputElement);
					
					}
					else{
						var inputValue = inputElement.value;
						clickFirstVisibleListElement(
							inputValue, listId, onClickFunction);	
					
						// return list to default state (all visible) 
						inputElement.value = "";
						search(inputElement.value,listId);							
					}
					
					enterKeyDown = false;
					enterKeyReleased = false;		
				}
			}    
		});
		
		// **************************************
		// 2.) handle KEYDOWN for input element
		// **************************************
		inputElement.addEventListener('keydown', function(event) {
			console.log('keydown');
			
			// DOWN arrow key pressed.
			if(event.keyCode == 40) {
				console.log("down arrow key down");
		 		event.preventDefault();
				//var dropdown = document.getElementById(listId);
				//dropdown.focus();
				showDropdownMenuIfHidden(inputElement);
				var inputValue = inputElement.value;
				var li = getFirstVisibleListElement(
					inputValue, listId, hiddenInputId);
				li.childNodes[0].focus();
			}
			
			// ESCAPE key pressed.
			else if(event.keyCode == 27){
				console.log("escape key down");
				hideDropdownMenuIfVisible(inputElement);
			}
			
			// TAB key pressed.
			else if(event.keyCode == 9){
				console.log("TAB key down");
				hideDropdownMenuIfVisible(inputElement);
			}
			
			// ENTER key pressed.
			if(event.keyCode == 13) {
				console.log("TAB key down");
				enterKeyDown = true;		
			}    
		});
		
		// 3.) handle KEYUP		
		inputElement.addEventListener('keyup', function(event) {
			// ENTER key pressed.
			if(event.keyCode == 13) {
				console.log("ENTER key released");
				enterKeyReleased = true;		
			}    
		});
		
		// ***********************************
		// 3.) handle INPUT for input element
		// ***********************************
		inputElement.addEventListener('input', function(event) {
			showDropdownMenuIfHidden(inputElement);
			var inputValue = inputElement.value;
			search(inputValue, listId);
		});		

		// ***********************************
		// 4.) switch focus to input element
		//     when dropdown is made visible
		// ***********************************
		$(document).on('shown.bs.dropdown', function(event) {
			console.log("'shown.bs.dropdown' event");
			//var dropdown = event.target;
			inputElement.focus();
		});
		
		// ***********************************
		// 4.) switch focus to input element
		//     when button is focused
		// ***********************************
		var button = document.getElementById(dropdownButtonId);
		button.addEventListener('focus', function(e) {			
			//console.log("button 'focus' event.  activeElement: " + document.activeElement.nodeName);
			console.log("(button 'focus' event) value of dropdownFocused: " + dropdownFocused);
			 $(window).keyup(function (e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				
				// handle tab.
				if (code == 9 && dropdownFocused) {
					console.log('keycode: tab');
					inputElement.focus();
					hideDropdownMenuIfVisible(inputElement);
					dropdownFocused = false;
					console.log('set dropdownFocused: ' + dropdownFocused);
				}
				
				// handle escape.
				else if (code == 27){
					console.log('keycode: escape');
					inputElement.focus();
				}
			});			
		});
		
		/*
		button.addEventListener('focusin', function(e) {			
			console.log("button 'focusin' event.  activeElement: " + document.activeElement.nodeName);		
		});
		button.addEventListener('focusout', function(e) {			
			console.log("button 'focusout' event.  activeElement: " + document.activeElement.nodeName);		
		});
		*/
			 
		// ***********************************
		// 5.) ensure first list element is is
		//     hidden on page load
		// ***********************************
		document.addEventListener('DOMContentLoaded', function() {
			var addNew = document.getElementById(listId).getElementsByTagName('LI')[0];
			self.hide(addNew);
		}, false);
	}
	
	// ****************************
	// helper function to open the 
	// dropdown menu (no focus
	// change)
	// ****************************
	function showDropdownMenuIfHidden(inputElement){
		if(inputElement.getAttribute('aria-expanded') == "false"){
			var btnSpan = inputElement.parentNode;
			inputElement.setAttribute('aria-expanded', true);
			btnSpan.setAttribute('class', btnSpan.className += ' open');
		}
	}
	
	// ****************************
	// helper function to open the 
	// dropdown menu (no focus
	// change)
	// ****************************
	function hideDropdownMenuIfVisible(inputElement){
		if(inputElement.getAttribute('aria-expanded') == "true"){
			var btnSpan = inputElement.parentNode;
			inputElement.setAttribute('aria-expanded', false);
			
			// remove the class name 'open' from the parent.
			var btnClassName = btnSpan.className;
			var index = (' ' + btnClassName + ' ').indexOf('open');	
			if(index > -1){
				btnSpan.setAttribute('class', btnClassName.replace(/(\s|^)open(\s|$)/, ' '));
			}
			//btnSpan.setAttribute('class', btnSpan.className += ' open');
		}
	}
	
	// initialize the dropdown results based on what tags are already present on page load.
	this.initializeSearchResults = function(inputName){				
		search("", inputName + '-list');
	}
}