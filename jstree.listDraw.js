/**
 * ### listDraw plugin
 *
 *
 */
/*globals jQuery, define, exports, require */
(function (factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define('jstree.listDraw', ['jquery','jstree'], factory);
	}
	else if(typeof exports === 'object') {
		factory(require('jquery'), require('jstree'));
	}
	else {
		factory(jQuery, jQuery.jstree);
	}
}(function ($, jstree, undefined) {
	"use strict";

	if($.jstree.plugins.listDraw) { return; }


	$.jstree.plugins.listDraw = function (options, parent) {

		var direction = 0;
		var viewData = [];
		var queue = [];
		var queueLength;
		var premer = 0;
		var setting = null;

		var viewbox = {
			$el: null,
			treeMap: {},  //   用于映射
			scrollTop: 0,
			init: function (option) {
				var self = this;
				viewbox.$el.scroll(self, self.scroll);

				var rootNode = {children: []}
				this.treeMap["#"] = rootNode;

				direction = 0;
				queue = [];
				premer = 0;
				setting = option;

				this.$el.find(".js_viewbox_item").each(function (index, element) {

					var $this = $(this);

					queue.push({
						el: element,
						nameEl: $this.find(".js_viewbox_name")[0],
						id: premer,
					})

					$this.css({
						'position': 'absolute',
						'width': '100%',
						'top': premer * setting.height + 'px'
						// '-webkit-transform': 'translate3d(0,' + (premer * option.height) + 'px,0)'
					})

					// 指向最后一个的后一个
					premer++;
				});

				queueLength = queue.length;
				premer--;
			},
			setData: function (id, data) {
				var self = this;

				if (this.treeMap[id]) {
					this.treeMap[id].children = data;
					data.forEach(function (item) {
						self.treeMap[item.id] = item;
					});
				}

				setting.length = this.treeMap[id].children.length;

				this.toListView();


//                this.redraw();
			},

			toListView: function () {
				viewData = [];
				var eachTreeList = function (level, data) {
					level++;
					data.forEach(function (item) {
						item.level = level;
						viewData.push(item)
						if (item.children.length) {
							eachTreeList(level, item.children)
						}
					})

				}

				eachTreeList(0, this.treeMap["#"].children)
			},

			moveAfterNode : function (premer , offset ){
				queue.forEach(function (item){
					if(item.premer > premer){
						item.el.style.top = item.premer * setting.height +  offset + 'px';
					}
				})
			},

			redraw_node: function (obj, viewItem, premer) {
				var c = ' jstree-node';
				if (obj.state.hidden) {
					c += ' jstree-hidden';
				}
				if (obj.state.loaded && !obj.children.length) {
					c += ' jstree-leaf';
				}
				else {
					c += obj.state.opened && obj.state.loaded ? ' jstree-open' : ' jstree-closed';
				}

				viewItem.nameEl.innerText = obj.text;
				viewItem.el.setAttribute('premer', premer);
				viewItem.premer = premer;
				viewItem.el.className = c;
				viewItem.el.id = obj.id;
				viewItem.el.style.left = 40 + (obj.level * 10) + "px";

				viewItem.el.style.top = premer * setting.height + 'px';

			},
			redraw: function () {
				var direct = 1;
				this.$el.find(".js_viewbox").css("height", ( (viewData.length * setting.height) + "px"));




				premer = 0;
				if (this.scrollTop < setting.height) {

				} else {

					if( this.scrollTop + setting.height*queue.length > viewData.length * setting.height){
						direct = -1
					}

					if(direct > 0){
						premer = parseInt(this.scrollTop / setting.height);
					}else {
						premer = viewData.length -1
					}


				}
				if(direct > 0){
					for (var i = 0; i < queue.length; i++) {
						var obj = viewData[premer];
						this.redraw_node(obj, queue[i], premer);
						premer++;
					}
					premer--;
				}else {
					for (var i =  queue.length -1; i >=0 ; i--) {
						var obj = viewData[premer];
						this.redraw_node(obj, queue[i], premer);
						premer--;
					}
					premer = viewData.length -1
				}



			},


			scroll: function (event) {


				var top = this.scrollTop;
				event.data.scrollTop = top;
				var index = queue[0].el.getAttribute('premer');
				var lastIndex = queue[queue.length-1].el.getAttribute('premer');
				//头尾都溢出 , 直接重置

				if(
					(top +queue.length*setting.height < (index * setting.height )  ||
					top > (lastIndex * setting.height + setting.height))
				){
					event.data.redraw( );
					direction = top;
					return ;
				}
				if (top > 0) {



					// 检测滚动条滚动的方向
					if (top - direction > 0) {

						// direct = 'down';
						// 向下滚动
						// 如果滚动位置大于排头位置加二分之一
						// var index = $(queue[0]).attr('premer');
						var startDate = new Date - 0;


						var count = 0 ;
						while (top > (index * setting.height + setting.height) && premer + 1 < viewData.length) {
							// <li class="js_hugeUl_item_1" premer="0" item_data="0" style="position: absolute; width: 100%; transform: translateY(0px);">1</li>

							var elObj = queue.shift();
							premer++;
							//console.log(premer)

							event.data.moveChild(elObj, 0);

							queue.push(elObj);
							index = queue[0].el.getAttribute('premer');

						}
						console.log(new Date - startDate ,"  - ", count);
					} else if (top - direction < 0) {



						while (top < (index * setting.height  ) && premer - 1 >= 0) {

							var elObj = queue.pop();
							premer--;
							//console.log(premer)

							event.data.moveChild(elObj, queueLength - 1);

							queue.unshift(elObj);
							index = queue[0].el.getAttribute('premer');


						}
					}

					direction = top;
				} else {

					// 为了填safari的弹性滚动的坑，这个坑是会产生scrollTop负值

					while (index != 0) {
						var elObj = queue.pop();
						premer--;
						//console.log(premer)

						event.data.moveChild(elObj, queueLength - 1);

						queue.unshift(elObj);
						index = queue[0].el.getAttribute('premer');
					}
				}
				// 下面这句话会导致页面回流
				// direction = this.scrollTop;


			},
			moveChild: function (elObj, shift) {
				var el = elObj.el;

				this.redraw_node(viewData[premer - shift], elObj, premer - shift)

			}
		}
		this.redraw = function (full) {
			if (full) {
				this._model.force_full_redraw = true;
			}
			//if(this._model.redraw_timeout) {
			//	clearTimeout(this._model.redraw_timeout);
			//}
			//this._model.redraw_timeout = setTimeout($.proxy(this._redraw, this),0);
			var nodes = this._model.force_full_redraw ? this._model.data[$.jstree.root].children.concat([]) : this._model.changed.concat([]),
				tmp, j, fe = this._data.core.focused;
			var node_obj = [];
			for (var i = 0, j = nodes.length; i < j; i++) {
				node_obj.push(this.get_node(nodes[i]));
			}


			if (this._model.force_full_redraw) {
				var html = []
				for (var i = 0; i < 10; i++) {
					html.push('<li   class="js_viewbox_item jstree-node "  id="js_viewbox_item_' + (i + 1) + '" class="jstree-node  jstree-leaf"><i class="jstree-icon jstree-ocl" ></i><a class="jstree-anchor" href="#" tabindex="-1" ><i class="jstree-icon jstree-themeicon " ></i><span class="js_viewbox_name"></span></a></li>');
				}
				html.push('<li style="display: none;position: relative;list-style:none;" class="js_viewbox_animate_container"><ul style="position:absolute;bottom:0;" class="jstree-children js_viewbox_animate_list"></ul></li>')
				this.element.empty().html('<ul style="position: relative;" class="js_viewbox">' + html.join("") + '</ul>');

				viewbox.$el = this.element;
				viewbox.init({height: 24});

//                f.insetHTML =;
				//this.get_container_ul()[0].appendChild(f);
				viewbox.setData("#", node_obj);
				viewbox.redraw()
			}
			this._model.force_full_redraw = false;
			this._model.changed = [];
			/**
			 * triggered after nodes are redrawn
			 * @event
			 * @name redraw.jstree
			 * @param {array} nodes the redrawn nodes
			 */
			this.trigger('redraw', {"nodes": nodes});
		};

		this.draw_childrenForAnimation = function (node , $animation ,direct) {
			var obj = this.get_node(node),
				i = false,
				j = false,
				k = false,
				d = document;
			if (!obj) {
				return false;
			}
			node = this.get_node(node, true);
			if (!node || !node.length) {
				return false;
			} // TODO: quick toggle

			var node_obj = [];
			for (var i = 0, j = obj.children.length; i < j; i++) {
				node_obj.push(this.get_node(obj.children[i]));
			}
			if (obj.children.length && obj.state.loaded) {
				var maxLength =  obj.children.length > 100 ? 99 : obj.children.length
				if(direct > 0){
					$animation.hide();
				}else {
					$animation.show();
				}

				var $animateList = $animation.find(".js_viewbox_animate_list");
				$animation.css("height" ,maxLength*setting.height + "px");
				$animation.find(".js_viewbox_animate_list").css("height" , maxLength*setting.height)
				$animateList.html("")
				for (var i = 0, j = obj.children.length; i < j && i < 100; i++) {
					$animateList.append('<li class=" jstree-node jstree-leaf" style="margin-left:44px;"><i class="jstree-icon jstree-ocl"></i><a class="jstree-anchor" href="#" tabindex="-1"><i class="jstree-icon jstree-themeicon "></i><span class="js_viewbox_name">'+this.get_node(obj.children[i]).text+'</span></a></li>');
				}
			}
		}

		this.draw_children = function (node) {
			var obj = this.get_node(node),
				i = false,
				j = false,
				k = false,
				d = document;
			if (!obj) {
				return false;
			}
			if (obj.id === $.jstree.root) {
				return this.redraw(true);
			}
			node = this.get_node(node, true);
			if (!node || !node.length) {
				return false;
			} // TODO: quick toggle

			var node_obj = [];
			for (var i = 0, j = obj.children.length; i < j; i++) {
				node_obj.push(this.get_node(obj.children[i]));
			}
			if (obj.children.length && obj.state.loaded) {
				viewbox.setData(obj.id, node_obj);
				viewbox.redraw()
			}
		}

		this.close_node = function (obj, animation) {
			var t1, t2, t, d;
			if ($.isArray(obj)) {
				obj = obj.slice();
				for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.close_node(obj[t1], animation);
				}
				return true;
			}
			obj = this.get_node(obj);
			if (!obj || obj.id === $.jstree.root) {
				return false;
			}
			if (this.is_closed(obj)) {
				return false;
			}
			animation = animation === undefined ? this.settings.core.animation : animation;
			t = this;
			d = this.get_node(obj, true);

			obj.state.opened = false;
			/**
			 * triggered when a node is closed (if there is an animation it will not be complete yet)
			 * @event
			 * @name close_node.jstree
			 * @param {Object} node the closed node
			 */
			this.trigger('close_node', {"node": obj});
			if (!d.length) {
				/**
				 * triggered when a node is closed and the animation is complete
				 * @event
				 * @name after_close.jstree
				 * @param {Object} node the closed node
				 */
				this.trigger("after_close", {"node": obj});
			}
			else {
				//if (!animation) {
					d[0].className = d[0].className.replace('jstree-open', 'jstree-closed');
//                    d.attr("aria-expanded", false).children('.jstree-children').remove();
					viewbox.setData(obj.id, [])
					viewbox.redraw();
					//this.trigger("after_close", {"node": obj});
				//}
				//else {
				//this.trigger('before_open', {"node": obj});
				var premer = d.attr("premer") ;
				this.element.find(".js_viewbox_animate_container").css("top" , d.position().top+24)
				this.draw_childrenForAnimation( d, this.element.find(".js_viewbox_animate_container") ,-1);
				viewbox.moveAfterNode(premer ,this.element.find(".js_viewbox_animate_container").height()  )
				this.element.find(".js_viewbox_animate_container")
					.slideUp({
						progress : function (){
							viewbox.moveAfterNode(premer , $(this).height()  )
						} ,
						complete : function (){
							//t.draw_children(obj);
							t.element.find(".js_viewbox_animate_list").html("");
							t.element.find(".js_viewbox_animate_container").hide();
						},
						speed :animation});

					//d.after('<li style="display: none;" class=""><ul class="jstree-children" style="height:500px;"></ul></li>')
						/*  .children(".jstree-children").attr("style", "display:block !important").end()
						 .removeClass("jstree-open").addClass("jstree-closed").attr("aria-expanded", false)
						 .children(".jstree-children").stop(true, true).slideUp(animation, function () {
						 this.style.display = "";
						 d.children('.jstree-children').remove();
						 if (t.element) {
						 t.trigger("after_close", {"node": obj});
						 }
						 })*/;
				//}
			}
		};

		this.open_node = function (obj, callback, animation) {
			var t1, t2, d, t;
			if ($.isArray(obj)) {
				obj = obj.slice();
				for (t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.open_node(obj[t1], callback, animation);
				}
				return true;
			}
			obj = this.get_node(obj);
			if (!obj || obj.id === $.jstree.root) {
				return false;
			}
			animation = animation === undefined ? this.settings.core.animation : animation;
			if (!this.is_closed(obj)) {
				if (callback) {
					callback.call(this, obj, false);
				}
				return false;
			}
			if (!this.is_loaded(obj)) {
				if (this.is_loading(obj)) {
					return setTimeout($.proxy(function () {
						this.open_node(obj, callback, animation);
					}, this), 500);
				}
				this.load_node(obj, function (o, ok) {
					return ok ? this.open_node(o, callback, animation) : (callback ? callback.call(this, o, false) : false);
				});
			}
			else {
				d = this.get_node(obj, true);
				t = this;
				if (d.length) {
//                    if (animation && this.element.find(".js_viewbox_animation").) {
//                       this.element.find(".js_viewbox_animation").stop(true,true)
//                    }

					if (!animation) {
						if (obj.children.length ) {
							this.draw_children(obj);
							this.trigger('before_open', {"node": obj});
							d[0].className = d[0].className.replace('jstree-closed', 'jstree-open');
							//d = this.get_node(obj, true);
						}

					}
					else {
						this.trigger('before_open', {"node": obj});
						var premer = d.attr("premer") ;
						this.element.find(".js_viewbox_animate_container").css("top" , d.position().top+24)
						this.draw_childrenForAnimation( d, this.element.find(".js_viewbox_animate_container") , 1);
						this.element.find(".js_viewbox_animate_container")
							.slideDown({
								progress : function (){
								viewbox.moveAfterNode(premer , $(this).height() )
								} ,
								complete : function (){
									t.draw_children(obj);
									t.element.find(".js_viewbox_animate_list").html("");
									t.element.find(".js_viewbox_animate_container").hide();
								},
								speed :animation});
						/* d
						 .children(".jstree-children").css("display", "none").end()
						 .removeClass("jstree-closed").addClass("jstree-open").attr("aria-expanded", true)
						 .children(".jstree-children").stop(true, true)
						 .slideDown(animation, function () {
						 this.style.display = "";
						 if (t.element) {
						 t.trigger("after_open", {"node": obj});
						 }
						 });*/
					}
				}
				obj.state.opened = true;
				if (callback) {
					callback.call(this, obj, true);
				}
				if (!d.length) {
					/**
					 * triggered when a node is about to be opened (if the node is supposed to be in the DOM, it will be, but it won't be visible yet)
					 * @event
					 * @name before_open.jstree
					 * @param {Object} node the opened node
					 */
					this.trigger('before_open', {"node": obj});
				}
				/**
				 * triggered when a node is opened (if there is an animation it will not be completed yet)
				 * @event
				 * @name open_node.jstree
				 * @param {Object} node the opened node
				 */
				this.trigger('open_node', {"node": obj});
				if (!animation || !d.length) {
					/**
					 * triggered when a node is opened and the animation is complete
					 * @event
					 * @name after_open.jstree
					 * @param {Object} node the opened node
					 */
					this.trigger("after_open", {"node": obj});
				}
				return true;
			}
		}
	}
}));
