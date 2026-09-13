import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import clsx from "clsx";
import css from "./StateDot.module.css";
import css$1 from "./DisclosureRow.module.css";
import css$2 from "./Button.module.css";
import css$3 from "./Pill.module.css";
import css$4 from "./Tag.module.css";
import css$5 from "./Switch.module.css";
import css$6 from "./Input.module.css";
import { Fragment as Fragment$1, cloneElement, createElement, memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import css$7 from "./Menu.module.css";
import css$8 from "./HoverCard.module.css";
import css$9 from "./Modal.module.css";
import css$10 from "./OnboardingSurface.module.css";
import css$11 from "./RiskConfirmation.module.css";
import css$12 from "./ConnectionIndicator.module.css";
import css$13 from "./FileTypeIcon.module.css";
import css$14 from "./user-text.module.css";
import css$15 from "./Tooltip.module.css";
import css$16 from "./Toast.module.css";
import css$17 from "./JsonTree.module.css";
import Anser from "anser";
import css$18 from "./TerminalBlock.module.css";
import { createCssVariablesTheme, createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine, defaultJavaScriptRegexConstructor } from "shiki/engine/javascript";
import langTs from "@shikijs/langs/typescript";
import langBash from "@shikijs/langs/shellscript";
import langJson from "@shikijs/langs/json";
import css$19 from "./ReadBlock.module.css";
import css$20 from "./DiffBlock.module.css";
import css$21 from "./SearchBlock.module.css";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { attention } from "micromark-core-commonmark";
import { markdownLineEnding, unicodePunctuation } from "micromark-util-character";
import { classifyCharacter } from "micromark-util-classify-character";
import { codes, constants, types } from "micromark-util-symbol";
import { factorySpace } from "micromark-factory-space";
import { normalizeUri } from "micromark-util-sanitize-uri";
import css$22 from "./markdown/CodeBlock.module.css";
import katex from "katex";
import css$23 from "./markdown/MarkdownText.module.css";
import "katex/dist/katex.min.css";
import css$24 from "./WebBlock.module.css";
import css$25 from "./markdown/JsonBlock.module.css";
//#region lib/types/StateDot.js
/** Outer 3x3 matrix cells (2px pixels on a 10px grid), clockwise from top-left. */
const MATRIX_CELLS = [
	[0, 0],
	[4, 0],
	[8, 0],
	[8, 4],
	[8, 8],
	[4, 8],
	[0, 8],
	[0, 4]
];
/**
* Render a state dot.
* @param props.state - which of `done`, `warning`, `ongoing`, `error`, or `idle` to show.
* @param props.size - outer diameter in px (default 10, the figma size).
* @param props.className - extra class for layout placement.
* @returns the dot element (aria-hidden; pair with text for accessibility).
*/
function StateDot({ state, size = 10, className }) {
	if (state === "ongoing") return jsx("svg", {
		className: clsx(css.matrix, className),
		"data-state": "ongoing",
		width: size,
		height: size,
		viewBox: "0 0 10 10",
		shapeRendering: "crispEdges",
		"aria-hidden": "true",
		children: MATRIX_CELLS.map(([x, y], index) => jsx("rect", {
			className: css.cell,
			x,
			y,
			width: "2",
			height: "2",
			style: { animationDelay: `${(index - MATRIX_CELLS.length) * 125}ms` }
		}, `${x}-${y}`))
	});
	return jsx("span", {
		className: clsx(css.dot, className),
		"data-state": state,
		style: {
			width: size,
			height: size
		},
		"aria-hidden": "true"
	});
}
//#endregion
//#region lib/types/icons/index.js
/** NewChat — stroke glyph on the shared 1.5px language. */
const IconNewChatOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 8, r: 5.9, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 5.4v5.2M5.4 8h5.2", vectorEffect: "non-scaling-stroke" })
	]
});
/** Search — stroke glyph on the shared 1.5px language. */
const IconSearchOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 6.9, cy: 6.9, r: 4.9, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M10.55 10.55 14.3 14.3", vectorEffect: "non-scaling-stroke" })
	]
});
/** Globe — stroke glyph on the shared 1.5px language. */
const IconGlobeOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 7, cy: 7, r: 5.4, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M7 1.6c2.1 1.7 2.1 9.1 0 10.8-2.1-1.7-2.1-9.1 0-10.8Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M1.7 7h10.6", vectorEffect: "non-scaling-stroke" })
	]
});
/** Settings — stroke glyph on the shared 1.5px language. */
const IconSettingsOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M12.66 5.735A5.8 5.8 0 0 1 12.66 8.265L11.065 8.684A4.4 4.4 0 0 1 11.065 8.684L11.897 10.108A5.8 5.8 0 0 1 10.108 11.897L8.684 11.065A4.4 4.4 0 0 1 8.684 11.065L8.265 12.66A5.8 5.8 0 0 1 5.735 12.66L5.316 11.065A4.4 4.4 0 0 1 5.316 11.065L3.892 11.897A5.8 5.8 0 0 1 2.103 10.108L2.935 8.684A4.4 4.4 0 0 1 2.935 8.684L1.34 8.265A5.8 5.8 0 0 1 1.34 5.735L2.935 5.316A4.4 4.4 0 0 1 2.935 5.316L2.103 3.892A5.8 5.8 0 0 1 3.892 2.103L5.316 2.935A4.4 4.4 0 0 1 5.316 2.935L5.735 1.34A5.8 5.8 0 0 1 8.265 1.34L8.684 2.935A4.4 4.4 0 0 1 8.684 2.935L10.108 2.103A5.8 5.8 0 0 1 11.897 3.892L11.065 5.316A4.4 4.4 0 0 1 11.065 5.316Z", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 7, cy: 7, r: 2.1, vectorEffect: "non-scaling-stroke" })
	]
});
/** Settings — stroke glyph on the shared 1.5px language. */
const IconSettingsOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M14.441 6.56A6.6 6.6 0 0 1 14.441 9.44L12.619 9.913A5 5 0 0 1 12.619 9.913L13.573 11.536A6.6 6.6 0 0 1 11.536 13.573L9.913 12.619A5 5 0 0 1 9.913 12.619L9.44 14.441A6.6 6.6 0 0 1 6.56 14.441L6.087 12.619A5 5 0 0 1 6.087 12.619L4.464 13.573A6.6 6.6 0 0 1 2.427 11.536L3.381 9.913A5 5 0 0 1 3.381 9.913L1.559 9.44A6.6 6.6 0 0 1 1.559 6.56L3.381 6.087A5 5 0 0 1 3.381 6.087L2.427 4.464A6.6 6.6 0 0 1 4.464 2.427L6.087 3.381A5 5 0 0 1 6.087 3.381L6.56 1.559A6.6 6.6 0 0 1 9.44 1.559L9.913 3.381A5 5 0 0 1 9.913 3.381L11.536 2.427A6.6 6.6 0 0 1 13.573 4.464L12.619 6.087A5 5 0 0 1 12.619 6.087Z", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 8, cy: 8, r: 2.4, vectorEffect: "non-scaling-stroke" })
	]
});
/** PanelLeft — stroke glyph on the shared 1.5px language. */
const IconPanelLeftOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 1.9, y: 2.7, width: 12.2, height: 10.6, rx: 2.6, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.4 2.7v10.6", vectorEffect: "non-scaling-stroke" })
	]
});
/** Ellipsis — stroke glyph on the shared 1.5px language. */
const IconEllipsisOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 3.5, cy: 8, r: 1.25, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 8, cy: 8, r: 1.25, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 12.5, cy: 8, r: 1.25, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" })
	]
});
/** Plus — stroke glyph on the shared 1.5px language. */
const IconPlusOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M8 3.2v9.6M3.2 8h9.6", vectorEffect: "non-scaling-stroke" })
});
/** Check — stroke glyph on the shared 1.5px language. */
const IconCheckOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M2.9 8.4 6.3 11.8 13.1 4.6", vectorEffect: "non-scaling-stroke" })
});
/** Check — stroke glyph on the shared 1.5px language. */
const IconCheckOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M2.5 7.4 5.5 10.4 11.5 4.2", vectorEffect: "non-scaling-stroke" })
});
/** Branch — stroke glyph on the shared 1.5px language. */
const IconBranchOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 4.5, cy: 4, r: 1.9, vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 4.5, cy: 12, r: 1.9, vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 11.5, cy: 4, r: 1.9, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M4.5 5.9v4.2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M11.5 5.9v1.1a3.5 3.5 0 0 1-3.5 3.5H6.4", vectorEffect: "non-scaling-stroke" })
	]
});
/** ChevronDown — stroke glyph on the shared 1.5px language. */
const IconChevronDownOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M3.4 5.4 7 8.6 10.6 5.4", vectorEffect: "non-scaling-stroke" })
});
/** ChevronLeft — stroke glyph on the shared 1.5px language. */
const IconChevronLeftOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M8.6 3.4 5.4 7l3.2 3.6", vectorEffect: "non-scaling-stroke" })
});
/** ChevronRight — stroke glyph on the shared 1.5px language. */
const IconChevronRightOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M5.4 3.4 8.6 7l-3.2 3.6", vectorEffect: "non-scaling-stroke" })
});
/** ic_ds_triangle_right_fill_14 — tree expand arrow; points right, consumers rotate it 90° for the open state. */
const IconTriangleRightFill14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: jsx("path", {
		d: "M4.25 2.82782L4.25 11.1722C4.25 11.6622 4.84243 11.9076 5.18891 11.5611L9.36109 7.38891C9.57588 7.17412 9.57588 6.82588 9.36109 6.61109L5.18891 2.43891C4.84243 2.09243 4.25 2.33782 4.25 2.82782Z",
		fill: "currentColor"
	})
});
/** ChevronUp — stroke glyph on the shared 1.5px language. */
const IconChevronUpOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M3.4 8.6 7 5.4l3.6 3.2", vectorEffect: "non-scaling-stroke" })
});
/** Close — stroke glyph on the shared 1.5px language. */
const IconCloseOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M4.3 4.3 11.7 11.7M11.7 4.3 4.3 11.7", vectorEffect: "non-scaling-stroke" })
});
/** ic_ds_close_fill_14 */
const IconCloseFill14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: jsx("path", {
		d: "M10.6074 4.40278L8.00975 6.99973L10.6074 9.59739L9.59736 10.6074L6.9997 8.00978L4.40274 10.6074L3.3927 9.59739L5.98966 6.99973L3.3927 4.40278L4.40274 3.39273L6.9997 5.98969L9.59736 3.39273L10.6074 4.40278Z",
		fill: "currentColor"
	})
});
/** Copy — stroke glyph on the shared 1.5px language. */
const IconCopyOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 5.5, y: 1.9, width: 8.6, height: 8.6, rx: 2.2, vectorEffect: "non-scaling-stroke" }),
		jsx("rect", { x: 1.9, y: 5.5, width: 8.6, height: 8.6, rx: 2.2, vectorEffect: "non-scaling-stroke" })
	]
});
/** Refresh — stroke glyph on the shared 1.5px language. */
const IconRefreshOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M13.6 8A5.6 5.6 0 1 1 11.9 4", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M13.6 2.6v3.4h-3.4", vectorEffect: "non-scaling-stroke" })
	]
});
/** Refresh — stroke glyph on the shared 1.5px language. */
const IconRefreshOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M11.9 7A4.9 4.9 0 1 1 10.4 3.5", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M11.9 2.3v3h-3", vectorEffect: "non-scaling-stroke" })
	]
});
/** Like — stroke glyph on the shared 1.5px language. */
const IconLikeOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M5.3 7.3V13.4M5.3 13.4h6.05a2.15 2.15 0 0 0 2.1-1.65l.95-4.15a1.45 1.45 0 0 0-1.41-1.77h-2.9l.48-2.35A1.85 1.85 0 0 0 8.75 1.2a1.15 1.15 0 0 0-1.05.66L5.3 7.3M5.3 7.3H3.6a1.3 1.3 0 0 0-1.3 1.3v3.5a1.3 1.3 0 0 0 1.3 1.3h1.7", vectorEffect: "non-scaling-stroke" })
});
/** ic_ds_like_fill_16 */
const IconLikeFill16 = ({ size = 16, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: [jsx("path", {
		d: "M14.0593 12.922L15.0976 10.1247C15.3087 9.5559 15.4143 9.27138 15.4566 9.04658C15.7349 7.56751 14.7472 6.14737 13.2637 5.89357C13.0382 5.85499 12.7348 5.85499 12.1281 5.85499H11.1099C10.6615 5.85499 10.4372 5.85499 10.3034 5.73376C10.2607 5.69508 10.2255 5.64885 10.1995 5.5974C10.1182 5.43613 10.1778 5.21997 10.297 4.78765L10.8081 2.93419L10.819 2.89456C11.0336 2.09024 10.8051 1.23244 10.2189 0.64139L10.1898 0.612405L10.1692 0.592068C9.77357 0.210076 9.13559 0.249344 8.78983 0.676966L8.77186 0.699678L4.71076 5.86083C4.52965 6.09101 4.38573 6.35138 4.38573 6.64427V12.7431C4.38573 14.3601 5.69654 15.6709 7.31351 15.6709L10.1068 15.6709C11.3628 15.6709 11.9908 15.6709 12.5043 15.3995C12.6723 15.3107 12.8289 15.2018 12.9706 15.0752C13.4037 14.6882 13.6222 14.0995 14.0593 12.922Z",
		fill: "currentColor"
	}), jsx("path", {
		d: "M2.91388 13.2113C2.91388 14.6907 4.08499 15.5536 4.08499 15.5536H2.65606C1.46328 15.5536 0.496338 14.5866 0.496338 13.3938V8.34439C0.496338 7.15161 1.46328 6.18467 2.65606 6.18467H2.91388V13.2113Z",
		fill: "currentColor"
	})]
});
/** Dislike — stroke glyph on the shared 1.5px language. */
const IconDislikeOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	transform: "rotate(180 8 8)",
	children: jsx("path", { d: "M5.3 7.3V13.4M5.3 13.4h6.05a2.15 2.15 0 0 0 2.1-1.65l.95-4.15a1.45 1.45 0 0 0-1.41-1.77h-2.9l.48-2.35A1.85 1.85 0 0 0 8.75 1.2a1.15 1.15 0 0 0-1.05.66L5.3 7.3M5.3 7.3H3.6a1.3 1.3 0 0 0-1.3 1.3v3.5a1.3 1.3 0 0 0 1.3 1.3h1.7", vectorEffect: "non-scaling-stroke" })
});
/** ic_ds_dislike_fill_16 */
const IconDislikeFill16 = ({ size = 16, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: [jsx("path", {
		d: "M1.92838 3.06811L0.88799 5.87104C0.676449 6.44097 0.570628 6.72606 0.52825 6.95131C0.249414 8.43336 1.2391 9.85637 2.72555 10.1107C2.95149 10.1493 3.25549 10.1493 3.86348 10.1493H4.88371C5.33306 10.1493 5.55774 10.1493 5.69187 10.2708C5.73467 10.3096 5.76994 10.3559 5.79593 10.4074C5.87738 10.569 5.81766 10.7856 5.69821 11.2188L5.18609 13.076L5.17522 13.1157C4.9602 13.9217 5.1891 14.7812 5.7765 15.3735L5.80568 15.4025L5.82635 15.4229C6.22273 15.8056 6.862 15.7663 7.20846 15.3378L7.22647 15.315L11.2958 10.1435C11.4772 9.91284 11.6214 9.65195 11.6214 9.35847V3.24734C11.6214 1.62711 10.308 0.313655 8.68776 0.313655L5.88886 0.313654C4.63032 0.313654 4.00105 0.313654 3.48649 0.585577C3.31815 0.674536 3.16127 0.783647 3.01929 0.910507C2.58531 1.29828 2.36633 1.88824 1.92838 3.06811Z",
		fill: "currentColor"
	}), jsx("path", {
		d: "M13.0963 2.77815C13.0963 1.29585 11.9228 0.431205 11.9228 0.431205H13.3546C14.5498 0.431205 15.5187 1.4001 15.5187 2.59529V7.65491C15.5187 8.8501 14.5498 9.81899 13.3546 9.81899H13.0963V2.77815Z",
		fill: "currentColor"
	})]
});
/** ic_ds_share_outline_16 */
const IconShareOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: jsx("path", {
		d: "M7.95889 1.52285C7.95888 0.826234 8.76055 0.467983 9.27669 0.875208L9.37524 0.967191L15.1317 7.18358C15.5582 7.64419 15.5582 8.35614 15.1317 8.81676L9.37524 15.0331C8.87034 15.578 7.95888 15.2205 7.95889 14.4775V10.8207C7.10614 10.8432 6.31361 10.9316 5.45468 11.2515C4.39484 11.6463 3.18248 12.413 1.64676 13.9425C1.4533 14.135 1.18329 14.1696 0.969086 14.0908C0.74748 14.0091 0.547307 13.7879 0.54859 13.4844L0.55516 13.1315C0.618924 11.3494 1.11153 9.29838 2.27656 7.63787C3.45289 5.96147 5.29554 4.71635 7.95889 4.54797V1.52285ZM9.20911 5.13366C9.20899 5.50567 8.9031 5.77687 8.56523 5.77755C5.99383 5.78282 4.33736 6.8762 3.29964 8.35496C2.54519 9.43014 2.10739 10.7283 1.9152 11.9939C3.04749 11.0323 4.0569 10.4385 5.01917 10.0801C6.29638 9.60449 7.4406 9.56343 8.56429 9.56295C8.9178 9.5628 9.20894 9.84909 9.20911 10.2068L9.20817 13.3737L14.1837 8.00017L9.20817 2.62571L9.20911 5.13366Z",
		fill: "currentColor"
	})
});
/** Edit — stroke glyph on the shared 1.5px language. */
const IconEditOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M10.5 2.9 13.1 5.5 3.4 12.6Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M7.3 7.3 8.7 8.7", vectorEffect: "non-scaling-stroke" })
	]
});
/** Think — stroke glyph on the shared 1.5px language. */
const IconThinkOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 7, cy: 5.4, r: 2.9, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M5.7 8v1.3a1.3 1.3 0 0 0 2.6 0V8", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.1 10.9h1.8", vectorEffect: "non-scaling-stroke" })
	]
});
/** Think — stroke glyph on the shared 1.5px language. */
const IconThinkOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 6.2, r: 3.3, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.5 9.1v1.5a1.5 1.5 0 0 0 3 0V9.1", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M7 12.5h2", vectorEffect: "non-scaling-stroke" })
	]
});
/** AgentPreset — stroke glyph on the shared 1.5px language. */
const IconAgentPresetOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 2.2, y: 2.2, width: 11.6, height: 11.6, rx: 3.2, vectorEffect: "non-scaling-stroke" }),
		jsx("rect", { x: 5.6, y: 5.6, width: 4.8, height: 4.8, rx: 1.5, vectorEffect: "non-scaling-stroke" })
	]
});
/** Browse — stroke glyph on the shared 1.5px language. */
const IconBrowseOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M9.6 1.9H5.4A2.4 2.4 0 0 0 3 4.3v7.4a2.4 2.4 0 0 0 2.4 2.4h5.2a2.4 2.4 0 0 0 2.4-2.4V5.3Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M9.3 1.9v3.4h3.7", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M5.9 9h4.2M5.9 11.3h2.6", vectorEffect: "non-scaling-stroke" })
	]
});
/** ContextInjection — stroke glyph on the shared 1.5px language. */
const IconContextInjectionOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M13.1 8.6v3.1a2.3 2.3 0 0 1-2.3 2.3H5.2A2.3 2.3 0 0 1 2.9 11.7V5.2A2.3 2.3 0 0 1 5.2 2.9h1.3", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 1.7v5.6M5.9 5.4 8 7.5l2.1-2.1", vectorEffect: "non-scaling-stroke" })
	]
});
/** ic_ds_link_outline_14 */
const IconLinkOutline14 = ({ size = 14, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: [jsx("path", {
		d: "M8.19727 5.86969C9.2092 6.90067 9.20969 8.55271 8.19727 9.58338L6.88871 10.8919C5.85801 11.9039 4.20584 11.9037 3.17502 10.8919L3.10873 10.8243C2.09622 9.7934 2.09626 8.14148 3.10873 7.11058L4.36757 5.85174C4.28261 6.33758 4.30355 6.84354 4.44077 7.33362L3.89249 7.88053C3.30043 8.48348 3.30108 9.4507 3.89318 10.0536L3.94566 10.1061C4.54861 10.698 5.51521 10.6981 6.11808 10.1061L7.41283 8.81275C8.00484 8.21002 8.00504 7.24267 7.41352 6.63964L7.35966 6.58716C7.21975 6.44976 7.05995 6.34434 6.89009 6.27089L7.70009 5.4609C7.85176 5.55768 7.99607 5.67091 8.1296 5.80202L8.19727 5.86969Z",
		fill: "currentColor"
	}), jsx("path", {
		d: "M5.80913 8.12648C4.79584 7.09547 4.79591 5.44245 5.80913 4.41141C5.81733 4.40304 5.82707 4.39209 5.8409 4.37826L7.07833 3.14082C7.09224 3.12693 7.10311 3.11729 7.11148 3.10906C8.14253 2.09591 9.79557 2.09579 10.8266 3.10906L10.8908 3.17328C11.9041 4.20425 11.9039 5.85727 10.8908 6.88835L9.63193 8.14581C9.70566 7.66581 9.67564 7.16895 9.53456 6.68948L10.1063 6.11772C10.6989 5.51458 10.6992 4.54691 10.1063 3.94391L10.0552 3.8942C9.45215 3.30157 8.48446 3.30151 7.88142 3.8942L6.59358 5.18204C6.00081 5.78507 6.00092 6.75274 6.59358 7.35584L6.6433 7.40694C6.77998 7.54132 6.93555 7.64528 7.10112 7.71837L6.29251 8.52699C6.14446 8.43127 6.00395 8.31906 5.87335 8.1907L5.80913 8.12648Z",
		fill: "currentColor"
	})]
});
/** ic_ds_link_outline_16 */
const IconLinkOutline16 = ({ size = 16, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: [jsx("path", {
		d: "M9.94133 6.50173C11.3218 7.99603 11.3218 10.3011 9.94128 11.7954C9.88691 11.8542 9.82125 11.9196 9.72099 12.0198L7.75707 13.9838C7.65709 14.0838 7.592 14.1491 7.53334 14.2034C6.03906 15.5843 3.7327 15.5854 2.23827 14.2048C2.17933 14.1503 2.11374 14.0844 2.01315 13.9838C1.91318 13.8839 1.84922 13.8188 1.79495 13.7601C0.413857 12.2657 0.413909 9.95948 1.795 8.46503C1.84923 8.4064 1.91335 8.34115 2.01321 8.24129L3.79275 6.46313C3.71814 7.08101 3.75236 7.71445 3.90115 8.33518L3.00344 9.23151C2.89398 9.34097 2.8535 9.38307 2.82251 9.41658C1.93771 10.3744 1.93704 11.8514 2.82179 12.8092C2.85279 12.8427 2.89383 12.884 3.0034 12.9936C3.11272 13.1029 3.15429 13.1442 3.18777 13.1752C4.14561 14.0603 5.62381 14.0608 6.58178 13.1758C6.61532 13.1448 6.65722 13.1032 6.76685 12.9935L8.73077 11.0296C8.83999 10.9204 8.88142 10.8787 8.91238 10.8452C9.79744 9.88728 9.7969 8.40911 8.91173 7.45124C8.88074 7.41775 8.83944 7.3762 8.73011 7.26687C8.62082 7.15757 8.58061 7.11623 8.54712 7.08526C8.37347 6.92477 8.18243 6.79361 7.98088 6.69165L9.00289 5.66964C9.17506 5.78373 9.34035 5.91265 9.49663 6.05703C9.55538 6.11135 9.62026 6.17652 9.72036 6.27662C9.82094 6.3772 9.88686 6.4428 9.94133 6.50173Z",
		fill: "currentColor"
	}), jsx("path", {
		d: "M6.06816 9.49196C4.68626 7.99724 4.68667 5.68942 6.06885 4.19487C6.12268 4.13671 6.18789 4.07306 6.28706 3.9739L8.24541 2.01416C8.34478 1.91479 8.41018 1.85055 8.46845 1.79665C9.96301 0.414902 12.2689 0.414922 13.7635 1.79665C13.8217 1.85051 13.8866 1.91559 13.9858 2.01486C14.0849 2.11394 14.1502 2.17769 14.204 2.23583C15.5861 3.7304 15.5866 6.03823 14.2047 7.53291C14.1508 7.59125 14.0854 7.65638 13.9858 7.75595L12.1994 9.54098C12.2614 8.92982 12.2185 8.30587 12.0634 7.69657L12.9956 6.76573C13.1044 6.65692 13.1458 6.61529 13.1765 6.58205C14.0621 5.62404 14.0621 4.1454 13.1765 3.18738C13.1458 3.15419 13.104 3.1135 12.9956 3.00508C12.8877 2.89716 12.8471 2.85551 12.814 2.82485C11.8559 1.9389 10.376 1.93886 9.41794 2.82485C9.38479 2.85554 9.34381 2.89622 9.23564 3.00439L7.27728 4.96413C7.16875 5.07265 7.12708 5.11322 7.09636 5.14643C6.21074 6.10441 6.21153 7.58236 7.09705 8.5404C7.12775 8.57357 7.16826 8.61575 7.27659 8.72408C7.38456 8.83205 7.42647 8.87227 7.45958 8.90293C7.62849 9.0591 7.81309 9.1881 8.00856 9.28894L6.98795 10.3095C6.82111 10.1978 6.66052 10.0715 6.50872 9.93114C6.45057 9.87733 6.38547 9.81341 6.28637 9.71431C6.1871 9.61504 6.12202 9.55018 6.06816 9.49196Z",
		fill: "currentColor"
	})]
});
/** ic_ds_right_up_outline_14 */
const IconRightUpOutline14 = ({ size = 8, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 8 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: jsx("path", {
		d: "M6.54199 8.62824C6.54199 8.44193 6.54146 8.28829 6.53906 8.15851L1.11719 13.5814L0.728516 13.1927L0.339844 12.803L5.76172 7.38019C5.63201 7.3778 5.47812 7.37824 5.29199 7.37824H1.43555V6.27863H5.29199C5.65471 6.27863 5.97167 6.27814 6.22852 6.30597C6.49541 6.33493 6.76232 6.3998 7.00293 6.57452C7.13452 6.67013 7.25108 6.78571 7.34668 6.9173C7.52157 7.15808 7.5863 7.4256 7.61523 7.69269C7.64305 7.94948 7.64258 8.26562 7.64258 8.62824V12.4857H6.54199V8.62824Z",
		fill: "currentColor"
	})
});
/** RightUp — stroke glyph on the shared 1.5px language. */
const IconRightUpOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M4.4 11.6 11.6 4.4M5.8 4.4h5.8v5.8", vectorEffect: "non-scaling-stroke" })
});
/** ic_ds_enhance_outline_16 */
const IconEnhanceOutline16 = ({ size = 16, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: [
		jsx("path", {
			d: "M14.9943 1.92389V3.32428H1.00598V1.92389H14.9943Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M14.9943 5.50784V6.90823H1.00598V5.50784H14.9943Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M14.9943 9.09177V10.4922H1.00598V9.09177H14.9943Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M8.93274 12.6757V14.0761H1.00598V12.6757H8.93274Z",
			fill: "currentColor"
		})
	]
});
/** Trash — stroke glyph on the shared 1.5px language. */
const IconTrashOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M2.9 4.5h10.2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.4 4.5V3.3a1.2 1.2 0 0 1 1.2-1.2h.8a1.2 1.2 0 0 1 1.2 1.2v1.2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M4.5 4.5l.7 8a1.6 1.6 0 0 0 1.6 1.5h2.4a1.6 1.6 0 0 0 1.6-1.5l.7-8", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.8 7.2v3.9M9.2 7.2v3.9", vectorEffect: "non-scaling-stroke" })
	]
});
/** Warning — stroke glyph on the shared 1.5px language. */
const IconWarningOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M8 2.8 14.2 13.4H1.8Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 6.6v3.2", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 8, cy: 11.6, r: 0.9, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" })
	]
});
/** User — stroke glyph on the shared 1.5px language. */
const IconUserOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 5.6, r: 3.1, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M2.9 14.2a5.1 5.1 0 0 1 10.2 0", vectorEffect: "non-scaling-stroke" })
	]
});
/** Send — stroke glyph on the shared 1.5px language. */
const IconSendOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M8 13.4V2.8M3.9 6.9 8 2.8l4.1 4.1", vectorEffect: "non-scaling-stroke" })
});
/** ic_ds_stop_fill_16 */
const IconStopFill16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: jsx("path", {
		d: "M2 4.88C2 3.68009 2 3.08013 2.30557 2.65954C2.40426 2.52371 2.52371 2.40426 2.65954 2.30557C3.08013 2 3.68009 2 4.88 2H11.12C12.3199 2 12.9199 2 13.3405 2.30557C13.4763 2.40426 13.5957 2.52371 13.6944 2.65954C14 3.08013 14 3.68009 14 4.88V11.12C14 12.3199 14 12.9199 13.6944 13.3405C13.5957 13.4763 13.4763 13.5957 13.3405 13.6944C12.9199 14 12.3199 14 11.12 14H4.88C3.68009 14 3.08013 14 2.65954 13.6944C2.52371 13.5957 2.40426 13.4763 2.30557 13.3405C2 12.9199 2 12.3199 2 11.12V4.88Z",
		fill: "currentColor"
	})
});
/** Paperclip — stroke glyph on the shared 1.5px language. */
const IconPaperclipOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M12 4.4v6.2a3.6 3.6 0 0 1-7.2 0V4.2a2 2 0 0 1 4 0v6.1a.9.9 0 0 1-1.8 0V5.1", vectorEffect: "non-scaling-stroke" })
});
/** Loading — stroke glyph on the shared 1.5px language. */
const IconLoadingOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M2.4 8a5.6 5.6 0 1 1 5.6 5.6", vectorEffect: "non-scaling-stroke" })
});
/** Download — stroke glyph on the shared 1.5px language. */
const IconDownloadOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M8 2.7v8.6M4.2 7.5 8 11.3l3.8-3.8", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M2.9 13.6h10.2", vectorEffect: "non-scaling-stroke" })
	]
});
/** Play — stroke glyph on the shared 1.5px language. */
const IconPlayOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M5.5 3.5 12.3 8l-6.8 4.5Z", vectorEffect: "non-scaling-stroke" })
});
/** Pause — stroke glyph on the shared 1.5px language. */
const IconPauseOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M6.4 3.6v8.8M9.6 3.6v8.8", vectorEffect: "non-scaling-stroke" })
});
/** Fullscreen — stroke glyph on the shared 1.5px language. */
const IconFullscreenOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M6 2.4H4a1.6 1.6 0 0 0-1.6 1.6v2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M10 2.4h2A1.6 1.6 0 0 1 13.6 4v2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6 13.6H4A1.6 1.6 0 0 1 2.4 12v-2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M10 13.6h2a1.6 1.6 0 0 0 1.6-1.6v-2", vectorEffect: "non-scaling-stroke" })
	]
});
/** Code — stroke glyph on the shared 1.5px language. */
const IconCodeOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M5.9 4.4 2.3 8l3.6 3.6", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M10.1 4.4 13.7 8l-3.6 3.6", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M9.3 3.4 6.7 12.6", vectorEffect: "non-scaling-stroke" })
	]
});
/** CordisPlugin — stroke glyph on the shared 1.5px language. */
const IconCordisPluginOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M4.3 5.7h5.4v3.6a2.7 2.7 0 0 1-2.7 2.7A2.7 2.7 0 0 1 4.3 9.3Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M5.8 5.7V3.3M8.2 5.7V3.3", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M7 12v1.7", vectorEffect: "non-scaling-stroke" })
	]
});
/** Api — stroke glyph on the shared 1.5px language. */
const IconApiOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 1.4, y: 2.6, width: 11.2, height: 8.8, rx: 2.2, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M4.5 6.1 6.2 7.8 4.5 9.5", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M7.6 9.5h2.4", vectorEffect: "non-scaling-stroke" })
	]
});
/** Personalization — stroke glyph on the shared 1.5px language. */
const IconPersonalizationOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M2.6 5.2h10.8M2.6 10.8h10.8", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 6.2, cy: 5.2, r: 1.8, vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 9.8, cy: 10.8, r: 1.8, vectorEffect: "non-scaling-stroke" })
	]
});
/** ProjectAdd — stroke glyph on the shared 1.5px language. */
const IconProjectAddOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M2.3 5.5a2 2 0 0 1 2-2h2.3l1.6 2h5.5a2 2 0 0 1 2 2v4.6a2 2 0 0 1-2 2H4.3a2 2 0 0 1-2-2Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 8.4v3.2M6.4 10h3.2", vectorEffect: "non-scaling-stroke" })
	]
});
/** FolderOpen — stroke glyph on the shared 1.5px language. */
const IconFolderOpenOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M2.3 12.6V5.4a2 2 0 0 1 2-2h2.3l1.6 2h5.5a2 2 0 0 1 2 2v.7M2.3 12.6 4.1 8.8a1.7 1.7 0 0 1 1.55-1.05h7.7a1.6 1.6 0 0 1 1.55 2.02l-.95 3.35a1.7 1.7 0 0 1-1.64 1.23H4.3a2 2 0 0 1-2-2Z", vectorEffect: "non-scaling-stroke" })
});
/** FolderOpen16 — stroke glyph on the shared 1.5px language. */
const IconFolderOpen16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M2.3 12.6V5.4a2 2 0 0 1 2-2h2.3l1.6 2h5.5a2 2 0 0 1 2 2v.7M2.3 12.6 4.1 8.8a1.7 1.7 0 0 1 1.55-1.05h7.7a1.6 1.6 0 0 1 1.55 2.02l-.95 3.35a1.7 1.7 0 0 1-1.64 1.23H4.3a2 2 0 0 1-2-2Z", vectorEffect: "non-scaling-stroke" })
});
/** FolderClose16 — stroke glyph on the shared 1.5px language. */
const IconFolderClose16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M2.3 5.5a2 2 0 0 1 2-2h2.3l1.6 2h5.5a2 2 0 0 1 2 2v4.6a2 2 0 0 1-2 2H4.3a2 2 0 0 1-2-2Z", vectorEffect: "non-scaling-stroke" })
});
/** tree_corner_8x10 (figma extract; session-tree "L" connector, stroke geometry pre-expanded) */
const IconTreeCorner8x10 = ({ size = 10, className }) => jsx("svg", {
	width: size * 8 / 10,
	height: size,
	className,
	viewBox: "-0.5 0 8.5 10.5",
	fill: "none",
	children: jsx("path", {
		d: "M0 0L-0.5 0L-0.5 7L0 7L0.5 7L0.5 0L0 0ZM3 10L3 10.5L8 10.5L8 10L8 9.5L3 9.5L3 10ZM0 7L-0.5 7C-0.5 8.933 1.067 10.5 3 10.5L3 10L3 9.5C1.61929 9.5 0.5 8.38071 0.5 7L0 7Z",
		fill: "currentColor"
	})
});
/** Light — stroke glyph on the shared 1.5px language. */
const IconLightOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 8, r: 3.1, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M12.7 8 14.3 8M11.323 11.323 12.455 12.455M8 12.7 8 14.3M4.677 11.323 3.545 12.455M3.3 8 1.7 8M4.677 4.677 3.545 3.545M8 3.3 8 1.7M11.323 4.677 12.455 3.545", vectorEffect: "non-scaling-stroke" })
	]
});
/** Dark — stroke glyph on the shared 1.5px language. */
const IconDarkOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M13.4 9.9A5.8 5.8 0 0 1 6.1 2.6a5.9 5.9 0 1 0 7.3 7.3Z", vectorEffect: "non-scaling-stroke" })
});
/** Followsystem — stroke glyph on the shared 1.5px language. */
const IconFollowsystemOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 8, r: 5.9, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 2.1a5.9 5.9 0 0 1 0 11.8Z", fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" })
	]
});
/** Data — stroke glyph on the shared 1.5px language. */
const IconDataOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 2.2, y: 2.8, width: 11.6, height: 10.4, rx: 2.4, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M2.2 6.4h11.6M6.9 6.4v6.8", vectorEffect: "non-scaling-stroke" })
	]
});
/** Database — stroke glyph on the shared 1.5px language. */
const IconDatabaseOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("ellipse", { cx: 8, cy: 4.4, rx: 5.4, ry: 2.2, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M2.6 4.4v7.2c0 1.22 2.42 2.2 5.4 2.2s5.4-.98 5.4-2.2V4.4", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M2.6 8c0 1.22 2.42 2.2 5.4 2.2s5.4-.98 5.4-2.2", vectorEffect: "non-scaling-stroke" })
	]
});
/** Clock — stroke glyph on the shared 1.5px language. */
const IconClockOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 8, r: 5.9, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 4.6V8l2.5 1.7", vectorEffect: "non-scaling-stroke" })
	]
});
/** Thin-stroke gauge: dial arc open at the bottom, filled hub, square-cut needle to the upper right.
* The dial center sits at y=8.75, not 8: the bottom opening leaves the glyph top-heavy, and the
* 0.75 drop optically centers the drawn extent in the 16 box. */
const IconGaugeOutline16 = ({ size = 16, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	children: [
		jsx("path", {
			d: "M3.49 13.26A6.375 6.375 0 1 1 12.51 13.26",
			stroke: "currentColor",
			strokeWidth: "1.25"
		}),
		jsx("path", {
			d: "M8 8.75L11.4 5.35",
			stroke: "currentColor",
			strokeWidth: "1.25"
		}),
		jsx("circle", {
			cx: "8",
			cy: "8.75",
			r: "1.55",
			fill: "currentColor"
		})
	]
});
/** Send — stroke glyph on the shared 1.5px language. */
const IconSendOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M7 11.8V2.7M3.6 6.1 7 2.7l3.4 3.4", vectorEffect: "non-scaling-stroke" })
});
/** Queue — stroke glyph on the shared 1.5px language. */
const IconQueueOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 1.9, y: 2.4, width: 10.2, height: 7.2, rx: 2.2, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M5.1 9.6 4.3 12.3", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M4.6 5.3h5.8M4.6 7.2h3.6", vectorEffect: "non-scaling-stroke" })
	]
});
/** Checklist — stroke glyph on the shared 1.5px language. */
const IconChecklistOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 2.7, cy: 4.5, r: 1.7, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.1 4.5h6.4", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 2.7, cy: 9.5, r: 1.7, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.1 9.5h6.4", vectorEffect: "non-scaling-stroke" })
	]
});
/** ListPen — stroke glyph on the shared 1.5px language. */
const IconListPenOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M2.4 4.4h5.4M2.4 7.8h3.6", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M11.45 4.15 12.95 5.65 6.19 10.91Z", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M10.3 5.6 11.5 6.8", vectorEffect: "non-scaling-stroke" })
	]
});
/** Goal — stroke glyph on the shared 1.5px language. */
const IconGoalOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 7.1, cy: 8.9, r: 4.3, vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 7.1, cy: 8.9, r: 1.5, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M10.3 5.7 14.3 1.7M11 1.7h3.3v3.3", vectorEffect: "non-scaling-stroke" })
	]
});
/** Sparkle16 — stroke glyph on the shared 1.5px language. */
const IconSparkle16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M8 1.7Q8.6 7.4 14.3 8 8.6 8.6 8 14.3 7.4 8.6 1.7 8 7.4 7.4 8 1.7Z", vectorEffect: "non-scaling-stroke" })
});
/** Inspect — stroke glyph on the shared 1.5px language. */
const IconInspectOutline12 = ({ size = 12, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 1.9, y: 1.9, width: 12.2, height: 12.2, rx: 3, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.3 9.7 9.7 6.3M6.6 6.3h3.1v3.1", vectorEffect: "non-scaling-stroke" })
	]
});
/** Skill — stroke glyph on the shared 1.5px language. */
const IconSkillOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 3, y: 1.9, width: 10, height: 12.2, rx: 2.3, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 5.3q.36 1.96 2.32 2.32Q8.36 7.98 8 9.94 7.64 7.98 5.68 7.62 7.64 7.26 8 5.3Z", vectorEffect: "non-scaling-stroke" })
	]
});
/** Question — stroke glyph on the shared 1.5px language. */
const IconQuestionOutline14 = ({ size = 14, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 14 14",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 7, cy: 7, r: 5.4, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M5.2 5.4a1.95 1.95 0 1 1 2.6 2.05c-.6.25-.8.85-.8 1.45", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 7, cy: 11.1, r: 1, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" })
	]
});
/** AlarmClock — stroke glyph on the shared 1.5px language. */
const IconAlarmClockOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("circle", { cx: 8, cy: 9, r: 5, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8 6.5V9l1.8 1.2", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M3.6 4.8 5.3 3M12.4 4.8 10.7 3", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M4.7 13.3 3.6 14.4M11.3 13.3 12.4 14.4", vectorEffect: "non-scaling-stroke" })
	]
});
/** Archive — stroke glyph on the shared 1.5px language. */
const IconArchiveOutline20 = ({ size = 20, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 2.6, y: 3.4, width: 14.8, height: 3.9, rx: 1.5, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M4.3 7.3v7.2a2 2 0 0 0 2 2h7.4a2 2 0 0 0 2-2V7.3", vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M8.2 10.5h3.6", vectorEffect: "non-scaling-stroke" })
	]
});
/** Cursor — stroke glyph on the shared 1.5px language. */
const IconCursorOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: jsx("path", { d: "M4.6 2.8V12.4l2.7-2.5 1.7 3.7 1.9-.9-1.7-3.6 3.4-.2Z", vectorEffect: "non-scaling-stroke" })
});
/** Eye — stroke glyph on the shared 1.5px language. */
const IconEyeOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("path", { d: "M1.8 8c1.6-2.6 3.7-3.9 6.2-3.9s4.6 1.3 6.2 3.9c-1.6 2.6-3.7 3.9-6.2 3.9S3.4 10.6 1.8 8Z", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 8, cy: 8, r: 2.1, vectorEffect: "non-scaling-stroke" })
	]
});
/** Browser — stroke glyph on the shared 1.5px language. */
const IconBrowserOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 1.9, y: 2.6, width: 12.2, height: 10.8, rx: 2.6, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M1.9 6h12.2", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 4.2, cy: 4.3, r: 0.62, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 6.1, cy: 4.3, r: 0.62, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" })
	]
});
/** Device — stroke glyph on the shared 1.5px language. */
const IconDeviceOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 4.4, y: 1.7, width: 7.2, height: 12.6, rx: 2.4, vectorEffect: "non-scaling-stroke" }),
		jsx("path", { d: "M6.9 12.2h2.2", vectorEffect: "non-scaling-stroke" })
	]
});
/** Server — stroke glyph on the shared 1.5px language. */
const IconServerOutline16 = ({ size = 16, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: [
		jsx("rect", { x: 2.2, y: 2.6, width: 11.6, height: 4.9, rx: 2, vectorEffect: "non-scaling-stroke" }),
		jsx("rect", { x: 2.2, y: 8.5, width: 11.6, height: 4.9, rx: 2, vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 4.6, cy: 5.05, r: 0.72, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" }),
		jsx("circle", { cx: 4.6, cy: 10.95, r: 0.72, fill: "currentColor", stroke: "none", vectorEffect: "non-scaling-stroke" })
	]
});
//#endregion
//#region lib/types/DisclosureRow.js
/**
* Render one disclosure header and its controlled expanded content.
* @param props - Visual content, controlled state, and interaction policy.
* @returns the disclosure row.
*/
function DisclosureRow({ icon, title, open, expandable, onToggle, expandOnRowClick = false, previewChevron = expandable, keepContentWhenOpen = false, collapsedContent, children, className, rowClassName, leadingClassName, chevronClassName, titleClassName }) {
	const rowExpands = expandable && expandOnRowClick;
	const toggleFromLeading = (event) => {
		event.stopPropagation();
		onToggle();
	};
	const toggleFromKeyboard = (event) => {
		if (!rowExpands || event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		onToggle();
	};
	const collapsedLeading = previewChevron ? jsxs(Fragment, { children: [jsx("span", {
		className: css$1.iconIdle,
		children: icon
	}), jsx(IconChevronDownOutline14, { className: clsx(chevronClassName, css$1.chevronHover) })] }) : icon;
	const leading = open ? jsx(IconChevronDownOutline14, { className: chevronClassName }) : collapsedLeading;
	return jsxs("div", {
		className: clsx(css$1.root, className),
		"data-open": open || void 0,
		children: [jsxs("div", {
			className: clsx(css$1.row, rowClassName),
			"data-disclosure-row": true,
			"data-expandable": rowExpands || void 0,
			role: rowExpands ? "button" : void 0,
			tabIndex: rowExpands ? 0 : void 0,
			"aria-expanded": rowExpands ? open : void 0,
			onClick: rowExpands ? onToggle : void 0,
			onKeyDown: rowExpands ? toggleFromKeyboard : void 0,
			children: [
				expandable && !rowExpands ? jsx("button", {
					type: "button",
					className: clsx(css$1.leading, leadingClassName),
					"aria-expanded": open,
					onClick: toggleFromLeading,
					children: leading
				}) : jsx("span", {
					className: clsx(css$1.leading, leadingClassName),
					children: leading
				}),
				jsx("span", {
					className: clsx(css$1.title, titleClassName),
					children: title
				}),
				(keepContentWhenOpen || !open) && collapsedContent
			]
		}), open && children]
	});
}
//#endregion
//#region lib/types/Button.js
/**
* Render a button.
* @param props.variant - visual family (default 'ghost').
* @param props.size - 'md' 36px capsule (figma Button) or 'sm' 28px compact.
* @param props.icon - optional leading 16px icon node.
* @returns the button element; native button attributes pass through.
*/
function Button({ variant = "ghost", size = "md", icon, className, children, ...rest }) {
	return jsxs("button", {
		type: "button",
		className: clsx(css$2.button, css$2[variant], css$2[size], className),
		...rest,
		children: [icon != null && jsx("span", {
			className: css$2.icon,
			children: icon
		}), children]
	});
}
//#endregion
//#region lib/types/Pill.js
/**
* Render a pill chip. Interactive when onClick is supplied (renders a button);
* otherwise a static span.
* @param props.active - selected/active visual state.
* @returns pill element.
*/
function Pill({ active = false, className, children, onClick, ...rest }) {
	if (!onClick) return jsx("span", {
		className: clsx(css$3.pill, active && css$3.active, className),
		children
	});
	return jsx("button", {
		type: "button",
		className: clsx(css$3.pill, css$3.interactive, active && css$3.active, className),
		onClick,
		...rest,
		children
	});
}
//#endregion
//#region lib/types/Tag.js
/**
* Render a read-only tag.
* @param props.tone - which palette to use (default `outline`).
* @param props.className - extra class for layout placement.
* @param props.children - the localized label, owned by the render site.
* @returns the tag element.
*/
function Tag({ tone = "outline", className, children }) {
	return jsx("span", {
		className: clsx(css$4.tag, className),
		"data-tone": tone,
		children
	});
}
//#endregion
//#region lib/types/Switch.js
/**
* Render a toggle switch.
* @param props.checked - the current state; the control is fully controlled.
* @param props.onChange - called with the state the click asks for.
* @param props.label - localized accessible name, owned by the render site.
* @param props.disabled - whether the control refuses input; owners also set it
* while a write is in flight, not only when a deployment locks the toggle.
* @param props.title - localized hover text, typically why the toggle is locked.
* @param props.className - extra class for layout placement.
* @returns the switch element.
*/
function Switch({ checked, onChange, label, disabled = false, title, className }) {
	return jsx("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		title,
		disabled,
		className: clsx(css$5.switch, className),
		onClick: () => {
			onChange(!checked);
		},
		children: jsx("span", { className: css$5.thumb })
	});
}
//#endregion
//#region lib/types/Input.js
/**
* Render a text input with an optional leading icon.
* @param props.icon - optional 16px leading icon node.
* @returns wrapper span containing the native input; input attributes pass through.
*/
function Input({ icon, className, ...rest }) {
	return jsxs("span", {
		className: clsx(css$6.wrap, className),
		children: [icon != null && jsx("span", {
			className: css$6.icon,
			children: icon
		}), jsx("input", {
			className: css$6.input,
			...rest
		})]
	});
}
/**
* Delay a pointer-dismissed popup's close so the pointer can cross the gap
* between anchor and popup. A pending close is dropped on unmount.
* @param close - runs when the grace elapses with no re-entry; read at fire
* time, so callers may pass a fresh closure each render.
* @returns the {@link PointerGrace} handle.
*/
function usePointerGrace(close) {
	const timerRef = useRef(null);
	const closeRef = useRef(close);
	closeRef.current = close;
	const cancel = useCallback(() => {
		if (timerRef.current === null) return;
		clearTimeout(timerRef.current);
		timerRef.current = null;
	}, []);
	const arm = useCallback(() => {
		cancel();
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			closeRef.current();
		}, 200);
	}, [cancel]);
	useEffect(() => cancel, [cancel]);
	return {
		arm,
		cancel
	};
}
//#endregion
//#region lib/types/Menu.js
function isSeparator(entry) {
	return "type" in entry && entry.type === "separator";
}
function isLabel(entry) {
	return "type" in entry && entry.type === "label";
}
/** Unplaced portal list: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real. */
const MEASURE_STYLE = {
	visibility: "hidden",
	left: 0,
	top: 0
};
/**
* Render an anchored dropdown menu.
* @param props.autoFocus - focus the first item on open and enable arrow-key navigation; Escape focuses the anchor's first button.
* @param props.open - whether the list is showing (owner-controlled).
* @param props.anchor - the trigger element (rendered in place).
* @param props.items - selectable rows and optional separators.
* @param props.selectedId - row shown as selected.
* @param props.selectedIds - rows shown as selected when a menu contains independent option groups.
* @param props.onSelect - row click callback (not called for disabled rows or submenu parents that only open children).
* @param props.onClose - invoked on outside click, Escape, or a window blur
* that moved focus into an iframe (the only signal a pointerdown inside a
* cross-origin iframe leaves).
* @param props.align - list alignment against the anchor (default 'start').
* @param props.side - open below (`bottom`, default) or above (`top`) the anchor.
* @param props.portal - render the list into document.body, fixed-positioned
* from the anchor rect (repositions on scroll/resize while open). Use when an
* ancestor's overflow clipping would crop the in-place list; default false
* keeps the pure-CSS in-place behavior.
* @param props.closeOnPointerLeave - close the list once the pointer has left
* both trigger and list for the pointer grace (default false keeps it open
* until outside click/Escape/selection). The grace makes the 4px trigger->list
* gap and a brief overshoot survivable; coming back cancels the close.
* @param props.dense - reduce vertical row spacing without changing the standard typography or card width.
* @param props.compact - use reduced menu typography and spacing.
* @param props.getAnchorRect - portal mode only: supply the anchor rect
* directly (e.g. from a host-owned trigger button) instead of measuring the
* Menu's own wrapper span. Required when the wrapper isn't itself laid out at
* the trigger (render-prop anchors, effect-positioned proxies — measuring the
* wrapper there races the host's layout effects). Called on open and on every
* scroll/resize; return null to skip placement for that frame.
* @param props.footer - rows pinned below the scrolling items area, separated
* by a hairline; they stay visible while the items above scroll.
* @param props.selection - how a selected row is marked: a trailing check
* (`'check'`, default — figma .Menu_cell) or the hover fill held on the row
* with no check (`'fill'`, for icon-labelled rows where a trailing glyph
* crowds the cell).
* @returns anchor wrapper with the conditional list.
*/
function Menu({ open, anchor, items, selectedId, selectedIds, onSelect, onClose, align = "start", side = "bottom", portal = false, closeOnPointerLeave = false, dense = false, compact = false, autoFocus = false, selection = "check", getAnchorRect, footer, className }) {
	const rootRef = useRef(null);
	const listRef = useRef(null);
	const [openSubmenuId, setOpenSubmenuId] = useState(null);
	const [fixedPos, setFixedPos] = useState(null);
	const { arm: armClose, cancel: cancelClose } = usePointerGrace(onClose);
	useLayoutEffect(() => {
		if (!open || !portal) {
			setFixedPos(null);
			return;
		}
		const place = () => {
			let r;
			if (getAnchorRect !== void 0) r = getAnchorRect();
			else
 /* v8 ignore next 2 -- the ref is attached before the layout effect runs and the listeners die with it. */
			r = rootRef.current?.getBoundingClientRect() ?? null;
			if (r === null) return;
			const MARGIN = 12;
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const listEl = listRef.current;
			const lw = listEl?.offsetWidth ?? 0;
			const lh = listEl?.offsetHeight ?? 0;
			let x;
			let y;
			if (side === "right") {
				x = r.right + 4;
				y = r.top;
			} else if (align === "start") {
				x = r.left;
				y = side === "bottom" ? r.bottom + 4 : r.top - lh - 4;
			} else {
				x = r.right - lw;
				y = side === "bottom" ? r.bottom + 4 : r.top - lh - 4;
			}
			if (lw > 0) x = Math.min(Math.max(x, MARGIN), vw - lw - MARGIN);
			if (lh > 0) y = Math.min(Math.max(y, MARGIN), vh - lh - MARGIN);
			setFixedPos({
				left: x,
				top: y
			});
		};
		place();
		window.addEventListener("scroll", place, true);
		window.addEventListener("resize", place);
		return () => {
			window.removeEventListener("scroll", place, true);
			window.removeEventListener("resize", place);
		};
	}, [
		open,
		portal,
		align,
		side,
		getAnchorRect
	]);
	useEffect(() => {
		if (open && autoFocus) listRef.current?.querySelector("button:not(:disabled)")?.focus();
	}, [open, autoFocus]);
	useEffect(() => {
		if (!open) {
			setOpenSubmenuId(null);
			return;
		}
		const onPointerDown = (e) => {
			if (!(e.target instanceof Node)) return;
			if (rootRef.current?.contains(e.target) === true) return;
			if (listRef.current?.contains(e.target) === true) return;
			onClose();
		};
		const onKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose();
				if (autoFocus) rootRef.current?.querySelector("button")?.focus();
			}
			if (!autoFocus || ![
				"ArrowDown",
				"ArrowUp",
				"Home",
				"End"
			].includes(e.key)) return;
			const buttons = Array.from(listRef.current?.querySelectorAll("button:not(:disabled)") ?? []);
			const index = buttons.indexOf(document.activeElement);
			if (index < 0) return;
			e.preventDefault();
			buttons[e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
		};
		const onWindowBlur = () => {
			if (document.activeElement instanceof HTMLIFrameElement) onClose();
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		window.addEventListener("blur", onWindowBlur);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("blur", onWindowBlur);
		};
	}, [
		open,
		onClose,
		autoFocus
	]);
	useEffect(() => {
		if (!open) cancelClose();
	}, [open, cancelClose]);
	const scrollable = !items.some((entry) => !isSeparator(entry) && !isLabel(entry) && entry.submenu !== void 0 && entry.submenu.length > 0);
	const renderEntry = (entry) => {
		if (isSeparator(entry)) return jsx("div", {
			className: css$7.separator,
			role: "separator"
		}, entry.id);
		if (isLabel(entry)) return jsx("div", {
			className: css$7.label,
			role: "presentation",
			children: entry.text
		}, entry.id);
		const hasSub = entry.submenu !== void 0 && entry.submenu.length > 0;
		const subOpen = hasSub && openSubmenuId === entry.id;
		const selected = entry.id === selectedId || selectedIds?.includes(entry.id) === true;
		return jsxs("div", {
			className: css$7.itemWrap,
			onMouseEnter: () => {
				setOpenSubmenuId(hasSub ? entry.id : null);
			},
			onMouseLeave: () => {
				setOpenSubmenuId(null);
			},
			children: [jsxs("button", {
				type: "button",
				role: "menuitem",
				className: clsx(css$7.item, selected && (selection === "fill" ? css$7.selectedFill : css$7.selected), entry.danger === true && css$7.danger),
				disabled: entry.disabled,
				"aria-haspopup": hasSub ? "menu" : void 0,
				"aria-expanded": hasSub ? subOpen : void 0,
				onFocus: () => {
					setOpenSubmenuId(hasSub ? entry.id : null);
				},
				onClick: () => {
					if (hasSub) {
						setOpenSubmenuId(entry.id);
						return;
					}
					onSelect(entry.id);
				},
				children: [
					entry.icon !== void 0 && jsx("span", {
						className: css$7.itemIcon,
						children: entry.icon
					}),
					jsx("span", {
						className: css$7.itemLabel,
						children: entry.label
					}),
					selected && selection === "check" && jsx(IconCheckOutline16, { className: css$7.check })
				]
			}), subOpen && entry.submenu !== void 0 && jsx("div", {
				className: clsx(css$7.submenu, compact && css$7.compactList),
				role: "menu",
				children: entry.submenu.map((sub) => jsxs("button", {
					type: "button",
					role: "menuitem",
					className: css$7.item,
					disabled: sub.disabled,
					onClick: () => {
						onSelect(sub.id);
					},
					children: [sub.icon !== void 0 && jsx("span", {
						className: css$7.itemIcon,
						children: sub.icon
					}), jsx("span", {
						className: css$7.itemLabel,
						children: sub.label
					})]
				}, sub.id))
			})]
		}, entry.id);
	};
	const list = open && jsxs("div", {
		ref: listRef,
		className: clsx(css$7.list, dense && css$7.denseList, compact && css$7.compactList, scrollable && css$7.scrollable, portal && css$7.portal, side === "top" && !portal && css$7.sideTop, align === "end" && !portal && css$7.alignEnd),
		style: portal ? fixedPos ?? MEASURE_STYLE : void 0,
		role: "menu",
		onClick: (e) => {
			e.stopPropagation();
		},
		children: [jsx("div", {
			className: css$7.viewport,
			role: "presentation",
			children: items.map(renderEntry)
		}), footer !== void 0 && footer.length > 0 && jsx("div", {
			className: css$7.footer,
			role: "presentation",
			children: footer.map(renderEntry)
		})]
	});
	return jsxs("span", {
		ref: rootRef,
		className: clsx(css$7.root, className),
		onPointerEnter: closeOnPointerLeave ? cancelClose : void 0,
		onPointerLeave: closeOnPointerLeave ? () => {
			if (open) armClose();
		} : void 0,
		children: [anchor, portal ? list !== false && createPortal(list, document.body) : list]
	});
}
//#endregion
//#region lib/types/useAnchoredMaxHeight.js
/**
* Viewport-fit hook for bottom-anchored overlays (slash menu, popupSelect):
* the element's bottom edge is laid out independent of its height, so it
* grows upward and only the top edge can collide with the viewport — clamp
* the design cap to the space between that edge and the viewport top.
*/
/** Safe distance kept between the overlay and the viewport top edge (mirrors the Menu portal margin). */
const MARGIN = 12;
/**
* Clamp a bottom-anchored overlay's max-height to the viewport.
* @param ref - the overlay element; a null current (overlay closed) skips measuring.
* @param cap - design max-height in px (the clamp never exceeds it).
* @param signal - re-measure trigger: pass the overlay's render state so anchor
*   moves (composer growth) re-fit; resize/scroll re-fit while mounted.
* @returns the max-height to apply inline, in px.
*/
function useAnchoredMaxHeight(ref, cap, signal) {
	const [maxHeight, setMaxHeight] = useState(cap);
	useLayoutEffect(() => {
		const el = ref.current;
		if (el === null) return;
		const fit = () => {
			setMaxHeight(Math.min(cap, Math.max(0, el.getBoundingClientRect().bottom - MARGIN)));
		};
		fit();
		window.addEventListener("resize", fit);
		window.addEventListener("scroll", fit, true);
		return () => {
			window.removeEventListener("resize", fit);
			window.removeEventListener("scroll", fit, true);
		};
	}, [
		ref,
		cap,
		signal
	]);
	return maxHeight;
}
//#endregion
//#region lib/types/useAnchoredPosition.js
/**
* Keep a fixed-position floating element anchored to a trigger.
*
* A portaled panel is positioned from its anchor's viewport rect, which stops
* being true the moment anything scrolls or the window resizes. This owns that
* one concern: measure the anchor, offset the panel below or above it, clamp
* the result inside the viewport, and re-run on scroll (capture phase, so
* scrollers nested inside the page are caught too), on resize, and on the
* panel's own size changes while the element is open.
* @module @deepseek-ai/dsh-client-ui-primitives/useAnchoredPosition
*/
/**
* Track an anchor and return the panel's fixed coordinates.
* @param options - the open state, the two refs, the placement side, and the gap/margin distances.
* @returns `left`/`top` for the panel, or `null` before the first measurement.
*/
function useAnchoredPosition(options) {
	const { open, anchorRef, panelRef, side = "bottom", gap, margin } = options;
	const [position, setPosition] = useState(null);
	useLayoutEffect(() => {
		if (!open) {
			setPosition(null);
			return;
		}
		const place = () => {
			/* v8 ignore start -- geometry read from real layout: jsdom reports zero
			offset sizes, so the positive-size clamp arms are exercised by browser
			scenarios rather than unit tests. */
			const rect = anchorRef.current?.getBoundingClientRect();
			if (rect === void 0) return;
			const panel = panelRef.current;
			const width = panel?.offsetWidth ?? 0;
			const height = panel?.offsetHeight ?? 0;
			let left = rect.left;
			let top = side === "top" ? rect.top - gap - height : rect.bottom + gap;
			if (width > 0) left = Math.min(Math.max(left, margin), window.innerWidth - width - margin);
			if (height > 0) top = Math.min(Math.max(top, margin), window.innerHeight - height - margin);
			/* v8 ignore stop */
			setPosition({
				left,
				top
			});
		};
		place();
		window.addEventListener("scroll", place, true);
		window.addEventListener("resize", place);
		const panel = panelRef.current;
		let observer = null;
		if (typeof ResizeObserver !== "undefined" && panel !== null) {
			observer = new ResizeObserver(place);
			observer.observe(panel);
		}
		return () => {
			observer?.disconnect();
			window.removeEventListener("scroll", place, true);
			window.removeEventListener("resize", place);
		};
	}, [
		open,
		anchorRef,
		panelRef,
		side,
		gap,
		margin
	]);
	return position;
}
//#endregion
//#region lib/types/useDismissOnOutsidePointer.js
/**
* Outside-pointer dismissal for trigger-owned popovers (jobs list, Cordis
* panel): while the surface is open, a pointerdown outside the root closes it.
*/
/**
* Close an open popover when a pointerdown lands outside its root element.
* @param root - element containing both the trigger and the open surface.
* @param open - whether the surface is showing; false detaches the listener.
* @param setOpen - state setter invoked with false on an outside pointerdown.
* @param portal - surface portaled outside the root (a `document.body` dialog)
* that also counts as inside; omit when the root contains the whole popover.
*/
function useDismissOnOutsidePointer(root, open, setOpen, portal) {
	useEffect(() => {
		if (!open) return;
		const closeOutside = (event) => {
			if (event.target instanceof Node && root.current?.contains(event.target) !== true && portal?.current?.contains(event.target) !== true) setOpen(false);
		};
		document.addEventListener("pointerdown", closeOutside);
		return () => {
			document.removeEventListener("pointerdown", closeOutside);
		};
	}, [
		root,
		open,
		setOpen,
		portal
	]);
}
//#endregion
//#region lib/types/clipboard.js
/**
* Write text to the host clipboard, preferring the async Clipboard API and
* falling back to `execCommand('copy')` on hosts (jsdom, insecure contexts)
* that omit it.
* @param text - the exact text to place on the clipboard.
* @returns true only when the host accepted the write.
*/
async function writeClipboard(text) {
	if (navigator.clipboard?.writeText) try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
	const exec = typeof document.execCommand === "function" ? document.execCommand.bind(document) : void 0;
	if (exec === void 0) return false;
	const el = document.createElement("textarea");
	el.value = text;
	el.setAttribute("readonly", "");
	el.style.position = "fixed";
	el.style.left = "-9999px";
	document.body.appendChild(el);
	el.select();
	try {
		return exec("copy");
	} catch {
		return false;
	} finally {
		el.remove();
	}
}
//#endregion
//#region lib/types/HoverCard.js
/**
* Render an anchor with a hover-triggered preview card.
* @param props.anchor - the hover target (rendered in place inside a wrapper span).
* @param props.content - card content; the pointer may rest on it, so it is
* readable and selectable, but it carries no dismissal affordance of its own.
* @param props.openDelayMs - hover dwell before the card shows (default 500).
* @param props.disabled - suppress opening; turning true closes an open card.
* @param props.copyText - optional primary value copied by activation and
* included in the card's accessible name.
* @param props.copyLabel - localized accessible activation-label prefix.
* @param props.copiedLabel - localized visible success label.
* @returns anchor wrapper with the conditional portaled card.
*/
function HoverCard({ anchor, content, openDelayMs = 500, disabled = false, copyText, copyLabel, copiedLabel }) {
	const rootRef = useRef(null);
	const cardRef = useRef(null);
	const timerRef = useRef(null);
	const copyTimerRef = useRef(null);
	const copyHeightRef = useRef(null);
	const copyEpochRef = useRef(0);
	const copyingRef = useRef(false);
	const mountedRef = useRef(true);
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState(null);
	const [copied, setCopied] = useState(false);
	const clearCopied = useCallback(() => {
		if (copyTimerRef.current !== null) {
			clearTimeout(copyTimerRef.current);
			copyTimerRef.current = null;
		}
		copyHeightRef.current = null;
		setCopied(false);
	}, []);
	const close = useCallback(() => {
		copyEpochRef.current += 1;
		clearCopied();
		setOpen(false);
	}, [clearCopied]);
	const { arm: armClose, cancel: cancelClose } = usePointerGrace(close);
	const clearTimer = () => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};
	useEffect(() => {
		if (!disabled) return;
		clearTimer();
		cancelClose();
		close();
	}, [
		disabled,
		cancelClose,
		close
	]);
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			copyEpochRef.current += 1;
			clearTimer();
			if (copyTimerRef.current !== null) {
				clearTimeout(copyTimerRef.current);
				copyTimerRef.current = null;
			}
		};
	}, []);
	useLayoutEffect(() => {
		if (!open) {
			setPos(null);
			return;
		}
		const place = () => {
			const wrapper = rootRef.current;
			/* v8 ignore next -- the ref is attached before the layout effect runs and the listeners die with it. */
			if (wrapper === null) return;
			const r = wrapper.getBoundingClientRect();
			const h = cardRef.current?.offsetHeight ?? 0;
			const top = r.top + h > window.innerHeight - 8 ? window.innerHeight - h - 8 : r.top;
			setPos({
				left: r.right + 8,
				top
			});
		};
		place();
		window.addEventListener("scroll", place, true);
		window.addEventListener("resize", place);
		return () => {
			window.removeEventListener("scroll", place, true);
			window.removeEventListener("resize", place);
		};
	}, [open]);
	useLayoutEffect(() => {
		if (!open || pos === null) return;
		/* v8 ignore next -- the card is mounted whenever pos is set, so the ref is attached here. */
		const h = cardRef.current?.offsetHeight ?? 0;
		if (pos.top + h > window.innerHeight - 8) setPos({
			left: pos.left,
			top: window.innerHeight - h - 8
		});
	}, [open, pos]);
	const copy = async (text) => {
		if (copied || copyingRef.current) return;
		copyingRef.current = true;
		const copyEpoch = copyEpochRef.current;
		const accepted = await writeClipboard(text);
		copyingRef.current = false;
		const card = cardRef.current;
		if (!accepted || !mountedRef.current || copyEpoch !== copyEpochRef.current || card === null) return;
		const height = card.offsetHeight;
		copyHeightRef.current = height > 0 ? height : null;
		setCopied(true);
		copyTimerRef.current = setTimeout(clearCopied, 1e3);
	};
	const copyable = copyText !== void 0;
	const card = open && pos !== null && jsx("div", {
		ref: cardRef,
		className: `${css$8.card}${copyable ? ` ${css$8.copyable}` : ""}${copied ? ` ${css$8.feedback}` : ""}`,
		style: {
			...pos,
			minHeight: copied && copyHeightRef.current !== null ? copyHeightRef.current : void 0
		},
		role: copyable ? "button" : void 0,
		tabIndex: copyable ? 0 : void 0,
		"aria-label": copyable ? `${copyLabel}: ${copyText}` : void 0,
		onClick: copyable ? (e) => {
			const selection = window.getSelection();
			if (selection !== null && !selection.isCollapsed) {
				for (let i = 0; i < selection.rangeCount; i += 1) if (selection.getRangeAt(i).intersectsNode(e.currentTarget)) return;
			}
			copy(copyText);
		} : void 0,
		onKeyDown: copyable ? (e) => {
			if (e.key !== "Enter" && e.key !== " ") return;
			e.preventDefault();
			copy(copyText);
		} : void 0,
		children: copied ? jsx("span", {
			className: css$8.copied,
			"aria-hidden": "true",
			children: copiedLabel
		}) : content
	});
	return jsxs("span", {
		ref: rootRef,
		className: css$8.root,
		onPointerEnter: () => {
			if (disabled) return;
			cancelClose();
			if (open) return;
			clearTimer();
			timerRef.current = setTimeout(() => {
				setOpen(true);
			}, openDelayMs);
		},
		onPointerLeave: () => {
			clearTimer();
			if (open) armClose();
		},
		onPointerDownCapture: (e) => {
			if (cardRef.current?.contains(e.target)) return;
			clearTimer();
			cancelClose();
			close();
		},
		children: [
			anchor,
			open && copyable && jsx("span", {
				className: css$8.status,
				role: "status",
				children: copied ? copiedLabel : ""
			}),
			card !== false && createPortal(card, document.body)
		]
	});
}
//#endregion
//#region lib/types/Modal.js
/**
* Render a centered, body-portaled modal over a blurred page mask.
* @param props.open - whether the dialog is showing.
* @param props.onClose - Escape or mask click.
* @param props.title - dialog heading (aria-label in every mode).
* @param props.closeLabel - localized accessible close-button label.
* @param props.description - optional supporting sentence under the title.
* @param props.children - body (inputs, etc.).
* @param props.footer - action row (Cancel / Create).
* @param props.contentClassName - optional class for a scrollable content region.
* @param props.headless - render children directly in the card (no default
* header/close/body chrome); mask, card, Escape, and aria-label remain.
* @returns null when closed; otherwise the overlay tree.
*/
function Modal({ open, onClose, title, closeLabel, description, children, footer, className, contentClassName, headless = false }) {
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open, onClose]);
	if (!open) return null;
	return createPortal(jsxs("div", {
		className: css$9.root,
		role: "presentation",
		children: [jsx("div", {
			className: css$9.mask,
			"aria-hidden": "true",
			onClick: onClose
		}), jsx("div", {
			className: clsx(css$9.dialog, className),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			children: headless ? children : jsxs(Fragment, { children: [jsxs("div", {
				className: clsx(css$9.content, contentClassName),
				children: [
					jsxs("div", {
						className: css$9.header,
						children: [jsx("h2", {
							className: css$9.title,
							children: title
						}), jsx("button", {
							type: "button",
							className: css$9.close,
							"aria-label": closeLabel,
							onClick: onClose,
							children: jsx(IconCloseOutline16, { size: 14 })
						})]
					}),
					description !== void 0 && description !== "" && jsx("p", {
						className: css$9.description,
						children: description
					}),
					children !== void 0 && jsx("div", {
						className: css$9.body,
						children
					})
				]
			}), footer !== void 0 && jsx("div", {
				className: css$9.footer,
				children: footer
			})] })
		})]
	}), document.body);
}
//#endregion
//#region lib/types/OnboardingSurface.js
/**
* Render a body-portaled onboarding stage and keep the application root inert
* while mounted.
* @param props.children - the step's page content, centered on the stage.
* @returns the body-portaled overlay tree.
*/
function OnboardingSurface({ children }) {
	useEffect(() => {
		const appRoot = document.getElementById("root");
		if (appRoot === null) return;
		appRoot.inert = true;
		return () => {
			appRoot.inert = false;
		};
	}, []);
	return createPortal(jsxs("div", {
		className: css$10.onboardingOverlay,
		role: "presentation",
		children: [jsx("div", {
			className: css$10.onboardingMask,
			"aria-hidden": "true"
		}), jsx("div", {
			className: css$10.onboardingStage,
			children
		})]
	}), document.body);
}
//#endregion
//#region lib/types/RiskConfirmation.js
/**
* Controlled risk acknowledgement dialog shared by product surfaces that
* must gate a sensitive action behind an explicit checkbox.
*/
/**
* Render one in-page confirmation whose primary action is unavailable until
* the caller-controlled acknowledgement is checked.
*/
function RiskConfirmation({ open, title, description, acknowledgeLabel, cancelLabel, closeLabel, confirmLabel, acknowledged, disabled = false, onAcknowledgedChange, onCancel, onConfirm }) {
	return jsxs(Modal, {
		open,
		onClose: onCancel,
		title,
		closeLabel,
		className: css$11.confirmation ?? "",
		contentClassName: css$11.confirmationContent ?? "",
		footer: jsxs(Fragment, { children: [jsx(Button, {
			variant: "outline",
			className: css$11.modalAction,
			onClick: onCancel,
			children: cancelLabel
		}), jsx(Button, {
			variant: "primary",
			className: css$11.confirmAction,
			disabled: disabled || !acknowledged,
			onClick: onConfirm,
			children: confirmLabel
		})] }),
		children: [jsxs("div", {
			className: css$11.warning,
			children: [jsx(IconWarningOutline16, {
				size: 18,
				className: css$11.warningIcon
			}), jsx("p", { children: description })]
		}), jsxs("label", {
			className: css$11.acknowledgement,
			children: [jsx("input", {
				type: "checkbox",
				checked: acknowledged,
				disabled,
				autoFocus: true,
				onChange: (event) => {
					onAcknowledgedChange(event.currentTarget.checked);
				}
			}), jsx("span", { children: acknowledgeLabel })]
		})]
	});
}
//#endregion
//#region lib/types/ConnectionIndicator.js
/**
* Render an inline connection-recovery control.
* @param props.state - visible outage, retry-attempt, or recovered state.
* @param props.disconnectedLabel - localized outage text.
* @param props.reconnectLabel - localized action text shown on hover or focus.
* @param props.connectingLabel - localized retry text followed by the attempt dots.
* @param props.recoveredLabel - localized recovery confirmation.
* @param props.reconnectActionLabel - accessible label for the outage action.
* @param props.restartActionLabel - accessible label for replacing an active attempt.
* @param props.onReconnect - request an immediate reconnect attempt.
* @returns the indicator, or null when no connection feedback is active.
*/
function ConnectionIndicator({ state, disconnectedLabel, reconnectLabel, connectingLabel, recoveredLabel, reconnectActionLabel, restartActionLabel, onReconnect }) {
	if (state === void 0) return null;
	const sizeLabels = jsxs(Fragment, { children: [
		jsx("span", {
			className: css$12.sizeLabel,
			"aria-hidden": "true",
			children: disconnectedLabel
		}),
		jsx("span", {
			className: css$12.sizeLabel,
			"aria-hidden": "true",
			children: reconnectLabel
		}),
		jsxs("span", {
			className: css$12.sizeLabel,
			"aria-hidden": "true",
			children: [connectingLabel, jsx("span", {
				className: css$12.dots,
				children: "..."
			})]
		}),
		jsx("span", {
			className: css$12.sizeLabel,
			"aria-hidden": "true",
			children: recoveredLabel
		})
	] });
	if (state === "recovered") return jsxs("div", {
		className: `${css$12.indicator} ${css$12.success}`,
		role: "status",
		"aria-label": recoveredLabel,
		children: [jsx("span", {
			className: css$12.icon,
			"aria-hidden": "true",
			children: jsx(IconCheckOutline16, { size: 14 })
		}), jsxs("span", {
			className: css$12.label,
			children: [sizeLabels, jsx("span", {
				className: css$12.stateLabel,
				children: recoveredLabel
			})]
		})]
	});
	const connecting = state === "connecting";
	return jsxs("button", {
		type: "button",
		className: `${css$12.indicator} ${css$12.warning}`,
		"data-phase": state,
		"aria-label": connecting ? restartActionLabel : reconnectActionLabel,
		onClick: onReconnect,
		children: [jsx("span", {
			className: css$12.icon,
			"aria-hidden": "true",
			children: jsx(IconWarningOutline16, { size: 14 })
		}), jsxs("span", {
			className: css$12.label,
			children: [
				sizeLabels,
				jsx("span", {
					className: css$12.stateLabel,
					children: connecting ? jsxs(Fragment, { children: [connectingLabel, jsxs("span", {
						className: css$12.dots,
						"aria-hidden": "true",
						children: [
							jsx("span", { children: "." }),
							jsx("span", {
								className: css$12.secondDot,
								children: "."
							}),
							jsx("span", {
								className: css$12.thirdDot,
								children: "."
							})
						]
					})] }) : disconnectedLabel
				}),
				jsx("span", {
					className: css$12.hoverLabel,
					children: reconnectLabel
				})
			]
		})]
	});
}
//#endregion
//#region lib/types/FishLogo.js
/** Native viewBox of {@link FISH_LOGO_PATH} (width and height in user units). */
const FISH_LOGO_VIEWBOX = {
	width: 23.16,
	height: 17.04
};
/** The fish silhouette path data, exported for consumers that compose their own svg (entrance effects, masks) around the same geometry. */
const FISH_LOGO_PATH = "M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z";
/**
* Render the fish logo.
* @param props.size - width in px (default 24; height keeps the 23.16:17.04 ratio).
* @param props.className - extra class for layout placement.
* @returns the logo svg (aria-hidden; pair with the wordmark for accessibility).
*/
function FishLogo({ size = 24, className }) {
	return jsx("svg", {
		width: size,
		height: size * FISH_LOGO_VIEWBOX.height / FISH_LOGO_VIEWBOX.width,
		className,
		viewBox: `0 0 ${FISH_LOGO_VIEWBOX.width} ${FISH_LOGO_VIEWBOX.height}`,
		fill: "none",
		"aria-hidden": "true",
		children: jsx("path", {
			d: FISH_LOGO_PATH,
			fill: "currentColor"
		})
	});
}
//#endregion
//#region lib/types/BrandWordmark.js
/**
* Render the full brand wordmark.
* @param props.size - height in px (default 24; width follows the selected artwork).
* @param props.className - extra class for layout placement.
* @param props.includeMark - whether to include the leading whale mark.
* @returns the wordmark svg (aria-hidden decorative brand art).
*/
function BrandWordmark({ size = 24, className, includeMark = true }) {
	return jsxs("svg", {
		width: size * (includeMark ? 182 : 156) / 24,
		height: size,
		className,
		viewBox: includeMark ? "0 0 182 24" : "26 0 156 24",
		fill: "none",
		"aria-hidden": "true",
		children: [
			jsx("path", {
				d: "M68.416 18.2447H67.0501V16.1272H68.416C69.2619 16.1272 70.1166 15.9163 70.6671 15.3304C71.2181 14.7444 71.426 13.8455 71.426 12.9471C71.426 12.0487 71.2268 11.1498 70.6671 10.5643C70.1083 9.97831 69.2619 9.76744 68.416 9.76744C67.5701 9.76744 66.7154 9.97831 66.1639 10.5643C65.6129 11.1503 65.4049 12.0487 65.4049 12.9471V21.6435H63.009V7.6582H65.4049V8.54883H65.8442C65.8918 8.49393 65.9394 8.44728 65.9875 8.40064C66.5871 7.85353 67.5049 7.6582 68.4072 7.6582C69.8212 7.6582 71.2341 8.00998 72.1607 8.98662C73.0868 9.96325 73.4143 11.4632 73.4143 12.9558C73.4143 14.4485 73.0785 15.9406 72.1607 16.925C71.2424 17.9094 69.8212 18.2457 68.416 18.2457V18.2447Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M31.9551 8.03497H33.3204V10.1525H31.9551C31.1087 10.1525 30.2545 10.3633 29.7035 10.9493C29.1525 11.5353 28.945 12.4342 28.945 13.3326C28.945 14.231 29.1447 15.1294 29.7035 15.7154C30.2623 16.3014 31.1087 16.5122 31.9551 16.5122C32.8015 16.5122 33.6562 16.3014 34.2072 15.7154C34.7582 15.1294 34.9657 14.231 34.9657 13.3326V4.62842H37.3611V18.6219H34.9657V17.7313H34.5264C34.4783 17.7857 34.4307 17.8329 34.3826 17.8795C33.7835 18.4261 32.8652 18.6219 31.9629 18.6219C30.5494 18.6219 29.136 18.2707 28.2099 17.294C27.2838 16.3174 26.9563 14.817 26.9563 13.3248C26.9563 11.8327 27.2916 10.34 28.2099 9.35561C29.136 8.37898 30.5494 8.03497 31.9551 8.03497Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M49.3786 13.1431V13.9948H42.9984V12.2996H47.2305C47.1348 11.6825 46.9113 11.1043 46.5119 10.682C45.9371 10.0727 45.0503 9.85409 44.1723 9.85409C43.2943 9.85409 42.4076 10.0727 41.8328 10.682C41.258 11.2913 41.05 12.2213 41.05 13.1435C41.05 14.0658 41.2575 15.003 41.8328 15.6046C42.4076 16.2061 43.2939 16.433 44.1723 16.433C45.0508 16.433 45.9371 16.2143 46.5119 15.6046C46.5916 15.5186 46.6635 15.4248 46.7354 15.331H49.0992C48.8918 16.0657 48.5643 16.7299 48.0691 17.2454C47.111 18.2531 45.6339 18.6205 44.1723 18.6205C42.7108 18.6205 41.2337 18.2609 40.2755 17.2454C39.3174 16.2299 38.9661 14.6828 38.9661 13.1435C38.9661 11.6043 39.3096 10.0494 40.2755 9.04168C41.242 8.03396 42.7108 7.66663 44.1723 7.66663C45.6339 7.66663 47.111 8.02618 48.0691 9.04168C49.0351 10.0572 49.3786 11.6043 49.3786 13.1435V13.1431Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M61.4045 13.1431V13.9948H55.0243V12.2996H59.2564C59.1602 11.6825 58.9372 11.1043 58.5378 10.682C57.963 10.0727 57.0762 9.85409 56.1982 9.85409C55.3202 9.85409 54.4335 10.0727 53.8587 10.682C53.2839 11.2913 53.0759 12.2213 53.0759 13.1435C53.0759 14.0658 53.2834 15.003 53.8587 15.6046C54.4335 16.2061 55.3202 16.433 56.1982 16.433C57.0762 16.433 57.963 16.2143 58.5378 15.6046C58.6179 15.5186 58.6894 15.4248 58.7608 15.331H61.1251C60.9171 16.0657 60.5897 16.7299 60.0945 17.2454C59.1364 18.2531 57.6593 18.6205 56.1982 18.6205C54.7372 18.6205 53.2596 18.2609 52.3014 17.2454C51.3432 16.2299 50.9919 14.6828 50.9919 13.1435C50.9919 11.6043 51.3355 10.0494 52.3014 9.04168C53.2678 8.03396 54.7367 7.66663 56.1982 7.66663C57.6598 7.66663 59.1364 8.02618 60.0945 9.04168C61.061 10.0572 61.4045 11.6043 61.4045 13.1435V13.1431Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M80.242 18.6214C81.7035 18.6214 83.1801 18.4105 84.1383 17.809C85.0965 17.2075 85.4482 16.2931 85.4482 15.3869C85.4482 14.4807 85.1042 13.5585 84.1383 12.9647C83.1801 12.371 81.703 12.1518 80.242 12.1518C79.6186 12.1518 79.0438 12.0658 78.6366 11.8394C78.2294 11.6047 78.0778 11.2534 78.0778 10.9017C78.0778 10.5499 78.2216 10.1908 78.6366 9.9639C79.0438 9.72921 79.6749 9.65147 80.2973 9.65147C80.9198 9.65147 81.5509 9.73747 81.9591 9.9639C82.3663 10.1986 82.5179 10.5499 82.5179 10.9017H84.9531C84.9531 9.99499 84.6421 9.07327 83.7719 8.47951C82.9017 7.88576 81.5679 7.66663 80.2424 7.66663C78.9169 7.66663 77.5837 7.8775 76.713 8.47951C75.8427 9.08104 75.5308 9.99499 75.5308 10.9017C75.5308 11.8083 75.8423 12.73 76.713 13.3238C77.5832 13.9176 78.9165 14.1367 80.2424 14.1367C80.929 14.1367 81.688 14.2227 82.1428 14.4491C82.5985 14.676 82.7579 15.0351 82.7579 15.3869C82.7579 15.7387 82.5985 16.0977 82.1428 16.3246C81.688 16.5511 80.9931 16.6371 80.3066 16.6371C79.62 16.6371 78.9169 16.5511 78.4694 16.3246C78.0224 16.0982 77.8543 15.7387 77.8543 15.3869H75.0435C75.0435 16.2935 75.3865 17.2153 76.3534 17.809C77.3194 18.4028 78.7809 18.6214 80.2424 18.6214H80.242Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M97.4733 13.1431V13.9948H91.0932V12.2996H95.3252C95.23 11.6825 95.006 11.1043 94.6071 10.682C94.0313 10.0727 93.1456 9.85409 92.2666 9.85409C91.3876 9.85409 90.5018 10.0727 89.927 10.682C89.3522 11.2913 89.1452 12.2213 89.1452 13.1435C89.1452 14.0658 89.3522 15.003 89.927 15.6046C90.5018 16.2061 91.3886 16.433 92.2666 16.433C93.1446 16.433 94.0313 16.2143 94.6071 15.6046C94.6863 15.5186 94.7587 15.4248 94.8301 15.331H97.1935C96.9855 16.0657 96.6585 16.7299 96.1639 17.2454C95.2057 18.2531 93.7281 18.6205 92.2666 18.6205C90.805 18.6205 89.3284 18.2609 88.3703 17.2454C87.4121 16.2299 87.0613 14.6828 87.0613 13.1435C87.0613 11.6043 87.4043 10.0494 88.3703 9.04168C89.3367 8.03396 90.806 7.66663 92.2666 7.66663C93.7272 7.66663 95.2057 8.02618 96.1639 9.04168C97.1298 10.0572 97.4729 11.6043 97.4729 13.1435L97.4733 13.1431Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M109.499 13.1431V13.9948H103.119V12.2996H107.351C107.256 11.6825 107.032 11.1043 106.632 10.682C106.057 10.0727 105.172 9.85409 104.293 9.85409C103.414 9.85409 102.528 10.0727 101.953 10.682C101.378 11.2913 101.17 12.2213 101.17 13.1435C101.17 14.0658 101.378 15.003 101.953 15.6046C102.528 16.2061 103.415 16.433 104.293 16.433C105.171 16.433 106.057 16.2143 106.632 15.6046C106.712 15.5186 106.784 15.4248 106.856 15.331H109.22C109.012 16.0657 108.685 16.7299 108.19 17.2454C107.231 18.2531 105.754 18.6205 104.293 18.6205C102.831 18.6205 101.355 18.2609 100.396 17.2454C99.4382 16.2299 99.0864 14.6828 99.0864 13.1435C99.0864 11.6043 99.4295 10.0494 100.396 9.04168C101.362 8.03396 102.832 7.66663 104.293 7.66663C105.754 7.66663 107.231 8.02618 108.19 9.04168C109.156 10.0572 109.499 11.6043 109.499 13.1435V13.1431Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M113.5 4.62817H111.104V18.6217H113.5V4.62817Z",
				fill: "currentColor"
			}),
			jsx("path", {
				d: "M117.589 12.8154L121.517 18.6208H118.554L114.625 12.8154L118.554 8.15088H121.517L117.589 12.8154Z",
				fill: "currentColor"
			}),
			jsx("g", {
				clipPath: "url(#dsh-wordmark-whale-clip)",
				children: jsx("path", {
					d: "M23.0584 4.95203C22.8129 4.83203 22.7074 5.06103 22.5639 5.17704C22.5149 5.21454 22.4734 5.26354 22.4319 5.30854C22.0734 5.69155 21.6543 5.94306 21.1073 5.91306C20.3073 5.86806 19.6243 6.11957 19.0203 6.73158C18.8918 5.97706 18.4652 5.52655 17.8162 5.23754C17.4767 5.08753 17.1332 4.93703 16.8952 4.61052C16.7292 4.37801 16.6837 4.11901 16.6007 3.8635C16.5477 3.70949 16.4952 3.55199 16.3177 3.52549C16.1252 3.49549 16.0497 3.65699 15.9742 3.792C15.6722 4.34401 15.5552 4.95203 15.5667 5.56805C15.5932 6.95359 16.1782 8.05712 17.3407 8.84215C17.4727 8.93215 17.5067 9.02215 17.4652 9.15366C17.3857 9.42416 17.2917 9.68667 17.2087 9.95718C17.1557 10.1297 17.0767 10.1677 16.8917 10.0922C16.2537 9.82568 15.7027 9.43117 15.2156 8.95465C14.3891 8.15513 13.6416 7.2726 12.7096 6.58158C12.4906 6.42007 12.2716 6.27007 12.045 6.12707C11.094 5.20354 12.1696 4.44502 12.4186 4.35501C12.6791 4.26101 12.5091 3.938 11.6675 3.942C10.826 3.9455 10.056 4.22751 9.07446 4.60302C8.93096 4.65952 8.77995 4.70052 8.62545 4.73452C7.73492 4.56552 6.80989 4.52802 5.84386 4.63702C4.02481 4.83953 2.57177 5.69955 1.50373 7.1676C0.220694 8.93215 -0.0813148 10.9372 0.288196 13.0283C0.676708 15.2323 1.80174 17.0569 3.53029 18.4834C5.32285 19.9625 7.38741 20.6875 9.74298 20.5485C11.1735 20.466 12.7661 20.2745 14.5626 18.7539C15.0156 18.9795 15.4912 19.0695 16.2797 19.137C16.8872 19.1935 17.4722 19.107 17.9252 19.013C18.6347 18.8629 18.5857 18.2059 18.3292 18.0854C16.2497 17.1169 16.7062 17.5109 16.2912 17.1919C17.3477 15.9419 18.9618 13.7198 19.4598 10.6942C19.5088 10.3602 19.5713 9.88968 19.5638 9.61917C19.5598 9.45417 19.5978 9.39016 19.7863 9.37116C20.3073 9.31116 20.8128 9.16866 21.2773 8.91315C22.6249 8.17713 23.1684 6.96809 23.2964 5.51905C23.3154 5.29754 23.2924 5.06853 23.0584 4.95203ZM11.3165 17.9954C9.30097 16.4109 8.32344 15.8894 7.91992 15.9119C7.54241 15.9344 7.61042 16.3664 7.69342 16.6479C7.78042 16.9259 7.89342 17.1174 8.05193 17.3614C8.16143 17.5229 8.23694 17.7629 7.94243 17.9434C7.29341 18.3449 6.16487 17.8084 6.11187 17.7819C4.79833 17.0084 3.7003 15.9874 2.92628 14.5908C2.17875 13.2468 1.74474 11.8047 1.67324 10.2657C1.65424 9.89418 1.76374 9.76267 2.13375 9.69517C2.62077 9.60517 3.12278 9.58617 3.6093 9.65767C5.66636 9.95818 7.41741 10.8777 8.88545 12.3348C9.72348 13.1643 10.3575 14.1558 11.0105 15.1243C11.705 16.1529 12.4521 17.1329 13.4036 17.9364C13.7396 18.2179 14.0076 18.4319 14.2641 18.5899C13.4906 18.6764 12.1996 18.6949 11.3165 17.9964V17.9954ZM12.2826 11.7817C12.2826 11.6167 12.4146 11.4852 12.5806 11.4852C12.6181 11.4852 12.6521 11.4927 12.6826 11.5037C12.7241 11.5187 12.7621 11.5412 12.7921 11.5752C12.8451 11.6277 12.8751 11.7027 12.8751 11.7817C12.8751 11.9467 12.7431 12.0782 12.5771 12.0782C12.4111 12.0782 12.2826 11.9467 12.2826 11.7817ZM15.2831 13.3208C15.0906 13.3998 14.8981 13.4673 14.7131 13.4748C14.4261 13.4898 14.1131 13.3733 13.9431 13.2308C13.6791 13.0093 13.4901 12.8853 13.4111 12.4988C13.3771 12.3338 13.3961 12.0782 13.4261 11.9317C13.4941 11.6162 13.4186 11.4137 13.1961 11.2297C13.0151 11.0797 12.7846 11.0382 12.5316 11.0382C12.4371 11.0382 12.3506 10.9967 12.2861 10.9632C12.1806 10.9107 12.0936 10.7792 12.1766 10.6177C12.2031 10.5652 12.3316 10.4377 12.3616 10.4152C12.7051 10.2197 13.1011 10.2837 13.4676 10.4302C13.8071 10.5692 14.0641 10.8242 14.4336 11.1847C14.8111 11.6202 14.8791 11.7402 15.0941 12.0672C15.2641 12.3228 15.4186 12.5853 15.5247 12.8858C15.5887 13.0733 15.5057 13.2268 15.2831 13.3208Z",
					fill: "currentColor"
				})
			}),
			jsx("rect", {
				x: "129.348",
				y: "5.5",
				width: "52",
				height: "14",
				rx: "2",
				fill: "currentColor"
			}),
			jsxs("g", {
				clipPath: "url(#dsh-wordmark-badge-clip)",
				children: [
					jsx("path", {
						d: "M132.848 8.93205H134.08V16.137H132.848V8.93205ZM136.5 8.93205H137.732V16.137H136.5V8.93205ZM133.365 13.024V11.99H137.193V13.024H133.365Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					}),
					jsx("path", {
						d: "M140.397 14.432L140.672 13.453H143.202L143.532 14.432H140.397ZM140.287 16.137H139.055L141.277 8.93205H142.201L142.146 9.74605L140.947 13.915H140.969L140.287 16.137ZM145.039 16.137H143.741L143.07 13.948L143.081 13.937L141.871 9.74605L141.926 8.93205H142.817L145.039 16.137Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					}),
					jsx("path", {
						d: "M146.846 8.93205H149.068C149.852 8.93205 150.443 9.11538 150.839 9.48205C151.235 9.84138 151.433 10.3327 151.433 10.956C151.433 11.22 151.396 11.4657 151.323 11.693C151.249 11.9204 151.125 12.1257 150.949 12.309C150.773 12.4924 150.531 12.65 150.223 12.782C149.922 12.9067 149.541 13.0057 149.079 13.079V13.321H146.846V12.639L148.023 12.485C148.631 12.4044 149.09 12.298 149.398 12.166C149.706 12.034 149.915 11.8764 150.025 11.693C150.135 11.5024 150.19 11.2934 150.19 11.066C150.19 10.6994 150.083 10.417 149.871 10.219C149.658 10.021 149.324 9.92205 148.87 9.92205H146.846V8.93205ZM146.395 8.93205H147.627V16.137H146.395V8.93205ZM151.917 16.093V16.137H150.366L149.024 14.322C148.87 14.1094 148.73 13.9407 148.606 13.816C148.481 13.684 148.345 13.5887 148.199 13.53C148.052 13.464 147.872 13.42 147.66 13.398C147.447 13.3687 147.176 13.3504 146.846 13.343V13.145H149.079C149.233 13.211 149.368 13.2844 149.486 13.365C149.61 13.4457 149.735 13.5447 149.86 13.662C149.992 13.7794 150.138 13.937 150.3 14.135L151.917 16.093Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					}),
					jsx("path", {
						d: "M153.58 9.57005L153.591 8.93205H154.46L157.584 15.51V16.137H156.704L153.58 9.57005ZM158.024 16.137H156.968L156.88 8.93205H158.024V16.137ZM154.24 16.137H153.096V8.93205H154.152L154.24 16.137Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					}),
					jsx("path", {
						d: "M159.963 8.93205H161.206V16.137H159.963V8.93205ZM160.095 9.96605V8.93205H164.858V9.96605H160.095ZM160.095 16.137V15.103H164.902V16.137H160.095ZM160.095 13.013V11.99H164.374V13.013H160.095Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					}),
					jsx("path", {
						d: "M169.052 15.257C169.543 15.257 169.895 15.1654 170.108 14.982C170.328 14.7987 170.438 14.5457 170.438 14.223C170.438 14.047 170.405 13.8967 170.339 13.772C170.273 13.6474 170.152 13.5337 169.976 13.431C169.807 13.321 169.558 13.2147 169.228 13.112L168.491 12.881C167.846 12.6757 167.38 12.4044 167.094 12.067C166.808 11.7297 166.665 11.3007 166.665 10.78C166.665 10.428 166.76 10.1017 166.951 9.80105C167.142 9.50038 167.428 9.25838 167.809 9.07505C168.19 8.89172 168.663 8.80005 169.228 8.80005C169.631 8.80005 169.998 8.82938 170.328 8.88805C170.665 8.93938 171.039 9.01638 171.45 9.11905L171.274 10.175C170.834 10.0504 170.442 9.96238 170.097 9.91105C169.76 9.85238 169.463 9.82305 169.206 9.82305C168.737 9.82305 168.403 9.90738 168.205 10.076C168.007 10.2374 167.908 10.439 167.908 10.681C167.908 10.857 167.941 11.0147 168.007 11.154C168.073 11.286 168.19 11.407 168.359 11.517C168.535 11.627 168.784 11.7334 169.107 11.836L169.866 12.078C170.526 12.276 170.995 12.5327 171.274 12.848C171.553 13.156 171.692 13.585 171.692 14.135C171.692 14.5604 171.589 14.9344 171.384 15.257C171.179 15.5797 170.878 15.8327 170.482 16.016C170.093 16.1994 169.609 16.291 169.03 16.291C168.627 16.291 168.212 16.247 167.787 16.159C167.362 16.071 166.9 15.9427 166.401 15.774L166.665 14.718C167.156 14.894 167.6 15.0297 167.996 15.125C168.399 15.213 168.751 15.257 169.052 15.257Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					}),
					jsx("path", {
						d: "M175.809 15.257C176.3 15.257 176.652 15.1654 176.865 14.982C177.085 14.7987 177.195 14.5457 177.195 14.223C177.195 14.047 177.162 13.8967 177.096 13.772C177.03 13.6474 176.909 13.5337 176.733 13.431C176.564 13.321 176.315 13.2147 175.985 13.112L175.248 12.881C174.603 12.6757 174.137 12.4044 173.851 12.067C173.565 11.7297 173.422 11.3007 173.422 10.78C173.422 10.428 173.517 10.1017 173.708 9.80105C173.899 9.50038 174.185 9.25838 174.566 9.07505C174.947 8.89172 175.42 8.80005 175.985 8.80005C176.388 8.80005 176.755 8.82938 177.085 8.88805C177.422 8.93938 177.796 9.01638 178.207 9.11905L178.031 10.175C177.591 10.0504 177.199 9.96238 176.854 9.91105C176.517 9.85238 176.22 9.82305 175.963 9.82305C175.494 9.82305 175.16 9.90738 174.962 10.076C174.764 10.2374 174.665 10.439 174.665 10.681C174.665 10.857 174.698 11.0147 174.764 11.154C174.83 11.286 174.947 11.407 175.116 11.517C175.292 11.627 175.541 11.7334 175.864 11.836L176.623 12.078C177.283 12.276 177.752 12.5327 178.031 12.848C178.31 13.156 178.449 13.585 178.449 14.135C178.449 14.5604 178.346 14.9344 178.141 15.257C177.936 15.5797 177.635 15.8327 177.239 16.016C176.85 16.1994 176.366 16.291 175.787 16.291C175.384 16.291 174.969 16.247 174.544 16.159C174.119 16.071 173.657 15.9427 173.158 15.774L173.422 14.718C173.913 14.894 174.357 15.0297 174.753 15.125C175.156 15.213 175.508 15.257 175.809 15.257Z",
						fill: "var(--dsw-alias-label-primary-inverted)"
					})
				]
			}),
			jsxs("defs", { children: [jsx("clipPath", {
				id: "dsh-wordmark-whale-clip",
				children: jsx("rect", {
					width: "23.16",
					height: "17.0435",
					fill: "white",
					transform: "translate(0.141602 3.52185)"
				})
			}), jsx("clipPath", {
				id: "dsh-wordmark-badge-clip",
				children: jsx("rect", {
					width: "46",
					height: "14",
					fill: "white",
					transform: "translate(132.348 5.5)"
				})
			})] })
		]
	});
}
//#endregion
//#region lib/types/ReferenceIcon.js
/**
* Render the icon that identifies one inline reference domain.
* @param props - Reference kind, optional size, and optional CSS class.
* @returns The corresponding current-color SVG glyph.
*/
function ReferenceIcon({ kind, size = 16, className }) {
	switch (kind) {
		case "session": return jsx("svg", {
			width: size,
			height: size,
			className,
			viewBox: "0 0 16 16",
			fill: "none",
			"aria-hidden": true,
			children: jsx("path", {
				d: "M8 0.597656C3.91296 0.597656 0.599716 3.91103 0.599609 7.99805C0.599609 9.13171 0.854567 10.2079 1.31152 11.1699L1.59277 11.7607L2.77441 11.1992L2.49414 10.6084L2.36035 10.3076C2.06865 9.59612 1.90723 8.81645 1.90723 7.99805C1.90733 4.63362 4.63554 1.90625 8 1.90625C11.3644 1.90635 14.0917 4.63368 14.0918 7.99805C14.0918 11.3625 11.3644 14.0907 8 14.0908C7.311 14.0908 6.80642 14.0414 6.35938 13.918C5.919 13.7963 5.50105 13.5929 5.00098 13.2441C4.26805 12.7329 3.21756 12.5526 2.35156 13.0996L2.33789 13.1084L2.32422 13.1182L1.74805 13.5234L2.18164 14.8184L3.05957 14.2002C3.37505 14.0068 3.84248 14.0319 4.25195 14.3174C4.84447 14.7307 5.39718 15.009 6.01172 15.1787C6.61963 15.3465 7.25579 15.3984 8 15.3984C12.087 15.3983 15.4004 12.0851 15.4004 7.99805C15.4003 3.9111 12.087 0.59776 8 0.597656ZM4.56836 8.50977V9.80371H8.12402V8.50977H4.56836ZM4.56836 7.30078H11.4619V6.00684H4.56836V7.30078Z",
				fill: "currentColor"
			})
		});
		case "file": return jsx(IconBrowseOutline16, {
			size,
			className
		});
		case "folder": return jsx(IconFolderClose16, {
			size,
			className
		});
	}
}
//#endregion
//#region lib/types/code-file-icon-artwork.js
/** Placeholder replaced with one React-instance id before SVG insertion. */
const CODE_FILE_ICON_ID_TOKEN = "__DSH_CODE_ICON_INSTANCE__";
/** Validated inner SVG markup for the established detailed code categories. */
const CODE_FILE_ARTWORK = Object.freeze({
	"angular": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F8ECEF\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#DD0031\" d=\"M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z\"/></g>",
	"c": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#EEF4F8\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#659AD2\" d=\"M16.5921 9.1962s-.354-3.298-3.627-3.39c-3.2741-.09-4.9552 2.474-4.9552 6.14 0 3.6651 1.858 6.5972 5.0451 6.5972 3.184 0 3.5381-3.665 3.5381-3.665l6.1041.365s.36 3.31-2.196 5.836c-2.552 2.5241-5.6901 2.9371-7.8762 2.9201-2.19-.017-5.2261.034-8.1602-2.97-2.938-3.0101-3.436-5.9302-3.436-8.8002 0-2.8701.556-6.6702 4.047-9.5502C7.444.72 9.849 0 12.254 0c10.0422 0 10.7172 9.2602 10.7172 9.2602z\"/></g>",
	"clojure": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F1F7EC\" stroke=\"#DCEAD2\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><g fill=\"none\"><path d=\"M64 0C28.712 0 0 28.6 0 63.751c0 35.155 28.712 63.753 64 63.753s64-28.598 64-63.753C128 28.6 99.288 0 64 0\" fill=\"#FFF\"/><path d=\"M61.659 64.898a265.825 265.825 0 00-1.867 4.12c-2.322 5.241-4.894 11.62-5.834 15.706-.337 1.455-.546 3.258-.542 5.258 0 .79.043 1.622.11 2.469a30.74 30.74 0 0010.533 1.87 30.796 30.796 0 009.642-1.566 18.09 18.09 0 01-2.011-2.12c-4.11-5.221-6.403-12.872-10.031-25.737M46.485 38.96c-7.85 5.51-12.986 14.6-13.005 24.9.019 10.145 5.001 19.116 12.653 24.65 1.877-7.789 6.582-14.92 13.637-29.214a114.691 114.691 0 00-1.43-3.72c-1.955-4.884-4.776-10.556-7.294-13.124-1.283-1.342-2.84-2.502-4.561-3.492\" fill=\"#91DC47\"/><path d=\"M90.697 98.798c-4.05-.506-7.392-1.116-10.317-2.144a36.708 36.708 0 01-16.32 3.807c-20.293 0-36.742-16.383-36.745-36.602 0-10.97 4.852-20.805 12.528-27.512-2.053-.495-4.194-.783-6.38-.779-10.782.101-22.162 6.044-26.9 22.095-.443 2.337-.337 4.103-.337 6.197 0 31.818 25.895 57.613 57.835 57.613 19.561 0 36.841-9.682 47.305-24.489-5.66 1.405-11.103 2.077-15.763 2.091-1.747 0-3.387-.093-4.906-.277\" fill=\"#63B132\"/><path d=\"M79.829 87.634c.357.176 1.167.464 2.293.783 7.579-5.542 12.504-14.469 12.523-24.558h-.003c-.028-16.82-13.693-30.43-30.582-30.462a30.765 30.765 0 00-9.602 1.554c6.21 7.05 9.196 17.127 12.084 28.148l.005.013c.005.009.924 3.06 2.501 7.11 1.566 4.042 3.797 9.048 6.23 12.696 1.597 2.444 3.354 4.2 4.551 4.716\" fill=\"#90B4FE\"/><path d=\"M17.057 30.311c5.463-3.408 11.04-4.637 15.908-4.593 6.722.02 12.008 2.096 14.544 3.516.612.352 1.194.73 1.764 1.12a36.714 36.714 0 0114.786-3.096c20.295.003 36.747 16.386 36.75 36.601-.003 10.192-4.188 19.408-10.934 26.044a45.3 45.3 0 005.225.29c6.406.004 13.329-1.404 18.52-5.753 3.384-2.84 6.22-6.998 7.792-13.233.307-2.408.484-4.856.484-7.347 0-31.817-25.892-57.614-57.835-57.614-19.372 0-36.508 9.5-47.004 24.065z\" fill=\"#5881D8\"/></g></svg>",
	"cmake": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F2F5F7\" stroke=\"#D9E1E7\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#064F8C\" d=\"M62.8.4L.3 123.8l68.1-57.9z\"/><path fill=\"#249847\" d=\"M123.8 127.7l-84-33.9L0 127.7z\"/><path fill=\"#BE2128\" d=\"M128 126.6L65.6 2.5l9.2 102.6z\"/><path fill=\"#CDCDCE\" d=\"M71.9 104l-3.1-34.9L42 92z\"/></svg>",
	"cpp": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#E8F2F8\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#00599C\" d=\"M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z\"/></g>",
	"csharp": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F3EEF7\" stroke=\"#E2D7EA\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#9B4F96\" d=\"M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z\"/><path fill=\"#68217A\" d=\"M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z\"/><path fill=\"#fff\" d=\"M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6zM97 66.2l.9-4.3h-4.2v-4.7h5.1L100 51h4.9l-1.2 6.1h3.8l1.2-6.1h4.8l-1.2 6.1h2.4v4.7h-3.3l-.9 4.3h4.2v4.7h-5.1l-1.2 6h-4.9l1.2-6h-3.8l-1.2 6h-4.8l1.2-6h-2.4v-4.7H97zm4.8 0h3.8l.9-4.3h-3.8l-.9 4.3z\"/></svg>",
	"css": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#1572B6\"/><text x=\"10\" y=\"12.8\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"6.2\" font-weight=\"900\" fill=\"#fff\">CSS</text>",
	"dart": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#ECF7FA\" stroke=\"#D5EAF0\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#00c4b3\" d=\"M35.2 34.9l-8.3-8.3v59.7l.1 2.8c0 1.3.2 2.8.7 4.3l65.6 23.1 16.3-7.2-74.4-74.4z\"/><path d=\"M27.7 93.4zm81.9 15.9l-16.3 7.2-65.4-23.1c1.3 4.8 4 10.1 7 13.2l21.3 21.2 47.6.1 5.8-18.6z\" fill=\"#22d3c5\"/><path fill=\"#0075c9\" d=\"M1.7 65.1C-.4 67.3.7 72 4 75.5l14.7 14.8 9.2 3.3c-.3-1.5-.7-3-.7-4.3l-.1-2.8-.2-59.8m82.7 82.6l7.2-16.4-23-65.6c-1.5-.3-3-.6-4.3-.7l-2.9-.1-59.6.1\"/><path d=\"M93.6 27.3c.2 0 .2 0 0 0 .2 0 .2 0 0 0zm16 82l17.7-5.8V54.8l-20.4-20.5c-3-3-8.3-5.8-13.2-7l23.1 65.6\" fill=\"#00a8e1\"/><path fill=\"#00c4b3\" d=\"M90.5 18.2L75.7 3.5c-3.4-3.4-8-4.4-10.4-2.3L26.9 26.6h59.5l2.9.1c1.3 0 2.8.2 4.3.7l-3.1-9.2z\"/></svg>",
	"docker": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#E8F4FC\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#2496ED\" d=\"M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z\"/></g>",
	"elixir": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F3EEF6\" stroke=\"#E3D9E8\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-a\" gradientUnits=\"userSpaceOnUse\" x1=\"835.592\" y1=\"-36.546\" x2=\"821.211\" y2=\"553.414\" gradientTransform=\"matrix(.1297 0 0 .2 -46.03 17.198)\"><stop offset=\"0\" stop-color=\"#d9d8dc\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\".385\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-a)\" d=\"M64.4.5C36.7 13.9 1.9 83.4 30.9 113.9c26.8 33.5 85.4 1.3 68.4-40.5-21.5-36-35-37.9-34.9-72.9z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-b\" gradientUnits=\"userSpaceOnUse\" x1=\"942.357\" y1=\"-40.593\" x2=\"824.692\" y2=\"472.243\" gradientTransform=\"matrix(.1142 0 0 .2271 -47.053 17.229)\"><stop offset=\"0\" stop-color=\"#8d67af\" stop-opacity=\".672\"/><stop offset=\"1\" stop-color=\"#9f8daf\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-b)\" d=\"M64.4.2C36.8 13.6 1.9 82.9 31 113.5c10.7 12.4 28 16.5 37.7 9.1 26.4-18.8 7.4-53.1 10.4-78.5C68.1 33.9 64.2 11.3 64.4.2z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-c\" gradientUnits=\"userSpaceOnUse\" x1=\"924.646\" y1=\"120.513\" x2=\"924.646\" y2=\"505.851\" gradientTransform=\"matrix(.1227 0 0 .2115 -46.493 17.206)\"><stop offset=\"0\" stop-color=\"#26053d\" stop-opacity=\".762\"/><stop offset=\"1\" stop-color=\"#b7b4b4\" stop-opacity=\".278\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-c)\" d=\"M56.7 4.3c-22.3 15.9-28.2 75-24.1 94.2 8.2 48.1 75.2 28.3 69.6-16.5-6-29.2-48.8-39.2-45.5-77.7z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-d\" gradientUnits=\"userSpaceOnUse\" x1=\"428.034\" y1=\"198.448\" x2=\"607.325\" y2=\"559.255\" gradientTransform=\"matrix(.1848 0 0 .1404 -42.394 17.138)\"><stop offset=\"0\" stop-color=\"#91739f\" stop-opacity=\".46\"/><stop offset=\"1\" stop-color=\"#32054f\" stop-opacity=\".54\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-d)\" d=\"M78.8 49.8c10.4 13.4 12.7 22.6 6.8 27.9-27.7 19.4-61.3 7.4-54-37.3C22.1 63 4.5 96.8 43.3 101.6c20.8 3.6 54 2 58.9-16.1-.2-15.9-10.8-22.9-23.4-35.7z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-e\" gradientUnits=\"userSpaceOnUse\" x1=\"907.895\" y1=\"540.636\" x2=\"590.242\" y2=\"201.281\" gradientTransform=\"matrix(.1418 0 0 .1829 -45.23 17.18)\"><stop offset=\"0\" stop-color=\"#463d49\" stop-opacity=\".331\"/><stop offset=\"1\" stop-color=\"#340a50\" stop-opacity=\".821\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-e)\" d=\"M38.1 36.4c-2.9 21.2 35.1 77.9 58.3 71-17.7 35.6-56.9-21.2-64-41.7 1.5-11 2.2-16.4 5.7-29.3z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-f\" gradientUnits=\"userSpaceOnUse\" x1=\"1102.297\" y1=\"100.542\" x2=\"1008.071\" y2=\"431.648\" gradientTransform=\"matrix(.106 0 0 .2448 -47.595 17.242)\"><stop offset=\"0\" stop-color=\"#715383\" stop-opacity=\".145\"/><stop offset=\"1\" stop-color=\"#f4f4f4\" stop-opacity=\".234\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-f)\" d=\"M60.4 49.7c.8 7.9 3.9 20.5 0 28.8S38.7 102 43.6 115.3c11.4 24.8 37.1-4.4 36.9-19 1.1-11.8-6.6-38.7-1.8-52.5L76.5 41l-13.6-4c-2.2 3.2-3 7.5-2.5 12.7z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__elixir-original-g\" gradientUnits=\"userSpaceOnUse\" x1=\"1354.664\" y1=\"140.06\" x2=\"1059.233\" y2=\"84.466\" gradientTransform=\"matrix(.09173 0 0 .2828 -48.536 17.28)\"><stop offset=\"0\" stop-color=\"#a5a1a8\" stop-opacity=\".356\"/><stop offset=\"1\" stop-color=\"#370c50\" stop-opacity=\".582\"/></linearGradient><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__elixir-original-g)\" d=\"M65.3 10.8C36 27.4 48 53.4 49.3 81.6l19.1-55.4c-1.4-5.7-2.3-9.5-3.1-15.4z\"/><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#330A4C\" fill-opacity=\".316\" d=\"M68.3 26.1c-14.8 11.7-14.1 31.3-18.6 54 8.1-21.3 4.1-38.2 18.6-54z\"/><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#FFF\" d=\"M45.8 119.7c8 1.1 12.1 2.2 12.5 3 .3 4.2-11.1 1.2-12.5-3z\"/><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#EDEDED\" fill-opacity=\".603\" d=\"M49.8 10.8c-6.9 7.7-14.4 21.8-18.2 29.7-1 6.5-.5 15.7.6 23.5.9-18.2 7.5-39.2 17.6-53.2z\"/></svg>",
	"env": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#ECD53F\"/><text x=\"10\" y=\"12.9\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"5.7\" font-weight=\"900\" fill=\"#24292F\">.ENV</text>",
	"erlang": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FAEDF1\" stroke=\"#EED6DE\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path d=\"M20.7 103.9C11 93.5 5.2 79.2 5.3 62.1 5.2 47 10 34 18.2 24.1H1v79.7l19.7.1zm90.4 0c4.2-4.5 8-9.8 11.4-15.9l-19-9.5c-6.7 10.8-16.4 20.8-29.9 20.9-19.6-.1-27.3-16.9-27.3-38.5h73.3c.1-2.4.1-3.6 0-4.7.5-12.9-2.9-23.7-9.1-32.1H127v79.7l-15.9.1zM47.5 42.4c.8-9.8 8.5-16.3 17.6-16.4 9.1 0 15.7 6.6 15.9 16.4H47.5z\" fill=\"#A90533\"/></svg>",
	"flutter": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#EEF7FD\" stroke=\"#D7EAF6\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><g fill=\"#3FB6D3\"><path d=\"M12.3 64.2L76.3 0h39.4L32.1 83.6zM76.3 128h39.4L81.6 93.9l34.1-34.8H76.3L42.2 93.5z\"/></g><path fill=\"#27AACD\" d=\"M81.6 93.9l-20-20-19.4 19.6 19.4 19.6z\"/><path fill=\"#19599A\" d=\"M115.7 128L81.6 93.9l-20 19.2L76.3 128z\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__flutter-original-a\" gradientUnits=\"userSpaceOnUse\" x1=\"59.365\" y1=\"116.36\" x2=\"86.825\" y2=\"99.399\"><stop offset=\"0\" stop-color=\"#1b4e94\"/><stop offset=\".63\" stop-color=\"#1a5497\"/><stop offset=\"1\" stop-color=\"#195a9b\"/></linearGradient><path fill=\"url(#__DSH_CODE_ICON_INSTANCE__flutter-original-a)\" d=\"M61.6 113.1l30.8-8.4-10.8-10.8z\"/></svg>",
	"git": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FFF0EC\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#F05032\" d=\"M13.09 23.549a1.54 1.54 0 0 1-2.18 0L.451 13.089a1.54 1.54 0 0 1 0-2.179l7.191-7.19 2.733 2.733a1.85 1.85 0 0 0 .964 2.326v6.66a1.849 1.849 0 1 0 1.54 0V8.957l2.508 2.508a1.85 1.85 0 1 0 1.09-1.09l-2.634-2.634a1.85 1.85 0 0 0-2.378-2.377L8.73 2.63 10.91.451a1.54 1.54 0 0 1 2.179 0l10.459 10.46a1.54 1.54 0 0 1 0 2.179z\"/></g>",
	"go": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#E7F9FC\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#00ADD8\" d=\"M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z\"/></g>",
	"graphql": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FCEAF6\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#E10098\" d=\"M12.002 0a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm8.54 4.931a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm0 9.862a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm-8.54 4.931a2.138 2.138 0 1 0 0 4.276 2.138 2.138 0 1 0 0-4.276zm-8.542-4.93a2.138 2.138 0 1 0 0 4.276 2.138 2.138 0 1 0 0-4.277zm0-9.863a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm8.542-3.378L2.953 6.777v10.448l9.049 5.224 9.047-5.224V6.777zm0 1.601 7.66 13.27H4.34zm-1.387.371L3.97 15.037V7.363zm2.774 0 6.646 3.838v7.674zM5.355 17.44h13.293l-6.646 3.836z\"/></g>",
	"haskell": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F3F0F7\" stroke=\"#E1D9EA\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#463B63\" d=\"M0 110.2L30.1 65 0 19.9h22.6L52.7 65l-30.1 45.1H0z\"/><path fill=\"#5E5187\" d=\"M30.1 110.2L60.2 65 30.1 19.9h22.6l60.2 90.3H90.4L71.5 81.9l-18.8 28.2H30.1z\"/><path fill=\"#904F8C\" d=\"M102.9 83.8l-10-15.1H128v15.1h-25.1zM87.8 61.3l-10-15.1H128v15.1H87.8z\"/></svg>",
	"ini": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#6E7781\"/><text x=\"10\" y=\"13.2\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"7.2\" font-weight=\"800\" fill=\"#fff\">INI</text>",
	"java": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F4F7FA\" stroke=\"#D9E2E8\" stroke-width=\".5\"/><svg x=\"2.5\" y=\"2.5\" width=\"15\" height=\"15\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#0074BD\" d=\"M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z\"/><path fill=\"#EA2D2E\" d=\"M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z\"/><path fill=\"#0074BD\" d=\"M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z\"/><path fill=\"#EA2D2E\" d=\"M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z\"/><path fill=\"#0074BD\" d=\"M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z\"/></svg>",
	"javascript": "<defs><clipPath id=\"__DSH_CODE_ICON_INSTANCE__a\"><rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\"/></clipPath></defs><g clip-path=\"url(#__DSH_CODE_ICON_INSTANCE__a)\"><svg x=\"1\" y=\"1\" width=\"18\" height=\"18\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#F0DB4F\" d=\"M1.408 1.408h125.184v125.185H1.408z\"/><path fill=\"#323330\" d=\"M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z\"/></svg></g>",
	"json": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F4F4F4\" stroke=\"#DDDDDD\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__a\" x1=\"-670.564\" x2=\"-583.105\" y1=\"-280.831\" y2=\"-368.306\" gradientTransform=\"matrix(.9988 0 0 -.9987 689.011 -259.008)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\"/><stop offset=\"1\" stop-color=\"#fff\"/></linearGradient><path fill=\"url(#__DSH_CODE_ICON_INSTANCE__a)\" fill-rule=\"evenodd\" d=\"M63.895 94.303c27.433 37.398 54.281-10.438 54.241-39.205-.046-34.012-34.518-53.021-54.263-53.021C32.182 2.077 2 28.269 2 64.105 2 103.937 36.596 126 63.873 126c-6.172-.889-26.742-5.296-27.019-52.674-.186-32.044 10.453-44.846 26.974-39.214.37.137 18.223 7.18 18.223 30.187 0 22.908-18.156 30.004-18.156 30.004z\" clip-rule=\"evenodd\"/><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__b\" x1=\"-579.148\" x2=\"-666.607\" y1=\"-364.34\" y2=\"-276.873\" gradientTransform=\"matrix(.9988 0 0 -.9987 689.011 -259.008)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\"/><stop offset=\"1\" stop-color=\"#fff\"/></linearGradient><path fill=\"url(#__DSH_CODE_ICON_INSTANCE__b)\" fill-rule=\"evenodd\" d=\"M63.863 34.086C45.736 27.838 23.53 42.778 23.53 72.703 23.53 121.565 59.739 126 64.128 126 95.818 126 126 99.808 126 63.972 126 24.14 91.404 2.077 64.127 2.077c7.555-1.046 40.719 8.176 40.719 53.504 0 29.559-24.764 45.651-40.87 38.776-.37-.137-18.223-7.18-18.223-30.187 0-22.91 18.11-30.085 18.11-30.084z\" clip-rule=\"evenodd\"/></svg>",
	"kotlin": "<defs><linearGradient id=\"__DSH_CODE_ICON_INSTANCE__k\" x1=\"1\" y1=\"19\" x2=\"19\" y2=\"1\"><stop stop-color=\"#0095D5\"/><stop offset=\".5\" stop-color=\"#7F52FF\"/><stop offset=\"1\" stop-color=\"#F88909\"/></linearGradient></defs><rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"url(#__DSH_CODE_ICON_INSTANCE__k)\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#FFFFFF\" d=\"M24 24H0V0h24L12 12Z\"/></g>",
	"lua": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#ECECF7\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#000080\" d=\"M.38 10.377l-.272-.037c-.048.344-.082.695-.101 1.041l.275.016c.018-.34.051-.682.098-1.02zM4.136 3.289l-.184-.205c-.258.232-.509.48-.746.734l.202.188c.231-.248.476-.49.728-.717zM5.769 2.059l-.146-.235c-.296.186-.586.385-.863.594l.166.219c.27-.203.554-.399.843-.578zM1.824 18.369c.185.297.384.586.593.863l.22-.164c-.205-.271-.399-.555-.58-.844l-.233.145zM1.127 16.402l-.255.104c.129.318.274.635.431.943l.005.01.245-.125-.005-.01c-.153-.301-.295-.611-.421-.922zM.298 9.309l.269.063c.076-.332.168-.664.272-.986l-.261-.087c-.108.332-.202.672-.28 1.01zM.274 12.42l-.275.01c.012.348.04.699.083 1.043l.273-.033c-.042-.336-.069-.68-.081-1.02zM.256 14.506c.073.34.162.682.264 1.014l.263-.08c-.1-.326-.187-.658-.258-.99l-.269.056zM11.573.275L11.563 0c-.348.012-.699.039-1.044.082l.034.273c.338-.041.68-.068 1.02-.08zM23.221 8.566c.1.326.186.66.256.992l.27-.059c-.072-.34-.16-.682-.262-1.014l-.264.081zM17.621 1.389c-.309-.164-.627-.314-.947-.449l-.107.252c.314.133.625.281.926.439l.128-.242zM15.693.572c-.332-.105-.67-.199-1.01-.277l-.063.268c.332.076.664.168.988.273l.085-.264zM6.674 1.545c.298-.15.606-.291.916-.418L7.486.873c-.317.127-.632.272-.937.428l-.015.008.125.244.015-.008zM23.727 11.588l.275-.01a11.797 11.797 0 0 0-.082-1.045l-.273.033c.041.338.068.682.08 1.022zM13.654.105c-.346-.047-.696-.08-1.043-.098l-.014.273c.339.018.683.051 1.019.098l.038-.273zM9.544.527l-.058-.27c-.34.072-.681.16-1.014.264l.081.262c.325-.099.659-.185.991-.256zM1.921 5.469l.231.15c.185-.285.384-.566.592-.834l-.217-.17c-.213.276-.417.563-.606.854zM.943 7.318l.253.107c.132-.313.28-.625.439-.924l-.243-.128c-.163.307-.314.625-.449.945zM18.223 21.943l.145.234c.295-.186.586-.385.863-.594l-.164-.219c-.272.204-.557.4-.844.579zM21.248 19.219l.217.17c.215-.273.418-.561.607-.854l-.23-.148c-.186.285-.385.564-.594.832zM19.855 20.715l.184.203c.258-.23.51-.479.746-.732l-.201-.188c-.23.248-.477.488-.729.717zM22.359 17.504l.244.129c.162-.307.314-.625.449-.945l-.254-.107a11.27 11.27 0 0 1-.439.923zM23.617 13.629l.273.039c.049-.346.082-.695.102-1.043l-.275-.014c-.018.338-.051.682-.1 1.018zM23.156 15.621l.264.086c.107-.332.201-.67.279-1.01l-.268-.063c-.077.333-.169.665-.275.987zM22.453 6.672c.154.303.297.617.424.932l.256-.104c-.131-.322-.277-.643-.436-.953l-.244.125zM8.296 23.418c.331.107.67.201 1.009.279l.062-.268c-.331-.076-.663-.168-.986-.273l-.085.262zM10.335 23.889c.345.049.696.082 1.043.102l.014-.275c-.339-.018-.682-.051-1.019-.098l-.038.271zM17.326 22.449c-.303.154-.613.297-.926.424l.104.256c.318-.131.639-.275.947-.434l.004-.002-.123-.246-.006.002zM4.613 21.467c.274.213.562.418.854.605l.149-.23c-.285-.184-.565-.385-.833-.592l-.17.217zM12.417 23.725l.009.275c.348-.014.699-.041 1.045-.084l-.035-.271c-.336.041-.68.068-1.019.08zM6.37 22.604c.307.162.625.314.946.449l.107-.254c-.313-.133-.624-.279-.924-.439l-.129.244zM3.083 20.041c.233.258.48.51.734.746l.188-.201c-.249-.23-.49-.477-.717-.729l-.205.184zM14.445 23.475l.059.27c.34-.074.68-.162 1.014-.266l-.082-.262c-.325.099-.659.185-.991.258zM21.18.129A2.689 2.689 0 1 0 21.18 5.507 2.689 2.689 0 1 0 21.18.129zM15.324 15.447c0 .471.314.66.852.66.67 0 1.297-.396 1.297-1.016v-.645c-.23.107-.379.141-1.107.24-.735.109-1.042.306-1.042.761zM12 2.818c-5.07 0-9.18 4.109-9.18 9.18 0 5.068 4.11 9.18 9.18 9.18 5.07 0 9.18-4.111 9.18-9.18 0-5.07-4.11-9.18-9.18-9.18zm-2.487 13.77H5.771v-6.023h.769v5.346h2.974v.677zm4.13 0h-.619v-.67c-.405.57-.811.793-1.446.793-.843 0-1.38-.463-1.38-1.182v-3.271h.686v3c0 .52.347.85.893.85.719 0 1.181-.578 1.181-1.461v-2.389h.686v4.33zm-.53-8.393c0-1.484 1.205-2.689 2.689-2.689s2.688 1.205 2.688 2.689-1.203 2.688-2.688 2.688-2.689-1.203-2.689-2.688zm5.567 7.856v.52c-.223.059-.33.074-.471.074-.34 0-.637-.238-.711-.57-.381.406-.918.637-1.471.637-.877 0-1.422-.463-1.422-1.248 0-.527.256-.916.76-1.123.266-.107.414-.141 1.389-.264.545-.066.719-.191.719-.48v-.182c0-.412-.348-.645-.967-.645-.645 0-.957.24-1.016.77h-.693c.041-1 .686-1.404 1.734-1.404 1.066 0 1.627.412 1.627 1.182v2.412c0 .215.133.338.373.338.041-.002.074-.002.149-.017z\"/></g>",
	"makefile": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#427819\"/><path fill=\"#fff\" d=\"m5 4.5 2.3 2.3 2.3-2.3L11 5.9 8.7 8.2l2.4 2.4L9.7 12l-2.4-2.4L5 11.9 3.6 10.5l2.3-2.3-2.3-2.3zm7 6.5h4v1.5h-4zm0 2.8h4v1.5h-4z\"/>",
	"node": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#EDF7EA\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#539E43\" d=\"M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z\"/></g>",
	"objective-c": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#438EFF\"/><text x=\"10\" y=\"13.2\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"7.2\" font-weight=\"800\" fill=\"#fff\">OC</text>",
	"perl": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#EAF2F7\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#0073A1\" d=\"M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0m.157 1.103a10.91 10.91 0 0 1 9.214 5.404c-1.962.152-3.156 1.698-5.132 3.553-2.81 2.637-4.562.582-5.288-.898-.447-1.004-.847-2.117-1.544-2.769A.4.4 0 0 1 9.3 6.02l.08-.37a.083.083 0 0 0-.074-.1c-.33-.022-.601.093-.84.368a2.5 2.5 0 0 0-.375-.064c-.863-.093-1.036.345-1.873.345H5.81c-.758 0-1.391.361-1.7.892-.248.424-.257.884.15.93-.126.445.292.62 1.224.192 0 0 .733.421 1.749.421.549 0 .712.087.914.967.486 2.138 2.404 5.655 6.282 5.655l.118.166c.659.934.86 2.113.48 3.184-.307.867-.697 1.531-.697 1.531q.01.178.01.349c0 .81-.175 1.553-.387 2.23a10.91 10.91 0 0 1-11.989-6.342A10.91 10.91 0 0 1 7.608 2.01a10.9 10.9 0 0 1 4.55-.907M7.524 6.47c.288 0 .575.231.477.272a.4.4 0 0 1-.1.02.38.38 0 0 1-.375.327.384.384 0 0 1-.378-.326.4.4 0 0 1-.101-.02c-.098-.042.19-.273.477-.273m10.193 10.49q.05 0 .101.007.326.054.694.096.135.01.269.026a13.4 13.4 0 0 0 2.846-.007 10.9 10.9 0 0 1-2.007 2.705c-.11-.23-.547-1.19-.573-2.196q-.156-.01-.313-.026-.13-.014-.256-.022a18 18 0 0 1-.735-.102h-.003c-.032 0-.06.01-.074.035l-.003.012q-.081.265-.182.544c.428 1.084.652 2.078.652 2.078.14.22.258.432.363.64a11 11 0 0 1-2.168 1.264 11 11 0 0 1-1.205.426 13.3 13.3 0 0 1 1.055-2.531s.678-1.445 1.027-2.564v-.004a.55.55 0 0 1 .512-.38\"/></g>",
	"php": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F0EFF8\" stroke=\"#DDDCEB\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#777BB4\" d=\"M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z\"/></g>",
	"powershell": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#2671BE\"/><path fill=\"#fff\" fill-opacity=\".16\" d=\"M5.5 4h11l-3.5 12H2z\"/><path d=\"m6.5 6.5 3 3-4.2 3.2m4 1h4\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
	"protobuf": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#4285F4\"/><path fill=\"none\" stroke=\"#fff\" stroke-width=\"1.2\" stroke-linejoin=\"round\" d=\"m10 3.5 6 3.3v6.4l-6 3.3-6-3.3V6.8z\"/><path fill=\"#fff\" d=\"M6.5 6.5h4.4c2.3 0 3.6 1.2 3.6 3.1s-1.3 3.1-3.6 3.1H9v2H6.5zM9 8.4v2.4h1.6c.8 0 1.2-.4 1.2-1.2s-.4-1.2-1.2-1.2z\"/>",
	"python": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F2F4F7\" stroke=\"#D5DBE5\" stroke-width=\".5\"/><g transform=\"matrix(.126 0 0 .126 2.30 2.24)\"><path fill=\"#3776AB\" d=\"M 60.510156,6.3979729 C 55.926503,6.4192712 51.549217,6.8101906 47.697656,7.4917229 C 36.35144,9.4962267 34.291407,13.691825 34.291406,21.429223 L 34.291406,31.647973 L 61.103906,31.647973 L 61.103906,35.054223 L 34.291406,35.054223 L 24.228906,35.054223 C 16.436447,35.054223 9.6131468,39.73794 7.4789058,48.647973 C 5.0170858,58.860939 4.9078907,65.233996 7.4789058,75.897973 C 9.3848341,83.835825 13.936449,89.491721 21.728906,89.491723 L 30.947656,89.491723 L 30.947656,77.241723 C 30.947656,68.391821 38.6048,60.585475 47.697656,60.585473 L 74.478906,60.585473 C 81.933857,60.585473 87.885159,54.447309 87.885156,46.960473 L 87.885156,21.429223 C 87.885156,14.162884 81.755176,8.7044455 74.478906,7.4917229 C 69.872919,6.7249976 65.093809,6.3766746 60.510156,6.3979729 z M 46.010156,14.616723 C 48.779703,14.616723 51.041406,16.915369 51.041406,19.741723 C 51.041404,22.558059 48.779703,24.835473 46.010156,24.835473 C 43.23068,24.835472 40.978906,22.558058 40.978906,19.741723 C 40.978905,16.91537 43.23068,14.616723 46.010156,14.616723 z \"/><path fill=\"#FFD43B\" d=\"M 91.228906,35.054223 L 91.228906,46.960473 C 91.228906,56.191228 83.403011,63.960472 74.478906,63.960473 L 47.697656,63.960473 C 40.361823,63.960473 34.291407,70.238956 34.291406,77.585473 L 34.291406,103.11672 C 34.291406,110.38306 40.609994,114.65704 47.697656,116.74172 C 56.184987,119.23733 64.323893,119.68835 74.478906,116.74172 C 81.229061,114.78733 87.885159,110.85411 87.885156,103.11672 L 87.885156,92.897973 L 61.103906,92.897973 L 61.103906,89.491723 L 87.885156,89.491723 L 101.29141,89.491723 C 109.08387,89.491723 111.98766,84.056315 114.69765,75.897973 C 117.49698,67.499087 117.37787,59.422197 114.69765,48.647973 C 112.77187,40.890532 109.09378,35.054223 101.29141,35.054223 L 91.228906,35.054223 z M 76.166406,99.710473 C 78.945884,99.710476 81.197656,101.98789 81.197656,104.80422 C 81.197654,107.63057 78.945881,109.92922 76.166406,109.92922 C 73.396856,109.92922 71.135156,107.63057 71.135156,104.80422 C 71.135158,101.98789 73.396853,99.710473 76.166406,99.710473 z \"/></g>",
	"r": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#EEF2F6\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#276DC3\" d=\"M12 2.746c-6.627 0-12 3.599-12 8.037 0 3.897 4.144 7.144 9.64 7.88V16.26c-2.924-.915-4.925-2.755-4.925-4.877 0-3.035 4.084-5.494 9.12-5.494 5.038 0 8.757 1.683 8.757 5.494 0 1.976-.999 3.379-2.662 4.272.09.066.174.128.258.216.169.149.25.363.372.544 2.128-1.45 3.44-3.437 3.44-5.631 0-4.44-5.373-8.038-12-8.038zm-2.111 4.99v13.516l4.093-.002-.002-5.291h1.1c.225 0 .321.066.549.25.272.22.715.982.715.982l2.164 4.063 4.627-.002-2.864-4.826s-.086-.193-.265-.383a2.22 2.22 0 00-.582-.416c-.422-.214-1.149-.434-1.149-.434s3.578-.264 3.578-3.826c0-3.562-3.744-3.63-3.744-3.63zm4.127 2.93l2.478.002s1.149-.062 1.149 1.127c0 1.165-1.149 1.17-1.149 1.17h-2.478zm1.754 6.119c-.494.049-1.012.079-1.54.088v1.807a16.622 16.622 0 002.37-.473l-.471-.891s-.108-.183-.248-.394c-.039-.054-.08-.098-.111-.137z\"/></g>",
	"react": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#20232A\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#61DAFB\" d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\"/></g>",
	"ruby": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FCEDEC\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#CC342D\" d=\"M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z\"/></g>",
	"rust": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F3E6DD\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#2B2B2B\" d=\"M23.8346 11.7033l-1.0073-.6236a13.7268 13.7268 0 00-.0283-.2936l.8656-.8069a.3483.3483 0 00-.1154-.578l-1.1066-.414a8.4958 8.4958 0 00-.087-.2856l.6904-.9587a.3462.3462 0 00-.2257-.5446l-1.1663-.1894a9.3574 9.3574 0 00-.1407-.2622l.49-1.0761a.3437.3437 0 00-.0274-.3361.3486.3486 0 00-.3006-.154l-1.1845.0416a6.7444 6.7444 0 00-.1873-.2268l.2723-1.153a.3472.3472 0 00-.417-.4172l-1.1532.2724a14.0183 14.0183 0 00-.2278-.1873l.0415-1.1845a.3442.3442 0 00-.49-.328l-1.076.491c-.0872-.0476-.1742-.0952-.2623-.1407l-.1903-1.1673A.3483.3483 0 0016.256.955l-.9597.6905a8.4867 8.4867 0 00-.2855-.086l-.414-1.1066a.3483.3483 0 00-.5781-.1154l-.8069.8666a9.2936 9.2936 0 00-.2936-.0284L12.2946.1683a.3462.3462 0 00-.5892 0l-.6236 1.0073a13.7383 13.7383 0 00-.2936.0284L9.9803.3374a.3462.3462 0 00-.578.1154l-.4141 1.1065c-.0962.0274-.1903.0567-.2855.086L7.744.955a.3483.3483 0 00-.5447.2258L7.009 2.348a9.3574 9.3574 0 00-.2622.1407l-1.0762-.491a.3462.3462 0 00-.49.328l.0416 1.1845a7.9826 7.9826 0 00-.2278.1873L3.8413 3.425a.3472.3472 0 00-.4171.4171l.2713 1.1531c-.0628.075-.1255.1509-.1863.2268l-1.1845-.0415a.3462.3462 0 00-.328.49l.491 1.0761a9.167 9.167 0 00-.1407.2622l-1.1662.1894a.3483.3483 0 00-.2258.5446l.6904.9587a13.303 13.303 0 00-.087.2855l-1.1065.414a.3483.3483 0 00-.1155.5781l.8656.807a9.2936 9.2936 0 00-.0283.2935l-1.0073.6236a.3442.3442 0 000 .5892l1.0073.6236c.008.0982.0182.1964.0283.2936l-.8656.8079a.3462.3462 0 00.1155.578l1.1065.4141c.0273.0962.0567.1914.087.2855l-.6904.9587a.3452.3452 0 00.2268.5447l1.1662.1893c.0456.088.0922.1751.1408.2622l-.491 1.0762a.3462.3462 0 00.328.49l1.1834-.0415c.0618.0769.1235.1528.1873.2277l-.2713 1.1541a.3462.3462 0 00.4171.4161l1.153-.2713c.075.0638.151.1255.2279.1863l-.0415 1.1845a.3442.3442 0 00.49.327l1.0761-.49c.087.0486.1741.0951.2622.1407l.1903 1.1662a.3483.3483 0 00.5447.2268l.9587-.6904a9.299 9.299 0 00.2855.087l.414 1.1066a.3452.3452 0 00.5781.1154l.8079-.8656c.0972.0111.1954.0203.2936.0294l.6236 1.0073a.3472.3472 0 00.5892 0l.6236-1.0073c.0982-.0091.1964-.0183.2936-.0294l.8069.8656a.3483.3483 0 00.578-.1154l.4141-1.1066a8.4626 8.4626 0 00.2855-.087l.9587.6904a.3452.3452 0 00.5447-.2268l.1903-1.1662c.088-.0456.1751-.0931.2622-.1407l1.0762.49a.3472.3472 0 00.49-.327l-.0415-1.1845a6.7267 6.7267 0 00.2267-.1863l1.1531.2713a.3472.3472 0 00.4171-.416l-.2713-1.1542c.0628-.0749.1255-.1508.1863-.2278l1.1845.0415a.3442.3442 0 00.328-.49l-.49-1.076c.0475-.0872.0951-.1742.1407-.2623l1.1662-.1893a.3483.3483 0 00.2258-.5447l-.6904-.9587.087-.2855 1.1066-.414a.3462.3462 0 00.1154-.5781l-.8656-.8079c.0101-.0972.0202-.1954.0283-.2936l1.0073-.6236a.3442.3442 0 000-.5892zm-6.7413 8.3551a.7138.7138 0 01.2986-1.396.714.714 0 11-.2997 1.396zm-.3422-2.3142a.649.649 0 00-.7715.5l-.3573 1.6685c-1.1035.501-2.3285.7795-3.6193.7795a8.7368 8.7368 0 01-3.6951-.814l-.3574-1.6684a.648.648 0 00-.7714-.499l-1.473.3158a8.7216 8.7216 0 01-.7613-.898h7.1676c.081 0 .1356-.0141.1356-.088v-2.536c0-.074-.0536-.0881-.1356-.0881h-2.0966v-1.6077h2.2677c.2065 0 1.1065.0587 1.394 1.2088.0901.3533.2875 1.5044.4232 1.8729.1346.413.6833 1.2381 1.2685 1.2381h3.5716a.7492.7492 0 00.1296-.0131 8.7874 8.7874 0 01-.8119.9526zM6.8369 20.024a.714.714 0 11-.2997-1.396.714.714 0 01.2997 1.396zM4.1177 8.9972a.7137.7137 0 11-1.304.5791.7137.7137 0 011.304-.579zm-.8352 1.9813l1.5347-.6824a.65.65 0 00.33-.8585l-.3158-.7147h1.2432v5.6025H3.5669a8.7753 8.7753 0 01-.2834-3.348zm6.7343-.5437V8.7836h2.9601c.153 0 1.0792.1772 1.0792.8697 0 .575-.7107.7815-1.2948.7815zm10.7574 1.4862c0 .2187-.008.4363-.0243.651h-.9c-.09 0-.1265.0586-.1265.1477v.413c0 .973-.5487 1.1846-1.0296 1.2382-.4576.0517-.9648-.1913-1.0275-.4717-.2704-1.5186-.7198-1.8436-1.4305-2.4034.8817-.5599 1.799-1.386 1.799-2.4915 0-1.1936-.819-1.9458-1.3769-2.3153-.7825-.5163-1.6491-.6195-1.883-.6195H5.4682a8.7651 8.7651 0 014.907-2.7699l1.0974 1.151a.648.648 0 00.9182.0213l1.227-1.1743a8.7753 8.7753 0 016.0044 4.2762l-.8403 1.8982a.652.652 0 00.33.8585l1.6178.7188c.0283.2875.0425.577.0425.8717zm-9.3006-9.5993a.7128.7128 0 11.984 1.0316.7137.7137 0 01-.984-1.0316zm8.3389 6.71a.7107.7107 0 01.9395-.3625.7137.7137 0 11-.9405.3635z\"/></g>",
	"scala": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FCECEB\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#DC322F\" d=\"M4.589 24c4.537 0 13.81-1.516 14.821-3v-5.729c-.957 1.408-10.284 2.912-14.821 2.912V24zM4.589 16.365c4.537 0 13.81-1.516 14.821-3V7.636c-.957 1.408-10.284 2.912-14.821 2.912v5.817zM4.589 8.729c4.537 0 13.81-1.516 14.821-3V0C18.453 1.408 9.126 2.912 4.589 2.912v5.817z\"/></g>",
	"shell": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#303642\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#7EE787\" d=\"M21.038,4.9l-7.577-4.498C13.009,0.134,12.505,0,12,0c-0.505,0-1.009,0.134-1.462,0.403L2.961,4.9 C2.057,5.437,1.5,6.429,1.5,7.503v8.995c0,1.073,0.557,2.066,1.462,2.603l7.577,4.497C10.991,23.866,11.495,24,12,24 c0.505,0,1.009-0.134,1.461-0.402l7.577-4.497c0.904-0.537,1.462-1.529,1.462-2.603V7.503C22.5,6.429,21.943,5.437,21.038,4.9z M15.17,18.946l0.013,0.646c0.001,0.078-0.05,0.167-0.111,0.198l-0.383,0.22c-0.061,0.031-0.111-0.007-0.112-0.085L14.57,19.29 c-0.328,0.136-0.66,0.169-0.872,0.084c-0.04-0.016-0.057-0.075-0.041-0.142l0.139-0.584c0.011-0.046,0.036-0.092,0.069-0.121 c0.012-0.011,0.024-0.02,0.036-0.026c0.022-0.011,0.043-0.014,0.062-0.006c0.229,0.077,0.521,0.041,0.802-0.101 c0.357-0.181,0.596-0.545,0.592-0.907c-0.003-0.328-0.181-0.465-0.613-0.468c-0.55,0.001-1.064-0.107-1.072-0.917 c-0.007-0.667,0.34-1.361,0.889-1.8l-0.007-0.652c-0.001-0.08,0.048-0.168,0.111-0.2l0.37-0.236 c0.061-0.031,0.111,0.007,0.112,0.087l0.006,0.653c0.273-0.109,0.511-0.138,0.726-0.088c0.047,0.012,0.067,0.076,0.048,0.151 l-0.144,0.578c-0.011,0.044-0.036,0.088-0.065,0.116c-0.012,0.012-0.025,0.021-0.038,0.028c-0.019,0.01-0.038,0.013-0.057,0.009 c-0.098-0.022-0.332-0.073-0.699,0.113c-0.385,0.195-0.52,0.53-0.517,0.778c0.003,0.297,0.155,0.387,0.681,0.396 c0.7,0.012,1.003,0.318,1.01,1.023C16.105,17.747,15.736,18.491,15.17,18.946z M19.143,17.859c0,0.06-0.008,0.116-0.058,0.145 l-1.916,1.164c-0.05,0.029-0.09,0.004-0.09-0.056v-0.494c0-0.06,0.037-0.093,0.087-0.122l1.887-1.129 c0.05-0.029,0.09-0.004,0.09,0.056V17.859z M20.459,6.797l-7.168,4.427c-0.894,0.523-1.553,1.109-1.553,2.187v8.833 c0,0.645,0.26,1.063,0.66,1.184c-0.131,0.023-0.264,0.039-0.398,0.039c-0.42,0-0.833-0.114-1.197-0.33L3.226,18.64 c-0.741-0.44-1.201-1.261-1.201-2.142V7.503c0-0.881,0.46-1.702,1.201-2.142l7.577-4.498c0.363-0.216,0.777-0.33,1.197-0.33 c0.419,0,0.833,0.114,1.197,0.33l7.577,4.498c0.624,0.371,1.046,1.013,1.164,1.732C21.686,6.557,21.12,6.411,20.459,6.797z\"/></g>",
	"solidity": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F0F0F0\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#363636\" d=\"M4.409 6.608L7.981.255l3.572 6.353H4.409zM8.411 0l3.569 6.348L15.552 0H8.411zm4.036 17.392l3.572 6.354 3.575-6.354h-7.147zm-.608-10.284h-7.43l3.715 6.605 3.715-6.605zm.428-.25h7.428L15.982.255l-3.715 6.603zM15.589 24l-3.569-6.349L8.448 24h7.141zm-3.856-6.858H4.306l3.712 6.603 3.715-6.603zm.428-.25h7.433l-3.718-6.605-3.715 6.605z\"/></g>",
	"sql": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#336791\"/><ellipse cx=\"10\" cy=\"5.5\" rx=\"5.8\" ry=\"2.1\" fill=\"#fff\"/><path fill=\"#fff\" fill-opacity=\".88\" d=\"M4.2 5.5v8.9c0 1.2 2.6 2.1 5.8 2.1s5.8-.9 5.8-2.1V5.5c0 1.2-2.6 2.1-5.8 2.1s-5.8-.9-5.8-2.1z\"/><path d=\"M4.2 9.2c0 1.2 2.6 2.1 5.8 2.1s5.8-.9 5.8-2.1M4.2 12.9c0 1.2 2.6 2.1 5.8 2.1s5.8-.9 5.8-2.1\" fill=\"none\" stroke=\"#336791\" stroke-opacity=\".7\" stroke-width=\".7\"/>",
	"svelte": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FFF0EB\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#FF3E00\" d=\"M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z\"/></g>",
	"swift": "<defs><clipPath id=\"__DSH_CODE_ICON_INSTANCE__a\"><rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\"/></clipPath></defs><g clip-path=\"url(#__DSH_CODE_ICON_INSTANCE__a)\"><svg x=\"1\" y=\"1\" width=\"18\" height=\"18\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#f05138\" d=\"M126.33 34.06a39.32 39.32 0 00-.79-7.83 28.78 28.78 0 00-2.65-7.58 28.84 28.84 0 00-4.76-6.32 23.42 23.42 0 00-6.62-4.55 27.27 27.27 0 00-7.68-2.53c-2.65-.51-5.56-.51-8.21-.76H30.25a45.46 45.46 0 00-6.09.51 21.82 21.82 0 00-5.82 1.52c-.53.25-1.32.51-1.85.76a33.82 33.82 0 00-5 3.28c-.53.51-1.06.76-1.59 1.26a22.41 22.41 0 00-4.76 6.32 23.61 23.61 0 00-2.65 7.58 78.5 78.5 0 00-.79 7.83v60.39a39.32 39.32 0 00.79 7.83 28.78 28.78 0 002.65 7.58 28.84 28.84 0 004.76 6.32 23.42 23.42 0 006.62 4.55 27.27 27.27 0 007.68 2.53c2.65.51 5.56.51 8.21.76h63.22a45.08 45.08 0 008.21-.76 27.27 27.27 0 007.68-2.53 30.13 30.13 0 006.62-4.55 22.41 22.41 0 004.76-6.32 23.61 23.61 0 002.65-7.58 78.49 78.49 0 00.79-7.83V34.06z\"/><path fill=\"#fefefe\" d=\"M85 96.5c-11.11 6.13-26.38 6.76-41.75.47A64.53 64.53 0 0113.84 73a50 50 0 0010.85 6.32c15.87 7.1 31.73 6.61 42.9 0-15.9-11.66-29.4-26.82-39.46-39.2a43.47 43.47 0 01-5.29-6.82c12.16 10.61 31.5 24 38.38 27.79a271.77 271.77 0 01-27-32.34 266.8 266.8 0 0044.47 34.87c.71.38 1.26.7 1.7 1a32.7 32.7 0 001.21-3.51c3.71-12.89-.53-27.54-9.79-39.67C93.25 33.81 106 57.05 100.66 76.51c-.14.53-.29 1-.45 1.55l.19.22c10.59 12.63 7.68 26 6.35 23.5C101 91 90.37 94.33 85 96.5z\"/></svg></g>",
	"toml": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#F6EEEA\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#9C4121\" d=\"M.014 0h5.34v2.652H2.888v18.681h2.468V24H.015V0Zm17.622 5.049v2.78h-4.274v12.935h-3.008V7.83H6.059V5.05h11.577ZM23.986 24h-5.34v-2.652h2.467V2.667h-2.468V0h5.34v24Z\"/></g>",
	"typescript": "<defs><clipPath id=\"__DSH_CODE_ICON_INSTANCE__a\"><rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\"/></clipPath></defs><g clip-path=\"url(#__DSH_CODE_ICON_INSTANCE__a)\"><svg x=\"1\" y=\"1\" width=\"18\" height=\"18\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#fff\" d=\"M22.67 47h99.67v73.67H22.67z\"/><path data-name=\"original\" fill=\"#007acc\" d=\"M1.5 63.91v62.5h125v-125H1.5zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19 49.19 0 01.12-5.17C29.08 59 39 59 51 59h21.83z\"/></svg></g>",
	"vue": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#ECF8F3\" stroke=\"#D5EAE0\" stroke-width=\".5\"/><path fill=\"#41B883\" d=\"M3.5 5h3.2l3.3 5.7L13.3 5h3.2L10 16z\"/><path fill=\"#35495E\" d=\"M6.7 5H9l1 1.8L11 5h2.3L10 10.7z\"/>",
	"wasm": "<defs><clipPath id=\"__DSH_CODE_ICON_INSTANCE__a\"><rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\"/></clipPath></defs><g clip-path=\"url(#__DSH_CODE_ICON_INSTANCE__a)\"><svg x=\"1\" y=\"1\" width=\"18\" height=\"18\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#654ff0\" d=\"M.223.222v127.555h127.555V.222H78.594c.014.227.036.455.036.686 0 8.08-6.55 14.626-14.63 14.626-8.078 0-14.625-6.546-14.625-14.626 0-.231.022-.459.031-.686zm29.595 68.746h8.445l5.782 30.738h.107l6.968-30.738h7.908l6.265 31.119h.106l6.597-31.119h8.284l-10.765 45.156H61.12l-6.213-30.738H54.8l-6.7 30.738h-8.557zm59.994 0h13.334l13.284 45.156h-8.77l-2.879-10.051H89.59l-2.212 10.05h-8.5ZM94.895 80.1l-3.684 16.57h11.473L98.448 80.1Z\"/></svg></g>",
	"xml": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#EAF3FA\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#005FAD\" d=\"M4.345 7.053c-.495.02-.44.725-.536 1.081-.157.583-.3 1.325-.347 1.926-.046.585-.008 1.127.066 1.719.058.46.191.767.07.89-.108.11-3.216 2.962-3.466 3.123-.26.169-.08.584.069.817.157.246.23.373.557.33.306-.042.405-.409.583-.606.228-.252 2.421-2.401 2.616-2.401.077.544.367 1.064.67 1.513.15.222.314.439.505.629.175.175.4.317.587.45.44.024.795-.301.35-.67-.17-.14-.735-.971-.927-1.43-.18-.43-.574-1.076-.146-1.428 1.494-1.23 3.72-2.262 4.247-2.313-.257 1.024-1.356 3.048-1.757 4.012-.14.333-.231.732-.185 1.094.055.434.383.774.587.806.417-.023.7-.387.946-.645.343-.357.634-.685.974-1.043.339-.356.672-.731.971-1.07.184-.207.674-.713.963-.713-.11.693-.716 1.552-.839 2.254-.125.716.531 1.596 1.217.956.623-.58 1.255-1.129 1.867-1.72.217-.208.175.037.224.242.05.208.176.91.275 1.1.18.346.496.592.897.598.362.006.727-.161.982-.414.19-.187.513-.699.154-.832-.23-.086-.217-.176-.495-.129-.172.029-.362.074-.507.179-.367-.003-.381-.89-.324-1.161.068-.327.207-.659.185-.998-.026-.418-.478-.69-.582-.72-.156-.076-.253.023-.458.212-.173.161-.363.332-.535.495-.34.322-.768.813-.942.813.305-.705.708-2.652-.643-2.48-.563.071-.95.377-1.394.71-.29.28-.683.641-.936.87-.236.216-.371.404-.496.404.132-.747 1.685-3.167.885-3.853-.158-.136-.313-.325-.515-.349a4.637 4.637 0 0 0-.833.19c-.565.18-2.78 1.28-4.19 2.289-.131.094-.214-.085-.231-.29-.087-1.058.199-2.19.496-3.188.208-.696-.557-1.225-.659-1.249zm18.177.874c-.166.364-.2.894-.248 1.319a24.307 24.307 0 0 0-1.246-.115c.238.296.691.588 1.056.724-.048.366-.434.67-.599 1.021.458-.127.676-.47.989-.821.362.22.791.627 1.26.636-.177-.376-.334-.695-.658-.966.269-.175.717-.362.924-.633-.345-.074-.718-.093-1.052-.015-.258-.284-.3-.772-.426-1.15zm-2.92.079c-.23.02-.613.49-.832.773-.807 1.039-1.542 3.15-1.661 3.542-.363 1.195-.502 2.672.28 3.722.456.612 1.258.66 2.041.434.405-.116.812-.406.95-.723.114-.263.174-.753-.404-.38-.224.145-.634.304-1.37.291-.247-.004-.651-.357-.76-.722-.192-.595-.11-1.393-.11-1.393.167-1.028.642-2.146 1.061-3.076.163-.36.658-1.259.842-1.546 0 0 .239-.373.131-.77-.031-.116-.091-.16-.168-.152zm3.072 2.976c-.12.264-.144.648-.18.956-.274-.031-.63-.066-.904-.083.172.215.501.426.766.525-.034.265-.314.486-.434.741.332-.092.49-.34.717-.596.263.16.575.456.914.462-.127-.273-.242-.504-.477-.701.195-.127.52-.262.67-.46a1.77 1.77 0 0 0-.763-.01c-.187-.206-.217-.56-.309-.834zm-1.123 2.422c-.083.183-.1.449-.125.662a12.6 12.6 0 0 0-.624-.058c.119.148.346.295.53.363-.025.184-.219.336-.301.513.23-.064.339-.236.496-.413.181.11.397.316.632.32-.088-.19-.168-.349-.33-.485.135-.087.36-.181.463-.317a1.22 1.22 0 0 0-.527-.008c-.13-.142-.151-.387-.214-.576z\"/></g>",
	"yaml": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FCEEEF\" stroke=\"#F0D8DB\" stroke-width=\".5\"/><svg x=\"2.75\" y=\"2.75\" width=\"14.5\" height=\"14.5\" viewBox=\"0 0 128 128\" preserveAspectRatio=\"xMidYMid meet\">\n<polygon transform=\"matrix(.24805 0 0 .24805 .5 5.6287)\" points=\"87.702 137.67 0 0 63.25 0 119.02 88.646 175.24 0 235.79 0 143.98 137.67 143.98 224.95 87.702 224.95\"/>\n<path d=\"m82.428 49.149h-25.266l-5.1388 12.408h-11.188l23.659-55.798h11.444l22.699 55.798h-11.956l-4.2525-12.408zm-4.197-11.14-7.7455-20.476-8.6412 20.476z\" fill=\"#cb171e\"/>\n<polygon transform=\"matrix(.24805 0 0 .24805 .5 5.6287)\" points=\"87.701 250.18 87.701 470.65 135 470.65 135 318.57 184.51 420.79 221.74 420.79 272.94 314.98 272.94 470.6 318.32 470.6 318.32 250.18 256.36 250.18 201.38 349.88 149.02 250.18\"/>\n<polygon transform=\"matrix(.24805 0 0 .24805 .5 5.6287)\" points=\"512 422.74 512 422.74 395.64 422.74 395.64 250.12 347.44 250.12 347.44 469.65 512 469.65\"/>\n</svg>",
	"zig": "<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"4\" fill=\"#FFF4DF\" stroke=\"#DDE2E8\" stroke-width=\".5\"/><g transform=\"translate(3 3) scale(.5833333333)\"><path fill=\"#E18A00\" d=\"m23.53 1.02-7.686 3.45h-7.06l-2.98 3.452h7.173L.47 22.98l7.681-3.607h7.065v-.002l2.978-3.45-7.148-.001 12.482-14.9zM0 4.47v14.901h1.883l2.98-3.45H3.451v-8h.942l2.824-3.45H0zm22.117 0-2.98 3.608h1.412v7.844h-.942l-2.98 3.45H24V4.47h-1.883z\"/></g>"
});
//#endregion
//#region lib/types/CodeFileIcon.js
/**
* Render one full-color square code-file glyph from the embedded icon set.
* @param props - Detailed code type, optional size, and optional CSS class.
* @returns The selected decorative SVG with its identifying palette intact.
*/
function CodeFileIcon({ type, size = 20, className }) {
	const instanceId = `dsh-code-icon-${useId().replaceAll(":", "")}`;
	return jsx("svg", {
		width: size,
		height: size,
		className,
		viewBox: "0 0 20 20",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		dangerouslySetInnerHTML: { __html: CODE_FILE_ARTWORK[type].replaceAll(CODE_FILE_ICON_ID_TOKEN, instanceId) }
	});
}
const CODE_FILE_TYPE_SET = new Set([
	"angular",
	"c",
	"clojure",
	"cmake",
	"cpp",
	"csharp",
	"css",
	"dart",
	"docker",
	"elixir",
	"env",
	"erlang",
	"flutter",
	"git",
	"go",
	"graphql",
	"haskell",
	"ini",
	"java",
	"javascript",
	"json",
	"kotlin",
	"lua",
	"makefile",
	"node",
	"objective-c",
	"perl",
	"php",
	"powershell",
	"protobuf",
	"python",
	"r",
	"react",
	"ruby",
	"rust",
	"scala",
	"shell",
	"solidity",
	"sql",
	"svelte",
	"swift",
	"toml",
	"typescript",
	"vue",
	"wasm",
	"xml",
	"yaml",
	"zig"
]);
const FILE_NAME_TYPES = {
	".bash_profile": "shell",
	".bashrc": "shell",
	".env": "env",
	".gitattributes": "git",
	".gitconfig": "git",
	".gitignore": "git",
	".gitmodules": "git",
	".mailmap": "git",
	".profile": "shell",
	".zprofile": "shell",
	".zshrc": "shell",
	"bsdmakefile": "makefile",
	"cmakelists.txt": "cmake",
	"commit_editmsg": "git",
	"compose.yaml": "docker",
	"compose.yml": "docker",
	"docker-compose.yaml": "docker",
	"docker-compose.yml": "docker",
	"dockerfile": "docker",
	"gemfile": "ruby",
	"gnumakefile": "makefile",
	"guardfile": "ruby",
	"makefile": "makefile",
	"npm-shrinkwrap.json": "node",
	"package-lock.json": "node",
	"package.json": "node",
	"podfile": "ruby",
	"rakefile": "ruby"
};
const FILE_NAME_PREFIX_TYPES = [["dockerfile.", "docker"], [".env.", "env"]];
const FILE_NAME_SUFFIX_TYPES = [
	[".component.ts", "angular"],
	[".component.html", "angular"],
	[".directive.ts", "angular"],
	[".service.ts", "angular"],
	[".module.ts", "angular"],
	[".pipe.ts", "angular"],
	[".guard.ts", "angular"],
	[".interceptor.ts", "angular"],
	[".dockerfile", "docker"]
];
const EXTENSION_TYPES$1 = {
	"bash": "shell",
	"c": "c",
	"c++": "cpp",
	"cc": "cpp",
	"cfg": "ini",
	"cjs": "javascript",
	"clj": "clojure",
	"cljc": "clojure",
	"cljs": "clojure",
	"cmake": "cmake",
	"cpp": "cpp",
	"cs": "csharp",
	"csh": "shell",
	"css": "css",
	"csx": "csharp",
	"cts": "typescript",
	"cxx": "cpp",
	"dart": "dart",
	"dtd": "xml",
	"edn": "clojure",
	"env": "env",
	"erl": "erlang",
	"es6": "javascript",
	"escript": "erlang",
	"ex": "elixir",
	"exs": "elixir",
	"fish": "shell",
	"gemspec": "ruby",
	"go": "go",
	"gql": "graphql",
	"graphql": "graphql",
	"h": "c",
	"h++": "cpp",
	"hh": "cpp",
	"hpp": "cpp",
	"hrl": "erlang",
	"hs": "haskell",
	"hxx": "cpp",
	"ini": "ini",
	"ipp": "cpp",
	"java": "java",
	"js": "javascript",
	"json": "json",
	"json5": "json",
	"jsonc": "json",
	"jsx": "react",
	"ksh": "shell",
	"kt": "kotlin",
	"kts": "kotlin",
	"lhs": "haskell",
	"lua": "lua",
	"m": "objective-c",
	"mak": "makefile",
	"mjs": "javascript",
	"mk": "makefile",
	"mm": "objective-c",
	"mts": "typescript",
	"node": "node",
	"pch": "objective-c",
	"php": "php",
	"php3": "php",
	"php4": "php",
	"php5": "php",
	"phps": "php",
	"phtml": "php",
	"pl": "perl",
	"plist": "xml",
	"pm": "perl",
	"pod": "perl",
	"proto": "protobuf",
	"ps1": "powershell",
	"psd1": "powershell",
	"psm1": "powershell",
	"py": "python",
	"pyi": "python",
	"pyw": "python",
	"pyx": "python",
	"r": "r",
	"rake": "ruby",
	"rb": "ruby",
	"rmd": "r",
	"rs": "rust",
	"sc": "scala",
	"scala": "scala",
	"sh": "shell",
	"sol": "solidity",
	"sql": "sql",
	"svelte": "svelte",
	"swift": "swift",
	"t": "perl",
	"tcsh": "shell",
	"toml": "toml",
	"tpp": "cpp",
	"ts": "typescript",
	"tsx": "react",
	"vue": "vue",
	"wasm": "wasm",
	"wast": "wasm",
	"wat": "wasm",
	"xml": "xml",
	"xsd": "xml",
	"xsl": "xml",
	"xslt": "xml",
	"yaml": "yaml",
	"yml": "yaml",
	"zig": "zig",
	"zsh": "shell"
};
const LINK_CODE_EXTENSIONS = new Set([
	"ts",
	"tsx",
	"js",
	"jsx",
	"mjs",
	"cjs",
	"cts",
	"mts",
	"css",
	"scss",
	"sass",
	"less",
	"html",
	"htm",
	"vue",
	"svelte",
	"astro",
	"json",
	"jsonc",
	"json5",
	"yaml",
	"yml",
	"toml",
	"xml",
	"ini",
	"env",
	"sh",
	"bash",
	"zsh",
	"fish",
	"ps1",
	"bat",
	"cmd",
	"py",
	"pyi",
	"rb",
	"rs",
	"go",
	"java",
	"kt",
	"kts",
	"c",
	"cc",
	"cpp",
	"cxx",
	"h",
	"hh",
	"hpp",
	"cs",
	"php",
	"swift",
	"sql",
	"csv",
	"tsv",
	"proto",
	"graphql",
	"gql",
	"lua",
	"r",
	"pl",
	"scala",
	"clj",
	"cljs",
	"ex",
	"exs",
	"erl",
	"hs",
	"dart"
]);
function basename$1(path) {
	return path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
}
/**
* Test whether a resolved file type uses the full-color code-icon set.
* @param type - Resolved file-type string.
* @returns Whether the value is a detailed code-file type.
*/
function isCodeFileType(type) {
	return CODE_FILE_TYPE_SET.has(type);
}
/**
* Test whether an extension belonged to the established coarse LinkIcon code category.
* @param extension - Extension without a leading dot.
* @returns Whether clickable links keep the code glyph for this extension.
*/
function isLinkCodeExtension(extension) {
	return LINK_CODE_EXTENSIONS.has(extension.toLowerCase());
}
/**
* Resolve the most specific code/configuration icon according to the supplied map priority.
* @param name - Lowercase basename.
* @param extension - Lowercase extension without the leading dot.
* @param context - Optional project-file snapshot for context-sensitive matches.
* @returns The detailed code type, or null when the traditional file classifier owns the path.
*/
function classifyCodeFileType(name, extension, context) {
	const exact = FILE_NAME_TYPES[name];
	if (exact !== void 0) return exact;
	for (const [prefix, type] of FILE_NAME_PREFIX_TYPES) if (name.startsWith(prefix)) return type;
	for (const [suffix, type] of FILE_NAME_SUFFIX_TYPES) if (name.endsWith(suffix)) return type;
	if (extension === "dart" && context !== void 0) {
		if ((Object.entries(context.files).find(([path]) => basename$1(path).toLowerCase() === "pubspec.yaml")?.[1])?.includes("flutter:") === true) return "flutter";
	}
	return EXTENSION_TYPES$1[extension] ?? null;
}
//#endregion
//#region lib/types/FileTypeIcon.js
const EXTENSION_TYPES = {
	scss: "code",
	sass: "code",
	less: "code",
	vue: "code",
	svelte: "code",
	astro: "code",
	bat: "code",
	cmd: "code",
	csv: "code",
	tsv: "code",
	html: "html",
	htm: "html",
	png: "image",
	jpg: "image",
	jpeg: "image",
	gif: "image",
	svg: "image",
	webp: "image",
	avif: "image",
	bmp: "image",
	ico: "image",
	tif: "image",
	tiff: "image",
	heic: "image",
	heif: "image",
	md: "markdown",
	mdx: "markdown",
	markdown: "markdown",
	pdf: "pdf",
	ppt: "ppt",
	pptx: "ppt",
	key: "ppt",
	mp4: "video",
	mov: "video",
	m4v: "video",
	webm: "video",
	mkv: "video",
	avi: "video",
	mpg: "video",
	mpeg: "video",
	doc: "word",
	docx: "word",
	rtf: "word",
	odt: "word",
	pages: "word",
	xls: "excel",
	xlsx: "excel",
	xlsm: "excel",
	numbers: "excel"
};
const NAME_TYPES = {
	changelog: "markdown",
	contributing: "markdown",
	readme: "markdown"
};
function basename(path) {
	return path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
}
/**
* Extract the final suffix from a file path without changing its case.
* A leading dot starts a suffix, while a missing or trailing dot returns an empty string.
* @param path - File path or basename using either path separator.
* @returns The characters after the basename's final dot.
*/
function fileExtension(path) {
	const name = basename(path);
	const dot = name.lastIndexOf(".");
	return dot < 0 ? "" : name.slice(dot + 1);
}
/**
* Classify a file path or name for file-card presentation.
* Matching is case-insensitive and applies code filename rules before extension rules;
* unknown names fall back to `other`.
* @param path - File path or basename using either path separator.
* @param context - Optional project files used by context-sensitive code mappings.
* @returns The file's closed presentation category.
*/
function classifyFileType(path, context) {
	const name = basename(path).toLowerCase();
	const extension = fileExtension(name).toLowerCase();
	return classifyCodeFileType(name, extension, context) ?? NAME_TYPES[name] ?? EXTENSION_TYPES[extension] ?? "other";
}
const FILE_BODY = "M8.48924 28H19.5108C21.6479 28 22.7165 28 23.5594 27.6509C24.6833 27.1853 25.5762 26.2924 26.0417 25.1685C26.3909 24.3256 26.3909 23.257 26.3909 21.1199V8.79443C26.3909 8.32877 26.3909 8.09593 26.3471 7.87507C26.2887 7.58058 26.173 7.30042 26.0067 7.05048C25.882 6.86303 25.7177 6.69799 25.3893 6.36792L20.0611 1.01354C19.7304 0.681235 19.5651 0.515081 19.3769 0.38885C19.126 0.220541 18.8443 0.103463 18.5481 0.0443412C18.3259 0 18.0915 0 17.6226 0H8.48924C6.35209 0 5.28351 0 4.4406 0.349145C3.31672 0.814671 2.4238 1.70759 1.95828 2.83147C1.60913 3.67438 1.60913 4.74296 1.60913 6.88011V21.1199C1.60913 23.257 1.60913 24.3256 1.95828 25.1685C2.4238 26.2924 3.31672 27.1853 4.4406 27.6509C5.28351 28 6.35209 28 8.48924 28Z";
const FILE_FOLD = "M26.3909 7.37445L19.0525 0V3.77445C19.0525 4.89271 19.0525 5.45184 19.2352 5.89289C19.4788 6.48096 19.946 6.94818 20.5341 7.19176C20.9751 7.37445 21.5342 7.37445 22.6525 7.37445H26.3909Z";
const FILE_MARK_TRANSFORM = "translate(14 16) scale(1.12) translate(-14 -16)";
const LARGE_FILE_MARK_TRANSFORM = "translate(14 16) scale(1.22) translate(-14 -16)";
const FOLDER_MARK_TRANSFORM = "translate(14 13.0693) scale(1.12) translate(-14 -13.0693)";
function FileGlyph({ size, className, children, markTransform = FILE_MARK_TRANSFORM, muted = false }) {
	return jsxs("svg", {
		width: size,
		height: size,
		className,
		viewBox: "0 0 28 28",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		children: [
			jsx("path", {
				d: FILE_BODY,
				fill: "currentColor"
			}),
			muted ? jsx("path", {
				d: FILE_FOLD,
				fill: "var(--dsw-static-neutral-400)"
			}) : jsx("path", {
				d: FILE_FOLD,
				fill: "var(--dsw-static-neutral-00)",
				fillOpacity: ".7"
			}),
			children !== void 0 && jsx("g", {
				color: "var(--dsw-static-neutral-00)",
				"data-file-type-mark": true,
				transform: markTransform,
				children
			})
		]
	});
}
function FolderGlyph$1({ size, className }) {
	return jsxs("svg", {
		width: size,
		height: size,
		className,
		viewBox: "0 0 28 28",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		children: [jsx("path", {
			d: "M2.80078 10.2112C2.80078 9.52802 2.80078 9.18642 2.85314 8.866C2.98648 8.05 3.36942 7.29538 3.94925 6.70595C4.17694 6.4745 4.45264 6.2728 5.00404 5.86939C5.29197 5.65874 5.43594 5.55342 5.58711 5.46632C5.97089 5.24521 6.39638 5.10618 6.83667 5.05803C7.01011 5.03906 7.18849 5.03906 7.54524 5.03906H11.6543C12.4669 5.03906 12.8732 5.03906 13.2599 5.13697C13.3882 5.16945 13.5143 5.20986 13.6375 5.25795C14.0091 5.40294 14.3398 5.63902 15.0012 6.1112L16.2632 7.01224C16.5526 7.21881 16.6972 7.3221 16.8598 7.38553C16.9137 7.40657 16.9689 7.42425 17.025 7.43846C17.1942 7.4813 17.372 7.4813 17.7275 7.4813H19.8008C22.0506 7.4813 23.1755 7.4813 23.9641 8.05425C24.2188 8.23928 24.4428 8.46326 24.6278 8.71794C25.2008 9.50654 25.2008 10.6315 25.2008 12.8813V18.7283C25.2008 20.9781 25.2008 22.1031 24.6278 22.8917C24.4428 23.1463 24.2188 23.3703 23.9641 23.5554C23.1755 24.1283 22.0506 24.1283 19.8008 24.1283H8.20077C5.95094 24.1283 4.82602 24.1283 4.03743 23.5554C3.78274 23.3703 3.55877 23.1463 3.37373 22.8917C2.80078 22.1031 2.80078 20.9781 2.80078 18.7283V10.2112Z",
			fill: "currentColor"
		}), jsx("g", {
			color: "var(--dsw-static-neutral-00)",
			"data-file-type-mark": true,
			transform: FOLDER_MARK_TRANSFORM,
			children: jsx("path", {
				d: "M6.31445 13.0693H21.6893",
				stroke: "currentColor",
				strokeWidth: "2.38"
			})
		})]
	});
}
function glyph(type, size, className) {
	switch (type) {
		case "code": return jsxs(FileGlyph, {
			size,
			className,
			children: [jsx("path", {
				d: "M8.61 16.3601L11.76 18.3901V20.1401L7 17.0601V15.6601L11.76 12.5801V14.3301L8.61 16.3601Z",
				fill: "currentColor"
			}), jsx("path", {
				d: "M16.1918 14.3301V12.5801L20.9518 15.6601V17.0601L16.1918 20.1401V18.3901L19.3418 16.3601L16.1918 14.3301Z",
				fill: "currentColor"
			})]
		});
		case "excel": return jsx(FileGlyph, {
			size,
			className,
			markTransform: LARGE_FILE_MARK_TRANSFORM,
			children: jsx("path", {
				d: "M10.2932 20.5L13.3532 16.25L13.3432 17.66L10.4032 13.5H12.6332L14.5132 16.21L13.5632 16.22L15.4132 13.5H17.5532L14.6132 17.58V16.18L17.7132 20.5H15.4332L13.5232 17.65H14.4332L12.5532 20.5H10.2932Z",
				fill: "currentColor"
			})
		});
		case "folder": return jsx(FolderGlyph$1, {
			size,
			className
		});
		case "html": return jsx(FileGlyph, {
			size,
			className,
			children: jsx("path", {
				fillRule: "evenodd",
				clipRule: "evenodd",
				d: "M13.9994 9.68298C17.212 9.68298 19.8167 12.2872 19.8168 15.4997C19.8168 18.7123 17.2121 21.3171 13.9994 21.3171C10.7869 21.3169 8.18274 18.7122 8.18274 15.4997C8.1829 12.2873 10.787 9.68315 13.9994 9.68298ZM9.26213 16.0247C9.47025 17.9241 10.7936 19.4876 12.5639 20.0463C12.42 19.7977 12.2952 19.5152 12.1879 19.2116C11.885 18.3541 11.693 17.2434 11.6424 16.0247H9.26213ZM16.3565 16.0247C16.3059 17.2434 16.1145 18.3542 15.8116 19.2116C15.7044 19.5151 15.5788 19.7971 15.435 20.0456C17.2054 19.487 18.5293 17.9242 18.7374 16.0247H16.3565ZM12.6938 16.0247C12.7439 17.1459 12.9212 18.1334 13.1784 18.8616C13.332 19.2962 13.503 19.61 13.6686 19.805C13.834 19.9996 13.9473 20.0256 13.9994 20.0258C14.0514 20.0258 14.1651 20.0002 14.331 19.805C14.4966 19.61 14.6676 19.2962 14.8211 18.8616C15.0784 18.1334 15.2557 17.1459 15.3058 16.0247H12.6938ZM13.9994 10.733C13.9473 10.7331 13.834 10.7598 13.6686 10.9545C13.503 11.1494 13.3319 11.4633 13.1784 11.8978C12.903 12.6777 12.7188 13.7545 12.6849 14.9747H15.3147C15.2808 13.7545 15.0966 12.6777 14.8211 11.8978C14.6676 11.4633 14.4965 11.1494 14.331 10.9545C14.1651 10.7593 14.0514 10.733 13.9994 10.733ZM15.5888 11.0051C15.6701 11.1756 15.7444 11.3576 15.8116 11.5478C16.1343 12.4613 16.3308 13.6619 16.3647 14.9747H18.7374C18.5352 13.1307 17.2817 11.6036 15.5888 11.0051ZM12.4101 11.0051C10.7174 11.6037 9.46428 13.1308 9.26213 14.9747H11.6349C11.6688 13.6619 11.8652 12.4613 12.1879 11.5478C12.2551 11.3577 12.3288 11.1756 12.4101 11.0051Z",
				fill: "currentColor"
			})
		});
		case "image": return jsxs(FileGlyph, {
			size,
			className,
			children: [
				jsx("path", {
					d: "M10.4212 15.9204C10.5756 15.6558 10.9579 15.6558 11.1123 15.9204L13.6493 20.2696C13.8048 20.5362 13.6125 20.8711 13.3037 20.8711H8.22974C7.92102 20.8711 7.72868 20.5362 7.88423 20.2696L10.4212 15.9204Z",
					fill: "currentColor"
				}),
				jsx("path", {
					d: "M15.4981 13.186C15.6505 12.9117 16.0451 12.9117 16.1975 13.186L20.1368 20.2769C20.2849 20.5435 20.0922 20.8711 19.7872 20.8711H11.9084C11.6034 20.8711 11.4107 20.5435 11.5588 20.2769L15.4981 13.186Z",
					fill: "currentColor"
				}),
				jsx("path", {
					d: "M11.8603 11.3997C11.8603 12.286 11.1418 13.0045 10.2555 13.0045C9.36924 13.0045 8.65076 12.286 8.65076 11.3997C8.65076 10.5134 9.36924 9.79492 10.2555 9.79492C11.1418 9.79492 11.8603 10.5134 11.8603 11.3997Z",
					fill: "currentColor"
				})
			]
		});
		case "markdown": return jsx(FileGlyph, {
			size,
			className,
			markTransform: LARGE_FILE_MARK_TRANSFORM,
			children: jsx("path", {
				d: "M8.7588 19.5V14.6H9.8998L11.9298 17.932H11.3278L13.3018 14.6H14.4428L14.4568 19.5H13.1828L13.1688 16.539H13.3858L11.9088 19.017H11.2928L9.7738 16.539H10.0398V19.5H8.7588ZM15.4375 19.5V14.6H17.7545C18.2958 14.6 18.7718 14.7003 19.1825 14.901C19.5932 15.1017 19.9128 15.384 20.1415 15.748C20.3748 16.112 20.4915 16.546 20.4915 17.05C20.4915 17.5493 20.3748 17.9833 20.1415 18.352C19.9128 18.716 19.5932 18.9983 19.1825 19.199C18.7718 19.3997 18.2958 19.5 17.7545 19.5H15.4375ZM16.8235 18.394H17.6985C17.9785 18.394 18.2212 18.3427 18.4265 18.24C18.6365 18.1327 18.7998 17.9787 18.9165 17.778C19.0332 17.5727 19.0915 17.33 19.0915 17.05C19.0915 16.7653 19.0332 16.5227 18.9165 16.322C18.7998 16.1213 18.6365 15.9697 18.4265 15.867C18.2212 15.7597 17.9785 15.706 17.6985 15.706H16.8235V18.394Z",
				fill: "currentColor"
			})
		});
		case "other": return jsx(FileGlyph, {
			size,
			className,
			muted: true
		});
		case "pdf": return jsx(FileGlyph, {
			size,
			className,
			markTransform: LARGE_FILE_MARK_TRANSFORM,
			children: jsx("path", {
				d: "M6.80616 19.5V14.6H9.04616C9.49416 14.6 9.87916 14.6723 10.2012 14.817C10.5278 14.9617 10.7798 15.1717 10.9572 15.447C11.1345 15.7177 11.2232 16.0397 11.2232 16.413C11.2232 16.7817 11.1345 17.1013 10.9572 17.372C10.7798 17.6427 10.5278 17.8527 10.2012 18.002C9.87916 18.1467 9.49416 18.219 9.04616 18.219H7.57616L8.19216 17.617V19.5H6.80616ZM8.19216 17.764L7.57616 17.127H8.96216C9.2515 17.127 9.46616 17.064 9.60616 16.938C9.75083 16.812 9.82316 16.637 9.82316 16.413C9.82316 16.1843 9.75083 16.007 9.60616 15.881C9.46616 15.755 9.2515 15.692 8.96216 15.692H7.57616L8.19216 15.055V17.764ZM11.8989 19.5V14.6H14.2159C14.7573 14.6 15.2333 14.7003 15.6439 14.901C16.0546 15.1017 16.3743 15.384 16.6029 15.748C16.8363 16.112 16.9529 16.546 16.9529 17.05C16.9529 17.5493 16.8363 17.9833 16.6029 18.352C16.3743 18.716 16.0546 18.9983 15.6439 19.199C15.2333 19.3997 14.7573 19.5 14.2159 19.5H11.8989ZM13.2849 18.394H14.1599C14.4399 18.394 14.6826 18.3427 14.8879 18.24C15.0979 18.1327 15.2613 17.9787 15.3779 17.778C15.4946 17.5727 15.5529 17.33 15.5529 17.05C15.5529 16.7653 15.4946 16.5227 15.3779 16.322C15.2613 16.1213 15.0979 15.9697 14.8879 15.867C14.6826 15.7597 14.4399 15.706 14.1599 15.706H13.2849V18.394ZM17.6821 19.5V14.6H21.5251V15.671H19.0681V19.5H17.6821ZM18.9701 17.82V16.749H21.2311V17.82H18.9701Z",
				fill: "currentColor"
			})
		});
		case "ppt": return jsx(FileGlyph, {
			size,
			className,
			markTransform: LARGE_FILE_MARK_TRANSFORM,
			children: jsx("path", {
				d: "M11.0132 20.5V13.5H14.2132C14.8532 13.5 15.4032 13.6033 15.8632 13.81C16.3299 14.0167 16.6899 14.3167 16.9432 14.71C17.1966 15.0967 17.3232 15.5567 17.3232 16.09C17.3232 16.6167 17.1966 17.0733 16.9432 17.46C16.6899 17.8467 16.3299 18.1467 15.8632 18.36C15.4032 18.5667 14.8532 18.67 14.2132 18.67H12.1132L12.9932 17.81V20.5H11.0132ZM12.9932 18.02L12.1132 17.11H14.0932C14.5066 17.11 14.8132 17.02 15.0132 16.84C15.2199 16.66 15.3232 16.41 15.3232 16.09C15.3232 15.7633 15.2199 15.51 15.0132 15.33C14.8132 15.15 14.5066 15.06 14.0932 15.06H12.1132L12.9932 14.15V18.02Z",
				fill: "currentColor"
			})
		});
		case "video": return jsx(FileGlyph, {
			size,
			className,
			children: jsx("path", {
				d: "M17.5 14.634C18.1667 15.0189 18.1667 15.9811 17.5 16.366L11.5 19.8301C10.8333 20.215 10 19.7339 10 18.9641L10 12.0359C10 11.2661 10.8333 10.785 11.5 11.1699L17.5 14.634Z",
				fill: "currentColor"
			})
		});
		case "word": return jsx(FileGlyph, {
			size,
			className,
			markTransform: LARGE_FILE_MARK_TRANSFORM,
			children: jsx("path", {
				d: "M10.5118 20.5L8.24179 13.5H10.2818L12.1918 19.56H11.1618L13.1718 13.5H14.9918L16.8918 19.56H15.9018L17.8718 13.5H19.7618L17.4918 20.5H15.3718L13.7518 15.35H14.3218L12.6318 20.5H10.5118Z",
				fill: "currentColor"
			})
		});
		/* v8 ignore next -- closed-union backstop; only reached if a type is forged */
		default: return assertNever$2(type);
	}
}
/** Closed-union exhaustiveness guard for traditional file artwork. */
/* v8 ignore next 3 -- only reachable when an untyped caller forges a traditional file type */
function assertNever$2(value) {
	throw new Error(`unreachable traditional file type: ${String(value)}`);
}
/**
* Render a decorative file-type glyph for a path or an explicitly resolved kind.
* @param props - Path or kind selection, optional project context, size, and CSS class.
* @returns The category-colored SVG; the caller owns the accessible name and may override
* the color through `--dsh-file-type-icon-color`.
*/
function FileTypeIcon(props) {
	const { size = 28, className } = props;
	const resolvedType = "path" in props ? classifyFileType(props.path, props.context) : props.kind;
	return isCodeFileType(resolvedType) ? jsx(CodeFileIcon, {
		type: resolvedType,
		size,
		className
	}) : glyph(resolvedType, size, clsx(css$13.icon, css$13[resolvedType], className));
}
//#endregion
//#region lib/types/LinkIcon.js
/**
* Derive a file path's link-icon category from its extension. Unknown and
* missing extensions fall to `other` (the plain-paper glyph).
* @param path - File path as the producing tool spelled it (either separator).
* @returns The file's glyph category; never `url` or `folder`.
*/
function classifyLinkPath(path) {
	const type = classifyFileType(path);
	const extension = fileExtension(path);
	if (isCodeFileType(type)) return isLinkCodeExtension(extension) ? "code" : "other";
	if (extension === "") return "other";
	switch (type) {
		case "code":
		case "html": return "code";
		case "image": return "image";
		case "excel":
		case "pdf":
		case "ppt":
		case "word": return "document";
		case "markdown":
		case "other":
		case "video": return "other";
		/* v8 ignore next -- classifyFileType returns a closed union exhausted above */
		default: return assertNever$1(type);
	}
}
const GlobeGlyph = ({ size, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": true,
	children: jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M9.99951 1.68994C14.5889 1.68994 18.3098 5.41022 18.3101 9.99951C18.3101 14.589 14.589 18.3101 9.99951 18.3101C5.41022 18.3098 1.68994 14.5889 1.68994 9.99951C1.69017 5.41037 5.41037 1.69017 9.99951 1.68994ZM3.23193 10.7495C3.52924 13.463 5.41981 15.6965 7.94873 16.4946C7.74323 16.1395 7.56487 15.736 7.41162 15.3022C6.97892 14.0773 6.70459 12.4906 6.63232 10.7495H3.23193ZM13.3667 10.7495C13.2944 12.4906 13.0211 14.0773 12.5884 15.3022C12.4352 15.7359 12.2557 16.1386 12.0503 16.4937C14.5794 15.6956 16.4707 13.4631 16.7681 10.7495H13.3667ZM8.13428 10.7495C8.20587 12.3512 8.45916 13.7619 8.82666 14.8022C9.046 15.4231 9.29031 15.8714 9.52686 16.1499C9.76321 16.428 9.92505 16.4651 9.99951 16.4653C10.0737 16.4653 10.2362 16.4288 10.4731 16.1499C10.7097 15.8714 10.954 15.4231 11.1733 14.8022C11.5408 13.7619 11.7941 12.3512 11.8657 10.7495H8.13428ZM9.99951 3.18994C9.92505 3.19013 9.76321 3.22823 9.52686 3.50635C9.29035 3.78486 9.04595 4.23325 8.82666 4.854C8.43314 5.96808 8.16996 7.50638 8.12158 9.24951H11.8784C11.83 7.50638 11.5669 5.96808 11.1733 4.854C10.954 4.23324 10.7097 3.78486 10.4731 3.50635C10.2362 3.22748 10.0737 3.18994 9.99951 3.18994ZM12.27 3.57861C12.3862 3.82232 12.4924 4.0822 12.5884 4.354C13.0494 5.65902 13.33 7.37415 13.3784 9.24951H16.7681C16.4792 6.61525 14.6885 4.43369 12.27 3.57861ZM7.729 3.57861C5.3109 4.4338 3.52072 6.61541 3.23193 9.24951H6.62158C6.67001 7.37415 6.95063 5.65902 7.41162 4.354C7.50759 4.08233 7.61287 3.82221 7.729 3.57861Z",
		fill: "currentColor"
	})
});
const CodeGlyph = ({ size, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": true,
	children: [
		jsx("path", {
			d: "M5 15.2021L1.67188 11.874C1.42017 11.6223 1.1823 11.3858 1.00781 11.1689C0.823288 10.9396 0.645016 10.6559 0.586914 10.2891C0.556619 10.0975 0.556619 9.90245 0.586914 9.71094C0.645016 9.3441 0.823288 9.06042 1.00781 8.83105C1.1823 8.61419 1.42017 8.37768 1.67188 8.12598L5 4.79785L6.20215 6L2.87402 9.32813C2.59555 9.6066 2.43539 9.76802 2.33203 9.89648C2.29246 9.94567 2.27406 9.97638 2.26563 9.99121C2.26528 9.99711 2.26528 10.0029 2.26563 10.0088C2.27406 10.0236 2.29246 10.0543 2.33203 10.1035C2.43539 10.232 2.59555 10.3934 2.87402 10.6719L6.20215 14L5 15.2021Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M15 15.2021L18.3281 11.874C18.5798 11.6223 18.8177 11.3858 18.9922 11.1689C19.1767 10.9396 19.355 10.6559 19.4131 10.2891C19.4434 10.0975 19.4434 9.90245 19.4131 9.71094C19.355 9.3441 19.1767 9.06042 18.9922 8.83105C18.8177 8.61419 18.5798 8.37768 18.3281 8.12598L15 4.79785L13.7979 6L17.126 9.32813C17.4045 9.6066 17.5646 9.76802 17.668 9.89648C17.7075 9.94567 17.7259 9.97638 17.7344 9.99121C17.7347 9.99711 17.7347 10.0029 17.7344 10.0088C17.7259 10.0236 17.7075 10.0543 17.668 10.1035C17.5646 10.232 17.4045 10.3934 17.126 10.6719L13.7979 14L15 15.2021Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M9.41181 15.0993L7.76955 14.6593L10.3577 5.00002L12 5.44006L9.41181 15.0993Z",
			fill: "currentColor"
		})
	]
});
const FolderGlyph = ({ size, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": true,
	children: [jsx("path", {
		d: "M1.2002 11.4178V6.7244C1.2002 6.47036 1.19957 6.2962 1.21387 6.12773C1.29746 5.14425 1.76052 4.23195 2.50489 3.58378C2.63247 3.47269 2.77337 3.37059 2.97852 3.2205C3.11259 3.12241 3.20444 3.05471 3.29981 2.99296C3.85318 2.6347 4.49029 2.42604 5.14844 2.38847C5.26177 2.38201 5.37601 2.38261 5.542 2.38261H7.91211C8.63453 2.38261 9.13199 2.37701 9.61329 2.49882C9.7656 2.53739 9.91613 2.58526 10.0625 2.64237C10.525 2.8229 10.9267 3.11712 11.5147 3.5369L12.0859 3.94413C12.1927 4.02032 12.2509 4.06163 12.2959 4.09062C12.3336 4.11488 12.3394 4.11605 12.332 4.11308C12.3403 4.11633 12.3488 4.11875 12.3574 4.12089C12.3627 4.12161 12.3757 4.12265 12.4004 4.12382C12.4538 4.12635 12.5252 4.12675 12.6563 4.12675C13.7369 4.12675 14.6105 4.12608 15.3086 4.19999C16.0209 4.27545 16.643 4.43585 17.1885 4.82011C17.5449 5.07115 17.8554 5.38173 18.1064 5.73808C18.4908 6.28368 18.6521 6.90645 18.7275 7.61894C18.8014 8.31701 18.7998 9.19066 18.7998 10.2713V11.4178C18.7998 12.5248 18.801 13.4195 18.7236 14.1336C18.6446 14.8626 18.4763 15.4982 18.0742 16.0516C17.8399 16.374 17.5559 16.6571 17.2334 16.8914C16.68 17.2935 16.0445 17.4628 15.3154 17.5418C14.6014 17.6191 13.7065 17.618 12.5996 17.618H7.40039C6.29352 17.618 5.39863 17.6191 4.68457 17.5418C3.95547 17.4628 3.32001 17.2935 2.76661 16.8914C2.44414 16.6571 2.16011 16.374 1.92579 16.0516C1.52375 15.4982 1.35537 14.8626 1.27637 14.1336C1.199 13.4195 1.2002 12.5248 1.2002 11.4178ZM2.79981 11.4178C2.79981 12.5602 2.80136 13.3529 2.86719 13.9607C2.93144 14.5537 3.04885 14.8759 3.21973 15.1111C3.35542 15.2979 3.52029 15.4618 3.70704 15.5975C3.94221 15.7683 4.26361 15.8867 4.85645 15.951C5.46439 16.0168 6.25766 16.0174 7.40039 16.0174H12.5996C13.7424 16.0174 14.5356 16.0168 15.1436 15.951C15.7364 15.8867 16.0578 15.7683 16.293 15.5975C16.4797 15.4618 16.6446 15.2979 16.7803 15.1111C16.9512 14.8759 17.0686 14.5537 17.1328 13.9607C17.1986 13.3529 17.2002 12.5602 17.2002 11.4178V10.2713C17.2002 9.15571 17.1987 8.38124 17.1357 7.7869C17.0743 7.20716 16.9618 6.8914 16.7988 6.65995C16.6534 6.45353 16.473 6.2741 16.2666 6.1287C16.0351 5.96565 15.7196 5.85222 15.1397 5.79081C14.5454 5.7279 13.7716 5.72733 12.6563 5.72733C12.4465 5.72733 12.2081 5.73253 11.9736 5.6746C11.8947 5.65509 11.8168 5.63037 11.7412 5.60038C11.517 5.51135 11.3268 5.36863 11.1563 5.24687L10.585 4.83866C9.93302 4.37321 9.71454 4.22394 9.48047 4.13261C9.39579 4.09958 9.30882 4.07191 9.22071 4.0496C8.97721 3.98798 8.71286 3.98222 7.91211 3.98222H5.542C5.35809 3.98222 5.29665 3.98285 5.23926 3.98612C4.85821 4.00788 4.48933 4.12829 4.16895 4.33573C4.12071 4.36697 4.07125 4.40295 3.92286 4.51151C3.69569 4.67771 3.61995 4.73389 3.55567 4.78983C3.1248 5.16501 2.8561 5.69324 2.80762 6.26249C2.80039 6.34752 2.79981 6.44244 2.79981 6.7244V11.4178Z",
		fill: "currentColor"
	}), jsx("path", {
		d: "M15.4913 8.11793V9.71754H4.50892V8.11793H15.4913Z",
		fill: "currentColor"
	})]
});
const PhotoGlyph = ({ size, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": true,
	children: [jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M13 5.15039C14.574 5.15039 15.8496 6.42599 15.8496 8C15.8496 9.57401 14.574 10.8496 13 10.8496C11.426 10.8496 10.1504 9.57401 10.1504 8C10.1504 6.42599 11.426 5.1504 13 5.15039ZM13 6.84961C12.3649 6.84961 11.8496 7.36488 11.8496 8C11.8496 8.63513 12.3649 9.15039 13 9.15039C13.6351 9.15039 14.1504 8.63513 14.1504 8C14.1504 7.36488 13.6351 6.84961 13 6.84961Z",
		fill: "currentColor"
	}), jsx("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M12.5996 2.15039C13.7056 2.15039 14.6038 2.14883 15.3213 2.22656C16.0546 2.30602 16.6994 2.47647 17.2627 2.88574C17.5895 3.1232 17.8768 3.41049 18.1143 3.73731C18.5235 4.30063 18.694 4.9454 18.7734 5.67871C18.8512 6.39616 18.8496 7.29441 18.8496 8.40039V11.5996C18.8496 12.7056 18.8512 13.6038 18.7734 14.3213C18.694 15.0546 18.5235 15.6994 18.1143 16.2627C17.8768 16.5895 17.5895 16.8768 17.2627 17.1143C16.6994 17.5235 16.0546 17.694 15.3213 17.7734C14.6038 17.8512 13.7056 17.8496 12.5996 17.8496H7.40039C6.29441 17.8496 5.39616 17.8512 4.67871 17.7734C3.9454 17.694 3.30063 17.5235 2.73731 17.1143C2.41049 16.8768 2.1232 16.5895 1.88574 16.2627C1.47647 15.6994 1.30602 15.0546 1.22656 14.3213C1.14883 13.6038 1.15039 12.7056 1.15039 11.5996V8.40039C1.15039 7.29441 1.14883 6.39616 1.22656 5.67871C1.30602 4.9454 1.47647 4.30063 1.88574 3.73731C2.1232 3.41049 2.41049 3.1232 2.73731 2.88574C3.30063 2.47647 3.9454 2.30602 4.67871 2.22656C5.39616 2.14883 6.29441 2.15039 7.40039 2.15039H12.5996ZM5.56348 10.8164C5.30962 10.8348 5.02517 10.9291 4.58008 11.1973C4.13813 11.4635 3.60989 11.8565 2.85449 12.4229C2.85831 13.1414 2.86855 13.6903 2.91699 14.1377C2.98078 14.7264 3.09709 15.0384 3.26074 15.2637C3.39335 15.4462 3.55382 15.6067 3.73633 15.7393C3.96158 15.9029 4.2736 16.0192 4.86231 16.083C5.46688 16.1485 6.25677 16.1504 7.40039 16.1504H11.9492L8.71094 12.9131C8.00039 12.2025 7.51129 11.7149 7.09571 11.376C6.69274 11.0474 6.42364 10.9144 6.17481 10.8604C5.97432 10.8168 5.7681 10.8017 5.56348 10.8164ZM7.40039 3.84961C6.25677 3.84961 5.46688 3.85153 4.86231 3.91699C4.2736 3.98078 3.96158 4.09709 3.73633 4.26074C3.55382 4.39335 3.39335 4.55382 3.26074 4.73633C3.09709 4.96158 2.98078 5.2736 2.91699 5.86231C2.85153 6.46688 2.84961 7.25677 2.84961 8.40039V10.3105C3.15698 10.0902 3.43896 9.8988 3.70215 9.74024C4.26649 9.40025 4.81639 9.16621 5.44141 9.1211C5.80775 9.0947 6.17623 9.1213 6.53516 9.19922C7.14769 9.33224 7.65922 9.64212 8.16992 10.0586C8.66793 10.4648 9.22718 11.025 9.91309 11.7109L14.333 16.1318C14.6363 16.122 14.9012 16.1086 15.1377 16.083C15.7264 16.0192 16.0384 15.9029 16.2637 15.7393C16.4462 15.6067 16.6067 15.4462 16.7393 15.2637C16.9029 15.0384 17.0192 14.7264 17.083 14.1377C17.1485 13.5331 17.1504 12.7432 17.1504 11.5996V8.40039C17.1504 7.25677 17.1485 6.46688 17.083 5.86231C17.0192 5.2736 16.9029 4.96158 16.7393 4.73633C16.6067 4.55382 16.4462 4.39335 16.2637 4.26074C16.0384 4.09709 15.7264 3.98078 15.1377 3.91699C14.5331 3.85153 13.7432 3.84961 12.5996 3.84961H7.40039Z",
		fill: "currentColor"
	})]
});
const PaperGlyph = ({ size, className }) => jsx("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": true,
	children: jsx("path", {
		d: "M11.3467 4.59607C11.3469 5.40284 11.3499 5.9609 11.3965 6.39099C11.444 6.82964 11.5288 7.03981 11.6328 7.18298C11.7253 7.3102 11.8376 7.42158 11.9648 7.51404C12.108 7.61807 12.3181 7.70283 12.7568 7.75037C13.1851 7.79675 13.7399 7.79992 14.541 7.80017L11.3467 4.59607ZM17.2695 12.7455C17.2695 13.5901 17.2706 14.2881 17.21 14.848C17.1477 15.4228 17.0119 15.9463 16.6768 16.4076C16.4856 16.6707 16.2543 16.902 15.9912 17.0931C15.5298 17.4284 15.0065 17.5641 14.4316 17.6263C13.8718 17.687 13.1737 17.6859 12.3291 17.6859H8.23926C7.39498 17.6859 6.69745 17.687 6.1377 17.6263C5.56284 17.5641 5.03855 17.4284 4.57715 17.0931C4.31413 16.902 4.08272 16.6706 3.8916 16.4076C3.55647 15.9463 3.42167 15.4227 3.35938 14.848C3.29872 14.2881 3.29981 13.5901 3.29981 12.7455V6.80017C3.29981 5.95586 3.29876 5.25837 3.35938 4.69861C3.42166 4.12375 3.55638 3.59946 3.8916 3.13806C4.08274 2.87503 4.31412 2.64365 4.57715 2.45252C5.03855 2.11729 5.56284 1.98257 6.1377 1.92029C6.69746 1.85967 7.39495 1.86072 8.23926 1.86072H9.38468C10.039 1.86072 10.3661 1.86072 10.6679 1.95896C10.7677 1.99146 10.8648 2.03176 10.9583 2.0795C11.241 2.22382 11.472 2.45549 11.934 2.91883L16.2188 7.21612C16.679 7.67761 16.909 7.90836 17.0523 8.1902C17.0997 8.28342 17.1397 8.38022 17.172 8.4797C17.2695 8.78045 17.2695 9.10631 17.2695 9.75801V12.7455ZM4.89942 12.7455C4.89942 13.6256 4.90106 14.2215 4.9502 14.6752C4.99773 15.1139 5.08249 15.324 5.18652 15.4672C5.27898 15.5944 5.39037 15.7067 5.51758 15.7992C5.66076 15.9032 5.87093 15.988 6.30957 16.0355C6.76321 16.0847 7.35919 16.0853 8.23926 16.0853H12.3291C13.2091 16.0853 13.8051 16.0846 14.2588 16.0355C14.6973 15.988 14.9076 15.9032 15.0508 15.7992C15.1781 15.7067 15.2903 15.5945 15.3828 15.4672C15.4868 15.324 15.5716 15.1139 15.6191 14.6752C15.6683 14.2215 15.6689 13.6256 15.6689 12.7455V9.40076H14.6865C13.8419 9.40076 13.1439 9.40185 12.584 9.34119C12.0093 9.27889 11.4857 9.14411 11.0244 8.80896C10.7614 8.61784 10.53 8.38645 10.3389 8.12341C10.0036 7.66202 9.86795 7.13773 9.80567 6.56287C9.74505 6.00312 9.74609 5.30558 9.7461 4.4613V3.46033H8.23926C7.35919 3.46033 6.76321 3.46196 6.30957 3.51111C5.87097 3.55865 5.66075 3.64342 5.51758 3.74744C5.39057 3.83979 5.27888 3.95148 5.18652 4.07849C5.0825 4.22166 4.99773 4.43188 4.9502 4.87048C4.90105 5.32412 4.89942 5.92011 4.89942 6.80017V12.7455Z",
		fill: "currentColor"
	})
});
const PaperDocGlyph = ({ size, className }) => jsxs("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 20 20",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": true,
	children: [
		jsx("path", {
			d: "M11.3457 4.5957C11.3459 5.40247 11.3489 5.96054 11.3955 6.39063C11.443 6.82927 11.5278 7.03944 11.6318 7.18262C11.7243 7.30983 11.8367 7.42122 11.9639 7.51367C12.1071 7.61771 12.3171 7.70247 12.7559 7.75C13.1841 7.79639 13.739 7.79955 14.54 7.79981L11.3457 4.5957ZM17.2686 12.7451C17.2686 13.5897 17.2696 14.2878 17.209 14.8477C17.1467 15.4224 17.011 15.9459 16.6758 16.4072C16.4846 16.6703 16.2533 16.9016 15.9902 17.0928C15.5289 17.428 15.0055 17.5637 14.4307 17.626C13.8708 17.6866 13.1727 17.6855 12.3281 17.6855H8.23828C7.394 17.6855 6.69647 17.6866 6.13672 17.626C5.56186 17.5637 5.03757 17.428 4.57617 17.0928C4.31315 16.9016 4.08175 16.6703 3.89063 16.4072C3.55549 15.9459 3.42069 15.4224 3.3584 14.8477C3.29774 14.2878 3.29883 13.5897 3.29883 12.7451V6.79981C3.29883 5.95549 3.29778 5.258 3.3584 4.69824C3.42068 4.12338 3.5554 3.5991 3.89063 3.1377C4.08176 2.87466 4.31314 2.64328 4.57617 2.45215C5.03757 2.11692 5.56186 1.98221 6.13672 1.91992C6.69648 1.8593 7.39397 1.86035 8.23828 1.86035H9.3837C10.038 1.86035 10.3652 1.86035 10.6669 1.9586C10.7668 1.99109 10.8639 2.03139 10.9573 2.07913C11.24 2.22346 11.471 2.45512 11.933 2.91846L16.2178 7.21575C16.678 7.67725 16.9081 7.90799 17.0514 8.18983C17.0988 8.28305 17.1388 8.37985 17.171 8.47933C17.2686 8.78009 17.2686 9.10594 17.2686 9.75765V12.7451ZM4.89844 12.7451C4.89844 13.6253 4.90008 14.2211 4.94922 14.6748C4.99675 15.1135 5.08151 15.3236 5.18555 15.4668C5.278 15.594 5.38939 15.7064 5.5166 15.7988C5.65978 15.9029 5.86995 15.9876 6.30859 16.0352C6.76223 16.0843 7.35822 16.085 8.23828 16.085H12.3281C13.2081 16.085 13.8042 16.0843 14.2578 16.0352C14.6963 15.9876 14.9066 15.9028 15.0498 15.7988C15.1771 15.7063 15.2893 15.5941 15.3818 15.4668C15.4859 15.3236 15.5706 15.1135 15.6182 14.6748C15.6673 14.2211 15.668 13.6252 15.668 12.7451V9.40039H14.6855C13.841 9.40039 13.1429 9.40148 12.583 9.34082C12.0083 9.27852 11.4847 9.14374 11.0234 8.8086C10.7604 8.61747 10.5291 8.38608 10.3379 8.12305C10.0027 7.66165 9.86697 7.13736 9.80469 6.5625C9.74408 6.00275 9.74512 5.30522 9.74512 4.46094V3.45996H8.23828C7.35822 3.45996 6.76223 3.46159 6.30859 3.51074C5.86999 3.55828 5.65977 3.64305 5.5166 3.74707C5.38959 3.83942 5.2779 3.95111 5.18555 4.07813C5.08153 4.2213 4.99676 4.43152 4.94922 4.87012C4.90007 5.32376 4.89844 5.91974 4.89844 6.79981V12.7451Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M11.1523 13.0995V14.4999H6.30273V13.0995H11.1523Z",
			fill: "currentColor"
		}),
		jsx("path", {
			d: "M10.2148 10V11.4004H6.30273V10H10.2148Z",
			fill: "currentColor"
		})
	]
});
/** Local exhaustiveness helper — this package does not depend on `dsh-llm`. */
/* v8 ignore next 3 -- closed-union backstop; only reached if a kind is forged */
function assertNever$1(value) {
	throw new Error(`unreachable link icon kind: ${String(value)}`);
}
/**
* Render the leading glyph for one clickable artifact link.
* @param props - The link category, optional size (default 14px — the inline
* link text size these glyphs sit beside), and optional CSS class.
* @returns The category's SVG glyph, riding currentColor.
*/
function LinkIcon({ kind, size = 14, className }) {
	switch (kind) {
		case "url": return jsx(GlobeGlyph, {
			size,
			className
		});
		case "folder": return jsx(FolderGlyph, {
			size,
			className
		});
		case "code": return jsx(CodeGlyph, {
			size,
			className
		});
		case "image": return jsx(PhotoGlyph, {
			size,
			className
		});
		case "document": return jsx(PaperDocGlyph, {
			size,
			className
		});
		case "other": return jsx(PaperGlyph, {
			size,
			className
		});
		/* v8 ignore next -- closed-union backstop; only reached if a kind is forged */
		default: return assertNever$1(kind);
	}
}
//#endregion
//#region lib/types/user-text.js
/** The wire form a session chip serializes to; label is the display text. */
const SESSION_WIRE_RE = /@\[([^\]\n]+)\]\(dsh-session:[^)\s]+\)/gu;
/** Sentence punctuation a bare `@name` token may carry without being part of the reference. */
const TRAILING_PUNCTUATION_RE = /[.,;:!?，。；：！？]+$/u;
/**
* Split one sent text into inline plain runs and reference chips.
* @param text - the logged model text of the message or queue row.
* @param sessionLabels - exact session mention labels associated by an adjacent recall.
* @param slashNames - names a `/name` token may decorate as: the skills the
* host loaded for this message, or the command a command bubble echoes
* (unsent queue rows pass none).
* @param slashKind - the chip kind those tokens render as.
* @returns inline nodes covering the whole text.
*/
function projectUserText(text, sessionLabels, slashNames = [], slashKind = "skill") {
	const ranges = [];
	SESSION_WIRE_RE.lastIndex = 0;
	let wire;
	while ((wire = SESSION_WIRE_RE.exec(text)) !== null) ranges.push({
		start: wire.index,
		end: wire.index + wire[0].length,
		label: wire[0],
		kind: "session",
		display: wire[1]
	});
	for (const rawLabel of [...new Set(sessionLabels)].sort((a, b) => b.length - a.length)) {
		const label = `@${rawLabel}`;
		let start = text.indexOf(label);
		while (start >= 0) {
			ranges.push({
				start,
				end: start + label.length,
				label,
				kind: "session"
			});
			start = text.indexOf(label, start + label.length);
		}
	}
	const re = /(^|\s)(\/[\w-]+(?=\s|$)|@"[^"\n]+"|@[^\s]+)/gu;
	let m;
	while ((m = re.exec(text)) !== null) {
		const tokenStart = m.index + m[1].length;
		const rawLabel = m[2];
		const label = rawLabel.startsWith("@\"") ? rawLabel : rawLabel.replace(TRAILING_PUNCTUATION_RE, "");
		if (label.length <= 1) continue;
		if (label.startsWith("/") && !slashNames.includes(label.slice(1))) continue;
		ranges.push({
			start: tokenStart,
			end: tokenStart + label.length,
			label,
			kind: "plain"
		});
	}
	const rankOf = (range) => range.kind === "session" ? 0 : 1;
	ranges.sort((a, b) => a.start - b.start || rankOf(a) - rankOf(b) || b.end - a.end);
	const parts = [];
	let cursor = 0;
	const pushPlain = (from, to) => {
		parts.push(jsx("span", {
			className: css$14.plainRun,
			children: text.slice(from, to)
		}, `t${from}`));
	};
	for (const range of ranges) {
		if (range.start < cursor) continue;
		const { start: tokenStart, end, label, kind } = range;
		if (tokenStart > cursor) pushPlain(cursor, tokenStart);
		const referenceKind = kind === "session" ? "session" : label.startsWith("@") ? label.endsWith("/") ? "folder" : "file" : void 0;
		const displayLabel = range.display ?? (referenceKind === void 0 ? label : referenceKind === "session" ? label.slice(1) : label.slice(1).replace(/^"|"$/gu, "").split(/[\\/]/u).filter(Boolean).at(-1) ?? label.slice(1));
		parts.push(jsxs("span", {
			className: clsx(css$14.refChip, referenceKind === void 0 && css$14.slashChip),
			"data-ref-chip": referenceKind ?? slashKind,
			title: label,
			children: [referenceKind !== void 0 && jsx(ReferenceIcon, {
				kind: referenceKind,
				size: 16,
				className: css$14.refIcon
			}), displayLabel]
		}, tokenStart));
		cursor = end;
	}
	if (parts.length === 0) return jsx("span", {
		className: css$14.plainRun,
		children: text
	});
	if (cursor < text.length) pushPlain(cursor, text.length);
	return jsx(Fragment, { children: parts });
}
//#endregion
//#region lib/types/Tooltip.js
/**
* Attach a hover/focus tooltip to an anchor element.
* @param props.label - bubble text, or a resolver evaluated only while the bubble is visible.
* @param props.side - placement relative to the anchor (default 'right').
* @param props.delayMs - hover delay in milliseconds; keyboard focus remains immediate.
* @param props.disabled - suppress the bubble while true; the anchor renders identically so
* toggling never remounts it (which would cut its CSS transitions).
* @param props.maxWidth - bubble width cap in pixels, for labels long enough that the default
* half-viewport cap would render a slab wider than the surface the anchor sits on.
* @param props.children - a single anchor element; its own ref (callback or object) is forwarded alongside the tooltip's.
* @returns the cloned anchor plus a fixed-position bubble while hovered/focused.
*/
function Tooltip({ label, side = "right", delayMs = 0, disabled = false, maxWidth, children }) {
	const anchor = useRef(null);
	const childRef = children.ref;
	const mergedRef = useCallback((el) => {
		anchor.current = el;
		if (typeof childRef === "function") childRef(el);
		else if (childRef != null) childRef.current = el;
	}, [childRef]);
	const [pos, setPos] = useState(null);
	const [placement, setPlacement] = useState(side);
	const bubble = useRef(null);
	const resolvedLabel = pos === null ? null : typeof label === "function" ? label() : label;
	const y = pos === null ? 0 : placement === "right" ? pos.top + (pos.bottom - pos.top) / 2 : placement === "top" ? pos.top - 8 : pos.bottom + 8;
	const EDGE_MARGIN = 12;
	useLayoutEffect(() => {
		if (pos === null) return;
		const fit = () => {
			const el = bubble.current;
			/* v8 ignore next -- pos is set only while the bubble is mounted. */
			if (el === null) return;
			el.style.left = `${pos.x}px`;
			const r = el.getBoundingClientRect();
			let dx = 0;
			if (r.right > window.innerWidth - EDGE_MARGIN) dx = window.innerWidth - EDGE_MARGIN - r.right;
			if (r.left + dx < EDGE_MARGIN) dx = EDGE_MARGIN - r.left;
			el.style.left = `${pos.x + dx}px`;
			if (side === "right") return;
			const fitsBelow = pos.bottom + 8 + r.height <= window.innerHeight - EDGE_MARGIN;
			const fitsAbove = pos.top - 8 - r.height >= EDGE_MARGIN;
			if (placement === "bottom" && !fitsBelow && fitsAbove) setPlacement("top");
			if (placement === "top" && !fitsAbove && fitsBelow) setPlacement("bottom");
		};
		fit();
		window.addEventListener("resize", fit);
		return () => {
			window.removeEventListener("resize", fit);
		};
	}, [
		placement,
		pos,
		resolvedLabel,
		side
	]);
	const showTimer = useRef(null);
	const triggers = useRef({
		hover: false,
		focus: false
	});
	const cancelShow = useCallback(() => {
		if (showTimer.current === null) return;
		clearTimeout(showTimer.current);
		showTimer.current = null;
	}, []);
	useEffect(() => {
		if (disabled) {
			cancelShow();
			triggers.current = {
				hover: false,
				focus: false
			};
			setPos(null);
		}
		return cancelShow;
	}, [cancelShow, disabled]);
	const show = () => {
		if (disabled) return;
		const el = anchor.current;
		/* v8 ignore next -- the ref is attached by event time: events fire on the cloned anchor. */
		if (el === null) return;
		const r = el.getBoundingClientRect();
		setPlacement(side);
		setPos({
			x: side === "right" ? r.right + 10 : r.left + r.width / 2,
			top: r.top,
			bottom: r.bottom
		});
	};
	const showAfterHoverDelay = () => {
		cancelShow();
		if (delayMs <= 0) {
			show();
			return;
		}
		showTimer.current = setTimeout(() => {
			showTimer.current = null;
			show();
		}, delayMs);
	};
	const hide = () => {
		cancelShow();
		if (!triggers.current.hover && !triggers.current.focus) setPos(null);
	};
	return jsxs(Fragment, { children: [cloneElement(children, {
		ref: mergedRef,
		onMouseEnter: (e) => {
			children.props.onMouseEnter?.(e);
			triggers.current.hover = true;
			showAfterHoverDelay();
		},
		onMouseLeave: (e) => {
			children.props.onMouseLeave?.(e);
			triggers.current.hover = false;
			cancelShow();
			setPos(null);
		},
		onFocus: (e) => {
			children.props.onFocus?.(e);
			triggers.current.focus = true;
			cancelShow();
			show();
		},
		onBlur: (e) => {
			children.props.onBlur?.(e);
			triggers.current.focus = false;
			hide();
		}
	}), pos !== null && jsx("span", {
		ref: bubble,
		className: css$15.bubble,
		"data-side": placement,
		style: {
			left: pos.x,
			top: y,
			...maxWidth === void 0 ? {} : { maxWidth }
		},
		role: "tooltip",
		children: resolvedLabel
	})] });
}
//#endregion
//#region lib/types/Toast.js
/** Full-opacity hold before the fade starts, when the owner names none. */
const HOLD_MS = 3e3;
/** Fade duration. Must agree with the stylesheet's toast-fade duration. */
const FADE_MS = 1e3;
/**
* Transient top-center banner: slides in, holds at full opacity, fades out,
* then reports done so the owner can unmount it. Re-showing the same text
* restarts the cycle when the owner remounts the component (key it by a
* per-show sequence). Rendered through a body portal so an owner inside a
* transformed or filtered ancestor cannot trap the fixed banner in that
* ancestor's box.
*
* The hold is the owner's to set, because how long a banner has to stay
* depends on how much there is to read: a one-line limit lands in the default
* window, while a failure that names what broke does not. One value drives
* both the unmount timer and the stylesheet's fade delay — the stylesheet
* reads it as a custom property — so the two can no longer disagree and leave
* the banner unmounting mid-fade.
* @param props.text - resolved banner copy; the owner passes localized text.
* @param props.icon - optional leading glyph (e.g. a warning icon).
* @param props.holdMs - full-opacity hold before the fade; defaults to 3000.
* @param props.anchor - optional element whose horizontal center the banner
* follows (e.g. the composer card, so the banner centers over the chat column
* rather than the whole window); omitted, it centers on the viewport.
* @param props.onDone - called once the fade completes; unmount the toast here.
* @returns the floating banner.
*/
function Toast({ text, icon, anchor, holdMs = HOLD_MS, onDone }) {
	useEffect(() => {
		const timer = setTimeout(onDone, holdMs + FADE_MS);
		return () => {
			clearTimeout(timer);
		};
	}, [holdMs, onDone]);
	const [left, setLeft] = useState(null);
	useLayoutEffect(() => {
		if (anchor == null) return;
		const measure = () => {
			const rect = anchor.getBoundingClientRect();
			setLeft(rect.left + rect.width / 2);
		};
		measure();
		window.addEventListener("resize", measure);
		return () => {
			window.removeEventListener("resize", measure);
		};
	}, [anchor]);
	return createPortal(jsxs("div", {
		className: css$16.toast,
		role: "alert",
		style: {
			...left === null ? {} : { left },
			"--dsh-toast-hold": `${String(holdMs)}ms`
		},
		children: [icon !== void 0 && jsx("span", {
			className: css$16.icon,
			"aria-hidden": true,
			children: icon
		}), jsx("span", {
			className: css$16.text,
			children: text
		})]
	}), document.body);
}
//#endregion
//#region lib/types/file-size.js
/** Compact human-readable byte counts shared by attachment presenters. @module @deepseek-ai/dsh-client-ui-primitives/file-size */
/**
* Byte count as compact user-facing size text (`312B`, `4.2KB`, `1.5MB`, `2.4GB`).
* @param bytes - exact byte count.
* @returns whole-unit text with one decimal below ten of the chosen unit.
*/
function fileSizeText(bytes) {
	if (bytes < 1024) return `${bytes}B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)}KB`;
	const mb = kb / 1024;
	if (mb < 1024) return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)}MB`;
	const gb = mb / 1024;
	return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)}GB`;
}
//#endregion
//#region lib/types/relative-time.js
/**
* Compact relative-time bucketing shared by every surface that dates a
* session. Bucketing is here so two surfaces naming the same session agree;
* the words stay in each plugin's own dictionary, per locale-owned copy.
*
* @module @deepseek-ai/dsh-client-ui-primitives/relative-time
*/
/**
* Compact relative time, as a structured bucket the renderer localizes
* ("now"/"5min"/"3h"/"2d"/"4mo"/"1y" in en).
* @param at - epoch ms of the dated moment.
* @param now - current epoch ms (injected for pure rendering).
* @returns the row's trailing time bucket and magnitude.
*/
function relativeTime(at, now) {
	const MIN = 6e4;
	const HOUR = 36e5;
	const DAY = 864e5;
	const diff = Math.max(0, now - at);
	if (diff < MIN) return {
		unit: "now",
		n: 0
	};
	if (diff < HOUR) return {
		unit: "minutes",
		n: Math.floor(diff / MIN)
	};
	if (diff < DAY) return {
		unit: "hours",
		n: Math.floor(diff / HOUR)
	};
	if (diff < 30 * DAY) return {
		unit: "days",
		n: Math.floor(diff / DAY)
	};
	if (diff < 365 * DAY) return {
		unit: "months",
		n: Math.floor(diff / (30 * DAY))
	};
	return {
		unit: "years",
		n: Math.floor(diff / (365 * DAY))
	};
}
//#endregion
//#region lib/types/rank-by-name.js
/**
* Shared ranking for `/` menu candidates: the query must be a
* case-insensitive ordered subsequence of the candidate name. Prefix hits
* rank first, then the strongest alignment score, then the source order of
* the input. Decision record:
* .agents/notes/archived/feature/2026-08-04-web-slash-command-fuzzy-discovery.md
*/
/** Extra weight for name starts and separator boundaries. */
function boundaryBonus(name, index) {
	return index === 0 || name.charAt(index - 1) === "-" || name.charAt(index - 1) === "_" ? 8 : 0;
}
/**
* Score the strongest ordered-subsequence alignment in O(name × query).
* Boundary and adjacent matches earn weight; skipped and leading characters
* cost weight. Undefined when the query is not a subsequence of the name.
*/
function alignmentScore(name, query) {
	if (query.length > name.length) return void 0;
	const noMatch = Number.NEGATIVE_INFINITY;
	let previous = Array(name.length).fill(noMatch);
	for (let index = 0; index < name.length; index++) if (name.charAt(index) === query.charAt(0)) previous[index] = 1 + boundaryBonus(name, index) - index;
	for (let queryIndex = 1; queryIndex < query.length; queryIndex++) {
		const current = Array(name.length).fill(noMatch);
		let left = noMatch;
		let leftLeft = noMatch;
		let bestGapped = noMatch;
		for (const [index, prior] of previous.entries()) {
			if (leftLeft !== noMatch) bestGapped = Math.max(bestGapped, leftLeft + index - 2);
			if (name.charAt(index) === query.charAt(queryIndex)) {
				const bonus = 1 + boundaryBonus(name, index);
				let score = noMatch;
				if (left !== noMatch) score = left + bonus + 4;
				if (bestGapped !== noMatch) score = Math.max(score, bestGapped + bonus + 1 - index);
				current[index] = score;
			}
			leftLeft = left;
			left = prior;
		}
		previous = current;
	}
	let best = noMatch;
	for (const score of previous) best = Math.max(best, score);
	return best === noMatch ? void 0 : best;
}
/**
* Rank named items by a menu query.
* @param items - candidates in source order (a host catalog, then client contributions).
* @param rawQuery - the text typed after the trigger, matched case-insensitively.
* @returns the matching items: prefix hits first, then by alignment score,
* then in source order. The input list itself for an empty query.
*/
function rankByName(items, rawQuery) {
	const query = rawQuery.toLowerCase();
	if (query === "") return items;
	const ranked = [];
	items.forEach((item, index) => {
		const name = item.name.toLowerCase();
		const score = alignmentScore(name, query);
		if (score !== void 0) ranked.push({
			item,
			index,
			prefix: name.startsWith(query),
			score
		});
	});
	ranked.sort((left, right) => Number(right.prefix) - Number(left.prefix) || right.score - left.score || left.index - right.index);
	return ranked.map((match) => match.item);
}
//#endregion
//#region lib/types/JsonTree.js
const OBJECT_PREVIEW_LIMIT = 4;
const ARRAY_PREVIEW_LIMIT = 5;
const PREVIEW_DEPTH_LIMIT = 2;
function valueCopyMenuItems(labels) {
	return [
		{
			id: "value",
			label: labels.copyValue
		},
		{
			id: "json",
			label: labels.copyJson
		},
		{
			id: "path",
			label: labels.copyPath
		}
	];
}
function objectCopyMenuItems(labels) {
	return [
		{
			id: "prettyJson",
			label: labels.copyPrettyJson
		},
		{
			id: "json",
			label: labels.copyCompactJson
		},
		{
			id: "path",
			label: labels.copyPath
		}
	];
}
function isExpandableValue(value) {
	return typeof value === "object" && value !== null && !(value instanceof Date);
}
function entriesOf(value) {
	if (Array.isArray(value)) return value.map((item, index) => [String(index), item]);
	return Object.keys(value).map((key) => [key, value[key]]);
}
function bracketOf(value) {
	return Array.isArray(value) ? ["[", "]"] : ["{", "}"];
}
function previewPrimitive(value) {
	if (value === null) return jsx("span", {
		className: css$17.keywordValue,
		children: "null"
	});
	if (typeof value === "string") return jsx("span", {
		className: css$17.stringValue,
		children: JSON.stringify(value)
	});
	if (typeof value === "number") return jsx("span", {
		className: css$17.numberValue,
		children: String(value)
	});
	if (typeof value === "boolean") return jsx("span", {
		className: css$17.keywordValue,
		children: String(value)
	});
	if (typeof value === "bigint") return jsx("span", {
		className: css$17.otherValue,
		children: value.toString()
	});
	if (typeof value === "undefined") return jsx("span", {
		className: css$17.otherValue,
		children: "undefined"
	});
	if (typeof value === "symbol") return jsx("span", {
		className: css$17.otherValue,
		children: value.description ?? "Symbol"
	});
	if (typeof value === "function") return jsx("span", {
		className: css$17.otherValue,
		children: value.name || "Function"
	});
	return null;
}
function previewValue(value, depth) {
	if (!isExpandableValue(value)) return previewPrimitive(value);
	const array = Array.isArray(value);
	const entries = entriesOf(value);
	const limit = array ? ARRAY_PREVIEW_LIMIT : OBJECT_PREVIEW_LIMIT;
	const visible = entries.slice(0, limit);
	const [open, close] = bracketOf(value);
	return jsxs(Fragment, { children: [
		jsx("span", {
			className: css$17.punctuation,
			children: open
		}),
		depth >= PREVIEW_DEPTH_LIMIT ? jsx("span", {
			className: css$17.previewEllipsis,
			children: "…"
		}) : visible.map(([key, item], index) => jsxs("span", { children: [
			index > 0 && jsx("span", {
				className: css$17.punctuation,
				children: ", "
			}),
			!array && jsxs(Fragment, { children: [jsx("span", {
				className: css$17.previewProperty,
				children: key
			}), jsx("span", {
				className: css$17.punctuation,
				children: ": "
			})] }),
			previewValue(item, depth + 1)
		] }, key)),
		depth < PREVIEW_DEPTH_LIMIT && entries.length > limit && jsx("span", {
			className: css$17.previewEllipsis,
			children: ", …"
		}),
		jsx("span", {
			className: css$17.punctuation,
			children: close
		})
	] });
}
function primitiveValue(value) {
	if (value === null) return jsx("span", {
		className: css$17.keywordValue,
		children: "null"
	});
	if (typeof value === "string") return jsx("span", {
		className: css$17.stringValue,
		children: JSON.stringify(value)
	});
	if (typeof value === "boolean") return jsx("span", {
		className: css$17.keywordValue,
		children: String(value)
	});
	if (typeof value === "number") return jsx("span", {
		className: css$17.numberValue,
		children: String(value)
	});
	if (typeof value === "bigint") return jsx("span", {
		className: css$17.numberValue,
		children: `${value.toString()}n`
	});
	if (value instanceof Date) return jsx("span", {
		className: css$17.otherValue,
		children: value.toISOString()
	});
	if (typeof value === "function") return jsxs("span", {
		className: css$17.otherValue,
		children: ["function() ", "{ }"]
	});
	if (typeof value === "undefined") return jsx("span", {
		className: css$17.otherValue,
		children: "undefined"
	});
	return jsx("span", {
		className: css$17.otherValue,
		children: value.toString()
	});
}
function fieldText(field) {
	return field === "" ? "\"\"" : field;
}
function pathId(path) {
	return path.map((part) => typeof part === "number" ? `n${String(part)}` : `s${String(part.length)}:${part}`).join("/");
}
function claimFocus(button) {
	button.focus();
}
function moveFocus(button, direction) {
	const tree = button.closest("[role=\"tree\"]");
	/* v8 ignore next -- JsonTree attaches expander handlers only beneath its owning role=tree. */
	if (tree === null) return;
	const expanders = Array.from(tree.querySelectorAll("[data-json-expander]"));
	const current = expanders.indexOf(button);
	/* v8 ignore next -- the current expander is a member of the queried non-empty set. */
	if (current < 0 || expanders.length === 0) return;
	const nextExpander = expanders[(current + direction + expanders.length) % expanders.length];
	/* v8 ignore next -- modulo over the non-empty expander set always resolves a member. */
	if (nextExpander !== void 0) claimFocus(nextExpander);
}
function NodeField({ field, expandable, onToggle }) {
	if (field === void 0) return null;
	return jsxs("span", {
		className: clsx(css$17.label, expandable && css$17.clickableLabel),
		onClick: expandable ? onToggle : void 0,
		children: [fieldText(field), ":"]
	});
}
function JsonTreeNode({ field, initialExpanded, labels, lastElement, onClaimTabStop, onRowHover, path, tabStopId, value }) {
	const contentsId = useId();
	const expanderRef = useRef(null);
	const [expanded, setExpanded] = useState(initialExpanded);
	const nodeId = pathId(path);
	const container = isExpandableValue(value);
	const entries = container ? entriesOf(value) : [];
	const expandable = entries.length > 0;
	const toggle = () => {
		setExpanded((current) => !current);
		claimFocus(expanderRef.current);
	};
	const onExpanderKeyDown = (event) => {
		if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
			event.preventDefault();
			setExpanded(event.key === "ArrowRight");
			return;
		}
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			moveFocus(event.currentTarget, event.key === "ArrowUp" ? -1 : 1);
		}
	};
	const row = (children, ariaExpanded) => jsx("div", {
		className: css$17.row,
		role: "treeitem",
		"aria-expanded": ariaExpanded,
		onMouseOver: (event) => {
			event.stopPropagation();
			onRowHover(event.currentTarget, {
				path,
				value
			});
		},
		children
	});
	if (!container) return row(jsxs(Fragment, { children: [
		jsx(NodeField, {
			field,
			expandable: false,
			onToggle: toggle
		}),
		primitiveValue(value),
		!lastElement && jsx("span", {
			className: css$17.punctuation,
			children: ","
		})
	] }));
	const [open, close] = bracketOf(value);
	if (!expandable) return row(jsxs(Fragment, { children: [
		jsx(NodeField, {
			field,
			expandable: false,
			onToggle: toggle
		}),
		jsx("span", {
			className: css$17.punctuation,
			children: open
		}),
		jsx("span", {
			className: css$17.punctuation,
			children: close
		}),
		!lastElement && jsx("span", {
			className: css$17.punctuation,
			children: ","
		})
	] }));
	return row(jsxs(Fragment, { children: [
		jsx("span", {
			ref: expanderRef,
			className: clsx(css$17.expander, expanded ? css$17.collapseIcon : css$17.expandIcon),
			"data-json-expander": true,
			role: "button",
			"aria-label": expanded ? labels.collapseNode : labels.expandNode,
			"aria-expanded": expanded,
			"aria-controls": expanded ? contentsId : void 0,
			tabIndex: tabStopId === nodeId ? 0 : -1,
			onFocus: () => {
				onClaimTabStop(nodeId);
			},
			onClick: toggle,
			onKeyDown: onExpanderKeyDown
		}),
		jsx(NodeField, {
			field,
			expandable: true,
			onToggle: toggle
		}),
		jsx("span", {
			className: css$17.preview,
			children: previewValue(value, 0)
		}),
		!lastElement && jsx("span", {
			className: css$17.punctuation,
			children: ","
		}),
		expanded && jsx("ul", {
			id: contentsId,
			role: "group",
			className: css$17.children,
			children: entries.map(([key, item], index) => jsx(JsonTreeNode, {
				field: key,
				value: item,
				path: [...path, Array.isArray(value) ? index : key],
				labels,
				lastElement: index === entries.length - 1,
				initialExpanded: false,
				tabStopId,
				onClaimTabStop,
				onRowHover
			}, key))
		})
	] }), expanded);
}
function formattedPath(path) {
	return path.reduce((result, part) => {
		if (typeof part === "number") return `${result}[${String(part)}]`;
		return /^[A-Za-z_$][\w$]*$/.test(part) ? `${result}.${part}` : `${result}[${JSON.stringify(part)}]`;
	}, "$");
}
function copyText$2(target, mode) {
	if (mode === "path") return formattedPath(target.path);
	if (mode === "prettyJson") return JSON.stringify(target.value, null, 2);
	if (mode === "json") return JSON.stringify(target.value);
	if (typeof target.value === "string") return target.value;
	if (typeof target.value === "undefined") return "undefined";
	if (typeof target.value === "bigint") return target.value.toString();
	if (typeof target.value === "symbol") return target.value.description ?? "Symbol";
	if (typeof target.value === "function") return target.value.name || "Function";
	return JSON.stringify(target.value);
}
/**
* Render parsed JSON as a compact, keyboard-accessible inspector tree.
* @param props - Parsed data, accessible label, and display options.
* @returns A read-only JSON tree with an optionally fixed-open top level.
*/
function JsonTree({ data, label, className, copyable = true, expandTopLevel = true, labels }) {
	const rootEntries = entriesOf(data);
	const firstExpandableIndex = rootEntries.findIndex(([, value]) => isExpandableValue(value) && entriesOf(value).length > 0);
	const firstExpandableEntry = rootEntries[firstExpandableIndex];
	const initialTabStopId = expandTopLevel ? firstExpandableEntry === void 0 ? null : pathId([Array.isArray(data) ? firstExpandableIndex : firstExpandableEntry[0]]) : isExpandableValue(data) && rootEntries.length > 0 ? pathId([]) : null;
	const rootRef = useRef(null);
	const activeRowRef = useRef();
	const copyButtonRef = useRef(null);
	const copyMenuOpenRef = useRef(false);
	const resetTimer = useRef();
	const [copyTarget, setCopyTarget] = useState();
	const [copyState, setCopyState] = useState("idle");
	const [copyMenuOpen, setCopyMenuOpen] = useState(false);
	const [tabStopId, setTabStopId] = useState(initialTabStopId);
	const setActiveRow = (row) => {
		activeRowRef.current?.removeAttribute("data-json-copy-active");
		activeRowRef.current = row;
		row?.setAttribute("data-json-copy-active", "");
	};
	const clearCopyTarget = () => {
		setActiveRow(void 0);
		setCopyTarget(void 0);
		setCopyState("idle");
		copyMenuOpenRef.current = false;
		setCopyMenuOpen(false);
	};
	const copyPosition = (row) => {
		const root = rootRef.current;
		/* v8 ignore next -- row events and viewport listeners run only after the root ref mounts. */
		if (root === null) throw new Error("JsonTree root is not mounted");
		const rootRect = root.getBoundingClientRect();
		const rowRect = row.getBoundingClientRect();
		return {
			left: rootRect.left + root.clientWidth - 26,
			side: rowRect.top - rootRect.top > root.clientHeight / 2 ? "top" : "bottom",
			top: rowRect.top
		};
	};
	const positionCopyButton = (row, target) => {
		const position = copyPosition(row);
		setCopyTarget({
			...target,
			...position
		});
	};
	const repositionCopyButton = (row) => {
		const position = copyPosition(row);
		setCopyTarget((current) => {
			/* v8 ignore next -- an active row and its copy target are installed together. */
			if (current === void 0) return current;
			return {
				...current,
				...position
			};
		});
	};
	useEffect(() => () => {
		if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
		activeRowRef.current?.removeAttribute("data-json-copy-active");
	}, []);
	useEffect(() => {
		activeRowRef.current?.removeAttribute("data-json-copy-active");
		activeRowRef.current = void 0;
		copyMenuOpenRef.current = false;
		setCopyTarget(void 0);
		setCopyState("idle");
		setCopyMenuOpen(false);
		setTabStopId(initialTabStopId);
	}, [
		data,
		expandTopLevel,
		initialTabStopId
	]);
	useEffect(() => {
		const reposition = () => {
			const row = activeRowRef.current;
			if (row !== void 0) repositionCopyButton(row);
		};
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, []);
	const handleRowHover = (row, target) => {
		if (!copyable || copyMenuOpenRef.current) return;
		if (activeRowRef.current === row) return;
		setActiveRow(row);
		setCopyState("idle");
		copyMenuOpenRef.current = false;
		setCopyMenuOpen(false);
		positionCopyButton(row, target);
	};
	const handleRootMouseOver = (event) => {
		if (!copyable || copyMenuOpenRef.current) return;
		/* v8 ignore next -- browser mouse events delivered through React target an Element. */
		if (!(event.target instanceof Element)) return;
		if (event.target.closest("[data-json-copy-button]") === null) clearCopyTarget();
	};
	const handleScroll = (_event) => {
		const row = activeRowRef.current;
		if (row !== void 0) repositionCopyButton(row);
	};
	const copy = async (mode) => {
		/* v8 ignore next -- copy controls only render while their target exists. */
		if (copyTarget === void 0) return;
		try {
			await navigator.clipboard.writeText(copyText$2(copyTarget, mode));
			setCopyState("copied");
		} catch {
			setCopyState("failed");
		}
		if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
		resetTimer.current = setTimeout(() => {
			setCopyState("idle");
		}, 1500);
	};
	const [rootOpen, rootClose] = bracketOf(data);
	const copyTargetIsObject = typeof copyTarget?.value === "object" && copyTarget.value !== null;
	const defaultCopyMode = copyTargetIsObject ? "prettyJson" : "value";
	const copyTitle = copyState === "copied" ? labels.copied : copyState === "failed" ? labels.copyFailed : copyTargetIsObject ? labels.copyPrettyJson : labels.copyValue;
	return jsxs("div", {
		ref: rootRef,
		className: clsx(css$17.root, className),
		onMouseOver: handleRootMouseOver,
		onMouseLeave: () => {
			if (!copyMenuOpenRef.current) clearCopyTarget();
		},
		onScroll: handleScroll,
		children: [expandTopLevel ? jsxs("div", {
			className: css$17.expandedTopLevel,
			children: [
				jsx("div", {
					className: clsx(css$17.row, css$17.topLevelBracket),
					"data-json-root-row": true,
					onMouseOver: (event) => {
						event.stopPropagation();
						handleRowHover(event.currentTarget, {
							path: [],
							value: data
						});
					},
					children: jsx("span", {
						className: css$17.punctuation,
						children: rootOpen
					})
				}),
				jsx("div", {
					"aria-label": label,
					className: clsx(css$17.container, css$17.expandedTopLevelContainer),
					role: "tree",
					children: rootEntries.map(([key, value], index) => jsx(JsonTreeNode, {
						field: key,
						value,
						path: [Array.isArray(data) ? index : key],
						labels,
						lastElement: index === rootEntries.length - 1,
						initialExpanded: false,
						tabStopId,
						onClaimTabStop: setTabStopId,
						onRowHover: handleRowHover
					}, key))
				}),
				jsx("div", {
					className: clsx(css$17.row, css$17.topLevelBracket),
					children: jsx("span", {
						className: css$17.punctuation,
						children: rootClose
					})
				})
			]
		}) : jsx("div", {
			"aria-label": label,
			className: css$17.container,
			role: "tree",
			children: jsx(JsonTreeNode, {
				value: data,
				path: [],
				labels,
				lastElement: true,
				initialExpanded: true,
				tabStopId,
				onClaimTabStop: setTabStopId,
				onRowHover: handleRowHover
			})
		}), copyTarget !== void 0 && jsx("span", {
			className: css$17.copyAnchor,
			style: {
				left: copyTarget.left,
				top: copyTarget.top
			},
			children: jsx(Menu, {
				open: copyMenuOpen,
				compact: true,
				portal: true,
				align: "end",
				side: copyTarget.side,
				anchor: jsx("button", {
					ref: copyButtonRef,
					type: "button",
					className: css$17.copyButton,
					"data-json-copy-button": true,
					"data-state": copyState,
					"aria-label": copyTitle,
					title: labels.copyButtonTitle(copyTitle),
					onClick: () => void copy(defaultCopyMode),
					onContextMenu: (event) => {
						event.preventDefault();
						event.stopPropagation();
						copyMenuOpenRef.current = true;
						setCopyMenuOpen(true);
					},
					children: copyState === "copied" ? jsx(IconCheckOutline16, { size: 12 }) : jsx(IconCopyOutline16, { size: 12 })
				}),
				items: copyTargetIsObject ? objectCopyMenuItems(labels) : valueCopyMenuItems(labels),
				onSelect: (id) => {
					copy(id);
					copyMenuOpenRef.current = false;
					setCopyMenuOpen(false);
				},
				onClose: clearCopyTarget,
				getAnchorRect: () => copyButtonRef.current.getBoundingClientRect()
			})
		})]
	});
}
//#endregion
//#region lib/types/ansi.js
/**
* The 8/16 basic ANSI colors, keyed by the whitespace-free `r,g,b` triple
* anser emits for them, mapped onto the theme tokens that carry the same
* semantic. Black and white both resolve to the primary label color so text
* stays legible under either theme instead of matching the surface it sits
* on; bright black takes the tertiary label color (the muted-gray role).
* Magenta and cyan have no token equivalent in this design system and fall
* through to anser's literal rgb, as do all 256-palette and truecolor values.
*/
const TOKEN_BY_BASIC_RGB = {
	"0,0,0": "var(--dsw-alias-label-primary)",
	"255,255,255": "var(--dsw-alias-label-primary)",
	"85,85,85": "var(--dsw-alias-label-tertiary)",
	"187,0,0": "var(--dsw-alias-state-error-primary)",
	"255,85,85": "var(--dsw-alias-state-error-secondary)",
	"0,187,0": "var(--dsw-alias-state-success-primary)",
	"0,255,0": "var(--dsw-alias-state-success-secondary)",
	"187,187,0": "var(--dsw-alias-state-warn-primary)",
	"255,255,85": "var(--dsw-alias-state-warn-secondary)",
	"0,0,187": "var(--dsw-alias-state-business-primary)",
	"85,85,255": "var(--dsw-static-blue-400)"
};
/**
* CSS for each SGR attribute anser reports. `blink` is deliberately absent —
* animated text is not reproduced. `reverse` never arrives here: anser
* consumes it by swapping the run's foreground and background. Underline and
* strikethrough share `textDecoration`, so in a run declaring both, the
* later declaration wins.
*/
const STYLE_BY_DECORATION = {
	bold: { fontWeight: 700 },
	dim: { opacity: .7 },
	italic: { fontStyle: "italic" },
	underline: { textDecoration: "underline" },
	strikethrough: { textDecoration: "line-through" },
	hidden: { visibility: "hidden" }
};
/** OSC strings (window title, hyperlinks), with or without their terminator. */
const OSC_SEQUENCE = /\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)?/g;
/** Escape sequences other than CSI: charset selection, single-shift, reset. */
const NON_CSI_ESCAPE = /\u001b(?!\[)[\u0020-\u002f]*[\u0030-\u007e]?/g;
/**
* C0 controls with no display meaning here. Tab, newline, backspace and ESC
* survive: the first two for layout, backspace for the cursor replay, ESC
* for anser's CSI split.
*/
const INERT_CONTROL = /[\u0000-\u0007\u000b-\u001a\u001c-\u001f\u007f]/g;
/**
* Lines whose cursor movements have to be replayed: a carriage return, a
* backspace, or an erase-in-line. The erase pattern matches the SAME CSI shape
* `replayLine` parses (parameters may carry `;` and intermediate bytes), so a
* form like `\x1b[1;2K` cannot slip past this guard and skip its own erase.
*/
const NEEDS_REPLAY = /\r|\u0008|\u001b\[[\u0030-\u003f]*[\u0020-\u002f]*K/;
/** SGR sequences alone, for folding state through a line that needs no replay. */
const SGR_SEQUENCE = /\u001b\[([\u0030-\u003f]*)[\u0020-\u002f]*m/g;
/** Terminal tab stop width; a tab advances to the next multiple of this. */
const TAB_WIDTH = 8;
/**
* Combining marks and other zero-width code points: a terminal advances no
* column for them, so `e` + U+0301 occupies one cell and a two-column redraw
* covers both code points.
*/
const ZERO_WIDTH = /^[\p{Mn}\p{Me}\p{Cf}\u200b-\u200f\u2060]$/u;
/**
* Characters a terminal advances two columns for: CJK scripts, fullwidth forms,
* CJK punctuation, and characters with emoji presentation. Text-presentation
* symbols (`\u2713`, `\u26a0` and the rest of U+2600-U+27BF) are ONE column and
* must stay out of this set.
*/
const WIDE_CHAR = /* @__PURE__ */ new RegExp("\\p{Script=Han}|\\p{Script=Hiragana}|\\p{Script=Katakana}|\\p{Script=Hangul}|\\p{Emoji_Presentation}|[\\uff01-\\uff60\\u3000-\\u303e]", "u");
/**
* Whether a character occupies two terminal columns (CJK, fullwidth forms,
* emoji). Covers the ranges a command's output realistically carries; a
* narrower guess would misalign the columns this card exists to preserve.
* @param char - one character from the output.
* @returns true when the terminal advances two columns for it.
*/
function isWide(char) {
	const code = char.codePointAt(0);
	if (code === void 0 || code < 4352) return false;
	return WIDE_CHAR.test(char);
}
/** The default state: no color, no attributes. */
const SGR_NONE = {
	fg: "",
	bg: "",
	attrs: []
};
/** Attribute closers, mapped to the opener parameters each one turns off. */
const ATTR_CLOSERS = {
	22: ["1", "2"],
	23: ["3"],
	24: ["4"],
	25: ["5", "6"],
	27: ["7"],
	28: ["8"],
	29: ["9"]
};
/**
* Fold one SGR sequence's parameters into the state it produces.
* @param state - state in force before the sequence.
* @param params - the sequence's raw parameter string (`31`, `1;4`, `38;5;208`).
* @returns the state the sequence leaves in force.
*/
function foldSgr(state, params) {
	const codes = params === "" ? ["0"] : params.split(";");
	let next = state;
	for (let index = 0; index < codes.length; index++) {
		const code = String(codes[index]);
		if (code === "" || code === "0") {
			next = SGR_NONE;
			continue;
		}
		if (code === "38" || code === "48") {
			const kind = codes[index + 1] ?? "";
			const span = kind === "2" ? 4 : kind === "5" ? 2 : 0;
			const value = codes.slice(index, index + span + 1).join(";");
			next = code === "38" ? {
				...next,
				fg: value
			} : {
				...next,
				bg: value
			};
			index += span;
			continue;
		}
		const closes = ATTR_CLOSERS[code];
		if (closes !== void 0) {
			next = {
				...next,
				attrs: next.attrs.filter((attr) => !closes.includes(attr))
			};
			continue;
		}
		const numeric = Number(code);
		if (code === "39") {
			next = {
				...next,
				fg: ""
			};
			continue;
		}
		if (code === "49") {
			next = {
				...next,
				bg: ""
			};
			continue;
		}
		if (numeric >= 30 && numeric <= 37 || numeric >= 90 && numeric <= 97) {
			next = {
				...next,
				fg: code
			};
			continue;
		}
		if (numeric >= 40 && numeric <= 47 || numeric >= 100 && numeric <= 107) {
			next = {
				...next,
				bg: code
			};
			continue;
		}
		if (!next.attrs.includes(code)) next = {
			...next,
			attrs: [...next.attrs, code]
		};
	}
	return next;
}
/**
* Render a state as the one canonical sequence that establishes it from the
* default, so a boundary emits a bounded string no matter how the state was
* reached.
* @param state - the state to open.
* @returns the SGR sequence, or the empty string for the default state.
*/
function openSgr(state) {
	const codes = [...state.attrs];
	if (state.fg !== "") codes.push(state.fg);
	if (state.bg !== "") codes.push(state.bg);
	return codes.length === 0 ? "" : `\u001b[${codes.join(";")}m`;
}
/** Whether two states are the same, so a boundary is only emitted on a change. */
function sameSgr(a, b) {
	return a.fg === b.fg && a.bg === b.bg && a.attrs.length === b.attrs.length && a.attrs.every((attr, index) => attr === b.attrs[index]);
}
/**
* Replay one line's cursor movements the way a terminal paints it, into a
* column buffer. Carriage return and backspace only MOVE the cursor — neither
* erases anything — so what a reader sees is whatever each column last had
* written to it. That distinction is the whole point of doing this as a buffer
* rather than as string surgery: `100%\rOK` shows `OK0%` because the redraw is
* shorter than the frame beneath it, and a trailing `abc\b` still shows `abc`
* because nothing ever overwrote the `c`.
*
* A CSI sequence occupies no column; it changes the state that the NEXT writes
* are stamped with, which is how a terminal stores color per cell. `red bad`
* then three backspaces then `ok` therefore shows `okd` with the `d` still red:
* `ok` overwrote two cells and the third kept the state it was written with.
* The columns are re-emitted as runs, so anser sees that same styling.
* @param line - one output line, still carrying its CSI sequences.
* @param entrySgr - SGR state in force when the line begins, since a newline
*   does not reset it.
* @returns the line as the terminal would have it after every movement, plus the
*   SGR state at its end for the next line to enter with.
*/
function replayLine(line, entrySgr) {
	const csi = /\u001b\[([\u0030-\u003f]*)[\u0020-\u002f]*([\u0040-\u007e])/g;
	/** Per column: the state in force when it was written, and its character. */
	const columns = [];
	let cursor = 0;
	let sgr = entrySgr;
	let at = 0;
	/** Clear a cell and, for a wide pair, its partner: a terminal erases both. */
	const clear = (index, fill) => {
		const cell = columns[index];
		if (cell?.spacer === true && index > 0) columns[index - 1] = {
			sgr,
			char: fill
		};
		else if (cell !== void 0 && isWide(cell.char) && columns[index + 1]?.spacer === true) columns[index + 1] = {
			sgr,
			char: fill
		};
		columns[index] = {
			sgr,
			char: fill
		};
	};
	const consume = (chunk) => {
		for (const char of chunk) {
			if (char === "\r") {
				cursor = 0;
				continue;
			}
			if (char === "\b") {
				cursor = Math.max(0, cursor - 1);
				continue;
			}
			if (char === "	") {
				const stop = cursor + TAB_WIDTH - cursor % TAB_WIDTH;
				for (; cursor < stop; cursor++) columns[cursor] ??= {
					sgr,
					char: " "
				};
				continue;
			}
			if (ZERO_WIDTH.test(char)) {
				const base = cursor > 0 ? columns[cursor - 1] : void 0;
				if (base !== void 0) columns[cursor - 1] = {
					sgr: base.sgr,
					char: base.char + char
				};
				continue;
			}
			clear(cursor, " ");
			columns[cursor] = {
				sgr,
				char
			};
			cursor++;
			if (isWide(char)) {
				columns[cursor] = {
					sgr,
					char: "",
					spacer: true
				};
				cursor++;
			}
		}
	};
	for (const match of line.matchAll(csi)) {
		consume(line.slice(at, match.index));
		at = match.index + match[0].length;
		const params = String(match[1]);
		const final = String(match[2]);
		if (final === "K") {
			const mode = String(params.split(";")[0]);
			if (mode === "1") for (let index = 0; index <= cursor; index++) clear(index, " ");
			else columns.length = mode === "2" ? 0 : cursor;
			continue;
		}
		if (final !== "m") continue;
		sgr = foldSgr(sgr, params);
	}
	consume(line.slice(at));
	let out = "";
	let active = entrySgr;
	for (let index = 0; index < columns.length; index++) {
		const column = columns[index] ?? {
			sgr: SGR_NONE,
			char: " "
		};
		if (!sameSgr(column.sgr, active)) {
			if (!sameSgr(active, SGR_NONE)) out += "\x1B[0m";
			out += openSgr(column.sgr);
			active = column.sgr;
		}
		const leadIntact = index > 0 && isWide(columns[index - 1]?.char ?? "");
		out += column.spacer === true && !leadIntact ? " " : column.char;
	}
	if (!sameSgr(active, sgr)) {
		if (!sameSgr(active, SGR_NONE)) out += "\x1B[0m";
		out += openSgr(sgr);
	}
	return {
		text: out,
		sgr
	};
}
/**
* Replay every line's cursor movements. A `\r` that only terminates a CRLF line
* is dropped first, so those lines keep their text instead of being redrawn onto
* themselves. SGR state threads across lines: a newline does not reset it, so a
* run opened before a redraw still colors the lines after it.
* @param text - output text, already free of OSC and non-CSI escapes.
* @returns the text with each line painted as the terminal would.
*/
function applyCursorMovements(text) {
	const replayed = [];
	let sgr = SGR_NONE;
	for (const raw of text.split("\n")) {
		const line = raw.replace(/\r+$/, "");
		if (NEEDS_REPLAY.test(line)) {
			const result = replayLine(line, sgr);
			replayed.push(result.text);
			sgr = result.sgr;
			continue;
		}
		replayed.push(line);
		for (const match of line.matchAll(SGR_SEQUENCE)) sgr = foldSgr(sgr, String(match[1]));
	}
	return replayed.join("\n");
}
/**
* Remove every escape sequence and control character that carries no color,
* leaving CSI sequences for anser and `\n`/`\t` for layout. Cursor movements
* (carriage return, backspace) replay first, since their effect on the visible
* text must land before the characters that expressed them are dropped.
* @param text - raw command output.
* @returns text whose only remaining escapes are CSI sequences.
*/
function sanitize(text) {
	return applyCursorMovements(text.replace(OSC_SEQUENCE, "").replace(NON_CSI_ESCAPE, "")).replace(INERT_CONTROL, "");
}
/**
* Resolve one run's colors and decorations.
* @param chunk - the anser chunk to style.
* @returns the run's inline style, or undefined when it carries no SGR state.
*/
function resolveStyle(chunk) {
	const style = {};
	const background = chunk.bg === null ? void 0 : `rgb(${chunk.bg})`;
	if (background !== void 0) style.backgroundColor = background;
	if (chunk.fg !== null) {
		const literal = `rgb(${chunk.fg})`;
		style.color = background === void 0 ? TOKEN_BY_BASIC_RGB[chunk.fg.replace(/\s+/g, "")] ?? literal : literal;
	}
	for (const decoration of chunk.decorations) Object.assign(style, STYLE_BY_DECORATION[decoration]);
	return Object.keys(style).length === 0 ? void 0 : style;
}
/**
* Parse command output into styled spans grouped by line.
* @param text - raw output text, which may contain ANSI escape sequences.
* @returns one entry per output line (always at least one, possibly empty).
*/
function parseAnsiLines(text) {
	let current = [];
	const lines = [current];
	for (const chunk of Anser.ansiToJson(sanitize(text), {
		json: true,
		remove_empty: true
	})) {
		const style = resolveStyle(chunk);
		for (const [index, part] of chunk.content.split("\n").entries()) {
			if (index > 0) {
				current = [];
				lines.push(current);
			}
			if (part !== "") current.push({
				text: part,
				style
			});
		}
	}
	return lines;
}
//#endregion
//#region lib/types/head-tail-cap.js
/**
* Compute the head/tail cap metrics for a list of `total` rows against `maxLines`,
* given whether the surface is expanded. Pure arithmetic; the caller slices its
* own rows with `headLines`/`tailLines` so a block can layer its own concerns
* (SearchBlock restores a tail file header) on top.
* @param total - the list's row count.
* @param maxLines - the collapsed-height cap in rows.
* @param expanded - whether the surface is expanded (uncaps the list).
* @returns the split metrics.
*/
function headTailCap(total, maxLines, expanded) {
	const hidden = total - maxLines;
	const headLines = Math.ceil(maxLines / 2);
	return {
		hidden,
		capped: hidden > 0 && !expanded,
		headLines,
		tailLines: maxLines - headLines
	};
}
//#endregion
//#region lib/types/use-copy-feedback.js
/** How long the `copied` flag stays true after a successful write, in ms. */
const COPIED_FEEDBACK_MS = 1e3;
/**
* Copy `text` to the clipboard with one-second success feedback.
* @param text - the text to write on copy.
* @returns the `copied` flag and the `onCopy` handler.
*/
function useCopyFeedback(text) {
	const [copied, setCopied] = useState(false);
	return {
		copied,
		onCopy: useCallback(() => {
			if (copied) return;
			writeClipboard(text).then((ok) => {
				if (!ok) return;
				setCopied(true);
				window.setTimeout(() => {
					setCopied(false);
				}, COPIED_FEEDBACK_MS);
			});
		}, [copied, text])
	};
}
//#endregion
//#region lib/types/TerminalBlock.js
/** Output lines shown before the height cap collapses the middle. */
const DEFAULT_TERMINAL_MAX_LINES = 16;
/**
* Prompt label for a working directory: `~` for the home directory itself,
* otherwise the path's last segment (both separators accepted, trailing
* separators ignored), falling back to the path itself when it has no
* segment.
* @param cwd - the working directory path.
* @param home - absolute home directory, when the caller knows it.
* @returns the prompt label.
*/
function promptLabel(cwd, home) {
	const trimmed = cwd.replace(/[/\\]+$/, "");
	if (home !== void 0 && trimmed === home.replace(/[/\\]+$/, "")) return "~";
	const segment = trimmed.split(/[/\\]/).pop();
	return segment === void 0 || segment === "" ? cwd : segment;
}
/**
* Status pill text for a settled command, or undefined when the command
* settled cleanly (exit 0, no signal) and needs no pill — the same
* distinction the bash tool's own exit-status markers draw.
* @param exitCode - settled exit code, when known.
* @param signal - settled terminating signal name, when known.
* @param labels - display copy for the pill text.
* @returns the pill text, or undefined for a clean exit.
*/
function statusText(exitCode, signal, labels) {
	if (signal !== void 0) return labels.signal(signal);
	if (exitCode !== void 0 && exitCode !== 0) return labels.exitCode(exitCode);
}
/**
* Run-state indicator for the command, shown at the head of the prompt line so
* the card states whether the command is still running without the reader
* having to infer it from the presence of output. Three of {@link StateDotState}'s
* five states are reachable: the running chase (the same
* indicator a running tool row's leading icon uses, so the row and its card
* never disagree), green for a clean settle, red for a signal or a non-zero
* exit — the same status distinction {@link statusText} draws for the pill. A
* settled command whose exit status never reached the view counts as a clean
* settle: the view says it finished and says nothing went wrong.
* @param running - the command has not settled.
* @param exitCode - settled exit code, when known.
* @param signal - settled terminating signal name, when known.
* @param labels - display copy for the text label.
* @returns the dot's state and its text label, since the dot is aria-hidden.
*/
function runState(running, exitCode, signal, labels) {
	if (running) return {
		state: "ongoing",
		label: labels.running
	};
	if (statusText(exitCode, signal, labels) !== void 0) return {
		state: "error",
		label: labels.failed
	};
	return {
		state: "done",
		label: labels.done
	};
}
/**
* Render one parsed output line. Runs without SGR state render as bare text,
* so uncolored output carries no span wrappers.
* @param line - the line's styled runs.
* @returns the line's children.
*/
function renderLine$1(line) {
	return line.map((span, index) => span.style === void 0 ? span.text : jsx("span", {
		style: span.style,
		children: span.text
	}, index));
}
/**
* Render a shell command as a terminal surface.
* @param props - see {@link TerminalBlockProps}.
* @returns the terminal block element.
*/
function TerminalBlock({ command, cwd, home, output, exitCode, signal, running = false, maxLines = 16, className, labels }) {
	const copy = labels;
	const text = output ?? "";
	const lines = useMemo(() => {
		const parsed = parseAnsiLines(text);
		const last = parsed[parsed.length - 1];
		return parsed.length > 1 && last !== void 0 && last.every((span) => span.text === "") ? parsed.slice(0, -1) : parsed;
	}, [text]);
	const [expanded, setExpanded] = useState(false);
	const { copied, onCopy } = useCopyFeedback(text);
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const status = statusText(exitCode, signal, copy);
	const state = runState(running, exitCode, signal, copy);
	const commandLines = useMemo(() => {
		return (command.endsWith("\n") ? command.slice(0, -1) : command).split("\n");
	}, [command]);
	const empty = lines.every((line) => line.every((span) => span.text.trim() === ""));
	const { hidden, capped, headLines, tailLines } = headTailCap(lines.length, maxLines, expanded);
	return jsxs("div", {
		className: clsx(css$18.block, className),
		"data-terminal": "",
		"data-running": running ? "" : void 0,
		children: [jsxs("div", {
			className: css$18.header,
			children: [
				jsxs("div", {
					className: css$18.prompt,
					children: [jsx("span", {
						className: css$18.runStateLabel,
						children: state.label
					}), commandLines.map((line, index) => jsxs("div", {
						className: css$18.promptLine,
						children: [
							index === 0 && jsx(StateDot, {
								state: state.state,
								className: css$18.runState
							}),
							jsx("span", {
								className: css$18.cwd,
								children: index > 0 || cwd === void 0 ? "$" : promptLabel(cwd, home)
							}),
							jsx("span", {
								className: css$18.command,
								children: line
							})
						]
					}, index))]
				}),
				status !== void 0 && jsx(Pill, {
					className: css$18.status,
					children: status
				}),
				!running && !empty && jsx("button", {
					type: "button",
					className: css$18.copyButton,
					onClick: onCopy,
					children: copied ? copy.copied : copy.copy
				})
			]
		}), !running && (empty ? jsx("div", {
			className: css$18.empty,
			children: copy.noOutput
		}) : jsxs("div", {
			className: css$18.output,
			children: [
				(capped ? lines.slice(0, headLines) : lines).map((line, index) => jsx("div", {
					className: css$18.line,
					children: renderLine$1(line)
				}, index)),
				hidden > 0 && jsx("button", {
					type: "button",
					className: css$18.expand,
					"aria-expanded": expanded,
					"aria-label": expanded ? copy.collapseAria : copy.expandAria(hidden),
					onClick: onToggle,
					children: expanded ? copy.collapse : copy.expand(hidden)
				}),
				capped && lines.slice(lines.length - tailLines).map((line, index) => jsx("div", {
					className: css$18.line,
					children: renderLine$1(line)
				}, index))
			]
		}))]
	});
}
//#endregion
//#region lib/types/FoldToggle.js
/**
* Render the shared head-tail fold control with caller-owned localized copy.
* @param props - Fold state, localized labels, and toggle callback.
* @returns The accessible expand or collapse button.
*/
function FoldToggle({ className, expanded, hidden, labels, onToggle }) {
	return jsx("button", {
		type: "button",
		className,
		"aria-expanded": expanded,
		"aria-label": expanded ? labels.collapseAria : labels.expandAria(hidden),
		onClick: onToggle,
		children: expanded ? labels.collapse : labels.expand(hidden)
	});
}
//#endregion
//#region lib/types/markdown/highlight.js
/**
* The client's ONE syntax highlighter: a synchronous fine-grained shiki core
* (JavaScript regex engine — no oniguruma WASM, bundle-friendly) with an
* explicit grammar allowlist and a CSS-variables theme. Colors live in the
* theme package's token sheets as `--shiki-*` custom properties (light and
* dark blocks), never here — the repo's tokens-only styling rule.
*
* Only the three markdown-fence and `run_code` grammars (TypeScript, shell,
* JSON) load into the singleton at boot — the set every session renders. The
* read card's wider extension set (the file-extension language hints the read
* tool's `langFromPath` emits — `packages/fs/tool-fs`: python, rust, yaml,
* markup, …) is imported lazily and registered the first time such a language
* is requested, so a session that never opens a read card in one of those
* languages pays neither the ~1.6 MB of grammar modules nor their synchronous
* init. The first render of a lazy language falls back to plain text while its
* grammar loads, then {@link onGrammarLoaded} notifies subscribers to re-render
* with highlighting. An unknown or absent language falls back to plain text (no
* highlighting, still monospace) — never an error.
*/
/**
* Grammars the singleton loads at boot; each entry's own `name` is the id
* `codeToTokens`/`codeToHtml` resolve. The JS-family aliases (js/jsx/ts/tsx)
* resolve to the TypeScript grammar rather than a separate one: it tokenizes
* plain TS/JS exactly, and JSX/TSX approximately (shiki's TS grammar is not the
* dedicated TSX grammar, so JSX elements tokenize imperfectly) — an accepted
* trade to keep the boot set to one JS-family grammar. The read card's wider
* set loads lazily through {@link LAZY_GRAMMARS}.
*/
const LANGS = [
	langTs,
	langBash,
	langJson
];
/**
* The read card's extension grammars, each behind a dynamic import so its
* module stays out of the boot chunk until a read of that language renders.
* Keyed by the grammar id (`LanguageRegistration.name`) the aliases resolve to.
* `@shikijs/langs`' default export is a `LanguageRegistration[]`; the loader
* hands the whole array to `loadLanguageSync`, which registers each entry
* (including embedded sub-grammars). The three boot grammars are absent —
* already loaded, so no alias value ever points at a missing entry here.
*/
const LAZY_GRAMMARS = new Map([
	["python", () => import("@shikijs/langs/python")],
	["ruby", () => import("@shikijs/langs/ruby")],
	["go", () => import("@shikijs/langs/go")],
	["rust", () => import("@shikijs/langs/rust")],
	["java", () => import("@shikijs/langs/java")],
	["c", () => import("@shikijs/langs/c")],
	["cpp", () => import("@shikijs/langs/cpp")],
	["csharp", () => import("@shikijs/langs/csharp")],
	["kotlin", () => import("@shikijs/langs/kotlin")],
	["swift", () => import("@shikijs/langs/swift")],
	["php", () => import("@shikijs/langs/php")],
	["yaml", () => import("@shikijs/langs/yaml")],
	["toml", () => import("@shikijs/langs/toml")],
	["ini", () => import("@shikijs/langs/ini")],
	["markdown", () => import("@shikijs/langs/markdown")],
	["mdx", () => import("@shikijs/langs/mdx")],
	["html", () => import("@shikijs/langs/html")],
	["css", () => import("@shikijs/langs/css")],
	["scss", () => import("@shikijs/langs/scss")],
	["less", () => import("@shikijs/langs/less")],
	["sql", () => import("@shikijs/langs/sql")],
	["xml", () => import("@shikijs/langs/xml")],
	["lua", () => import("@shikijs/langs/lua")]
]);
/**
* Language ids (and aliases) the highlighter accepts; everything else renders
* plain. A Map, not an object: fence info strings are assistant-authored, so
* a label like `constructor` or `__proto__` must miss instead of resolving an
* inherited property and crashing the renderer inside shiki. Keys cover both
* the markdown-fence aliases `CodeBlock` uses and the file-extension hint ids
* the read tool's `langFromPath` emits, so both callers resolve the same
* grammars. The JS family maps to the TypeScript grammar (see {@link LANGS} for
* the JSX/TSX approximation). A value not in {@link LANGS} names a
* {@link LAZY_GRAMMARS} entry loaded on first use.
*/
const LANG_ALIASES = new Map([
	["typescript", "typescript"],
	["ts", "typescript"],
	["tsx", "typescript"],
	["javascript", "typescript"],
	["js", "typescript"],
	["jsx", "typescript"],
	["shellscript", "shellscript"],
	["bash", "shellscript"],
	["sh", "shellscript"],
	["shell", "shellscript"],
	["zsh", "shellscript"],
	["json", "json"],
	["jsonc", "json"],
	["py", "python"],
	["python", "python"],
	["rb", "ruby"],
	["ruby", "ruby"],
	["go", "go"],
	["rs", "rust"],
	["rust", "rust"],
	["java", "java"],
	["c", "c"],
	["cpp", "cpp"],
	["cs", "csharp"],
	["csharp", "csharp"],
	["kotlin", "kotlin"],
	["swift", "swift"],
	["php", "php"],
	["yaml", "yaml"],
	["yml", "yaml"],
	["toml", "toml"],
	["ini", "ini"],
	["md", "markdown"],
	["markdown", "markdown"],
	["mdx", "mdx"],
	["html", "html"],
	["css", "css"],
	["scss", "scss"],
	["less", "less"],
	["sql", "sql"],
	["xml", "xml"],
	["lua", "lua"]
]);
/**
* Whether a language hint can use the shared syntax highlighter.
* @param lang - Language hint from a code surface.
* @returns Whether the hint resolves to a supported grammar.
*/
function supportsHighlighting(lang) {
	return lang !== void 0 && LANG_ALIASES.has(lang.toLowerCase());
}
/** All token colors resolve through `--shiki-*` custom properties (theme package sheets). */
const cssVariablesTheme = createCssVariablesTheme({
	name: "css-variables",
	variablePrefix: "--shiki-",
	fontStyle: true
});
/**
* The client regex engine compiles each TextMate pattern when its scanner is
* created. Shiki otherwise defers patterns longer than 3,000 characters until
* their first match; that compilation counts against Shiki's 500 ms per-line
* budget and can return a partial token stream under host contention. Eager
* compilation leaves the same budget in place for scanning user content.
*/
const regexEngine = createJavaScriptRegexEngine({
	forgiving: true,
	regexConstructor: (pattern) => defaultJavaScriptRegexConstructor(pattern, { lazyCompileLength: Number.POSITIVE_INFINITY })
});
let singleton;
/** Representative paths through every boot grammar, compiled before user content is timed. */
const BOOT_GRAMMAR_WARMUPS = [
	{
		lang: "typescript",
		code: "const answer: number = 42"
	},
	{
		lang: "shellscript",
		code: "printf '%s\\n' \"$HOME\""
	},
	{
		lang: "json",
		code: "{\"ready\":true}"
	}
];
/** Construct and pre-tokenize the boot grammars outside the user-content scan budget. */
function createHighlighter() {
	const instance = createHighlighterCoreSync({
		themes: [cssVariablesTheme],
		langs: LANGS,
		engine: regexEngine
	});
	for (const sample of BOOT_GRAMMAR_WARMUPS) instance.codeToTokens(sample.code, {
		lang: sample.lang,
		theme: "css-variables",
		tokenizeTimeLimit: 0
	});
	return instance;
}
/** The synchronous highlighter (one instance per document); pre-warmed below, lazy as the fallback. */
function highlighter() {
	singleton ??= createHighlighter();
	return singleton;
}
/** Grammar ids whose lazy import is in flight or done, so it is requested once. */
const requested = /* @__PURE__ */ new Set();
/** Subscribers re-rendered after a lazy grammar registers (React callers). */
const listeners = /* @__PURE__ */ new Set();
/** Bumped on each lazy-grammar load; the `useSyncExternalStore` snapshot. */
let loadCount = 0;
/**
* Subscribe to lazy-grammar load completions; `listener` fires after a
* {@link LAZY_GRAMMARS} grammar finishes registering on the singleton, so a
* caller that rendered its plain fallback while the grammar loaded can
* re-highlight. Uses the `useSyncExternalStore` subscribe signature; pair it with
* {@link grammarLoadCount} as the snapshot. Returns an unsubscribe function.
* @param listener - invoked (no args) on each grammar-load completion.
* @returns a disposer that removes the listener.
*/
function subscribeGrammarLoaded(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
/**
* The lazy-grammar load counter — a value that changes on every load, so a
* `useSyncExternalStore` snapshot re-renders the subscriber when a grammar
* registers. Opaque: only its identity across renders matters.
* @returns the current load count.
*/
function grammarLoadCount() {
	return loadCount;
}
/**
* Ensure the grammar `resolved` names is registered. A boot grammar (not in
* {@link LAZY_GRAMMARS}) and an already-loaded lazy grammar report ready
* synchronously; a lazy grammar not yet loaded starts its import (once) and
* reports not-ready, so the caller renders plain until a
* {@link subscribeGrammarLoaded} listener fires.
* @param resolved - the grammar id an alias resolved to.
* @returns whether the grammar is registered and ready to tokenize now.
*/
function ensureGrammar(resolved) {
	const load = LAZY_GRAMMARS.get(resolved);
	if (load === void 0) return true;
	if (highlighter().getLoadedLanguages().includes(resolved)) return true;
	if (!requested.has(resolved)) {
		requested.add(resolved);
		load().then((mod) => {
			highlighter().loadLanguageSync(mod.default);
			loadCount += 1;
			for (const listener of listeners) listener();
		});
	}
	return false;
}
setTimeout(() => {
	highlighter();
}, 0).unref?.();
/**
* Highlight `code` into shiki's HTML (a single `<pre class="shiki">` tree)
* when `lang` maps to a registered grammar; `undefined` means the caller
* renders its plain fallback. A lazy grammar not yet loaded returns `undefined`
* for this call and loads in the background; subscribe with
* {@link onGrammarLoaded} to re-highlight once it registers.
* @param code - the source text.
* @param lang - the language hint (a markdown fence info string or a fixed caller id).
* @returns the highlighted HTML, or `undefined` for unknown or not-yet-loaded languages.
*/
function highlightToHtml(code, lang) {
	const resolved = lang === void 0 ? void 0 : LANG_ALIASES.get(lang.toLowerCase());
	if (resolved === void 0) return void 0;
	if (!ensureGrammar(resolved)) return void 0;
	return highlighter().codeToHtml(code, {
		lang: resolved,
		theme: "css-variables"
	});
}
/** vscode-textmate FontStyle bits shiki folds into `text-decoration` values. */
const DECORATION_BITS = [[4, "underline"], [8, "line-through"]];
/**
* The inline style shiki's HTML arm assigns one token (`getTokenStyleObject`
* mirrored onto React style keys): the css-variables color plus the
* vscode-textmate font-style bits the theme lets through — italic (1), bold
* (2), and the {@link DECORATION_BITS} decorations (the theme injects bold,
* italic, and underline rules for markup scopes, so markdown fences carry
* them). The theme has no per-scope backgrounds, so `background-color` never
* occurs; the arm-parity tests fail loud if a shiki upgrade changes that.
*/
function spanStyle(token) {
	const style = { color: token.color };
	/* v8 ignore next -- fontStyle is optional in ThemedToken's type; tokenizeWithTheme always stamps it. */
	const bits = token.fontStyle ?? 0;
	if ((bits & 1) !== 0) style.fontStyle = "italic";
	if ((bits & 2) !== 0) style.fontWeight = "bold";
	const decorations = DECORATION_BITS.filter(([bit]) => (bits & bit) !== 0);
	if (decorations.length > 0) style.textDecoration = decorations.map(([, value]) => value).join(" ");
	return style;
}
/**
* Narrow one tokenized line to the runs a `<span style>` renders, folding a
* whitespace-only run into the token that follows it — shiki's default
* `mergeWhitespaces` HTML behavior — with each run styled through
* {@link spanStyle}, so the streaming spans and the settled `codeToHtml`
* swap render one identical span tree. shiki exempts underlined/struck
* whitespace from the fold; under the css-variables theme that case cannot
* occur — its only underline rule styles inline-link scopes, whose spaced
* text tokenizes as one run, and it injects no strikethrough rule — so the
* unconditional fold here stays equivalent (the markdown arm-parity test
* pins it). A line-trailing whitespace-only run has no follower and keeps
* its own span, as in shiki.
*/
function lineSpans(line) {
	const spans = [];
	let pendingWhitespace = "";
	for (const [index, token] of line.entries()) {
		if (/^\s+$/.test(token.content) && index + 1 < line.length) {
			pendingWhitespace += token.content;
			continue;
		}
		spans.push({
			text: pendingWhitespace + token.content,
			style: spanStyle(token)
		});
		pendingWhitespace = "";
	}
	return spans;
}
/**
* Incremental highlighter for one growing streaming fence. TextMate
* tokenization is line-based and forward-only — a line's tokens depend only on
* its own text and the grammar state entering it — so appended text never
* changes a completed line's tokens. The session caches the spans of every
* completed line together with the grammar state after them;
* {@link updateFrame} reports only newly completed lines plus the still-growing
* last line, while {@link update} materializes the complete compatibility
* result. Per-call tokenization cost therefore excludes the completed prefix,
* and the result equals a from-scratch tokenization of the same code.
* Non-append input and a change of resolved grammar reset the cache and
* re-tokenize fully, so any input stays correct.
*/
var StreamingHighlightSession = class {
	/** Grammar id the cache was built with; a different resolution resets it. */
	resolved;
	/** Newline-terminated source prefix covered by {@link spans}. */
	prefix = "";
	/** Cached spans, one entry per completed line of {@link prefix}. */
	spans = [];
	/** Grammar state after {@link prefix}; undefined = the grammar's initial state. */
	state;
	lastCode;
	lastLang;
	lastResult;
	generation = 0;
	lastFrame;
	reset(resolved) {
		this.resolved = resolved;
		this.prefix = "";
		this.spans = [];
		this.state = void 0;
		this.generation += 1;
		this.lastFrame = void 0;
	}
	/** Tokenize `text` with `resolved`, resuming from the cached grammar state when one exists. */
	tokenize(resolved, text) {
		return highlighter().codeToTokensBase(text, {
			lang: resolved,
			theme: "css-variables",
			...this.state === void 0 ? {} : { grammarState: this.state }
		});
	}
	/**
	* Tokenize one update as a delta for a retained renderer.
	* @param code - the fence text accumulated so far.
	* @param lang - the language hint.
	* @returns Newly completed lines plus the current tail, or `undefined` for the plain arm.
	*/
	updateFrame(code, lang) {
		if (code === this.lastCode && lang === this.lastLang && this.lastFrame !== void 0) return this.lastFrame;
		this.lastCode = code;
		this.lastLang = lang;
		this.lastResult = void 0;
		const resolved = lang === void 0 ? void 0 : LANG_ALIASES.get(lang.toLowerCase());
		if (resolved === void 0 || !ensureGrammar(resolved)) {
			this.reset(void 0);
			return;
		}
		if (resolved !== this.resolved || !code.startsWith(this.prefix)) this.reset(resolved);
		const firstNewLine = this.spans.length;
		const rest = code.slice(this.prefix.length);
		const lastNewline = rest.lastIndexOf("\n");
		if (lastNewline >= 0) {
			const grownEnd = rest[lastNewline - 1] === "\r" ? lastNewline - 1 : lastNewline;
			const tokens = this.tokenize(resolved, rest.slice(0, grownEnd));
			for (const line of tokens) this.spans.push(lineSpans(line));
			this.state = highlighter().getLastGrammarState(tokens);
			this.prefix = code.slice(0, this.prefix.length + lastNewline + 1);
		}
		this.lastFrame = {
			generation: this.generation,
			appended: this.spans.slice(firstNewLine),
			tail: this.tokenize(resolved, rest.slice(lastNewline + 1)).map(lineSpans)
		};
		return this.lastFrame;
	}
	/**
	* Tokenize the fence's current text into per-line highlighted runs;
	* `undefined` means the caller renders its plain fallback. Idempotent per
	* (`code`, `lang`) input — repeated calls return the identical result array —
	* and a retained line keeps its span-array identity across growing calls, so
	* a React caller can reuse cached line elements. A lazy grammar not yet
	* loaded returns `undefined` and loads in the background exactly as
	* {@link highlightToHtml} does; the next call after it registers highlights.
	* @param code - the fence text accumulated so far (display-trimmed, no synthetic trailing newline).
	* @param lang - the language hint (a markdown fence info string).
	* @returns one entry per line of `code` (each an array of runs), or `undefined` for unknown or not-yet-loaded languages.
	*/
	update(code, lang) {
		if (code === this.lastCode && lang === this.lastLang && this.lastResult !== void 0) return this.lastResult;
		const frame = this.updateFrame(code, lang);
		if (frame === void 0) return void 0;
		this.lastResult = [...this.spans, ...frame.tail];
		return this.lastResult;
	}
};
/**
* Tokenize `code` into per-line highlighted runs when `lang` maps to a
* registered grammar; `undefined` means the caller renders its plain fallback.
* A line-numbered view needs the token runs split per line (one gutter number
* per line), which the single-`<pre>` {@link highlightToHtml} does not expose,
* so this returns shiki's own 2D line/token structure narrowed to what a run
* renders. Each run's color is a `--shiki-*` custom property, keeping token
* colors on the theme package's sheets exactly as the HTML path does; the
* markup font-style bits the theme lets through (bold/italic/underline in
* markdown scopes) are dropped — the line-numbered file view renders
* color-only runs. The trailing newline shiki appends as a final empty line
* is dropped so the run count matches the caller's own line array.
* @param code - the source text.
* @param lang - the language hint (a file-extension-derived language id).
* @returns one entry per source line (each an array of runs), or `undefined` for unknown or not-yet-loaded languages.
*/
function highlightLines(code, lang) {
	const resolved = lang === void 0 ? void 0 : LANG_ALIASES.get(lang.toLowerCase());
	if (resolved === void 0) return void 0;
	if (!ensureGrammar(resolved)) return void 0;
	const { tokens } = highlighter().codeToTokens(code, {
		lang: resolved,
		theme: "css-variables"
	});
	const last = tokens[tokens.length - 1];
	return (tokens.length > 1 && last !== void 0 && last.length === 0 ? tokens.slice(0, -1) : tokens).map((line) => line.map((token) => ({
		text: token.content,
		style: { color: token.color }
	})));
}
//#endregion
//#region lib/types/markdown/useViewportHighlighting.js
const noop = () => {};
/** One document-wide observer; activated elements leave it permanently. */
var HighlightViewport = class {
	observer;
	activators = /* @__PURE__ */ new Map();
	observe(element, activate) {
		if (typeof IntersectionObserver === "undefined") {
			activate();
			return noop;
		}
		this.observer ??= new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const current = this.activators.get(entry.target);
				/* v8 ignore next -- the observer reports only elements still registered with it. */
				if (current === void 0) continue;
				this.activators.delete(entry.target);
				this.observer?.unobserve(entry.target);
				current();
			}
			this.releaseEmptyObserver();
		});
		this.activators.set(element, activate);
		this.observer.observe(element);
		return () => {
			this.activators.delete(element);
			this.observer?.unobserve(element);
			this.releaseEmptyObserver();
		};
	}
	releaseEmptyObserver() {
		if (this.activators.size > 0) return;
		this.observer?.disconnect();
		this.observer = void 0;
	}
};
const highlightViewport = new HighlightViewport();
/**
* Activate one supported code surface when it first intersects the viewport.
* Activation lasts for the component lifetime; browsers without
* IntersectionObserver activate immediately.
* @param target - Code surface whose plain rendering reserves its geometry.
* @param lang - Optional language hint.
* @returns Whether this component may build highlighted output.
*/
function useViewportHighlighting(target, lang) {
	const supported = supportsHighlighting(lang);
	const [activated, setActivated] = useState(false);
	const activate = useCallback(() => {
		setActivated(true);
	}, []);
	useEffect(() => {
		if (activated || !supported) return;
		const element = target.current;
		/* v8 ignore next -- React attaches the host ref before running effects. */
		if (element === null) return;
		return highlightViewport.observe(element, activate);
	}, [
		activate,
		activated,
		supported,
		target
	]);
	return activated && supported;
}
//#endregion
//#region lib/types/ReadBlock.js
/**
* Content lines shown before the height cap collapses the middle. Matches
* TerminalBlock's default so a long read and a long command output cut at the
* same place in the same flow.
*/
const DEFAULT_READ_MAX_LINES = 16;
function renderSpans(spans) {
	return spans.map((span, index) => jsx("span", {
		style: span.style,
		children: span.text
	}, index));
}
/**
* Render a read tool result as a line-numbered, optionally syntax-highlighted
* file view.
* @param props - see {@link ReadBlockProps}.
* @returns the read block element.
*/
function ReadBlock({ label, labels, lines, totalLines, lang, maxLines = 16, className }) {
	const rootRef = useRef(null);
	const highlighting = useViewportHighlighting(rootRef, lang);
	const raw = useMemo(() => lines.map((line) => line.text).join("\n"), [lines]);
	const highlighted = useMemo(() => highlighting ? highlightLines(raw, lang) : void 0, [
		highlighting,
		raw,
		lang,
		useSyncExternalStore(subscribeGrammarLoaded, grammarLoadCount, grammarLoadCount)
	]);
	const [expanded, setExpanded] = useState(false);
	const [copied, setCopied] = useState(false);
	const onCopy = useCallback(() => {
		if (copied) return;
		writeClipboard(raw).then((ok) => {
			if (!ok) return;
			setCopied(true);
			window.setTimeout(() => {
				setCopied(false);
			}, 1e3);
		});
	}, [copied, raw]);
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const hidden = lines.length - maxLines;
	const capped = hidden > 0 && !expanded;
	const headLines = Math.ceil(maxLines / 2);
	const tailLines = maxLines - headLines;
	const windowed = lines.length < totalLines;
	const rows = (slice) => slice.map(([line, spans]) => jsxs("div", {
		className: css$19.line,
		children: [jsx("span", {
			className: css$19.gutter,
			"aria-hidden": true,
			children: line.number
		}), jsx("span", {
			className: css$19.content,
			children: spans === void 0 ? line.text : renderSpans(spans)
		})]
	}, line.number));
	const paired = lines.map((line, index) => [line, highlighted?.[index]]);
	return jsxs("div", {
		ref: rootRef,
		className: clsx(css$19.block, className),
		"data-read": "",
		children: [jsxs("div", {
			className: css$19.banner,
			children: [jsx("div", {
				className: css$19.label,
				children: label ?? ""
			}), jsxs("div", {
				className: css$19.action,
				children: [
					windowed && jsx("span", {
						className: css$19.count,
						children: labels.window(lines.length, totalLines)
					}),
					jsx("span", {
						className: css$19.lang,
						children: lang ?? ""
					}),
					lines.length > 0 && jsx("button", {
						type: "button",
						className: css$19.copyButton,
						onClick: onCopy,
						children: copied ? labels.copied : labels.copy
					})
				]
			})]
		}), jsxs("div", {
			className: css$19.body,
			children: [
				rows(capped ? paired.slice(0, headLines) : paired),
				hidden > 0 && jsx(FoldToggle, {
					className: css$19.expand,
					expanded,
					hidden,
					labels,
					onToggle
				}),
				capped && rows(paired.slice(paired.length - tailLines))
			]
		})]
	});
}
//#endregion
//#region lib/types/DiffBlock.js
/** Output lines shown before the height cap collapses the middle. */
const DEFAULT_DIFF_MAX_LINES = 16;
/** Local exhaustiveness helper — this package does not depend on `dsh-llm`. */
/* v8 ignore next 3 -- closed-union backstop; only reached if a row kind is forged */
function assertNever(value) {
	throw new Error(`unreachable diff row kind: ${String(value)}`);
}
/** The dim class per row kind (path/gap chrome vs the diff's own +/- colors). */
const ROW_CLASS = {
	path: css$20.path,
	del: css$20.del,
	add: css$20.add,
	gap: css$20.gap
};
/**
* Total added/removed line counts across hunks — the same numbers the footer
* prints, exported so a summary row can show them without rebuilding the body.
* Every old-side line counts toward `removed` and every new-side line toward
* `added`, under {@link contentLines}'s terminator rule.
* @param diffs - the hunks to count.
* @returns the +/- totals.
*/
function diffTotals(diffs) {
	let added = 0;
	let removed = 0;
	for (const diff of diffs) {
		if (diff.oldText !== null) removed += contentLines(diff.oldText).length;
		added += contentLines(diff.newText).length;
	}
	return {
		added,
		removed
	};
}
/**
* Flatten the hunks into the body's rows plus the footer counts. A path header
* opens each new file; a same-file second hunk (a scattered edit) opens with a
* `⋯` gap instead of repeating the path. The +/- totals are
* {@link diffTotals}'s. The file count is of DISTINCT paths, matching the TUI
* diff card's footer, so two hunks in one file read as `1 file` on both front
* ends.
* @param diffs - the hunks to render.
* @returns the body rows, the +/- totals, and the distinct-file count.
*/
function buildRows(diffs) {
	const rows = [];
	const paths = /* @__PURE__ */ new Set();
	let prevPath;
	for (const diff of diffs) {
		paths.add(diff.path);
		if (diff.path !== prevPath) rows.push({
			kind: "path",
			text: diff.path
		});
		else rows.push({
			kind: "gap",
			text: "⋯"
		});
		prevPath = diff.path;
		if (diff.oldText !== null) for (const line of contentLines(diff.oldText)) rows.push({
			kind: "del",
			text: line
		});
		for (const line of contentLines(diff.newText)) rows.push({
			kind: "add",
			text: line
		});
	}
	return {
		rows,
		...diffTotals(diffs),
		files: paths.size
	};
}
/**
* Split a side's text into its content lines. Empty text is zero lines (a full
* deletion's `newText` or a create's absent `oldText` side draws nothing), and a
* single trailing newline is a line terminator rather than an extra empty line —
* the same terminator rule TerminalBlock applies to command output. An interior
* blank line (a genuine `\n\n`) survives.
* @param text - the removed or added side's text.
* @returns the content lines, without the terminating newline.
*/
function contentLines(text) {
	if (text === "") return [];
	return (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
}
/**
* The diff text a reader copies: each row's `-`/`+`/path/gap prefix and its
* content, exactly what the card shows. The removed and added blocks are the
* change; the path headers keep a multi-file copy attributable.
* @param rows - the flattened body rows.
* @returns the diff as plain text.
*/
function copyText$1(rows) {
	return rows.map((row) => {
		switch (row.kind) {
			case "del": return `- ${row.text}`;
			case "add": return `+ ${row.text}`;
			case "path": return row.text;
			case "gap": return row.text;
			/* v8 ignore next -- closed-union backstop; only reached if a row kind is forged */
			default: return assertNever(row.kind);
		}
	}).join("\n");
}
/**
* Render a file mutation as an inline diff surface.
* @param props - see {@link DiffBlockProps}.
* @returns the diff block element.
*/
function DiffBlock({ diffs, labels, maxLines = 16, className }) {
	const { rows, added, removed, files } = useMemo(() => buildRows(diffs), [diffs]);
	const [expanded, setExpanded] = useState(false);
	const [copied, setCopied] = useState(false);
	const onCopy = useCallback(() => {
		if (copied) return;
		writeClipboard(copyText$1(rows)).then((ok) => {
			if (!ok) return;
			setCopied(true);
			window.setTimeout(() => {
				setCopied(false);
			}, 1e3);
		});
	}, [copied, rows]);
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	if (rows.length === 0) return null;
	const hidden = rows.length - maxLines;
	const capped = hidden > 0 && !expanded;
	const headLines = Math.ceil(maxLines / 2);
	const tailLines = maxLines - headLines;
	const head = capped ? rows.slice(0, headLines) : rows;
	const tail = capped ? rows.slice(rows.length - tailLines) : [];
	return jsxs("div", {
		className: clsx(css$20.block, className),
		"data-diff": "",
		children: [
			jsx("button", {
				type: "button",
				className: css$20.copyButton,
				onClick: onCopy,
				children: copied ? labels.copied : labels.copy
			}),
			jsxs("div", {
				className: css$20.body,
				children: [
					head.map((row, index) => jsx("div", {
						className: clsx(css$20.line, ROW_CLASS[row.kind]),
						children: row.text
					}, index)),
					hidden > 0 && jsx(FoldToggle, {
						className: css$20.expand,
						expanded,
						hidden,
						labels,
						onToggle
					}),
					tail.map((row, index) => jsx("div", {
						className: clsx(css$20.line, ROW_CLASS[row.kind]),
						children: row.text
					}, index))
				]
			}),
			jsxs("div", {
				className: css$20.footer,
				children: [
					"└ +",
					added,
					" -",
					removed,
					" · ",
					labels.files(files)
				]
			})
		]
	});
}
//#endregion
//#region lib/types/SearchBlock.js
/**
* Result rows shown before the height cap collapses the middle. Matches
* {@link DEFAULT_TERMINAL_MAX_LINES} so a search card and a terminal card cut a
* long result at the same place.
*/
const DEFAULT_SEARCH_MAX_LINES = 16;
/**
* The plain-text form the copy control writes: the whole structured result
* regardless of the height cap or which groups are collapsed, so the clipboard
* carries the result rather than what the card happens to be showing.
* @param props - the card's props.
* @returns the copyable text, or the empty string for an empty result.
*/
function copyText(props) {
	if (props.kind === "paths") return props.paths.join("\n");
	return props.files.map((file) => [file.path, ...file.matches.map((m) => `${m.lineNumber}: ${m.line}`)].join("\n")).join("\n\n");
}
/**
* Number of retained results the card holds: the matched-line count across all
* files for a matches card, the path count for a paths card. This is the count
* the banner summary reports against `total` when the result was capped.
* @param props - the card's props.
* @returns the retained result count.
*/
function shownCount(props) {
	return props.kind === "paths" ? props.paths.length : props.files.reduce((sum, file) => sum + file.matches.length, 0);
}
/**
* The banner summary. When the search was capped it reads `显示 X / 共 N …` so
* the retained count and the pre-cap total sit in one clause (mirroring the read
* card's `显示 X / Y 行`); when it was not capped it is a plain count of what the
* card holds. The unit — `处匹配 · K 个文件` for grep, `个路径` for glob — trails
* the count either way.
* @param props - the card's props.
* @param shown - the retained result count from {@link shownCount}.
* @param truncated - whether the search was capped.
* @param total - the pre-cap total the truncation clause reports.
* @returns the summary text.
*/
function summaryText(props, shown, truncated, total) {
	return props.kind === "paths" ? props.labels.pathsSummary(shown, total, truncated) : props.labels.matchesSummary(shown, total, props.files.length, truncated);
}
/**
* Flatten a card's shape into its render rows, dropping a collapsed file
* group's match rows.
* @param props - the card's props.
* @param collapsed - the set of collapsed file-group indices (matches only).
* @returns the flattened rows in output order.
*/
function toRows(props, collapsed) {
	if (props.kind === "paths") return props.paths.map((path) => ({
		type: "path",
		path
	}));
	const rows = [];
	props.files.forEach((file, index) => {
		const isCollapsed = collapsed.has(index);
		rows.push({
			type: "file",
			path: file.path,
			count: file.matches.length,
			index,
			collapsed: isCollapsed
		});
		if (isCollapsed) return;
		for (const match of file.matches) rows.push({
			type: "match",
			lineNumber: match.lineNumber,
			line: match.line,
			key: `${index}:${match.lineNumber}`,
			fileIndex: index
		});
	});
	return rows;
}
/**
* A stable React key for a flattened render row: the group-scoped match key, a
* file-index-scoped header key, or the path itself. Rows of different types
* never collide, since each key carries its type prefix or the group index.
* @param row - the flattened row.
* @returns the key.
*/
function rowKey(row) {
	switch (row.type) {
		case "match": return `match:${row.key}`;
		case "file": return `file:${row.index}`;
		case "path": return `path:${row.path}`;
	}
}
/**
* Render a completed search as a grouped-matches or flat-path card.
* @param props - see {@link SearchBlockProps}.
* @returns the search block element.
*/
function SearchBlock(props) {
	const { truncated, total, maxLines = 16, className } = props;
	const [expanded, setExpanded] = useState(false);
	const [collapsed, setCollapsed] = useState(() => /* @__PURE__ */ new Set());
	const rows = toRows(props, collapsed);
	const shown = shownCount(props);
	const empty = rows.length === 0;
	const { copied, onCopy } = useCopyFeedback(copyText(props));
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const toggleFile = useCallback((index) => {
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	}, []);
	const { hidden, capped, headLines, tailLines } = headTailCap(rows.length, maxLines, expanded);
	const head = capped ? rows.slice(0, headLines) : rows;
	const naturalTail = capped ? rows.slice(rows.length - tailLines) : [];
	const tailLead = naturalTail[0];
	const tailHeader = tailLead?.type === "match" && !head.some((row) => row.type === "file" && row.index === tailLead.fileIndex) ? rows.find((row) => row.type === "file" && row.index === tailLead.fileIndex) : void 0;
	const tail = tailHeader === void 0 ? naturalTail : naturalTail.slice(1);
	const renderRow = (row) => {
		if (row.type === "path") return jsx("div", {
			className: css$21.line,
			children: row.path
		});
		if (row.type === "match") return jsxs("div", {
			className: css$21.line,
			children: [jsxs("span", {
				className: css$21.lineNumber,
				children: [row.lineNumber, ": "]
			}), row.line]
		});
		return jsxs("button", {
			type: "button",
			className: css$21.fileHeader,
			"aria-expanded": !row.collapsed,
			onClick: () => {
				toggleFile(row.index);
			},
			children: [jsx("span", {
				className: css$21.filePath,
				children: row.path
			}), jsx("span", {
				className: css$21.fileCount,
				children: row.count
			})]
		});
	};
	return jsxs("div", {
		className: clsx(css$21.block, className),
		"data-search": props.kind,
		children: [jsxs("div", {
			className: css$21.header,
			children: [jsx("span", {
				className: css$21.summary,
				children: summaryText(props, shown, truncated, total)
			}), !empty && jsx("button", {
				type: "button",
				className: css$21.copyButton,
				onClick: onCopy,
				children: copied ? props.labels.copied : props.labels.copy
			})]
		}), empty ? jsx("div", {
			className: css$21.empty,
			children: props.labels.noResults
		}) : jsxs("div", {
			className: css$21.body,
			children: [
				head.map((row) => jsx("div", { children: renderRow(row) }, rowKey(row))),
				hidden > 0 && jsx("button", {
					type: "button",
					className: css$21.expand,
					"aria-expanded": expanded,
					"aria-label": expanded ? props.labels.collapseAria : props.labels.expandAria(hidden),
					onClick: onToggle,
					children: expanded ? props.labels.collapse : props.labels.expand(hidden)
				}),
				tailHeader !== void 0 && jsx("div", { children: renderRow(tailHeader) }, `tailHeader:${rowKey(tailHeader)}`),
				tail.map((row) => jsx("div", { children: renderRow(row) }, rowKey(row)))
			]
		})]
	});
}
//#endregion
//#region lib/types/markdown/incremental.js
/**
* Incremental block-level markdown parsing for an append-only text stream.
*
* Re-parsing the whole accumulated document on every streaming chunk is
* quadratic in the final reply length. CommonMark block parsing is line-based
* and appended text can only reshape the parse frontier — the last top-level
* block (a paragraph becoming a setext heading or a table, or a list
* continuing after a blank line) — so earlier blocks are final. This parser
* therefore freezes all but the trailing {@link UNSTABLE_TAIL_BLOCKS} blocks
* and re-parses only the source tail behind them. A final unclosed top-level
* fence cannot freeze as a block, so its completed content lines use a second
* frontier: only the last completed line and current partial line return
* through the caller's grammar. Each source region is therefore parsed a
* bounded number of times over the stream instead of once per chunk.
*
* The block freeze boundary comes from the parser's own `position` offsets.
* The cut sits at the *end offset* of the last frozen block (not the next
* block's start): a following block's start offset excludes up to three spaces
* of insignificant leading indentation, which is harmless to drop, but
* cutting at the previous end also keeps the inter-block blank lines in the
* tail so the sliced source stays verbatim. Fence scanning only recognizes a
* parser-confirmed code node and closing delimiter; ambiguous input returns to
* the normal tail parse.
*
* Known deviation, shared with any prefix-freeze scheme: micromark resolves
* reference-style links and footnotes document-wide at parse time, so a
* reference whose definition lands on the other side of the freeze boundary
* renders literally until the settled full parse self-heals it.
*/
/**
* Trailing blocks kept unstable. Appended text reshapes at most the last
* block; the second-to-last is retained as safety margin so a freeze decision
* never has to reason about the parse frontier.
*/
const UNSTABLE_TAIL_BLOCKS = 2;
/**
* A block's render key: its absolute source start offset. A position-less
* node (a grammar is free to omit positions) falls back to a negative
* list-index key — unique within one update's tail, which is the only place
* the fallback can occur: freezing requires the cut block's position, so a
* position-less parse keeps every block in the tail (real grammars always
* stamp positions and never take this path).
*/
function blockKey(node, base, index) {
	const offset = node.position?.start.offset;
	return offset === void 0 ? -(index + 1) : base + offset;
}
/** Return the first line terminator at or after `start`, including a CRLF pair. */
function lineTerminatorEnd(text, start) {
	for (let index = start; index < text.length; index += 1) {
		const char = text[index];
		if (char === "\n") return index + 1;
		if (char === "\r") return text[index + 1] === "\n" ? index + 2 : index + 1;
	}
}
/**
* Source prefix before the last completed line. Keeping that line beside the
* current partial line lets the grammar retain its trailing-newline semantics.
*/
function committableLinePrefixLength(text) {
	let previousEnd = 0;
	let end = 0;
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		if (char === "\n") {
			previousEnd = end;
			end = index + 1;
			continue;
		}
		if (char !== "\r" || index + 1 >= text.length) continue;
		if (text[index + 1] === "\n") index += 1;
		previousEnd = end;
		end = index + 1;
	}
	return previousEnd;
}
/** Exact source terminator ending a non-empty committable prefix. */
function trailingLineTerminator(text) {
	return text.endsWith("\r\n") ? "\r\n" : text.endsWith("\r") ? "\r" : "\n";
}
/** Whether `text` contains a CommonMark closing fence on one of its logical lines. */
function containsClosingFence(text, marker, markerLength) {
	let start = 0;
	while (start <= text.length) {
		let end = start;
		while (end < text.length && text[end] !== "\n" && text[end] !== "\r") end += 1;
		const line = text.slice(start, end);
		let indent = 0;
		while (indent < 3 && line[indent] === " ") indent += 1;
		let run = indent;
		while (line[run] === marker) run += 1;
		if (run - indent >= markerLength && /^[ \t]*$/.test(line.slice(run))) return true;
		if (end === text.length) return false;
		start = text[end] === "\r" && text[end + 1] === "\n" ? end + 2 : end + 1;
	}
	/* v8 ignore next -- each loop iteration returns at EOF or advances past a line terminator. */
	return false;
}
/** Advance an mdast point across one append while treating a split CRLF as one line ending. */
function advancePoint(point, appended, precededByCarriageReturn) {
	let line = point.line;
	let column = point.column;
	let afterCarriageReturn = precededByCarriageReturn;
	for (const char of appended) {
		if (char === "\n") {
			if (!afterCarriageReturn) line += 1;
			column = 1;
			afterCarriageReturn = false;
			continue;
		}
		if (char === "\r") {
			line += 1;
			column = 1;
			afterCarriageReturn = true;
			continue;
		}
		column += 1;
		afterCarriageReturn = false;
	}
	return {
		line,
		column,
		offset: point.offset + appended.length
	};
}
/**
* Append-only incremental parser over a caller-supplied grammar. One instance
* accumulates one streaming document; non-append input resets it.
*/
var IncrementalMarkdownParser = class {
	parse;
	prevText = "";
	tailStart = 0;
	frozen = [];
	generation = 0;
	cached = null;
	openFence = null;
	/** @param parse - Grammar shared with whatever renders the blocks, so boundaries agree. */
	constructor(parse) {
		this.parse = parse;
	}
	/** Parse one unclosed-fence content slice through the caller's grammar. */
	fenceValue(state, text) {
		const root = this.parse(`${state.syntheticPrefix}${text}`);
		if (root.children.length !== 1) return void 0;
		const node = root.children[0];
		return node.type === "code" ? node.value : void 0;
	}
	/** Recognize the parsed tail's final unclosed fence and prepare its incremental content frontier. */
	openFenceState(text, base, tail, frozen) {
		const codeIndex = tail.length - 1;
		const block = tail[codeIndex];
		if (block?.node.type !== "code") return null;
		const node = block.node;
		const startOffset = node.position?.start.offset;
		const end = node.position?.end;
		if (startOffset === void 0 || end?.offset === void 0) return null;
		/* v8 ignore next -- the caller's parse slice ends at text.length, so its final node ends there. */
		if (base + end.offset !== text.length) return null;
		const source = text.slice(base);
		const previousLf = source.lastIndexOf("\n", startOffset - 1);
		const previousCr = source.lastIndexOf("\r", startOffset - 1);
		const lineStart = Math.max(previousLf, previousCr) + 1;
		const terminatorEnd = lineTerminatorEnd(source, startOffset);
		/* v8 ignore next -- a parser-confirmed fenced code node requires its opening line terminator. */
		if (terminatorEnd === void 0) return null;
		if (terminatorEnd === source.length && source.endsWith("\r")) return null;
		const openingLine = source.slice(lineStart, terminatorEnd).replace(/[\r\n]+$/, "");
		const opening = /^( {0,3})(`{3,}|~{3,})/.exec(openingLine);
		if (opening === null) return null;
		const indent = opening[1];
		const run = opening[2];
		/* v8 ignore next -- mdast positions a fenced code node at the matched delimiter after indentation. */
		if (lineStart + indent.length !== startOffset) return null;
		const marker = run[0];
		const contentStart = base + terminatorEnd;
		const content = text.slice(contentStart);
		if (containsClosingFence(content, marker, run.length)) return null;
		const syntheticPrefix = `${indent}${run}\n`;
		const stableLength = committableLinePrefixLength(content);
		const stableValue = stableLength === 0 ? "" : this.fenceValue({ syntheticPrefix }, content.slice(0, stableLength));
		if (stableValue === void 0) return null;
		const pendingStart = contentStart + stableLength;
		const stableSource = content.slice(0, stableLength);
		const valuePrefix = stableLength === 0 ? "" : `${stableValue}${trailingLineTerminator(stableSource)}`;
		const pendingValue = this.fenceValue({ syntheticPrefix }, text.slice(pendingStart));
		if (pendingValue === void 0 || `${valuePrefix}${pendingValue}` !== node.value) return null;
		return {
			marker,
			markerLength: run.length,
			syntheticPrefix,
			codeIndex,
			frozen,
			tail,
			pendingStart,
			valuePrefix,
			end: {
				line: end.line,
				column: end.column,
				offset: end.offset
			},
			endedWithCarriageReturn: text.endsWith("\r")
		};
	}
	/** Extend a recognized unclosed fence without parsing its completed content prefix again. */
	updateOpenFence(state, text, previousText) {
		const pending = text.slice(state.pendingStart);
		if (containsClosingFence(pending, state.marker, state.markerLength)) return void 0;
		const pendingValue = this.fenceValue(state, pending);
		if (pendingValue === void 0) return void 0;
		const stableLength = committableLinePrefixLength(pending);
		const stableValue = stableLength === 0 ? "" : this.fenceValue(state, pending.slice(0, stableLength));
		if (stableValue === void 0) return void 0;
		const previousNode = state.tail[state.codeIndex].node;
		const end = advancePoint(state.end, text.slice(previousText.length), state.endedWithCarriageReturn);
		const node = {
			...previousNode,
			value: `${state.valuePrefix}${pendingValue}`,
			position: {
				start: previousNode.position.start,
				end
			}
		};
		const tail = state.tail.map((entry, index) => index === state.codeIndex ? {
			...entry,
			node
		} : entry);
		const cached = {
			frozen: state.frozen,
			tail,
			generation: this.generation
		};
		this.openFence = {
			...state,
			tail,
			pendingStart: state.pendingStart + stableLength,
			valuePrefix: stableLength === 0 ? state.valuePrefix : `${state.valuePrefix}${stableValue}${trailingLineTerminator(pending.slice(0, stableLength))}`,
			end,
			endedWithCarriageReturn: text.endsWith("\r")
		};
		return cached;
	}
	/**
	* Fold the current accumulated text and return the frozen/tail split.
	* Idempotent for identical input (the previous result is returned as-is),
	* so callers may invoke it from render paths that re-execute.
	* @param text - The full accumulated markdown source.
	* @returns Frozen and tail blocks with stream-stable render keys.
	*/
	update(text) {
		if (this.cached !== null && text === this.prevText) return this.cached;
		if (!text.startsWith(this.prevText)) {
			this.prevText = "";
			this.tailStart = 0;
			this.frozen = [];
			this.openFence = null;
			this.generation += 1;
		}
		const previousText = this.prevText;
		if (previousText !== "" && this.openFence !== null) {
			const incremental = this.updateOpenFence(this.openFence, text, previousText);
			if (incremental !== void 0) {
				this.prevText = text;
				this.cached = incremental;
				return incremental;
			}
			this.openFence = null;
		}
		this.prevText = text;
		const base = this.tailStart;
		const blocks = this.parse(text.slice(base)).children;
		let firstUnstable = Math.max(0, blocks.length - UNSTABLE_TAIL_BLOCKS);
		if (firstUnstable > 0) {
			const cutEnd = blocks[firstUnstable - 1]?.position?.end.offset;
			if (cutEnd === void 0) firstUnstable = 0;
			else {
				for (const node of blocks.slice(0, firstUnstable)) this.frozen.push({
					node,
					key: blockKey(node, base, this.frozen.length)
				});
				this.tailStart = base + cutEnd;
			}
		}
		const tail = blocks.slice(firstUnstable).map((node, index) => ({
			node,
			key: blockKey(node, base, index)
		}));
		this.cached = {
			frozen: [...this.frozen],
			tail,
			generation: this.generation
		};
		this.openFence = this.openFenceState(text, base, tail, this.cached.frozen);
		return this.cached;
	}
};
//#endregion
//#region lib/types/markdown/cjkFriendlyStrong.js
/** Let asterisk strong emphasis close after punctuation when CJK prose continues without whitespace. */
const cjkCharacter = new RegExp([
	"\\p{Script_Extensions=Han}",
	"\\p{Script_Extensions=Hiragana}",
	"\\p{Script_Extensions=Katakana}",
	"\\p{Script_Extensions=Hangul}",
	"\\p{Script_Extensions=Bopomofo}"
].join("|"), "u");
function isCjkCharacter(code) {
	return code !== null && code >= 0 && cjkCharacter.test(String.fromCodePoint(code));
}
const tokenizeCjkFriendlyAttention = function(effects, ok, nok) {
	const configuredAttentionMarkers = this.parser.constructs.attentionMarkers.null;
	if (configuredAttentionMarkers === void 0) throw new Error("micromark CommonMark attention markers are unavailable");
	const attentionMarkers = configuredAttentionMarkers;
	const previous = this.previous;
	const before = classifyCharacter(previous);
	let marker = codes.eof;
	return start;
	function start(code) {
		/* v8 ignore next -- this text construct is dispatched only for an asterisk. */
		if (code !== codes.asterisk) return nok(code);
		marker = code;
		effects.enter("attentionSequence");
		return inside(code);
	}
	function inside(code) {
		if (code === marker) {
			effects.consume(code);
			return inside;
		}
		const token = effects.exit("attentionSequence");
		const after = classifyCharacter(code);
		const open = !after || after === constants.characterGroupPunctuation && Boolean(before) || attentionMarkers.includes(code);
		const commonMarkClose = !before || before === constants.characterGroupPunctuation && Boolean(after) || attentionMarkers.includes(previous);
		const cjkStrongClose = token.end.offset - token.start.offset >= 2 && unicodePunctuation(previous) && isCjkCharacter(code);
		const close = commonMarkClose || cjkStrongClose;
		token._open = open;
		token._close = close;
		return ok(code);
	}
};
const cjkFriendlyAttention = {
	name: "cjkFriendlyAttention",
	resolveAll: attention.resolveAll,
	tokenize: tokenizeCjkFriendlyAttention
};
const cjkFriendlyStrongExtension = { text: { [codes.asterisk]: cjkFriendlyAttention } };
/**
* Extend CommonMark asterisk strong emphasis for punctuation-delimited CJK
* prose, as a micromark syntax extension for `fromMarkdown`.
* @returns The micromark syntax extension.
*/
function cjkFriendlyStrong() {
	return cjkFriendlyStrongExtension;
}
//#endregion
//#region lib/types/markdown/mathCompatibility.js
/** Extend upstream dollar-only math syntax with TeX delimiters while reusing its token vocabulary. */
const previousBackslash = function(code) {
	if (code !== codes.backslash) return true;
	const tail = this.events.at(-1);
	/* v8 ignore next -- a previous code necessarily has a preceding event. */
	if (tail === void 0) return false;
	return tail[1].type === types.characterEscape;
};
const tokenizeBackslashMathText = function(effects, ok, nok) {
	return start;
	function start(code) {
		/* v8 ignore next -- the text construct is dispatched only for a backslash. */
		if (code !== codes.backslash) return nok(code);
		effects.enter("mathText");
		effects.enter("mathTextSequence");
		effects.consume(code);
		return open;
	}
	function open(code) {
		if (code !== codes.leftParenthesis) return nok(code);
		effects.consume(code);
		effects.exit("mathTextSequence");
		return between;
	}
	function between(code) {
		if (code === codes.eof) return nok(code);
		if (code === codes.backslash) return effects.attempt({
			partial: true,
			tokenize: tokenizeClose
		}, close, afterCloseAttempt)(code);
		if (markdownLineEnding(code)) {
			effects.enter(types.lineEnding);
			effects.consume(code);
			effects.exit(types.lineEnding);
			return between;
		}
		return dataStart(code);
	}
	function afterCloseAttempt(code) {
		return effects.check({
			partial: true,
			tokenize: tokenizeOpen
		}, nok, dataStart)(code);
	}
	function dataStart(code) {
		effects.enter("mathTextData");
		effects.consume(code);
		return code === codes.backslash ? afterDataBackslash : data;
	}
	function afterDataBackslash(code) {
		if (code === codes.backslash) {
			effects.consume(code);
			return data;
		}
		return data(code);
	}
	function data(code) {
		if (code === codes.eof || code === codes.backslash || markdownLineEnding(code)) {
			effects.exit("mathTextData");
			return between(code);
		}
		effects.consume(code);
		return data;
	}
	function close(code) {
		effects.exit("mathText");
		return ok(code);
	}
	function tokenizeClose(closeEffects, closeOk, closeNok) {
		return slash;
		function slash(code) {
			/* v8 ignore next -- this partial construct is attempted only at a backslash. */
			if (code !== codes.backslash) return closeNok(code);
			closeEffects.enter("mathTextSequence");
			closeEffects.consume(code);
			return parenthesis;
		}
		function parenthesis(code) {
			if (code !== codes.rightParenthesis) return closeNok(code);
			closeEffects.consume(code);
			closeEffects.exit("mathTextSequence");
			return closeOk;
		}
	}
	function tokenizeOpen(openEffects, openOk, openNok) {
		return slash;
		function slash(code) {
			/* v8 ignore next -- the opening check follows a failed close attempt at a backslash. */
			if (code !== codes.backslash) return openNok(code);
			openEffects.enter(types.chunkString);
			openEffects.consume(code);
			return parenthesis;
		}
		function parenthesis(code) {
			if (code !== codes.leftParenthesis) return openNok(code);
			openEffects.consume(code);
			openEffects.exit(types.chunkString);
			return openOk;
		}
	}
};
function createMathFlow(marker, openMarker, closeMarker, multiline) {
	const tokenize = function(effects, ok, nok) {
		const self = this;
		let oddBackslashRun = false;
		const tail = self.events.at(-1);
		const initialSize = tail?.[1].type === types.linePrefix ? tail[2].sliceSerialize(tail[1], true).length : 0;
		return start;
		function start(code) {
			/* v8 ignore next -- the flow construct is dispatched only for its marker. */
			if (code !== marker) return nok(code);
			effects.enter("mathFlow");
			effects.enter("mathFlowFence");
			effects.enter("mathFlowFenceSequence");
			effects.consume(code);
			return open;
		}
		function open(code) {
			if (code !== openMarker) return nok(code);
			effects.consume(code);
			effects.exit("mathFlowFenceSequence");
			effects.exit("mathFlowFence");
			return marker === codes.dollarSign ? afterDollarOpen : content;
		}
		function afterDollarOpen(code) {
			return code === codes.dollarSign ? nok(code) : content(code);
		}
		function content(code) {
			if (code === codes.eof) return nok(code);
			if (code === marker && (marker !== codes.dollarSign || !oddBackslashRun)) return effects.attempt({
				partial: true,
				tokenize: tokenizeClosingFence
			}, closed, afterClosingFenceAttempt)(code);
			if (markdownLineEnding(code)) return multiline ? effects.attempt(nonLazyContinuation, afterContinuation, nok)(code) : nok(code);
			return valueStart(code);
		}
		function afterClosingFenceAttempt(code) {
			return marker === codes.backslash ? effects.check({
				partial: true,
				tokenize: tokenizeOpeningFence
			}, nok, markerValueStart)(code) : markerValueStart(code);
		}
		function afterContinuation(code) {
			return effects.attempt({
				partial: true,
				tokenize: tokenizeClosingFence
			}, closed, initialSize ? factorySpace(effects, content, types.linePrefix, initialSize + 1) : content)(code);
		}
		function valueStart(code) {
			effects.enter("mathFlowValue");
			oddBackslashRun = code === codes.backslash;
			effects.consume(code);
			return value;
		}
		function markerValueStart(code) {
			effects.enter("mathFlowValue");
			oddBackslashRun = false;
			effects.consume(code);
			return valueAfterMarker;
		}
		function valueAfterMarker(code) {
			if (code === marker) {
				effects.consume(code);
				return value;
			}
			return value(code);
		}
		function value(code) {
			if (code === codes.eof || code === marker || markdownLineEnding(code)) {
				effects.exit("mathFlowValue");
				return content(code);
			}
			oddBackslashRun = code === codes.backslash ? !oddBackslashRun : false;
			effects.consume(code);
			return value;
		}
		function closed(code) {
			effects.exit("mathFlow");
			return ok(code);
		}
		function tokenizeClosingFence(closeEffects, closeOk, closeNok) {
			return factorySpace(closeEffects, sequenceStart, types.linePrefix, constants.tabSize);
			function sequenceStart(code) {
				if (code !== marker) return closeNok(code);
				closeEffects.enter("mathFlowFence");
				closeEffects.enter("mathFlowFenceSequence");
				closeEffects.consume(code);
				return sequenceEnd;
			}
			function sequenceEnd(code) {
				if (code !== closeMarker) return closeNok(code);
				closeEffects.consume(code);
				closeEffects.exit("mathFlowFenceSequence");
				return factorySpace(closeEffects, after, types.whitespace);
			}
			function after(code) {
				if (code !== codes.eof && !markdownLineEnding(code)) return closeNok(code);
				closeEffects.exit("mathFlowFence");
				return closeOk(code);
			}
		}
		function tokenizeOpeningFence(openEffects, openOk, openNok) {
			return sequenceStart;
			function sequenceStart(code) {
				/* v8 ignore next -- the opening check follows a failed close attempt at the marker. */
				if (code !== marker) return openNok(code);
				openEffects.enter(types.chunkString);
				openEffects.consume(code);
				return sequenceEnd;
			}
			function sequenceEnd(code) {
				if (code !== openMarker) return openNok(code);
				openEffects.consume(code);
				openEffects.exit(types.chunkString);
				return openOk;
			}
		}
	};
	return {
		concrete: true,
		name: marker === codes.dollarSign ? "sameLineDollarMathFlow" : "backslashMathFlow",
		tokenize
	};
}
const tokenizeNonLazyContinuation = function(effects, ok, nok) {
	const self = this;
	return start;
	function start(code) {
		/* v8 ignore next -- continuation constructs are attempted only after a line ending. */
		if (code === codes.eof) return ok(code);
		/* v8 ignore next -- continuation constructs are attempted only after a line ending. */
		if (!markdownLineEnding(code)) return nok(code);
		effects.enter(types.lineEnding);
		effects.consume(code);
		effects.exit(types.lineEnding);
		return lineStart;
	}
	function lineStart(code) {
		return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
	}
};
const nonLazyContinuation = {
	partial: true,
	tokenize: tokenizeNonLazyContinuation
};
const backslashMathText = {
	name: "backslashMathText",
	previous: previousBackslash,
	tokenize: tokenizeBackslashMathText
};
const backslashMathFlow = createMathFlow(codes.backslash, codes.leftSquareBracket, codes.rightSquareBracket, true);
const sameLineDollarMathFlow = createMathFlow(codes.dollarSign, codes.dollarSign, codes.dollarSign, false);
const backslashMath = {
	flow: {
		[codes.backslash]: backslashMathFlow,
		[codes.dollarSign]: sameLineDollarMathFlow
	},
	text: { [codes.backslash]: backslashMathText }
};
/**
* TeX backslash delimiters and same-line display-dollar blocks as a micromark
* syntax extension reusing `micromark-extension-math`'s token vocabulary; the
* caller must also register `math()` on the same parse so the emitted tokens
* compile to standard math nodes.
* @returns The micromark syntax extension.
*/
function mathCompatibility() {
	return backslashMath;
}
//#endregion
//#region lib/types/markdown/parse.js
/**
* The markdown renderer's two mdast grammars, one per rendering arm. Each
* arm is internally consistent — the incremental tail parses, the one-shot
* parses, and the plain-text projection of a given grammar always agree on
* where blocks start and end — and the settled grammar is the streaming one
* plus the math extensions, so the arms differ only where TeX delimiters
* begin a math construct (a `$$` block is a paragraph while streaming and a
* math block once settled, by design).
*/
/**
* Parse GFM markdown (the streaming arm's grammar: no math, so incomplete
* TeX never flashes KaTeX errors mid-stream).
* @param text - Markdown source.
* @returns The mdast root.
*/
function parseGfm(text) {
	return fromMarkdown(text, {
		extensions: [gfm(), cjkFriendlyStrong()],
		mdastExtensions: [gfmFromMarkdown()]
	});
}
/**
* Parse GFM markdown plus TeX math with the compatibility delimiters
* (the settled arm's grammar).
* @param text - Markdown source.
* @returns The mdast root.
*/
function parseGfmWithMath(text) {
	return fromMarkdown(text, {
		extensions: [
			gfm(),
			cjkFriendlyStrong(),
			mathCompatibility(),
			math()
		],
		mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()]
	});
}
//#endregion
//#region lib/types/markdown/CodeBlock.js
/**
* The `pre` attributes shiki's HTML arm emits for the css-variables theme,
* mirrored so the streaming arm's tree is interchangeable with the settled
* swap (`tests/streaming-code-block.client.spec.tsx` pins the two arms'
* parity).
*/
const SHIKI_PRE_PROPS = {
	className: "shiki css-variables",
	style: {
		backgroundColor: "var(--shiki-background)",
		color: "var(--shiki-foreground)"
	},
	tabIndex: 0
};
/** Completed-line group size; React reconciles groups while the DOM remains line-for-line identical. */
const STREAMING_LINE_GROUP_SIZE = 32;
function renderLine(line, index) {
	return jsxs(Fragment$1, { children: [index > 0 && "\n", jsx("span", {
		className: "line",
		children: line.map((span, spanIndex) => jsx("span", {
			style: span.style,
			children: span.text
		}, spanIndex))
	})] }, index);
}
function CodeBlock({ code, lang, streaming, className, contentRef, lineNumbers = false, copyLabel, copiedLabel }) {
	const trimmed = code.endsWith("\n") ? code.slice(0, -1) : code;
	const sourceLines = lineNumbers ? trimmed.split("\n") : void 0;
	const rootRef = useRef(null);
	const highlighting = useViewportHighlighting(rootRef, lang);
	const loaded = useSyncExternalStore(subscribeGrammarLoaded, grammarLoadCount, grammarLoadCount);
	const sessionRef = useRef(null);
	const lineCacheRef = useRef(null);
	const settledRef = useRef(false);
	const streamedBody = useMemo(() => {
		if (!highlighting) {
			sessionRef.current = null;
			lineCacheRef.current = null;
			settledRef.current = false;
			return;
		}
		if (streaming !== true) {
			const previous = lineCacheRef.current;
			if (previous !== null && previous.code === trimmed && previous.lang === lang) {
				settledRef.current = true;
				return previous.body;
			}
			sessionRef.current = null;
			lineCacheRef.current = null;
			settledRef.current = true;
			return;
		}
		if (settledRef.current) {
			sessionRef.current = null;
			lineCacheRef.current = null;
			settledRef.current = false;
		}
		sessionRef.current ??= new StreamingHighlightSession();
		const frame = sessionRef.current.updateFrame(trimmed, lang);
		if (frame === void 0) {
			lineCacheRef.current = null;
			return;
		}
		const previous = lineCacheRef.current;
		if (previous?.frame === frame && previous.code === trimmed && previous.lang === lang) return previous.body;
		const sameGeneration = previous?.generation === frame.generation;
		const groups = sameGeneration ? [...previous.groups] : [];
		let pending = sameGeneration ? [...previous.pending] : [];
		let nextLine = sameGeneration ? previous.nextLine : 0;
		for (const line of frame.appended) {
			pending.push(renderLine(line, nextLine));
			nextLine += 1;
			if (pending.length !== STREAMING_LINE_GROUP_SIZE) continue;
			const start = nextLine - pending.length;
			groups.push(jsx(Fragment$1, { children: pending }, start));
			pending = [];
		}
		const tail = frame.tail.map((line, index) => renderLine(line, nextLine + index));
		const tailGroup = jsx(Fragment$1, { children: [...pending, ...tail] }, nextLine - pending.length);
		const body = jsx("pre", {
			...SHIKI_PRE_PROPS,
			children: jsxs("code", { children: [groups, tailGroup] })
		});
		lineCacheRef.current = {
			code: trimmed,
			lang,
			generation: frame.generation,
			frame,
			groups,
			pending,
			nextLine,
			body
		};
		return body;
	}, [
		streaming,
		highlighting,
		trimmed,
		lang,
		loaded
	]);
	const html = useMemo(() => highlighting && streaming !== true && streamedBody === void 0 ? highlightToHtml(trimmed, lang) : void 0, [
		streaming,
		highlighting,
		streamedBody,
		trimmed,
		lang,
		loaded
	]);
	const [copied, setCopied] = useState(false);
	const onCopy = useCallback(() => {
		if (copied) return;
		writeClipboard(rootRef.current?.querySelector("pre")?.textContent ?? trimmed).then((ok) => {
			if (!ok) return;
			setCopied(true);
			window.setTimeout(() => {
				setCopied(false);
			}, 1e3);
		});
	}, [copied, trimmed]);
	const body = streamedBody !== void 0 ? streamedBody : html === void 0 ? jsx("pre", {
		className: css$22.plain,
		children: jsx("code", { children: sourceLines === void 0 ? trimmed : sourceLines.map((line, index) => jsxs(Fragment$1, { children: [index > 0 && "\n", jsx("span", {
			className: "line",
			children: line
		})] }, index)) })
	}) : jsx("div", { dangerouslySetInnerHTML: { __html: html } });
	return jsxs("div", {
		ref: rootRef,
		className: clsx(css$22.block, "md-code-block", lineNumbers && css$22.numbered, className),
		"data-line-numbers": lineNumbers || void 0,
		style: sourceLines === void 0 ? void 0 : { "--dsl-code-block-line-number-width": `${Math.max(2, String(sourceLines.length).length)}ch` },
		children: [jsx("div", {
			className: css$22.bannerWrap,
			children: jsxs("div", {
				className: css$22.banner,
				"data-code-block-banner": true,
				children: [jsx("div", {
					className: css$22.infostring,
					children: lang ?? ""
				}), jsx("div", {
					className: css$22.action,
					children: jsx("button", {
						type: "button",
						className: css$22.copyButton,
						onClick: onCopy,
						children: copied ? copiedLabel : copyLabel
					})
				})]
			})
		}), jsx("div", {
			ref: contentRef,
			className: css$22.content,
			"data-code-block-content": true,
			children: body
		})]
	});
}
//#endregion
//#region lib/types/markdown/katex.js
/**
* TeX-to-React via KaTeX, replicating the rehype-katex pipeline this renderer
* replaced: the same three-arm error chain (strict render, `strict: 'ignore'`
* retry, error span) and a DOM-identical element tree, so settled math keeps
* its exact markup. KaTeX emits an HTML string; the browser's own HTML parser
* (`DOMParser`, applying the spec's SVG/MathML foreign-content attribute
* adjustments KaTeX output relies on) turns it into a tree this module maps
* onto React elements — KaTeX output is a static span/MathML/SVG vocabulary
* with no raw user HTML, the same trust shiki's tree gets in CodeBlock.
*
* React 18 has no MathML support, so the `.katex-mathml` subtree's elements
* land in the HTML namespace — exactly as they did under the replaced
* hast-util-to-jsx-runtime pipeline. The visual arm is the `.katex-html`
* span tree; the MathML arm serves assistive technology, which reads it by
* tag name regardless of namespace.
*/
/**
* Convert one inline `style` attribute string into React's style object.
* KaTeX emits only plain kebab-case declarations (no custom properties and no
* nameless declarations), so camel-casing the property is the whole mapping.
*/
function styleObject(css) {
	const style = {};
	for (const declaration of css.split(";")) {
		const colon = declaration.indexOf(":");
		if (colon === -1) continue;
		const key = declaration.slice(0, colon).trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
		style[key] = declaration.slice(colon + 1).trim();
	}
	return style;
}
/** Map one parsed DOM node onto a React element (text nodes pass through). */
function domToReact(node, key) {
	if (node.nodeType === Node.TEXT_NODE) return node.textContent;
	/* v8 ignore next 2 -- KaTeX output holds only elements and text; other
	node kinds cannot appear in its serialized vocabulary. */
	if (node.nodeType !== Node.ELEMENT_NODE) return null;
	const element = node;
	const props = { key };
	for (const attribute of element.attributes) if (attribute.name === "class") props["className"] = attribute.value;
	else if (attribute.name === "style") props["style"] = styleObject(attribute.value);
	else props[attribute.name] = attribute.value;
	const children = [...element.childNodes].map(domToReact);
	return children.length === 0 ? createElement(element.localName, props) : createElement(element.localName, props, ...children);
}
/**
* Render TeX source to React elements through KaTeX.
* @param value - The TeX source (math node value; fenced `math` blocks append
* their trailing newline to match the replaced pipeline's text extraction).
* @param displayMode - Display (block) versus inline rendering.
* @returns KaTeX's element tree, or the error span when the source does not
* parse (colored with KaTeX's stock `errorColor`, matching rehype-katex).
*/
function renderTexToReact(value, displayMode) {
	let html;
	try {
		html = katex.renderToString(value, {
			displayMode,
			throwOnError: true
		});
	} catch (error) {
		try {
			html = katex.renderToString(value, {
				displayMode,
				strict: "ignore",
				throwOnError: false
			});
		} catch {
			/* v8 ignore next 8 */
			return jsx("span", {
				className: "katex-error",
				style: { color: "#cc0000" },
				title: String(error),
				children: value
			});
		}
	}
	return [...new DOMParser().parseFromString(html, "text/html").body.childNodes].map(domToReact);
}
//#endregion
//#region lib/types/markdown/render.js
/**
* Direct mdast→React markdown renderer. Replaces the react-markdown /
* remark-rehype pipeline with one switch over parsed nodes so streaming can
* cache frozen blocks as React elements; the rendered DOM is pinned
* byte-for-byte by `tests/fixtures/markdown-dom` and must not drift.
*
* Untrusted-output policy (unchanged from the replaced pipeline): link and
* image destinations pass a protocol allowlist, images additionally require
* absolute HTTP(S), raw HTML renders as literal text (no HTML enters the
* DOM), and KaTeX runs without trusted commands. Fragment-anchor URLs fail
* the allowlist, so footnote references and back-references render as plain
* text rather than in-page links.
*
* Merge-extensible node unions fall through the documented default (render
* nothing) rather than ending in assertNever: grammars registered elsewhere
* may add node types this renderer has no mapping for.
*/
function sanitizeUrl(url) {
	try {
		switch (new URL(url).protocol) {
			case "http:":
			case "https:":
			case "mailto:": return url;
			default: return "";
		}
	} catch {
		return "";
	}
}
function remoteImageUrl(url) {
	try {
		const protocol = new URL(url).protocol;
		return protocol === "http:" || protocol === "https:" ? url : void 0;
	} catch {
		return;
	}
}
/** Protocols a vocabulary-rewritten image destination may carry. */
function vocabularyImageUrl(url) {
	try {
		const protocol = new URL(url).protocol;
		return protocol === "http:" || protocol === "https:" || protocol === "blob:" || protocol === "data:" ? url : void 0;
	} catch {
		return;
	}
}
/**
* The displayable source for one image destination: absolute HTTP(S) as
* authored, otherwise the context's local-path vocabulary when it vouches for
* the destination. Either miss leaves the authored fallback (alt text) to the
* caller.
* @param url - The authored markdown destination.
* @param pathImages - Rewriting vocabulary, when the render pass has one.
* @returns The displayable image URL, or undefined.
*/
function imageSource(url, pathImages) {
	const remote = remoteImageUrl(sanitizeUrl(normalizeUri(url)));
	if (remote !== void 0) return remote;
	const rewritten = pathImages?.resolve(url);
	return rewritten === void 0 ? void 0 : vocabularyImageUrl(rewritten);
}
/**
* Create an empty {@link ReferenceTargets}.
* @returns Fresh empty maps.
*/
function createReferenceTargets() {
	return {
		definitions: /* @__PURE__ */ new Map(),
		footnotes: /* @__PURE__ */ new Map()
	};
}
/**
* Record every definition and footnote definition under `nodes` into
* `targets`, depth-first, keeping the first definition per identifier.
* @param nodes - Subtrees to walk (top-level blocks or any nested children).
* @param targets - Accumulator, typically shared across incremental segments.
*/
function collectReferenceTargets(nodes, targets) {
	for (const node of nodes) {
		if (node.type === "definition") {
			const id = node.identifier.toUpperCase();
			if (!targets.definitions.has(id)) targets.definitions.set(id, node);
		} else if (node.type === "footnoteDefinition") {
			const id = node.identifier.toUpperCase();
			if (!targets.footnotes.has(id)) targets.footnotes.set(id, node);
		}
		if ("children" in node) collectReferenceTargets(node.children, targets);
	}
}
/**
* Render top-level blocks. Nodes that render nothing (definitions, unmapped
* types) are dropped rather than kept as null placeholders, matching the
* replaced pipeline's child lists so separator newlines land identically.
* @param blocks - Blocks with their stream-stable render keys.
* @param context - The pass state; footnote numbering mutates in document order.
* @returns One React node per rendered block.
*/
function renderBlocks(blocks, context) {
	return blocks.map((block) => renderNode(block.node, block.key, context)).filter((element) => element !== null);
}
/**
* Interleave the newline text nodes the replaced pipeline emitted between
* block-level children. They are invisible between elements but coalesce
* into adjacent literal raw-HTML text, where the DOM parity fixtures pin
* them.
* @param elements - Rendered block children with empty renders already dropped.
* @param edges - Also emit the leading and trailing newline (hast's loose wrap).
* @returns The interleaved children.
*/
function wrapBlockChildren(elements, edges) {
	const wrapped = [];
	for (const element of elements) {
		if (edges || wrapped.length > 0) wrapped.push("\n");
		wrapped.push(element);
	}
	if (edges && elements.length > 0) wrapped.push("\n");
	return wrapped;
}
/** Render container children into {@link BlockEntry} values, dropping empty renders. */
function renderBlockEntries(blocks, context) {
	const entries = [];
	for (const [index, block] of blocks.entries()) if (block.type === "paragraph") entries.push({ paragraph: renderChildren(block.children, context) });
	else {
		const element = renderNode(block, index, context);
		if (element !== null) entries.push({ element });
	}
	return entries;
}
function renderChildren(nodes, context) {
	return nodes.map((node, index) => renderNode(node, index, context));
}
function renderNode(node, key, context) {
	switch (node.type) {
		case "text": return node.value;
		case "paragraph": return jsx("p", { children: renderChildren(node.children, context) }, key);
		case "heading": return createElement(`h${node.depth}`, { key }, ...renderChildren(node.children, context));
		case "blockquote": return jsx("blockquote", { children: wrapBlockChildren(renderChildren(node.children, {
			...context,
			inBlockquote: true
		}).filter((child) => child !== null), true) }, key);
		case "thematicBreak": return jsx("hr", {}, key);
		case "break": return jsxs(Fragment$1, { children: [jsx("br", {}), "\n"] }, key);
		case "strong": return jsx("strong", { children: renderChildren(node.children, context) }, key);
		case "emphasis": return jsx("em", { children: renderChildren(node.children, context) }, key);
		case "delete": return jsx("del", { children: renderChildren(node.children, context) }, key);
		case "inlineCode": {
			const value = node.value.replace(/\r?\n|\r/g, " ");
			const href = inlineCodeHttpUrl(value);
			if (href !== void 0) return jsx("code", { children: renderSafeLink(href, [value], "link") }, key);
			const mention = context.inLink === true ? void 0 : context.fileMentions?.resolve(value);
			if (mention !== void 0) return jsx("code", { children: jsxs("button", {
				type: "button",
				className: css$23.fileMention,
				title: mention.title,
				"aria-label": mention.label,
				onClick: mention.open,
				children: [jsx(LinkIcon, {
					kind: classifyLinkPath(value),
					className: css$23.linkIcon
				}), value]
			}) }, key);
			return jsx("code", { children: value }, key);
		}
		case "html": return node.value;
		case "code": return renderCode(node, key, context);
		case "math": return jsx(Fragment$1, { children: renderTexToReact(node.value, true) }, key);
		case "inlineMath": return jsx(Fragment$1, { children: renderTexToReact(node.value, false) }, key);
		case "list": return renderList(node, key, context);
		case "listItem": return renderListItem(node, listItemLoose(node), key, context);
		case "table": return renderTable(node, key, context);
		case "link": return renderAnchor(node.url, renderChildren(node.children, {
			...context,
			inLink: true
		}), key, !anchorWrapsOnlyImages(node.children));
		case "linkReference": return renderLinkReference(node, key, context);
		case "image": return renderImage(node.url, node.alt ?? "", key, context);
		case "imageReference": return renderImageReference(node, key, context);
		case "footnoteReference": return renderFootnoteReference(node, key, context);
		case "definition":
		case "footnoteDefinition": return null;
		default: return null;
	}
}
function renderCode(node, key, context) {
	const language = node.lang ?? void 0;
	if (node.value === "") return jsx("pre", { children: jsx("code", { className: language === void 0 ? void 0 : `language-${language}` }) }, key);
	const lang = language === void 0 ? void 0 : /^[\w-]+/.exec(language)?.[0];
	if (!context.streaming && lang === "math") return jsx(Fragment$1, { children: renderTexToReact(`${node.value}\n`, true) }, key);
	return jsx(CodeBlock, {
		code: `${node.value}\n`,
		lang,
		streaming: context.streaming,
		copyLabel: context.labels.code.copyLabel,
		copiedLabel: context.labels.code.copiedLabel
	}, key);
}
/** A list is loose when it or any of its items is spread; every item then keeps its paragraphs. */
function listLoose(list) {
	return (list.spread ?? false) || list.children.some(listItemLoose);
}
function listItemLoose(item) {
	return item.spread ?? item.children.length > 1;
}
function renderList(node, key, context) {
	const loose = listLoose(node);
	const properties = {};
	if (typeof node.start === "number" && node.start !== 1) properties.start = node.start;
	if (node.children.some((item) => typeof item.checked === "boolean")) properties.className = "contains-task-list";
	return createElement(node.ordered === true ? "ol" : "ul", {
		key,
		...properties
	}, ...node.children.map((item, index) => renderListItem(item, loose, index, context)));
}
function renderListItem(item, loose, key, context) {
	const entries = renderBlockEntries(item.children, context);
	const task = typeof item.checked === "boolean";
	if (task) {
		const checkbox = jsx("input", {
			type: "checkbox",
			checked: item.checked === true,
			disabled: true
		}, "task-checkbox");
		const head = entries[0];
		if (head !== void 0 && "paragraph" in head) head.paragraph = head.paragraph.length > 0 ? [
			checkbox,
			" ",
			...head.paragraph
		] : [checkbox];
		else entries.unshift({ paragraph: [checkbox] });
	}
	const parts = [];
	for (const [index, entry] of entries.entries()) {
		const isParagraph = "paragraph" in entry;
		if (loose || index !== 0 || !isParagraph) parts.push("\n");
		if (!isParagraph) parts.push(entry.element);
		else if (loose) parts.push(jsx("p", { children: entry.paragraph }, `p-${index}`));
		else parts.push(jsx(Fragment$1, { children: entry.paragraph }, `p-${index}`));
	}
	const tail = entries[entries.length - 1];
	if (tail !== void 0 && (loose || !("paragraph" in tail))) parts.push("\n");
	return jsx("li", {
		className: task ? "task-list-item" : void 0,
		children: parts
	}, key);
}
function renderTable(node, key, context) {
	const align = node.align ?? null;
	const [headRow, ...bodyRows] = node.children;
	const wide = (align === null ? headRow?.children.length ?? 0 : align.length) >= 4 && context.inBlockquote !== true;
	return jsx("div", {
		className: clsx(css$23.tableScroll, wide ? "md-table-wide" : css$23.tableFill),
		tabIndex: wide ? 0 : void 0,
		children: jsxs("table", { children: [headRow !== void 0 && jsx("thead", { children: renderTableRow(headRow, "th", align, 0, context) }), bodyRows.length > 0 && jsx("tbody", { children: bodyRows.map((row, index) => renderTableRow(row, "td", align, index + 1, context)) })] })
	}, key);
}
function renderTableRow(row, cellTag, align, key, context) {
	const length = align === null ? row.children.length : align.length;
	const cells = [];
	for (let index = 0; index < length; index++) {
		const cell = row.children[index];
		const alignValue = align?.[index];
		cells.push(createElement(cellTag, {
			key: index,
			style: alignValue == null ? void 0 : { textAlign: alignValue }
		}, ...cell === void 0 ? [] : renderChildren(cell.children, context)));
	}
	return jsx("tr", { children: cells }, key);
}
/**
* True when an anchor's markdown children are all images, so the anchor is a
* clickable picture (badge, thumbnail): the leading URL glyph would dangle
* beside the image instead of leading link text, so those anchors skip it.
*/
function anchorWrapsOnlyImages(children) {
	return children.length > 0 && children.every((child) => child.type === "image" || child.type === "imageReference");
}
/** Anchor over an already-authored href: allowlisted or unwrapped, external links get the safe attributes. */
function renderSafeLink(href, children, key, glyph = true) {
	const safeHref = sanitizeUrl(href);
	if (safeHref === "") return jsx(Fragment$1, { children }, key);
	return jsxs("a", {
		href: safeHref,
		...["http:", "https:"].includes(new URL(safeHref).protocol) ? {
			target: "_blank",
			rel: "noopener noreferrer"
		} : {},
		children: [glyph && jsx(LinkIcon, {
			kind: "url",
			className: css$23.linkIcon
		}), children]
	}, key);
}
/** Anchor over a parsed markdown destination, which hast normalized before the allowlist saw it. */
function renderAnchor(url, children, key, glyph = true) {
	return renderSafeLink(normalizeUri(url), children, key, glyph);
}
/**
* The complete inline-code value when it is exactly an absolute HTTP(S) URL
* (no surrounding whitespace); anything else stays inert code.
*/
function inlineCodeHttpUrl(value) {
	if (value.trim() !== value) return void 0;
	try {
		const protocol = new URL(value).protocol;
		return protocol === "http:" || protocol === "https:" ? value : void 0;
	} catch {
		return;
	}
}
function renderImage(url, alt, key, context) {
	const imageSrc = imageSource(url, context.pathImages);
	if (imageSrc === void 0) return jsx("span", {
		className: css$23.imageAlt,
		children: alt
	}, key);
	return jsx(MarkdownImage, {
		src: imageSrc,
		alt,
		destination: url
	}, `${key}:${imageSrc}`);
}
/** Failed loads retain the authored alt or destination; a new source remounts the image. */
function MarkdownImage({ src, alt, destination }) {
	const [failed, setFailed] = useState(false);
	if (failed) return jsx("span", {
		className: css$23.imageAlt,
		children: alt || destination
	});
	return jsx("img", {
		className: css$23.image,
		src,
		alt,
		onError: () => {
			setFailed(true);
		},
		loading: "lazy",
		decoding: "async",
		referrerPolicy: "no-referrer"
	});
}
/** The bracketed source text a reference reverts to when its definition is missing. */
function referenceSuffix(node) {
	if (node.referenceType === "collapsed") return "][]";
	if (node.referenceType === "full") return `][${node.label ?? node.identifier}]`;
	return "]";
}
function renderLinkReference(node, key, context) {
	const definition = context.targets.definitions.get(node.identifier.toUpperCase());
	if (definition === void 0) return jsxs(Fragment$1, { children: [
		"[",
		renderChildren(node.children, context),
		referenceSuffix(node)
	] }, key);
	const rendered = renderChildren(node.children, {
		...context,
		inLink: true
	});
	return renderAnchor(definition.url, rendered, key, !anchorWrapsOnlyImages(node.children));
}
function renderImageReference(node, key, context) {
	const definition = context.targets.definitions.get(node.identifier.toUpperCase());
	if (definition === void 0) return `![${node.alt ?? ""}${referenceSuffix(node)}`;
	return renderImage(definition.url, node.alt ?? "", key, context);
}
function renderFootnoteReference(node, key, context) {
	const id = node.identifier.toUpperCase();
	const seen = context.footnoteCounts.get(id);
	if (seen === void 0) context.footnoteOrder.push(id);
	context.footnoteCounts.set(id, (seen ?? 0) + 1);
	return jsx("sup", { children: String(context.footnoteOrder.indexOf(id) + 1) }, key);
}
/**
* Render the trailing footnote section for every footnote referenced during
* the pass, in first-reference order, with one plain-text back-reference
* marker per rendered reference.
* @param context - The pass state after all blocks rendered.
* @returns The section, or null when no referenced footnote has a definition.
*/
function renderFootnoteSection(context) {
	const items = [];
	for (const id of context.footnoteOrder) {
		const definition = context.targets.footnotes.get(id);
		if (definition === void 0) continue;
		const count = context.footnoteCounts.get(id) ?? 0;
		const backrefs = [];
		for (let reference = 1; reference <= count; reference++) {
			if (backrefs.length > 0) backrefs.push(" ");
			backrefs.push("↩");
			if (reference > 1) backrefs.push(jsx("sup", { children: String(reference) }, `re-${reference}`));
		}
		const entries = renderBlockEntries(definition.children, context);
		const tail = entries[entries.length - 1];
		const body = entries.map((entry, index) => "paragraph" in entry ? jsxs("p", { children: [entry.paragraph, entry === tail && jsxs(Fragment, { children: [" ", backrefs] })] }, `p-${index}`) : entry.element);
		if (tail === void 0 || !("paragraph" in tail)) body.push(...backrefs);
		items.push(jsx("li", {
			id: `user-content-fn-${normalizeUri(id.toLowerCase())}`,
			children: wrapBlockChildren(body, true)
		}, id));
	}
	if (items.length === 0) return null;
	return jsxs("section", {
		"data-footnotes": true,
		className: "footnotes",
		children: [jsx("h2", {
			id: "footnote-label",
			className: "sr-only",
			children: context.labels.footnotes
		}), jsx("ol", { children: items })]
	}, "footnotes");
}
//#endregion
//#region lib/types/markdown/MarkdownText.js
/**
* Untrusted assistant-Markdown renderer over the direct mdast pipeline:
* `parse.ts` grammars, the incremental streaming parser, and `render.tsx`.
* While a message streams, all but the trailing two blocks freeze as cached
* React elements and only the source tail behind them re-parses per chunk,
* so per-chunk work tracks the tail size instead of the whole reply. Frozen
* blocks keep their source-offset keys when they cross the freeze boundary,
* so React reconciles instead of remounting. Known deviation while
* streaming: a reference-style link or footnote whose definition sits on the
* other side of the freeze boundary renders literally until the settled
* full parse self-heals it.
*/
/** One settled full render: parse with math, resolve references, append the footnote section. */
function renderSettled(text, labels, fileMentions, pathImages) {
	const root = parseGfmWithMath(text);
	const targets = createReferenceTargets();
	collectReferenceTargets(root.children, targets);
	const context = {
		streaming: false,
		labels,
		fileMentions,
		pathImages,
		targets,
		footnoteOrder: [],
		footnoteCounts: /* @__PURE__ */ new Map()
	};
	const blocks = wrapBlockChildren(renderBlocks(root.children.map((node, index) => ({
		node,
		/* v8 ignore next -- parseFull uses parseGfm, which stamps every top-level node. */
		key: node.position?.start.offset ?? -(index + 1)
	})), context), false);
	const section = renderFootnoteSection(context);
	return section === null ? blocks : [
		...blocks,
		"\n",
		section
	];
}
/**
* Streaming render state for one growing message: the incremental parser,
* the frozen blocks' cached elements, and the reference/footnote state their
* rendering consumed (footnote numbering assigned to frozen references is
* final, so the tail continues from a copy of it each frame).
*/
var StreamingRenderer = class {
	labels;
	parser = new IncrementalMarkdownParser(parseGfm);
	generation = -1;
	frozenCount = 0;
	frozenElements = [];
	frozenTargets = createReferenceTargets();
	frozenFootnoteOrder = [];
	frozenFootnoteCounts = /* @__PURE__ */ new Map();
	lastText = null;
	lastRendered = [];
	/** @param labels - Localized Markdown chrome baked into cached elements; the owner replaces the renderer when it changes. */
	constructor(labels) {
		this.labels = labels;
	}
	/**
	* Render the current accumulated text. Idempotent per text value, so React
	* may re-execute the calling render freely.
	* @param text - The full accumulated markdown source.
	* @returns Frozen elements, re-rendered tail, and the footnote section.
	*/
	render(text) {
		if (text === this.lastText) return this.lastRendered;
		const { frozen, tail, generation } = this.parser.update(text);
		if (generation !== this.generation) {
			this.generation = generation;
			this.frozenCount = 0;
			this.frozenElements = [];
			this.frozenTargets = createReferenceTargets();
			this.frozenFootnoteOrder = [];
			this.frozenFootnoteCounts = /* @__PURE__ */ new Map();
		}
		const newlyFrozen = frozen.slice(this.frozenCount);
		collectReferenceTargets(newlyFrozen.map((block) => block.node), this.frozenTargets);
		const frameTargets = {
			definitions: new Map(this.frozenTargets.definitions),
			footnotes: new Map(this.frozenTargets.footnotes)
		};
		collectReferenceTargets(tail.map((block) => block.node), frameTargets);
		if (newlyFrozen.length > 0) {
			const frozenContext = {
				streaming: true,
				labels: this.labels,
				fileMentions: void 0,
				pathImages: void 0,
				targets: frameTargets,
				footnoteOrder: this.frozenFootnoteOrder,
				footnoteCounts: this.frozenFootnoteCounts
			};
			const batch = [...this.frozenElements];
			for (const element of renderBlocks(newlyFrozen, frozenContext)) {
				if (batch.length > 0) batch.push("\n");
				batch.push(element);
			}
			this.frozenElements = batch;
			this.frozenCount = frozen.length;
		}
		const tailContext = {
			streaming: true,
			labels: this.labels,
			fileMentions: void 0,
			pathImages: void 0,
			targets: frameTargets,
			footnoteOrder: [...this.frozenFootnoteOrder],
			footnoteCounts: new Map(this.frozenFootnoteCounts)
		};
		const children = [...this.frozenElements];
		for (const element of renderBlocks(tail, tailContext)) {
			if (children.length > 0) children.push("\n");
			children.push(element);
		}
		const section = renderFootnoteSection(tailContext);
		if (section !== null) children.push("\n", section);
		this.lastText = text;
		this.lastRendered = children;
		return this.lastRendered;
	}
};
/**
* Render untrusted assistant-authored Markdown as semantic React elements.
* @param props - Markdown source text preserved by the session projection;
* `streaming` parses incrementally across chunks and highlights fences as
* they grow (each fence re-tokenizes only appended text; TeX stays literal
* until the finalize swap so incomplete formulae never flash errors);
* `labels` forwards localized fence and footnote chrome — pass a
* reference-stable object (memoized per locale revision), because a new
* identity discards the streaming render cache mid-message. `fileMentions`
* links inline-code tokens its resolver recognizes as real files, and
* `pathImages` rewrites image destinations that are local file paths into
* displayable URLs its resolver vouches for; both vocabularies are the
* single streaming gate — they apply to settled renders only, because a
* streaming message's vocabulary is not final and frozen cached elements
* must not bake in handlers that could go stale.
* @returns A GFM document with TeX math rendered through KaTeX; raw HTML,
* relative links, and unsafe protocols are disabled, while absolute HTTP(S)
* images render directly.
*/
const MarkdownText = memo(function MarkdownText({ text, streaming = false, labels, fileMentions, pathImages }) {
	const streamRef = useRef(null);
	const streamLabelsRef = useRef(labels);
	const children = useMemo(() => {
		if (!streaming) {
			streamRef.current = null;
			return renderSettled(text, labels, fileMentions, pathImages);
		}
		if (streamRef.current === null || streamLabelsRef.current !== labels) {
			streamRef.current = new StreamingRenderer(labels);
			streamLabelsRef.current = labels;
		}
		return streamRef.current.render(text);
	}, [
		text,
		streaming,
		labels,
		fileMentions,
		pathImages
	]);
	return jsx("div", {
		className: css$23.markdown,
		children
	});
});
//#endregion
//#region lib/types/WebBlock.js
/**
* The URL to link to, or undefined when the URL must render as plain text. Only
* http(s) becomes a navigable external anchor, so a `javascript:`/`data:`/`file:`
* URL or an unparseable string never reaches the DOM as an href. This is the
* http(s) subset of the allowlist MarkdownText applies to untrusted links —
* MarkdownText also permits `mailto:`, deliberately excluded here since a
* retrieval URL is never a mail address.
* @param url - the source or fetch URL, from tool result content.
* @returns the href to use, or undefined for plain text.
*/
function safeHref(url) {
	try {
		const { protocol } = new URL(url);
		return protocol === "http:" || protocol === "https:" ? url : void 0;
	} catch {
		return;
	}
}
/**
* The link's visible label: the title when the provider gave one, otherwise the
* URL's hostname, falling back to the raw URL when it does not parse OR parses
* to an empty hostname (a `file:`/`data:`/`javascript:` URL), so a label is
* never blank.
* @param url - the source URL.
* @param title - the provider title, if any.
* @returns the label text.
*/
function linkLabel(url, title) {
	if (title !== void 0 && title !== "") return title;
	try {
		const { hostname } = new URL(url);
		return hostname === "" ? url : hostname;
	} catch {
		return url;
	}
}
/**
* A single URL rendered as a safe external anchor, or as plain text when the
* URL is not an http(s) link.
* @param props.url - the URL to render.
* @param props.label - the visible label.
* @param props.className - class for the anchor or the plain span.
* @returns the anchor or span element.
*/
function SafeLink({ url, label, className }) {
	const href = safeHref(url);
	if (href === void 0) return jsx("span", {
		className,
		children: label
	});
	return jsxs("a", {
		className,
		href,
		target: "_blank",
		rel: "noopener noreferrer",
		children: [jsx(LinkIcon, {
			kind: "url",
			className: css$24.linkIcon
		}), label]
	});
}
/**
* One source row in a search card: the safe link plus its snippet and date. The
* `<li value>` pins the source's 1-based citation index explicitly rather than
* relying on the `<ol>`'s implicit numbering, so a row reads by its real index
* even inside the scroll container.
* @param props.source - the source to render.
* @param props.ordinal - the source's 1-based position in the full list.
* @returns the source list item.
*/
function SourceItem({ source, ordinal }) {
	return jsxs("li", {
		className: css$24.source,
		value: ordinal,
		children: [
			jsx(SafeLink, {
				url: source.url,
				label: linkLabel(source.url, source.title),
				className: css$24.sourceLink
			}),
			source.snippet !== void 0 && source.snippet !== "" && jsx("div", {
				className: css$24.snippet,
				children: source.snippet
			}),
			source.publishedAt !== void 0 && source.publishedAt !== "" && jsx("div", {
				className: css$24.published,
				children: source.publishedAt
			})
		]
	});
}
/**
* The search card body: the answer over the full source list, which scrolls in
* place once it exceeds the `.sources` container height.
* @param props - see {@link WebSearchBlockProps}.
* @returns the search card element.
*/
function WebSearchBlock({ answer, sources, truncated, labels, className }) {
	const empty = (answer === void 0 || answer === "") && sources.length === 0;
	return jsxs("div", {
		className: clsx(css$24.block, className),
		"data-web": "search",
		children: [
			answer !== void 0 && answer !== "" && jsx("div", {
				className: css$24.answer,
				children: jsx(MarkdownText, {
					text: answer,
					labels: labels.markdown
				})
			}),
			empty ? jsx("div", {
				className: css$24.empty,
				children: labels.noResults
			}) : jsx("ol", {
				className: css$24.sources,
				children: sources.map((source, index) => jsx(SourceItem, {
					source,
					ordinal: index + 1
				}, index))
			}),
			truncated && jsx("div", {
				className: css$24.truncated,
				children: labels.sourcesTruncated
			})
		]
	});
}
/**
* The fetch card body: the linked URL and its HTTP status.
* @param props - see {@link WebFetchBlockProps}.
* @returns the fetch card element.
*/
function WebFetchBlock({ url, statusCode, truncated, labels, className }) {
	return jsxs("div", {
		className: clsx(css$24.block, css$24.fetch, className),
		"data-web": "fetch",
		children: [jsx(SafeLink, {
			url,
			label: url,
			className: css$24.fetchUrl
		}), jsxs("div", {
			className: css$24.fetchMeta,
			children: [jsxs("span", {
				className: css$24.status,
				children: [
					labels.http,
					" ",
					statusCode
				]
			}), truncated && jsx("span", {
				className: css$24.truncated,
				children: labels.contentTruncated
			})]
		})]
	});
}
/**
* Render a completed web retrieval as a structured card.
* @param props - see {@link WebBlockProps}; `kind` selects the search or fetch body.
* @returns the web card element.
*/
function WebBlock(props) {
	return props.kind === "search" ? jsx(WebSearchBlock, { ...props }) : jsx(WebFetchBlock, { ...props });
}
//#endregion
//#region lib/types/markdown/JsonBlock.js
const MAX_CHARS = 2e4;
function JsonBlock({ label, payload, defaultOpen = false, truncatedLabel }) {
	const [open, setOpen] = useState(defaultOpen);
	const body = useMemo(() => {
		if (!open) return "";
		let s;
		try {
			s = JSON.stringify(payload, null, 2) ?? String(payload);
		} catch {
			s = String(payload);
		}
		return s.length > MAX_CHARS ? `${s.slice(0, MAX_CHARS)}\n${truncatedLabel(s.length)}` : s;
	}, [
		open,
		payload,
		truncatedLabel
	]);
	return jsxs("div", {
		className: css$25.root,
		children: [jsxs("button", {
			type: "button",
			className: css$25.toggle,
			onClick: () => {
				setOpen((v) => !v);
			},
			children: [
				open ? "▾" : "▸",
				" ",
				label
			]
		}), open && jsx("pre", {
			className: css$25.body,
			children: body
		})]
	});
}
//#endregion
//#region lib/types/markdown/plain-text.js
/**
* Markdown-to-plain-text projection for compact summaries and labels.
* Parsing shares the renderer's streaming GFM grammar ({@link parseGfm}), so
* the projection strips exactly the markup the renderer would draw; raw HTML
* stays literal, links keep their labels, images keep alt text, and code
* keeps its source text.
*/
function inlineText(node) {
	switch (node.type) {
		case "text":
		case "inlineCode":
		case "code": return node.value ?? "";
		case "image":
		case "imageReference": return node.alt ?? "";
		case "break": return "\n";
		case "html": return node.value ?? "";
		default: return node.children?.map(inlineText).join("") ?? "";
	}
}
function compactInline(text) {
	return text.replace(/\s+/g, " ").trim();
}
function blockText(node) {
	switch (node.type) {
		case "root":
		case "blockquote": return node.children?.map(blockText).filter(Boolean).join("\n\n") ?? "";
		case "paragraph":
		case "heading": return compactInline(inlineText(node));
		case "code": return node.value?.trim() ?? "";
		case "list": return node.children?.map(blockText).filter(Boolean).join("\n") ?? "";
		case "listItem": return node.children?.map(blockText).filter(Boolean).join(" ") ?? "";
		case "table": return node.children?.map(blockText).filter(Boolean).join("\n") ?? "";
		case "tableRow": return node.children?.map(blockText).join("	") ?? "";
		case "tableCell": return compactInline(inlineText(node));
		case "html": return node.value ?? "";
		case "thematicBreak":
		case "definition": return "";
		default: return compactInline(inlineText(node));
	}
}
function findFirstParagraph(node) {
	if (node.type === "paragraph") {
		const text = compactInline(inlineText(node));
		if (text !== "") return text;
	}
	for (const child of node.children ?? []) {
		const text = findFirstParagraph(child);
		if (text !== void 0) return text;
	}
}
function fullText(root) {
	return blockText(root).split("\n").map((line) => line.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
/**
* Parse GFM Markdown, remove its presentation markup, and preserve raw HTML literally.
* @param markdown - Markdown source.
* @param options - Optional extraction boundary.
* @returns Plain text for the whole document, first visible line, or first semantic paragraph.
*/
function extractMarkdownPlainText(markdown, options = {}) {
	const { mode = "all" } = options;
	const root = parseGfm(markdown);
	const all = fullText(root);
	switch (mode) {
		case "all": return all;
		case "first-line": return all.split("\n").find((line) => line !== "") ?? "";
		case "first-paragraph": return findFirstParagraph(root) ?? all.split("\n").find((line) => line !== "") ?? "";
	}
}
//#endregion
export { BrandWordmark, Button, CodeBlock, ConnectionIndicator, DEFAULT_DIFF_MAX_LINES, DEFAULT_READ_MAX_LINES, DEFAULT_SEARCH_MAX_LINES, DEFAULT_TERMINAL_MAX_LINES, DiffBlock, DisclosureRow, FISH_LOGO_PATH, FISH_LOGO_VIEWBOX, FileTypeIcon, FishLogo, HoverCard, IconAgentPresetOutline16, IconAlarmClockOutline16, IconApiOutline14, IconArchiveOutline20, IconBranchOutline16, IconBrowseOutline16, IconBrowserOutline16, IconCheckOutline14, IconCheckOutline16, IconChecklistOutline14, IconChevronDownOutline14, IconChevronLeftOutline14, IconChevronRightOutline14, IconChevronUpOutline14, IconClockOutline16, IconCloseFill14, IconCloseOutline16, IconCodeOutline16, IconContextInjectionOutline16, IconCopyOutline16, IconCordisPluginOutline14, IconCursorOutline16, IconDarkOutline16, IconDataOutline16, IconDatabaseOutline16, IconDeviceOutline16, IconDislikeFill16, IconDislikeOutline16, IconDownloadOutline16, IconEditOutline16, IconEllipsisOutline16, IconEnhanceOutline16, IconEyeOutline16, IconFolderClose16, IconFolderOpen16, IconFolderOpenOutline16, IconFollowsystemOutline16, IconFullscreenOutline16, IconGaugeOutline16, IconGlobeOutline14, IconGoalOutline16, IconInspectOutline12, IconLightOutline16, IconLikeFill16, IconLikeOutline16, IconLinkOutline14, IconLinkOutline16, IconListPenOutline16, IconLoadingOutline16, IconNewChatOutline16, IconPanelLeftOutline16, IconPaperclipOutline16, IconPauseOutline16, IconPersonalizationOutline16, IconPlayOutline16, IconPlusOutline16, IconProjectAddOutline16, IconQuestionOutline14, IconQueueOutline14, IconRefreshOutline14, IconRefreshOutline16, IconRightUpOutline14, IconRightUpOutline16, IconSearchOutline16, IconSendOutline14, IconSendOutline16, IconServerOutline16, IconSettingsOutline14, IconSettingsOutline16, IconShareOutline16, IconSkillOutline16, IconSparkle16, IconStopFill16, IconThinkOutline14, IconThinkOutline16, IconTrashOutline16, IconTreeCorner8x10, IconTriangleRightFill14, IconUserOutline16, IconWarningOutline16, Input, JsonBlock, JsonTree, LinkIcon, MarkdownText, Menu, Modal, OnboardingSurface, Pill, ReadBlock, ReferenceIcon, RiskConfirmation, SearchBlock, StateDot, Switch, Tag, TerminalBlock, Toast, Tooltip, WebBlock, classifyFileType, classifyLinkPath, diffTotals, extractMarkdownPlainText, fileExtension, fileSizeText, projectUserText, rankByName, relativeTime, useAnchoredMaxHeight, useAnchoredPosition, useDismissOnOutsidePointer, writeClipboard };

//# sourceMappingURL=index.js.map