/*
 Project:	Salud Materna en Avellaneda
	
			Between February and April 2013
			Coding modified from a template and many parts new written for 
			this project by Andreas Hempfling <andreas.hempfling@gmail.com>
*/

/////////////////////////////////////////////////////////////////////
// Init all necessary stuff.
/////////////////////////////////////////////////////////////////////

var avellaneda = new google.maps.LatLng(-34.680139,-58.341491);

var barrios_table = '1_fEVSZmIaCJzDQoOgTY7pIcjBLng1MFOoeeTtYY';
var es_table = '1srzoUc6ovddAOlLSYRRxZdF41Z6nLwxYnFFF7rM';

var queryUrlHead = 'https://fusiontables.googleusercontent.com/fusiontables/api/query?sql=';
var queryUrlTail = '&jsonCallback=?'; // ? could be a function name

var barrios_cols
var barrios_rows;
var barrios_entities = [];

var hospitales_cols
var hospitales_rows;
var hospitales_entities = [];

var cesacs_cols
var cesacs_rows;
var cesacs_entities = [];

var COLUMNS = {
  barrios: [
    {sName: "CÓDIGO", sTitle: "CÓDIGO", bVisible: false, aTargets: [0]},
    {sName: "NOMBRE DEL BARRIO", sTitle: "NOMBRE DEL BARRIO", bVisible: true, aTargets: [1]},
    {sName: "OTRO NOMBRE DEL BARRIO", sTitle: "OTRO NOMBRE DEL BARRIO", bVisible: true, aTargets: [2]},
    {sName: "Poligono", sTitle: "Poligono", bVisible: false, aTargets: [3]},
    {sName: "Puntos", sTitle: "Puntos", bVisible: false, aTargets: [4]},
    {sName: "PARTIDO", sTitle: "PARTIDO", bVisible: true, aTargets: [5]},
    {sName: "LOCALIDAD", sTitle: "LOCALIDAD", bVisible: true, aTargets: [6]},
    {sName: "AÑO DE CONFORMACIÓN DEL BARRIO", sTitle: "AÑO DE CONFORMACIÓN DEL BARRIO", bVisible: true, aTargets: [7]},
    {sName: "MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO", sTitle: "MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO", bVisible: true, aTargets: [8]},
    {sName: "AÑO DE MAYOR CRECIMIENTO", sTitle: "AÑO DE MAYOR CRECIMIENTO", bVisible: true, aTargets: [9]},
    {sName: "NRO DE FLIAS", sTitle: "NRO DE FLIAS", bVisible: true, aTargets: [10]},
    {sName: "ACTORES QUE PARTICIPAN DE LA VENTA 2", sTitle: "ACTORES QUE PARTICIPAN DE LA VENTA 2", bVisible: true, aTargets: [11]},
    {sName: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 1", sTitle: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 1", bVisible: true, aTargets: [12]},
    {sName: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 2", sTitle: "MODALIDAD ADOPTADA POR LAS NUEVAS GENERACIONES 2", bVisible: true, aTargets: [13]},
    {sName: "ACCESO A LA ENERGÍA", sTitle: "ACCESO A LA ENERGÍA", bVisible: true, aTargets: [14]},
    {sName: "RED CLOACAL", sTitle: "RED CLOACAL", bVisible: true, aTargets: [15]},
    {sName: "AGUA", sTitle: "AGUA", bVisible: true, aTargets: [16]},
    {sName: "PROVISIÓN DE AGUA", sTitle: "PROVISIÓN DE AGUA", bVisible: true, aTargets: [17]},
    {sName: "GAS", sTitle: "GAS", bVisible: true, aTargets: [18]},
    {sName: "DESAGÜES PLUVIALES", sTitle: "DESAGÜES PLUVIALES", bVisible: true, aTargets: [19]},
    {sName: "ALUMBRADO PÚBLICO", sTitle: "ALUMBRADO PÚBLICO", bVisible: true, aTargets: [20]},
    {sName: "RECOLECCIÓN DE RESIDUOS", sTitle: "RECOLECCIÓN DE RESIDUOS", bVisible: true, aTargets: [21]},
    {sName: "EL BARRIO SE ENCUENTRA CERCA DE 1", sTitle: "EL BARRIO SE ENCUENTRA CERCA DE 1", bVisible: true, aTargets: [22]},
    {sName: "EL BARRIO SE ENCUENTRA CERCA DE 2", sTitle: "EL BARRIO SE ENCUENTRA CERCA DE 2", bVisible: true, aTargets: [23]},
    {sName: "EL BARRIO SE ENCUENTRA CERCA DE 3", sTitle: "EL BARRIO SE ENCUENTRA CERCA DE 3", bVisible: true, aTargets: [24]},
    {sName: "EXISTENCIA DE UN PROGRAMA DE VIVIENDA DEL ESTADO", sTitle: "EXISTENCIA DE UN PROGRAMA DE VIVIENDA DEL ESTADO", bVisible: true, aTargets: [25]},
    {sName: "ESPECIFICAR CANTIDAD DE CASILLAS", sTitle: "ESPECIFICAR CANTIDAD DE CASILLAS", bVisible: true, aTargets: [26]},
    {sName: "LLEGADA AL BARRIO EN TRANSPORTE PÚBLICO", sTitle: "LLEGADA AL BARRIO EN TRANSPORTE PÚBLICO", bVisible: true, aTargets: [27]}
  ],

  es: [
    {sName: "Nombre", sTitle: "Nombre", bVisible: true, aTargets: [0], asSorting: ['asc','desc']},
    {sName: "Dirección", sTitle: "Dirección", bVisible: true, aTargets: [1], asSorting: ['asc','desc']},
    {sName: "Código Postal", sTitle: "Código Postal", bVisible: true, aTargets: [2], asSorting: ['asc','desc']},
    {sName: "Localidad", sTitle: "Localidad", bVisible: true, aTargets: [3], asSorting: ['asc','desc']},
    {sName: "Departamento", sTitle: "Departamento", bVisible: true, aTargets: [4], asSorting: ['asc','desc']},
    {sName: "Provincia", sTitle: "Provincia", bVisible: true, aTargets: [5], asSorting: ['asc','desc']},
    {sName: "Teléfono", sTitle: "Teléfono", bVisible: true, aTargets: [6], asSorting: ['asc','desc']},
    {sName: "Teléfono2", sTitle: "Teléfono2", bVisible: true, aTargets: [7], asSorting: ['asc','desc']},
    {sName: "Código SISA", sTitle: "Código SISA", bVisible: true, aTargets: [8], asSorting: ['asc','desc']},
    {sName: "Dependencia", sTitle: "Dependencia", bVisible: true, aTargets: [9], asSorting: ['asc','desc']},
    {sName: "Cantidad de partos en 2011", sTitle: "Cantidad de partos en 2011", bVisible: true, aTargets: [10], asSorting: ['asc','desc']},
    {sName: "Total de partos en Región Sanitaria", sTitle: "Total de partos en Región Sanitaria", bVisible: true, aTargets: [11], asSorting: ['asc','desc']},
    {sName: "Relación Porcentual de la región sanitaria", sTitle: "Relación Porcentual de la región sanitaria", bVisible: true, aTargets: [12], asSorting: ['asc','desc']},
    {sName: "Tipo de Establecimiento", sTitle: "Tipo de Establecimiento", bVisible: true, aTargets: [13], asSorting: ['asc','desc']},
    {sName: "Categoría", sTitle: "Categoría", bVisible: true, aTargets: [14], asSorting: ['asc','desc']},
    {sName: "Internación de neonatología", sTitle: "Internación de neonatología", bVisible: true, aTargets: [15], asSorting: ['asc','desc']},
    {sName: "Consultorio externo", sTitle: "Consultorio externo", bVisible: true, aTargets: [16], asSorting: ['asc','desc']},
    {sName: "Especialidades quirúrgicas", sTitle: "Especialidades quirúrgicas", bVisible: true, aTargets: [17], asSorting: ['asc','desc']},
    {sName: "Especialidades quirúrgicas2", sTitle: "Especialidades quirúrgicas2", bVisible: true, aTargets: [18], asSorting: ['asc','desc']},
    {sName: "Participa Plan Nacer", sTitle: "Participa Plan Nacer", bVisible: true, aTargets: [19], asSorting: ['asc','desc']},
    {sName: "Participa Programa Remediar", sTitle: "Participa Programa Remediar", bVisible: true, aTargets: [20], asSorting: ['asc','desc']},
    {sName: "Participa Programa Nacional de Sangre", sTitle: "Participa Programa Nacional de Sangre", bVisible: true, aTargets: [21], asSorting: ['asc','desc']},
    {sName: "latitud", sTitle: "latitud", bVisible: false, aTargets: [22], asSorting: ['asc','desc']},
    {sName: "longitud", sTitle: "longitud", bVisible: false, aTargets: [23], asSorting: ['asc','desc']},
    {sName: "Nivel de zoom", sTitle: "Nivel de zoom", bVisible: false, aTargets: [24], asSorting: ['asc','desc']},
    {sName: "Comentario/ especialidades", sTitle: "Comentario/ especialidades", bVisible: true, aTargets: [25], asSorting: ['asc','desc']},
    {sName: "Hospital, asociado a", sTitle: "Hospital, asociado a", bVisible: true, aTargets: [26], asSorting: ['asc','desc']},
    {sName: "Hospital", sTitle: "Hospital", bVisible: true, aTargets: [27], asSorting: ['asc','desc']}
  ]
};

window.maps = {};

var SMA = {
	view: 'map',

	layers: {
		barrios: {},
  		es: {},
  		hospitales: {},
  		cesacs: {},
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

var map;
var es_layer;
var barrios_layer;
var hospitales_layer;
var cesacs_layer;

var hospitales_marker = [];
var cesacs_marker = [];

var infoBubble = new google.maps.InfoWindow();

/////////////////////////////////////////////////////////////////////
// Maps
/////////////////////////////////////////////////////////////////////

function initializeMap() {	
	// init the map
	map = new google.maps.Map(document.getElementById('map'), {
    	center: avellaneda,
    	zoom: 13,
    	minZoom: 9,
    	mapTypeId: 'roadmap',
    	streetViewControl: false,
//    	styles: mapStyles
  	});

	// Barrios layer
	barrios_layer = new google.maps.FusionTablesLayer({
    	query: {
    		select: 'Poligono',
    		from: barrios_table
  		},
    	styles: [{
      		polygonOptions: {
        		fillColor: "#1e90ff",     // Color del plano - #ff0000 rojo de Google.
        		fillOpacity: 0.5,         // Opacidad del plano
        		strokeColor: "#000000",   // Color del margen
        		strokeOpacity: 0.5,       // Opacidad del margen
        		strokeWeight: 1           // Grosor del margen
      		}
    	},
    	{
    		where: "'NOMBRE DEL BARRIO' = 'Lujan \"Villa Lujan\"'",
    		polygonOptions: {
      			fillColor: "#ffa500",
        		fillOpacity: 3,         // Opacidad del plano
        		strokeOpacity: 1,       // Opacidad del margen
        		strokeWeight: 2           // Grosor del margen
    		} 
    	}
    	],
       	map: map,
		suppressInfoWindows: true
    });
	barrios_layer.setMap(map);

	// Partido de Avellaneda.
  	var everything = [[-90, -90], [-90, 90], [90, -90], [-90, -90]];

  	var barrio_de_avellaneda = new google.maps.Polygon({
    	paths: [SMA.arrayToPoints(window.barrio_de_avellaneda)],
    	strokeWeight: 0.5,
    	strokeOpacity: 0.3,
    	fillColor: "#9acd32", /* Verde */
    	fillOpacity: 0.2,
    	clickable: false
  	});

  	barrio_de_avellaneda.setMap(map);



	// About box Villa Lujan...
	var marker = new google.maps.Marker({
		map: map,
		draggable: true,
		// A point in Rio de La Plata.
		position: new google.maps.LatLng(-34.635404,-58.30238),
		visible: true
	});

	var boxText = document.createElement("div");
	boxText.style.cssText = "border: 1px solid gray; margin-top: 8px; background: white; padding: 5px;";
	boxText.innerHTML = 
		'<strong><span style="font-size:90%;">Unidad Sanitaria 11,<br>&nbsp;&nbsp;Villa Luján, 2012</span></strong>'+
		'<br />'+
		'<ul style="font-size:85%;">'+
		'<li>'+
		'<strong>126</strong> mujeres realizaron su primer control prenatal'+
		'</li>'+
		'<li>'+
		'edad promedio: <strong>23 años</strong>'+
		'<br />'+
		'<li>'+
		'semana de gestación en la 1ra visita:'+
		'</li>'+
		'<strong>34%</strong> en el 1er trimestre (lo recomendado)'+
		'<br />'+
		'<strong>52%</strong> en el 2do trimestre (situación delicada)'+
		'<br />'+
		'<strong>14%</strong> en el 3er trimestre (riesgoso)'+
		'<br />'+
		'<li>'+
		'<strong>27%</strong> tenían menos de <strong>20 años y</strong> casi la mitad ya había tenido un embarazo anterior.'+
		'</li>'+
		'<strong>32,5%</strong> habían tenido al menos un <strong>aborto</strong> previo a este embarazo.'+
		'</ul>';

	var boxOptions = {
		content: boxText,
		disableAutoPan: false,
		maxWidth: 0,
		pixelOffset: new google.maps.Size(-140, 0),
		zIndex: null,
		boxStyle: { 
//			background: "url('/images/tipbox.gif') no-repeat",
			opacity: 0.75,
			width: "220px"
		},
		closeBoxMargin: "10px 2px 2px 2px",
		closeBoxURL: "/images/close.gif",
		infoBoxClearance: new google.maps.Size(1, 1),
		isHidden: false,
		pane: "floatPane",
		enableEventPropagation: false
	};

	google.maps.event.addListener(marker, "click", function (e) {
		ib.open(map, this);
	});

	var ib = new InfoBox(boxOptions);
	ib.open(map, marker);
	marker.setMap(null);


    google.maps.event.addDomListener(document.getElementById('barrios_map'),
        'click', function() {
        	if (document.getElementById('barrios_map').checked) {
				barrios_layer.setMap(map);
    		} 
    		else {
    			barrios_layer.setMap(null);
			}    
    });

	// Call filter functions on click action
    google.maps.event.addDomListener(document.getElementById('hospitales_map'),
        'click', function() {
        	if (document.getElementById('hospitales_map').checked) {
        		//createMarker(hospitales_rows, 'hospitales');
        		createEntities('hospitales', hospitales_cols, hospitales_rows);
        	}
        	else {
        		for (var i=0; i<hospitales_marker.length; i++) {
  					hospitales_marker[i].setMap(null);
  				}
        	}
    });
    
    google.maps.event.addDomListener(document.getElementById('cesacs_map'),
        'click', function() {
        	if (document.getElementById('cesacs_map').checked) {
        		//createMarker(cesacs_rows, 'cesacs');
				createEntities('cesacs', cesacs_cols, cesacs_rows);
        	}
        	else {
        		for (var i=0; i<cesacs_marker.length; i++) {
  					cesacs_marker[i].setMap(null);
  				}
        	}
   	});

	// InfoWindow for barrios.
	google.maps.event.addListener(this.barrios_layer, 'click', function(e) {
    	var content =	
    		'<ul id="myTab" class="nav nav-tabs">'+ 
    			'<li  class="active">'+ 
    				'<a href="#info" data-toggle="tab">'+ 
			  		'<img src="/images/barrio_24.png" width="24" height="24" />'+ 
			  		'<strong>&nbsp;' + e.row['NOMBRE DEL BARRIO'].value + '</strong></a>'+ 
			  	'</li>' + 
  				'<li><a href="#more" data-toggle="tab">'+ 
  					'ver más &raquo;</a>'+ 
  				'</li>'+ 
			'</ul>'+ 
			'<div id="myTabContent" class="tab-content">'+ 
				'<div class="tab-pane fade in active" id="info">'+ 
				'<table style="font-size:83%">'+
				'<tr><td><strong>OTRO NOMBRE DEL BARRIO:</strong></td>'+
				'<td>' + e.row['OTRO NOMBRE DEL BARRIO'].value + '</td></tr>'+
				'<tr><td><strong>PARTIDO:</strong></td>'+
				'<td>' + e.row['PARTIDO'].value + '</td></tr>'+
				'<tr><td><strong>LOCALIDAD:</strong></td>'+
				'<td>' + e.row['LOCALIDAD'].value + '</td></tr>'+
				'<tr><td><strong>AÑO DE CONFORMACIÓN DEL BARRIO:</strong></td>'+
				'<td>' + e.row['AÑO DE CONFORMACIÓN DEL BARRIO'].value + '</td></tr>'+
				'<tr><td><strong>MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO:</strong></td>'+
				'<td>' + e.row['MODALIDAD EN LA QUE SE CONSTITUYÓ EL BARRIO'].value + '</td></tr>'+
				'<tr><td><strong>AÑO DE MAYOR CRECIMIENTO:</strong></td>'+
				'<td>' + e.row['AÑO DE MAYOR CRECIMIENTO'].value + '</td></tr>'+
				'<tr><td><strong>NRO DE FAMILIAS:</strong></td>'+
				'<td>' + e.row['NRO DE FLIAS'].value + '</td></tr>'+
				'</table>'+
                '</div>'+ 
				'<div class="tab-pane fade" id="more">'+ 
                '<p>'+
                '---' + 
                '</p>'+ 
                '</div>'+ 
            '</div>';

		infoBubble.setPosition(e.latLng);
		infoBubble.setContent(content);
        infoBubble.open(map);

    	google.maps.event.addListener(infoBubble, 'domready', function () {
			$('#myTab a').click(function (e) {
  				e.preventDefault();
  				$(this).tab('show');
			});
		});
   });

	// Read fusion tables data...
    var query = 'SELECT * FROM ' + barrios_table;
	fetchData(query, onBarriosDataFetched);

    var query = "SELECT * FROM " + es_table + " WHERE 'Hospital' = 'X'";
	fetchData(query, onHospitalesDataFetched);

    var query = "SELECT * FROM " + es_table + " WHERE 'Hospital' NOT EQUAL TO 'X'";
	fetchData(query, onCesacsDataFetched);

// 	var tables = $.fn.dataTable.fnTables(true);
// 	$(tables).each(function () {
//     	$(this).dataTable().fnDestroy();
// 	});
	
	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

    $('#map').show();	

	showViewType('map');
}

function createMarker(entities, data_type) {
    var image;
    var shadow;
    var lat_lng;
    var title;
    var content;

    if (data_type == 'hospitales') {
		image = new google.maps.MarkerImage('/images/hospital_32.png');
		shadow = new google.maps.MarkerImage('/images/shadow-hospital_32.png');
		
    } // cesacs
    else {
		image = new google.maps.MarkerImage('/images/cesac_32.png');
		shadow = new google.maps.MarkerImage('/images/shadow-cesac_32.png');
	}

	for (var i=0; i<entities.length; i++) {
//    for (var i in data_rows) {
//    	lat_lng = new google.maps.LatLng(data_rows[i][22], data_rows[i][23]);
//		title = data_rows[i][0];
		var entity = entities[i];
		console.log("entity.latLng = " + entity.latLng);
		console.log("entity Elemente " + entity.attr["Nombre"].value);
		var marker = new google.maps.Marker({
			position: entity.latLng,
        	map: map,
        	icon: image,
        	shadow: shadow,
        	title: title,
        	content: " ",
        	animation: google.maps.Animation.DROP
    	});
    	marker.setZIndex(google.maps.Marker.MAX_ZINDEX - i);
    	
    	if (data_type == 'hospitales') {
    		hospitales_marker.push(marker);
    	}
    	else {
    		cesacs_marker.push(marker);    	
    	} 

    	// InfoInfo for hospitales and cesacs.
		google.maps.event.addListener(marker, 'click', function(event) {
			//infoBubble.close();
//        	var content = "Content not found :(";
        	infoBubble.setPosition(event.latLng);

//     		if (data_type == 'hospitales') {
// 				for (var i=0; i<hospitales_entities.length; i++) {
// 					console.log("i = " + i + " " + hospitales_entities[i].latLng + "  " + event.latLng); 
// 					if (hospitales_entities[i].latLng.equals(event.latLng)) {
// 						console.log("Found for " + hospitales_entities[i].latLng);
// 						content = hospitales_entities[i].infoBubbleContent;
// 						break;			
// 					}
// 				}
//     		}
//     		else {
// 				for (var i=0; i<cesacs_entities.length; i++) {
// 					console.log("i = " + i + " " + cesacs_entities[i].latLng + "  " + event.latLng); 
// 					if (cesacs_entities[i].latLng.equals(event.latLng)) {
// 						console.log("Found for " + cesacs_entities[i].latLng);
// 						content = cesacs_entities[i].infoBubbleContent;
// 						break;
// 					}
// 				}
//     		}

            infoBubble.setContent(marker.content);
            infoBubble.open(map);

			google.maps.event.addListener(infoBubble, 'domready', function () {
        		$("#tabs-bubble").tabs();
    		});
        });    	
    }
}

/////////////////////////////////////////////////////////////////////
// Data
/////////////////////////////////////////////////////////////////////

function fetchData(query, onDataFetched) {
	// Construct a query to get data from a Fusion Table
	var queryUrl = encodeURI(queryUrlHead + query + queryUrlTail);

    // Send the JSONP request using jQuery
    $.ajax({
    	url: queryUrl,
    	dataType: 'jsonp',
        error: function() {alert("fetchData(): Error in query: " + queryUrl ); },
        success: onDataFetched
    });
}

function onBarriosDataFetched(data) {
	barrios_cols = data.table.cols;
	var cols = COLUMNS['barrios'];
	barrios_rows = data.table.rows;

	var barriosTable = $('#barrios_table').dataTable( {
		sDom: 'T<"clear">lfip<"clear">rtS<"clear">ip<"clear">',
      	bJQueryUI: false,
      	sScrollY: '100%',
      	sScrollX: '100%',
    	bAutoWidth: false,
    	bProcessing: true,
    	bDeferRender: true,
    	sPaginationType: "full_numbers",
      	aoColumnDefs: cols,
      	aaData: barrios_rows,
      	aaSorting: [[ 1, "asc" ]],
      	aLengthMenu: [[25, 50], [25, 50]],
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
    // Create entities.
//	barrios_entities = createEntities('barrios', barrios_cols, barrios_rows);
}

function onHospitalesDataFetched(data) {
	hospitales_cols = data.table.cols;
	var cols = data.table.cols;
//	var cols = COLUMNS['es'];
	hospitales_rows = data.table.rows;

	var hospitalesTable = $('#hospitales_table').dataTable( {
		sDom: 'T<"clear">lfip<"clear">rtS<"clear">ip<"clear">',
      	bJQueryUI: false,
      	sScrollY: '100%',
      	sScrollX: '100%',
    	bAutoWidth: false,
    	bProcessing: true,
    	bDeferRender: true,
    	sPaginationType: "full_numbers",
      // Table columns
      "aoColumnDefs": [
        { "bVisible": true, "sTitle": cols[0], "aTargets": [0] },
        { "bVisible": true, "sTitle": cols[1], "aTargets": [1] },
        { "bVisible": true, "sTitle": cols[2], "aTargets": [2] },
        { "bVisible": true, "sTitle": cols[3], "aTargets": [3] },
        { "bVisible": true, "sTitle": cols[4], "aTargets": [4] },
        { "bVisible": true, "sTitle": cols[5], "aTargets": [5] },
        { "bVisible": true, "sTitle": cols[6], "aTargets": [6] },
        { "bVisible": true, "sTitle": cols[7], "aTargets": [7] },
        { "bVisible": true, "sTitle": cols[8], "aTargets": [8] },
        { "bVisible": true, "sTitle": cols[9], "aTargets": [9] },
        { "bVisible": true, "sTitle": cols[10], "aTargets": [10] },
        { "bVisible": true, "sTitle": cols[11], "aTargets": [11] },
        { "bVisible": true, "sTitle": cols[12], "aTargets": [12] },
        { "bVisible": true, "sTitle": cols[13], "aTargets": [13] },
        { "bVisible": true, "sTitle": cols[14], "aTargets": [14] },
        { "bVisible": true, "sTitle": cols[15], "aTargets": [15] },
        { "bVisible": true, "sTitle": cols[16], "aTargets": [16] },
        { "bVisible": true, "sTitle": cols[17], "aTargets": [17] },
        { "bVisible": true, "sTitle": cols[18], "aTargets": [18] },
        { "bVisible": true, "sTitle": cols[19], "aTargets": [19] },
        { "bVisible": true, "sTitle": cols[20], "aTargets": [20] },
        { "bVisible": true, "sTitle": cols[21], "aTargets": [21] },
        { "bVisible": false, "sTitle": cols[22], "aTargets": [22] },
        { "bVisible": false, "sTitle": cols[23], "aTargets": [23] },
        { "bVisible": false, "sTitle": cols[24], "aTargets": [24] },
        { "bVisible": true, "sTitle": cols[25], "aTargets": [25] },
        { "bVisible": true, "sTitle": cols[26], "aTargets": [26] },
        { "bVisible": true, "sTitle": cols[26], "aTargets": [27] }
      ],
      	aaData: hospitales_rows,
      	aLengthMenu: [[25, 50], [25, 50]],
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

    // Create entities.
    hospitales_entities = createEntities('hospitales', hospitales_cols, hospitales_rows);
    // Init setting of all markers.
//    createMarker(hospitales_entities, 'hospitales');
}

function onCesacsDataFetched(data) {
	cesacs_cols = data.table.cols;
	var cols = data.table.cols;
//	var cols = COLUMNS['es'];
	cesacs_rows = data.table.rows;

	var cesacsTable = $('#cesacs_table').dataTable( {
		sDom: 'T<"clear">lfip<"clear">rtS<"clear">ip<"clear">',
      	bJQueryUI: false,
      	sScrollY: '100%',
      	sScrollX: '100%',
    	bAutoWidth: false,
    	bProcessing: true,
    	bDeferRender: true,
    	sPaginationType: "full_numbers",
      // Table columns
      "aoColumnDefs": [
        { "bVisible": true, "sTitle": cols[0], "aTargets": [0] },
        { "bVisible": true, "sTitle": cols[1], "aTargets": [1] },
        { "bVisible": true, "sTitle": cols[2], "aTargets": [2] },
        { "bVisible": true, "sTitle": cols[3], "aTargets": [3] },
        { "bVisible": true, "sTitle": cols[4], "aTargets": [4] },
        { "bVisible": true, "sTitle": cols[5], "aTargets": [5] },
        { "bVisible": true, "sTitle": cols[6], "aTargets": [6] },
        { "bVisible": true, "sTitle": cols[7], "aTargets": [7] },
        { "bVisible": true, "sTitle": cols[8], "aTargets": [8] },
        { "bVisible": true, "sTitle": cols[9], "aTargets": [9] },
        { "bVisible": true, "sTitle": cols[10], "aTargets": [10] },
        { "bVisible": true, "sTitle": cols[11], "aTargets": [11] },
        { "bVisible": true, "sTitle": cols[12], "aTargets": [12] },
        { "bVisible": true, "sTitle": cols[13], "aTargets": [13] },
        { "bVisible": true, "sTitle": cols[14], "aTargets": [14] },
        { "bVisible": true, "sTitle": cols[15], "aTargets": [15] },
        { "bVisible": true, "sTitle": cols[16], "aTargets": [16] },
        { "bVisible": true, "sTitle": cols[17], "aTargets": [17] },
        { "bVisible": true, "sTitle": cols[18], "aTargets": [18] },
        { "bVisible": true, "sTitle": cols[19], "aTargets": [19] },
        { "bVisible": true, "sTitle": cols[20], "aTargets": [20] },
        { "bVisible": true, "sTitle": cols[21], "aTargets": [21] },
        { "bVisible": false, "sTitle": cols[22], "aTargets": [22] },
        { "bVisible": false, "sTitle": cols[23], "aTargets": [23] },
        { "bVisible": false, "sTitle": cols[24], "aTargets": [24] },
        { "bVisible": true, "sTitle": cols[25], "aTargets": [25] },
        { "bVisible": true, "sTitle": cols[26], "aTargets": [26] },
        { "bVisible": true, "sTitle": cols[26], "aTargets": [27] }
      ],
      	aaData: cesacs_rows,
      	aLengthMenu: [[25, 50], [25, 50]],
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

    // Create entities.
    cesacs_entities = createEntities('cesacs', cesacs_cols, cesacs_rows);
    // Init setting of all markers.
//    createMarker(cesacs_entities, 'cesacs');
}

function createEntities(data_type, cols, rows) {
	var entities = [];
	var entity = {
        latLng: null,	// Used as id (key) for identification.
        attr: [],
        infoBubbleContent: null
    };

    var image;
    var shadow;
    var latLng;
    var image_html;

	var isES = false;
	if (data_type == 'hospitales' || data_type == 'cesacs') {
		isES = true;
    	
    	if (data_type == 'hospitales') {
			image = new google.maps.MarkerImage('/images/hospital_32.png');
			shadow = new google.maps.MarkerImage('/images/shadow-hospital_32.png');
			image_html = '<img src="/images/hospital_64.png" width="24" height="24" />'
    	} // cesacs
    	else {
			image = new google.maps.MarkerImage('/images/cesac_32.png');
			shadow = new google.maps.MarkerImage('/images/shadow-cesac_32.png');
			image_html = '<img src="/images/cesac_64.png" width="24" height="24" />'
		}
	}
	
	for (var i=0; i<rows.length; i++) {
			if (isES) {
//				entity.latLng = new google.maps.LatLng(rows[i][22], rows[i][23]);
				latLng = new google.maps.LatLng(rows[i][22], rows[i][23]);
			}
			for (var k in cols) {
    			entity.attr[cols[k]] = { value: rows[i][k] };
    		}
			// Get InfoWindow content

    	var content =	
    		'<ul id="myTab" class="nav nav-tabs">'+ 
    			'<li  class="active">'+ 
    				'<a href="#info" data-toggle="tab">'+ 
			  		image_html + 
			  		'<strong>&nbsp;' + rows[i][0] + '</strong></a>'+ 
			  	'</li>' + 
  				'<li><a href="#more" data-toggle="tab">'+ 
  					'ver más &raquo;</a>'+ 
  				'</li>'+ 
			'</ul>'+ 
			'<div id="myTabContent" class="tab-content">'+ 
				'<div class="tab-pane fade in active" id="info">'+ 
				'<table style="font-size:83%">'+
				'<tr><td><strong>Dirección:</strong></td>'+
				'<td>' + rows[i][1] + '</td></tr>'+
				'<tr><td><strong>Código Postal:</strong></td>'+
				'<td>' + rows[i][2] + '</td></tr>'+
				'<tr><td><strong>Localidad:</strong></td>'+
				'<td>' + rows[i][3] + '</td></tr>'+
				'<tr><td><strong>Departamento:</strong></td>'+
				'<td>' + rows[i][4] + '</td></tr>'+
				'<tr><td><strong>Provincia:</strong></td>'+
				'<td>' + rows[i][5] + '</td></tr>'+
				'<tr><td><strong>Teléfono:</strong></td>'+
				'<td>' + rows[i][6] + '</td></tr>'+
				'<tr><td><strong>Teléfono 2:</strong></td>'+
				'<td>' + rows[i][7] + '</td></tr>'+
				'</table>'+
                '</div>'+ 
				'<div class="tab-pane fade" id="more">'+ 
				'<table style="font-size:83%">'+
				'<tr><td><strong>Código SISA:</strong></td>'+
				'<td>' + rows[i][8] + '</td></tr>'+
				'<tr><td><strong>Cantidad de partos en 2011:</strong></td>'+
				'<td>' + rows[i][10] + '</td></tr>'+
				'<tr><td><strong>Tipo de Establecimiento:</strong></td>'+
				'<td>' + rows[i][13] + '</td></tr>'+
				'<tr><td><strong>Categoría:</strong></td>'+
				'<td>' + rows[i][14] + '</td></tr>'+
				'<tr><td><strong>Participa Plan Nacer:</strong></td>'+
				'<td>' + rows[i][19] + '</td></tr>'+
				'<tr><td><strong>Comentario/ especialidades:</strong></td>'+
				'<td>' + rows[i][25] + '</td></tr>'+
				'</table>'+
                '</div>'+ 
            '</div>';
			
			var marker = new google.maps.Marker({
				position: latLng,
        		map: map,
        		icon: image,
        		shadow: shadow,
        		title: rows[i][0],
        		content: content,
        		animation: google.maps.Animation.DROP
    		});
    		marker.setZIndex(google.maps.Marker.MAX_ZINDEX - i);
    	
    		if (data_type == 'hospitales') {
    			hospitales_marker.push(marker);
    		}
    		else {
    			cesacs_marker.push(marker);    	
    		} 

			bindInfoWindow(marker, map, infoBubble, content);
		        	
        	//entities.push(entity);
	}
	return entities;
}

function bindInfoWindow(marker, map, infowindow, content_html) {
	google.maps.event.addListener(marker, 'click', function(event) {
    	infoBubble.setPosition(event.latLng);
        infoBubble.setContent(content_html);
        infoBubble.open(map);

		google.maps.event.addListener(infoBubble, 'domready', function () {
			$('#myTab a').click(function (e) {
  				e.preventDefault();
  				$(this).tab('show');
			})
    	});
    });
} 

function showViewType(view_type) {
	if (view_type == 'map') {
		document.getElementById("map_views").style.display = "block";
		document.getElementById("table_views").style.display = "none";
		document.getElementById("form_views").style.display = "none";
		document.getElementById("request_views").style.display = "none";
	}
	
	if (view_type == 'table') {
		document.getElementById("table_views").style.display = "block";
		document.getElementById("map_views").style.display = "none";
		document.getElementById("form_views").style.display = "none";
		document.getElementById("request_views").style.display = "none";
	}
	
	if (view_type == 'form') {
		document.getElementById("form_views").style.display = "block";
		document.getElementById("table_views").style.display = "none";
		document.getElementById("map_views").style.display = "none";
		document.getElementById("request_views").style.display = "none";
	}

	if (view_type == 'request') {
		document.getElementById("request_views").style.display = "block";
		document.getElementById("form_views").style.display = "none";
		document.getElementById("table_views").style.display = "none";
		document.getElementById("map_views").style.display = "none";
	}	
}

/////////////////////////////////////////////////////////////////////
// Tables
/////////////////////////////////////////////////////////////////////

function showTable(table) {
	switch(table) {
		case "hospitales_table":
			$('#table_hospitales').show();
			$('#table_cesacs').hide();
			$('#table_barrios').hide();

    		// Workaround for actualizing column widths (same as row data).
    		$('#hospitales_table_next').click();
 			$('#hospitales_table_previous').click();
		break;
		
		case "cesacs_table":
			$('#table_cesacs').show();
			$('#table_hospitales').hide();
			$('#table_barrios').hide();

    		// Workaround for actualizing column widths (same as row data).
    		$('#cesacs_table_next').click();
 			$('#cesacs_table_previous').click();
		break;
		
		case "barrios_table":
			$('#table_barrios').show();
			$('#table_hospitales').hide();
			$('#table_cesacs').hide();

    		// Workaround for actualizing column widths (same as row data).
    		$('#barrios_table_next').click();
 			$('#barrios_table_previous').click();
		break;

		default:
			$('#table_hospitales').show();
			$('#table_cesacs').hide();
			$('#table_barrios').hide();

    		// Workaround for actualizing column widths (same as row data).
    		$('#hospitales_table_next').click();
 			$('#hospitales_table_previous').click();
	}		
					
	return false;
}

/////////////////////////////////////////////////////////////////////
// Menue steering selectors
/////////////////////////////////////////////////////////////////////

  $('.view_selector a[href="#view=form_embarazo"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();
	
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

	$('#form_embarazo').show();
    SMA.view = 'form';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=form_internacion_durante"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

	$('#form_internacion_durante').show();
    SMA.view = 'form';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=form_parto"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

	$('#form_parto').show();
    SMA.view = 'form';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=form_internacion_despues"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

	$('#form_internacion_despues').show();
    SMA.view = 'form';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=form_menores"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();
	
	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

	$('#form_menores').show();
    SMA.view = 'form';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=requests_embarazo"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_menores').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();

	$('#requests_embarazo').show();
    SMA.view = 'request';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=requests_internacion_durante"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_menores').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();

	$('#requests_internacion_durante').show();
    SMA.view = 'request';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=requests_parto"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

	$('#requests_parto').show();
    SMA.view = 'request';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=requests_internacion_despues"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_menores').hide();

	$('#requests_internacion_despues').show();
    SMA.view = 'request';
    showViewType(SMA.view);
  });

  $('.view_selector a[href="#view=requests_menores"]').click(function() {
    $('#map').hide();	

    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();

	$('#requests_menores').show();
    SMA.view = 'request';
    showViewType(SMA.view);
  });

	// Map view
  $('.view_selector a[href="#view=map"]').click(function() {
    $('#table_hospitales').hide();
	$('#table_cesacs').hide();
	$('#table_barrios').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

    $('#map').show();
    SMA.view = 'map';
    showViewType(SMA.view);
  });

// Table view
  $('.view_selector a[href="#view=table"]').click(function() {
    $('#map').hide();

	$('#form_embarazo').hide();
	$('#form_internacion_durante').hide();
	$('#form_parto').hide();
	$('#form_internacion_despues').hide();
	$('#form_menores').hide();

	$('#requests_embarazo').hide();
	$('#requests_internacion_durante').hide();
	$('#requests_parto').hide();
	$('#requests_internacion_despues').hide();
	$('#requests_menores').hide();

    SMA.view = 'table';
    showViewType(SMA.view);
	$('#hospitales_table_select').attr('checked', true);		
	showTable('hospitales_table');
  });


$(document).ready(function() {
//	console.log("document ready()...");

});