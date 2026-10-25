import assert from "node:assert/strict";
import { test } from "node:test";

import { copyableJoin, copyableText, copiedNotice, copyFailureNotice } from "../src/ui/copy.ts";

test("copyableText strips terminal controls and preview-only whitespace", () => {
	assert.equal(
		copyableText("\n\n- A\u001b[2JB\u001b]52;c;secret\u0007\n  continuation\t界  \n"),
		"- AB\n  continuation    界",
	);
	assert.equal(copyableText("  leading spaces stay\nsecond line"), "  leading spaces stay\nsecond line");
	assert.equal(copyableText("\n\u001b[31m\n"), "");
});

test("copyableJoin keeps one blank line between non-empty pieces", () => {
	assert.equal(copyableJoin(["first\n", "", "  ", "second\nthird"]), "first\n\nsecond\nthird");
	assert.equal(copyableJoin([]), "");
});

test("copy notices count characters and sanitize failures", () => {
	assert.deepEqual(copiedNotice("hello\nworld"), { text: "Copied 11 chars", kind: "success" });
	assert.deepEqual(copyFailureNotice(new Error("failed\u001b]52;c;secret\u0007")), {
		text: "Copy failed: failed",
		kind: "error",
	});
});
