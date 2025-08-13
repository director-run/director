import fs from "fs";
import path from "path";
import _ from "lodash";
import YAML from "yaml";

class Config {
  private _configFilePath: string;
  constructor(params: { configFilePath: string }) {
    this._configFilePath = params.configFilePath;
  }

  get<T = unknown>(jsonPath: string): T {
    const config = YAML.parse(fs.readFileSync(this._configFilePath, "utf8"));
    return _.get(config, jsonPath);
  }

  set<T = unknown>(jsonPath: string, value: T) {
    const config = YAML.parse(fs.readFileSync(this._configFilePath, "utf8"));
    const result = _.set(config, jsonPath, value);
    fs.writeFileSync(this._configFilePath, YAML.stringify(result));
  }
}

function main() {
  const config = new Config({
    configFilePath: path.join(__dirname, "../../../../config.yaml"),
  });
  console.log(config.get("playbooks[0]"));
  console.log("--------------------------------");

  // change the name of a playbook with the id of "test"
  //   config.set("$.playbooks[?(@.id == 'test')].name", "test2");
  console.log(config.get<Array<unknown>>("$.playbooks[?(@.id == 'test')]"));
}

main();
