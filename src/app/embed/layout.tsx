import './embed.css';
import EmbedDocumentSync from '@/components/embed/EmbedDocumentSync';

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="embed-shell">
      {children}
      <EmbedDocumentSync />
    </div>
  );
}
