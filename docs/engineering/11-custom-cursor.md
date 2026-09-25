# 11. Custom Cursor

On desktop, the native cursor is hidden (`cursor: none`) and replaced with a DOM-based custom cursor.

- **Structure**: Uses a dot `#cursor-dot` and a glow `#cursor-glow`.
- **Magnetic Snap**: Buttons and links have event listeners. When hovered, the cursor scales up and removes its background, simulating a magnetic pull.
- **Blend Modes**: Uses `mix-blend-mode: difference` to ensure visibility across both dark and light sections of the website.
