(function(global) {
  function context(renderer, markdown, cursor) {
    var actual = renderer.render(markdown),
        diff = renderer.render(markdown.slice(0, cursor) + '\u0001' + markdown.slice(cursor));
        nodeName = nodeNameAroundCursor(diff)
    if(nodeName == 'EM' || nodeName == 'STRONG' || nodeName == 'A'){
      actual = renderer.render(markdown + 'a'),
      diff = renderer.render(markdown.slice(0, cursor) + '\u0001' + markdown.slice(cursor) + 'a');
      nodeName = nodeNameAroundCursor(diff)
    }
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
        console.log('the cursor is possibly somewhere in opening/closing symbol')
        switch(an.nodeName) {
          case 'OL':
            if(next == '. ' && prev.match(/\d+/)){
              return { node: an, position: 'symbol' }
            } else if (next == '<o' || prev == '>') {
              return { node: a, position: 'text' }
            } 
            break; 
          case 'UL':
            if(prev != '*') {
              if(next[0] == ' ' || next[0] == '*' || next.match(/\d+/)) {
                return { node: a, position: 'text' }
              } else if (prev == '*') {
                return { node: a, position: 'text' }
              } else if (next == '<u' || prev == '>') {
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
            } else if (next == '<e'){
                return { node: a, position: 'text' }
              }
            break;
          case 'STRONG':
            if(next[0] == ' ') {
              return { node: a, position: 'text' }
            } else if(next == '**' || next == '__') {
              if(prev == '' || prev != next[0]) {
                return { node: a, position: 'text' }
              } 
            } else if (next == '<s'){
                return { node: a, position: 'text' }
              }
            break;
          case 'BLOCKQUOTE':
            if(prev == '' && next == '<b') {
              return { node: a, position: 'text' }
            } else if (prev == '>' || prev == ' ') {
              return { node: a, position: 'text' }
            } 
          break;
          case 'A':
            if(next[0] == '[') {
              return { node: a, position: 'text' }
            } else if (next == '<a' && prev == '') {
              return { node: a, position: 'text' }
            }
            break;
        }
        return { node: an, position: 'symbol' };
      } else if(an.cloneNode(false).outerHTML != dn.cloneNode(false).outerHTML) {
        console.log('the cursor is somewhere in the attributes (like the url of a link)')
        return { node: an, position: 'attributes' };
      } else if(an.innerHTML != dn.innerHTML) {
        console.log('the cursor is in the text or closing tag')
        var nodeName = nodeNameAroundCursor(dn.outerHTML);
      switch(an.nodeName) {
        case 'EM':
        if(nodeName == an.nodeName) {
          return { node: an, position: 'symbol' }
        }else if (prev == '<' && next[0] == '/'){
          return { node: an, position: 'symbol' }
        } 
        break;
        case 'STRONG':
        if(nodeName == an.nodeName) {
          return { node: an, position: 'symbol' }
        }else if (prev == '<' && next[0] == '/'){
          return { node: an, position: 'symbol' }
        }
        break;
        case 'A':
        if(nodeName == an.nodeName) {
          return { node: an, position: 'symbol' }
        }else if (prev == '<' && next == '/a'){
          return { node: an, position: 'symbol' }
        } else if (prev == 'a' && next[0] == '>'){
          return { node: an, position: 'symbol' }
        }
        break;
        case 'LI':
        if(nodeName == an.nodeName) {
          return { node: an, position: 'symbol' }
        }else if (prev == '<' && next[0] == '/'){
          return { node: an, position: 'symbol' }
        } else if (prev == '/' && next.toUpperCase() == nodeName.slice(0,2)){ 
          return { node: an, position: 'symbol' }
        }
        break; 
      }
        return child(an, dn, next, prev) || { node: an, position: 'text' };
      }
    }
    return null;
  }

  function nodeNameAroundCursor(html) {
    var temp = html.replace('&lt;', '<').replace('&gt;', '>'),
        index = temp.indexOf('\u0001'),
        before = temp.lastIndexOf('</', index),
        after = temp.indexOf('>', index);

    if(before >= -1 && after > -1) {
      var text =temp.slice(before + 2, after);
          text = text.replace('\u0001', '');
      return text.toUpperCase();
    }
    return null;
  }


  global.Context = {
    context: context
  };
})(this)