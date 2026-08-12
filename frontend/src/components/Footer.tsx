export function Footer() {
  return (
    <footer className="border-t border-vault/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink/60 sm:flex-row">
        <span className="font-body">
          Built on{' '}
          <a href="https://genlayer.com" target="_blank" rel="noreferrer" className="underline hover:text-copper">
            GenLayer
          </a>
        </span>
        <a
          href="https://portal.genlayer.foundation/"
          target="_blank"
          rel="noreferrer"
          className="font-body underline hover:text-copper"
        >
          Portal submission
        </a>
      </div>
    </footer>
  );
}
