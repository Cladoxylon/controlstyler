/**
 * Authored by Cladoxylon
 * https://github.com/Cladoxylon
 *
 * Copyright (c) 2015 Cladoxylon
 * License: The MIT License (MIT)
 * http://opensource.org/licenses/MIT
 */
(function(window, undefined) {
	'use strict';

	// IE 10+

	if (!window) throw new Error("window doesn't exist");

	var name = 'controlstyler';

	/* addEventListener - IE9+, other browsers */

	var callEvent = (function(){
		try {
			new Event("");
		} catch (e) {
			/* for IE9-current(IE11), the old-fashioned way for other browsers */
			return function(el, e) {
			    var event = window.document.createEvent('HTMLEvents');
			    event.initEvent(e, true, true);
			    return el.dispatchEvent(event);
			}
		}

		return function(el, e) {
			var event = new window.Event(e);
			return el.dispatchEvent(event);
		}
	})();

	var controls = {
		'get' : function(element) {
        	return element.tagName.toLowerCase();
		}
		, 'switch' : {
			"input" : {
				'get' : function(element) {
                	return element.getAttribute('type');
				}
				, 'switch' : {
					"checkbox" : [0]
					, "text" : [1]
					, "number" : [2, 1]
				}
			}
		}
	};

	var commonOptions = {
		"private" : {
           	'systemDisabled' : false
		}
		, "public" : {
			'class' : null
			, 'disabledClass' : null
		}
	};

	var controlOptions = [
		{
			'typeName': "checkbox"
			, 'constructor': CheckboxStyler
			, "options": {
				"private" : {
				}
				, "public" : {
					'width' : 27
					, 'height' : 12
					, 'speed' : 0.2
					, 'timing-function' : "ease-in-out"
				}
			}
		}

		, {
			'typeName': "resizableTextBox"
			, 'constructor': ResizableTextBoxStyler
			, "options": {
				"private" : {
					'systemDisabled' : true
				}
				, "public" : {
					'selectOnFocus' : false
					, 'maxlength' : null
					, 'transformFunction' : null
				}
			}
		}

		, {
			'typeName': "wholeNumber"
			, 'constructor': WholeNumberStyler
			, "options": {
				"private" : {
				}
				, "public" : {
					'numeralSystem' : null
					, 'max' : null
					, 'min' : null
					, 'onOverflow' : null
					, 'spinButtons' : null
					, 'showZeros' : null
					, 'showNumeralSystem' : null
					, 'showPlus' : null
				}
			}
		}
	];



	var maxId = 0;

	var elements = [];

	function ControlStyler(element, options, type) {

		if (this.constructor == ControlStyler) {

			return this.getControl(element, options, type);

		}

		this.element = element;
		this.options = {};
		this.typeId = type.id;
		this.type = type.name;

		if (this.getElementId(this.element) !== false) throw new Error("element already exists");
		this.id = ++maxId;
		elements.push(this);

		this.options.public = this.getOptionsOf("public", this.typeId);
		for (var i in this.options.public) {
			if (options[i] != null) {
				this.options.public[i] = options[i];
			}
		}
		this.options.private = this.getOptionsOf("private", this.typeId);

	}

	ControlStyler.all = function() {

		var elements = [];

		var add = function(element){
			if (elements.indexOf(element) == -1) elements.push(element);
		}

		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i] instanceof HTMLElement) {
				add(arguments[i]);
			} else if (arguments[i] instanceof HTMLCollection || arguments[i] instanceof NodeList) {
				Array.prototype.forEach.call(arguments[i], function(element) {
					add(element);
				});
			} else if (arguments[i] === null) {} else throw new Error("arguments["+i+"] is not HTMLElement or HTMLCollection or NodeList or null");
		}

		var controls = [];
		elements.forEach(function(element) {
			try {
				controls.push(new ControlStyler(element));
			} catch (e) {}
		});

		return controls;

	}

	ControlStyler.prototype.getControl = function(element, options, type) {

		if (!(element instanceof HTMLElement) && element !== null) throw new Error("element in obj is not HTMLElement");
		if (element === null) throw new Error("element is null");

		options = (typeof options == 'object') ? options : {};
		var typeObj = this.getControlType(element, type);

		if (typeof typeObj != 'object') throw new Error("wrong type");

		return new (controlOptions[typeObj.id].constructor)(element, options, typeObj);
	};

	ControlStyler.prototype.getControlType = function(element, type) {
		if (!(element instanceof HTMLElement) && element !== null) return null;
		if (element === null) return null;

		var obj = controls, key;
		while (typeof obj == 'object' && !Array.isArray(obj)) {
        	key = obj.get(element);
        	if (typeof obj.switch[key] == 'undefined') return null;
        	obj = obj.switch[key];
		}

		var typeObj = null;
		if (typeof type == 'string') {
			for (var i = 0; i < controlOptions.length; i++) {
				if (typeof controlOptions[i] == 'object' && controlOptions[i].typeName == type & obj.indexOf(i) != -1) {
					typeObj = {id: i, name: type};
				}
			}
		} else {
			typeObj = {id: obj[0], name: controlOptions[obj[0]].typeName};
		}

		return typeObj;
	}

	Object.defineProperty(ControlStyler.prototype, 'commonClass', {
		get: function() {
			return name;
	    }
	});

	Object.defineProperty(ControlStyler.prototype, 'attrPrefix', {
		get: function() {
			return 'data-' + this.commonClass + '-';
	    }
	});

	Object.defineProperty(ControlStyler.prototype, 'defaultDisabledClass', {
		get: function() {
			return this.commonClass + '-dc-disabled';
	    }
	});

	Object.defineProperty(ControlStyler.prototype, 'ownClassPrefix', {
		get: function() {
			return this.commonClass + '-' + this.typeId + '-c-';
	    }
	});

	Object.defineProperty(ControlStyler.prototype, 'defaultClass', {
		get: function() {
			return this.commonClass + '-' + this.typeId + '-dc';
	    }
	});

	ControlStyler.prototype.getElementId = function(element) {
		for (var i in elements) {
			if (elements[i].element === element) return elements[i].id;
		}
		return false;
	}

	ControlStyler.prototype.getOptionsOf = (function(){

		function addOptions(obj, options) {
			for (var i in options) {
				obj[i] = options[i];
			}
			return obj;
		}

		return 	function(type, elementTypeId) {
			var obj = {};
			addOptions(obj, commonOptions[type]);
			addOptions(obj, controlOptions[elementTypeId].options[type]);
			return obj;
		};

	})();

	Object.defineProperty(ControlStyler.prototype, 'control', {
		get: function() {
			var struct = this.struct;
			if (typeof struct != 'object') return;
			return struct.control;
	    }
	});

	ControlStyler.prototype.insertAfter = function(reference, target) {
		return reference.parentNode.insertBefore(target, reference.nextSibling);
	};

	ControlStyler.prototype.hide = function() {
		this.element.style.cssText = 'display: none !important;';
	};

	ControlStyler.prototype.setCCSClass = function(element, classArr, defaultClass) {
		if (classArr == null) element.classList.add(defaultClass);
		else if (Array.isArray(classArr)) {
			classArr.forEach(function(className){
				if (className === null) element.classList.add(defaultClass);
				else if (typeof className == 'string') element.classList.add(className);
			});
		} else if (typeof classArr == 'string') element.classList.add(classArr);
	};

	ControlStyler.prototype.removeCCSClass = function(element, classArr, defaultClass) {
		if (classArr == null) element.classList.remove(defaultClass);
		else if (Array.isArray(classArr)) {
			classArr.forEach(function(className){
				if (className === null) element.classList.remove(defaultClass);
				else if (typeof className == 'string') element.classList.remove(className);
			});
		} else if (typeof classArr == 'string') element.classList.remove(classArr);
	};

	ControlStyler.prototype.setControlCCSClass = function() {
		this.setCCSClass(this.control, this.options.public['class'], this.defaultClass);
	};

	ControlStyler.prototype.isDisabled = function() {
		return this.disabled;
	};

	ControlStyler.prototype.setDisabled = function() {
		var systemDisabled = this.options.private['systemDisabled'];
		var disabledClass = this.options.public['disabledClass'];
		if (this.element.disabled) {
			this.disabled = true;
			this.control.setAttribute(this.attrPrefix + 'disabled', 'true');
			if (systemDisabled) this.control.setAttribute('disabled', 'disabled'); else this.setCCSClass(this.control, disabledClass, this.defaultDisabledClass);
		} else {
			this.disabled = false;
			this.control.setAttribute(this.attrPrefix + 'disabled', 'false');
			if (systemDisabled) this.control.removeAttribute('disabled'); else this.removeCCSClass(this.control, disabledClass, this.defaultDisabledClass);
		}
	}

	ControlStyler.prototype.enable = function() {
		this.element.disabled = false;
		this.setDisabled();
	}

	ControlStyler.prototype.disable = function() {
		this.element.disabled = true;
		this.setDisabled();
	}


    /* transition IE10+ */
	function CheckboxStyler(obj){
		ControlStyler.apply(this, arguments);
		this.init();
	}

	CheckboxStyler.prototype = Object.create(ControlStyler.prototype);
	CheckboxStyler.prototype.constructor = CheckboxStyler;

	CheckboxStyler.prototype.init = function() {
		this.hide();
		this.create();
		this.setControlCCSClass();
		this.setStyles();
		this.setTransitionTimingFunction();
		this.setPosition();
		this.setSpeed();
		this.setDisabled();
		this.addOnclick();
		this.addOnchange();
	};

	CheckboxStyler.prototype.create = function() {
		var control, wrapper, checked, toogle;
		var struct;

		control = this.insertAfter(this.element, window.document.createElement('div'));
		control.className = this.commonClass;
		control.setAttribute(this.attrPrefix + 'type', this.type.toLowerCase());

		wrapper = control.appendChild(window.document.createElement('div'));
		wrapper.className = this.ownClassPrefix + 'wrapper';

		checked = wrapper.appendChild(window.document.createElement('div'));
		checked.classList.add(this.ownClassPrefix + 'checked');

		toogle = wrapper.appendChild(window.document.createElement('div'));
		toogle.classList.add(this.ownClassPrefix + 'toogle');

		struct = this.struct = {};
		struct.control = control;
		struct.wrapper = wrapper;
		struct.checked = checked;
		struct.toogle = toogle;
	};

	CheckboxStyler.prototype.setStyles = function() {

		var element;
		var height, width;

		height = this.options.public['height'];
		width = this.options.public['width'];

		element = this.struct.control;
		element.style.width = width + "px";
		element.style.height = height + "px";
		element.style['border-radius'] = Math.round(height / 2) + "px";

		element = this.struct.checked;
		element.style.width = (width - height) + "px";

		element = this.struct.toogle;
		element.style.width = element.offsetHeight + "px";

	};

	CheckboxStyler.prototype.setTransitionTimingFunction = function() {
		this.struct.wrapper.style['transition-timing-function'] = this.options.public['timing-function'];
	};

	Object.defineProperty(CheckboxStyler.prototype, 'checked', {
		get: function() {
			return this.element.checked;
	    }
	    , set: function(value) {
	    	this.element.checked = value;
	    }
	});

	CheckboxStyler.prototype.toogle = function() {
		this.checked = (this.checked) ? false : true;
	}

	CheckboxStyler.prototype.setPosition = function() {
 		this.struct.wrapper.style.left = ((this.checked) ? 0 : (this.options.public['height'] - this.options.public['width'])) + "px";
	}

	CheckboxStyler.prototype.setSpeed = function() {
 		this.struct.wrapper.style['transition-duration'] = this.options.public['speed'] + "s";
	}

	CheckboxStyler.prototype.onclick = function() {
		if (!(this.element.parentNode.tagName.toLowerCase() == 'label' && this.element.parentNode == this.control.parentNode)) this.toogle();
		callEvent(this.element, "change");
	}

	CheckboxStyler.prototype.addOnclick = function() {
		var self = this;
		this.control.addEventListener("click", function(){
			if (!self.isDisabled()) self.onclick();
		});
	}

	CheckboxStyler.prototype.addOnchange = function() {
		var self = this;
		this.element.addEventListener("change", function() {
			self.setPosition();
		});
	}


	function ResizableTextBoxStyler(obj){
		ControlStyler.apply(this, arguments);
		this.init();
	}

	ResizableTextBoxStyler.prototype = Object.create(ControlStyler.prototype);
	ResizableTextBoxStyler.prototype.constructor = ResizableTextBoxStyler;

	ResizableTextBoxStyler.prototype.init = function() {
		this.hide();
		this.create();
		this.setControlCCSClass();
		this.setMaxlength();
		this.setPlaceholder();
		this.setTransformFunction();
		this.setDisabled();
		this.setControlValue();
		this.addOnfocus();
		this.addOninput();
		this.addOnchange();
	};

	ResizableTextBoxStyler.prototype.create = function() {
		var control;
		var struct;

		control = this.insertAfter(this.element, window.document.createElement('input'));
		control.className = this.commonClass;
		control.type = "text";
		control.setAttribute(this.attrPrefix + 'type', this.type.toLowerCase());

		struct = this.struct = {};
		struct.control = control;
	};

	ResizableTextBoxStyler.prototype.html = function() {
		return '<input class="'+this.commonClass+'" type="text" '+this.attrPrefix+'type="'+this.type.toLowerCase()+'">';
	};

	ResizableTextBoxStyler.prototype.setControlValue = function(value, isControl) {
		if (typeof value == 'undefined') value = this.getElementValue();
		var cursor;
		if (isControl) cursor = this.control.selectionEnd;
		var obj = this.transformValue(value, cursor);
		this.control.value = obj.value;
		if (isControl) this.control.setSelectionRange(obj.cursor, obj.cursor);
		var text;
		if (this.control.value.length == 0) text = this.getPlaceholder();
		this.control.style.width = RealElemProp.getTextWidth(this.control, text) + "px";
	};

	ResizableTextBoxStyler.prototype.getControlValue = function() {
		return this.control.value;
	};

	ResizableTextBoxStyler.prototype.setElementValue = function() {
		this.element.value = this.getControlValue();
	};

	ResizableTextBoxStyler.prototype.getElementValue = function() {
		return this.element.value;
	};

	ResizableTextBoxStyler.prototype.setMaxlength = function() {
		var maxlength;
		if (this.options.public["maxlength"] !== null) {
			maxlength = parseInt(this.options.public["maxlength"]);
		} else {
			maxlength = parseInt(this.element.getAttribute('maxlength'));
		}
		if (!isFinite(maxlength) || maxlength < -1) maxlength = -1;
		this.maxlength = maxlength;
	};

	ResizableTextBoxStyler.prototype.setPlaceholder = function() {
		var placeholder;
		if (this.element.hasAttribute('placeholder')) {
			placeholder = this.element.getAttribute('placeholder');
			this.control.setAttribute('placeholder', placeholder);
		}
	};

	ResizableTextBoxStyler.prototype.getPlaceholder = function() {
		return this.control.getAttribute('placeholder');
	};

	ResizableTextBoxStyler.prototype.setTransformFunction = function() {
		var transformFunction = this.options.public['transformFunction'];
		var funcName;
		if (this.element.type == 'number') {
			funcName = 'valToInt';
		} else {
			funcName = (typeof transformFunction == 'string' && this.transformFunctions.hasOwnProperty(transformFunction) && typeof this.transformFunctions[transformFunction] == 'function') ? transformFunction : 'valToVal';
		}
		this.transformFunction = this.transformFunctions[funcName];
	};

	ResizableTextBoxStyler.prototype.addOnfocus = function() {

		var self = this;

		if (this.options.public['selectOnFocus'] === true) {

			this.control.addEventListener("focus", function(){
				if (!self.isDisabled()) self.onfocus();
			});

			// FF снимает выделение
			this.control.addEventListener("click", function(e){
				if (!self.isDisabled()) e.preventDefault();
			});
		}

	}

	ResizableTextBoxStyler.prototype.onfocus = function() {
		var selstart = this.control.selectionStart;
		var selend = this.control.selectionEnd;

	    if (selstart == selend) {
			this.control.setSelectionRange(0, this.control.value.length);
		}
	}

	ResizableTextBoxStyler.prototype.transformFunctions = {

		//добавить функции с .replace(/[^...]/
		valToVal : function(str, cursor) {
			return {value : str, cursor : cursor};
		},

		valToWord : function(str, cursor) {
			var value = "";

			for (var i = 0; i < str.length; i++) {
				if (cursor == i) cursor = value.length;
				if (str[i].match(/[a-z]/i)) {
					value += str[i];
				}
			}
			if (cursor >= str.length) cursor = value.length;

			return {value : value, cursor : cursor};

		},

		valToInt : function(str, cursor) {
			var value = "";
			if (str.replace(/[^1-9]+/g, '').length) {
				for (var i = 0; i < str.length; i++) {
					if (cursor == i) cursor = value.length;
					if (str[i].match(/[0-9]/)) {
						if (value.length == 0) {
							if (str[i] != "0") value += str[i];
						} else {
							value += str[i];
						}
					}
				}
				if (cursor >= str.length) cursor = value.length;
			} else {
				value = "0";
				var indexOfZero = str.indexOf("0");
				if (indexOfZero == -1 || indexOfZero < cursor) cursor = 1; else cursor = 0;
			}

			return {value : value, cursor : cursor};

		}

	};

	ResizableTextBoxStyler.prototype.transformValue = function(value, cursor) {

		if (typeof value != 'string') value = value.toString();
		if (isNaN(cursor) || parseInt(cursor) !== cursor || cursor < 0 || cursor > value.length) cursor = value.length;

		var obj = this.transformFunction(value, cursor);
		value = obj.value;
		cursor = obj.cursor;

		// вырезаем лишние символы
		if (this.maxlength != -1 && value.length > this.maxlength) {
			var newCursor = cursor - value.length + this.maxlength;
			value = value.substr(0, cursor - value.length + this.maxlength) + value.substr(cursor, value.length - cursor);
			cursor = newCursor;
		}

		return {value: value, cursor: cursor};

	};

	ResizableTextBoxStyler.prototype.addOninput = function() {

		var self = this;

        this.control.addEventListener("input", function() {
        	self.oninput();
        });

		this.element.addEventListener("input", function() {
        	if (self.getControlValue() != self.getElementValue()) self.setControlValue();
        });

	}

	ResizableTextBoxStyler.prototype.oninput = function() {

		var value = this.getControlValue();

		this.setControlValue(this.getControlValue(), true);

		this.setElementValue();
		callEvent(this.element, "input");

	}

	ResizableTextBoxStyler.prototype.addOnchange = function() {

		var self = this;

		this.control.addEventListener("change", function(){
			callEvent(self.element, "change");
		});

	}


	// IE 10+
	function WholeNumberStyler(obj){
		ControlStyler.apply(this, arguments);
		this.init();
	}

	WholeNumberStyler.prototype = Object.create(ControlStyler.prototype);
	WholeNumberStyler.prototype.constructor = WholeNumberStyler;

	WholeNumberStyler.prototype.init = function() {
		this.hide();
		this.create();
		this.setControlCCSClass();
		this.setNumeralSystem();
		this.setOnOverflow();
		this.setSpinButtons();
		this.setShowZeros();
		this.setShowNumeralSystem();
		this.setMin();
		this.setMax();
		this.setLength();
		this.setShowPlus();
		this.setCellProps();
		this.setDisabled();
		this.addSign();
		this.setNumerals();
		this.addNumeralSystem();
		this.setControlValue();
		this.addOnchange();
	};

	WholeNumberStyler.prototype.create = (function() {

		function WholeNumberRows(controlObject, number) {
			this.controlObject = controlObject;
			this.number = number;
		}
		WholeNumberRows.prototype.length = 0;
		WholeNumberRows.prototype.push = Array.prototype.push;
		WholeNumberRows.prototype.pop = Array.prototype.pop;

		WholeNumberRows.prototype.rowsProps = [{classEnds: ['buttons', 'buttons-up'], childClassEnds: []}
			, {classEnds: ['values'], childClassEnds: []}
			, {classEnds: ['buttons', 'buttons-down'], childClassEnds: []}];

		WholeNumberRows.prototype.add = function(classArr) {
			var controlObject = this.controlObject;
			var row;
			row = window.document.createElement('div');
			if (Array.isArray(classArr)) classArr.forEach(function(className) {
				row.classList.add(controlObject.ownClassPrefix + className);
			});
			this.push(this.number.appendChild(row));
		}

		WholeNumberRows.prototype.create = function() {
			var rowsProps = this.rowsProps;
			for (var i = 0; i < rowsProps.length; i++) {
				this.add(rowsProps[i].classEnds);
			}
		};

		function WholeNumberColumns(controlObject, rows) {
			this.controlObject = controlObject;
			this.rows = rows;
		}

		WholeNumberColumns.prototype.length = 0;
		WholeNumberColumns.prototype.push = Array.prototype.push;
		WholeNumberColumns.prototype.pop = Array.prototype.pop;
		WholeNumberColumns.prototype.splice = Array.prototype.splice;
		WholeNumberColumns.prototype.indexOf = Array.prototype.indexOf;

		WholeNumberColumns.prototype.append = function() {
			var controlObject = this.controlObject;
			var rows = this.rows;

			var column = new WholeNumberColumn(controlObject, rows, this);

			this.push(column);

			return column;
		}

		WholeNumberColumns.prototype.getColumn = function(i) {
			if (this.length < 1) return null;

			if (typeof i == 'undefined') i = this.length - 1;

			if (typeof i != 'number' || typeof this[i] == 'undefined') return null;

			return this[i];
		};

		WholeNumberColumns.prototype.removeLastColumn = function() {

			if (this.length == 0) return false;

			var column = this[this.length - 1];

			column.destroy();

			return true;

		};

		function WholeNumberColumn(controlObject, rows, columns) {
			this.controlObject = controlObject;
			this.rows = rows;
			this.columns = columns;
			this.init();
		}

		WholeNumberColumn.prototype.length = 0;
		WholeNumberColumn.prototype.push = Array.prototype.push;
		WholeNumberColumn.prototype.pop = Array.prototype.pop;

		Object.defineProperty(WholeNumberColumn.prototype, 'buttonUp', {
			get: function() {
				return this[0];
		    }
		});

		Object.defineProperty(WholeNumberColumn.prototype, 'value', {
			get: function() {
				return this[1];
		    }
		});

		Object.defineProperty(WholeNumberColumn.prototype, 'buttonDown', {
			get: function() {
				return this[2];
		    }
		});

		WholeNumberColumn.prototype.init = function() {
			var controlObject = this.controlObject;
			var rows = this.rows;
			var columns = this.columns;
			var cell;
			for (var i = 0; i < rows.length; i++) {
				cell = window.document.createElement('div');
				this.push(cell);
			}
			for (var i = 0; i < rows.length; i++) {
				rows[i].appendChild(this[i]);
			}
		};

		WholeNumberColumn.prototype.destroy = function() {
			var columns = this.columns;
			var column = this;
			for (var i = 0; i < column.length; i++) {
				column[i].parentNode.removeChild(column[i]);
			}
			columns.splice(columns.indexOf(column), 1);
		};

		WholeNumberColumn.prototype.setValue = function(value) {
			this.value.innerHTML = value;
		};


		return function() {

			var control, number, rows, columns, numerals = [], spinButtonsUp = [], spinButtonsDown = [];
			var struct;

			control = this.insertAfter(this.element, window.document.createElement('div'));
			control.className = this.commonClass;
			control.setAttribute(this.attrPrefix + 'type', this.type.toLowerCase());

			number = control.appendChild(window.document.createElement('div'));
			number.className = this.ownClassPrefix + 'number';

			rows = new WholeNumberRows(this, number);
			rows.create();

			columns = new WholeNumberColumns(this, rows);

			struct = this.struct = {};
			struct.control = control;
			struct.number = number;
			struct.rows = rows;
			struct.columns = columns;
			struct.numerals = numerals;
			struct.spinButtonsUp = spinButtonsUp;
			struct.spinButtonsDown = spinButtonsDown;
			struct.sign = null;
			struct.numeralSystem = null;

		};

	})();

	WholeNumberStyler.prototype.setNumeralSystem = function() {
		var numeralSystem = this.options.public['numeralSystem'];
		var s;
		if (typeof numeralSystem == 'number') {
			s = this.getNumeralSystem(numeralSystem);
		} else if(typeof numeralSystem == 'string' && this.numeralSystems.hasOwnProperty(numeralSystem)) {
			s = this.getNumeralSystemObject(this.numeralSystems[numeralSystem].characters);
		}
		if (typeof s == 'undefined') s = this.getNumeralSystem(10);
		this.numeralSystem = s;
	};

	// по стандарту IEEE 754 на цифры выделяется 52 бит, необходимо точное значение
	// 52 - 1 для деления по модулю на this.max - this.min + 1
	WholeNumberStyler.prototype.maxInt = Math.pow(2, 51);

	WholeNumberStyler.prototype.numeralSystems = (function() {

		var numeralSystems = {
			"binary" : {
				characters : ["0", "1"]
			}
			, "decimal" : {
				characters : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
			}
			, "hex" : {
	        	characters : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]
			}
		};

		return numeralSystems;

	})();

	WholeNumberStyler.prototype.getNumeralSystem = function(base) {

		if (typeof base != 'number') return;

		base = parseInt(base);
		if (isNaN(base)) base = 0;
		// toString() radix argument must be between 2 and 36
		base = (base < 2) ? 2 : (base > 36) ? 36 : base;

		var characters = [];

		for (var i = 0; i < base; i++) {
			characters.push(i.toString(base));
		}

		return this.getNumeralSystemObject(characters);

	};

	WholeNumberStyler.prototype.getNumeralSystemObject = function(characters) {

		if (!Array.isArray(characters)) return;
		// toString() radix argument must be between 2 and 36
		if (characters.length < 2 || characters.length > 36) return;

		var obj = {};

		obj.characters = characters;
		obj.base = obj.characters.length;
       	obj.maxlength = this.maxInt.toString(obj.base).length - 1;
       	obj.limit = Math.pow(obj.base, obj.maxlength) - 1;

       	return obj;

	};

	WholeNumberStyler.prototype.setOnOverflow = function() {
		var onOverflow = this.options.public['onOverflow'];
		this.onOverflow = (['scroll'].indexOf(onOverflow) != -1) ? onOverflow : 'stop';
	};

	WholeNumberStyler.prototype.setSpinButtons = function() {
		var spinButtons = this.options.public['spinButtons'];
		this.spinButtons = (['one'].indexOf(spinButtons) != -1) ? spinButtons : 'all';
	};

	WholeNumberStyler.prototype.setShowZeros = function() {
		var showZeros = this.options.public['showZeros'];
		this.showZeros = (showZeros === false) ? false : true;
	};

	WholeNumberStyler.prototype.setShowNumeralSystem = function() {
		var showNumeralSystem = this.options.public['showNumeralSystem'];
		this.showNumeralSystem = (showNumeralSystem === false || showNumeralSystem === true) ? showNumeralSystem : (this.numeralSystem.base == 10) ? false : true;
	};

	WholeNumberStyler.prototype.setShowPlus = function() {
		var showPlus = this.options.public['showPlus'];
		this.showPlus = (showPlus === false || showPlus === true) ? showPlus : false;
	};

	WholeNumberStyler.prototype.setMin = function() {
		var min;
		if (this.options.public["min"] !== null) {
			min = parseInt(this.options.public["min"]);
		} else {
			min = parseInt(this.element.getAttribute('min'));
		}
		if (isNaN(min)) min = 0;
		if (min < -this.numeralSystem.limit) min = -this.numeralSystem.limit;
		if (min > this.numeralSystem.limit) min = this.numeralSystem.limit;
		this.min = min;
	};

	WholeNumberStyler.prototype.setMax = function() {
		var max;
		if (this.options.public["max"] !== null) {
			max = parseInt(this.options.public["max"]);
		} else {
			max = parseInt(this.element.getAttribute('max'));
		}
		if (isNaN(max)) max = this.numeralSystem.limit;
		if (max < -this.numeralSystem.limit) max = -this.numeralSystem.limit;
		if (max > this.numeralSystem.limit) max = this.numeralSystem.limit;
		if (max < this.min) max = this.min;
		this.max = max;
	};

	WholeNumberStyler.prototype.setLength = function() {
		this.length = Math.max(Math.abs(this.min).toString(this.numeralSystem.base).length, Math.abs(this.max).toString(this.numeralSystem.base).length);
	};

	WholeNumberStyler.prototype.setCellProps = function() {
		var valueProps = this.valueProps = {};
		var columns = this.struct.columns;
		var column = columns.append();
		var value = column.value;
		column.setValue('0');
		valueProps.height = value.offsetHeight;
		valueProps.fontSize = parseInt(window.getComputedStyle(value)['font-size']);
		column.setValue(this.numeralSystem.characters.join('<br>'));
		valueProps.columnWidth = column.value.offsetWidth;
		column.destroy();
	};

	WholeNumberStyler.prototype.addSign = function() {

		if (this.min >= 0) return false;
		var columns = this.struct.columns;

		var value = columns.append().value;
		value.classList.add(this.ownClassPrefix+'sign');

		var test = columns.append();
		test.setValue('+<br>-');
		var width = test.value.offsetWidth;
		test.destroy();

		value.style.width = width + 'px';
		var radiusPx = Math.round(this.valueProps.height / 2) + 'px';
		value.style['border-radius'] = radiusPx + ' 0 0 ' + radiusPx;

		var self = this;

		value.addEventListener("click", function() {
			if (!self.isDisabled() && self.struct.sign.classList.contains(self.ownClassPrefix+'enabled-sign')) {
				self.setNumber(-self.getValue());
				self.setElementValue();
	        	callEvent(self.element, "change");
			}
        });

		this.struct.sign = value;

		return true;
	};

	WholeNumberStyler.prototype.setSign = function(type, sign) {
		var signElement = this.struct.sign;

		var enabledClass = this.ownClassPrefix+'enabled-sign';
		var disabledClass = this.ownClassPrefix+'disabled-sign';

		[enabledClass, disabledClass].forEach(function(className){
			signElement.classList.remove(className);
		});

		switch (type) {
			case 'enabled':
				signElement.classList.add(enabledClass);
				break;
			case 'disabled':
				signElement.classList.add(disabledClass);
				break;
			default:
		}
		signElement.textContent = (typeof sign != 'undefined') ? (sign) ? (this.showPlus) ? '+' : '' : '-' : '';
	};

	WholeNumberStyler.prototype.appendNumeral = function() {

		var valueProps = this.valueProps;
		var columns = this.struct.columns;

		var column = columns.append();
		var buttonUp = column.buttonUp;
		var value = column.value;
		var buttonDown = column.buttonDown;

		this.struct.spinButtonsUp.push(buttonUp);
		this.struct.numerals.push(value);
		this.struct.spinButtonsDown.push(buttonDown);

		value.classList.add(this.ownClassPrefix + 'numeral');
		['button', 'button-up'].forEach(function(className) {
			buttonUp.classList.add(this.ownClassPrefix + className);
		}, this);
		['button', 'button-down'].forEach(function(className) {
			buttonDown.classList.add(this.ownClassPrefix + className);
		}, this);
		buttonUp.appendChild(window.document.createElement('div'));
		buttonDown.appendChild(window.document.createElement('div'));
		var buttonHeight = Math.round(valueProps.height / 2) + "px";
		var radiusPx = Math.round(valueProps.height / 5) + "px";
		buttonUp.style.height = buttonHeight;
		buttonDown.style.height = buttonHeight;
		buttonUp.style['border-radius'] = radiusPx + " " + radiusPx + " 0 0";
		buttonDown.style['border-radius'] = "0 0 " + radiusPx + " " + radiusPx;

		var self = this;

		buttonUp.addEventListener("click", function() {
			self.spinButtonUpOnclick(buttonUp);
        });

		buttonDown.addEventListener("click", function() {
			self.spinButtonDownOnclick(buttonDown);
        });

		value.style.width = valueProps.columnWidth + 'px';

		return true;

	};

	WholeNumberStyler.prototype.setNumeral = function(value, i) {
		var numerals = this.struct.numerals;

		if (numerals.length < 1) return false;

		if (typeof i == 'undefined') i = numerals.length - 1;

		if (typeof i != 'number' || typeof numerals[i] == 'undefined') return false;

		numerals[i].innerHTML = value;
		return true;
	};

	WholeNumberStyler.prototype.setSpinButtonUp = function(type, i) {

		var spinButtonsUp = this.struct.spinButtonsUp;

		if (spinButtonsUp.length < 1) return false;

		if (typeof i == 'undefined') i = spinButtonsUp.length - 1;

		if (typeof i != 'number' || typeof spinButtonsUp[i] == 'undefined') return false;

		var enabledClass = this.ownClassPrefix+'enabled-button';
		var disabledClass = this.ownClassPrefix+'disabled-button';

		[enabledClass, disabledClass].forEach(function(className){
			spinButtonsUp[i].classList.remove(className);
		});

		switch (type) {
			case 'enabled':
				spinButtonsUp[i].classList.add(enabledClass);
				break;
			case 'disabled':
				spinButtonsUp[i].classList.add(disabledClass);
				break;
			default:
		}

		return true;
	};

	WholeNumberStyler.prototype.setSpinButtonDown = function(type, i) {

		var spinButtonsDown = this.struct.spinButtonsDown;

		if (spinButtonsDown.length < 1) return false;

		if (typeof i == 'undefined') i = spinButtonsDown.length - 1;

		if (typeof i != 'number' || typeof spinButtonsDown[i] == 'undefined') return false;

		var enabledClass = this.ownClassPrefix+'enabled-button';
		var disabledClass = this.ownClassPrefix+'disabled-button';

		[enabledClass, disabledClass].forEach(function(className){
			spinButtonsDown[i].classList.remove(className);
		});

		switch (type) {
			case 'enabled':
				spinButtonsDown[i].classList.add(enabledClass);
				break;
			case 'disabled':
				spinButtonsDown[i].classList.add(disabledClass);
				break;
			default:
		}

		return true;
	};

	WholeNumberStyler.prototype.setNumerals = function() {
		for (var i = 0; i < this.length; i++) {
			this.appendNumeral();
		}
	};

	WholeNumberStyler.prototype.addNumeralSystem = function() {
		if (this.showNumeralSystem === false) return false;

        var valueProps = this.valueProps;
		var columns = this.struct.columns;
		var numeralSystem = this.struct.numeralSystem;

		var column = columns.append();
		var value = column.value;

		var radius = Math.round(valueProps.height / 2);
		var fontSize = valueProps.fontSize;
		value.style['border-radius'] = '0 ' + radius + 'px ' + Math.floor(radius / 2) + 'px 0';
		value.style['font-size'] = ((fontSize < 2) ? fontSize : Math.round(fontSize / 2) + 1) + 'px';

		numeralSystem = value;

		numeralSystem.className = this.ownClassPrefix+'numeral-system';
		numeralSystem.textContent = '('+this.numeralSystem.base+')';

		return true;
	};

	WholeNumberStyler.prototype.setNumber = function(value) {

		value = parseInt(value);
		if (isNaN(value)) value = 0;

		switch (this.onOverflow) {
			case "scroll":
				value = (value - this.min) % (this.max - this.min + 1) + this.min;
				if (value < this.min) value += this.max - this.min + 1;
				break;
			default:
	        	if (value < this.min) value = this.min; else if(value > this.max) value = this.max;
		}

		var number = this.parseNumber(value);
		var min = this.parseNumber(this.min);
		var max = this.parseNumber(this.max);

		if (this.struct.sign !== null) {
			if (-value < this.min || -value > this.max || value == 0) {
				if (value != 0) this.setSign('disabled', number.sign); else this.setSign('disabled');
			} else this.setSign('enabled', number.sign);
		}

		for (var i = 0; i < this.length; i++) {
			this.setNumeral((this.showZeros == false && this.length - i > number.length) ?  '' : this.numeralSystem.characters[number.number[i]], i);
			if (this.spinButtons == 'one' && i != this.length - 1) {
				this.setSpinButtonUp('', i);
			} else {
				switch (this.onOverflow) {
					case 'stop':
						if (value + Math.pow(this.numeralSystem.base, this.length - i - 1) > this.max) this.setSpinButtonUp('disabled', i);
						else this.setSpinButtonUp('enabled', i);
						if (value - Math.pow(this.numeralSystem.base, this.length - i - 1) < this.min) this.setSpinButtonDown('disabled', i);
						else this.setSpinButtonDown('enabled', i);
						break;
					case 'scroll':
						this.setSpinButtonUp('enabled', i);
						this.setSpinButtonDown('enabled', i);
						break;
					default:
				}
			}
		}

		this.setValue(value);
	};

	WholeNumberStyler.prototype.parseNumber = function(value) {
		value = parseInt(value);
		if (isNaN(value)) value = 0;
		var sign = (value < 0) ? false : true;
		value = Math.abs(value);
		var number = [];
		var length = (this.length != 0) ? 1 : 0;
		var mod = 0;
		for (var i = 0; i < this.length; i++) {
			mod = value % this.numeralSystem.base;
			if (i != 0) {
				if (mod != 0) {
					length = i + 1;
				}
			}
			number.unshift(mod);
			value = (value - mod) / this.numeralSystem.base;
		}
		return {sign: sign, number: number, length: length};
	};

	WholeNumberStyler.prototype.setValue = function(value) {
		this.value = value;
	};

	WholeNumberStyler.prototype.getValue = function() {
		return this.value;
	};

	WholeNumberStyler.prototype.setControlValue = function() {
		this.setNumber(this.getElementValue());
	};

	WholeNumberStyler.prototype.getControlValue = function() {
		return this.getValue();
	};

	WholeNumberStyler.prototype.setElementValue = function() {
		this.element.value = this.getControlValue();
	};

	WholeNumberStyler.prototype.getElementValue = function() {
		return this.element.value;
	};

	WholeNumberStyler.prototype.spinButtonUpOnclick = function(element) {
		if (!this.isDisabled() && element.classList.contains(this.ownClassPrefix+'enabled-button')) {
			this.setNumber(this.getValue() + Math.pow(this.numeralSystem.base, this.length - this.struct.spinButtonsUp.indexOf(element) - 1));
			this.setElementValue();
        	callEvent(this.element, "change");
		}
	};

	WholeNumberStyler.prototype.spinButtonDownOnclick = function(element) {
		if (!this.isDisabled() && element.classList.contains(this.ownClassPrefix+'enabled-button')) {
			this.setNumber(this.getValue() - Math.pow(this.numeralSystem.base, this.length - this.struct.spinButtonsDown.indexOf(element) - 1));
			this.setElementValue();
        	callEvent(this.element, "change");
		}
	};

	WholeNumberStyler.prototype.addOnchange = function() {
		var self = this;

		this.element.addEventListener("change", function() {
        	if (self.getControlValue() != self.getElementValue()) self.setControlValue();
        });

	};

	window.ControlStyler = ControlStyler;

})(window);