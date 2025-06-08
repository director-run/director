export abstract class AbstractConfigurator {
  public abstract install(attributes: {
    name: string;
    url: string;
  }): Promise<void>;
  public abstract uninstall(name: string): Promise<void>;
  public abstract list(): Promise<Array<{ name: string; url: string }>>;
  public abstract openConfig(): Promise<void>;
  public abstract isInstalled(name: string): boolean;
  public abstract restart(): Promise<void>;
  public abstract reload(name: string): Promise<void>;
  public abstract reset(): Promise<void>;
}

export type Installable = {
  name: string;
  url: string;
};
