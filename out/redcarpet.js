(function(global) {
  // void
  // sdhtml_renderer(struct sd_callbacks *callbacks, struct html_renderopt *options, unsigned int render_flags)
  var sdhtml_renderer = Module.cwrap('sdhtml_renderer', null, ['number', 'number', 'number']);

  // struct sd_markdown *
  // sd_markdown_new(
  //   unsigned int extensions,
  //   size_t max_nesting,
  //   const struct sd_callbacks *callbacks,
  //   void *opaque)
  var sd_markdown_new = Module.cwrap('sd_markdown_new', 'number', ['number', 'number', 'number', 'number']);

  // void
  // sd_markdown_render(struct buf *ob, const uint8_t *document, size_t doc_size, struct sd_markdown *md)
  var sd_markdown_render = Module.cwrap('sd_markdown_render', null, ['number', 'string', 'number', 'number']);

  // void
  // sd_markdown_free(struct sd_markdown *md)
  var sd_markdown_free = Module.cwrap('sd_markdown_free', null, ['number']);

  // extern struct sd_callbacks* create_sd_callbacks();
  var create_sd_callbacks = Module.cwrap('create_sd_callbacks', 'number', []);

  // extern struct html_renderopt* create_html_renderopt();
  var create_html_renderopt = Module.cwrap('create_html_renderopt', 'number', []);

  // struct buf *bufnew(size_t) __attribute__ ((malloc));
  var bufnew = Module.cwrap('bufnew', 'number', ['number']);

  // const char *bufcstr(struct buf *);
  var bufcstr = Module.cwrap('bufcstr', 'string', ['number']);

  // void bufrelease(struct buf *);
  var bufrelease = Module.cwrap('bufrelease', null, ['number']);

  var HTML_SKIP_HTML    = (1 << 0)
  var HTML_SKIP_STYLE   = (1 << 1)
  var HTML_SKIP_IMAGES  = (1 << 2)
  var HTML_SKIP_LINKS   = (1 << 3)
  var HTML_EXPAND_TABS  = (1 << 4)
  var HTML_SAFELINK     = (1 << 5)
  var HTML_TOC          = (1 << 6)
  var HTML_HARD_WRAP    = (1 << 7)
  var HTML_USE_XHTML    = (1 << 8)
  var HTML_ESCAPE       = (1 << 9)
  var HTML_PRETTIFY     = (1 << 10)

  var Redcarpet = {}
  Redcarpet.Markdown = function(renderer, extensions) {
    if(!extensions) {
      extensions = 0;
    }

    // TODO: extensions
    this.renderer = renderer;
    this.markdown = sd_markdown_new(extensions, 16, renderer.callbacks, renderer.options);
  }

  // TODO: release memory
  Redcarpet.Markdown.prototype.render = function(text) {
    if('preprocess' in this.renderer) {
      text = this.renderer.preprocess(text);
    }

    if(!text || text == '') {
      return null;
    }

    var output_buf = bufnew(128);
    sd_markdown_render(output_buf, text, text.length, this.markdown);
    text = bufcstr(output_buf);
    bufrelease(output_buf);

    if('postprocess' in this.renderer) {
      text = this.renderer.postprocess(text);
    }

    return text;
  }

  Redcarpet.Render = {}
  Redcarpet.Render.Base = function() {
    // TODO: callbacks
  }

  Redcarpet.Render.HTML = function(render_options) {
    // TODO: render_options
    this.options = create_html_renderopt();
    this.callbacks = create_sd_callbacks();
    sdhtml_renderer(this.callbacks, this.options, 0);
  }

  global.Redcarpet = Redcarpet;
})(this);