export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`border rounded px-3 py-2 w-full h-24 ${props.className || ''}`}
    />
  );
}
