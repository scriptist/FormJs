/* ==========================
 *          Form.js
 * ==========================
 * 
 * Form.js helps generate forms using the bootstrap style
 * 
 * Created by: Michael Berman @ Corporate Interactive
 * Last modified: 05/07/2012
 */

/* Form Validation */
$(document).on('submit', 'form.formJs', function(e) {
	if (!formJs.validate(this))
		e.preventDefault();
});

$(document).on('focusout', 'form.formJs input, form.formJs select, form.formJs textarea', function(e) {
	formJs.validateInput(this, 100);
});


var formJs = {};

/* Create a form */
formJs.create = function(options) {
	var defaults = {
		classes:'form-horizontal formJs',
		additionalClasses: null,
		attributes: null,
		rows: null,
		prefix: Math.floor(Math.random()*100000)+'-'
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
		row.append('<label class="control-label" for="'+settings.prefix+rowData.name+'"><span class="formJs-name">'+rowData.label+'</span>'+(rowData.mandatory ? '<span class="mandatory">*</span>' : '')+'</label>');
		var controls = $('<div class="controls">');
		controls.append(formJs.makeInput(rowData, settings));
		row.append(controls);
		row = formJs.addAttributes(row, rowData);
	return row;
}

/* Make a form input */
formJs.makeInput = function(rowData, settings) {
	
	var attributes = '';
	var id = settings.prefix+rowData.name;
	rowData.id = id;
	var value = rowData.value || '';
	rowData.value = value;
	var options = rowData.options;
	
	if (formJs.inputTypes[rowData.type]) {
		var category = formJs.inputTypes[rowData.category];
		var defaults = {
			classes: 'span6'
		};
		
		if (settings.namePrefix)
			rowData.name = settings.namePrefix + rowData.name;
		
		rowData = $.extend(defaults, rowData);
		
		attributes +=  'class="'+rowData.classes+'"';
		attributes += ' data-field-type="'+rowData.type+'"';
		attributes += rowData.mandatory ? ' required' : '';
		attributes += rowData.value ? ' value="'+value+'"' : '';
		attributes += rowData.uniqueIdentifier ? ' data-assetMan-uniqueIdentifier' : '';
		
		var attributesLong = attributes;
		attributesLong += ' id="'+id+'"';
		attributesLong += ' name="'+rowData.name+'"';
		return formJs.inputTypes[rowData.type].generate(attributesLong, id, rowData, settings);
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

/* Validate form */
formJs.validate = function(form) {
	var errors = 0;
	$(form).find('input, select, textarea').each( function() {
		if (!formJs.validateInput(this))
			errors++;
	});
	return !errors;
}

/* Validate input */
formJs.validateInput = function(input, delay) {
	// Delay validation if necessary
	if (delay) {
		setTimeout( function() {
			formJs.validateInput(input);
		}, delay);
		return null;
	}
	
	input = $(input);
	
	// Remove previous validation
	input.closest('.control-group').removeClass('error warning success').end().next('.help-inline').remove();
	
	var v = $(input).val();
	var type = $(input).attr('data-field-type');
	var controlGroup = input.closest('.control-group');
	
	// Check required attributes
	if (input.is('[required]')) {
		if (!v || v.length == 0) {
			controlGroup.addClass('error');
			if (controlGroup.is('div'))
				input.after('<span class="help-inline">This input is mandatory</span>');
			return false;
		}
	}
	
	// Check attributes with pattern
	if (input.is('[pattern]') && $(input).val().length > 0) {
		try {
			if (!v.match(input.attr('pattern'))) {
				// Input has failed validation
				var text = 'Invalid input';
				if (formJs.inputTypes[type] && formJs.inputTypes[type].invalidText)
					text = formJs.inputTypes[type].invalidText;
				controlGroup.addClass('error');
				if (controlGroup.is('div'))
					input.after('<span class="help-inline">'+text+'</span>');
				return false;
			}
		} catch (err) {
			log('Invalid regular experssion: '+$(input).attr('pattern'), true)
		}
	}
	return true;
}

/* Add a new row to the bottom of the child table */
formJs.addChildRow = function(table) {
	table = $(table);
	var tr = table.find('tr:last').clone();
	tr.find(':input').each( function() {
		$(this).val('');
		var n = $(this).attr('name');
		var n_a = n.split('.');
		var idx = eval(n_a[1]) + 1;
		n = n.replace('.'+(idx-1)+'.', '.'+idx+'.');
		$(this).attr('name', n);
		$(this).attr('id', $(this).attr('id').replace('.'+(idx-1)+'.', '.'+idx+'.'));
		if (formJs.inputTypes[$(this).attr('data-field-type')].onClone)
			$(this).replaceWith(formJs.inputTypes[$(this).attr('data-field-type')].onClone(this));
	});
	table.find('tbody').append(tr);
}

/* Add a new row to the bottom of the child table */
formJs.removeChildRow = function(table) {
	table = $(table);
	var tr = table.find('tr:last:not(:first-child)').remove();
}

/* Input types */
formJs.inputTypes = {
	/* Text types */
	'DATE': {
		category:'text',
		generate: function(attributesLong) {
			return $('<input type="text" '+attributesLong+' pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}">').datepicker({
				dateFormat: 'yy-mm-dd'
			});
		},
		onClone: function(newElm) {
			return $(newElm).clone(false).removeClass('hasDatepicker').datepicker({
				dateFormat: 'yy-mm-dd'
			});
		}
	},
	'EMAIL': {
		category:'text',
		invalidText:'You must enter an email address',
		generate: function(attributesLong) {
			return '<input type="email" '+attributesLong+' pattern="[^@]+@[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}">';
		}
	},
	'INT': {
		category:'text',
		invalidText:'You must enter a number',
		generate: function(attributesLong) {
			return '<input type="number" '+attributesLong+' pattern="[0-9]+">';
		}
	},
	'NUMBER': {
		category:'text',
		invalidText:'You must enter a number',
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
			invalidText:'You must enter a number',
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
	'PIN': {
		category:'password',
		generate: function(attributesLong) {
			return '<input type="password" '+attributesLong+' pattern="[0-9]+">';
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
			o = $('<select '+attributesLong+' multiple>');
			for (x in rowData.options) {
				o.append('<option value="'+x+'"'+( rowData.value != null && $.inArray(x, rowData.value.split(',')) != -1 ? ' selected' : '' )+'>'+rowData.options[x]+'</option>');
			};
			return o;
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
		generate: function(attributesLong, id, rowData, parentSettings) {
			//console.log(rowData);
			var headRow = $('<tr>');
			var bodyRow = $('<tr>');
			var settings = {
				prefix: parentSettings.prefix + rowData.name+'.0.',
				namePrefix: rowData.name+'.0.'
			};
			$(rowData.columns).each( function() {
				this.classes = ''
				headRow.append('<th>'+this.label+(this.mandatory ? '<span class="mandatory">*</span>' : '')+'</th>');
				var input = $('<td class="control-group">').append(formJs.makeInput(this, settings));
				bodyRow.append(input);
			});
			
			var table = $('<table class="table table-striped table-bordered" id="'+rowData.id+'"><thead></thead></table>');
			table.find('thead').html(headRow);
			var tbody = $('<tbody>').html(bodyRow);
			table.append(tbody);
			// Set values if set + add more rows if necessary
			$(rowData.columns).each( function() {
				if (this.values && this.values.length) {
					var column = this;
					$(this.values).each( function(key, val) {
						var name = column.name.replace(/\.[0-9]+\./, '.'+key+'.');
						var input = tbody.find(':input[name="'+name+'"]');
						var i = 0;
						while (!input.length && i++ < 100) {
							formJs.addChildRow(table);
							input = tbody.find(':input[name="'+name+'"]');
						}
						input.val(val);
					});
				}
			});
			
			var row = $('<div>').html(table);
			row.append('<div style="float:right;margin-top:-14px;">\
				<a href="javascript:void(0)" onclick="formJs.addChildRow(\'#'+rowData.id+'\');" class="btn btn-mini" style="width:10px;">+</a>\
				<a href="javascript:void(0)" onclick="formJs.removeChildRow(\'#'+rowData.id+'\');" class="btn btn-mini" style="margin-left:1px;width:10px;">-</a>\
			</div>');
			return row;
		}
	}
}