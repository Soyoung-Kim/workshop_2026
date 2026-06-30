type HighlightKind = "teamLike" | "withoutTeam";

type HighlightedAnswerProps = {
  text: string;
  kind: HighlightKind;
  className?: string;
};

export function HighlightedAnswer({ text, kind, className = "" }: HighlightedAnswerProps) {
  const { displayText, range } = getHighlightModel(text, kind);

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

function getHighlightModel(text: string, kind: HighlightKind) {
  const range = getHighlightRange(text, kind);

  if (range) {
    return { displayText: text, range };
  }

  const prefixPattern = kind === "teamLike" ? /^우리\s*팀은\s*/ : /^우리\s*팀이\s*없다면\s*/;
  const prefix = prefixPattern.exec(text);

  if (prefix) {
    return {
      displayText: text,
      range: trimRange(text, prefix[0].length, text.length),
    };
  }

  const trimmed = text.trim();

  if (!trimmed) {
    return { displayText: text, range: null };
  }

  const template =
    kind === "teamLike"
      ? { before: "우리 팀은 ", after: " 같다." }
      : { before: "우리 팀이 없다면 ", after: " 될 것이다." };
  const displayText = `${template.before}${trimmed}${template.after}`;

  return {
    displayText,
    range: {
      start: template.before.length,
      end: template.before.length + trimmed.length,
    },
  };
}

function getHighlightRange(text: string, kind: HighlightKind) {
  const prefixPattern = kind === "teamLike" ? /우리\s*팀은\s*/ : /우리\s*팀이\s*없다면\s*/;
  const suffixPattern =
    kind === "teamLike"
      ? /\s*같(?:다|습니다|아요|네요|은|았다|을|다고)?/
      : /\s*(?:될\s*것(?:이다|입니다)?|될\s*거(?:다|예요)?|된다|될)/;

  const prefix = prefixPattern.exec(text);
  const searchStart = prefix ? prefix.index + prefix[0].length : 0;
  const suffix = suffixPattern.exec(text.slice(searchStart));

  if (suffix && suffix.index > 0) {
    return trimRange(text, searchStart, searchStart + suffix.index);
  }

  return null;
}

function trimRange(text: string, start: number, end: number) {
  let nextStart = start;
  let nextEnd = end;

  while (nextStart < nextEnd && /\s/.test(text[nextStart])) {
    nextStart += 1;
  }

  while (nextEnd > nextStart && /\s/.test(text[nextEnd - 1])) {
    nextEnd -= 1;
  }

  if (nextStart >= nextEnd) {
    return null;
  }

  return { start: nextStart, end: nextEnd };
}
