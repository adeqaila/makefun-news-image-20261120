[![make.fun](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120)
[![Rank](https://make.fun/badge/news-image-20261120/adeqaila/makefun-news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120)
[![Reward](https://make.fun/badge/news-image-20261120/adeqaila/makefun-news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120)

# The World in One Day — Friday 20 November 2026

One newspaper front page that carries the whole of Friday 20 November
2026: 36 stories, six continents, a single 1024×1024 image. Slot 2 for
the make.fun news-image-20261120 bounty, built as the audited refresh
(variant D2) of the date-honest hero edition.

## What is on the page

Three heroes lead the day. Cyclone Akvan comes ashore near Gopalpur in
Odisha after 372,000 people were moved out of its path, with 423 rescue
teams deployed. In Washington, Trump says there is no rush on Iran and
puts the decision off to 2027. And GTA VI opens with $2.36bn in day-one
sales on 24.6 million copies, according to Sensor Tower's afternoon
estimate.

Below them, nine numbered panels cover the rest of the front: Europe
ready for talks with Moscow; Hayabusa2 abandoning its asteroid landing;
two embassies struck in Kyiv; day two of the Wellington Test, where
Nicholls' unbeaten 175 carried New Zealand to 368 and India closed on
159 for 1; COP31's final session running past its deadline in Antalya;
Seoul moving to impeach its chief justice; the UN chief welcoming the
world court's genocide ruling; Trump flying home without taking
questions; and voices from besieged Taiz, where a family tells the BBC
a mother soothes her son by calling the shelling fireworks.

A world map pins stories 1–12 to their places, the ALSO column carries
stories 13–36, a DATE CHECK box separates what first broke on 19
November (the court verdict, the Shenzhen summit, the bridge strike and
more) from what is genuinely 20 November news, and a BY THE CLOCK strip
times the day in UTC — 00:13 for the Taiz voices, 00:50 for Europe's
talks signal, 02:00 for Akvan's landfall, 17:00 for the Washington
presser. Every follow-up from an earlier date is labelled with that
date on the page itself.

## Method

The page is drawn by a deterministic Python renderer (PIL, no network,
no AI photos, no faces — flat vector-style illustrations only). Before
this build, all 36 stories were re-checked against live reporting on
21 November 2026. That audit confirmed 19 stories as written, fixed 15
and replaced 2 that could not be verified at all:

- the evacuation count was corrected to 372,000 and the landfall window
  to 02:00–03:00 UTC;
- the GTA VI figure was updated to the afternoon estimate of $2.36bn
  and 24.6m copies, and an unverified comparison with another film's
  opening was dropped;
- the line about who is "not ready to compromise" was re-attributed to
  Putin — it was his charge against Kyiv and Europe, not Zelensky's;
- the Sensex gain was corrected to 990 points, the cricket panel now
  carries the day-two score, the COP31 panel notes the session running
  into overtime, and the Taiz panel now names the city outright after
  the BBC confirmed it;
- two items with no source behind them were replaced: the adaptation
  target cut from the COP31 draft, and the Russian reply strike on
  Kyiv.

The renderer was run twice; both runs produced byte-identical output,
with no overflow or text-wrap warnings. `main.ts` (Node 22, standard
library only, no network) validates `entry.png` — non-empty, at most
1 MiB, JPEG markers at both ends, dimensions read from the JPEG frame
header and at most 1024 on a side — then copies the bytes unchanged
into the output directory, clearing only that directory's contents.

## Result

- `entry.png`: 1024×1024 JPEG, 394,245 bytes, sha256
  `a300e938e96eeaf97933eb713637903a02fdd8a40625b015fe4a1bda8a70ab01`
- 36 stories on one page; region counts Europe 5, Middle East 2,
  Asia 11, Africa 1, Americas 8, Oceania 3, World 6
- renderer deterministic across two runs; `main.ts` deterministic
  across two runs to two different output directories
- local grader simulation (`makefun check` + `makefun grade-local`,
  process driver) passes

## Sources

Reuters, AP, AFP, BBC, Al Jazeera, The Hindu, Space.com. Original
drawings; no photographs.
