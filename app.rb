# encoding: UTF-8

$LOAD_PATH.unshift(File.expand_path("vendor/ft-0.0.3/lib", File.dirname(__FILE__)))

require "sinatra/base"
require "sequel"
require "json"
#require "google_drive"
require "nokogiri"
require "open-uri"
require "table_parser"

Tilt.register 'md', Tilt::RDiscountTemplate

DB = Sequel.connect("fusiontables:///")

FusionTables::Connection::URL = URI.parse("http://tables.googlelabs.com/api/query")

# Google Fusion tables keys.
TABLES = {
	:barrios => '1_fEVSZmIaCJzDQoOgTY7pIcjBLng1MFOoeeTtYY'.to_sym,
  	#:barrios => '1ePInQ8wuWBsfXcXczd0j3bp7qFFw2v-tXn_g_Rw'.to_sym,
  	:es      => '1srzoUc6ovddAOlLSYRRxZdF41Z6nLwxYnFFF7rM'.to_sym,
}

# Respuestas de los formularios (google spreadsheet keys).
RESPUESTAS = {
	:embarazo => "0AphQI4-3PsVcdEtDdi1oRHVzREwtVS1fZEx1c19GTUE",
	:parto => "0Asjo1LSXGKxCdFhZUlE4cUpLQWItR3lMMnIyNTQ5MFE",
	:complicaciones => "0Asjo1LSXGKxCdDY4VFVjalBOd1owQTd1a1FwcVh4TUE",
	:menores_de_20_anos => "0AphQI4-3PsVcdGhPX0RMTVJYcy1obGFvZ3I5VGVlOGc"
}

Barrios = DB[TABLES[:barrios]]
EstablecimientosDeSalud = DB[TABLES[:es]]

class NilClass
  def empty?; true; end
end

class SMA < Sinatra::Base
  helpers do
    def root(path)
      File.expand_path(path, File.dirname(__FILE__))
    end

    include Rack::Utils
    alias_method :h, :escape_html

    def join_cols(row, name)
      row.keys.grep(/^#{name}_\d+$/).map do |key|
        row[key] unless row[key].empty?
      end.compact.join("<br>\n")
    end

    def yesno(value)
      if value == "1" || value == "SI"
        "Sí"
      else
        "No"
      end
    end

    def number_with_delimeter(value)
      #
      # Add thousands separators to numbers.
      #
      value.to_s.gsub(/(\d)(?=(\d\d\d)+(?!\d))/, "\\1.")
    end
  end

  set :app_file, __FILE__

  WWW = /^(https?:\/\/)www\./
  COM = /^(https?:\/\/)(.+?)\.com\.ar/

  before do
    if request.url =~ WWW
      redirect(request.url.sub(WWW, '\1'), 301)
    end

    if request.url =~ COM
      redirect(request.url.sub(COM, '\1\2.org.ar'), 301)
    end

# 	####################################################
# 	# Testing nokogiri HTML-Parser.
# 	# require "nokogiri"
# 	####################################################
	https_docs_google_spreadsheet = "https://docs.google.com/spreadsheet/"

	url_embarazo = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:embarazo] + "&output=html"
	url_parto = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:parto] + "&output=html"
	url_complicaciones = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:complicaciones] + "&output=html"
	url_menores_de_20_anos = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:menores_de_20_anos] + "&output=html"

	# Read content of html pages. 
    doc_embarazo = open(url_embarazo)
    doc_parto = open(url_parto)
	doc_complicaciones = open(url_complicaciones) 
	doc_menores_de_20_anos = open(url_menores_de_20_anos)
	
	# Parse html content.
    @html_content_embarazo = Nokogiri::HTML(doc_embarazo)
    @html_content_parto = Nokogiri::HTML(doc_parto)
    @html_content_complicaciones = Nokogiri::HTML(doc_complicaciones)
    @html_content_menores_de_20_anos = Nokogiri::HTML(doc_menores_de_20_anos)

	# Titles
	@title_embarazo = @html_content_embarazo.xpath('//html/head/title').text
	@title_parto = @html_content_parto.xpath('//html/head/title').text
	@title_complicaciones = @html_content_complicaciones.xpath('//html/head/title').text
	@title_menores_de_20_anos = @html_content_menores_de_20_anos.xpath('//html/head/title').text

	# Evaluate total rows for every table.
 	@total_embarazo = 0
	extract = @html_content_embarazo.xpath("//table[@id='tblMain']")
	extract.search('tr').each do |element|
   		@total_embarazo += 1
	end	
# 	@total_embarazo -= 1 # Subtract table header row.
# 	@total_embarazo = 0 if @total_embarazo < 0

 	@total_parto = 0
 	table_rows = @html_content_parto.css('table#tblMain').each do |element|
   		@total_parto += 1 if element.xpath("/tr")
	end
	@total_parto = 0 if @total_parto < 0

 	@total_complicaciones = 0
 	table_rows = @html_content_complicaciones.css('table#tblMain').each do |element|
   		@total_complicaciones += 1 if element.xpath("/tr")
	end
	@total_complicaciones = 0 if @total_complicaciones < 0

 	@total_menores_de_20_anos = 0
# 	@html_content_menores_de_20_anos.css('table#tblMain') .each do |element|
#	extract = @html_content_complicaciones.xpath("//table[@id='tblMain']")
#	extract = @html_content_complicaciones.css("html body div#content table#tblMain.tblGenFixed")
 	@html_content_menores_de_20_anos.search('table#tblMain', '/tr').each do |element|
#	extract.search('tr').each do |element|
   		@total_menores_de_20_anos += 1
	end
	
	
#	@total_menores_de_20_anos -= 1 # Subtract table header row.
#	@total_menores_de_20_anos = 0 if @total_menores_de_20_anos < 0
	
	# Evaluate total of all testimonios.
	@total_testimonios = @total_embarazo + @total_parto + @total_complicaciones + @total_menores_de_20_anos

# 	####################################################

  end

  get "/" do
    erb(:"index")
  end

  get "/contenido/:page" do |page|
    erb(:"contenido/#{page}")
  end

#  get "/barrio/:id" do |id|
#    @barrio = Barrio.where(:id => id).first
#    erb(:"barrio")
#  end
end
