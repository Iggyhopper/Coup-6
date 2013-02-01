// ==UserScript==
// @include     http*://*.bungie.net/*
// ==/UserScript==
window.addEventListener('DOMContentLoaded', function() {

function wrapper() { if (window.viewModels && !window.viewModels.myFollowedGroupsModelIsLoaded()) setTimeout(wrapper, 100); else {
var XT = (function()
{
    // package
    var api = {};
    
    // private
    var prefix = '';
    
    // public
    api.get = function(name, defval)
    {
        var result = JSON.parse(localStorage.getItem(prefix + name));
        return result !== null ? result : defval;
    };
    
    api.getAll = function(asObject)
    {
        var result = asObject ? {} : [];
        for (var key in localStorage)
            if (key.substr(0, prefix.length) === prefix)
                if (asObject)
                    result[key] = api.get(key.substr(prefix.length));
                else
                    result.push({key: key, value: api.get(key.substr(prefix.length))});
        return result;
    };
    
    api.init = function(name)
    {
        prefix = name + '.';
    };
    
    api.remove = function(name)
    {
        localStorage.removeItem(name);
    };
    
    api.set = function(name, value)
    {
        localStorage.setItem(prefix + name, JSON.stringify(value));
    };
    
    return api;
})();
// unsafeWindow hack for chrome or opera
// breaks unsafeWindow for firefox
if (!window.XULElement)
	unsafeWindow = (function()
	{
		var e = document.createElement('p');
		e.setAttribute('onclick', 'return window;');
		return e.onclick();
	})();
// opera doesn't like anything in the local scope
console = unsafeWindow.console;
localStorage = unsafeWindow.localStorage;

var slice = Array.prototype.slice;
var partial = function(fn, obj) {
	var pargs = slice.call(arguments, obj ? 2 : 1);
	return function() {
		return fn.apply(obj || null, pargs.concat(slice.call(arguments)));
	};
};
var log = partial(console.log, console, 'cdb:');

log('Hello, ' + (window.chrome ? 'Chrome' : window.opera ? 'Opera' : 'Firefox') + '!');

('' + window.chrome + window.opera + window.XULElement).indexOf('[') / 9

const VERSION = '6.0';
const CACHE_FLUSH_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 3 days

var $ = unsafeWindow.$;
var url = unsafeWindow.location.href;
var isSignedIn = unsafeWindow.viewModels.loggedInUserModel().user.showActivity();

XT.init('cdb');

// Group Styling
/*   
     load from localStorage (cache)
     compare time of last http request to now
     if recent, display from cache
     else request new data and display
*/
if (isSignedIn && ~url.search(/\/groups\//i))
{
    var now = Date.now();
    var groupId = unsafeWindow.viewModels.onPageGroupModel().detail.groupId;
    var cacheKey = template('groups.{id}.style', {id: groupId});
    var cacheVal = XT.get(cacheKey, {});
	log({id: groupId, key: cacheKey, val: cacheVal});
    if (now - cacheVal.time < CACHE_FLUSH_THRESHOLD)
        $('head').append($('<style/>').attr('type', 'text/css').text(cacheVal.data));
    else
    {
        log('cache flush; retrieving style');
        unsafeWindow.bungieNetPlatform.forumService.GetTopicsPaged(0, 50, groupId, 0, 0, 32, '', function(tResponse)
        {
            unsafeWindow.bungieNetPlatform.forumService.GetPostAndParent((tResponse.results.filter(function(i) { return i.subject === 'CSS'; })[0] || 0).postId, function(data)
            {
                cacheVal.data = data && data.results[0].body.replace(/&quot;/g, function(m) { return {'&quot;': '"'}[m]; }).replace(/;/g, ' !important;') || null;
                cacheVal.time = now;
                XT.set(cacheKey, cacheVal);
                $('head').append($('<style/>').attr('type', 'text/css').text(cacheVal.data));
            }, function(err) { XT.set(cacheKey, {data: null, time: now}); });
        }, function(err) { log(arguments); });
    }
}
if (~url.search('user/edit'))
{
    $('#AccountSettings > :first').clone().appendTo('#AccountSettings')
	.find('a').attr('href', 'javascript:;').end()
	.find('h3').css('background-color', 'rgba(15, 0, 40, 0.40)').click(function()
	{
		alert('[Phase 1]: Coup\'d Bungie user settings are not implemented yet.');
	}).end()
	.find('.heading').text("Coup'd Bungie").end()
	.find('.description').text('Show who you really are.');
}
else if (~url.search('view/community/groups/admin'))
{
	$('#GroupSettings').clone().appendTo('#container_groupSettings')
	.find('h2').text('Group Design').end()
	.find('ul, a, span').remove().end()
	.append(
		$('<span/>').text('Banner: '),
		$('<input id="cdb_group_banner"/>').css('width', 600),
		'<br/>',
		'<br/>',
		$('<a/>').attr({class: 'btn_blue', href: 'javascript:;'}).text('Preview & Generate').click(function()
		{
			$('#cdb_group_css').val('.identity { background-image: url(' + $('#cdb_group_banner').val() + '); }');
			$('head').append($('<style/>').attr('type', 'text/css').text($('#cdb_group_css').val().replace(';', '!important;')));
		}),
		'<br/>',
		'<br/>',
		'<div class="container_textfield container_textarea floatingLabel hideLabel"><textarea id="cdb_group_css"/></div>'
	);
}

function template(str, dat)
{
    for (var prop in dat)
        str = str.replace(new RegExp('{' + prop + '}','g'), dat[prop]);
    return str;
}

// bnet.forumService.GetTopicsPaged
}} wrapper(); }, false);