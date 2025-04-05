import { useConnectionContext } from "./components/connection/connection-provider";
import { Container } from "./components/container";

function App() {
  const { servers } = useConnectionContext();

  return (
    <div className="flex grow flex-col items-center py-20">
      <Container size="sm">
        <div>
          {servers.map((it) => (
            <div key={it.name}>{it.name}</div>
          ))}
        </div>
      </Container>
    </div>
  );
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default App;
