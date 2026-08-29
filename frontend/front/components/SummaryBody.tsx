import type { Summary } from "@/lib/types";

/**
 * Renders a summary's sections according to its declared format.
 *
 * Body lines use light conventions (see lib/types.ts):
 *   "- "  bullet, two-space indent = one tree level
 *   "> "  tip / callout
 *   "Q: " / "A: "  question/answer pair (qa, flashcards)
 */

interface Line {
  kind: "bullet" | "tip" | "para";
  depth: number;
  text: string;
}

function parseLines(body: string): Line[] {
  return body
    .split("\n")
    .filter((raw) => raw.trim().length > 0)
    .map((raw) => {
      const indent = raw.length - raw.trimStart().length;
      const t = raw.trim();
      if (t.startsWith("- ")) return { kind: "bullet", depth: Math.floor(indent / 2), text: t.slice(2) };
      if (t.startsWith("> ")) return { kind: "tip", depth: 0, text: t.slice(2) };
      return { kind: "para", depth: 0, text: t };
    });
}

interface QaPair {
  q: string;
  a: string;
}

function parseQa(body: string): QaPair[] {
  const pairs: QaPair[] = [];
  let current: QaPair | null = null;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line.length === 0) continue;
    if (line.startsWith("Q: ")) {
      if (current) pairs.push(current);
      current = { q: line.slice(3), a: "" };
    } else if (line.startsWith("A: ") && current) {
      current.a = line.slice(3);
      pairs.push(current);
      current = null;
    }
  }
  if (current) pairs.push(current);
  return pairs;
}

// ---------- bullets / outline / mindmap: nested tree ----------

interface Node {
  line: Line;
  children: Node[];
}

function buildTree(lines: Line[]): Node[] {
  const roots: Node[] = [];
  const stack: Node[] = [];
  for (const line of lines) {
    const node: Node = { line, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].line.depth >= line.depth) stack.pop();
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return roots;
}

function Tree({ nodes, variant }: { nodes: Node[]; variant: "bullets" | "outline" | "mindmap" }) {
  const ul =
    variant === "bullets"
      ? "space-y-1.5"
      : variant === "outline"
        ? "space-y-2"
        : "space-y-2";
  return (
    <ul className={ul}>
      {nodes.map((node, i) => (
        <li key={`${node.line.text}-${i}`}>
          {variant === "bullets" ? (
            <span className="flex gap-2.5">
              <span
                className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent ${node.line.depth > 0 ? "opacity-50" : ""}`}
              />
              <span className="text-[15px] leading-relaxed">{node.line.text}</span>
            </span>
          ) : variant === "outline" ? (
            <span className="block border-l-2 border-line pl-4 text-[15px] leading-relaxed">
              {node.line.text}
            </span>
          ) : (
            <span
              className={`inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[13px] leading-snug dark:border-emerald-400/25 dark:bg-emerald-400/10 ${
                node.line.depth > 0 ? "ml-2" : "font-medium"
              }`}
            >
              {node.line.text}
            </span>
          )}
          {node.children.length > 0 && (
            <div className={variant === "bullets" ? "ml-4 mt-1.5" : "mt-1.5"}>
              <Tree nodes={node.children} variant={variant} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// ---------- section body renderers ----------

function Body({ body, format }: { body: string; format: Summary["format"] }) {
  if (format === "qa" || format === "flashcards") {
    const pairs = parseQa(body);
    if (format === "flashcards") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {pairs.map((pair, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-background p-4 text-sm shadow-sm"
            >
              <p className="font-semibold text-accent">{pair.q}</p>
              <p className="mt-2 border-t border-line pt-2 leading-relaxed text-foreground/90">
                {pair.a}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {pairs.map((pair, i) => (
          <div key={i} className="rounded-xl bg-background p-4 text-sm">
            <p className="flex gap-2 font-medium">
              <span className="shrink-0 rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-400/15 dark:text-rose-300">
                Q
              </span>
              {pair.q}
            </p>
            <p className="mt-1.5 flex gap-2 pl-0.5 leading-relaxed text-foreground/90">
              <span className="shrink-0 rounded bg-sky-100 px-1.5 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
                A
              </span>
              <span>{pair.a}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (format === "narrative") {
    return (
      <div className="space-y-3">
        {parseLines(body).map((line, i) =>
          line.kind === "tip" ? (
            <Tip key={i} text={line.text} />
          ) : (
            <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
              {line.text}
            </p>
          )
        )}
      </div>
    );
  }

  const lines = parseLines(body);
  const tree = buildTree(lines.filter((l) => l.kind === "bullet"));
  const tips = lines.filter((l) => l.kind === "tip");
  const variant = format === "mindmap" ? "mindmap" : format === "outline" ? "outline" : "bullets";
  return (
    <div className="space-y-3">
      {tree.length > 0 && <Tree nodes={tree} variant={variant} />}
      {tips.map((tip, i) => (
        <Tip key={i} text={tip.text} />
      ))}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <p className="flex gap-2 rounded-xl bg-accent-soft px-4 py-2.5 text-sm text-accent">
      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 fill-current" aria-hidden>
        <path d="M10 2a5.5 5.5 0 00-3 10.1c.4.3.7.8.7 1.3v.6a1 1 0 001 1h2.6a1 1 0 001-1v-.6c0-.5.3-1 .7-1.3A5.5 5.5 0 0010 2zM8 17h4v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1z" />
      </svg>
      <span className="leading-relaxed">{text}</span>
    </p>
  );
}

export function SummaryBody({ summary }: { summary: Summary }) {
  return (
    <div className="space-y-8">
      {summary.sections.map((section, i) => (
        <section key={i}>
          <h2 className="mb-3 text-lg font-bold tracking-tight">{section.heading}</h2>
          <Body body={section.body} format={summary.format} />
        </section>
      ))}
    </div>
  );
}
