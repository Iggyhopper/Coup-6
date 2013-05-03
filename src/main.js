var slice = Array.prototype.slice;
var partial = function(fn, obj) {
	var pargs = slice.call(arguments, obj === undefined ? 2 : 1);
	return function() {
		return fn.apply(obj || null, pargs.concat(slice.call(arguments)));
	};
};

var log = partial(console.log.bind(console), 'cdb:');

if (window.chrome || window.opera)
{
	unsafeWindow = (function()
	{
		var e = document.createElement('p');
		e.setAttribute('onclick', 'return window;');
		return e.onclick();
	})();
}

console =         unsafeWindow.console;
currentRequest =  unsafeWindow.currentRequest || [];
currentRequests = unsafeWindow.currentRequests || [];
localStorage =    unsafeWindow.localStorage;

log(currentRequests.length, 'request(s) to attach listener.');

var debugLog = 'Coup d\'Bungie 6: Nothing to report.';

var triggered = [];

(function(f) {
	if (currentRequests.length)
		currentRequests[currentRequests.length - 1].done(function() { triggered.push('ajax'); f('ajax'); });
	else
		triggered.push('ajax');
	window.addEventListener('load', function() { triggered.push('load'); f('load'); }, false);
	var t = setInterval(function()
	{
		if (unsafeWindow.$('.spinner').length < 4 || ~unsafeWindow.location.href.search(/\/user\/edit/i))
		{
			clearInterval(t);
			triggered.push('auto');
			f('auto');
		}
	}, 500);
})
(function (msg)
{
	if (msg !== 'auto')
		return // if (triggered['load'])
	/*if (msg === triggered[0])
		return log(msg, 'has been triggered; not last event, exiting call');
	else
		log(msg, 'has been triggered; last event, resuming call');
	*/
	var $ = unsafeWindow.$;
	var url = unsafeWindow.location.href;
	var isSignedIn = unsafeWindow.myID_cookie !== 0;
	
	/*if (isSignedIn)
	{
		unsafeWindow.viewModels._unreadMessages = unsafeWindow.viewModels.unreadMessages;
		unsafeWindow.viewModels.unreadMessages = function(n)
		{
			n = n || unsafeWindow.viewModels._unreadMessages(n);
			if (+n) document.title = '(' + n + ') ' + document.title.split(/^\([0-9]+\) /).pop();
		};
		unsafeWindow.viewModels.unreadMessages();
	}*/

	window.addEventListener('keydown', function(ke) {
		if (ke.which === 191 && ke.shiftKey && ke.target.localName !== 'input' && ke.target.localName !== 'textarea')
			uAlert(debugLog);
	}, false);
	
		const VERSION = '__VERSION__';
		const CACHE_FLUSH_THRESHOLD = 1000 * 60 * 60 * 24 * 10; // 10 days

		

		XT.init('cdb');
		
		// Fix page titles.
		if (~url.search(/forum\/topics/i))
			document.title += ' : ' + $('#searchedTag, #searchedTag > span').last().text();
		else if (~url.search(/view\/profile/i))
			document.title += ' : ' + $('h1.displayName > a').text();
	    document.title = document.title.split(' : ').reverse().join(' : ');
		
		if (isSignedIn && false)
		{
			// Add group icons in the "following" menu.
			var followedGroups = unsafeWindow.viewModels.myFollowedGroupsModel();
			//var xtGroupAvatars = XT.get('following.groups.avatars');
			var groupLinks = $('ul.group > li > a:nth-child(odd)');
			for (var i = 0, c = groupLinks.length; i < c; ++i)
			{
				$(template('<img src="{path}"/>', {path: followedGroups[i].detail.avatarImage}))
					.prependTo(groupLinks[i].parentNode);
			}
		}
		
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
			var groupId = unsafeWindow.groupId;
			var cacheKey = template('groups.{id}.style', {id: groupId});
			var cacheVal = XT.get(cacheKey, {});
			var forumsCacheKey = template('groups.{id}.forums', {id: groupId});
			var forumsCacheVal = XT.get(forumsCacheKey, []);
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
		
		// COUP STYLING!
		if (~url.search(/\/groups\/post/i))
		{
			var URL_GET = 'http://iggyhopper.strangled.net/gm/cdb/app/get?ids=';
			var userIDs = {};
			$('a[data-membershipid]').map(function() { userIDs[this.attributes['data-membershipid'].value] = true; });
			var users = [];
			for (var i in userIDs)
				users.push(i);
			console.log(users.join(','));
			$.getJSON(URL_GET + users.join(','), function(result) {
				console.log(arguments);
				for (var user in result) {
					$('img[data-membershipid=' + result[user].uid + ']').attr('src', result[user].avatar);
					console.log($('a[data-membershipid=' + result[user].uid + ']').length);
					$('a[data-membershipid=' + result[user].uid + ']').each(function() {
						this.style.setProperty('color', result[user].color, 'important');
						});
				}
			}, function() {
				console.log(arguments);
			});
		}
		
		if (~url.search(/user\/edit/i))
		{
			var UD_DATA = [
				{
					name: 'Avatar',
					type: 'url',
					info: '',
					key: 'avatar'
				},
				// TODO: Add support for settings groups.
				{
					name: 'Name Color',
					type: 'color',
					info: '',
					key: 'color'
				},
				{
					name: 'Disable Group Styling',
					type: 'option',
					info: '',
					key: 'disable-group-styling',
					val: false
				}
			];
			
			$('#AccountSettings > :first').clone().appendTo('#AccountSettings')
			.find('div.container_form').html('').append(function() {
				var result = [];
				for (var i = 0; i < UD_DATA.length; ++i) {
					result.push(
						$('<label/>').attr({title: UD_DATA[i].info, for: 'coup_ud_' + i}).text(UD_DATA[i].name + ':').get(0),
						UD_DATA[i].type !== 'option'?
							$('<div/>').addClass('container_textbox container_textfield').append(
								$('<input/>').attr({key: UD_DATA[i].key, type: 'text', id: 'coup_ud_' + UD_DATA[i].key})
							).get(0)
						:
							$('<input/>').attr({key: 'unknown', type: 'checkbox', disabled: 'true', id: 'coup_ud_' + key, checked: !!XT.get(UD_DATA[i].key, UD_DATA[i].val)}).click(function()
							{
								XT.set(UD_DATA[i].key, this.value);
							}).get(0)
							
					);
				}
				
				return result;
			}).end()
			.find('a').attr({href: 'javascript:;', id: 'btn_saveCoup'}).end()
			.find('h3').css('background-color', 'rgba(15, 0, 40, 0.40)').click(function()
			{
				$(this).parent().toggleClass('open');
			}).end()
			.find('.heading').text("Coup'd Bungie").end()
			.find('.description').text('Show who you really are.');
			
			$.getJSON('http://iggyhopper.strangled.net/gm/cdb/app/get?ids=' + unsafeWindow.myID_cookie, function(results) {
				console.log(results);
				if (results && results.length) {
					var ud = results[0];
					for (var i in ud)
						$('#coup_ud_' + i).val(ud[i]);
				}
			});
			
			$('#btn_saveCoup').click(function() {
				var $cdb = $(this).parent().parent();
				if (!$cdb.hasClass('open')) return;
				var pd = {};
				$cdb.find('input').each(function() { pd[this.attributes.key.value] = this.value; });
				pd.uid = unsafeWindow.myID_cookie;
				$.post('http://iggyhopper.strangled.net/gm/cdb/app/set', pd, function() { uAlert('Coup published. NOTICE: Your data will not be saved permanently until about 2 days. This is a test. I will be auto-updating daily. Don\'t hurt me.'); });
				console.log('posting..');
			});
		}
		else if (~url.search(/\/groups\/admin/i))
		{
			var GD_DATA = [
				{
					name: 'Avatar',
					type: 'url',
					selector: 'div.identity > a.avatar',
			        style: 'background-image: url({v});',
					size: '180x180'
				},
				{
					name: 'Banner',
					type: 'url',
					selector: 'div.identity',
			        style: 'background-image: url({v});',
					size: '960x165'
				},
				{
					name: 'Display Name',
					type: 'text',
					// TODO: Add functionality for multiple selectors.
					selector: 'h1.displayName > a { visiblity: hidden; }\r\nh1.displayName > a:after',
					style: 'content: "{v}"; visibility: visible; float: left;'
				}
			];
			
			$('#GroupSettings').clone().appendTo('#container_groupSettings')
			.find('h2').text('Group Design').css({backgroundColor: 'rgba(15, 0, 40, 0.4)', padding: '4px'}).end()
			.find('ul, a, span').remove().end()
			.append('<table id="cdb_gdt" style="width: 100%;"/>');
			var $gdt = $('#cdb_gdt');
			for (var i = 0, c = GD_DATA.length; i < c; ++i)
			{
				$gdt.append(template('<tr><td><span title="{size}">{name}: </span></td><td style="width: 100%;"><input style="width: 100%"/></td></tr>',
				{
					name: GD_DATA[i].name.replace(' ', '&nbsp;'),
					size: GD_DATA[i].size
				}));
			}
			$gdt.parent().append(
				$('<a/>').attr({class: 'btn_blue', href: 'javascript:;'}).text('Preview & Generate').click(function()
				{
					var $inputs = $gdt.find('input');
					$('#cdb_group_css')[0].value = '';
					for (var i = 0, c = GD_DATA.length; i < c; ++i)
					{
						$('#cdb_group_css')[0].value += template('{sel} { {css} }\r\n',
						{
							sel: GD_DATA[i].selector,
							css: template(GD_DATA[i].style, {v: $inputs[i].value})
						});
					}
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
			if (!tags) return;
			var forums = tags.map(function(i) { return i.charAt(1).toUpperCase() + i.substr(2); });
			var $li = $('li.group_forum.forum').find('span').text('All Topics').end();
			var isOn = $li.hasClass('on');
			$li.removeClass('on');
			for (var i = 0, c = forums.length; i < c; ++i)
			{
				var $clone = $li.clone().addClass('cdb');
				if (~url.search('tg=%23' + tags[i].substr(1)))
					$clone.addClass('on');
				if ($clone.children().length)
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
			unsafeWindow.bungieNetPlatform.forumService.GetTopicsPaged(0, 10, groupId, 0, 0, 32, '', function(tResponse)
			{
				var i = 0;
				for (var c = tResponse.results.length; i < c; ++i)
					if (tResponse.results[i].subject === 'CSS')
						break;
				if (!tResponse.results[i])
					return XT.set(cacheKey, {data: null, time: now}) + XT.set(forumsCacheKey, null);
				log('found css announcement', tResponse.results[i]);
				unsafeWindow.bungieNetPlatform.forumService.GetPostAndParent(tResponse.results[i].postId, '', function(pResponse)
				{
					log('parsing thread body', pResponse);
					cacheVal.data = pResponse && htmlDecode(pResponse.results[0].body).replace(/;/g, ' !important;') || null;
					cacheVal.time = Date.now();
					XT.set(cacheKey, cacheVal);
					$('head').append($('<style/>').attr('type', 'text/css').text(cacheVal.data));
					forumsCacheVal = pResponse && pResponse.results[0].tags || null;
					XT.set(forumsCacheKey, forumsCacheVal);
					doForums && doGroupCustomForums(forumsCacheVal, doForums === 2);
					callback && callback();
				},
				function(a, b, c, d) { errback && errback(a, b, c, d); log(a, b, c, d); XT.set(cacheKey, {data: null, time: now})});
			}, function() { errback && errback(arguments); log(arguments); XT.set(cacheKey, {data: null, time: now})});
		}

		function template(str, dat)
		{
			for (var prop in dat)
				str = str.replace(new RegExp('{' + prop + '}','g'), dat[prop]);
			return str;
		}
	
	function htmlDecode(value) { 
		return $('<div/>').html(value).text(); 
	}
	
	function uAlert() {
		var a = new unsafeWindow.LightBox(null, $('#alert'));
		a.showLightbox();
		var b = $('<div/>');
		b.append.apply(b, arguments);
		a.clearContent();
		a.loadLightbox(b, true);
	}
});