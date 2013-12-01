(function(global) {
  // var CURSOR = '\u0001';
  var CURSOR = 'XXCURSORXX';

  function context(renderer, markdown, cursor) {
    var actual = renderer.render(markdown),
        diff = renderer.render(markdown.slice(0, cursor) + CURSOR + markdown.slice(cursor));
        cnode = nodeNameAroundCursor(diff);
    if(cnode == 'EM' || cnode == 'STRONG' || cnode == 'A' || cnode == 'I' || cnode == 'B'){
      actual = renderer.render(markdown + 'a'),
      diff = renderer.render(markdown.slice(0, cursor) + CURSOR + markdown.slice(cursor) + 'a');
      cnode = nodeNameAroundCursor(diff)
    }
    console.log('actual', actual)
    console.log('diff', diff.replace(CURSOR, '|'))
    var a = document.createElement('root'), d = document.createElement('root');
    a.innerHTML = actual;
    d.innerHTML = diff;

    var next = markdown.substr(cursor, 2),
        prev = cursor > 0 ? markdown[cursor - 1] : '';

    if(!actual) {
      return { node: a, position: 'start' };
    } else {
      return child(a, d, next, prev, cnode) || { node: a, position: 'end' };
    }

  }

  function child(a, d, next, prev, cnode) {
    console.log('-> child', a.nodeName, d.nodeName)

    for(var i = 0, l = a.childNodes.length; i < l; i++) {
      var an = a.childNodes[i],
          dn = d.childNodes[i];

      //console.log('--> for:', i, an.nodeName, dn.nodeName);
      //console.log('       :', i, an.innerHTML, dn.innerHTML, an.innerHTML == dn.innerHTML);
      if(!dn || an.nodeName != dn.nodeName) {
        // the cursor is possibly somewhere in opening/closing symbol
        console.log('the cursor is possibly somewhere in opening/closing symbol') //, a.nodeName, an.parentNode.nodeName, an.nodeName, dn.nodeName, cnode)
        
        if(dn){
          if(cnode == dn.nodeName) {
            return { node: an.parentNode, position: 'symbol' };
          }
        }

        if (next.toUpperCase() == '<' + an.nodeName.slice(0,1)){
          return { node: a, position: 'text' }
        } else if (next == '' && prev == '>') {
          return { node: a, position: 'text' }
        }

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
              console.log("We're here")
              if(next == '**' || next == '__') {
                if(prev == '*') {
                  return { node: a, position: 'text' }
                } else {
                  return { node: an, position: 'symbol' }
                }
              } else if (next == '<e' && prev == ''){
                return { node: a, position: 'text' }
              } else {
                return { node: a, position: 'text' }
              }
            } else if (prev == '*'){
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
        console.log('the cursor is somewhere in the attributes (like the url of a link)')
        return { node: an, position: 'attributes' };
      } else if(an.innerHTML != dn.innerHTML) {
        // the cursor is in the text somewhere or in a closing tag
        var ch = child(an, dn, next, prev, cnode);

        switch(an.nodeName) {
          case 'P':
              if(prev == '*' && next == '') {
                return { node: an, position: 'text' }
              }
            break;
        }

        if(ch) {
          return ch;
        } else if(cnode == an.nodeName) {
          return { node: an, position: 'symbol' };
        } else {
          console.log("This is tst")
          if (prev == '<' && next[0] == '/') {
            return { node: an, position: 'symbol' };
          } else {
            return { node: an, position: 'text' };
          }
        }

        
      }
    }

    //if (ch.prev == '<' && ch.next[0] == '/') {
     //       return { node: an, position: 'symbol' };
    //       }

    return null;
  }

  function nodeNameAroundCursor(html) {
    var temp = html.replace('&lt;', '<').replace('&gt;', '>'),
        index = temp.indexOf(CURSOR),
        before = temp.lastIndexOf('<', index),
        after = temp.indexOf('>', index);

    if(before >= -1 && after > -1) {
      var text =temp.slice(before + 2, after);
          text = text.replace(CURSOR, '');
      return text.replace('/', '').toUpperCase();
    }
    return null;
  }

  global.Context = {
    context: context
  };
})(this)