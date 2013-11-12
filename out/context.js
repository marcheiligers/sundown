(function(global) {
  function context(renderer, markdown, cursor) {
    var actual = renderer.render(markdown),
        diff = renderer.render(markdown.slice(0, cursor) + '\u0001' + markdown.slice(cursor));

    var a = document.createElement('root'), d = document.createElement('root');
    a.innerHTML = actual;
    d.innerHTML = diff;

    var next = markdown.substr(cursor, 2),
        prev = cursor > 0 ? markdown[cursor - 1] : '';

    if(!actual) {
      return { node: a, position: 'start' };
    } else {
      return child(a, d, next, prev) || { node: a, position: 'end' };
    }

  }

  function child(a, d, next, prev) {
    for(var i = 0, l = a.childNodes.length; i < l; i++) {
      var an = a.childNodes[i],
          dn = d.childNodes[i];

      if(!dn || an.nodeName != dn.nodeName) {
        // the cursor is possibly somewhere in opening/closing symbol
        switch(an.nodeName) {
          case 'OL':
          case 'UL':
            if(prev != '*') {
              if(next[0] == ' ' || next[0] == '*' || next.match(/\d+/)) {
                return { node: a, position: 'text' }
              }
            }
            break;
          case 'EM':
            if(next[0] == '*' || next[0] == '_') {
              if(next == '**' || next == '__') {
                return { node: an, position: 'symbol' }
              } else {
                return { node: a, position: 'text' }
              }
            }
            break;
          case 'STRONG':
            if(next[0] == ' ') {
              return { node: a, position: 'text' }
            } else if(next == '**' || next == '__') {
              if(prev == '' || prev != next[0]) {
                return { node: a, position: 'text' }
              }
            }
            break;
          case 'A':
            if(next[0] == '[') {
              return { node: a, position: 'text' }
            }
            break;
        }
        return { node: an, position: 'symbol' };
      } else if(an.cloneNode(false).outerHTML != dn.cloneNode(false).outerHTML) {
        // the cursor is somewhere in the attributes (like the url of a link)
        return { node: an, position: 'attributes' };
      } else if(an.innerHTML != dn.innerHTML) {
        // the cursor is in the text somewhere somewhere
        return child(an, dn, next, prev) || { node: an, position: 'text' };
      }
    }
    return null;
  }

  global.Context = {
    context: context
  };
})(this)