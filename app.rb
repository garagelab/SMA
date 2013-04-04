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

	# ==========================================================
	# Preparation for request analysis.
	# ==========================================================
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
    html_content_embarazo = Nokogiri::HTML(doc_embarazo)
	html_content_internacion_durante = Nokogiri::HTML(doc_internacion_durante)
    html_content_parto = Nokogiri::HTML(doc_parto)
    html_content_internacion_despues = Nokogiri::HTML(doc_internacion_despues)
    html_content_menores = Nokogiri::HTML(doc_menores)

	# ==========================================================
	# Determine form requests.
	# ==========================================================
	requests_trigger = ['Marca temporal', 'Timestamp']
	@requests_embarazo = Hash.new
	@requests_internacion_durante = Hash.new
	@requests_parto = Hash.new
	@requests_internacion_despues = Hash.new
	@requests_menores = Hash.new

	collect = false
	request_no = 0
	html_content_embarazo.xpath('//td').each do |elem|
		if not elem.text.empty?
			if requests_trigger.any? { |s| s.include?(elem.text) }
				collect = true
			end
			if collect
				break if elem.text == '.'
				@requests_embarazo.store(request_no, elem.text)
				request_no += 1
			end
		end
	end

	collect = false
	request_no = 0
	html_content_internacion_durante.xpath('//td').each do |elem|
		if not elem.text.empty?
			if requests_trigger.any? { |s| s.include?(elem.text) }
				collect = true
			end
			if collect
				break if elem.text == '.'
				@requests_internacion_durante.store(request_no, elem.text)
				request_no += 1
			end
		end
	end
	
	collect = false
	request_no = 0
	html_content_parto.xpath('//td').each do |elem|
		if not elem.text.empty?
			if requests_trigger.any? { |s| s.include?(elem.text) }
				collect = true
			end
			if collect
				break if elem.text == '.'
				@requests_parto.store(request_no, elem.text)
				request_no += 1
			end
		end
	end

	collect = false
	request_no = 0
	html_content_internacion_despues.xpath('//td').each do |elem|
		if not elem.text.empty?
			if requests_trigger.any? { |s| s.include?(elem.text) }
				collect = true
			end
			if collect
				break if elem.text == '.'
				@requests_internacion_despues.store(request_no, elem.text)
				request_no += 1
			end
		end
	end

	collect = false
	request_no = 0
	html_content_menores.xpath('//td').each do |elem|
		if not elem.text.empty?
			if requests_trigger.any? { |s| s.include?(elem.text) }
				collect = true
			end
			if collect
				break if elem.text == '.'
				@requests_menores.store(request_no, elem.text)
				request_no += 1
			end
		end
	end

	# ==========================================================
	# Determine totals of responses and header information (id).
	# ==========================================================
	IS_REQUEST_LOOKUP = 'td[@class = "s0"]'
	responses_embarazo_header = Array.new
	responses_internacion_durante_header = Array.new
	responses_parto_header = Array.new
	responses_internacion_despues_header = Array.new
	responses_menores_header = Array.new

	@tot_responses_embarazo = 0
	@tot_responses_internacion_durante = 0
	@tot_responses_parto = 0
	@tot_responses_internacion_despues = 0
	@tot_responses_menores = 0
	
	html_content_embarazo.css(IS_REQUEST_LOOKUP).each do |elem|
		responses_embarazo_header.push elem.text 
		@tot_responses_embarazo += 1 	
	end
	html_content_internacion_durante.css(IS_REQUEST_LOOKUP).each do |elem|
		responses_internacion_durante_header.push elem.text 
		@tot_responses_internacion_durante += 1 	
	end
	html_content_parto.css(IS_REQUEST_LOOKUP).each do |elem|
		responses_parto_header.push elem.text 
		@tot_responses_parto += 1 	
	end
	html_content_internacion_despues.css(IS_REQUEST_LOOKUP).each do |elem|
		responses_internacion_despues_header.push elem.text 
		@tot_responses_internacion_despues += 1 	
	end
	html_content_menores.css(IS_REQUEST_LOOKUP).each do |elem|
		responses_menores_header.push elem.text 
		@tot_responses_menores += 1 	
	end

	# ==========================================================
	# Determine form responses.
	# ==========================================================
	# First we get the gross amount of existing response data.
	tmp_extract_embarazo = Array.new
	tmp_extract_internacion_durante = Array.new
	tmp_extract_parto = Array.new
	tmp_extract_internacion_despues = Array.new
	tmp_extract_menores = Array.new

	html_content_embarazo.xpath('//td[@class]').each do |elem|
		tmp_extract_embarazo.push elem.text 	
	end

	html_content_internacion_durante.xpath('//td[@class]').each do |elem|
		tmp_extract_internacion_durante.push elem.text 	
	end

	html_content_parto.xpath('//td[@class]').each do |elem|
		tmp_extract_parto.push elem.text 	
	end

	html_content_internacion_despues.xpath('//td[@class]').each do |elem|
		tmp_extract_internacion_despues.push elem.text 	
	end

	html_content_menores.xpath('//td[@class]').each do |elem|
		tmp_extract_menores.push elem.text 	
	end

	# Now we assign the responses to their corresponding header id's.
	@responses_embarazo = Hash.new
	@responses_internacion_durante = Hash.new
	@responses_parto = Hash.new
	@responses_internacion_despues = Hash.new
	@responses_menores = Hash.new

	# embarazo
	collect = false
	for response_id in responses_embarazo_header
		response_data = Hash.new
		for elem in tmp_extract_embarazo
			# Response id was found. Trigger collect indicator and init necessary stuff here.
			if response_id == elem then
				collect = true
				line_no = 1
			end
			next if not collect # Nothing to collect -> go back to inner for-loop head.
			if collect then
				if elem == "." then				
					collect = false
					break
				else
					response_data.store(line_no, elem) if not elem == "."
					line_no += 1	
				end
			end
		end
		@responses_embarazo[response_id] = response_data
	end

	# internacion_durante
	collect = false
	for response_id in responses_internacion_durante_header
		response_data = Hash.new
		for elem in tmp_extract_internacion_durante
			# Response id was found. Trigger collect indicator and init necessary stuff here.
			if response_id == elem then
				collect = true
				line_no = 1
			end
			next if not collect # Nothing to collect -> go back to inner for-loop head.
			if collect then
				if elem == "." then				
					collect = false
					break
				else
					response_data.store(line_no, elem) if not elem == "."
					line_no += 1	
				end
			end
		end
		@responses_internacion_durante[response_id] = response_data
	end

	# parto
	collect = false
	for response_id in responses_parto_header
		response_data = Hash.new
		for elem in tmp_extract_parto
			# Response id was found. Trigger collect indicator and init necessary stuff here.
			if response_id == elem then
				collect = true
				line_no = 1
			end
			next if not collect # Nothing to collect -> go back to inner for-loop head.
			if collect then
				if elem == "." then				
					collect = false
					break
				else
					response_data.store(line_no, elem) if not elem == "."
					line_no += 1	
				end
			end
		end
		@responses_parto[response_id] = response_data
	end

	# internacion_despues
	collect = false
	for response_id in responses_internacion_despues_header
		response_data = Hash.new
		for elem in tmp_extract_internacion_despues
			# Response id was found. Trigger collect indicator and init necessary stuff here.
			if response_id == elem then
				collect = true
				line_no = 1
			end
			next if not collect # Nothing to collect -> go back to inner for-loop head.
			if collect then
				if elem == "." then				
					collect = false
					break
				else
					response_data.store(line_no, elem) if not elem == "."
					line_no += 1	
				end
			end
		end
		@responses_internacion_despues[response_id] = response_data
	end

	# menores
	collect = false
	for response_id in responses_menores_header
		response_data = Hash.new
		for elem in tmp_extract_menores
			# Response id was found. Trigger collect indicator and init necessary stuff here.
			if response_id == elem then
				collect = true
				line_no = 1
			end
			next if not collect # Nothing to collect -> go back to inner for-loop head.
			if collect then
				if elem == "." then				
					collect = false
					break
				else
					response_data.store(line_no, elem) if not elem == "."
					line_no += 1	
				end
			end
		end
		@responses_menores[response_id] = response_data
	end

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
