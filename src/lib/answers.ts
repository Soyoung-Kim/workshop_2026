export type AnswerKind = "teamLike" | "teamReason";

const templates = {
  teamLike: {
    before: "내가 생각하는 우리 팀(파트)은 ",
    after: " 같다.",
    prefixPattern: /^(?:내가\s*생각하는\s*)?우리\s*팀(?:\(파트\))?은\s*/,
    searchPrefixPattern: /(?:내가\s*생각하는\s*)?우리\s*팀(?:\(파트\))?은\s*/,
    suffixPattern: /\s*같(?:다|습니다|아요|네요|은|았다|을|다고)?/,
  },
  teamReason: {
    before: "",
    after: " 때문이다.",
    prefixPattern: /^/,
    searchPrefixPattern: /^/,
    suffixPattern: /\s*때문(?:이다|입니다|이에요|예요|이라고|이라서|이어서|이고|인|이라)?/,
  },
};

const legacyWithoutTeam = {
  prefixPattern: /^우리\s*팀이\s*없다면\s*/,
  searchPrefixPattern: /우리\s*팀이\s*없다면\s*/,
  suffixPattern: /\s*(?:될\s*것(?:이다|입니다)?|될\s*거(?:다|예요)?|된다|될)/,
};

export function composeAnswerText(kind: AnswerKind, phrase: string) {
  const template = templates[kind];
  return `${template.before}${phrase.trim()}${template.after}`;
}

export function getAnswerPhrase(text: string, kind: AnswerKind) {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  const range = getHighlightRange(text, kind);

  if (range) {
    return text.slice(range.start, range.end).trim();
  }

  const template = templates[kind];
  const prefix = template.prefixPattern.exec(trimmed);

  if (kind === "teamLike" && prefix) {
    return trimmed.slice(prefix[0].length).trim();
  }

  if (kind === "teamReason") {
    const legacyRange = getLegacyWithoutTeamRange(text);

    if (legacyRange) {
      return text.slice(legacyRange.start, legacyRange.end).trim();
    }
  }

  return trimmed;
}

export function getAnswerHighlightModel(text: string, kind: AnswerKind) {
  const phrase = getAnswerPhrase(text, kind);

  if (!phrase) {
    return { displayText: "", range: null };
  }

  const template = templates[kind];
  const displayText = composeAnswerText(kind, phrase);

  return {
    displayText,
    range: {
      start: template.before.length,
      end: template.before.length + phrase.length,
    },
  };
}

function getHighlightRange(text: string, kind: AnswerKind) {
  const template = templates[kind];
  const prefix = template.searchPrefixPattern.exec(text);
  const searchStart = prefix ? prefix.index + prefix[0].length : 0;
  const suffix = template.suffixPattern.exec(text.slice(searchStart));

  if (suffix && suffix.index > 0) {
    return trimRange(text, searchStart, searchStart + suffix.index);
  }

  return null;
}

function getLegacyWithoutTeamRange(text: string) {
  const prefix = legacyWithoutTeam.searchPrefixPattern.exec(text);
  const searchStart = prefix ? prefix.index + prefix[0].length : 0;
  const suffix = legacyWithoutTeam.suffixPattern.exec(text.slice(searchStart));

  if (suffix && suffix.index > 0) {
    return trimRange(text, searchStart, searchStart + suffix.index);
  }

  const directPrefix = legacyWithoutTeam.prefixPattern.exec(text.trim());

  if (directPrefix) {
    return trimRange(text, directPrefix[0].length, text.trim().length);
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
