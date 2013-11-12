(function() {
  var STATES = {
    EMPTY: {},
    LINE_START: {
      possible: BLOCK_STATES + SPAN_STATES
    },
    HEADING: {
      possible: SPAN_STATES
    }
  }
});