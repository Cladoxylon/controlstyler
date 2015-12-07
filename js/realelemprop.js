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

	function createHiddenWrapper() {
		var wrapper = window.document.createElement('div');
		wrapper.style.position = 'fixed';
		wrapper.style.padding = '0px';
		wrapper.style.height = '0px';
		wrapper.style.width = '100%';
		wrapper.style.overflow = 'hidden';
		return wrapper;
	}

	function addHiddenWrapper(wrapper) {
		window.document.body.appendChild(wrapper);
	}

	function removeHiddenWrapper(wrapper) {
		window.document.body.removeChild(wrapper);
	}

	var RealElemProp = {

		getTextWidth : function(element, value){
			if (!(element instanceof HTMLElement)) return false;

			var wrapper = createHiddenWrapper();

			var clone = document.createElement('div');
			clone.style.display = 'inline-block';
			clone.style.padding = '0px';
			clone.style.margin = '0px';
			clone.style.border = '0px';
			var styles = window.getComputedStyle(element);
			clone.style['font-style'] = styles['font-style'];
			clone.style['font-variant'] = styles['font-variant'];
			clone.style['font-weight'] = styles['font-weight'];
			clone.style['font-stretch'] = styles['font-stretch'];
			clone.style['font-size'] = styles['font-size'];
			clone.style['font-family'] = styles['font-family'];
			clone.style['white-space'] = "pre";//styles['white-space'];
			clone.style['word-spacing'] = styles['word-spacing'];
			clone.style['line-height'] = styles['line-height'];

			clone.textContent = (typeof value == 'undefined') ? element.value : value;

			wrapper.appendChild(clone);

			addHiddenWrapper(wrapper);

			var width = clone.offsetWidth;

			removeHiddenWrapper(wrapper);

			return width;

		}

		, getDefaultContentEditableHeight : function(){

			var wrapper = createHiddenWrapper();

			var div = document.createElement('div');
			div.style.display = 'inline-block';
			div.style.padding = '0px';
			div.style.margin = '0px';
			div.style.border = '0px';
			div.style['line-height'] = 'normal';
			div.style['font-size'] = '12px';
			div.setAttribute('contenteditable', 'true');

			wrapper.appendChild(div);

			addHiddenWrapper(wrapper);

			var height = div.offsetHeight;

			removeHiddenWrapper(wrapper);

			return height;
		}

	};

	window.RealElemProp = RealElemProp;

})(window);