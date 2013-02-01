VERSION = 6.0

all: firefox chrome opera

firefox:
	sed s/__VERSION__/$(VERSION)/ src/firefox/userscript.txt \
	| cat - src/firefox/header.js src/xt.js src/main.js src/firefox/footer.js \
	> bin/firefox/coup_d_bungie.user.js
	
chrome:
	mv src/chrome/manifest.json manifest.json
	sed s/__VERSION__/$(VERSION)/ manifest.json > src/chrome/manifest.json
	cp src/xt.js src/main.js src/chrome
	chrome --pack-extension=$(CURDIR)/src/chrome --pack-extension-key=$(CURDIR)/src/coup-6.pem
	cp manifest.json src/chrome/manifest.json
	mv -f src/chrome.crx bin/chrome/coup_d_bungie.crx
	rm src/chrome/xt.js src/chrome/main.js
	rm manifest.json
	
opera:
	mv -f src/opera/config.xml opera-config.xml
	sed s/__VERSION__/$(VERSION)/ opera-config.xml > src/opera/config.xml
	cat src/opera/userscript.txt src/opera/wrapheader.txt src/xt.js src/main.js src/opera/wrapfooter.txt > src/opera/includes/main.js
	-rm bin/opera/coup_d_bungie.oex
	cd src/opera & ; \
	zip -r ../../bin/opera/coup_d_bungie.oex . -x userscript.txt
	mv -f opera-config.xml src/opera/config.xml