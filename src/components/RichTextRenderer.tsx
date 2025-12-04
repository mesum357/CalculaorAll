"use client";

type ContentBlock = 
  | { type: 'heading1' | 'heading2' | 'heading3' | 'paragraph'; content: string }
  | { type: 'image'; url: string; alt?: string; width?: number; height?: number };

export function RichTextRenderer({ content }: { content: string | null | undefined }) {
  if (!content) {
    return <p className="text-muted-foreground">No description available for this calculator.</p>;
  }

  // Check if content is HTML (contains HTML tags)
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  
  if (isHTML) {
    // Render HTML directly with support for inline and internal CSS
    // Extract style tag if present and inject it
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const styleContent = styleMatch ? styleMatch[1] : null;
    const htmlContent = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    return (
      <>
        {styleContent && (
          <style dangerouslySetInnerHTML={{ __html: styleContent }} />
        )}
        <div 
          className="prose dark:prose-invert max-w-none calculator-description"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </>
    );
  }

  // Legacy JSON block format support (for backward compatibility)
  let blocks: ContentBlock[] = [];
  
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      blocks = parsed;
    } else {
      // Fallback to plain text
      blocks = [{ type: 'paragraph', content: content }];
    }
  } catch {
    // If it's not JSON, treat as plain text
    blocks = [{ type: 'paragraph', content: content }];
  }

  return (
    <div className="space-y-4 prose dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        if (block.type === 'image') {
          return (
            <div key={index} className="my-4">
              <img 
                src={block.url} 
                alt={block.alt || ''} 
                className="max-w-full h-auto rounded-lg border"
                style={{
                  width: block.width ? `${block.width}px` : 'auto',
                  height: block.height ? `${block.height}px` : 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          );
        }
        
        const blockContent = block.content || '';
        switch (block.type) {
          case 'heading1':
            return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{blockContent}</h1>;
          case 'heading2':
            return <h2 key={index} className="text-2xl font-semibold mt-5 mb-3">{blockContent}</h2>;
          case 'heading3':
            return <h3 key={index} className="text-xl font-medium mt-4 mb-2">{blockContent}</h3>;
          case 'paragraph':
          default:
            return <p key={index} className="text-sm text-muted-foreground whitespace-pre-line">{blockContent}</p>;
        }
      })}
    </div>
  );
}

