export default function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-cobalt/20 py-2 text-center text-[11px] sm:text-xs tracking-wide text-lime/90 uppercase font-medium">
      {text}
    </div>
  );
}
