import React from 'react';

interface EventDescriptionProps {
  children: string;
  className?: string;
}

const ProcessedEventDescription: React.FC<EventDescriptionProps> = ({ children, className }) => {
  if (!children) return null;

  // Split text by @mentions (including periods in usernames)
  const parts = children.split(/(@[\w.]+)/g);
  
  const processedContent = parts.map((part, index) => {
    if (part.match(/^@[\w.]+$/)) {
      // This is a mention, convert to Instagram link
      const username = part.substring(1); // Remove the @
      return (
        <a
          key={index}
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#E1306C',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });

  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {processedContent}
    </div>
  );
};

export default ProcessedEventDescription; 