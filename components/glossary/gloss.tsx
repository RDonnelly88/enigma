import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { gloss } from "@/lib/glossary";
import { Term } from "./glossary";

/** Elements that hold sentences: text inside them is reading. Anything else, like a label or a legend, is left alone. */
const SENTENCES = new Set(["p", "li", "blockquote"]);
/** Elements passed through on the way to sentences, or inside them. */
const THROUGH = new Set(["span", "em", "strong", "i", "b", "ul", "ol", "div", "section", "figure"]);

/** Marks a component whose children are reading, so a block's rule reaches inside it. */
export function readable<T extends object>(component: T): T {
  return Object.assign(component, { readable: true });
}

function walk(node: ReactNode, seen: Set<string>, reading = false): ReactNode {
  if (typeof node === "string") {
    if (!reading) return node;
    return gloss(node, seen).map((piece, i) =>
      typeof piece === "string" ? (
        piece
      ) : (
        <Term key={i} id={piece.id}>
          {piece.text}
        </Term>
      ),
    );
  }
  if (Array.isArray(node)) return Children.map(node, (child) => walk(child, seen, reading));
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ id?: string; children?: ReactNode }>;
  // A term written out by hand counts as its block's first mention
  if (el.type === Term) {
    if (el.props.id) seen.add(el.props.id);
    return el;
  }
  const host = typeof el.type === "string" ? el.type : null;
  // A component marked readable holds sentences, like a paragraph
  const sentences = host ? SENTENCES.has(host) : (el.type as { readable?: boolean }).readable === true;
  if (!(sentences || (host && THROUGH.has(host))) || el.props.children === undefined) return el;
  return cloneElement(el, undefined, walk(el.props.children, seen, reading || sentences));
}

/**
 * One block of reading with its glossary terms underlined: the first mention
 * of each, once, wherever it falls in the block. Links, buttons and other
 * components inside are left alone.
 */
export function Gloss({ children }: { children: ReactNode }) {
  return <>{walk(children, new Set())}</>;
}

/** For a block split across several places, like a chapter's opening and its prose: one set of first mentions for all. */
export function glossBlock() {
  const seen = new Set<string>();
  return (node: ReactNode) => walk(node, seen);
}
