/******************************************************************
MULTI-VALUE FORM: HOW TO USE
*******************************************************************
AUTHOR: Aaron Carson (with much help from the Internet)

Use addHiddenInputAndTag(formId, catsName, 'Fluffy', catsClass) to 
add a input/tag pair before the screen loads.

use addHiddenInputAndTag(formId, foodName, 'Pepperoni Pizza', 
foodClass) to add an event listener to the input with id (foodName 
+ '-input').

This registers an event listener on an existing <input 
id="inputName + '-input'"> contained within a <form id="formId">.  
The event fires when the user presses 'enter'.  This removes the 
text from the visible <input> and adds a corresponding hidden 
<input> with a value of the typed text to the enclosing <form>.  
It also adds a <span class="spanClass"> element displaying the 
value within a<div id="inputName + '-div'">.  the <span> has a 'x' 
button that will remove both the hidden form and the span.

The end result is that you can pass a variable amount of string 
values to a form input named "inputName".  All you need to do is 
set the ids of your corresponding <form>, <input>, and <div> 
accordingly.
******************************************************************/

function HiddenFormControls() {
    var TAG_INDEX = 0;
    var self = this;

    // ****************************************************
    // Remove an element
    // ****************************************************
    function removeElement(id) {
        var element = document.getElementById(id);
        element.parentNode.removeChild(element);
    }

    // ****************************************************
    // Create and append a new span 'tag' element.
    // ****************************************************
    function addTag(inputName, index, inputValue, spanClass) {

        // create remove button.
        var a = document.createElement('a');
        a.setAttribute('id', 'remove-link-' + index);
        a.setAttribute('href', '');
        a.setAttribute('class', 'a-cancel');
        a.setAttribute('title', 'remove');
		a.setAttribute('tabindex', '-1');
        a.innerHTML = "&#10005;";
        a.onclick = function () {
            removeElement(getSpanId(inputName, index));
            removeElement(getHiddenInputId(inputName, index));
            return false;
        };

        // create span text.
        var tagText = document.createElement('text');
        tagText.innerHTML = inputValue;

        // create span.
        var newTag = document.createElement('span');
        newTag.setAttribute('id', getSpanId(inputName, index));
        newTag.setAttribute('class', spanClass);
        newTag.appendChild(a);
        newTag.appendChild(tagText);
        document.getElementById(inputName + '-div').appendChild(newTag);
    }

    // ****************************************************
    // Make a new hidden input with the vien name value,
    // ****************************************************
    function addHiddenInput(formId, name, index, value) {
        var newInput = document.createElement('input');
        newInput.setAttribute('id', getHiddenInputId(name, index));
        newInput.setAttribute('type', 'hidden');
        newInput.setAttribute('name', name);
        newInput.setAttribute('value', value);
        document.getElementById(formId).appendChild(newInput);
    }

    // get the span id.
    function getSpanId(inputName, index) {
        return inputName + '-' + index;
    }

    // get the hidden input id for the given index
    function getHiddenInputId(inputName, index) {
        return inputName + '-' + index;
    }



    // ****************************************************
    // Add a hidden input and a with the given id inputName,
    // index, and value, then increments the index value.
    // **************************************************** 
    this.addHiddenInputAndTag = function (formId, inputName, inputValue, spanClass) {
        addTag(inputName, TAG_INDEX, inputValue, spanClass);
        addHiddenInput(formId, inputName, TAG_INDEX, inputValue);
        TAG_INDEX++;
    }

    // ****************************************************
    // Get all url parameters, and add tags if they match 
    // the inputName.
    // ****************************************************
    this.addUrlParametersHiddenInputAndTag = function (formId, inputName, spanClass) {
        var query = location.search;
        if (query.length > 0) {
            var queries = query.substring(1).split('&');
            for (var i = 0; i < queries.length; i++) {
                var s = queries[i];
                if (s.indexOf(inputName) === 0) {
                    var newValue = s.split(inputName + '=')[1].replace(/\+/g, " ");
                    self.addHiddenInputAndTag(formId, inputName, newValue, spanClass);
                }
            }
        }
    }

    // ***********************************************************
    // Add an EventListener to the input field '(inputName)-input'
    // ***********************************************************
    this.registerHiddenInputFor = function(formId, inputName, spanClass) {

        var tagField = document.getElementById(inputName + '-input');
        tagField.addEventListener('keypress', function (event) {

            // if Enter is pressed
            if (event.keyCode == 13) {
                // 1) prevent form submission.
                event.preventDefault();

                // 2) get the input value, and clear the field.
                var tagValue = tagField.value;
                tagField.value = "";

                // 3) a. add the tag if no commas
                if (tagValue.indexOf(",") === -1) {
                    console.log("add single value");
                    self.addHiddenInputAndTag(formId, inputName, tagValue, spanClass);
                }
                    // 3) b. add each tag separated by commas.
                else {
                    console.log("add multi value");
                    var delimitedValues = tagValue.split(',');
                    for (var i = 0; i < delimitedValues.length; i++) {
                        var delimitedValue = delimitedValues[i];
                        if (delimitedValue.length > 0) {

                            self.addHiddenInputAndTag(formId, inputName, delimitedValue, spanClass);
                        }
                    }
                }
            }
        });
    }
	
    // ***********************************************************
    // Check if a tag with the value exists for the inputName.
    // ***********************************************************
	this.tagWithValueExists = function(checkValue, inputName) {
		checkValue = checkValue.toLowerCase();
		var inputDiv =  document.getElementById(inputName + '-div');
		var children = inputDiv.children;
		var childrenCount = children.length;
		//console.log('childrenCount: ' + childrenCount);
		for(var i = 0; i < childrenCount; i ++) {
			//console.log('tagWithValueExists: ' + i);
			var span = children[i];
			var text = span.children[1];
			//console.log(" child2: " + text.tagName + " innerHTML" + text.innerHTML);
			//console.log("child1: " + span.children[0].tagName + " child2: " + span.children[1].tagName);
			var textContents = text.innerHTML.toLowerCase();
			if (textContents === checkValue) return true;
		}
		return false;
	}
	
	this.addTagParseCommasForceUnique = function(formId, inputName, tagValue, spanClass){
				
        if (tagValue.indexOf(",") === -1) {
            console.log("add single value");
			
			// add the tag if it doesn't already exist.
			if (!hiddenFormControls.tagWithValueExists(tagValue, tagName)) {
				// console.log('tag with value: "' + tagValue + '" was NOT found.');
	            self.addHiddenInputAndTag(formId, inputName, tagValue, spanClass);
			}
			else {
				// console.log('tag with value: "' + tagValue + '" was found.');
			}
        }
            // 3) b. add each tag separated by commas.
        else {
            console.log("add multi value");
            var delimitedValues = tagValue.split(',');
            for (var i = 0; i < delimitedValues.length; i++) {
                var delimitedValue = delimitedValues[i];
                if (delimitedValue.length > 0) {
					
					// add if tag does not already exist.
					if (!hiddenFormControls.tagWithValueExists(delimitedValue, tagName)) {
						// console.log('tag with value: "' + delimitedValue + '" was NOT found.');
	                    self.addHiddenInputAndTag(formId, inputName, delimitedValue, spanClass);
					}
					else {
						// console.log('tag with value: "' + delimitedValue + '" was found.');
					}
                }
            }
        }
	}
}



