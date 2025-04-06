import React, { useState } from 'react';

export function Tabs({ defaultValue, onValueChange, children }) {
  const [current, setCurrent] = useState(defaultValue);
  return React.Children.map(children, (child) => {
    if (child.type === TabsList) {
      return React.cloneElement(child, { current, setCurrent, onValueChange });
    }
    if (child.props.value === current) {
      return child;
    }
    return null;
  });
}

export function TabsList({ children, current, setCurrent, onValueChange, className }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { current, setCurrent, onValueChange })
      )}
    </div>
  );
}

export function TabsTrigger({ value, children, current, setCurrent, onValueChange }) {
  const active = current === value;
  return (
    <button
      onClick={() => {
        setCurrent(value);
        onValueChange?.(value);
      }}
      className={`px-3 py-1 rounded ${active ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children }) {
  return <div>{children}</div>;
}
