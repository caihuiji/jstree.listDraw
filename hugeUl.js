    function hugeulList($el) {

        var direction = 0;
        var data = [];
        var queue = [];
        var premer = 0;
        var setting = null;

        var HugeUl = {
            init: function (option) {

                // 初始化数据
                var self = this;
                direction = 0;
                queue = [];
                premer = 0;
                setting = option;
                data = setting.data
                setting.length = data.length;

                // 初始化滚动条高度
                $('.js_hugeUl_body').css(
                    {
                        'height': setting.length * setting.height,
                        'position': 'relative',
                        'width': '100 %',
                        'overflow': 'hidden',
                    });

                // 绑定滚动事件
                $('.js_hugeUl_container').scroll(self, self.scroll);

                // 初始化最初项,缓存节点
                $('.js_hugeUl_body li').each(function (index, element) {

                    var el = element;
                    var name = $(element).find('.js_hugeUl_name')[0];
                    var tel = $(element).find('.js_hugeUl_tel')[0];
                    var mail = $(element).find('.js_hugeUl_mail')[0];
                    var id = $(element).find('.js_inviteActive_table_row')[0];
                    var input = $(element).find('.js_invite_checkbox')[0];

                    // queue.push(element);
                    queue.push({
                        el: element,
                        name: name,
                        tel: tel,
                        mail: mail,
                        id: id,
                        input: input
                    })

                    // $(element).attr('premer', premer);
                    $(element).css({
                        'position': 'absolute',
                        'width': '100%',
                        'transform': 'translateZ(0)',
                        'top': premer * option.height + 'px'
                        // '-webkit-transform': 'translate3d(0,' + (premer * option.height) + 'px,0)'
                    })

                    // 初始化表中内容
                    el.style.top = premer * setting.height + 'px';
                    name.textContent = data[premer].name;
                    tel.textContent = data[premer].mobile;
                    mail.textContent = data[premer].alias;
                    el.setAttribute('premer', premer);
                    id.setAttribute('data-id', data[premer].uin);
                    input.checked = data[premer].checked;

                    // 指向最后一个的后一个
                    premer++;
                });

                // 修正，指向最后一个数据
                premer--;
            },
            scroll: function (event) {

                var top = this.scrollTop;
                if (top > 0) {

                    // 检测滚动条滚动的方向
                    if (top - direction > 0) {

                        // direct = 'down';
                        // 向下滚动
                        // 如果滚动位置大于排头位置加二分之一
                        // var index = $(queue[0]).attr('premer');
                        var index = queue[0].el.getAttribute('premer');
                        while (top > (index * 40 + 20) && premer + 1 < data.length) {
                            // <li class="js_hugeUl_item_1" premer="0" item_data="0" style="position: absolute; width: 100%; transform: translateY(0px);">1</li>

                            var elObj = queue.shift();
                            premer++;

                            event.data.moveChild(elObj, 0);

                            queue.push(elObj);
                            index = queue[0].el.getAttribute('premer');
                        }

                    } else if (top - direction < 0) {

                        var index = queue[0].el.getAttribute('premer');

                        while (top < (index * 40 - 20) && premer - 1 >= 0) {

                            var elObj = queue.pop();
                            premer--;

                            event.data.moveChild(elObj, 8);

                            queue.unshift(elObj);
                            index = queue[0].el.getAttribute('premer');
                        }
                    }

                    direction = top;
                } else {

                    // 为了填safari的弹性滚动的坑，这个坑是会产生scrollTop负值
                    var index = queue[0].el.getAttribute('premer');

                    while (index != 0) {
                        var elObj = queue.pop();
                        premer--;

                        event.data.moveChild(elObj, 8);

                        queue.unshift(elObj);
                        index = queue[0].el.getAttribute('premer');
                    }
                }
                // 下面这句话会导致页面回流
                // direction = this.scrollTop;
            },
            moveChild: function (elObj, shift) {
                var el = elObj.el;
                var name = elObj.name;
                var tel = elObj.tel;
                var mail = elObj.mail;
                var id = elObj.id;
                var input = elObj.input;


                el.style.top = (premer - shift) * setting.height + 'px';
                el.setAttribute('premer', premer - shift);
                name.textContent = data[premer - shift].name;
                tel.textContent = data[premer - shift].mobile;
                mail.textContent = data[premer - shift].alias;
                input.checked = data[premer - shift].checked;
                id.setAttribute('data-id', data[premer - shift].uin);

            }
        }
        return HugeUl;
    }


    window.HugeUl = hugeulList();
