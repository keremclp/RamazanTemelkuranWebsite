interface PageIntroProps {
  title: string;
  description?: string;
}

export default function PageIntro({ title, description }: PageIntroProps) {
  return (
    <header className="mb-6 text-center animate-fade-in-up sm:mb-8 lg:mb-10">
      <h1 className="text-3xl font-bold text-primary font-[family-name:var(--font-heading)] sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <div className="mx-auto mt-2.5 h-1 w-14 bg-accent sm:mt-3 sm:w-16" />
      {description && (
        <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-relaxed text-muted sm:mt-3 sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
