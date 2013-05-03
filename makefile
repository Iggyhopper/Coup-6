VERSION = 6.1.1

all: firefox chrome opera

all-x: chrome-x firefox-x opera-x

firefox:
	sed s/__VERSION__/$(VERSION)/ src/firefox/userscript.txt \
	| cat - src/firefox/header.js src/xt.js src/main.js src/firefox/footer.js \
	> bin/firefox/coup_d_bungie.user.js
	
chrome:
	mv src/chrome/manifest.json manifest.json
	sed s/__VERSION__/$(VERSION)/ manifest.json > src/chrome/manifest.json
	cat src/firefox/header.js src/main.js src/firefox/footer.js > src/chrome/main.js
	cp src/xt.js src/chrome/xt.js
	chrome --pack-extension=$(CURDIR)/src/chrome --pack-extension-key=$(CURDIR)/src/coup-6.pem
	cd src/chrome & ; \
	zip -r ../../bin/chrome/coup_d_bungie.zip .
	cd ../..
	cp manifest.json src/chrome/manifest.json
	mv -f src/chrome.crx bin/chrome/coup_d_bungie.crx
	rm src/chrome/xt.js src/chrome/main.js
	rm manifest.json
	
opera:
	cp src/opera/index.html bin/src/opera/index.html
	sed s/__VERSION__/$(VERSION)/ src/opera/config.xml > bin/src/opera/config.xml
	cat src/opera/userscript.txt src/opera/wrapheader.txt src/xt.js src/main.js src/opera/wrapfooter.txt > bin/src/opera/includes/main.js
	cd bin/src/opera & ; \
	zip -FSr ../../opera/coup_d_bungie.oex . -x userscript.txt
	
opera-x:
	cp src/opera/index.html bin/src/opera/index.html
	sed s/__VERSION__/$(VERSION)/ src/opera/config.xml > bin/src/opera/config.xml
	cat src/opera/userscript.txt src/xt.js src/main.js > bin/src/opera/includes/main.js
	cd bin/src/opera & ; \
	zip -FSr ../../opera/coup_d_bungie.oex . -x userscript.txt
	
firefox-x:
	sed s/__VERSION__/$(VERSION)/ src/firefox/userscript.txt \
	| cat - src/xt.js src/main.js \
	> bin/firefox/coup_d_bungie.user.js
	
chrome-x:
	cp src/xt.js src/main.js bin/src/chrome
	sed s/__VERSION__/$(VERSION)/ src/chrome/manifest.json > bin/src/chrome/manifest.json
	chrome --pack-extension=$(CURDIR)/bin/src/chrome --pack-extension-key=$(CURDIR)/src/coup-6.pem
	mv -f bin/src/chrome.crx bin/chrome/coup_d_bungie.crx
	cd bin/src/chrome & ; \
	zip -FSr ../../chrome/coup_d_bungie.zip .