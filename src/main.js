window.addEventListener('load', function()
{
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
	currentRequest =  unsafeWindow.currentRequest;
	currentRequests = unsafeWindow.currentRequests;
	localStorage =    unsafeWindow.localStorage;

	if (!(currentRequest.length + currentRequests.length))
		console.log('cdb: No requests to attach listener.');
	
	(currentRequests.length && currentRequests[0].done
	 || currentRequest.length && currentRequest[0].done
	 || function(f) { if (unsafeWindow._gaq) f(); else setTimeout(arguments.callee, 500); })(function()
	{
		var slice = Array.prototype.slice;
		var partial = function(fn, obj) {
			var pargs = slice.call(arguments, obj ? 2 : 1);
			return function() {
				return fn.apply(obj || null, pargs.concat(slice.call(arguments)));
			};
		};
		var log = partial(console.log, console, 'cdb:');

		const VERSION = '__VERSION__';
		const CACHE_FLUSH_THRESHOLD = 1000 * 60 * 60 * 24 * 10; // 10 days

		var $ = unsafeWindow.$;
		var url = unsafeWindow.location.href;
		var isSignedIn = unsafeWindow.viewModels.loggedInUserModel().user.showActivity();

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


		if (~url.search(/user\/edit/i))
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
				}
			];
			
			$('#GroupSettings').clone().appendTo('#container_groupSettings')
			.find('h2').text('Group Design').end()
			.find('ul, a, span').remove().end()
			.append('<table id="cdb_gdt" style="width: 100%;"/>');
			var $gdt = $('#cdb_gdt');
			for (var i = 0, c = GD_DATA.length; i < c; ++i)
			{
				$gdt.append(template('<tr><td><span title="{size}">{name}: </span></td><td style="width: 100%;"><input style="width: 100%"/></td></tr>',
				{
					name: GD_DATA[i].name,
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
	});
}, false);