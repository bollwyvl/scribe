require({
  paths: {
    'scribe': './bower_components/scribe/scribe',
    'scribe-plugin-blockquote-command': './bower_components/scribe-plugin-blockquote-command/scribe-plugin-blockquote-command',
    'scribe-plugin-code-command': './bower_components/scribe-plugin-code-command/scribe-plugin-code-command',
    'scribe-plugin-curly-quotes': './bower_components/scribe-plugin-curly-quotes/scribe-plugin-curly-quotes',
    'scribe-plugin-formatter-plain-text-convert-new-lines-to-html': './bower_components/scribe-plugin-formatter-plain-text-convert-new-lines-to-html/scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
    'scribe-plugin-heading-command': './bower_components/scribe-plugin-heading-command/scribe-plugin-heading-command',
    'scribe-plugin-intelligent-unlink-command': './bower_components/scribe-plugin-intelligent-unlink-command/scribe-plugin-intelligent-unlink-command',
    'scribe-plugin-keyboard-shortcuts': './bower_components/scribe-plugin-keyboard-shortcuts/scribe-plugin-keyboard-shortcuts',
    'scribe-plugin-link-prompt-command': './bower_components/scribe-plugin-link-prompt-command/scribe-plugin-link-prompt-command',
    'scribe-plugin-sanitizer': './bower_components/scribe-plugin-sanitizer/scribe-plugin-sanitizer',
    'scribe-plugin-smart-lists': './bower_components/scribe-plugin-smart-lists/scribe-plugin-smart-lists',
    'scribe-plugin-toolbar': './bower_components/scribe-plugin-toolbar/scribe-plugin-toolbar',
    'codemirror': './bower_components/codemirror',
    'to-markdown': './bower_components/to-markdown/src/to-markdown',
    'he': './bower_components/he/he',
    'marked': './bower_components/marked/lib/marked'
  },
  shim: {
    'to-markdown': {
      deps: ['he'],
      exports: "toMarkdown"
    }
  }
}, [
  'scribe',
  'scribe-plugin-blockquote-command',
  'scribe-plugin-code-command',
  'scribe-plugin-curly-quotes',
  'scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
  'scribe-plugin-heading-command',
  'scribe-plugin-intelligent-unlink-command',
  'scribe-plugin-keyboard-shortcuts',
  'scribe-plugin-link-prompt-command',
  'scribe-plugin-sanitizer',
  'scribe-plugin-smart-lists',
  'scribe-plugin-toolbar',
  'to-markdown',
  'marked',
  'codemirror/lib/codemirror',
  'codemirror/mode/markdown/markdown'
], function (
  Scribe,
  scribePluginBlockquoteCommand,
  scribePluginCodeCommand,
  scribePluginCurlyQuotes,
  scribePluginFormatterPlainTextConvertNewLinesToHtml,
  scribePluginHeadingCommand,
  scribePluginIntelligentUnlinkCommand,
  scribePluginKeyboardShortcuts,
  scribePluginLinkPromptCommand,
  scribePluginSanitizer,
  scribePluginSmartLists,
  scribePluginToolbar,
  toMarkdown,
  marked,
  CodeMirror
) {

  'use strict';

  var scribe = new Scribe(document.querySelector('.scribe'), { allowBlockElements: true }),
    cm = window.cm = new CodeMirror(document.querySelector('.codemirror'), {
      mode: 'markdown',
      gfm: true
    });

  scribe.on('content-changed', updateMarkdown);
  cm.on('change', updateWYSIWYG);

  function updateMarkdown() {
    if(cm.hasFocus()){ return; }
    cm.setValue(toMarkdown(scribe.getHTML()));
  }
  
  function updateWYSIWYG(cm, change) {
    if(change.origin == 'setValue'){ return; };
    scribe.setHTML(marked.parse(cm.getValue()));
    setTimeout(function(){
      cm.display.input.blur();
      cm.focus();
    }, 0);
  }

  /**
   * Keyboard shortcuts
   */

  var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

  var commandsToKeyboardShortcutsMap = Object.freeze({
    bold: function (event) { return event.metaKey && event.keyCode === 66; }, // b
    italic: function (event) { return event.metaKey && event.keyCode === 73; }, // i
    strikeThrough: function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }, // s
    removeFormat: function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }, // a
    linkPrompt: function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }, // k
    unlink: function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }, // k,
    insertUnorderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }, // b
    insertOrderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }, // n
    blockquote: function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }, // w
    code: function (event) { return event.metaKey && event.shiftKey && event.keyCode === 76; }, // l
    h2: function (event) { return ctrlKey(event) && event.keyCode === 50; } // 2
  });

  /**
   * Plugins
   */

  scribe.use(scribePluginBlockquoteCommand());
  scribe.use(scribePluginCodeCommand());
  [1,2,3].map(function(i){
    scribe.use(scribePluginHeadingCommand(i));
  });
  scribe.use(scribePluginIntelligentUnlinkCommand());
  scribe.use(scribePluginLinkPromptCommand());
  scribe.use(scribePluginToolbar(document.querySelector('.toolbar')));
  scribe.use(scribePluginSmartLists());
  scribe.use(scribePluginCurlyQuotes());
  scribe.use(scribePluginKeyboardShortcuts(commandsToKeyboardShortcutsMap));

  // Formatters
  scribe.use(scribePluginSanitizer({
    tags: {
      p: {},
      br: {},
      b: {},
      strong: {},
      i: {},
      strike: {},
      blockquote: {},
      code: {},
      ol: {},
      ul: {},
      li: {},
      a: { href: true },
      h1: {},
      h2: {},
      h3: {}
    }
  }));
  scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

  if (scribe.allowsBlockElements()) {
    scribe.setContent('<p>Hello, World!</p>');
  } else {
    scribe.setContent('Hello, World!');
  }
});
