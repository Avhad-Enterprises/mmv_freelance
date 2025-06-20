import React, { useState, useEffect } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

const TextEditorComponent = ({
  label = "Description",
  name = "rich_text",
  onChange,
  initialValue = "",
}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    if (initialValue) {
      const contentBlock = htmlToDraft(initialValue);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks
        );
        const newEditorState = EditorState.createWithContent(contentState);
        // Only update editorState if the content is different
        const currentContent = editorState.getCurrentContent();
        const newContent = newEditorState.getCurrentContent();
        if (currentContent !== newContent) {
          setEditorState(newEditorState);
        }
      }
    }
  }, [initialValue]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    // Only call onChange if the content has changed
    const currentHtml = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    if (html !== currentHtml) {
      onChange(name, html);
    }
  };

  return (
    <div className="form-group mb-3">
      <label className="form-label">
        {label} {<span className="text-danger">*</span>}
      </label>
      <div
        className="rich-text-editor"
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "list",
              "textAlign",
              "link",
              "history",
            ],
            inline: { inDropdown: false },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            link: { inDropdown: false },
          }}
        />
      </div>
    </div>
  );
};

export default TextEditorComponent;
