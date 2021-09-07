// ==UserScript==
// @name         Confluence权限设置
// @namespace    http://shijianxin.net/
// @version      0.1
// @description  try to take over the world!
// @author       shijianxin
// @match        https://confluence.pkpm.cn/pages/*
// @icon         https://www.google.com/s2/favicons?domain=pkpm.cn
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    class PermissionHandler{
		constructor(){}
		
		async post(url, data) {
			return new Promise((res, rej) => {
				const xhr = new XMLHttpRequest();
				xhr.onreadystatechange = () => {
					if (xhr.readyState == 4)
						if (xhr.status == 200)
							res(xhr.responseText)
					else
						rej({ code: xhr.status, text: xhr.responseText })
				}
				xhr.open("POST", url, true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
				xhr.send(data);
			})
		}

		get(url){
			let xmlHttp = new XMLHttpRequest();
			xmlHttp.open( "GET", url, false ); // false for synchronous request
			xmlHttp.send( null );
			return xmlHttp.responseText;
		}

		getCurrentPageId(){
			let url = new URL(window.location.href);
			let searchParams3 = new URLSearchParams(url.search);
			return searchParams3.get("pageId");
		}

		async setViewEditPermission(pageId, userKeys){
			let token = document.getElementById("atlassian-token").getAttribute("content");
			if (pageId && token){
				let data = "";
				for(let uu of userKeys){
					data += "viewPermissionsUserList=" + uu + "&";
				}
				for(let uu of userKeys){
					data += "editPermissionsUserList=" + uu + "&";
				}
				data += "contentId="+pageId+"&atl_token="+token;
				let ret = false;
				await this.post("https://confluence.pkpm.cn/pages/setcontentpermissions.action", data).then(res => ret=true);
				return ret;
			}
		}
		
		getPermission(pageId){
			let spaceKey = document.getElementById("confluence-space-key").getAttribute("content");
			let token = document.getElementById("atlassian-token").getAttribute("content");
			if (spaceKey && token){
				let url = "https://confluence.pkpm.cn/pages/getcontentpermissions.action?contentId=" + pageId + "&spaceKey=" + spaceKey + "&atl_token=" + token;
				let ret = this.get(url);
				let retObj = JSON.parse(ret);
				return Object.keys(retObj.users);
			}
		}
	
		getPossibleUser(usernameInput){
			let url = "https://confluence.pkpm.cn/rest/prototype/1/search/user-or-group.json?max-results=6&query=" + usernameInput;
			let ret = this.get(url);
			let retObj = JSON.parse(ret);
			let possibleUsers = [];
			for (let uu of retObj.result){
				possibleUsers.push({
					title : uu.title,
					avatar : uu.thumbnailLink.href,
					key : uu.userKey,
				});
			}
			return possibleUsers;
		}
		
		async addPagePermission(pageId, userKeys){
			let alreadyUsers = this.getPermission(pageId);
			let unionUsers = [...new Set([...alreadyUsers, ...userKeys])];
			let ret = await this.setViewEditPermission(pageId, unionUsers);
			return ret;
		}
	}

    // 弹出对话框类
	class PopDragDialog{
		constructor(){
			this.state = {
				isDragging: false,
				isHidden: true,
				xDiff: 0,
				yDiff: 0,
				x: 50,
				y: 50
			};
		}
		
		ready(fn) {
			if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
				fn();
			} else {
				document.addEventListener('DOMContentLoaded', fn);
			}
		}
		
		renderWindow(w, myState) {
			if (this.state.isHidden) {
				w.style.display = 'none';
			} else {
				w.style.display = '';
			}
			w.style.transform = 'translate(' + myState.x + 'px, ' + myState.y + 'px)';
		}
		
		clampX(n) {
			return Math.min(Math.max(n, 0),
							// container width - window width
							2000);
		}

		clampY(n) {
			return Math.min(Math.max(n, 0), 2000);
		}
	
		onMouseMove(e) {
			if (this.state.isDragging) {
				this.state.x = this.clampX(e.pageX - this.state.xDiff);
				this.state.y = this.clampY(e.pageY - this.state.yDiff);
			}

			// Update window position
			let w = document.getElementById('window');
			this.renderWindow(w, this.state);
		}
		
		onMouseDown(e) {
			this.state.isDragging = true;
			this.state.xDiff = e.pageX - this.state.x;
			this.state.yDiff = e.pageY - this.state.y;
		}
		
		onMouseUp() {
			this.state.isDragging = false;
		}
		
		closeWindow() {
			this.state.isHidden = true;

			let w = document.getElementById('window');
			this.renderWindow(w, this.state);
		}
	
	
	    showDialog(title, windowBodyString){
			if(document.getElementById('window')){
				let w = document.getElementById('window');
				this.state.isHidden = !this.state.isHidden;
				this.renderWindow(w, this.state);
				return;
			}
			
			let div = document.createElement('div');
			document.body.insertBefore(div, document.body.firstChild);
			div.innerHTML = `
<style>
.window {
    z-index: 12;
    border: 1px solid black;
    background-color: white;
    width: 400px;
    height: 300px;
    position: absolute;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.window .window-bar {
    padding-left: 6px;
    padding-top: 3px;
    cursor: move;
    background-color: #666666;
    color: white;
}

.window .window-bar .window-close {
    cursor: pointer;
    display: inline-block;
    position: absolute;
    top: 3px;
    right: 3px;
    background-color: white;
    width: 14px;
    height: 14px;
    padding-left: 2px;
    padding-top: 2px;
}

.window-body {
    margin: 1em;
}
</style>
<div class="window" id="window">
	<div class="window-bar">
		<div>${title}</div>
		<span class="window-close">
			<svg viewport="0 0 12 12" version="1.1"
				 width="16" height="16"
				 xmlns="http://www.w3.org/2000/svg">
				<line x1="1" y1="11"
					  x2="11" y2="1"
					  stroke="black"
					  strokeWidth="2"/>
				<line x1="1" y1="1"
					  x2="11" y2="11"
					  stroke="black"
					  strokeWidth="2"/>
			</svg>
		</span>
	</div>
	<div class="window-body" id="window-body">
		${windowBodyString}
	</div>
</div>
`
			let windowBar = document.querySelectorAll('.window-bar');
			windowBar[0].addEventListener('mousedown', this.onMouseDown.bind(this));
			document.addEventListener('mousemove', this.onMouseMove.bind(this));
			document.addEventListener('mouseup', this.onMouseUp.bind(this));
			let closeButton = document.querySelectorAll('.window-close');
			closeButton[0].addEventListener('click', this.closeWindow.bind(this));
			
			let w = document.getElementById('window');
			this.state.isHidden = !this.state.isHidden;
			this.renderWindow(w, this.state);
		}
	
	}

	class FindContentNode{
		constructor(){}
		
		// 传进来一个选择的Dom元素，返回对应class是plugin_pagetree_children_span的span
		getNodeSpan(domElem){
			let isWantedSpan = ele => ele && ele.tagName == 'SPAN' && ele.classList.contains('plugin_pagetree_children_span');
			if (isWantedSpan(domElem)) return domElem;
			if (isWantedSpan(domElem.parentNode)) return domElem.parentNode;
			if (isWantedSpan(domElem.firstChild)) return domElem.firstChild;
			return undefined;
		}
		
		getPageIdFromRegex(idStr){
			const regex = /childrenspan([0-9]+)/;
			const found = idStr.match(regex);
			if (found.length == 2) return found[1];
			return undefined;
		}
		
		getPageIdFromSpanNode(ele){
			return this.getPageIdFromRegex(ele.id);
		}
		
		getAllOneLevelChildrenNode(eleSpan){
			let childrenSpans = document.evaluate("./../../div[3]/ul//li/div[2]/span", eleSpan, null, XPathResult.ANY_TYPE, null)
			let thisSpan = childrenSpans.iterateNext();
			let retNodes = [];
			while (thisSpan) {
			  let id = this.getPageIdFromRegex(thisSpan.id);
			  let text = thisSpan.children[0].textContent;
			  retNodes.push({id : id, title : text});
			  thisSpan = childrenSpans.iterateNext();
			}
			return retNodes;
		}
		
		getAllOneLevelChildrenNodeFromSelectDomElem(domElem){
			let eleSpan = this.getNodeSpan(domElem);
			if (eleSpan){
				return this.getAllOneLevelChildrenNode(eleSpan);
			}
		}
		
		getPageIdFromSelectDomElem(domElem){
			let eleSpan = this.getNodeSpan(domElem);
			if (eleSpan){
				return this.getPageIdFromSpanNode(eleSpan);
			}
		}
	}
	
	// 选择Dom的元素
	var DomOutline = function (options) {
		options = options || {};

		var pub = {};
		var self = {
			opts: {
				namespace: options.namespace || 'DomOutline',
				borderWidth: options.borderWidth || 2,
				onClick: options.onClick || false,
				filter: options.filter || false
			},
			keyCodes: {
				BACKSPACE: 8,
				ESC: 27,
				DELETE: 46
			},
			active: false,
			initialized: false,
			elements: {}
		};

		function writeStylesheet(css) {
			var element = document.createElement('style');
			element.type = 'text/css';
			document.getElementsByTagName('head')[0].appendChild(element);

			if (element.styleSheet) {
				element.styleSheet.cssText = css; // IE
			} else {
				element.innerHTML = css; // Non-IE
			}
		}

		function initStylesheet() {
			if (self.initialized !== true) {
				var css = '' +
					'.' + self.opts.namespace + ' {' +
					'    background: #09c;' +
					'    position: absolute;' +
					'    z-index: 1000000;' +
					'}' +
					'.' + self.opts.namespace + '_label {' +
					'    background: #09c;' +
					'    border-radius: 2px;' +
					'    color: #fff;' +
					'    font: bold 12px/12px Helvetica, sans-serif;' +
					'    padding: 4px 6px;' +
					'    position: absolute;' +
					'    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
					'    z-index: 1000001;' +
					'}';

				writeStylesheet(css);
				self.initialized = true;
			}
		}

		function createOutlineElements() {
			self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
			self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
			self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
			self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
			self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
		}

		function removeOutlineElements() {
			jQuery.each(self.elements, function(name, element) {
				element.remove();
			});
		}

		function compileLabelText(element, width, height) {
			var label = element.tagName.toLowerCase();
			if (element.id) {
				label += '#' + element.id;
			}
			if (element.className) {
				label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
			}
			return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
		}

		function getScrollTop() {
			if (!self.elements.window) {
				self.elements.window = jQuery(window);
			}
			return self.elements.window.scrollTop();
		}

		function updateOutlinePosition(e) {
			if (e.target.className.indexOf(self.opts.namespace) !== -1) {
				return;
			}
			if (self.opts.filter) {
				if (!jQuery(e.target).is(self.opts.filter)) {
					return;
				}
			}
			pub.element = e.target;

			var b = self.opts.borderWidth;
			var scroll_top = getScrollTop();
			var pos = pub.element.getBoundingClientRect();
			var top = pos.top + scroll_top;

			var label_text = compileLabelText(pub.element, pos.width, pos.height);
			var label_top = Math.max(0, top - 20 - b, scroll_top);
			var label_left = Math.max(0, pos.left - b);

			self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
			self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
			self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
			self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
			self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
		}

		function stopOnEscape(e) {
			if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
				pub.stop();
			}

			return false;
		}

		function clickHandler(e) {
			e.preventDefault && e.preventDefault();
			pub.stop();
			self.opts.onClick(pub.element);

			return false;
		}

		pub.start = function () {
			initStylesheet();
			if (self.active !== true) {
				self.active = true;
				createOutlineElements();
				jQuery('body').on('mousemove.' + self.opts.namespace, updateOutlinePosition);
				jQuery('body').on('keyup.' + self.opts.namespace, stopOnEscape);
				if (self.opts.onClick) {
					setTimeout(function () {
						jQuery('body').on('click.' + self.opts.namespace, function(e){
							if (self.opts.filter) {
								if (!jQuery(e.target).is(self.opts.filter)) {
									return false;
								}
							}
							clickHandler.call(this, e);
						});
					}, 50);
				}
			}
		};

		pub.stop = function () {
			self.active = false;
			removeOutlineElements();
			jQuery('body').off('mousemove.' + self.opts.namespace)
				.off('keyup.' + self.opts.namespace)
				.off('click.' + self.opts.namespace);
		};

		return pub;
	};

	var dlg = new PopDragDialog();
	async function showDialog(){
		let windowBodyString = `
<input id="searchUserInput" type="text" Placeholder="输入用户名搜索" style="margin-right:10px;"/><button id="searchUserBtn">搜索</button>
<br>
<br>
<div style="display: flex;flex-direction: row">
<select id="searchedUsersList" size="6" style="width:100px">
</select>
<div style="display: flex;flex-direction: column;margin:10px;">
	<button id="addUserToSelectedBtn" style="margin-bottom:10px;">Add</button>
	<button id="delUserFromSelectedBtn">Del</button>
</div>
<select id="selectedUsersList" size="6" style="width:100px">
</select>
</div>
<div style="display: flex;flex-direction: column">
	<button id="addSingleDocPermissionBtn" style="width:160px;margin-top:10px;margin-bottom:10px;">增加单个文档权限</button>
	<button style="width:160px;">批量增加子节点权限</button>
	<textarea id="permissionLog" style="width:260px;"></textarea>
</div>
		`;
		dlg.showDialog("Confluence页面权限编辑", windowBodyString);
		
		let userSearchBtn = document.getElementById("searchUserBtn");
		userSearchBtn.addEventListener('click', searchUser);
		let addUserToSelectedBtn = document.getElementById("addUserToSelectedBtn");
		addUserToSelectedBtn.addEventListener('click', addUser);
		let delUserFromSelectedBtn = document.getElementById("delUserFromSelectedBtn");
		delUserFromSelectedBtn.addEventListener('click', delUser);
		let addSingleDocPermissionBtn = document.getElementById("addSingleDocPermissionBtn");
		addSingleDocPermissionBtn.addEventListener('click', addSingleDocPermission);
		
	}

	function searchUser(){
		let userSearchInput = document.getElementById("searchUserInput");
		let ph = new PermissionHandler();
		let users = ph.getPossibleUser(userSearchInput.value);
		let searchUsersList = document.getElementById("searchedUsersList");
		searchUsersList.innerText = null;
		for(const uu of users){
			let option = document.createElement("option");
		    option.text = uu.title;
			option.value = uu.key;
		    searchUsersList.add(option);
		}
	}

	function addUser(){
		let searchUsersList = document.getElementById("searchedUsersList");
		if (searchUsersList.selectedIndex !== "-1"){
			let value = searchUsersList.value;
			let text = searchUsersList.options[searchUsersList.selectedIndex].text;
			
			let selectedUsersList = document.getElementById("selectedUsersList");
			let option = document.createElement("option");
			option.text = text;
			option.value = value;
			selectedUsersList.add(option);
		}
	}
	
	function delUser(){
		let selectedUsersList = document.getElementById("selectedUsersList");
		if (selectedUsersList.selectedIndex !== "-1"){
			selectedUsersList.remove(selectedUsersList.selectedIndex);
		}
	}
	
	function addSingleDocPermission(){
		
		let myExampleClickHandler = async function (element) {
			let selectedUsersList = document.getElementById("selectedUsersList");
			let optionValues = [...selectedUsersList.options].map(o => o.value);
			
			let pageId = new FindContentNode().getPageIdFromSelectDomElem(element);
			let ret = new PermissionHandler().addPagePermission(pageId, optionValues);
			ret ? setLog("权限已添加") : setLog("权限添加失败");
		}
		let myDomOutline = DomOutline({ onClick: myExampleClickHandler });

        // Start outline:
        myDomOutline.start();
	}
	
	function batchAddChildrenDocPermission(){
		
		
		let myExampleClickHandler = async function (element) {
			let selectedUsersList = document.getElementById("selectedUsersList");
			let optionValues = [...selectedUsersList.options].map(o => o.value);
			
			let ph = new PermissionHandler();
			let childrenNodes = new FindContentNode().getAllOneLevelChildrenNodeFromSelectDomElem(element);
			for(let node of childrenNodes){
				let ret = ph.addPagePermission(node.id, optionValues);
				ret ? addLog(node.title + "权限已添加") : addLog(node.title + "权限添加失败");
			}
		}
		let myDomOutline = DomOutline({ onClick: myExampleClickHandler });

        // Start outline:
        myDomOutline.start();
	}
	
	function addLog(log){
		let logText = document.getElementById("permissionLog");
		logText.value += log;
	}
	
	function setLog(log){
		let logText = document.getElementById("permissionLog");
		logText.value = log;
	}
	
    //GM_registerMenuCommand("setPermission", setPermission, "s");
    GM_registerMenuCommand("showDialog", showDialog, "d");
})();