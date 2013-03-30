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
  	:es      => '1srzoUc6ovddAOlLSYRRxZdF41Z6nLwxYnFFF7rM'.to_sym,
  	:hospitales	=> '1srzoUc6ovddAOlLSYRRxZdF41Z6nLwxYnFFF7rM'.to_sym,
  	:cesacs	=> '1srzoUc6ovddAOlLSYRRxZdF41Z6nLwxYnFFF7rM'.to_sym,
}

# Respuestas de los formularios (google spreadsheet keys).
RESPUESTAS = {
	# Embarazo y controles prenatales
	:embarazo => "0AphQI4-3PsVcdEtDdi1oRHVzREwtVS1fZEx1c19GTUE",
	# Internación durante el embarazo
	:internacion_durante => "0Asjo1LSXGKxCdDY4VFVjalBOd1owQTd1a1FwcVh4TUE",	
	# Parto
	:parto => "0Asjo1LSXGKxCdFhZUlE4cUpLQWItR3lMMnIyNTQ5MFE",
	# Internación después del parto o durante el puerperio
	:internacion_despues => "0AphQI4-3PsVcdEFWcXJkTlE0MVNDUG01bXE0enBmSWc",	
	# Menores de 20 años, sin embarazo aún
	:menores => "0AphQI4-3PsVcdGhPX0RMTVJYcy1obGFvZ3I5VGVlOGc"
}

#	https://docs.google.com/spreadsheet/pub?key=0AphQI4-3PsVcdEFWcXJkTlE0MVNDUG01bXE0enBmSWc&output=html

#0Asjo1LSXGKxCdDY4VFVjalBOd1owQTd1a1FwcVh4TUE

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

	# generate URLs 
	url_embarazo = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:embarazo] + "&output=html"
	url_internacion_durante = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:internacion_durante] + "&output=html"
	url_parto = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:parto] + "&output=html"
	url_internacion_despues = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:internacion_despues] + "&output=html"
	url_menores = https_docs_google_spreadsheet + "pub?key=" + RESPUESTAS[:menores] + "&output=html"

	# Read content of html pages. 
    doc_embarazo = open(url_embarazo)
	doc_internacion_durante = open(url_internacion_durante) 
    doc_parto = open(url_parto)
	doc_internacion_despues = open(url_internacion_despues) 
	doc_menores = open(url_menores)
	
	# Parse html content.
    @html_content_embarazo = Nokogiri::HTML(doc_embarazo)
    @html_content_internacion_durante = Nokogiri::HTML(doc_internacion_durante)
    @html_content_parto = Nokogiri::HTML(doc_parto)
    @html_content_internacion_despues = Nokogiri::HTML(doc_internacion_despues)
    @html_content_menores = Nokogiri::HTML(doc_menores)

	# Titles
	@title_embarazo = @html_content_embarazo.xpath('//html/head/title').text
	@title_internacion_durante = @html_content_internacion_durante.xpath('//html/head/title').text
	@title_parto = @html_content_parto.xpath('//html/head/title').text
	@title_internacion_despues = @html_content_internacion_despues.xpath('//html/head/title').text
	@title_menores = @html_content_menores.xpath('//html/head/title').text

	TOTAL_LOOKUP = 'td[@class = "s0"]'

	# Evaluate total rows for every table.
 	@total_embarazo = 0
 	@html_content_embarazo.css(TOTAL_LOOKUP).each do |element|
   		@total_embarazo += 1
	end	
	@total_embarazo = 0 if @total_embarazo < 0
	puts @total_embarazo

 	@total_internacion_durante = 0
 	@html_content_internacion_durante.css(TOTAL_LOOKUP).each do |element|
   		@total_internacion_durante += 1
	end
	@total_internacion_durante = 0 if @total_internacion_durante < 0
	puts @total_internacion_durante

 	@total_parto = 0
 	@html_content_parto.css(TOTAL_LOOKUP).each do |element|
   		@total_parto += 1
	end
	@total_parto = 0 if @total_parto < 0
	puts @total_parto

 	@total_internacion_despues = 0
 	@html_content_internacion_despues.css(TOTAL_LOOKUP).each do |element|
   		@total_internacion_despues += 1
	end
	@total_internacion_despues = 0 if @total_internacion_despues < 0
	puts @total_internacion_despues

 	@total_menores = 0
 	@html_content_menores.css(TOTAL_LOOKUP).each do |element|
   		@total_menores += 1
	end
	@total_menores = 0 if @total_menores < 0
	puts @total_menores
	

	# Evaluate total of all testimonios.
	@total_testimonios = @total_embarazo + @total_internacion_durante + @total_parto + @total_internacion_despues + @total_menores
	puts @total_testimonios

	# Retrieve test for website output
	@resp_menores = Array.new
 	@html_content_menores.xpath('//td').each do |element|
		@resp_menores.push element.text if not element.text.empty?
	end

# 	####################################################

  end

  get "/" do
#    erb(:"index")
    erb(:"index_bootstrap")
  end

  get "/contenido/:page" do |page|
    erb(:"contenido/#{page}")
  end

#  get "/barrio/:id" do |id|
#    @barrio = Barrio.where(:id => id).first
#    erb(:"barrio")
#  end
end
