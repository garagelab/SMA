/*
 Project:	Salud Materna en Avellaneda
	
			February and March 2013
			Coding modified for this project
			by Andreas Hempfling <andreas.hempfling@gmail.com>
*/

/////////////////////////////////////////////////////////////////////
// Init all necessary stuff.
/////////////////////////////////////////////////////////////////////

var avellaneda = new google.maps.LatLng(-34.680139,-58.341491);

window.maps = {};

var SMA = {
  view: 'map',

  layers: {
  	barrios: {},
  	es: {},
    barrio_de_avellaneda: {}
  },

  arrayToPoints: function(ary) {
    var points = [];

    for (var i = 0; i < ary.length; i++) {
      points.push(new google.maps.LatLng(ary[i][1], ary[i][0]));
    }

    return points;
  },

  arrayToPolygon: function(ary, polygonOptions) {
    polygonOptions.paths = SMA.arrayToPoints(ary);

    return new google.maps.Polygon(polygonOptions);
  }
};

function initializeMap() {	
  var mapStyles = [
              {
                featureType: "poi.business",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "road",
                elementType: "labels",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "road",
                elementType: "labels",
                stylers: [
                  { visibility: "on" }
                ]
              },{
                featureType: "road",
                elementType: "geometry",
                stylers: [
                  { visibility: "simplified" },
                  { lightness: 80 }
                ]
              },{
                featureType: "transit.line",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "transit.station.bus",
                stylers: [
                  { visibility: "off" }
                ]
              }
            ];	
	window.map = new google.maps.Map(document.getElementById('map'), {
    	center: avellaneda,
    	zoom: 13,
    	minZoom: 9,
    	mapTypeId: 'roadmap',
    	streetViewControl: false,
    	styles: mapStyles
  	});


	// Partido de Avellaneda.
  	var everything = [[-90, -90], [-90, 90], [90, -90], [-90, -90]];

  	var barrio_de_avellaneda = new google.maps.Polygon({
//		paths: [SMA.arrayToPoints(everything), SMA.arrayToPoints(window.barrio_de_avellaneda)],
    	paths: [SMA.arrayToPoints(window.barrio_de_avellaneda)],
    	strokeWeight: 0.5,
    	strokeOpacity: 0.3,
//    	fillColor: "#2EFE2E",
//    	fillColor: "#89C13C",
    	fillColor: "#9acd32", /* Verde */
    	fillOpacity: 0.2,
    	clickable: false
  	});

  	barrio_de_avellaneda.setMap(map);

	refresh();
}

function refresh() {
  $.each(Layer.find('*'), function() { this.conditions = []; });

  var $filters = $(".filter");

  $filters.filter("[data-facet]").each(function() {
    var $all = $("input", this);
    var $checked = $all.filter(":checked");
    var layers = Layer.find(this.parentNode.getAttribute('data-target-layer'));
  		
    if ($checked.length > 0 && $checked.length != $all.length) {
      var values = $.map($checked, function(e) { return "'" + e.getAttribute('value') + "'"; });
      var field = this.getAttribute('data-facet');
      $.each(layers, function() { this.conditions.push("'" + field + "' IN (" + values.join(", ") + ")"); });
    }

    var $meter = $('.meter > div', this);

    if ($meter.length > 0) {
      var field = this.getAttribute('data-facet');
      var values = $meter.slider('values');

      $.each(layers, function() {
        this.conditions.push("'" + field + "' <= " + (1.0 - values[0] / 10.0));
        this.conditions.push("'" + field + "' >= " + (1.0 - values[1] / 10.0));
      });
    }
  });

  $filters.find('*[data-boolean-filter]').each(function() {
    var $this = $(this);
    var value = $this.find('.ui-slider').slider('value');
    var layers = Layer.find(this.parentNode.getAttribute('data-target-layer'));

    if (value != 0) {
      var field = this.getAttribute('data-boolean-filter');

      $.each(layers, function() {
        this.conditions.push("'" + field + "' = '" + (value == 1 ? 'SI' : 'NO') + "'");
      });
    }
  });

  $filters.filter('.range-filter').each(function() {
    var $this = $(this);
    var values = $this.find('.ui-slider').slider('values');
    var layers = Layer.find(this.parentNode.getAttribute('data-target-layer'));

    var field = this.getAttribute('data-facet');

    var result = $this.data('result');

    if (result) {
      values = result.text().split("–");
    }

    $.each(layers, function() {
      this.conditions.push("'" + field + "' >= " + values[0]);
      this.conditions.push("'" + field + "' <= " + values[1]);
    });
  });

  if (SMA.view == 'map') {
    $.each(Layer.find(layersOnMap), function() { this.refreshMap(map); });
  }
  else {
    $.each(Layer.find(layersOnMap), function() {
      if ($('#' + this.name + '-table_wrapper').is(':visible')) {
        this.refreshTable($('#' + this.name + '-table'));
      }
    });
  }
}

function refreshVisibleEntities() {
  $('#layers header input').each(function() {
    var layer = Layer.find(this.parentNode.parentNode.getAttribute('data-layer-name'))[0];

    if (SMA.view == 'map') {
      if (this.checked) layer.show(map);
      else layer.hide();
    }
    else {
      if (this.checked) {
        var $table = $('#' + layer.name + '-table_wrapper');
        $table.show().siblings().hide();
      }
    }
  });
}

var bubble = null;

var COLUMNS = {
  barrios: [
//     {sName: "Nombre del Barrio", sTitle: "Nombre del Barrio", fnRender: function(o) {
//       return '<a href="/barrio/' + o.aData[0] + '">' + o.aData[o.iDataColumn] + '</a>';
//     }},
    {sName: "NOMBRE DEL BARRIO", sTitle: "NOMBRE DEL BARRIO", bVisible: true},
    {sName: "OTRO NOMBRE DEL BARRIO", sTitle: "OTRO NOMBRE DEL BARRIO", bVisible: true},
    {sName: "Poligono", sTitle: "Poligono", bVisible: false},
    {sName: "Puntos", sTitle: "Puntos", bVisible: false},
    {sName: "PARTIDO", sTitle: "PARTIDO", bVisible: true},
    {sName: "LOCALIDAD", sTitle: "LOCALIDAD", bVisible: true},
    {sName: "AÑO DE CONFORMACIÓN DEL BARRIO", sTitle: "AÑO DE CONFORMACIÓN DEL BARRIO", bVisible: true},
    {sName: "MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO", sTitle: "MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO", bVisible: true},
    {sName: "AÑO DE MAYOR CRECIMIENTO", sTitle: "AÑO DE MAYOR CRECIMIENTO", bVisible: true},
    {sName: "NRO DE FLIAS", sTitle: "NRO DE FLIAS", bVisible: true},
    {sName: "ACTORES QUE PARTICIPAN DE LA VENTA 2", sTitle: "ACTORES QUE PARTICIPAN DE LA VENTA 2", bVisible: true},
    {sName: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 1", sTitle: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 1", bVisible: true},
    {sName: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 2", sTitle: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 2", bVisible: true},
    {sName: "ACCESO A LA ENERGÍA", sTitle: "ACCESO A LA ENERGÍA", bVisible: true},
    {sName: "RED CLOACAL", sTitle: "RED CLOACAL", bVisible: true},
    {sName: "AGUA", sTitle: "AGUA", bVisible: true},
    {sName: "PROVISIÓN DE AGUA", sTitle: "PROVISIÓN DE AGUA", bVisible: true},
    {sName: "GAS", sTitle: "GAS", bVisible: true},
    {sName: "DESAGÜES PLUVIALES", sTitle: "DESAGÜES PLUVIALES", bVisible: true},
    {sName: "ALUMBRADO PÚBLICO", sTitle: "ALUMBRADO PÚBLICO", bVisible: true},
    {sName: "RECOLECCIÓN DE RESIDUOS", sTitle: "RECOLECCIÓN DE RESIDUOS", bVisible: true},
    {sName: "EL BARRIO SE ENCUENTRA CERCA DE 1", sTitle: "EL BARRIO SE ENCUENTRA CERCA DE 1", bVisible: true},
    {sName: "EL BARRIO SE ENCUENTRA CERCA DE 2", sTitle: "EL BARRIO SE ENCUENTRA CERCA DE 2", bVisible: true},
    {sName: "EL BARRIO SE ENCUENTRA CERCA DE 3", sTitle: "EL BARRIO SE ENCUENTRA CERCA DE 3", bVisible: true},
    {sName: "EXISTENCIA DE UN PROGRAMA DE VIVIENDA DEL ESTADO", sTitle: "EXISTENCIA DE UN PROGRAMA DE VIVIENDA DEL ESTADO", bVisible: true},
    {sName: "ESPECIFICAR CANTIDAD DE CASILLAS", sTitle: "ESPECIFICAR CANTIDAD DE CASILLAS", bVisible: true},
    {sName: "LLEGADA AL BARRIO EN TRANSPORTE PÚBLICO", sTitle: "LLEGADA AL BARRIO EN TRANSPORTE PÚBLICO", bVisible: true}
  ],

  es: [
//     {sName: "Nombre", sTitle: "Nombre", bVisible: true, fnRender: function(o) {
//       return '<a href="/es/' + o.aData[0] + '">' + o.aData[o.iDataColumn] + '</a>';
//     }},
    {sName: "Nombre", sTitle: "Nombre", bVisible: true},
    {sName: "Dirección", sTitle: "Dirección", bVisible: true},
    {sName: "Código Postal", sTitle: "Código Postal", bVisible: true},
    {sName: "Localidad", sTitle: "Localidad", bVisible: true},
    {sName: "Departamento", sTitle: "Departamento", bVisible: true},
    {sName: "Provincia", sTitle: "Provincia", bVisible: true},
    {sName: "Teléfono", sTitle: "Teléfono", bVisible: true},
    {sName: "Teléfono2", sTitle: "Teléfono2", bVisible: true},
    {sName: "Código SISA", sTitle: "Código SISA", bVisible: true},
    {sName: "Dependencia", sTitle: "Dependencia", bVisible: true},
    {sName: "Cantidad de partos en 2011", sTitle: "Cantidad de partos en 2011", bVisible: true},
    {sName: "Total de partos en Región Sanitaria", sTitle: "Total de partos en Región Sanitaria", bVisible: true},
    {sName: "Relación Porcentual de la región sanitaria", sTitle: "Relación Porcentual de la región sanitaria", bVisible: true},
    {sName: "Tipo de Establecimiento", sTitle: "Tipo de Establecimiento", bVisible: true},
    {sName: "Categoría", sTitle: "Categoría", bVisible: true},
    {sName: "Internación de neonatología", sTitle: "Internación de neonatología", bVisible: true},
    {sName: "Consultorio externo", sTitle: "Consultorio externo", bVisible: true},
    {sName: "Especialidades quirúrgicas", sTitle: "Especialidades quirúrgicas", bVisible: true},
    {sName: "Especialidades quirúrgicas2", sTitle: "Especialidades quirúrgicas2", bVisible: true},
    {sName: "Participa Plan Nacer", sTitle: "Participa Plan Nacer", bVisible: true},
    {sName: "Participa Programa Remediar", sTitle: "Participa Programa Remediar", bVisible: true},
    {sName: "Participa Programa Nacional de Sangre", sTitle: "Participa Programa Nacional de Sangre", bVisible: true},
    {sName: "latitud", sTitle: "latitud", bVisible: false},
    {sName: "longitud", sTitle: "longitud", bVisible: false},
    {sName: "Nivel de zoom", sTitle: "Nivel de zoom", bVisible: false},
    {sName: "Comentario/ especialidades", sTitle: "Comentario/ especialidades", bVisible: true},
    {sName: "Hospital, asociado a", sTitle: "Hospital, asociado a", bVisible: true},
    {sName: "Hospital", sTitle: "Hospital", bVisible: true}
  ]
};

function fillTable($table, cols, rows) {
  var dataTable = $table.dataTable();

  dataTable.fnClearTable();
  dataTable.fnAddData(rows);
}

function Layer(name, source) {
	var layer = this;

  	this.name = name;
  	this.source = source;
  	this.visible = true;
	
	if (this.name == "es") {
  		this.ftLayer = new google.maps.FusionTablesLayer({
    		suppressInfoWindows: true,
    		query: {
    			select: 'latitud',
    			from: this.source
  			},
    		styles: [
  				{
  					markerOptions: {
    					iconName: "pharmacy_plus",
    					zIndex: 1
  					}  				
				},
    			{
    				where: "Hospital = 'X'",
  					markerOptions: {
    					iconName: "hospitals",
    					zIndex: 1
  					}
  				}
			]    		
  		});
	}
// 	else if (this.name == "barrios") {
// 	  		
// 	  	console.log("Layer barrios");
// 
//   		this.ftLayer = new google.maps.FusionTablesLayer({
//     		suppressInfoWindows: true,
//    			query: {
//    				select: 'Poligono',
//    				from: this.source
//  			},
//     		styles: [ 
//     			{
//       				polygonOptions: {
//         				fillColor: "#008800",     // Color del plano - #ff0000 rojo de Google.
//         				fillOpacity: 0.5,         // Opacidad del plano
//         				strokeColor: "#000000",   // Color del margen
//         				strokeOpacity: 0.5,       // Opacidad del margen
//         				strokeWeight: 1           // Grosor del margen
//       				}
//     			}
//     		]
//   		});
//  	}
	else {
  		this.ftLayer = new google.maps.FusionTablesLayer({
    		suppressInfoWindows: true
  		});
	}
	
	return this;
}

Layer.bubble = new google.maps.InfoWindow();
//Layer.bubble = new InfoBubble();

Layer.prototype.hide = function() {
  this.visible = false;
  this.ftLayer.setMap(null);
}

Layer.prototype.show = function(map) {
  this.visible = true;
  this.ftLayer.setMap(map);
}

Layer.prototype.getBubbleHTML = function(row) {
	var bubble;
	if (this.name == "es") {
		if( "Código Postal" in row ) {
			row["Código_Postal"] = row["Código Postal"];
		}
		if( "Código SISA" in row ) {
			row["Código_SISA"] = row["Código SISA"];
		}
		if( "Cantidad de partos en 2011" in row ) {
			row["Cantidad_de_partos_en_2011"] = row["Cantidad de partos en 2011"];
		}
		if( "Tipo de Establecimiento" in row ) {
			row["Tipo_de_Establecimiento"] = row["Tipo de Establecimiento"];
		}
		if( "Participa Plan Nacer" in row ) {
			row["Participa_Plan_Nacer"] = row["Participa Plan Nacer"];
		}
		if( "Comentario/ especialidades" in row ) {
			row["Comentario_especialidades"] = row["Comentario/ especialidades"];
		}

		if (row["Hospital"].value == "X") {
			bubble = $('#' + this.name + '-bubble-es-hospital').tmpl(row).get(0);
		}
		else {
			bubble = $('#' + this.name + '-bubble-es-unidad').tmpl(row).get(0);		
		}	
	}
	else if (this.name == "barrios") {
		if( "NOMBRE DEL BARRIO" in row ) {
			row["NOMBRE_DEL_BARRIO"] = row["NOMBRE DEL BARRIO"];
		}
		if( "OTRO NOMBRE DEL BARRIO" in row ) {
			row["OTRO_NOMBRE_DEL_BARRIO"] = row["OTRO NOMBRE DEL BARRIO"];
		}
		if( "AÑO DE CONFORMACIÓN DEL BARRIO" in row ) {
			row["AÑO_DE_CONFORMACIÓN_DEL_BARRIO"] = row["AÑO DE CONFORMACIÓN DEL BARRIO"];
		}
		if( "MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO" in row ) {
			row["MODALIDAD_EN_LA_QUE_SE_CONSTITUYÓ_EL_BARRIO"] = row["MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO"];
		}
		if( "AÑO DE MAYOR CRECIMIENTO" in row ) {
			row["AÑO_DE_MAYOR_CRECIMIENTO"] = row["AÑO DE MAYOR CRECIMIENTO"];
		}
		if( "NRO DE FLIAS" in row ) {
			row["NRO_DE_FLIAS"] = row["NRO DE FLIAS"];
		}

		bubble = $('#' + this.name + '-bubble-template').tmpl(row).get(0);	
	}
	else {
		bubble = $('#' + this.name + '-bubble-template').tmpl(row).get(0);
	}
	return bubble;
}

Layer.prototype.getBubbleAddHTML = function(row) {
	var bubble;
	if (this.name == "es") {
		if( "Código SISA" in row ) {
			row["Código_SISA"] = row["Código SISA"];
		}
		if( "Cantidad de partos en 2011" in row ) {
			row["Cantidad_de_partos_en_2011"] = row["Cantidad de partos en 2011"];
		}
		if( "Tipo de Establecimiento" in row ) {
			row["Tipo_de_Establecimiento"] = row["Tipo de Establecimiento"];
		}
		if( "Participa Plan Nacer" in row ) {
			row["Participa_Plan_Nacer"] = row["Participa Plan Nacer"];
		}
		if( "Comentario/ especialidades" in row ) {
			row["Comentario_especialidades"] = row["Comentario/ especialidades"];
		}
 		
		if (row["Hospital"].value == "X") {
			bubble = $('#' + this.name + '-bubble-es-hospital-add').tmpl(row).get(0);
		}
		else {
			bubble = $('#' + this.name + '-bubble-es-unidad-add').tmpl(row).get(0);		
		}	
	}
	else {
		bubble = $('#' + this.name + '-bubble-template').tmpl(row).get(0);
	}
	return bubble;
}

Layer.prototype.refreshMap = function(map) {
  	Layer.bubble.close();

	var options;
	if (this.name == "es") {
		options = {
    		query: {
      			select: 'latitud',
      			from: this.source
    		}
  		}
  	}
	else if (this.name == "barrios") {
  		options = {
    		query: {
      			select: 'Poligono',
      			from: this.source
    		}
  		}
  	}
	else {
  		options = {
    		query: {
      			select: 'location',
      			from: this.source
    		}
  		}
	}

// 	console.log("Layer.prototype.refreshMap none");
//   		options = {
//     		query: {
//       			select: 'location',
//       			from: this.source
//     		}
//   		}
// 

  if (this.conditions.length > 0) options.query.where = this.conditions.join(" AND ");

  this.ftLayer.setOptions(options);

  if (this.visible) {
    this.show(map);
  }

  var layer = this;

/*
	google.maps.event.addListener(this.ftLayer, 'click', function(e) {
    	Layer.bubble.close();
        	
// 		if (Layer.bubble.isOpen()) {
//             console.log("infoBubble ist bereits offen.");
// 			return false;
//         }
          
		console.log("ich bin hier in google.maps.event.addListener");

		Layer.bubble = new InfoBubble({
    		map: map,
        	position: e.latLng,
//         	shadowStyle: 1,
//         	padding: 0,
//         	backgroundColor: 'rgb(57,57,57)',
//         	borderRadius: 4,
//         	arrowSize: 10,
//         	borderWidth: 1,
//         	borderColor: '#2c2c2c',
//         	disableAutoPan: true,
//         	hideCloseButton: true,
//         	arrowPosition: 30,
//         	backgroundClassName: 'phoney',
//         	arrowStyle: 2
    	});

		Layer.bubble.addTab('Información de', layer.getBubbleHTML(e.row));

 		if (layer.name == "es") {
			Layer.bubble.addTab('<strong style="color:#4169e1;">ver más</strong>', 
									layer.getBubbleAddHTML(e.row));
 		}

		Layer.bubble.open();
    	$(document.body).trigger('bubble.maps', Layer.bubble);
	});
*/

	// InfoWindow
	google.maps.event.addListener(this.ftLayer, 'click', function(e) {
		Layer.bubble.close();

		Layer.bubble.setContent(layer.getBubbleHTML(e.row));	
    	Layer.bubble.setPosition(e.latLng);

    	Layer.bubble.open(map);    
	    $(document.body).trigger('bubble.maps', Layer.bubble);

   		google.maps.event.addListener(Layer.bubble, 'domready', function () {
        	$("#tabs-bubble").tabs();
    	});
   });
}

Layer.prototype.getMap = function() {
  return this.ftLayer.getMap();
}

Layer.prototype.getColumns = function() {
  return COLUMNS[this.name];
}

Layer.prototype.refreshTable = function($table) {
  this.query(function(table) {
    fillTable($table, table.cols, table.rows);
  });
}

Layer.prototype.query = function(callback) {
  var cols = $.map(this.getColumns(), function(e) { return "'" + e.sName + "'"; });

  var sql = 'select ' + cols.join(', ') + ' from ' + this.source;

  if (this.conditions.length > 0) {
    sql += ' where ' + this.conditions.join(' AND ');
  }

  $.getJSON('http://fusiontables.googleusercontent.com/fusiontables/api/query?sql=' + encodeURIComponent(sql) + '&jsonCallback=?')
    .success(function(res) {
      callback(res.table);
    });
}

Layer.layers = {};
Layer.all = [];

Layer.add = function(name, source) {
  var layer = new Layer(name, source);

  Layer.layers[name] = layer;
  Layer.all.push(layer);

  return layer;
}

Layer.find = function(name) {
  if (name == '*') return Layer.all;

  var layers = name.split(',');

  for (var i = 0, l = layers.length; i < l; i++) {
    layers[i] = Layer.layers[layers[i]];
  }

  return layers;
}

Layer.stringToLatLng = function(string) {
  var parts = string.split(' ');

  return new google.maps.LatLng(parseFloat(parts[0]), parseFloat(parts[1]));
}

$(function() {
  var $sidebar = $('#sidebar');

  window.layersOnMap = $.makeArray($('#layers li').map(function() { return this.getAttribute('data-layer-name'); })).join(',');

  $('.filter').delegate('input', 'click', function(e) {  
    refresh();
    e.stopPropagation();
  });

  $('.filter').delegate('label', 'click', function(e) {
    $(this).siblings().find('input').attr('checked', false);
    $(this).find('input').attr('checked', true);
    refresh();
    e.stopPropagation();
    e.preventDefault();
  });

  var $booleans = $('.filter *[data-boolean-filter]')

  $booleans.wrapInner('<span />');

  $booleans.append('<div class="tristate" />').find('div').slider({
    max: 1,
    min: -1,
    change: function(_, ui) {
      refresh();
    }
  });

  $booleans.find('span').click(function() {
    var $this = $(this);
    var $slider = $this.siblings('div');

    var value = $slider.slider('option', 'value') + 1;
    var max = $slider.slider('option', 'max');

    if (value > max) value = $slider.slider('option', 'min');

    $slider.slider('option', 'value', value);
  });

  $('.filter *[data-states-filter]').each(function() {
    var $this = $(this);

    var $lis = $this.find('li');

    $lis.each(function(index) {
      var $li = $(this);
      $li.css('bottom', (($lis.length - index - 1) * 100 / $lis.length) + '%');
    });

    var $slider = $('<div />').appendTo($this).slider({
      min: 0,
      max: 3,
      orientation: 'vertical',
      change: function(_, ui) {
        refresh();
      }
    });
  });

  $('.views a[href="#view=map"]').click(function() {
    $sidebar.find('header input').each(function() {
      this.type = 'checkbox';
      this.checked = true;
    });

    $(this).addClass('active');
    $(this).siblings().removeClass('active');
    $('#map').show();
    $('#table').hide();
    SMA.view = 'map';
    refresh();
  });

  $('.views a[href="#view=table"]').click(function() {
    $sidebar.find('header input')
      .each(function() { this.type = 'radio'; })
      .filter(':first').attr('checked', true);

    $(this).addClass('active');
    $(this).siblings().removeClass('active');
    $('#map').hide();
    $('#table').show();
    SMA.view = 'table';
    refreshVisibleEntities();
    refresh();
  });


  $('#table table').each(function() {
    var layer = Layer.find(this.id.split('-')[0])[0];

    $(this).dataTable({
      bJQueryUI: true,
      sScrollY: '100%',
      sScrollX: '100%',
      aoColumns: layer.getColumns(),
      aLengthMenu: [[25, 50, 100, -1], [25, 50, 100, "Todos"]],
      iDisplayLength: 25,
      oLanguage: {
        'sProcessing':   'Procesando...',
        'sLengthMenu':   'Mostrar _MENU_ registros por página',
        'sZeroRecords':  'No se encontraron resultados',
        // 'sInfo':         '_START_-_END_/<big>_TOTAL_</big> registros en total',
        'sInfo':         '_TOTAL_ registros',
        'sInfoEmpty':    'No hay registros',
        'sInfoFiltered': '(filtrado de _MAX_ registros en total)',
        'sInfoPostFix':  '',
        'sSearch':       'Filtrar por texto libre:',
        'sUrl':          '',
        'oPaginate': {
          'sFirst':    'Primero',
          'sPrevious': 'Anterior',
          'sNext':     'Siguiente',
          'sLast':     'Último'
        }
      }
    });
  });

  $('.dataTables_info').each(function() {
    $(this).prependTo(this.parentNode.parentNode.firstChild)
  });

  $('.dataTables_paginate').each(function() {
    $(this).prependTo(this.parentNode.parentNode.firstChild)
  });

  $('.dataTables_scrollBody').wrap('<div class="dataTables_scrollBodyWrapper" />');

  $sidebar.delegate('input', 'click', function(e) {

//////////////////////////////////////////////////////////
//	14/03/13 16:10
//	A petición del cliente, la lógica se ha cambiado.
//	Andreas Hempfling <andreas.hempfling@gmail.com>
//////////////////////////////////////////////////////////

//  	console.log("$sidebar.delegate() => " + this.id);

	if (this.id == 'establecimientos') {
   		if (!$('#establecimientos').is(':checked')) {
 			$('#hospitales').attr('checked', false);
	 		$('#cesacs').attr('checked', false);
		}
		else {
 			$('#hospitales').attr('checked', true);
	 		$('#cesacs').attr('checked', true);
		}	   	
	}
	if (this.id == 'hospitales' || this.id == 'cesacs') {
	   	if (!($('#hospitales').is(':checked') && $('#cesacs').is(':checked'))) {
	 		$('#establecimientos').attr('checked', false);					
		}
	
	}
//////////////////////////////////////////////////////////

    refreshVisibleEntities();
    refresh();
  });

  $sidebar.delegate('li > header', 'click', function(e) {
    var $li = $(this).parent();

    if ($li.hasClass('disabled')) return;

    var $input = $li.find('input');

    if (e.target == $input[0]) return;

    var current = $sidebar.data('current');

    if (current && current[0][0] != $li[0]) {
      current[1].css('height', 0);
    }

    var $panel = $($li.find('a').attr('href'));

    if (parseInt($panel.css('height')) > 0) {
      $panel.css('height', 0);
    }
    else {
      $sidebar.data('current', [$li, $panel]);
      $input.attr('checked', true);
      refreshVisibleEntities();
      refresh();
      $panel.css('height', $panel.data('height'));
    }

    return false;
  });

  $('<div>').appendTo('.filter .meter').slider({
    max: 10,
    min: 0,
    range: true,
    values: [0, 10],
    change: function(_, ui) {
      refresh();
    }
  });

  $('.filter.range-filter').each(function() {
    var max = parseInt(this.getAttribute('data-max'));
    var min = parseInt(this.getAttribute('data-min'));
    var $this = $(this);

    $this.data('result', $this.find('.result'));

    $this.data('updateValues', function(values) {
      var caption = values.join('–');
      $this.data('result').text(caption);
    });

    $('<div>').prependTo($('div', this)).slider({
      max: 100,
      min: 0,
      step: parseInt(this.getAttribute('data-step')),
      range: true,
      values: [0, 100],
      slide: function(_, ui) {
        var values = $.map(ui.values, function(e) { return Math.pow(e, 3) * max / Math.pow(100.0, 3) });
        $(this.parentNode.parentNode).data('updateValues')(values);
      },
      change: function(_, ui) {
        refresh();
      }
    });

    $this.data('updateValues')([min, max]);
  });

  $('.zoomed-map').each(function() {
    var type = (this.getAttribute('data-map-type') || 'roadmap').toUpperCase();
    var zoom = parseInt(this.getAttribute('data-zoom') || 15);

    var map = new google.maps.Map(this, {
      zoom: zoom,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId[type]
    });

    $(this).data('map', map);

    if (this.getAttribute('data-table-id')) {
      var table = this.getAttribute('data-table-id');
      var filter = this.getAttribute('data-filter');

      map.setCenter(Layer.stringToLatLng(this.getAttribute('data-center')));

      var layer = new google.maps.FusionTablesLayer({
        suppressInfoWindows: true,
        map: map
      });

      layer.setOptions({
        query: {
          select: 'location',
          from: table,
          where: filter
        }
      });
    }
    else if(this.getAttribute('data-location')) {
      var loc = this.getAttribute('data-location');

      var geocoder = new google.maps.Geocoder();

      geocoder.geocode( { 'address': loc}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }
    else{
      var lat = parseFloat(this.getAttribute('data-lat'));
      var lng = parseFloat(this.getAttribute('data-lng'));

      var latlng = new google.maps.LatLng(lat, lng);

      map.setCenter(latlng);

      var marker = new google.maps.Marker({
        map: map,
        position: latlng
      });
    }
  });

  $('.image-slider').each(function() {
    var $this = $(this);
    var $images = $this.find('img');
    var $last = $($images.get(-1));

    $this.css({
      position: 'relative',
      height: $last.height()
    });

    $images.css({
      position: 'absolute',
      left: 0,
      top: 0
    });

    $images.filter(':not(:last-child)').css('opacity', 0);

    var max = $images.length - 1;

    $('<div>').appendTo(this).slider({
      min: 0,
      max: max,
      value: max,
      slide: function(_, ui) {
        var value = ui.value;
        var previous = $this.data('previousValue') || max;

        if (typeof(previous) != 'undefined') $($images.get(previous)).css('opacity', 0);
        $($images.get(value)).css('opacity', 1);

        $this.data('previousValue', value);
      }
    });
  });
});

function excerpt(s, size) {
  if (s.length > size) {
    return s.slice(0, 50) + "...";
  }

  return s;
}

function query(sql, cb) {
  url = 'http://www.google.com/fusiontables/api/query?sql=';
  var url = url + encodeURIComponent(sql) + '&jsonCallback=?';
  $.getJSON(url).success(function(res) { cb(res.table.cols, res.table.rows) });
}

function snap(n) {
  var d = n - parseInt(n * 10) / 10;

  if (d <= 0.03) return n - d;
  if (d <= 0.05) return n + 0.05 - d;
  if (d <= 0.07) return n + 0.05 - d;
  if (d <= 0.07) return n + 0.05 - d;
  return n + 0.1 - d;
}

function snap2(n) {
  // var d = n - parseInt(n * 10) / 10;

  // if (d <= 0.05) return n - parseFloat(d.toFixed(2));
  // return n + 0.1 - parseFloat(d.toFixed(2));
  return parseInt(n * 10) / 10;
}

function unsnap2(n) {
  n = parseFloat(n);
  return [n.toFixed(2), (n + 0.1).toFixed(2)];
}
