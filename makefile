VERSION = 6.0

all:

firefox:
	sed s/__VERSION__/${VERSION}/ src/firefox/userscript.txt > header.js
	cat header.js src/xt.js src/main.js >> bin/firefox/coup_d_bungie.user.js
	rm header.js
	
chrome: