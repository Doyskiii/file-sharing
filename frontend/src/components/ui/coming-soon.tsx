interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
      <p className="text-zinc-400">{description || 'This feature is coming soon...'}</p>
    </div>
  );
}