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
const CACHE_FLUSH_THRESHOLD = 1000 * 60 * 60 * 24 * 10; // 10 days

var $ = unsafeWindow.$;
var url = unsafeWindow.location.href;
var isSignedIn = unsafeWindow.viewModels.loggedInUserModel().user.showActivity();

XT.init('cdb');

log('debug', {
	jquery: !!$,
	userModel: !!unsafeWindow.viewModels.loggedInUserModel,
	groupModel: !!unsafeWindow.viewModels.onPageGroupModel,
	native_groupId: unsafeWindow.groupId,
	isSignedIn: isSignedIn
})

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
    var groupId = (+unsafeWindow.viewModels.onPageGroupModel().detail.groupId || unsafeWindow.groupId) + '';
    var cacheKey = template('groups.{id}.style', {id: groupId});
    var cacheVal = XT.get(cacheKey, {});
	var forumsCacheKey = template('groups.{id}.forums', {id: groupId});
	var forumsCacheVal = XT.get(forumsCacheKey, []);
	log({id: groupId, key: cacheKey, val: cacheVal});
    if (now - cacheVal.time < CACHE_FLUSH_THRESHOLD)
	{
        $('head').append($('<style/>').attr('type', 'text/css').text(cacheVal.data));
		forumsCacheVal && forumsCacheVal.length && doGroupCustomForums(forumsCacheVal);
	}
    else
    {
        log('cache flush; retrieving style, custom forums');
		doGroupCustomStyle(groupId, true);
    }
	
	$('<a class="btn_blue"/>')
	.css('margin-right', 10).html('').text('Refresh Style')
	.insertBefore('a.btn_createMessage, a.btn_gotoCreateMessage').click(function()
	{
		var $this = $(this);
		doGroupCustomStyle(groupId, 2, function() {
			$this.css({color: 'white', background: '#32CD32'}).attr('class', 'btn_gray');
		}, function() {
			$this.css({color: 'white', background: '#CD32CD'}).attr('class', 'btn_gray');
		});
	});
}
if ($('h1.post_title').text() === 'CSS')
{
	log('css thread detected');
	$('head').append($('<style/>').attr('type', 'text/css').text($('div.body').text()));
	XT.remove(template('groups.{id}.style', {id: unsafeWindow.groupId}));
	if ($('input.isAnnouncement').length)
	{
		$('.btn_submitEdit').click(function()
		{
			log(template('groups.{id}.style', {id: unsafeWindow.viewModels.onPageGroupModel().detail.groupId}), 'deleted on edit');
			XT.remove(template('groups.{id}.style', {id: unsafeWindow.viewModels.onPageGroupModel().detail.groupId}));
		});
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

function doGroupCustomForums(tags, redo)
{
	redo && $('li.cdb.group_forum').remove();
	var forums = tags.map(function(i) { return i.charAt(1).toUpperCase() + i.substr(2); });
	var $li = $('li.group_forum.forum').find('span').text('All Topics').end();
	var isOn = $li.hasClass('on');
	$li.removeClass('on');
	for (var i = 0, c = forums.length; i < c; ++i)
	{
		var $clone = $li.clone().addClass('cdb');
		if (~url.search('tg=%23' + tags[i].substr(1)))
			$clone.addClass('on');
		$clone.children()[0].href += '&tg=' + tags[i].replace('#', '%23');
		$clone.children().children().text(forums[i]);
		$li.after($clone);
	}
	if (isOn && !~url.search('tg=%23'))
		$li.addClass('on');
}

function doGroupCustomStyle(groupId, doForums, callback, errback)
{
	var cacheKey = template('groups.{id}.style', {id: groupId});
	var cacheVal = {};
	var forumsCacheKey = template('groups.{id}.forums', {id: groupId});
	var forumsCacheVal = [];
	unsafeWindow.bungieNetPlatform.forumService.GetTopicsPaged(0, 50, groupId, 0, 0, 32, '', function(tResponse)
	{
		unsafeWindow.bungieNetPlatform.forumService.GetPostAndParent((tResponse.results.filter(function(i) { return i.subject === 'CSS'; })[0] || 0).postId, function(data)
		{
			cacheVal.data = data && data.results[0].body.replace(/&quot;/g, function(m) { return {'&quot;': '"'}[m]; }).replace(/;/g, ' !important;') || null;
			cacheVal.time = Date.now();
			XT.set(cacheKey, cacheVal);
			$('head').append($('<style/>').attr('type', 'text/css').text(cacheVal.data));
			forumsCacheVal = data && data.results[0].tags || null;
			XT.set(forumsCacheKey, forumsCacheVal);
			doForums && doGroupCustomForums(forumsCacheVal, doForums === 2);
			callback && callback();
		}, function() { errback && errback(); XT.set(cacheKey, {data: null, time: now})});
	}, function() { errback && errback(); XT.set(cacheKey, {data: null, time: now})});
}

function template(str, dat)
{
    for (var prop in dat)
        str = str.replace(new RegExp('{' + prop + '}','g'), dat[prop]);
    return str;
}