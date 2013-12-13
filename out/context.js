(function(global) {
  var CURSOR = '\u0001';
  //var CURSOR = 'XXCURSORXX';

  function context(renderer, markdown, cursor) {
    var beforeCursor = markdown.slice(0, cursor)
        actual = renderer.render(markdown),
        diff = renderer.render(beforeCursor + CURSOR + markdown.slice(cursor));
        ename = nodeNameAroundCursor(diff, 1)
        blockElements = ["address", "article", "aside", "audio", "blockquote", "canvas", "dd", "dl", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "noscript", "ol", "output", "p", "pre", "section", "table", "tfoot", "ul", "video"];
        isBlock = blockElements.indexOf(ename.toLowerCase()) > -1
        
        if(isBlock){
          console.log("isBlock")
          actual = actual.replace(/<p>(.*)<\/p>/, '$1'),
          diff = diff.replace(/<p>(.*)<\/p>/, '$1')
        } else if (!isBlock && ename.indexOf('<') == -1){
          console.log("!isBlock")
          afterCursor = markdown.slice(cursor)
          console.log(afterCursor)
          //need to slice after tag containing cursor and add in spaces then add back sliced portion
          upToTag = afterCursor.substr(0, afterCursor.indexOf('>') + 1)
          console.log("uptToTag", beforeCursor + upToTag)
          markdown  = beforeCursor + upToTag + " " + '\n' + afterCursor.split('>')[1]
          actual = renderer.render(markdown),
          diff = renderer.render(markdown.slice(0, cursor) + CURSOR + markdown.slice(cursor));
        } else {
          console.log("Normal")
          lastTag = lastClosingTag(beforeCursor)

          if(blockElements.indexOf(lastTag) > -1){
            afterBlock = "\n" + "\n" + "\n" + markdown.slice(beforeCursor.lastIndexOf('>') + 1)
            markdown = markdown.slice(0, beforeCursor.lastIndexOf('>') + 1) + afterBlock
          }
          actual = renderer.render(markdown),
          diff = renderer.render(markdown.slice(0, cursor) + CURSOR + markdown.slice(cursor));      
        }

    cnode = nodeNameAroundCursor(diff, 2)
    console.log('cnode', cnode)
    console.log('actual', actual)
    console.log('diff', diff)
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
        console.log('the cursor is possibly somewhere in opening/closing symbol')// , a.nodeName, an.parentNode.nodeName, an.nodeName, dn.nodeName, cnode)
        if(dn && cnode == dn.nodeName) {     
          if (next[0] == " " || next[0] == "" || next[0] == "\n"){    
            return { node: a, position: 'text' }
          } else {
            return { node: an.parentNode, position: 'symbol' };
          }
        }else if (next.toUpperCase() == '<' + an.nodeName.slice(0,1)){
          return { node: a, position: 'text' }
        } else if (next == '' && prev == '>') {
          return { node: a, position: 'text' }
        } if (an.nodeName != "H2"){
          if(next[0] == " " || next[0] == "" || next[0] == "\n") {
            return { node: a, position: 'text' }
          }
        }

        switch(an.nodeName) {
          case 'OL':
            break;
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
                if(prev == '*') {
                  return { node: a, position: 'text' }
                } else {
                  return { node: an, position: 'symbol' }
                }
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
        console.log('the cursor is somewhere in the attributes (like the url of a link)')
        return { node: an, position: 'attributes' };
      } else if(an.innerHTML != dn.innerHTML) {
        // the cursor is in the text somewhere or in a closing tag
        var ch = child(an, dn, next, prev, cnode);
        console.log('the cursor is in the text somewhere or in a closing tag')
        if(ch) { 
          if(next == " " || next == "" || next == "\n"){
            return { node: a, position: 'text' };
          } else {
            return ch;
          }
        } else if(cnode == an.nodeName) {
          return { node: an, position: 'symbol' };
        } else {
          return { node: an, position: 'text' };
        }
      }
    }
    return null;
  }

  function nodeNameAroundCursor(html, toCursor) {
    var temp = html.replace('&lt;', '<').replace('&gt;', '>')
        index = temp.indexOf(CURSOR)
        before = temp.lastIndexOf('<', index)
        after = temp.indexOf('>', index)

    if(before >= -1 && after > -1) {
      var text =temp.slice(before + toCursor, after);
          text = text.replace(CURSOR, '');
      return text.replace('/', '').toUpperCase();
    }
    return null;
  }

  function lastClosingTag(html) {
    var temp = html.replace('&lt;', '<').replace('&gt;', '>')
        before = temp.lastIndexOf('</')
        after = temp.lastIndexOf('>')

    if(before >= -1 && after > -1) {
      var text =temp.slice(before + 2, after);
      return text.toLowerCase();
    }
    return null;
  }

  global.Context = {
    context: context
  };
})(this)