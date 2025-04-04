import { Container } from "./components/container";

function App() {
  return (
    <div className="flex grow flex-col items-center py-20">
      <Container size="sm">
        <div>Hello</div>
      </Container>
    </div>
  );
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default App;
