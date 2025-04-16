import { ConnectedClient } from "./ConnectedClient";

export class ControllerClient extends ConnectedClient {
  constructor() {
    super("controller");
  }
}
