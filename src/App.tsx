import { useState } from "react";
import "./App.css";
import sets from "./sets.json";
import { Accordion, AccordionItem } from "@nextui-org/accordion";

import { Section } from "./Section";
import { Button, Checkbox } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { MagicSet } from "./types";

function factorial(num: number): number {
  if (num < 0) return -1;
  else if (num == 0) return 1;
  else {
    return num * factorial(num - 1);
  }
}

function combinations(n: number, r: number) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function App() {
  const [includeForeignOnly, setIncludeForeignOnly] = useState(false);
  const [minSetSize, setMinSetSize] = useState(75);
  const [includeOnlineOnly, setIncludeOnlineOnly] = useState(false);
  const [includeFutureSets, setIncludeFutureSets] = useState(false);
  const [anticipationMode, setAnticipationMode] = useState(false);

  const subSets = sets.filter(
    (set) =>
      (includeForeignOnly || !set.isForeignOnly) &&
      (includeOnlineOnly || !set.isOnlineOnly) &&
      (includeFutureSets ||
        set.releaseDate <= new Date().toISOString().split("T")[0]) &&
      set.baseSetSize >= minSetSize
  );

  const setCodeToName = new Map(sets.map((set) => [set.code, set.name]));

  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [deselected, setDeselected] = useState<Set<string>>(new Set());

  const sections = [
    {
      title: "Core",
      num_setNum: useState(1),
      filter: (set: MagicSet) => set.type == "core",
    },
    {
      title: "Expansion",
      num_setNum: useState(5),
      filter: (set: MagicSet) => set.type == "expansion",
    },
    {
      title: "Draft",
      num_setNum: useState(0),
      filter: (set: MagicSet) => set.type == "draft_innovation",
    },
    {
      title: "Masters",
      num_setNum: useState(0),
      filter: (set: MagicSet) => set.type == "masters",
    },
    {
      title: "Other",
      num_setNum: useState(0),
      filter: (set: MagicSet) =>
        !["core", "expansion", "draft_innovation", "masters"].includes(
          set.type
        ),
    },
  ];

  // Calculate the number of possible combinations given the settings
  let possibilities = 1;
  for (const section of sections) {
    // Get the valid options based on filters and deselection
    const options = subSets
      .filter(section.filter)
      .filter((set) => !deselected.has(set.code));

    // Calculate the number of possible combinations
    possibilities *= combinations(options.length, section.num_setNum[0]);
  }

  return (
    <div className="[&>*]:my-2">
      <div className="max-w-[900px] m-auto">
        <h1>MTG Chaos Constructed Creator</h1>
        <span>
          Randomly generate a list of sets for <b>chaos constructed</b>. Chaos
          Constructed is a constructed format where you're limited to cards from
          a list randomly chosen sets. Enter the number of sets from each
          category below and click "Generate." The default setting is
          <b> chaos standard</b> (1 core set and 5 expansions).
        </span>
      </div>
      <Button
        className="h-auto"
        onClick={async () => {
          const choices: string[] = [];
          let poss = 1;
          for (const section of sections) {
            // Get the valid options based on filters and deselection
            const options = subSets
              .filter(section.filter)
              .filter((set) => !deselected.has(set.code));

            // Calculate the number of possible combinations
            poss *= combinations(options.length, section.num_setNum[0]);

            // Choose n sets from this section
            let i = 0;
            while (i < section.num_setNum[0]) {
              const set = options[Math.floor(Math.random() * options.length)];
              if (!choices.includes(set.code)) {
                choices.push(set.code);
                i++;
              }
            }
          }

          if (anticipationMode) {
            setSelectedSets([]);
            choices.forEach((choice, i) => {
              setTimeout(() => {
                setSelectedSets((prev) => {
                  const newChoices = [...prev];
                  newChoices.push(choice);
                  return newChoices;
                });
              }, i * 1000);
            });
          } else {
            setSelectedSets(choices);
          }
        }}
      >
        <div className="flex flex-wrap gap-px justify-center [&>*]:px-0.5">
          <div>Generate!</div>
          <div>({possibilities.toLocaleString()} possible combinations)</div>
        </div>
      </Button>
      <div>
        {selectedSets.map((code) => (
          <div key={code}>
            {setCodeToName.get(code)} ({code})
          </div>
        ))}
      </div>
      <Accordion>
        <AccordionItem title="⚙️ Settings">
          <div className="flex md:justify-evenly flex-col md:flex-row justify-start px-1 gap-2">
            <Checkbox
              isSelected={includeForeignOnly}
              onValueChange={setIncludeForeignOnly}
            >
              Include Foreign Only Sets
            </Checkbox>
            <Checkbox
              isSelected={includeOnlineOnly}
              onValueChange={setIncludeOnlineOnly}
            >
              Include Online Only Sets
            </Checkbox>
            <Checkbox
              isSelected={includeFutureSets}
              onValueChange={setIncludeFutureSets}
            >
              Include Future Releases
            </Checkbox>
            <Checkbox
              isSelected={anticipationMode}
              onValueChange={setAnticipationMode}
            >
              Anticipation Mode
            </Checkbox>
            <Input
              type="number"
              label="Minimum Set Size"
              value={minSetSize.toString()}
              onValueChange={(v) => setMinSetSize(parseInt(v))}
              fullWidth={false}
              className="max-w-40"
            ></Input>
          </div>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-wrap justify-evenly">
        {sections.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            num={section.num_setNum[0]}
            setNum={section.num_setNum[1]}
            sets={subSets.filter(section.filter)}
            deselected={deselected}
            setDeselected={setDeselected}
          />
        ))}
      </div>
      <footer>
        <small>
          &copy; Copyright {new Date().getFullYear()},{" "}
          <a href="http://jeremyneiman.com" target="_blank">
            Jeremy Neiman
          </a>
          . Data via{" "}
          <a href="https://mtgjson.com/" target="_blank">
            MTGJSON
          </a>
          .
        </small>
      </footer>
    </div>
  );
}

export default App;
