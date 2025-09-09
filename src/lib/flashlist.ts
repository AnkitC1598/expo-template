type GapOptions = {
	cols?: number;
	index: number;
	debug?: boolean;
	paddingX?: { edge?: number; middle?: number };
	paddingY?: { edge?: number; middle?: number };
};

export const createGap = ({
	cols = 2,
	index,
	debug = false,
	paddingX = { edge: 0, middle: 1.5 },
	paddingY = { edge: 0, middle: 1.5 },
}: GapOptions): string => {
	const pos = index % cols;
	const row = Math.floor(index / cols);

	const isFirstCol = pos === 0;
	const isLastCol = pos === cols - 1;
	const isFirstRow = row === 0;

	const pxEdge = paddingX.edge ?? 0;
	const pxMiddle = paddingX.middle ?? 1;
	const pyEdge = paddingY.edge ?? 0;
	const pyMiddle = paddingY.middle ?? 1;

	const leftPad = isFirstCol ? pxEdge : pxMiddle;
	const rightPad = isLastCol ? pxEdge : pxMiddle;
	const topPad = isFirstRow ? pyEdge : pyMiddle;
	const bottomPad = pyMiddle;

	const classes = [
		debug ? "border border-hairline border-red-500" : null,
		"items-center justify-center w-full",
		paddings[leftPad]?.pl || "",
		paddings[rightPad]?.pr || "",
		paddings[topPad]?.pt || "",
		paddings[bottomPad]?.pb || "",
	];

	return classes.filter((cls): cls is string => Boolean(cls)).join(" ");
};

type Direction = "pl" | "pr" | "pt" | "pb";

const paddings: Record<
	number | `${number}.${number}`,
	Record<Direction, string>
> = {
	0: { pl: "pl-0", pr: "pr-0", pt: "pt-0", pb: "pb-0" },
	0.5: { pl: "pl-0.5", pr: "pr-0.5", pt: "pt-0.5", pb: "pb-0.5" },
	1: { pl: "pl-1", pr: "pr-1", pt: "pt-1", pb: "pb-1" },
	1.5: { pl: "pl-1.5", pr: "pr-1.5", pt: "pt-1.5", pb: "pb-1.5" },
	2: { pl: "pl-2", pr: "pr-2", pt: "pt-2", pb: "pb-2" },
	2.5: { pl: "pl-2.5", pr: "pr-2.5", pt: "pt-2.5", pb: "pb-2.5" },
	3: { pl: "pl-3", pr: "pr-3", pt: "pt-3", pb: "pb-3" },
	3.5: { pl: "pl-3.5", pr: "pr-3.5", pt: "pt-3.5", pb: "pb-3.5" },
	4: { pl: "pl-4", pr: "pr-4", pt: "pt-4", pb: "pb-4" },
	5: { pl: "pl-5", pr: "pr-5", pt: "pt-5", pb: "pb-5" },
	6: { pl: "pl-6", pr: "pr-6", pt: "pt-6", pb: "pb-6" },
	8: { pl: "pl-8", pr: "pr-8", pt: "pt-8", pb: "pb-8" },
};
