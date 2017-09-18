$.selects =
{
  zIndex: 99,
  timer: null,
  cancelTimer: function()
  {
    if ($.selects.timer)
    {
      clearTimeout($.selects.timer);
      $.selects.timer = null;
    }
  },
  setTimer: function(sel)
  {
    $.selects.timer = setTimeout(function(){
      sel.trigger('selectClose');
    }, 150);
  },
  height: function(ul, max)
  {
    setTimeout(function(){
      if (ul.height() > max)
        ul.addClass('scroll').css('height', max);
    }, 10);
  }
};



// selects - jQuery plugin - creates custom elements from <select> elements - by Valentin Agachi http://agachi.name
$.fn.selects = function(args)
{
  if (!this.length) return this;

  var opts = $.extend({
      className: '',
      markup: '<a class="trigger" href="#"><span></span></a><div class="popup"><ul></ul></div>',
      skipFirst: false,
      maxHeight: 0
    }, args || {});

  return this.each(function(){
    var sel = $(this),
      type = opts.className.length ? opts.className : this.className.split(' ')[0],
      actives = ['custom-select-active', type + '-active'],
      active = actives.join(' '),
      items = [];

    sel.hide().wrap('<div class="custom-select select-' + sel[0].name + ' ' + type + ' cf"></div>');

    var parent = sel.parent().css({ zIndex: $.selects.zIndex-- }).append(opts.markup),
      trigger = parent.find('.trigger'), popup = parent.find('.popup'), ul = parent.find('ul'),
      off = opts.skipFirst ? 1 : 0, i = off, s = '';

    for (; i < this.options.length; i++) {
      var $c=$(this.options[i]).attr('class'),
        tclass='';
      if ( $c ) {
        tclass=' class="'+$c+'"';
      }
      s += '<li><a href="#" id="' + sel[0].name + '_' + (i - off) + '" tabindex="-1"'+tclass+'>' + this.options[i].text + '</a></li>';
    }

    if (opts.skipFirst) trigger.addClass('default');

    ul.append(s);
    items = ul.find('a');

    if (opts.maxHeight) $.selects.height(ul, opts.maxHeight);

    trigger
      .click(function(){
        $('.' + actives[0]).removeClass(active);
        var d = sel.triggerHandler('selectOpening', [sel, parent]) || 0;
        popup.width(trigger.outerWidth() - d);
        parent.toggleClass(active);
        items.attr('tabindex', 0);
        return false;
      })
      .find('span').html(this.options[this.selectedIndex].text);

    popup.width(trigger.outerWidth());

    $(trigger).add(popup).hover(function(){
      if (parent.hasClass(actives[0]))
        $.selects.cancelTimer();
    }, function(){
      $.selects.setTimer(sel);
    });

    items.focus(function(){
      if (parent.hasClass(actives[0]))
        $.selects.cancelTimer();
    }).blur(function(){
      $.selects.setTimer(sel);
    });

    sel.bind('selectActive', function(e, i){
      sel[0].selectedIndex = i;
      trigger.removeClass('default').focus().find('span').html(ul.find('a:eq(' + i + ')').html());
      sel.trigger('selectClose');
    });

    sel.bind('selectClose', function(e){
      parent.removeClass(active);
      items.attr('tabindex', -1);
    });

    items.click(function(){
      var p = this.id.split('_'),
        i = parseInt(p[p.length - 1]);
      sel.trigger('selectActive', [i]);
      sel.trigger('selectClosed', [sel, parent, i, this]);
      return false;
    });
  });
};