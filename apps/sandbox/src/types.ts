export type VMState = "stopped" | "running";

export type VM = {
  name: string;
  state: VMState;
};
