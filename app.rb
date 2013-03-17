# encoding: UTF-8

$LOAD_PATH.unshift(File.expand_path("vendor/ft-0.0.3/lib", File.dirname(__FILE__)))

require "sinatra/base"
require "sequel"
require "json"
#require "google_drive"

Tilt.register 'md', Tilt::RDiscountTemplate

DB = Sequel.connect("fusiontables:///")

FusionTables::Connection::URL = URI.parse("http://tables.googlelabs.com/api/query")

TABLES = {
	:barrios => '1_fEVSZmIaCJzDQoOgTY7pIcjBLng1MFOoeeTtYY'.to_sym,
  	#:barrios => '1ePInQ8wuWBsfXcXczd0j3bp7qFFw2v-tXn_g_Rw'.to_sym,
  	:es      => '1srzoUc6ovddAOlLSYRRxZdF41Z6nLwxYnFFF7rM'.to_sym,
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
# 	# Testing google spreadsheet interface.
# 	# require "google_drive"
# 	####################################################
# 
# 	# Log in using simple but insecure method.
# 	# You can also use OAuth. See below and also
# 	# GoogleDrive.login_with_oauth for details.
# 	#session = GoogleDrive.login("username@gmail.com", "mypassword")
# 
# 	# Log in using OAuth.
# 	client = OAuth2::Client.new(
#     			account["oauth2_client_id"],
#     			account["oauth2_client_secret"],
#                 :site => "https://accounts.google.com",
#                 :token_url => "/o/oauth2/token",
#                 :authorize_url => "/o/oauth2/auth")
#     redirect_url = "urn:ietf:wg:oauth:2.0:oob"
#     url = client.auth_code.authorize_url(
#     		:redirect_uri => redirect_url,
#             :scope =>
#             	"https://docs.google.com/feeds/ " +
#                 "https://docs.googleusercontent.com/ " +
#                 "https://spreadsheets.google.com/feeds/")
#     print("Open this URL in Web browser:\n  %s\nPaste authorization code here: " % url)
#     #code = gets().chomp()
#     code = url
#     token = client.auth_code.get_token(code, :redirect_uri => redirect_url)
# 	session = GoogleDrive.login_with_oauth(token)
# 
# 	# Get worksheet for testing
# 	#https://docs.google.com/spreadsheet/ccc?key=0AqnLGJPBUteMdHdlNXBhMmpuOE9TRkJGM21UQWFDbFE
# 	ws = session.spreadsheet_by_key("0AqnLGJPBUteMdHdlNXBhMmpuOE9TRkJGM21UQWFDbFE").worksheets[0]
# 
# # Gets content of A2 cell.
# p ws[2, 1]  #==> "hoge"
# 
# # Changes content of cells.
# # Changes are not sent to the server until you call ws.save().
# ws[2, 1] = "foo"
# ws[2, 2] = "bar"
# ws.save()
# 
# # Dumps all cells.
# for row in 1..ws.num_rows
#   for col in 1..ws.num_cols
#     p ws[row, col]
#   end
# end
# 
# # Yet another way to do so.
# p ws.rows  #==> [["fuga", ""], ["foo", "bar]]
# 
# # Reloads the worksheet to get changes by other clients.
# ws.reload()
	

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
