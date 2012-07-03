/* ==========================
 *          Form.js
 * ==========================
 * 
 * Form.js helps generate forms using the bootstrap style
 * 
 * Created by: Michael Berman @ Corporate Interactive
 * Last modified: 03/07/2012
 */

var formJs = {};

/* Create a form */
formJs.create = function(options) {
	var defaults = {
		classes:'form-horizontal',
		additionalClasses: null,
		attributes: null,
		rows: null,
		prefix: Math.floor(Math.random()*100000)
	}
	var settings = $.extend(defaults, options);
	
	var form = $('<form>');
	form = formJs.addAttributes(form, settings);
	
	$(settings.rows).each( function() {
		form.append(formJs.makeRow(this, settings));
	});
	
	form.append('<div class="form-actions"><button type="submit" class="btn btn-primary">Save changes</button> <button type="reset" class="btn">Cancel</button></div>');
	
	return form;
}

/* Make a form row */
formJs.makeRow = function(rowData, settings) {
	if (rowData.type == 'HIDDEN')
		return formJs.makeInput(rowData, settings);
	var row = $('<div class="control-group"></div>');
		row.append('<label class="control-label" for="'+settings.prefix+'-'+rowData.name+'"><span class="formJs-name">'+rowData.label+'</span>'+(rowData.mandatory ? '<span class="mandatory">*</span>' : '')+'</label>');
		var controls = $('<div class="controls">');
		controls.append(formJs.makeInput(rowData, settings));
		row.append(controls);
		row = formJs.addAttributes(row, rowData);
	return row;
}

/* Make a form input */
formJs.makeInput = function(rowData, settings) {
	
	var attributes = '';
	var id = settings.prefix+'-'+rowData.name;
	rowData.id = id;
	var name = rowData.name;
	var value = rowData.value || '';
	var options = rowData.options;
	
	if (formJs.inputTypes[rowData.type]) {
		var category = formJs.inputTypes[rowData.category];
		
		attributes +=  'class="span6"';
		attributes += ' data-field-type="'+rowData.type+'"';
		attributes += rowData.mandatory ? ' required' : '';
		attributes += rowData.value ? ' value="'+value+'"' : '';
		attributes += rowData.uniqueIdentifier ? ' data-assetMan-uniqueIdentifier' : '';
		
		var attributesLong = attributes;
		attributesLong += ' id="'+id+'"';
		attributesLong += ' name="'+name+'"';
		return formJs.inputTypes[rowData.type].generate(attributesLong, id, rowData);
	} else {
		log(rowData, true);
		niceAlert('Error', 'Form.js has encountered an error: unrecognised column type: <em>'+rowData.type+'</em>');
		return false;
	}
}

/* Add attributes from settings to any element */
formJs.addAttributes = function(element, settings) {
	element = $(element);
	element.addClass(settings.classes).addClass(settings.additionalClasses);
	if (settings.attributes) {
		$.each( settings.attributes, function(key, val) {
			element.attr(key, val);
		});
	}
	return element;
}

/* Input types */
formJs.inputTypes = {
	/* Text types */
	'DATE': {
		category:'text',
		generate: function(attributesLong) {
			return $('<input type="text" '+attributesLong+'>').datepicker({
				dateFormat: 'yy-mm-dd'
			});
		}
	},
	'EMAIL': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="email" '+attributesLong+' pattern="[^@]+@[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}">';
		}
	},
	'INT': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="number" '+attributesLong+' pattern="[0-9]+">';
		}
	},
	'NUMBER': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="text" '+attributesLong+' pattern="[0-9 ]+">';
		}
	},
	'PHONE': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="tel" '+attributesLong+'>';
		}
	},
	'POSTCODE': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="text" '+attributesLong+' pattern="[0-9]{4}">';
		}
	},
	'SEQNUMBER': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="text" '+attributesLong+' pattern="[0-9]+">';
		}
	},
	'STRING': {
		category:'text',
		generate: function(attributesLong) {
			return '<input type="text" '+attributesLong+'>';
		}
	},
		
	/* Password types */
	'PASSWORD': {
		category:'password',
		generate: function(attributesLong) {
			return '<input type="password" '+attributesLong+'>';
		}
	},
	
	/* Textarea types */
	'TEXT': {
		category:'textarea',
		generate: function(attributesLong, id, rowData) {
			return '<textarea '+attributesLong+'>'+rowData.value+'</textarea>';
		}
	},
		
	/* Select types */
	'DROPDOWN': {
		category:'select',
		generate: function(attributesLong, id, rowData) {
			s = '<select '+attributesLong+'><option value=""></option>';
			for (x in rowData.options) {
				s += '<option value="'+x+'"'+( x == rowData.value ? ' selected' : '' )+'>'+rowData.options[x]+'</option>';
			};
			s+= '</select>';
			return s;
		}
	},
	'MULTIDROP': {
		category:'select',
		generate: function(attributesLong, id, rowData) {
			s = '<select '+attributesLong+' multiple>';
			for (x in rowData.options) {
				s += '<option value="'+x+'"'+( rowData.value != null && $.inArray(x, rowData.value.split(',')) != -1 ? ' selected' : '' )+'>'+rowData.options[x]+'</option>';
			};
			s+= '</select>';
			return s;
		}
	},
	'STATE': {
		category:'select',
		generate: function(attributesLong, id, rowData) {
			s = '<select '+attributesLong+' onchange="javascript:assetMan.updateSuburb(this)"><option value=""></option>';
			for (x in suburbs) {
				s += '<option value="'+x+'"'+( x == rowData.value ? ' selected' : '' )+'>'+x+'</option>';
			};
			s+= '</select>';
			return s;
		}
	},
	'SUBURB': {
		category:'select',
		generate: function(attributesLong, id, rowData) {
			s = '<select '+attributesLong+'>';
			if (rowData.value) {
				s += '<option value="'+rowData.value+'">'+rowData.value+'</option>';
			} else {
				s += '<option value=""></option>';
				s += '<option value="">Select a state first</option>';
			}
			s+= '</select>';
			return s;
		}
	},
		
	/* Check types */
	'CHECK': {
		category:'check',
		generate: function(attributesLong, id, rowData) {
			return '<input type="checkbox" '+attributesLong+' '+(rowData.value == 1 ? ' checked' : '')+'>';
		}
	},
		
	/* Special types */
	'HIDDEN': {
		category:'special',
		generate: function(attributesLong, id, rowData) {
			return '<input type="hidden" '+attributesLong+'>';
		}
	},
	'CHECKGROUP': {
		category:'special',
		generate: function(attributesLong, id, rowData) {
			s = '<div class="CHECKGROUP_OPTIONS span12">';
			for (x in rowData.options) {
				s += '<label class="span5"><input type="checkbox" name="'+rowData.name+'" value="'+x+'"'+( rowData.value != null && $.inArray(x, rowData.value.split(',')) != -1 ? ' checked' : '' )+'>'+rowData.options[x]+'</label>';
			}
			s += '</div>';
			return s;
		}
	},
	'SIGNATURE': {
		category:'special',
		generate: function(attributesLong, id, rowData) {
			s = '<input type="text" '+(rowData.mandatory?'required':'')+' data-field-type="'+rowData.type+'" class="span3" id="'+rowData.id+'-1" name="'+rowData.name+'-ACCOUNT_NO" value="'+(rowData.value != null ? rowData.value : '')+'" placeholder="Username">';
			s += '<input type="password" '+(rowData.mandatory?'required':'')+' class="span3" id="'+rowData.id+'-2" name="'+rowData.name+'-PIN" value="'+(rowData.value != null ? rowData.value : '')+'" placeholder="Password" style="margin-left:20px;">';
			s += '<a onclick="javascript:assetMan.sign(this)" class="btn span1" style="margin-left:20px;float:none;" data-assetMan-column="'+rowData.name+'">Check</a>';
			return s;
		}
	},
	'CHILD': {
		category:'special',
		generate: function(attributesLong, id, rowData) {
			var headRow = $('<tr>');
			var bodyRow = $('<tr>');
			var idx = 0;
			$(rowData.columns).each( function() {
				headRow.append('<th>'+this.label+'</th>');
				bodyRow.append('<td class="formJs-input"><input type="text" name="'+rowData.name+'.'+idx+'.'+this.name+'"></td>');
			});
			var table = $('<table class="table table-striped table-bordered"><thead></thead><tbody></tbody></table>');
			table.find('thead').html(headRow);
			table.find('tbody').html(bodyRow);
			return table;
		}
	}
	
}