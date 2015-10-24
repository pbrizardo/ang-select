/*
 * Ang Select
 *
 * @description
 * 
 * This directive creates an HTML base select box that can handle single and multiple select
 *
 * CONTENTS
 *
 * 1. SINGLE SELECT USAGE
 *  1.1 TRACK BY USAGE
 * 2. MULTI SELECT USAGE
 *  2.1 INBOUND DATA
 * 3. CSS SCENARIOS
 * 
 * 1. SINGLE SELECT USAGE
 *
 * Example:
 *
 * <ang-select model="myModel" 
 *             data="myData" 
 *	           error="errorExpression"
 *             disabled="disabledExpression" 
 *             field="someFieldInDataObject"
 *             placeholder="Select an option..."
 *             trackby = "fieldToTrackByWith"  // Helps with initial binding. See 1.1
 *             ></ang-select>
 * 
 * 1.1 TRACK BY USAGE
 *
 * Summary: Say you want to initialize the dropdown with a value. You have an array of objects,
 * and an individual object that is similar to an element in the array. Since the individual object
 * is not associated with the array. For example:
 *
 * a. Array, Object
 *
 * for each element in Array
 *   if Object equals element, initialize with value (this will not work since Object not associated with array)
 *
 * b. Specify track by field 
 *
 * trackid = "id"
 *
 * for each element in Array
 *   if Object.id equals element.id, initialize
 *
 * 2. MULTI SELECT USAGE
 *
 * Example:
 *
 * <ang-select
 *      data="myData"
 *      error="errorExpression"
 *      disabled="disabledExpression"
 *      field="someFieldInDataObject"
 *      placeholder="Select an option..."
 *      multiple
 *      group (Instead of listing multiple values, it will display '3 Selected')
 *      ></ang-select>
 *
 * 2.1 INBOUND DATA FOR MULTI SELECT
 * 
 * Selected data can be pre-populated if the list elements contain the 'selected' property.
 * Otherwise, the field will be created and default to false.
 *
 * 3. CSS SCENARIOS
 *
 * The directive tries to keep the CSS classes simple and generic as possible. 
 * Follow the guidelines below:
 *
 * 'active' : This class is toggled when the dropdown is expanded/collapsed
 * 'disabled' : This class is toggled depending on the disabled expression
 * 'selected' : (Multi only) This class is toggled on the list-item depending on the item.customSelected value
 * 
 */
(function() {

'use strict';

angular.module('angSelect',[])
	.directive('angSelectList', [function() {
		return {
			restrict:'E',
			scope:true,
			transclude:true,
			link:function(scope,element,attr) {
				element.on('click', function(e) {
					e.stopPropagation();
				});
			}
		};
	}])
	.directive('angSelect', ['$document', '$timeout', function($document, $timeout) {

		/* Global array of dropdown elements
		 * @description Used for hiding other dropdowns
		 */
		var _dropdowns = [];

		return {
			restrict:'E',
			scope: {
				model:'=',
				data:'=',
				disabled:'=?',
				error:'=?',
				onChange:'&?'
			},
			template: function(element, attr) { 
				var fieldDisplay = (attr.field) ? '{{item.'+attr.field+'}}' : '{{item}}';

				return '' +
				'<ang-select-display class="ang-select-display" style="display:block"><span>{{selectionDisplay}}</span></ang-select-display>' +
                '<ang-select-list class="ang-select-list" style="display:none; width:100%; position:absolute; top:100%; left:0;" ng-transclude>' +
                '<ang-select-list-item class="ang-select-list-item" style="display:block" ng-repeat="item in list" ng-click="select($index, $event)"><span>'+fieldDisplay+'</span></ang-select-list-item>' +
                '</ang-select-list>';
			},
			link: function(scope, element, attr) {

				// Set CSS styles to directive element
				element[0].style.display = 'block';
				element[0].style.position = 'relative';

				// Add DOM Element to global array of dropdowns
				_dropdowns.push(element);


				/*****************************************************
				 * VARIABLES
				 ****************************************************/

				var _config = {}, // holds config data and functions for default or multi mode;
				_isMulti = attr.hasOwnProperty('multiple'),
				_placeholder = attr.placeholder,
				_field = attr.field ? attr.field : '';


				/*****************************************************
				 * INITIALIZE SINGLE/MULTI DROPDOWN
				 ****************************************************/

				function initialize() {
					scope.selectionDisplay = _placeholder;
					element.addClass('ang-select');
                    
					if (_isMulti) {
						element.addClass('multiple');
						_config.select = selectMulti;

						scope.multiSelectMap = [];

						// add select option per item in data array
						for (var i = 0; i < scope.list.length; i++) {
							scope.multiSelectMap.push(false);
						}
						displayMulti();
					} else {
						_config.select = selectSingle;
					
						var selectedIndex = -1;
						var trackby = attr['trackby'];

						// try to find matching object to initialize dropdown with value
						if (scope.model) {
							for (var i = 0; i < scope.list.length; i++) {
								if (trackby) {
									if (scope.model[trackby] === scope.list[i][trackby]) {
										selectedIndex = i;
										break;
									}
								} else {
									if (Object.is(scope.model, scope.list[i])) {
										selectedIndex = i;
										break;
									}
								}								
							}
							if (selectedIndex === -1) {
								scope.model = undefined;
							}
						}
						displaySingle(selectedIndex);
					}
				}

				function copyData() {
					scope.list = angular.copy(scope.data);
				}


				/*****************************************************
				 * COLLAPSE FUNCTIONS
				 ****************************************************/

				function toggle() {
					element.toggleClass('active');			              
					element.find('ang-select-list')[0].style.display = element.hasClass('active') ? 'block' : 'none';
				}

				function collapse() {
					element.removeClass('active');
					element.find('ang-select-list')[0].style.display = 'none';
				}

				/*****************************************************
				 * FUNCTIONS SPECIFIC FOR SINGLE/MULTI DROPDOWN
				 ****************************************************/

				function selectSingle(index,event) {

					// assign selected item and collapse dropdown

					scope.model = scope.list[index];										
					scope.selectionDisplay = (_field) ? scope.list[index][_field] : scope.list[index];
					collapse();
					displaySingle(index);
				}

				function displaySingle(index) {
					if (index > -1 && scope.list[index]) {
						scope.selectionDisplay = (_field) ? scope.list[index][_field] : scope.list[index];
					} else {
						scope.selectionDisplay = _placeholder;
					}
				}

				function selectMulti(index,event) {
					scope.multiSelectMap[index] = !scope.multiSelectMap[index];
					angular.element(event.srcElement).toggleClass('selected');
					displayMulti();
				}

				function displayMulti() {
					var display = '', count = 0;
					var selectedItems = [];

					// iterate through list and
					// push selected items into new array
					// ALSO keep count of selected items
					// ALSO build the display string for the drop to show

					for (var i = 0; i < scope.list.length; i++) {
						if (scope.multiSelectMap[i]) {
							selectedItems.push(scope.list[i]);
							count++;
							if (display.length) display += ',';
							if (_field) { display += scope.list[i][_field]; }
							else { display += scope.list[i]; }
						}
					}

					// if group option selected, display shorthand version of 
					// selected items (eg. 3 Selected)

					if (count > 1 && attr.hasOwnProperty('group')) {
						display = count + ' Selected';
					} else if (_placeholder && count === 0) {
						display = _placeholder;
					}

					// assign new list to model and assign the display

					scope.model = selectedItems;
					scope.selectionDisplay = display;
				}


				/*****************************************************
				 * WATCHERS
				 ****************************************************/


				// Watch boolean error attribute
				if (attr.hasOwnProperty('error')) {
					scope.$watch(function() {
						return scope.error;
					}, function(newVal, oldVal) {
						if (!scope.disabled) {
							if (newVal) { element.addClass('error'); }
							else { element.removeClass('error'); }
						}
					});
				}

				// Watch boolean disabled attribute
				if (attr.hasOwnProperty('disabled')) {
					scope.$watch(function() {
						return scope.disabled;
					}, function(newVal, oldVal) {
						if (newVal) { 
							element.addClass('disabled').removeClass('error'); 
							scope.error = false;
						}
						else { element.removeClass('disabled'); }
					});
				}

				// Watch scope.data to (re-)initialize
				scope.$watch(function() {
					return scope.data;
				}, function(newVal, oldVal) {
					copyData();
					initialize();
				});


				/*****************************************************
				 * EVENTS
				 ****************************************************/


				// On click select option function

				scope.select = function(index, event) {
					_config.select(index,event);
					if (typeof scope.onChange === 'function') {
						// use timeout to wait til select model changes
						$timeout(function() {scope.onChange();});
					}
				};


				// Toggle dropdown click event

				element.on('click', function(e) {
					e.stopPropagation(); // prevent window click from firing
					if (!element.hasClass('disabled')) {

						// clear other dropdowns
						for (var i = 0, ii = _dropdowns.length; i < ii; i++ ) {
							if (_dropdowns[i] !== element) {
								_dropdowns[i].removeClass('active');
								_dropdowns[i].find('ang-select-list')[0].style.display = 'none';
							}
						}

						// EXPANDDD THE DROPDOWN!
						toggle();

						// ..but clear the error
						element.removeClass('error');
						scope.error = false;
					}
					
				});

				// Collapse dropdown when window is click, except for element.
				 
				angular.element(document).find('body').on('click', function() {
					collapse();
				});
			}
		};

	}]);

})();
