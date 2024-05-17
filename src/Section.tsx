import { Checkbox } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { MagicSet } from "./types";
import "./App.css";

interface Props {
  title: string;
  sets: MagicSet[];
  //defaultNumber?: number;
  num: number;
  setNum: (state: any) => void;
  deselected: Set<string>;
  setDeselected: (state: any) => void;
}

export function Section({
  sets,
  title,
  num,
  setNum,
  deselected,
  setDeselected,
}: Props) {
  return (
    <>
      <div className="min-w-fit max-h-[50vh] overflow-y-auto px-16 my-8">
        <div className="flex justify-evenly mb-4">
          <Input
            fullWidth={false}
            className="w-16"
            type="number"
            value={num.toString()}
            onValueChange={(e) => {
              console.log(e);
              setNum(parseInt(e));
            }}
          />
          <div className="flex items-center">
            {title} Sets ({sets.length})
          </div>
        </div>
        <div className="flex flex-col">
          {sets.map((set) => (
            <Checkbox
              className="mb-[1px]"
              key={set.code}
              value={set.code}
              isSelected={!deselected.has(set.code)}
              onValueChange={(isSelected) => {
                setDeselected((prevState: Set<string>) => {
                  const newState = new Set(prevState);
                  if (isSelected) {
                    newState.delete(set.code);
                  } else {
                    newState.add(set.code);
                  }
                  return newState;
                });
              }}
            >
              <p className="truncate text-ellipsis">{set.name}</p>
            </Checkbox>
          ))}
        </div>
      </div>
    </>
  );
}

export default Section;
