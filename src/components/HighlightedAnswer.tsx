import { AnswerKind, getAnswerHighlightModel } from "../lib/answers";

type HighlightedAnswerProps = {
  text: string;
  kind: AnswerKind;
  className?: string;
};

export function HighlightedAnswer({ text, kind, className = "" }: HighlightedAnswerProps) {
  const { displayText, range } = getAnswerHighlightModel(text, kind);

  if (!range) {
    return <span className={`whitespace-pre-wrap break-words ${className}`}>{displayText}</span>;
  }

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {displayText.slice(0, range.start)}
      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-black text-amber-950 ring-1 ring-amber-200">
        {displayText.slice(range.start, range.end)}
      </span>
      {displayText.slice(range.end)}
    </span>
  );
}
