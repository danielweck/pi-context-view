/**
 * Clipboard payload helpers shared by the Usage and Injections views. The
 * copied text is the captured content itself: terminal control sequences are
 * stripped, but preview-only wrapping, indentation, subheaders, and JSON
 * expansion stay out so a paste keeps the content's own representation.
 */
import { normalizeInlineText, normalizePreviewText } from "../text.ts";
import type { Hint } from "./layout.ts";

/** Hint-row entry advertising the copy action; narrow widths drop it first. */
export const COPY_HINT: Hint = ["c", "Copy", true];

/** Clipboard writer injected by the host, or stubbed by a test. */
export type CopyText = (text: string) => Promise<void>;

/** View hooks around a copy: how text reaches the clipboard and how to redraw its confirmation. */
export interface CopyActions {
	readonly copyText?: CopyText;
	/** Request a redraw after an asynchronous clipboard result. */
	readonly refresh?: () => void;
}

/** One line of copy confirmation or failure feedback. */
export interface CopyNotice {
	readonly text: string;
	readonly kind: "pending" | "success" | "error";
}

/** Clean captured text for the clipboard without changing its content. */
export function copyableText(text: string): string {
	return normalizePreviewText(text).replace(/^\n+/, "").trimEnd();
}

/** Join several captured texts with one blank line, dropping empty pieces. */
export function copyableJoin(texts: Iterable<string>): string {
	return [...texts]
		.map(copyableText)
		.filter((text) => text.length > 0)
		.join("\n\n");
}

/** Short, human-readable confirmation of how much text reached the clipboard. */
export function copiedNotice(text: string): CopyNotice {
	return { text: `Copied ${text.length.toLocaleString("en-US")} chars`, kind: "success" };
}

/** Failure feedback for a clipboard write, with any terminal control text removed. */
export function copyFailureNotice(error: unknown): CopyNotice {
	const message = error instanceof Error ? error.message : String(error);
	return { text: `Copy failed: ${normalizeInlineText(message)}`, kind: "error" };
}
