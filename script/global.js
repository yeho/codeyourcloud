
/*==============================
A file to store global variables
==============================*/





var editors = []; //the codemirror editor
var current_file = "";

function editor(){
	for(var i = 0; i < editors.length; i++){
  if(editors[i].id === current_file){
    return editors[i].editor;
  }
 }
}

function add_editor(e, id, welcome){
	
	//creates a new object to store stuff in

	var to_push = {
    	editor: e,
    	id: id,
    	welcome: welcome,
    	title: "",
    	ignore: false
	};
  
	editors.push(to_push);
	current_file = id;
	e.refresh();
}

function getEditor(id){
	//gets an editor by its file id

	for(var i = 0; i < editors.length; i++){
		if(editors[i].id === id){
			return editors[i].editor;
		}
	}
}

function getIndex(id){
	//gets the index of an editor with a given file id
	for(var i = 0; i < editors.length; i++){
		if(editors[i].id === id){
			return i;
		}
	}
}

function getIgnore(id){
	//this prevents issues when collaborating
/*
BEFORE:

A makes a change
The change is detected by B, and made
a change event is fired by B's change, and the change is made AGAIN by A
repeat

AFTER:

A makes a change
The changes is detected by B, made, and "ignore" is turned on
a change event is fired by B's change, the "ignore" is seen, and the change is not pushed
*/
	for(var i = 0; i < editors.length; i++){
		if(editors[i].id === id){
			return editors[i].ignore;
		}
	}
}

function setIgnore(id, ignore){
	for(var i = 0; i < editors.length; i++){
		if(editors[i].id === id){
			editors[i].ignore = ignore;
		}
	}
}

function setFileTitle(id, title){
	//first, set the h4 of the .tab-tab
	editors[getIndex(id)].title = title;
	
	$(".tab-tab[data-fileid='"+id+"']").find("h4").html(title);
	
	check_mode(id, title);
	
	var index = getIndex(id);
	
	if(current_file === id){
		$("#title").val(editors[index].title);
	}

	var t_t = title.toLowerCase();

	if(t_t.indexOf("png") !== -1 || t_t.indexOf(".jpg") !== -1 || t_t.indexOf(".jpeg") !== -1 || t_t.indexOf(".tiff") !== -1 || t_t.indexOf(".gif") !== -1){
		editors[index].image = true;
		if(current_file === id){
			read_image(id);
		}
	}
	
	var j = $("[data-tree-li='"+id+"'] span").html().split(">");
	j[2] = title;
	$("[data-tree-li='"+id+"'] span").html(j.join(">"))
}







var CLIENT_ID = '953350323460-0i28dhkj1hljs8m9ggvm3fbiv79cude6.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/drive.install','https://www.googleapis.com/auth/drive'];

var drive_loaded = false;
var real_loaded = false;
var doc_real;
var current = "";
var text;
var list;
var chats;
var binding;
var title;

var your_session_id = "";
var your_color = "";
var your_user_id = "";
var your_name = "";
var your_photo = "";

var chat_open = false;
var total_chat = 0;

var code;
var logged_in = false;

var converter = new Markdown.Converter();

//[name, codemirror code, file extensions seperated by | ]
var modes = [
	["Javascript","text/javascript","js"],
	["APL","text/apl","apl"],
	["Asterisk","text/x-asterisk",""],
	["C","text/x-csrc","c"],
	["C++","text/x-c++src","cpp|cc|cxx|h|hh|hpp"],
	["C#","text/x-csharp","cs"],
	["Java","text/x-java","java|ino|pde"],
	["Clojure","text/x-clojure","clj"],
	["Cobol","cobol","CBL|COB|cob|cbl"],
	["CoffeeScript","text/x-coffeescript","coffee|cf|cson|Cakefile"],
	["Common Lisp","text/x-common-lisp","cl|lisp|l|lsp"],
	["CSS","text/css","css"],
	["SCSS","text/x-scss","scss"],
	["LESS","text/x-less","less"],
	["Cypher","application/x-cypher-query","cql|cypher"],
	["Python","text/x-python","py"],
	["Cython","text/x-cython","pyx|pyd"],
	["D","text/x-d","d|di"],
	["Django","text/x-django",""],
	["Diff","text/x-diff","diff"],
	["DTD","application/xml-dtd","dtd"],
	["Dylan","text/x-dylan","dylan"],
	["ECL","text/x-ecl","ecl"],
	["Eiffel","text/x-eiffel","eiffel"],
	["Erlang","text/x-erlang","erl|hrl"],
	["Fortan","text/x-Fortran","f90|f95|f03|f|for"],
	["OCaml","text/x-ocaml","ml|mli"],
	["F#","text/x-fsharp","fs|fsi"],
	["Gas","text/x-gas","gas"],
	["Gherkin","text/x-feature","feature"],
	["Go","text/x-go","go"],
	["Groovy","text/x-groovy","groovy"],
	["HAML","text/x-haml","haml"],
	["Haskell","text/x-haskell","hs"],
	["Haxe","text/x-haxe","hx"],
	["JSP","application/x-jsp","jsp"],
	["EJS","application/x-ejs","ejs"],
	["ASP.NET","application/x-aspx","asp"],
	["HTML","text/html","html|svg"],
	["HTTP","message/http",""],
	["Jade","text/x-jade","jade"],
	["JSON","application/json","json"],
	["TypeScript","ts|typescript|str","application/typescript"],
	["Julia","text/x-julia","jl"],
	["LiveScript","text/x-livescript","ls"],
	["Lua","text/x-lua","lua"],
	["Markdown","markdown","md|markdown"],
	["Github Markdown","gfm","gfm"],
	["mIRC","text/mirc","mrc"],
	["nginx","text/nginx","conf"],
	["NTriples","text/n-triples","nt"],
	["Octave","text/x-octave","matlab"],
	["Pascal","text/x-pascal","pas|p"],
	["Perl","text/x-perl","pl|pm"],
	["PHP","text/x-php","php"],
	["PHP/HTML","application/x-httpd-php","phtml"],
	["Pig Latin","text/x-pig","pig"],
	["Properties","text/x-properties","properties"],
	["Puppet","text/x-puppet","pp"],
	["Q","text/x-q","q"],
	["R","text/x-rsrc","r"],
	["Ruby","text/x-ruby","rb|ru|gemspec|rake|Guardfile|Rakefile|Gemfile"],
	["Rust","text/x-rustsrc","rs"],
	["Sass","text/x-sass","sass"],
	["Scala","text/x-scala","scala"],
	["Shell","text/x-sh","sh|bash|bashrc"],
	["Scheme","text/x-scheme","scm|rkt"],
	["Sieve","application/sieve","sieve"],
	["Smalltalk","text/x-stsrc",""],
	["Smarty","text/x-smarty","smarty|tpl"],
	["Solr","text/x-solr","solr"],
	["SQL","text/x-sql","sql|pls|plb"],
	["mySQL","text/x-mysql","mysql"],
	["sText","text/x-stex",""],
	["TCL","text/x-tcl","tcl"],
	["LaTex","text/x-stex","tex"],
	["Tiki","tiki","tiki"],
	["Toml","text/x-toml","toml"],
	["Turtle","text/turtle",""],
	["VB.NET","text/x-vb",""],
	["VBScript","text/vbscript","vbs"],
	["Velocity","text/velocity","vm"],
	["Verilog","text/x-verilog","v|vh|sv|svh"],
	["XML","text/html","xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl"],
	["XQuery","application/xquery","xq"],
	["Swift","swift","swift"],
	["Text","text","txt"]
];

var themes = [
	"Code Your Cloud",
	"3024 Day",
	"3024 Night",
	"Ambiance Mobile",
	"Ambiance",
	"Base16 Light",
	"Base16 Dark",
	"Blackboard",
	"Cobalt",
	"Eclipse",
	"Elegant",
	"Erlang Dark",
	"Lesser Dark",
	"Mbo",
	"Mdn Like",
	"Midnight",
	"Monokai",
	"Neat",
	"Night",
	"Paraiso Dark",
	"Paraiso Light",
	"Pastel On Dark",
	"RubyBlue",
	"Solarized",
	"The Matrix",
	"Tomorrow Night Eighties",
	"Twilight",
	"Vibrant Ink",
	"Xq light",
	"Xq dark",
	"Neo"
];

var themes_name = ["code-your-cloud","3024-day", "3024-night", "ambiance-mobile", "ambiance", "base16-light", "base16-dark", "blackboard", "cobalt", "eclipse", "elegant", "erlang-dark", "lesser-dark", "mbo", "mdn-like", "midnight", "monokai", "neat", "night", "paraiso-dark", "paraiso-light", "pastel-on-dark", "rubyblue", "solarized", "the-matrix", "tomorrow-night-eighties", "twilight", "vibrant-ink", "xq-light", "xq-dark", "neo"];

var is_mobile = false;
var real_mobile = false;


var side_open_width = "25%";

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 	is_mobile = true;
 	real_mobile = true;
}

if(window.location.href.indexOf("?mobile=true") !== -1){
	is_mobile = true;
	//spoofing to test mobile
}

if(is_mobile){
	to_mobile();
}

function to_mobile(){
	
	//some UI changes
	is_mobile = true;
	//makes the sidebar larger
}

function from_mobile(){
	side_open_width = "25%";

	//from mobile to desktop
	is_mobile = false;
}

$( window ).resize(function() {
  if($( window ).width() < 700){
	  if(!is_mobile){
		  to_mobile();
	  }
  }
  else{
	  if(is_mobile){
		  from_mobile();
	  }
  }
});


//swipe functions for mobile
var side_open = false;

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;                                                        

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */ 
            if(is_mobile && side_open){
	            close_side();
            }
        } else {
            /* right swipe */
            if(is_mobile && !side_open){
	            open_side();
            }
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */ 
        } else { 
            /* down swipe */
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};


var current = "";
if(window.location.href.indexOf("#") !== -1){
	current = window.location.href.split("#")[1];
}

/*==========
INIT
============*/
var all_saved = false;
var was_error = false;
var were_changes = false;
var is_welcome = false;
var clock;

var init_needed = false;
var init_loaded = false;
var title_loaded = false;

/*==========
SQL/Get info
==========*/
var line_wrap = false;
var line_number = true;

var theme_sql = "monokai";
var auto_save = true;
var auto_save_int = 30000;
			
var sql_loaded = false;
var user_loaded = false;
			
var sql_font = 12;
var autoC = false;

var myRootFolderId;
var myEmail;
var userName;
var userUrl;
var userId;

var user_loaded = false;
var sql_loaded = false;
       
var total_q;
var user_q;
var product_q;

var rec = false;

var bottom_open = false;

var the_console;

var login_sql = 0;

var repl;
var mirror;

var mode_select;
var theme_select;
