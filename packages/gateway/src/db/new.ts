import fs from "fs";
import path from "path";
import { JSONPath } from "jsonpath-plus";
import YAML from "yaml";

class Config {
  private _configFilePath: string;
  constructor(params: { configFilePath: string }) {
    this._configFilePath = params.configFilePath;
  }

  get(jsonPath: string): unknown {
    const config = YAML.parse(fs.readFileSync(this._configFilePath, "utf8"));
    return JSONPath({
      path: jsonPath,
      json: config,
    });
  }

  set(jsonPath: string, value: unknown) {
    const config = YAML.parse(fs.readFileSync(this._configFilePath, "utf8"));
    const result = JSONPath({
      path: jsonPath,
      json: config,
    });
    if (result.length === 0) {
      throw new Error(`JSONPath ${jsonPath} not found`);
    }
    result[0] = value;
    fs.writeFileSync(
      path.join(__dirname, "../../../../config.yaml"),
      YAML.stringify(config),
    );
  }
}

function main() {
  const config = new Config({
    configFilePath: path.join(__dirname, "../../../../config.yaml"),
  });
  console.log(config.get("$.playbooks[*]"));
  //   config.writeValue("$.playbooks[0].name", "test");
  //   console.log(config.readValue("$.playbooks[0]"));
}

main();
