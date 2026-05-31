import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useFetch } from "../../_helpers/useFetch";

const BASE = process.env.EXPO_PUBLIC_BACKEND_API;

// Toolbar button
function Btn({ label, active, disabled, onPress, title }) {
  return (
    <button
      type="button"
      title={title || label}
      onClick={onPress}
      disabled={disabled}
      style={{
        ...btnBase,
        fontWeight: active ? "700" : "400",
        background: active ? "#e0ecf5" : "#fff",
        color: disabled ? "#ccc" : "#3b78a1",
        borderColor: active ? "#3b78a1" : "#ced4da",
      }}
    >
      {label}
    </button>
  );
}

const btnBase = {
  height: 30,
  minWidth: 30,
  padding: "0 6px",
  border: "1px solid #ced4da",
  borderRadius: 5,
  cursor: "pointer",
  fontSize: 13,
  lineHeight: "28px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function RichTextEditor({ value, onChange, onUploadImage }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cFetch = useFetch();
  // Guard against re-setting content from external value while the user is typing
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener" } }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      isInternalChange.current = true;
      onChange?.(editor.getHTML());
    },
  });

  // Sync externally-set value (e.g. pre-fill reseed) into the editor
  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    // Only update if the content actually changed to avoid cursor jumps
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const handleLinkInsert = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (!url) return;
    if (editor.state.selection.empty) {
      const text = window.prompt("Link text:", url);
      editor.chain().focus().insertContent(`<a href="${url}">${text || url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // Strip the "data:image/png;base64," prefix
      const base64 = dataUrl.split(",")[1];
      const res = await cFetch
        .post(`${BASE}/api/activities/upload-image`, { name: file.name, data: base64 })
        .catch(() => null);
      if (res?.url) {
        editor.chain().focus().setImage({ src: res.url, alt: file.name }).run();
      } else {
        alert("Image upload failed. Make sure the backend is running.");
      }
    } finally {
      setUploading(false);
    }
  };

  if (!editor) return null;

  return (
    <View style={{ flex: 1 }}>
      <style>{editorStyles}</style>

      {/* Toolbar */}
      <div style={toolbarStyle}>
        <Btn
          label="B"
          title="Bold"
          active={editor.isActive("bold")}
          onPress={() => editor.chain().focus().toggleBold().run()}
        />
        <Btn
          label="I"
          title="Italic"
          active={editor.isActive("italic")}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        />
        <Btn
          label="•≡"
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Btn
          label="1≡"
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Btn
          label="🔗"
          title="Insert link"
          active={editor.isActive("link")}
          onPress={handleLinkInsert}
        />
        <Btn
          label={uploading ? "⏳" : "🖼"}
          title="Upload image"
          disabled={uploading}
          onPress={handleImagePick}
        />
        {editor.isActive("link") && (
          <Btn
            label="✕ link"
            title="Remove link"
            onPress={() => editor.chain().focus().unsetLink().run()}
          />
        )}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="rich-editor-content" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </View>
  );
}

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
  padding: "6px 8px",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#ced4da",
  borderBottomWidth: 0,
  borderRadius: "8px 8px 0 0",
  backgroundColor: "#f8f9fa",
};

const editorStyles = `
  .rich-editor-content {
    border: 1px solid #ced4da;
    border-radius: 0 0 8px 8px;
    background: #fff;
    min-height: 180px;
    cursor: text;
  }
  .rich-editor-content .tiptap {
    padding: 12px 14px;
    outline: none;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 15px;
    color: #495057;
    line-height: 1.6;
    min-height: 180px;
  }
  .rich-editor-content .tiptap p { margin: 0 0 8px; }
  .rich-editor-content .tiptap ul,
  .rich-editor-content .tiptap ol { padding-left: 20px; margin: 0 0 8px; }
  .rich-editor-content .tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
    display: block;
  }
  .rich-editor-content .tiptap a { color: #3b78a1; }
`;
