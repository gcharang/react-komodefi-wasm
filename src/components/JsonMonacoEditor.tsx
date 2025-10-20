import React, { useCallback, useRef, useEffect } from "react";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { JsonMonacoEditorProps } from "../types/components";

const JsonMonacoEditor: React.FC<JsonMonacoEditorProps> = ({
  value,
  onChange,
  onPaste,
  disabled = false,
  width,
  height,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Register paste event listener if onPaste callback is provided
    if (onPaste) {
      editor.onDidPaste(() => {
        // Get the current value after paste
        const currentValue = editor.getValue();
        onPaste(currentValue);
      });
    }

    // Focus the editor
    editor.focus();

    // Format document on mount if it's valid JSON
    try {
      JSON.parse(value);
      editor.getAction("editor.action.formatDocument")?.run();
    } catch {
      // Invalid JSON, skip formatting
    }
  };

  const handleEditorChange: OnChange = useCallback(
    (value) => {
      onChange(value || "");
    },
    [onChange],
  );

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
    fontSize: 13,
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    readOnly: disabled,
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    padding: {
      top: 12,
      bottom: 12,
    },
    lineNumbers: "on",
    glyphMargin: false,
    folding: true,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    renderLineHighlight: "all",
    contextmenu: true,
    // Disable all suggestions and autocomplete
    quickSuggestions: false,
    parameterHints: {
      enabled: false,
    },
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnCommitCharacter: false,
    tabCompletion: "off",
    snippetSuggestions: "none",
    wordBasedSuggestions: "off",
    inlineSuggest: {
      enabled: false,
    },
    codeLens: false,
    // Add visual indicator for disabled state
    ...(disabled && {
      renderWhitespace: "none",
      renderLineHighlight: "none",
      selectionHighlight: false,
      occurrencesHighlight: "off",
    }),
  };

  return (
    <Editor
      height={height || "100%"}
      width={width || "100%"}
      defaultLanguage="json"
      language="json"
      theme="vs-dark"
      value={value}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={options}
      loading={
        <div className="flex items-center justify-center h-full text-text-muted bg-primary-bg-900/50">
          <span className="text-sm">Loading editor...</span>
        </div>
      }
    />
  );
};

export default JsonMonacoEditor;
